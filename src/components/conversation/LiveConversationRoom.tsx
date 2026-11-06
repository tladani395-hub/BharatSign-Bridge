import { useState, useRef } from "react"
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  User,
  MessageSquare,
  Camera,
  Sparkles,
  Download,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import ThreeAvatar from "@/components/avatar/ThreeAvatar"
import type { SignGesture } from "@/components/avatar/ThreeAvatar"
import { INDIC_LANGUAGES, speakText, createSpeechRecognizer } from "@/lib/speech"
import CameraTranslator from "@/components/translator/CameraTranslator"

interface ChatMessage {
  id: string
  sender: "deaf" | "hearing"
  text: string
  translation?: string
  islGloss?: string
  langCode: string
  timestamp: string
}

interface LiveConversationRoomProps {
  currentLanguage?: string
}

interface QuickPhrase {
  id: string
  gesture: SignGesture
  gloss: string
  translations: Record<string, string>
}

const QUICK_PHRASES: QuickPhrase[] = [
  {
    id: "namaste",
    gesture: "NAMASTE",
    gloss: "NAMASTE",
    translations: {
      en: "Hello, Namaste! Very glad to meet you.",
      hi: "नमस्ते! आपसे मिलकर बहुत खुशी हुई।",
      gu: "નમસ્તે! તમને મળીને ખૂબ આનંદ થયો.",
      mr: "नमस्कार! तुम्हाला भेटून आनंद झाला.",
      bn: "নমস্কার! আপনার সাথে দেখা করে ভালো লাগলো।",
      ta: "வணக்கம்! உங்களை சந்தித்ததில் மகிழ்ச்சி.",
      te: "నమస్కారం! మిమ్మల్ని కలవడం చాలా సంతోషంగా ఉంది.",
      kn: "ನಮಸ್ಕಾರ! ನಿಮ್ಮನ್ನು ಭೇಟಿಯಾಗಿದ್ದು ತುಂಬಾ ಸಂತೋಷವಾಯಿತು.",
      ml: "നമസ്കാരം! നിങ്ങളെ കണ്ടതിൽ വളരെ സന്തോഷം.",
      pa: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਤੁਹਾਨੂੰ ਮਿਲ ਕੇ ਬਹੁਤ ਖੁਸ਼ੀ ਹੋਈ।",
      or: "ନମସ୍କାର! ଆପଣଙ୍କୁ ଭେଟି ବହୁତ ଖୁସି ଲାଗିଲା।",
      as: "নমস্কাৰ! আপোনাক লগ পাই বৰ ভাল লাগিল।",
      ur: "سلام! آپ سے مل کر بہت خوشی ہوئی۔",
    },
  },
  {
    id: "thank_you",
    gesture: "THANK_YOU",
    gloss: "THANK-YOU",
    translations: {
      en: "Thank you very much!",
      hi: "आपका बहुत-बहुत धन्यवाद!",
      gu: "તમારો ખૂબ ખૂબ આભાર!",
      mr: "खूप खूप धन्यवाद!",
      bn: "আপনাকে অনেক ধন্যবাদ!",
      ta: "மிக்க நன்றி!",
      te: "చాలా ధన్యవాదాలు!",
      kn: "ತುಂಬಾ ಧನ್ಯವಾದಗಳು!",
      ml: "വളരെ നന്ദി!",
      pa: "ਬਹੁਤ ਬਹੁਤ ਧੰਨਵਾਦ!",
      or: "ବହୁତ ବହୁତ ଧନ୍ୟବାଦ!",
      as: "অশেষ ধন্যবাদ!",
      ur: "بہت بہت شکریہ!",
    },
  },
  {
    id: "student",
    gesture: "STUDENT",
    gloss: "ME STUDENT",
    translations: {
      en: "I am a student learning Indian Sign Language.",
      hi: "मैं भारतीय सांकेतिक भाषा सीख रहा एक विद्यार्थी हूँ।",
      gu: "હું ભારતીય સાંકેતિક ભાષા શીખી રહેલ વિદ્યાર્થી છું.",
      mr: "मी भारतीय सांकेतिक भाषा शिकणारा विद्यार्थी आहे.",
      bn: "আমি ভারতীয় সাংকেতিক ভাষা শেখা একজন শিক্ষার্থী।",
      ta: "நான் இந்திய சைகை மொழியைக் கற்கும் மாணவன்.",
      te: "నేను భారతీయ సంకేత భాషను నేర్చుకుంటున్న విద్యార్థిని.",
      kn: "ನಾನು ಭಾರತೀಯ ಸಂಕೇತ ಭಾಷೆಯನ್ನು ಕಲಿಯುತ್ತಿರುವ ವಿದ್ಯಾರ್ಥಿ.",
      ml: "ഞാൻ ഇന്ത്യൻ ആംഗ്യഭാഷ പഠിക്കുന്ന വിദ്യാർത്ഥിയാണ്.",
      pa: "ਮੈਂ ਭਾਰਤੀ ਸੰਕੇਤਕ ਭਾਸ਼ਾ ਸਿੱਖ ਰਿਹਾ ਵਿਦਿਆਰਥੀ ਹਾਂ।",
      or: "ମୁଁ ଭାରତୀୟ ସାଙ୍କେତିକ ଭାଷା ଶିଖୁଥିବା ଜଣେ ଛାତ୍ର।",
      as: "মই ভাৰতীয় সাংকেতিক ভাষা শিকি থকা এজন ছাত্ৰ।",
      ur: "میں ہندوستانی اشاروں کی زبان سیکھنے والا طالب علم ہوں۔",
    },
  },
  {
    id: "help",
    gesture: "HELP",
    gloss: "HELP NEED",
    translations: {
      en: "Can you please help me with this?",
      hi: "क्या आप कृपया मेरी सहायता कर सकते हैं?",
      gu: "શું તમે કૃપા કરીને મને મદદ કરી શકો છો?",
      mr: "कृपया मला मदत करू शकाल का?",
      bn: "আপনি কি আমাকে সাহায্য করতে পারেন?",
      ta: "எனக்கு தயவுசெய்து உதவ முடியுமா?",
      te: "దయచేసి నాకు సహాయం చేయగలరా?",
      kn: "ದಯವಿಟ್ಟು ನನಗೆ ಸಹಾಯ ಮಾಡುವಿರಾ?",
      ml: "ദയവായി എന്നെ സഹായിക്കാമോ?",
      pa: "ਕੀ ਤੁਸੀਂ ਕਿਰਪਾ ਕਰਕੇ ਮੇਰੀ ਮਦਦ ਕਰ ਸਕਦੇ ਹੋ?",
      or: "ଦୟାକରି ଆପଣ ମୋତେ ସାହାଯ୍ୟ କରିପାରିବେ କି?",
      as: "অনুগ্ৰহ কৰি মোক সহায় কৰিব পাৰিবনে?",
      ur: "کیا آپ برائے مہربانی میری مدد کر سکتے ہیں؟",
    },
  },
  {
    id: "water",
    gesture: "WATER",
    gloss: "WATER",
    translations: {
      en: "Could I please have drinking water?",
      hi: "क्या मुझे पीने का पानी मिल सकता है?",
      gu: "મને પીવાનું પાણી મળી શકે?",
      mr: "मला पिण्याचे पाणी मिळेल का?",
      bn: "একটু খাবার জল পাওয়া যাবে?",
      ta: "குடிநீர் கிடைக்குமா?",
      te: "మంచి నీళ్ళు దొరుకుతಾಯಾ?",
      kn: "ಕುಡಿಯುವ ನೀರು ಸಿಗಬಹುದೇ?",
      ml: "കുടിക്കാൻ വെള്ളം ലഭിക്കുമോ?",
      pa: "ਕੀ ਮੈਨੂੰ ਪੀਣ ਦਾ ਪਾਣੀ ਮਿਲ ਸਕਦਾ ਹੈ?",
      or: "ମୋତେ ପିଇବା ପାଣି ମିଳିପାରିବ କି?",
      as: "মোক খোৱা পানী অকণমান দিবনে?",
      ur: "کیا مجھے پینے کا پانی مل سکتا ہے؟",
    },
  },
  {
    id: "yes",
    gesture: "YES",
    gloss: "YES",
    translations: {
      en: "Yes, I understand and agree.",
      hi: "हाँ, मैं समझ गया और सहमत हूँ।",
      gu: "હા, હું સમજી ગયો અને સહમત છું.",
      mr: "होय, मला समजले आणि मी सहमत आहे.",
      bn: "হ্যাঁ, আমি বুঝতে পেরেছি এবং একমত।",
      ta: "ஆம், எனக்கு புரிந்தது மற்றும் ஒப்புக்கொள்கிறேன்.",
      te: "అవును, నాకు అర్థమైంది మరియు అంగీకరిస్తున్నాను.",
      kn: "ಹೌದು, ನನಗೆ ಅರ್ಥವಾಯಿತು ಮತ್ತು ಒಪ್ಪುತ್ತೇನೆ.",
      ml: "അതെ, എനിക്ക് മനസ്സിലായി, ഞാൻ യോജിക്കുന്നു.",
      pa: "ਹਾਂ, ਮੈਂ ਸਮਝ ਗਿਆ ਹਾਂ ਅਤੇ ਸਹਿਮਤ ਹਾਂ।",
      or: "ହଁ, ମୁଁ ବୁଝିପାରିଲି ଏବଂ ସହମତ।",
      as: "হয়, মই বুজি পালোঁ আৰু সন্মত।",
      ur: "ہاں، میں سمجھ گیا اور متفق ہوں۔",
    },
  },
  {
    id: "no",
    gesture: "NO",
    gloss: "NO",
    translations: {
      en: "No, that is not correct.",
      hi: "नहीं, यह सही नहीं है।",
      gu: "ના, તે યોગ્ય નથી.",
      mr: "नाही, हे योग्य नाही.",
      bn: "না, এটা সঠিক নয়।",
      ta: "இல்லை, அது சரியல்ல.",
      te: "కాదు, అది సరికాదు.",
      kn: "ಇಲ್ಲ, ಅದು ಸರಿಯಲ್ಲ.",
      ml: "അല്ല, അത് ശരിയല്ല.",
      pa: "ਨਹੀਂ, ਇਹ ਠੀਕ ਨਹੀਂ ਹੈ।",
      or: "ନା, ଏହା ଠିକ୍ ନୁହେଁ।",
      as: "নহয়, এইটো শুদ্ধ নহয়।",
      ur: "نہیں، یہ درست نہیں ہے۔",
    },
  },
]

