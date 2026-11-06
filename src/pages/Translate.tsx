import { useState, useEffect } from "react"
import {
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Copy,
  Check,
  Globe,
} from "lucide-react"
import ThreeAvatar from "@/components/avatar/ThreeAvatar"
import type { SignGesture } from "@/components/avatar/ThreeAvatar"
import Breadcrumbs from "@/components/layout/Breadcrumbs"
import { Button } from "@/components/ui/button"
import { speakText, INDIC_LANGUAGES } from "@/lib/speech"

interface SignToken {
  id: string
  word: string
  gloss: string
  gesture: SignGesture
  duration: number
  isFingerspelled?: boolean
}

interface TranslateProps {
  currentLanguage: string
  onLanguageChange?: (code: string) => void
}

function parseTextToTokens(text: string): SignToken[] {
  const clean = text.trim()
  if (!clean) {
    return [
      {
        id: "1",
        word: "Namaste",
        gloss: "NAMASTE",
        gesture: "NAMASTE",
        duration: 1.3,
      },
    ]
  }

  const rawWords = clean.split(/\s+/)
  const result: SignToken[] = []
  let idCounter = 1

  // Multilingual keyword dictionaries covering all 13 Indic languages
  const GREETINGS_KEYWORDS = [
    "HELLO", "HI", "HEY", "NAMASTE", "PRANAM", "GREETINGS",
    "नमस्ते", "नमस्कार", "प्रणाम", "हैलो", "हॅलो",
    "નમસ્તે", "પ્રણામ", "હેલો",
    "নমস্কার", "হ্যালো", "প্রণাম",
    "வணக்கம்", "ஹலோ",
    "నమస్కారం", "హలో",
    "ನಮಸ್ಕಾರ", "ಹಲೋ",
    "നമസ്കാരം", "ഹലോ",
    "ਸਤਿ", "ਸ੍ਰੀ", "ਅਕਾਲ", "ਹੈਲੋ",
    "ନମସ୍କାର",
    "নমস্কাৰ", "হেল্ল'",
    "سلام", "آداب", "ہیلو"
  ]

  const THANK_YOU_KEYWORDS = [
    "THANK", "THANKS", "THANKYOU", "DHANYAVAD", "ABHAR", "GRATITUDE",
    "धन्यवाद", "शुक्रिया", "आभार",
    "આભાર", "ધન્યવાદ",
    "ধন্যবাদ", "শুকরিয়া",
    "நன்றி",
    "ధన్యవాదాలు",
    "ಧನ್ಯವಾದಗಳು",
    "നന്ദി",
    "ਧੰਨਵਾਦ",
    "ଧନ୍ୟବାଦ",
    "شکریہ"
  ]

  const WELCOME_KEYWORDS = [
    "WELCOME", "SWAGATAM",
    "स्वागत", "स्वागतम्", "स्वागतम",
    "સ્વાગત",
    "স্বাগতম",
    "வரவேற்கிறோம்",
    "స్వాగతం",
    "ಸ್ವಾಗತ",
    "സ്വാഗതം",
    "ਜੀ", "ਆਇਆਂ",
    "ସ୍ୱାଗତ",
    "خوش", "آمدید"
  ]

  const WATER_KEYWORDS = [
    "WATER", "DRINK", "PANI", "JAL",
    "पानी", "जल",
    "પાણી",
    "জল",
    "தண்ணீர்",
    "నీరు", "నీళ్ళు",
    "ನೀರು",
    "വെള്ളം",
    "ਪਾਣੀ",
    "ପାଣି",
    "পানী",
    "پانی"
  ]

  const HELP_KEYWORDS = [
    "HELP", "ASSIST", "EMERGENCY", "MADAD", "SAHAYATA",
    "मदद", "सहायता", "मदत",
    "મદદ", "સહાય",
    "সাহায্য",
    "உதவி",
    "సహాయం",
    "ಸಹಾಯ",
    "സഹായം",
    "ਮਦਦ",
    "ସାହାଯ୍ୟ",
    "সহায়",
    "مدد"
  ]

  const STUDENT_KEYWORDS = [
    "STUDENT", "LEARNER", "COLLEGE", "SCHOOL", "STUDY", "LEARN", "VIDYARTHI", "CHHATRA",
    "विद्यार्थी", "छात्र", "छात्रा",
    "વિદ્યાર્થી",
    "ছাত্র", "ছাত্রী", "শিক্ষার্থী",
    "மாணவர்", "மாணவி",
    "విద్యార్థి",
    "ವಿದ್ಯಾರ್ಥಿ",
    "വിദ്യാർത്ഥി",
    "ਵਿਦਿਆਰਥੀ",
    "ଛାତ୍ର", "ଛାତ୍ରୀ",
    "ছাত্ৰ", "ছাত্ৰী",
    "طالب", "علم"
  ]

  const INDIA_KEYWORDS = [
    "INDIA", "BHARAT", "HINDUSTAN",
    "भारत", "हिन्दुस्तान",
    "ભારત",
    "ভারত",
    "இந்தியா",
    "భారతదేశం", "భారత్",
    "ಭಾರತ",
    "ഭാരതം",
    "ਭਾਰਤ",
    "ଭାରତ",
    "ভাৰত",
    "ہندوستان", "بھارت"
  ]

  const YES_KEYWORDS = [
    "YES", "CORRECT", "TRUE", "AGREE", "HAAN",
    "हाँ", "हां", "होय", "बिल्कुल",
    "હા", "ચોક્કસ",
    "হ্যাঁ",
    "ஆம்",
    "అవును",
    "ಹೌದು",
    "അതെ",
    "ਹਾਂ",
    "ହଁ",
    "হয়",
    "ہاں"
  ]

  const NO_KEYWORDS = [
    "NO", "NOT", "FALSE", "DISAGREE", "NAHI", "NA",
    "नहीं", "ना", "नाही",
    "ના", "નહીં",
    "না",
    "இல்லை",
    "కాదు", "లేదు",
    "ಇಲ್ಲ",
    "അല്ല",
    "ਨਹੀਂ",
    "ନାହିଁ",
    "নহয়",
    "نہیں"
  ]

  const ISL_STOP_WORDS = new Set([
    "TO", "THE", "IS", "ARE", "AM", "A", "AN", "OF", "FOR", "IN", "ON", "AT", "BY", "AND", "IT",
    "KA", "KE", "KI", "KO", "SE", "MEIN", "PAR", "HAI", "HEIN"
  ])

  for (const raw of rawWords) {
    const cleanWord = raw.replace(/[.,/#!$%^&*;:{}=\-_`~()?"'<>]/g, "").trim()
    if (!cleanWord) continue
    const wUpper = cleanWord.toUpperCase()

    // Skip grammatical stop words in sign language
    if (ISL_STOP_WORDS.has(wUpper)) {
      continue
    }

    // Single digits
    if (/^[0-9]$/.test(wUpper)) {
      result.push({
        id: String(idCounter++),
        word: raw,
        gloss: `DIGIT-${wUpper}`,
        gesture: `NUMBER_${wUpper}` as SignGesture,
        duration: 1.0,
      })
      continue
    }

    const matchesList = (list: string[]) =>
      list.some((k) => k === wUpper || cleanWord.includes(k) || k.includes(cleanWord))

    if (matchesList(GREETINGS_KEYWORDS)) {
      result.push({
        id: String(idCounter++),
        word: raw,
        gloss: "NAMASTE",
        gesture: "NAMASTE",
        duration: 1.4,
      })
    } else if (matchesList(THANK_YOU_KEYWORDS)) {
      result.push({
        id: String(idCounter++),
        word: raw,
        gloss: "THANK-YOU",
        gesture: "THANK_YOU",
        duration: 1.2,
      })
    } else if (matchesList(WELCOME_KEYWORDS)) {
      result.push({
        id: String(idCounter++),
        word: raw,
        gloss: "WELCOME",
        gesture: "WELCOME",
        duration: 1.4,
      })
    } else if (matchesList(INDIA_KEYWORDS)) {
      result.push({
        id: String(idCounter++),
        word: raw,
        gloss: "BHARAT-INDIA",
        gesture: "INDIA",
        duration: 1.3,
      })
    } else if (matchesList(STUDENT_KEYWORDS)) {
      result.push({
        id: String(idCounter++),
        word: raw,
        gloss: "STUDENT",
        gesture: "STUDENT",
        duration: 1.3,
      })
    } else if (matchesList(HELP_KEYWORDS)) {
      result.push({
        id: String(idCounter++),
        word: raw,
        gloss: "HELP-NEED",
        gesture: "HELP",
        duration: 1.4,
      })
    } else if (matchesList(WATER_KEYWORDS)) {
      result.push({
        id: String(idCounter++),
        word: raw,
        gloss: "WATER",
        gesture: "WATER",
        duration: 1.2,
      })
    } else if (matchesList(YES_KEYWORDS)) {
      result.push({
        id: String(idCounter++),
        word: raw,
        gloss: "YES",
        gesture: "YES",
        duration: 1.1,
      })
    } else if (matchesList(NO_KEYWORDS)) {
      result.push({
        id: String(idCounter++),
        word: raw,
        gloss: "NO",
        gesture: "NO",
        duration: 1.1,
      })
    } else {
      // Latin letters: fingerspell pronounceable words only (reject keyboard mashing)
      const asciiOnly = cleanWord.replace(/[^a-zA-Z0-9]/g, "").toUpperCase()
      const isMashing = asciiOnly.length > 7 && !/[AEIOUY]/.test(asciiOnly)

      if (asciiOnly.length > 0 && !isMashing && asciiOnly.length <= 12) {
        for (const char of asciiOnly) {
          if (/^[A-Z]$/.test(char)) {
            result.push({
              id: String(idCounter++),
              word: char,
              gloss: `FS-${char}`,
              gesture: `LETTER_${char}` as SignGesture,
              duration: 0.9,
              isFingerspelled: true,
            })
          }
        }
      }
    }
  }

  return result
}

export default function Translate({ currentLanguage, onLanguageChange }: TranslateProps) {
  const [inputText, setInputText] = useState("Namaste Bharat! Welcome to BharatSign Bridge")
  const [tokens, setTokens] = useState<SignToken[]>([])
  const [activeTokenIndex, setActiveTokenIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [signingSpeed, setSigningSpeed] = useState(1.0)
  const [activeCameraView, setActiveCameraView] = useState<
    "full-body" | "upper-body" | "hands" | "right-hand" | "left-hand" | "face"
  >("upper-body")
  const [copied, setCopied] = useState(false)

  // Re-parse tokens when text changes
  useEffect(() => {
    const parsed = parseTextToTokens(inputText)
    setTokens(parsed)
    setActiveTokenIndex(0)
    setIsPlaying(false)
  }, [inputText])

  // Sequential Playback Timer
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    if (isPlaying && tokens.length > 0) {
      const currentToken = tokens[activeTokenIndex]
      const durationMs = (currentToken?.duration || 1.2) * (1000 / signingSpeed)

      timer = setTimeout(() => {
        if (activeTokenIndex < tokens.length - 1) {
          setActiveTokenIndex((prev) => prev + 1)
        } else {
          setIsPlaying(false)
        }
      }, durationMs)
    }
    return () => clearTimeout(timer)
  }, [isPlaying, activeTokenIndex, tokens, signingSpeed])

  const handlePlayToggle = () => {
    if (!isPlaying && activeTokenIndex >= tokens.length - 1) {
      setActiveTokenIndex(0)
    }
    setIsPlaying(!isPlaying)
  }

  const handleReset = () => {
    setIsPlaying(false)
    setActiveTokenIndex(0)
  }

  const handleCopyGloss = () => {
    const glossStr = tokens.map((t) => t.gloss).join(" ")
    navigator.clipboard.writeText(glossStr)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePronounce = () => {
    speakText(inputText, currentLanguage)
  }

  const currentToken = tokens[activeTokenIndex] || tokens[0]

  return (
    <div className="min-h-screen bg-background text-foreground py-8">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs
          items={[
            { label: "Communication Suite" },
            { label: "Text to Indian Sign Language" },
          ]}
        />

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary border border-primary/20 mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              <span>NLP Gloss Generator & 3D Kinematics</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
              Text to Indian Sign Language (ISL) Studio
            </h1>
            <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
              Type any sentence or message. Our NLP parser matches standard ISLRTC vocabulary glosses and dynamically fingerspells unknown words using authentic hand configurations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePronounce}
              className="gap-1.5 text-xs"
            >
              <Volume2 className="h-3.5 w-3.5 text-primary" />
              <span>Hear Aloud</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyGloss}
              className="gap-1.5 text-xs"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? "Gloss Copied" : "Copy Gloss"}</span>
            </Button>
          </div>
        </div>

        {/* 2-Column Studio: Left Editor, Right 3D Avatar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Text Input & Token Timeline */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <div className="p-5 rounded-2xl bg-card border border-border shadow-md flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Input Sentence:
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-muted px-2 py-1 rounded-lg border border-border">
                    <Globe className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="text-[11px] font-semibold text-muted-foreground">Voice Language:</span>
                    <select
                      value={currentLanguage}
                      onChange={(e) => onLanguageChange && onLanguageChange(e.target.value)}
                      className="bg-transparent text-foreground text-xs font-bold cursor-pointer focus:outline-none"
                    >
                      {INDIC_LANGUAGES.map((l) => (
                        <option key={l.code} value={l.code} className="bg-card text-foreground">
                          {l.name} ({l.native})
                        </option>
                      ))}
                    </select>
                  </div>
                  <span className="text-[11px] text-muted-foreground hidden sm:inline">
                    {inputText.length} chars
                  </span>
                </div>
              </div>

              <textarea
                rows={3}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type a sentence in any of the 13 Indian languages (English, हिन्दी, ગુજરાતી, मराठी, বাংলা, தமிழ், తెలుగు, ಕನ್ನಡ, മലയാളം, ਪੰਜਾਬੀ, ଓଡ଼ିଆ, অসমীয়া, اردو)..."
                className="w-full rounded-xl bg-background border border-border p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none font-sans"
              />

              {/* Sample Quick Phrases across 13 Indic Languages */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] font-semibold text-muted-foreground mr-1">
                  Sample Prompts:
                </span>
                {(
                  {
                    en: ["Namaste Bharat", "I am a student", "Please help me", "Drink water", "Welcome friend"],
                    hi: ["नमस्ते भारत", "मैं एक विद्यार्थी हूँ", "कृपया मेरी मदद करें", "पीने का पानी", "स्वागत है"],
                    gu: ["નમસ્તે ભારત", "હું એક વિદ્યાર્થી છું", "મને મદદની જરૂર છે", "પીવાનું પાણી", "સ્વાગત છે"],
                    mr: ["नमस्कार भारत", "मी एक विद्यार्थी आहे", "मला मदत हवी आहे", "पिण्याचे पाणी", "स्वागत आहे"],
                    bn: ["নমস্কার ভারত", "আমি একজন শিক্ষার্থী", "আমার সাহায্য প্রয়োজন", "খাবার জল", "স্বাগতম"],
                    ta: ["வணக்கம் இந்தியா", "நான் ஒரு மாணவன்", "எனக்கு உதவி தேவை", "குடிநீர்", "வரவேற்கிறோம்"],
                    te: ["నమస్కారం భారతదేశం", "నేను విద్యార్థిని", "నాకు సహాయం కావాలి", "మంచి నీళ్ళు", "స్వాగతం"],
                    kn: ["ನಮಸ್ಕಾರ ಭಾರತ", "ನಾನು ವಿದ್ಯಾರ್ಥಿ", "ನನಗೆ ಸಹಾಯ ಬೇಕು", "ಕುಡಿಯುವ ನೀರು", "ಸ್ವಾಗತ"],
                    ml: ["നമസ്കാരം ഭാരതം", "ഞാൻ ഒരു വിദ്യാർത്ഥിയാണ്", "എനിക്ക് സഹായം വേണം", "വെള്ളം", "സ്വാഗതം"],
                    pa: ["ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਭਾਰਤ", "ਮੈਂ ਵਿਦਿਆਰਥੀ ਹਾਂ", "ਮੈਨੂੰ ਮਦਦ ਚਾਹੀਦੀ ਹੈ", "ਪੀਣ ਦਾ ਪਾਣੀ", "ਜੀ ਆਇਆਂ ਨੂੰ"],
                    or: ["ନମସ୍କାର ଭାରତ", "ମୁଁ ଜଣେ ଛାତ୍ର", "ମୋତେ ସାହାଯ୍ୟ ଦରକାର", "ପିଇବା ପାଣି", "ସ୍ୱାଗତ"],
                    as: ["নমস্কাৰ ভাৰত", "মই এজন ছাত্ৰ", "মোক সহায় লাগে", "খোৱা পানী", "স্বাগতম"],
                    ur: ["سلام ہندوستان", "میں طالب علم ہوں", "مجھے مدد چاہیے", "پینے کا پانی", "خوش آمدید"],
                  }[currentLanguage] || [
                    "Namaste Bharat",
                    "I am a student",
                    "Please help me",
                    "Drink water",
                    "Welcome friend",
                  ]
                ).map((sample) => (
                  <button
                    key={sample}
                    onClick={() => setInputText(sample)}
                    className="px-2.5 py-1 rounded-lg bg-muted text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                  >
                    {sample}
                  </button>
                ))}
              </div>

              {/* Gloss Sequence Stream */}
              <div className="pt-3 border-t border-border flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-foreground">
                    ISL Linguistic Gloss Breakdown ({tokens.length} gestures):
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Click token to jump
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-2 rounded-xl bg-slate-950/60 border border-border">
                  {tokens.length === 0 ? (
                    <div className="w-full py-4 text-center text-xs text-amber-400">
                      No matching ISL signs found for input. Try keywords (e.g. 'Namaste', 'Water', 'Help', numbers, or words to fingerspell).
                    </div>
                  ) : (
                    tokens.map((tok, idx) => {
                      const isActive = activeTokenIndex === idx
                      return (
                        <button
                          key={tok.id}
                          onClick={() => {
                            setActiveTokenIndex(idx)
                            setIsPlaying(false)
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1 ${
                            isActive
                              ? "bg-primary text-white scale-105 shadow-md ring-2 ring-primary/40"
                              : tok.isFingerspelled
                              ? "bg-cyan-950/40 text-cyan-300 border border-cyan-800/60 hover:bg-cyan-900/60"
                              : "bg-muted text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <span>{tok.gloss}</span>
                          {tok.isFingerspelled && (
                            <span className="text-[8px] opacity-75 font-sans">(FS)</span>
                          )}
                        </button>
                      )
                    })
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Avatar Presenter Studio */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <div className="p-4 rounded-2xl bg-card border border-border shadow-xl flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground">
                    Active Gloss:{" "}
                    <span className="font-mono text-cyan-400">
                      {currentToken?.gloss || "NAMASTE"}
                    </span>
                  </span>
                  {currentToken?.isFingerspelled && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950/60 text-cyan-300 border border-cyan-800">
                      ISLRTC Fingerspelling
                    </span>
                  )}
                </div>

                <span className="text-[11px] text-muted-foreground">
                  Step {activeTokenIndex + 1} of {tokens.length}
                </span>
              </div>

              {/* Avatar Viewport */}
              <div className="aspect-[4/3] w-full rounded-xl overflow-hidden bg-slate-950 relative">
                <ThreeAvatar
                  activeGesture={currentToken?.gesture || "NAMASTE"}
                  signingSpeed={signingSpeed}
                  showControls={false}
                  initialCameraView={activeCameraView}
                />
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white border border-white/10 flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isPlaying ? "bg-emerald-400 animate-pulse" : "bg-muted-foreground"
                    }`}
                  />
                  <span>{isPlaying ? "Playing Sequence..." : "Paused"}</span>
                </div>
              </div>

              {/* Camera Presets Ribbon */}
              <div className="flex items-center justify-between gap-1 overflow-x-auto py-1">
                {(
                  [
                    { id: "upper-body", label: "Upper Body" },
                    { id: "hands", label: "Both Hands" },
                    { id: "right-hand", label: "Right Hand" },
                    { id: "face", label: "Facial Markers" },
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

              {/* Controls Bar */}
              <div className="p-3 rounded-xl bg-background/60 border border-border flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={isPlaying ? "destructive" : "default"}
                    onClick={handlePlayToggle}
                    className="gap-2 text-xs font-bold shadow"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="h-3.5 w-3.5" />
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-3.5 w-3.5" />
                        <span>Play ISL Animation</span>
                      </>
                    )}
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleReset}
                    className="gap-1.5 text-xs"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Restart</span>
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
