import { Sun, Moon } from "lucide-react"
import { useAuthAndTheme } from "@/context/AuthAndThemeContext"

export default function ThreeDThemeToggle() {
  const { theme, toggleTheme } = useAuthAndTheme()
  const isDark = theme === "dark"

  return (
    <button
      onClick={toggleTheme}
      type="button"
      title={`Switch to ${isDark ? "Light" : "Dark"} Mode (3D Tactical Switch)`}
      aria-label={`Toggle theme, current is ${theme}`}
      className={`group relative inline-flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold text-xs transition-all duration-200 select-none cursor-pointer
        /* 3D Tactile Push Button Geometry */
        ${
          isDark
            ? "bg-gradient-to-b from-slate-800 to-slate-900 text-cyan-300 border border-cyan-500/40 shadow-[0_4px_0_0_#0f172a,0_8px_16px_rgba(6,182,212,0.25)] hover:shadow-[0_2px_0_0_#0f172a,0_4px_8px_rgba(6,182,212,0.3)] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none"
            : "bg-gradient-to-b from-amber-50 to-amber-200 text-amber-900 border border-amber-400 shadow-[0_4px_0_0_#d97706,0_8px_16px_rgba(245,158,11,0.25)] hover:shadow-[0_2px_0_0_#d97706,0_4px_8px_rgba(245,158,11,0.3)] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none"
        }
      `}
    >
      {/* 3D Raised Icon Disk */}
      <span
        className={`flex h-5 w-5 items-center justify-center rounded-lg shadow-inner transition-transform duration-300 group-hover:rotate-12 ${
          isDark
            ? "bg-slate-950 text-cyan-400 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]"
            : "bg-amber-400 text-amber-950 shadow-[inset_0_2px_4px_rgba(255,255,255,0.6)]"
        }`}
      >
        {isDark ? (
          <Moon className="h-3.5 w-3.5 fill-cyan-400/30" />
        ) : (
          <Sun className="h-3.5 w-3.5 fill-amber-300" />
        )}
      </span>

      {/* Button Label */}
      <span className="font-mono text-[11px] font-extrabold uppercase tracking-wider hidden sm:inline">
        {isDark ? "DARK 3D" : "LIGHT 3D"}
      </span>

      {/* Glowing 3D Micro-LED */}
      <span
        className={`h-2 w-2 rounded-full transition-all ${
          isDark
            ? "bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-pulse"
            : "bg-amber-500 shadow-[0_0_8px_#f59e0b] animate-pulse"
        }`}
      />
    </button>
  )
}
