# BharatSign-Bridge (ભારતસાઇન-બ્રિજ / भारतसाइन-ब्रिज)
## Research & Development Blueprint: Indian Sign Language AI Ecosystem

> **Platform Vision:** An open, research-grade, AI-powered Indian Sign Language (ISL) communication, translation, and education platform combining real-time MediaPipe holistic landmark tracking, bidirectional multilingual Indic speech translation, photorealistic 3D digital human avatars with facial blendshapes, and an ISLRTC-standard certified interactive learning academy.

---

## 1. Executive Summary & Research Value Proposition

Existing sign language applications predominantly rely on isolated-sign classification (e.g., recognizing single static letters A-Z) or cartoon avatars that lack non-manual markers. In natural Indian Sign Language (ISL):
1. **Linguistic Autonomy:** ISL is a natural language with distinct grammar (Topic-Comment / Subject-Object-Verb), non-manual markers, and spatial indexing—not a signed cipher of spoken English or Hindi.
2. **Non-Manual Markers (30%+ of meaning):** Grammatical structures such as questions (Wh- vs polar), negation, assertion, and emotion are conveyed via facial blendshapes (eyebrow raise, squint, cheek puff), head tilts, and shoulder movements.
3. **Multilingual India:** Translating ISL requires bridging over 13 official Indian spoken languages (Hindi, Gujarati, Marathi, Bengali, Tamil, Telugu, Odia, etc.) into unified ISL grammatical syntax.

**BharatSign-Bridge** addresses these fundamental scientific gaps by integrating modern benchmark corpora (**ISLTranslate ACL 2023**, **ISH-NEWS Nature 2026**, **INCLUDE**, **ISLRTC 10k Dictionary**) into an end-to-end procedural and neural pipeline.

---

## 2. Core Architectural Modules

```
                          ┌───────────────────────────┐
                          │   Camera / Video Stream   │
                          └─────────────┬─────────────┘
                                        │
                                        ▼
                          ┌───────────────────────────┐
                          │  MediaPipe Holistic Vision │
                          │ 468 Face + 42 Hand + 33   │
                          │        Pose Joints        │
                          └─────────────┬─────────────┘
                                        │
                                        ▼
                          ┌───────────────────────────┐
                          │ Spatial-Temporal PyTorch  │
                          │ Bi-LSTM / Spatio-Temporal │
                          │        Transformer        │
                          └─────────────┬─────────────┘
                                        │
                                        ▼
                          ┌───────────────────────────┐
                          │ ISL Gloss Sequence Parser │
                          └─────────────┬─────────────┘
                                        │
                    ┌───────────────────┴───────────────────┐
                    ▼                                       ▼
       ┌────────────────────────┐              ┌────────────────────────┐
       │ Multilingual Indic NMT │              │ Procedural 3D Avatar   │
       │ (13 Spoken Languages)  │              │ (HamNoSys / SiGML XML) │
       └────────────┬───────────┘              └───────────┬────────────┘
                    │                                      │
                    ▼                                      ▼
       ┌────────────────────────┐              ┌────────────────────────┐
       │ Multilingual Speech    │              │ Three.js WebGL Engine  │
       │ Synthesis (TTS Audio)  │              │ (52 Blendshapes + FK)  │
       └────────────────────────┘              └────────────────────────┘
```

### Module 1: Live Sign Recognition & Translation (Camera ➔ Speech / Text)
- **Landmark Extraction:** On-device MediaPipe Holistic pipeline extracting 543 total landmarks (21 per hand, 33 body pose, 468 facial mesh).
- **Temporal Modeling:** Bi-directional LSTM with attention and spatial-temporal graph convolutional networks (ST-GCN) tracking movement velocity and articulation arcs.
- **Multilingual Speech Synthesis:** Real-time synthesis into Gujarati, Hindi, Marathi, Bengali, Tamil, Telugu, and English via Indic-TTS / Web Speech API.

