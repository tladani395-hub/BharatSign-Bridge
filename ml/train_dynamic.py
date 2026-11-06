"""
Model B Training Script: Dynamic ISL Gesture Sequence Recognizer (T = 30 Frames).
Recognizes temporal movement trajectories (Namaste, Hello, Thank You, Welcome, etc.)
Standardized according to ISLRTC standards.
"""

import os
import json
import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.metrics import accuracy_score, classification_report, f1_score

from ml.config import (
    DYNAMIC_CLASSES,
    MODEL_DYNAMIC_PATH,
    MODEL_DYNAMIC_JSON_PATH
)
from ml.data_loader import prepare_dynamic_dataset

def train_dynamic_model():
    print(f"=== [Model B] Training Dynamic Gesture Sequence Recognizer ===")
    print(f"Classes ({len(DYNAMIC_CLASSES)}): {DYNAMIC_CLASSES}")
    
    # 1. Prepare Dataset
    print("\n[1/4] Synthesizing ISLRTC Temporal Motion Sequences (30 frames / 1s)...")
    X_train, y_train, X_val, y_val, X_test, y_test = prepare_dynamic_dataset(
        samples_per_class=80,
        test_ratio=0.15,
        val_ratio=0.15
    )
    print(f"Dataset summary:")
    print(f"  - Train shape: {X_train.shape} (Temporal Feature Dim: {X_train.shape[1]})")
    print(f"  - Val shape:   {X_val.shape}")
    print(f"  - Test shape:  {X_test.shape}")
    
    # 2. Train Random Forest Classifier
    print("\n[2/4] Training Temporal Random Forest Classifier...")
    rf = RandomForestClassifier(
        n_estimators=100,
        max_depth=14,
        min_samples_split=2,
        random_state=42,
        n_jobs=-1
    )
    rf.fit(X_train, y_train)
    rf_val_acc = accuracy_score(y_val, rf.predict(X_val))
    print(f"  - Random Forest Sequence Val Accuracy: {rf_val_acc * 100:.2f}%")
    
    # 3. Train MLP Temporal Classifier
    print("\n[3/4] Training Temporal MLP Neural Classifier (256, 128)...")
    mlp = MLPClassifier(
        hidden_layer_sizes=(256, 128),
        activation="relu",
        max_iter=250,
        random_state=42,
        early_stopping=True
    )
    mlp.fit(X_train, y_train)
    mlp_val_acc = accuracy_score(y_val, mlp.predict(X_val))
    print(f"  - MLP Neural Net Sequence Val Accuracy: {mlp_val_acc * 100:.2f}%")
    
    # Select Best Model
    best_model = rf if rf_val_acc >= mlp_val_acc else mlp
    best_name = "RandomForest" if best_model == rf else "MLP"
    print(f"\n--> Selected Best Dynamic Model: {best_name}")
    
    # Evaluate on Test Set
    y_test_pred = best_model.predict(X_test)
    test_acc = accuracy_score(y_test, y_test_pred)
    test_f1 = f1_score(y_test, y_test_pred, average="weighted")
    print(f"\n[4/4] Dynamic Test Set Results:")
    print(f"  - Sequence Test Accuracy: {test_acc * 100:.2f}%")
    print(f"  - Sequence F1 Score:      {test_f1 * 100:.2f}%")
    
    # Save Joblib Model
    joblib.dump(best_model, MODEL_DYNAMIC_PATH)
    print(f"  - Saved binary model to: {MODEL_DYNAMIC_PATH}")
    
    # Export Client-Side Model Weights / Decision Specs
    export_spec = {
        "model_type": best_name,
        "classes": DYNAMIC_CLASSES,
        "feature_dim": int(X_train.shape[1]),
        "test_accuracy": float(test_acc),
        "test_f1": float(test_f1),
        "num_classes": len(DYNAMIC_CLASSES)
    }
    
    if best_name == "MLP":
        export_spec["coefs"] = [c.tolist() for c in mlp.coefs_]
        export_spec["intercepts"] = [i.tolist() for i in mlp.intercepts_]
    else:
        export_spec["feature_importances"] = rf.feature_importances_.tolist()
        export_spec["classes_"] = [int(c) for c in rf.classes_]
        
    with open(MODEL_DYNAMIC_JSON_PATH, "w") as f:
        json.dump(export_spec, f, indent=2)
    print(f"  - Exported client-side JSON spec to: {MODEL_DYNAMIC_JSON_PATH}")
    
    return best_model, test_acc, test_f1

if __name__ == "__main__":
    train_dynamic_model()
