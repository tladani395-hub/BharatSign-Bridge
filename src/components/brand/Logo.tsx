import { Link } from "react-router-dom"

interface LogoProps {
  variant?: "full" | "icon"
  theme?: "dark" | "light" | "auto"
  size?: "sm" | "md" | "lg"
  className?: string
}

export default function Logo({
  variant = "full",
  theme = "auto",
  size = "md",
  className = "",
}: LogoProps) {
  const iconDimensions = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-14 w-14",
  }[size]

  const textStyles = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-2xl",
  }[size]

  const bharatTextClass =
    theme === "dark"
      ? "text-white"
      : theme === "light"
      ? "text-[#102A43]"
      : "text-[#102A43] dark:text-[#F1F4FF]"

  const subTextClass =
    theme === "dark"
      ? "text-slate-300"
      : theme === "light"
      ? "text-slate-600"
      : "text-muted-foreground"

  return (
    <Link
      to="/"
      className={`inline-flex items-center gap-2.5 transition-transform hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg ${className}`}
      aria-label="BharatSign Bridge Home"
    >
      {/* Precision Geometric SVG: Interconnected Neural Bridge & Harmonized Hands */}
      <div className={`relative ${iconDimensions} shrink-0`}>
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full drop-shadow-md"
        >
          {/* Base rounded shield / bridge arch */}
          <rect width="48" height="48" rx="14" fill="#102A43" />
          
          {/* Radial cyan glow behind glyph */}
          <circle cx="24" cy="24" r="16" fill="url(#cyanGlow)" opacity="0.25" />

          {/* Left Hand Silhouette / Node Arc */}
          <path
            d="M14 28C14 21.3726 19.3726 16 26 16C28.5 16 30.5 17 32 18.5"
            stroke="#22D3EE"
            strokeWidth="3.2"
            strokeLinecap="round"
          />

          {/* Right Hand Silhouette / Connecting Arch Bridge */}
          <path
            d="M34 20C34 26.6274 28.6274 32 22 32C19.5 32 17.5 31 16 29.5"
            stroke="#3B82F6"
            strokeWidth="3.2"
            strokeLinecap="round"
          />

          {/* Intersecting Gesture Connection Knot & Animated Blinking AI Eye */}
          <g className="logo-eye-center">
            <circle cx="24" cy="24" r="4.2" fill="#FFFFFF" />
            <circle cx="24" cy="24" r="2.2" fill="#0E6E8C" />
            <ellipse cx="24" cy="24" rx="4.3" ry="4.3" fill="#102A43" className="logo-eyelid" />
          </g>

          {/* Dynamic Gesture Finger Radiance Points */}
          <circle cx="16" cy="18" r="2" fill="#38BDF8" />
          <circle cx="32" cy="30" r="2" fill="#38BDF8" />
          <circle cx="34" cy="16" r="1.8" fill="#22D3EE" />

          <defs>
            <radialGradient
              id="cyanGlow"
              cx="0"
              cy="0"
              r="1"
              gradientUnits="userSpaceOnUse"
              gradientTransform="translate(24 24) rotate(90) scale(16)"
            >
              <stop stopColor="#38BDF8" />
              <stop offset="1" stopColor="#102A43" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
      </div>

      {variant === "full" && (
        <div className="flex flex-col leading-tight">
          <div className="flex items-center gap-1.5 font-black tracking-tight text-foreground">
            <span className={`${textStyles} font-extrabold ${bharatTextClass}`}>
              BharatSign
            </span>
            <span className={`${textStyles} font-black text-[#3B82F6]`}>Bridge</span>
            <span className="rounded bg-[#3B82F6]/10 px-1.5 py-0.2 text-[10px] font-bold text-[#3B82F6] border border-[#3B82F6]/20">
              2.0
            </span>
          </div>
          <span className={`text-[10px] font-semibold uppercase tracking-widest ${subTextClass}`}>
            Indian Sign Language AI
          </span>
        </div>
      )}
    </Link>
  )
}
