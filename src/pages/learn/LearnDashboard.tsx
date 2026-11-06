import { useState } from "react"
import { Link } from "react-router-dom"
import {
  Award,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Camera,
  ArrowRight,
  Zap,
} from "lucide-react"
import ThreeAvatar from "@/components/avatar/ThreeAvatar"
import Breadcrumbs from "@/components/layout/Breadcrumbs"
import { Button } from "@/components/ui/button"

export default function LearnDashboard() {
  const [featuredSign, setFeaturedSign] = useState("NAMASTE")

  return (
    <div className="min-h-screen bg-background text-foreground py-8">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col gap-8">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs items={[{ label: "Learning Portal" }]} />

        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-primary/30 to-slate-900 border border-border p-8 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold text-primary border border-primary/30 self-start">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Interactive ISL Curriculum</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground">
                Master Indian Sign Language with 3D AI Avatars
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground max-w-xl leading-relaxed">
                Step-by-step interactive lessons following the official ISLRTC & MSJE curriculum. Practice finger spelling, numbers, and vocabulary with instant AI camera feedback.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link to="/learn/alphabet">
                  <Button className="gap-2 text-xs font-bold shadow-lg bg-primary hover:bg-primary/90 text-white">
                    <span>Start Alphabets (A–Z)</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/learn/practice">
                  <Button variant="outline" className="gap-2 text-xs font-bold border-border hover:bg-muted">
                    <Camera className="h-4 w-4 text-cyan-400" />
                    <span>Open AI Practice Room</span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Avatar Presenter Spotlight */}
            <div className="lg:col-span-5 aspect-[4/3] rounded-2xl overflow-hidden bg-slate-950 border border-border/80 shadow-2xl relative">
              <ThreeAvatar
                activeGesture={featuredSign}
                signingSpeed={1.0}
                showControls={false}
                initialCameraView="upper-body"
              />
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white border border-white/10 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Sign: {featuredSign}</span>
              </div>

              <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-md p-1 rounded-xl border border-white/10">
                {["NAMASTE", "HELLO", "WATER", "INDIA"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setFeaturedSign(s)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-colors ${
                      featuredSign === s ? "bg-primary text-white" : "text-white/70 hover:text-white"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "ISLRTC Alphabets", value: "26 Letters", desc: "A to Z with 2-hand & 1-hand rules", href: "/learn/alphabet" },
            { label: "MSJE Numbers", value: "10 Digits", desc: "0 to 9 standard numeric system", href: "/learn/numbers" },
            { label: "Core Vocabulary", value: "48+ Words", desc: "Greetings, food, emergencies & more", href: "/learn/words" },
            { label: "Interactive Quizzes", value: "Real-Time AI", desc: "Computer vision sign verification", href: "/learn/quizzes" },
          ].map((stat, i) => (
            <Link
              key={i}
              to={stat.href}
              className="p-5 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all hover:shadow-lg group flex flex-col justify-between"
            >
              <div>
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </span>
                <div className="text-2xl font-black text-foreground group-hover:text-primary transition-colors mt-1">
                  {stat.value}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{stat.desc}</p>
              </div>
              <div className="mt-4 flex items-center text-xs font-bold text-primary gap-1 group-hover:translate-x-1 transition-transform">
                <span>Explore</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </div>
            </Link>
          ))}
        </div>

        {/* Learning Tracks Section */}
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-black tracking-tight text-foreground">
            Structured Learning Tracks
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Track 1: Alphabets */}
            <div className="rounded-2xl bg-card border border-border p-6 flex flex-col justify-between hover:shadow-xl transition-all">
              <div className="flex flex-col gap-3">
                <div className="h-12 w-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-black text-xl border border-indigo-500/20">
                  A-Z
                </div>
                <h3 className="text-xl font-bold text-foreground">Alphabet Finger Spelling</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Learn to spell proper nouns, personal names, and locations using ISLRTC standard 2-handed and 1-handed handshapes.
                </p>
                <div className="flex items-center gap-2 text-xs text-indigo-400 font-semibold">
                  <ShieldCheck className="h-4 w-4" />
                  <span>26 Dedicated Lessons</span>
                </div>
              </div>

              <Link to="/learn/alphabet" className="mt-6">
                <Button variant="outline" className="w-full gap-2 text-xs font-bold border-indigo-500/40 text-indigo-400 hover:bg-indigo-500/10">
                  <span>Browse Alphabets</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Track 2: Numbers */}
            <div className="rounded-2xl bg-card border border-border p-6 flex flex-col justify-between hover:shadow-xl transition-all">
              <div className="flex flex-col gap-3">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-black text-xl border border-emerald-500/20">
                  0-9
                </div>
                <h3 className="text-xl font-bold text-foreground">Numeric Digits & Counting</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Understand Indian Sign Language number conventions, including special rules for digits 6 and 9 as certified by MSJE.
                </p>
                <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                  <ShieldCheck className="h-4 w-4" />
                  <span>10 Interactive Lessons</span>
                </div>
              </div>

              <Link to="/learn/numbers" className="mt-6">
                <Button variant="outline" className="w-full gap-2 text-xs font-bold border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10">
                  <span>Browse Numbers</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Track 3: Vocabulary */}
            <div className="rounded-2xl bg-card border border-border p-6 flex flex-col justify-between hover:shadow-xl transition-all">
              <div className="flex flex-col gap-3">
                <div className="h-12 w-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-black text-xl border border-cyan-500/20">
                  ISL
                </div>
                <h3 className="text-xl font-bold text-foreground">Everyday Lexical Words</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  High-frequency communicative signs covering polite greetings, family, healthcare, emergency requests, and questions.
                </p>
                <div className="flex items-center gap-2 text-xs text-cyan-400 font-semibold">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Multi-Regional Dialects</span>
                </div>
              </div>

              <Link to="/learn/words" className="mt-6">
                <Button variant="outline" className="w-full gap-2 text-xs font-bold border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10">
                  <span>Browse Lexicon</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* AI Camera Practice & Quiz Callout Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-primary/10 via-cyan-500/10 to-transparent border border-border p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shrink-0">
              <Zap className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">
                Ready to test your signing skills?
              </h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-lg">
                Enter the Practice Room to get live MediaPipe kinematic feedback or take interactive quizzes to earn badges.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link to="/learn/practice">
              <Button className="gap-2 text-xs font-bold bg-primary hover:bg-primary/90 text-white shadow-md">
                <Camera className="h-4 w-4" />
                <span>Practice Room</span>
              </Button>
            </Link>
            <Link to="/learn/quizzes">
              <Button variant="outline" className="gap-2 text-xs font-bold">
                <Award className="h-4 w-4 text-amber-400" />
                <span>Take Quiz</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
