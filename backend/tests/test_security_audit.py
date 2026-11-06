"""
BharatSign Bridge - Security & Machine Learning Audit Test Suite
Verifies all security controls, RBAC rules, anti-enumeration mitigations,
and ML landmark plausibility checks.
"""

import sys
import os
import numpy as np
from fastapi.testclient import TestClient

# Ensure workspace root is in python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from backend.main import app, create_access_token, DB_PATH
from ml.predict import is_plausible_hand, predict_isl_sign

client = TestClient(app)

# Test Tokens for Seeded Verified Accounts
STUDENT_TOKEN = create_access_token("user_demo_001", "student@bharatsign.ai", "student")
EXPERT_TOKEN = create_access_token("user_expert_001", "expert@bharatsign.ai", "expert")
ADMIN_TOKEN = create_access_token("user_admin_001", "admin@bharatsign.ai", "admin")


# 1. Unauthenticated & Protected Progress Sync Tests
def test_sync_progress_unauthenticated_fails():
    res = client.post("/api/auth/sync-progress", json={
        "email": "student@bharatsign.ai",
        "streak_days": 999,
        "mastered_signs_count": 999
    })
    assert res.status_code == 401
    assert "Authentication required" in res.json().get("detail", "")


def test_sync_progress_authenticated_succeeds():
    headers = {"Authorization": f"Bearer {STUDENT_TOKEN}"}
    res = client.post("/api/auth/sync-progress", json={
        "email": "student@bharatsign.ai",
        "streak_days": 5,
        "mastered_signs_count": 12
    }, headers=headers)
    assert res.status_code == 200
    assert res.json().get("status") == "success"


# 2. Public User List Exposure Lockdown Tests
def test_get_users_unauthenticated_fails():
    res = client.get("/api/auth/users")
    assert res.status_code == 401


def test_get_users_as_student_forbidden():
    headers = {"Authorization": f"Bearer {STUDENT_TOKEN}"}
    res = client.get("/api/auth/users", headers=headers)
    assert res.status_code == 403
    assert "Forbidden" in res.json().get("detail", "")


def test_get_users_as_admin_allowed():
    headers = {"Authorization": f"Bearer {ADMIN_TOKEN}"}
    res = client.get("/api/auth/users", headers=headers)
    assert res.status_code == 200
    assert "users" in res.json()


# 3. Expert Review RBAC Tests (Forged reviews prevented)
def test_post_review_unauthenticated_fails():
    res = client.post("/api/reviews", json={
        "sign_id": "test_sign",
        "gloss": "TEST",
        "reviewer_name": "Attacker",
        "status": "validated"
    })
    assert res.status_code == 401


def test_post_review_as_student_forbidden():
    headers = {"Authorization": f"Bearer {STUDENT_TOKEN}"}
    res = client.post("/api/reviews", json={
        "sign_id": "test_sign",
        "gloss": "TEST",
        "reviewer_name": "Student Attacker",
        "status": "validated"
    }, headers=headers)
    assert res.status_code == 403


def test_post_review_as_expert_succeeds():
    headers = {"Authorization": f"Bearer {EXPERT_TOKEN}"}
    res = client.post("/api/reviews", json={
        "sign_id": "digit_1",
        "gloss": "ONE",
        "reviewer_name": "ISLRTC Expert Evaluator",
        "status": "validated"
    }, headers=headers)
    assert res.status_code == 200
    assert "review recorded in database" in res.json().get("message", "")


# 4. Certificate Claim Lockdown Tests
def test_claim_certificate_unauthenticated_fails():
    res = client.post("/api/certificates/claim", json={
        "user_name": "Fake Signer",
        "user_email": "fake@bharatsign.ai",
        "streak_days": 100,
        "mastered_signs_count": 50
    })
    assert res.status_code == 401


