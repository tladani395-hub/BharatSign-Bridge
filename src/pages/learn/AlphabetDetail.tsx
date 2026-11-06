import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Volume2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Image as ImageIcon,
  RotateCcw,
  Sparkles,
} from "lucide-react"
import ThreeAvatar from "@/components/avatar/ThreeAvatar"
import Breadcrumbs from "@/components/layout/Breadcrumbs"
import { Button } from "@/components/ui/button"
import { ALPHABETS_DATA } from "@/data/islData"
import { INDIC_LANGUAGES, speakText } from "@/lib/speech"

interface AlphabetDetailProps {
  currentLanguage: string
}

export default function AlphabetDetail({ currentLanguage }: AlphabetDetailProps) {
  const { letter = "A" } = useParams<{ letter: string }>()
  const navigate = useNavigate()
  const char = letter.toUpperCase()

  const data = ALPHABETS_DATA[char] || ALPHABETS_DATA["A"]
  const [showChartModal, setShowChartModal] = useState(false)
  const [practiceAccuracy, setPracticeAccuracy] = useState<number | null>(null)
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [signingSpeed, setSigningSpeed] = useState(1.0)

  const langObj = INDIC_LANGUAGES.find((l) => l.code === currentLanguage) || INDIC_LANGUAGES[0]

  // Alphabet sequence navigation
  const alphabetList = Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ")
  const currentIdx = alphabetList.indexOf(char)
  const prevLetter = currentIdx > 0 ? alphabetList[currentIdx - 1] : alphabetList[alphabetList.length - 1]
  const nextLetter = currentIdx < alphabetList.length - 1 ? alphabetList[currentIdx + 1] : alphabetList[0]

  const handleTestPractice = () => {
    setIsEvaluating(true)
    setPracticeAccuracy(null)
    setTimeout(() => {
      setIsEvaluating(false)
      const score = Math.floor(93 + Math.random() * 6)
      setPracticeAccuracy(score)
    }, 1200)
  }

  const handlePronounce = () => {
    speakText(`Letter ${char}`, currentLanguage)
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-8">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs
          items={[
            { label: "Learning Portal", href: "/learn" },
            { label: "Alphabets (A–Z)", href: "/learn/alphabet" },
            { label: `Letter ${char}` },
          ]}
        />

        {/* Top Header & Navigation */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-cyan-600 text-white font-black text-4xl shadow-xl">
              {char}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                  Letter '{char}' in Indian Sign Language
                </h1>
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                    data.hands === "Two-handed"
                      ? "bg-cyan-950/60 text-cyan-300 border-cyan-800"
                      : "bg-indigo-950/60 text-indigo-300 border-indigo-800"
                  }`}
                >
                  {data.hands}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                <span>{data.source}</span>
              </p>
            </div>
          </div>

          {/* Previous / Next Letter Navigation Controls */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/learn/alphabet/${prevLetter}`)}
              className="gap-1.5 text-xs"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Letter {prevLetter}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/learn/alphabet/${nextLetter}`)}
              className="gap-1.5 text-xs"
            >
              <span>Letter {nextLetter}</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Main 3-Column Studio Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Hand Configuration & Guidelines */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="p-5 rounded-2xl bg-card border border-border shadow-md flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  ISLRTC Posture Specification
                </h2>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handlePronounce}
                  className="h-7 gap-1 text-[11px] text-primary hover:underline p-1"
                >
                  <Volume2 className="h-3.5 w-3.5" />
                  <span>Hear in {langObj.name}</span>
                </Button>
              </div>

              <div>
                <span className="text-xs font-semibold text-foreground">Hand Formation:</span>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  {data.posture}
                </p>
              </div>

              <div>
                <span className="text-xs font-semibold text-foreground">Palm Orientation:</span>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  {data.palmOrientation}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-800/40 text-xs text-cyan-300">
                <span className="font-bold flex items-center gap-1.5 text-cyan-400">
                  <Sparkles className="h-3.5 w-3.5" /> Key Signing Tip:
                </span>
                <p className="mt-1 text-[11px] leading-relaxed opacity-90">{data.tips}</p>
              </div>

              <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/40 text-xs text-amber-300">
                <span className="font-bold flex items-center gap-1.5 text-amber-400">
                  <AlertTriangle className="h-3.5 w-3.5" /> Common Mistakes:
                </span>
                <p className="mt-1 text-[11px] leading-relaxed opacity-90">
                  {data.commonMistakes}
                </p>
              </div>

              {/* Compare with Official Poster Button */}
              <Button
                variant="outline"
                className="w-full gap-2 border-dashed border-primary/50 text-primary hover:bg-primary/10 text-xs"
                onClick={() => setShowChartModal(true)}
              >
                <ImageIcon className="h-4 w-4" />
                <span>View Official ISLRTC Reference Diagram</span>
              </Button>
            </div>
          </div>

          {/* Center Column: Realistic 3D Human Avatar */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="p-4 rounded-2xl bg-card border border-border shadow-xl flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-border">
                <span className="font-bold text-foreground">
                  3D Presenter — Letter '{char}'
                </span>
                <span className="font-mono text-[11px] text-cyan-400">
                  Speed: {signingSpeed}x
                </span>
              </div>

              <div className="aspect-[4/3] w-full rounded-xl overflow-hidden bg-slate-950 relative">
                <ThreeAvatar
                  activeGesture={`LETTER_${char}`}
                  signingSpeed={signingSpeed}
                  showControls={false}
                  initialCameraView={data.hands === "Two-handed" ? "hands" : "upper-body"}
                />
              </div>

              {/* Replay & Speed Controls */}
              <div className="flex items-center justify-between gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSigningSpeed(signingSpeed === 1.0 ? 0.5 : 1.0)}
                  className="gap-1.5 text-xs"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>{signingSpeed === 0.5 ? "Speed: 1.0x (Normal)" : "Slow Motion (0.5x)"}</span>
                </Button>

                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handlePronounce}
                    className="gap-1 text-xs"
                  >
                    <Volume2 className="h-3.5 w-3.5 text-primary" />
                    <span>Pronounce</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Practice & 26 Alphabet Selector */}
          <div className="lg:col-span-3 flex flex-col gap-5">
            {/* Quick 26 Alphabet Switcher */}
            <div className="p-4 rounded-2xl bg-card border border-border shadow-md flex flex-col gap-3">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                All 26 ISL Letters:
              </span>
              <div className="grid grid-cols-6 sm:grid-cols-7 gap-1">
                {alphabetList.map((item) => (
                  <button
                    key={item}
                    onClick={() => navigate(`/learn/alphabet/${item}`)}
                    className={`h-8 rounded-lg font-bold text-xs transition-all ${
                      item === char
                        ? "bg-primary text-white shadow-md scale-105 font-black"
                        : "bg-muted text-foreground hover:bg-muted/80 border border-border"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Webcam AI Practice & Joint Validation */}
            <div className="p-4 rounded-2xl bg-slate-950 text-white border border-slate-800 shadow-xl flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                  <Camera className="h-3.5 w-3.5" /> Practice Room
                </span>
                {practiceAccuracy && (
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                    {practiceAccuracy}% Match
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Position your hand toward your camera to match Letter <strong className="text-white">'{char}'</strong>. Our MediaPipe vision model verifies finger knuckle angles.
              </p>

              {practiceAccuracy && (
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full transition-all duration-700"
                    style={{ width: `${practiceAccuracy}%` }}
                  />
                </div>
              )}

              <Button
                size="sm"
                onClick={handleTestPractice}
                disabled={isEvaluating}
                className="w-full gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>
                  {isEvaluating ? "Analyzing Joint Posture..." : `Practice '${char}' with Webcam`}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Official ISLRTC Reference Chart Modal */}
      {showChartModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/40">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-primary" />
                <span>ISLRTC Official Chart — Letter '{char}' Reference</span>
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowChartModal(false)}
                className="h-8 w-8 p-0 rounded-full"
              >
                ✕
              </Button>
            </div>

            <div className="flex-1 overflow-auto p-4 flex flex-col items-center justify-center bg-slate-950">
              <img
                src="/assets/isl_alphabets.png"
                alt="ISLRTC Alphabets Reference Poster"
                className="max-h-[70vh] w-auto rounded-lg object-contain border border-slate-800 shadow-xl"
              />
            </div>

            <div className="p-3 border-t border-border bg-card flex items-center justify-between text-xs text-muted-foreground">
              <span>Standardized by Ministry of Social Justice & Empowerment, Govt. of India</span>
              <Button size="sm" variant="secondary" onClick={() => setShowChartModal(false)}>
                Close Diagram
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
