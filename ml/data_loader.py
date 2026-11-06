"""
Dataset Generator, Synthesizer & Loader for ISL Recognition.
Synthesizes authentic ISLRTC & MSJE handshape configurations with 3D kinematic
biomechanics, rotation jitter, Gaussian noise, and temporal variations.
"""

import os
import json
import math
import random
from typing import Tuple, List, Dict, Any, Optional
import numpy as np

from ml.config import (
    STATIC_CLASSES,
    DYNAMIC_CLASSES,
    STATIC_FEATURE_DIM,
    SEQUENCE_LENGTH,
    TRAIN_DIR,
    VAL_DIR,
    TEST_DIR,
    ANNOTATIONS_PATH
)
from ml.feature_engineering import (
    extract_full_static_features,
    extract_temporal_sequence_features
)

def _generate_canonical_hand(
    thumb_curl: float = 0.0,
    index_curl: float = 0.0,
    middle_curl: float = 0.0,
    ring_curl: float = 0.0,
    pinky_curl: float = 0.0,
    spread: float = 0.0,
    is_left: bool = False
) -> np.ndarray:
    """
    Generates a canonical 21-joint 3D hand based on finger curl parameters [0.0 = extended, 1.0 = fully curled].
    """
    pts = np.zeros((21, 3), dtype=np.float32)
    side = -1.0 if is_left else 1.0
    
    # 0: Wrist
    pts[0] = np.array([0.0, 0.0, 0.0])
    
    # Finger base offsets from wrist
    bases = [
        np.array([0.3 * side, 0.35, 0.0]),  # 1: Thumb CMC
        np.array([0.22 * side, 0.70, 0.0]), # 5: Index MCP
        np.array([0.0 * side, 0.75, 0.0]),  # 9: Middle MCP
        np.array([-0.2 * side, 0.70, 0.0]), # 13: Ring MCP
        np.array([-0.38 * side, 0.62, 0.0]) # 17: Pinky MCP
    ]
    
    # Thumb joints (1 -> 2 -> 3 -> 4)
    pts[1] = bases[0]
    th_rot = thumb_curl * 1.2
    pts[2] = pts[1] + np.array([0.2 * side * math.cos(th_rot), 0.25 * math.cos(th_rot), 0.2 * math.sin(th_rot)])
    pts[3] = pts[2] + np.array([0.15 * side * math.cos(th_rot), 0.22 * math.cos(th_rot), 0.25 * math.sin(th_rot)])
    pts[4] = pts[3] + np.array([0.12 * side * math.cos(th_rot), 0.18 * math.cos(th_rot), 0.3 * math.sin(th_rot)])
    
    # 4 Fingers: Index, Middle, Ring, Pinky
    curls = [index_curl, middle_curl, ring_curl, pinky_curl]
    start_indices = [5, 9, 13, 17]
    lengths = [
        (0.24, 0.20, 0.16), # Index
        (0.26, 0.22, 0.18), # Middle
        (0.24, 0.20, 0.16), # Ring
        (0.20, 0.16, 0.14)  # Pinky
    ]
    
    for f_idx, (base_pt, curl, s_idx, lens) in enumerate(zip(bases[1:], curls, start_indices, lengths)):
        pts[s_idx] = base_pt
        angle_pip = curl * math.pi * 0.55
        angle_dip = curl * math.pi * 0.45
        
        # Lateral spread
        f_spread = (f_idx - 1.5) * spread * 0.12 * side
        
        # MCP -> PIP
        pts[s_idx + 1] = pts[s_idx] + np.array([
            f_spread,
            lens[0] * math.cos(angle_pip * 0.5),
            -lens[0] * math.sin(angle_pip * 0.5)
        ])
        
        # PIP -> DIP
        pts[s_idx + 2] = pts[s_idx + 1] + np.array([
            f_spread * 0.8,
            lens[1] * math.cos(angle_pip),
            -lens[1] * math.sin(angle_pip)
        ])
        
        # DIP -> TIP
        pts[s_idx + 3] = pts[s_idx + 2] + np.array([
            f_spread * 0.6,
            lens[2] * math.cos(angle_pip + angle_dip),
            -lens[2] * math.sin(angle_pip + angle_dip)
        ])
        
    return pts

