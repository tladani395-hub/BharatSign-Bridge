import { useState } from "react"
import { Link } from "react-router-dom"
import {
  Award,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ChevronRight,
  HelpCircle,
} from "lucide-react"
import ThreeAvatar from "@/components/avatar/ThreeAvatar"
import Breadcrumbs from "@/components/layout/Breadcrumbs"
import { Button } from "@/components/ui/button"

interface QuizQuestion {
  id: number
  type: "alphabet" | "number" | "word"
  gesture: string
  correctAnswer: string
  options: string[]
  explanation: string
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    type: "alphabet",
    gesture: "LETTER_A",
    correctAnswer: "A",
    options: ["A", "E", "S", "T"],
    explanation:
      "Letter A uses both hands: the left open palm is held upright while the right index finger touches the tip of the left thumb.",
  },
  {
    id: 2,
    type: "number",
    gesture: "NUMBER_6",
    correctAnswer: "6",
    options: ["1", "6", "9", "4"],
    explanation:
      "In Indian Sign Language, the digit 6 is distinctively represented by extending only the pinky finger upward while others are folded.",
  },
  {
    id: 3,
    type: "alphabet",
    gesture: "LETTER_B",
    correctAnswer: "B",
    options: ["B", "D", "P", "F"],
    explanation:
      "Letter B forms two circles: index and thumb of both hands touch tips to form two circular loops stacked vertically.",
  },
  {
    id: 4,
    type: "word",
    gesture: "NAMASTE",
    correctAnswer: "Namaste / Pranam",
    options: ["Namaste / Pranam", "Thank You", "Water", "Hello"],
    explanation:
      "Namaste is signed with both open flat palms pressed together at chest level in Anjali Mudra with a slight forward bow.",
  },
  {
    id: 5,
    type: "number",
    gesture: "NUMBER_9",
    correctAnswer: "9",
    options: ["5", "9", "0", "7"],
    explanation:
      "In ISL standard numeric system, digit 9 is represented by pointing the thumb straight downward from a closed fist.",
  },
  {
    id: 6,
    type: "alphabet",
    gesture: "LETTER_C",
    correctAnswer: "C",
    options: ["C", "O", "G", "Q"],
    explanation:
      "Letter C is one-handed: the dominant hand curves its fingers into a clear C-arc facing outward.",
  },
  {
    id: 7,
    type: "word",
    gesture: "HELLO",
    correctAnswer: "Hello / Greeting",
    options: ["Student", "Hello / Greeting", "Help", "Yes"],
    explanation:
      "Hello is signed with an open B-handshape near the temple waving outward with a friendly smile.",
  },
]

