import { useState } from "react"
import HeroOne from "@/components/ui/hero-01"
import { Button } from "@/components/ui/button"
import {
  Camera,
  Volume2,
  Sparkles,
  BookOpen,
  Award,
  Layers,
  ArrowRight,
  Languages,
  CheckCircle2,
  Search,
  ExternalLink,
  Info,
  Sliders,
  ShieldCheck,
  Zap,
} from "lucide-react"

// Types
interface ResearchPaper {
  id: number
  title: string
  year: number
  area: string
  venue: string
  summary: string
  link: string
  isPriority?: boolean
}

const RESEARCH_PAPERS: ResearchPaper[] = [
  {
    id: 1,
    title: "An Integrative Survey on Indian Sign Language Recognition and Translation",
    year: 2025,
    area: "ISL Research Survey",
    venue: "IET Image Processing (Wiley)",
    summary: "State-of-the-art review on datasets, spatial-temporal architectures, and systemic research gaps in Indian Sign Language recognition.",
    link: "https://ietresearch.onlinelibrary.wiley.com/doi/full/10.1049/ipr2.70000",
    isPriority: true,
  },
  {
    id: 2,
    title: "ISLTranslate: Dataset for Translating Indian Sign Language",
    year: 2023,
    area: "Continuous Dataset & Translation",
    venue: "ACL Findings 2023",
    summary: "Introduces a benchmark continuous ISL translation dataset containing ~31,000 ISL-English sentence/phrase pairs for sequence-to-sequence translation.",
    link: "https://aclanthology.org/2023.findings-acl.665/",
    isPriority: true,
  },
  {
    id: 3,
    title: "Gesture-to-Text: A Real-Time Indian Sign Language Translator with Pose Estimation and LSTMs",
    year: 2024,
    area: "Real-time Recognition",
    venue: "Procedia Computer Science (ScienceDirect)",
    summary: "Evaluates real-time webcam inference using MediaPipe landmark extraction combined with stacked bidirectional LSTM layers for rapid token prediction.",
    link: "https://www.sciencedirect.com/science/article/pii/S1877050924009293",
    isPriority: true,
  },
  {
    id: 4,
    title: "Dynamic Synthesis of Indian Sign Language: A Real-Time Procedural Animation Pipeline for Cross-Platform 3D Avatars",
    year: 2025,
    area: "3D Procedural Avatar",
    venue: "IEEE RCSM",
    summary: "Pioneering procedural HamNoSys and SiGML skeletal retargeting with facial blendshapes and forward kinematics on digital human avatars.",
    link: "https://doi.org/10.1109/RCSM67767.2025.11506655",
    isPriority: true,
  },
  {
    id: 5,
    title: "End-to-End Sentence-Level Indian Sign Language Translation with ISH-NEWS Dataset and Transformer Model",
    year: 2026,
    area: "Continuous Sentence Translation",
    venue: "Nature Scientific Reports",
    summary: "A milestone study introducing 4,222 continuous news broadcast videos (6,500+ words) trained with visual-language Transformers.",
    link: "https://www.nature.com/articles/s41598-026-60893-0",
    isPriority: true,
  },
  {
    id: 6,
    title: "Real-time Interpreter for Short Sentences in Indian Sign Language Using MediaPipe and Deep Learning",
    year: 2024,
    area: "Sentence Recognition",
    venue: "Information Technology and Control",
    summary: "Focuses on temporal segmentation and short-phrase recognition in live camera video streams.",
    link: "https://itc.ktu.lt/index.php/ITC/article/view/33935",
  },
  {
    id: 7,
    title: "A Natural Language Processing Approach to the Translation of Speech into Indian Sign Language",
    year: 2024,
    area: "Speech-to-Sign NLP",
    venue: "IEEE Conference",
    summary: "Maps spoken language syntactic parse trees into grammatical ISL topic-comment representations.",
    link: "https://ieeexplore.ieee.org/document/10515806/",
  },
  {
    id: 8,
    title: "Speak-to-Sign: A Real-Time NLP-Driven Framework for Indian Sign Language Translation: A Review",
    year: 2025,
    area: "NLP & Translation",
    venue: "Atlantis Press / Springer",
    summary: "Critical review of speech recognition models and rule-based versus neural machine translation for ISL synthesis.",
    link: "https://docker.atlantis-press.com/proceedings/icaaai-25/126012651",
  },
  {
    id: 9,
    title: "Bidirectional Indian Sign Language Converter",
    year: 2025,
    area: "Two-way Translation",
    venue: "IEEE NetACT",
    summary: "Proposes dual-channel bidirectional conversion framework between spoken English/Hindi audio and 3D visual gestures.",
    link: "https://doi.org/10.1109/NetACT65906.2025.11188187",
  },
  {
    id: 10,
    title: "Indian Sign Language Recognition and Translation into Odia",
    year: 2025,
    area: "Regional Language Translation",
    venue: "ACL WSLP Workshop",
    summary: "Groundbreaking work expanding ISL machine translation into eastern regional Indic languages (Odia script and phonetics).",
    link: "https://aclanthology.org/2025.wslp-main.2/",
  },
  {
    id: 11,
    title: "Word Level Sign Language Recognition Using MediaPipe and LSTM-GRU Network",
    year: 2024,
    area: "Deep Learning Architectures",
    venue: "IEEE Xplore",
    summary: "Compares parameter efficiency and inference latency between pure LSTM, GRU, and hybrid LSTM-GRU units for isolated words.",
    link: "https://ieeexplore.ieee.org/abstract/document/10884491",
  },
  {
    id: 12,
    title: "A Comprehensive Approach to Indian Sign Language Recognition Using LSTM and MediaPipe Holistic",
    year: 2025,
    area: "Gesture Recognition",
    venue: "EAI Endorsed Transactions on AI",
    summary: "Demonstrates high-accuracy landmark-based pose estimation across complex indoor illumination conditions.",
    link: "https://publications.eai.eu/index.php/airo/article/view/8693",
  },
  {
    id: 13,
    title: "HamNoSys to SiGML Conversion System for Sign Language Automation",
    year: 2016,
    area: "Sign Animation Foundations",
    venue: "Procedia Computer Science",
    summary: "Foundational notation mapping Hamburg Notation System (HamNoSys) symbols into Signing Gesture Markup Language (SiGML).",
    link: "https://www.sciencedirect.com/science/article/pii/S1877050916311280",
  },
  {
    id: 14,
    title: "A Survey on Recognition and Translation System of Real-Time Sign Language",
    year: 2024,
    area: "Recognition Research",
    venue: "IEEE IDICAI",
    summary: "Comparative analysis of vision sensors (RGB, RGB-D, depth) and edge deployment viability on mobile devices.",
    link: "https://doi.org/10.1109/idicaiei61867.2024.10842738",
  },
  {
    id: 15,
    title: "AI-Assisted Real-Time Multilingual Sign Language Translation Using 3D Avatars",
    year: 2025,
    area: "Multilingual Avatar",
    venue: "IEEE Xplore",
    summary: "Integrates multilingual text inputs with procedural avatar retargeting for universal accessibility.",
    link: "https://ieeexplore.ieee.org/abstract/document/11335634",
  },
  {
    id: 16,
    title: "A MediaPipe-Powered Model for Static Indian Sign Language Recognition",
    year: 2026,
    area: "Static Recognition",
    venue: "ScienceDirect Computers & Electrical Engineering",
    summary: "Benchmarking static single-frame manual alphabets and numeric signs using angle vectors and SVM/RandomForest classifiers.",
    link: "https://www.sciencedirect.com/science/article/pii/S1877050926019265",
  },
  {
    id: 17,
    title: "A Stacked LSTM Framework with MediaPipe Landmark Extraction for Dynamic ISL Recognition",
    year: 2026,
    area: "Dynamic Recognition",
    venue: "IEEE Transactions",
    summary: "Deep stacked LSTM recurrent architecture handling temporal dependencies in multi-second continuous ISL signs.",
    link: "https://ieeexplore.ieee.org/abstract/document/11724073",
  },
  {
    id: 18,
    title: "Real-Time Indian Sign Language Recognition and Speech Translation with Analytics Using MediaPipe and LSTM",
    year: 2026,
    area: "Recognition & Speech",
    venue: "IEEE Computing Publications",
    summary: "End-to-end user-facing pipeline incorporating real-time feedback analytics, confidence metrics, and text-to-speech rendering.",
    link: "https://ieeexplore.ieee.org/abstract/document/11708893",
  },
]

