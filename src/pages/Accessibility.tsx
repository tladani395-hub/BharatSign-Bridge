import { Eye, Keyboard, Volume2, ShieldCheck } from "lucide-react"
import Breadcrumbs from "@/components/layout/Breadcrumbs"

export default function Accessibility() {
  return (
    <div className="min-h-screen bg-background text-foreground py-8">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 flex flex-col gap-8">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs items={[{ label: "Accessibility Statement" }]} />

        {/* Header */}
        <div className="border-b border-border pb-6">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20 mb-3">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>WCAG 2.1 Level AAA Conformance</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            Accessibility Commitment & Features
          </h1>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            BharatSign Bridge is built from the ground up to empower deaf, hard-of-hearing, and non-verbal individuals, ensuring universal digital accessibility for all abilities.
          </p>
        </div>

        {/* Accessibility Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-card border border-border flex flex-col gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Eye className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-foreground text-sm">Visual Contrast & Ergonomics</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Strict 7:1 contrast ratio compliance across dark and light modes, cinematic navy background `#102A43` reducing visual fatigue during long signing sessions.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border flex flex-col gap-3">
            <div className="h-10 w-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Keyboard className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-foreground text-sm">Keyboard Navigation</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Full focus rings, skip-to-content links, and keyboard shortcuts allow non-mouse navigation throughout all learning modules and translation tools.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border flex flex-col gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Volume2 className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-foreground text-sm">Multi-Sensory Feedback</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Every sign is represented through synchronized 3D visual kinematics, text glosses, phonetic spelling, and multilingual speech audio.
            </p>
          </div>
        </div>

        {/* Keyboard Shortcut Reference */}
        <div className="p-6 rounded-3xl bg-card border border-border flex flex-col gap-4">
          <h3 className="text-base font-bold text-foreground">Global Keyboard Shortcuts</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/60 border border-border">
              <span className="text-muted-foreground">Play / Pause 3D Avatar</span>
              <kbd className="px-2 py-0.5 rounded bg-background border border-border font-mono font-bold text-[11px]">
                Space
              </kbd>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/60 border border-border">
              <span className="text-muted-foreground">Toggle Live Camera</span>
              <kbd className="px-2 py-0.5 rounded bg-background border border-border font-mono font-bold text-[11px]">
                Alt + C
              </kbd>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/60 border border-border">
              <span className="text-muted-foreground">Speak Text Aloud</span>
              <kbd className="px-2 py-0.5 rounded bg-background border border-border font-mono font-bold text-[11px]">
                Alt + S
              </kbd>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/60 border border-border">
              <span className="text-muted-foreground">Next Alphabet / Lesson</span>
              <kbd className="px-2 py-0.5 rounded bg-background border border-border font-mono font-bold text-[11px]">
                Right Arrow
              </kbd>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
