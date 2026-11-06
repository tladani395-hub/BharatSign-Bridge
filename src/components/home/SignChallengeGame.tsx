import { useState, useEffect } from "react"
import { Trophy, Timer, Flame, RefreshCw, Zap, Award } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ChallengeQuestion {
  id: string
  signVisual: string
  correctAnswer: string
  options: string[]
  explanation: string
  emoji: string
}

const QUESTIONS: ChallengeQuestion[] = [
  {
    id: "q1",
    signVisual: "🙏",
    emoji: "🙏",
    correctAnswer: "Namaste / Greeting",
    options: ["Namaste / Greeting", "Help Me", "Thank You", "Water"],
    explanation: "Two palms pressed flat together at chest level represents Namaste in ISL.",
  },
  {
    id: "q2",
    signVisual: "✌️",
    emoji: "✌️",
    correctAnswer: "Number 2 (Two)",
    options: ["Number 2 (Two)", "Letter V", "Number 3", "Peace"],
    explanation: "MSJE ISL Standard: Index and Middle extended in V-shape stands for Number 2.",
  },
  {
    id: "q3",
    signVisual: "🤟",
    emoji: "🤟",
    correctAnswer: "I Love You",
    options: ["I Love You", "Rock Music", "Number 3", "Telephone"],
    explanation: "Thumb, index, and pinky extended simultaneously forms the universal 'I Love You'.",
  },
  {
    id: "q4",
    signVisual: "☝️",
    emoji: "☝️",
    correctAnswer: "Number 1 (One)",
    options: ["Number 1 (One)", "Letter D", "Pointing Sky", "Stop"],
    explanation: "Index finger extended vertically upright represents Number 1 under MSJE standard.",
  },
  {
    id: "q5",
    signVisual: "🖐️",
    emoji: "🖐️",
    correctAnswer: "Number 5 (Five)",
    options: ["Number 5 (Five)", "Stop", "Goodbye", "Open Hand"],
    explanation: "All five fingers extended with palm forward represents Number 5.",
  },
  {
    id: "q6",
    signVisual: "🤙",
    emoji: "🤙",
    correctAnswer: "Letter Y",
    options: ["Letter Y", "Call Me", "Number 6", "Water"],
    explanation: "ISLRTC single-handed alphabet: Thumb and pinky extended with 3 fingers curled is Letter Y.",
  },
]

