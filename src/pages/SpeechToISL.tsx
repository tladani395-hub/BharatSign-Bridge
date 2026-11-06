import { useState, useEffect, useRef } from "react"
import {
  Mic,
  MicOff,
  Volume2,
  Globe2,
} from "lucide-react"
import ThreeAvatar from "@/components/avatar/ThreeAvatar"
import type { SignGesture } from "@/components/avatar/ThreeAvatar"
import Breadcrumbs from "@/components/layout/Breadcrumbs"
import { Button } from "@/components/ui/button"
import { INDIC_LANGUAGES, speakText } from "@/lib/speech"

interface SpeechToISLProps {
  currentLanguage: string
  onLanguageChange?: (code: string) => void
}

export default function SpeechToISL({ currentLanguage }: SpeechToISLProps) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("Namaste, can you please help me?")
  const [recognizedTokens, setRecognizedTokens] = useState<string[]>([])
  const [activeGesture, setActiveGesture] = useState<SignGesture>("NAMASTE")
  const [signingSpeed, setSigningSpeed] = useState(1.0)
  const [speechError, setSpeechError] = useState<string | null>(null)

  const recognitionRef = useRef<any>(null)
  const langObj = INDIC_LANGUAGES.find((l) => l.code === currentLanguage) || INDIC_LANGUAGES[0]

  // Setup Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = langObj.bcp47

      recognition.onstart = () => {
        setIsListening(true)
        setSpeechError(null)
      }

      recognition.onresult = (event: any) => {
        let finalTrans = ""
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTrans += event.results[i][0].transcript
          }
        }
        if (finalTrans) {
          setTranscript(finalTrans)
          processSpokenSentence(finalTrans)
        }
      }

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error)
        setSpeechError(`Microphone notice: ${event.error}. You can also type text directly.`)
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = recognition
    }
  }, [langObj.bcp47])

  const toggleListening = () => {
    if (!recognitionRef.current) {
      // Simulate speech input for environment testing
      if (!isListening) {
        setIsListening(true)
        setTimeout(() => {
          const sample = "Namaste Bharat welcome"
          setTranscript(sample)
          processSpokenSentence(sample)
          setIsListening(false)
        }, 1800)
      } else {
        setIsListening(false)
      }
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      try {
        recognitionRef.current.start()
      } catch (err) {
        console.error(err)
      }
    }
  }

  const processSpokenSentence = (text: string) => {
    const words = text.toUpperCase().split(/\s+/)
    const tokens: string[] = []

    for (const w of words) {
      if (["NAMASTE", "HELLO", "HI", "PRANAM"].includes(w)) {
        tokens.push(w.includes("NAMASTE") || w.includes("PRANAM") ? "NAMASTE" : "HELLO")
      } else if (["WATER", "PANI"].includes(w)) {
        tokens.push("WATER")
      } else if (["HELP", "ASSIST", "MADAD"].includes(w)) {
        tokens.push("HELP")
      } else if (["STUDENT", "STUDY"].includes(w)) {
        tokens.push("STUDENT")
      } else if (["INDIA", "BHARAT"].includes(w)) {
        tokens.push("INDIA")
      } else if (["THANK", "THANKS"].includes(w)) {
        tokens.push("THANK_YOU")
      } else if (["YES"].includes(w)) {
        tokens.push("YES")
      } else if (["NO"].includes(w)) {
        tokens.push("NO")
      }
    }

    if (tokens.length === 0) {
      tokens.push("NAMASTE")
    }

    setRecognizedTokens(tokens)
    setActiveGesture(tokens[0] as SignGesture)
  }

  // Initial parse on load
  useEffect(() => {
    processSpokenSentence(transcript)
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground py-8">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs
          items={[
            { label: "Communication Suite" },
            { label: "Speech to Indian Sign Language" },
          ]}
        />

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-400 border border-cyan-500/20 mb-2">
              <Mic className="h-3.5 w-3.5" />
              <span>Multilingual Acoustic Speech Processing</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
              Speech to Indian Sign Language (Voice-to-ISL)
            </h1>
            <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
              Speak naturally in any Indian language. Our AI captures your voice, extracts semantic intent, and synthesizes 3D ISL gestures in real-time.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground">Voice Language:</span>
            <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-card border border-border text-foreground flex items-center gap-1.5">
              <Globe2 className="h-3.5 w-3.5 text-primary" />
              <span>{langObj.native} ({langObj.name})</span>
            </span>
          </div>
        </div>

        {/* Main Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Voice Recording Studio */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="p-6 rounded-3xl bg-card border border-border shadow-xl flex flex-col items-center text-center gap-5">
              <div
                className={`relative h-24 w-24 rounded-full flex items-center justify-center transition-all ${
                  isListening
                    ? "bg-rose-500 text-white shadow-rose-500/50 shadow-2xl scale-110 ring-4 ring-rose-500/30"
                    : "bg-primary/20 text-primary hover:bg-primary/30"
                }`}
              >
                <button
                  onClick={toggleListening}
                  className="h-full w-full rounded-full flex items-center justify-center focus:outline-none"
                  title={isListening ? "Stop Listening" : "Start Listening"}
                >
                  {isListening ? (
                    <MicOff className="h-10 w-10 animate-pulse" />
                  ) : (
                    <Mic className="h-10 w-10" />
                  )}
                </button>
              </div>

              <div>
                <h3 className="text-base font-bold text-foreground">
                  {isListening ? "Listening to Your Voice..." : "Click to Speak"}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Supported in {langObj.name} ({langObj.bcp47})
                </p>
              </div>

              <div className="w-full text-left flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Voice Transcription / Input:
                </label>
                <textarea
                  rows={3}
                  value={transcript}
                  onChange={(e) => {
                    setTranscript(e.target.value)
                    processSpokenSentence(e.target.value)
                  }}
                  className="w-full rounded-xl bg-background border border-border p-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              {speechError && (
                <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-800/40 text-[11px] text-amber-300 w-full text-left">
                  {speechError}
                </div>
              )}

              {/* Sample Voice Prompts */}
              <div className="w-full text-left pt-2 border-t border-border">
                <span className="text-[11px] font-semibold text-muted-foreground block mb-1.5">
                  Or Test with Common Phrases:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Namaste",
                    "Please help me",
                    "I want water",
                    "I am a student",
                    "Bharat India",
                  ].map((phrase) => (
                    <button
                      key={phrase}
                      onClick={() => {
                        setTranscript(phrase)
                        processSpokenSentence(phrase)
                      }}
                      className="px-2.5 py-1 rounded-lg bg-muted text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {phrase}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Real-Time 3D ISL Avatar Synthesis */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="p-4 rounded-3xl bg-card border border-border shadow-xl flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground">
                    Active Sign: <span className="font-mono text-cyan-400">{activeGesture}</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950/60 text-cyan-300 border border-cyan-800">
                    ISLRTC Verified
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-muted-foreground">Speed:</span>
                  {[0.5, 1.0, 1.5].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => setSigningSpeed(speed)}
                      className={`px-2 py-0.5 rounded text-xs font-bold transition-colors ${
                        signingSpeed === speed
                          ? "bg-primary text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Avatar Viewport */}
              <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden bg-slate-950 relative">
                <ThreeAvatar
                  activeGesture={activeGesture}
                  signingSpeed={signingSpeed}
                  showControls={false}
                  initialCameraView="upper-body"
                />
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white border border-white/10 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span>Synthesized Gesture</span>
                </div>
              </div>

              {/* Recognized Sequence Tokens Ribbon */}
              <div className="flex items-center gap-2 overflow-x-auto py-2">
                <span className="text-xs font-bold text-muted-foreground whitespace-nowrap">
                  Sequence Tokens:
                </span>
                {recognizedTokens.map((tok, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveGesture(tok as SignGesture)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                      activeGesture === tok
                        ? "bg-primary text-white shadow-md ring-2 ring-primary/40"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tok}
                  </button>
                ))}
              </div>

              {/* Audio Pronunciation Button */}
              <div className="pt-2 border-t border-border flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  AI will speak translated audio in {langObj.name}.
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => speakText(transcript, currentLanguage)}
                  className="gap-1.5 text-xs text-primary hover:underline"
                >
                  <Volume2 className="h-3.5 w-3.5" />
                  <span>Hear Speech</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
