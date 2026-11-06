"""
BharatSign Bridge - Security & Machine Learning Audit Test Suite
Verifies all security controls, RBAC rules, anti-enumeration mitigations,
and ML landmark plausibility checks.
"""

import sys
import os
import numpy as np
import sqlite3
from fastapi.testclient import TestClient

# Ensure workspace root is in python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from backend.main import (
    app,
    create_access_token,
    DB_PATH,
    generate_captcha_challenge,
    verify_captcha_challenge,
    USED_CAPTCHA_TOKENS
)
from ml.predict import is_plausible_hand, predict_isl_sign

client = TestClient(app)

# Ensure seeded verified accounts exist in DB
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()
cursor.execute("SELECT COUNT(*) FROM users WHERE email = 'student@bharatsign.ai'")
if cursor.fetchone()[0] == 0:
    cursor.execute("""
    INSERT INTO users (id, name, email, password_hash, preferred_language, role, streak_days, level, joined_date)
    VALUES ('user_demo_001', 'ISL Student (Demo)', 'student@bharatsign.ai', '$2b$12$e80yq9gPkWYJvFk9mC/0veQfWpZ0JpIe6H1T9O2G4hJz.Wk0O9yGu', 'en', 'student', 0, 'ISL Beginner', 'Nov 2026')
    """)
cursor.execute("SELECT COUNT(*) FROM users WHERE email = 'expert@bharatsign.ai'")
if cursor.fetchone()[0] == 0:
    cursor.execute("""
    INSERT INTO users (id, name, email, password_hash, preferred_language, role, streak_days, level, joined_date)
    VALUES ('user_expert_001', 'Dr. Sunita Sharma', 'expert@bharatsign.ai', '$2b$12$e80yq9gPkWYJvFk9mC/0veQfWpZ0JpIe6H1T9O2G4hJz.Wk0O9yGu', 'en', 'expert', 45, 'ISL Master', 'Nov 2026')
    """)
cursor.execute("SELECT COUNT(*) FROM users WHERE email = 'admin@bharatsign.ai'")
if cursor.fetchone()[0] == 0:
    cursor.execute("""
    INSERT INTO users (id, name, email, password_hash, preferred_language, role, streak_days, level, joined_date)
    VALUES ('user_admin_001', 'System Administrator', 'admin@bharatsign.ai', '$2b$12$e80yq9gPkWYJvFk9mC/0veQfWpZ0JpIe6H1T9O2G4hJz.Wk0O9yGu', 'en', 'admin', 99, 'System Admin', 'Nov 2026')
    """)
conn.commit()
conn.close()

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


def test_sync_progress_negative_numbers_rejected():
    headers = {"Authorization": f"Bearer {STUDENT_TOKEN}"}
    res = client.post("/api/auth/sync-progress", json={
        "email": "student@bharatsign.ai",
        "streak_days": -10,
        "mastered_signs_count": -5
    }, headers=headers)
    assert res.status_code == 400
    assert "cannot be negative" in res.json().get("detail", "")


# 2. Public User List Exposure Removed
def test_get_users_endpoint_removed():
    res = client.get("/api/auth/users")
    assert res.status_code == 404 or res.status_code == 405


# 3. Security Questions Setup Takeover Prevention
def test_setup_security_questions_unauthenticated_fails():
    res = client.post("/api/auth/security-questions/setup", json={
        "current_password": "WrongPassword123!",
        "question_1_id": "q1_school",
        "answer_1": "DPS",
        "question_2_id": "q2_pet",
        "answer_2": "Tommy"
    })
    assert res.status_code == 401


def test_setup_security_questions_wrong_password_fails():
    headers = {"Authorization": f"Bearer {STUDENT_TOKEN}"}
    res = client.post("/api/auth/security-questions/setup", json={
        "current_password": "DefinitelyWrongPassword123!",
        "question_1_id": "q1_school",
        "answer_1": "DPS",
        "question_2_id": "q2_pet",
        "answer_2": "Tommy"
    }, headers=headers)
    assert res.status_code == 401
    assert "Password verification failed" in res.json().get("detail", "")


