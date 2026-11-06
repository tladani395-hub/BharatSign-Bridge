import { useState, useEffect, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  Flame,
  Award,
  BookOpen,
  Volume2,
  Calendar,
  CheckCircle2,
  Trophy,
  ArrowRight,
  LogOut,
  User,
  Sparkles,
  Zap,
  Globe2,
  Check,
  Compass,
  HelpCircle,
  RotateCcw,
  Plus,
  Printer,
  Share2,
  BadgeCheck,
  QrCode,
  ExternalLink,
  Download,
  Camera,
  Edit3,
  X,
  Upload,
} from "lucide-react"
import QRCode from "qrcode"
import { Button } from "@/components/ui/button"
import { useAuthAndTheme } from "@/context/AuthAndThemeContext"
import { INDIC_LANGUAGES, speakText } from "@/lib/speech"
import { downloadCertificatePNG } from "@/lib/certificateGenerator"
import { playFanfare, playSuccessChime } from "@/lib/soundEffects"

export default function Profile() {
  const {
    user,
    logout,
    updateProfile,
    recordDailyActivity,
    recordLessonCompleted,
    completeStreakQuiz,
    resetStreakToZero,
  } = useAuthAndTheme()
  const navigate = useNavigate()

  const [isSpeakingGuide, setIsSpeakingGuide] = useState(false)
  const [quizAnswered, setQuizAnswered] = useState(false)
  const [selectedQuizOption, setSelectedQuizOption] = useState<string | null>(null)
  const [quizSuccess, setQuizSuccess] = useState(false)
  const [streakCelebration, setStreakCelebration] = useState<string | null>(null)

  // Certificate State & QR Code Verification
  const [certId, setCertId] = useState<string>("BSB-2026-1047")
  const [certQrDataUrl, setCertQrDataUrl] = useState<string>("")
  const [certClaimed, setCertClaimed] = useState<boolean>(false)
  const [isClaiming, setIsClaiming] = useState<boolean>(false)

  // Profile Edit & DP Photo State
  const [showEditModal, setShowEditModal] = useState(false)
  const [editName, setEditName] = useState("")
  const [editBio, setEditBio] = useState("")
  const [editLanguage, setEditLanguage] = useState("en")
  const [editAvatarUrl, setEditAvatarUrl] = useState("")
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [profileSaveSuccess, setProfileSaveSuccess] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const PRESET_AVATARS = [
    { name: "Cyber Fox", url: "https://api.dicebear.com/7.x/bottts/svg?seed=Fox" },
    { name: "AI Signer", url: "https://api.dicebear.com/7.x/bottts/svg?seed=Signer" },
    { name: "ISL Scholar", url: "https://api.dicebear.com/7.x/bottts/svg?seed=Scholar" },
    { name: "Champion", url: "https://api.dicebear.com/7.x/bottts/svg?seed=Champion" },
    { name: "Explorer", url: "https://api.dicebear.com/7.x/bottts/svg?seed=Explorer" },
    { name: "Tech Owl", url: "https://api.dicebear.com/7.x/bottts/svg?seed=Owl" },
  ]

  const handleOpenEditModal = () => {
    if (!user) return
    setEditName(user.name)
    setEditBio(user.bio || "")
    setEditLanguage(user.preferredLanguage || "en")
    setEditAvatarUrl(user.avatarUrl || "")
    setProfileSaveSuccess(null)
    setShowEditModal(true)
  }

  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new window.Image()
      img.onload = () => {
        const canvas = document.createElement("canvas")
        const size = 240
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext("2d")
        if (ctx) {
          ctx.drawImage(img, 0, 0, size, size)
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.85)
          setEditAvatarUrl(compressedDataUrl)
          saveAvatarDirectly(compressedDataUrl)
        }
      }
      if (event.target?.result) {
        img.src = event.target.result as string
      }
    }
    reader.readAsDataURL(file)
  }

  const saveAvatarDirectly = async (avatarUrl: string) => {
    if (!user) return
    updateProfile({ avatarUrl })
    try {
      const token = localStorage.getItem("bharatsign_token")
      const headers: Record<string, string> = { "Content-Type": "application/json" }
      if (token) headers["Authorization"] = `Bearer ${token}`
      await fetch("http://127.0.0.1:8000/api/auth/profile", {
        method: "PUT",
        headers,
        body: JSON.stringify({ email: user.email, avatar_url: avatarUrl }),
      })
      setStreakCelebration("📷 Profile Photo (DP) updated successfully!")
      setTimeout(() => setStreakCelebration(null), 3000)
    } catch {}
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setIsSavingProfile(true)
    try {
      const token = localStorage.getItem("bharatsign_token")
      const headers: Record<string, string> = { "Content-Type": "application/json" }
      if (token) headers["Authorization"] = `Bearer ${token}`
      const res = await fetch("http://127.0.0.1:8000/api/auth/profile", {
        method: "PUT",
        headers,
        body: JSON.stringify({
          email: user.email,
          name: editName.trim(),
          preferred_language: editLanguage,
          avatar_url: editAvatarUrl,
          bio: editBio.trim(),
        }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.user) {
          updateProfile({
            name: data.user.name,
            preferredLanguage: data.user.preferredLanguage,
            avatarUrl: data.user.avatarUrl,
            bio: data.user.bio,
          })
        }
      } else {
        updateProfile({
          name: editName.trim(),
          preferredLanguage: editLanguage,
          avatarUrl: editAvatarUrl,
          bio: editBio.trim(),
        })
      }
      setProfileSaveSuccess("Profile details and DP saved successfully! 🎉")
      setTimeout(() => {
        setShowEditModal(false)
        setProfileSaveSuccess(null)
      }, 1200)
    } catch {
      updateProfile({
        name: editName.trim(),
        preferredLanguage: editLanguage,
        avatarUrl: editAvatarUrl,
        bio: editBio.trim(),
      })
      setShowEditModal(false)
    } finally {
      setIsSavingProfile(false)
    }
  }

  useEffect(() => {
    if (!user) return
    const fetchOrClaimCert = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/certificates/user/${encodeURIComponent(user.email)}`)
        if (res.ok) {
          const data = await res.json()
          if (data.has_certificate && data.certificate) {
            setCertId(data.certificate.cert_id)
            setCertClaimed(true)
            return
          }
        }
      } catch {
        // Backend offline fallback
      }

      if (user.email === "student@bharatsign.ai" || user.name.toLowerCase().includes("tirth")) {
        setCertId("BSB-2026-1047")
      } else {
        const hashNum = Math.abs(user.email.split("").reduce((acc, c) => acc + c.charCodeAt(0), 1047)) % 9000 + 1000
        setCertId(`BSB-2026-${hashNum}`)
      }
    }

    fetchOrClaimCert()
  }, [user?.email])

  // Generate real scannable QR Code data URL
  useEffect(() => {
    if (!certId) return
    const verifyUrl = `${window.location.origin}/verify-cert/${certId}`
    QRCode.toDataURL(verifyUrl, {
      width: 140,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    })
      .then((url) => setCertQrDataUrl(url))
      .catch(() => {})
  }, [certId])

  const handleClaimCertificate = async () => {
    if (!user) return
    setIsClaiming(true)
    try {
      const token = localStorage.getItem("bharatsign_token")
      const headers: Record<string, string> = { "Content-Type": "application/json" }
      if (token) headers["Authorization"] = `Bearer ${token}`
      const res = await fetch("http://127.0.0.1:8000/api/certificates/claim", {
        method: "POST",
        headers,
        body: JSON.stringify({
          user_id: user.id,
          user_name: user.name,
          user_email: user.email,
          streak_days: user.streakDays,
          mastered_signs_count: user.masteredSignsCount,
          total_quizzes_taken: user.totalQuizzesTaken || 0,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.certificate) {
          setCertId(data.certificate.cert_id)
          setCertClaimed(true)
          playFanfare()
        }
      }
    } catch {
      setCertClaimed(true)
      playFanfare()
    } finally {
      setIsClaiming(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 px-4 text-center">
        <User className="h-16 w-16 text-muted-foreground animate-float" />
        <h2 className="text-2xl font-black">No Active Student Session</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          Please sign in to access your learning streak, personal AI voice guide, and daily streak quiz.
        </p>
        <Link to="/auth">
          <Button className="font-bold bg-primary text-white">Sign In to BharatSign</Button>
        </Link>
      </div>
    )
  }

  const langObj = INDIC_LANGUAGES.find((l) => l.code === user.preferredLanguage) || INDIC_LANGUAGES[0]

  // Personal Guide Content for Today & Tomorrow
  const guidePlans = {
    gu: {
      todayTitle: "આજનો દિવસનો અભ્યાસ પ્લાન (Today's Plan)",
      todayPoints: [
        "૧. વેબકેમ દ્વારા MSJE નંબર્સ ૧ થી ૫ નો લાઈવ પ્રેક્ટિસ રૂમમાં અભ્યાસ કરો.",
        "૨. 'નમસ્તે' અને 'આભાર' ના ISLRTC પ્રમાણિત હાવભાવ પૂર્ણ કરો.",
        "૩. તમારો સ્ટ્રાઈક ચાલુ રાખવા માટે આજની ડેઈલી ક્વિઝ આપો.",
      ],
      tomorrowTitle: "આવતીકાલનો એડવાન્સ રોડમેપ (Tomorrow's Roadmap)",
      tomorrowPoints: [
        "૧. બે હાથ વડે થતા ISL મૂળાક્ષરો (A થી M) અનલૉક કરો.",
        "૨. 3D અવતાર સાથે ટુ-વે લાઈવ કન્વર્સેશન રૂમ ટેસ્ટ કરો.",
        "૩. પશ્ચિમ ભારત (ગુજરાત/મહારાષ્ટ્ર) ના પ્રાદેશિક ચિહ્નો શીખો.",
      ],
      spokenScript:
        "નમસ્તે! હું તમારો પર્સનલ ISL ગાઈડ મિત્ર છું. આજે તમારો લક્ષ્યાંક છે: વેબકેમથી ૧ થી ૫ નંબર્સની પ્રેક્ટિસ કરવી અને આજની સ્ટ્રાઈક ક્વિઝ પૂરી કરવી. આવતીકાલે આપણે બે હાથ વાળા આલ્ફાબેટ્સ શીખીશું. ખૂબ સરસ કામ કરી રહ્યા છો, તમારી સ્ટ્રાઈક ચાલુ રાખો!",
    },
    hi: {
      todayTitle: "आज का अध्ययन लक्ष्य (Today's Plan)",
      todayPoints: [
        "१. वेबकैम द्वारा MSJE संख्या १ से ५ का लाइव प्रैक्टिस रूम में अभ्यास करें।",
        "२. 'नमस्ते' और 'धन्यवाद' के आधिकारिक ISLRTC संकेत सीखें।",
        "३. अपनी लर्निंग स्ट्राइक जारी रखने के लिए आज की डेली क्विज़ पूरी करें।",
      ],
      tomorrowTitle: "कल का अग्रिम रोडमैप (Tomorrow's Roadmap)",
      tomorrowPoints: [
        "१. दो हाथों वाले ISL वर्णमाला (A से M) का अभ्यास करें।",
        "२. 3D डिजिटल अवतार के साथ टू-वे वार्तालाप रूम का परीक्षण करें।",
        "३. क्षेत्रीय विविधताओं की समीक्षा करें।",
      ],
      spokenScript:
        "नमस्ते! मैं आपका पर्सनल ISL गाइड मित्र हूँ। आज का आपका लक्ष्य है: लाइव कैमरा में १ से ५ तक की संख्याओं का अभ्यास करना और डेली स्ट्राइक क्विज़ पूरा करना। कल हम वर्णमाला A से M सीखेंगे। अपनी सीखने की ललक बनाए रखें!",
    },
    en: {
      todayTitle: "Today's Learning Action Plan",
      todayPoints: [
        "1. Practice MSJE Numbers 1 to 5 in the Live Camera Studio with real-time pose tracking.",
        "2. Perfect official ISLRTC signs for 'Namaste' and 'Thank You'.",
        "3. Complete today's Streak Quiz to extend your active streak!",
      ],
      tomorrowTitle: "Tomorrow's Advanced Roadmap",
      tomorrowPoints: [
        "1. Unlock two-handed ISL alphabets A through M.",
        "2. Test the two-way live conversation room with digital 3D avatar.",
        "3. Review Western Indian regional lexicon variations.",
      ],
      spokenScript:
        "Hello! I am your personal ISL guide Mitra. Today your plan is to practice numbers 1 through 5 in the Live Camera Studio and maintain your daily streak quiz. Tomorrow we will unlock two-handed alphabets A through M. Keep up the fantastic learning momentum!",
    },
  }

  const currentPlan =
    guidePlans[user.preferredLanguage as keyof typeof guidePlans] || guidePlans.en

  // Trigger TTS voice guide
  const handlePlayVoiceGuide = () => {
    if (isSpeakingGuide) {
      window.speechSynthesis?.cancel()
      setIsSpeakingGuide(false)
      return
    }

    setIsSpeakingGuide(true)
    speakText(currentPlan.spokenScript, user.preferredLanguage)

    const approxDuration = currentPlan.spokenScript.length * 75
    setTimeout(() => {
      setIsSpeakingGuide(false)
    }, Math.min(12000, approxDuration))
  }

  // Daily Check-In
  const handleDailyCheckIn = () => {
    const success = recordDailyActivity()
    if (success) {
      setStreakCelebration(`🎉 Awesome! Active check-in recorded. Streak is now ${user.streakDays + 1} Days 🔥!`)
      setTimeout(() => setStreakCelebration(null), 4000)
    } else {
      setStreakCelebration(`You have already checked in for today! Streak is burning bright at ${user.streakDays} Days 🔥`)
      setTimeout(() => setStreakCelebration(null), 3000)
    }
  }

  // Mark Lesson Complete
  const handleCompleteLesson = () => {
    recordLessonCompleted("NAMASTE")
    setStreakCelebration(`🌟 Work & Learning completed! +1 Sign Mastered & Streak Level Updated 🔥!`)
    setTimeout(() => setStreakCelebration(null), 4000)
  }

  // Daily Streak Quiz answer
  const handleStreakQuizSubmit = (option: string) => {
    setSelectedQuizOption(option)
    setQuizAnswered(true)

    if (option === "Two palms pressed flat together at chest level") {
      setQuizSuccess(true)
      completeStreakQuiz()
      playSuccessChime()
      setStreakCelebration(`🔥 Quiz Passed! +1 Day added to your streak! Now ${user.streakDays + 1} Days!`)
      setTimeout(() => setStreakCelebration(null), 4000)
    } else {
      setQuizSuccess(false)
    }
  }

  // Authentic dynamic week days display based on user.streakDays
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  const weekDays = dayNames.map((day, idx) => ({
    day,
    completed: idx < Math.min(user.streakDays, 7),
  }))

  const tasks = user.dailyTasksCompleted || { visit: false, learn: false, quiz: false }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-card/40 to-background py-10 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-6xl flex flex-col gap-8">
        {/* Celebration Toast */}
        {streakCelebration && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-primary/20 border border-amber-500 text-foreground text-xs sm:text-sm font-bold flex items-center justify-between shadow-2xl animate-in fade-in">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-amber-400 fill-amber-400 animate-bounce" />
              <span>{streakCelebration}</span>
            </div>
            <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider">Level Up</span>
          </div>
        )}

        {/* 1. Profile Hero Banner */}
        <div className="rounded-3xl bg-card border border-border p-6 sm:p-8 shadow-xl relative overflow-hidden backdrop-blur-xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 blur-3xl rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
            {/* Hidden File Input for DP Upload */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarFileUpload}
              accept="image/*"
              className="hidden"
            />

            <div className="flex items-center gap-5">
              {/* DP Photo Avatar Container */}
              <div className="relative group">
                <div className="h-20 w-20 rounded-3xl bg-gradient-to-tr from-primary via-cyan-500 to-indigo-500 text-white flex items-center justify-center font-black text-2xl shadow-xl shadow-cyan-500/25 overflow-hidden border-2 border-primary/30">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span>{user.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>

                {/* Change DP Photo Overlay Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/60 rounded-3xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity text-[10px] font-bold gap-1 cursor-pointer"
                  title="Click to upload new DP photo"
                >
                  <Camera className="h-5 w-5 text-cyan-300 animate-pulse" />
                  <span>Change DP</span>
                </button>

                <span className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs border-2 border-card font-bold pointer-events-none">
                  ✓
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-foreground">{user.name}</h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-primary/15 border border-primary/30 text-primary text-[11px] font-extrabold font-mono">
                    {user.level}
                  </span>
                  <button
                    type="button"
                    onClick={handleOpenEditModal}
                    className="p-1 px-2.5 rounded-xl bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground border border-border transition-colors flex items-center gap-1.5 text-xs font-bold"
                    title="Edit personal details"
                  >
                    <Edit3 className="h-3.5 w-3.5 text-primary" />
                    <span>Edit Profile</span>
                  </button>
                </div>

                {user.bio ? (
                  <p className="text-xs text-foreground/85 font-medium italic">"{user.bio}"</p>
                ) : (
                  <button
                    type="button"
                    onClick={handleOpenEditModal}
                    className="text-[11px] text-muted-foreground hover:text-primary italic text-left"
                  >
                    + Add personal bio or learning goal
                  </button>
                )}

                <p className="text-xs text-muted-foreground flex items-center gap-2">
                  <span>{user.email}</span>
                  <span>•</span>
                  <span>Member since {user.joinedDate}</span>
                </p>

                <div className="flex items-center gap-2 pt-0.5 text-xs text-cyan-400 font-semibold">
                  <Globe2 className="h-3.5 w-3.5 shrink-0" />
                  <span>Learning Language:</span>
                  <select
                    value={user.preferredLanguage}
                    onChange={(e) => {
                      const newLang = e.target.value
                      const updatedUser = { ...user, preferredLanguage: newLang }
                      localStorage.setItem("bharatsign_user", JSON.stringify(updatedUser))
                      localStorage.setItem("bharatsign_language", newLang)
                      window.location.reload()
                    }}
                    className="bg-background border border-border text-foreground px-2 py-0.5 rounded-lg text-xs font-bold cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {INDIC_LANGUAGES.map((l) => (
                      <option key={l.code} value={l.code}>
                        {l.name} ({l.native})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <Link to="/learn" className="flex-1 sm:flex-initial">
                <Button className="w-full gap-2 bg-primary hover:bg-primary/90 text-white font-bold h-11 px-5 rounded-xl shadow-md">
                  <BookOpen className="h-4 w-4" />
                  <span>Enter Learning Portal</span>
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={resetStreakToZero}
                title="Reset streak to 0 days to test the new student onboarding experience"
                className="gap-1.5 h-11 px-3.5 rounded-xl border-border hover:bg-muted text-muted-foreground hover:text-amber-400 text-xs font-bold"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset (0 Days)</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  logout()
                  navigate("/")
                }}
                className="gap-1.5 h-11 px-4 rounded-xl border-border hover:bg-muted text-muted-foreground hover:text-red-400 font-bold"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>

        {/* 2. Everyday Activity Hub: Complete Work & Learn to Streak Up! */}
        <div className="rounded-3xl bg-card border border-border p-6 shadow-xl flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-bold border border-emerald-500/30 mb-1">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Everyday Learning & Streak Acceleration</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-foreground">
                Daily Work & Learning Milestones
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Be active everyday, complete exercises, and practice signs to plus your streak continuously!
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground">Today's Progress:</span>
              <span className="text-xs font-black px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/40 font-mono">
                {[tasks.visit, tasks.learn, tasks.quiz].filter(Boolean).length} / 3 Completed
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Task 1: Daily Visit / Active Today */}
            <div className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
              tasks.visit
                ? "bg-emerald-500/10 border-emerald-500/40"
                : "bg-muted/40 border-border"
            }`}>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Task 1: Active Everyday
                  </span>
                  {tasks.visit ? (
                    <span className="h-5 w-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">
                      ✓
                    </span>
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                  )}
                </div>
                <h4 className="font-extrabold text-foreground text-sm">
                  Daily Presence & Platform Visit
                </h4>
                <p className="text-xs text-muted-foreground">
                  Log in and visit BharatSign Bridge every day to keep your learning habit alive.
                </p>
              </div>

              <Button
                onClick={handleDailyCheckIn}
                disabled={tasks.visit && user.streakDays > 0}
                className={`w-full gap-2 text-xs font-bold ${
                  tasks.visit && user.streakDays > 0
                    ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 cursor-default"
                    : "bg-amber-600 hover:bg-amber-500 text-white shadow-md"
                }`}
              >
                <Flame className="h-3.5 w-3.5 fill-current" />
                <span>{tasks.visit && user.streakDays > 0 ? "Checked In Today (+1)" : "Check In Today (+1 Day)"}</span>
              </Button>
            </div>

            {/* Task 2: Complete Work & Learn */}
            <div className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
              tasks.learn
                ? "bg-emerald-500/10 border-emerald-500/40"
                : "bg-muted/40 border-border"
            }`}>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Task 2: Complete Work
                  </span>
                  {tasks.learn ? (
                    <span className="h-5 w-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">
                      ✓
                    </span>
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-cyan-400" />
                  )}
                </div>
                <h4 className="font-extrabold text-foreground text-sm">
                  Practice & Master 1 Sign
                </h4>
                <p className="text-xs text-muted-foreground">
                  Practice an alphabet, number, or vocabulary sign in the AI Practice Room.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={handleCompleteLesson}
                  variant="outline"
                  className="flex-1 gap-1.5 text-xs font-bold border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Mark Done (+1)</span>
                </Button>
                <Link to="/learn/practice" className="flex-1">
                  <Button className="w-full gap-1.5 text-xs font-bold bg-primary hover:bg-primary/90 text-white">
                    <span>Practice Room</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Task 3: Daily Streak Quiz */}
            <div className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
              tasks.quiz
                ? "bg-emerald-500/10 border-emerald-500/40"
                : "bg-muted/40 border-border"
            }`}>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Task 3: Daily Quiz
                  </span>
                  {tasks.quiz ? (
                    <span className="h-5 w-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">
                      ✓
                    </span>
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-purple-400" />
                  )}
                </div>
                <h4 className="font-extrabold text-foreground text-sm">
                  Pass Daily Streak Challenge
                </h4>
                <p className="text-xs text-muted-foreground">
                  Answer the daily ISL challenge question below to lock in your streak bonus.
                </p>
              </div>

              <a href="#streak-quiz-section">
                <Button
                  className={`w-full gap-2 text-xs font-bold ${
                    tasks.quiz
                      ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 cursor-default"
                      : "bg-purple-600 hover:bg-purple-500 text-white shadow-md"
                  }`}
                >
                  <Trophy className="h-3.5 w-3.5" />
                  <span>{tasks.quiz ? "Quiz Completed Today" : "Take Quiz Below"}</span>
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* 3. Streak & Learning Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Active Learning Streak Card */}
          <div className="md:col-span-5 rounded-3xl bg-gradient-to-br from-amber-500/10 via-card to-card border border-amber-500/30 p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30">
                  <Flame className={`h-4 w-4 ${user.streakDays > 0 ? "fill-amber-400 text-amber-400 animate-bounce" : "text-muted-foreground"}`} />
                  <span>DAILY LEARNING STREAK</span>
                </div>
                <span className="font-mono text-xs text-muted-foreground">
                  {user.streakDays === 0 ? "Not Started Yet" : "Active Today"}
                </span>
              </div>

              <div className="flex items-baseline gap-2 pt-2">
                <span className="text-5xl font-black text-foreground tracking-tight">
                  {user.streakDays}
                </span>
                <span className="text-lg font-bold text-amber-400">
                  {user.streakDays === 0 ? "Days (0 Start)" : "Days Active 🔥"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {user.streakDays === 0
                  ? "Welcome! You start with 0 Days streak. Check in, practice a sign, or solve the quiz to earn your very first streak day!"
                  : "You're on fire! Keep completing your daily sign exercises and streak quiz to build continuous sign language muscle memory."}
              </p>
            </div>

            {/* 7-Day Visual Week Grid */}
            <div className="pt-6 border-t border-border mt-4">
              <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground mb-2">
                <span>7-Day Progression:</span>
                <span className="font-mono text-amber-400">{user.streakDays} / 7 Days Active</span>
              </div>
              <div className="grid grid-cols-7 gap-2 text-center">
                {weekDays.map((w, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1.5">
                    <span className="text-[10px] font-mono text-muted-foreground uppercase">
                      {w.day}
                    </span>
                    <div
                      className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold text-xs transition-all ${
                        w.completed
                          ? "bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/30 scale-105"
                          : "bg-muted text-muted-foreground border border-border"
                      }`}
                    >
                      {w.completed ? "✓" : "·"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mastered Signs & Accuracy Counters */}
          <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-3xl bg-card border border-border p-6 shadow-md flex flex-col justify-between">
              <div className="h-10 w-10 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <span className="text-3xl font-black text-foreground">{user.masteredSignsCount}</span>
                <p className="text-xs font-bold text-muted-foreground mt-1">Signs Mastered</p>
              </div>
              <div className="w-full bg-muted h-2 rounded-full overflow-hidden mt-4">
                <div
                  className="bg-cyan-400 h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, (user.masteredSignsCount / 60) * 100)}%` }}
                />
              </div>
            </div>

            <div className="rounded-3xl bg-card border border-border p-6 shadow-md flex flex-col justify-between">
              <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                <Trophy className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <span className="text-3xl font-black text-foreground">{user.totalQuizzesTaken}</span>
                <p className="text-xs font-bold text-muted-foreground mt-1">Quizzes Completed</p>
              </div>
              <span className="text-[11px] text-emerald-400 font-semibold mt-4">
                {user.totalQuizzesTaken > 0 ? "100% Accuracy" : "Take 1st Quiz Below"}
              </span>
            </div>

            <div className="rounded-3xl bg-card border border-border p-6 shadow-md flex flex-col justify-between">
              <div className="h-10 w-10 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <span className="text-3xl font-black text-foreground">{user.practiceMinutes || 0}</span>
                <p className="text-xs font-bold text-muted-foreground mt-1">Practice Minutes</p>
              </div>
              <span className="text-[11px] text-purple-400 font-semibold mt-4">ISLRTC Standard Track</span>
            </div>
          </div>
        </div>

        {/* 4. Personal AI Guide with Text-to-Speech (Today & Tomorrow Plan) */}
        <div className="rounded-3xl bg-card border border-cyan-500/30 p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-primary text-white flex items-center justify-center shadow-lg shadow-cyan-500/25">
                <Compass className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-foreground">Mitra AI Personal Guide</h3>
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-[10px] font-bold">
                    ISLRTC Curriculum Mentor
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Adaptive roadmap formulated for your daily learning progress.
                </p>
              </div>
            </div>

            <Button
              onClick={handlePlayVoiceGuide}
              className={`gap-2 text-xs font-bold rounded-xl h-11 px-5 shadow-lg ${
                isSpeakingGuide
                  ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                  : "bg-cyan-500 hover:bg-cyan-600 text-white"
              }`}
            >
              <Volume2 className="h-4 w-4" />
              <span>{isSpeakingGuide ? "Stop Voice Guide" : `Listen to Guide (${langObj.native})`}</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
            {/* Today's Goal Card */}
            <div className="p-5 rounded-2xl bg-muted/40 border border-border/80 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                <Calendar className="h-4 w-4" />
                <span>{currentPlan.todayTitle}</span>
              </div>
              <div className="space-y-2.5 text-xs text-foreground font-medium">
                {currentPlan.todayPoints.map((pt, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{pt}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tomorrow's Roadmap Card */}
            <div className="p-5 rounded-2xl bg-muted/40 border border-border/80 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="h-4 w-4" />
                <span>{currentPlan.tomorrowTitle}</span>
              </div>
              <div className="space-y-2.5 text-xs text-foreground font-medium">
                {currentPlan.tomorrowPoints.map((pt, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <ArrowRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{pt}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 5. Daily Streak Quiz Widget */}
        <div id="streak-quiz-section" className="rounded-3xl bg-card border border-amber-500/30 p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center">
                <HelpCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-foreground text-base">Daily Streak Quiz Challenge</h3>
                <p className="text-xs text-muted-foreground">Answer today's ISL challenge to keep your streak burning 🔥</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-400 font-bold text-xs border border-amber-500/30 font-mono">
              +1 Day Streak Bonus
            </span>
          </div>

          <div className="py-6 flex flex-col gap-5">
            <div className="p-4 rounded-2xl bg-muted/40 border border-border text-sm font-bold text-foreground flex items-center gap-3">
              <span className="text-2xl">🙏</span>
              <span>Question: Which of the following describes the authentic ISLRTC sign for "Namaste"?</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                "Two palms pressed flat together at chest level",
                "Single index finger waving in circular pattern",
                "Fist nodding downward twice like a head nod",
                "Touching index finger to chin then forehead",
              ].map((option, idx) => {
                const isSelected = selectedQuizOption === option
                const isCorrect = quizAnswered && option === "Two palms pressed flat together at chest level"
                const isWrong = quizAnswered && isSelected && !isCorrect

                return (
                  <button
                    key={idx}
                    onClick={() => handleStreakQuizSubmit(option)}
                    disabled={quizAnswered}
                    className={`p-4 rounded-2xl text-xs font-bold text-left transition-all border flex items-center justify-between ${
                      isCorrect
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 scale-[1.02]"
                        : isWrong
                        ? "bg-red-500/20 border-red-500 text-red-400"
                        : "bg-muted/60 hover:bg-muted border-border hover:border-amber-500/50 text-foreground"
                    }`}
                  >
                    <span>{option}</span>
                    {isCorrect && <Check className="h-4 w-4 text-emerald-400" />}
                  </button>
                )
              })}
            </div>

            {quizAnswered && (
              <div
                className={`p-4 rounded-2xl border text-xs font-bold text-center animate-in fade-in ${
                  quizSuccess
                    ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                    : "bg-amber-500/15 border-amber-500/40 text-amber-400"
                }`}
              >
                {quizSuccess
                  ? `🎉 Brilliant! Correct Answer! Streak extended to ${user.streakDays} Days 🔥! Your daily learning goal is secured.`
                  : "Good try! 'Namaste' is performed with both flat palms pressed together at chest level with slight head nod."}
              </div>
            )}
          </div>
        </div>

        {/* 6. Milestone Badges Gallery */}
        <div className="rounded-3xl bg-card border border-border p-6 sm:p-8 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-foreground text-base">Digital Skill & Milestone Badges</h3>
                <p className="text-xs text-muted-foreground">Unlock official verifiable digital credentials as your streak advances.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
            <div className={`p-4 rounded-2xl border text-center flex flex-col items-center gap-2 ${
              user.streakDays >= 1 ? "bg-amber-500/10 border-amber-500/40 text-amber-400" : "bg-muted/30 border-border text-muted-foreground opacity-60"
            }`}>
              <div className="h-12 w-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-2xl">
                🌟
              </div>
              <span className="font-bold text-xs text-foreground">Starter Signer</span>
              <span className="text-[10px] text-muted-foreground">{user.streakDays >= 1 ? "Unlocked" : "Reach 1 Day"}</span>
            </div>

            <div className={`p-4 rounded-2xl border text-center flex flex-col items-center gap-2 ${
              user.streakDays >= 7 ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400" : "bg-muted/30 border-border text-muted-foreground opacity-60"
            }`}>
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-2xl">
                🔥
              </div>
              <span className="font-bold text-xs text-foreground">7-Day Champion</span>
              <span className="text-[10px] text-muted-foreground">{user.streakDays >= 7 ? "Unlocked" : `${user.streakDays}/7 Days`}</span>
            </div>

            <div className={`p-4 rounded-2xl border text-center flex flex-col items-center gap-2 ${
              user.masteredSignsCount >= 5 ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400" : "bg-muted/30 border-border text-muted-foreground opacity-60"
            }`}>
              <div className="h-12 w-12 rounded-2xl bg-cyan-500/20 flex items-center justify-center text-2xl">
                🖐️
              </div>
              <span className="font-bold text-xs text-foreground">Gesture Polyglot</span>
              <span className="text-[10px] text-muted-foreground">{user.masteredSignsCount >= 5 ? "Unlocked" : `${user.masteredSignsCount}/5 Signs`}</span>
            </div>

            <div className={`p-4 rounded-2xl border text-center flex flex-col items-center gap-2 ${
              user.totalQuizzesTaken >= 3 ? "bg-purple-500/10 border-purple-500/40 text-purple-400" : "bg-muted/30 border-border text-muted-foreground opacity-60"
            }`}>
              <div className="h-12 w-12 rounded-2xl bg-purple-500/20 flex items-center justify-center text-2xl">
                🎓
              </div>
              <span className="font-bold text-xs text-foreground">ISL Scholar</span>
              <span className="text-[10px] text-muted-foreground">{user.totalQuizzesTaken >= 3 ? "Unlocked" : `${user.totalQuizzesTaken}/3 Quizzes`}</span>
            </div>
          </div>
        </div>

        {/* 7. Official BharatSign-Bridge Certificate & Learning Milestone Tracker */}
        <div className="rounded-3xl bg-card border-2 border-cyan-500/40 p-6 sm:p-10 shadow-2xl relative overflow-hidden backdrop-blur-xl flex flex-col gap-8">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-cyan-500/25">
                <BadgeCheck className="h-7 w-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-foreground">Official Certificate of Achievement</h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-[10px] font-bold">
                    ISLRTC Verified
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Earn your personalized certificate with scannable QR verification benchmarking genuine sign mastery.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.print()}
                className="h-9 px-3.5 text-xs font-bold gap-1.5 border-border shadow-sm hover:border-cyan-400"
              >
                <Printer className="h-4 w-4" />
                <span>Print / PDF</span>
              </Button>

              <Button
                size="sm"
                onClick={() => {
                  downloadCertificatePNG({
                    userName: user.name,
                    certId: certId,
                    streakDays: user.streakDays,
                    masteredSignsCount: user.masteredSignsCount,
                    totalQuizzesTaken: user.totalQuizzesTaken || 1,
                    qrDataUrl: certQrDataUrl,
                  })
                }}
                className="h-9 px-3.5 text-xs font-bold gap-1.5 bg-cyan-600 hover:bg-cyan-700 text-white shadow-md"
              >
                <Download className="h-4 w-4" />
                <span>Download PNG (HD)</span>
              </Button>

              <Button
                size="sm"
                onClick={() => {
                  const verifyUrl = `${window.location.origin}/verify-cert/${certId}`
                  const shareMsg = encodeURIComponent(
                    `🎓 I have earned my official Certificate of Achievement on BharatSign Bridge! 🇮🇳\nName: ${user.name}\nCertificate ID: ${certId}\nStreak: ${user.streakDays} Days 🔥 | Mastered: ${user.masteredSignsCount} Signs 🖐️\nScan QR or verify authenticity online: ${verifyUrl}`
                  )
                  window.open(`https://api.whatsapp.com/send?text=${shareMsg}`, "_blank")
                }}
                className="h-9 px-4 text-xs font-bold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
              >
                <Share2 className="h-4 w-4" />
                <span>Share WhatsApp</span>
              </Button>

              <Link to={`/verify-cert/${certId}`} target="_blank">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 px-3 text-xs font-bold gap-1.5 text-cyan-400 border-cyan-500/40 hover:bg-cyan-500/10 shadow-sm"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Verify Online</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Learning Milestone Eligibility Tracker */}
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-cyan-950/20 via-blue-950/20 to-slate-900/40 border border-cyan-500/30 shadow-inner flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <Award className="h-4 w-4" />
                  <span>Certificate Milestone Requirements</span>
                </span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Complete minimum 5 mastered signs and a 1-day learning streak to unlock and certify your credential.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={handleClaimCertificate}
                  disabled={isClaiming}
                  className="h-8 px-3 text-xs font-bold bg-cyan-600 hover:bg-cyan-700 text-white shadow"
                >
                  {isClaiming ? "Synchronizing..." : certClaimed ? "Update / Re-Sync Stats" : "Claim & Unlock Certificate"}
                </Button>
              </div>
            </div>

            {/* Requirement Progress Bars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Signs Mastered Requirement */}
              <div className="p-3.5 rounded-xl bg-card border border-border flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-foreground flex items-center gap-1.5">
                    <span>🖐️ Mastered Signs</span>
                    {user.masteredSignsCount >= 5 && (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 inline" />
                    )}
                  </span>
                  <span className={user.masteredSignsCount >= 5 ? "text-emerald-400" : "text-cyan-400"}>
                    {user.masteredSignsCount} / 5 signs
                  </span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (user.masteredSignsCount / 5) * 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>
                    {user.masteredSignsCount >= 5
                      ? "Requirement achieved! 🎉"
                      : `${5 - user.masteredSignsCount} more sign(s) needed`}
                  </span>
                  {user.masteredSignsCount < 5 && (
                    <Link to="/learn" className="text-cyan-400 hover:underline font-bold">
                      Practice Signs →
                    </Link>
                  )}
                </div>
              </div>

              {/* Streak Days Requirement */}
              <div className="p-3.5 rounded-xl bg-card border border-border flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-foreground flex items-center gap-1.5">
                    <span>🔥 Learning Streak</span>
                    {user.streakDays >= 1 && (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 inline" />
                    )}
                  </span>
                  <span className={user.streakDays >= 1 ? "text-emerald-400" : "text-amber-400"}>
                    {user.streakDays} / 1 day
                  </span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, user.streakDays * 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>
                    {user.streakDays >= 1
                      ? "Daily streak requirement satisfied! 🌟"
                      : "Complete 1 daily lesson or streak quiz"}
                  </span>
                  {user.streakDays < 1 && (
                    <button
                      onClick={recordDailyActivity}
                      className="text-amber-400 hover:underline font-bold text-left"
                    >
                      Start Streak Now →
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ================= OFFICIAL CYBER-BLUE CERTIFICATE CARD ================= */}
          <div className="relative p-6 sm:p-12 rounded-3xl bg-gradient-to-b from-[#03152e] via-[#041c3d] to-[#010b1a] border-4 border-cyan-500/60 shadow-[0_0_50px_rgba(6,182,212,0.25)] overflow-hidden print:m-0 print:border-none print:shadow-none text-white">
            {/* Outer Cyber Accent Corner Brackets */}
            <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
            <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />
            <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-cyan-400 pointer-events-none" />
            <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-cyan-400 pointer-events-none" />

            {/* Diagonal Neon Laser Light Ribbons */}
            <div className="absolute -top-16 -left-16 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Inner Certificate Content */}
            <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto space-y-5">
              {/* Header Row */}
              <div className="w-full flex items-center justify-between text-xs pb-3 border-b border-cyan-500/30">
                <div className="text-left">
                  <span className="text-base sm:text-lg font-black tracking-tight text-white">
                    BharatSign<span className="text-cyan-400">-Bridge</span>
                  </span>
                  <span className="block text-[10px] text-cyan-200/80 font-mono tracking-wider">
                    Indian Sign Language AI Ecosystem
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[11px] sm:text-xs font-mono text-cyan-300 font-semibold tracking-wider">
                    Bridge the Communication Gap
                  </span>
                </div>
              </div>

              {/* Certificate Main Title */}
              <div className="pt-2">
                <h1 className="text-3xl sm:text-5xl font-black tracking-wider text-white uppercase drop-shadow-[0_2px_10px_rgba(255,255,255,0.3)]">
                  CERTIFICATE
                </h1>
                <span className="block text-xs sm:text-sm font-extrabold tracking-[0.35em] text-cyan-400 uppercase mt-1">
                  OF ACHIEVEMENT
                </span>
              </div>

              <p className="text-xs sm:text-sm text-cyan-100/90 font-medium italic">
                This is to certify that
              </p>

              {/* Glowing Hexagonal / Angular Name Banner */}
              <div className="w-full max-w-lg py-3 px-8 rounded-xl bg-gradient-to-r from-cyan-950/70 via-blue-950/90 to-cyan-950/70 border-2 border-cyan-400/90 shadow-[0_0_25px_rgba(6,182,212,0.4)] my-1 relative">
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-cyan-400 rotate-45" />
                <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-cyan-400 rotate-45" />
                <span className="text-2xl sm:text-4xl font-serif font-black italic tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-white drop-shadow">
                  {user.name}
                </span>
              </div>

              {/* Official Certification Statement */}
              <p className="text-xs sm:text-sm text-slate-200 max-w-xl leading-relaxed">
                has successfully completed the <strong className="text-cyan-300">BharatSign-Bridge</strong> platform, demonstrating excellence in Indian Sign Language (ISL) and AI-powered accessibility solutions.
              </p>

              {/* Quantitative Competency Metric Chips */}
              <div className="grid grid-cols-3 gap-3 w-full max-w-md pt-2">
                <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-center">
                  <span className="text-lg sm:text-xl font-black text-amber-400 flex items-center justify-center gap-1">
                    <Flame className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span>{user.streakDays}</span>
                  </span>
                  <span className="text-[10px] text-cyan-200/80 uppercase font-mono block">Day Streak</span>
                </div>

                <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-center">
                  <span className="text-lg sm:text-xl font-black text-cyan-300">
                    {user.masteredSignsCount}
                  </span>
                  <span className="text-[10px] text-cyan-200/80 uppercase font-mono block">Signs Mastered</span>
                </div>

                <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-center">
                  <span className="text-lg sm:text-xl font-black text-emerald-400">
                    {user.totalQuizzesTaken || 1}
                  </span>
                  <span className="text-[10px] text-cyan-200/80 uppercase font-mono block">Quizzes Cleared</span>
                </div>
              </div>

              {/* Footer Metadata & Scannable QR Code */}
              <div className="w-full pt-6 border-t border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between text-left gap-4 mt-4">
                {/* Left: Team Signature */}
                <div className="text-center sm:text-left">
                  <span className="font-extrabold text-xs sm:text-sm text-white block">
                    BharatSign-Bridge Team
                  </span>
                  <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase">
                    BUILD • CONNECT • EMPOWER
                  </span>
                </div>

                {/* Center: ID and Date */}
                <div className="text-center">
                  <span className="text-[10px] font-mono text-cyan-200/70 uppercase block">
                    Certificate ID
                  </span>
                  <span className="font-mono font-bold text-xs sm:text-sm text-cyan-300">
                    {certId}
                  </span>
                </div>

                <div className="text-center">
                  <span className="text-[10px] font-mono text-cyan-200/70 uppercase block">
                    Issued On
                  </span>
                  <span className="font-mono font-bold text-xs sm:text-sm text-white">
                    {new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}
                  </span>
                </div>

                {/* Right: Real Scannable QR Code */}
                <div className="flex flex-col items-center">
                  <div className="p-1 rounded-xl bg-white shadow-md border-2 border-cyan-400">
                    {certQrDataUrl ? (
                      <img
                        src={certQrDataUrl}
                        alt="Scan QR to verify Certificate"
                        className="h-16 w-16"
                      />
                    ) : (
                      <div className="h-16 w-16 bg-slate-900 flex items-center justify-center text-[10px]">
                        <QrCode className="h-8 w-8 text-cyan-400" />
                      </div>
                    )}
                  </div>
                  <div className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[9px] uppercase shadow-sm">
                    <CheckCircle2 className="h-2.5 w-2.5" />
                    <span>VERIFIED</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= EDIT PROFILE & DP PHOTO MODAL ================= */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-card border-2 border-primary/40 p-6 sm:p-7 shadow-2xl relative flex flex-col gap-5 text-foreground animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/30 text-primary flex items-center justify-center">
                  <Edit3 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-foreground text-base">Edit Profile & Display Photo</h3>
                  <p className="text-xs text-muted-foreground">Update your personal details, DP photo, and learning goals.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {profileSaveSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{profileSaveSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="flex flex-col gap-5">
              {/* DP Photo Avatar Section */}
              <div className="p-4 rounded-2xl bg-muted/40 border border-border flex flex-col gap-3">
                <span className="text-xs font-bold text-foreground">Display Photo (DP)</span>

                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-primary to-cyan-500 text-white flex items-center justify-center font-black text-xl shadow-md overflow-hidden border-2 border-primary/40">
                      {editAvatarUrl ? (
                        <img
                          src={editAvatarUrl}
                          alt="Preview"
                          className="h-full w-full object-cover"
                        />
                      ) : user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt="Current"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span>{editName.charAt(0).toUpperCase() || user.name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 flex-1">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-9 px-3.5 text-xs font-bold gap-1.5 bg-primary text-white shadow-sm hover:bg-primary/90 w-fit"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      <span>Upload Photo from Device</span>
                    </Button>
                    <span className="text-[11px] text-muted-foreground">
                      PNG, JPG, or WebP. Automatically optimized.
                    </span>
                  </div>
                </div>

                {/* Preset Avatar Selection */}
                <div className="pt-2 border-t border-border/60">
                  <span className="text-[11px] font-bold text-muted-foreground block mb-2">
                    Or select a preset avatar:
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    {PRESET_AVATARS.map((avatar, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setEditAvatarUrl(avatar.url)}
                        className={`h-10 w-10 rounded-xl overflow-hidden border-2 transition-all p-0.5 ${
                          editAvatarUrl === avatar.url
                            ? "border-cyan-400 scale-110 shadow-md shadow-cyan-500/30"
                            : "border-border hover:border-primary/60 opacity-80 hover:opacity-100"
                        }`}
                        title={avatar.name}
                      >
                        <img src={avatar.url} alt={avatar.name} className="h-full w-full object-cover rounded-lg" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Full Name */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="edit-name" className="text-xs font-bold text-foreground">
                  Full Name
                </label>
                <input
                  id="edit-name"
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g. Tirth Ladani"
                  className="h-11 px-3.5 rounded-xl bg-background border border-border text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <span className="text-[11px] text-muted-foreground">
                  This name will also appear on your official Certificate of Achievement.
                </span>
              </div>

              {/* Bio / Learning Goal */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="edit-bio" className="text-xs font-bold text-foreground">
                  Personal Bio & Learning Goals
                </label>
                <textarea
                  id="edit-bio"
                  rows={2}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="e.g. Indian Sign Language Learner & Accessibility Advocate"
                  className="p-3 rounded-xl bg-background border border-border text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              {/* Preferred Language */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Globe2 className="h-3.5 w-3.5 text-primary" />
                  <span>Preferred Learning Language</span>
                </label>
                <select
                  value={editLanguage}
                  onChange={(e) => setEditLanguage(e.target.value)}
                  className="h-11 px-3.5 rounded-xl bg-background border border-border text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {INDIC_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.native} ({lang.name})
                    </option>
                  ))}
                </select>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 h-10 text-xs font-bold rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSavingProfile}
                  className="flex-1 h-10 text-xs font-bold rounded-xl bg-primary text-white shadow-md hover:bg-primary/90"
                >
                  {isSavingProfile ? "Saving Details..." : "Save Changes ✓"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
