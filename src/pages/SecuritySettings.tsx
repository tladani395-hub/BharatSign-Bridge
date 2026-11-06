import React, { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import {
  ShieldCheck,
  Lock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  KeyRound,
  Eye,
  EyeOff,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuthAndTheme } from "@/context/AuthAndThemeContext"

interface QuestionOption {
  id: string
  label: string
}

export default function SecuritySettings() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthAndTheme()

  const [questions, setQuestions] = useState<QuestionOption[]>([])
  const [currentQ1Label, setCurrentQ1Label] = useState<string | null>(null)
  const [currentQ2Label, setCurrentQ2Label] = useState<string | null>(null)

  // Form state
  const [currentPassword, setCurrentPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)

  const [question1Id, setQuestion1Id] = useState("")
  const [answer1, setAnswer1] = useState("")
  const [showAnswer1, setShowAnswer1] = useState(false)

  const [question2Id, setQuestion2Id] = useState("")
  const [answer2, setAnswer2] = useState("")
  const [showAnswer2, setShowAnswer2] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [hasErrorShake, setHasErrorShake] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const triggerError = (msg: string) => {
    setErrorMsg(msg)
    setHasErrorShake(true)
    setTimeout(() => setHasErrorShake(false), 450)
  }

  // Load questions and current user status
  useEffect(() => {
    const loadData = async () => {
      try {
        const [qRes, sRes] = await Promise.all([
          fetch("http://127.0.0.1:8000/api/auth/security-questions/list"),
          fetch(`http://127.0.0.1:8000/api/auth/security-questions/status?user_id=${user?.id || ""}&email=${encodeURIComponent(user?.email || "")}`)
        ])

        const qData = await qRes.json()
        const sData = await sRes.json()

        if (qData.questions) {
          setQuestions(qData.questions)
          setQuestion1Id(sData.question_1_id || qData.questions[0].id)
          setQuestion2Id(sData.question_2_id || qData.questions[1].id)
        }

        if (sData.has_security_questions) {
          setCurrentQ1Label(sData.question_1_label)
          setCurrentQ2Label(sData.question_2_label)
        }
      } catch (err) {
        console.error("Error loading security settings:", err)
      }
    }

    if (user?.id || user?.email) {
      loadData()
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)

    if (!currentPassword) {
      triggerError("Please enter your current password to verify your identity.")
      return
    }

    if (question1Id === question2Id) {
      triggerError("Please select two different security questions.")
      return
    }

    const cleanAns1 = answer1.trim()
    const cleanAns2 = answer2.trim()

    if (!cleanAns1 || !cleanAns2) {
      triggerError("Both security answers are required.")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("http://127.0.0.1:8000/api/auth/security-questions/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user?.id || "",
          email: user?.email || "",
          current_password: currentPassword,
          question_1_id: question1Id,
          answer_1: cleanAns1,
          question_2_id: question2Id,
          answer_2: cleanAns2,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.detail || "Unable to update security questions.")
      }

      setSuccessMsg("Security questions and answers updated successfully!")
      setCurrentPassword("")
      setAnswer1("")
      setAnswer2("")

      // Update current labels
      const q1 = questions.find((q) => q.id === question1Id)
      const q2 = questions.find((q) => q.id === question2Id)
      if (q1) setCurrentQ1Label(q1.label)
      if (q2) setCurrentQ2Label(q2.label)
    } catch (err: any) {
      triggerError(err.message || "Failed to update security questions.")
    } finally {
      setSubmitting(false)
    }
  }

  if (!isAuthenticated && !user) {
    return (
      <div className="min-h-screen font-body flex items-center justify-center p-4">
        <div className="p-8 rounded-2xl bg-card border border-border text-center max-w-sm flex flex-col gap-4">
          <Lock className="w-10 h-10 text-primary mx-auto" />
          <h2 className="text-lg font-bold">Authentication Required</h2>
          <p className="text-xs text-muted-foreground">Please sign in to manage your security questions.</p>
          <Button onClick={() => navigate("/login")} className="w-full">
            Sign In
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen font-body bg-[#eceff8] dark:bg-[#060914] text-[#0e1430] dark:text-[#eef1ff] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden transition-colors duration-300">
      <div className="w-full max-w-2xl relative z-10 animate-card-entrance">
        <div className="rounded-[28px] bg-white dark:bg-[#0e1328] border border-black/[0.08] dark:border-white/[0.08] shadow-2xl p-7 sm:p-9 flex flex-col gap-6">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#e2e8f0] dark:border-[#1e2747] pb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#2f4bff]/10 border border-[#2f4bff]/25 flex items-center justify-center text-[#2f4bff]">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-heading font-extrabold text-xl text-[#0e1430] dark:text-[#eef1ff]">
                  Security Questions
                </h1>
                <p className="text-xs text-[#586082] dark:text-[#828bb4]">
                  Manage recovery questions used to reset your password if you forget it.
                </p>
              </div>
            </div>
            <Link
              to="/settings"
              className="text-xs font-bold text-[#586082] dark:text-[#828bb4] hover:text-[#0e1430] dark:hover:text-white"
            >
              ← Back to Settings
            </Link>
          </div>

          {/* Current Configured Questions Card */}
          {currentQ1Label && currentQ2Label && (
            <div className="p-4 rounded-2xl bg-[#f3f5fb] dark:bg-[#151b36] border border-[#d8e0f2] dark:border-[#222b4a] flex flex-col gap-2.5">
              <span className="text-[11px] font-bold text-[#10b981] flex items-center gap-1.5 uppercase tracking-wider">
                <ShieldCheck className="h-4 w-4" /> Currently Configured Recovery Questions:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-white dark:bg-[#0e1328] border border-border/40">
                  <span className="text-[10px] text-muted-foreground font-semibold block">Question 1:</span>
                  <span className="font-bold text-[#0e1430] dark:text-[#eef1ff]">{currentQ1Label}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-[#0e1328] border border-border/40">
                  <span className="text-[10px] text-muted-foreground font-semibold block">Question 2:</span>
                  <span className="font-bold text-[#0e1430] dark:text-[#eef1ff]">{currentQ2Label}</span>
                </div>
              </div>
              <p className="text-[11px] text-[#586082] dark:text-[#828bb4]">
                Answers are securely hashed with salted bcrypt and never shown for your protection.
              </p>
            </div>
          )}

          {/* Feedback Alerts */}
          {errorMsg && (
            <div
              className={`p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2 ${
                hasErrorShake ? "animate-field-shake" : ""
              }`}
            >
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form to Update */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Current Password Verification */}
            <div className="flex flex-col gap-1.5 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25">
              <Label htmlFor="curr-pwd" className="text-xs font-bold text-[#b45309] dark:text-[#ffb23e]">
                Verify Current Password (Required to Make Changes)
              </Label>
              <div className="relative">
                <Lock className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="curr-pwd"
                  type={showCurrentPassword ? "text" : "password"}
                  required
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value)
                    setErrorMsg(null)
                  }}
                  placeholder="Enter current password"
                  className="pl-9 pr-10 h-10 rounded-xl bg-white dark:bg-[#0e1328] border-border text-xs font-semibold"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Question 1 Selection & Answer */}
            <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-[#f3f5fb] dark:bg-[#151b36] border border-[#d8e0f2] dark:border-[#222b4a]">
              <Label htmlFor="q1-select" className="text-xs font-bold text-[#0e1430] dark:text-[#eef1ff]">
                New Question 1
              </Label>
              <select
                id="q1-select"
                value={question1Id}
                onChange={(e) => setQuestion1Id(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-white dark:bg-[#0e1328] border border-[#d8e0f2] dark:border-[#2a3458] text-xs font-semibold text-[#0e1430] dark:text-[#eef1ff] focus:outline-none focus:ring-2 focus:ring-[#2f4bff]"
              >
                {questions.map((q) => (
                  <option key={q.id} value={q.id} disabled={q.id === question2Id}>
                    {q.label} {q.id === question2Id ? "(Selected as Question 2)" : ""}
                  </option>
                ))}
              </select>

              <div className="relative mt-1">
                <Input
                  type={showAnswer1 ? "text" : "password"}
                  required
                  value={answer1}
                  onChange={(e) => {
                    setAnswer1(e.target.value)
                    setErrorMsg(null)
                  }}
                  placeholder="Enter new answer for Question 1"
                  className="pr-10 h-10 rounded-xl bg-white dark:bg-[#0e1328] border-[#d8e0f2] dark:border-[#2a3458] text-xs font-semibold focus:ring-2 focus:ring-[#2f4bff]"
                />
                <button
                  type="button"
                  onClick={() => setShowAnswer1(!showAnswer1)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                >
                  {showAnswer1 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Question 2 Selection & Answer */}
            <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-[#f3f5fb] dark:bg-[#151b36] border border-[#d8e0f2] dark:border-[#222b4a]">
              <Label htmlFor="q2-select" className="text-xs font-bold text-[#0e1430] dark:text-[#eef1ff]">
                New Question 2
              </Label>
              <select
                id="q2-select"
                value={question2Id}
                onChange={(e) => setQuestion2Id(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-white dark:bg-[#0e1328] border border-[#d8e0f2] dark:border-[#2a3458] text-xs font-semibold text-[#0e1430] dark:text-[#eef1ff] focus:outline-none focus:ring-2 focus:ring-[#2f4bff]"
              >
                {questions.map((q) => (
                  <option key={q.id} value={q.id} disabled={q.id === question1Id}>
                    {q.label} {q.id === question1Id ? "(Selected as Question 1)" : ""}
                  </option>
                ))}
              </select>

              <div className="relative mt-1">
                <Input
                  type={showAnswer2 ? "text" : "password"}
                  required
                  value={answer2}
                  onChange={(e) => {
                    setAnswer2(e.target.value)
                    setErrorMsg(null)
                  }}
                  placeholder="Enter new answer for Question 2"
                  className="pr-10 h-10 rounded-xl bg-white dark:bg-[#0e1328] border-[#d8e0f2] dark:border-[#2a3458] text-xs font-semibold focus:ring-2 focus:ring-[#2f4bff]"
                />
                <button
                  type="button"
                  onClick={() => setShowAnswer2(!showAnswer2)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                >
                  {showAnswer2 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitting || !currentPassword || !answer1.trim() || !answer2.trim()}
              className="w-full h-11 text-xs font-bold rounded-[14px] bg-gradient-to-r from-[#2f4bff] to-[#1fa2ff] text-white shadow-lg shadow-[#2f4bff]/20 mt-2 btn-sheen hover:-translate-y-0.5 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Verifying Password & Updating...</span>
                </>
              ) : (
                <>
                  <span>Save Security Questions</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
