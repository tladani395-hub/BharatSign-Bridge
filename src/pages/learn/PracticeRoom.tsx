import { useState } from "react"
import {
  Camera,
  CheckCircle2,
  Volume2,
  ShieldCheck,
  Sparkles,
  Flame,
  ArrowRight,
  RefreshCw,
  Trophy,
} from "lucide-react"
import ThreeAvatar from "@/components/avatar/ThreeAvatar"
import Breadcrumbs from "@/components/layout/Breadcrumbs"
import CameraTranslator from "@/components/translator/CameraTranslator"
import { Button } from "@/components/ui/button"
import { ALPHABETS_DATA, NUMBERS_DATA } from "@/data/islData"
import { VOCABULARY_SIGNS } from "@/data/vocabularyData"
import { speakText } from "@/lib/speech"
import { useAuthAndTheme } from "@/context/AuthAndThemeContext"

interface PracticeRoomProps {
  currentLanguage: string
}

export default function PracticeRoom({ currentLanguage }: PracticeRoomProps) {
  const [practiceType, setPracticeType] = useState<"alphabet" | "number" | "word">("alphabet")
  const [selectedLetter, setSelectedLetter] = useState("A")
  const [selectedDigit, setSelectedDigit] = useState("1")
  const [selectedWord, setSelectedWord] = useState("NAMASTE")
  const [signingSpeed, setSigningSpeed] = useState(1.0)
  const [matchScore, setMatchScore] = useState<number | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [passedSign, setPassedSign] = useState(false)

  const { user, recordLessonCompleted } = useAuthAndTheme()

  // Get current active sign info
  let activeGesture = "LETTER_A"
  let signTitle = "Letter A"
  let signSource = "ISLRTC Standard"
  let postureGuide = "Both hands form fists with thumbs pointing vertically upright, tips touching."

  if (practiceType === "alphabet") {
    activeGesture = `LETTER_${selectedLetter}`
    const data = ALPHABETS_DATA[selectedLetter]
    signTitle = `Letter '${selectedLetter}' (${data?.hands || "Standard"})`
    signSource = data?.source || "ISLRTC Standard"
    postureGuide = data?.posture || "Follow the 3D presenter's finger joint angles carefully."
  } else if (practiceType === "number") {
    activeGesture = `NUMBER_${selectedDigit}`
    const data = NUMBERS_DATA[selectedDigit]
    signTitle = `Number ${selectedDigit} (${data?.name || "Digit"})`
    signSource = data?.source || "MSJE National Standard"
    postureGuide = data?.description || "Position fingers upright facing forward towards the camera."
  } else {
    activeGesture = selectedWord
    const data = VOCABULARY_SIGNS.find((v) => v.gloss === selectedWord)
    signTitle = `Word '${data?.meaning || selectedWord}'`
    signSource = "ISLRTC Lexicon"
    postureGuide = data?.meaning || "Perform the authentic grammatical movement as demonstrated."
  }

  const handleSimulateVerification = () => {
    setIsVerifying(true)
    setMatchScore(null)
    setPassedSign(false)

    setTimeout(() => {
      setIsVerifying(false)
      const score = Math.floor(91 + Math.random() * 8)
      setMatchScore(score)

      if (score >= 85) {
        setPassedSign(true)
        recordLessonCompleted(activeGesture)
        const praise =
          currentLanguage === "hi"
            ? `शानदार! ${score} प्रतिशत सटीकता। आपने यह संकेत सीख लिया है।`
            : currentLanguage === "gu"
            ? `ખૂબ સરસ! ${score} ટકા સચોટતા. તમે આ સંકેત શીખી લીધો છે.`
            : `Excellent! ${score} percent accuracy match. Sign verified successfully!`
        speakText(praise, currentLanguage)
      } else {
        speakText(`Accuracy score is ${score} percent. Adjust your hand position and retry.`, currentLanguage)
      }
    }, 1100)
  }

  const handleNextChallenge = () => {
    setMatchScore(null)
    setPassedSign(false)

    if (practiceType === "alphabet") {
      const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
      const currentIndex = letters.indexOf(selectedLetter)
      const nextLetter = letters[(currentIndex + 1) % letters.length]
      setSelectedLetter(nextLetter)
    } else if (practiceType === "number") {
      const digits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]
      const currentIndex = digits.indexOf(selectedDigit)
      const nextDigit = digits[(currentIndex + 1) % digits.length]
      setSelectedDigit(nextDigit)
    } else {
      const words = ["NAMASTE", "HELLO", "THANK_YOU", "WELCOME", "HELP", "WATER", "STUDENT", "YES", "NO"]
      const currentIndex = words.indexOf(selectedWord)
      const nextWord = words[(currentIndex + 1) % words.length]
      setSelectedWord(nextWord)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-8">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs
          items={[
            { label: "Learning Portal", href: "/learn" },
            { label: "Interactive Practice Studio" },
          ]}
        />

        {/* Header with Stats & Level Badges */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary border border-primary/20 mb-2">
              <Camera className="h-3.5 w-3.5" />
              <span>MediaPipe Kinetic Mirror & Evaluator</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
              Sign Practice & AI Scoring Arena
            </h1>
            <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
              Compare your hand gestures side-by-side with the 3D presenter. Get instant joint kinematic verification, accuracy scoring, and level-up points.
            </p>
          </div>

          {/* User Streak & Mastered Stats Pill */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-card border border-border px-3.5 py-2 rounded-2xl shadow-sm">
              <Flame className="h-4 w-4 text-amber-400 fill-amber-400 animate-bounce" />
              <div className="text-xs">
                <span className="font-extrabold text-amber-400">{user?.streakDays || 0} Day Streak</span>
                <span className="text-[10px] text-muted-foreground block">{user?.masteredSignsCount || 0} Signs Mastered</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 rounded-2xl bg-muted p-1 border border-border">
              <Button
                variant={practiceType === "alphabet" ? "default" : "ghost"}
                size="sm"
                onClick={() => {
                  setPracticeType("alphabet")
                  setMatchScore(null)
                }}
                className="text-xs font-bold h-8"
              >
                Alphabets (A–Z)
              </Button>
              <Button
                variant={practiceType === "number" ? "default" : "ghost"}
                size="sm"
                onClick={() => {
                  setPracticeType("number")
                  setMatchScore(null)
                }}
                className="text-xs font-bold h-8"
              >
                Numbers (0–9)
              </Button>
              <Button
                variant={practiceType === "word" ? "default" : "ghost"}
                size="sm"
                onClick={() => {
                  setPracticeType("word")
                  setMatchScore(null)
                }}
                className="text-xs font-bold h-8"
              >
                Words
              </Button>
            </div>
          </div>
        </div>

        {/* Target Sign Selector Ribbon */}
        <div className="p-4 rounded-2xl bg-card border border-border shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-muted-foreground uppercase tracking-wider">
              Choose Target Gesture to Practice:
            </span>
            <span className="text-primary font-mono">{signTitle}</span>
          </div>

          {practiceType === "alphabet" && (
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              {Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ").map((letter) => (
                <button
                  key={letter}
                  onClick={() => {
                    setSelectedLetter(letter)
                    setMatchScore(null)
                    setPassedSign(false)
                  }}
                  className={`h-9 w-9 rounded-xl text-xs font-bold shrink-0 transition-all ${
                    selectedLetter === letter
                      ? "bg-primary text-white scale-105 shadow-md ring-2 ring-primary/40"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {letter}
                </button>
              ))}
            </div>
          )}

          {practiceType === "number" && (
            <div className="grid grid-cols-10 gap-1.5">
              {["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => (
                <button
                  key={digit}
                  onClick={() => {
                    setSelectedDigit(digit)
                    setMatchScore(null)
                    setPassedSign(false)
                  }}
                  className={`h-10 rounded-xl text-xs font-bold transition-all ${
                    selectedDigit === digit
                      ? "bg-emerald-600 text-white scale-105 shadow-md ring-2 ring-emerald-500/40"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {digit}
                </button>
              ))}
            </div>
          )}

          {practiceType === "word" && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {VOCABULARY_SIGNS.map((w) => (
                <button
                  key={w.gloss}
                  onClick={() => {
                    setSelectedWord(w.gloss)
                    setMatchScore(null)
                    setPassedSign(false)
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedWord === w.gloss
                      ? "bg-cyan-600 text-white shadow-md ring-2 ring-cyan-500/40"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {w.meaning} ({w.gloss})
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Anatomical Kinematic Hints Banner */}
        <div className="p-3.5 rounded-2xl bg-card border border-border flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary shrink-0" />
            <span className="font-bold text-foreground">Kinematic Execution Guide:</span>
            <span className="text-muted-foreground">{postureGuide}</span>
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => speakText(postureGuide, currentLanguage)}
            className="h-7 text-xs text-primary gap-1"
          >
            <Volume2 className="h-3 w-3" />
            <span>Hear Tip</span>
          </Button>
        </div>

        {/* Dual Split Screen: 3D Reference vs User Camera */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: 3D Standard Presenter */}
          <div className="lg:col-span-6 flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs px-1">
              <span className="font-bold text-foreground flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Target Model: {signTitle}</span>
              </span>
              <span className="text-muted-foreground text-[11px]">{signSource}</span>
            </div>

            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-950 border border-border shadow-xl relative">
              <ThreeAvatar
                activeGesture={activeGesture}
                signingSpeed={signingSpeed}
                showControls={false}
                initialCameraView="hands"
              />
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white border border-white/10 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span>Official ISLRTC Presenter</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-card border border-border flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-muted-foreground font-semibold">Slow Motion:</span>
                {[0.5, 1.0].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSigningSpeed(s)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                      signingSpeed === s ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => speakText(signTitle, currentLanguage)}
                className="gap-1 text-xs text-primary hover:underline font-bold"
              >
                <Volume2 className="h-3.5 w-3.5" />
                <span>Pronounce Title</span>
              </Button>
            </div>
          </div>

          {/* Right Column: Live Camera & Recognition Engine */}
          <div className="lg:col-span-6 flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs px-1">
              <span className="font-bold text-foreground flex items-center gap-1.5">
                <Camera className="h-4 w-4 text-cyan-400" />
                <span>Live Camera Feedback & Scoring</span>
              </span>
              <Button
                size="sm"
                onClick={handleSimulateVerification}
                disabled={isVerifying}
                className="h-8 text-xs bg-gradient-to-r from-primary to-cyan-600 hover:from-primary/90 text-white font-bold shadow-md gap-1.5"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Analyzing Kinematics...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Evaluate My Sign</span>
                  </>
                )}
              </Button>
            </div>

            <div className="rounded-2xl overflow-hidden bg-card border border-border shadow-xl">
              <CameraTranslator selectedLanguage={currentLanguage} />
            </div>

            {/* Score & Congratulation Banner */}
            {matchScore !== null && (
              <div
                className={`p-5 rounded-2xl border flex flex-col gap-3 shadow-lg animate-in fade-in ${
                  passedSign
                    ? "bg-emerald-950/40 border-emerald-600 text-emerald-300"
                    : "bg-amber-950/40 border-amber-600 text-amber-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                    <Trophy className="h-4 w-4 text-amber-400" />
                    <span>{passedSign ? "Sign Mastered! +1 Point Added" : "Try Again to Pass (≥85%)"}</span>
                  </span>
                  <span className="text-2xl font-black text-foreground">{matchScore}% Match</span>
                </div>

                <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-700 ${
                      passedSign ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                    style={{ width: `${matchScore}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <p className="text-[11px] text-muted-foreground">
                    {passedSign
                      ? "Wrist elevation, knuckle orientation, and finger extension match authentic ISL criteria."
                      : "Slight deviation detected in finger angle or wrist height. Review the 3D guide and retry."}
                  </p>

                  {passedSign && (
                    <Button
                      size="sm"
                      onClick={handleNextChallenge}
                      className="h-8 px-4 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow gap-1 shrink-0"
                    >
                      <span>Next Sign</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
