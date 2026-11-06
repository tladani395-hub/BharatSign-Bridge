/**
 * Web Audio API synthesized sound effects for BharatSign-Bridge.
 * Zero external audio files required, instant playback, zero latency.
 */

let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    if (AudioContextClass) {
      audioCtx = new AudioContextClass()
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume()
  }
  return audioCtx
}

/**
 * Ascending harmonic chime for correct quiz answers or mastering a sign.
 */
export function playSuccessChime() {
  const ctx = getAudioContext()
  if (!ctx) return

  const now = ctx.currentTime
  const notes = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6

  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = "sine"
    osc.frequency.setValueAtTime(freq, now + idx * 0.08)

    gain.gain.setValueAtTime(0, now + idx * 0.08)
    gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.08 + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.4)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now + idx * 0.08)
    osc.stop(now + idx * 0.08 + 0.45)
  })
}

/**
 * Royal celebratory fanfare for earning or claiming the BharatSign Certificate!
 */
export function playFanfare() {
  const ctx = getAudioContext()
  if (!ctx) return

  const now = ctx.currentTime
  // Brass harmonic sequence: C4, G4, C5, E5, G5, C6
  const chords = [
    { freq: 261.63, delay: 0.0, dur: 0.25 },
    { freq: 392.0, delay: 0.15, dur: 0.25 },
    { freq: 523.25, delay: 0.3, dur: 0.35 },
    { freq: 659.25, delay: 0.45, dur: 0.35 },
    { freq: 783.99, delay: 0.6, dur: 0.35 },
    { freq: 1046.5, delay: 0.75, dur: 0.9 }, // Held triumphant finale
  ]

  chords.forEach(({ freq, delay, dur }) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = "triangle"
    osc.frequency.setValueAtTime(freq, now + delay)

    gain.gain.setValueAtTime(0, now + delay)
    gain.gain.linearRampToValueAtTime(0.25, now + delay + 0.04)
    gain.gain.exponentialRampToValueAtTime(0.001, now + delay + dur)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now + delay)
    osc.stop(now + delay + dur + 0.05)
  })
}

/**
 * Subtle cyber click for interactive buttons.
 */
export function playCyberClick() {
  const ctx = getAudioContext()
  if (!ctx) return

  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = "sine"
  osc.frequency.setValueAtTime(800, now)
  osc.frequency.exponentialRampToValueAtTime(300, now + 0.05)

  gain.gain.setValueAtTime(0.12, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05)

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start(now)
  osc.stop(now + 0.06)
}
