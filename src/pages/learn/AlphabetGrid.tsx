import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  Volume2,
  Play,
  Pause,
  RotateCcw,
  ShieldCheck,
  Search,
  Filter,
  ChevronRight,
  Image as ImageIcon,
} from "lucide-react"
import ThreeAvatar from "@/components/avatar/ThreeAvatar"
import Breadcrumbs from "@/components/layout/Breadcrumbs"
import { Button } from "@/components/ui/button"
import { ALPHABETS_DATA } from "@/data/islData"
import { speakText } from "@/lib/speech"

interface AlphabetGridProps {
  currentLanguage: string
}

export default function AlphabetGrid({ currentLanguage }: AlphabetGridProps) {
  const [filter, setFilter] = useState<"all" | "one-handed" | "two-handed">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLetter, setSelectedLetter] = useState<string>("A")
  const [isPlayingSequence, setIsPlayingSequence] = useState(false)
  const [sequenceIndex, setSequenceIndex] = useState(0)
  const [signingSpeed, setSigningSpeed] = useState(1.0)
  const [showChartModal, setShowChartModal] = useState(false)

  const alphabetList = Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ")

  // Filter letters
  const filteredLetters = alphabetList.filter((letter) => {
    const data = ALPHABETS_DATA[letter]
    if (!data) return false
    const matchesSearch = letter.toLowerCase().includes(searchQuery.toLowerCase())
    if (!matchesSearch) return false

    if (filter === "one-handed") return data.hands === "One-handed"
    if (filter === "two-handed") return data.hands === "Two-handed"
    return true
  })

  // Continuous Sequence Auto-Player
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    if (isPlayingSequence) {
      timer = setTimeout(() => {
        setSequenceIndex((prev) => {
          const next = (prev + 1) % alphabetList.length
          setSelectedLetter(alphabetList[next])
          return next
        })
      }, 1600 / signingSpeed)
    }
    return () => clearTimeout(timer)
  }, [isPlayingSequence, sequenceIndex, signingSpeed])

  const toggleSequence = () => {
    if (!isPlayingSequence) {
      setSequenceIndex(alphabetList.indexOf(selectedLetter))
    }
    setIsPlayingSequence(!isPlayingSequence)
  }

  const selectedData = ALPHABETS_DATA[selectedLetter] || ALPHABETS_DATA["A"]

  return (
    <div className="min-h-screen bg-background text-foreground py-8">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col gap-8">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs
          items={[
            { label: "Learning Portal", href: "/learn" },
            { label: "Alphabets (A–Z)" },
          ]}
        />

        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary border border-primary/20 mb-2">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>ISLRTC Standard Finger Spelling System</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
              ISL English Alphabets (A–Z)
            </h1>
            <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
              Master the official 26 Indian Sign Language alphabet hand configurations, strictly preserving the two-handed and one-handed distinctions as published by ISLRTC.
            </p>
          </div>

          <Button
            variant="outline"
            className="gap-2 border-primary/40 text-primary hover:bg-primary/10 self-start md:self-auto text-xs"
            onClick={() => setShowChartModal(true)}
          >
            <ImageIcon className="h-4 w-4" />
            <span>Official ISLRTC Chart</span>
          </Button>
        </div>

        {/* Interactive Presenter & Sequence Player Banner */}
        <div className="rounded-3xl bg-gradient-to-br from-card via-slate-900 to-card border border-border p-6 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Avatar Preview */}
            <div className="lg:col-span-5 aspect-[4/3] rounded-2xl overflow-hidden bg-slate-950 border border-border/80 shadow-inner relative">
              <ThreeAvatar
                activeGesture={`LETTER_${selectedLetter}`}
                signingSpeed={signingSpeed}
                showControls={false}
                initialCameraView="hands"
              />
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white border border-white/10 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Letter {selectedLetter}</span>
              </div>
            </div>

            {/* Avatar Controls & Selected Letter Summary */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">
                    Selected Gesture
                  </span>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-4xl font-black text-foreground">
                      Letter '{selectedLetter}'
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                        selectedData.hands === "Two-handed"
                          ? "bg-cyan-950/60 text-cyan-300 border-cyan-800"
                          : "bg-indigo-950/60 text-indigo-300 border-indigo-800"
                      }`}
                    >
                      {selectedData.hands}
                    </span>
                  </div>
                </div>

                <Link to={`/learn/alphabet/${selectedLetter}`}>
                  <Button className="gap-2 text-xs font-bold shadow-md bg-primary hover:bg-primary/90 text-white">
                    <span>Open Full Lesson</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                {selectedData.posture}
              </p>

              {/* Sequence Playback Controls */}
              <div className="p-4 rounded-xl bg-background/50 border border-border flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={isPlayingSequence ? "destructive" : "default"}
                    onClick={toggleSequence}
                    className="gap-2 text-xs font-bold shadow"
                  >
                    {isPlayingSequence ? (
                      <>
                        <Pause className="h-3.5 w-3.5" />
                        <span>Pause Sequence</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-3.5 w-3.5" />
                        <span>Autoplay A–Z Sequence</span>
                      </>
                    )}
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsPlayingSequence(false)
                      setSelectedLetter("A")
                      setSequenceIndex(0)
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
                    onClick={() => speakText(`Letter ${selectedLetter}`, currentLanguage)}
                    className="h-7 w-7 p-0 ml-1"
                  >
                    <Volume2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </div>
              </div>

              {/* Mini Quick-Select Ribbon */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full">
                {alphabetList.map((ch) => (
                  <button
                    key={ch}
                    onClick={() => {
                      setSelectedLetter(ch)
                      setIsPlayingSequence(false)
                    }}
                    className={`h-8 w-8 rounded-lg text-xs font-bold shrink-0 transition-all ${
                      selectedLetter === ch
                        ? "bg-primary text-white scale-110 shadow-lg ring-2 ring-primary/50"
                        : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground border border-border"
                    }`}
                  >
                    {ch}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Handedness Filter Buttons */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-bold text-muted-foreground flex items-center gap-1 mr-1">
              <Filter className="h-3.5 w-3.5" />
              <span>Filter:</span>
            </span>
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === "all"
                  ? "bg-primary text-white shadow-sm"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              All Letters (26)
            </button>
            <button
              onClick={() => setFilter("one-handed")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === "one-handed"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              One-Handed (6)
            </button>
            <button
              onClick={() => setFilter("two-handed")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === "two-handed"
                  ? "bg-cyan-600 text-white shadow-sm"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              Two-Handed (20)
            </button>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search letter (e.g. A, B)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-card border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* 26-Letter Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredLetters.map((ch) => {
            const item = ALPHABETS_DATA[ch]
            const isSelected = selectedLetter === ch

            return (
              <div
                key={ch}
                onClick={() => setSelectedLetter(ch)}
                className={`group relative flex flex-col justify-between p-4 rounded-2xl bg-card border transition-all duration-200 cursor-pointer hover:shadow-xl hover:-translate-y-1 ${
                  isSelected
                    ? "border-primary ring-2 ring-primary/40 shadow-lg bg-card/90"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-cyan-500/20 text-foreground font-black text-2xl group-hover:from-primary group-hover:to-cyan-500 group-hover:text-white transition-all">
                    {ch}
                  </div>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                      item.hands === "Two-handed"
                        ? "bg-cyan-950/50 text-cyan-300 border-cyan-800/60"
                        : "bg-indigo-950/50 text-indigo-300 border-indigo-800/60"
                    }`}
                  >
                    {item.hands === "Two-handed" ? "2-Hand" : "1-Hand"}
                  </span>
                </div>

                <div className="mt-3">
                  <p className="text-[11px] text-muted-foreground line-clamp-2 leading-tight">
                    {item.posture}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between">
                  <Link
                    to={`/learn/alphabet/${ch}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-[11px] font-bold text-primary group-hover:underline flex items-center gap-1"
                  >
                    <span>Practice</span>
                    <ChevronRight className="h-3 w-3" />
                  </Link>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      speakText(`Letter ${ch}`, currentLanguage)
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

        {/* Modal: Official Reference Diagram Preview */}
        {showChartModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-500" />
                  <h3 className="font-bold text-sm text-foreground">
                    Official ISLRTC Indian Sign Language Alphabet Chart
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
                  src="/assets/isl_alphabets.png"
                  alt="Official ISLRTC Indian Sign Language Alphabet Chart"
                  className="max-h-[70vh] object-contain rounded-lg"
                />
                <p className="mt-3 text-xs text-muted-foreground text-center">
                  Official Standard Chart for Letters A–Z published by Indian Sign Language Research and Training Centre (ISLRTC), New Delhi.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
