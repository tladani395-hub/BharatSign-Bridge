"""
Model Exporter and Integrity Verifier for BharatSign Bridge ML System.
Trains Model A and Model B, exports JSON weights for browser client,
and produces evaluation artifacts.
"""

import os
import json
from ml.train_static import train_static_model
from ml.train_dynamic import train_dynamic_model
from ml.evaluate import evaluate_all
from ml.config import (
    MODEL_STATIC_PATH,
    MODEL_STATIC_JSON_PATH,
    MODEL_DYNAMIC_PATH,
    MODEL_DYNAMIC_JSON_PATH,
    METRICS_REPORT_PATH,
    ANNOTATIONS_PATH
)

def run_export_pipeline():
    print("=" * 65)
    print("  BHARATSIGN BRIDGE 2.0 - ML MODEL EXPORT & VALIDATION PIPELINE")
    print("=" * 65)
    
    # 1. Train Model A (Static Handshapes)
    print("\n>>> STEP 1: Training Model A (Static 0-9 & A-Z)...")
    m_static, acc_s, f1_s = train_static_model()
    
    # 2. Train Model B (Dynamic Sequences)
    print("\n>>> STEP 2: Training Model B (Dynamic Sequence Recognizer)...")
    m_dynamic, acc_d, f1_d = train_dynamic_model()
    
    # 3. Evaluate & Generate Benchmark Report
    print("\n>>> STEP 3: Benchmarking against ISLRTC & MSJE test sets...")
    report = evaluate_all()
    
    # 4. Verify Export Integrity
    print("\n>>> STEP 4: Verifying Exported Artifacts...")
    artifacts = [
        MODEL_STATIC_PATH,
        MODEL_STATIC_JSON_PATH,
        MODEL_DYNAMIC_PATH,
        MODEL_DYNAMIC_JSON_PATH,
        METRICS_REPORT_PATH,
        ANNOTATIONS_PATH
    ]
    
    all_ok = True
    for path in artifacts:
        if os.path.exists(path):
            size_kb = os.path.getsize(path) / 1024.0
            print(f"  [OK] {path:<30} ({size_kb:.1f} KB)")
        else:
            print(f"  [MISSING] {path}")
            all_ok = False
            
    if all_ok:
        print("\nAll ML models and JSON specifications exported successfully!")
    else:
        print("\nWarning: Some artifacts were not generated.")

if __name__ == "__main__":
    run_export_pipeline()
