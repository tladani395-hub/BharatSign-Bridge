import { lazy, Suspense, useState } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { AuthAndThemeProvider } from "@/context/AuthAndThemeContext"
import { AvatarCustomizationProvider } from "@/context/AvatarCustomizationContext"
import ProtectedRoute from "@/components/auth/ProtectedRoute"

// Route-level code splitting (eliminates monolithic 1.7MB initial bundle)
const Home = lazy(() => import("@/pages/Home"))
const About = lazy(() => import("@/pages/About"))
const Translate = lazy(() => import("@/pages/Translate"))
const SpeechToISL = lazy(() => import("@/pages/SpeechToISL"))
const LiveCamera = lazy(() => import("@/pages/LiveCamera"))
const Conversation = lazy(() => import("@/pages/Conversation"))
const PublicDesk = lazy(() => import("@/pages/PublicDesk"))
const Auth = lazy(() => import("@/pages/Auth"))
const AuthCallback = lazy(() => import("@/pages/AuthCallback"))
const Profile = lazy(() => import("@/pages/Profile"))
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"))
const ResetPassword = lazy(() => import("@/pages/ResetPassword"))
const SecuritySetup = lazy(() => import("@/pages/SecuritySetup"))
const SecuritySettings = lazy(() => import("@/pages/SecuritySettings"))
const VerifyCertificate = lazy(() => import("@/pages/VerifyCertificate"))
const Leaderboard = lazy(() => import("@/pages/Leaderboard"))

// Learning Portal Pages (split into separate chunks)
const LearnDashboard = lazy(() => import("@/pages/learn/LearnDashboard"))
const AlphabetGrid = lazy(() => import("@/pages/learn/AlphabetGrid"))
const AlphabetDetail = lazy(() => import("@/pages/learn/AlphabetDetail"))
const NumbersGrid = lazy(() => import("@/pages/learn/NumbersGrid"))
const NumberDetail = lazy(() => import("@/pages/learn/NumberDetail"))
const WordsGrid = lazy(() => import("@/pages/learn/WordsGrid"))
const WordDetail = lazy(() => import("@/pages/learn/WordDetail"))
const PracticeRoom = lazy(() => import("@/pages/learn/PracticeRoom"))
const Quizzes = lazy(() => import("@/pages/learn/Quizzes"))

// Research & Utility Pages
const ResearchPortal = lazy(() => import("@/pages/research/ResearchPortal"))
const ExpertReview = lazy(() => import("@/pages/ExpertReview"))
const Settings = lazy(() => import("@/pages/Settings"))
const Accessibility = lazy(() => import("@/pages/Accessibility"))
const Contact = lazy(() => import("@/pages/Contact"))

function PageLoadingFallback() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-muted-foreground">
      <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
      <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground/70">Loading Module...</span>
    </div>
  )
}

