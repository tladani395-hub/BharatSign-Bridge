import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  Volume2,
  Play,
  Pause,
  RotateCcw,
  ShieldCheck,
  ChevronRight,
  Image as ImageIcon,
} from "lucide-react"
import ThreeAvatar from "@/components/avatar/ThreeAvatar"
import Breadcrumbs from "@/components/layout/Breadcrumbs"
import { Button } from "@/components/ui/button"
import { NUMBERS_DATA } from "@/data/islData"
import { speakText } from "@/lib/speech"

interface NumbersGridProps {
  currentLanguage: string
}

export default function NumbersGrid({ currentLanguage }: NumbersGridProps) {
  const [selectedDigit, setSelectedDigit] = useState<string>("1")
  const [isPlayingCount, setIsPlayingCount] = useState(false)
  const [countIndex, setCountIndex] = useState(1)
  const [signingSpeed, setSigningSpeed] = useState(1.0)
  const [showChartModal, setShowChartModal] = useState(false)

  const digitsList = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]

  // Sequence Auto-Counter (0 -> 1 -> ... -> 9)
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    if (isPlayingCount) {
      timer = setTimeout(() => {
        setCountIndex((prev) => {
          const next = (prev + 1) % digitsList.length
          setSelectedDigit(digitsList[next])
          return next
        })
      }, 1600 / signingSpeed)
    }
    return () => clearTimeout(timer)
  }, [isPlayingCount, countIndex, signingSpeed])

  const toggleCountSequence = () => {
    if (!isPlayingCount) {
      setCountIndex(digitsList.indexOf(selectedDigit))
    }
    setIsPlayingCount(!isPlayingCount)
  }

  const selectedData = NUMBERS_DATA[selectedDigit] || NUMBERS_DATA["1"]

  return (
    <div className="min-h-screen bg-background text-foreground py-8">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col gap-8">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: "Learning Portal", href: "/learn" },
            { label: "Numbers (0–9)" },
          ]}
        />

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-500 border border-emerald-500/20 mb-2">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>MSJE Official Numeric System</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
              ISL Numeric Digits (0–9)
            </h1>
            <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
              Learn the standard Indian Sign Language hand representations for numbers 0 through 9, including the distinct conventions for 6 (pinky finger) and 9 (thumb down).
            </p>
          </div>

          <Button
            variant="outline"
            className="gap-2 border-emerald-500/40 text-emerald-500 hover:bg-emerald-500/10 self-start md:self-auto text-xs"
            onClick={() => setShowChartModal(true)}
          >
            <ImageIcon className="h-4 w-4" />
            <span>Official MSJE Poster</span>
          </Button>
        </div>

        {/* Interactive Avatar Presenter & Counting Sequence */}
        <div className="rounded-3xl bg-gradient-to-br from-card via-slate-900 to-card border border-border p-6 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Avatar Preview */}
            <div className="lg:col-span-5 aspect-[4/3] rounded-2xl overflow-hidden bg-slate-950 border border-border/80 shadow-inner relative">
              <ThreeAvatar
                activeGesture={`NUMBER_${selectedDigit}`}
                signingSpeed={signingSpeed}
                showControls={false}
                initialCameraView="hands"
              />
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white border border-white/10 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Digit {selectedDigit} ({selectedData.name})</span>
              </div>
            </div>

            {/* Avatar Controls & Selected Digit Summary */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">
                    Selected Number
                  </span>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-4xl font-black text-foreground">
                      Digit {selectedDigit} — {selectedData.name}
                    </span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full border bg-emerald-950/60 text-emerald-300 border-emerald-800">
                      {selectedData.hands}
                    </span>
                  </div>
                </div>

                <Link to={`/learn/numbers/${selectedDigit}`}>
                  <Button className="gap-2 text-xs font-bold shadow-md bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white">
                    <span>Open Lesson</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                {selectedData.posture}
              </p>

              {/* Counting Sequence Controls */}
              <div className="p-4 rounded-xl bg-background/50 border border-border flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={isPlayingCount ? "destructive" : "default"}
                    onClick={toggleCountSequence}
                    className="gap-2 text-xs font-bold shadow"
                  >
                    {isPlayingCount ? (
                      <>
                        <Pause className="h-3.5 w-3.5" />
                        <span>Pause Count</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-3.5 w-3.5" />
                        <span>Autoplay 0–9 Count</span>
                      </>
                    )}
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsPlayingCount(false)
                      setSelectedDigit("0")
                      setCountIndex(0)
                    }}
                    className="gap-1.5 text-xs"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Reset</span>
                  </Button>
                </div>

                <div className="flex items-center gap-2 text-xs">
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
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => speakText(`Number ${selectedData.name}`, currentLanguage)}
                    className="h-7 w-7 p-0 ml-1"
                  >
                    <Volume2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </div>
              </div>

              {/* Quick Digit Selector Buttons */}
              <div className="grid grid-cols-10 gap-1.5">
                {digitsList.map((d) => (
                  <button
                    key={d}
                    onClick={() => {
                      setSelectedDigit(d)
                      setIsPlayingCount(false)
                    }}
                    className={`h-10 rounded-xl text-sm font-black transition-all flex items-center justify-center ${
                      selectedDigit === d
                        ? "bg-emerald-600 text-white shadow-lg scale-105 ring-2 ring-emerald-500/50"
                        : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground border border-border"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 10-Digit Interactive Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {digitsList.map((d) => {
            const item = NUMBERS_DATA[d]
            const isSelected = selectedDigit === d

            return (
              <div
                key={d}
                onClick={() => setSelectedDigit(d)}
                className={`group relative flex flex-col justify-between p-4 rounded-2xl bg-card border transition-all duration-200 cursor-pointer hover:shadow-xl hover:-translate-y-1 ${
                  isSelected
                    ? "border-emerald-500 ring-2 ring-emerald-500/40 shadow-lg bg-card/90"
                    : "border-border hover:border-emerald-500/50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 text-foreground font-black text-2xl group-hover:from-emerald-500 group-hover:to-cyan-500 group-hover:text-white transition-all">
                    {d}
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-emerald-950/40 text-emerald-300 border-emerald-800/60">
                    {item.name}
                  </span>
                </div>

                <div className="mt-3">
                  <p className="text-[11px] text-muted-foreground line-clamp-2 leading-tight">
                    {item.posture}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between">
                  <Link
                    to={`/learn/numbers/${d}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-[11px] font-bold text-emerald-400 group-hover:underline flex items-center gap-1"
                  >
                    <span>Practice</span>
                    <ChevronRight className="h-3 w-3" />
                  </Link>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      speakText(`Number ${item.name}`, currentLanguage)
                    }}
                    className="h-6 w-6 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
                    title="Pronounce"
                  >
                    <Volume2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Modal: Official MSJE Number Poster */}
        {showChartModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-500" />
                  <h3 className="font-bold text-sm text-foreground">
                    Official MSJE Indian Sign Language Numeric Reference Chart
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
