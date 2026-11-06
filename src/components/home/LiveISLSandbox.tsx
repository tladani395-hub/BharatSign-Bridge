import { useState } from "react"
import { Send, Volume2, Sparkles, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { speakText, INDIC_LANGUAGES } from "@/lib/speech"
import type { SignGesture } from "@/components/avatar/ThreeAvatar"

interface SandboxProps {
  currentLanguage: string
  onGestureChange: (gesture: SignGesture) => void
}

interface SampleSentence {
  text: string
  lang: string
  gloss: string[]
  primaryGesture: SignGesture
  english: string
}

const SAMPLE_SENTENCES: SampleSentence[] = [
  {
    text: "નમસ્તે, કેમ છો?",
    lang: "gu",
    gloss: ["નમસ્તે", "તમે", "કેમ"],
    primaryGesture: "NAMASTE",
    english: "Namaste, how are you?",
  },
  {
    text: "તમારો ખૂબ ખૂબ આભાર",
    lang: "gu",
    gloss: ["તમારો", "આભાર"],
    primaryGesture: "THANK_YOU",
    english: "Thank you very much",
  },
  {
    text: "હું એક વિદ્યાર્થી છું",
    lang: "gu",
    gloss: ["હું", "વિદ્યાર્થી", "હોવું"],
    primaryGesture: "STUDENT",
    english: "I am a student",
  },
  {
    text: "મને પીવાનું પાણી જોઈએ છે",
    lang: "gu",
    gloss: ["પાણી", "મને", "જોઈએ"],
    primaryGesture: "WATER",
    english: "I need drinking water",
  },
  {
    text: "કૃપા કરીને મારી મદદ કરો",
    lang: "gu",
    gloss: ["મદદ", "કૃપા", "કરવી"],
    primaryGesture: "HELP",
    english: "Please help me",
  },
  {
    text: "ભારત આપણો મહાન દેશ છે",
    lang: "gu",
    gloss: ["ભારત", "દેશ", "મહાન"],
    primaryGesture: "INDIA",
    english: "India is our great country",
  },
]

export default function LiveISLSandbox({ currentLanguage, onGestureChange }: SandboxProps) {
  const [inputText, setInputText] = useState("નમસ્તે, કેમ છો?")
  const [activeGloss, setActiveGloss] = useState<string[]>(["નમસ્તે", "તમે", "કેમ"])
  const [isTranslating, setIsTranslating] = useState(false)

  const langObj = INDIC_LANGUAGES.find((l) => l.code === currentLanguage) || INDIC_LANGUAGES[0]

  const handleSelectSample = (sample: SampleSentence) => {
    setInputText(sample.text)
    setActiveGloss(sample.gloss)
    onGestureChange(sample.primaryGesture)
    speakText(sample.text, sample.lang)
  }

  const handleTranslateCustom = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim()) return

    setIsTranslating(true)
    const words = inputText.trim().split(/\s+/)

    // Match to known gesture
    let bestGesture: SignGesture = "NAMASTE"
    const lower = inputText.toLowerCase()

    if (lower.includes("પાણી") || lower.includes("water") || lower.includes("पानी")) {
      bestGesture = "WATER"
    } else if (lower.includes("આભાર") || lower.includes("thank") || lower.includes("धन्यवाद")) {
      bestGesture = "THANK_YOU"
    } else if (lower.includes("વિદ્યાર્થી") || lower.includes("student") || lower.includes("छात्र")) {
      bestGesture = "STUDENT"
    } else if (lower.includes("મદદ") || lower.includes("help") || lower.includes("सहायता")) {
      bestGesture = "HELP"
    } else if (lower.includes("ભારત") || lower.includes("india") || lower.includes("भारत")) {
      bestGesture = "INDIA"
    } else if (lower.includes("હેલો") || lower.includes("hello") || lower.includes("કેમ")) {
      bestGesture = "HELLO"
    } else if (lower.includes("સ્વાગત") || lower.includes("welcome")) {
      bestGesture = "WELCOME"
    }

    setTimeout(() => {
      setActiveGloss(words)
      onGestureChange(bestGesture)
      speakText(inputText, currentLanguage)
      setIsTranslating(false)
    }, 350)
  }

  return (
    <div className="rounded-3xl bg-card border border-border p-6 shadow-2xl relative overflow-hidden backdrop-blur-xl">
      <div className="flex flex-col gap-4">
        {/* Title bar */}
        <div className="flex items-center justify-between pb-3 border-b border-border text-xs">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-foreground text-sm">Instant ISL Grammar & Gesture Sandbox</h3>
              <p className="text-[11px] text-muted-foreground">Type or tap sentences to see Time-Subject-Object-Verb decomposition</p>
            </div>
          </div>
          <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
            SOV Parser Active
          </span>
        </div>

        {/* Quick Sample Sentence Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold text-muted-foreground mr-1">
            Quick Prompts:
          </span>
          {SAMPLE_SENTENCES.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectSample(sample)}
              className="px-2.5 py-1 rounded-xl text-xs font-bold bg-muted/80 hover:bg-primary hover:text-white transition-all text-muted-foreground border border-border hover:border-primary/50"
            >
              {sample.text}
            </button>
          ))}
        </div>

        {/* Custom Input Form */}
        <form onSubmit={handleTranslateCustom} className="flex gap-2">
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type any sentence in Gujarati, Hindi, English..."
            className="h-11 rounded-xl bg-background border-border text-xs font-semibold px-4"
          />
          <Button
            type="submit"
            disabled={isTranslating}
            className="h-11 px-5 bg-primary hover:bg-primary/90 text-white font-bold gap-1.5 rounded-xl shrink-0"
          >
            <Send className="h-4 w-4" />
            <span>Simulate</span>
          </Button>
        </form>

        {/* Real-time ISL Gloss Decomposition Chain */}
        <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              ISL Gloss Syntax Output:
            </span>
            <button
              type="button"
              onClick={() => speakText(inputText, currentLanguage)}
              className="flex items-center gap-1 text-[11px] text-primary hover:underline font-bold"
            >
              <Volume2 className="h-3.5 w-3.5" />
              <span>Hear in {langObj.name}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {activeGloss.map((token, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-xl bg-card border border-primary/30 text-primary font-bold text-xs shadow-sm flex items-center gap-1 animate-pulse-glow">
                  <span>[{token}]</span>
                </span>
                {i < activeGloss.length - 1 && (
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