export default function LiveConversationRoom({ currentLanguage = "en" }: LiveConversationRoomProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "hearing",
      text: "Hello! Welcome to the conversation room. How can I help you today?",
      translation: "Hello! Welcome to the conversation room.",
      islGloss: "HELLO | WELCOME | HOW HELP",
      langCode: "en",
      timestamp: "10:00 AM",
    },
    {
      id: "2",
      sender: "deaf",
      text: "Hello / Namaste! Very glad to meet you.",
      translation: "Hello / Namaste! Very glad to meet you.",
      islGloss: "NAMASTE | MEET GLAD",
      langCode: "en",
      timestamp: "10:01 AM",
    },
  ])

  const [inputText, setInputText] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [activeAvatarGesture, setActiveAvatarGesture] = useState<SignGesture>("STAND_STRAIGHT")
  const [deafViewMode, setDeafViewMode] = useState<"avatar" | "camera">("avatar")
  const recognizerRef = useRef<unknown>(null)

  const activeLangObj = INDIC_LANGUAGES.find((l) => l.code === currentLanguage) || INDIC_LANGUAGES[0]

  // Start Mic Voice Recognition for Hearing Speaker
  const toggleListening = () => {
    if (isListening) {
      if (recognizerRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(recognizerRef.current as any).stop()
      }
      setIsListening(false)
      return
    }

    const recognizer = createSpeechRecognizer(
      currentLanguage,
      (transcript) => {
        setInputText(transcript)
        setIsListening(false)
      },
      () => setIsListening(false),
      () => setIsListening(false)
    )

    if (recognizer) {
      recognizerRef.current = recognizer
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(recognizer as any).start()
      setIsListening(true)
    } else {
      setInputText(
        currentLanguage === "hi"
          ? "नमस्ते, मैं बातचीत शुरू करना चाहता हूँ।"
          : currentLanguage === "gu"
          ? "નમસ્તે, હું વાતચીત શરૂ કરવા માંગુ છું."
          : "Hello, I would like to begin our conversation."
      )
    }
  }

  // Send message from Hearing Speaker to Deaf Signer
  const handleSendHearingMessage = () => {
    if (!inputText.trim()) return

    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    let gesture: SignGesture = "NAMASTE"
    const lower = inputText.toLowerCase()

    if (lower.includes("thank") || lower.includes("આભાર") || lower.includes("धन्यवाद") || lower.includes("நன்றி")) {
      gesture = "THANK_YOU"
    } else if (lower.includes("name") || lower.includes("નામ") || lower.includes("नाम")) {
      gesture = "WHAT_IS_YOUR_NAME"
    } else if (lower.includes("student") || lower.includes("વિદ્યાર્થી") || lower.includes("विद्यार्थी") || lower.includes("மாணவர்")) {
      gesture = "STUDENT"
    } else if (lower.includes("help") || lower.includes("મદદ") || lower.includes("मदद") || lower.includes("உதவி")) {
      gesture = "HELP"
    } else if (lower.includes("water") || lower.includes("પાણી") || lower.includes("पानी") || lower.includes("தண்ணீர்")) {
      gesture = "WATER"
    } else if (lower.includes("welcome") || lower.includes("સ્વાગત") || lower.includes("स्वागत")) {
      gesture = "WELCOME"
    } else if (lower.includes("yes") || lower.includes("હા") || lower.includes("हाँ") || lower.includes("ஆம்")) {
      gesture = "YES"
    } else if (lower.includes("no") || lower.includes("ના") || lower.includes("नहीं") || lower.includes("இல்லை")) {
      gesture = "NO"
    }

    setActiveAvatarGesture(gesture)

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "hearing",
      text: inputText,
      islGloss: `[${gesture}] ➔ 3D ISL SYNTHESIS`,
      langCode: currentLanguage,
      timestamp: now,
    }

    setMessages((prev) => [...prev, newMsg])
    setInputText("")
  }

  // Handle Deaf Participant Sign Trigger
  const handleDeafSignSend = (phrase: QuickPhrase) => {
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    setActiveAvatarGesture(phrase.gesture)

    const localizedText = phrase.translations[currentLanguage] || phrase.translations["en"]

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "deaf",
      text: localizedText,
      islGloss: phrase.gloss,
      langCode: currentLanguage,
      timestamp: now,
    }

    setMessages((prev) => [...prev, newMsg])
    // AI speaks aloud to the hearing person in selected language
    speakText(localizedText, currentLanguage)
  }

  // Handle Live Camera Sign Recognized
  const handleLiveCameraSign = (signGloss: string, translated: string) => {
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    let gesture: SignGesture = "NAMASTE"
    if (signGloss.includes("WATER")) gesture = "WATER"
    else if (signGloss.includes("THANK")) gesture = "THANK_YOU"
    else if (signGloss.includes("HELP")) gesture = "HELP"
    else if (signGloss.includes("STUDENT")) gesture = "STUDENT"
    else if (signGloss.includes("YES")) gesture = "YES"
    else if (signGloss.includes("NO")) gesture = "NO"
    else if (signGloss.includes("WELCOME")) gesture = "WELCOME"

    setActiveAvatarGesture(gesture)

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "deaf",
      text: translated || signGloss,
      islGloss: signGloss,
      langCode: currentLanguage,
      timestamp: now,
    }

    setMessages((prev) => [...prev, newMsg])
    speakText(translated || signGloss, currentLanguage)
  }

  const handleExportTranscript = () => {
    const header = `=== BharatSign Bridge Conversation Transcript ===\nDate: ${new Date().toLocaleDateString()}\nLanguage: ${activeLangObj.name}\n=================================================\n\n`
    const body = messages
      .map(
        (m) =>
          `[${m.timestamp}] ${m.sender === "hearing" ? "Hearing Speaker" : "Deaf Signer"}:\n"${m.text}"\nISL Syntax: ${m.islGloss || "N/A"}\n`
      )
      .join("\n")

    const blob = new Blob([header + body], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `BharatSign_Session_${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Column: Deaf Participant Panel (3D Avatar / Live Signing Camera) */}
      <div className="lg:col-span-6 flex flex-col gap-4">
        <div className="p-5 rounded-2xl bg-card border border-border shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-xs font-bold text-foreground">
                Deaf Participant Station
              </span>
            </div>

            {/* View Mode Toggle: 3D Sign Avatar vs Live Signing Camera */}
            <div className="inline-flex rounded-xl bg-muted p-0.5 border border-border text-xs font-bold">
              <button
                onClick={() => setDeafViewMode("avatar")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                  deafViewMode === "avatar"
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Sparkles className="h-3 w-3" />
                <span>3D Avatar</span>
              </button>
              <button
                onClick={() => setDeafViewMode("camera")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                  deafViewMode === "camera"
                    ? "bg-cyan-600 text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Camera className="h-3 w-3" />
                <span>Sign Camera</span>
              </button>
            </div>
          </div>

          {/* Mode 1: Real 3D Human Avatar */}
          {deafViewMode === "avatar" ? (
            <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden bg-slate-950 border border-border relative shadow-inner">
              <ThreeAvatar activeGesture={activeAvatarGesture} showControls={false} />
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-white border border-white/10 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Rendering Sign: {activeAvatarGesture}</span>
              </div>
            </div>
          ) : (
            /* Mode 2: Live Webcam Sign Recognition */
            <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden bg-slate-950 border border-border relative shadow-inner">
              <CameraTranslator
                selectedLanguage={currentLanguage}
                onSignRecognized={(gloss, trans) => handleLiveCameraSign(gloss, trans)}
              />
            </div>
          )}

          {/* Deaf Signer Express Phrases Bar */}
          <div className="mt-4 pt-3 border-t border-border flex flex-col gap-2">
            <span className="text-xs font-semibold text-muted-foreground">
              Deaf Express Signs (Click to send & synthesize voice):
            </span>
            <div className="flex flex-wrap gap-2">
              {QUICK_PHRASES.map((phrase) => (
                <button
                  key={phrase.id}
                  onClick={() => handleDeafSignSend(phrase)}
                  className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-muted/80 hover:bg-primary hover:text-white border border-border transition-all shadow-sm active:scale-95"
                >
                  {phrase.translations[currentLanguage] || phrase.translations["en"]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Hearing Speaker Interface & Two-Way Timeline */}
      <div className="lg:col-span-6 flex flex-col gap-4">
        <div className="p-6 rounded-2xl bg-card border border-border shadow-xl flex flex-col h-[620px]">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold text-foreground">
                Two-Way Meeting Timeline
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleExportTranscript}
                className="h-7 px-2 text-[11px] gap-1 text-muted-foreground hover:text-foreground"
                title="Download text transcript"
              >
                <Download className="h-3 w-3" />
                <span>Export</span>
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => setMessages([])}
                className="h-7 px-2 text-[11px] gap-1 text-rose-400 hover:text-rose-500 hover:bg-rose-500/10"
                title="Clear chat messages"
              >
                <Trash2 className="h-3 w-3" />
                <span>Clear</span>
              </Button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-1">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground gap-2">
                <MessageSquare className="h-8 w-8 text-primary/40" />
                <span className="text-xs font-bold text-foreground">Session Ready</span>
                <p className="text-[11px] max-w-xs">
                  Speak using the microphone or sign in front of the camera to start dialogue.
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isHearing = msg.sender === "hearing"
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isHearing ? "items-end" : "items-start"}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 text-[11px] text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>{isHearing ? "Hearing Speaker (Voice/Text)" : "Deaf Signer (ISL Camera)"}</span>
                      <span>• {msg.timestamp}</span>
                    </div>

                    <div
                      className={`max-w-[85%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        isHearing
                          ? "bg-primary text-white rounded-br-none shadow-md"
                          : "bg-muted text-foreground rounded-bl-none border border-border"
                      }`}
                    >
                      <div className="font-semibold">{msg.text}</div>
                      {msg.islGloss && (
                        <div
                          className={`mt-1.5 pt-1.5 border-t text-[11px] font-mono ${
                            isHearing ? "border-white/20 text-indigo-100" : "border-border text-primary"
                          }`}
                        >
                          ISL Syntax: {msg.islGloss}
                        </div>
                      )}
                    </div>

                    {/* Audio Play Button */}
                    <button
                      onClick={() => speakText(msg.text, msg.langCode)}
                      className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Volume2 className="h-3 w-3" />
                      <span>Hear Voice ({msg.langCode.toUpperCase()})</span>
                    </button>
                  </div>
                )
              })
            )}
          </div>

          {/* Hearing Speaker Input & Mic Controls */}
          <div className="pt-3 border-t border-border flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendHearingMessage()}
                placeholder={`Speak or type in ${activeLangObj.name} (${activeLangObj.native})...`}
                className="flex-1 rounded-xl border border-input bg-background px-3.5 py-2.5 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
              />

              <Button
                size="sm"
                variant={isListening ? "destructive" : "outline"}
                className="h-10 px-3 rounded-xl"
                onClick={toggleListening}
                title="Microphone voice input"
              >
                {isListening ? (
                  <MicOff className="h-4 w-4 animate-spin text-white" />
                ) : (
                  <Mic className="h-4 w-4 text-primary" />
                )}
              </Button>

              <Button
                size="sm"
                className="h-10 px-4 rounded-xl bg-primary text-white font-semibold shadow-md"
                onClick={handleSendHearingMessage}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Press Enter or click Send to animate sign</span>
              <span className="text-primary font-medium">Automatic Bi-Directional Speech ⇄ ISL</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
