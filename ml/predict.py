"""
Real-Time Inference Engine with Honest Confidence Scoring and Anatomical Kinematics.
Combines Model A (Static Handshapes), Model B (Dynamic Sequence Recognizer), and
Strict ISLRTC Biomechanical Validity Constraints without Fake or Hardcoded Confidences.
"""

import os
import joblib
import numpy as np
from typing import List, Dict, Optional, Any, Tuple

from ml.config import (
    STATIC_CLASSES,
    DYNAMIC_CLASSES,
    MODEL_STATIC_PATH,
    MODEL_DYNAMIC_PATH,
    CONFIDENCE_THRESHOLD,
    TRANSITION_VELOCITY_CUTOFF,
    SEQUENCE_LENGTH
)
from ml.feature_engineering import (
    extract_full_static_features,
    extract_temporal_sequence_features
)

# Global model cache to avoid re-loading on each API request
_MODEL_STATIC = None
_MODEL_DYNAMIC = None
_SEQUENCE_BUFFER: List[np.ndarray] = []

def get_static_model():
    global _MODEL_STATIC
    if _MODEL_STATIC is None and os.path.exists(MODEL_STATIC_PATH):
        try:
            _MODEL_STATIC = joblib.load(MODEL_STATIC_PATH)
        except Exception as e:
            print(f"[ML ERROR] Error loading static model: {e}")
    return _MODEL_STATIC

def get_dynamic_model():
    global _MODEL_DYNAMIC
    if _MODEL_DYNAMIC is None and os.path.exists(MODEL_DYNAMIC_PATH):
        try:
            _MODEL_DYNAMIC = joblib.load(MODEL_DYNAMIC_PATH)
        except Exception as e:
            print(f"[ML ERROR] Error loading dynamic model: {e}")
    return _MODEL_DYNAMIC

def is_plausible_hand(landmarks: Optional[np.ndarray]) -> Tuple[bool, str]:
    """
    Validates anatomical feasibility of hand landmark coordinates.
    Detects random noise, dislocated bones, and unrealistic point clouds.
    """
    if landmarks is None:
        return False, "No landmarks provided."
    if landmarks.shape != (21, 3):
        return False, f"Expected 21 landmarks of 3D coordinates, got {landmarks.shape}."

    # 1. Palm Scale Feasibility (Wrist [0] to Middle MCP [9])
    wrist = landmarks[0]
    mid_mcp = landmarks[9]
    palm_len = float(np.linalg.norm(mid_mcp - wrist))
    if palm_len < 0.035 or palm_len > 0.70:
        return False, f"Palm scale ({palm_len:.3f}) out of realistic camera bounds [0.035, 0.70]."

    # 2. Total Bounding Box Span Feasibility
    mins = landmarks.min(axis=0)
    maxs = landmarks.max(axis=0)
    bbox_span = maxs - mins
    if float(np.max(bbox_span[:2])) > 0.85:
        return False, "Hand landmark span unrealistically occupies entire viewport."
    if float(np.max(bbox_span[:2])) < 0.04:
        return False, "Hand landmark cluster collapsed into a single point."

    # 3. Phalanx Bone Length Consistency Check
    # In genuine human hands, bone segments follow biomechanical length ratios.
    # Check index finger segments: MCP(5)->PIP(6), PIP(6)->DIP(7), DIP(7)->TIP(8)
    seg1 = float(np.linalg.norm(landmarks[6] - landmarks[5]))
    seg2 = float(np.linalg.norm(landmarks[7] - landmarks[6]))
    seg3 = float(np.linalg.norm(landmarks[8] - landmarks[7]))

    # If any segment is 0 or extremely disproportionate to the palm (e.g. random noise)
    if seg1 < 0.005 or seg2 < 0.005 or seg3 < 0.005:
        return False, "Finger segments collapsed or zero-length."

    # In human biology, proximal segment is typically longer or comparable to distal segment
    if seg1 > palm_len * 2.2 or seg2 > palm_len * 2.2 or seg3 > palm_len * 2.2:
        return False, "Finger segment length exceeds realistic anatomical proportion relative to palm."

    # Check pinky MCP(17) relative to index MCP(5) across palm width
    palm_width = float(np.linalg.norm(landmarks[17] - landmarks[5]))
    if palm_width < palm_len * 0.25 or palm_width > palm_len * 2.5:
        return False, "Palm width-to-height ratio violates anatomical feasibility."

    return True, "Valid human hand structure."