// Dataset Comparison Data
const DATASETS = [
  {
    name: "ISLTranslate",
    year: "ACL 2023",
    size: "31,000 sentence/phrase pairs",
    type: "Continuous ISL-English",
    signers: "Multiple broadcast signers",
    focus: "Transformer translation & continuous NLP",
    badge: "Continuous Benchmark",
  },
  {
    name: "ISH-NEWS",
    year: "Nature 2026",
    size: "4,222 videos / 6,500+ words",
    type: "Continuous sentence broadcast",
    signers: "Professional deaf news anchors",
    focus: "Sentence-level continuous video translation",
    badge: "State of the Art",
  },
  {
    name: "INCLUDE / INCLUDE-50",
    year: "2020",
    size: "4,292 video clips (263 words)",
    type: "Isolated sign words",
    signers: "7 signers (15 categories)",
    focus: "Vocabulary classification & pose estimation",
    badge: "Standard Isolated",
  },
  {
    name: "Amrita Real-Time ISL",
    year: "Mendeley Data",
    size: "50 common signs / 16 samples per class",
    type: "Camera & environment variations",
    signers: "7 signers",
    focus: "Mobile cameras, realistic indoor/outdoor lighting",
    badge: "Robustness Testing",
  },
  {
    name: "ISLRTC Govt Dictionary",
    year: "Official Govt Resource",
    size: "10,000 verified terms",
    type: "Educational & regional lexicon",
    signers: "Certified ISLRTC master interpreters",
    focus: "Legal, academic, administrative, daily life",
    badge: "Official Standard",
  },
]

