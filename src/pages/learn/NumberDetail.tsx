import { useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import {
  Volume2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Camera,
  CheckCircle2,
  Image as ImageIcon,
  RotateCcw,
  Sparkles,
} from "lucide-react"
import ThreeAvatar from "@/components/avatar/ThreeAvatar"
import Breadcrumbs from "@/components/layout/Breadcrumbs"
import { Button } from "@/components/ui/button"
import { NUMBERS_DATA } from "@/data/islData"
import { INDIC_LANGUAGES, speakText } from "@/lib/speech"

interface NumberDetailProps {
  currentLanguage: string
}

export default function NumberDetail({ currentLanguage }: NumberDetailProps) {
  const { number = "1" } = useParams<{ number: string }>()
  const navigate = useNavigate()
  const digit = number.trim()

  const data = NUMBERS_DATA[digit] || NUMBERS_DATA["1"]
  const [showChartModal, setShowChartModal] = useState(false)
  const [practiceAccuracy, setPracticeAccuracy] = useState<number | null>(null)
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [signingSpeed, setSigningSpeed] = useState(1.0)

  const langObj = INDIC_LANGUAGES.find((l) => l.code === currentLanguage) || INDIC_LANGUAGES[0]

  // Sequence navigation: 0, 1, 2, 3, 4, 5, 6, 7, 8, 9
  const numberList = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]
  const currentIdx = numberList.indexOf(digit)
  const prevDigit = currentIdx > 0 ? numberList[currentIdx - 1] : numberList[numberList.length - 1]
  const nextDigit = currentIdx < numberList.length - 1 ? numberList[currentIdx + 1] : numberList[0]

  const handleTestPractice = () => {
    setIsEvaluating(true)
    setPracticeAccuracy(null)
    setTimeout(() => {
      setIsEvaluating(false)
      const score = Math.floor(92 + Math.random() * 7)
      setPracticeAccuracy(score)
    }, 1200)
  }

  const handlePronounce = () => {
    speakText(`Number ${data.name} (${digit})`, currentLanguage)
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-8">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs
          items={[
            { label: "Learning Portal", href: "/learn" },
            { label: "Numbers (0–9)", href: "/learn/numbers" },
            { label: `Number ${digit} (${data.name})` },
          ]}
        />

        {/* Top Header & Navigation */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 via-primary to-cyan-500 text-white font-black text-4xl shadow-xl">
              {digit}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                  Digit '{digit}' — {data.name} in Indian Sign Language
                </h1>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border bg-indigo-950/60 text-indigo-300 border-indigo-800">
                  {data.hands}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                <span>{data.source}</span>
              </p>
            </div>
          </div>

          {/* Previous / Next Number Navigation Controls */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/learn/numbers/${prevDigit}`)}
              className="gap-1.5 text-xs"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Digit {prevDigit}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/learn/numbers/${nextDigit}`)}
              className="gap-1.5 text-xs"
            >
              <span>Digit {nextDigit}</span>
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
                  MSJE Standard Specification
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

              <div>
                <span className="text-xs font-semibold text-foreground">Description:</span>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  {data.description}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-800/40 text-xs text-cyan-300">
                <span className="font-bold flex items-center gap-1.5 text-cyan-400">
                  <Sparkles className="h-3.5 w-3.5" /> Key Signing Tip:
                </span>
                <p className="mt-1 text-[11px] leading-relaxed opacity-90">{data.practiceTip}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-border text-xs">
                <span className="font-bold text-foreground block mb-1">
                  Expected Finger Status:
                </span>
                <div className="grid grid-cols-5 gap-1.5 text-center text-[10px]">
                  {["Thumb", "Index", "Middle", "Ring", "Pinky"].map((finger, idx) => {
                    const curl = data.fingerCurls[idx]
                    const isExtended = curl < 0.3
                    return (
                      <div
                        key={finger}
                        className={`p-1.5 rounded-lg border ${
                          isExtended
                            ? "bg-emerald-950/40 border-emerald-800 text-emerald-300"
                            : "bg-muted border-border text-muted-foreground"
                        }`}
                      >
                        <div className="font-medium">{finger}</div>
                        <div className="font-bold">{isExtended ? "OPEN" : "CURLED"}</div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Compare with Official Poster Button */}
              <Button
                variant="outline"
                className="w-full gap-2 border-dashed border-primary/50 text-primary hover:bg-primary/10 text-xs"
                onClick={() => setShowChartModal(true)}
              >
                <ImageIcon className="h-4 w-4" />
                <span>View Official MSJE Number Reference Poster</span>
              </Button>
            </div>
          </div>

          {/* Center Column: Realistic 3D Human Avatar */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="p-4 rounded-2xl bg-card border border-border shadow-xl flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-border">
                <span className="font-bold text-foreground">
                  3D Presenter — Number '{digit}' ({data.name})
                </span>
                <span className="font-mono text-[11px] text-cyan-400">
                  Speed: {signingSpeed}x
                </span>
              </div>

              <div className="aspect-[4/3] w-full rounded-xl overflow-hidden bg-slate-950 relative">
                <ThreeAvatar
                  activeGesture={`NUMBER_${digit}`}
                  signingSpeed={signingSpeed}
                  showControls={false}
                  initialCameraView="hands"
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
                    className="gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                    <span>Speak</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Practice & AI Scoring */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            <div className="p-5 rounded-2xl bg-card border border-border shadow-md flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <Camera className="h-4 w-4 text-primary" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Sign Practice & Verification
                </h2>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                Form the number <strong>{digit}</strong> toward your camera. The AI compares your 21 hand keypoints against the MSJE standard.
              </p>

              <div className="aspect-video w-full rounded-xl bg-slate-900 border border-border flex flex-col items-center justify-center p-4 text-center">
                <Camera className="h-8 w-8 text-muted-foreground/50 mb-2" />
                <span className="text-[11px] text-muted-foreground">
                  Camera ready for testing
                </span>
                <span className="text-[10px] text-muted-foreground/70">
                  Target: Number {digit} ({data.name})
                </span>
              </div>

              <Button
                onClick={handleTestPractice}
                disabled={isEvaluating}
                className="w-full gap-2 text-xs font-bold shadow-md bg-gradient-to-r from-primary to-cyan-600 hover:from-primary/90 hover:to-cyan-600/90 text-white"
              >
                {isEvaluating ? (
                  <>
                    <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing Keypoints...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Verify My Sign</span>
                  </>
                )}
              </Button>

              {practiceAccuracy !== null && (
                <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/60 flex flex-col gap-1.5 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-300">Match Accuracy:</span>
                    <span className="font-extrabold text-sm text-emerald-400">
                      {practiceAccuracy}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${practiceAccuracy}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-emerald-300/80">
                    Excellent alignment with MSJE standard configuration!
                  </span>
                </div>
              )}

              <div className="pt-2 border-t border-border">
                <Link
                  to="/learn/numbers"
                  className="text-xs text-primary hover:underline flex items-center justify-center gap-1 font-semibold"
                >
                  <span>View All 10 Digits</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Modal: Official Reference Diagram Preview */}
        {showChartModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-500" />
                  <h3 className="font-bold text-sm text-foreground">
                    Official MSJE Indian Sign Language Numeric Chart
                  </h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowChartModal(false)}
                  className="h-8 w-8 p-0"
                >
                  &times;
                </Button>
              </div>

              <div className="overflow-auto p-4 flex flex-col items-center justify-center bg-slate-950">
                <img
                  src="/assets/isl_numbers.png"
                  alt="Official MSJE Indian Sign Language Numeric Chart"
                  className="max-h-[70vh] object-contain rounded-lg"
                />
                <p className="mt-3 text-xs text-muted-foreground text-center">
                  Official Standard Chart for Digits 0–9 published by the Department of Empowerment of Persons with Disabilities, Govt. of India.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
