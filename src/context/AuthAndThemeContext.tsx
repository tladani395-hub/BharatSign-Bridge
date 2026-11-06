import React, { createContext, useContext, useState, useEffect } from "react"

export interface UserProfile {
  id: string
  name: string
  email: string
  preferredLanguage: string
  streakDays: number
  lastActiveDate?: string
  lastQuizDate?: string
  masteredSignsCount: number
  totalQuizzesTaken: number
  practiceMinutes?: number
  avatarUrl?: string
  bio?: string
  level: string
  joinedDate: string
  hasSecurityQuestions?: boolean
  dailyTasksCompleted?: {
    visit: boolean
    learn: boolean
    quiz: boolean
  }
}

interface AuthAndThemeContextType {
  user: UserProfile | null
  isAuthenticated: boolean
  login: (name: string, email: string, language?: string, existingUser?: Partial<UserProfile>) => void
  logout: () => void
  updateProfile: (updates: Partial<UserProfile>) => void
  recordDailyActivity: () => boolean
  recordLessonCompleted: (signGloss?: string) => boolean
  completeStreakQuiz: () => boolean
  resetStreakToZero: () => void
  theme: "dark" | "light"
  toggleTheme: () => void
}

function calculateLevel(streakDays: number, masteredCount: number): string {
  if (streakDays >= 15 || masteredCount >= 40) return "ISL Master • Level 4"
  if (streakDays >= 7 || masteredCount >= 20) return "ISL Scholar • Level 3"
  if (streakDays >= 3 || masteredCount >= 8) return "ISL Explorer • Level 2"
  return "ISL Beginner • Level 1"
}

const DEFAULT_USER: UserProfile = {
  id: "user_isl_001",
  name: "New ISL Student",
  email: "student@bharatsign.ai",
  preferredLanguage: "en",
  streakDays: 0, // Starts at 0 days streak for every new person!
  lastActiveDate: "",
  lastQuizDate: "",
  masteredSignsCount: 0,
  totalQuizzesTaken: 0,
  practiceMinutes: 0,
  level: "ISL Beginner • Level 1",
  joinedDate: "November 2026",
  dailyTasksCompleted: {
    visit: false,
    learn: false,
    quiz: false,
  },
}

const AuthAndThemeContext = createContext<AuthAndThemeContextType | undefined>(undefined)