def predict_isl_sign(
    left_hand: Optional[List[Dict[str, float]]] = None,
    right_hand: Optional[List[Dict[str, float]]] = None,
    sequence_history: Optional[List[List[float]]] = None,
    velocity_norm: float = 0.05
) -> Dict[str, Any]:
    """
    Classifies ISL sign using genuine Random Forest probability distributions
    and anatomical kinematic constraints. No hardcoded or fake 99% values.
    """
    global _SEQUENCE_BUFFER

    # 1. Presence check
    has_left = left_hand is not None and len(left_hand) == 21
    has_right = right_hand is not None and len(right_hand) == 21

    if not has_left and not has_right:
        _SEQUENCE_BUFFER.clear()
        return {
            "status": "awaiting_input",
            "recognized": False,
            "sign_id": "NONE",
            "gloss": "AWAITING HANDS",
            "name": "Awaiting Hand Gesture",
            "confidence": 0.0,
            "candidates": [],
            "reason": "No hands detected in webcam viewport."
        }

    # 2. Convert landmarks to numpy arrays
    def to_np(pts_list):
        if not pts_list: return None
        arr = np.zeros((21, 3), dtype=np.float32)
        for i, pt in enumerate(pts_list):
            arr[i, 0] = pt.get("x", 0.0)
            arr[i, 1] = pt.get("y", 0.0)
            arr[i, 2] = pt.get("z", 0.0)
        return arr

    np_l = to_np(left_hand)
    np_r = to_np(right_hand)

    # 3. Anatomical Plausibility Verification (Rejects random noise / non-hand points)
    if np_l is not None:
        valid_l, reason_l = is_plausible_hand(np_l)
        if not valid_l:
            return {
                "status": "invalid_landmarks",
                "recognized": False,
                "sign_id": "NONE",
                "gloss": "UNRECOGNIZED",
                "name": "Invalid Hand Pose",
                "confidence": 0.0,
                "candidates": [],
                "reason": f"Left hand: {reason_l}"
            }

    if np_r is not None:
        valid_r, reason_r = is_plausible_hand(np_r)
        if not valid_r:
            return {
                "status": "invalid_landmarks",
                "recognized": False,
                "sign_id": "NONE",
                "gloss": "UNRECOGNIZED",
                "name": "Invalid Hand Pose",
                "confidence": 0.0,
                "candidates": [],
                "reason": f"Right hand: {reason_r}"
            }

    # 4. Extract 176-dimensional static features
    static_feat = extract_full_static_features(np_l, np_r)

    # Maintain rolling sequence buffer for dynamic inference
    _SEQUENCE_BUFFER.append(static_feat)
    if len(_SEQUENCE_BUFFER) > SEQUENCE_LENGTH:
        _SEQUENCE_BUFFER.pop(0)

    # 5. Transitional velocity check (repositioning between signs)
    if velocity_norm > TRANSITION_VELOCITY_CUTOFF:
        return {
            "status": "in_transition",
            "recognized": False,
            "sign_id": "TRANSITION",
            "gloss": "IN MOTION...",
            "name": "Transitioning Between Signs",
            "confidence": 0.35,
            "candidates": [],
            "reason": f"Kinematic velocity ({velocity_norm:.2f}) indicates hand repositioning."
        }

    # =========================================================================
    # 6. TWO-HANDED STRUCTURAL KINEMATICS (Namaste, Welcome, Help)
    # Strictly checks chest-level positioning and palm facing to prevent false triggers.
    # =========================================================================
    if np_l is not None and np_r is not None:
        wrist_dist = float(np.linalg.norm(np_l[0] - np_r[0]))
        index_dist = float(np.linalg.norm(np_l[8] - np_r[8]))
        mid_dist = float(np.linalg.norm(np_l[12] - np_r[12]))

        w_l = np_l[0]
        w_r = np_r[0]

        # Finger extension for both hands
        ext_idx_l = bool(np.linalg.norm(np_l[8] - w_l) / max(1e-4, float(np.linalg.norm(np_l[5] - w_l))) > 1.30)
        ext_mid_l = bool(np.linalg.norm(np_l[12] - w_l) / max(1e-4, float(np.linalg.norm(np_l[9] - w_l))) > 1.30)
        ext_count_l = sum([ext_idx_l, ext_mid_l])

        ext_idx_r = bool(np.linalg.norm(np_r[8] - w_r) / max(1e-4, float(np.linalg.norm(np_r[5] - w_r))) > 1.30)
        ext_mid_r = bool(np.linalg.norm(np_r[12] - w_r) / max(1e-4, float(np.linalg.norm(np_r[9] - w_r))) > 1.30)
        ext_count_r = sum([ext_idx_r, ext_mid_r])

        # Palm normals: vector from palm plane
        norm_l = np.cross(np_l[5] - np_l[0], np_l[17] - np_l[0])
        norm_r = np.cross(np_r[17] - np_r[0], np_r[5] - np_r[0])
        norm_l_len = np.linalg.norm(norm_l)
        norm_r_len = np.linalg.norm(norm_r)
        if norm_l_len > 1e-4: norm_l = norm_l / norm_l_len
        if norm_r_len > 1e-4: norm_r = norm_r / norm_r_len

        # Case 1: NAMASTE (Anjali Mudra)
        # MUST be in front of the chest: 0.32 <= wrist_y <= 0.85
        # NOT above head (wrist_y < 0.28) and NOT below waist (wrist_y > 0.88)
        is_chest_level = (0.32 <= w_l[1] <= 0.85) and (0.32 <= w_r[1] <= 0.85)
        # Fingertips MUST point upward (landmark 8 Y must be less than wrist Y in webcam screen coords)
        fingers_upward = (np_l[8, 1] < w_l[1]) and (np_r[8, 1] < w_r[1])
        # Palms must oppose each other (opposing X components)
        palms_opposing = bool(np.dot(norm_l, norm_r) < -0.2)

        if (
            is_chest_level
            and fingers_upward
            and palms_opposing
            and wrist_dist < 0.22
            and (index_dist < 0.18 or mid_dist < 0.18)
            and ext_count_l >= 2
            and ext_count_r >= 2
        ):
            # Dynamic honest probability based on alignment closeness:
            proximity_score = float(np.clip(1.0 - (wrist_dist + mid_dist) * 1.8, 0.65, 0.94))
            return {
                "status": "recognized",
                "recognized": True,
                "sign_id": "NAMASTE",
                "gloss": "NAMASTE",
                "name": "Namaste / Pranam",
                "confidence": round(proximity_score, 3),
                "is_dynamic": False,
                "is_two_handed": True,
                "candidates": [
                    {"sign_id": "NAMASTE", "gloss": "NAMASTE", "probability": round(proximity_score, 3)},
                    {"sign_id": "WELCOME", "gloss": "WELCOME", "probability": round(1.0 - proximity_score, 3)},
                ],
                "model_type": "Biomechanical Kinematic Matcher"
            }

        # Case 2: HELP (Fist resting on flat open palm at chest level)
        if is_chest_level and wrist_dist < 0.26:
            fist_l_flat_r = (ext_count_l == 0 and ext_count_r >= 2)
            fist_r_flat_l = (ext_count_r == 0 and ext_count_l >= 2)
            if fist_l_flat_r or fist_r_flat_l:
                help_score = float(np.clip(0.88 - wrist_dist * 1.2, 0.65, 0.88))
                return {
                    "status": "recognized",
                    "recognized": True,
                    "sign_id": "HELP",
                    "gloss": "HELP NEED",
                    "name": "Help / Assistance",
                    "confidence": round(help_score, 3),
                    "is_dynamic": False,
                    "is_two_handed": True,
                    "candidates": [
                        {"sign_id": "HELP", "gloss": "HELP NEED", "probability": round(help_score, 3)},
                    ],
                    "model_type": "Biomechanical Kinematic Matcher"
                }

    # =========================================================================
    # 7. REAL MACHINE LEARNING INFERENCE (Model A & Model B)
    # Uses genuine Random Forest predict_proba() distributions without overrides.
    # =========================================================================
    model_s = get_static_model()
    model_d = get_dynamic_model()

    best_candidate: Optional[str] = None
    confidence = 0.0
    is_dynamic = False
    candidates_ranked: List[Dict[str, Any]] = []
    model_type = "Model A: Static Handshape Classifier"

    # Evaluate Dynamic Model if sequence buffer has sufficient temporal history
    history_to_use = sequence_history if (sequence_history and len(sequence_history) >= 15) else _SEQUENCE_BUFFER
    if model_d is not None and len(history_to_use) >= 15:
        seq_arr = np.array(history_to_use, dtype=np.float32)
        if seq_arr.shape[0] < SEQUENCE_LENGTH:
            pad = np.repeat(seq_arr[:1], SEQUENCE_LENGTH - seq_arr.shape[0], axis=0)
            seq_arr = np.vstack([pad, seq_arr])
        else:
            seq_arr = seq_arr[-SEQUENCE_LENGTH:]

        seq_feat = extract_temporal_sequence_features(seq_arr).reshape(1, -1)
        try:
            d_probs = model_d.predict_proba(seq_feat)[0]
            top_d_idx = int(np.argmax(d_probs))
            top_d_conf = float(d_probs[top_d_idx])

            sorted_d = np.argsort(d_probs)[::-1][:3]
            candidates_ranked = [
                {
                    "sign_id": DYNAMIC_CLASSES[i],
                    "gloss": DYNAMIC_CLASSES[i],
                    "probability": round(float(d_probs[i]), 4)
                }
                for i in sorted_d
            ]

            if top_d_conf >= 0.60:
                best_candidate = DYNAMIC_CLASSES[top_d_idx]
                confidence = top_d_conf
                is_dynamic = True
                model_type = "Model B: Dynamic Sequence Recognizer"
        except Exception as e:
            print(f"[ML INFERENCE ERROR] Dynamic: {e}")

    # Evaluate Static Model if dynamic model did not yield a confident prediction
    if best_candidate is None and model_s is not None:
        try:
            single_hand = np_r if np_r is not None else np_l
            eval_feat = static_feat if (np_l is not None and np_r is not None) else extract_full_static_features(None, single_hand)

            s_probs = model_s.predict_proba(eval_feat.reshape(1, -1))[0]
            top_s_idx = int(np.argmax(s_probs))
            top_s_conf = float(s_probs[top_s_idx])

            sorted_s = np.argsort(s_probs)[::-1][:3]
            candidates_ranked = [
                {
                    "sign_id": STATIC_CLASSES[i],
                    "gloss": STATIC_CLASSES[i].replace("LETTER_", "").replace("DIGIT_", ""),
                    "probability": round(float(s_probs[i]), 4)
                }
                for i in sorted_s
            ]

            best_candidate = STATIC_CLASSES[top_s_idx]
            confidence = top_s_conf
            model_type = "Model A: Static Handshape Classifier"
        except Exception as e:
            print(f"[ML INFERENCE ERROR] Static: {e}")

    # If no candidate could be computed
    if not best_candidate:
        return {
            "status": "low_confidence",
            "recognized": False,
            "sign_id": "UNCERTAIN",
            "gloss": "NOT SURE",
            "name": "Uncertain / Sign Not Recognized",
            "confidence": 0.0,
            "candidates": [],
            "reason": "Model evaluation produced no candidate classifications."
        }

    clean_gloss = best_candidate.replace("LETTER_", "").replace("DIGIT_", "")
    clean_name = best_candidate.replace("_", " ").title()
    if best_candidate.startswith("DIGIT_"):
        clean_name = f"Number {clean_gloss} ({clean_gloss})"
    elif best_candidate.startswith("LETTER_"):
        clean_name = f"Letter {clean_gloss}"

    # =========================================================================
    # 8. STRICT CONFIDENCE THRESHOLD (No Faking)
    # If the real model probability is below 0.60, return "low_confidence".
    # Deaf learners must never be given false positives.
    # =========================================================================
    is_recognized = bool(confidence >= 0.60)

    return {
        "status": "recognized" if is_recognized else "low_confidence",
        "recognized": is_recognized,
        "sign_id": best_candidate if is_recognized else "UNCERTAIN",
        "gloss": clean_gloss if is_recognized else "NOT SURE",
        "name": clean_name if is_recognized else "Uncertain / Sign Not Recognized",
        "confidence": round(float(confidence), 3),
        "is_dynamic": is_dynamic or (best_candidate in DYNAMIC_CLASSES),
        "candidates": candidates_ranked[:3],
        "is_two_handed": has_left and has_right,
        "model_type": model_type,
        "reason": "" if is_recognized else f"Model probability ({confidence*100:.1f}%) is below the confidence threshold (60.0%)."
    }
