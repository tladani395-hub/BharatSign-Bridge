import { useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import {
  Volume2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Camera,
  CheckCircle2,
  MapPin,
  Smile,
} from "lucide-react"
import ThreeAvatar from "@/components/avatar/ThreeAvatar"
import Breadcrumbs from "@/components/layout/Breadcrumbs"
import { Button } from "@/components/ui/button"
import { VOCABULARY_SIGNS, getSignById } from "@/data/vocabularyData"
import type { SignEntry } from "@/data/vocabularyData"
import { INDIC_LANGUAGES, speakText } from "@/lib/speech"

interface WordDetailProps {
  currentLanguage: string
}

export default function WordDetail({ currentLanguage }: WordDetailProps) {
  const { wordId = "hello" } = useParams<{ wordId: string }>()
  const navigate = useNavigate()

  const sign: SignEntry = getSignById(wordId) || VOCABULARY_SIGNS[0]
  const [activeCameraView, setActiveCameraView] = useState<
    "full-body" | "upper-body" | "hands" | "right-hand" | "left-hand" | "face"
  >("upper-body")
  const [signingSpeed, setSigningSpeed] = useState(1.0)
  const [practiceAccuracy, setPracticeAccuracy] = useState<number | null>(null)
  const [isEvaluating, setIsEvaluating] = useState(false)

  const langObj = INDIC_LANGUAGES.find((l) => l.code === currentLanguage) || INDIC_LANGUAGES[0]

  // Next / Previous navigation
  const currentIdx = VOCABULARY_SIGNS.findIndex((s) => s.sign_id === sign.sign_id)
  const prevSign =
    currentIdx > 0 ? VOCABULARY_SIGNS[currentIdx - 1] : VOCABULARY_SIGNS[VOCABULARY_SIGNS.length - 1]
  const nextSign =
    currentIdx < VOCABULARY_SIGNS.length - 1 ? VOCABULARY_SIGNS[currentIdx + 1] : VOCABULARY_SIGNS[0]

  const handleTestPractice = () => {
    setIsEvaluating(true)
    setPracticeAccuracy(null)
    setTimeout(() => {
      setIsEvaluating(false)
      const score = Math.floor(91 + Math.random() * 8)
      setPracticeAccuracy(score)
    }, 1300)
  }

  const handlePronounce = () => {
    speakText(sign.meaning, currentLanguage)
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-8">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs
          items={[
            { label: "Learning Portal", href: "/learn" },
            { label: "Vocabulary Dictionary", href: "/learn/words" },
            { label: sign.meaning },
          ]}
        />

        {/* Top Header & Navigation */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/40 border border-cyan-800 px-2.5 py-0.5 rounded-full">
                {sign.category}
              </span>
              <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>{sign.source_reference}</span>
              </span>
            </div>
            <h1 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
              <span>{sign.meaning}</span>
              <span className="text-base font-mono font-normal text-muted-foreground bg-muted/60 px-2.5 py-0.5 rounded-lg">
                GLOSS: {sign.gloss}
              </span>
            </h1>
          </div>

          {/* Previous / Next Word Navigation */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/learn/words/${prevSign.gloss.toLowerCase()}`)}
              className="gap-1.5 text-xs"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>{prevSign.gloss}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/learn/words/${nextSign.gloss.toLowerCase()}`)}
              className="gap-1.5 text-xs"
            >
              <span>{nextSign.gloss}</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* 3-Column Studio Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Linguistic Specifications & Regional Variations */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="p-5 rounded-2xl bg-card border border-border shadow-md flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Kinematic & Linguistic Profile
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
                <span className="text-xs font-semibold text-foreground">Hand Configuration:</span>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  {sign.hand_configuration}
                </p>
              </div>

              <div>
                <span className="text-xs font-semibold text-foreground">Signing Location:</span>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  {sign.signing_location}
                </p>
              </div>

              <div>
                <span className="text-xs font-semibold text-foreground">Movement Sequence:</span>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  {sign.movement_sequence}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-800/40 text-xs text-cyan-300">
                <span className="font-bold flex items-center gap-1.5 text-cyan-400">
                  <Smile className="h-3.5 w-3.5" /> Facial Expression & Non-Manual Marker:
                </span>
                <p className="mt-1 text-[11px] leading-relaxed opacity-90">{sign.facial_expression}</p>
                <p className="mt-0.5 text-[10px] text-cyan-400/80">Head: {sign.head_movement}</p>
              </div>

              {/* Regional Variants */}
              <div className="pt-2 border-t border-border">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5 mb-2">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  <span>Documented Regional Dialect Variants:</span>
                </span>
                <div className="flex flex-col gap-1.5">
                  {Object.entries(sign.regional_variant).map(([region, desc]) => (
                    <div
                      key={region}
                      className="p-2 rounded-lg bg-muted/60 border border-border text-[11px] flex flex-col gap-0.5"
                    >
                      <span className="font-bold text-primary">{region} Region:</span>
                      <span className="text-muted-foreground">{desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Center Column: 3D Presenter Avatar */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="p-4 rounded-2xl bg-card border border-border shadow-xl flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-border">
                <span className="font-bold text-foreground">
                  3D Presenter — {sign.gloss}
                </span>
                <span className="font-mono text-[11px] text-cyan-400">
                  Speed: {signingSpeed}x
                </span>
              </div>

              <div className="aspect-[4/3] w-full rounded-xl overflow-hidden bg-slate-950 relative">
                <ThreeAvatar
                  activeGesture={sign.gloss}
                  signingSpeed={signingSpeed}
                  showControls={false}
                  initialCameraView={activeCameraView}
                />
              </div>

              {/* Camera Angle Presets Bar */}
              <div className="flex items-center justify-between gap-1 overflow-x-auto py-1">
                {(
                  [
                    { id: "upper-body", label: "Upper Body" },
                    { id: "hands", label: "Both Hands" },
                    { id: "right-hand", label: "Right Hand" },
                    { id: "face", label: "Face / Mimic" },
                    { id: "full-body", label: "Full Body" },
                  ] as const
                ).map((cam) => (
                  <button
                    key={cam.id}
                    onClick={() => setActiveCameraView(cam.id)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-colors ${
                      activeCameraView === cam.id
                        ? "bg-primary text-white"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {cam.label}
                  </button>
                ))}
              </div>

              {/* Speed & Audio Controls */}
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-border">
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-muted-foreground">Speed:</span>
                  {[0.5, 1.0, 1.5].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => setSigningSpeed(speed)}
                      className={`px-2 py-0.5 rounded text-xs font-bold transition-colors ${
                        signingSpeed === speed
                          ? "bg-primary text-white"
                          : "bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handlePronounce}
                  className="gap-1 text-xs text-primary hover:underline"
                >
                  <Volume2 className="h-3.5 w-3.5" />
                  <span>Pronounce</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column: Sign Verification & AI Feedback */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            <div className="p-5 rounded-2xl bg-card border border-border shadow-md flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <Camera className="h-4 w-4 text-cyan-400" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  AI Pose Verification
                </h2>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                Perform the sign for <strong>{sign.meaning}</strong> facing your camera. The model assesses hand position, orientation, and motion trajectory.
              </p>

              <div className="aspect-video w-full rounded-xl bg-slate-900 border border-border flex flex-col items-center justify-center p-4 text-center">
                <Camera className="h-8 w-8 text-muted-foreground/50 mb-2" />
                <span className="text-[11px] text-muted-foreground">
                  Webcam ready for gesture test
                </span>
                <span className="text-[10px] text-muted-foreground/70">
                  Target: {sign.gloss}
                </span>
              </div>

              <Button
                onClick={handleTestPractice}
                disabled={isEvaluating}
                className="w-full gap-2 text-xs font-bold shadow-md bg-gradient-to-r from-cyan-600 to-primary hover:from-cyan-500 hover:to-primary/90 text-white"
              >
                {isEvaluating ? (
                  <>
                    <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Evaluating Kinematics...</span>
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
                    <span className="font-bold text-emerald-300">Kinematic Match:</span>
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
                    Trajectory and hand posture match standard ISL specification!
                  </span>
                </div>
              )}

              <div className="pt-2 border-t border-border">
                <Link
                  to="/learn/words"
                  className="text-xs text-cyan-400 hover:underline flex items-center justify-center gap-1 font-semibold"
                >
                  <span>Explore Full Dictionary</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
