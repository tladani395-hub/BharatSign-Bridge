import { useEffect, useRef, useState } from "react"
import { Volume2, Activity, Play, CheckCircle2 } from "lucide-react"
import { speakText, INDIC_LANGUAGES } from "@/lib/speech"

interface Joint {
  x: number
  y: number
}

// 21 Keypoints normalized relative to canvas center (0,0) to (1,1)
type GestureKey = "NAMASTE" | "ILY" | "VICTORY" | "FIVE" | "ONE" | "OK" | "FIST" | "ROCK"

interface GestureData {
  id: GestureKey
  name: string
  hindi: string
  gujarati: string
  tamil: string
  description: string
  confidence: number
  joints: Joint[]
}

// Canonical 21 landmark templates (Wrist=0, Thumb=1-4, Index=5-8, Middle=9-12, Ring=13-16, Pinky=17-20)
const GESTURE_TEMPLATES: Record<GestureKey, GestureData> = {
  NAMASTE: {
    id: "NAMASTE",
    name: "Namaste / Greeting",
    hindi: "नमस्ते / प्रणाम",
    gujarati: "નમસ્તે / પ્રણામ",
    tamil: "வணக்கம்",
    description: "Sacred Indian greeting with both palms pressed together in front of the chest.",
    confidence: 0.998,
    joints: [
      { x: 0.50, y: 0.85 }, // Wrist
      // Thumb
      { x: 0.44, y: 0.70 }, { x: 0.42, y: 0.60 }, { x: 0.44, y: 0.50 }, { x: 0.47, y: 0.42 },
      // Index
      { x: 0.47, y: 0.55 }, { x: 0.48, y: 0.42 }, { x: 0.49, y: 0.32 }, { x: 0.49, y: 0.22 },
      // Middle
      { x: 0.50, y: 0.54 }, { x: 0.50, y: 0.40 }, { x: 0.50, y: 0.28 }, { x: 0.50, y: 0.18 },
      // Ring
      { x: 0.53, y: 0.55 }, { x: 0.52, y: 0.42 }, { x: 0.51, y: 0.32 }, { x: 0.51, y: 0.24 },
      // Pinky
      { x: 0.56, y: 0.58 }, { x: 0.55, y: 0.48 }, { x: 0.53, y: 0.38 }, { x: 0.52, y: 0.30 },
    ],
  },
  FIVE: {
    id: "FIVE",
    name: "Number 5 / Open Hand",
    hindi: "संख्या पाँच (5)",
    gujarati: "નંબર પાંચ (5)",
    tamil: "ஐந்து (5)",
    description: "All five fingers extended wide in symmetric radial span, palms facing outward.",
    confidence: 0.996,
    joints: [
      { x: 0.50, y: 0.85 }, // 0: Wrist
      // Thumb (1-4)
      { x: 0.38, y: 0.72 }, { x: 0.28, y: 0.62 }, { x: 0.20, y: 0.54 }, { x: 0.14, y: 0.46 },
      // Index (5-8)
      { x: 0.40, y: 0.52 }, { x: 0.34, y: 0.38 }, { x: 0.30, y: 0.26 }, { x: 0.26, y: 0.16 },
      // Middle (9-12)
      { x: 0.50, y: 0.50 }, { x: 0.50, y: 0.34 }, { x: 0.50, y: 0.22 }, { x: 0.50, y: 0.12 },
      // Ring (13-16)
      { x: 0.60, y: 0.52 }, { x: 0.66, y: 0.38 }, { x: 0.70, y: 0.26 }, { x: 0.74, y: 0.16 },
      // Pinky (17-20)
      { x: 0.68, y: 0.58 }, { x: 0.76, y: 0.48 }, { x: 0.82, y: 0.38 }, { x: 0.88, y: 0.28 },
    ],
  },
  VICTORY: {
    id: "VICTORY",
    name: "Victory / Number 2",
    hindi: "विजय / संख्या दो (2)",
    gujarati: "વિજય / નંબર બે (2)",
    tamil: "வெற்றி / இரண்டு (2)",
    description: "Index and middle fingers extended upward in classic V-shape, thumb folded over curled ring and pinky.",
    confidence: 0.994,
    joints: [
      { x: 0.50, y: 0.85 },
      // Thumb folded (1-4)
      { x: 0.40, y: 0.70 }, { x: 0.44, y: 0.62 }, { x: 0.52, y: 0.62 }, { x: 0.56, y: 0.64 },
      // Index extended (5-8)
      { x: 0.44, y: 0.52 }, { x: 0.40, y: 0.38 }, { x: 0.36, y: 0.26 }, { x: 0.32, y: 0.15 },
      // Middle extended (9-12)
      { x: 0.52, y: 0.50 }, { x: 0.56, y: 0.36 }, { x: 0.60, y: 0.24 }, { x: 0.64, y: 0.14 },
      // Ring curled (13-16)
      { x: 0.58, y: 0.56 }, { x: 0.56, y: 0.64 }, { x: 0.54, y: 0.68 }, { x: 0.52, y: 0.66 },
      // Pinky curled (17-20)
      { x: 0.64, y: 0.62 }, { x: 0.62, y: 0.68 }, { x: 0.60, y: 0.72 }, { x: 0.58, y: 0.70 },
    ],
  },
  ILY: {
    id: "ILY",
    name: "I Love You (ISL/ASL)",
    hindi: "मैं तुमसे प्यार करता हूँ",
    gujarati: "હું તમને પ્રેમ કરું છું",
    tamil: "நான் உன்னை காதலிக்கிறேன்",
    description: "Universal sign combining I, L, and Y: Thumb, index, and pinky extended, middle and ring curled down.",
    confidence: 0.997,
    joints: [
      { x: 0.50, y: 0.85 },
      // Thumb extended (1-4)
      { x: 0.38, y: 0.72 }, { x: 0.26, y: 0.64 }, { x: 0.18, y: 0.56 }, { x: 0.12, y: 0.48 },
      // Index extended (5-8)
      { x: 0.42, y: 0.52 }, { x: 0.38, y: 0.38 }, { x: 0.34, y: 0.26 }, { x: 0.30, y: 0.15 },
      // Middle curled (9-12)
      { x: 0.50, y: 0.52 }, { x: 0.48, y: 0.62 }, { x: 0.47, y: 0.68 }, { x: 0.46, y: 0.66 },
      // Ring curled (13-16)
      { x: 0.58, y: 0.55 }, { x: 0.56, y: 0.64 }, { x: 0.54, y: 0.68 }, { x: 0.52, y: 0.66 },
      // Pinky extended (17-20)
      { x: 0.66, y: 0.58 }, { x: 0.74, y: 0.46 }, { x: 0.80, y: 0.36 }, { x: 0.86, y: 0.24 },
    ],
  },
  ONE: {
    id: "ONE",
    name: "Number 1 / Index Upright",
    hindi: "संख्या एक (1)",
    gujarati: "નંબર એક (1)",
    tamil: "ஒன்று (1)",
    description: "Index finger held strictly vertical, thumb folded over remaining 3 closed fingers.",
    confidence: 0.995,
    joints: [
      { x: 0.50, y: 0.85 },
      // Thumb folded (1-4)
      { x: 0.42, y: 0.70 }, { x: 0.48, y: 0.62 }, { x: 0.54, y: 0.62 }, { x: 0.56, y: 0.64 },
      // Index vertical (5-8)
      { x: 0.46, y: 0.52 }, { x: 0.48, y: 0.38 }, { x: 0.49, y: 0.24 }, { x: 0.50, y: 0.12 },
      // Middle curled (9-12)
      { x: 0.52, y: 0.54 }, { x: 0.50, y: 0.64 }, { x: 0.48, y: 0.68 }, { x: 0.46, y: 0.66 },
      // Ring curled (13-16)
      { x: 0.58, y: 0.58 }, { x: 0.56, y: 0.66 }, { x: 0.54, y: 0.70 }, { x: 0.52, y: 0.68 },
      // Pinky curled (17-20)
      { x: 0.64, y: 0.62 }, { x: 0.62, y: 0.70 }, { x: 0.60, y: 0.74 }, { x: 0.58, y: 0.72 },
    ],
  },
  OK: {
    id: "OK",
    name: "OK / Perfect Sign",
    hindi: "ठीक है / उत्तम",
    gujarati: "બરાબર / ઉત્તમ",
    tamil: "சரி / சிறப்பு",
    description: "Thumb and index tips touch forming an O-ring, while middle, ring, and pinky remain elevated.",
    confidence: 0.991,
    joints: [
      { x: 0.50, y: 0.85 },
      // Thumb touches index (1-4)
      { x: 0.40, y: 0.72 }, { x: 0.34, y: 0.62 }, { x: 0.36, y: 0.52 }, { x: 0.42, y: 0.46 },
      // Index touches thumb (5-8)
      { x: 0.44, y: 0.54 }, { x: 0.40, y: 0.44 }, { x: 0.40, y: 0.42 }, { x: 0.43, y: 0.46 },
      // Middle extended (9-12)
      { x: 0.52, y: 0.52 }, { x: 0.54, y: 0.38 }, { x: 0.56, y: 0.26 }, { x: 0.58, y: 0.14 },
      // Ring extended (13-16)
      { x: 0.60, y: 0.54 }, { x: 0.64, y: 0.40 }, { x: 0.68, y: 0.28 }, { x: 0.72, y: 0.18 },
      // Pinky extended (17-20)
      { x: 0.68, y: 0.58 }, { x: 0.74, y: 0.46 }, { x: 0.78, y: 0.36 }, { x: 0.82, y: 0.26 },
    ],
  },
  FIST: {
    id: "FIST",
    name: "Letter A / Closed Fist",
    hindi: "अक्षर A / मुट्ठी",
    gujarati: "અક્ષર A / મુઠ્ઠી",
    tamil: "எழுத்து A",
    description: "Tight closed fist with thumb positioned vertically against the side of the index finger.",
    confidence: 0.993,
    joints: [
      { x: 0.50, y: 0.85 },
      // Thumb resting upright on side (1-4)
      { x: 0.40, y: 0.72 }, { x: 0.36, y: 0.62 }, { x: 0.36, y: 0.52 }, { x: 0.38, y: 0.44 },
      // Index folded (5-8)
      { x: 0.44, y: 0.58 }, { x: 0.46, y: 0.66 }, { x: 0.46, y: 0.70 }, { x: 0.44, y: 0.72 },
      // Middle folded (9-12)
      { x: 0.50, y: 0.58 }, { x: 0.51, y: 0.66 }, { x: 0.51, y: 0.70 }, { x: 0.49, y: 0.72 },
      // Ring folded (13-16)
      { x: 0.56, y: 0.60 }, { x: 0.56, y: 0.67 }, { x: 0.55, y: 0.71 }, { x: 0.53, y: 0.72 },
      // Pinky folded (17-20)
      { x: 0.62, y: 0.64 }, { x: 0.61, y: 0.70 }, { x: 0.59, y: 0.73 }, { x: 0.57, y: 0.74 },
    ],
  },
  ROCK: {
    id: "ROCK",
    name: "Rock On / Sign of Horns",
    hindi: "रॉक ऑन / सींग का संकेत",
    gujarati: "રોક ઓન સાઇન",
    tamil: "ராக் ஆன்",
    description: "Index and pinky fingers upright, thumb holding folded middle and ring fingers.",
    confidence: 0.988,
    joints: [
      { x: 0.50, y: 0.85 },
      // Thumb folded across (1-4)
      { x: 0.42, y: 0.72 }, { x: 0.48, y: 0.64 }, { x: 0.54, y: 0.64 }, { x: 0.56, y: 0.66 },
      // Index extended (5-8)
      { x: 0.44, y: 0.52 }, { x: 0.40, y: 0.38 }, { x: 0.36, y: 0.26 }, { x: 0.32, y: 0.15 },
      // Middle folded (9-12)
      { x: 0.52, y: 0.54 }, { x: 0.50, y: 0.64 }, { x: 0.48, y: 0.68 }, { x: 0.46, y: 0.66 },
      // Ring folded (13-16)
      { x: 0.58, y: 0.58 }, { x: 0.56, y: 0.66 }, { x: 0.54, y: 0.70 }, { x: 0.52, y: 0.68 },
      // Pinky extended (17-20)
      { x: 0.66, y: 0.58 }, { x: 0.74, y: 0.46 }, { x: 0.80, y: 0.36 }, { x: 0.86, y: 0.24 },
    ],
  },
}

