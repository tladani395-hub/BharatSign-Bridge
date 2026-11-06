import React, { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import {
  ShieldCheck,
  Lock,
  ArrowRight,
  HelpCircle,
  AlertCircle,
  RefreshCw,
  Sparkles,
  KeyRound,
  Eye,
  EyeOff,
} from "lucide-react"
import Logo from "@/components/brand/Logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuthAndTheme } from "@/context/AuthAndThemeContext"
import { API_BASE_URL } from "@/config/api"

interface QuestionOption {
  id: string
  label: string
}

export default function SecuritySetup() {
  const navigate = useNavigate()
  const { user, login } = useAuthAndTheme()

  const [questions, setQuestions] = useState<QuestionOption[]>([])
  const [loadingQuestions, setLoadingQuestions] = useState(true)

  const [question1Id, setQuestion1Id] = useState("")
  const [answer1, setAnswer1] = useState("")
  const [showAnswer1, setShowAnswer1] = useState(false)

  const [question2Id, setQuestion2Id] = useState("")
  const [answer2, setAnswer2] = useState("")
  const [showAnswer2, setShowAnswer2] = useState(false)

  const [currentPassword, setCurrentPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [hasErrorShake, setHasErrorShake] = useState(false)
  const [success, setSuccess] = useState(false)

  const triggerError = (msg: string) => {
    setErrorMsg(msg)
    setHasErrorShake(true)
    setTimeout(() => setHasErrorShake(false), 450)
  }

  // Fetch approved list of security questions
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/security-questions/list`)
        const data = await res.json()
        if (data.questions && data.questions.length > 0) {
          setQuestions(data.questions)
          setQuestion1Id(data.questions[0].id)
          setQuestion2Id(data.questions[1].id)
        }
      } catch (err) {
        console.error("Failed to load questions:", err)
      } finally {
        setLoadingQuestions(false)
      }
    }
    fetchQuestions()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!currentPassword) {
      triggerError("Please confirm your current password to secure your account.")
      return
    }

    if (question1Id === question2Id) {
      triggerError("Please select two different security questions.")
      return
    }

    const cleanAns1 = answer1.trim()
    const cleanAns2 = answer2.trim()

    if (!cleanAns1 || !cleanAns2) {
      triggerError("Both security question answers are mandatory.")
      return
    }

    if (cleanAns1.length < 2 || cleanAns2.length < 2) {
      triggerError("Each answer must be at least 2 characters long.")
      return
    }

    setSubmitting(true)

    try {
      const token = localStorage.getItem("bharatsign_token")
      const headers: Record<string, string> = { "Content-Type": "application/json" }
      if (token) headers["Authorization"] = `Bearer ${token}`

      const res = await fetch(`${API_BASE_URL}/api/auth/security-questions/setup`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          current_password: currentPassword,
          question_1_id: question1Id,
          answer_1: cleanAns1,
          question_2_id: question2Id,
          answer_2: cleanAns2,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.detail || "Unable to save security questions.")
      }

      // Update user context with hasSecurityQuestions = true
      if (user) {
        login(user.name, user.email, user.preferredLanguage, {
          ...user,
          hasSecurityQuestions: true,
        })
      }

      setSuccess(true)
      // Clear plaintext answers from memory immediately
      setAnswer1("")
      setAnswer2("")
    } catch (err: any) {
      triggerError(err.message || "Failed to save security questions. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen font-body bg-[#eceff8] dark:bg-[#060914] text-[#0e1430] dark:text-[#eef1ff] flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden transition-colors duration-300">
      {/* Blurred Tinted Overlay with Slow-Drifting Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[12%] left-[10%] w-[450px] h-[450px] rounded-full bg-[#2f4bff]/20 dark:bg-[#2f4bff]/15 blur-[95px] animate-blob-drift-1" />
        <div className="absolute bottom-[15%] right-[10%] w-[480px] h-[480px] rounded-full bg-[#1fa2ff]/20 dark:bg-[#1fa2ff]/12 blur-[105px] animate-blob-drift-2" />
        <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-[#ffb23e]/10 dark:bg-[#ffb23e]/5 blur-[90px] pointer-events-none" />
      </div>

      <div className="w-full max-w-4xl relative z-10 animate-card-entrance">
        <div className="rounded-[28px] bg-white dark:bg-[#0e1328] border border-black/[0.08] dark:border-white/[0.08] shadow-[0_20px_60px_-15px_rgba(14,20,48,0.12),0_10px_25px_-5px_rgba(47,75,255,0.06)] dark:shadow-[0_25px_70px_-15px_rgba(0,0,0,0.7)] backdrop-blur-md overflow-hidden flex flex-col min-[820px]:flex-row">
          
          {/* ==================== LEFT BRAND PANEL ==================== */}
          <div className="hidden min-[820px]:flex min-[820px]:w-[42%] p-9 flex-col justify-between relative overflow-hidden bg-[radial-gradient(ellipse_at_top,_#1e295d_0%,_#0a1027_100%)]">
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#2f4bff_1px,transparent_1px)] [background-size:16px_16px]" />

            {/* Top Brand Logo */}
            <div className="relative z-10 flex items-center justify-between">
              <Logo variant="full" size="md" />
              <div className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-bold text-white flex items-center gap-1.5 shadow-sm">
                <Sparkles className="h-3 w-3 text-[#ffb23e]" />
                <span>Security</span>
              </div>
            </div>

            {/* Middle: Key & Shield Graphic */}
            <div className="relative z-10 my-8 flex flex-col items-center justify-center">
              <div className="relative w-40 h-40 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#1fa2ff]/30 animate-orbit-spin" />
                <div className="absolute inset-3 rounded-full border border-[#2f4bff]/40 animate-orbit-counter" />

                <div className="w-20 h-20 rounded-2xl flex flex-col items-center justify-center backdrop-blur-md bg-[#151c38]/90 border border-white/15 shadow-[0_0_25px_rgba(47,75,255,0.25)]">
                  <KeyRound className="w-9 h-9 text-[#1fa2ff]" />
                  <span className="text-[10px] font-bold tracking-wider uppercase mt-1 text-[#cbd5e1]">
                    Recovery
                  </span>
                </div>
              </div>

              <div className="text-center mt-6">
                <h2 className="font-heading font-extrabold text-xl text-white tracking-tight leading-snug">
                  Account Recovery Setup
                </h2>
                <p className="font-body text-xs text-[#9bb0db] mt-1.5 leading-relaxed">
                  Your answers are encrypted using salted bcrypt hashing and never stored in plaintext.
                </p>
              </div>
            </div>

            {/* Bottom: 3 Security Pillars */}
            <div className="relative z-10 flex flex-col gap-2 pt-2">
              <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl backdrop-blur-md bg-white/[0.05] border border-white/10 text-xs font-semibold text-[#d4dcff] shadow-sm">
                <ShieldCheck className="h-3.5 w-3.5 text-[#10b981] shrink-0" />
                <span>Zero Plaintext Answer Storage</span>
              </div>
              <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl backdrop-blur-md bg-white/[0.05] border border-white/10 text-xs font-semibold text-[#d4dcff] shadow-sm">
                <Lock className="h-3.5 w-3.5 text-[#1fa2ff] shrink-0" />
                <span>Bcrypt Work Factor 12 Hashes</span>
              </div>
              <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl backdrop-blur-md bg-white/[0.05] border border-white/10 text-xs font-semibold text-[#d4dcff] shadow-sm">
                <HelpCircle className="h-3.5 w-3.5 text-[#ffb23e] shrink-0" />
                <span>Two-Question Authentication</span>
              </div>
            </div>
          </div>

          {/* ==================== RIGHT FORM PANEL ==================== */}
          <div className="flex-1 p-7 sm:p-9 flex flex-col justify-center">
            {/* Mobile Brand Header */}
            <div className="min-[820px]:hidden flex flex-col items-center text-center gap-2 mb-6">
              <Logo variant="full" size="md" />
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#ffb23e]/15 border border-[#ffb23e]/30 text-[#ffb23e] text-[11px] font-bold">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Account Security</span>
              </div>
            </div>

            {success ? (
              /* Success Confirmation */
              <div className="py-8 flex flex-col items-center text-center gap-5 animate-card-entrance">
                <div className="relative w-20 h-20 flex items-center justify-center animate-pop">
                  <svg className="w-20 h-20" viewBox="0 0 52 52">
                    <circle
                      className="text-emerald-500 animate-stroke-circle"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      cx="26"
                      cy="26"
                      r="23"
                    />
                    <path
                      className="text-emerald-500 animate-stroke-check"
                      fill="none"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      stroke="currentColor"
                      d="M14.1 27.2l7.1 7.2 16.7-16.8"
                    />
                  </svg>
                </div>

                <div className="flex flex-col gap-1.5 max-w-sm">
                  <h2 className="font-heading font-extrabold text-2xl text-[#0e1430] dark:text-[#eef1ff]">
                    Account Secured!
                  </h2>
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-800 dark:text-emerald-200 text-xs font-medium leading-relaxed">
                    Your account recovery questions have been saved successfully.
                  </div>
                </div>

                <div className="w-full max-w-xs pt-3">
                  <Button
                    onClick={() => navigate("/learn")}
                    className="w-full h-11 text-xs font-bold rounded-[14px] bg-gradient-to-r from-[#2f4bff] to-[#1fa2ff] text-white shadow-lg shadow-[#2f4bff]/20 btn-sheen hover:-translate-y-0.5 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <span>Continue to Learning Portal</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              /* Setup Form */
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 animate-view-switch">
                <div className="flex flex-col gap-1">
                  <h1 className="font-heading font-extrabold text-xl text-[#0e1430] dark:text-[#eef1ff] tracking-tight">
                    Secure Your Account
                  </h1>
                  <p className="font-body text-xs text-[#586082] dark:text-[#828bb4] leading-relaxed">
                    Set up two security questions to help recover your account if you forget your password.
                  </p>
                </div>

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

                {/* Important Tip Callout */}
                <div className="p-3 rounded-xl bg-[#2f4bff]/10 border border-[#2f4bff]/20 text-[11.5px] text-[#2f4bff] dark:text-[#9bb0db] flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-[#ffb23e] shrink-0 mt-0.5" />
                  <span>
                    Choose answers you can remember easily, but that others cannot guess or find online.
                  </span>
                </div>

                {/* CURRENT PASSWORD CONFIRMATION */}
                <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-[#f3f5fb] dark:bg-[#151b36] border border-[#d8e0f2] dark:border-[#222b4a]">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="current-pwd" className="text-xs font-bold text-[#0e1430] dark:text-[#eef1ff] flex items-center gap-1.5">
                      <Lock className="h-3.5 w-3.5 text-[#2f4bff]" />
                      <span>Confirm Your Current Password</span>
                    </Label>
                    <span className="text-[10.5px] text-[#586082] dark:text-[#828bb4]">Required for security</span>
                  </div>
                  <div className="relative mt-1">
                    <Input
                      id="current-pwd"
                      type={showCurrentPassword ? "text" : "password"}
                      required
                      value={currentPassword}
                      onChange={(e) => {
                        setCurrentPassword(e.target.value)
                        setErrorMsg(null)
                      }}
                      placeholder="Enter your account password to confirm identity"
                      className="pr-10 h-10 rounded-xl bg-white dark:bg-[#0e1328] border-[#d8e0f2] dark:border-[#2a3458] text-xs font-semibold focus:ring-2 focus:ring-[#2f4bff]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#586082] dark:text-[#828bb4] hover:text-[#0e1430] dark:hover:text-white p-1"
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* QUESTION 1 */}
                <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-[#f3f5fb] dark:bg-[#151b36] border border-[#d8e0f2] dark:border-[#222b4a]">
                  <Label htmlFor="q1-select" className="text-xs font-bold text-[#0e1430] dark:text-[#eef1ff]">
                    Security Question 1
                  </Label>
                  <select
                    id="q1-select"
                    value={question1Id}
                    onChange={(e) => setQuestion1Id(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-white dark:bg-[#0e1328] border border-[#d8e0f2] dark:border-[#2a3458] text-xs font-semibold text-[#0e1430] dark:text-[#eef1ff] focus:outline-none focus:ring-2 focus:ring-[#2f4bff]"
                  >
                    {questions.map((q) => (
                      <option key={q.id} value={q.id} disabled={q.id === question2Id}>
                        {q.label} {q.id === question2Id ? "(Already Selected for Question 2)" : ""}
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
                      placeholder="Enter your answer for question 1"
                      className="pr-10 h-10 rounded-xl bg-white dark:bg-[#0e1328] border-[#d8e0f2] dark:border-[#2a3458] text-xs font-semibold focus:ring-2 focus:ring-[#2f4bff]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAnswer1(!showAnswer1)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#586082] dark:text-[#828bb4] hover:text-[#0e1430] dark:hover:text-white p-1"
                      title={showAnswer1 ? "Hide" : "Show"}
                    >
                      {showAnswer1 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* QUESTION 2 */}
                <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-[#f3f5fb] dark:bg-[#151b36] border border-[#d8e0f2] dark:border-[#222b4a]">
                  <Label htmlFor="q2-select" className="text-xs font-bold text-[#0e1430] dark:text-[#eef1ff]">
                    Security Question 2
                  </Label>
                  <select
                    id="q2-select"
                    value={question2Id}
                    onChange={(e) => setQuestion2Id(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-white dark:bg-[#0e1328] border border-[#d8e0f2] dark:border-[#2a3458] text-xs font-semibold text-[#0e1430] dark:text-[#eef1ff] focus:outline-none focus:ring-2 focus:ring-[#2f4bff]"
                  >
                    {questions.map((q) => (
                      <option key={q.id} value={q.id} disabled={q.id === question1Id}>
                        {q.label} {q.id === question1Id ? "(Already Selected for Question 1)" : ""}
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
                      placeholder="Enter your answer for question 2"
                      className="pr-10 h-10 rounded-xl bg-white dark:bg-[#0e1328] border-[#d8e0f2] dark:border-[#2a3458] text-xs font-semibold focus:ring-2 focus:ring-[#2f4bff]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAnswer2(!showAnswer2)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#586082] dark:text-[#828bb4] hover:text-[#0e1430] dark:hover:text-white p-1"
                      title={showAnswer2 ? "Hide" : "Show"}
                    >
                      {showAnswer2 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Action */}
                <Button
                  type="submit"
                  disabled={submitting || loadingQuestions || !answer1.trim() || !answer2.trim()}
                  className="w-full h-11 text-xs font-bold rounded-[14px] bg-gradient-to-r from-[#2f4bff] to-[#1fa2ff] text-white shadow-lg shadow-[#2f4bff]/20 mt-2 btn-sheen hover:-translate-y-0.5 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Saving Encrypted Questions...</span>
                    </>
                  ) : (
                    <>
                      <span>Save Security Questions</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>

                <div className="text-center pt-2 border-t border-[#d8e0f2] dark:border-[#222b4a]">
                  <Link
                    to="/learn"
                    className="text-xs font-bold text-[#586082] dark:text-[#828bb4] hover:text-[#0e1430] dark:hover:text-[#eef1ff] transition-colors"
                  >
                    Skip for now →
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
