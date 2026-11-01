// Universal Multilingual Speech Synthesis and Recognition Library
// Supporting all 13 Indian Languages + Fallbacks

export interface IndicLanguage {
  code: string
  name: string
  native: string
  bcp47: string
  flag?: string
}

export const INDIC_LANGUAGES: IndicLanguage[] = [
  { code: "gu", name: "Gujarati", native: "ગુજરાતી", bcp47: "gu-IN" },
  { code: "hi", name: "Hindi", native: "हिन्दी", bcp47: "hi-IN" },
  { code: "en", name: "English", native: "English", bcp47: "en-IN" },
  { code: "mr", name: "Marathi", native: "मराठी", bcp47: "mr-IN" },
  { code: "bn", name: "Bengali", native: "বাংলা", bcp47: "bn-IN" },
  { code: "ta", name: "Tamil", native: "தமிழ்", bcp47: "ta-IN" },
  { code: "te", name: "Telugu", native: "తెలుగు", bcp47: "te-IN" },
  { code: "kn", name: "Kannada", native: "ಕನ್ನಡ", bcp47: "kn-IN" },
  { code: "ml", name: "Malayalam", native: "മലയാളം", bcp47: "ml-IN" },
  { code: "pa", name: "Punjabi", native: "ਪੰਜਾਬੀ", bcp47: "pa-IN" },
  { code: "or", name: "Odia", native: "ଓଡ଼ିଆ", bcp47: "or-IN" },
  { code: "as", name: "Assamese", native: "অসমীয়া", bcp47: "as-IN" },
  { code: "ur", name: "Urdu", native: "اردو", bcp47: "ur-IN" },
]

// Play sound using Web Audio API as guaranteed fallback if system has no voice installed
function playAudioTone(frequency = 440, duration = 0.3) {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) return
    const ctx = new AudioContextClass()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = "sine"
    osc.frequency.setValueAtTime(frequency, ctx.currentTime)
    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + duration)
  } catch {
    // Audio tone fallback failed silently
  }
}

/**
 * Speaks text in any of the 13 supported languages using Web Speech API
 */
export function speakText(
  text: string,
  langCode: string = "gu",
  onStart?: () => void,
  onEnd?: () => void
): boolean {
  if (!text || typeof window === "undefined") return false

  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel() // Stop any current speech

    const utterance = new SpeechSynthesisUtterance(text)
    const langObj = INDIC_LANGUAGES.find((l) => l.code === langCode) || INDIC_LANGUAGES[0]
    utterance.lang = langObj.bcp47
    utterance.rate = 0.95
    utterance.pitch = 1.0

    // Look for exact voice match
    const voices = window.speechSynthesis.getVoices()
    const matchedVoice = voices.find(
      (v) =>
        v.lang === langObj.bcp47 ||
        v.lang.startsWith(langObj.code) ||
        v.name.toLowerCase().includes(langObj.name.toLowerCase())
    )

    if (matchedVoice) {
      utterance.voice = matchedVoice
    }

    if (onStart) utterance.onstart = onStart
    utterance.onend = () => {
      if (onEnd) onEnd()
    }
    utterance.onerror = () => {
      playAudioTone(520, 0.4)
      if (onEnd) onEnd()
    }

    window.speechSynthesis.speak(utterance)
    return true
  } else {
    // Fallback tone
    playAudioTone(480, 0.5)
    if (onStart) onStart()
    setTimeout(() => {
      if (onEnd) onEnd()
    }, 1000)
    return false
  }
}

/**
 * Speech Recognition (Microphone) helper supporting 13 languages
 */
export function createSpeechRecognizer(
  langCode: string = "gu",
  onResult: (transcript: string) => void,
  onError?: (err: unknown) => void,
  onEnd?: () => void
) {
  const SpeechRecognition =
    (window as unknown as { SpeechRecognition: unknown }).SpeechRecognition ||
    (window as unknown as { webkitSpeechRecognition: unknown }).webkitSpeechRecognition

  if (!SpeechRecognition) {
    return null
  }

  const langObj = INDIC_LANGUAGES.find((l) => l.code === langCode) || INDIC_LANGUAGES[0]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognition = new (SpeechRecognition as any)()
  recognition.lang = langObj.bcp47
  recognition.continuous = false
  recognition.interimResults = false

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recognition.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript
    onResult(transcript)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recognition.onerror = (event: any) => {
    if (onError) onError(event.error)
  }

  recognition.onend = () => {
    if (onEnd) onEnd()
  }

  return recognition
}