export default function Quizzes() {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [quizFinished, setQuizFinished] = useState(false)

  const currentQ = QUIZ_QUESTIONS[currentIdx]

  const handleSelectOption = (opt: string) => {
    if (hasSubmitted) return
    setSelectedOption(opt)
  }

  const handleSubmitAnswer = () => {
    if (!selectedOption || hasSubmitted) return
    setHasSubmitted(true)
    if (selectedOption === currentQ.correctAnswer) {
      setScore((s) => s + 1)
      setStreak((st) => st + 1)
    } else {
      setStreak(0)
    }
  }

  const handleNext = () => {
    if (currentIdx < QUIZ_QUESTIONS.length - 1) {
      setCurrentIdx((prev) => prev + 1)
      setSelectedOption(null)
      setHasSubmitted(false)
    } else {
      setQuizFinished(true)
    }
  }

  const handleRestart = () => {
    setCurrentIdx(0)
    setSelectedOption(null)
    setHasSubmitted(false)
    setScore(0)
    setStreak(0)
    setQuizFinished(false)
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-8">
      <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs
          items={[
            { label: "Learning Portal", href: "/learn" },
            { label: "Interactive Quizzes" },
          ]}
        />

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-500 border border-amber-500/20 mb-2">
              <Award className="h-3.5 w-3.5" />
              <span>ISLRTC Certified Sign Challenge</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-foreground">
              ISL Sign Recognition Quiz
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Watch the 3D human presenter perform the sign, then identify the correct letter, number, or vocabulary meaning.
            </p>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <div className="px-3 py-1.5 rounded-xl bg-card border border-border text-xs flex items-center gap-2">
              <span className="text-muted-foreground">Score:</span>
              <span className="font-black text-foreground">{score} / {QUIZ_QUESTIONS.length}</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-amber-950/30 border border-amber-800/40 text-xs flex items-center gap-1.5 text-amber-400 font-bold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Streak: {streak}</span>
            </div>
          </div>
        </div>

        {!quizFinished ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Left: 3D Presenter Showing Question Sign */}
            <div className="md:col-span-6 flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs px-1">
                <span className="font-bold text-foreground">
                  Question {currentIdx + 1} of {QUIZ_QUESTIONS.length}
                </span>
                <span className="text-xs uppercase font-mono text-cyan-400">
                  Category: {currentQ.type}
                </span>
              </div>

              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-950 border border-border shadow-xl relative">
                <ThreeAvatar
                  activeGesture={currentQ.gesture}
                  signingSpeed={0.8}
                  showControls={false}
                  initialCameraView="hands"
                />
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white border border-white/10 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span>Observe Avatar Sign</span>
                </div>
              </div>
            </div>

            {/* Right: Answer Options & Explanations */}
            <div className="md:col-span-6 flex flex-col gap-4">
              <div className="p-5 rounded-2xl bg-card border border-border shadow-sm flex flex-col gap-4">
                <h2 className="text-base font-bold text-foreground">
                  What sign is the 3D presenter demonstrating?
                </h2>

                <div className="grid grid-cols-1 gap-2.5">
                  {currentQ.options.map((opt) => {
                    const isSelected = selectedOption === opt
                    let btnStyle = "bg-muted/60 border-border text-foreground hover:bg-muted"

                    if (hasSubmitted) {
                      if (opt === currentQ.correctAnswer) {
                        btnStyle = "bg-emerald-950/40 border-emerald-600 text-emerald-300 font-bold"
                      } else if (isSelected && opt !== currentQ.correctAnswer) {
                        btnStyle = "bg-rose-950/40 border-rose-600 text-rose-300 font-bold"
                      } else {
                        btnStyle = "bg-muted/40 border-border/40 text-muted-foreground opacity-50"
                      }
                    } else if (isSelected) {
                      btnStyle = "bg-primary/20 border-primary text-primary font-bold shadow-sm"
                    }

                    return (
                      <button
                        key={opt}
                        onClick={() => handleSelectOption(opt)}
                        disabled={hasSubmitted}
                        className={`p-3.5 rounded-xl border text-left text-sm flex items-center justify-between transition-all ${btnStyle}`}
                      >
                        <span>{opt}</span>
                        {hasSubmitted && opt === currentQ.correctAnswer && (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        )}
                        {hasSubmitted && isSelected && opt !== currentQ.correctAnswer && (
                          <XCircle className="h-4 w-4 text-rose-400" />
                        )}
                      </button>
                    )
                  })}
                </div>

                {!hasSubmitted ? (
                  <Button
                    onClick={handleSubmitAnswer}
                    disabled={!selectedOption}
                    className="w-full mt-2 text-xs font-bold bg-primary hover:bg-primary/90 text-white shadow-md"
                  >
                    Submit Answer
                  </Button>
                ) : (
                  <div className="flex flex-col gap-3 pt-2">
                    <div
                      className={`p-3.5 rounded-xl text-xs leading-relaxed border ${
                        selectedOption === currentQ.correctAnswer
                          ? "bg-emerald-950/20 border-emerald-800 text-emerald-300"
                          : "bg-rose-950/20 border-rose-800 text-rose-300"
                      }`}
                    >
                      <div className="font-bold flex items-center gap-1.5 mb-1">
                        <HelpCircle className="h-3.5 w-3.5" />
                        <span>Linguistic Explanation:</span>
                      </div>
                      <p className="opacity-95">{currentQ.explanation}</p>
                    </div>

                    <Button
                      onClick={handleNext}
                      className="w-full text-xs font-bold bg-gradient-to-r from-primary to-cyan-600 hover:from-primary/90 text-white shadow-md gap-2"
                    >
                      <span>
                        {currentIdx < QUIZ_QUESTIONS.length - 1 ? "Next Question" : "View Results"}
                      </span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Quiz Results Celebration Card */
          <div className="rounded-3xl bg-card border border-border p-8 shadow-2xl flex flex-col items-center text-center max-w-xl mx-auto gap-6 animate-in zoom-in-95">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center shadow-xl">
              <Award className="h-10 w-10" />
            </div>

            <div>
              <h2 className="text-2xl font-black text-foreground">Quiz Completed!</h2>
              <p className="text-sm text-muted-foreground mt-1">
                You scored{" "}
                <strong className="text-foreground font-bold">
                  {score} out of {QUIZ_QUESTIONS.length}
                </strong>{" "}
                ({Math.round((score / QUIZ_QUESTIONS.length) * 100)}%)
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={handleRestart}
                variant="outline"
                className="gap-2 text-xs font-bold"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Retry Quiz</span>
              </Button>
              <Link to="/learn">
                <Button className="gap-2 text-xs font-bold bg-primary hover:bg-primary/90 text-white shadow-md">
                  <span>Back to Learning Portal</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
