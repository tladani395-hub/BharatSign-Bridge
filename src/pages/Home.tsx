import { useState } from "react"
import { Link } from "react-router-dom"
import {
  Sparkles,
  Layers,
  BookOpen,
  Globe2,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  Camera,
  Volume2,
  Cpu,
  Building2,
} from "lucide-react"
import ThreeAvatar from "@/components/avatar/ThreeAvatar"
import type { SignGesture } from "@/components/avatar/ThreeAvatar"
import { Button } from "@/components/ui/button"
import { INDIC_LANGUAGES, speakText } from "@/lib/speech"
import ConstellationCanvas from "@/components/home/ConstellationCanvas"
import NetworkMarquee from "@/components/home/NetworkMarquee"

interface HomeProps {
  currentLanguage: string
  onLanguageChange: (code: string) => void
}

export default function Home({ currentLanguage, onLanguageChange }: HomeProps) {
  const [heroGesture, setHeroGesture] = useState<SignGesture>("NAMASTE")
  const [signingSpeed, setSigningSpeed] = useState<number>(1.0)

  const currentLangObj =
    INDIC_LANGUAGES.find((l) => l.code === currentLanguage) || INDIC_LANGUAGES[0]

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans relative overflow-x-hidden">
      {/* 1. Cinematic Hero Section with Constellation Canvas */}
      <section className="relative overflow-hidden bg-gradient-to-b from-card via-background to-background border-b border-border py-16 lg:py-24">
        {/* Interactive Holographic Particle Canvas */}
        <ConstellationCanvas />

        {/* Floating Cyber Glow Spheres */}
        <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 blur-3xl rounded-full pointer-events-none animate-pulse-glow" />
        <div className="absolute top-1/3 right-10 w-80 h-80 bg-cyan-500/15 blur-3xl rounded-full pointer-events-none animate-float-reverse" />
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-purple-500/10 blur-3xl rounded-full pointer-events-none" />

        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Vision & Actions */}
            <div className="lg:col-span-7 flex flex-col items-start gap-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary border border-primary/25 shadow-sm animate-float">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>ISLRTC & MSJE Standardized Platform</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-foreground">
                Next-Gen <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-cyan-400 to-indigo-400 animate-pulse">Indian Sign Language</span> AI Ecosystem
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
                Empowering 18+ million deaf citizens across India with photorealistic 3D avatars, sub-50ms MediaPipe camera recognition, multilingual voice synthesis, and research-grade ISLRTC learning portals.
              </p>

              {/* Action Buttons with High-Tech Shadows */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link to="/live-camera">
                  <Button className="gap-2.5 text-sm font-extrabold shadow-xl bg-gradient-to-r from-cyan-500 via-primary to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white h-12 px-6 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-cyan-500/25">
                    <Camera className="h-4 w-4" />
                    <span>Live Camera AI</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>

                <Link to="/public-desk">
                  <Button variant="outline" className="gap-2 text-sm font-bold border-emerald-500/40 hover:bg-emerald-500/10 h-12 px-5 rounded-2xl hover:border-emerald-400 text-foreground transition-all">
                    <Building2 className="h-4 w-4 text-emerald-400" />
                    <span>Jan-Suvidha Public Desk</span>
                  </Button>
                </Link>

                <Link to="/translate">
                  <Button variant="outline" className="gap-2 text-sm font-bold border-cyan-500/40 hover:bg-cyan-500/10 h-12 px-5 rounded-2xl hover:border-cyan-400 transition-all">
                    <Sparkles className="h-4 w-4 text-cyan-400" />
                    <span>Text to 3D Avatar</span>
                  </Button>
                </Link>

                <Link to="/learn">
                  <Button variant="ghost" className="gap-2 text-sm font-bold text-primary hover:bg-primary/10 h-12 px-4 rounded-2xl">
                    <BookOpen className="h-4 w-4" />
                    <span>Learn Signs</span>
                  </Button>
                </Link>
              </div>

              {/* Key Quantitative Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full pt-4">
                <div className="p-3 rounded-2xl bg-card/60 backdrop-blur-md border border-border shadow-sm flex flex-col">
                  <span className="text-2xl font-black text-foreground">18.2M+</span>
                  <span className="text-[11px] text-muted-foreground">Deaf Community</span>
                </div>
                <div className="p-3 rounded-2xl bg-card/60 backdrop-blur-md border border-cyan-500/30 shadow-sm flex flex-col">
                  <span className="text-2xl font-black text-cyan-400">13</span>
                  <span className="text-[11px] text-muted-foreground">Indic Languages</span>
                </div>
                <div className="p-3 rounded-2xl bg-card/60 backdrop-blur-md border border-emerald-500/30 shadow-sm flex flex-col">
                  <span className="text-2xl font-black text-emerald-400">&lt;50ms</span>
                  <span className="text-[11px] text-muted-foreground">ML Inference</span>
                </div>
                <div className="p-3 rounded-2xl bg-card/60 backdrop-blur-md border border-purple-500/30 shadow-sm flex flex-col">
                  <span className="text-2xl font-black text-purple-400">10,000+</span>
                  <span className="text-[11px] text-muted-foreground">ISLRTC Signs</span>
                </div>
              </div>
            </div>

            {/* Right Column: 3D Human Avatar Rig */}
            <div className="lg:col-span-5 flex flex-col gap-4 relative">
              {/* Outer Neon Glow Ring */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-cyan-500/30 rounded-3xl blur-2xl -z-10 opacity-70 animate-pulse-glow" />

              <div className="rounded-3xl bg-card/95 border border-cyan-500/30 p-5 shadow-2xl relative backdrop-blur-xl">
                <div className="flex items-center justify-between text-xs pb-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="font-extrabold text-foreground">3D Human Presenter</span>
                  </div>
                  <span className="font-mono text-cyan-400 text-[11px] px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40">
                    Kinematics: {heroGesture}
                  </span>
                </div>

                <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden bg-slate-950 relative mt-3 border border-border/80">
                  <ThreeAvatar
                    activeGesture={heroGesture}
                    signingSpeed={signingSpeed}
                    showControls={false}
                    initialCameraView="upper-body"
                  />
                  <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-white border border-white/10 flex items-center gap-1.5">
                    <Cpu className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Real-Time Biomechanical Rig</span>
                  </div>
                </div>

                {/* Gesture Selector Pills */}
                <div className="flex flex-wrap items-center gap-1.5 pt-3">
                  <span className="text-[11px] font-semibold text-muted-foreground mr-1">
                    Try Gesture:
                  </span>
                  {(["NAMASTE", "HELLO", "THANK_YOU", "WELCOME", "STUDENT", "HELP", "WATER", "INDIA"] as SignGesture[]).map((g) => (
                    <button
                      key={g}
                      onClick={() => setHeroGesture(g)}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
                        heroGesture === g
                          ? "bg-gradient-to-r from-primary to-cyan-500 text-white shadow-md scale-105"
                          : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>

                {/* Speed & Audio controls */}
                <div className="flex items-center justify-between pt-3 border-t border-border text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground text-[11px]">Speed:</span>
                    {[0.5, 1.0].map((s) => (
                      <button
                        key={s}
                        onClick={() => setSigningSpeed(s)}
                        className={`px-2 py-0.5 rounded-lg text-[11px] font-bold ${
                          signingSpeed === s ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => speakText(heroGesture, currentLanguage)}
                    className="gap-1.5 text-xs text-primary hover:underline h-8 font-bold"
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                    <span>Hear in {currentLangObj.name}</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Live Telemetry Network Marquee Ticker */}
      <NetworkMarquee />

      {/* 3. Spoken Voice Language Selector Ribbon */}
      <div className="w-full border-b border-border/70 bg-card/40 py-3">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Globe2 className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-xs font-bold text-foreground">
              Spoken Voice Output Language:
            </span>
            <span className="text-[11px] text-muted-foreground hidden sm:inline">
              (AI will speak aloud in this language)
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full py-0.5">
            {INDIC_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  onLanguageChange(lang.code)
                  speakText(lang.native, lang.code)
                }}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  currentLanguage === lang.code
                    ? "bg-primary text-white shadow-md scale-105"
                    : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
                }`}
              >
                {lang.native} ({lang.name})
              </button>
            ))}
          </div>
        </div>
      </div>



      {/* 5. Three Main Pillars: Communication, Learning, Research */}
      <section className="py-20 border-b border-border bg-card/40">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col gap-12">
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary border border-primary/20 mb-3">
              <Layers className="h-3.5 w-3.5" />
              <span>Comprehensive Ecosystem</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Everything Needed for Deaf-Hearing Inclusion
            </h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
              Engineered with modern WebAssembly, Three.js 3D character kinematics, and MediaPipe computer vision.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pillar 1: Communication */}
            <div className="rounded-3xl bg-card border border-border p-6 flex flex-col justify-between hover:shadow-2xl transition-all hover:border-primary/50 group hover:-translate-y-1">
              <div className="flex flex-col gap-4">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Multilingual Communication</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Convert text, speech, and live camera gestures seamlessly. Real-time NLP glossing breaks sentences into Time-Subject-Object-Verb syntax and fingerspells proper nouns.
                </p>
                <div className="flex flex-col gap-2 pt-2 border-t border-border text-xs">
                  <Link to="/translate" className="text-primary hover:underline flex items-center justify-between">
                    <span>Text to ISL Translation</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                  <Link to="/speech-to-isl" className="text-primary hover:underline flex items-center justify-between">
                    <span>Speech to ISL Avatar</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                  <Link to="/conversation" className="text-primary hover:underline flex items-center justify-between">
                    <span>Two-Way Live Room</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                  <Link to="/public-desk" className="text-emerald-400 font-bold hover:underline flex items-center justify-between">
                    <span>Jan-Suvidha Public Desk</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              <Link to="/translate" className="mt-6">
                <Button className="w-full text-xs font-bold bg-primary hover:bg-primary/90 text-white rounded-xl">
                  Open Communication Suite
                </Button>
              </Link>
            </div>

            {/* Pillar 2: Interactive Learning */}
            <div className="rounded-3xl bg-card border border-border p-6 flex flex-col justify-between hover:shadow-2xl transition-all hover:border-cyan-500/50 group hover:-translate-y-1">
              <div className="flex flex-col gap-4">
                <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                  <BookOpen className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Structured Learning Portal</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Dedicated lesson pages for all 26 alphabets (A–Z), 10 numeric digits (0–9), and vocabulary signs. Compare against official ISLRTC & MSJE posters.
                </p>
                <div className="flex flex-col gap-2 pt-2 border-t border-border text-xs">
                  <Link to="/learn/alphabet" className="text-cyan-400 hover:underline flex items-center justify-between">
                    <span>26 Alphabets (A to Z)</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                  <Link to="/learn/numbers" className="text-cyan-400 hover:underline flex items-center justify-between">
                    <span>10 Numbers (0 to 9)</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                  <Link to="/learn/practice" className="text-cyan-400 hover:underline flex items-center justify-between">
                    <span>AI Practice Room</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              <Link to="/learn" className="mt-6">
                <Button className="w-full text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl">
                  Enter Learning Portal
                </Button>
              </Link>
            </div>

            {/* Pillar 3: Research & Validation */}
            <div className="rounded-3xl bg-card border border-border p-6 flex flex-col justify-between hover:shadow-2xl transition-all hover:border-emerald-500/50 group hover:-translate-y-1">
              <div className="flex flex-col gap-4">
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Research & Expert Review</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Linguist and deaf educator validation workflows. Inspect dataset schemas, multi-regional variants, precision metrics, and academic paper citations.
                </p>
                <div className="flex flex-col gap-2 pt-2 border-t border-border text-xs">
                  <Link to="/research" className="text-emerald-400 hover:underline flex items-center justify-between">
                    <span>Research Portal & Paper</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                  <Link to="/expert-review" className="text-emerald-400 hover:underline flex items-center justify-between">
                    <span>Expert Review Workflow</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                  <Link to="/about" className="text-emerald-400 hover:underline flex items-center justify-between">
                    <span>Standards & Consortium</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              <Link to="/research" className="mt-6">
                <Button className="w-full text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl">
                  Explore Research Portal
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
