import { useState, useRef } from "react"
import { Mic, MicOff, Send, Volume2, User, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import ThreeAvatar from "@/components/avatar/ThreeAvatar"
import type { SignGesture } from "@/components/avatar/ThreeAvatar"
import { INDIC_LANGUAGES, speakText, createSpeechRecognizer } from "@/lib/speech"

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
  currentLanguage: string
}

export default function LiveConversationRoom({ currentLanguage = "gu" }: LiveConversationRoomProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "hearing",
      text: "નમસ્તે! મારું નામ તીર્થ છે. તમે કેમ છો?",
      translation: "Hello! My name is Tirth. How are you?",
      islGloss: "NAMASTE | NAME TIRTH | YOU HOW",
      langCode: "gu",
      timestamp: "10:00 AM",
    },
    {
      id: "2",
      sender: "deaf",
      text: "હું સારો છું. આભાર! (I am doing well. Thank you!)",
      translation: "હું સારો છું. આભાર!",
      islGloss: "ME GOOD | THANK-YOU",
      langCode: "gu",
      timestamp: "10:01 AM",
    },
  ])

  const [inputText, setInputText] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [activeAvatarGesture, setActiveAvatarGesture] = useState<SignGesture>("NAMASTE")
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
      // Fallback prompt
      setInputText("નમસ્તે, હું વાતચીત શરૂ કરવા માંગુ છું.")
    }
  }

  // Send message from Hearing Speaker to Deaf Signer
  const handleSendHearingMessage = () => {
    if (!inputText.trim()) return

    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    let gesture: SignGesture = "NAMASTE"
    const lower = inputText.toLowerCase()

    if (lower.includes("આભાર") || lower.includes("thank") || lower.includes("धन्यवाद")) {
      gesture = "THANK_YOU"
    } else if (lower.includes("નામ") || lower.includes("name")) {
      gesture = "WHAT_IS_YOUR_NAME"
    } else if (lower.includes("વિદ્યાર્થી") || lower.includes("student")) {
      gesture = "STUDENT"
    } else if (lower.includes("મદદ") || lower.includes("help")) {
      gesture = "HELP"
    } else if (lower.includes("પાણી") || lower.includes("water")) {
      gesture = "WATER"
    }

    setActiveAvatarGesture(gesture)

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "hearing",
      text: inputText,
      islGloss: `[TOPIC: ${inputText.slice(0, 15)}...] ➔ 3D ISL SYNTHESIS`,
      langCode: currentLanguage,
      timestamp: now,
    }

    setMessages((prev) => [...prev, newMsg])
    setInputText("")
  }

  // Simulate Deaf Signer sending a sign gesture
  const handleDeafSignSend = (gestureName: string, gloss: string, gujaratiText: string) => {
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    setActiveAvatarGesture(gestureName as SignGesture)

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "deaf",
      text: gujaratiText,
      islGloss: gloss,
      langCode: currentLanguage,
      timestamp: now,
    }

    setMessages((prev) => [...prev, newMsg])
    // AI speaks out loud to the hearing person!
    speakText(gujaratiText, currentLanguage)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Column: 3D Avatar Rendering for the Deaf Participant */}
      <div className="lg:col-span-6 flex flex-col gap-4">
        <div className="p-4 rounded-2xl bg-card border border-border shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-xs font-bold text-foreground">
                Deaf Participant Screen — 3D Sign Avatar
              </span>
            </div>
            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
              Live Rendering
            </span>
          </div>

          {/* Real 3D Human Avatar */}
          <div className="aspect-[4/3] w-full rounded-xl overflow-hidden">
            <ThreeAvatar activeGesture={activeAvatarGesture} showControls={false} />
          </div>

          {/* Quick Deaf Signer Gesture Trigger Buttons */}
          <div className="mt-4 pt-3 border-t border-border flex flex-col gap-2">
            <span className="text-xs font-semibold text-muted-foreground">
              Simulate Deaf Signer Camera Input:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() =>
                  handleDeafSignSend("NAMASTE", "NAMASTE", "નમસ્તે! તમને મળીને ખૂબ આનંદ થયો.")
                }
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-muted hover:bg-primary hover:text-white border border-border transition-all"
              >
                Sign "Namaste"
              </button>
              <button
                onClick={() =>
                  handleDeafSignSend("THANK_YOU", "THANK-YOU", "તમારો ખૂબ ખૂબ આભાર!")
                }
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-muted hover:bg-primary hover:text-white border border-border transition-all"
              >
                Sign "Thank You"
              </button>
              <button
                onClick={() =>
                  handleDeafSignSend("STUDENT", "ME STUDENT", "હું યુનિવર્સિટીનો વિદ્યાર્થી છું.")
                }
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-muted hover:bg-primary hover:text-white border border-border transition-all"
              >
                Sign "I am a student"
              </button>
              <button
                onClick={() =>
                  handleDeafSignSend("HELP", "HELP NEED", "શું તમે મને મદદ કરી શકો છો?")
                }
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-muted hover:bg-primary hover:text-white border border-border transition-all"
              >
                Sign "Need Help"
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Hearing Speaker Audio Interface & Shared Chat Timeline */}
      <div className="lg:col-span-6 flex flex-col gap-4">
        <div className="p-6 rounded-2xl bg-card border border-border shadow-xl flex flex-col h-[580px]">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold text-foreground">
                Two-Way Conversation Timeline
              </span>
            </div>
            <span className="text-xs text-muted-foreground font-medium">
              Language: <strong className="text-foreground">{activeLangObj.name}</strong>
            </span>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-1">
            {messages.map((msg) => {
              const isHearing = msg.sender === "hearing"
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isHearing ? "items-end" : "items-start"}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 text-[11px] text-muted-foreground">
                    <User className="h-3 w-3" />
                    <span>{isHearing ? "Hearing Speaker (Voice/Text)" : "Deaf Signer (Camera ISL)"}</span>
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
                    <span>Hear Audio</span>
                  </button>
                </div>
              )
            })}
          </div>

          {/* Hearing Speaker Input & Mic Controls */}
          <div className="pt-3 border-t border-border flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendHearingMessage()}
                placeholder={`Speak or type in ${activeLangObj.name}...`}
                className="flex-1 rounded-xl border border-input bg-background px-3.5 py-2.5 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
              />

              <Button
                size="sm"
                variant={isListening ? "destructive" : "outline"}
                className="h-10 px-3"
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
                className="h-10 px-4 bg-primary text-white font-semibold"
                onClick={handleSendHearingMessage}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Press Enter or click Send to animate sign</span>
              <span className="text-primary font-medium">Automatic Bi-Directional Bridge</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
