"""
Kinematic Feature Engineering and Geometric Normalization for ISL Recognition.
Computes translation-invariant, scale-invariant joint angles, palm normals,
finger curl ratios, and temporal derivatives.
"""

import math
from typing import List, Dict, Optional, Tuple, Any
import numpy as np

def calculate_angle_3d(a: np.ndarray, b: np.ndarray, c: np.ndarray) -> float:
    """
    Computes angle at joint b formed by vectors ba and bc in degrees [0, 180].
    """
    ba = a - b
    bc = c - b
    norm_ba = np.linalg.norm(ba)
    norm_bc = np.linalg.norm(bc)
    if norm_ba < 1e-6 or norm_bc < 1e-6:
        return 0.0
    cosine = np.dot(ba, bc) / (norm_ba * norm_bc)
    cosine = np.clip(cosine, -1.0, 1.0)
    return float(np.degrees(np.arccos(cosine)))

def normalize_hand_landmarks(landmarks: np.ndarray) -> np.ndarray:
    """
    Translates hand landmarks so wrist (index 0) is at origin (0, 0, 0),
    and normalizes scale by distance between wrist (0) and middle finger MCP (9).
    landmarks: shape (21, 3)
    returns: shape (21, 3)
    """
    if landmarks is None or len(landmarks) == 0:
        return np.zeros((21, 3), dtype=np.float32)
    
    pts = np.array(landmarks, dtype=np.float32)
    if pts.shape[0] != 21:
        return np.zeros((21, 3), dtype=np.float32)
    
    wrist = pts[0].copy()
    translated = pts - wrist
    
    # Scale normalization factor (wrist to middle MCP)
    palm_scale = np.linalg.norm(translated[9])
    if palm_scale > 1e-4:
        normalized = translated / palm_scale
    else:
        normalized = translated
        
    return normalized

def compute_hand_kinematics(pts: np.ndarray) -> np.ndarray:
    """
    Computes 22 kinematic features for a single 21-joint hand:
    - 14 Joint angles (degrees / 180.0 normalized to [0, 1])
    - 4 Inter-fingertip distances
    - 3 Palm normal vector components (nx, ny, nz)
    - 1 Thumb opposition distance
    pts: normalized or raw hand landmarks (21, 3)
    returns: array of length 22
    """
    if pts is None or pts.shape[0] != 21 or np.all(pts == 0):
        return np.zeros(22, dtype=np.float32)
    
    angles = []
    # Thumb: 1-2-3, 2-3-4
    angles.append(calculate_angle_3d(pts[1], pts[2], pts[3]))
    angles.append(calculate_angle_3d(pts[2], pts[3], pts[4]))
    # Index: 0-5-6, 5-6-7, 6-7-8
    angles.append(calculate_angle_3d(pts[0], pts[5], pts[6]))
    angles.append(calculate_angle_3d(pts[5], pts[6], pts[7]))
    angles.append(calculate_angle_3d(pts[6], pts[7], pts[8]))
    # Middle: 0-9-10, 9-10-11, 10-11-12
    angles.append(calculate_angle_3d(pts[0], pts[9], pts[10]))
    angles.append(calculate_angle_3d(pts[9], pts[10], pts[11]))
    angles.append(calculate_angle_3d(pts[10], pts[11], pts[12]))
    # Ring: 0-13-14, 13-14-15, 14-15-16
    angles.append(calculate_angle_3d(pts[0], pts[13], pts[14]))
    angles.append(calculate_angle_3d(pts[13], pts[14], pts[15]))
    angles.append(calculate_angle_3d(pts[14], pts[15], pts[16]))
    # Pinky: 0-17-18, 17-18-19, 18-19-20
    angles.append(calculate_angle_3d(pts[0], pts[17], pts[18]))
    angles.append(calculate_angle_3d(pts[17], pts[18], pts[19]))
    angles.append(calculate_angle_3d(pts[18], pts[19], pts[20]))
    
    normalized_angles = np.array(angles, dtype=np.float32) / 180.0
    
    # Inter-fingertip distances
    d_thumb_idx = np.linalg.norm(pts[4] - pts[8])
    d_idx_mid = np.linalg.norm(pts[8] - pts[12])
    d_mid_rng = np.linalg.norm(pts[12] - pts[16])
    d_rng_pnk = np.linalg.norm(pts[16] - pts[20])
    inter_tips = np.array([d_thumb_idx, d_idx_mid, d_mid_rng, d_rng_pnk], dtype=np.float32)
    
    # Palm normal vector: cross product of (MCP_index - Wrist) and (MCP_pinky - Wrist)
    u = pts[5] - pts[0]
    v = pts[17] - pts[0]
    normal = np.cross(u, v)
    norm_val = np.linalg.norm(normal)
    if norm_val > 1e-6:
        normal = normal / norm_val
    else:
        normal = np.array([0.0, 0.0, 1.0], dtype=np.float32)
        
    # Thumb opposition: distance from thumb tip (4) to pinky MCP (17)
    thumb_opposition = float(np.linalg.norm(pts[4] - pts[17]))
    
    return np.concatenate([
        normalized_angles,
        inter_tips,
        normal,
        np.array([thumb_opposition], dtype=np.float32)
    ])

