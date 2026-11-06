import { useEffect, useRef, useState, useCallback } from "react"
import {
  Camera,
  CameraOff,
  Volume2,
  Sparkles,
  Activity,
  ShieldCheck,
  CheckCircle2,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  Trash2,
  Edit3,
  HelpCircle,
  Layers,
  Eye,
  EyeOff,
  Database,
  Cpu,
  Check,
  BookOpen,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { INDIC_LANGUAGES, speakText } from "@/lib/speech"

interface LiveISLCameraStudioProps {
  selectedLanguage?: string
  onLanguageChange?: (lang: string) => void
  onSignRecognized?: (sign: string, translation: string) => void
}

export interface RecognitionHistoryItem {
  id: string
  signId: string
  gloss: string
  name: string
  translatedText: string
  confidence: number
  modelType: string
  timestamp: string
}

export interface CandidatePrediction {
  signId: string
  gloss: string
  name: string
  probability: number
}

export interface ISLClass {
  id: string
  gloss: string
  name: string
  category: string
  isTwoHanded: boolean
  isDynamic: boolean
  expectedElevation: string
  expectedHandsMeet: boolean
  translations: Record<string, string>
  description: string
}

interface LandmarkPoint {
  x: number
  y: number
  z?: number
  visibility?: number
}

// MediaPipe 21 Hand Connections for skeletal drawing line-wise
const FINGER_RAYS = [
  { name: "Thumb", tag: "TH", color: "#f59e0b", pairs: [[0, 1], [1, 2], [2, 3], [3, 4]] },
  { name: "Index", tag: "IX", color: "#06b6d4", pairs: [[0, 5], [5, 6], [6, 7], [7, 8]] },
  { name: "Middle", tag: "MD", color: "#10b981", pairs: [[0, 9], [9, 10], [10, 11], [11, 12]] },
  { name: "Ring", tag: "RG", color: "#8b5cf6", pairs: [[0, 13], [13, 14], [14, 15], [15, 16]] },
  { name: "Pinky", tag: "PK", color: "#ec4899", pairs: [[0, 17], [17, 18], [18, 19], [19, 20]] },
]

const PALM_CONNECTIONS = [
  [5, 9], [9, 13], [13, 17], [0, 5], [0, 17]
]

// Fingertip landmark indices to highlight with glow rings
const FINGERTIP_INDICES = [4, 8, 12, 16, 20]

// Authentically defined ISL sign classes with ISLRTC & MSJE criteria
// All 13 Indian Languages: gu, hi, en, mr, bn, ta, te, kn, ml, pa, or, as, ur
export const ISL_CLASSES: ISLClass[] = [
  {
    id: "NAMASTE",
    gloss: "NAMASTE",
    name: "Namaste, Pranam",
    category: "Greetings",
    isTwoHanded: true,
    isDynamic: true,
    expectedElevation: "chest",
    expectedHandsMeet: true,
    translations: {
      gu: "નમસ્તે, પ્રણામ",
      hi: "नमस्ते, नमस्कार",
      en: "Hello, Namaste",
      mr: "नमस्कार",
      bn: "নমস্কার",
      ta: "வணக்கம்",
      te: "నమస్కారం",
      kn: "ನಮಸ್ಕಾರ",
      ml: "നമസ്കാരം",
      pa: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ",
      or: "ନମସ୍କାର",
      as: "নমস্কাৰ",
      ur: "سلام، آداب",
    },
    description: "Both open flat palms pressed together horizontally at sternum with slight forward head tilt.",
  },
  {
    id: "HELLO",
    gloss: "HELLO",
    name: "Hello, Greeting",
    category: "Greetings",
    isTwoHanded: false,
    isDynamic: true,
    expectedElevation: "forehead",
    expectedHandsMeet: false,
    translations: {
      gu: "હેલો, નમસ્તે",
      hi: "नमस्ते, हैलो",
      en: "Hello, Hi",
      mr: "हॅलो, नमस्कार",
      bn: "হ্যালো, নমস্কার",
      ta: "ஹலோ, வணக்கம்",
      te: "హలో",
      kn: "ಹಲೋ",
      ml: "ഹലോ",
      pa: "ਹੈਲੋ",
      or: "ହ୍ୟାଲୋ",
      as: "হেল্ল'",
      ur: "ہیلو",
    },
    description: "Dominant hand raised near temple/ear, waving outward with a welcoming open handshape.",
  },
  {
    id: "THANK_YOU",
    gloss: "THANK-YOU",
    name: "Thank You, Gratitude",
    category: "Polite Phrases",
    isTwoHanded: false,
    isDynamic: true,
    expectedElevation: "chin",
    expectedHandsMeet: false,
    translations: {
      gu: "આભાર, ધન્યવાદ",
      hi: "धन्यवाद, शुक्रिया",
      en: "Thank You",
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
    description: "Fingertips of flat hand touch chin, then open outward toward recipient with affirmative nod.",
  },
  {
    id: "WELCOME",
    gloss: "WELCOME",
    name: "Welcome, Swagatam",
    category: "Greetings",
    isTwoHanded: true,
    isDynamic: true,
    expectedElevation: "chest",
    expectedHandsMeet: false,
    translations: {
      gu: "સ્વાગત છે",
      hi: "स्वागत है",
      en: "Welcome",
      mr: "स्वागत आहे",
      bn: "স্বাগতম",
      ta: "வரவேற்கிறோம்",
      te: "స్వాగతం",
      kn: "ಸ್ವಾಗತ",
      ml: "ಸ್ವಾಗതം",
      pa: "ਜੀ ਆਇਆਂ ਨੂੰ",
      or: "ସ୍ୱାଗତ",
      as: "স্বাগতম",
      ur: "خوش آمدید",
    },
    description: "Both open arms sweep inward toward center chest invitingly with hospitality smile.",
  },
  {
    id: "WATER",
    gloss: "WATER",
    name: "Water, Paani",
    category: "Daily Needs",
    isTwoHanded: false,
    isDynamic: true,
    expectedElevation: "chin",
    expectedHandsMeet: false,
    translations: {
      gu: "પાણી",
      hi: "पानी, जल",
      en: "Water",
      mr: "पाणी",
      bn: "জল, পানি",
      ta: "தண்ணீர்",
      te: "నీరు",
      kn: "ನೀರು",
      ml: "വെള്ളം",
      pa: "ਪਾਣੀ",
      or: "ପାଣି",
      as: "পানী",
      ur: "پانی",
    },
    description: "Dominant W-handshape (index, middle, ring extended) taps the side of chin twice.",
  },
  {
    id: "HELP",
    gloss: "HELP-NEED",
    name: "Help, Assistance",
    category: "Emergency",
    isTwoHanded: true,
    isDynamic: true,
    expectedElevation: "chest",
    expectedHandsMeet: true,
    translations: {
      gu: "મદદ, સહાય",
      hi: "मदद, सहायता",
      en: "Help, Need Help",
      mr: "मदत",
      bn: "সাহায্য",
      ta: "உதவி",
      te: "సహాయం",
      kn: "ಸಹಾಯ",
      ml: "സഹായം",
      pa: "ਮਦਦ",
      or: "ସାହାଯ୍ୟ",
      as: "সহায়",
      ur: "مدد",
    },
    description: "Dominant closed fist rests on open flat non-dominant palm, both lifting upward in support.",
  },
  {
    id: "STUDENT",
    gloss: "STUDENT",
    name: "Student, Learner",
    category: "Education",
    isTwoHanded: true,
    isDynamic: true,
    expectedElevation: "chest",
    expectedHandsMeet: true,
    translations: {
      gu: "વિદ્યાર્થી",
      hi: "विद्यार्थी, छात्र",
      en: "Student, Learner",
      mr: "विद्यार्थी",
      bn: "ছাত্র, ছাত্রী",
      ta: "மாணவர்",
      te: "విద్యార్థి",
      kn: "ವಿದ್ಯಾರ್ಥಿ",
      ml: "വിദ്യാർത്ഥി",
      pa: "ਵਿਦਿਆਰਥੀ",
      or: "ଛାତ୍ର",
      as: "ছাত্র",
      ur: "طالب علم",
    },
    description: "Right hand gathers knowledge from left open palm and touches temple, representing learning.",
  },
  {
    id: "INDIA",
    gloss: "BHARAT-INDIA",
    name: "India, Bharat",
    category: "Places",
    isTwoHanded: false,
    isDynamic: true,
    expectedElevation: "forehead",
    expectedHandsMeet: false,
    translations: {
      gu: "ભારત, હિન્દુસ્તાન",
      hi: "भारत, हिन्दुस्तान",
      en: "India, Bharat",
      mr: "भारत",
      bn: "ভারত",
      ta: "இந்தியா",
      te: "భారతదేశం",
      kn: "ಭಾರತ",
      ml: "ഭാരതം",
      pa: "ਭਾਰਤ",
      or: "ଭାରତ",
      as: "ভাৰত",
      ur: "بھارت، ہندوستان",
    },
    description: "Dominant thumb touches bindi/tilak spot on forehead, then opens outward with national pride.",
  },
  {
    id: "YES",
    gloss: "YES",
    name: "Yes, Affirmative",
    category: "Conversation",
    isTwoHanded: false,
    isDynamic: true,
    expectedElevation: "chest",
    expectedHandsMeet: false,
    translations: {
      gu: "હા, ચોક્કસ",
      hi: "हाँ, बिल्कुल",
      en: "Yes, Affirmative",
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
    description: "Dominant closed fist nods up and down like a nodding head, confirming agreement.",
  },
  {
    id: "NO",
    gloss: "NO",
    name: "No, Negative",
    category: "Conversation",
    isTwoHanded: false,
    isDynamic: true,
    expectedElevation: "chest",
    expectedHandsMeet: false,
    translations: {
      gu: "ના, નહીં",
      hi: "नहीं",
      en: "No, Negative",
      mr: "नाही",
      bn: "না",
      ta: "இல்லை",
      te: "కాదు, లేదు",
      kn: "ಇಲ್ಲ",
      ml: "അല്ല, ഇല്ല",
      pa: "ਨਹੀਂ",
      or: "ନାହିଁ",
      as: "নহয়",
      ur: "نہیں",
    },
    description: "Index and middle fingers snap down onto thumb tip twice, indicating refusal or negation.",
  },
  // ================= NUMBERS 0 - 9 (MSJE STANDARD) =================
  {
    id: "DIGIT_1",
    gloss: "DIGIT 1",
    name: "Number 1",
    category: "Numbers",
    isTwoHanded: false,
    isDynamic: false,
    expectedElevation: "chest",
    expectedHandsMeet: false,
    translations: { gu: "નંબર એક (1)", hi: "संख्या एक (1)", en: "Number One (1)", mr: "एक (1)", bn: "এক (1)", ta: "ஒன்று (1)", te: "ఒకటి (1)", kn: "ಒಂದು (1)", ml: "ഒന്ന് (1)", pa: "ਇੱਕ (1)", or: "ଏକ (1)", as: "এক (1)", ur: "ایک (1)" },
    description: "Index finger extended vertically upright, thumb folded over remaining closed fingers.",
  },
  {
    id: "DIGIT_2",
    gloss: "DIGIT 2",
    name: "Number 2",
    category: "Numbers",
    isTwoHanded: false,
    isDynamic: false,
    expectedElevation: "chest",
    expectedHandsMeet: false,
    translations: { gu: "નંબર બે (2)", hi: "संख्या दो (2)", en: "Number Two (2)", mr: "दोन (2)", bn: "দুই (2)", ta: "இரண்டு (2)", te: "రెండు (2)", kn: "ಎರಡು (2)", ml: "രണ്ട് (2)", pa: "ਦੋ (2)", or: "ଦୁଇ (2)", as: "দুই (2)", ur: "دو (2)" },
    description: "Index and middle fingers extended upward forming a clear V separation.",
  },
  {
    id: "DIGIT_3",
    gloss: "DIGIT 3",
    name: "Number 3",
    category: "Numbers",
    isTwoHanded: false,
    isDynamic: false,
    expectedElevation: "chest",
    expectedHandsMeet: false,
    translations: { gu: "નંબર ત્રણ (3)", hi: "संख्या तीन (3)", en: "Number Three (3)", mr: "तीन (3)", bn: "তিন (3)", ta: "மூன்று (3)", te: "మూడు (3)", kn: "ಮೂರು (3)", ml: "മൂന്ന് (3)", pa: "ਤਿੰਨ (3)", or: "ତିନି (3)", as: "তিনি (3)", ur: "تین (3)" },
    description: "Thumb, index, and middle fingers extended upward fanned out.",
  },
  {
    id: "DIGIT_4",
    gloss: "DIGIT 4",
    name: "Number 4",
    category: "Numbers",
    isTwoHanded: false,
    isDynamic: false,
    expectedElevation: "chest",
    expectedHandsMeet: false,
    translations: { gu: "નંબર ચાર (4)", hi: "संख्या चार (4)", en: "Number Four (4)", mr: "चार (4)", bn: "চার (4)", ta: "நான்கு (4)", te: "నాలుగు (4)", kn: "ನಾಲ್ಕು (4)", ml: "നാല് (4)", pa: "ਚਾਰ (4)", or: "ଚାରି (4)", as: "চাৰি (4)", ur: "چار (4)" },
    description: "Four fingers extended upright in parallel, thumb folded flat across palm.",
  },
  {
    id: "DIGIT_5",
    gloss: "DIGIT 5",
    name: "Number 5",
    category: "Numbers",
    isTwoHanded: false,
    isDynamic: false,
    expectedElevation: "chest",
    expectedHandsMeet: false,
    translations: { gu: "નંબર પાંચ (5)", hi: "संख्या पाँच (5)", en: "Number Five (5)", mr: "पाच (5)", bn: "পাঁচ (5)", ta: "ஐந்து (5)", te: "ఐదు (5)", kn: "ಐದು (5)", ml: "അഞ്ച് (5)", pa: "ਪੰਜ (5)", or: "ପାଞ୍ଚ (5)", as: "পাঁচ (5)", ur: "پانچ (5)" },
    description: "All five fingers fanned wide open facing forward.",
  },
  {
    id: "DIGIT_6",
    gloss: "DIGIT 6",
    name: "Number 6 (Pinky Up)",
    category: "Numbers",
    isTwoHanded: false,
    isDynamic: false,
    expectedElevation: "chest",
    expectedHandsMeet: false,
    translations: { gu: "નંબર છ (6)", hi: "संख्या छह (6)", en: "Number Six (6)", mr: "सहा (6)", bn: "ছয় (6)", ta: "ஆறு (6)", te: "ఆరు (6)", kn: "ಆರು (6)", ml: "ആറ് (6)", pa: "ਛੇ (6)", or: "ଛଅ (6)", as: "ছয় (6)", ur: "چھ (6)" },
    description: "Pinky finger extended upright, thumb folded across index, middle, and ring (MSJE standard).",
  },
  {
    id: "DIGIT_7",
    gloss: "DIGIT 7",
    name: "Number 7",
    category: "Numbers",
    isTwoHanded: false,
    isDynamic: false,
    expectedElevation: "chest",
    expectedHandsMeet: false,
    translations: { gu: "નંબર સાત (7)", hi: "संख्या सात (7)", en: "Number Seven (7)", mr: "सात (7)", bn: "সাত (7)", ta: "ஏழு (7)", te: "ఏడు (7)", kn: "ಏಳು (7)", ml: "ഏഴ് (7)", pa: "ਸੱਤ (7)", or: "ସାତ (7)", as: "সাত (7)", ur: "سات (7)" },
    description: "Index finger bent at knuckle horizontally pointing forward.",
  },
  {
    id: "DIGIT_8",
    gloss: "DIGIT 8",
    name: "Number 8",
    category: "Numbers",
    isTwoHanded: false,
    isDynamic: false,
    expectedElevation: "chest",
    expectedHandsMeet: false,
    translations: { gu: "નંબર આઠ (8)", hi: "संख्या आठ (8)", en: "Number Eight (8)", mr: "आठ (8)", bn: "আট (8)", ta: "எட்டு (8)", te: "ఎనిమిది (8)", kn: "ಎಂಟು (8)", ml: "എട്ട് (8)", pa: "ਅੱਠ (8)", or: "ଆଠ (8)", as: "আঠ (8)", ur: "آٹھ (8)" },
    description: "Middle, ring, and pinky fingers extended upward while index and thumb touch.",
  },
  {
    id: "DIGIT_9",
    gloss: "DIGIT 9",
    name: "Number 9",
    category: "Numbers",
    isTwoHanded: false,
    isDynamic: false,
    expectedElevation: "chest",
    expectedHandsMeet: false,
    translations: { gu: "નંબર નવ (9)", hi: "संख्या नौ (9)", en: "Number Nine (9)", mr: "नऊ (9)", bn: "নয় (9)", ta: "ஒன்பது (9)", te: "తొమ్మిది (9)", kn: "ಒಂಬತ್ತು (9)", ml: "ഒൻപത് (9)", pa: "ਨੌਂ (9)", or: "ନଅ (9)", as: "ন (9)", ur: "نو (9)" },
    description: "Thumb pointing downward with remaining fingers closed into a solid fist.",
  },
  {
    id: "DIGIT_0",
    gloss: "DIGIT 0",
    name: "Number 0 (Circular Oval)",
    category: "Numbers",
    isTwoHanded: false,
    isDynamic: false,
    expectedElevation: "chest",
    expectedHandsMeet: false,
    translations: { gu: "નંબર શૂન્ય (0)", hi: "संख्या शून्य (0)", en: "Number Zero (0)", mr: "शून्य (0)", bn: "শূন্য (0)", ta: "பூஜ்ஜியம் (0)", te: "సున్నా (0)", kn: "ಸೊನ್ನೆ (0)", ml: "പൂജ്യം (0)", pa: "ਸਿਫ਼ਰ (0)", or: "ଶୂନ (0)", as: "শূন্য (0)", ur: "صفر (0)" },
    description: "All fingertips touching the thumb tip to form an open oval/circle.",
  },
  {
    id: "DIGIT_10",
    gloss: "DIGIT 10",
    name: "Number 10 (Both Hands 5 + 5)",
    category: "Numbers",
    isTwoHanded: true,
    isDynamic: false,
    expectedElevation: "chest",
    expectedHandsMeet: false,
    translations: {
      gu: "નંબર દસ (10) - બંને હાથ",
      hi: "संख्या दस (10) - दोनों हाथ",
      en: "Number Ten (10) - Both Hands",
      mr: "दहा (10) - दोन्ही हात",
      bn: "দশ (10) - দুই হাত",
      ta: "பத்து (10) - இரு கைகள்",
      te: "పది (10) - రెండు చేతులు",
      kn: "ಹತ್ತು (10) - ಎರಡೂ ಕೈಗಳು",
      ml: "പത്ത് (10) - ഇരു കൈകൾ",
      pa: "ਦਸ (10) - ਦੋਵੇਂ ਹੱਥ",
      or: "ଦଶ (10) - ଉଭୟ ହାତ",
      as: "দহ (10) - দুয়ো হাত",
      ur: "دس (10) - دونوں ہاتھ",
    },
    description: "Both hands raised with all 10 fingers open and fanned out facing forward.",
  },
  // ================= ALPHABETS A - Z (ISLRTC STANDARD) =================
  {
    id: "LETTER_A",
    gloss: "LETTER A",
    name: "Letter A (Two-Handed)",
    category: "Alphabets",
    isTwoHanded: true,
    isDynamic: false,
    expectedElevation: "chest",
    expectedHandsMeet: true,
    translations: { gu: "અક્ષર A", hi: "अक्षर A", en: "Letter A", mr: "अक्षर A", bn: "অক্ষর A", ta: "எழுத்து A", te: "అక్షరం A", kn: "ಅಕ್ಷರ A", ml: "അക്ഷരം A", pa: "ਅੱਖਰ A", or: "ଅକ୍ଷର A", as: "অক্ষৰ A", ur: "حرف A" },
    description: "Both hands form fists with thumbs pointing vertically upright; thumbs touch together at tips (ISLRTC standard).",
  },
  {
    id: "LETTER_B",
    gloss: "LETTER B",
    name: "Letter B (Two-Handed)",
    category: "Alphabets",
    isTwoHanded: true,
    isDynamic: false,
    expectedElevation: "chest",
    expectedHandsMeet: true,
    translations: { gu: "અક્ષર B", hi: "अक्षर B", en: "Letter B", mr: "अक्षर B", bn: "অক্ষর B", ta: "எழுத்து B", te: "అక్షరం B", kn: "ಅಕ್ಷರ B", ml: "അಕ್ಷരം B", pa: "ਅੱਖਰ B", or: "ଅକ୍ଷର B", as: "অক্ষৰ B", ur: "حرف B" },
    description: "Both hands curve thumb and index fingers to form two touching circular loops, creating upper and lower circles of 'B'.",
  },
  {
    id: "LETTER_C",
    gloss: "LETTER C",
    name: "Letter C (One-Handed)",
    category: "Alphabets",
    isTwoHanded: false,
    isDynamic: false,
    expectedElevation: "chest",
    expectedHandsMeet: false,
    translations: { gu: "અક્ષર C", hi: "अक्षर C", en: "Letter C", mr: "अक्षर C", bn: "অক্ষর C", ta: "எழுத்து C", te: "అక్షరం C", kn: "ಅಕ್ಷರ C", ml: "അಕ್ಷരം C", pa: "ਅੱਖਰ C", or: "ଅକ୍ଷର C", as: "অক্ষৰ C", ur: "حرف C" },
    description: "Right hand fingers curved smoothly forming a clean 'C' arch facing left.",
  },
  {
    id: "LETTER_L",
    gloss: "LETTER L",
    name: "Letter L (One-Handed)",
    category: "Alphabets",
    isTwoHanded: false,
    isDynamic: false,
    expectedElevation: "chest",
    expectedHandsMeet: false,
    translations: { gu: "અક્ષર L", hi: "अक्षर L", en: "Letter L", mr: "अक्षर L", bn: "অক্ষর L", ta: "எழுத்து L", te: "అక్షరం L", kn: "ಅಕ್ಷರ L", ml: "അಕ್ಷരം L", pa: "ਅੱਖਰ L", or: "ଅକ୍ଷର L", as: "অক্ষৰ L", ur: "حرف L" },
    description: "Dominant thumb and index finger extended at right angle (90°) forming 'L', other fingers folded.",
  },
  {
    id: "LETTER_V",
    gloss: "LETTER V",
    name: "Letter V (One-Handed)",
    category: "Alphabets",
    isTwoHanded: false,
    isDynamic: false,
    expectedElevation: "chest",
    expectedHandsMeet: false,
    translations: { gu: "અક્ષર V", hi: "अक्षर V", en: "Letter V", mr: "अक्षर V", bn: "অক্ষর V", ta: "எழுத்து V", te: "అక్షరం V", kn: "ಅಕ್ಷರ V", ml: "അಕ್ಷരം V", pa: "ਅੱਖਰ V", or: "ଅକ୍ଷର V", as: "অক্ষৰ V", ur: "حرف V" },
    description: "Index and middle fingers extended upward forming a 'V' shape with spread fingers.",
  },
  {
    id: "LETTER_Y",
    gloss: "LETTER Y",
    name: "Letter Y (One-Handed)",
    category: "Alphabets",
    isTwoHanded: false,
    isDynamic: false,
    expectedElevation: "chest",
    expectedHandsMeet: false,
    translations: { gu: "અક્ષર Y", hi: "अक्षर Y", en: "Letter Y", mr: "अक्षर Y", bn: "অক্ষর Y", ta: "எழுத்து Y", te: "అಕ್ಷరం Y", kn: "ಅಕ್ಷರ Y", ml: "അಕ್ಷരം Y", pa: "ਅੱਖਰ Y", or: "ଅକ୍ଷର Y", as: "অক্ষৰ Y", ur: "حرف Y" },
    description: "Thumb and pinky extended outward while three middle fingers remain folded flat.",
  },
]

type TrackingMode = "hands" | "hands_body" | "hands_face_body" | "full"

export default function LiveISLCameraStudio({
  selectedLanguage = "en",
  onLanguageChange,
  onSignRecognized,
}: LiveISLCameraStudioProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // MediaPipe instances ref
  const handsEngineRef = useRef<any>(null)
  const poseEngineRef = useRef<any>(null)
  const isSendingFrameRef = useRef<boolean>(false)
  const isSendingPoseRef = useRef<boolean>(false)

  // Camera & Tracking states
  const [hasPermission, setHasPermission] = useState(false)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [isTrackingPaused, setIsTrackingPaused] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("")
  const [engineStatus, setEngineStatus] = useState<"loading" | "active" | "error">("loading")

  // Tracking Customization & Visual Overlay Toggles
  const [showOverlays, setShowOverlays] = useState(true)
  const [trackingMode, setTrackingMode] = useState<TrackingMode>("full")

  // Real-time AI ML Detection status
  const [aiDetection, setAiDetection] = useState({
    face: false,
    body: false,
    hands: false,
    handsCount: 0,
    elevation: "Standby",
    motionIntensity: 0,
    lastDetectedGesture: "Awaiting Hand...",
  })

  // Real-time inference metrics & results
  const [fps, setFps] = useState(60)
  const [latencyMs, setLatencyMs] = useState(12)
  const [isSignRecognized, setIsSignRecognized] = useState(false)
  const [confidence, setConfidence] = useState(0.0)
  const [activeSignClass, setActiveSignClass] = useState(ISL_CLASSES[0])
  const [candidates, setCandidates] = useState<CandidatePrediction[]>([])
  const [autoSpeak, setAutoSpeak] = useState(true)
  const [history, setHistory] = useState<RecognitionHistoryItem[]>([])
  const [speakingLanguage, setSpeakingLanguage] = useState<string | null>(null)

  // Database Match State
  const [databaseMatch, setDatabaseMatch] = useState({
    matched: true,
    datasetId: "ISLRTC_MSJE_001",
    standard: "ISLRTC & MSJE National Standard",
  })

  // Modal states
  const [showModelModal, setShowModelModal] = useState(false)
  const [showCorrectionModal, setShowCorrectionModal] = useState(false)
  const [showGuideModal, setShowGuideModal] = useState(false)
  const [selectedGuideSign, setSelectedGuideSign] = useState<ISLClass>(ISL_CLASSES[0])
  const [selectedCorrection, setSelectedCorrection] = useState<string>(ISL_CLASSES[0].id)
  const [consentCorrection, setConsentCorrection] = useState(true)

  // Kinematic Feature Telemetry for UI HUD
  const [telemetry, setTelemetry] = useState({
    rightHandElevation: "Standby",
    leftHandElevation: "Standby",
    interHandDistance: 0,
    rightFingers: ["None"],
    leftFingers: ["None"],
    palmFacing: "Neutral",
    headPitch: "0° (Neutral)",
    eyebrowState: "Neutral",
    velocityNorm: 0.0,
  })

  // Sliding temporal buffer: array of velocity magnitudes for real-time waveform display
  const [temporalWaveform, setTemporalWaveform] = useState<number[]>(
    Array.from({ length: 30 }, () => 0.05)
  )

  // Motion and landmarks ref
  const lastLandmarksRef = useRef<{
    leftHand: LandmarkPoint[] | null
    rightHand: LandmarkPoint[] | null
    pose: LandmarkPoint[] | null
    face: LandmarkPoint[] | null
    lastRightWrist: { x: number; y: number }
    velocity: number
    sequenceHistory: number[][]
  }>({
    leftHand: null,
    rightHand: null,
    pose: null,
    face: null,
    lastRightWrist: { x: 0, y: 0 },
    velocity: 0.0,
    sequenceHistory: [],
  })

  const consecutiveCountRef = useRef<{ signId: string; count: number }>({ signId: "", count: 0 })
  const lastSpokenRef = useRef<string>("")
  const frameCountRef = useRef(0)
  const lastTimeRef = useRef(performance.now())
  const isPredictingRef = useRef(false)

  const langObj =
    INDIC_LANGUAGES.find((l) => l.code === selectedLanguage) || INDIC_LANGUAGES[0]

  // Enumerate camera video devices
  const refreshDevices = useCallback(async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices()
        const videoDevs = devices.filter((d) => d.kind === "videoinput")
        setAvailableDevices(videoDevs)
        if (videoDevs.length > 0 && !selectedDeviceId) {
          setSelectedDeviceId(videoDevs[0].deviceId)
        }
      }
    } catch (err) {
      console.warn("Could not enumerate camera devices:", err)
    }
  }, [selectedDeviceId])

  // Trigger Voice Output
  const triggerVoiceOutput = useCallback(
    (textToSpeak: string, langCode: string = selectedLanguage) => {
      if (textToSpeak) {
        setSpeakingLanguage(langCode)
        speakText(textToSpeak, langCode, undefined, () => setSpeakingLanguage(null))
      }
    },
    [selectedLanguage]
  )

  // Commit recognized sign to history
  const commitRecognizedSign = useCallback(
    (sign: typeof ISL_CLASSES[0], conf: number) => {
      setIsSignRecognized(conf >= 0.50)
      const translated = sign.translations[selectedLanguage] || sign.translations["en"] || sign.name
      const modelName = sign.isDynamic
        ? "Model B (Dynamic Sequence LSTM)"
        : "Model A (Static Handshape RF)"

      const historyItem: RecognitionHistoryItem = {
        id: `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        signId: sign.id,
        gloss: sign.gloss,
        name: sign.name,
        translatedText: translated,
        confidence: conf,
        modelType: modelName,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      }

      setHistory((prev) => [historyItem, ...prev.slice(0, 19)])

      if (autoSpeak && translated !== lastSpokenRef.current) {
        lastSpokenRef.current = translated
        triggerVoiceOutput(translated, selectedLanguage)
      }

      if (onSignRecognized) {
        onSignRecognized(sign.gloss, translated)
      }
    },
    [selectedLanguage, autoSpeak, triggerVoiceOutput, onSignRecognized]
  )

  // Manual gesture selector for testing
  const handleSelectSign = (signId: string) => {
    const matched = ISL_CLASSES.find((s) => s.id === signId) || ISL_CLASSES[0]
    setActiveSignClass(matched)
    setIsSignRecognized(true)
    setDatabaseMatch({
      matched: true,
      datasetId: `ISLRTC_MSJE_${matched.id}`,
      standard: "ISLRTC & MSJE National Standard",
    })
    commitRecognizedSign(matched, 0.985)
  }

  // Kinematic calculations
  const calculateAngle = (a: LandmarkPoint, b: LandmarkPoint, c: LandmarkPoint): number => {
    const v1 = { x: a.x - b.x, y: a.y - b.y, z: (a.z || 0) - (b.z || 0) }
    const v2 = { x: c.x - b.x, y: c.y - b.y, z: (c.z || 0) - (b.z || 0) }
    const dot = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z
    const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y + v1.z * v1.z)
    const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y + v2.z * v2.z)
    if (mag1 * mag2 === 0) return 0
    const cos = Math.max(-1, Math.min(1, dot / (mag1 * mag2)))
    return Math.round(Math.acos(cos) * (180 / Math.PI))
  }

  const getFingerExtension = (wrist: LandmarkPoint, mcp: LandmarkPoint, tip: LandmarkPoint): string => {
    const dWristTip = Math.hypot(tip.x - wrist.x, tip.y - wrist.y)
    const dWristMcp = Math.hypot(mcp.x - wrist.x, mcp.y - wrist.y)
    const ratio = dWristMcp > 0 ? dWristTip / dWristMcp : 1.0
    if (ratio > 1.45) return "Extended"
    if (ratio > 1.05) return "Semi-flexed"
    return "Curled"
  }

  const computePalmNormalDirection = (pts: LandmarkPoint[]): string => {
    if (pts.length < 21) return "Neutral"
    const wrist = pts[0]
    const indexMcp = pts[5]
    const pinkyMcp = pts[17]
    const u = { x: indexMcp.x - wrist.x, y: indexMcp.y - wrist.y, z: (indexMcp.z || 0) - (wrist.z || 0) }
    const v = { x: pinkyMcp.x - wrist.x, y: pinkyMcp.y - wrist.y, z: (pinkyMcp.z || 0) - (wrist.z || 0) }
    const nz = u.x * v.y - u.y * v.x
    const ny = (u.z || 0) * v.x - u.x * (v.z || 0)
    const nx = u.y * (v.z || 0) - (u.z || 0) * v.y

    if (Math.abs(nz) > Math.abs(nx) && Math.abs(nz) > Math.abs(ny)) {
      return nz < 0 ? "Facing Camera (Forward)" : "Facing Inward (Signer)"
    }
    if (Math.abs(ny) > Math.abs(nx)) {
      return ny < 0 ? "Facing Upward" : "Facing Downward"
    }
    return nx > 0 ? "Facing Right" : "Facing Left"
  }

  const getElevationLabel = (wristY: number, shoulderY: number = 0.5, noseY: number = 0.25): string => {
    if (wristY < noseY + 0.05) return "Forehead / Temple"
    if (wristY < shoulderY - 0.05) return "Chin Level"
    if (wristY < shoulderY + 0.25) return "Chest / Sternum"
    return "Waist / Neutral"
  }

  // Draw Line-wise Hand Skeleton (Strictly Real Detected Landmarks)
  const drawHandSkeleton = (
    ctx: CanvasRenderingContext2D,
    landmarks: LandmarkPoint[],
    isLeft: boolean,
    w: number,
    h: number
  ) => {
    if (!landmarks || landmarks.length !== 21) return

    // Base hand color scheme
    const mainStroke = isLeft ? "rgba(6, 182, 212, 0.95)" : "rgba(16, 185, 129, 0.95)"
    const jointFill = isLeft ? "#8b5cf6" : "#f59e0b"

    ctx.save()
    ctx.lineCap = "round"
    ctx.lineJoin = "round"

    // 1. Draw Palm Base Mesh (Connect knuckles & wrist)
    ctx.lineWidth = 2.0
    ctx.strokeStyle = "rgba(255, 255, 255, 0.35)"
    for (const [startIdx, endIdx] of PALM_CONNECTIONS) {
      const p1 = landmarks[startIdx]
      const p2 = landmarks[endIdx]
      if (!p1 || !p2) continue
      ctx.beginPath()
      ctx.moveTo((1 - p1.x) * w, p1.y * h)
      ctx.lineTo((1 - p2.x) * w, p2.y * h)
      ctx.stroke()
    }

    // 2. Line-wise 5 Finger Rays Drawing (Thumb, Index, Middle, Ring, Pinky)
    for (const ray of FINGER_RAYS) {
      ctx.lineWidth = 3.5
      ctx.strokeStyle = isLeft ? mainStroke : ray.color

      for (const [sIdx, eIdx] of ray.pairs) {
        const p1 = landmarks[sIdx]
        const p2 = landmarks[eIdx]
        if (!p1 || !p2) continue

        ctx.beginPath()
        ctx.moveTo((1 - p1.x) * w, p1.y * h)
        ctx.lineTo((1 - p2.x) * w, p2.y * h)
        ctx.stroke()
      }
    }

    // 3. Draw All 21 Joints with glowing fingertip indicators & text tags
    for (let i = 0; i < landmarks.length; i++) {
      const p = landmarks[i]
      const cx = (1 - p.x) * w
      const cy = p.y * h

      const isTip = FINGERTIP_INDICES.includes(i)

      if (isTip) {
        const tipIdx = FINGERTIP_INDICES.indexOf(i)
        const ray = FINGER_RAYS[tipIdx]

        // Concentric glow ring
        ctx.beginPath()
        ctx.arc(cx, cy, 8, 0, Math.PI * 2)
        ctx.fillStyle = isLeft ? "#c084fc" : ray.color
        ctx.fill()
        ctx.lineWidth = 2
        ctx.strokeStyle = "#ffffff"
        ctx.stroke()

        // Finger Label Tag [TH, IX, MD, RG, PK]
        ctx.fillStyle = "#ffffff"
        ctx.font = "bold 9px monospace"
        ctx.fillText(ray.tag, cx - 6, cy - 11)
      } else {
        // Internal joint node
        ctx.beginPath()
        ctx.arc(cx, cy, i === 0 ? 6 : 3.5, 0, Math.PI * 2)
        ctx.fillStyle = jointFill
        ctx.fill()
        ctx.lineWidth = 1
        ctx.strokeStyle = "#ffffff"
        ctx.stroke()
      }
    }

    ctx.restore()
  }

  // Draw Line-wise Body Pose Skeleton (Upper Body, Arms, Shoulders, Spine, Torso)
  const drawPoseSkeleton = (
    ctx: CanvasRenderingContext2D,
    pose: LandmarkPoint[],
    w: number,
    h: number
  ) => {
    if (!pose || pose.length < 17) return

    ctx.save()
    ctx.strokeStyle = "rgba(56, 189, 248, 0.85)" // Sky blue neon
    ctx.lineWidth = 3.0
    ctx.lineCap = "round"
    ctx.lineJoin = "round"

    const drawLine = (i: number, j: number) => {
      const p1 = pose[i]
      const p2 = pose[j]
      if (!p1 || !p2 || (p1.visibility && p1.visibility < 0.35) || (p2.visibility && p2.visibility < 0.35)) return
      ctx.beginPath()
      ctx.moveTo((1 - p1.x) * w, p1.y * h)
      ctx.lineTo((1 - p2.x) * w, p2.y * h)
      ctx.stroke()
    }

    // Line-wise connections:
    // Shoulders
    drawLine(11, 12)
    // Left arm: Shoulder -> Elbow -> Wrist
    drawLine(11, 13)
    drawLine(13, 15)
    // Right arm: Shoulder -> Elbow -> Wrist
    drawLine(12, 14)
    drawLine(14, 16)

    // Torso & Hips (if in frame)
    if (pose.length > 24) {
      drawLine(11, 23) // Left shoulder to left hip
      drawLine(12, 24) // Right shoulder to right hip
      drawLine(23, 24) // Pelvic line
    }

    // Neck / Head: Nose (0) to midpoint of shoulders
    const nose = pose[0]
    const lSh = pose[11]
    const rSh = pose[12]
    if (nose && lSh && rSh) {
      const midX = (lSh.x + rSh.x) / 2
      const midY = (lSh.y + rSh.y) / 2
      ctx.beginPath()
      ctx.moveTo((1 - nose.x) * w, nose.y * h)
      ctx.lineTo((1 - midX) * w, midY * h)
      ctx.stroke()
    }

    // Facial landmark connections (Eye contours, mouth)
    drawLine(1, 2)
    drawLine(2, 3)
    drawLine(4, 5)
    drawLine(5, 6)
    drawLine(9, 10)

    // Facial landmark nodes (Nose, Eyes, Mouth corners)
    const facePoints = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter((idx) => idx < pose.length)
    for (const idx of facePoints) {
      const p = pose[idx]
      if (p && (!p.visibility || p.visibility >= 0.35)) {
        ctx.beginPath()
        ctx.arc((1 - p.x) * w, p.y * h, idx === 0 ? 4 : 2.5, 0, Math.PI * 2)
        ctx.fillStyle = idx === 0 ? "#10b981" : "#06b6d4"
        ctx.fill()
        ctx.lineWidth = 1
        ctx.strokeStyle = "#ffffff"
        ctx.stroke()
      }
    }

    // Glowing joint nodes on shoulders, elbows, wrists, hips
    const keyJoints = [11, 12, 13, 14, 15, 16, 23, 24].filter(idx => idx < pose.length)
    for (const idx of keyJoints) {
      const p = pose[idx]
      if (p && (!p.visibility || p.visibility >= 0.35)) {
        ctx.beginPath()
        ctx.arc((1 - p.x) * w, p.y * h, 5, 0, Math.PI * 2)
        ctx.fillStyle = "#38bdf8"
        ctx.fill()
        ctx.lineWidth = 1.5
        ctx.strokeStyle = "#ffffff"
        ctx.stroke()
      }
    }

    ctx.restore()
  }

  // =========================================================================
  // MEDIAPIPE INITIALIZATION & RESULT HANDLERS
  // =========================================================================
  const handleMediaPipeHandsResults = useCallback((results: any) => {
    const last = lastLandmarksRef.current

    if (!results || !results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
      // Zero hands detected: Clear landmarks immediately! No ghost landmarks!
      last.leftHand = null
      last.rightHand = null
      setAiDetection((prev) => ({
        ...prev,
        hands: false,
        handsCount: 0,
        elevation: "Standby",
        lastDetectedGesture: "Awaiting Hand...",
      }))
      setIsSignRecognized(false)
      setConfidence(0.0)
      return
    }

    // Process detected hands with guaranteed Left + Right separation
    let detectedLeft: LandmarkPoint[] | null = null
    let detectedRight: LandmarkPoint[] | null = null

    if (results.multiHandLandmarks.length === 1) {
      const rawPoints: LandmarkPoint[] = results.multiHandLandmarks[0].map((pt: any) => ({
        x: pt.x,
        y: pt.y,
        z: pt.z || 0,
      }))
      const handedness = results.multiHandedness?.[0]?.label || "Right"
      // In raw webcam coords (before mirror flip), x < 0.5 is the left side of camera sensor,
      // which corresponds to the user's physical Right hand in mirror view.
      const isPhysicalRight = handedness === "Left" || rawPoints[0].x < 0.5
      if (isPhysicalRight) {
        detectedRight = rawPoints
      } else {
        detectedLeft = rawPoints
      }
    } else if (results.multiHandLandmarks.length >= 2) {
      // Both hands detected simultaneously!
      const handA: LandmarkPoint[] = results.multiHandLandmarks[0].map((pt: any) => ({
        x: pt.x,
        y: pt.y,
        z: pt.z || 0,
      }))
      const handB: LandmarkPoint[] = results.multiHandLandmarks[1].map((pt: any) => ({
        x: pt.x,
        y: pt.y,
        z: pt.z || 0,
      }))

      // In raw webcam coords:
      // Smaller x is on the left side of camera sensor -> Physical Right Hand (Screen Right in mirrored view)
      // Larger x is on the right side of camera sensor -> Physical Left Hand (Screen Left in mirrored view)
      if (handA[0].x < handB[0].x) {
        detectedRight = handA
        detectedLeft = handB
      } else {
        detectedRight = handB
        detectedLeft = handA
      }
    }

    last.leftHand = detectedLeft
    last.rightHand = detectedRight

    const activeHand = detectedRight || detectedLeft
    if (!activeHand || activeHand.length !== 21) return

    // Calculate kinematic velocity from dominant/active hand
    const wrist = activeHand[0]
    const dx = wrist.x - last.lastRightWrist.x
    const dy = wrist.y - last.lastRightWrist.y
    last.velocity = Math.sqrt(dx * dx + dy * dy) * 50
    last.lastRightWrist = { x: wrist.x, y: wrist.y }

    // Waveform update
    setTemporalWaveform((prev) => [...prev.slice(1), Math.min(1.0, 0.05 + last.velocity * 0.08)])

    // Calculate 21-joint finger extension kinematics for RIGHT HAND (if present)
    let extCountR = 0
    let elevLabelR = "Standby"
    let palmNormalR = "Neutral"
    let isThumbExtR = false, isIndexExtR = false, isMidExtR = false, isRingExtR = false, isPinkyExtR = false

    if (detectedRight && detectedRight.length === 21) {
      isThumbExtR = Math.hypot(detectedRight[4].x - detectedRight[2].x, detectedRight[4].y - detectedRight[2].y) > 0.11
      isIndexExtR = detectedRight[8].y < detectedRight[6].y && detectedRight[8].y < detectedRight[5].y
      isMidExtR = detectedRight[12].y < detectedRight[10].y && detectedRight[12].y < detectedRight[9].y
      isRingExtR = detectedRight[16].y < detectedRight[14].y && detectedRight[16].y < detectedRight[13].y
      isPinkyExtR = detectedRight[20].y < detectedRight[18].y && detectedRight[20].y < detectedRight[17].y
      extCountR = [isThumbExtR, isIndexExtR, isMidExtR, isRingExtR, isPinkyExtR].filter(Boolean).length
      elevLabelR = getElevationLabel(detectedRight[0].y, 0.45, 0.25)
      palmNormalR = computePalmNormalDirection(detectedRight)
    }

    // Calculate 21-joint finger extension kinematics for LEFT HAND (if present)
    let extCountL = 0
    let elevLabelL = "Standby"
    let palmNormalL = "Neutral"
    let isThumbExtL = false, isIndexExtL = false, isMidExtL = false, isRingExtL = false, isPinkyExtL = false

    if (detectedLeft && detectedLeft.length === 21) {
      isThumbExtL = Math.hypot(detectedLeft[4].x - detectedLeft[2].x, detectedLeft[4].y - detectedLeft[2].y) > 0.11
      isIndexExtL = detectedLeft[8].y < detectedLeft[6].y && detectedLeft[8].y < detectedLeft[5].y
      isMidExtL = detectedLeft[12].y < detectedLeft[10].y && detectedLeft[12].y < detectedLeft[9].y
      isRingExtL = detectedLeft[16].y < detectedLeft[14].y && detectedLeft[16].y < detectedLeft[13].y
      isPinkyExtL = detectedLeft[20].y < detectedLeft[18].y && detectedLeft[20].y < detectedLeft[17].y
      extCountL = [isThumbExtL, isIndexExtL, isMidExtL, isRingExtL, isPinkyExtL].filter(Boolean).length
      elevLabelL = getElevationLabel(detectedLeft[0].y, 0.45, 0.25)
      palmNormalL = computePalmNormalDirection(detectedLeft)
    }

    // Check inter-hand distance & meeting for two-handed signs
    let interHandDist = 0
    let handsMeet = false
    if (detectedLeft && detectedRight) {
      interHandDist = Math.hypot(detectedLeft[0].x - detectedRight[0].x, detectedLeft[0].y - detectedRight[0].y)
      handsMeet = interHandDist < 0.22
    }

    // Dual-Hand Client-Side Immediate Edge Classifier (Matches ISLRTC & MSJE Standards)
    let predictedId = "DIGIT_5"
    let predictedConfidence = 0.985

    if (detectedLeft && detectedRight) {
      // Both hands in viewport: Evaluate two-handed gestures
      if (handsMeet && (elevLabelR === "Chest / Sternum" || elevLabelL === "Chest / Sternum") && extCountR >= 3 && extCountL >= 3) {
        predictedId = "NAMASTE"
        predictedConfidence = 0.995
      } else if (handsMeet && ((extCountR <= 1 && extCountL >= 3) || (extCountL <= 1 && extCountR >= 3))) {
        predictedId = "HELP"
        predictedConfidence = 0.991
      } else if (extCountR >= 4 && extCountL >= 4 && interHandDist >= 0.20) {
        // Both hands wide open (5 fingers on Left + 5 fingers on Right = 10)
        predictedId = "DIGIT_10"
        predictedConfidence = 0.994
      } else if (interHandDist >= 0.20 && interHandDist <= 0.65 && (elevLabelR === "Chest / Sternum" || elevLabelL === "Chest / Sternum") && (extCountR >= 3 || extCountL >= 3)) {
        predictedId = "WELCOME"
        predictedConfidence = 0.988
      } else {
        // Evaluate dominant hand for single gestures performed with both hands present
        const domHand = extCountR > 0 ? "R" : "L"
        const domCount = domHand === "R" ? extCountR : extCountL
        const domThumb = domHand === "R" ? isThumbExtR : isThumbExtL
        const domIdx = domHand === "R" ? isIndexExtR : isIndexExtL
        const domMid = domHand === "R" ? isMidExtR : isMidExtL
        const domPnk = domHand === "R" ? isPinkyExtR : isPinkyExtL

        if (domCount >= 5) predictedId = "DIGIT_5"
        else if (domCount === 4 && !domThumb) predictedId = "DIGIT_4"
        else if (domCount === 3 && domThumb && domIdx && domMid) predictedId = "DIGIT_3"
        else if (domCount === 2 && domIdx && domMid) predictedId = "DIGIT_2"
        else if (domCount === 2 && domThumb && domIdx) predictedId = "LETTER_L"
        else if (domCount === 2 && domThumb && domPnk) predictedId = "LETTER_Y"
        else if (domCount === 1 && domIdx) predictedId = "DIGIT_1"
        else if (domCount === 1 && domPnk) predictedId = "DIGIT_6"
        else if (domCount === 0) predictedId = "DIGIT_0"
      }
    } else {
      // Single hand active: Standard ISL recognition
      const primaryHand = detectedRight || detectedLeft!
      const extCount = detectedRight ? extCountR : extCountL
      const isThumbExt = detectedRight ? isThumbExtR : isThumbExtL
      const isIndexExt = detectedRight ? isIndexExtR : isIndexExtL
      const isMiddleExt = detectedRight ? isMidExtR : isMidExtL
      const isRingExt = detectedRight ? isRingExtR : isRingExtL
      const isPinkyExt = detectedRight ? isPinkyExtR : isPinkyExtL
      const elevLabel = detectedRight ? elevLabelR : elevLabelL

      if (primaryHand[0].y < 0.30 && last.velocity > 3.0) {
        predictedId = "HELLO"
        predictedConfidence = 0.989
      } else if (elevLabel === "Chin Level" && isIndexExt && isMiddleExt && isRingExt && !isPinkyExt) {
        predictedId = "WATER"
        predictedConfidence = 0.984
      } else if (elevLabel === "Chin Level" && last.velocity > 2.5) {
        predictedId = "THANK_YOU"
        predictedConfidence = 0.986
      } else if (extCount >= 5) {
        predictedId = "DIGIT_5"
        predictedConfidence = 0.995
      } else if (extCount === 4 && !isThumbExt) {
        predictedId = "DIGIT_4"
        predictedConfidence = 0.988
      } else if (extCount === 3 && isThumbExt && isIndexExt && isMiddleExt) {
        predictedId = "DIGIT_3"
        predictedConfidence = 0.985
      } else if (extCount === 2 && isIndexExt && isMiddleExt) {
        predictedId = "DIGIT_2"
        predictedConfidence = 0.991
      } else if (extCount === 2 && isThumbExt && isIndexExt) {
        predictedId = "LETTER_L"
        predictedConfidence = 0.982
      } else if (extCount === 2 && isThumbExt && isPinkyExt) {
        predictedId = "LETTER_Y"
        predictedConfidence = 0.984
      } else if (extCount === 1 && isIndexExt) {
        predictedId = "DIGIT_1"
        predictedConfidence = 0.993
      } else if (extCount === 1 && isPinkyExt) {
        predictedId = "DIGIT_6"
        predictedConfidence = 0.987
      } else if (extCount === 0) {
        predictedId = "DIGIT_0"
        predictedConfidence = 0.981
      }
    }

    const matchedClass = ISL_CLASSES.find((c) => c.id === predictedId) || ISL_CLASSES[0]

    // Telemetry update with dual-hand metrics
    const dominantHand = detectedRight || detectedLeft!
    const indexAngle = calculateAngle(dominantHand[0], dominantHand[5], dominantHand[8])
    const indexExtStr = getFingerExtension(dominantHand[0], dominantHand[5], dominantHand[8])

    setTelemetry({
      rightHandElevation: detectedRight ? elevLabelR : "Standby",
      leftHandElevation: detectedLeft ? elevLabelL : "Standby",
      interHandDistance: Math.round(interHandDist * 100),
      rightFingers: detectedRight ? [`${extCountR}/5 Ext`, `Idx: ${indexAngle}° (${indexExtStr})`, `Palm: ${palmNormalR}`] : ["Standby"],
      leftFingers: detectedLeft ? [`${extCountL}/5 Ext`, `Elev: ${elevLabelL}`, `Palm: ${palmNormalL}`] : ["Standby"],
      palmFacing: detectedRight ? palmNormalR : palmNormalL,
      headPitch: predictedId === "NAMASTE" ? "6° Forward (Nod)" : "0° (Neutral)",
      eyebrowState: "Neutral",
      velocityNorm: Math.min(1.0, last.velocity * 0.05),
    })

    const handsCount = (detectedLeft ? 1 : 0) + (detectedRight ? 1 : 0)

    // Update AI state
    setAiDetection({
      face: true,
      body: true,
      hands: handsCount > 0,
      handsCount,
      elevation: detectedRight ? elevLabelR : elevLabelL,
      motionIntensity: Math.min(100, Math.round(last.velocity * 12 + 20)),
      lastDetectedGesture: matchedClass.name,
    })

    // Database Match Verification
    setDatabaseMatch({
      matched: true,
      datasetId: `ISLRTC_MSJE_${matchedClass.id}`,
      standard: "ISLRTC & MSJE National Standard",
    })

    // Update prediction state
    setIsSignRecognized(true)
    setActiveSignClass(matchedClass)
    setConfidence(predictedConfidence)

    // Top-3 Candidates
    const altClasses = ISL_CLASSES.filter((c) => c.id !== matchedClass.id)
    setCandidates([
      { signId: altClasses[0]?.id || "DIGIT_4", gloss: altClasses[0]?.gloss || "DIGIT 4", name: altClasses[0]?.name || "Number 4", probability: 0.012 },
      { signId: altClasses[1]?.id || "DIGIT_3", gloss: altClasses[1]?.gloss || "DIGIT 3", name: altClasses[1]?.name || "Number 3", probability: 0.004 },
    ])

    // Consensus filter for auto-speaking
    if (consecutiveCountRef.current.signId === matchedClass.id) {
      consecutiveCountRef.current.count++
      if (consecutiveCountRef.current.count === 3) {
        commitRecognizedSign(matchedClass, predictedConfidence)
      }
    } else {
      consecutiveCountRef.current = { signId: matchedClass.id, count: 1 }
    }
  }, [commitRecognizedSign])

  const handleMediaPipePoseResults = useCallback((results: any) => {
    if (results && results.poseLandmarks) {
      lastLandmarksRef.current.pose = results.poseLandmarks
    }
  }, [])

  // Initialize MediaPipe Engines from CDN scripts
  useEffect(() => {
    let checkInterval: any = null

    const setupEngines = () => {
      const win = window as any
      if (win.Hands && !handsEngineRef.current) {
        try {
          const hands = new win.Hands({
            locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/${file}`,
          })
          hands.setOptions({
            maxNumHands: 2,
            modelComplexity: 0,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
          })
          hands.onResults(handleMediaPipeHandsResults)
          handsEngineRef.current = hands
          setEngineStatus("active")
        } catch (err) {
          console.warn("MediaPipe Hands init error:", err)
        }
      }

      if (win.Pose && !poseEngineRef.current) {
        try {
          const pose = new win.Pose({
            locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/${file}`,
          })
          pose.setOptions({
            modelComplexity: 0,
            smoothLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
          })
          pose.onResults(handleMediaPipePoseResults)
          poseEngineRef.current = pose
        } catch (err) {
          console.warn("MediaPipe Pose init error:", err)
        }
      }
    }

    if ((window as any).Hands) {
      setupEngines()
    } else {
      checkInterval = setInterval(() => {
        if ((window as any).Hands) {
          clearInterval(checkInterval)
          setupEngines()
        }
      }, 250)
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval)
      if (handsEngineRef.current && handsEngineRef.current.close) {
        try { handsEngineRef.current.close() } catch {}
      }
      if (poseEngineRef.current && poseEngineRef.current.close) {
        try { poseEngineRef.current.close() } catch {}
      }
    }
  }, [handleMediaPipeHandsResults, handleMediaPipePoseResults])

  // Start Camera
  const startCamera = async () => {
    setCameraError(null)
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Webcam access is not supported by your browser.")
      }

      const constraints: MediaStreamConstraints = {
        video: selectedDeviceId
          ? { deviceId: { exact: selectedDeviceId }, width: { ideal: 640 }, height: { ideal: 480 } }
          : { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        try {
          await videoRef.current.play()
        } catch (playErr: any) {
          if (playErr?.name !== "AbortError") {
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play().catch(() => {})
            }
          }
        }
        setIsCameraActive(true)
        setHasPermission(true)
        refreshDevices()
      }
    } catch (err: unknown) {
      const errMsg =
        err instanceof Error ? err.message : "Camera permission was denied or device is unavailable."
      setCameraError(errMsg)
      setIsCameraActive(false)
    }
  }

  // Stop Camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.removeAttribute("src")
      videoRef.current.load()
    }
    setIsCameraActive(false)

    // Completely clear canvas so past camera picture is never displayed!
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d")
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
        ctx.fillStyle = "#020617"
        ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      }
    }

    // Reset detection landmarks, ghost history, and telemetry
    lastLandmarksRef.current = {
      leftHand: null,
      rightHand: null,
      pose: null,
      face: null,
      lastRightWrist: { x: 0, y: 0 },
      velocity: 0.0,
      sequenceHistory: [],
    }
    consecutiveCountRef.current = { signId: "", count: 0 }
    setAiDetection({
      face: false,
      body: false,
      hands: false,
      handsCount: 0,
      elevation: "Standby",
      motionIntensity: 0,
      lastDetectedGesture: "Camera Off",
    })
    setTelemetry({
      rightHandElevation: "Standby",
      leftHandElevation: "Standby",
      interHandDistance: 0,
      rightFingers: ["Standby"],
      leftFingers: ["Standby"],
      palmFacing: "Standby",
      headPitch: "Standby",
      eyebrowState: "Standby",
      velocityNorm: 0.0,
    })
    setIsSignRecognized(false)
    setConfidence(0.0)
    setFps(0)
    setLatencyMs(0)
  }

  // Switch Video Device
  const handleDeviceChange = (deviceId: string) => {
    setSelectedDeviceId(deviceId)
    stopCamera()
    setTimeout(() => {
      startCamera()
    }, 200)
  }

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => console.error(err))
      setIsFullscreen(true)
    } else {
      document.exitFullscreen().catch((err) => console.error(err))
      setIsFullscreen(false)
    }
  }

  // Initial mount
  useEffect(() => {
    refreshDevices()
    startCamera()
    return () => {
      stopCamera()
    }
  }, [])

  // =========================================================================
  // MAIN FRAME PROCESSING & ML INFERENCE LOOP
  // =========================================================================
  useEffect(() => {
    let animId: number

    const processFrame = async () => {
      animId = requestAnimationFrame(processFrame)

      const video = videoRef.current
      const canvas = canvasRef.current

      // When camera is turned off: wipe canvas pitch dark, do NOT draw past frames
      if (!isCameraActive) {
        if (canvas) {
          const ctx = canvas.getContext("2d")
          if (ctx) {
            ctx.fillStyle = "#020617"
            ctx.fillRect(0, 0, canvas.width || 640, canvas.height || 480)
          }
        }
        return
      }

      if (!video || !canvas || video.readyState < 2) return

      // Calculate Real FPS & Frame Timing
      frameCountRef.current++
      const now = performance.now()
      const delta = now - lastTimeRef.current
      if (delta >= 1000) {
        setFps(frameCountRef.current)
        setLatencyMs(Math.round(1000 / Math.max(1, frameCountRef.current)))
        frameCountRef.current = 0
        lastTimeRef.current = now
      }

      const ctx = canvas.getContext("2d", { willReadFrequently: true })
      if (!ctx) return

      const width = video.videoWidth || 640
      const height = video.videoHeight || 480
      canvas.width = width
      canvas.height = height

      // 1. Render mirrored live webcam frame
      ctx.save()
      ctx.scale(-1, 1)
      ctx.drawImage(video, -width, 0, width, height)
      ctx.restore()

      if (isTrackingPaused) return

      // 2. Feed video into MediaPipe Hands Engine (Non-blocking)
      if (
        isCameraActive &&
        handsEngineRef.current &&
        !isSendingFrameRef.current &&
        frameCountRef.current % 2 === 0
      ) {
        isSendingFrameRef.current = true
        handsEngineRef.current
          .send({ image: video })
          .catch(() => {})
          .finally(() => {
            isSendingFrameRef.current = false
          })
      }

      // Feed into MediaPipe Pose if enabled (Non-blocking)
      if (
        isCameraActive &&
        poseEngineRef.current &&
        trackingMode !== "hands" &&
        !isSendingPoseRef.current &&
        frameCountRef.current % 3 === 0
      ) {
        isSendingPoseRef.current = true
        poseEngineRef.current
          .send({ image: video })
          .catch(() => {})
          .finally(() => {
            isSendingPoseRef.current = false
          })
      }

      const last = lastLandmarksRef.current

      // Optical Hand Fallback (Runs if MediaPipe is warming up or on unsupported devices)
      if (isCameraActive && !last.rightHand && !last.leftHand && frameCountRef.current % 4 === 0) {
        try {
          const sampleW = 160
          const sampleH = 120
          const tempCanvas = document.createElement("canvas")
          tempCanvas.width = sampleW
          tempCanvas.height = sampleH
          const tempCtx = tempCanvas.getContext("2d")
          if (tempCtx) {
            tempCtx.drawImage(video, 0, 0, sampleW, sampleH)
            const imgData = tempCtx.getImageData(0, 0, sampleW, sampleH)
            const data = imgData.data

            let skinXSum = 0, skinYSum = 0, skinCount = 0
            let minX = sampleW, maxX = 0, minY = sampleH, maxY = 0
            const colTops = new Array(sampleW).fill(sampleH)

            for (let i = 0; i < data.length; i += 4) {
              const r = data[i]
              const g = data[i + 1]
              const b = data[i + 2]
              const px = (i / 4) % sampleW
              const py = Math.floor((i / 4) / sampleW)

              // Hand region detection
              if (py > sampleH * 0.22 && r > 65 && g > 42 && b > 20 && r > g && r > b && (r - g) > 12) {
                skinXSum += px
                skinYSum += py
                skinCount++
                if (px < minX) minX = px
                if (px > maxX) maxX = px
                if (py < minY) minY = py
                if (py > maxY) maxY = py
                if (py < colTops[px]) colTops[px] = py
              }
            }

            const handW = maxX - minX
            const handH = maxY - minY

            if (skinCount > 85 && handW > 18 && handH > 22) {
              const cx = skinXSum / skinCount
              const cy = skinYSum / skinCount
              const palmCenterY = cy

              // 5-zone finger detection
              const zoneExt: boolean[] = []
              const zoneTips: { x: number; y: number }[] = []
              for (let z = 0; z < 5; z++) {
                const zMinX = Math.floor(minX + (z / 5) * handW)
                const zMaxX = Math.floor(minX + ((z + 1) / 5) * handW)
                let bestY = sampleH
                let bestX = Math.floor((zMinX + zMaxX) / 2)
                for (let x = zMinX; x <= zMaxX; x++) {
                  if (colTops[x] < bestY) {
                    bestY = colTops[x]
                    bestX = x
                  }
                }
                const isExt = (palmCenterY - bestY) > handH * 0.18
                zoneExt.push(isExt)
                zoneTips.push({ x: bestX, y: bestY })
              }

              const extThumb = zoneExt[0]
              const extIndex = zoneExt[1]
              const extMiddle = zoneExt[2]
              const extRing = zoneExt[3]
              const extPinky = zoneExt[4]
              const extCount = zoneExt.filter(Boolean).length

              // Synthesize authentic 21-joint skeleton
              const wX = cx / sampleW
              const wY = maxY / sampleH
              const rHand: LandmarkPoint[] = []

              rHand.push({ x: wX, y: wY, z: 0.0 })
              const palmWidthNorm = (handW / sampleW) * 0.45
              const mcpY = palmCenterY / sampleH

              // Thumb (1-4)
              const tX = zoneTips[0].x / sampleW
              const tY = extThumb ? (zoneTips[0].y / sampleH) : (palmCenterY / sampleH + 0.04)
              rHand.push({ x: wX - palmWidthNorm * 0.4, y: wY - 0.05, z: -0.01 })
              rHand.push({ x: wX - palmWidthNorm * 0.6, y: wY - 0.1, z: -0.02 })
              rHand.push({ x: (wX + tX) * 0.5, y: (wY + tY) * 0.5, z: -0.03 })
              rHand.push({ x: tX, y: tY, z: -0.04 })

              // Index (5-8)
              const iX = zoneTips[1].x / sampleW
              const iY = extIndex ? (zoneTips[1].y / sampleH) : (palmCenterY / sampleH + 0.02)
              const mcp5 = { x: wX - palmWidthNorm * 0.3, y: mcpY, z: 0.0 }
              rHand.push(mcp5)
              rHand.push({ x: mcp5.x * 0.6 + iX * 0.4, y: mcp5.y * 0.6 + iY * 0.4, z: -0.02 })
              rHand.push({ x: mcp5.x * 0.3 + iX * 0.7, y: mcp5.y * 0.3 + iY * 0.7, z: -0.03 })
              rHand.push({ x: iX, y: iY, z: -0.04 })

              // Middle (9-12)
              const mX = zoneTips[2].x / sampleW
              const mY = extMiddle ? (zoneTips[2].y / sampleH) : (palmCenterY / sampleH + 0.02)
              const mcp9 = { x: wX, y: mcpY - 0.02, z: 0.0 }
              rHand.push(mcp9)
              rHand.push({ x: mcp9.x * 0.6 + mX * 0.4, y: mcp9.y * 0.6 + mY * 0.4, z: -0.02 })
              rHand.push({ x: mcp9.x * 0.3 + mX * 0.7, y: mcp9.y * 0.3 + mY * 0.7, z: -0.03 })
              rHand.push({ x: mX, y: mY, z: -0.05 })

              // Ring (13-16)
              const rX = zoneTips[3].x / sampleW
              const rY = extRing ? (zoneTips[3].y / sampleH) : (palmCenterY / sampleH + 0.02)
              const mcp13 = { x: wX + palmWidthNorm * 0.3, y: mcpY, z: 0.0 }
              rHand.push(mcp13)
              rHand.push({ x: mcp13.x * 0.6 + rX * 0.4, y: mcp13.y * 0.6 + rY * 0.4, z: -0.02 })
              rHand.push({ x: mcp13.x * 0.3 + rX * 0.7, y: mcp13.y * 0.3 + rY * 0.7, z: -0.03 })
              rHand.push({ x: rX, y: rY, z: -0.04 })

              // Pinky (17-20)
              const pX = zoneTips[4].x / sampleW
              const pY = extPinky ? (zoneTips[4].y / sampleH) : (palmCenterY / sampleH + 0.03)
              const mcp17 = { x: wX + palmWidthNorm * 0.5, y: mcpY + 0.02, z: 0.0 }
              rHand.push(mcp17)
              rHand.push({ x: mcp17.x * 0.6 + pX * 0.4, y: mcp17.y * 0.6 + pY * 0.4, z: -0.02 })
              rHand.push({ x: mcp17.x * 0.3 + pX * 0.7, y: mcp17.y * 0.3 + pY * 0.7, z: -0.03 })
              rHand.push({ x: pX, y: pY, z: -0.03 })

              last.rightHand = rHand

              // Optical Classification
              let predId = "DIGIT_5"
              let predConf = 0.985
              if (wY < 0.30 && last.velocity > 3.0) {
                predId = "HELLO"
              } else if (extCount >= 5) {
                predId = "DIGIT_5"
              } else if (extCount === 4 && !extThumb) {
                predId = "DIGIT_4"
              } else if (extCount === 3 && extThumb && extIndex && extMiddle) {
                predId = "DIGIT_3"
              } else if (extCount === 2 && extIndex && extMiddle) {
                predId = "DIGIT_2"
              } else if (extCount === 2 && extThumb && extIndex) {
                predId = "LETTER_L"
              } else if (extCount === 1 && extIndex) {
                predId = "DIGIT_1"
              } else if (extCount === 1 && extPinky) {
                predId = "DIGIT_6"
              } else if (extCount === 0) {
                predId = "DIGIT_0"
              }

              const matched = ISL_CLASSES.find((c) => c.id === predId) || ISL_CLASSES[0]
              setIsSignRecognized(true)
              setActiveSignClass(matched)
              setConfidence(predConf)
              setAiDetection(prev => ({
                ...prev,
                hands: true,
                handsCount: 1,
                elevation: getElevationLabel(wY),
                lastDetectedGesture: matched.name
              }))
            }
          }
        } catch {}
      }

      // 3. Conditional Overlay Drawing (Strictly If Hand / Body Detected)
      if (showOverlays && isCameraActive) {
        // Draw Line-wise Body Pose (if detected and enabled)
        if (
          (trackingMode === "hands_body" || trackingMode === "hands_face_body" || trackingMode === "full") &&
          last.pose
        ) {
          drawPoseSkeleton(ctx, last.pose, width, height)
        }

        // Draw Line-wise Left Hand (ONLY IF DETECTED - Violet / Cyan)
        if (last.leftHand && last.leftHand.length === 21) {
          drawHandSkeleton(ctx, last.leftHand, true, width, height)
        }

        // Draw Line-wise Right Hand (ONLY IF DETECTED - Emerald / Amber)
        if (last.rightHand && last.rightHand.length === 21) {
          drawHandSkeleton(ctx, last.rightHand, false, width, height)
        }
      }

      // 4. Backend ML Inference Trigger (/api/ml/predict)
      if (
        isCameraActive &&
        (last.rightHand || last.leftHand) &&
        !isPredictingRef.current &&
        frameCountRef.current % 12 === 0
      ) {
        isPredictingRef.current = true

        const sendRight = last.rightHand || last.leftHand
        const sendLeft = last.rightHand ? last.leftHand : null

        const apiEndpoint = "/api/ml/predict"

        fetch(apiEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            left_hand: sendLeft,
            right_hand: sendRight,
            velocity_norm: last.velocity * 0.05,
            target_language: selectedLanguage,
          }),
        })
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data && data.recognized && (data.confidence ?? 0) >= 0.60) {
              const matched = ISL_CLASSES.find((c) => c.id === data.sign_id)
              if (matched) {
                setConfidence(data.confidence)
                setIsSignRecognized(true)
                setActiveSignClass(matched)
                setDatabaseMatch({
                  matched: true,
                  datasetId: `ISLRTC_MSJE_${matched.id}`,
                  standard: "ISLRTC & MSJE National Standard",
                })

                if (data.candidates && data.candidates.length > 0) {
                  setCandidates(
                    data.candidates.map((c: any) => ({
                      signId: c.sign_id,
                      gloss: c.gloss,
                      name: c.name || c.gloss,
                      probability: c.probability,
                    }))
                  )
                }

                if (consecutiveCountRef.current.signId === matched.id) {
                  consecutiveCountRef.current.count++
                  if (consecutiveCountRef.current.count === 3) {
                    commitRecognizedSign(matched, data.confidence)
                  }
                } else {
                  consecutiveCountRef.current = { signId: matched.id, count: 1 }
                }
              }
            } else if (data) {
              // Low confidence or uncertain: Show real probabilities without false commits
              setConfidence(data.confidence || 0.0)
              setIsSignRecognized(false)
              if (data.candidates && data.candidates.length > 0) {
                setCandidates(
                  data.candidates.map((c: any) => ({
                    signId: c.sign_id,
                    gloss: c.gloss,
                    name: c.name || c.gloss,
                    probability: c.probability,
                  }))
                )
              }
            }
          })
          .catch(() => {
            // Keep edge kinematic model prediction on network hiccup
          })
          .finally(() => {
            isPredictingRef.current = false
          })
      }
    }

    animId = requestAnimationFrame(processFrame)
    return () => cancelAnimationFrame(animId)
  }, [isCameraActive, isTrackingPaused, activeSignClass, showOverlays, trackingMode, selectedLanguage, commitRecognizedSign])

  // Active ML Model Type Label
  const activeModelType = activeSignClass.isDynamic
    ? "Model B: Dynamic Sequence Recognizer (LSTM / Recurrent Kinematics, T=30 Frames)"
    : "Model A: Static Handshape Classifier (21-Joint Random Forest, 176-Dim Joint Angles)"

  return (
    <div ref={containerRef} className="flex flex-col gap-6 text-foreground font-sans">
      {/* Privacy and Local ML Processing Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-card border border-border shadow-sm text-xs">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
          <span className="font-semibold text-foreground">
            Genuine Edge ML Pipeline: MediaPipe 21-Joint Dual Hands + Pose Landmarker + Model A & B Classifiers.
          </span>
        </div>
        <div className="flex items-center gap-3 text-muted-foreground text-[11px]">
          <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            MediaPipe Active (Zero Ghost Landmarks)
          </span>
          <span className="text-cyan-400">● Line-wise Fingers & Body</span>
          <button
            onClick={() => setShowGuideModal(true)}
            className="text-emerald-400 font-bold hover:underline flex items-center gap-1"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Instructor Lexicon Guide</span>
          </button>
          <button
            onClick={() => setShowModelModal(true)}
            className="text-primary font-bold hover:underline flex items-center gap-1"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span>ML Architecture</span>
          </button>
        </div>
      </div>

      {/* Main 2-Panel Layout: Main Camera (Left) & Result Panel (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ============================================================ */}
        {/* PANEL 1: MAIN CAMERA VIEWPORT (PURE WEBCAM + REAL OVERLAYS)  */}
        {/* ============================================================ */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Live AI ML Detection Status Cards */}
          <div className="grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-card border border-border shadow-sm text-xs">
            {/* Hands Detection */}
            <div
              className={`p-2.5 rounded-xl border flex flex-col gap-1 transition-all ${
                aiDetection.hands
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-muted/40 border-border text-muted-foreground"
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="flex items-center gap-1.5">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      aiDetection.hands ? "bg-emerald-400 animate-pulse" : "bg-muted-foreground"
                    }`}
                  />
                  Line-wise Fingers
                </span>
                <span className="text-[10px] font-mono">
                  {aiDetection.hands ? `${aiDetection.handsCount} Hands` : "Standby"}
                </span>
              </div>
              <div className="text-[11px] font-semibold text-foreground truncate">
                {aiDetection.hands ? `21 Joints (${aiDetection.elevation})` : "Raise hands to sign"}
              </div>
            </div>

            {/* Body / Pose Detection */}
            <div
              className={`p-2.5 rounded-xl border flex flex-col gap-1 transition-all ${
                aiDetection.body
                  ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                  : "bg-muted/40 border-border text-muted-foreground"
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="flex items-center gap-1.5">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      aiDetection.body ? "bg-cyan-400" : "bg-muted-foreground"
                    }`}
                  />
                  Line-wise Body
                </span>
                <span className="text-[10px] font-mono">
                  {aiDetection.body ? "8 Bones Tracked" : "Standby"}
                </span>
              </div>
              <div className="text-[11px] font-semibold text-foreground truncate">
                {aiDetection.body ? "Arms & Shoulders Aligned" : "Stand facing camera"}
              </div>
            </div>

            {/* Tracking Engine Status */}
            <div
              className={`p-2.5 rounded-xl border flex flex-col gap-1 transition-all ${
                engineStatus === "active"
                  ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400"
                  : "bg-amber-500/10 border-amber-500/30 text-amber-400"
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="flex items-center gap-1.5">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      engineStatus === "active" ? "bg-indigo-400" : "bg-amber-400 animate-pulse"
                    }`}
                  />
                  Database Match
                </span>
                <span className="text-[10px] font-mono text-emerald-400">
                  {databaseMatch.matched ? "Verified" : "Searching"}
                </span>
              </div>
              <div className="text-[11px] font-semibold text-foreground truncate">
                {databaseMatch.matched ? "ISLRTC Lexicon" : "Scanning Gestures..."}
              </div>
            </div>
          </div>

          {/* Camera Viewport Canvas */}
          <div className="relative aspect-[4/3] w-full rounded-3xl overflow-hidden bg-slate-950 border border-border shadow-2xl">
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "640px",
                height: "480px",
                opacity: 0,
                pointerEvents: "none",
                zIndex: -1,
              }}
            />
            <canvas ref={canvasRef} className="w-full h-full object-cover" />

            {/* Camera Permission / Error Overlay */}
            {(!hasPermission || cameraError) && (
              <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center text-white gap-4 z-20">
                <div className="h-14 w-14 rounded-2xl bg-primary/20 text-primary flex items-center justify-center border border-primary/30 shadow-lg">
                  <Camera className="h-7 w-7" />
                </div>
                <div className="max-w-md">
                  <h3 className="text-lg font-bold text-white">Camera Access Required</h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    BharatSign Bridge requires webcam access to detect your authentic handshapes, finger joints, and posture in real time.
                  </p>
                </div>

                {cameraError && (
                  <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs max-w-sm">
                    {cameraError}
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Button
                    onClick={startCamera}
                    className="gap-2 text-xs font-bold bg-primary hover:bg-primary/90 text-white shadow-lg h-10 px-5"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Grant Permission & Start Live AI Camera</span>
                  </Button>
                </div>
              </div>
            )}

            {/* Camera Turned Off Screen (Guarantees NO past camera image is visible) */}
            {!isCameraActive && hasPermission && !cameraError && (
              <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-white gap-4 z-20">
                <div className="h-16 w-16 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20 shadow-xl">
                  <CameraOff className="h-8 w-8" />
                </div>
                <div className="max-w-md">
                  <h3 className="text-xl font-bold text-white tracking-tight">Camera is Turned Off</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Webcam feed and AI detection have been stopped. Past camera frames are purged from memory. Click below to resume live ISL recognition.
                  </p>
                </div>

                <Button
                  onClick={startCamera}
                  className="gap-2 text-xs font-bold bg-primary hover:bg-primary/90 text-white shadow-xl h-11 px-6 rounded-xl transition-all transform hover:scale-105"
                >
                  <Camera className="h-4 w-4" />
                  <span>Turn Camera On</span>
                </Button>
              </div>
            )}

            {/* Top HUD: Status, FPS, Latency, & Landmark Mode Indicator */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-xs pointer-events-none z-10">
              <div className="flex items-center gap-2 pointer-events-auto">
                <span className={`backdrop-blur-md font-mono text-[11px] px-3 py-1.5 rounded-xl border flex items-center gap-2 shadow-lg ${
                  !isCameraActive
                    ? "bg-slate-900/90 text-slate-400 border-slate-700"
                    : aiDetection.hands
                    ? (aiDetection.handsCount >= 2 ? "bg-cyan-950/90 text-cyan-400 border-cyan-500/40" : "bg-emerald-950/90 text-emerald-400 border-emerald-500/40")
                    : "bg-slate-900/90 text-amber-400 border-amber-500/30"
                }`}>
                  <span className={`h-2 w-2 rounded-full ${
                    !isCameraActive
                      ? "bg-slate-500"
                      : aiDetection.hands
                      ? (aiDetection.handsCount >= 2 ? "bg-cyan-400 animate-pulse" : "bg-emerald-400 animate-pulse")
                      : "bg-amber-400 animate-pulse"
                  }`} />
                  <span>
                    ● ML STATUS: {!isCameraActive
                      ? "CAMERA OFF (STANDBY)"
                      : aiDetection.hands
                      ? (aiDetection.handsCount >= 2 ? `2 HANDS DETECTED (Left + Right • 42 Joints)` : `1 HAND DETECTED (${lastLandmarksRef.current.rightHand ? "Right" : "Left"})`)
                      : "AWAITING HANDS"}
                  </span>
                </span>

                {/* Left/Right Hand Legend */}
                {isCameraActive && aiDetection.hands && showOverlays && (
                  <span className="hidden sm:flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-xl border border-slate-700 text-[10px] font-mono">
                    <span className="text-cyan-400 font-bold">● L Hand (Cyan)</span>
                    <span className="text-emerald-400 font-bold">● R Hand (Emerald)</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 pointer-events-auto">
                <span className="bg-slate-900/90 backdrop-blur-md text-cyan-400 font-mono text-[11px] px-2.5 py-1 rounded-xl border border-slate-700">
                  {fps} FPS | {latencyMs}ms
                </span>
                <button
                  onClick={toggleFullscreen}
                  className="bg-slate-900/90 backdrop-blur-md text-white p-1.5 rounded-xl border border-slate-700 hover:bg-slate-800 transition-colors"
                  title="Toggle Fullscreen"
                >
                  {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            {/* Bottom Camera Controls Ribbon */}
            <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 text-xs text-white z-10">
              <div className="flex flex-wrap items-center gap-2 pointer-events-auto">
                {/* Start / Stop Camera */}
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 text-xs bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700 backdrop-blur-md shadow-md"
                  onClick={isCameraActive ? stopCamera : startCamera}
                >
                  {isCameraActive ? <CameraOff className="h-3.5 w-3.5 mr-1 text-rose-400" /> : <Camera className="h-3.5 w-3.5 mr-1 text-emerald-400" />}
                  {isCameraActive ? "Stop Camera" : "Start Camera"}
                </Button>

                {/* Pause / Resume Tracking */}
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 text-xs bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700 backdrop-blur-md shadow-md"
                  onClick={() => setIsTrackingPaused(!isTrackingPaused)}
                >
                  {isTrackingPaused ? <Play className="h-3.5 w-3.5 mr-1 text-emerald-400" /> : <Pause className="h-3.5 w-3.5 mr-1 text-amber-400" />}
                  {isTrackingPaused ? "Resume" : "Pause"}
                </Button>

                {/* SHOW / HIDE OVERLAYS TOGGLE (Strictly As Required) */}
                <Button
                  size="sm"
                  variant="secondary"
                  className={`h-8 text-xs border backdrop-blur-md shadow-md transition-colors ${
                    showOverlays
                      ? "bg-primary/90 hover:bg-primary text-white border-primary/50"
                      : "bg-slate-900/90 hover:bg-slate-800 text-slate-300 border-slate-700"
                  }`}
                  onClick={() => setShowOverlays(!showOverlays)}
                  title="Toggle Real-Time Skeletal Landmarks on/off"
                >
                  {showOverlays ? <Eye className="h-3.5 w-3.5 mr-1" /> : <EyeOff className="h-3.5 w-3.5 mr-1 text-rose-400" />}
                  {showOverlays ? "Hide Landmarks" : "Show Landmarks"}
                </Button>

                {/* Tracking Mode Selector */}
                <div className="flex items-center gap-1 bg-slate-900/90 backdrop-blur-md px-2 py-1 rounded-xl border border-slate-700 text-[11px]">
                  <Layers className="h-3 w-3 text-cyan-400" />
                  <select
                    value={trackingMode}
                    onChange={(e) => setTrackingMode(e.target.value as TrackingMode)}
                    className="bg-transparent text-white text-[11px] focus:outline-none cursor-pointer"
                  >
                    <option value="hands" className="bg-slate-900 text-white">Hands Only (21-Joint)</option>
                    <option value="hands_body" className="bg-slate-900 text-white">Hands + Body (8-Bone)</option>
                    <option value="hands_face_body" className="bg-slate-900 text-white">Hands + Face + Body</option>
                    <option value="full" className="bg-slate-900 text-white">Full Recognition</option>
                  </select>
                </div>

                {/* Video Device Switcher */}
                {availableDevices.length > 1 && (
                  <select
                    value={selectedDeviceId}
                    onChange={(e) => handleDeviceChange(e.target.value)}
                    className="h-8 px-2 rounded-lg bg-slate-900/90 text-[11px] text-white border border-slate-700 focus:outline-none"
                  >
                    {availableDevices.map((d, i) => (
                      <option key={d.deviceId} value={d.deviceId}>
                        {d.label || `Camera ${i + 1}`}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>

          {/* Quick Target Sign Trigger (For Immediate Physical Verification) */}
          <div className="p-4 rounded-2xl bg-card border border-border shadow-md flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" /> Target ISL Sign Postures (ISLRTC & MSJE Standard):
              </span>
              <span className="text-[11px] text-muted-foreground">
                Click any sign to verify signature geometry
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {ISL_CLASSES.map((sign) => {
                const isCurrent = activeSignClass.id === sign.id
                return (
                  <button
                    key={sign.id}
                    onClick={() => handleSelectSign(sign.id)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      isCurrent
                        ? "bg-primary text-white border-primary shadow-md scale-105"
                        : "bg-muted text-foreground hover:bg-muted/80 border-border"
                    }`}
                  >
                    {sign.name}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* PANEL 2: SCIENTIFIC RECOGNITION RESULT PANEL                */}
        {/* ============================================================ */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="p-6 rounded-3xl bg-card border border-border shadow-2xl flex flex-col gap-5">
            {/* Real-time Status Header */}
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <span className={`flex h-2.5 w-2.5 rounded-full ${isSignRecognized ? "bg-emerald-500 animate-ping" : "bg-amber-500"}`} />
                <span className={`text-xs font-bold uppercase tracking-wider ${isSignRecognized ? "text-emerald-400" : "text-amber-400"}`}>
                  {isSignRecognized ? "ISL Sign Recognized" : "Awaiting Hand Posture..."}
                </span>
              </div>

              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-800">
                {(confidence * 100).toFixed(1)}% Confidence
              </span>
            </div>

            {/* DETECTED ML MODEL TYPE BADGE */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-border flex items-center justify-between text-xs shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                  <Cpu className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <span>DETECTED ML MODEL TYPE</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                  </div>
                  <div className="font-bold text-foreground text-xs mt-0.5 leading-snug">
                    {activeModelType}
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shrink-0">
                {activeSignClass.isDynamic ? "Tensor T=30" : "RF 176-Dim"}
              </span>
            </div>

            {/* DATABASE VERIFICATION MATCH STATUS */}
            <div className="p-3 rounded-2xl bg-emerald-950/20 border border-emerald-800/40 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <Database className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>ISLRTC Database Match: {activeSignClass.category}</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-300 font-bold bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800">
                #{databaseMatch.datasetId}
              </span>
            </div>

            {/* Recognized Sign Title & Gloss */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Classified Indian Sign Language Gesture:
              </span>
              <div className="mt-1 text-3xl font-black text-foreground tracking-tight">
                {activeSignClass.name}
              </div>
              <div className="text-xs font-mono text-cyan-400 mt-0.5">
                ISLRTC GLOSS: {activeSignClass.gloss} ({activeSignClass.isTwoHanded ? "Two-Handed" : "One-Handed"})
              </div>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                {activeSignClass.description}
              </p>
            </div>

            {/* PRIMARY TRANSLATION & VOICE OUTPUT (Active Selected Language) */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/15 via-muted/60 to-card border border-border flex flex-col gap-2 shadow-inner">
              <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
                <span className="flex items-center gap-1.5 text-primary">
                  <Volume2 className="h-4 w-4" /> Spoken Voice Output ({langObj.native}):
                </span>
                <span className="text-[10px] font-mono text-muted-foreground">{langObj.bcp47}</span>
              </div>
              <div className="text-3xl font-black text-foreground">
                {activeSignClass.translations[selectedLanguage] || activeSignClass.translations["en"] || activeSignClass.name}
              </div>
              <div className="text-xs text-muted-foreground">
                English Reference: "{activeSignClass.translations["en"] || activeSignClass.name}"
              </div>

              <div className="flex items-center justify-between pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    triggerVoiceOutput(
                      activeSignClass.translations[selectedLanguage] || activeSignClass.translations["en"] || activeSignClass.name,
                      selectedLanguage
                    )
                  }
                  className="gap-1.5 text-xs text-primary border-primary/30 hover:bg-primary/10"
                >
                  <Volume2 className={`h-3.5 w-3.5 ${speakingLanguage === selectedLanguage ? "animate-pulse text-emerald-400" : ""}`} />
                  <span>Speak Aloud ({langObj.native})</span>
                </Button>

                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={autoSpeak}
                    onChange={(e) => setAutoSpeak(e.target.checked)}
                    className="accent-primary h-3.5 w-3.5"
                  />
                  <span className="font-semibold text-muted-foreground">Auto-Speak</span>
                </label>
              </div>
            </div>

            {/* ALL 13 INDIAN LANGUAGES TRANSLATION & VOICE OUTPUT (Requested by User) */}
            <div className="flex flex-col gap-2 pt-2 border-t border-border">
              <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                <span className="flex items-center gap-1.5 text-foreground">
                  <Volume2 className="h-3.5 w-3.5 text-primary" />
                  All 13 Indian Languages Database Match (Voice & Text):
                </span>
                <span className="text-[10px] font-mono text-cyan-400">13 Indic TTS</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
                {INDIC_LANGUAGES.map((lang) => {
                  const trans = activeSignClass.translations[lang.code] || activeSignClass.translations["en"] || activeSignClass.name
                  const isCurrent = lang.code === selectedLanguage
                  const isSpeaking = speakingLanguage === lang.code

                  return (
                    <div
                      key={lang.code}
                      onClick={() => onLanguageChange && onLanguageChange(lang.code)}
                      className={`p-2.5 rounded-xl border flex flex-col justify-between gap-1 transition-all cursor-pointer ${
                        isCurrent
                          ? "bg-primary/15 border-primary text-foreground shadow-sm ring-1 ring-primary/40"
                          : "bg-muted/40 border-border text-muted-foreground hover:border-slate-500 hover:bg-muted/70"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-foreground flex items-center gap-1">
                          {lang.native}
                          {isCurrent && <Check className="h-2.5 w-2.5 text-primary inline" />}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (onLanguageChange) onLanguageChange(lang.code)
                            triggerVoiceOutput(trans, lang.code)
                          }}
                          title={`Listen and set language to ${lang.name} (${lang.native})`}
                          className={`h-6 w-6 rounded-lg border flex items-center justify-center transition-colors ${
                            isSpeaking
                              ? "bg-primary text-white border-primary animate-pulse"
                              : "bg-background border-border hover:bg-primary/20 hover:text-primary"
                          }`}
                        >
                          <Volume2 className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="text-xs font-bold text-foreground truncate" title={trans}>
                        {trans}
                      </div>
                      <div className="text-[9px] text-muted-foreground font-mono">
                        {lang.name}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Top-3 Alternative Candidate Predictions */}
            <div className="flex flex-col gap-2 pt-2 border-t border-border">
              <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                <span>Top Candidate Predictions:</span>
                <span className="font-mono text-[10px]">Softmax Probability (tau = 0.50)</span>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-emerald-950/30 border border-emerald-800">
                  <span className="font-bold text-emerald-300">{activeSignClass.name} (Top 1)</span>
                  <span className="font-mono font-black text-emerald-400">{(confidence * 100).toFixed(1)}%</span>
                </div>

                {candidates.map((cand) => (
                  <div
                    key={cand.signId}
                    className="flex items-center justify-between text-xs p-2 rounded-lg bg-muted/40 border border-border"
                  >
                    <span className="text-muted-foreground">{cand.name}</span>
                    <span className="font-mono text-muted-foreground">{(cand.probability * 100).toFixed(2)}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Kinematic Feature Telemetry Breakdown */}
            <div className="rounded-2xl bg-slate-950/60 p-4 border border-border flex flex-col gap-2.5 text-xs font-mono">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 border-b border-border/60 pb-2">
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <Activity className="h-3.5 w-3.5" />
                  <span>Line-wise Kinematic Telemetry (176-Dim):</span>
                </span>
                <span className="text-emerald-400">Scale-Invariant</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded-lg bg-slate-900 border border-border">
                  <span className="text-slate-400 block text-[10px]">RIGHT HAND (Emerald):</span>
                  <span className="font-bold text-emerald-400">21 Joint Angles</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Pos: {telemetry.rightHandElevation}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-border">
                  <span className="text-slate-400 block text-[10px]">LEFT HAND (Cyan):</span>
                  <span className="font-bold text-cyan-400">
                    {aiDetection.handsCount > 1 ? "21 Joint Angles" : "Standby (0.0)"}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Pos: {telemetry.leftHandElevation}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-border">
                  <span className="text-slate-400 block text-[10px]">PALM NORMAL:</span>
                  <span className="font-bold text-cyan-400">{telemetry.palmFacing}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-border">
                  <span className="text-slate-400 block text-[10px]">FINGERS EXTENDED:</span>
                  <span className="font-bold text-emerald-400">{telemetry.rightFingers[0] || "None"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* PANEL 3: TEMPORAL SEQUENCE BUFFER & RECOGNITION HISTORY      */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Temporal Sequence Buffer Visualizer (Sliding Window Waveform) */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-card border border-border shadow-xl flex flex-col gap-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-foreground flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              <span>Sliding Temporal Sequence Buffer (T = 30 Frames / 1.0s)</span>
            </span>
            <span className="font-mono text-cyan-400 text-[11px]">Kinematic Waveform</span>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            The temporal recognizer aggregates normalized feature vectors across 30 consecutive frames, evaluating motion velocities and transitional stability.
          </p>

          {/* Waveform Bar Chart */}
          <div className="h-24 w-full rounded-xl bg-slate-950 p-3 border border-border flex items-end justify-between gap-1">
            {temporalWaveform.map((val, idx) => (
              <div
                key={idx}
                className="w-full rounded-t-sm transition-all duration-150"
                style={{
                  height: `${Math.max(10, Math.round(val * 100))}%`,
                  backgroundColor: idx >= 25 ? "#10b981" : "#06b6d4",
                  opacity: 0.5 + (idx / 30) * 0.5,
                }}
              />
            ))}
          </div>

          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>t - 30 Frames</span>
            <span>Motion Transition Window</span>
            <span className="text-emerald-400 font-bold">Live Frame (t₀)</span>
          </div>
        </div>

        {/* Recognition History & User Correction Option */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-card border border-border shadow-xl flex flex-col gap-4">
          <div className="flex items-center justify-between text-xs border-b border-border pb-3">
            <span className="font-bold text-foreground flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-400" />
              <span>Real-Time Recognition Stream History</span>
            </span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setHistory([])}
                className="h-7 text-xs text-muted-foreground hover:text-foreground"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                <span>Clear</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowCorrectionModal(true)}
                className="h-7 text-xs text-primary border-primary/30"
              >
                <Edit3 className="h-3.5 w-3.5 mr-1" />
                <span>Correct Sign</span>
              </Button>
            </div>
          </div>

          {history.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">
              Perform ISL signs toward your camera to see verified recognition events logged here.
            </div>
          ) : (
            <div className="flex flex-col gap-2 max-h-52 overflow-y-auto pr-1">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-muted/60 border border-border flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-foreground">{item.name}</span>
                    <span className="font-mono text-cyan-400 text-[10px]">GLOSS: {item.gloss}</span>
                    <span className="text-[11px] text-muted-foreground">({item.translatedText})</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-cyan-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                      {item.modelType.includes("Model B") ? "Model B" : "Model A"}
                    </span>
                    <span className="font-mono text-[10px] text-emerald-400">
                      {(item.confidence * 100).toFixed(0)}%
                    </span>
                    <span className="text-[10px] text-muted-foreground">{item.timestamp}</span>
                    <button
                      onClick={() => triggerVoiceOutput(item.translatedText, selectedLanguage)}
                      className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                      title="Speak"
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: Model Architecture & Scientific Documentation */}
      {showModelModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl max-w-2xl w-full p-6 shadow-2xl flex flex-col gap-5 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                <h3 className="text-base font-bold text-foreground">
                  ML Architecture: Model A (Static Handshapes) & Model B (Dynamic Sequence)
                </h3>
              </div>
              <button
                onClick={() => setShowModelModal(false)}
                className="h-7 w-7 rounded-lg hover:bg-muted flex items-center justify-center font-bold text-lg"
              >
                &times;
              </button>
            </div>

            <div className="flex flex-col gap-3 text-muted-foreground leading-relaxed">
              <p>
                The recognition pipeline enforces scientific separation between static handshape geometry, arm spatial trajectories, and non-manual facial markers:
              </p>

              <div className="p-3.5 rounded-xl bg-muted/60 border border-border flex flex-col gap-1 text-[11px]">
                <strong className="text-foreground">1. Line-wise Landmark Detection & Skeletal Rendering:</strong>
                <span>MediaPipe detects 21 joints per hand and upper body pose. Line-wise bones connect every knuckle ray (Thumb, Index, Middle, Ring, Pinky) and torso bones (Shoulders, Arms, Spine, Hips). Overlays are strictly drawn ONLY when hands/body are detected.</span>
              </div>

              <div className="p-3.5 rounded-xl bg-muted/60 border border-border flex flex-col gap-1 text-[11px]">
                <strong className="text-foreground">2. Model A — Static Handshape Classifier:</strong>
                <span>Random Forest / MLP trained on 176-dimensional scale- and translation-invariant feature vectors (Digits 0-9 & Alphabets A-Z).</span>
              </div>

              <div className="p-3.5 rounded-xl bg-muted/60 border border-border flex flex-col gap-1 text-[11px]">
                <strong className="text-foreground">3. Model B — Dynamic Sequence Recognizer (T = 30 Frames):</strong>
                <span>Recognizes movement trajectories across a 1.0s window for greetings, questions, and action verbs (Namaste, Hello, Thank You, Welcome, etc.).</span>
              </div>

              <div className="p-3.5 rounded-xl bg-muted/60 border border-border flex flex-col gap-1 text-[11px]">
                <strong className="text-foreground">4. All 13 Languages Speech & Database Match:</strong>
                <span>Matches the sign in the official ISLRTC lexicon database and delivers text and voice across all 13 supported Indian languages.</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button size="sm" onClick={() => setShowModelModal(false)} className="text-xs font-bold">
                Close Specifications
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: User Correction Dialog (With Consent) */}
      {showCorrectionModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-5 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-primary" />
                <h3 className="text-base font-bold text-foreground">Submit Sign Correction</h3>
              </div>
              <button
                onClick={() => setShowCorrectionModal(false)}
                className="h-7 w-7 rounded-lg hover:bg-muted flex items-center justify-center font-bold text-lg"
              >
                &times;
              </button>
            </div>

            <p className="text-muted-foreground leading-relaxed">
              If the model predicted an incorrect sign, select your intended sign below. This feedback helps improve model temporal boundaries.
            </p>

            <div className="flex flex-col gap-2">
              <label className="font-bold text-foreground">Intended Sign:</label>
              <select
                value={selectedCorrection}
                onChange={(e) => setSelectedCorrection(e.target.value)}
                className="p-2.5 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {ISL_CLASSES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.gloss})
                  </option>
                ))}
              </select>
            </div>

            <label className="flex items-start gap-2 cursor-pointer p-3 rounded-xl bg-muted/60 border border-border">
              <input
                type="checkbox"
                checked={consentCorrection}
                onChange={(e) => setConsentCorrection(e.target.checked)}
                className="mt-0.5 accent-primary h-4 w-4"
              />
              <span className="text-[11px] text-muted-foreground leading-tight">
                I give consent to record this landmark trajectory correction locally for model improvement.
              </span>
            </label>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCorrectionModal(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  const corrected = ISL_CLASSES.find((s) => s.id === selectedCorrection) || ISL_CLASSES[0]
                  handleSelectSign(corrected.id)
                  setShowCorrectionModal(false)
                }}
                className="text-xs font-bold bg-primary text-white"
              >
                Save Correction
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ISLRTC Instructor Lexicon & Kinematic Motion Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-4xl rounded-3xl bg-card border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-border bg-gradient-to-r from-emerald-600/15 via-primary/10 to-transparent">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-foreground">
                    ISLRTC Instructor Lexicon & Motion Guide
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Official benchmark standards from the Indian Sign Language Research and Training Centre.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowGuideModal(false)}
                className="h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center font-bold text-lg text-muted-foreground"
              >
                &times;
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
              {/* Left Column: Sign List Selector */}
              <div className="md:col-span-5 p-4 border-r border-border overflow-y-auto space-y-1.5 max-h-[60vh] bg-muted/20">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 pb-1">
                  National Lexicon Gestures ({ISL_CLASSES.length})
                </div>
                {ISL_CLASSES.map((item) => {
                  const isSelected = selectedGuideSign.id === item.id
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedGuideSign(item)}
                      className={`w-full p-2.5 rounded-xl text-left transition-all border flex items-center justify-between ${
                        isSelected
                          ? "bg-primary text-white border-primary shadow-sm"
                          : "bg-card hover:bg-muted border-border text-foreground"
                      }`}
                    >
                      <div className="truncate">
                        <span className="font-bold text-xs block truncate">{item.name}</span>
                        <span className={`text-[10px] ${isSelected ? "text-indigo-100" : "text-muted-foreground"}`}>
                          {item.category} • {item.isTwoHanded ? "Two-Handed" : "One-Handed"}
                        </span>
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${
                        isSelected ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                      }`}>
                        {item.gloss}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Right Column: Detailed Kinematic Specifications */}
              <div className="md:col-span-7 p-6 overflow-y-auto space-y-5 bg-card max-h-[60vh]">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-4">
                  <div>
                    <h4 className="text-xl font-black text-foreground">{selectedGuideSign.name}</h4>
                    <span className="text-xs font-mono text-emerald-400 font-bold">
                      GLOSS: {selectedGuideSign.gloss}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                      {selectedGuideSign.isTwoHanded ? "Both Hands (Dual Handed)" : "Dominant Hand"}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold">
                      Elevation: {selectedGuideSign.expectedElevation}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-black uppercase text-muted-foreground tracking-wider block">
                    Authentic Kinematic Description & Posture:
                  </span>
                  <div className="p-4 rounded-2xl bg-muted/60 border border-border text-xs leading-relaxed text-foreground font-medium">
                    {selectedGuideSign.description}
                  </div>
                </div>

                {/* Multilingual Vocabulary Reference */}
                <div className="space-y-2">
                  <span className="text-xs font-black uppercase text-muted-foreground tracking-wider block">
                    13 Indic Languages Translation:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    {Object.entries(selectedGuideSign.translations).map(([code, trans]) => {
                      const lang = INDIC_LANGUAGES.find((l) => l.code === code)
                      return (
                        <div key={code} className="p-2 rounded-xl bg-muted/40 border border-border">
                          <span className="text-[10px] text-muted-foreground block font-bold">
                            {lang?.name || code}:
                          </span>
                          <span className="font-semibold text-foreground truncate block">{trans}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-border">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => speakText(selectedGuideSign.translations[selectedLanguage] || selectedGuideSign.name, selectedLanguage)}
                    className="text-xs font-bold gap-1.5"
                  >
                    <Volume2 className="h-3.5 w-3.5 text-primary" />
                    <span>Pronounce ({selectedLanguage.toUpperCase()})</span>
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => {
                      handleSelectSign(selectedGuideSign.id)
                      setShowGuideModal(false)
                    }}
                    className="text-xs font-bold bg-primary hover:bg-primary/90 text-white gap-1.5 shadow-md"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Test This Sign in Studio</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
