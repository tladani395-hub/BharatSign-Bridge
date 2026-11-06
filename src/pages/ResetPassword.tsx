import React, { useState, useEffect } from "react"
import { useSearchParams, useNavigate, Link } from "react-router-dom"
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  KeyRound,
  RefreshCw,
  Check,
  X,
  Zap,
  Sparkles,
} from "lucide-react"
import Logo from "@/components/brand/Logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { API_BASE_URL } from "@/config/api"

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const token = searchParams.get("token") || ""

  const [verifying, setVerifying] = useState(true)
  const [tokenValid, setTokenValid] = useState(false)
  const [verificationError, setVerificationError] = useState<string | null>(null)

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [hasErrorShake, setHasErrorShake] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)

  const triggerError = (msg: string) => {
    setSubmitError(msg)
    setHasErrorShake(true)
    setTimeout(() => setHasErrorShake(false), 450)
  }

  // Verify token on mount
  useEffect(() => {
    if (!token) {
      setVerifying(false)
      setTokenValid(false)
      setVerificationError("This password reset link is invalid or has expired. Please request a new link.")
      return
    }

    const checkToken = async () => {
      setVerifying(true)
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/auth/verify-reset-token?token=${encodeURIComponent(token)}`
        )
        const data = await res.json()
        if (!res.ok) {
          throw new Error(data.detail || "This password reset link is invalid or has expired. Please request a new link.")
        }
        setTokenValid(true)
      } catch (err: any) {
        setTokenValid(false)
        setVerificationError(
          err.message || "This password reset link is invalid or has expired. Please request a new link."
        )
      } finally {
        setVerifying(false)
      }
    }

    checkToken()
  }, [token])

  // Password requirements real-time checks
  const checks = {
    length: newPassword.length >= 8,
    uppercase: /[A-Z]/.test(newPassword),
    lowercase: /[a-z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    special: /[^A-Za-z0-9]/.test(newPassword),
  }

  const allRequirementsMet = Object.values(checks).every(Boolean)

  // Password strength calculation (4 segments)
  const calculateStrength = () => {
    if (!newPassword) return { score: 0, label: "Too weak", color: "bg-transparent" }
    let score = 0
    if (checks.length) score += 1
    if (checks.uppercase && checks.lowercase) score += 1
    if (checks.number) score += 1
    if (checks.special) score += 1
    if (newPassword.length >= 12) score += 1

    if (score <= 1) return { score: 1, label: "Weak", color: "bg-rose-500" }
    if (score === 2) return { score: 2, label: "Moderate", color: "bg-[#ffb23e]" }
    if (score === 3) return { score: 3, label: "Good", color: "bg-emerald-400" }
    return { score: 4, label: "Strong", color: "bg-emerald-600" }
  }

  const strength = calculateStrength()

  // Handle password submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    if (!allRequirementsMet) {
      triggerError("Please ensure all password requirements are satisfied.")
      return
    }

    if (newPassword !== confirmPassword) {
      triggerError("Passwords do not match. Please ensure both fields are identical.")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: token.trim(),
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.detail || "Unable to reset password.")
      }

      setResetSuccess(true)
    } catch (err: any) {
      triggerError(err.message || "Failed to update password. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#eceff8] dark:bg-[#060914] text-[#0e1430] dark:text-[#eef1ff] flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden font-body transition-colors duration-300">
      {/* Blurred Tinted Overlay with Slow-Drifting Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full bg-[#2f4bff]/20 dark:bg-[#2f4bff]/15 blur-[100px] animate-blob-drift-1" />
        <div className="absolute -bottom-32 -right-32 w-[520px] h-[520px] rounded-full bg-[#1fa2ff]/20 dark:bg-[#1fa2ff]/12 blur-[110px] animate-blob-drift-2" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] rounded-full bg-[#ffb23e]/10 dark:bg-[#ffb23e]/5 blur-[120px] pointer-events-none" />
      </div>

      {/* Split Card: Radius 28px */}
      <div className="w-full max-w-4xl relative z-10 animate-card-entrance">
        <div className="rounded-[28px] bg-white dark:bg-[#0e1328] border border-black/[0.08] dark:border-white/[0.08] shadow-[0_20px_60px_-15px_rgba(14,20,48,0.12),0_10px_25px_-5px_rgba(47,75,255,0.06)] dark:shadow-[0_25px_70px_-15px_rgba(0,0,0,0.7)] backdrop-blur-md overflow-hidden flex flex-col min-[820px]:flex-row">
          
          {/* ==================== LEFT BRAND PANEL ==================== */}
          <div className="hidden min-[820px]:flex min-[820px]:w-[45%] p-9 flex-col justify-between relative overflow-hidden bg-[radial-gradient(ellipse_at_top,_#1e295d_0%,_#0a1027_100%)]">
            {/* Subtle mesh background */}
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
              <div className="relative w-44 h-44 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#1fa2ff]/30 animate-orbit-spin" />
                <div className="absolute inset-3 rounded-full border border-[#2f4bff]/40 animate-orbit-counter" />

                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-gradient-to-r from-[#2f4bff] to-[#1fa2ff] shadow-[0_0_12px_#1fa2ff] animate-orbit-spin" />
                <div className="absolute -bottom-1 left-1/3 w-2.5 h-2.5 rounded-full bg-[#ffb23e] shadow-[0_0_10px_#ffb23e]" />
                <div className="absolute top-1/2 -right-1 w-2 h-2 rounded-full bg-[#10b981] shadow-[0_0_8px_#10b981]" />

                <div className="w-20 h-20 rounded-2xl flex flex-col items-center justify-center backdrop-blur-md bg-[#151c38]/90 border border-white/15 shadow-[0_0_25px_rgba(47,75,255,0.25)]">
                  <KeyRound className="w-9 h-9 text-[#1fa2ff]" />
                  <span className="text-[10px] font-bold tracking-wider uppercase mt-1 text-[#cbd5e1]">
                    Auth Portal
                  </span>
                </div>
              </div>

              <div className="text-center mt-6">
                <h2 className="font-heading font-extrabold text-xl text-white tracking-tight leading-snug">
                  Credential Recovery
                </h2>
                <p className="font-body text-xs text-[#9bb0db] mt-1.5 leading-relaxed">
                  Cryptographically verified password update portal.
                </p>
              </div>
            </div>

            {/* Bottom: Three Floating Glass Chips */}
            <div className="relative z-10 flex flex-col gap-2 pt-2">
              <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl backdrop-blur-md bg-white/[0.05] border border-white/10 text-xs font-semibold text-[#d4dcff] shadow-sm">
                <ShieldCheck className="h-3.5 w-3.5 text-[#10b981] shrink-0" />
                <span>Single-Use Hashed Token</span>
              </div>
              <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl backdrop-blur-md bg-white/[0.05] border border-white/10 text-xs font-semibold text-[#d4dcff] shadow-sm">
                <Zap className="h-3.5 w-3.5 text-[#ffb23e] shrink-0" />
                <span>30-Minute Token Lifespan</span>
              </div>
              <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl backdrop-blur-md bg-white/[0.05] border border-white/10 text-xs font-semibold text-[#d4dcff] shadow-sm">
                <Lock className="h-3.5 w-3.5 text-[#1fa2ff] shrink-0" />
                <span>Bcrypt Work Factor 12 Storage</span>
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
                <span>Secure Password Recovery</span>
              </div>
            </div>

            {verifying ? (
              /* Loading / Verifying State */
              <div className="py-12 flex flex-col items-center justify-center text-center gap-4">
                <RefreshCw className="h-9 w-9 text-[#2f4bff] animate-spin" />
                <div className="flex flex-col gap-1">
                  <h3 className="font-heading font-extrabold text-base text-[#0e1430] dark:text-[#eef1ff]">
                    Verifying Security Link...
                  </h3>
                  <p className="font-body text-xs text-[#586082] dark:text-[#828bb4]">
                    Validating cryptographic token authenticity and expiry.
                  </p>
                </div>
              </div>
            ) : !tokenValid ? (
              /* Token Invalid or Expired State */
              <div className="py-6 flex flex-col items-center text-center gap-4 animate-card-entrance">
                <div className="w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-500">
                  <AlertTriangle className="h-8 w-8" />
                </div>

                <div className="flex flex-col gap-1.5 max-w-sm">
                  <h2 className="font-heading font-extrabold text-lg text-[#0e1430] dark:text-[#eef1ff]">
                    Reset Link Invalid or Expired
                  </h2>
                  <p className="font-body text-xs text-[#586082] dark:text-[#828bb4] leading-relaxed">
                    {verificationError ||
                      "This password reset link is invalid or has expired. Please request a fresh reset link."}
                  </p>
                </div>

                <div className="w-full max-w-xs pt-4 flex flex-col gap-2.5">
                  <Link to="/forgot-password">
                    <Button className="w-full h-11 text-xs font-bold rounded-[14px] bg-gradient-to-r from-[#2f4bff] to-[#1fa2ff] text-white shadow-lg shadow-[#2f4bff]/20 btn-sheen hover:-translate-y-0.5 active:scale-[0.98] transition-all">
                      Request New Reset Link →
                    </Button>
                  </Link>
                  <Link
                    to="/login"
                    className="text-xs font-bold text-[#586082] dark:text-[#828bb4] hover:text-[#0e1430] dark:hover:text-[#eef1ff] text-center py-1 transition-colors"
                  >
                    Return to Login
                  </Link>
                </div>
              </div>
            ) : resetSuccess ? (
              /* Success State with SVG Stroke Checkmark */
              <div className="py-6 flex flex-col items-center text-center gap-5 animate-card-entrance">
                {/* Animated SVG Circle and Checkmark */}
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
                    Password Reset Complete!
                  </h2>
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-800 dark:text-emerald-200 text-xs font-medium leading-relaxed">
                    Your password has been securely updated. You can now log in using your new credentials.
                  </div>
                </div>

                <div className="w-full max-w-xs pt-2">
                  <Button
                    onClick={() => navigate("/login")}
                    className="w-full h-11 text-xs font-bold rounded-[14px] bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 btn-sheen hover:-translate-y-0.5 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <span>Back to Login</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              /* Active Reset Form */
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 animate-view-switch">
                <div className="flex flex-col gap-1">
                  <h1 className="font-heading font-extrabold text-xl text-[#0e1430] dark:text-[#eef1ff] tracking-tight">
                    Create a New Password
                  </h1>
                  <p className="font-body text-xs text-[#586082] dark:text-[#828bb4] leading-relaxed">
                    Create a strong, unique password conforming to national security standards.
                  </p>
                </div>

                {submitError && (
                  <div
                    className={`p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2 ${
                      hasErrorShake ? "animate-field-shake" : ""
                    }`}
                  >
                    <AlertTriangle className="h-4 w-4 shrink-0 text-rose-500" />
                    <span>{submitError}</span>
                  </div>
                )}

                {/* New Password Input */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="new-pwd" className="text-xs font-bold text-[#0e1430] dark:text-[#eef1ff]">
                    New Password
                  </Label>
                  <div className="relative">
                    <Lock className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#586082] dark:text-[#828bb4]" />
                    <Input
                      id="new-pwd"
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={8}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value)
                        setSubmitError(null)
                      }}
                      placeholder={showPassword ? "Enter new password" : "••••••••••••"}
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

                  {/* 4-Segment Password Strength Indicator */}
                  {newPassword.length > 0 && (
                    <div className="flex flex-col gap-1 mt-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-[#586082] dark:text-[#828bb4]">Strength:</span>
                        <span className="font-bold text-[#0e1430] dark:text-[#eef1ff]">
                          {strength.label}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-1 h-1.5 rounded-full overflow-hidden bg-[#e2e8f0] dark:bg-[#151b36]">
                        <div className={`h-full ${strength.score >= 1 ? strength.color : "bg-transparent"}`} />
                        <div className={`h-full ${strength.score >= 2 ? strength.color : "bg-transparent"}`} />
                        <div className={`h-full ${strength.score >= 3 ? strength.color : "bg-transparent"}`} />
                        <div className={`h-full ${strength.score >= 4 ? strength.color : "bg-transparent"}`} />
                      </div>
                    </div>
                  )}

                  {/* Requirements Checklist */}
                  <div className="p-3 rounded-xl bg-[#f3f5fb] dark:bg-[#151b36]/60 border border-[#d8e0f2] dark:border-[#222b4a] text-[11px] flex flex-col gap-1.5 mt-2">
                    <span className="font-bold text-[#0e1430] dark:text-[#eef1ff]">
                      Password Requirements:
                    </span>
                    <div className="grid grid-cols-1 gap-1">
                      <div
                        className={`flex items-center gap-1.5 transition-colors ${
                          checks.length ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-[#586082] dark:text-[#828bb4]"
                        }`}
                      >
                        {checks.length ? (
                          <Check className="h-3 w-3 shrink-0" />
                        ) : (
                          <X className="h-3 w-3 shrink-0 opacity-50" />
                        )}
                        <span>Minimum 8 characters</span>
                      </div>

                      <div
                        className={`flex items-center gap-1.5 transition-colors ${
                          checks.uppercase ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-[#586082] dark:text-[#828bb4]"
                        }`}
                      >
                        {checks.uppercase ? (
                          <Check className="h-3 w-3 shrink-0" />
                        ) : (
                          <X className="h-3 w-3 shrink-0 opacity-50" />
                        )}
                        <span>At least one uppercase letter (A-Z)</span>
                      </div>

                      <div
                        className={`flex items-center gap-1.5 transition-colors ${
                          checks.lowercase ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-[#586082] dark:text-[#828bb4]"
                        }`}
                      >
                        {checks.lowercase ? (
                          <Check className="h-3 w-3 shrink-0" />
                        ) : (
                          <X className="h-3 w-3 shrink-0 opacity-50" />
                        )}
                        <span>At least one lowercase letter (a-z)</span>
                      </div>

                      <div
                        className={`flex items-center gap-1.5 transition-colors ${
                          checks.number ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-[#586082] dark:text-[#828bb4]"
                        }`}
                      >
                        {checks.number ? (
                          <Check className="h-3 w-3 shrink-0" />
                        ) : (
                          <X className="h-3 w-3 shrink-0 opacity-50" />
                        )}
                        <span>At least one number (0-9)</span>
                      </div>

                      <div
                        className={`flex items-center gap-1.5 transition-colors ${
                          checks.special ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-[#586082] dark:text-[#828bb4]"
                        }`}
                      >
                        {checks.special ? (
                          <Check className="h-3 w-3 shrink-0" />
                        ) : (
                          <X className="h-3 w-3 shrink-0 opacity-50" />
                        )}
                        <span>At least one special character (!@#$%^&*)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Confirm Password Input */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="confirm-pwd" className="text-xs font-bold text-[#0e1430] dark:text-[#eef1ff]">
                    Confirm New Password
                  </Label>
                  <div className="relative">
                    <Lock className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#586082] dark:text-[#828bb4]" />
                    <Input
                      id="confirm-pwd"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      minLength={8}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value)
                        setSubmitError(null)
                      }}
                      placeholder={showConfirmPassword ? "Confirm new password" : "••••••••••••"}
                      className="pl-10 pr-10 h-11 rounded-[14px] bg-[#f3f5fb] dark:bg-[#151b36] border-[#d8e0f2] dark:border-[#222b4a] text-xs font-semibold focus:ring-4 focus:ring-[#2f4bff]/25 focus:border-[#2f4bff]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#586082] dark:text-[#828bb4] hover:text-[#0e1430] dark:hover:text-[#eef1ff] p-1 transition-colors"
                      title={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {confirmPassword && newPassword !== confirmPassword && (
                    <span className="text-[11px] text-rose-500 font-semibold">Passwords do not match.</span>
                  )}
                  {confirmPassword && newPassword === confirmPassword && (
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Passwords match!
                    </span>
                  )}
                </div>

                {/* Submit Action */}
                <Button
                  type="submit"
                  disabled={
                    submitting ||
                    !allRequirementsMet ||
                    !confirmPassword ||
                    newPassword !== confirmPassword
                  }
                  className="w-full h-11 text-xs font-bold rounded-[14px] bg-gradient-to-r from-[#2f4bff] to-[#1fa2ff] text-white shadow-lg shadow-[#2f4bff]/20 mt-2 btn-sheen hover:-translate-y-0.5 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <>
                      <span>Reset Password</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>

                <div className="text-center pt-2 border-t border-[#e2e8f0] dark:border-[#1f2747]">
                  <Link
                    to="/login"
                    className="text-xs font-bold text-[#586082] dark:text-[#828bb4] hover:text-[#0e1430] dark:hover:text-[#eef1ff] transition-colors"
                  >
                    ← Back to Login
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
