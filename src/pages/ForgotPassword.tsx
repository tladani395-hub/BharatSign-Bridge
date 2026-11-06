import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
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
import { API_BASE_URL } from "@/config/api"

interface ChallengeQuestion {
  id: string
  label: string
}

export default function ForgotPassword() {
  const navigate = useNavigate()

  // Step 1: Email, Step 2: Security Questions Verification
  const [step, setStep] = useState<1 | 2>(1)

  // Step 1 State: Email
  const [email, setEmail] = useState("")

  // Step 2 State: Security Questions Challenge
  const [challengeToken, setChallengeToken] = useState("")
  const [questions, setQuestions] = useState<ChallengeQuestion[]>([])
  const [answer1, setAnswer1] = useState("")
  const [showAnswer1, setShowAnswer1] = useState(false)
  const [answer2, setAnswer2] = useState("")
  const [showAnswer2, setShowAnswer2] = useState(false)

  // Feedback & Loading States
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [hasErrorShake, setHasErrorShake] = useState(false)

  const triggerError = (msg: string) => {
    setErrorMsg(msg)
    setHasErrorShake(true)
    setTimeout(() => setHasErrorShake(false), 450)
  }

  // ==================== STEP 1: INITIATE VIA EMAIL ====================
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    const cleanEmail = email.trim().toLowerCase()
    if (!cleanEmail || !cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      triggerError("Please enter a valid registered email address.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password/initiate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.detail || "Unable to initiate password recovery.")
      }

      setChallengeToken(data.challenge_token)
      setQuestions(data.questions || [])
      setStep(2)
    } catch (err: any) {
      triggerError(err.message || "Failed to process request. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // ==================== STEP 2: VERIFY SECURITY ANSWERS ====================
  const handleAnswersSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    const cleanAns1 = answer1.trim()
    const cleanAns2 = answer2.trim()

    if (!cleanAns1 || !cleanAns2) {
      triggerError("Please answer both security questions to verify your identity.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password/verify-answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challenge_token: challengeToken,
          answer_1: cleanAns1,
          answer_2: cleanAns2,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(
          data.detail || "The information could not be verified. Please check your answers and try again."
        )
      }

      // Validated! Clear answers and redirect to reset-password with the single-use authorization token
      setAnswer1("")
      setAnswer2("")
      navigate(`/reset-password?token=${encodeURIComponent(data.reset_token)}`)
    } catch (err: any) {
      triggerError(err.message || "The information could not be verified. Please check your answers and try again.")
    } finally {
      setLoading(false)
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

            {/* Middle: Orbit Graphic with Center Lock */}
            <div className="relative z-10 my-8 flex flex-col items-center justify-center">
              <div className="relative w-40 h-40 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#1fa2ff]/30 animate-orbit-spin" />
                <div className="absolute inset-3 rounded-full border border-[#2f4bff]/40 animate-orbit-counter" />

                <div className="w-20 h-20 rounded-2xl flex flex-col items-center justify-center backdrop-blur-md bg-[#151c38]/90 border border-white/15 shadow-[0_0_25px_rgba(47,75,255,0.25)]">
                  <KeyRound className="w-9 h-9 text-[#1fa2ff]" />
                  <span className="text-[10px] font-bold tracking-wider uppercase mt-1 text-[#cbd5e1]">
                    Auth Shield
                  </span>
                </div>
              </div>

              <div className="text-center mt-6">
                <h2 className="font-heading font-extrabold text-xl text-white tracking-tight leading-snug">
                  Security Recovery
                </h2>
                <p className="font-body text-xs text-[#9bb0db] mt-1.5 leading-relaxed">
                  Fast, cryptographically protected identity verification using your private security answers.
                </p>
              </div>
            </div>

            {/* Bottom: 3 Floating Security Chips */}
            <div className="relative z-10 flex flex-col gap-2 pt-2">
              <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl backdrop-blur-md bg-white/[0.05] border border-white/10 text-xs font-semibold text-[#d4dcff] shadow-sm">
                <ShieldCheck className="h-3.5 w-3.5 text-[#10b981] shrink-0" />
                <span>Two-Factor Question Verification</span>
              </div>
              <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl backdrop-blur-md bg-white/[0.05] border border-white/10 text-xs font-semibold text-[#d4dcff] shadow-sm">
                <Lock className="h-3.5 w-3.5 text-[#1fa2ff] shrink-0" />
                <span>10-Minute Authorization Expiry</span>
              </div>
              <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl backdrop-blur-md bg-white/[0.05] border border-white/10 text-xs font-semibold text-[#d4dcff] shadow-sm">
                <HelpCircle className="h-3.5 w-3.5 text-[#ffb23e] shrink-0" />
                <span>Zero Email Reliance</span>
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
                <span>Password Recovery</span>
              </div>
            </div>

            {/* Step Indicator Progress Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-xs font-bold text-[#586082] dark:text-[#828bb4] mb-2 px-1">
                <span className={step >= 1 ? "text-[#2f4bff] font-extrabold" : ""}>
                  1. Registered Email
                </span>
                <span className={step >= 2 ? "text-[#2f4bff] font-extrabold" : ""}>
                  2. Security Questions
                </span>
                <span className="text-muted-foreground/60">
                  3. New Password
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#e2e8f0] dark:bg-[#151b36] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#2f4bff] to-[#1fa2ff] transition-all duration-500 rounded-full"
                  style={{ width: step === 1 ? "33%" : "66%" }}
                />
              </div>
            </div>

            {/* Error Message with Horizontal Shake */}
            {errorMsg && (
              <div
                className={`p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2 mb-5 ${
                  hasErrorShake ? "animate-field-shake" : ""
                }`}
              >
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* ==================== STEP 1: ENTER EMAIL ==================== */}
            {step === 1 && (
              <form onSubmit={handleEmailSubmit} className="flex flex-col gap-4 animate-view-switch">
                <div className="flex flex-col gap-1">
                  <h1 className="font-heading font-extrabold text-xl text-[#0e1430] dark:text-[#eef1ff] tracking-tight">
                    Forgot Your Password?
                  </h1>
                  <p className="font-body text-xs text-[#586082] dark:text-[#828bb4] leading-relaxed">
                    Enter your registered email address to recover your BharatSign Bridge account.
                  </p>
                </div>

                <div className="flex flex-col gap-1.5 mt-2">
                  <Label htmlFor="forgot-email" className="text-xs font-bold text-[#0e1430] dark:text-[#eef1ff]">
                    Registered Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#586082] dark:text-[#828bb4]" />
                    <Input
                      id="forgot-email"
                      type="email"
                      required
                      autoFocus
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        setErrorMsg(null)
                      }}
                      placeholder="e.g. student@bharatsign.ai"
                      className="pl-10 h-11 rounded-[14px] bg-[#f3f5fb] dark:bg-[#151b36] border-[#d8e0f2] dark:border-[#222b4a] text-xs font-semibold focus:ring-4 focus:ring-[#2f4bff]/25 focus:border-[#2f4bff]"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full h-11 text-xs font-bold rounded-[14px] bg-gradient-to-r from-[#2f4bff] to-[#1fa2ff] text-white shadow-lg shadow-[#2f4bff]/20 mt-2 btn-sheen hover:-translate-y-0.5 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Verifying Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Continue</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>

                <div className="text-center pt-2 border-t border-[#d8e0f2] dark:border-[#222b4a]">
                  <Link
                    to="/login"
                    className="text-xs font-bold text-[#586082] dark:text-[#828bb4] hover:text-[#0e1430] dark:hover:text-white transition-colors"
                  >
                    ← Back to Login
                  </Link>
                </div>
              </form>
            )}

            {/* ==================== STEP 2: VERIFY SECURITY ANSWERS ==================== */}
            {step === 2 && (
              <form onSubmit={handleAnswersSubmit} className="flex flex-col gap-4 animate-view-switch">
                <div className="flex flex-col gap-1">
                  <h1 className="font-heading font-extrabold text-xl text-[#0e1430] dark:text-[#eef1ff] tracking-tight">
                    Verify Your Identity
                  </h1>
                  <p className="font-body text-xs text-[#586082] dark:text-[#828bb4] leading-relaxed">
                    Answer the two security questions configured for <strong className="text-[#0e1430] dark:text-white">{email}</strong>.
                  </p>
                </div>

                {/* QUESTION 1 */}
                <div className="flex flex-col gap-1.5 p-3.5 rounded-2xl bg-[#f3f5fb] dark:bg-[#151b36] border border-[#d8e0f2] dark:border-[#222b4a]">
                  <span className="text-[11px] font-bold text-[#2f4bff] uppercase tracking-wider">
                    Question 1
                  </span>
                  <p className="text-xs font-bold text-[#0e1430] dark:text-[#eef1ff]">
                    {questions[0]?.label || "What was the name of your first school?"}
                  </p>
                  <div className="relative mt-1">
                    <Input
                      type={showAnswer1 ? "text" : "password"}
                      required
                      autoFocus
                      value={answer1}
                      onChange={(e) => {
                        setAnswer1(e.target.value)
                        setErrorMsg(null)
                      }}
                      placeholder="Enter your answer"
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
                <div className="flex flex-col gap-1.5 p-3.5 rounded-2xl bg-[#f3f5fb] dark:bg-[#151b36] border border-[#d8e0f2] dark:border-[#222b4a]">
                  <span className="text-[11px] font-bold text-[#2f4bff] uppercase tracking-wider">
                    Question 2
                  </span>
                  <p className="text-xs font-bold text-[#0e1430] dark:text-[#eef1ff]">
                    {questions[1]?.label || "What was your childhood favourite game?"}
                  </p>
                  <div className="relative mt-1">
                    <Input
                      type={showAnswer2 ? "text" : "password"}
                      required
                      value={answer2}
                      onChange={(e) => {
                        setAnswer2(e.target.value)
                        setErrorMsg(null)
                      }}
                      placeholder="Enter your answer"
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

                <Button
                  type="submit"
                  disabled={loading || !answer1.trim() || !answer2.trim()}
                  className="w-full h-11 text-xs font-bold rounded-[14px] bg-gradient-to-r from-[#2f4bff] to-[#1fa2ff] text-white shadow-lg shadow-[#2f4bff]/20 mt-2 btn-sheen hover:-translate-y-0.5 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Verifying Answers...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify Answers</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>

                <div className="flex items-center justify-between pt-2 border-t border-[#d8e0f2] dark:border-[#222b4a] text-xs font-bold text-[#586082] dark:text-[#828bb4]">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1)
                      setErrorMsg(null)
                    }}
                    className="hover:text-[#0e1430] dark:hover:text-white transition-colors"
                  >
                    ← Change Email
                  </button>
                  <Link
                    to="/login"
                    className="hover:text-[#0e1430] dark:hover:text-white transition-colors"
                  >
                    Back to Login
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
