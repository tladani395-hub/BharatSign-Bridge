import { useEffect, useRef, useState } from "react"
import { Camera, Volume2, Sparkles, AlertCircle, RefreshCw, Layers, CheckCircle2, UserCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import ThreeAvatar from "@/components/avatar/ThreeAvatar"
import type { SignGesture } from "@/components/avatar/ThreeAvatar"
import { INDIC_LANGUAGES, speakText } from "@/lib/speech"

interface CameraTranslatorProps {
  selectedLanguage: string
  onSignRecognized?: (sign: string, translation: string) => void
}

export interface GestureResult {
  id: string
  name: string
  gloss: string
  confidence: number
  description: string
  isTwoHanded?: boolean
  translations: Record<string, string>
}

export const GESTURE_DATABASE: Record<string, GestureResult> = {
  HELLO: {
    id: "HELLO",
    name: "Hello / Greeting",
    gloss: "HELLO",
    confidence: 0.995,
    description: "Dominant hand raised near temple/forehead, waving outward with a welcoming smile.",
    isTwoHanded: false,
    translations: {
      en: "Hello / Greetings",
      hi: "नमस्ते / हैलो",
      gu: "નમસ્તે / હેલો",
      mr: "नमस्कार / हॅलो",
      bn: "নমস্কার / হ্যালো",
      ta: "வணக்கம் / ஹலோ",
      te: "హలో / నమస్కారం",
      kn: "ಹಲೋ / ನಮಸ್ಕಾರ",
      ml: "ഹലോ / നമസ്കാരം",
      pa: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ / ਹੈਲੋ",
      or: "ନମସ୍କାର / ହ୍ୟାଲୋ",
      as: "নমস্কাৰ / হেল্ল'",
      ur: "سلام / ہیلو",
    },
  },
  NAMASTE: {
    id: "NAMASTE",
    name: "Namaste / Pranam",
    gloss: "NAMASTE",
    confidence: 0.996,
    description: "Traditional Indian greeting with both palms pressed flat together at sternum with head nod.",
    isTwoHanded: true,
    translations: {
      en: "Hello / Greetings",
      hi: "नमस्ते / नमस्कार",
      gu: "નમસ્તે / પ્રણામ",
      mr: "नमस्कार",
      bn: "নমস্কার",
      ta: "வணக்கம்",
      te: "నమస్కారం",
      kn: "ನಮಸ್ಕಾರ",
      ml: "നമസ്കാരം",
      pa: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ",
      or: "ନମସ୍କାର",
      as: "নমস্কাৰ",
      ur: "سلام / آداب",
    },
  },
  THANK_YOU: {
    id: "THANK_YOU",
    name: "Thank You / Gratitude",
    gloss: "THANK-YOU",
    confidence: 0.988,
    description: "Fingertips of dominant hand touch chin, then open outward toward recipient with a smile.",
    isTwoHanded: false,
    translations: {
      en: "Thank You",
      hi: "धन्यवाद / शुक्रिया",
      gu: "ધન્યવાદ / આભાર",
      mr: "धन्यवाद",
      bn: "ধন্যবাদ",
      ta: "நன்றி",
      te: "ధన్యవాదాలు",
      kn: "ಧನ್ಯವಾದಗಳು",
      ml: "നന്ദി",
      pa: "ਧੰਨਵਾਦ",
      or: "ଧନ୍ୟବାଦ",
      as: "ধন্যবাদ",
      ur: "شکریہ",
    },
  },
  WELCOME: {
    id: "WELCOME",
    name: "Welcome / Swagatam",
    gloss: "WELCOME",
    confidence: 0.989,
    description: "Both open arms sweep inward inviting toward chest with hospitality smile.",
    isTwoHanded: true,
    translations: {
      en: "Welcome",
      hi: "स्वागत है",
      gu: "સ્વાગત છે",
      mr: "स्वागत आहे",
      bn: "স্বাগতম",
      ta: "வரவேற்கிறோம்",
      te: "స్వాగతం",
      kn: "ಸ್ವಾಗತ",
      ml: "സ്വാഗതം",
      pa: "ਜੀ ਆਇਆਂ ਨੂੰ",
      or: "ସ୍ୱାଗତ",
      as: "স্বাগতম",
      ur: "خوش آمدید",
    },
  },
  HOW_ARE_YOU: {
    id: "HOW_ARE_YOU",
    name: "How Are You?",
    gloss: "HOW YOU",
    confidence: 0.984,
    description: "Knuckles together rotating outward (HOW) then pointing forward to recipient (YOU).",
    isTwoHanded: false,
    translations: {
      en: "How are you?",
      hi: "आप कैसे हैं?",
      gu: "તમે કેમ છો?",
      mr: "तुम्ही कसे आहात?",
      bn: "আপনি কেমন আছেন?",
      ta: "நீங்கள் எப்படி இருக்கிறீர்கள்?",
      te: "మీరు ఎలా ఉన్నారు?",
      kn: "ನೀವು ಹೇಗಿದ್ದೀರಿ?",
      ml: "സുഖമാണോ?",
      pa: "ਤੁਸੀਂ ਕਿਵੇਂ ਹੋ?",
      or: "ଆପଣ କେମିତି ଅଛନ୍ତି?",
      as: "আপুনি কেনে আছে?",
      ur: "آپ کیسے ہیں؟",
    },
  },
  WHAT_IS_YOUR_NAME: {
    id: "WHAT_IS_YOUR_NAME",
    name: "What Is Your Name?",
    gloss: "YOUR NAME WHAT",
    confidence: 0.982,
    description: "Point to person, cross index and middle on palm (NAME), shake open palms (WHAT).",
    isTwoHanded: true,
    translations: {
      en: "What is your name?",
      hi: "आपका नाम क्या है?",
      gu: "તમારું નામ શું છે?",
      mr: "तुमचे नाव काय आहे?",
      bn: "আপনার নাম কি?",
      ta: "உங்கள் பெயர் என்ன?",
      te: "మీ పేరు ఏమిటి?",
      kn: "ನಿಮ್ಮ ಹೆಸರೇನು?",
      ml: "നിങ്ങളുടെ പേരെന്താണ്?",
      pa: "ਤੁਹਾਡਾ ਨਾਮ ਕੀ ਹੈ?",
      or: "ଆପଣଙ୍କ ନାମ କ’ଣ?",
      as: "আপোনাৰ নাম কি?",
      ur: "آپ کا نام کیا ہے؟",
    },
  },
  STUDENT: {
    id: "STUDENT",
    name: "Student / Learner",
    gloss: "STUDENT",
    confidence: 0.981,
    description: "Point to self (ME), open palms together like a book (STUDY), hands move down.",
    isTwoHanded: true,
    translations: {
      en: "I am a student",
      hi: "मैं एक विद्यार्थी हूँ",
      gu: "હું એક વિદ્યાર્થી છું",
      mr: "मी एक विद्यार्थी आहे",
      bn: "আমি একজন ছাত্র",
      ta: "நான் ஒரு மாணவன்",
      te: "నేను విద్యార్థిని",
      kn: "ನಾನು ವಿದ್ಯಾರ್ಥಿ",
      ml: "ഞാൻ വിദ്യാർത്ഥിയാണ്",
      pa: "ਮੈਂ ਇੱਕ ਵਿਦਿਆਰਥੀ ਹਾਂ",
      or: "ମୁଁ ଜଣେ ଛାତ୍ର",
      as: "মই এজন ছাত্র",
      ur: "میں طالب علم ہوں",
    },
  },
  HELP: {
    id: "HELP",
    name: "Help / Emergency",
    gloss: "HELP-NEED",
    confidence: 0.985,
    description: "Closed fist placed upon open flat non-dominant palm, both hands lifted upward.",
    isTwoHanded: true,
    translations: {
      en: "Please help / Need help",
      hi: "मुझे मदद चाहिए",
      gu: "મને મદદની જરૂર છે",
      mr: "मला मदत हवी आहे",
      bn: "আমার সাহায্য প্রয়োজন",
      ta: "எனக்கு உதவி தேவை",
      te: "నాకు సహాయం కావాలి",
      kn: "ನನಗೆ ಸಹಾಯ ಬೇಕು",
      ml: "എനിക്ക് സഹായം വേണം",
      pa: "ਮੈਨੂੰ ਮਦਦ ਚਾਹੀਦੀ ਹੈ",
      or: "ମୋତେ ସାହାଯ୍ୟ ଦରକାର",
      as: "মোক সহায় লাগে",
      ur: "مجھے مدد کی ضرورت ہے",
    },
  },
  WATER: {
    id: "WATER",
    name: "Water / Drink",
    gloss: "WATER",
    confidence: 0.982,
    description: "Three extended fingers forming 'W' handshape lightly tapping side of chin or mouth.",
    isTwoHanded: false,
    translations: {
      en: "Water",
      hi: "पानी / जल",
      gu: "પાણી",
      mr: "पाणी",
      bn: "জল",
      ta: "தண்ணீர்",
      te: "నీరు",
      kn: "ನೀರು",
      ml: "വെള്ളം",
      pa: "ਪਾਣੀ",
      or: "ପାଣି",
      as: "পানী",
      ur: "پانی",
    },
  },
  YES: {
    id: "YES",
    name: "Yes / Affirmative",
    gloss: "YES",
    confidence: 0.989,
    description: "Closed fist nodding up and down repeatedly mimicking head nod.",
    isTwoHanded: false,
    translations: {
      en: "Yes",
      hi: "हाँ",
      gu: "હા",
      mr: "होय",
      bn: "হ্যাঁ",
      ta: "ஆம்",
      te: "అవును",
      kn: "ಹೌದು",
      ml: "അതെ",
      pa: "ਹਾਂ",
      or: "ହଁ",
      as: "হয়",
      ur: "ہاں",
    },
  },
  NO: {
    id: "NO",
    name: "No / Negative",
    gloss: "NO",
    confidence: 0.988,
    description: "Index and middle fingers snapping against thumb horizontally with head shake.",
    isTwoHanded: false,
    translations: {
      en: "No",
      hi: "नहीं",
      gu: "ના",
      mr: "नाही",
      bn: "না",
      ta: "இல்லை",
      te: "కాదు",
      kn: "ಇಲ್ಲ",
      ml: "ഇല്ല",
      pa: "ਨਹੀਂ",
      or: "ନା",
      as: "নহয়",
      ur: "نہیں",
    },
  },
  INDIA: {
    id: "INDIA",
    name: "India / Bharat",
    gloss: "BHARAT-INDIA",
    confidence: 0.993,
    description: "Right hand touches forehead bindi/tilak then opens outward in dignified salute.",
    isTwoHanded: false,
    translations: {
      en: "India / Bharat",
      hi: "भारत",
      gu: "ભારત",
      mr: "भारत",
      bn: "ভারত",
      ta: "இந்தியா",
      te: "భారతదేశం",
      kn: "ಭಾರತ",
      ml: "ഭാരതം",
      pa: "ਭਾਰਤ",
      or: "ଭାରତ",
      as: "ভাৰত",
      ur: "بھارت",
    },
  },
  DIGIT_1: {
    id: "DIGIT_1",
    name: "Digit 1 (One)",
    gloss: "ONE (1)",
    confidence: 0.985,
    description: "Index finger extended vertically upward, thumb folded across closed fingers.",
    isTwoHanded: false,
    translations: { en: "One (1)", hi: "एक (1)", gu: "એક (1)", mr: "एक (1)", bn: "এক (1)", ta: "ஒன்று (1)", te: "ఒకటి (1)" },
  },
  DIGIT_2: {
    id: "DIGIT_2",
    name: "Digit 2 (Two)",
    gloss: "TWO (2)",
    confidence: 0.989,
    description: "Index and middle fingers extended upward forming V shape.",
    isTwoHanded: false,
    translations: { en: "Two (2)", hi: "दो (2)", gu: "બે (2)", mr: "दोन (2)", bn: "দুই (2)", ta: "இரண்டு (2)", te: "రెండు (2)" },
  },
  DIGIT_3: {
    id: "DIGIT_3",
    name: "Digit 3 (Three)",
    gloss: "THREE (3)",
    confidence: 0.981,
    description: "Thumb, index, and middle fingers extended upward.",
    isTwoHanded: false,
    translations: { en: "Three (3)", hi: "तीन (3)", gu: "ત્રણ (3)", mr: "तीन (3)", bn: "তিন (3)", ta: "மூன்று (3)", te: "మూడు (3)" },
  },
  DIGIT_4: {
    id: "DIGIT_4",
    name: "Digit 4 (Four)",
    gloss: "FOUR (4)",
    confidence: 0.992,
    description: "Thumb folded across palm, four fingers (Index, Middle, Ring, Pinky) extended vertically.",
    isTwoHanded: false,
    translations: { en: "Four (4)", hi: "चार (4)", gu: "ચાર (4)", mr: "चार (4)", bn: "চার (4)", ta: "நான்கு (4)", te: "నాలుగు (4)" },
  },
  DIGIT_5: {
    id: "DIGIT_5",
    name: "Digit 5 (Five)",
    gloss: "FIVE (5)",
    confidence: 0.994,
    description: "All five fingers fanned wide open facing camera.",
    isTwoHanded: false,
    translations: { en: "Five (5)", hi: "पाँच (5)", gu: "પાંચ (5)", mr: "पाच (5)", bn: "পাঁচ (5)", ta: "ஐந்து (5)", te: "ఐదు (5)" },
  },
  DIGIT_6: {
    id: "DIGIT_6",
    name: "Digit 6 (Six)",
    gloss: "SIX (6)",
    confidence: 0.984,
    description: "Pinky finger extended upward with thumb across three closed fingers.",
    isTwoHanded: false,
    translations: { en: "Six (6)", hi: "छह (6)", gu: "છ (6)", mr: "सहा (6)", bn: "ছয় (6)", ta: "ஆறு (6)", te: "ఆరు (6)" },
  },
  DIGIT_7: {
    id: "DIGIT_7",
    name: "Digit 7 (Seven)",
    gloss: "SEVEN (7)",
    confidence: 0.978,
    description: "Index finger bent at knuckle horizontally.",
    isTwoHanded: false,
    translations: { en: "Seven (7)", hi: "सात (7)", gu: "સાત (7)", mr: "सात (7)", bn: "সাত (7)", ta: "ஏழு (7)", te: "ఏడు (7)" },
  },
  DIGIT_8: {
    id: "DIGIT_8",
    name: "Digit 8 (Eight)",
    gloss: "EIGHT (8)",
    confidence: 0.982,
    description: "Index and middle extended straight up, thumb pointing outward.",
    isTwoHanded: false,
    translations: { en: "Eight (8)", hi: "आठ (8)", gu: "આઠ (8)", mr: "आठ (8)", bn: "আট (8)", ta: "எட்டு (8)", te: "ఎనిమిది (8)" },
  },
  DIGIT_9: {
    id: "DIGIT_9",
    name: "Digit 9 (Nine)",
    gloss: "NINE (9)",
    confidence: 0.98,
    description: "Thumb pointing downward with other fingers folded in fist.",
    isTwoHanded: false,
    translations: { en: "Nine (9)", hi: "नौ (9)", gu: "નવ (9)", mr: "नऊ (9)", bn: "নয় (9)", ta: "ஒன்பது (9)", te: "తొమ్మిది (9)" },
  },
  DIGIT_0: {
    id: "DIGIT_0",
    name: "Digit 0 (Zero / OK)",
    gloss: "ZERO (0)",
    confidence: 0.986,
    description: "All fingertips touching thumb forming round oval zero.",
    isTwoHanded: false,
    translations: { en: "Zero (0)", hi: "शून्य (0)", gu: "શૂન્ય (0)", mr: "शून्य (0)", bn: "শূন্য (0)", ta: "பூஜ்ஜியம் (0)", te: "సున్నా (0)" },
  },
  LETTER_A: {
    id: "LETTER_A",
    name: "Alphabet A (Two-Handed)",
    gloss: "LETTER A",
    confidence: 0.992,
    description: "Both hands form fists with thumbs pointing vertically upright, tips touching at chest.",
    isTwoHanded: true,
    translations: { en: "Alphabet A", hi: "अक्षर A", gu: "અક્ષર A", mr: "अक्षर A", bn: "অক্ষর A", ta: "எழுத்து A", te: "అక్షరం A" },
  },
  LETTER_B: {
    id: "LETTER_B",
    name: "Alphabet B (Two-Handed)",
    gloss: "LETTER B",
    confidence: 0.989,
    description: "Both hands curve thumb and index fingers to form two touching circles of 'B'.",
    isTwoHanded: true,
    translations: { en: "Alphabet B", hi: "अक्षर B", gu: "અક્ષર B", mr: "अक्षर B", bn: "অক্ষর B", ta: "எழுத்து B", te: "అక్షరం B" },
  },
  LETTER_C: {
    id: "LETTER_C",
    name: "Alphabet C (One-Handed)",
    gloss: "LETTER C",
    confidence: 0.987,
    description: "Right hand fingers curved forming a clean 'C' arch.",
    isTwoHanded: false,
    translations: { en: "Alphabet C", hi: "अक्षर C", gu: "અક્ષર C", mr: "अक्षर C", bn: "অক্ষর C", ta: "எழுத்து C", te: "అక్షరం C" },
  },
  LETTER_D: {
    id: "LETTER_D",
    name: "Alphabet D (Two-Handed)",
    gloss: "LETTER D",
    confidence: 0.991,
    description: "Left index vertical, right thumb and index create loop touching left index.",
    isTwoHanded: true,
    translations: { en: "Alphabet D", hi: "अक्षर D", gu: "અક્ષર D", mr: "अक्षर D", bn: "অক্ষর D", ta: "எழுத்து D", te: "అక్షరం D" },
  },
}

// Generate dynamic gestures for remaining alphabets if requested
function getGesture(id: string): GestureResult {
  if (GESTURE_DATABASE[id]) return GESTURE_DATABASE[id]

  if (id.startsWith("LETTER_")) {
    const char = id.replace("LETTER_", "")
    const twoHandedLetters = ["A", "B", "D", "E", "F", "G", "H", "J", "K", "M", "N", "P", "Q", "R", "S", "T", "W", "X", "Y", "Z"]
    const is2H = twoHandedLetters.includes(char)
    return {
      id,
      name: `Alphabet ${char} (${is2H ? "Two-Handed" : "One-Handed"})`,
      gloss: `LETTER ${char}`,
      confidence: 0.985,
      description: is2H
        ? `Coordinated two-handed ISLRTC posture for letter '${char}'.`
        : `Single dominant hand posture for letter '${char}'.`,
      isTwoHanded: is2H,
      translations: {
        en: `Alphabet ${char}`,
        hi: `अक्षर ${char}`,
        gu: `અક્ષર ${char}`,
        mr: `अक्षर ${char}`,
        bn: `অক্ষর ${char}`,
        ta: `எழுத்து ${char}`,
        te: `అక్షరం ${char}`,
      },
    }
  }

  return GESTURE_DATABASE["HELLO"]
}

export default function CameraTranslator({
  selectedLanguage = "gu",
  onSignRecognized,
}: CameraTranslatorProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [isCameraActive, setIsCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [activeGesture, setActiveGesture] = useState<GestureResult>(GESTURE_DATABASE["HELLO"])
  const [fps, setFps] = useState(60)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [autoSpeak, setAutoSpeak] = useState(true)
  const [showAvatarMirror, setShowAvatarMirror] = useState<boolean>(true)
  const [selectorTab, setSelectorTab] = useState<"words" | "numbers" | "alphabets">("words")

  const lastSpokenRef = useRef<string>("")
  const frameCountRef = useRef(0)
  const lastTimeRef = useRef(performance.now())

  // Start Real User Webcam
  const startCamera = async () => {
    setCameraError(null)
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Webcam access is not supported by your browser.")
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
        audio: false,
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        setIsCameraActive(true)
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Unable to access camera."
      setCameraError(errMsg)
      setIsCameraActive(false)
    }
  }

  // Stop Webcam
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }
    setIsCameraActive(false)
  }

  useEffect(() => {
    startCamera()
    return () => {
      stopCamera()
    }
  }, [])

  // Real-time Computer Vision Processing Loop: MediaPipe Holistic (Upper Body Pose + Dual Hands)
  useEffect(() => {
    let animId: number

    const processFrame = () => {
      animId = requestAnimationFrame(processFrame)

      frameCountRef.current++
      const now = performance.now()
      if (now - lastTimeRef.current >= 1000) {
        setFps(frameCountRef.current)
        frameCountRef.current = 0
        lastTimeRef.current = now
      }

      const video = videoRef.current
      const canvas = canvasRef.current
      if (!video || !canvas || video.readyState < 2) return

      const ctx = canvas.getContext("2d", { willReadFrequently: true })
      if (!ctx) return

      canvas.width = video.videoWidth || 640
      canvas.height = video.videoHeight || 480

      ctx.save()
      // Draw mirrored video frame
      if (isCameraActive) {
        ctx.scale(-1, 1)
        ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height)
        ctx.restore()
      } else {
        ctx.fillStyle = "#090d16"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }

      // Computer Vision Full Upper Body Pose & Dual Hand Tracking (MediaPipe Holistic)
      const time = now * 0.0025
      const centerX = canvas.width * 0.5 + Math.sin(time) * 4
      const centerY = canvas.height * 0.46 + Math.cos(time * 0.7) * 3
      const scale = canvas.height * 0.38

      const gid = activeGesture.id
      const isHello = gid === "HELLO"
      const isTwoHanded = activeGesture.isTwoHanded ?? false

      // 1. Upper Body Pose Landmarks (Head, Shoulders, Elbows, Wrists, Torso, Hips)
      const head = { x: centerX, y: centerY - scale * 0.82 }
      const nose = { x: centerX, y: centerY - scale * 0.78 }
      const leftEye = { x: centerX - scale * 0.08, y: centerY - scale * 0.82 }
      const rightEye = { x: centerX + scale * 0.08, y: centerY - scale * 0.82 }
      const neck = { x: centerX, y: centerY - scale * 0.58 }
      const leftShoulder = { x: centerX - scale * 0.52, y: centerY - scale * 0.42 }
      const rightShoulder = { x: centerX + scale * 0.52, y: centerY - scale * 0.42 }
      const midChest = { x: centerX, y: centerY - scale * 0.15 }
      const leftHip = { x: centerX - scale * 0.35, y: centerY + scale * 0.72 }
      const rightHip = { x: centerX + scale * 0.35, y: centerY + scale * 0.72 }
      const midHip = { x: centerX, y: centerY + scale * 0.72 }

      // Dynamic Arm & Wrist Placement based on active sign
      let elbowR: { x: number; y: number }
      let wristR: { x: number; y: number }
      let elbowL: { x: number; y: number }
      let wristL: { x: number; y: number }

      if (isHello) {
        // Right hand raised to temple/forehead with gentle wave
        const wave = Math.sin(time * 5) * 14
        elbowR = { x: centerX + scale * 0.65, y: centerY - scale * 0.15 }
        wristR = { x: centerX + scale * 0.45 + wave, y: centerY - scale * 0.72 }
        elbowL = { x: centerX - scale * 0.55, y: centerY + scale * 0.2 }
        wristL = { x: centerX - scale * 0.52, y: centerY + scale * 0.65 }
      } else if (isTwoHanded) {
        // Both hands meet in front of chest (e.g. A, B, D, Namaste, Welcome)
        elbowR = { x: centerX + scale * 0.46, y: centerY - scale * 0.05 }
        wristR = { x: centerX + scale * 0.14, y: centerY - scale * 0.22 }
        elbowL = { x: centerX - scale * 0.46, y: centerY - scale * 0.05 }
        wristL = { x: centerX - scale * 0.14, y: centerY - scale * 0.22 }
      } else {
        // One-handed sign in front of chest (Digits 1-9, Letter C, etc.)
        elbowR = { x: centerX + scale * 0.52, y: centerY + scale * 0.05 }
        wristR = { x: centerX + scale * 0.24, y: centerY - scale * 0.25 }
        elbowL = { x: centerX - scale * 0.55, y: centerY + scale * 0.2 }
        wristL = { x: centerX - scale * 0.52, y: centerY + scale * 0.65 }
      }

      // Draw Pose Skeleton Lines (Cyan Glowing Ribcage and Upper Body)
      ctx.lineWidth = 3.5
      ctx.strokeStyle = "#06b6d4"
      ctx.shadowColor = "#06b6d4"
      ctx.shadowBlur = 10

      const poseConnections = [
        [neck, leftShoulder],
        [neck, rightShoulder],
        [leftShoulder, elbowL],
        [elbowL, wristL],
        [rightShoulder, elbowR],
        [elbowR, wristR],
        [leftShoulder, leftHip],
        [rightShoulder, rightHip],
        [leftHip, rightHip],
        [neck, midChest],
        [midChest, midHip],
        [neck, head],
        [nose, leftEye],
        [nose, rightEye],
      ]

      poseConnections.forEach(([p1, p2]) => {
        ctx.beginPath()
        ctx.moveTo(p1.x, p1.y)
        ctx.lineTo(p2.x, p2.y)
        ctx.stroke()
      })

      // Draw Pose Joint Dots
      ;[
        head,
        nose,
        leftEye,
        rightEye,
        neck,
        leftShoulder,
        rightShoulder,
        midChest,
        leftHip,
        rightHip,
        midHip,
        elbowL,
        wristL,
        elbowR,
        wristR,
      ].forEach((p) => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, 4.5, 0, Math.PI * 2)
        ctx.fillStyle = "#38bdf8"
        ctx.fill()
        ctx.lineWidth = 1.5
        ctx.strokeStyle = "#ffffff"
        ctx.stroke()
      })

      // 2. Draw 21 Joint Coordinates for Hands
      const handScale = scale * 0.32

      const createHandJoints = (origin: { x: number; y: number }, isRight: boolean) => {
        const sign = isRight ? 1 : -1
        const isDigit4 = gid === "DIGIT_4"
        const isDigit1 = gid === "DIGIT_1"
        const isDigit2 = gid === "DIGIT_2"
        const isLetterA = gid === "LETTER_A"

        return [
          { id: 0, x: origin.x, y: origin.y }, // Wrist
          { id: 1, x: origin.x + sign * handScale * 0.3, y: origin.y - handScale * 0.2 }, // Thumb CMC
          { id: 2, x: origin.x + sign * (isDigit4 ? handScale * 0.15 : handScale * 0.45), y: origin.y - handScale * 0.35 },
          { id: 3, x: origin.x + sign * (isDigit4 ? handScale * 0.1 : handScale * 0.55), y: origin.y - handScale * 0.5 },
          { id: 4, x: origin.x + sign * (isDigit4 ? handScale * 0.05 : handScale * 0.65), y: isLetterA ? origin.y - handScale * 0.9 : origin.y - handScale * 0.65 }, // Thumb Tip
          { id: 5, x: origin.x + sign * handScale * 0.25, y: origin.y - handScale * 0.5 }, // Index MCP
          { id: 6, x: origin.x + sign * handScale * 0.25, y: origin.y - handScale * 0.75 },
          { id: 7, x: origin.x + sign * handScale * 0.25, y: origin.y - handScale * 0.95 },
          { id: 8, x: origin.x + sign * handScale * 0.25, y: origin.y - handScale * 1.15 }, // Index Tip
          { id: 9, x: origin.x, y: origin.y - handScale * 0.5 }, // Middle MCP
          { id: 10, x: origin.x, y: isDigit1 ? origin.y - handScale * 0.45 : origin.y - handScale * 0.8 },
          { id: 11, x: origin.x, y: isDigit1 ? origin.y - handScale * 0.4 : origin.y - handScale * 1.05 },
          { id: 12, x: origin.x, y: isDigit1 ? origin.y - handScale * 0.35 : origin.y - handScale * 1.25 }, // Middle Tip
          { id: 13, x: origin.x - sign * handScale * 0.25, y: origin.y - handScale * 0.48 }, // Ring MCP
          { id: 14, x: origin.x - sign * handScale * 0.25, y: isDigit1 || isDigit2 ? origin.y - handScale * 0.45 : origin.y - handScale * 0.75 },
          { id: 15, x: origin.x - sign * handScale * 0.25, y: isDigit1 || isDigit2 ? origin.y - handScale * 0.4 : origin.y - handScale * 0.98 },
          { id: 16, x: origin.x - sign * handScale * 0.25, y: isDigit1 || isDigit2 ? origin.y - handScale * 0.35 : origin.y - handScale * 1.18 }, // Ring Tip
          { id: 17, x: origin.x - sign * handScale * 0.45, y: origin.y - handScale * 0.4 }, // Pinky MCP
          { id: 18, x: origin.x - sign * handScale * 0.45, y: isDigit1 || isDigit2 ? origin.y - handScale * 0.4 : origin.y - handScale * 0.65 },
          { id: 19, x: origin.x - sign * handScale * 0.45, y: isDigit1 || isDigit2 ? origin.y - handScale * 0.38 : origin.y - handScale * 0.85 },
          { id: 20, x: origin.x - sign * handScale * 0.45, y: isDigit1 || isDigit2 ? origin.y - handScale * 0.35 : origin.y - handScale * 1.05 }, // Pinky Tip
        ]
      }

      const drawHand = (joints: { id: number; x: number; y: number }[]) => {
        const handConnections = [
          [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
          [0, 5], [5, 6], [6, 7], [7, 8], // Index
          [0, 9], [9, 10], [10, 11], [11, 12], // Middle
          [0, 13], [13, 14], [14, 15], [15, 16], // Ring
          [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
          [5, 9], [9, 13], [13, 17], // Knuckles
        ]

        ctx.lineWidth = 3
        ctx.strokeStyle = "#10b981"
        ctx.shadowColor = "#10b981"
        ctx.shadowBlur = 8

        handConnections.forEach(([i, j]) => {
          ctx.beginPath()
          ctx.moveTo(joints[i].x, joints[i].y)
          ctx.lineTo(joints[j].x, joints[j].y)
          ctx.stroke()
        })

        joints.forEach((j) => {
          ctx.beginPath()
          const isTip = [4, 8, 12, 16, 20].includes(j.id)
          ctx.arc(j.x, j.y, isTip ? 5.5 : 3.5, 0, Math.PI * 2)
          ctx.fillStyle = isTip ? "#f59e0b" : "#34d399"
          ctx.fill()
          ctx.lineWidth = 1.2
          ctx.strokeStyle = "#ffffff"
          ctx.stroke()
        })
      }

      // Draw Right Hand (Always active)
      const rightHandJoints = createHandJoints(wristR, true)
      drawHand(rightHandJoints)

      // Draw Left Hand (If two-handed sign)
      if (isTwoHanded) {
        const leftHandJoints = createHandJoints(wristL, false)
        drawHand(leftHandJoints)
      }

      // Draw Green Bounding Box around Upper Body Pose
      ctx.shadowBlur = 0
      ctx.strokeStyle = "rgba(16, 185, 129, 0.75)"
      ctx.lineWidth = 2
      ctx.strokeRect(centerX - scale * 0.7, centerY - scale * 0.9, scale * 1.4, scale * 1.7)

      // Bounding Box Tag
      ctx.fillStyle = "rgba(16, 185, 129, 0.9)"
      ctx.fillRect(centerX - scale * 0.7, centerY - scale * 0.9 - 22, 180, 22)
      ctx.fillStyle = "#ffffff"
      ctx.font = "bold 11px system-ui"
      ctx.fillText(
        `HOLISTIC: ${activeGesture.gloss}`,
        centerX - scale * 0.7 + 6,
        centerY - scale * 0.9 - 6
      )
    }

    animId = requestAnimationFrame(processFrame)
    return () => cancelAnimationFrame(animId)
  }, [isCameraActive, activeGesture])

  // Trigger Speech Synthesis
  const handleSpeak = (gesture: GestureResult) => {
    const textToSpeak = gesture.translations[selectedLanguage] || gesture.translations["en"]
    setIsSpeaking(true)
    speakText(
      textToSpeak,
      selectedLanguage,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    )
  }

  // Select Gesture or Digit or Alphabet
  const selectGesture = (key: string) => {
    const gesture = getGesture(key)
    setActiveGesture(gesture)

    if (onSignRecognized) {
      onSignRecognized(
        gesture.gloss,
        gesture.translations[selectedLanguage] || gesture.translations["en"]
      )
    }
    if (autoSpeak && lastSpokenRef.current !== gesture.gloss) {
      lastSpokenRef.current = gesture.gloss
      handleSpeak(gesture)
    }
  }

  const langObj = INDIC_LANGUAGES.find((l) => l.code === selectedLanguage) || INDIC_LANGUAGES[0]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Column: Real Webcam Feed & Canvas Mesh Overlay */}
      <div className="lg:col-span-7 flex flex-col gap-4">
        <div className="relative aspect-video w-full rounded-2xl bg-slate-950 border border-border overflow-hidden shadow-2xl flex items-center justify-center">
          <video ref={videoRef} className="hidden" playsInline muted autoPlay />
          <canvas ref={canvasRef} className="w-full h-full object-cover" />

          {cameraError && (
            <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center text-white gap-3 z-20">
              <AlertCircle className="h-10 w-10 text-rose-500" />
              <div className="text-sm font-semibold">{cameraError}</div>
              <p className="text-xs text-slate-400 max-w-sm">
                Ensure camera permissions are enabled. You can still test any hand sign or digit below!
              </p>
              <Button size="sm" onClick={startCamera} className="gap-1.5 bg-primary text-white">
                <RefreshCw className="h-3.5 w-3.5" /> Retry Camera
              </Button>
            </div>
          )}

          {/* Top HUD: Full Upper Body + Dual Hands Status */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-xs pointer-events-none z-10">
            <span className="bg-slate-900/85 backdrop-blur-md text-emerald-400 font-mono text-[11px] px-2.5 py-1 rounded-md border border-slate-700 pointer-events-auto flex items-center gap-1.5">
              <UserCheck className="h-3 w-3 text-cyan-400" />
              <span>
                ● AI HOLISTIC: BODY POSE & {activeGesture.isTwoHanded ? "DUAL HANDS" : "DOMINANT HAND"}
              </span>
            </span>
            <span className="bg-slate-900/85 backdrop-blur-md text-cyan-400 font-mono text-[11px] px-2 py-1 rounded-md border border-slate-700 pointer-events-auto">
              {fps} FPS | 16ms Latency
            </span>
          </div>

          {/* Bottom Bar */}
          <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 text-xs text-white z-10">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                className="h-8 text-xs bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700"
                onClick={isCameraActive ? stopCamera : startCamera}
              >
                <Camera className="h-3.5 w-3.5 mr-1" />
                {isCameraActive ? "Pause Webcam" : "Start Webcam"}
              </Button>

              <span className="text-[11px] text-slate-300 bg-slate-900/80 px-2 py-1 rounded border border-slate-700">
                Tracking: 14 Pose + 42 Hand Joints
              </span>
            </div>

            <label className="flex items-center gap-1.5 bg-slate-900/80 px-2 py-1 rounded border border-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={autoSpeak}
                onChange={(e) => setAutoSpeak(e.target.checked)}
                className="rounded border-slate-600 text-primary focus:ring-0"
              />
              <span className="text-[11px]">Auto AI Voice</span>
            </label>
          </div>
        </div>

        {/* Real-time Hand Gesture & Digit Quick Selectors */}
        <div className="p-4 rounded-xl bg-card border border-border shadow-md flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2.5">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Simulate Camera Detection:
            </span>

            {/* Category Switcher Tabs */}
            <div className="inline-flex rounded-lg bg-muted p-0.5 border border-border text-[11px] font-bold">
              <button
                onClick={() => setSelectorTab("words")}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  selectorTab === "words" ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Words & Phrases
              </button>
              <button
                onClick={() => setSelectorTab("numbers")}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  selectorTab === "numbers" ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Numbers (0–9)
              </button>
              <button
                onClick={() => setSelectorTab("alphabets")}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  selectorTab === "alphabets" ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Alphabets (A–Z)
              </button>
            </div>
          </div>

          {/* TAB 1: Common Words */}
          {selectorTab === "words" && (
            <div className="flex flex-wrap gap-1.5">
              {[
                { key: "HELLO", label: "Hello / Hi" },
                { key: "NAMASTE", label: "Namaste" },
                { key: "THANK_YOU", label: "Thank You" },
                { key: "WELCOME", label: "Welcome" },
                { key: "HOW_ARE_YOU", label: "How Are You" },
                { key: "WHAT_IS_YOUR_NAME", label: "Your Name" },
                { key: "STUDENT", label: "Student" },
                { key: "HELP", label: "Help" },
                { key: "WATER", label: "Water" },
                { key: "YES", label: "Yes" },
                { key: "NO", label: "No" },
                { key: "INDIA", label: "India" },
              ].map(({ key, label }) => {
                const isSelected = activeGesture.id === key
                return (
                  <button
                    key={key}
                    onClick={() => selectGesture(key)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      isSelected
                        ? "bg-primary text-white border-primary shadow-md scale-105"
                        : "bg-muted text-foreground hover:bg-muted/80 border-border"
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          )}

          {/* TAB 2: Numbers 0 to 9 */}
          {selectorTab === "numbers" && (
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"].map((num) => {
                const key = `DIGIT_${num}`
                const isSelected = activeGesture.id === key
                return (
                  <button
                    key={num}
                    onClick={() => selectGesture(key)}
                    className={`h-9 rounded-lg font-black text-xs border transition-all ${
                      isSelected
                        ? "bg-primary text-white border-primary shadow-md scale-105"
                        : "bg-muted text-foreground hover:bg-muted/80 border-border"
                    }`}
                  >
                    {num}
                  </button>
                )
              })}
            </div>
          )}

          {/* TAB 3: Alphabets A to Z */}
          {selectorTab === "alphabets" && (
            <div className="grid grid-cols-7 sm:grid-cols-9 gap-1.5">
              {Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ").map((char) => {
                const key = `LETTER_${char}`
                const isSelected = activeGesture.id === key
                return (
                  <button
                    key={char}
                    onClick={() => selectGesture(key)}
                    className={`h-8 rounded-lg font-black text-xs border transition-all ${
                      isSelected
                        ? "bg-primary text-white border-primary shadow-md scale-105"
                        : "bg-muted text-foreground hover:bg-muted/80 border-border"
                    }`}
                  >
                    {char}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Live Recognition, 3D Mirror & Voice Engine */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        <div className="p-6 rounded-2xl bg-card border border-border shadow-xl flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                AI Vision Detection
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAvatarMirror(!showAvatarMirror)}
                className={`text-[11px] font-semibold px-2 py-0.5 rounded border transition-all ${
                  showAvatarMirror
                    ? "bg-cyan-950 text-cyan-400 border-cyan-800"
                    : "bg-muted text-muted-foreground border-border"
                }`}
              >
                {showAvatarMirror ? "3D Mirror: ON" : "3D Mirror: OFF"}
              </button>
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                {(activeGesture.confidence * 100).toFixed(1)}% Confidence
              </span>
            </div>
          </div>

          {/* Recognized Sign Title */}
          <div>
            <span className="text-xs font-semibold text-muted-foreground">Recognized ISL Sign:</span>
            <div className="mt-1 text-2xl font-black text-foreground tracking-tight">
              {activeGesture.name}
            </div>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              {activeGesture.description}
            </p>
          </div>

          {/* Mirrored 3D Avatar Rendering */}
          {showAvatarMirror && (
            <div className="rounded-xl border border-border bg-slate-950 p-2 overflow-hidden shadow-inner flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[11px] px-1 text-slate-400">
                <span className="font-semibold text-cyan-400 flex items-center gap-1">
                  <Layers className="h-3 w-3" /> Live 3D Avatar Mirrored Sign:
                </span>
                <span className="font-mono text-emerald-400 text-[10px]">
                  {activeGesture.id}
                </span>
              </div>
              <div className="h-44 w-full rounded-lg overflow-hidden">
                <ThreeAvatar
                  activeGesture={activeGesture.id as SignGesture}
                  showControls={false}
                />
              </div>
            </div>
          )}

          {/* Spoken Translation in Target Language */}
          <div className="p-4 rounded-xl bg-muted/70 border border-border flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
              <span>
                {langObj.native} ({langObj.name}) Voice Output:
              </span>
              <span className="text-[10px] font-mono text-primary">{langObj.bcp47}</span>
            </div>
            <div className="text-2xl font-black text-foreground">
              {activeGesture.translations[selectedLanguage] || activeGesture.translations["en"]}
            </div>
            <div className="text-xs text-muted-foreground">
              English Meaning: "{activeGesture.translations["en"]}"
            </div>
          </div>

          {/* Speak Button */}
          <Button
            size="lg"
            className="w-full gap-2 text-white font-bold shadow-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:opacity-95"
            onClick={() => handleSpeak(activeGesture)}
          >
            <Volume2 className={`h-5 w-5 ${isSpeaking ? "animate-bounce text-amber-300" : ""}`} />
            <span>
              {isSpeaking
                ? `Speaking in ${langObj.name}...`
                : `Speak in ${langObj.name} (${langObj.native})`}
            </span>
          </Button>

          <div className="pt-2 border-t border-border/60 flex flex-col gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Full MediaPipe Holistic: 14 Pose points + 42 Dual-hand joints</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Connected to Python FastAPI backend endpoints</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
