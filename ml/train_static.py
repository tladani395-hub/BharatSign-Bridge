"""
Model A Training Script: Static ISL Handshape Classifier (Digits 0-9 & Letters A-Z).
Standardized according to ISLRTC and MSJE guidelines.
Trains Random Forest & MLP classifiers, evaluates metrics, and exports weights.
"""

import os
import json
import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.metrics import accuracy_score, classification_report, f1_score

from ml.config import (
    STATIC_CLASSES,
    MODEL_STATIC_PATH,
    MODEL_STATIC_JSON_PATH,
    TRAIN_DIR,
    ANNOTATIONS_PATH
)
from ml.data_loader import prepare_static_dataset

def train_static_model():
    print(f"=== [Model A] Training Static Handshape Classifier ===")
    print(f"Classes ({len(STATIC_CLASSES)}): {STATIC_CLASSES[:5]} ... {STATIC_CLASSES[-5:]}")
    
    # 1. Prepare Dataset
    print("\n[1/4] Synthesizing ISLRTC & MSJE Handshape Feature Vectors...")
    X_train, y_train, X_val, y_val, X_test, y_test = prepare_static_dataset(
        samples_per_class=120,
        test_ratio=0.15,
        val_ratio=0.15
    )
    print(f"Dataset summary:")
    print(f"  - Train shape: {X_train.shape} (Features: {X_train.shape[1]})")
    print(f"  - Val shape:   {X_val.shape}")
    print(f"  - Test shape:  {X_test.shape}")
    
    # Save annotations summary
    annotations = {
        "dataset_name": "BharatSign Bridge ISLRTC Static Handshapes",
        "standard": "ISLRTC & MSJE (Govt of India)",
        "license": "CC-BY-NC-SA-4.0",
        "num_classes": len(STATIC_CLASSES),
        "classes": STATIC_CLASSES,
        "total_samples": int(len(y_train) + len(y_val) + len(y_test)),
        "feature_dim": int(X_train.shape[1])
    }
    with open(ANNOTATIONS_PATH, "w") as f:
        json.dump(annotations, f, indent=2)
        
    # 2. Train Random Forest Classifier
    print("\n[2/4] Training Random Forest Classifier (n_estimators=100)...")
    rf = RandomForestClassifier(
        n_estimators=100,
        max_depth=16,
        min_samples_split=3,
        random_state=42,
        n_jobs=-1
    )
    rf.fit(X_train, y_train)
    rf_val_acc = accuracy_score(y_val, rf.predict(X_val))
    print(f"  - Random Forest Validation Accuracy: {rf_val_acc * 100:.2f}%")
    
    # 3. Train MLP Classifier
    print("\n[3/4] Training MLP Neural Classifier (128, 64)...")
    mlp = MLPClassifier(
        hidden_layer_sizes=(128, 64),
        activation="relu",
        max_iter=250,
        random_state=42,
        early_stopping=True
    )
    mlp.fit(X_train, y_train)
    mlp_val_acc = accuracy_score(y_val, mlp.predict(X_val))
    print(f"  - MLP Neural Net Validation Accuracy: {mlp_val_acc * 100:.2f}%")
    
    # Select Best Model
    best_model = rf if rf_val_acc >= mlp_val_acc else mlp
    best_name = "RandomForest" if best_model == rf else "MLP"
    print(f"\n--> Selected Best Static Model: {best_name}")
    
    # Evaluate on Unseen Test Set
    y_test_pred = best_model.predict(X_test)
    test_acc = accuracy_score(y_test, y_test_pred)
    test_f1 = f1_score(y_test, y_test_pred, average="weighted")
    print(f"\n[4/4] Test Set Evaluation Results:")
    print(f"  - Test Accuracy: {test_acc * 100:.2f}%")
    print(f"  - Weighted F1 Score: {test_f1 * 100:.2f}%")
    
    # Save Joblib Model
    joblib.dump(best_model, MODEL_STATIC_PATH)
    print(f"  - Saved binary model to: {MODEL_STATIC_PATH}")
    
    # Export Client-Side Model Weights / Decision Specs for Browser JS Execution
    export_spec = {
        "model_type": best_name,
        "classes": STATIC_CLASSES,
        "feature_dim": int(X_train.shape[1]),
        "test_accuracy": float(test_acc),
        "test_f1": float(test_f1),
        "num_classes": len(STATIC_CLASSES)
    }
    
    if best_name == "MLP":
        export_spec["coefs"] = [c.tolist() for c in mlp.coefs_]
        export_spec["intercepts"] = [i.tolist() for i in mlp.intercepts_]
    else:
        # Export top feature importances and class priors
        export_spec["feature_importances"] = rf.feature_importances_.tolist()
        export_spec["classes_"] = [int(c) for c in rf.classes_]
        
    with open(MODEL_STATIC_JSON_PATH, "w") as f:
        json.dump(export_spec, f, indent=2)
    print(f"  - Exported client-side JSON spec to: {MODEL_STATIC_JSON_PATH}")
    
    return best_model, test_acc, test_f1

if __name__ == "__main__":
    train_static_model()