# 4. Expert Review RBAC Tests (Forged reviews prevented)
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


# 5. Certificate Security Tests
def test_claim_certificate_unauthenticated_fails():
    res = client.post("/api/certificates/claim", json={
        "user_name": "Fake Signer",
        "user_email": "fake@bharatsign.ai",
        "streak_days": 100,
        "mastered_signs_count": 50
    })
    assert res.status_code == 401


def test_claim_certificate_zero_progress_rejected():
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


def test_verify_certificate_does_not_leak_email():
    # Insert a verified certificate for testing
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
    INSERT OR REPLACE INTO certificates (cert_id, user_id, user_name, user_email, streak_days, mastered_signs_count, total_quizzes_taken, issued_at, verification_hash, status)
    VALUES ('BSB-TEST-7788', 'user_demo_001', 'ISL Student', 'private_email@bharatsign.ai', 10, 25, 3, 'Nov 06, 2026', 'SHA256:abc12345', 'VERIFIED')
    """)
    conn.commit()
    conn.close()

    res = client.get("/api/certificates/BSB-TEST-7788")
    assert res.status_code == 200
    cert_data = res.json().get("certificate", {})
    assert "user_email" not in cert_data
    assert cert_data.get("user_name") == "ISL Student"


# 6. Profile Sanitization & XSS Protection
def test_update_profile_rejects_xss_avatar():
    headers = {"Authorization": f"Bearer {STUDENT_TOKEN}"}
    res = client.put("/api/auth/profile", json={
        "avatar_url": "javascript:alert(1)",
        "bio": "Normal bio"
    }, headers=headers)
    assert res.status_code == 400
    assert "Invalid avatar URL" in res.json().get("detail", "")


# 7. Single-use Captcha & Mandatory Login Captcha
def test_login_requires_captcha():
    res = client.post("/api/auth/login", json={
        "email": "student@bharatsign.ai",
        "password": "WrongPassword123!"
    })
    assert res.status_code == 400
    assert "Human verification is required" in res.json().get("detail", "")


def test_captcha_replay_rejected():
    chal = generate_captcha_challenge()
    ans = str(chal["num1"] + chal["num2"])
    tok = chal["token"]

    # First verification succeeds
    assert verify_captcha_challenge(ans, tok) is True
    # Replay verification immediately fails
    assert verify_captcha_challenge(ans, tok) is False


# 8. Anti-Enumeration & Password Recovery Tests
def test_forgot_password_unknown_email_returns_dummy_without_leaking():
    res = client.post("/api/auth/forgot-password", json={
        "email": "completely_unregistered_user_9988@bharatsign.ai"
    })
    assert res.status_code == 200
    data = res.json()
    assert data.get("status") == "success"
    assert "challenge_token" in data
    assert len(data.get("questions", [])) == 2


# 9. Machine Learning Noise Rejection Tests
def test_is_plausible_hand_rejects_noise():
    collapsed = np.zeros((21, 3), dtype=np.float32)
    valid, _ = is_plausible_hand(collapsed)
    assert valid is False

    out_of_bounds = np.ones((21, 3), dtype=np.float32) * 5.0
    valid_oob, _ = is_plausible_hand(out_of_bounds)
    assert valid_oob is False


def test_recognize_sign_noise_returns_low_confidence():
    noisy_landmarks = [{"x": 0.5, "y": 0.5, "z": 0.0} for _ in range(21)]
    result = predict_isl_sign(right_hand=noisy_landmarks)
    assert result.get("recognized") is False
    assert result.get("confidence") == 0.0


def test_recognize_sign_namaste_rejects_hands_above_head():
    high_hand = [{"x": 0.5, "y": 0.10, "z": 0.0} for _ in range(21)]
    result = predict_isl_sign(left_hand=high_hand, right_hand=high_hand)
    assert result.get("gloss") != "NAMASTE"


def test_leaderboard_does_not_leak_emails():
    res = client.get("/api/leaderboard")
    assert res.status_code == 200
    users = res.json().get("users", [])
    for u in users:
        assert "email" not in u
        assert "password" not in u
        assert "password_hash" not in u


def test_translate_gibberish_returns_no_match():
    res = client.post("/api/translate", json={"text": "xyzqwp9928173asdf", "source_language": "en", "target_language": "hi"})
    assert res.status_code == 200
    data = res.json()
    assert data.get("status") == "no_match"
    assert data.get("matched") is False

def test_social_login_google_and_github():
    # 1. Invalid provider rejection
    res_bad = client.post("/api/auth/social-login", json={
        "provider": "facebook",
        "email": "test@gmail.com",
        "name": "Test User"
    })
    assert res_bad.status_code == 400

    # 2. Invalid email rejection
    res_no_email = client.post("/api/auth/social-login", json={
        "provider": "google",
        "email": "invalid_email_format",
        "name": "Test User"
    })
    assert res_no_email.status_code == 400

    # 3. New user sign up with Google
    test_google_email = "student.oauth.google@bharatsign.ai"
    res_g_signup = client.post("/api/auth/social-login", json={
        "provider": "google",
        "provider_id": "google_sub_10928374",
        "email": test_google_email,
        "name": "Google Learner",
        "avatar_url": "https://lh3.googleusercontent.com/a/default-avatar"
    })
    assert res_g_signup.status_code == 200
    g_data = res_g_signup.json()
    assert g_data["status"] == "success"
    assert "token" in g_data
    assert len(g_data["token"]) > 30
    assert g_data["user"]["email"] == test_google_email
    assert g_data["user"]["name"] == "Google Learner"

    # 4. Subsequent sign in with Google (existing user)
    res_g_signin = client.post("/api/auth/social-login", json={
        "provider": "google",
        "provider_id": "google_sub_10928374",
        "email": test_google_email,
        "name": "Google Learner"
    })
    assert res_g_signin.status_code == 200
    g_signin_data = res_g_signin.json()
    assert g_signin_data["isNewUser"] is False
    assert g_signin_data["token"] is not None

    # 5. Sign up / in with GitHub
    test_gh_email = "developer.oauth.github@bharatsign.ai"
    res_gh = client.post("/api/auth/social-login", json={
        "provider": "github",
        "provider_id": "github_id_8829102",
        "email": test_gh_email,
        "name": "GitHub Contributor",
        "avatar_url": "https://avatars.githubusercontent.com/u/12345678"
    })
    assert res_gh.status_code == 200
    gh_data = res_gh.json()
    assert gh_data["status"] == "success"
    assert "token" in gh_data
    assert gh_data["user"]["email"] == test_gh_email
    assert gh_data["user"]["name"] == "GitHub Contributor"


if __name__ == "__main__":
    tests = [
        test_sync_progress_unauthenticated_fails,
        test_sync_progress_authenticated_succeeds,
        test_sync_progress_negative_numbers_rejected,
        test_get_users_endpoint_removed,
        test_setup_security_questions_unauthenticated_fails,
        test_setup_security_questions_wrong_password_fails,
        test_post_review_unauthenticated_fails,
        test_post_review_as_student_forbidden,
        test_post_review_as_expert_succeeds,
        test_claim_certificate_unauthenticated_fails,
        test_claim_certificate_zero_progress_rejected,
        test_verify_certificate_does_not_leak_email,
        test_update_profile_rejects_xss_avatar,
        test_login_requires_captcha,
        test_captcha_replay_rejected,
        test_forgot_password_unknown_email_returns_dummy_without_leaking,
        test_is_plausible_hand_rejects_noise,
        test_recognize_sign_noise_returns_low_confidence,
        test_recognize_sign_namaste_rejects_hands_above_head,
        test_leaderboard_does_not_leak_emails,
        test_translate_gibberish_returns_no_match,
        test_social_login_google_and_github,
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
