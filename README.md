# BharatSign Bridge 2.0 🇮🇳
### Multimodal Indian Sign Language Recognition, 3D Procedural Avatar Kinematics & Inclusive AI Translation

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20TypeScript-61DAFB.svg?logo=react&logoColor=black)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/3D%20Kinematics-Three.js-000000.svg?logo=threedotjs&logoColor=white)](https://threejs.org/)
[![Security Audit](https://img.shields.io/badge/Security%20Tests-21%2F21%20Passing-brightgreen.svg)]()
[![ISLRTC Aligned](https://img.shields.io/badge/Standard-ISLRTC%20%26%20MSJE-orange.svg)]()

---

## 🌟 Overview

**BharatSign Bridge 2.0** is an open-source, academic and research-oriented communication platform designed to bridge the accessibility gap for an estimated 18 million deaf and hard-of-hearing individuals across the Indian subcontinent.

The platform provides:
1. **Interactive 3D Avatar Presenters**: Biomechanically rigged avatars supporting dual-hand coordinated postures, realistic finger articulation (DIP/PIP/MCP), facial non-manual expressions, and customizable South Asian skin tones and traditional attires.
2. **Real-Time Computer Vision Sensor**: MediaPipe-based landmark extraction and heuristic kinematic filters running client-side at 60 FPS.
3. **Multilingual Speech & Text Translation**: Supporting 13 official Indian languages (English, Hindi, Gujarati, Marathi, Bengali, Tamil, Telugu, Kannada, Malayalam, Punjabi, Odia, Assamese, Urdu) with native acoustic synthesis.
4. **Official ISLRTC Curriculum**: Step-by-step interactive lessons covering 26 alphabets (standardized two-handed and one-handed rules), 10 MSJE digits (0–9), and 48+ core lexical vocabulary signs.

---

## 🔒 Enterprise Cybersecurity & Authentication

BharatSign Bridge incorporates hardened defense-in-depth security:

- **Cryptographic JWT Sessions**: Signed HMAC-SHA256 tokens required on all mutation endpoints (`/api/auth/sync-progress`, `/api/reviews`, `/api/certificates/claim`, `/api/auth/security-questions/*`).
- **Account Takeover Prevention**: Security question setup and updates strictly require an authenticated active session and current password verification.
- **Dual-Axis Login Brute-Force Rate Limiting**: Dual tracker by client IP (`ip:<ip>` max 15) and targeted account (`acc:<email>` max 5) with automatic 15-minute lockout.
- **Single-Use Mathematical Captcha**: Nonce-bound single-use challenge tokens loaded with server-side secrets preventing automated replay attacks.
- **Anti-Enumeration Safeguards**: Generic, unified credential rejection messages and deterministic dummy security challenges for unregistered emails.
- **Zero Public Data Leaks**: Removed vulnerable bulk user dump endpoints; public certificate verification returns verified badges omitting private emails; public leaderboard displays scores without email harvesting risks.
- **Hashed Token Storage**: Password recovery tokens and security answers stored exclusively via SHA-256 and bcrypt hashes.

---

## 🤖 ML Architecture & Model Evaluation

The system utilizes an ensemble approach combining geometric bone-ratio validation and sequence classification:

- **Kinematic Plausibility Gate (`is_plausible_hand`)**: Validates metacarpal-to-phalangeal bone length ratios and palm bounding scale before feeding coordinates to the classifier, rejecting random noise or non-hand occlusions.
- **Chest-Elevation Constraints**: Enforces anatomical height limits for two-handed postures like `NAMASTE` and `LETTER_A`.
- **Empirical Baseline Accuracy (Documented on Synthetic Corpus)**:
  - **Dynamic Gesture Sequences (Model B)**: 58.3% top-1 accuracy (58.5% F1-score)
  - **Static Handshapes (Model A, 36 classes)**: 49.5% top-1 accuracy (49.5% F1-score)
  - Real-time client-side frame processing latency: ~24–38 ms.

---

## 🚀 Quickstart & Setup

### 1. Prerequisites
- **Node.js**: v18+ and `npm`
- **Python**: v3.10+ (tested with Python 3.12 / 3.14)

### 2. Frontend Setup
```bash
# Install dependencies
npm install

# Run Vite development server
npm run dev
```
The frontend starts at `http://localhost:5173`.

### 3. Backend Setup
```bash
# Install backend dependencies
pip install -r requirements.txt

# Start FastAPI application
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
The FastAPI backend runs at `http://127.0.0.1:8000`.

---

## 🧪 Security & Model Test Suite

To run the comprehensive 21-test security and ML verification suite:

```bash
python backend/tests/test_security_audit.py
```

### Verified Test Cases:
- `[PASS]` `test_sync_progress_unauthenticated_fails`
- `[PASS]` `test_sync_progress_authenticated_succeeds`
- `[PASS]` `test_sync_progress_negative_numbers_rejected`
- `[PASS]` `test_get_users_endpoint_removed`
- `[PASS]` `test_setup_security_questions_unauthenticated_fails`
- `[PASS]` `test_setup_security_questions_wrong_password_fails`
- `[PASS]` `test_post_review_unauthenticated_fails`
- `[PASS]` `test_post_review_as_student_forbidden`
- `[PASS]` `test_post_review_as_expert_succeeds`
- `[PASS]` `test_claim_certificate_unauthenticated_fails`
- `[PASS]` `test_claim_certificate_zero_progress_rejected`
- `[PASS]` `test_verify_certificate_does_not_leak_email`
- `[PASS]` `test_update_profile_rejects_xss_avatar`
- `[PASS]` `test_login_requires_captcha`
- `[PASS]` `test_captcha_replay_rejected`
- `[PASS]` `test_forgot_password_unknown_email_returns_dummy_without_leaking`
- `[PASS]` `test_is_plausible_hand_rejects_noise`
- `[PASS]` `test_recognize_sign_noise_returns_low_confidence`
- `[PASS]` `test_recognize_sign_namaste_rejects_hands_above_head`
- `[PASS]` `test_leaderboard_does_not_leak_emails`
- `[PASS]` `test_translate_gibberish_returns_no_match`

---

## 📜 Citation & Research

If you use or reference BharatSign Bridge in your research, please cite our open preprint technical report:

```bibtex
@misc{bharatsign_bridge_2026,
  title={BharatSign Bridge 2.0: Multimodal Indian Sign Language Recognition, 3D Procedural Avatar Kinematics, and Multilingual Acoustic Synthesis},
  author={Tirth and Prasham and Ayush and Smit and Dhruvi and Jignyasa},
  year={2026},
  howpublished={Preprint / Technical Report},
  note={Indian Sign Language AI Open Research Project, https://github.com/tladani395-hub/BharatSign-Bridge}
}
```

---

## 🤝 License
This project is open-source under the MIT License. Aligned with Indian Sign Language Research and Training Centre (ISLRTC) and MSJE educational guidelines.