def compute_two_hand_relationship(left_pts: np.ndarray, right_pts: np.ndarray) -> np.ndarray:
    """
    Computes relational geometry between Left and Right hands:
    - Distance between wrists
    - Distance between index fingertips
    - Delta Y elevation between wrists
    - Relative palm normal alignment (cosine similarity)
    - Presence flags [left_present, right_present]
    returns: array of length 6
    """
    has_left = left_pts is not None and not np.all(left_pts == 0)
    has_right = right_pts is not None and not np.all(right_pts == 0)
    
    rel = np.zeros(6, dtype=np.float32)
    rel[4] = 1.0 if has_left else 0.0
    rel[5] = 1.0 if has_right else 0.0
    
    if has_left and has_right:
        wrist_l = left_pts[0]
        wrist_r = right_pts[0]
        rel[0] = float(np.linalg.norm(wrist_l - wrist_r))
        rel[1] = float(np.linalg.norm(left_pts[8] - right_pts[8]))
        rel[2] = float(wrist_l[1] - wrist_r[1])
        
        # Palm normals
        u_l = left_pts[5] - left_pts[0]
        v_l = left_pts[17] - left_pts[0]
        n_l = np.cross(u_l, v_l)
        nl_norm = np.linalg.norm(n_l)
        if nl_norm > 1e-6: n_l = n_l / nl_norm
        
        u_r = right_pts[5] - right_pts[0]
        v_r = right_pts[17] - right_pts[0]
        n_r = np.cross(u_r, v_r)
        nr_norm = np.linalg.norm(n_r)
        if nr_norm > 1e-6: n_r = n_r / nr_norm
        
        rel[3] = float(np.dot(n_l, n_r))
        
    return rel

def extract_full_static_features(left_hand: Optional[np.ndarray], right_hand: Optional[np.ndarray]) -> np.ndarray:
    """
    Aggregates the complete 176-dimensional static feature vector:
    - Left hand normalized coordinates (21 * 3 = 63)
    - Right hand normalized coordinates (21 * 3 = 63)
    - Left hand kinematics (22)
    - Right hand kinematics (22)
    - Two-hand relational features (6)
    Total = 63 + 63 + 22 + 22 + 6 = 176
    """
    norm_l = normalize_hand_landmarks(left_hand) if left_hand is not None else np.zeros((21, 3), dtype=np.float32)
    norm_r = normalize_hand_landmarks(right_hand) if right_hand is not None else np.zeros((21, 3), dtype=np.float32)
    
    kin_l = compute_hand_kinematics(norm_l)
    kin_r = compute_hand_kinematics(norm_r)
    rel = compute_two_hand_relationship(norm_l, norm_r)
    
    return np.concatenate([
        norm_l.flatten(),
        norm_r.flatten(),
        kin_l,
        kin_r,
        rel
    ]).astype(np.float32)

def extract_temporal_sequence_features(sequence: np.ndarray) -> np.ndarray:
    """
    Given a sequence of static feature vectors across T frames (shape: T, D),
    computes temporal pooling, velocity (1st derivative), and acceleration (2nd derivative).
    returns: 1D feature vector for sequence classifier.
    """
    T, D = sequence.shape
    if T < 2:
        return np.concatenate([sequence[-1], np.zeros(D, dtype=np.float32)])
    
    # Velocity: first difference
    velocities = np.diff(sequence, axis=0) # shape (T-1, D)
    
    # Acceleration: second difference
    accelerations = np.diff(velocities, axis=0) if T >= 3 else np.zeros((1, D), dtype=np.float32)
    
    # Statistical aggregates across time window
    mean_feat = np.mean(sequence, axis=0)
    std_feat = np.std(sequence, axis=0)
    mean_vel = np.mean(velocities, axis=0)
    max_vel = np.max(np.abs(velocities), axis=0)
    
    # Final frame features
    last_feat = sequence[-1]
    
    return np.concatenate([
        last_feat,
        mean_feat,
        std_feat,
        mean_vel,
        max_vel
    ]).astype(np.float32)