export function AuthAndThemeProvider({ children }: { children: React.ReactNode }) {
  // Theme state
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    const saved = localStorage.getItem("bharatsign_theme")
    if (saved === "light" || saved === "dark") return saved
    return "dark" // Default to sleek dark cyber mode
  })

  // User auth state
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem("bharatsign_user")
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        return null
      }
    }
    return null
  })

  // Sync theme with HTML document root
  useEffect(() => {
    const root = document.documentElement
    if (theme === "dark") {
      root.classList.add("dark")
      root.classList.remove("light")
    } else {
      root.classList.remove("dark")
      root.classList.add("light")
    }
    localStorage.setItem("bharatsign_theme", theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"))
  }

  const syncWithBackend = (u: UserProfile) => {
    try {
      fetch("http://127.0.0.1:8000/api/auth/sync-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: u.email,
          streak_days: u.streakDays,
          mastered_signs_count: u.masteredSignsCount,
          total_quizzes_taken: u.totalQuizzesTaken,
          level: u.level,
        }),
      }).catch(() => {})
    } catch {
      // Offline fallback
    }
  }

  // User login: initializes or restores from database
  const login = (
    name: string,
    email: string,
    language: string = "en",
    existingUser?: Partial<UserProfile>
  ) => {
    const today = new Date().toDateString()
    const newUser: UserProfile = {
      id: existingUser?.id || `user_${Date.now()}`,
      name: existingUser?.name || name || "New ISL Student",
      email: existingUser?.email || email || "student@bharatsign.ai",
      preferredLanguage: existingUser?.preferredLanguage || language,
      streakDays: existingUser?.streakDays !== undefined ? existingUser.streakDays : 0,
      lastActiveDate: existingUser?.lastActiveDate || today,
      lastQuizDate: existingUser?.lastQuizDate || "",
      masteredSignsCount: existingUser?.masteredSignsCount || 0,
      totalQuizzesTaken: existingUser?.totalQuizzesTaken || 0,
      practiceMinutes: existingUser?.practiceMinutes || 0,
      avatarUrl: existingUser?.avatarUrl || "",
      bio: existingUser?.bio || "",
      level: existingUser?.level || "ISL Beginner • Level 1",
      joinedDate: existingUser?.joinedDate || new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
      dailyTasksCompleted: existingUser?.dailyTasksCompleted || {
        visit: false,
        learn: false,
        quiz: false,
      },
    }
    setUser(newUser)
    localStorage.setItem("bharatsign_user", JSON.stringify(newUser))
    syncWithBackend(newUser)
  }

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (!user) return
    const updated: UserProfile = {
      ...user,
      ...updates,
      level: calculateLevel(updates.streakDays ?? user.streakDays, updates.masteredSignsCount ?? user.masteredSignsCount),
    }
    setUser(updated)
    localStorage.setItem("bharatsign_user", JSON.stringify(updated))
    syncWithBackend(updated)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("bharatsign_user")
  }

  // Active Everyday / Visit Website Action: Increases streak (+1) when active!
  const recordDailyActivity = (): boolean => {
    if (!user) return false
    const today = new Date().toDateString()
    const currentTasks = user.dailyTasksCompleted || { visit: false, learn: false, quiz: false }

    if (currentTasks.visit && user.lastActiveDate === today && user.streakDays > 0) {
      return false // already recorded today
    }

    const nextStreak = user.streakDays + 1
    const nextLevel = calculateLevel(nextStreak, user.masteredSignsCount)

    const updated: UserProfile = {
      ...user,
      streakDays: nextStreak,
      lastActiveDate: today,
      level: nextLevel,
      dailyTasksCompleted: {
        ...currentTasks,
        visit: true,
      },
    }

    setUser(updated)
    localStorage.setItem("bharatsign_user", JSON.stringify(updated))
    syncWithBackend(updated)
    return true
  }

  // Complete Work & Learn: Practice sign or finish lesson (+1 Mastered sign & Streak up)
  const recordLessonCompleted = (_signGloss?: string): boolean => {
    if (!user) return false
    const today = new Date().toDateString()
    const currentTasks = user.dailyTasksCompleted || { visit: false, learn: false, quiz: false }

    const nextSigns = user.masteredSignsCount + 1
    const nextStreak = currentTasks.learn ? user.streakDays : user.streakDays + 1
    const nextPractice = (user.practiceMinutes || 0) + 15
    const nextLevel = calculateLevel(nextStreak, nextSigns)

    const updated: UserProfile = {
      ...user,
      streakDays: nextStreak,
      lastActiveDate: today,
      masteredSignsCount: nextSigns,
      practiceMinutes: nextPractice,
      level: nextLevel,
      dailyTasksCompleted: {
        ...currentTasks,
        learn: true,
      },
    }

    setUser(updated)
    localStorage.setItem("bharatsign_user", JSON.stringify(updated))
    syncWithBackend(updated)
    return true
  }

  // Complete Daily Streak Quiz: Streak up (+1) and quiz count up
  const completeStreakQuiz = (): boolean => {
    if (!user) return false
    const today = new Date().toDateString()
    const currentTasks = user.dailyTasksCompleted || { visit: false, learn: false, quiz: false }

    if (user.lastQuizDate === today && currentTasks.quiz) {
      return false // already completed today
    }

    const nextStreak = user.streakDays + 1
    const nextSigns = user.masteredSignsCount + 1
    const nextQuizzes = user.totalQuizzesTaken + 1
    const nextLevel = calculateLevel(nextStreak, nextSigns)

    const updated: UserProfile = {
      ...user,
      streakDays: nextStreak,
      lastActiveDate: today,
      lastQuizDate: today,
      masteredSignsCount: nextSigns,
      totalQuizzesTaken: nextQuizzes,
      level: nextLevel,
      dailyTasksCompleted: {
        ...currentTasks,
        quiz: true,
      },
    }

    setUser(updated)
    localStorage.setItem("bharatsign_user", JSON.stringify(updated))
    syncWithBackend(updated)
    return true
  }

  // Reset to 0 Days Streak (for testing 0-day new student experience)
  const resetStreakToZero = () => {
    if (!user) return
    const updated: UserProfile = {
      ...user,
      streakDays: 0,
      masteredSignsCount: 0,
      totalQuizzesTaken: 0,
      practiceMinutes: 0,
      lastActiveDate: "",
      lastQuizDate: "",
      level: "ISL Beginner • Level 1",
      dailyTasksCompleted: {
        visit: false,
        learn: false,
        quiz: false,
      },
    }
    setUser(updated)
    localStorage.setItem("bharatsign_user", JSON.stringify(updated))
  }

  return (
    <AuthAndThemeContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        updateProfile,
        recordDailyActivity,
        recordLessonCompleted,
        completeStreakQuiz,
        resetStreakToZero,
        theme,
        toggleTheme,
      }}
    >
      {children}
    </AuthAndThemeContext.Provider>
  )
}

export function useAuthAndTheme() {
  const context = useContext(AuthAndThemeContext)
  if (!context) {
    throw new Error("useAuthAndTheme must be used within an AuthAndThemeProvider")
  }
  return context
}

export { DEFAULT_USER }