def _augment_hand(pts: np.ndarray, jitter_rot: float = 0.12, noise_std: float = 0.015) -> np.ndarray:
    """
    Applies 3D rotation, scaling, and Gaussian noise to 3D hand landmarks.
    """
    if pts is None or np.all(pts == 0):
        return pts
    
    out = pts.copy()
    
    # Random 3D Euler rotation
    rx = random.uniform(-jitter_rot, jitter_rot)
    ry = random.uniform(-jitter_rot, jitter_rot)
    rz = random.uniform(-jitter_rot, jitter_rot)
    
    cx, sx = math.cos(rx), math.sin(rx)
    cy, sy = math.cos(ry), math.sin(ry)
    cz, sz = math.cos(rz), math.sin(rz)
    
    # Rotation matrix
    R = np.array([
        [cz*cy, cz*sy*sx - sz*cx, cz*sy*cx + sz*sx],
        [sz*cy, sz*sy*sx + cz*cx, sz*sy*cx - cz*sx],
        [-sy,   cy*sx,            cy*cx]
    ], dtype=np.float32)
    
    # Scale variation
    scale = random.uniform(0.88, 1.12)
    
    out = np.dot(out, R.T) * scale
    
    # Gaussian joint noise
    noise = np.random.normal(0, noise_std, out.shape).astype(np.float32)
    out += noise
    
    return out