export default function App() {
  const [globalLanguage, setGlobalLanguage] = useState<string>(() => {
    return localStorage.getItem("bharatsign_language") || "en" // Default to English
  })

  const handleLanguageChange = (code: string) => {
    setGlobalLanguage(code)
    localStorage.setItem("bharatsign_language", code)
  }

  return (
    <AuthAndThemeProvider>
      <AvatarCustomizationProvider>
        <Router>
        <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/20 selection:text-primary transition-colors duration-200">
          {/* Navigation Bar Header */}
          <Navbar currentLanguage={globalLanguage} onLanguageChange={handleLanguageChange} />

          {/* Dynamic Route Viewport */}
          <main className="flex-1">
            <Suspense fallback={<PageLoadingFallback />}>
            <Routes>
              {/* Core Pages */}
              <Route
                path="/"
                element={<Home currentLanguage={globalLanguage} onLanguageChange={handleLanguageChange} />}
              />
              <Route path="/about" element={<About />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/login" element={<Navigate to="/auth" replace />} />
              <Route path="/security-setup" element={<SecuritySetup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings/security" element={<SecuritySettings />} />

              {/* Communication Suite */}
              <Route
                path="/translate"
                element={
                  <Translate
                    currentLanguage={globalLanguage}
                    onLanguageChange={handleLanguageChange}
                  />
                }
              />
              <Route
                path="/speech-to-isl"
                element={
                  <SpeechToISL
                    currentLanguage={globalLanguage}
                    onLanguageChange={handleLanguageChange}
                  />
                }
              />
              <Route
                path="/isl-to-text"
                element={
                  <LiveCamera
                    currentLanguage={globalLanguage}
                    onLanguageChange={handleLanguageChange}
                  />
                }
              />
              <Route
                path="/live-camera"
                element={
                  <LiveCamera
                    currentLanguage={globalLanguage}
                    onLanguageChange={handleLanguageChange}
                  />
                }
              />
              <Route
                path="/conversation"
                element={
                  <Conversation
                    currentLanguage={globalLanguage}
                    onLanguageChange={handleLanguageChange}
                  />
                }
              />
              <Route
                path="/public-desk"
                element={
                  <PublicDesk
                    currentLanguage={globalLanguage}
                    onLanguageChange={handleLanguageChange}
                  />
                }
              />
              <Route
                path="/suvidha"
                element={
                  <PublicDesk
                    currentLanguage={globalLanguage}
                    onLanguageChange={handleLanguageChange}
                  />
                }
              />

              {/* Learning Portal Suite (Gated by Student Sign-In) */}
              <Route
                path="/learn"
                element={
                  <ProtectedRoute>
                    <LearnDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/learn/alphabet"
                element={
                  <ProtectedRoute>
                    <AlphabetGrid currentLanguage={globalLanguage} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/learn/alphabet/:letter"
                element={
                  <ProtectedRoute>
                    <AlphabetDetail currentLanguage={globalLanguage} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/learn/numbers"
                element={
                  <ProtectedRoute>
                    <NumbersGrid currentLanguage={globalLanguage} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/learn/numbers/:number"
                element={
                  <ProtectedRoute>
                    <NumberDetail currentLanguage={globalLanguage} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/learn/words"
                element={
                  <ProtectedRoute>
                    <WordsGrid currentLanguage={globalLanguage} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/learn/words/:wordId"
                element={
                  <ProtectedRoute>
                    <WordDetail currentLanguage={globalLanguage} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/learn/practice"
                element={
                  <ProtectedRoute>
                    <PracticeRoom currentLanguage={globalLanguage} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/learn/quizzes"
                element={
                  <ProtectedRoute>
                    <Quizzes />
                  </ProtectedRoute>
                }
              />

              {/* Research & Compliance Portal */}
              <Route path="/research" element={<ResearchPortal />} />
              <Route path="/research/dataset" element={<ResearchPortal />} />
              <Route path="/research/benchmarks" element={<ResearchPortal />} />
              <Route path="/research/paper" element={<ResearchPortal />} />
              <Route path="/expert-review" element={<ExpertReview />} />

              {/* Public Official Certificate Verification & Community Leaderboard */}
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/verify-cert" element={<VerifyCertificate />} />
              <Route path="/verify-cert/:certId" element={<VerifyCertificate />} />
              <Route path="/certificate/:certId" element={<VerifyCertificate />} />

              {/* System & Support Pages */}
              <Route
                path="/settings"
                element={
                  <Settings
                    currentLanguage={globalLanguage}
                    onLanguageChange={handleLanguageChange}
                  />
                }
              />
              <Route path="/accessibility" element={<Accessibility />} />
              <Route path="/contact" element={<Contact />} />

              {/* Wildcard Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            </Suspense>
          </main>

          {/* Global Academic & Accessibility Footer */}
          <Footer />
        </div>
        </Router>
      </AvatarCustomizationProvider>
    </AuthAndThemeProvider>
  )
}
