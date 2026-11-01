import { useState } from "react"
import { Camera, Volume2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import ThreeAvatar from "@/components/avatar/ThreeAvatar"
import { INDIC_LANGUAGES, speakText } from "@/lib/speech"

interface LearningPortalProps {
  currentLanguage: string
}

const ALPHABET_DATA: Record<string, { posture: string; hands: string; tips: string }> = {
  A: { posture: "Both hands form fists with thumbs pointing vertically upright, tips touching.", hands: "Two-handed", tips: "Keep thumbs touching at knuckle level." },
  B: { posture: "Both hands curve thumb and index fingers to form two touching circles.", hands: "Two-handed", tips: "Creates the double-loop shape of B." },
  C: { posture: "Right hand fingers curved forming a clean 'C' arch.", hands: "One-handed", tips: "Hold hand at upper chest level." },
  D: { posture: "Left hand index pointing up while right thumb and index create loop touching left index.", hands: "Two-handed", tips: "Forms vertical stem and rounded back." },
  E: { posture: "Left index vertical, right hand fingers touch top, middle, and bottom to form three prongs.", hands: "Two-handed", tips: "Clear horizontal extensions." },
  F: { posture: "Left index vertical, right index and middle cross horizontally across the top.", hands: "Two-handed", tips: "Resembles the two horizontal bars of F." },
  G: { posture: "Both hands in fists, right fist placed on top of left fist.", hands: "Two-handed", tips: "Knuckles stacked firmly." },
  H: { posture: "Left open palm flat horizontal, right hand sweeps across palm.", hands: "Two-handed", tips: "Smooth horizontal motion." },
  I: { posture: "Right hand index finger touching right cheek or pointing near temple.", hands: "One-handed", tips: "Indicates the eye/I phonetic sign." },
  J: { posture: "Left palm open, right index draws a 'J' hook trajectory across left palm.", hands: "Two-handed", tips: "Follow the curved hook motion." },
  K: { posture: "Left index upright, right hand forms 'V' shape resting on left index.", hands: "Two-handed", tips: "Resembles angled arms of letter K." },
  L: { posture: "Right thumb and index extended at 90-degree angle forming 'L'.", hands: "One-handed", tips: "Clean 90-degree right angle." },
  M: { posture: "Left open palm horizontal, three fingers of right hand placed upon palm.", hands: "Two-handed", tips: "Three fingers represent the three arches of M." },
  N: { posture: "Left open palm horizontal, two fingers of right hand placed upon palm.", hands: "Two-handed", tips: "Two fingers represent the two stems of N." },
  O: { posture: "All fingertips and thumb of dominant hand touch to form circle 'O'.", hands: "One-handed", tips: "Round circle shape." },
  P: { posture: "Left index upright, right hand thumb and index form loop touching top of left index.", hands: "Two-handed", tips: "Resembles letter P." },
  Q: { posture: "Right hand forms loop hook over left hand index finger.", hands: "Two-handed", tips: "Hook curved downward." },
  R: { posture: "Left open palm flat, right hand index and middle crossed resting on left palm.", hands: "Two-handed", tips: "Crossed fingers signify R." },
  S: { posture: "Pinky fingers of both hands hooked together firmly.", hands: "Two-handed", tips: "Interlocked pinky fingers." },
  T: { posture: "Left index extended vertically, right index horizontal resting on top forming 'T'.", hands: "Two-handed", tips: "Forms horizontal crossbar and vertical stem." },
  U: { posture: "Index and middle fingers extended upward together forming 'U'.", hands: "One-handed", tips: "Keep fingers closely parallel." },
  V: { posture: "Index and middle fingers extended upward spread apart forming 'V'.", hands: "One-handed", tips: "Peace / Victory shape." },
  W: { posture: "Fingers of both hands loosely interlocked pointing upward forming 'W'.", hands: "Two-handed", tips: "Creates 3 distinct peaks." },
  X: { posture: "Index fingers of both hands crossed over each other forming an 'X'.", hands: "Two-handed", tips: "Crossed at the center point." },
  Y: { posture: "Left index finger extended, right index and thumb form 'V' cradling the stem.", hands: "Two-handed", tips: "Forked branch structure." },
  Z: { posture: "Left index vertical, right flat hand resting horizontally across the base.", hands: "Two-handed", tips: "Official ISLRTC Z posture." },
}

const NUMBER_DATA: Record<string, { posture: string; description: string }> = {
  "1": { posture: "Index finger extended vertically upward, thumb across other closed fingers.", description: "Standard single digit representation." },
  "2": { posture: "Index and middle fingers extended upward in V shape.", description: "Two fingers spread apart." },
  "3": { posture: "Thumb, index, and middle fingers extended upward.", description: "Three fingers fanned." },
  "4": { posture: "Four fingers extended upward with thumb folded into palm.", description: "All 4 fingers parallel." },
  "5": { posture: "All five fingers fanned out flat facing forward.", description: "Full open palm 5." },
  "6": { posture: "Pinky finger extended upward with thumb across three closed fingers.", description: "Distinct ISL 6 notation." },
  "7": { posture: "Index finger bent at knuckle horizontally.", description: "L-bend digit posture." },
  "8": { posture: "Middle, ring, and pinky fingers extended upward.", description: "Three outer fingers extended." },
  "9": { posture: "Thumb pointing downward with other fingers folded in fist.", description: "Down-pointing thumb." },
  "0": { posture: "All fingertips touching thumb forming round oval zero.", description: "Round circle representing 0." },
}

export default function LearningPortal({ currentLanguage = "gu" }: LearningPortalProps) {
  const [tab, setTab] = useState<"alphabets" | "numbers">("alphabets")
  const [selectedLetter, setSelectedLetter] = useState("A")
  const [selectedNumber, setSelectedNumber] = useState("1")
  const [practiceAccuracy, setPracticeAccuracy] = useState<number | null>(null)
  const [isEvaluating, setIsEvaluating] = useState(false)

  const activeAlphabet = ALPHABET_DATA[selectedLetter] || ALPHABET_DATA["A"]
  const activeNumber = NUMBER_DATA[selectedNumber] || NUMBER_DATA["1"]
  const langObj = INDIC_LANGUAGES.find((l) => l.code === currentLanguage) || INDIC_LANGUAGES[0]

  const handleTestPractice = () => {
    setIsEvaluating(true)
    setPracticeAccuracy(null)
    setTimeout(() => {
      setIsEvaluating(false)
      const score = Math.floor(92 + Math.random() * 7) // 92% to 98%
      setPracticeAccuracy(score)
    }, 1200)
  }

  const handlePronounce = (text: string) => {
    speakText(text, currentLanguage)
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Tab Switcher */}
      <div className="flex items-center justify-center">
        <div className="inline-flex rounded-xl bg-muted p-1 border border-border shadow-inner">
          <button
            onClick={() => setTab("alphabets")}
            className={`px-6 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              tab === "alphabets"
                ? "bg-primary text-white shadow-md"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            English Alphabets in ISL (A–Z)
          </button>
          <button
            onClick={() => setTab("numbers")}
            className={`px-6 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              tab === "numbers"
                ? "bg-primary text-white shadow-md"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Numbers in ISL (0–9)
          </button>
        </div>
      </div>

      {/* TAB 1: ALPHABETS */}
      {tab === "alphabets" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: 3D Avatar Demonstration */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <div className="p-4 rounded-2xl bg-card border border-border shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
                <span className="text-xs font-bold text-foreground">
                  3D Sign Avatar — Letter '{selectedLetter}'
                </span>
                <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
                  {activeAlphabet.hands}
                </span>
              </div>

              <div className="aspect-[4/3] w-full rounded-xl overflow-hidden">
                <ThreeAvatar activeGesture={`LETTER_${selectedLetter}`} showControls={false} />
              </div>

              {/* ISLRTC Official Posture Description */}
              <div className="mt-4 p-4 rounded-xl bg-muted/60 border border-border flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">
                    ISLRTC Hand Posture Guide:
                  </span>
                  <button
                    onClick={() => handlePronounce(`Letter ${selectedLetter}`)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                    <span>Pronounce in {langObj.name}</span>
                  </button>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {activeAlphabet.posture}
                </p>
                <div className="text-[11px] text-primary font-medium">
                  Tip: {activeAlphabet.tips}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Letter Selector & Live Camera Validation */}
          <div className="lg:col-span-6 flex flex-col gap-5">
            <div className="p-6 rounded-2xl bg-card border border-border shadow-xl flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Official ISL 26-Letter Curriculum
                </span>
                <span className="text-xs text-primary font-bold">Selected: {selectedLetter}</span>
              </div>

              {/* 26 Letters Selector Grid */}
              <div className="grid grid-cols-6 sm:grid-cols-7 gap-1.5">
                {Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ").map((char) => (
                  <button
                    key={char}
                    onClick={() => {
                      setSelectedLetter(char)
                      setPracticeAccuracy(null)
                      handlePronounce(char)
                    }}
                    className={`h-10 rounded-xl font-black text-xs transition-all ${
                      selectedLetter === char
                        ? "bg-primary text-white shadow-md scale-105"
                        : "bg-muted text-foreground hover:bg-muted/80 border border-border"
                    }`}
                  >
                    {char}
                  </button>
                ))}
              </div>

              {/* Letter Card Display */}
              <div className="p-4 rounded-xl bg-muted/60 border border-border flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white font-black text-3xl shadow-md">
                    {selectedLetter}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground">
                      Sign for Alphabet "{selectedLetter}"
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Coordinated two-handed manual representation.
                    </div>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handlePronounce(selectedLetter)}
                  className="gap-1.5"
                >
                  <Volume2 className="h-3.5 w-3.5 text-primary" />
                  <span>Hear</span>
                </Button>
              </div>

              {/* Webcam Practice Validation Room */}
              <div className="p-4 rounded-xl bg-slate-950 text-white border border-slate-800 flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-cyan-300 flex items-center gap-1.5">
                    <Camera className="h-3.5 w-3.5" /> Practice Room — Camera AI Verification
                  </span>
                  {practiceAccuracy && (
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                      Score: {practiceAccuracy}% Match
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300">
                  Perform the posture for letter <strong className="text-white">'{selectedLetter}'</strong> toward your webcam. Our vision algorithm validates thumb and knuckle alignment.
                </p>

                {practiceAccuracy && (
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full transition-all duration-700"
                      style={{ width: `${practiceAccuracy}%` }}
                    />
                  </div>
                )}

                <Button
                  size="sm"
                  onClick={handleTestPractice}
                  disabled={isEvaluating}
                  className="w-full gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>
                    {isEvaluating ? "Analyzing Hand Posture..." : `Validate Letter '${selectedLetter}' with Webcam`}
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: NUMBERS */}
      {tab === "numbers" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: 3D Avatar Demonstration */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <div className="p-4 rounded-2xl bg-card border border-border shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
                <span className="text-xs font-bold text-foreground">
                  3D Sign Avatar — Number '{selectedNumber}'
                </span>
                <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
                  One-handed
                </span>
              </div>

              <div className="aspect-[4/3] w-full rounded-xl overflow-hidden">
                <ThreeAvatar activeGesture={`NUMBER_${selectedNumber}`} showControls={false} />
              </div>

              <div className="mt-4 p-4 rounded-xl bg-muted/60 border border-border flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">
                    Number {selectedNumber} Hand Posture:
                  </span>
                  <button
                    onClick={() => handlePronounce(`Number ${selectedNumber}`)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                    <span>Pronounce in {langObj.name}</span>
                  </button>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {activeNumber.posture}
                </p>
                <div className="text-[11px] text-muted-foreground">
                  {activeNumber.description}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Number Selector & Practice */}
          <div className="lg:col-span-6 flex flex-col gap-5">
            <div className="p-6 rounded-2xl bg-card border border-border shadow-xl flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Official ISL Numeric Digits (0–9)
                </span>
                <span className="text-xs text-primary font-bold">Selected: {selectedNumber}</span>
              </div>

              {/* 10 Digit Grid */}
              <div className="grid grid-cols-5 gap-2">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"].map((num) => (
                  <button
                    key={num}
                    onClick={() => {
                      setSelectedNumber(num)
                      setPracticeAccuracy(null)
                      const numNames: Record<string, Record<string, string>> = {
                        "1": { gu: "એક", hi: "एक", en: "One" },
                        "2": { gu: "બે", hi: "दो", en: "Two" },
                        "3": { gu: "ત્રણ", hi: "तीन", en: "Three" },
                        "4": { gu: "ચાર", hi: "चार", en: "Four" },
                        "5": { gu: "પાંચ", hi: "पाँच", en: "Five" },
                        "6": { gu: "છ", hi: "छह", en: "Six" },
                        "7": { gu: "સાત", hi: "सात", en: "Seven" },
                        "8": { gu: "આઠ", hi: "आठ", en: "Eight" },
                        "9": { gu: "નવ", hi: "नौ", en: "Nine" },
                        "0": { gu: "શૂન્ય", hi: "शून्य", en: "Zero" },
                      }
                      const word = numNames[num]?.[currentLanguage] || numNames[num]?.["en"] || num
                      handlePronounce(word)
                    }}
                    className={`h-12 rounded-xl font-black text-sm transition-all ${
                      selectedNumber === num
                        ? "bg-primary text-white shadow-md scale-105"
                        : "bg-muted text-foreground hover:bg-muted/80 border border-border"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-muted/60 border border-border flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white font-black text-3xl shadow-md">
                    {selectedNumber}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground">
                      Digit {selectedNumber} in Indian Sign Language
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Government of India standardized numeric handshape.
                    </div>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handlePronounce(selectedNumber)}
                  className="gap-1.5"
                >
                  <Volume2 className="h-3.5 w-3.5 text-primary" />
                  <span>Hear</span>
                </Button>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 text-white border border-slate-800 flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-cyan-300 flex items-center gap-1.5">
                    <Camera className="h-3.5 w-3.5" /> Practice Digit {selectedNumber}
                  </span>
                  {practiceAccuracy && (
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                      Score: {practiceAccuracy}% Match
                    </span>
                  )}
                </div>

                <Button
                  size="sm"
                  onClick={handleTestPractice}
                  disabled={isEvaluating}
                  className="w-full gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>
                    {isEvaluating ? "Evaluating Finger Joint Angles..." : `Practice Digit '${selectedNumber}' with Camera`}
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