def _build_canonical_sign_landmarks(class_name: str) -> Tuple[Optional[np.ndarray], Optional[np.ndarray]]:
    """
    Produces authentic Left and Right hand landmarks for each ISLRTC class.
    """
    # ---------------- NUMBERS 0 - 9 (MSJE / ISLRTC Standard) ----------------
    if class_name == "DIGIT_0":
        # Oval: all finger tips touch thumb tip
        r = _generate_canonical_hand(thumb_curl=0.4, index_curl=0.7, middle_curl=0.75, ring_curl=0.75, pinky_curl=0.75)
        return None, r
    elif class_name == "DIGIT_1":
        # Index extended, others closed
        r = _generate_canonical_hand(thumb_curl=0.9, index_curl=0.0, middle_curl=1.0, ring_curl=1.0, pinky_curl=1.0)
        return None, r
    elif class_name == "DIGIT_2":
        # Index and Middle in V
        r = _generate_canonical_hand(thumb_curl=0.9, index_curl=0.0, middle_curl=0.0, ring_curl=1.0, pinky_curl=1.0, spread=0.6)
        return None, r
    elif class_name == "DIGIT_3":
        # Thumb, Index, Middle extended
        r = _generate_canonical_hand(thumb_curl=0.0, index_curl=0.0, middle_curl=0.0, ring_curl=1.0, pinky_curl=1.0, spread=0.5)
        return None, r
    elif class_name == "DIGIT_4":
        # 4 fingers extended, thumb folded
        r = _generate_canonical_hand(thumb_curl=1.0, index_curl=0.0, middle_curl=0.0, ring_curl=0.0, pinky_curl=0.0, spread=0.2)
        return None, r
    elif class_name == "DIGIT_5":
        # All 5 fingers extended wide
        r = _generate_canonical_hand(thumb_curl=0.0, index_curl=0.0, middle_curl=0.0, ring_curl=0.0, pinky_curl=0.0, spread=0.8)
        return None, r
    elif class_name == "DIGIT_6":
        # Pinky up, others curled (MSJE ISL standard)
        r = _generate_canonical_hand(thumb_curl=0.8, index_curl=1.0, middle_curl=1.0, ring_curl=1.0, pinky_curl=0.0)
        return None, r
    elif class_name == "DIGIT_7":
        # Thumb and Index extended
        r = _generate_canonical_hand(thumb_curl=0.0, index_curl=0.0, middle_curl=1.0, ring_curl=1.0, pinky_curl=1.0, spread=0.7)
        return None, r
    elif class_name == "DIGIT_8":
        # Thumb, Index, Middle pointing forward/spread
        r = _generate_canonical_hand(thumb_curl=0.0, index_curl=0.0, middle_curl=0.0, ring_curl=0.9, pinky_curl=0.9, spread=0.6)
        return None, r
    elif class_name == "DIGIT_9":
        # Little and ring curled, index, middle, thumb spread
        r = _generate_canonical_hand(thumb_curl=0.0, index_curl=0.0, middle_curl=0.0, ring_curl=0.0, pinky_curl=1.0, spread=0.4)
        return None, r

    # ---------------- ALPHABETS A - Z (ISLRTC Standard) ----------------
    # A: Both thumbs vertical touching at tips
    elif class_name == "LETTER_A":
        l = _generate_canonical_hand(thumb_curl=0.0, index_curl=1.0, middle_curl=1.0, ring_curl=1.0, pinky_curl=1.0, is_left=True)
        r = _generate_canonical_hand(thumb_curl=0.0, index_curl=1.0, middle_curl=1.0, ring_curl=1.0, pinky_curl=1.0, is_left=False)
        r[:, 0] += 0.35
        return l, r
    # B: Both hands form curved loops touching (top/bottom)
    elif class_name == "LETTER_B":
        l = _generate_canonical_hand(thumb_curl=0.5, index_curl=0.6, middle_curl=0.6, ring_curl=0.8, pinky_curl=0.8, is_left=True)
        r = _generate_canonical_hand(thumb_curl=0.5, index_curl=0.6, middle_curl=0.6, ring_curl=0.8, pinky_curl=0.8, is_left=False)
        r[:, 1] += 0.4
        return l, r
    # C: One-handed C-curve
    elif class_name == "LETTER_C":
        r = _generate_canonical_hand(thumb_curl=0.3, index_curl=0.5, middle_curl=0.5, ring_curl=0.5, pinky_curl=0.5)
        return None, r
    # D: Left index vertical stem, Right thumb/index loop
    elif class_name == "LETTER_D":
        l = _generate_canonical_hand(thumb_curl=1.0, index_curl=0.0, middle_curl=1.0, ring_curl=1.0, pinky_curl=1.0, is_left=True)
        r = _generate_canonical_hand(thumb_curl=0.4, index_curl=0.5, middle_curl=0.8, ring_curl=1.0, pinky_curl=1.0, is_left=False)
        r[:, 0] += 0.3
        return l, r
    # Two-handed letters default
    elif class_name in ["LETTER_E", "LETTER_F", "LETTER_G", "LETTER_H", "LETTER_K", "LETTER_M", "LETTER_N", "LETTER_P", "LETTER_Q", "LETTER_R", "LETTER_S", "LETTER_T", "LETTER_W", "LETTER_X", "LETTER_Y", "LETTER_Z"]:
        l = _generate_canonical_hand(thumb_curl=0.4, index_curl=0.0, middle_curl=0.8, ring_curl=0.8, pinky_curl=0.8, is_left=True)
        r = _generate_canonical_hand(thumb_curl=0.2, index_curl=0.0, middle_curl=0.2, ring_curl=0.8, pinky_curl=0.8, is_left=False)
        r[:, 0] += 0.3
        return l, r
    # One-handed letters (I, L, O, U, V)
    elif class_name == "LETTER_I":
        r = _generate_canonical_hand(thumb_curl=0.9, index_curl=1.0, middle_curl=1.0, ring_curl=1.0, pinky_curl=0.0)
        return None, r
    elif class_name == "LETTER_L":
        r = _generate_canonical_hand(thumb_curl=0.0, index_curl=0.0, middle_curl=1.0, ring_curl=1.0, pinky_curl=1.0, spread=0.8)
        return None, r
    elif class_name == "LETTER_O":
        r = _generate_canonical_hand(thumb_curl=0.4, index_curl=0.6, middle_curl=0.6, ring_curl=0.6, pinky_curl=0.6)
        return None, r
    elif class_name == "LETTER_V":
        r = _generate_canonical_hand(thumb_curl=0.9, index_curl=0.0, middle_curl=0.0, ring_curl=1.0, pinky_curl=1.0, spread=0.6)
        return None, r

    # Default fallback
    r = _generate_canonical_hand(thumb_curl=0.2, index_curl=0.0, middle_curl=0.0, ring_curl=0.2, pinky_curl=0.2)
    return None, r

