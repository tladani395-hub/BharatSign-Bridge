import { Link } from "react-router-dom"
import Logo from "@/components/brand/Logo"

export default function Footer() {
  return (
    <footer className="border-t border-border bg-[#0B1528] text-slate-300 py-12">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col gap-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Col 1: Brand & Mission */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Logo variant="full" size="md" />
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              BharatSign Bridge 2.0 is an academic and research-oriented Indian Sign Language (ISL) communication ecosystem combining realistic 3D human digital presenters, computer vision gesture recognition, and 13 Indian languages.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>FastAPI Backend Active (127.0.0.1:8000)</span>
            </div>
          </div>

          {/* Col 2: Communication Suite */}
          <div className="flex flex-col gap-2.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Communication
            </h4>
            <Link to="/translate" className="text-xs text-slate-400 hover:text-white transition-colors">
              Text to ISL
            </Link>
            <Link to="/speech-to-isl" className="text-xs text-slate-400 hover:text-white transition-colors">
              Speech to ISL
            </Link>
            <Link to="/isl-to-text" className="text-xs text-slate-400 hover:text-white transition-colors">
              Sign to Text
            </Link>
            <Link to="/live-camera" className="text-xs text-slate-400 hover:text-white transition-colors">
              Live Camera Recognition
            </Link>
            <Link to="/conversation" className="text-xs text-slate-400 hover:text-white transition-colors">
              Two-Way Conversation
            </Link>
          </div>

          {/* Col 3: Learning Portal */}
          <div className="flex flex-col gap-2.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Learning Portal
            </h4>
            <Link to="/learn/alphabet" className="text-xs text-slate-400 hover:text-white transition-colors">
              Alphabets (A to Z)
            </Link>
            <Link to="/learn/numbers" className="text-xs text-slate-400 hover:text-white transition-colors">
              Numbers (0 to 9)
            </Link>
            <Link to="/learn/words" className="text-xs text-slate-400 hover:text-white transition-colors">
              Vocabulary Lexicon
            </Link>
            <Link to="/learn/practice" className="text-xs text-slate-400 hover:text-white transition-colors">
              Camera Practice Room
            </Link>
            <Link to="/learn/quizzes" className="text-xs text-slate-400 hover:text-white transition-colors">
              Adaptive Quizzes
            </Link>
          </div>

          {/* Col 4: Research & Governance */}
          <div className="flex flex-col gap-2.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Research & Compliance
            </h4>
            <Link to="/research/papers" className="text-xs text-slate-400 hover:text-white transition-colors">
              Academic Publications
            </Link>
            <Link to="/research/datasets" className="text-xs text-slate-400 hover:text-white transition-colors">
              Datasets & Licensing
            </Link>
            <Link to="/research/methodology" className="text-xs text-slate-400 hover:text-white transition-colors">
              Methodology & Rigging
            </Link>
            <Link to="/expert-review" className="text-xs text-slate-400 hover:text-white transition-colors">
              Expert Review Workflow
            </Link>
            <Link to="/accessibility" className="text-xs text-slate-400 hover:text-white transition-colors">
              Accessibility (WCAG 2.2 AAA)
            </Link>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div className="flex items-center gap-2">
            <span>© 2026 BharatSign Bridge AI Research Consortium.</span>
            <span>•</span>
            <span>Aligned with ISLRTC & DEPwD standards.</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/accessibility" className="hover:text-slate-300">
              Accessibility
            </Link>
            <Link to="/settings" className="hover:text-slate-300">
              Settings & Privacy
            </Link>
            <Link to="/contact" className="hover:text-slate-300">
              Institutional Inquiries
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
