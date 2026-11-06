import React, { useState, useEffect } from "react"
import { useNavigate, useLocation, Link } from "react-router-dom"
import {
  Lock,
  Mail,
  User,
  ArrowRight,
  ShieldCheck,
  Globe2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
  Sparkles,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuthAndTheme } from "@/context/AuthAndThemeContext"
import { INDIC_LANGUAGES } from "@/lib/speech"
import Logo from "@/components/brand/Logo"
import WelcomeOverlay from "@/components/auth/WelcomeOverlay"

interface CaptchaData {
  question: string
  token: string
  num1?: number
  num2?: number
}

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [preferredLang, setPreferredLang] = useState("en")
  const [isLoading, setIsLoading] = useState(false)

  // Animated lock state for brand panel
  const [isUnlocked, setIsUnlocked] = useState(false)

  // Post Sign-Up Welcome Animation Overlay state
  const [showWelcome, setShowWelcome] = useState(false)
  const [pendingUserData, setPendingUserData] = useState<any>(null)

  // Human Verification (Captcha) State
  const [captchaData, setCaptchaData] = useState<CaptchaData | null>(null)
  const [captchaAnswer, setCaptchaAnswer] = useState("")
  const [isCaptchaValid, setIsCaptchaValid] = useState(false)
  const [isRefreshingCaptcha, setIsRefreshingCaptcha] = useState(false)

  // Error & Status Feedback
  const [authError, setAuthError] = useState<string | null>(null)
  const [isDuplicateEmail, setIsDuplicateEmail] = useState(false)
  const [hasErrorShake, setHasErrorShake] = useState(false)

  const { login } = useAuthAndTheme()
  const navigate = useNavigate()
  const location = useLocation()

  // Target route to return after successful authentication
  const from = (location.state as any)?.from?.pathname || "/profile"

  // Password strength calculation for Sign Up (4 segments: Red, Amber, Light Green, Green)
  const calculatePasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: "Too weak", color: "bg-transparent" }
    let score = 0
    if (pwd.length >= 6) score += 1
    if (pwd.length >= 8 && (/[A-Z]/.test(pwd) || /[0-9]/.test(pwd))) score += 1
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd) && /[0-9]/.test(pwd)) score += 1
    if (/[^A-Za-z0-9]/.test(pwd) && pwd.length >= 10) score += 1

    if (score === 1) return { score: 1, label: "Weak", color: "bg-rose-500" }
    if (score === 2) return { score: 2, label: "Fair", color: "bg-[#ffb23e]" }
    if (score === 3) return { score: 3, label: "Good", color: "bg-emerald-400" }
    return { score: 4, label: "Strong", color: "bg-emerald-600" }
  }

  const pwdStrength = calculatePasswordStrength(password)

  // Trigger error shake animation
  const triggerError = (msg: string) => {
    setAuthError(msg)
    setHasErrorShake(true)
    setTimeout(() => setHasErrorShake(false), 450)
  }

  // Fetch or generate fresh Human Verification Challenge
  const fetchCaptcha = async () => {
    setIsRefreshingCaptcha(true)
    setCaptchaAnswer("")
    setIsCaptchaValid(false)
    try {
      const res = await fetch("http://127.0.0.1:8000/api/auth/captcha")
      if (res.ok) {
        const data = await res.json()
        setCaptchaData(data)
      } else {
        throw new Error("Backend captcha error")
      }
    } catch {
      // Local fallback challenge if backend network delay
      const n1 = Math.floor(Math.random() * 8) + 3
      const n2 = Math.floor(Math.random() * 7) + 2
      setCaptchaData({
        question: `Human Verification: What is ${n1} + ${n2}?`,
        token: `local:${n1 + n2}:${Date.now()}`,
        num1: n1,
        num2: n2,
      })
    } finally {
      setIsRefreshingCaptcha(false)
    }
  }

  useEffect(() => {
    fetchCaptcha()
  }, [isSignUp])

  // Validate human verification in real time
  const handleCaptchaInput = (value: string) => {
    setCaptchaAnswer(value)
    setAuthError(null)

    if (captchaData?.num1 !== undefined && captchaData?.num2 !== undefined) {
      const expected = captchaData.num1 + captchaData.num2
      if (parseInt(value.trim(), 10) === expected) {
        setIsCaptchaValid(true)
      } else {
        setIsCaptchaValid(false)
      }
    } else if (value.trim().length > 0) {
      setIsCaptchaValid(true)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError(null)
    setIsDuplicateEmail(false)

    // Check Human Verification
    if (!captchaAnswer.trim()) {
      triggerError("Human Verification required. Please solve the security question.")
      return
    }

    if (captchaData?.num1 !== undefined && captchaData?.num2 !== undefined) {
      const expected = captchaData.num1 + captchaData.num2
      if (parseInt(captchaAnswer.trim(), 10) !== expected) {
        triggerError("Incorrect human verification answer. Please calculate correctly.")
        setIsCaptchaValid(false)
        return
      }
    }

    setIsLoading(true)

    try {
      if (isSignUp) {
        // --- 1. SIGN UP (PREVENT DUPLICATE ACCOUNTS) ---
        const response = await fetch("http://127.0.0.1:8000/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim() || "New ISL Student",
            email: email.trim().toLowerCase(),
            password: password,
            preferred_language: preferredLang,
            captcha_answer: captchaAnswer.trim(),
            captcha_token: captchaData?.token || "",
          }),
        })

        const data = await response.json()

        if (response.status === 409) {
          setIsDuplicateEmail(true)
          triggerError(
            data.detail ||
              `An account with email '${email}' is already registered. Please sign in directly.`
          )
          setIsLoading(false)
          fetchCaptcha()
          return
        }

        if (!response.ok) {
          throw new Error(data.detail || "Sign up failed. Please check your details.")
        }

        // Success animation & Lock unlock (turns green and shows UNLOCKED)
        setIsUnlocked(true)
        setPendingUserData({ ...data.user, token: data.token })

        // Wait about 1 second, then show the full-screen welcome overlay
        setTimeout(() => {
          setShowWelcome(true)
        }, 1000)
      } else {
        // --- 2. SIGN IN ---
        const response = await fetch("http://127.0.0.1:8000/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password: password,
            captcha_answer: captchaAnswer.trim(),
            captcha_token: captchaData?.token || "",
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.detail || "Login failed. Please verify your email and password.")
        }

        // Unlock animation upon successful sign in!
        setIsUnlocked(true)
        setTimeout(() => {
          login(data.user.name, data.user.email, data.user.preferredLanguage, data.user, data.token)
          setIsLoading(false)
          if (data.user && data.user.hasSecurityQuestions === false) {
            navigate("/security-setup", { replace: true })
          } else {
            navigate(from, { replace: true })
          }
        }, 900)
      }
    } catch (err: any) {
      triggerError(err.message || "Authentication failed. Please verify credentials.")
      setIsLoading(false)
      fetchCaptcha()
    }
  }

  const handleWelcomeDone = () => {
    setShowWelcome(false)
    if (pendingUserData) {
      login(
        pendingUserData.name,
        pendingUserData.email,
        pendingUserData.preferredLanguage,
        pendingUserData,
        (pendingUserData as any)?.token
      )
    }
    setIsLoading(false)
    navigate("/security-setup", { replace: true })
  }

  const handleSwitchToSignIn = () => {
    setIsSignUp(false)
    setAuthError(null)
    setIsDuplicateEmail(false)
    fetchCaptcha()
  }

  return (
    <div className="min-h-screen font-body bg-[#eceff8] dark:bg-[#060914] text-[#0e1430] dark:text-[#eef1ff] flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden transition-colors duration-300">
      {/* Blurred Tinted Overlay with Slow-Drifting Color Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[15%] left-[12%] w-[420px] h-[420px] rounded-full bg-[#2f4bff]/20 dark:bg-[#2f4bff]/18 blur-[90px] animate-blob-1" />
        <div className="absolute bottom-[18%] right-[10%] w-[460px] h-[460px] rounded-full bg-[#1fa2ff]/20 dark:bg-[#1fa2ff]/18 blur-[100px] animate-blob-2" />
        <div className="absolute top-[60%] left-[45%] w-[280px] h-[280px] rounded-full bg-[#ffb23e]/15 dark:bg-[#ffb23e]/10 blur-[80px] animate-blob-1" />
      </div>

      <div className="w-full max-w-4xl relative z-10 animate-card-entrance">
        {/* Split Card: Radius 28px */}
        <div className="rounded-[28px] overflow-hidden border border-[#d8e0f2] dark:border-[#1f2947]/70 shadow-2xl backdrop-blur-xl bg-white dark:bg-[#0e1328] flex flex-col min-[820px]:flex-row transition-all duration-300">
          {/* ==================== LEFT BRAND PANEL (Hidden under 820px) ==================== */}
          <div className="hidden min-[820px]:flex flex-col justify-between p-9 min-[820px]:w-[380px] lg:w-[420px] shrink-0 text-white relative overflow-hidden bg-[radial-gradient(ellipse_at_30%_30%,_#17285e_0%,_#060a17_100%)] border-r border-[#1f2947]/60">
            {/* Ambient Radial Highlights */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#1fa2ff]/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#2f4bff]/20 rounded-full blur-3xl pointer-events-none" />

            {/* Top Brand Header */}
            <div className="relative z-10 flex flex-col gap-3">
              <Logo variant="full" size="md" />
              <div className="inline-flex items-center gap-1.5 self-start px-2.5 py-0.5 rounded-full bg-[#ffb23e]/15 border border-[#ffb23e]/30 text-[#ffb23e] text-[11px] font-bold">
                <Sparkles className="h-3 w-3" />
                <span>ISL Neural Bridge 2.0</span>
              </div>
            </div>

            {/* Middle: Animated Orbit Graphic with Interactive Center Lock */}
            <div className="relative z-10 my-8 flex flex-col items-center justify-center">
              <div className="relative w-44 h-44 flex items-center justify-center">
                {/* Outer Dashed Orbit Ring */}
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#1fa2ff]/30 animate-orbit-spin" />
                
                {/* Inner Glow Orbit Ring */}
                <div className="absolute inset-3 rounded-full border border-[#2f4bff]/40 animate-orbit-counter" />

                {/* Floating Orbit Satellite Nodes */}
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-gradient-to-r from-[#2f4bff] to-[#1fa2ff] shadow-[0_0_12px_#1fa2ff] animate-orbit-spin" />
                <div className="absolute -bottom-1 left-1/3 w-2.5 h-2.5 rounded-full bg-[#ffb23e] shadow-[0_0_10px_#ffb23e]" />
                <div className="absolute top-1/2 -right-1 w-2 h-2 rounded-full bg-[#10b981] shadow-[0_0_8px_#10b981]" />

                {/* Center Core Glass Lock Container */}
                <div
                  className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center backdrop-blur-md transition-all duration-700 shadow-xl border ${
                    isUnlocked
                      ? "bg-[#10b981]/20 border-[#10b981]/50 shadow-[0_0_30px_rgba(16,185,129,0.35)]"
                      : "bg-[#151c38]/90 border-white/15 shadow-[0_0_20px_rgba(47,75,255,0.25)]"
                  }`}
                >
                  <svg
                    viewBox="0 0 32 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-10 h-10"
                  >
                    {/* Shackle */}
                    <path
                      d="M10 14V9.5C10 6.46243 12.4624 4 15.5 4V4C18.5376 4 21 6.46243 21 9.5V14"
                      stroke={isUnlocked ? "#10b981" : "#1fa2ff"}
                      strokeWidth="2.8"
                      strokeLinecap="round"
                      className={`shackle-locked ${isUnlocked ? "shackle-unlocked" : ""}`}
                    />
                    {/* Body */}
                    <rect
                      x="7"
                      y="13"
                      width="18"
                      height="14"
                      rx="4"
                      fill={isUnlocked ? "url(#lockGradientSuccess)" : "url(#lockGradient)"}
                      stroke={isUnlocked ? "#34d399" : "#60a5fa"}
                      strokeWidth="1.5"
                    />
                    {/* Keyhole */}
                    <circle cx="16" cy="19" r="1.5" fill="#ffffff" />
                    <path d="M16 20.5V23" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" />

                    <defs>
                      <linearGradient id="lockGradient" x1="7" y1="13" x2="25" y2="27" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#2f4bff" />
                        <stop offset="1" stopColor="#1fa2ff" />
                      </linearGradient>
                      <linearGradient id="lockGradientSuccess" x1="7" y1="13" x2="25" y2="27" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#059669" />
                        <stop offset="1" stopColor="#10b981" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <span className="text-[10px] font-bold tracking-wider uppercase mt-1 text-[#cbd5e1]">
                    {isUnlocked ? "Unlocked" : "Secure Auth"}
                  </span>
                </div>
              </div>

              {/* Headline */}
              <div className="text-center mt-6">
                <h2 className="font-heading font-extrabold text-xl text-white tracking-tight leading-snug">
                  Bridging Voices, Empowering Gestures
                </h2>
                <p className="font-body text-xs text-[#9bb0db] mt-1.5 leading-relaxed">
                  Real-time Indian Sign Language recognition with national multi-dialect intelligence.
                </p>
              </div>
            </div>

            {/* Bottom: Three Floating Glass Chips */}
            <div className="relative z-10 flex flex-col gap-2 pt-2">
              <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl backdrop-blur-md bg-white/[0.05] border border-white/10 text-xs font-semibold text-[#d4dcff] shadow-sm">
                <Zap className="h-3.5 w-3.5 text-[#ffb23e] shrink-0" />
                <span>Real-Time Holistic 3D Gesture AI</span>
              </div>
              <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl backdrop-blur-md bg-white/[0.05] border border-white/10 text-xs font-semibold text-[#d4dcff] shadow-sm">
                <Globe2 className="h-3.5 w-3.5 text-[#1fa2ff] shrink-0" />
                <span>13 Indian National Languages</span>
              </div>
              <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl backdrop-blur-md bg-white/[0.05] border border-white/10 text-xs font-semibold text-[#d4dcff] shadow-sm">
                <ShieldCheck className="h-3.5 w-3.5 text-[#10b981] shrink-0" />
                <span>National ISLRTC Verified Access</span>
              </div>
            </div>
          </div>

          {/* ==================== RIGHT FORM PANEL ==================== */}
          <div className="flex-1 p-7 sm:p-9 flex flex-col justify-center">
            {/* Mobile Brand Header (Visible <820px) */}
            <div className="min-[820px]:hidden flex flex-col items-center text-center gap-2 mb-6">
              <Logo variant="full" size="md" />
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#ffb23e]/15 border border-[#ffb23e]/30 text-[#ffb23e] text-[11px] font-bold">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>National ISLRTC Unified Access</span>
              </div>
            </div>

            {/* Segmented Tab with Spring Sliding Thumb */}
            <div className="relative p-1 rounded-2xl bg-[#f0f3fa] dark:bg-[#151b36] border border-[#d8e0f2] dark:border-[#222b4a] mb-6">
              {/* Sliding Thumb */}
              <div
                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-xl bg-gradient-to-r from-[#2f4bff] to-[#1fa2ff] shadow-md tab-spring ${
                  isSignUp ? "left-[calc(50%+2px)]" : "left-1"
                }`}
              />

              <div className="grid grid-cols-2 relative z-10">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(false)
                    setAuthError(null)
                    setIsDuplicateEmail(false)
                  }}
                  className={`py-2 text-xs font-extrabold rounded-xl transition-colors duration-200 ${
                    !isSignUp ? "text-white" : "text-[#586082] dark:text-[#828bb4] hover:text-[#0e1430] dark:hover:text-white"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(true)
                    setAuthError(null)
                    setIsDuplicateEmail(false)
                  }}
                  className={`py-2 text-xs font-extrabold rounded-xl transition-colors duration-200 ${
                    isSignUp ? "text-white" : "text-[#586082] dark:text-[#828bb4] hover:text-[#0e1430] dark:hover:text-white"
                  }`}
                >
                  Sign Up
                </button>
              </div>
            </div>

            {/* Error Message with Horizontal Shake Animation */}
            {authError && (
              <div
                className={`p-3.5 rounded-xl border text-xs flex flex-col gap-1.5 mb-5 ${
                  hasErrorShake ? "animate-field-shake" : ""
                } ${
                  isDuplicateEmail
                    ? "bg-[#ffb23e]/15 border-[#ffb23e]/50 text-[#b45309] dark:text-[#fcd34d]"
                    : "bg-rose-500/15 border-rose-500/50 text-rose-700 dark:text-rose-300"
                }`}
              >
                <div className="flex items-center gap-2 font-bold">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{isDuplicateEmail ? "Account Already Registered" : "Authentication Notice"}</span>
                </div>
                <p className="text-[11px] leading-relaxed pl-6">{authError}</p>
                {isDuplicateEmail && (
                  <button
                    type="button"
                    onClick={handleSwitchToSignIn}
                    className="self-start text-[11px] font-bold text-primary underline pl-6 mt-0.5"
                  >
                    Switch to Sign In →
                  </button>
                )}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 animate-view-switch">
              {/* Full Name for Sign Up */}
              {isSignUp && (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="signup-name" className="text-xs font-bold text-[#0e1430] dark:text-[#eef1ff]">
                    Full Name / Student Name
                  </Label>
                  <div className="relative">
                    <User className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#586082] dark:text-[#828bb4]" />
                    <Input
                      id="signup-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Aarav Sharma"
                      className="pl-10 h-11 rounded-[14px] bg-[#f3f5fb] dark:bg-[#151b36] border-[#d8e0f2] dark:border-[#222b4a] text-xs font-semibold focus:ring-4 focus:ring-[#2f4bff]/25 focus:border-[#2f4bff]"
                    />
                  </div>
                </div>
              )}

              {/* Email Address */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="auth-email" className="text-xs font-bold text-[#0e1430] dark:text-[#eef1ff]">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#586082] dark:text-[#828bb4]" />
                  <Input
                    id="auth-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setAuthError(null)
                      setIsDuplicateEmail(false)
                    }}
                    placeholder="student@bharatsign.ai"
                    className="pl-10 h-11 rounded-[14px] bg-[#f3f5fb] dark:bg-[#151b36] border-[#d8e0f2] dark:border-[#222b4a] text-xs font-semibold focus:ring-4 focus:ring-[#2f4bff]/25 focus:border-[#2f4bff]"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="auth-password" className="text-xs font-bold text-[#0e1430] dark:text-[#eef1ff]">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#586082] dark:text-[#828bb4]" />
                  <Input
                    id="auth-password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={showPassword ? "Enter your password" : "••••••••••••"}
                    className="pl-10 pr-10 h-11 rounded-[14px] bg-[#f3f5fb] dark:bg-[#151b36] border-[#d8e0f2] dark:border-[#222b4a] text-xs font-semibold focus:ring-4 focus:ring-[#2f4bff]/25 focus:border-[#2f4bff]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#586082] dark:text-[#828bb4] hover:text-[#0e1430] dark:hover:text-[#eef1ff] p-1 transition-colors"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* 4-Segment Password Strength Meter (Only shown for Sign Up) */}
                {isSignUp && password.length > 0 && (
                  <div className="flex flex-col gap-1.5 mt-1 animate-in fade-in">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#586082] dark:text-[#828bb4]">Strength:</span>
                      <span className="font-bold text-[#0e1430] dark:text-[#eef1ff]">
                        {pwdStrength.label}
                      </span>
                    </div>
                    {/* 4 distinct segments: Red, Amber, Light Green, Green */}
                    <div className="grid grid-cols-4 gap-1.5 h-1.5 rounded-full overflow-hidden bg-[#e2e8f0] dark:bg-[#1f2747]">
                      <div
                        className={`h-full transition-colors duration-300 ${
                          pwdStrength.score >= 1 ? "bg-rose-500" : "bg-transparent"
                        }`}
                      />
                      <div
                        className={`h-full transition-colors duration-300 ${
                          pwdStrength.score >= 2 ? "bg-[#ffb23e]" : "bg-transparent"
                        }`}
                      />
                      <div
                        className={`h-full transition-colors duration-300 ${
                          pwdStrength.score >= 3 ? "bg-emerald-400" : "bg-transparent"
                        }`}
                      />
                      <div
                        className={`h-full transition-colors duration-300 ${
                          pwdStrength.score >= 4 ? "bg-emerald-600" : "bg-transparent"
                        }`}
                      />
                    </div>
                  </div>
                )}

                {/* Forgot Password Link (Below Password on Sign In) */}
                {!isSignUp && (
                  <div className="flex justify-end pt-1">
                    <Link
                      to="/forgot-password"
                      className="text-xs font-bold text-[#2f4bff] hover:text-[#1fa2ff] transition-colors focus:outline-none focus:underline"
                    >
                      Forgot Password?
                    </Link>
                  </div>
                )}
              </div>

              {/* Preferred Language for Sign Up */}
              {isSignUp && (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="signup-lang" className="text-xs font-bold text-[#0e1430] dark:text-[#eef1ff] flex items-center gap-1.5">
                    <Globe2 className="h-3.5 w-3.5 text-[#1fa2ff]" />
                    <span>Preferred Learning Language</span>
                  </Label>
                  <select
                    id="signup-lang"
                    value={preferredLang}
                    onChange={(e) => setPreferredLang(e.target.value)}
                    className="h-11 px-3.5 rounded-[14px] bg-[#f3f5fb] dark:bg-[#151b36] border border-[#d8e0f2] dark:border-[#222b4a] text-xs font-semibold text-[#0e1430] dark:text-[#eef1ff] focus:outline-none focus:ring-4 focus:ring-[#2f4bff]/25 focus:border-[#2f4bff]"
                  >
                    {INDIC_LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.native} ({lang.name})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Human Verification (Captcha Challenge) */}
              <div className="p-3.5 rounded-[16px] bg-[#f3f5fb] dark:bg-[#151b36] border border-[#d8e0f2] dark:border-[#222b4a] flex flex-col gap-2.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-[#0e1430] dark:text-[#eef1ff]">
                    <ShieldCheck className="h-4 w-4 text-[#10b981]" />
                    <span>{captchaData?.question || "Human Verification"}</span>
                  </div>
                  <button
                    type="button"
                    onClick={fetchCaptcha}
                    disabled={isRefreshingCaptcha}
                    className="p-1 rounded-lg text-[#586082] dark:text-[#828bb4] hover:text-[#0e1430] dark:hover:text-white transition-colors"
                    title="Get new challenge"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isRefreshingCaptcha ? "animate-spin" : ""}`} />
                  </button>
                </div>

                <div className="relative">
                  <Input
                    type="text"
                    required
                    value={captchaAnswer}
                    onChange={(e) => handleCaptchaInput(e.target.value)}
                    placeholder="Enter answer (e.g. 14)"
                    className="h-10 rounded-[12px] bg-white dark:bg-[#0e1328] border-[#d8e0f2] dark:border-[#222b4a] text-xs font-semibold pr-9 focus:ring-4 focus:ring-[#2f4bff]/25 focus:border-[#2f4bff]"
                  />
                  {isCaptchaValid && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 absolute right-3 top-1/2 -translate-y-1/2" />
                  )}
                </div>
              </div>

              {/* Primary Submit Button */}
              <Button
                type="submit"
                disabled={isLoading || !isCaptchaValid}
                className="w-full h-11 text-xs font-bold rounded-[14px] bg-gradient-to-r from-[#2f4bff] to-[#1fa2ff] hover:opacity-95 text-white shadow-lg shadow-[#2f4bff]/20 mt-1 btn-sheen hover:-translate-y-0.5 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>{isSignUp ? "Creating Account..." : "Signing In..."}</span>
                  </>
                ) : (
                  <>
                    <span>{isSignUp ? "Create Student Account" : "Sign In to Studio"}</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Post Sign-Up Welcome Animation Overlay */}
      <WelcomeOverlay show={showWelcome} onDone={handleWelcomeDone} />
    </div>
  )
}