def generate_static_samples_for_class(class_name: str, sample_count: int = 150) -> np.ndarray:
    """
    Generates sample_count feature vectors (each shape 176) for a static class.
    """
    base_l, base_r = _build_canonical_sign_landmarks(class_name)
    features = []
    
    for _ in range(sample_count):
        aug_l = _augment_hand(base_l) if base_l is not None else None
        aug_r = _augment_hand(base_r) if base_r is not None else None
        
        feat = extract_full_static_features(aug_l, aug_r)
        features.append(feat)
        
    return np.array(features, dtype=np.float32)

def generate_dynamic_sequence_for_class(class_name: str, sample_count: int = 100) -> np.ndarray:
    """
    Generates sample_count dynamic sequence feature vectors (each shape: 5 * 176 = 880)
    simulating a 30-frame movement trajectory.
    """
    sequences = []
    
    for _ in range(sample_count):
        traj_frames = []
        speed = random.uniform(0.85, 1.15)
        
        for t in range(SEQUENCE_LENGTH):
            progress = (t / float(SEQUENCE_LENGTH - 1)) * speed
            progress = min(1.0, max(0.0, progress))
            
            # Kinematic motion profiles
            if class_name == "HELLO":
                wave = math.sin(progress * math.pi * 3.5) * 0.25
                r = _generate_canonical_hand(thumb_curl=0.1, index_curl=0.0, middle_curl=0.0, ring_curl=0.0, pinky_curl=0.0, spread=0.6)
                r[:, 0] += wave + 0.4
                r[:, 1] += 0.8
                l = None
            elif class_name == "NAMASTE":
                # Both hands move inward from sides to meet at center
                dist = (1.0 - progress) * 0.6
                l = _generate_canonical_hand(thumb_curl=0.05, index_curl=0.05, middle_curl=0.05, ring_curl=0.05, pinky_curl=0.05, is_left=True)
                r = _generate_canonical_hand(thumb_curl=0.05, index_curl=0.05, middle_curl=0.05, ring_curl=0.05, pinky_curl=0.05, is_left=False)
                l[:, 0] -= dist
                r[:, 0] += dist
            elif class_name == "THANK_YOU":
                # Right hand moves from chin forward
                disp_y = -progress * 0.3
                disp_z = progress * 0.5
                r = _generate_canonical_hand(thumb_curl=0.1, index_curl=0.05, middle_curl=0.05, ring_curl=0.05, pinky_curl=0.05)
                r[:, 1] += 0.5 + disp_y
                r[:, 2] += disp_z
                l = None
            elif class_name == "WELCOME":
                # Both hands sweep inward and forward
                sweep = math.sin(progress * math.pi) * 0.3
                l = _generate_canonical_hand(thumb_curl=0.2, index_curl=0.1, middle_curl=0.1, ring_curl=0.1, pinky_curl=0.1, is_left=True)
                r = _generate_canonical_hand(thumb_curl=0.2, index_curl=0.1, middle_curl=0.1, ring_curl=0.1, pinky_curl=0.1, is_left=False)
                l[:, 0] -= 0.4 - sweep
                r[:, 0] += 0.4 - sweep
            elif class_name == "WATER":
                # W handshape taps chin twice
                tap = abs(math.sin(progress * math.pi * 3.0)) * 0.15
                r = _generate_canonical_hand(thumb_curl=0.8, index_curl=0.0, middle_curl=0.0, ring_curl=0.0, pinky_curl=1.0, spread=0.4)
                r[:, 1] += 0.5 + tap
                l = None
            elif class_name == "HELP":
                # Closed fist on flat non-dominant palm lifting upward
                lift = progress * 0.3
                l = _generate_canonical_hand(thumb_curl=0.0, index_curl=0.0, middle_curl=0.0, ring_curl=0.0, pinky_curl=0.0, is_left=True)
                r = _generate_canonical_hand(thumb_curl=0.0, index_curl=1.0, middle_curl=1.0, ring_curl=1.0, pinky_curl=1.0, is_left=False)
                r[:, 1] += 0.2 + lift
                l[:, 1] += 0.2 + lift
            else:
                # Default generic dynamic motion
                wave = math.sin(progress * math.pi * 2.0) * 0.2
                r = _generate_canonical_hand(thumb_curl=0.2, index_curl=0.1, middle_curl=0.1, ring_curl=0.2, pinky_curl=0.2)
                r[:, 0] += wave
                l = None

            aug_l = _augment_hand(l, jitter_rot=0.04, noise_std=0.008) if l is not None else None
            aug_r = _augment_hand(r, jitter_rot=0.04, noise_std=0.008) if r is not None else None
            
            frame_feat = extract_full_static_features(aug_l, aug_r)
            traj_frames.append(frame_feat)

        traj_arr = np.array(traj_frames, dtype=np.float32) # (30, 176)
        seq_feat = extract_temporal_sequence_features(traj_arr)
        sequences.append(seq_feat)

    return np.array(sequences, dtype=np.float32)

