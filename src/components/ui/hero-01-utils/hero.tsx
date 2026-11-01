import { useState } from "react"
import {
  Sparkles,
  ArrowRight,
  Camera,
  CheckCircle2,
  Cpu,
  Activity,
  Layers,
  Award,
  BookOpen,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export interface AvatarList {
  image: string
}

interface HeroSectionProps {
  avatarList: AvatarList[]
}

export default function HeroSection({ avatarList }: HeroSectionProps) {
  const [activeTab, setActiveTab] = useState<"avatar" | "landmarks" | "holistic">("avatar")

  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-16 md:pb-28 lg:pt-20 lg:pb-32 bg-gradient-to-b from-background via-card/50 to-background">
      {/* Background radial glow effect */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-primary/15 via-cyan-500/10 to-indigo-500/10 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/10 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute top-2/3 -left-32 w-96 h-96 bg-cyan-500/10 blur-3xl pointer-events-none rounded-full" />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Headline, Description & CTAs */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            
            {/* Pill Announcement */}
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary backdrop-blur-sm shadow-sm hover:bg-primary/10 transition-colors mb-6">
              <span className="flex h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
              <span>National Research Initiative — Indian Sign Language AI</span>
              <span className="text-muted-foreground">|</span>
              <span className="text-xs text-foreground/80 flex items-center gap-1">
                ISLRTC Aligned <Sparkles className="h-3 w-3 text-cyan-500" />
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.12]">
              Communication Has{" "}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">
                No Barriers.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-5 text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
              <strong className="text-foreground font-semibold">BharatSign-Bridge</strong> is a research-grade,
              multilingual AI ecosystem uniting <span className="text-foreground">real-time MediaPipe holistic sign recognition</span>,
              natural <span className="text-foreground">3D digital human avatars</span>, bidirectional speech-to-sign translation,
              and interactive ISLRTC-standard curriculum.
            </p>

            {/* Feature Checkpoints */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-xl text-xs sm:text-sm text-foreground/85">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Two-Way Sign ⇄ Multi-Language Speech</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>3D Avatar with Facial Blendshapes</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>ISLTranslate & ISH-NEWS Continuous Models</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>13 Indian Spoken Languages Supported</span>
              </div>
            </div>

            {/* CTA Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <a href="#live-translator">
                <Button size="lg" className="h-12 px-6 gap-2 bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all">
                  <Camera className="h-4 w-4" />
                  <span>Start Live Translation</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </a>

              <a href="#learning-portal">
                <Button size="lg" variant="outline" className="h-12 px-6 gap-2 border-border/80 hover:bg-muted font-semibold">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <span>Learn ISL (A-Z & 0-9)</span>
                </Button>
              </a>

              <a href="#research-lab">
                <Button size="lg" variant="ghost" className="h-12 px-4 gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                  <Cpu className="h-3.5 w-3.5" />
                  <span>Research Papers (18)</span>
                </Button>
              </a>
            </div>

            {/* Social Proof & Avatars */}
            <div className="mt-10 pt-6 border-t border-border/60 flex flex-wrap items-center gap-6">
              <div className="flex -space-x-3 overflow-hidden">
                {avatarList.map((avatar, idx) => (
                  <img
                    key={idx}
                    className="inline-block h-10 w-10 rounded-full ring-2 ring-background object-cover shadow-sm"
                    src={avatar.image}
                    alt={`Signer & researcher ${idx + 1}`}
                  />
                ))}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <div className="flex text-amber-500 text-sm">★★★★★</div>
                  <span className="text-xs font-bold text-foreground ml-1">4.92 / 5.0</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Empowering <strong className="text-foreground">15,000+</strong> deaf students, educators & AI researchers
                </p>
              </div>
            </div>

          </div>

          {/* Right Column: Interactive 3D Avatar & Vision Landmark Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-lg lg:max-w-none rounded-2xl border border-border/70 bg-card/70 p-3 shadow-2xl backdrop-blur-xl">
              
              {/* Card Header / Tabs */}
              <div className="flex items-center justify-between border-b border-border/60 pb-3 px-2">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-rose-500/80 inline-block" />
                  <span className="h-3 w-3 rounded-full bg-amber-500/80 inline-block" />
                  <span className="h-3 w-3 rounded-full bg-emerald-500/80 inline-block" />
                  <span className="text-xs font-semibold text-muted-foreground ml-1.5 flex items-center gap-1">
                    <Activity className="h-3.5 w-3.5 text-primary" /> Real-Time Pipeline
                  </span>
                </div>
                <div className="flex items-center gap-1 rounded-lg bg-muted/60 p-1 text-[11px] font-medium">
                  <button
                    onClick={() => setActiveTab("avatar")}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      activeTab === "avatar"
                        ? "bg-background text-primary shadow-sm font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    3D Avatar
                  </button>
                  <button
                    onClick={() => setActiveTab("landmarks")}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      activeTab === "landmarks"
                        ? "bg-background text-primary shadow-sm font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    3D Skeleton
                  </button>
                  <button
                    onClick={() => setActiveTab("holistic")}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      activeTab === "holistic"
                        ? "bg-background text-primary shadow-sm font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Holistic Vision
                  </button>
                </div>
              </div>

              {/* Main Visual Screen */}
              <div className="relative mt-2 aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-950 flex items-center justify-center border border-border/30 group">
                {activeTab === "avatar" && (
                  <div className="relative w-full h-full">
                    <img
                      src="/assets/avatar_expressions.png"
                      alt="3D Human Sign Language Avatar"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                      <div className="flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700">
                        <Layers className="h-3.5 w-3.5 text-cyan-400" />
                        <span>Facial Blendshapes & Procedural Animation</span>
                      </div>
                      <span className="text-[10px] text-cyan-300 font-mono bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
                        60 FPS Rigged
                      </span>
                    </div>
                  </div>
                )}

                {activeTab === "landmarks" && (
                  <div className="relative w-full h-full bg-slate-900 flex items-center justify-center p-2">
                    <img
                      src="/assets/hand_landmarks_3d.png"
                      alt="3D Hand Skeleton Coordinate Extraction"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                      <div className="flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700">
                        <Cpu className="h-3.5 w-3.5 text-emerald-400" />
                        <span>21 3D Joint Coordinates (x, y, z)</span>
                      </div>
                      <span className="text-[10px] text-emerald-300 font-mono bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                        Normalized
                      </span>
                    </div>
                  </div>
                )}

                {activeTab === "holistic" && (
                  <div className="relative w-full h-full bg-slate-900">
                    <img
                      src="/assets/mediapipe_holistic.png"
                      alt="MediaPipe Holistic Face and Hand Landmark Extraction"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                      <div className="flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700">
                        <Activity className="h-3.5 w-3.5 text-cyan-400" />
                        <span>468 Face + 42 Hand + 33 Pose Landmarks</span>
                      </div>
                      <span className="text-[10px] text-amber-300 font-mono bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
                        Live Tracking
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Sub-card live indicators */}
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-card p-2 border border-border/50">
                  <div className="text-[11px] text-muted-foreground">Recognized Sign</div>
                  <div className="text-xs font-bold text-foreground truncate mt-0.5">"नमस्ते" (Hello)</div>
                </div>
                <div className="rounded-lg bg-card p-2 border border-border/50">
                  <div className="text-[11px] text-muted-foreground">Model Confidence</div>
                  <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">98.4% ISL</div>
                </div>
                <div className="rounded-lg bg-card p-2 border border-border/50">
                  <div className="text-[11px] text-muted-foreground">Target Voice</div>
                  <div className="text-xs font-bold text-primary truncate mt-0.5">Gujarati / Hindi</div>
                </div>
              </div>

            </div>

            {/* Floating decorative badge */}
            <div className="absolute -bottom-6 -left-4 sm:-bottom-8 sm:-left-6 hidden sm:flex items-center gap-3 rounded-xl border border-border/80 bg-background/95 p-3.5 shadow-xl backdrop-blur-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-md">
                <Award className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-foreground">ACL & Nature Scientific Reports</span>
                <span className="text-[11px] text-muted-foreground">Backed by 18 peer-reviewed ISL papers</span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  )
}