// Sample Practice Words for Live Translator
const SAMPLE_PHRASES = [
  { isl: "नमस्ते (Namaste / Hello)", english: "Hello, nice to meet you", hindi: "नमस्ते, आपसे मिलकर खुशी हुई", gujarati: "નમસ્તે, તમને મળીને આનંદ થયો", conf: "99.1%" },
  { isl: "धन्यवाद (Thank You)", english: "Thank you very much", hindi: "बहुत बहुत धन्यवाद", gujarati: "ખૂબ ખૂબ આભાર", conf: "98.7%" },
  { isl: "તમારું નામ શું છે? (What is your name?)", english: "What is your name?", hindi: "आपका नाम क्या है?", gujarati: "તમારું નામ શું છે?", conf: "97.4%" },
  { isl: "હું એક વિદ્યાર્થી છું (I am a student)", english: "I am a university student", hindi: "मैं एक विश्वविद्यालय का छात्र हूँ", gujarati: "હું યુનિવર્સિટીનો વિદ્યાર્થી છું", conf: "98.2%" },
  { isl: "મદદ જોઈએ છે (Need Help)", english: "Do you need any assistance?", hindi: "क्या आपको सहायता चाहिए?", gujarati: "શું તમને કોઈ મદદની જરૂર છે?", conf: "99.4%" },
]

