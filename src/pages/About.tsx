import { Link } from "react-router-dom"
import {
  ShieldCheck,
  Award,
  FileText,
  ChevronRight,
} from "lucide-react"
import Breadcrumbs from "@/components/layout/Breadcrumbs"
import { Button } from "@/components/ui/button"

export default function About() {
  return (
    <div className="min-h-screen bg-background text-foreground py-8">
      <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 flex flex-col gap-8">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs items={[{ label: "About BharatSign Bridge" }]} />

        {/* Header */}
        <div className="border-b border-border pb-6">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary border border-primary/20 mb-3">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>National Accessibility Mission</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground">
            About BharatSign Bridge 2.0
          </h1>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground leading-relaxed max-w-3xl">
            BharatSign Bridge is an academic research and engineering platform designed to eliminate linguistic barriers for India's 18+ million deaf citizens through 3D avatar kinematics, real-time computer vision, and multilingual speech processing.
          </p>
        </div>

        {/* Mission Statement Banner */}
        <div className="rounded-3xl bg-gradient-to-br from-primary/15 via-card to-card border border-border p-8 shadow-xl">
          <h2 className="text-xl font-bold text-foreground mb-3">Our Core Objectives</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-muted-foreground leading-relaxed">
            <div>
              <strong className="text-foreground text-sm block mb-1">Standard Preservation</strong>
              Strict adherence to Indian Sign Language Research and Training Centre (ISLRTC) and Ministry of Social Justice & Empowerment (MSJE) guidelines, preserving authentic one-handed vs. two-handed distinctions.
            </div>
            <div>
              <strong className="text-foreground text-sm block mb-1">Low-Latency Inclusion</strong>
              Sub-50ms MediaPipe landmark tracking running completely client-side in browser WebAssembly without leaking personal video feeds.
            </div>
            <div>
              <strong className="text-foreground text-sm block mb-1">Multilingual Harmony</strong>
              Bidirectional cross-translation bridging ISL with 13 official Indian languages (Gujarati, Hindi, Marathi, Bengali, Tamil, etc.).
            </div>
          </div>
        </div>

        {/* Standards & Authority Endorsement */}
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-black tracking-tight text-foreground">
            Standard Reference Compliance
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 rounded-2xl bg-card border border-border flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-2">
                  <ShieldCheck className="h-5 w-5" />
                  <span>ISLRTC Alphabet System</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Letters A–Z follow the official ISLRTC chart. Distinct two-handed letters (A, B, D, E, F, G, H, J, K, M, N, P, Q, R, S, T, W, X, Y, Z) and one-handed letters (C, I, L, O, U, V) are rigorously enforced.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-border">
                <Link to="/learn/alphabet" className="text-xs text-primary font-bold hover:underline flex items-center gap-1">
                  <span>Explore 26 Alphabet Lessons</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm mb-2">
                  <Award className="h-5 w-5" />
                  <span>MSJE Numeric System</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Numeric digits 0 through 9 are authenticated against the Department of Empowerment of Persons with Disabilities, Govt. of India standard chart, including authentic gestures for digit 6 (pinky) and digit 9 (thumb down).
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-border">
                <Link to="/learn/numbers" className="text-xs text-cyan-400 font-bold hover:underline flex items-center gap-1">
                  <span>Explore 10 Number Lessons</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Research Consortium & University Demo Suitability */}
        <div className="p-6 rounded-3xl bg-card border border-border flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div>
            <h3 className="text-lg font-bold text-foreground">Academic Research & University Demonstrations</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-xl leading-relaxed">
              Designed as a reference platform suitable for international computer vision conferences, accessibility symposiums, and university demonstrations.
            </p>
          </div>

          <Link to="/research">
            <Button className="gap-2 text-xs font-bold bg-primary hover:bg-primary/90 text-white shrink-0">
              <FileText className="h-4 w-4" />
              <span>View Research Portal</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