const CONNECTIONS = [
  // Palm Base
  [0, 1], [1, 2], [2, 5], [5, 9], [9, 13], [13, 17], [17, 0],
  // Thumb
  [2, 3], [3, 4],
  // Index
  [5, 6], [6, 7], [7, 8],
  // Middle
  [9, 10], [10, 11], [11, 12],
  // Ring
  [13, 14], [14, 15], [15, 16],
  // Pinky
  [17, 18], [18, 19], [19, 20],
]

const FINGER_COLORS = [
  "#f59e0b", // Thumb Amber
  "#06b6d4", // Index Cyan
  "#10b981", // Middle Emerald
  "#8b5cf6", // Ring Violet
  "#ec4899", // Pinky Pink
]

interface HoloProps {
  currentLanguage?: string
}

export default function HoloHandVisualizer({ currentLanguage = "gu" }: HoloProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedGesture, setSelectedGesture] = useState<GestureKey>("NAMASTE")
  const currentJointsRef = useRef<Joint[]>(JSON.parse(JSON.stringify(GESTURE_TEMPLATES.NAMASTE.joints)))
  const [hudAngle, setHudAngle] = useState(172)
  const [isSynthesizing, setIsSynthesizing] = useState(false)

  const activeData = GESTURE_TEMPLATES[selectedGesture]
  const currentLang = INDIC_LANGUAGES.find((l) => l.code === currentLanguage) || INDIC_LANGUAGES[0]

  // Morph animation loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animId: number
    const w = (canvas.width = 460)
    const h = (canvas.height = 420)
    let scanlineY = 0

    const render = () => {
      ctx.clearRect(0, 0, w, h)

      // 1. Cyber Grid Background & Radar Circles
      ctx.save()
      ctx.strokeStyle = "rgba(56, 189, 248, 0.08)"
      ctx.lineWidth = 1
      for (let x = 0; x < w; x += 30) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, h)
        ctx.stroke()
      }
      for (let y = 0; y < h; y += 30) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(w, y)
        ctx.stroke()
      }

      // Concentric targeting radar rings
      ctx.strokeStyle = "rgba(6, 182, 212, 0.15)"
      ctx.beginPath()
      ctx.arc(w / 2, h / 2, 140, 0, Math.PI * 2)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(w / 2, h / 2, 80, 0, Math.PI * 2)
      ctx.stroke()

      // Holographic Scanline
      scanlineY = (scanlineY + 1.5) % h
      const grad = ctx.createLinearGradient(0, scanlineY - 20, 0, scanlineY + 20)
      grad.addColorStop(0, "rgba(6, 182, 212, 0)")
      grad.addColorStop(0.5, "rgba(6, 182, 212, 0.25)")
      grad.addColorStop(1, "rgba(6, 182, 212, 0)")
      ctx.fillStyle = grad
      ctx.fillRect(0, scanlineY - 20, w, 40)
      ctx.restore()

      // 2. Spring Morph Joints to Target
      const target = GESTURE_TEMPLATES[selectedGesture].joints
      const current = currentJointsRef.current
      for (let i = 0; i < current.length; i++) {
        current[i].x += (target[i].x - current[i].x) * 0.14
        current[i].y += (target[i].y - current[i].y) * 0.14
      }

      // 3. Draw Connecting Skeletal Rays
      ctx.save()
      ctx.lineCap = "round"
      ctx.lineJoin = "round"

      for (const [startIdx, endIdx] of CONNECTIONS) {
        const p1 = current[startIdx]
        const p2 = current[endIdx]
        if (!p1 || !p2) continue

        let strokeColor = "rgba(255, 255, 255, 0.45)"
        let lineWidth = 2.5

        if (endIdx <= 4) {
          strokeColor = FINGER_COLORS[0]
          lineWidth = 3.2
        } else if (endIdx <= 8) {
          strokeColor = FINGER_COLORS[1]
          lineWidth = 3.2
        } else if (endIdx <= 12) {
          strokeColor = FINGER_COLORS[2]
          lineWidth = 3.2
        } else if (endIdx <= 16) {
          strokeColor = FINGER_COLORS[3]
          lineWidth = 3.2
        } else if (endIdx <= 20) {
          strokeColor = FINGER_COLORS[4]
          lineWidth = 3.2
        }

        ctx.strokeStyle = strokeColor
        ctx.lineWidth = lineWidth
        ctx.beginPath()
        ctx.moveTo(p1.x * w, p1.y * h)
        ctx.lineTo(p2.x * w, p2.y * h)
        ctx.stroke()
      }

      // 4. Draw Joint Nodes with Concentric Glow Rings
      const tipIndices = [4, 8, 12, 16, 20]
      const tipLabels = ["TH", "IX", "MD", "RG", "PK"]

      for (let i = 0; i < current.length; i++) {
        const p = current[i]
        const cx = p.x * w
        const cy = p.y * h
        const isTip = tipIndices.includes(i)

        if (isTip) {
          const tipIdx = tipIndices.indexOf(i)
          const color = FINGER_COLORS[tipIdx]

          // Pulsing glow halo
          ctx.beginPath()
          ctx.arc(cx, cy, 10, 0, Math.PI * 2)
          ctx.fillStyle = color
          ctx.shadowBlur = 15
          ctx.shadowColor = color
          ctx.fill()
          ctx.shadowBlur = 0

          // Inner core
          ctx.beginPath()
          ctx.arc(cx, cy, 3, 0, Math.PI * 2)
          ctx.fillStyle = "#ffffff"
          ctx.fill()

          // Fingertip Tag
          ctx.fillStyle = "#ffffff"
          ctx.font = "bold 9px monospace"
          ctx.fillText(`[${tipLabels[tipIdx]}]`, cx - 10, cy - 12)
        } else {
          ctx.beginPath()
          ctx.arc(cx, cy, i === 0 ? 6 : 3.5, 0, Math.PI * 2)
          ctx.fillStyle = "#38bdf8"
          ctx.fill()
          ctx.lineWidth = 1
          ctx.strokeStyle = "#ffffff"
          ctx.stroke()
        }
      }

      ctx.restore()
      animId = requestAnimationFrame(render)
    }

    render()

    return () => cancelAnimationFrame(animId)
  }, [selectedGesture])

  const playSynthesizedVoice = () => {
    setIsSynthesizing(true)
    const textToSpeak =
      currentLanguage === "gu"
        ? activeData.gujarati
        : currentLanguage === "hi"
        ? activeData.hindi
        : currentLanguage === "ta"
        ? activeData.tamil
        : activeData.name

    speakText(textToSpeak, currentLanguage)
    setTimeout(() => setIsSynthesizing(false), 1800)
  }

  return (
    <div className="rounded-3xl bg-slate-950/90 border border-cyan-500/30 p-5 shadow-2xl relative overflow-hidden backdrop-blur-xl group">
      {/* Corner Cyber HUD Accents */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-400 rounded-tl-2xl pointer-events-none" />
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-400 rounded-tr-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-400 rounded-bl-2xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-400 rounded-br-2xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20 text-xs">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
          </span>
          <span className="font-mono font-bold tracking-wider text-cyan-400 uppercase text-[11px]">
            HOLOGRAPHIC 21-JOINT ISL KINEMATICS
          </span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-mono text-[10px]">
          <Activity className="h-3 w-3 animate-pulse text-cyan-400" />
          <span>CONF: {(activeData.confidence * 100).toFixed(1)}%</span>
        </div>
      </div>

      {/* Main Canvas + Telemetry HUD */}
      <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 my-3 flex items-center justify-center border border-cyan-500/20">
        <canvas ref={canvasRef} className="w-full h-full object-contain" />

        {/* Live HUD Overlays */}
        <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-cyan-500/30 text-[11px] font-mono flex flex-col gap-0.5">
          <span className="text-muted-foreground text-[9px] uppercase">Active Gesture</span>
          <span className="font-bold text-cyan-300 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
            {activeData.name}
          </span>
        </div>

        <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-cyan-500/30 text-[11px] font-mono text-right flex flex-col gap-0.5">
          <span className="text-muted-foreground text-[9px] uppercase">Kinematic Angle</span>
          <span className="font-bold text-amber-400">Idx MCP: {hudAngle}°</span>
        </div>

        {/* Floating Audio Waveform */}
        <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-cyan-500/30 flex items-center gap-2">
          <Volume2 className={`h-3.5 w-3.5 ${isSynthesizing ? "text-cyan-400 animate-bounce" : "text-muted-foreground"}`} />
          <div className="flex items-end gap-0.5 h-4">
            {[40, 90, 60, 100, 75, 45, 80, 50].map((val, idx) => (
              <span
                key={idx}
                style={{ height: isSynthesizing ? `${val}%` : "30%" }}
                className="w-1 bg-cyan-400 rounded-full transition-all duration-150"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Gesture Trigger Buttons */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-300 text-[11px]">Select Gesture to Morph:</span>
          <span className="text-[10px] text-cyan-400 font-mono">21 3D Vectors</span>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {(Object.keys(GESTURE_TEMPLATES) as GestureKey[]).map((key) => {
            const isSelected = selectedGesture === key
            return (
              <button
                key={key}
                onClick={() => {
                  setSelectedGesture(key)
                  setHudAngle(Math.floor(165 + Math.random() * 15))
                }}
                className={`px-2 py-1.5 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5 ${
                  isSelected
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 scale-105 border border-cyan-300"
                    : "bg-slate-900/90 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
                }`}
              >
                <span className="text-[11px] truncate max-w-full">{key}</span>
              </button>
            )
          })}
        </div>

        {/* Translation Banner with Voice Trigger */}
        <div className="p-3 rounded-2xl bg-slate-900/90 border border-cyan-500/25 flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase font-mono">
              Translated ({currentLang.name}):
            </span>
            <span className="text-sm font-extrabold text-foreground">
              {currentLanguage === "gu"
                ? activeData.gujarati
                : currentLanguage === "hi"
                ? activeData.hindi
                : currentLanguage === "ta"
                ? activeData.tamil
                : activeData.name}
            </span>
          </div>

          <button
            onClick={playSynthesizedVoice}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-md active:scale-95"
          >
            <Play className="h-3 w-3 fill-current" />
            <span>Speak</span>
          </button>
        </div>
      </div>
    </div>
  )
}
