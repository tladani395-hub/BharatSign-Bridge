import React from "react"
import { Link, useLocation } from "react-router-dom"
import { Lock, ShieldCheck, ArrowRight, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuthAndTheme } from "@/context/AuthAndThemeContext"

interface ProtectedRouteProps {
  children?: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuthAndTheme()
  const location = useLocation()

  if (isAuthenticated) {
    return <>{children}</>
  }

  // Not signed in: Render Gate Screen
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-gradient-to-b from-background via-card/50 to-background">
      <div className="max-w-xl w-full rounded-3xl bg-card border border-primary/30 p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden flex flex-col items-center text-center gap-6">
        {/* Glow Spheres */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/15 blur-3xl rounded-full pointer-events-none" />

        {/* Lock Shield Icon */}
        <div className="relative">
          <div className="h-20 w-20 rounded-3xl bg-gradient-to-tr from-primary to-cyan-500 text-white flex items-center justify-center shadow-xl shadow-cyan-500/20 animate-pulse-glow">
            <Lock className="h-10 w-10" />
          </div>
          <span className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs border-2 border-card">
            ✓
          </span>
        </div>

        <div className="space-y-2 max-w-md">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Student Membership Access Required</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-foreground">
            Sign In to Access Learning Portal
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            BharatSign Bridge requires a free student sign-in to save your daily learning streaks 🔥, track mastered signs, and provide personalized AI voice guidance.
          </p>
        </div>

        {/* What gets unlocked */}
        <div className="w-full grid grid-cols-2 gap-2.5 p-4 rounded-2xl bg-muted/40 border border-border text-xs text-left">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>26 Alphabets (A to Z)</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>10 Numbers (0 to 9)</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Live Camera AI Grader</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Daily Streak Quizzes & Audio Guide</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="w-full">
          <Link to="/auth" state={{ from: location }} className="w-full block">
            <Button className="w-full h-12 rounded-2xl font-bold text-sm bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-400 text-white shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95">
              <span>Sign In / Sign Up to Continue</span>
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
