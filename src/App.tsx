import { useState } from "react"
import HeroOne from "@/components/ui/hero-01"
import CameraTranslator from "@/components/translator/CameraTranslator"
import ThreeAvatar from "@/components/avatar/ThreeAvatar"
import LiveConversationRoom from "@/components/conversation/LiveConversationRoom"
import SignCreatorStudio from "@/components/creator/SignCreatorStudio"
import LearningPortal from "@/components/learning/LearningPortal"
import SignDictionary from "@/components/dictionary/SignDictionary"
import { INDIC_LANGUAGES, speakText } from "@/lib/speech"
import {
  Sparkles,
  Layers,
  MessageSquare,
  BookOpen,
  Search,
  Zap,
  Globe2,
} from "lucide-react"

export default function App() {
  const [globalLanguage, setGlobalLanguage] = useState<string>("gu") // Default to Gujarati
  const [avatarGesture, setAvatarGesture] = useState<string>("NAMASTE")

  const currentLangObj = INDIC_LANGUAGES.find((l) => l.code === globalLanguage) || INDIC_LANGUAGES[0]

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      
      {/* 1. Hero 01 Component with Header and Brands */}
      <HeroOne />

      {/* Global Language Selector Ribbon */}
      <div className="sticky top-16 z-40 w-full border-b border-border/60 bg-card/90 backdrop-blur-md py-2.5 shadow-sm">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Globe2 className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-xs font-bold text-foreground">
              Select Spoken AI Voice Language:
            </span>
            <span className="text-[11px] text-muted-foreground hidden sm:inline">
              (AI will speak aloud in this language)
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full py-0.5">
            {INDIC_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setGlobalLanguage(lang.code)
                  speakText(lang.native, lang.code)
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  globalLanguage === lang.code
                    ? "bg-primary text-white shadow-md scale-105"
                    : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
                }`}
              >
                {lang.native} ({lang.name})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Feature Section 1: Live Real-Time Camera Gesture Recognition */}
      <section id="live-translator" className="py-16 border-b border-border/50 bg-card/30">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-3">
              <Zap className="h-3.5 w-3.5" />
              <span>Real-Time MediaPipe Computer Vision</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Live Webcam Sign-to-Speech Recognition
            </h2>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-2xl">
              Turn on your camera to track 21 hand joints, classify signs, and hear automatic spoken audio in{" "}
              <strong className="text-foreground">{currentLangObj.name} ({currentLangObj.native})</strong>.
            </p>
          </div>

          <CameraTranslator selectedLanguage={globalLanguage} />
        </div>
      </section>

      {/* 3. Feature Section 2: Real 3D Digital Human Avatar Studio */}
      <section id="avatar-studio" className="py-16 border-b border-border/50 bg-background">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-5 flex flex-col items-start gap-4">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                <Layers className="h-3.5 w-3.5" />
                <span>Procedural Kinematics & Blendshapes</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Real-Time 3D Digital Human Signer
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Interact with our WebGL 3D avatar. Unlike flat cartoon animations, this avatar simulates natural forward kinematics (FK), shoulder biomechanics, wrist rotation, and facial blendshapes (question furrowing, head nodding, and smiles).
              </p>

              <div className="space-y-2.5 w-full">
                <div className="p-3 rounded-xl bg-card border border-border text-xs flex items-center justify-between">
                  <span className="font-semibold text-foreground">Click & Drag Avatar to Orbit Camera</span>
                  <span className="font-mono text-cyan-500 text-[11px]">360° Free View</span>
                </div>
                <div className="p-3 rounded-xl bg-card border border-border text-xs flex items-center justify-between">
                  <span className="font-semibold text-foreground">Scroll Mouse Wheel to Zoom</span>
                  <span className="font-mono text-emerald-500 text-[11px]">Dynamic Depth</span>
                </div>
                <div className="p-3 rounded-xl bg-card border border-border text-xs flex items-center justify-between">
                  <span className="font-semibold text-foreground">52 Facial Blendshapes + 10 Fingers</span>
                  <span className="font-mono text-primary text-[11px]">Full Articulation</span>
                </div>
              </div>

              <div className="flex flex-col gap-2.5 pt-2 w-full">
                <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
                  <span>Common Words & Greetings:</span>
                  <span className="text-[11px] text-cyan-500 font-mono">Active: {avatarGesture.replace(/_/g, " ")}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { g: "HELLO", label: "Hello 👋" },
                    { g: "NAMASTE", label: "Namaste 🙏" },
                    { g: "WELCOME", label: "Welcome ✨" },
                    { g: "THANK_YOU", label: "Thank You" },
                    { g: "HOW_ARE_YOU", label: "How Are You?" },
                    { g: "STUDENT", label: "Student" },
                    { g: "HELP", label: "Help" },
                    { g: "WATER", label: "Water" },
                    { g: "YES", label: "Yes" },
                    { g: "NO", label: "No" },
                    { g: "INDIA", label: "India 🇮🇳" },
                  ].map(({ g, label }) => (
                    <button
                      key={g}
                      onClick={() => setAvatarGesture(g)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        avatarGesture === g
                          ? "bg-primary text-white border-primary shadow-md scale-105"
                          : "bg-muted text-foreground border-border hover:bg-muted/80"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold pt-1">
                  <span>Numeric Digits (0–9):</span>
                </div>
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-1">
                  {["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"].map((num) => {
                    const key = `NUMBER_${num}`
                    return (
                      <button
                        key={num}
                        onClick={() => setAvatarGesture(key)}
                        className={`h-8 rounded-lg font-black text-xs border transition-all ${
                          avatarGesture === key
                            ? "bg-indigo-600 text-white border-indigo-500 shadow-md scale-105"
                            : "bg-muted text-foreground border-border hover:bg-muted/80"
                        }`}
                      >
                        {num}
                      </button>
                    )
                  })}
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold pt-1">
                  <span>Alphabets (A–Z):</span>
                </div>
                <div className="grid grid-cols-7 sm:grid-cols-9 gap-1">
                  {Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ").map((char) => {
                    const key = `LETTER_${char}`
                    return (
                      <button
                        key={char}
                        onClick={() => setAvatarGesture(key)}
                        className={`h-7 rounded-md font-bold text-[11px] border transition-all ${
                          avatarGesture === key
                            ? "bg-cyan-600 text-white border-cyan-500 shadow-md scale-105"
                            : "bg-muted text-foreground border-border hover:bg-muted/80"
                        }`}
                      >
                        {char}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <ThreeAvatar activeGesture={avatarGesture} showControls={true} />
            </div>

          </div>
        </div>
      </section>

      {/* 4. Feature Section 3: Live Two-Way Conversation Room */}
      <section className="py-16 border-b border-border/50 bg-card/20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary border border-primary/20 mb-3">
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Real-Time Bi-Directional Bridge</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Live Two-Way Conversation Room
            </h2>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-2xl">
              Enable seamless communication between a deaf signer and a hearing speaker. Hearing speech turns into a 3D animated sign, while camera signs speak aloud in real time.
            </p>
          </div>

          <LiveConversationRoom currentLanguage={globalLanguage} />
        </div>
      </section>

      {/* 5. Feature Section 4: Interactive Sign Creator Studio */}
      <section className="py-16 border-b border-border/50 bg-background">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Linguistic Sequence Synthesis</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Sign Creator & Timeline Scrubber
            </h2>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-2xl">
              Type or speak any custom sentence. The NLP engine converts words into grammatical ISL gloss tokens, animating the sequence on the 3D human avatar.
            </p>
          </div>

          <SignCreatorStudio currentLanguage={globalLanguage} />
        </div>
      </section>

      {/* 6. Feature Section 5: ISL Learning Academy (A-Z & 0-9) */}
      <section id="learning-portal" className="py-16 border-b border-border/50 bg-card/30">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary border border-primary/20 mb-3">
              <BookOpen className="h-3.5 w-3.5" />
              <span>ISLRTC National Curriculum Aligned</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Interactive ISL Learning Academy
            </h2>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-2xl">
              Master official ISLRTC English Alphabets (A to Z) and Numbers (0 to 9) with 3D avatar demonstrations and live webcam practice room scoring.
            </p>
          </div>

          <LearningPortal currentLanguage={globalLanguage} />
        </div>
      </section>

      {/* 7. Feature Section 6: Comprehensive ISL Dictionary with Regional Variations */}
      <section id="isl-dictionary" className="py-16 border-b border-border/50 bg-background">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 mb-3">
              <Search className="h-3.5 w-3.5" />
              <span>Regional Variation Dialect Explorer</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              ISL Dictionary & Dialect Variations
            </h2>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-2xl">
              Explore signs with documented variations across North (Delhi), West (Gujarat/Maharashtra), South (Tamil Nadu/Karnataka), and East (Bengal/Odisha) India.
            </p>
          </div>

          <SignDictionary currentLanguage={globalLanguage} />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-10">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-white font-black text-xs">
              BS
            </div>
            <span className="font-bold text-foreground">BharatSign-Bridge Ecosystem</span>
            <span>• 13 Indian Languages • ISLRTC Aligned</span>
          </div>
          <div>
            FastAPI Backend active on <code className="text-primary font-mono">http://127.0.0.1:8000</code>
          </div>
        </div>
      </footer>

    </div>
  )
}
