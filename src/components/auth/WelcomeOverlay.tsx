import { useEffect, useRef, useState, useCallback } from "react"

export interface WelcomeOverlayProps {
  show?: boolean
  onDone?: () => void
}

export default function WelcomeOverlay({ show = false, onDone }: WelcomeOverlayProps) {
  const [visible, setVisible] = useState(show)
  const [isClosing, setIsClosing] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const stageRef = useRef<HTMLDivElement | null>(null)
  const animFrameRef = useRef<number>(0)

  // Mouse Parallax Tilt state
  const mouseTargetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const mouseCurrentRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })

  // Synchronize internal state with show prop
  useEffect(() => {
    if (show) {
      setVisible(true)
      setIsClosing(false)
    }
  }, [show])

  // Expose BharatSignWelcome.play globally
  useEffect(() => {
    if (typeof window !== "undefined") {
      ;(window as any).BharatSignWelcome = {
        play: (opts?: { onDone?: () => void }) => {
          setVisible(true)
          setIsClosing(false)
          if (opts?.onDone) {
            // Register callback
            const handleDone = () => {
              opts.onDone?.()
            }
            ;(window as any).__bharatSignWelcomeDone = handleDone
          }
        },
      }
    }
    return () => {
      if (typeof window !== "undefined") {
        delete (window as any).BharatSignWelcome
        delete (window as any).__bharatSignWelcomeDone
      }
    }
  }, [])

  const handleFinish = useCallback(() => {
    setIsClosing(true)
    setTimeout(() => {
      setVisible(false)
      setIsClosing(false)
      if (onDone) onDone()
      if (typeof window !== "undefined" && (window as any).__bharatSignWelcomeDone) {
        ;(window as any).__bharatSignWelcomeDone()
        delete (window as any).__bharatSignWelcomeDone
      }
    }, 500)
  }, [onDone])

  // Mouse Parallax Handler
  useEffect(() => {
    if (!visible) return

    const handleMouseMove = (e: MouseEvent) => {
      const halfW = window.innerWidth / 2
      const halfH = window.innerHeight / 2
      mouseTargetRef.current = {
        x: (e.clientX - halfW) / halfW,
        y: (e.clientY - halfH) / halfH,
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [visible])

  // 3D Starfield Canvas & Parallax Render Loop
  useEffect(() => {
    if (!visible) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener("resize", handleResize)

    // Star initialization
    const NUM_STARS = Math.min(220, Math.floor((width * height) / 5000))
    const stars: Array<{ x: number; y: number; z: number; pz: number; sz: number; col: string }> = []
    const colors = ["#22d3ee", "#38bdf8", "#60a5fa", "#ffffff", "#e0f2fe"]

    for (let i = 0; i < NUM_STARS; i++) {
      stars.push({
        x: (Math.random() - 0.5) * width * 1.8,
        y: (Math.random() - 0.5) * height * 1.8,
        z: Math.random() * 1000 + 1,
        pz: 1000,
        sz: Math.random() * 1.8 + 0.6,
        col: colors[Math.floor(Math.random() * colors.length)],
      })
    }

    const fov = 260
    const speed = 4.5

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      // Smooth mouse tilt interpolation
      mouseCurrentRef.current.x += (mouseTargetRef.current.x - mouseCurrentRef.current.x) * 0.05
      mouseCurrentRef.current.y += (mouseTargetRef.current.y - mouseCurrentRef.current.y) * 0.05

      if (stageRef.current) {
        const tiltY = mouseCurrentRef.current.x * 9 // degrees
        const tiltX = -mouseCurrentRef.current.y * 7 // degrees
        stageRef.current.style.transform = `perspective(1100px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`
      }

      const cx = width / 2
      const cy = height / 2

      // Draw and update stars flying toward the camera
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i]
        s.pz = s.z
        s.z -= speed

        if (s.z <= 0) {
          s.z = 1000
          s.pz = 1000
          s.x = (Math.random() - 0.5) * width * 1.8
          s.y = (Math.random() - 0.5) * height * 1.8
        }

        const k = fov / s.z
        const px = s.x * k + cx
        const py = s.y * k + cy

        const pk = fov / s.pz
        const prevPx = s.x * pk + cx
        const prevPy = s.y * pk + cy

        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          const alpha = Math.min(1, Math.max(0, (1 - s.z / 1000) * 0.85))
          const starRadius = Math.max(0.7, (1 - s.z / 1000) * s.sz * 2.2)

          ctx.beginPath()
          ctx.strokeStyle = s.col
          ctx.globalAlpha = alpha
          ctx.lineWidth = starRadius
          ctx.lineCap = "round"
          ctx.moveTo(prevPx, prevPy)
          ctx.lineTo(px, py)
          ctx.stroke()
        }
      }

      ctx.globalAlpha = 1
      animFrameRef.current = requestAnimationFrame(render)
    }

    animFrameRef.current = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animFrameRef.current)
      window.removeEventListener("resize", handleResize)
    }
  }, [visible])

  if (!visible) return null

  // Wordmark letters breakdown
  const titlePart1 = "BharatSign".split("")
  const titlePart2 = "Bridge".split("")
  const taglineLetters = "Let's begin a new journey".split("")

  return (
    <aside
      aria-label="Welcome animation"
      className={`fixed inset-0 z-50 flex items-center justify-center overflow-hidden transition-opacity duration-500 ${
        isClosing ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{
        background: "radial-gradient(ellipse at 50% 45%, #0d2350 0%, #050816 85%)",
      }}
    >
      {/* 3D Starfield Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none w-full h-full opacity-70"
      />

      {/* Central 3D Perspective Stage */}
      <div
        ref={stageRef}
        className="relative z-10 flex flex-col items-center justify-center text-center px-4 max-w-4xl w-full select-none"
        style={{
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
      >
        {/* Glow Halo behind Logo */}
        <div className="absolute top-[8%] -translate-y-1/2 w-[340px] h-[340px] rounded-full bg-cyan-500/15 blur-[85px] pointer-events-none" />

        {/* 1. Logo & Expanding Tilted Rings */}
        <div className="relative mb-6 flex items-center justify-center">
          {/* Expanding Tilted Ring 1 */}
          <div className="welcome-tilted-ring welcome-ring-1" />
          {/* Expanding Tilted Ring 2 */}
          <div className="welcome-tilted-ring welcome-ring-2" />
          {/* Expanding Tilted Ring 3 */}
          <div className="welcome-tilted-ring welcome-ring-3" />

          {/* 3D Spinning & Rising Eye Logo Tile */}
          <div className="welcome-logo-tile relative rounded-[28px] overflow-hidden p-1 shadow-2xl">
            {/* SVG Logo Tile */}
            <svg
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full drop-shadow-2xl"
            >
              {/* Base Rounded Shield */}
              <rect width="48" height="48" rx="14" fill="#102A43" />

              {/* Cyan Radial Glow */}
              <circle cx="24" cy="24" r="16" fill="url(#welcomeCyanGlow)" opacity="0.35" />

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

              {/* Intersecting Gesture Connection Knot & Animated Blinking Pupil */}
              <g className="welcome-eye-group">
                <circle cx="24" cy="24" r="4.2" fill="#FFFFFF" />
                <circle cx="24" cy="24" r="2.2" fill="#0E6E8C" />
                <ellipse cx="24" cy="24" rx="4.3" ry="4.3" fill="#102A43" className="welcome-eyelid" />
              </g>

              {/* Gesture Radiance Nodes */}
              <circle cx="16" cy="18" r="2" fill="#38BDF8" />
              <circle cx="32" cy="30" r="2" fill="#38BDF8" />
              <circle cx="34" cy="16" r="1.8" fill="#22D3EE" />

              <defs>
                <radialGradient
                  id="welcomeCyanGlow"
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

            {/* Diagonal Light Sweep Across Tile */}
            <div className="welcome-light-sweep" />
          </div>
        </div>

        {/* 2. Wordmark: "BharatSign Bridge 2.0" */}
        <div
          className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 mb-2 font-black tracking-tight"
          style={{
            perspective: "1000px",
            transformStyle: "preserve-3d",
            fontSize: "clamp(2rem, 5.5vw, 3.5rem)",
            fontWeight: 800,
          }}
        >
          {/* "BharatSign" in Crisp White with Depth Text-Shadow */}
          <div className="inline-flex items-center" style={{ transformStyle: "preserve-3d" }}>
            {titlePart1.map((char, i) => (
              <span
                key={`b1-${i}`}
                className="welcome-letter-flip inline-block text-white"
                style={{
                  animationDelay: `${1.7 + i * 0.045}s`,
                  textShadow:
                    "0 3px 12px rgba(0, 0, 0, 0.7), 0 0 25px rgba(255, 255, 255, 0.4), 0 0 50px rgba(34, 211, 238, 0.3)",
                }}
              >
                {char}
              </span>
            ))}
          </div>

          {/* "Bridge" in Radiant Blue #3b82f6 */}
          <div className="inline-flex items-center" style={{ transformStyle: "preserve-3d" }}>
            {titlePart2.map((char, i) => (
              <span
                key={`b2-${i}`}
                className="welcome-letter-flip inline-block text-[#3b82f6]"
                style={{
                  animationDelay: `${2.15 + i * 0.05}s`,
                  textShadow:
                    "0 3px 12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(59, 130, 246, 0.8), 0 0 60px rgba(34, 211, 238, 0.4)",
                }}
              >
                {char}
              </span>
            ))}
          </div>

          {/* "2.0" Pill Badge */}
          <div className="welcome-badge-pop inline-flex items-center ml-1">
            <span
              className="px-2.5 py-0.5 rounded-full font-black border text-cyan-300 border-cyan-400/50"
              style={{
                fontSize: "clamp(0.7rem, 1.8vw, 0.9rem)",
                background: "linear-gradient(135deg, rgba(34, 211, 238, 0.2), rgba(59, 130, 246, 0.3))",
                boxShadow: "0 0 16px rgba(34, 211, 238, 0.45)",
              }}
            >
              2.0
            </span>
          </div>
        </div>

        {/* Subtitle: "INDIAN SIGN LANGUAGE AI" */}
        <div
          className="welcome-subtitle text-[#94a3b8] font-bold uppercase mb-6"
          style={{
            fontSize: "clamp(0.7rem, 1.6vw, 0.85rem)",
            letterSpacing: "0.28em",
          }}
        >
          Indian Sign Language AI
        </div>

        {/* 3. Tagline: "Let's begin a new journey" with 3D Flip & Continuous Cyan Wave */}
        <div className="relative mb-10 px-2 flex flex-col items-center">
          <div
            className="flex flex-wrap items-center justify-center font-extrabold"
            style={{
              perspective: "1000px",
              transformStyle: "preserve-3d",
              fontSize: "clamp(1.1rem, 2.8vw, 1.6rem)",
            }}
          >
            {taglineLetters.map((char, i) => (
              <span
                key={`tag-${i}`}
                className="welcome-letter-flip welcome-cyan-wave inline-block text-slate-200"
                style={{
                  animationDelay: `${3.1 + i * 0.04}s, ${4.3 + i * 0.06}s`,
                  whiteSpace: char === " " ? "pre" : "normal",
                }}
              >
                {char === " " ? "\u00A0" : char}
              </span>
            ))}
          </div>

          {/* Gradient Underline Growing Horizontally */}
          <div className="welcome-underline mt-2 h-[2.5px] w-48 max-w-full rounded-full" />
        </div>

        {/* 4. "Get Started →" Button with 3D Tilt Rise */}
        <div className="welcome-button-wrap">
          <button
            onClick={handleFinish}
            className="welcome-cta-btn group relative inline-flex items-center gap-3 px-8 py-3.5 rounded-full text-white font-extrabold text-sm sm:text-base cursor-pointer transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-cyan-400/40"
            style={{
              background: "linear-gradient(135deg, #2f4bff 0%, #1fa2ff 100%)",
              boxShadow:
                "0 12px 35px rgba(31, 162, 255, 0.45), 0 0 25px rgba(47, 75, 255, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.4)",
            }}
          >
            <span>Get Started</span>
            <span className="transition-transform duration-300 group-hover:translate-x-1.5 text-lg leading-none">
              →
            </span>
          </button>
        </div>
      </div>

      {/* Embedded High-Performance Scoped Styles */}
      <style>{`
        /* 1. Tilted Glowing Expanding Rings */
        .welcome-tilted-ring {
          position: absolute;
          width: 170px;
          height: 170px;
          border-radius: 50%;
          border: 1.5px solid rgba(34, 211, 238, 0.7);
          box-shadow: 0 0 25px rgba(34, 211, 238, 0.45), inset 0 0 15px rgba(34, 211, 238, 0.25);
          pointer-events: none;
          transform: rotateX(68deg) rotateY(12deg) scale(0.6);
          opacity: 0;
        }
        .welcome-ring-1 {
          animation: welcomeRingPulse 3.8s cubic-bezier(0.2, 0.8, 0.2, 1) infinite 1.4s;
        }
        .welcome-ring-2 {
          animation: welcomeRingPulse 3.8s cubic-bezier(0.2, 0.8, 0.2, 1) infinite 2.5s;
        }
        .welcome-ring-3 {
          animation: welcomeRingPulse 3.8s cubic-bezier(0.2, 0.8, 0.2, 1) infinite 3.6s;
        }

        @keyframes welcomeRingPulse {
          0% {
            transform: rotateX(68deg) rotateY(12deg) scale(0.5);
            opacity: 0.9;
          }
          100% {
            transform: rotateX(68deg) rotateY(12deg) scale(2.4);
            opacity: 0;
          }
        }

        /* 2. Logo Tile 3D Rise, Spin & Overshoot */
        .welcome-logo-tile {
          width: clamp(92px, 14vw, 120px);
          height: clamp(92px, 14vw, 120px);
          background: linear-gradient(135deg, #102a43 0%, #06152b 100%);
          border: 2px solid rgba(34, 211, 238, 0.55);
          box-shadow: 0 20px 50px rgba(16, 42, 67, 0.8), 0 0 35px rgba(34, 211, 238, 0.45);
          animation: welcomeLogoRise 1.6s cubic-bezier(0.18, 0.9, 0.32, 1.15) forwards,
                     welcomeLogoFloat 4s ease-in-out infinite alternate 1.8s;
          transform-style: preserve-3d;
        }

        @keyframes welcomeLogoRise {
          0% {
            opacity: 0;
            transform: translateY(110vh) rotateY(-540deg) rotateX(25deg) scale(0.35);
          }
          65% {
            opacity: 1;
            transform: translateY(-14px) rotateY(15deg) rotateX(-6deg) scale(1.08);
          }
          85% {
            transform: translateY(4px) rotateY(-6deg) scale(0.98);
          }
          100% {
            opacity: 1;
            transform: translateY(0) rotateY(0deg) scale(1);
          }
        }

        @keyframes welcomeLogoFloat {
          0% {
            transform: translateY(0) rotateY(0deg);
          }
          100% {
            transform: translateY(-10px) rotateY(4deg) rotateZ(1.5deg);
          }
        }

        /* Diagonal Light Sweep Across Tile */
        .welcome-light-sweep {
          position: absolute;
          inset: 0;
          background: linear-gradient(110deg, transparent 25%, rgba(255, 255, 255, 0.5) 50%, transparent 75%);
          transform: translateX(-160%) skewX(-25deg);
          animation: welcomeSweep 4s ease-in-out infinite 1.8s;
          pointer-events: none;
        }

        @keyframes welcomeSweep {
          0%, 15% {
            transform: translateX(-160%) skewX(-25deg);
          }
          50%, 100% {
            transform: translateX(180%) skewX(-25deg);
          }
        }

        /* Eyelid Natural Blinking */
        .welcome-eyelid {
          transform-origin: 24px 24px;
          animation: welcomeEyeBlink 4.2s ease-in-out infinite 2.2s;
        }

        @keyframes welcomeEyeBlink {
          0%, 92%, 98%, 100% {
            transform: scaleY(1);
          }
          95% {
            transform: scaleY(0.08);
          }
        }

        /* 3. 3D Letter Flip-In Animation */
        .welcome-letter-flip {
          opacity: 0;
          transform-origin: 50% 100%;
          animation-name: welcomeLetterFlipIn;
          animation-duration: 0.85s;
          animation-timing-function: cubic-bezier(0.18, 0.89, 0.32, 1.25);
          animation-fill-mode: forwards;
        }

        @keyframes welcomeLetterFlipIn {
          0% {
            opacity: 0;
            transform: translateZ(-600px) rotateX(-100deg);
            filter: blur(8px);
          }
          65% {
            opacity: 1;
            transform: translateZ(25px) rotateX(12deg);
            filter: blur(0);
          }
          85% {
            transform: translateZ(-8px) rotateX(-4deg);
          }
          100% {
            opacity: 1;
            transform: translateZ(0) rotateX(0deg);
            filter: blur(0);
          }
        }

        /* Continuous Cyan Wave for Tagline Letters */
        .welcome-cyan-wave {
          animation-name: welcomeLetterFlipIn, welcomeCyanWavePulse;
          animation-duration: 0.85s, 3s;
          animation-timing-function: cubic-bezier(0.18, 0.89, 0.32, 1.25), ease-in-out;
          animation-iteration-count: 1, infinite;
          animation-fill-mode: forwards, none;
        }

        @keyframes welcomeCyanWavePulse {
          0%, 100% {
            color: #e2e8f0;
            text-shadow: 0 2px 10px rgba(0, 0, 0, 0.6);
          }
          50% {
            color: #22d3ee;
            text-shadow: 0 0 18px rgba(34, 211, 238, 0.9), 0 0 35px rgba(59, 130, 246, 0.7);
          }
        }

        /* 2.0 Badge Pop-In */
        .welcome-badge-pop {
          opacity: 0;
          transform-origin: center center;
          animation: welcomeBadgePopIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards 2.65s;
        }

        @keyframes welcomeBadgePopIn {
          0% {
            opacity: 0;
            transform: scale(0) rotate(-15deg);
          }
          70% {
            opacity: 1;
            transform: scale(1.22) rotate(4deg);
          }
          100% {
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }
        }

        /* Subtitle Fade Up */
        .welcome-subtitle {
          opacity: 0;
          animation: welcomeSubFadeUp 0.8s ease-out forwards 2.75s;
        }

        @keyframes welcomeSubFadeUp {
          0% {
            opacity: 0;
            transform: translateY(16px);
          }
          100% {
            opacity: 0.85;
            transform: translateY(0);
          }
        }

        /* Gradient Underline Grow */
        .welcome-underline {
          background: linear-gradient(90deg, transparent, #3b82f6 30%, #22d3ee 70%, transparent);
          box-shadow: 0 0 12px rgba(34, 211, 238, 0.65);
          transform: scaleX(0);
          animation: welcomeUnderlineGrow 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards 4.1s;
        }

        @keyframes welcomeUnderlineGrow {
          0% {
            transform: scaleX(0);
            opacity: 0;
          }
          100% {
            transform: scaleX(1);
            opacity: 0.9;
          }
        }

        /* 4. Get Started Button 3D Tilt Rise */
        .welcome-button-wrap {
          opacity: 0;
          animation: welcomeButtonRise 0.9s cubic-bezier(0.18, 0.89, 0.32, 1.25) forwards 4.7s;
          transform-style: preserve-3d;
        }

        @keyframes welcomeButtonRise {
          0% {
            opacity: 0;
            transform: translateY(40px) rotateX(32deg) scale(0.85);
          }
          70% {
            opacity: 1;
            transform: translateY(-4px) rotateX(-5deg) scale(1.05);
          }
          100% {
            opacity: 1;
            transform: translateY(0) rotateX(0deg) scale(1);
          }
        }

        .welcome-cta-btn:hover {
          transform: translateY(-2px) scale(1.04);
          box-shadow: 0 16px 45px rgba(31, 162, 255, 0.6), 0 0 35px rgba(47, 75, 255, 0.55), inset 0 1px 1px rgba(255, 255, 255, 0.6);
        }

        .welcome-cta-btn:active {
          transform: translateY(1px) scale(0.98);
        }

        /* Accessibility: prefers-reduced-motion */
        @media (prefers-reduced-motion: reduce) {
          .welcome-tilted-ring,
          .welcome-light-sweep,
          .welcome-eyelid {
            animation: none !important;
          }
          .welcome-logo-tile {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
          .welcome-letter-flip,
          .welcome-cyan-wave {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
            filter: none !important;
          }
          .welcome-badge-pop,
          .welcome-subtitle,
          .welcome-underline,
          .welcome-button-wrap {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>
    </aside>
  )
}
