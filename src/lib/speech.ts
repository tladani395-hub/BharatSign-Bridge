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
  { code: "en", name: "English", native: "English", bcp47: "en-IN" },
  { code: "hi", name: "Hindi", native: "हिन्दी", bcp47: "hi-IN" },
  { code: "gu", name: "Gujarati", native: "ગુજરાતી", bcp47: "gu-IN" },
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
 * Sanitizes speech text so that TTS engines NEVER vocalize the word "slash" (or "स्लैश")
 * in any of the 13 Indian languages or AI chat synthesis.
 * Replaces slashes ('/' and '\') with natural speech pauses (', ') so speech flows smoothly without saying 'slash'.
 */
export function cleanSpeechText(rawText: string): string {
  if (!rawText) return ""

  return rawText
    // Replace slash and backslash with a natural pause (comma-space)
    .replace(/\s*[\/\\]+\s*/g, ", ")
    // Remove any accidental spoken words for slash if encountered
    .replace(/\b(slash|backslash)\b/gi, "")
    // Clean up duplicate commas, spaces, or leading/trailing punctuation
    .replace(/\s*,\s*,\s*/g, ", ")
    .replace(/\s+/g, " ")
    .replace(/^[,.\s]+/, "")
    .replace(/[,.\s]+$/, "")
    .trim()
}

let currentAudioElement: HTMLAudioElement | null = null

/**
 * Stops any currently active speech synthesis or audio streaming
 */
export function stopSpeech(): void {
  if (typeof window !== "undefined") {
    if (currentAudioElement) {
      currentAudioElement.pause()
      currentAudioElement.currentTime = 0
      currentAudioElement = null
    }
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel()
    }
  }
}

/**
 * Fallback to browser Web Speech API with smart Indic voice matching
 */
function fallbackWebSpeech(
  sanitizedText: string,
  langCode: string,
  onStart?: () => void,
  onEnd?: () => void
): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    playAudioTone(480, 0.5)
    if (onStart) onStart()
    setTimeout(() => {
      if (onEnd) onEnd()
    }, 1000)
    return false
  }

  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(sanitizedText)
  const langObj = INDIC_LANGUAGES.find((l) => l.code === langCode) || INDIC_LANGUAGES[0]
  utterance.lang = langObj.bcp47
  utterance.rate = 0.95
  utterance.pitch = 1.0

  const voices = window.speechSynthesis.getVoices()
  // Look for exact match or regional Indic match
  const matchedVoice =
    voices.find(
      (v) =>
        v.lang === langObj.bcp47 ||
        v.lang.startsWith(langObj.code) ||
        v.name.toLowerCase().includes(langObj.name.toLowerCase())
    ) ||
    voices.find((v) => v.lang.includes("hi-IN") || v.lang.includes("en-IN") || v.lang.includes("IN")) ||
    voices[0]

  if (matchedVoice) {
    utterance.voice = matchedVoice
  }

  if (onStart) utterance.onstart = onStart
  utterance.onend = () => {
    if (onEnd) onEnd()
  }
  utterance.onerror = () => {
    playAudioTone(520, 0.3)
    if (onEnd) onEnd()
  }

  window.speechSynthesis.speak(utterance)
  return true
}

/**
 * Speaks text in any of the 13 supported languages.
 * Uses high-fidelity native acoustic audio from backend TTS (/api/tts)
 * with automatic fallback to Web Speech API.
 */
export function speakText(
  text: string,
  langCode: string = "en",
  onStart?: () => void,
  onEnd?: () => void
): boolean {
  if (!text || typeof window === "undefined") return false

  const sanitizedText = cleanSpeechText(text)
  if (!sanitizedText) return false

  // Stop any ongoing speech
  stopSpeech()

  // 1. Try High-Quality Backend Audio TTS (guarantees native accent for all 13 languages)
  try {
    const ttsUrl = `http://127.0.0.1:8000/api/tts?text=${encodeURIComponent(sanitizedText)}&lang=${encodeURIComponent(langCode)}`
    const audio = new Audio(ttsUrl)
    currentAudioElement = audio

    let triggeredStart = false

    audio.onplay = () => {
      triggeredStart = true
      if (onStart) onStart()
    }

    audio.onended = () => {
      currentAudioElement = null
      if (onEnd) onEnd()
    }

    audio.onerror = () => {
      currentAudioElement = null
      if (!triggeredStart) {
        fallbackWebSpeech(sanitizedText, langCode, onStart, onEnd)
      }
    }

    const playPromise = audio.play()
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // In case of browser autoplay blocking or network glitch, fallback seamlessly
        currentAudioElement = null
        fallbackWebSpeech(sanitizedText, langCode, onStart, onEnd)
      })
    }
    return true
  } catch {
    return fallbackWebSpeech(sanitizedText, langCode, onStart, onEnd)
  }
}

/**
 * Speech Recognition (Microphone) helper supporting 13 languages
 */
export function createSpeechRecognizer(
  langCode: string = "en",
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