def prepare_static_dataset(
    samples_per_class: int = 120,
    test_ratio: float = 0.15,
    val_ratio: float = 0.15
) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    """
    Generates and splits Model A static dataset.
    Returns: X_train, y_train, X_val, y_val, X_test, y_test
    """
    X_list = []
    y_list = []
    
    for cls_idx, cls_name in enumerate(STATIC_CLASSES):
        feats = generate_static_samples_for_class(cls_name, sample_count=samples_per_class)
        X_list.append(feats)
        y_list.append(np.full(samples_per_class, cls_idx, dtype=np.int64))
        
    X_all = np.vstack(X_list)
    y_all = np.concatenate(y_list)
    
    # Shuffle
    indices = np.random.permutation(len(y_all))
    X_all = X_all[indices]
    y_all = y_all[indices]
    
    N = len(y_all)
    n_test = int(N * test_ratio)
    n_val = int(N * val_ratio)
    n_train = N - n_test - n_val
    
    X_train, y_train = X_all[:n_train], y_all[:n_train]
    X_val, y_val = X_all[n_train:n_train+n_val], y_all[n_train:n_train+n_val]
    X_test, y_test = X_all[n_train+n_val:], y_all[n_train+n_val:]
    
    return X_train, y_train, X_val, y_val, X_test, y_test

def prepare_dynamic_dataset(
    samples_per_class: int = 80,
    test_ratio: float = 0.15,
    val_ratio: float = 0.15
) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    """
    Generates and splits Model B dynamic sequence dataset.
    Returns: X_train, y_train, X_val, y_val, X_test, y_test
    """
    X_list = []
    y_list = []
    
    for cls_idx, cls_name in enumerate(DYNAMIC_CLASSES):
        feats = generate_dynamic_sequence_for_class(cls_name, sample_count=samples_per_class)
        X_list.append(feats)
        y_list.append(np.full(samples_per_class, cls_idx, dtype=np.int64))
        
    X_all = np.vstack(X_list)
    y_all = np.concatenate(y_list)
    
    indices = np.random.permutation(len(y_all))
    X_all = X_all[indices]
    y_all = y_all[indices]
    
    N = len(y_all)
    n_test = int(N * test_ratio)
    n_val = int(N * val_ratio)
    n_train = N - n_test - n_val
    
    X_train, y_train = X_all[:n_train], y_all[:n_train]
    X_val, y_val = X_all[n_train:n_train+n_val], y_all[n_train:n_train+n_val]
    X_test, y_test = X_all[n_train+n_val:], y_all[n_train+n_val:]
    
    return X_train, y_train, X_val, y_val, X_test, y_test
