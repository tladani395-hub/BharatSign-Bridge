"""
Configuration for Indian Sign Language (ISL) Recognition Pipeline.
Standardized according to ISLRTC (Indian Sign Language Research & Training Centre)
and Ministry of Social Justice & Empowerment (MSJE), Govt. of India.
"""

from typing import List, Dict, Any

# Static ISL Handshape Classes: Digits 0-9 and Alphabets A-Z
STATIC_CLASSES: List[str] = [
    # Numbers (MSJE Standard)
    "DIGIT_0", "DIGIT_1", "DIGIT_2", "DIGIT_3", "DIGIT_4",
    "DIGIT_5", "DIGIT_6", "DIGIT_7", "DIGIT_8", "DIGIT_9",
    # Alphabet A-Z (ISLRTC Standard - 20 Two-handed, 6 One-handed)
    "LETTER_A", "LETTER_B", "LETTER_C", "LETTER_D", "LETTER_E",
    "LETTER_F", "LETTER_G", "LETTER_H", "LETTER_I", "LETTER_J",
    "LETTER_K", "LETTER_L", "LETTER_M", "LETTER_N", "LETTER_O",
    "LETTER_P", "LETTER_Q", "LETTER_R", "LETTER_S", "LETTER_T",
    "LETTER_U", "LETTER_V", "LETTER_W", "LETTER_X", "LETTER_Y",
    "LETTER_Z"
]

# Dynamic ISL Gesture Classes: Movement over time (T = 30 frames window)
DYNAMIC_CLASSES: List[str] = [
    "HELLO",
    "NAMASTE",
    "THANK_YOU",
    "WELCOME",
    "WATER",
    "HELP",
    "STUDENT",
    "INDIA",
    "YES",
    "NO",
    "HOW_ARE_YOU",
    "WHAT_IS_YOUR_NAME"
]

ALL_CLASSES: List[str] = STATIC_CLASSES + DYNAMIC_CLASSES

# MediaPipe Landmark Index Specifications
HAND_LANDMARK_COUNT = 21  # 21 3D points per hand (x, y, z)
POSE_UPPER_BODY_LANDMARKS = [
    0,   # Nose
    11,  # Left Shoulder
    12,  # Right Shoulder
    13,  # Left Elbow
    14,  # Right Elbow
    15,  # Left Wrist
    16   # Right Wrist
]

FACE_KEY_LANDMARKS = [
    1,   # Nose tip
    10,  # Forehead
    152, # Chin
    70,  # Left Eyebrow
    300  # Right Eyebrow
]

# Feature Dimensions
# Normalized coordinates for both hands: 21 * 3 * 2 = 126
# Hand Kinematics per hand (14 joint angles + 4 inter-fingertip + 3 palm normal + 1 thumb opposition) = 22 * 2 = 44
# Hand-to-hand relational distance & symmetry = 6
# Total Static Feature Vector Dimension = 176
STATIC_FEATURE_DIM = 176

# Dynamic Temporal Sequence Parameters
SEQUENCE_LENGTH = 30  # 30 frames at ~30 FPS = 1.0 second window
TEMPORAL_FEATURE_DIM = STATIC_FEATURE_DIM * 2  # Coordinates + 1st derivatives (velocity)

# Confidence and Inference Thresholds
CONFIDENCE_THRESHOLD = 0.50       # Minimum softmax probability tau = 0.50
CONSENSUS_FRAMES = 3              # Must agree across N consecutive frames
TRANSITION_VELOCITY_CUTOFF = 0.85 # Reject sign if moving too erratically between signs

# Paths
DATASET_DIR = "dataset"
TRAIN_DIR = "dataset/train"
VAL_DIR = "dataset/val"
TEST_DIR = "dataset/test"
ANNOTATIONS_PATH = "dataset/annotations.json"

MODEL_STATIC_PATH = "ml/model_static.joblib"
MODEL_STATIC_JSON_PATH = "ml/model_static.json"
MODEL_DYNAMIC_PATH = "ml/model_dynamic.joblib"
MODEL_DYNAMIC_JSON_PATH = "ml/model_dynamic.json"
METRICS_REPORT_PATH = "ml/evaluation_report.json"