### Module 2: Text / Speech to 3D Sign Avatar (Speech / Text ➔ Avatar)
- **Grammar Transformation:** Rule-augmented transformer converting SVO/SOV spoken sentence syntax into ISL Topic-Comment structure with non-manual markers.
- **Notation Mapping:** Gloss tokens mapped to HamNoSys (Hamburg Notation System) and procedural SiGML (Signing Gesture Markup Language) XML streams.
- **Realistic Digital Human Character:**
  - 52 ARKit-compatible facial blendshapes (mouth shapes, eyebrow raising, eye gaze).
  - Forward kinematics (FK) and Inverse kinematics (IK) for precise finger joint articulation and wrist pronation/supination.
  - Three.js / WebGL hardware-accelerated rendering at 60 FPS.

### Module 3: ISL Interactive Learning Academy
- **ISLRTC National Standard:** Integrated official Government of India (Ministry of Social Justice & Empowerment) curricula:
  - **English Alphabets in ISL (A to Z):** Two-handed postural representations.
  - **Numbers in ISL (0 to 9):** One-handed numeric finger configurations.
- **AI Camera Practice Room:** Live Euclidean and cosine landmark matching providing instant joint-alignment feedback to learners.

### Module 4: Research Laboratory & Benchmarks
- Interactive review and indexing of **18 peer-reviewed research publications** (2016–2026).
- Evaluation matrix across 5 major corpora (**ISLTranslate, ISH-NEWS, INCLUDE, Amrita SLR, ISLRTC Dictionary**).

---

## 3. Technology Stack & Directory Structure

```
d:/BharatSign-Bridge/
├── components.json                 # shadcn UI registry and configuration
├── package.json                    # Vite, React 19, Tailwind, Radix UI dependencies
├── tailwind.config.js              # Theme tokens, cyan/indigo/navy palette, keyframes
├── tsconfig.app.json               # Path aliases (@/* -> ./src/*)
├── vite.config.ts                  # Vite build config with path resolver
├── public/
│   └── assets/                     # Real research diagram and chart assets
│       ├── avatar_expressions.png  # 3D Avatar blendshapes & emotional expressions
│       ├── hand_landmarks_3d.png   # 3D hand skeleton coordinate axes & graph
│       ├── mediapipe_holistic.png  # Webcam MediaPipe holistic face & hand landmarks
│       ├── isl_alphabets.png       # Official ISLRTC English Alphabets A-Z chart
│       └── isl_numbers.png         # Official ISLRTC Numbers 1-0 chart
├── components/ui/                  # Mirrored root shadcn components
└── src/
    ├── components/ui/
    │   ├── button.tsx              # Radix UI Slot Button with CVA variants
    │   ├── sheet.tsx               # Radix Dialog mobile navigation drawer
    │   ├── input.tsx               # Controlled input component
    │   ├── label.tsx               # Accessible form label
    │   ├── navigation-menu.tsx     # Radix Navigation Menu component
    │   ├── hero-01.tsx             # BharatSign-Bridge Agency Hero integration
    │   ├── demo.tsx                # HeroOne demo wrapper
    │   └── hero-01-utils/
    │       ├── header.tsx          # Responsive Header with language selector
    │       ├── hero.tsx            # HeroSection with visual interactive tabs
    │       └── brand-slider.tsx    # Academic datasets & benchmarks marquee
    ├── lib/
    │   └── utils.ts                # cn utility (clsx + twMerge)
    ├── App.tsx                     # Complete interactive platform
    └── index.css                   # Tailwind base directives and HSL variables
```

---

## 4. Academic Publication & Conference Roadmap

| Target Venue | Target Track | Novel Contribution |
|---|---|---|
| **ACL / EMNLP** | Machine Translation / Multimodal | Multilingual Indic speech-to-ISL grammatical synthesis using continuous ISLTranslate pairs. |
| **CVPR / ICCV** | Vision for Social Good / Gesture | Real-time cross-signer generalization on ISH-NEWS continuous video benchmark. |
| **Interspeech** | Speech & Sign Multimodal Interface | Bi-directional voice-to-sign pipeline evaluated with deaf university students. |
