import { useState } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { AuthAndThemeProvider } from "@/context/AuthAndThemeContext"
import { AvatarCustomizationProvider } from "@/context/AvatarCustomizationContext"
import ProtectedRoute from "@/components/auth/ProtectedRoute"

// Core Page Imports
import Home from "@/pages/Home"
import About from "@/pages/About"
import Translate from "@/pages/Translate"
import SpeechToISL from "@/pages/SpeechToISL"
import LiveCamera from "@/pages/LiveCamera"
import Conversation from "@/pages/Conversation"
import PublicDesk from "@/pages/PublicDesk"
import Auth from "@/pages/Auth"
import Profile from "@/pages/Profile"
import ForgotPassword from "@/pages/ForgotPassword"
import ResetPassword from "@/pages/ResetPassword"
import SecuritySetup from "@/pages/SecuritySetup"
import SecuritySettings from "@/pages/SecuritySettings"
import VerifyCertificate from "@/pages/VerifyCertificate"
import Leaderboard from "@/pages/Leaderboard"

// Learning Portal Pages
import LearnDashboard from "@/pages/learn/LearnDashboard"
import AlphabetGrid from "@/pages/learn/AlphabetGrid"
import AlphabetDetail from "@/pages/learn/AlphabetDetail"
import NumbersGrid from "@/pages/learn/NumbersGrid"
import NumberDetail from "@/pages/learn/NumberDetail"
import WordsGrid from "@/pages/learn/WordsGrid"
import WordDetail from "@/pages/learn/WordDetail"
import PracticeRoom from "@/pages/learn/PracticeRoom"
import Quizzes from "@/pages/learn/Quizzes"

// Research & Organization Pages
import ResearchPortal from "@/pages/research/ResearchPortal"
import ExpertReview from "@/pages/ExpertReview"
import Settings from "@/pages/Settings"
import Accessibility from "@/pages/Accessibility"
import Contact from "@/pages/Contact"

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
            <Routes>
              {/* Core Pages */}
              <Route
                path="/"
                element={<Home currentLanguage={globalLanguage} onLanguageChange={handleLanguageChange} />}
              />
              <Route path="/about" element={<About />} />
              <Route path="/auth" element={<Auth />} />
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
          </main>

          {/* Global Academic & Accessibility Footer */}
          <Footer />
        </div>
        </Router>
      </AvatarCustomizationProvider>
    </AuthAndThemeProvider>
  )
}