export default function App() {
  // Translator States
  const [translatorMode, setTranslatorMode] = useState<"sign-to-speech" | "speech-to-sign">("sign-to-speech")
  const [selectedPhrase, setSelectedPhrase] = useState(SAMPLE_PHRASES[0])
  const [targetLanguage, setTargetLanguage] = useState("gujarati")
  const [isCameraActive, setIsCameraActive] = useState(true)
  const [showMeshOverlay, setShowMeshOverlay] = useState(true)
  const [textToSignInput, setTextToSignInput] = useState("Good morning. My name is Tirth. I am a university student.")
  const [avatarSpeed, setAvatarSpeed] = useState("1.0x")
  const [isSpeaking, setIsSpeaking] = useState(false)

  // Learning Portal States
  const [learningTab, setLearningTab] = useState<"alphabets" | "numbers">("alphabets")
  const [selectedLetter, setSelectedLetter] = useState("A")
  const [selectedNumber, setSelectedNumber] = useState("1")

  // Research Lab Filter
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedAreaFilter, setSelectedAreaFilter] = useState("All")

  const filteredPapers = RESEARCH_PAPERS.filter((paper) => {
    const matchesSearch =
      paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      paper.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      paper.area.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = selectedAreaFilter === "All" || paper.area.includes(selectedAreaFilter)
    return matchesSearch && matchesFilter
  })

  // Multilingual Speech Synthesis simulator
  const handleSpeak = (text: string) => {
    setIsSpeaking(true)
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.95
      utterance.onend = () => setIsSpeaking(false)
      window.speechSynthesis.speak(utterance)
    } else {
      setTimeout(() => setIsSpeaking(false), 1500)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      
      {/* 1. Integrated Hero 01 Component with Header, HeroSection, BrandSlider */}
      <HeroOne />

      {/* 2. Live Sign Translator Studio Section */}
      <section id="live-translator" className="py-20 border-b border-border/50 bg-card/40">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col items-center text-center mb-12">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary border border-primary/20 mb-3">
              <Zap className="h-3.5 w-3.5" />
              <span>Real-Time Bi-Directional Engine</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Live Indian Sign Language Translator
            </h2>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-2xl">
              Break the communication divide with instant visual recognition and procedural sign generation across Indian spoken languages.
            </p>

            {/* Mode Switcher Tabs */}
            <div className="mt-8 inline-flex rounded-xl bg-muted/80 p-1.5 border border-border shadow-inner">
              <button
                onClick={() => setTranslatorMode("sign-to-speech")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  translatorMode === "sign-to-speech"
                    ? "bg-primary text-white shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Camera className="h-4 w-4" />
                <span>Sign ➔ Spoken Speech / Text</span>
              </button>
              <button
                onClick={() => setTranslatorMode("speech-to-sign")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  translatorMode === "speech-to-sign"
                    ? "bg-primary text-white shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Layers className="h-4 w-4" />
                <span>Speech / Text ➔ 3D ISL Avatar</span>
              </button>
            </div>
          </div>

          {/* MODE 1: SIGN TO SPEECH / TEXT */}
          {translatorMode === "sign-to-speech" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Live Camera Feed & Landmark Visualizer */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                <div className="relative aspect-video w-full rounded-2xl bg-slate-950 border border-border overflow-hidden shadow-2xl flex items-center justify-center">
                  
                  {isCameraActive ? (
                    <div className="relative w-full h-full">
                      <img
                        src="/assets/mediapipe_holistic.png"
                        alt="MediaPipe Landmark Feed"
                        className="w-full h-full object-cover"
                      />
                      {showMeshOverlay && (
                        <div className="absolute inset-0 pointer-events-none border-2 border-emerald-500/40 m-4 rounded-xl flex items-start justify-between p-3">
                          <span className="bg-emerald-950/80 text-emerald-400 font-mono text-[11px] px-2.5 py-1 rounded-md border border-emerald-600/60 backdrop-blur-md">
                            ● TRACKING: 468 Face + 42 Hand + 33 Pose
                          </span>
                          <span className="bg-slate-900/80 text-cyan-400 font-mono text-[11px] px-2 py-1 rounded-md border border-slate-700 backdrop-blur-md">
                            FPS: 59.8 | 16ms
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-muted-foreground gap-3 p-8">
                      <Camera className="h-12 w-12 text-muted-foreground/60" />
                      <p className="text-sm">Camera feed is currently paused.</p>
                      <Button size="sm" onClick={() => setIsCameraActive(true)}>Resume Tracking</Button>
                    </div>
                  )}

                  {/* Camera Bottom Bar */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 text-xs bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700"
                        onClick={() => setIsCameraActive(!isCameraActive)}
                      >
                        {isCameraActive ? "Pause Camera" : "Enable Camera"}
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className={`h-8 text-xs border border-slate-700 ${
                          showMeshOverlay ? "bg-cyan-900/60 text-cyan-300" : "bg-slate-900/80 text-slate-400"
                        }`}
                        onClick={() => setShowMeshOverlay(!showMeshOverlay)}
                      >
                        {showMeshOverlay ? "Hide Mesh Overlay" : "Show Mesh Overlay"}
                      </Button>
                    </div>
                    <span className="text-[10px] bg-slate-900/80 px-2 py-1 rounded font-mono text-emerald-400 border border-slate-700">
                      ON-DEVICE INFERENCE
                    </span>
                  </div>
                </div>

                {/* Gesture Quick Tester */}
                <div className="p-4 rounded-xl bg-card border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-muted-foreground">
                      Test Verified ISL Benchmark Gestures:
                    </span>
                    <span className="text-[11px] text-primary font-medium">Click to simulate sign detection</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {SAMPLE_PHRASES.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedPhrase(item)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          selectedPhrase.isl === item.isl
                            ? "bg-primary text-white border-primary shadow-sm"
                            : "bg-muted hover:bg-muted/80 text-foreground border-border"
                        }`}
                      >
                        {item.isl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Recognition Result & Multilingual Voice Output */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                <div className="p-6 rounded-2xl bg-card border border-border shadow-lg flex flex-col gap-5">
                  
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Recognition Engine Status
                      </span>
                    </div>
                    <span className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Confidence: {selectedPhrase.conf}
                    </span>
                  </div>

                  {/* Sign Recognized Card */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Recognized Sign (ISL Gloss)</label>
                    <div className="mt-1 text-2xl font-extrabold text-foreground tracking-tight">
                      {selectedPhrase.isl}
                    </div>
                  </div>

                  {/* Target Voice Language Selector */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                        <Languages className="h-3.5 w-3.5 text-primary" /> Target Voice & Translation:
                      </label>
                      <span className="text-[10px] text-muted-foreground font-mono">13 Indic Languages</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setTargetLanguage("gujarati")}
                        className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                          targetLanguage === "gujarati"
                            ? "bg-primary/10 text-primary border-primary"
                            : "bg-muted text-foreground border-border hover:bg-muted/80"
                        }`}
                      >
                        ગુજરાતી (Gujarati)
                      </button>
                      <button
                        onClick={() => setTargetLanguage("hindi")}
                        className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                          targetLanguage === "hindi"
                            ? "bg-primary/10 text-primary border-primary"
                            : "bg-muted text-foreground border-border hover:bg-muted/80"
                        }`}
                      >
                        हिन्दी (Hindi)
                      </button>
                      <button
                        onClick={() => setTargetLanguage("english")}
                        className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                          targetLanguage === "english"
                            ? "bg-primary/10 text-primary border-primary"
                            : "bg-muted text-foreground border-border hover:bg-muted/80"
                        }`}
                      >
                        English (EN)
                      </button>
                    </div>
                  </div>

                  {/* Spoken Text Translation Output */}
                  <div className="p-4 rounded-xl bg-muted/60 border border-border">
                    <div className="text-[11px] text-muted-foreground font-semibold mb-1">
                      {targetLanguage === "gujarati"
                        ? "ગુજરાતી અનુવાદ (Gujarati Translation):"
                        : targetLanguage === "hindi"
                        ? "हिन्दी अनुवाद (Hindi Translation):"
                        : "English Translation:"}
                    </div>
                    <div className="text-lg font-bold text-foreground">
                      {targetLanguage === "gujarati"
                        ? selectedPhrase.gujarati
                        : targetLanguage === "hindi"
                        ? selectedPhrase.hindi
                        : selectedPhrase.english}
                    </div>
                  </div>

                  {/* Speak Audio Button */}
                  <Button
                    size="lg"
                    className="w-full gap-2 text-white font-semibold shadow-md bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    onClick={() => {
                      const text =
                        targetLanguage === "gujarati"
                          ? selectedPhrase.gujarati
                          : targetLanguage === "hindi"
                          ? selectedPhrase.hindi
                          : selectedPhrase.english
                      handleSpeak(text)
                    }}
                  >
                    <Volume2 className={`h-5 w-5 ${isSpeaking ? "animate-bounce text-amber-300" : ""}`} />
                    <span>{isSpeaking ? "Speaking Audio Voice..." : "Speak Translation (AI Voice)"}</span>
                  </Button>

                  <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                    <Info className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>Continuous spatial-temporal feature matching via MediaPipe + Bi-LSTM Transformer.</span>
                  </div>

                </div>
              </div>

            </div>
          )}

          {/* MODE 2: SPEECH / TEXT TO 3D SIGN AVATAR */}
          {translatorMode === "speech-to-sign" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Input text & Grammar parsing */}
              <div className="lg:col-span-6 flex flex-col gap-4">
                <div className="p-6 rounded-2xl bg-card border border-border shadow-lg flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Spoken / Written Sentence Input
                    </span>
                    <span className="text-xs text-primary font-semibold">NLP Grammar Parser</span>
                  </div>

                  <textarea
                    rows={4}
                    value={textToSignInput}
                    onChange={(e) => setTextToSignInput(e.target.value)}
                    placeholder="Enter English, Hindi, or Gujarati sentence here..."
                    className="w-full rounded-xl border border-input bg-background p-3.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                  />

                  {/* Grammar decomposition visualization */}
                  <div className="p-4 rounded-xl bg-muted/60 border border-border text-xs flex flex-col gap-2">
                    <div className="flex items-center justify-between text-muted-foreground font-semibold">
                      <span>ISL Grammatical Syntax Reordering:</span>
                      <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400">Subject-Object-Verb (SOV) / Topic-Comment</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="bg-primary/10 text-primary border border-primary/20 px-2 py-1 rounded font-mono font-medium">
                        [TOPIC: Morning-Good]
                      </span>
                      <span className="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 px-2 py-1 rounded font-mono font-medium">
                        [NAME: T-I-R-T-H]
                      </span>
                      <span className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 px-2 py-1 rounded font-mono font-medium">
                        [ROLE: University-Student]
                      </span>
                      <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2 py-1 rounded font-mono font-medium">
                        [FACIAL: Friendly-Smile]
                      </span>
                    </div>
                  </div>

                  {/* Procedural Animation Controls */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2 text-xs">
                      <Sliders className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">Speed:</span>
                      {["0.5x", "1.0x", "1.5x"].map((speed) => (
                        <button
                          key={speed}
                          onClick={() => setAvatarSpeed(speed)}
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            avatarSpeed === speed ? "bg-primary text-white" : "bg-muted text-foreground"
                          }`}
                        >
                          {speed}
                        </button>
                      ))}
                    </div>

                    <Button size="sm" className="gap-1.5 bg-primary text-white">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Synthesize 3D Signs</span>
                    </Button>
                  </div>
                </div>

                {/* SiGML / HamNoSys Code Preview */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-mono text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-[11px] text-slate-400">
                    <span>Generated SiGML XML Representation</span>
                    <span className="text-cyan-400">Forward Kinematics Pipeline</span>
                  </div>
                  <pre className="mt-2 text-[11px] text-emerald-400 overflow-x-auto whitespace-pre leading-relaxed">
{`<sigml>
  <hns_sign gloss="NAMASTE">
    <sign_manual both_hands="true">
      <handconfig handshape="flat" thumbpos="touch"/>
      <location_bodyarm contact="touch" location="chest"/>
    </sign_manual>
    <sign_nonmanual>
      <facial_expr blendshape="smile_gentle" intensity="0.8"/>
      <head_movement tilt="forward_nod" frames="15"/>
    </sign_nonmanual>
  </hns_sign>
</sigml>`}
                  </pre>
                </div>
              </div>

              {/* Right Column: 3D Avatar Rendering Canvas */}
              <div className="lg:col-span-6 flex flex-col gap-4">
                <div className="relative aspect-square sm:aspect-[4/3] w-full rounded-2xl bg-slate-950 border border-border overflow-hidden shadow-2xl flex items-center justify-center">
                  <img
                    src="/assets/avatar_expressions.png"
                    alt="3D Digital Human Signing Avatar"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent pointer-events-none" />

                  {/* Avatar Overlay Info */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white">
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-cyan-300">Digital Human Signer: Anya</span>
                      <span className="text-[11px] text-slate-400">Blender / Three.js Rigged with 52 Facial Blendshapes</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-mono border border-emerald-800">
                        {avatarSpeed} Active
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground px-2">
                  <span>Linguistic verification: Avoids word-by-word substitution</span>
                  <a href="#avatar-studio" className="text-primary font-medium hover:underline flex items-center gap-1">
                    Explore Avatar Studio <ArrowRight className="h-3 w-3" />
                  </a>
                </div>
              </div>

            </div>
          )}

        </div>
      </section>

      {/* 3. 3D Digital Human Avatar Studio Section */}
      <section id="avatar-studio" className="py-20 border-b border-border/50 bg-background">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6 flex flex-col items-start">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 mb-3">
                <Layers className="h-3.5 w-3.5" />
                <span>Photorealistic Human Synthesis</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Why Realistic Digital Humans Matter in Sign Language
              </h2>
              <p className="mt-4 text-muted-foreground text-sm sm:text-base leading-relaxed">
                Sign language is not merely hand movements. In Indian Sign Language, over <strong className="text-foreground">30% of grammatical meaning</strong> (questions, negations, intensity, emotions) is communicated through <em>non-manual markers</em>: eye gaze, eyebrow raising, cheek puffing, and head tilt.
              </p>

              <div className="mt-6 space-y-3.5 w-full">
                <div className="p-3.5 rounded-xl bg-card border border-border flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500 shrink-0 mt-0.5">
                    ✕
                  </div>
                  <div>
                    <div className="text-xs font-bold text-foreground">Why Stick & Cartoon Figures Fail</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Lacks finger joint depth, facial expression nuances, shoulder biomechanics, causing misinterpretation for deaf signers.
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-card border border-border flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <div className="text-xs font-bold text-foreground">BharatSign Procedural Avatar Architecture</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Complete human anatomy with 52 ARKit-compatible facial blendshapes, forward kinematics (FK/IK), realistic wrist rotations, and smooth temporal co-articulation.
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center gap-3">
                <Button className="gap-2 bg-primary text-white font-semibold">
                  <Sliders className="h-4 w-4" />
                  <span>Customize Avatar Model</span>
                </Button>
                <Button variant="outline" className="gap-2">
                  <span>Read Procedural Animation Paper</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </div>

            </div>

            {/* Right Column: Avatar Expression Matrix Showcase */}
            <div className="lg:col-span-6">
              <div className="rounded-2xl border border-border/80 bg-card p-3 shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between pb-3 px-2 border-b border-border">
                  <span className="text-xs font-bold text-foreground">
                    Non-Manual Marker Blendshapes & Expressions
                  </span>
                  <span className="text-[11px] font-mono text-cyan-500">IEEE RCSM 2025 Pipeline</span>
                </div>
                <div className="mt-2 rounded-xl overflow-hidden aspect-[4/3] bg-slate-950">
                  <img
                    src="/assets/avatar_expressions.png"
                    alt="Facial blendshapes of sign avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="mt-3 grid grid-cols-4 gap-2 text-center text-[10px] text-muted-foreground">
                  <div className="p-1.5 rounded bg-muted/60">Interrogative (Wh-?)</div>
                  <div className="p-1.5 rounded bg-muted/60">Affirmative (Yes)</div>
                  <div className="p-1.5 rounded bg-muted/60">Negation (Head Shake)</div>
                  <div className="p-1.5 rounded bg-muted/60">Surprise / Emotion</div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 4. ISL Learning Portal Aligned with Govt ISLRTC Standard */}
      <section id="learning-portal" className="py-20 border-b border-border/50 bg-card/30">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col items-center text-center mb-12">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary border border-primary/20 mb-3">
              <BookOpen className="h-3.5 w-3.5" />
              <span>ISLRTC & DIKSHA Certified Standard</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Interactive Indian Sign Language Learning Academy
            </h2>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-2xl">
              Master official ISLRTC Indian Sign Language curriculum from foundations (English Alphabets A-Z and Numbers 0-9) to conversational fluency with AI-guided camera feedback.
            </p>

            {/* Sub-Tabs: Alphabets vs Numbers */}
            <div className="mt-6 inline-flex rounded-xl bg-muted p-1 border border-border">
              <button
                onClick={() => setLearningTab("alphabets")}
                className={`px-6 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  learningTab === "alphabets"
                    ? "bg-background text-primary shadow-sm font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                English Alphabets in ISL (A to Z)
              </button>
              <button
                onClick={() => setLearningTab("numbers")}
                className={`px-6 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  learningTab === "numbers"
                    ? "bg-background text-primary shadow-sm font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Numbers in ISL (0 to 9)
              </button>
            </div>
          </div>

          {/* TAB 1: ALPHABETS (A-Z) */}
          {learningTab === "alphabets" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Official ISLRTC Chart Reference */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                <div className="p-4 rounded-2xl bg-card border border-border shadow-xl">
                  <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground">
                        भारतीय सांकेतिक भाषा मे अंग्रेजी अक्षर (ISLRTC Official Chart)
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded font-mono">
                      Ministry of Social Justice & Empowerment
                    </span>
                  </div>

                  {/* ISLRTC Official Chart Display */}
                  <div className="rounded-xl overflow-hidden border border-border/80 bg-white shadow-inner max-h-[500px] overflow-y-auto">
                    <img
                      src="/assets/isl_alphabets.png"
                      alt="ISLRTC English Alphabets in Indian Sign Language Chart"
                      className="w-full h-auto object-contain"
                    />
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Note: Most ISL alphabets require distinct two-handed coordination.</span>
                    <span className="text-primary font-medium">Standardized National Alphabet</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive Letter Selector & Camera Practice Room */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                <div className="p-6 rounded-2xl bg-card border border-border shadow-xl flex flex-col gap-5">
                  
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Alphabet Practice Selector
                    </span>
                    <span className="text-xs font-mono font-bold text-primary">Selected: Letter '{selectedLetter}'</span>
                  </div>

                  {/* 26 Letter Button Grid */}
                  <div className="grid grid-cols-6 sm:grid-cols-7 gap-1.5">
                    {Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ").map((char) => (
                      <button
                        key={char}
                        onClick={() => setSelectedLetter(char)}
                        className={`h-9 rounded-lg font-bold text-xs transition-all ${
                          selectedLetter === char
                            ? "bg-primary text-white shadow-md scale-105"
                            : "bg-muted text-foreground hover:bg-muted/80 border border-border"
                        }`}
                      >
                        {char}
                      </button>
                    ))}
                  </div>

                  {/* Letter Details Card */}
                  <div className="p-4 rounded-xl bg-muted/60 border border-border flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white font-black text-2xl shadow-md">
                      {selectedLetter}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-foreground">
                        ISL Sign for Letter "{selectedLetter}"
                      </span>
                      <span className="text-xs text-muted-foreground mt-0.5">
                        {selectedLetter === "A"
                          ? "Both hands in fist with thumbs upright touching at the tip."
                          : selectedLetter === "B"
                          ? "Both hands with index and thumbs forming two touching circles."
                          : selectedLetter === "C"
                          ? "Curved fingers forming a C-shape with dominant hand."
                          : "Refer to the official ISLRTC demonstration chart on the left."}
                      </span>
                    </div>
                  </div>

                  {/* Live Camera Practice AI Evaluation */}
                  <div className="p-4 rounded-xl bg-slate-950 text-white border border-slate-800 flex flex-col gap-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-cyan-300 flex items-center gap-1.5">
                        <Camera className="h-3.5 w-3.5" /> AI Pose Match Feedback
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                        Accuracy: 96.5%
                      </span>
                    </div>

                    <div className="text-xs text-slate-300">
                      Show both hands clearly in view of your camera. Maintain knuckle alignment.
                    </div>

                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full w-[96.5%]" />
                    </div>

                    <Button size="sm" className="w-full gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Validate Letter "{selectedLetter}" via Webcam</span>
                    </Button>
                  </div>

                </div>
              </div>

            </div>
          )}

          {/* TAB 2: NUMBERS (0-9) */}
          {learningTab === "numbers" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Official Numbers Chart */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                <div className="p-4 rounded-2xl bg-card border border-border shadow-xl">
                  <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
                    <span className="text-xs font-bold text-foreground">
                      सांकेतिक भाषा मे अंक — Numbers in Indian Sign Language (Govt of India)
                    </span>
                    <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded font-mono">
                      ISLRTC Standard 1–0
                    </span>
                  </div>

                  <div className="rounded-xl overflow-hidden border border-border/80 bg-white shadow-inner max-h-[500px] overflow-y-auto">
                    <img
                      src="/assets/isl_numbers.png"
                      alt="Numbers in Indian Sign Language Official Chart"
                      className="w-full h-auto object-contain"
                    />
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Note: One-handed finger configurations indicating 1, 2, 3, 4, 5, 6, 7, 8, 9, 0.</span>
                    <span className="text-primary font-medium">ISLRTC Certified</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive Number Selector */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                <div className="p-6 rounded-2xl bg-card border border-border shadow-xl flex flex-col gap-5">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Number Practice Selector
                    </span>
                    <span className="text-xs font-mono font-bold text-primary">Selected Digit: {selectedNumber}</span>
                  </div>

                  <div className="grid grid-cols-5 gap-2">
                    {["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"].map((num) => (
                      <button
                        key={num}
                        onClick={() => setSelectedNumber(num)}
                        className={`h-11 rounded-xl font-bold text-sm transition-all ${
                          selectedNumber === num
                            ? "bg-primary text-white shadow-md scale-105"
                            : "bg-muted text-foreground hover:bg-muted/80 border border-border"
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>

                  <div className="p-4 rounded-xl bg-muted/60 border border-border flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white font-black text-2xl shadow-md">
                      {selectedNumber}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-foreground">
                        Digit {selectedNumber} in Indian Sign Language
                      </span>
                      <span className="text-xs text-muted-foreground mt-0.5">
                        {selectedNumber === "1"
                          ? "Index finger extended vertically, thumb and other fingers closed."
                          : selectedNumber === "2"
                          ? "Index and middle fingers extended upward (V shape)."
                          : selectedNumber === "6"
                          ? "Pinky finger extended upward with thumb over closed fingers."
                          : selectedNumber === "0"
                          ? "O-shape formed with thumb touching finger tips."
                          : "Refer to the hand posture diagram on the chart."}
                      </span>
                    </div>
                  </div>

                  <Button size="lg" className="gap-2 bg-primary text-white font-semibold">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Practice Digit {selectedNumber} with Camera</span>
                  </Button>

                </div>
              </div>

            </div>
          )}

        </div>
      </section>

      {/* 5. Research Laboratory & Academic Benchmarks */}
      <section id="research-lab" className="py-20 border-b border-border/50 bg-background">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col items-center text-center mb-12">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary border border-primary/20 mb-3">
              <Award className="h-3.5 w-3.5" />
              <span>International Literature & Dataset Compendium</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Research Laboratory & 18 Peer-Reviewed Publications
            </h2>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-2xl">
              A comprehensive survey of datasets, algorithms, and models forming the empirical foundation of the BharatSign-Bridge ecosystem.
            </p>
          </div>

          {/* Dataset Benchmark Table */}
          <div className="mb-14 rounded-2xl border border-border bg-card p-6 shadow-xl overflow-hidden">
            <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
              <span className="text-sm font-bold text-foreground">
                Benchmark Indian Sign Language Datasets Evaluated
              </span>
              <span className="text-xs text-muted-foreground font-mono">5 Major Corpora</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border/70 text-muted-foreground font-semibold">
                    <th className="py-2.5 px-3">Dataset Name</th>
                    <th className="py-2.5 px-3">Year / Venue</th>
                    <th className="py-2.5 px-3">Corpus Scale</th>
                    <th className="py-2.5 px-3">Signers & Setting</th>
                    <th className="py-2.5 px-3">Primary Focus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {DATASETS.map((ds, idx) => (
                    <tr key={idx} className="hover:bg-muted/40 transition-colors">
                      <td className="py-3 px-3 font-bold text-foreground flex items-center gap-2">
                        <span>{ds.name}</span>
                        <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.2 rounded font-mono font-medium">
                          {ds.badge}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-muted-foreground">{ds.year}</td>
                      <td className="py-3 px-3 font-mono font-medium text-foreground">{ds.size}</td>
                      <td className="py-3 px-3 text-muted-foreground">{ds.signers}</td>
                      <td className="py-3 px-3 text-muted-foreground">{ds.focus}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Research Publications Search & Filter */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search 18 papers, authors, venues..."
                className="w-full rounded-xl border border-input bg-card pl-9 pr-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
              />
            </div>

            <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
              {["All", "Dataset", "Survey", "Real-time", "3D Procedural", "Continuous"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedAreaFilter(filter)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    selectedAreaFilter === filter
                      ? "bg-primary text-white shadow-sm"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Research Paper Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPapers.map((paper) => (
              <div
                key={paper.id}
                className={`p-5 rounded-2xl border bg-card/60 backdrop-blur-sm transition-all hover:shadow-xl hover:border-primary/50 flex flex-col justify-between ${
                  paper.isPriority ? "border-primary/40 ring-1 ring-primary/20 shadow-md" : "border-border"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                      {paper.area}
                    </span>
                    <span className="text-[11px] font-mono text-muted-foreground">{paper.year}</span>
                  </div>

                  <h3 className="text-sm font-bold text-foreground leading-snug line-clamp-2">
                    {paper.title}
                  </h3>

                  <p className="mt-1 text-[11px] font-semibold text-muted-foreground">
                    Venue: {paper.venue}
                  </p>

                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                    {paper.summary}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                  {paper.isPriority && (
                    <span className="text-[10px] font-bold text-amber-500 flex items-center gap-1">
                      ★ Core Reference
                    </span>
                  )}
                  <a
                    href={paper.link}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    <span>Read Paper</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 6. Technical Architecture & Research Contributions */}
      <section className="py-20 border-b border-border/50 bg-card/20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col items-center text-center mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight">
              Novel Academic Contributions of BharatSign-Bridge
            </h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-xl">
              Formulated for presentation at international computational linguistics and computer vision conferences (ACL, CVPR, Interspeech).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-card border border-border shadow-md flex flex-col gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Languages className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-foreground">
                1. Multilingual Indic Transfer
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Accepts spoken audio in 13 Indian regional languages (Gujarati, Marathi, Odia, Bengali, Tamil, etc.), parsing deep semantic parse trees directly into ISL topic-comment grammar.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border shadow-md flex flex-col gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <Layers className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-foreground">
                2. Non-Manual Marker Synthesis
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Procedurally controls 52 facial blendshapes and head movements synchronized with SiGML skeletal kinematics, resolving the linguistic void left by ordinary cartoon avatars.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border shadow-md flex flex-col gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-foreground">
                3. Continuous Sentence Evaluation
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Evaluates real-time video against the newly established ISH-NEWS and ISLTranslate benchmarks, testing cross-signer variance, lighting, and independent signer generalizability.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 7. Footer */}
      <footer className="border-t border-border bg-card py-12">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white font-black text-sm">
                  BS
                </div>
                <span className="text-lg font-bold text-foreground">
                  BharatSign<span className="text-primary font-black">Bridge</span>
                </span>
              </div>
              <p className="text-xs text-muted-foreground max-w-md leading-relaxed">
                An open research-oriented AI platform dedicated to bridging the communication barrier between deaf and hearing communities across India through state-of-the-art vision, speech, and avatar technologies.
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                <span>Aligned with:</span>
                <span className="font-semibold text-foreground">ISLRTC • Govt of India • ACL Anthology</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 text-xs">
              <span className="font-bold text-foreground mb-1">Platform Modules</span>
              <a href="#live-translator" className="text-muted-foreground hover:text-primary">Sign-to-Speech Engine</a>
              <a href="#live-translator" className="text-muted-foreground hover:text-primary">Text-to-Sign Avatar</a>
              <a href="#avatar-studio" className="text-muted-foreground hover:text-primary">Digital Human Studio</a>
              <a href="#learning-portal" className="text-muted-foreground hover:text-primary">ISL Academy (A-Z & 0-9)</a>
            </div>

            <div className="flex flex-col gap-2 text-xs">
              <span className="font-bold text-foreground mb-1">Research & Datasets</span>
              <a href="#research-lab" className="text-muted-foreground hover:text-primary">18 Publications Survey</a>
              <a href="#research-lab" className="text-muted-foreground hover:text-primary">ISLTranslate (ACL 2023)</a>
              <a href="#research-lab" className="text-muted-foreground hover:text-primary">ISH-NEWS (Nature 2026)</a>
              <a href="#research-lab" className="text-muted-foreground hover:text-primary">ISLRTC 10k Dictionary</a>
            </div>
          </div>

          <div className="border-t border-border/60 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-3">
            <span>© 2026 BharatSign-Bridge Ecosystem. All Rights Reserved.</span>
            <span>Developed for University Demonstrations & International AI Research Conferences.</span>
          </div>
        </div>
      </footer>

    </div>
  )
}