export default function SignChallengeGame() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isFinished, setIsFinished] = useState(false)

  const currentQ = QUESTIONS[currentIndex % QUESTIONS.length]

  // Timer Countdown
  useEffect(() => {
    if (!isPlaying || isFinished) return
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setIsFinished(true)
          setIsPlaying(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [isPlaying, isFinished])

  const startGame = () => {
    setScore(0)
    setStreak(0)
    setCurrentIndex(0)
    setTimeLeft(30)
    setIsAnswered(false)
    setSelectedOption(null)
    setIsFinished(false)
    setIsPlaying(true)
  }

  const handleSelectOption = (option: string) => {
    if (isAnswered || !isPlaying) return
    setSelectedOption(option)
    setIsAnswered(true)

    if (option === currentQ.correctAnswer) {
      const addedPoints = 100 + streak * 20
      setScore((prev) => prev + addedPoints)
      setStreak((prev) => prev + 1)
    } else {
      setStreak(0)
    }

    setTimeout(() => {
      if (currentIndex + 1 >= QUESTIONS.length) {
        setIsFinished(true)
        setIsPlaying(false)
      } else {
        setCurrentIndex((prev) => prev + 1)
        setIsAnswered(false)
        setSelectedOption(null)
      }
    }, 1100)
  }

  return (
    <div className="rounded-3xl bg-gradient-to-br from-card via-card/90 to-background border border-primary/30 p-6 shadow-2xl relative overflow-hidden backdrop-blur-xl">
      {/* Background Accent Glows */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-border text-xs relative z-10">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-foreground text-sm">30-Second ISL Speed Quiz</h3>
            <p className="text-[11px] text-muted-foreground">Test your Indian Sign Language reflexes</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isPlaying && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 font-mono font-bold text-xs">
              <Timer className="h-3.5 w-3.5 animate-spin" />
              <span>{timeLeft}s</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary font-mono font-bold text-xs">
            <Trophy className="h-3.5 w-3.5 text-amber-400" />
            <span>{score} PTS</span>
          </div>

          {streak > 1 && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 font-bold text-xs animate-bounce">
              <Flame className="h-3.5 w-3.5" />
              <span>{streak}x STREAK</span>
            </div>
          )}
        </div>
      </div>

      {/* Game Content */}
      {!isPlaying && !isFinished ? (
        <div className="py-12 flex flex-col items-center text-center gap-5 relative z-10">
          <div className="h-20 w-20 rounded-3xl bg-gradient-to-tr from-primary to-cyan-400 text-white flex items-center justify-center text-4xl shadow-xl animate-float">
            🤟
          </div>
          <div className="space-y-1.5 max-w-sm">
            <h4 className="text-xl font-black text-foreground">Can You Recognize ISL Signs?</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Challenge yourself with real ISLRTC and MSJE standardized sign handshapes. Score points and build streaks!
            </p>
          </div>
          <Button
            onClick={startGame}
            className="gap-2 bg-gradient-to-r from-primary to-cyan-500 text-white font-extrabold h-11 px-8 shadow-lg hover:shadow-cyan-500/25 active:scale-95"
          >
            <Zap className="h-4 w-4" />
            <span>Start Speed Challenge</span>
          </Button>
        </div>
      ) : isFinished ? (
        <div className="py-10 flex flex-col items-center text-center gap-5 relative z-10">
          <div className="h-20 w-20 rounded-3xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center text-3xl shadow-xl">
            <Award className="h-10 w-10 animate-bounce" />
          </div>
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Challenge Completed!</span>
            <h4 className="text-3xl font-black text-foreground">{score} Points</h4>
            <p className="text-xs text-muted-foreground">
              {score >= 400
                ? "Incredible! You have expert ISL gesture recognition!"
                : score >= 200
                ? "Great job! You know your core Indian Sign Language!"
                : "Good attempt! Visit the Learning Portal to master all 26 alphabets!"}
            </p>
          </div>
          <Button onClick={startGame} className="gap-2 bg-primary text-white font-bold h-10 px-6">
            <RefreshCw className="h-4 w-4" />
            <span>Play Again</span>
          </Button>
        </div>
      ) : (
        <div className="py-6 flex flex-col gap-6 relative z-10">
          {/* Question Card */}
          <div className="flex flex-col items-center gap-3">
            <span className="text-xs font-mono text-muted-foreground">
              Question {currentIndex + 1} of {QUESTIONS.length}
            </span>
            <div className="h-28 w-28 rounded-3xl bg-slate-900 border border-primary/40 flex items-center justify-center text-6xl shadow-2xl animate-pulse-glow">
              {currentQ.signVisual}
            </div>
            <span className="text-sm font-bold text-foreground">
              What does this Indian Sign Language gesture mean?
            </span>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {currentQ.options.map((opt) => {
              const isSelected = selectedOption === opt
              const isCorrect = isAnswered && opt === currentQ.correctAnswer
              const isWrong = isAnswered && isSelected && opt !== currentQ.correctAnswer

              return (
                <button
                  key={opt}
                  onClick={() => handleSelectOption(opt)}
                  disabled={isAnswered}
                  className={`p-3.5 rounded-2xl text-xs font-bold text-left transition-all border flex items-center justify-between ${
                    isCorrect
                      ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 scale-[1.02]"
                      : isWrong
                      ? "bg-red-500/20 border-red-500 text-red-400"
                      : "bg-muted/60 hover:bg-muted border-border hover:border-primary/40 text-foreground"
                  }`}
                >
                  <span>{opt}</span>
                  {isCorrect && <span className="text-xs">✓ Correct</span>}
                  {isWrong && <span className="text-xs">✗ Incorrect</span>}
                </button>
              )
            })}
          </div>

          {isAnswered && (
            <div className="text-center text-xs text-muted-foreground bg-muted/30 p-2.5 rounded-xl border border-border/60">
              💡 {currentQ.explanation}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
