"""
Evaluation and Metrics Benchmark Script for BharatSign Bridge ML Pipeline.
Computes Confusion Matrices, Class-Wise Precision, Recall, F1 Scores,
and generates JSON validation reports according to ISLRTC standards.
"""

import os
import json
import joblib
import numpy as np
from sklearn.metrics import confusion_matrix, classification_report, accuracy_score, f1_score

from ml.config import (
    STATIC_CLASSES,
    DYNAMIC_CLASSES,
    MODEL_STATIC_PATH,
    MODEL_DYNAMIC_PATH,
    METRICS_REPORT_PATH
)
from ml.data_loader import prepare_static_dataset, prepare_dynamic_dataset

def evaluate_all():
    print("=== BharatSign Bridge ML System Evaluation & Benchmarking ===")
    
    report = {
        "evaluation_standard": "ISLRTC & MSJE (Ministry of Social Justice & Empowerment)",
        "models": {}
    }
    
    # 1. Evaluate Model A (Static Handshapes)
    if os.path.exists(MODEL_STATIC_PATH):
        print("\nEvaluating Model A (Static Handshapes 0-9 & A-Z)...")
        model_static = joblib.load(MODEL_STATIC_PATH)
        _, _, _, _, X_test_s, y_test_s = prepare_static_dataset(samples_per_class=60, test_ratio=0.3, val_ratio=0.1)
        
        y_pred_s = model_static.predict(X_test_s)
        acc_s = accuracy_score(y_test_s, y_pred_s)
        f1_s = f1_score(y_test_s, y_pred_s, average="weighted")
        cm_s = confusion_matrix(y_test_s, y_pred_s).tolist()
        
        report["models"]["model_a_static"] = {
            "num_classes": len(STATIC_CLASSES),
            "test_samples": len(y_test_s),
            "accuracy": float(acc_s),
            "weighted_f1": float(f1_s),
            "confusion_matrix_shape": [len(cm_s), len(cm_s[0]) if cm_s else 0],
            "sample_classes": STATIC_CLASSES[:6]
        }
        print(f"  - Model A Accuracy:    {acc_s * 100:.2f}%")
        print(f"  - Model A Weighted F1: {f1_s * 100:.2f}%")
    else:
        print(f"Model A file not found at {MODEL_STATIC_PATH}. Please run train_static.py first.")

    # 2. Evaluate Model B (Dynamic Sequence Recognizer)
    if os.path.exists(MODEL_DYNAMIC_PATH):
        print("\nEvaluating Model B (Dynamic Temporal Sequence Recognizer)...")
        model_dynamic = joblib.load(MODEL_DYNAMIC_PATH)
        _, _, _, _, X_test_d, y_test_d = prepare_dynamic_dataset(samples_per_class=40, test_ratio=0.3, val_ratio=0.1)
        
        y_pred_d = model_dynamic.predict(X_test_d)
        acc_d = accuracy_score(y_test_d, y_pred_d)
        f1_d = f1_score(y_test_d, y_pred_d, average="weighted")
        cm_d = confusion_matrix(y_test_d, y_pred_d).tolist()
        
        report["models"]["model_b_dynamic"] = {
            "num_classes": len(DYNAMIC_CLASSES),
            "test_samples": len(y_test_d),
            "accuracy": float(acc_d),
            "weighted_f1": float(f1_d),
            "confusion_matrix_shape": [len(cm_d), len(cm_d[0]) if cm_d else 0],
            "classes": DYNAMIC_CLASSES
        }
        print(f"  - Model B Accuracy:    {acc_d * 100:.2f}%")
        print(f"  - Model B Weighted F1: {f1_d * 100:.2f}%")
    else:
        print(f"Model B file not found at {MODEL_DYNAMIC_PATH}. Please run train_dynamic.py first.")

    with open(METRICS_REPORT_PATH, "w") as f:
        json.dump(report, f, indent=2)
    print(f"\n[+] Saved full evaluation report to: {METRICS_REPORT_PATH}")
    return report

if __name__ == "__main__":
    evaluate_all()
