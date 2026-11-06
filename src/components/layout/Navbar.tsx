import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import {
  Menu,
  X,
  Globe2,
  ChevronDown,
  Layers,
  Sparkles,
  Camera,
  MessageSquare,
  BookOpen,
  Search,
  Activity,
  Award,
  Settings as SettingsIcon,
  Flame,
  User as UserIcon,
  Building2,
  Trophy,
  Download,
} from "lucide-react"
import Logo from "@/components/brand/Logo"
import { INDIC_LANGUAGES, speakText } from "@/lib/speech"
import ThreeDThemeToggle from "@/components/ui/ThreeDThemeToggle"
import { useAuthAndTheme } from "@/context/AuthAndThemeContext"

interface NavbarProps {
  currentLanguage: string
  onLanguageChange: (code: string) => void
}

export default function Navbar({ currentLanguage, onLanguageChange }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [commDropdownOpen, setCommDropdownOpen] = useState(false)
  const [learnDropdownOpen, setLearnDropdownOpen] = useState(false)
  const [researchDropdownOpen, setResearchDropdownOpen] = useState(false)
  const [langPickerOpen, setLangPickerOpen] = useState(false)

  // PWA Install State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isAppInstalled, setIsAppInstalled] = useState(false)

  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    const handleAppInstalled = () => {
      setIsAppInstalled(true)
      setDeferredPrompt(null)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall)
    window.addEventListener("appinstalled", handleAppInstalled)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall)
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [])

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === "accepted") {
        setIsAppInstalled(true)
      }
      setDeferredPrompt(null)
    } else {
      alert("📲 To install BharatSign Bridge as a mobile app:\n\n• On Android/Chrome: Tap 'Install app' or the menu (⋮) and select 'Add to Home screen'.\n• On iPhone/Safari: Tap the Share button (⎋) and select 'Add to Home Screen'!")
    }
  }

  const location = useLocation()
  const activeLangObj = INDIC_LANGUAGES.find((l) => l.code === currentLanguage) || INDIC_LANGUAGES[0]
  const { user, isAuthenticated } = useAuthAndTheme()

  const isActive = (path: string) => location.pathname === path

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-card/95 backdrop-blur-md shadow-sm">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand Identity Logo */}
        <Logo variant="full" size="md" />

        {/* Center: Desktop Navigation Bar */}
        <nav className="hidden lg:flex items-center gap-1.5 text-xs font-semibold">
          <Link
            to="/"
            className={`px-3 py-2 rounded-lg transition-colors ${
              isActive("/")
                ? "bg-primary/10 text-primary font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            Home
          </Link>

          {/* Communication Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setCommDropdownOpen(true)}
            onMouseLeave={() => setCommDropdownOpen(false)}
          >
            <button
              className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                location.pathname.startsWith("/translate") ||
                location.pathname.startsWith("/speech-to-isl") ||
                location.pathname.startsWith("/live-camera") ||
                location.pathname.startsWith("/conversation")
                  ? "bg-primary/10 text-primary font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              <span>Communication</span>
              <ChevronDown className="h-3.5 w-3.5" />
            </button>

            {commDropdownOpen && (
              <div className="absolute top-full left-0 w-64 rounded-xl border border-border bg-card p-2 shadow-xl animate-in fade-in slide-in-from-top-1 z-50">
                <Link
                  to="/translate"
                  className="flex items-start gap-2.5 rounded-lg p-2 hover:bg-muted transition-colors"
                >
                  <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-foreground">Text to ISL</div>
                    <div className="text-[11px] text-muted-foreground">NLP gloss and avatar synthesis</div>
                  </div>
                </Link>
                <Link
                  to="/speech-to-isl"
                  className="flex items-start gap-2.5 rounded-lg p-2 hover:bg-muted transition-colors"
                >
                  <Layers className="h-4 w-4 text-cyan-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-foreground">Speech to ISL</div>
                    <div className="text-[11px] text-muted-foreground">Multilingual voice input</div>
                  </div>
                </Link>
                <Link
                  to="/live-camera"
                  className="flex items-start gap-2.5 rounded-lg p-2 hover:bg-muted transition-colors"
                >
                  <Camera className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-foreground">Live Camera Recognition</div>
                    <div className="text-[11px] text-muted-foreground">MediaPipe Holistic 42-joint tracking</div>
                  </div>
                </Link>
                <Link
                  to="/conversation"
                  className="flex items-start gap-2.5 rounded-lg p-2 hover:bg-muted transition-colors"
                >
                  <MessageSquare className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-foreground">Two-Way Conversation</div>
                    <div className="text-[11px] text-muted-foreground">Deaf signer ⇄ Hearing bridge</div>
                  </div>
                </Link>
                <Link
                  to="/public-desk"
                  className="flex items-start gap-2.5 rounded-lg p-2 hover:bg-muted transition-colors border-t border-border/60 mt-1"
                >
                  <Building2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-foreground flex items-center gap-1.5">
                      <span>Public Desk (Jan-Suvidha)</span>
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded font-mono font-bold">NEW</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground">Hospital, Police, Bank & UDID</div>
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* Learning Portal Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setLearnDropdownOpen(true)}
            onMouseLeave={() => setLearnDropdownOpen(false)}
          >
            <button
              className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                location.pathname.startsWith("/learn")
                  ? "bg-primary/10 text-primary font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              <span>Learning Portal</span>
              <ChevronDown className="h-3.5 w-3.5" />
            </button>

            {learnDropdownOpen && (
              <div className="absolute top-full left-0 w-64 rounded-xl border border-border bg-card p-2 shadow-xl animate-in fade-in slide-in-from-top-1 z-50">
                <Link
                  to="/learn"
                  className="flex items-start gap-2.5 rounded-lg p-2 hover:bg-muted transition-colors"
                >
                  <BookOpen className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-foreground">Curriculum Dashboard</div>
                    <div className="text-[11px] text-muted-foreground">Overview & mastery roadmap</div>
                  </div>
                </Link>
                <Link
                  to="/learn/alphabet"
                  className="flex items-start gap-2.5 rounded-lg p-2 hover:bg-muted transition-colors"
                >
                  <div className="flex h-4 w-4 items-center justify-center font-black text-xs text-cyan-500 shrink-0 mt-0.5">
                    A
                  </div>
                  <div>
                    <div className="font-bold text-foreground">Alphabets (A to Z)</div>
                    <div className="text-[11px] text-muted-foreground">26 individual letter lessons</div>
                  </div>
                </Link>
                <Link
                  to="/learn/numbers"
                  className="flex items-start gap-2.5 rounded-lg p-2 hover:bg-muted transition-colors"
                >
                  <div className="flex h-4 w-4 items-center justify-center font-black text-xs text-indigo-500 shrink-0 mt-0.5">
                    123
                  </div>
                  <div>
                    <div className="font-bold text-foreground">Numbers (0 to 9)</div>
                    <div className="text-[11px] text-muted-foreground">10 official numeric lessons</div>
                  </div>
                </Link>
                <Link
                  to="/learn/words"
                  className="flex items-start gap-2.5 rounded-lg p-2 hover:bg-muted transition-colors"
                >
                  <Search className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-foreground">Vocabulary Lexicon</div>
                    <div className="text-[11px] text-muted-foreground">Every word has its own page</div>
                  </div>
                </Link>
                <Link
                  to="/learn/practice"
                  className="flex items-start gap-2.5 rounded-lg p-2 hover:bg-muted transition-colors"
                >
                  <Activity className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-foreground">Camera Practice Room</div>
                    <div className="text-[11px] text-muted-foreground">Real-time posture AI grading</div>
                  </div>
                </Link>
                <Link
                  to="/learn/quizzes"
                  className="flex items-start gap-2.5 rounded-lg p-2 hover:bg-muted transition-colors"
                >
                  <Award className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-foreground">Adaptive Quizzes</div>
                    <div className="text-[11px] text-muted-foreground">Identify signs and numbers</div>
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* Research & Publications Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setResearchDropdownOpen(true)}
            onMouseLeave={() => setResearchDropdownOpen(false)}
          >
            <button
              className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                location.pathname.startsWith("/research")
                  ? "bg-primary/10 text-primary font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              <span>Research</span>
              <ChevronDown className="h-3.5 w-3.5" />
            </button>

            {researchDropdownOpen && (
              <div className="absolute top-full left-0 w-60 rounded-xl border border-border bg-card p-2 shadow-xl animate-in fade-in slide-in-from-top-1 z-50">
                <Link
                  to="/research"
                  className="block rounded-lg p-2 hover:bg-muted text-xs font-semibold text-foreground"
                >
                  Research Overview
                </Link>
                <Link
                  to="/research/papers"
                  className="block rounded-lg p-2 hover:bg-muted text-xs text-muted-foreground hover:text-foreground"
                >
                  Academic Papers & Publications
                </Link>
                <Link
                  to="/research/datasets"
                  className="block rounded-lg p-2 hover:bg-muted text-xs text-muted-foreground hover:text-foreground"
                >
                  Datasets & Licensing
                </Link>
                <Link
                  to="/research/methodology"
                  className="block rounded-lg p-2 hover:bg-muted text-xs text-muted-foreground hover:text-foreground"
                >
                  Kinematic & Vision Methodology
                </Link>
                <Link
                  to="/research/evaluation"
                  className="block rounded-lg p-2 hover:bg-muted text-xs text-muted-foreground hover:text-foreground"
                >
                  Empirical Results & Benchmarks
                </Link>
              </div>
            )}
          </div>

          <Link
            to="/expert-review"
            className={`px-3 py-2 rounded-lg transition-colors ${
              isActive("/expert-review")
                ? "bg-primary/10 text-primary font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            Expert Review
          </Link>

          <Link
            to="/leaderboard"
            className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
              isActive("/leaderboard")
                ? "bg-primary/10 text-primary font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            <Trophy className="h-3.5 w-3.5 text-amber-400" />
            <span>Leaderboard</span>
          </Link>

          <Link
            to="/about"
            className={`px-3 py-2 rounded-lg transition-colors ${
              isActive("/about")
                ? "bg-primary/10 text-primary font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            About
          </Link>
        </nav>

        {/* Right: 3D Theme Switcher, Install App, Language Picker, Profile/Auth, Settings */}
        <div className="flex items-center gap-2">
          {/* 3D Tactile Theme Switcher */}
          <ThreeDThemeToggle />

          {/* PWA 1-Click Mobile App Install Button */}
          {!isAppInstalled && (
            <button
              type="button"
              onClick={handleInstallApp}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-xs font-bold transition-all shadow-sm"
              title="Install BharatSign Bridge App"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Install App</span>
            </button>
          )}

          {/* 13 Indian Languages Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setLangPickerOpen(!langPickerOpen)}
              className="flex items-center gap-1.5 rounded-xl border border-border bg-muted/70 px-2.5 py-1.5 text-xs font-bold text-foreground hover:bg-muted transition-colors shadow-sm"
              aria-label="Select Spoken Language"
            >
              <Globe2 className="h-3.5 w-3.5 text-primary" />
              <span>{activeLangObj.native}</span>
              <span className="text-[10px] text-muted-foreground uppercase hidden sm:inline">
                ({activeLangObj.code})
              </span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </button>

            {langPickerOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-56 max-h-80 overflow-y-auto rounded-xl border border-border bg-card p-1.5 shadow-2xl z-50 animate-in fade-in">
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border mb-1">
                  AI Voice Spoken Language
                </div>
                {INDIC_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onLanguageChange(lang.code)
                      setLangPickerOpen(false)
                      speakText(lang.native, lang.code)
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold text-left transition-colors ${
                      currentLanguage === lang.code
                        ? "bg-primary text-white"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <span>{lang.native}</span>
                    <span className="text-[10px] opacity-75">{lang.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Profile & Streak or Sign In Button */}
          {isAuthenticated ? (
            <Link
              to="/profile"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/15 to-primary/15 border border-amber-500/30 text-xs font-extrabold text-foreground hover:bg-amber-500/25 transition-all shadow-sm group"
              title="View Learning Streak & Profile"
            >
              <Flame className="h-4 w-4 fill-amber-400 text-amber-400 animate-bounce" />
              <span className="font-mono text-amber-400 text-[11px]">{user?.streakDays}d</span>
              <span className="hidden sm:inline font-bold truncate max-w-[85px]">
                {user?.name.split(" ")[0]}
              </span>
            </Link>
          ) : (
            <Link
              to="/auth"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-extrabold hover:bg-primary/90 transition-all shadow-md shadow-primary/20 active:scale-95"
            >
              <UserIcon className="h-3.5 w-3.5" />
              <span>Sign In</span>
            </Link>
          )}

          <Link
            to="/settings"
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            aria-label="Platform Settings"
          >
            <SettingsIcon className="h-4 w-4" />
          </Link>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-foreground hover:bg-muted transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-border bg-card px-4 py-4 animate-in slide-in-from-top flex flex-col gap-3 text-sm">
          {/* Mobile Profile / Auth Card */}
          {isAuthenticated ? (
            <Link
              to="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-amber-500/15 to-primary/15 border border-amber-500/30 text-foreground"
            >
              <div className="flex items-center gap-2.5">
                <Flame className="h-5 w-5 fill-amber-400 text-amber-400" />
                <div>
                  <div className="font-extrabold text-sm">{user?.name}</div>
                  <div className="text-[11px] text-amber-400 font-mono font-bold">
                    🔥 {user?.streakDays} Day Learning Streak
                  </div>
                </div>
              </div>
              <span className="text-xs font-bold text-primary">View Profile →</span>
            </Link>
          ) : (
            <Link
              to="/auth"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-primary text-white font-extrabold text-xs shadow-md"
            >
              <UserIcon className="h-4 w-4" />
              <span>Sign In / Create Account</span>
            </Link>
          )}

          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 rounded-lg font-semibold hover:bg-muted"
          >
            Home
          </Link>
          <div className="font-bold text-xs uppercase text-muted-foreground px-2 pt-2">
            Communication
          </div>
          <Link
            to="/translate"
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 rounded-lg hover:bg-muted text-xs font-medium"
          >
            Text to ISL
          </Link>
          <Link
            to="/speech-to-isl"
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 rounded-lg hover:bg-muted text-xs font-medium"
          >
            Speech to ISL
          </Link>
          <Link
            to="/live-camera"
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 rounded-lg hover:bg-muted text-xs font-medium"
          >
            Live Camera Recognition
          </Link>
          <Link
            to="/conversation"
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 rounded-lg hover:bg-muted text-xs font-medium"
          >
            Two-Way Conversation
          </Link>
          <Link
            to="/public-desk"
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 rounded-lg hover:bg-muted text-xs font-bold text-emerald-400 flex items-center justify-between"
          >
            <span>Jan-Suvidha Public Desk</span>
            <span className="text-[9px] bg-emerald-500/20 px-1.5 py-0.5 rounded font-mono font-bold">NEW</span>
          </Link>

          <div className="font-bold text-xs uppercase text-muted-foreground px-2 pt-2">
            Learning Portal
          </div>
          <Link
            to="/learn"
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 rounded-lg hover:bg-muted text-xs font-medium"
          >
            Learning Dashboard
          </Link>
          <Link
            to="/learn/alphabet"
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 rounded-lg hover:bg-muted text-xs font-medium"
          >
            Alphabets (A to Z)
          </Link>
          <Link
            to="/learn/numbers"
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 rounded-lg hover:bg-muted text-xs font-medium"
          >
            Numbers (0 to 9)
          </Link>
          <Link
            to="/learn/words"
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 rounded-lg hover:bg-muted text-xs font-medium"
          >
            Vocabulary Words
          </Link>
          <Link
            to="/learn/practice"
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 rounded-lg hover:bg-muted text-xs font-medium"
          >
            Camera Practice Room
          </Link>
          <Link
            to="/leaderboard"
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 rounded-lg hover:bg-muted text-xs font-bold text-amber-400 flex items-center gap-2"
          >
            <Trophy className="h-4 w-4" />
            <span>National Leaderboard</span>
          </Link>

          <div className="font-bold text-xs uppercase text-muted-foreground px-2 pt-2">
            Research & Evaluation
          </div>
          <Link
            to="/research"
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 rounded-lg hover:bg-muted text-xs font-medium"
          >
            Research Portal
          </Link>
          <Link
            to="/expert-review"
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 rounded-lg hover:bg-muted text-xs font-medium"
          >
            Expert Validation
          </Link>
          <Link
            to="/settings"
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 rounded-lg hover:bg-muted text-xs font-medium"
          >
            Settings
          </Link>
        </div>
      )}
    </header>
  )
}
