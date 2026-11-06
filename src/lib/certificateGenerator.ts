/**
 * High-Definition HTML5 Canvas Certificate Exporter
 * Generates an authentic 1200x750 PNG matching the exact cyber-blue certificate design.
 */

export interface ExportCertOptions {
  userName: string
  certId: string
  streakDays: number
  masteredSignsCount: number
  totalQuizzesTaken: number
  issuedDate?: string
  qrDataUrl?: string
}

export async function downloadCertificatePNG(options: ExportCertOptions): Promise<void> {
  const {
    userName,
    certId,
    streakDays,
    masteredSignsCount,
    totalQuizzesTaken,
    issuedDate = new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
    qrDataUrl,
  } = options

  const width = 1200
  const height = 750

  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  // 1. Background Cyber-Blue Gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height)
  bgGrad.addColorStop(0, "#03152e")
  bgGrad.addColorStop(0.5, "#041c3d")
  bgGrad.addColorStop(1, "#010b1a")
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, width, height)

  // Subtle ambient neon glow orbs in corners
  const glowTopLeft = ctx.createRadialGradient(80, 80, 10, 80, 80, 200)
  glowTopLeft.addColorStop(0, "rgba(6, 182, 212, 0.15)")
  glowTopLeft.addColorStop(1, "rgba(6, 182, 212, 0)")
  ctx.fillStyle = glowTopLeft
  ctx.fillRect(0, 0, 300, 300)

  const glowBottomRight = ctx.createRadialGradient(width - 80, height - 80, 10, width - 80, height - 80, 200)
  glowBottomRight.addColorStop(0, "rgba(59, 130, 246, 0.15)")
  glowBottomRight.addColorStop(1, "rgba(59, 130, 246, 0)")
  ctx.fillStyle = glowBottomRight
  ctx.fillRect(width - 300, height - 300, 300, 300)

  // 2. Outer Border & Cyber Accents
  ctx.strokeStyle = "rgba(6, 182, 212, 0.6)"
  ctx.lineWidth = 4
  ctx.strokeRect(30, 30, width - 60, height - 60)

  // Inner subtle border
  ctx.strokeStyle = "rgba(6, 182, 212, 0.2)"
  ctx.lineWidth = 1
  ctx.strokeRect(40, 40, width - 80, height - 80)

  // 4 Corner Brackets
  const cornerLen = 30
  ctx.strokeStyle = "#22d3ee"
  ctx.lineWidth = 3

  // Top-Left
  ctx.beginPath()
  ctx.moveTo(25, 25 + cornerLen)
  ctx.lineTo(25, 25)
  ctx.lineTo(25 + cornerLen, 25)
  ctx.stroke()

  // Top-Right
  ctx.beginPath()
  ctx.moveTo(width - 25 - cornerLen, 25)
  ctx.lineTo(width - 25, 25)
  ctx.lineTo(width - 25, 25 + cornerLen)
  ctx.stroke()

  // Bottom-Left
  ctx.beginPath()
  ctx.moveTo(25, height - 25 - cornerLen)
  ctx.lineTo(25, height - 25)
  ctx.lineTo(25 + cornerLen, height - 25)
  ctx.stroke()

  // Bottom-Right
  ctx.beginPath()
  ctx.moveTo(width - 25 - cornerLen, height - 25)
  ctx.lineTo(width - 25, height - 25)
  ctx.lineTo(width - 25, height - 25 - cornerLen)
  ctx.stroke()

  // 3. Top Header Row
  // Render official BharatSign Bridge Logo emblem onto certificate canvas
  try {
    const logoImg = new Image()
    logoImg.crossOrigin = "anonymous"
    logoImg.src = "/logo-192.png"
    await new Promise<void>((resolve) => {
      if (logoImg.complete) {
        resolve()
      } else {
        logoImg.onload = () => resolve()
        logoImg.onerror = () => resolve()
      }
    })
    if (logoImg.complete && logoImg.naturalWidth > 0) {
      ctx.drawImage(logoImg, 65, 58, 48, 48)
    }
  } catch (e) {
    console.warn("Certificate Logo load fallback", e)
  }

  const textStartX = 124
  ctx.textAlign = "left"
  ctx.font = "bold 24px sans-serif"
  ctx.fillStyle = "#ffffff"
  ctx.fillText("BharatSign", textStartX, 80)
  const bsWidth = ctx.measureText("BharatSign").width
  ctx.fillStyle = "#22d3ee"
  ctx.fillText("-Bridge", textStartX + bsWidth, 80)

  ctx.font = "12px monospace"
  ctx.fillStyle = "rgba(165, 243, 252, 0.8)"
  ctx.fillText("INDIAN SIGN LANGUAGE AI ECOSYSTEM", textStartX, 102)

  ctx.textAlign = "right"
  ctx.font = "bold 14px monospace"
  ctx.fillStyle = "#67e8f9"
  ctx.fillText("Bridge the Communication Gap", width - 65, 85)

  // Header dividing line
  ctx.strokeStyle = "rgba(6, 182, 212, 0.3)"
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(65, 120)
  ctx.lineTo(width - 65, 120)
  ctx.stroke()

  // 4. Certificate Main Title
  ctx.textAlign = "center"
  ctx.font = "900 52px sans-serif"
  ctx.fillStyle = "#ffffff"
  ctx.shadowColor = "rgba(255, 255, 255, 0.4)"
  ctx.shadowBlur = 15
  ctx.fillText("CERTIFICATE", width / 2, 195)
  ctx.shadowBlur = 0

  ctx.font = "800 18px sans-serif"
  ctx.fillStyle = "#22d3ee"
  ctx.letterSpacing = "6px"
  ctx.fillText("OF ACHIEVEMENT", width / 2, 228)
  ctx.letterSpacing = "0px"

  ctx.font = "italic 16px sans-serif"
  ctx.fillStyle = "rgba(207, 250, 254, 0.9)"
  ctx.fillText("This is to certify that", width / 2, 265)

  // 5. Angular Glowing Name Banner
  const bannerWidth = 620
  const bannerHeight = 70
  const bannerX = (width - bannerWidth) / 2
  const bannerY = 285

  const bannerGrad = ctx.createLinearGradient(bannerX, 0, bannerX + bannerWidth, 0)
  bannerGrad.addColorStop(0, "rgba(8, 51, 68, 0.8)")
  bannerGrad.addColorStop(0.5, "rgba(23, 37, 84, 0.95)")
  bannerGrad.addColorStop(1, "rgba(8, 51, 68, 0.8)")

  ctx.fillStyle = bannerGrad
  ctx.strokeStyle = "#22d3ee"
  ctx.lineWidth = 2
  ctx.shadowColor = "rgba(6, 182, 212, 0.5)"
  ctx.shadowBlur = 20
  ctx.beginPath()
  ctx.roundRect(bannerX, bannerY, bannerWidth, bannerHeight, 14)
  ctx.fill()
  ctx.stroke()
  ctx.shadowBlur = 0

  // Little diamond markers on banner edges
  function drawDiamond(c: CanvasRenderingContext2D, x: number, y: number, s: number) {
    c.fillStyle = "#22d3ee"
    c.beginPath()
    c.moveTo(x, y - s)
    c.lineTo(x + s, y)
    c.lineTo(x, y + s)
    c.lineTo(x - s, y)
    c.closePath()
    c.fill()
  }
  drawDiamond(ctx, bannerX, bannerY + bannerHeight / 2, 5)
  drawDiamond(ctx, bannerX + bannerWidth, bannerY + bannerHeight / 2, 5)

  // Learner's Name
  ctx.font = "italic 900 36px Georgia, serif"
  const nameGrad = ctx.createLinearGradient(bannerX, 0, bannerX + bannerWidth, 0)
  nameGrad.addColorStop(0, "#ffffff")
  nameGrad.addColorStop(0.5, "#cffafe")
  nameGrad.addColorStop(1, "#ffffff")
  ctx.fillStyle = nameGrad
  ctx.fillText(userName, width / 2, bannerY + 48)

  // 6. Certification Statement
  ctx.font = "15px sans-serif"
  ctx.fillStyle = "rgba(226, 232, 240, 0.95)"
  ctx.fillText(
    "has successfully completed the BharatSign-Bridge platform, demonstrating excellence in",
    width / 2,
    395
  )
  ctx.fillText(
    "Indian Sign Language (ISL) and AI-powered accessibility solutions.",
    width / 2,
    420
  )

  // 7. Quantitative Competency Metric Chips
  const chipWidth = 140
  const chipHeight = 65
  const gap = 25
  const totalChipsWidth = chipWidth * 3 + gap * 2
  const startChipsX = (width - totalChipsWidth) / 2
  const chipsY = 460

  const metrics = [
    { value: `${streakDays} Days 🔥`, label: "ACTIVE STREAK", color: "#fbbf24" },
    { value: `${masteredSignsCount}`, label: "SIGNS MASTERED", color: "#67e8f9" },
    { value: `${totalQuizzesTaken || 1}`, label: "QUIZZES CLEARED", color: "#34d399" },
  ]

  metrics.forEach((m, i) => {
    const x = startChipsX + i * (chipWidth + gap)
    ctx.fillStyle = "rgba(8, 51, 68, 0.45)"
    ctx.strokeStyle = "rgba(6, 182, 212, 0.3)"
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.roundRect(x, chipsY, chipWidth, chipHeight, 10)
    ctx.fill()
    ctx.stroke()

    ctx.font = "bold 20px sans-serif"
    ctx.fillStyle = m.color
    ctx.fillText(m.value, x + chipWidth / 2, chipsY + 32)

    ctx.font = "bold 10px monospace"
    ctx.fillStyle = "rgba(165, 243, 252, 0.8)"
    ctx.fillText(m.label, x + chipWidth / 2, chipsY + 52)
  })

  // 8. Footer Dividing Line
  ctx.strokeStyle = "rgba(6, 182, 212, 0.3)"
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(65, 570)
  ctx.lineTo(width - 65, 570)
  ctx.stroke()

  // Footer Left: Team Signature
  ctx.textAlign = "left"
  ctx.font = "bold 18px sans-serif"
  ctx.fillStyle = "#ffffff"
  ctx.fillText("BharatSign-Bridge Team", 65, 620)
  ctx.font = "bold 11px monospace"
  ctx.fillStyle = "#22d3ee"
  ctx.fillText("BUILD • CONNECT • EMPOWER", 65, 642)

  // Footer Center: Certificate ID & Issued Date
  ctx.textAlign = "center"
  ctx.font = "11px monospace"
  ctx.fillStyle = "rgba(165, 243, 252, 0.7)"
  ctx.fillText("CERTIFICATE ID", width / 2 - 40, 615)
  ctx.font = "bold 15px monospace"
  ctx.fillStyle = "#67e8f9"
  ctx.fillText(certId, width / 2 - 40, 638)

  ctx.font = "11px monospace"
  ctx.fillStyle = "rgba(165, 243, 252, 0.7)"
  ctx.fillText("ISSUED ON", width / 2 + 130, 615)
  ctx.font = "bold 15px monospace"
  ctx.fillStyle = "#ffffff"
  ctx.fillText(issuedDate, width / 2 + 130, 638)

  // Footer Right: Scannable QR Code & Verified Badge
  if (qrDataUrl) {
    try {
      const qrImg = new Image()
      qrImg.crossOrigin = "anonymous"
      await new Promise<void>((resolve, reject) => {
        qrImg.onload = () => resolve()
        qrImg.onerror = reject
        qrImg.src = qrDataUrl
      })

      const qrSize = 80
      const qrX = width - 65 - qrSize
      const qrY = 590

      // White card behind QR code
      ctx.fillStyle = "#ffffff"
      ctx.strokeStyle = "#22d3ee"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.roundRect(qrX - 4, qrY - 4, qrSize + 8, qrSize + 8, 8)
      ctx.fill()
      ctx.stroke()

      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize)

      // Green Pill Badge: ✔ VERIFIED
      const pillWidth = 84
      const pillHeight = 20
      const pillX = qrX + (qrSize - pillWidth) / 2
      const pillY = qrY + qrSize + 8

      ctx.fillStyle = "#10b981"
      ctx.beginPath()
      ctx.roundRect(pillX, pillY, pillWidth, pillHeight, 10)
      ctx.fill()

      ctx.textAlign = "center"
      ctx.font = "900 11px sans-serif"
      ctx.fillStyle = "#022c22"
      ctx.fillText("✔ VERIFIED", pillX + pillWidth / 2, pillY + 14)
    } catch {
      // Fallback if QR image load failed
    }
  }

  // 9. Trigger Instant File Download
  const link = document.createElement("a")
  const sanitizedName = userName.replace(/[^a-zA-Z0-9]/g, "_")
  link.download = `BharatSign_Certificate_${sanitizedName}.png`
  link.href = canvas.toDataURL("image/png")
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