def test_claim_certificate_zero_progress_rejected():
    import sqlite3
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
    INSERT OR IGNORE INTO users (id, name, email, password_hash, preferred_language, role, streak_days, mastered_signs_count, total_quizzes_taken, level, joined_date)
    VALUES ('user_zero_001', 'Zero Progress Student', 'zero@bharatsign.ai', 'dummy_hash', 'en', 'student', 0, 0, 0, 'ISL Beginner', 'Nov 2026')
    """)
    conn.commit()
    conn.close()

    zero_user_token = create_access_token("user_zero_001", "zero@bharatsign.ai", "student")
    headers = {"Authorization": f"Bearer {zero_user_token}"}
    res = client.post("/api/certificates/claim", json={
        "user_name": "Zero Progress Student",
        "user_email": "zero@bharatsign.ai",
        "streak_days": 0,
        "mastered_signs_count": 0,
        "total_quizzes_taken": 0
    }, headers=headers)
    assert res.status_code == 400
    assert "Certificate criteria not met" in res.json().get("detail", "")


# 5. Anti-Enumeration & Password Recovery Tests
def test_forgot_password_unknown_email_returns_dummy_without_leaking():
    res = client.post("/api/auth/forgot-password", json={
        "email": "completely_unregistered_user_9988@bharatsign.ai"
    })
    assert res.status_code == 200
    data = res.json()
    assert data.get("status") == "success"
    assert "challenge_token" in data
    assert len(data.get("questions", [])) == 2
    # Verify deterministic question return for the same email
    res2 = client.post("/api/auth/forgot-password", json={
        "email": "completely_unregistered_user_9988@bharatsign.ai"
    })
    data2 = res2.json()
    assert data["questions"] == data2["questions"]


# 6. Machine Learning Noise Rejection Tests
def test_is_plausible_hand_rejects_noise():
    # 21 landmarks of pure zero or collapsed points
    collapsed = np.zeros((21, 3), dtype=np.float32)
    valid, reason = is_plausible_hand(collapsed)
    assert valid is False

    # Out of boundary landmarks
    out_of_bounds = np.ones((21, 3), dtype=np.float32) * 5.0
    valid_oob, _ = is_plausible_hand(out_of_bounds)
    assert valid_oob is False


def test_recognize_sign_noise_returns_low_confidence():
    # Collapsed noisy points
    noisy_landmarks = [{"x": 0.5, "y": 0.5, "z": 0.0} for _ in range(21)]
    result = predict_isl_sign(right_hand=noisy_landmarks)
    assert result.get("recognized") is False
    assert result.get("confidence") == 0.0
    assert result.get("status") in ("invalid_landmarks", "low_confidence", "noise_rejected")


def test_recognize_sign_namaste_rejects_hands_above_head():
    # Hands positioned way above head (wrist_y = 0.10)
    high_hand = [{"x": 0.5, "y": 0.10, "z": 0.0} for _ in range(21)]
    result = predict_isl_sign(
        left_hand=high_hand,
        right_hand=high_hand
    )
    # Must NOT recognize as NAMASTE
    assert result.get("gloss") != "NAMASTE"


if __name__ == "__main__":
    tests = [
        test_sync_progress_unauthenticated_fails,
        test_sync_progress_authenticated_succeeds,
        test_get_users_unauthenticated_fails,
        test_get_users_as_student_forbidden,
        test_get_users_as_admin_allowed,
        test_post_review_unauthenticated_fails,
        test_post_review_as_student_forbidden,
        test_post_review_as_expert_succeeds,
        test_claim_certificate_unauthenticated_fails,
        test_claim_certificate_zero_progress_rejected,
        test_forgot_password_unknown_email_returns_dummy_without_leaking,
        test_is_plausible_hand_rejects_noise,
        test_recognize_sign_noise_returns_low_confidence,
        test_recognize_sign_namaste_rejects_hands_above_head,
    ]

    passed = 0
    print("=" * 60)
    print("RUNNING BHARATSIGN BRIDGE SECURITY & ML AUDIT TESTS")
    print("=" * 60)
    for t in tests:
        try:
            t()
            print(f"[PASS] {t.__name__}")
            passed += 1
        except Exception as e:
            print(f"[FAIL] {t.__name__}: {e}")
            raise e

    print("=" * 60)
    print(f"ALL {passed}/{len(tests)} TESTS PASSED SUCCESSFULLY!")
    print("=" * 60)
