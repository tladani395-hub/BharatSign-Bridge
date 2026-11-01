import { useState } from "react"
import { Sparkles, Play, Volume2, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import ThreeAvatar from "@/components/avatar/ThreeAvatar"
import type { SignGesture } from "@/components/avatar/ThreeAvatar"
import { INDIC_LANGUAGES, speakText } from "@/lib/speech"

interface SignToken {
  id: string
  word: string
  gloss: string
  gesture: SignGesture
  duration: number
  facialBlendshape: string
}

interface SignCreatorStudioProps {
  currentLanguage: string
}

export default function SignCreatorStudio({ currentLanguage = "gu" }: SignCreatorStudioProps) {
  const [inputText, setInputText] = useState("Good morning. My name is Tirth. I am a university student.")
  const [activeTokenIdx, setActiveTokenIdx] = useState<number>(0)
  const [isPlayingSequence, setIsPlayingSequence] = useState<boolean>(false)
  const [copied, setCopied] = useState<boolean>(false)

  // Token breakdown
  const tokens: SignToken[] = [
    { id: "1", word: "Good", gloss: "GOOD", gesture: "NAMASTE", duration: 1.2, facialBlendshape: "gentle_smile" },
    { id: "2", word: "Morning", gloss: "MORNING", gesture: "NAMASTE", duration: 1.0, facialBlendshape: "head_nod" },
    { id: "3", word: "My Name", gloss: "NAME", gesture: "WHAT_IS_YOUR_NAME", duration: 1.5, facialBlendshape: "neutral" },
    { id: "4", word: "Tirth", gloss: "T-I-R-T-H", gesture: "THANK_YOU", duration: 1.8, facialBlendshape: "affirmative" },
    { id: "5", word: "I Am", gloss: "ME", gesture: "STUDENT", duration: 1.0, facialBlendshape: "self_focus" },
    { id: "6", word: "Student", gloss: "STUDENT-PERSON", gesture: "STUDENT", duration: 1.5, facialBlendshape: "smile" },
  ]

  const activeToken = tokens[activeTokenIdx] || tokens[0]
  const activeLang = INDIC_LANGUAGES.find((l) => l.code === currentLanguage) || INDIC_LANGUAGES[0]

  // Play through all signs sequentially
  const handlePlaySequence = () => {
    setIsPlayingSequence(true)
    let idx = 0
    const interval = setInterval(() => {
      idx++
      if (idx >= tokens.length) {
        clearInterval(interval)
        setIsPlayingSequence(false)
        setActiveTokenIdx(0)
      } else {
        setActiveTokenIdx(idx)
      }
    }, 1400)
  }

  const handleCopyText = () => {
    const glossSummary = tokens.map((t) => t.gloss).join(" ")
    navigator.clipboard.writeText(glossSummary)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Column: 3D Avatar Rendering */}
      <div className="lg:col-span-6 flex flex-col gap-4">
        <div className="p-4 rounded-2xl bg-card border border-border shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
            <span className="text-xs font-bold text-foreground">
              Sign Creator Avatar Stage — 3D Procedural View
            </span>
            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
              Active: {activeToken.gloss}
            </span>
          </div>

          <div className="aspect-[4/3] w-full rounded-xl overflow-hidden">
            <ThreeAvatar activeGesture={activeToken.gesture} showControls={false} />
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground px-1">
            <span>Blendshape: <strong className="text-foreground">{activeToken.facialBlendshape}</strong></span>
            <span>Duration: <strong className="text-foreground">{activeToken.duration}s</strong></span>
          </div>
        </div>
      </div>

      {/* Right Column: Sentence Input & Token Timeline */}
      <div className="lg:col-span-6 flex flex-col gap-5">
        <div className="p-6 rounded-2xl bg-card border border-border shadow-xl flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Interactive Sign Sequence Studio
            </span>
            <span className="text-xs text-primary font-bold">Linguistic Timeline</span>
          </div>

          {/* Sentence Input */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Sentence to Convert into ISL Sequence:
            </label>
            <textarea
              rows={3}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-input bg-background p-3.5 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
            />
          </div>

          {/* Sequence Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              onClick={handlePlaySequence}
              disabled={isPlayingSequence}
              className="gap-1.5 bg-primary text-white font-semibold shadow-md"
            >
              <Play className="h-3.5 w-3.5" />
              <span>{isPlayingSequence ? "Playing Sequence..." : "Play Complete Sign Sequence"}</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => speakText(inputText, currentLanguage)}
              className="gap-1.5"
            >
              <Volume2 className="h-3.5 w-3.5 text-primary" />
              <span>Listen in {activeLang.name}</span>
            </Button>

            <Button
              size="sm"
              variant="secondary"
              onClick={handleCopyText}
              className="gap-1.5"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? "Copied ISL Gloss" : "Copy ISL Gloss"}</span>
            </Button>
          </div>

          {/* Interactive Token Timeline Scrubber */}
          <div className="p-4 rounded-xl bg-muted/60 border border-border flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
              <span>Token Scrubber (Click any sign to jump avatar):</span>
              <span className="text-[11px] text-primary">{tokens.length} Signs Generated</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {tokens.map((token, idx) => (
                <button
                  key={token.id}
                  onClick={() => setActiveTokenIdx(idx)}
                  className={`p-2.5 rounded-xl text-left border transition-all ${
                    activeTokenIdx === idx
                      ? "bg-primary text-white border-primary shadow-md scale-102"
                      : "bg-card text-foreground border-border hover:bg-card/80"
                  }`}
                >
                  <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                    Step {idx + 1}
                  </div>
                  <div className="text-xs font-bold truncate mt-0.5">{token.gloss}</div>
                  <div className="text-[10px] opacity-75 truncate">({token.word})</div>
                </button>
              ))}
            </div>
          </div>

          <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>Preserves ISL grammar and facial non-manual blendshapes without word-for-word transliteration.</span>
          </div>
        </div>
      </div>
    </div>
  )
}
