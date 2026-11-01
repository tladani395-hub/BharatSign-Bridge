import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { Play, Pause, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

export type SignGesture =
  | "DEMO_10S"
  | "NAMASTE"
  | "THANK_YOU"
  | "WHAT_IS_YOUR_NAME"
  | "STUDENT"
  | "HELP"
  | "WATER"
  | "YES"
  | "NO"
  | string

interface ThreeAvatarProps {
  activeGesture?: SignGesture
  signingSpeed?: number
  onGestureComplete?: () => void
  showControls?: boolean
}

export default function ThreeAvatar({
  activeGesture = "DEMO_10S",
  signingSpeed = 1.0,
  showControls = true,
}: ThreeAvatarProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const [currentGesture, setCurrentGesture] = useState<SignGesture>(activeGesture)
  const [isPlaying, setIsPlaying] = useState(true)
  const [timelineSec, setTimelineSec] = useState(0)
  const [phaseText, setPhaseText] = useState("0–2s: Standing naturally, looking at the camera")
  const [speed, setSpeed] = useState(signingSpeed)

  const currentGestureRef = useRef<SignGesture>(activeGesture)
  const isPlayingRef = useRef<boolean>(true)
  const timelineSecRef = useRef<number>(0)
  const speedRef = useRef<number>(signingSpeed)

  useEffect(() => {
    currentGestureRef.current = activeGesture
    setCurrentGesture(activeGesture)
    timelineSecRef.current = 0
  }, [activeGesture])

  useEffect(() => {
    isPlayingRef.current = isPlaying
  }, [isPlaying])

  useEffect(() => {
    speedRef.current = speed
  }, [speed])

  useEffect(() => {
    const stage = mountRef.current
    if (!stage) return

    const width = stage.clientWidth || 600
    const height = stage.clientHeight || 450

    const T = THREE
    const renderer = new T.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = T.PCFSoftShadowMap
    renderer.setSize(width, height)
    stage.innerHTML = ""
    stage.appendChild(renderer.domElement)

    const scene = new T.Scene()
    const camera = new T.PerspectiveCamera(30, width / height, 0.1, 50)
    camera.position.set(0, 1.08, 4.2)
    camera.lookAt(0, 0.95, 0)

    // Lighting (from character specification)
    scene.add(new T.HemisphereLight(0xbfd9ff, 0x0a1230, 0.75))

    const key = new T.DirectionalLight(0xfff1e0, 0.95)
    key.position.set(-2, 3.5, 3.5)
    key.castShadow = true
    key.shadow.mapSize.set(1024, 1024)
    scene.add(key)

    const rim = new T.DirectionalLight(0x22d3ee, 1)
    rim.position.set(2.5, 2.5, -3)
    scene.add(rim)

    const fill = new T.DirectionalLight(0x6aa8ff, 0.3)
    fill.position.set(3, 1, 3)
    scene.add(fill)

    // Shadow Floor & Cyan Glowing Ring
    const floor = new T.Mesh(new T.PlaneGeometry(8, 8), new T.ShadowMaterial({ opacity: 0.4 }))
    floor.rotation.x = -Math.PI / 2
    floor.receiveShadow = true
    scene.add(floor)

    const ring = new T.Mesh(
      new T.RingGeometry(0.62, 0.67, 64),
      new T.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.6 })
    )
    ring.rotation.x = -Math.PI / 2
    ring.position.y = 0.003
    scene.add(ring)

    const disc = new T.Mesh(
      new T.CircleGeometry(0.95, 48),
      new T.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.12 })
    )
    disc.rotation.x = -Math.PI / 2
    disc.position.y = 0.002
    scene.add(disc)

    // Materials
    function M(c: number, r?: number) {
      return new T.MeshStandardMaterial({ color: c, roughness: r == null ? 0.6 : r, metalness: 0 })
    }
    const skin = M(0xc48a5a, 0.55)
    const shirt = M(0x14264d, 0.7)
    const shirt2 = M(0x1d3a72, 0.7)
    const pants = M(0x14171f, 0.8)
    const shoe = M(0x08090c, 0.4)
    const hairM = M(0x0b0b0e, 0.5)
    const white = M(0xf2eee8, 0.3)
    const dark = M(0x1a0f0a, 0.3)
    const lip = M(0x7a3a33, 0.6)

    function sph(r: number, m: THREE.Material, x?: number, y?: number, z?: number, sx?: number, sy?: number, sz?: number) {
      const o = new T.Mesh(new T.SphereGeometry(r, 24, 16), m)
      o.position.set(x || 0, y || 0, z || 0)
      if (sx) o.scale.set(sx, sy || 1, sz || 1)
      o.castShadow = true
      return o
    }

    function cyl(rt: number, rb: number, h: number, m: THREE.Material, y?: number) {
      const o = new T.Mesh(new T.CylinderGeometry(rt, rb, h, 20), m)
      o.position.y = y || 0
      o.castShadow = true
      return o
    }

    function box(w: number, h: number, d: number, m: THREE.Material, x: number, y: number, z: number) {
      const o = new T.Mesh(new T.BoxGeometry(w, h, d), m)
      o.position.set(x, y, z)
      o.castShadow = true
      return o
    }

    const body = new T.Group()
    scene.add(body)

    // Legs & Shoes
    ;[-1, 1].forEach((s) => {
      const l = cyl(0.08, 0.062, 0.86, pants, 0.5)
      l.position.x = s * 0.1
      body.add(l)
      body.add(box(0.105, 0.07, 0.27, shoe, s * 0.1, 0.035, 0.05))
    })

    const hips = cyl(0.2, 0.19, 0.2, pants, 0.98)
    hips.scale.z = 0.66
    body.add(hips)

    const torso = cyl(0.215, 0.17, 0.62, shirt, 1.25)
    torso.scale.z = 0.62
    body.add(torso)

    body.add(cyl(0.05, 0.056, 0.12, skin, 1.62))

    const collar = new T.Mesh(new T.TorusGeometry(0.06, 0.013, 8, 24), shirt2)
    collar.rotation.x = Math.PI / 2
    collar.position.y = 1.575
    body.add(collar)

    // Head
    const head = new T.Group()
    head.position.set(0, 1.72, 0)
    body.add(head)

    head.add(sph(0.11, skin, 0, 0, 0, 0.95, 1.15, 1))
    head.add(sph(0.075, skin, 0, -0.07, 0.025, 1, 0.9, 1))

    const hair = new T.Mesh(new T.SphereGeometry(0.118, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.56), hairM)
    hair.position.set(0, 0.012, -0.004)
    hair.scale.set(0.97, 1.14, 1.03)
    hair.rotation.x = -0.42
    hair.castShadow = true
    head.add(hair)

    const lids: THREE.Object3D[] = []
    ;[-1, 1].forEach((s) => {
      head.add(sph(0.02, skin, s * 0.1, -0.005, 0, 0.5, 1, 0.8))
      head.add(sph(0.0165, white, s * 0.04, 0.015, 0.097, 1, 0.8, 0.6))
      head.add(sph(0.0095, dark, s * 0.04, 0.015, 0.106))
      const lid = sph(0.0175, skin, s * 0.04, 0.015, 0.099)
      lid.scale.y = 0.001
      head.add(lid)
      lids.push(lid)

      const br = box(0.045, 0.007, 0.01, hairM, s * 0.042, 0.045, 0.098)
      br.rotation.z = -s * 0.1
      head.add(br)
      br.userData.y = 0.045
      lids.push(br)
    })

    head.add(sph(0.017, skin, 0, -0.018, 0.106, 0.9, 1.25, 1))

    const mouth = new T.Mesh(new T.TorusGeometry(0.026, 0.0045, 8, 20, Math.PI), lip)
    mouth.rotation.z = Math.PI
    mouth.position.set(0, -0.05, 0.097)
    head.add(mouth)

    // Fingers with 3 distinct phalange segments
    interface FingerJoints {
      root: THREE.Group
      j: THREE.Group[]
    }

    function finger(L0: number, r: number, x: number, y: number, z: number): FingerJoints {
      const root = new T.Group()
      root.position.set(x, y, z)
      const L = [L0 * 0.45, L0 * 0.33, L0 * 0.26]
      const j: THREE.Group[] = []
      let par: THREE.Group = root
      for (let i = 0; i < 3; i++) {
        const g = new T.Group()
        if (i > 0) g.position.y = -L[i - 1]
        par.add(g)
        g.add(sph(r, skin, 0, 0, 0))
        g.add(cyl(r * 0.95, r * 0.88, L[i], skin, -L[i] / 2))
        if (i === 2) g.add(sph(r * 0.9, skin, 0, -L[i], 0))
        j.push(g)
        par = g
      }
      return { root, j }
    }

    function makeHand(s: number) {
      const g = new T.Group()
      g.rotation.y = (-s * Math.PI) / 2
      g.add(sph(1, skin, 0, -0.054, 0, 0.046, 0.056, 0.017))
      const X = [-0.03, -0.01, 0.01, 0.03]
      const TL = [0.07, 0.078, 0.072, 0.058]
      const R = [0.0095, 0.0098, 0.0092, 0.008]
      const f: FingerJoints[] = []

      const th = finger(0.07, 0.0105, s * 0.042, -0.03, 0.004)
      th.root.rotation.z = s * 0.5
      g.add(th.root)
      f.push(th)

      for (let i = 0; i < 4; i++) {
        const fi = finger(TL[i], R[i], X[i], -0.098, 0)
        fi.root.rotation.z = (i - 1.5) * 0.05
        g.add(fi.root)
        f.push(fi)
      }
      return { g, f }
    }

    function makeArm(s: number) {
      const sh = new T.Group()
      sh.position.set(s * 0.225, 1.5, 0)
      body.add(sh)
      sh.add(sph(0.085, shirt))
      sh.add(cyl(0.054, 0.047, 0.3, shirt, -0.15))

      const el = new T.Group()
      el.position.y = -0.3
      sh.add(el)
      el.add(sph(0.048, shirt))
      el.add(cyl(0.047, 0.043, 0.1, shirt, -0.05))
      el.add(cyl(0.039, 0.031, 0.17, skin, -0.185))

      const wr = new T.Group()
      wr.position.y = -0.275
      el.add(wr)
      const hand = makeHand(s)
      wr.add(hand.g)
      return { s, sh, el, wr, hand }
    }

    const armR = makeArm(1)
    const armL = makeArm(-1)

    // Math Helpers
    function clamp(x: number, a?: number, b?: number) {
      return Math.max(a == null ? 0 : a, Math.min(b == null ? 1 : b, x))
    }
    function seg(t: number, a: number, b: number) {
      return clamp((t - a) / (b - a))
    }
    function sm(x: number) {
      return x * x * (3 - 2 * x)
    }

    const REST = { sx: 0.05, sz: 0.1, ex: -0.12, roll: 0, wx: 0, wz: 0 }
    const READY = { sx: -0.42, sz: 0, ex: -1.9, roll: 0.6, wx: -0.1, wz: 0 }

    function curl(f: FingerJoints, c: number, isT: boolean, s: number) {
      if (isT) {
        f.j[0].rotation.x = -c * 0.7
        f.j[1].rotation.x = -c * 1.0
        f.j[2].rotation.x = -c * 0.8
        f.root.rotation.z = s * (0.5 - 0.35 * c)
      } else {
        f.j[0].rotation.x = -c * 1.35
        f.j[1].rotation.x = -c * 1.55
        f.j[2].rotation.x = -c
      }
    }

    // Kinematic Animation Solver
    function animateTimeline(t: number) {
      const g = currentGestureRef.current

      if (g === "HELLO") {
        // Dominant right hand raised to temple/forehead, waving outward with a friendly smile
        const wave = Math.sin(t * 6) * 0.18
        head.rotation.set(0.04, 0.05, 0)
        mouth.scale.set(1.25, 0.6, 1) // Smile
        armR.sh.rotation.set(1.15, -0.3, 0.35 + wave * 0.5)
        armR.el.rotation.set(-2.0, 0.3, 0)
        armR.wr.rotation.set(0.2, 0, 0.3 + wave)
        for (let i = 0; i < 5; i++) curl(armR.hand.f[i], 0.08, i === 0, 1) // Open waving hand

        armL.sh.rotation.set(REST.sx, 0, -REST.sz)
        armL.el.rotation.set(REST.ex, 0, 0)
      } else if (g === "WELCOME") {
        // Both hands sweeping inward inviting toward chest with hospitable smile
        const sweep = (Math.sin(t * 3) + 1) * 0.12
        head.rotation.set(0.08, 0, 0)
        mouth.scale.set(1.25, 0.55, 1)
        ;[armR, armL].forEach((a) => {
          const s = a.s
          a.sh.rotation.set(0.7 + sweep * 0.2, s * -0.4, s * (0.5 - sweep))
          a.el.rotation.set(-1.6, s * 0.4, 0)
          a.wr.rotation.set(0.2, 0, s * -0.3)
          for (let i = 0; i < 5; i++) curl(a.hand.f[i], 0.1, i === 0, s)
        })
      } else if (g === "PLEASE") {
        // Flat right hand circling gently over sternum / chest
        const circX = Math.sin(t * 4) * 0.06
        const circY = Math.cos(t * 4) * 0.06
        head.rotation.set(0.06, 0, 0)
        mouth.scale.set(1.15, 0.45, 1)
        armR.sh.rotation.set(0.85 + circY, -0.4 + circX, 0.3)
        armR.el.rotation.set(-1.8, 0.4, 0)
        for (let i = 0; i < 5; i++) curl(armR.hand.f[i], 0.05, i === 0, 1)
        armL.sh.rotation.set(REST.sx, 0, -REST.sz)
        armL.el.rotation.set(REST.ex, 0, 0)
      } else if (g === "HOW_ARE_YOU") {
        // Knuckles together rotating outward, then pointing with inquiring head tilt
        const phase = (Math.sin(t * 3) + 1) / 2
        head.rotation.set(0.04, phase * 0.12, 0.05)
        lids.forEach((o) => {
          if (o.userData.y) o.position.y = o.userData.y + 0.005
        })
        armR.sh.rotation.set(0.7 + phase * 0.2, -0.25, 0.2)
        armR.el.rotation.set(-1.7 + phase * 0.5, 0.3, 0)
        if (phase > 0.5) {
          curl(armR.hand.f[0], 1.0, true, 1)
          curl(armR.hand.f[1], 0.0, false, 1)
          for (let i = 2; i < 5; i++) curl(armR.hand.f[i], 1.0, false, 1)
        } else {
          for (let i = 0; i < 5; i++) curl(armR.hand.f[i], 0.2, i === 0, 1)
        }
        armL.sh.rotation.set(REST.sx, 0, -REST.sz)
        armL.el.rotation.set(REST.ex, 0, 0)
      } else if (g === "INDIA") {
        // Right hand touches center of forehead (tilak) then opens outward in national salute
        const phase = (Math.sin(t * 2.5) + 1) / 2
        head.rotation.set(0.06, 0, 0)
        mouth.scale.set(1.2, 0.5, 1)
        armR.sh.rotation.set(1.1 - phase * 0.3, -0.2 - phase * 0.2, 0.25 + phase * 0.2)
        armR.el.rotation.set(-2.0 + phase * 0.6, 0.3, 0)
        curl(armR.hand.f[0], 0.3, true, 1)
        curl(armR.hand.f[1], 0.0, false, 1)
        for (let i = 2; i < 5; i++) curl(armR.hand.f[i], phase * 0.3, false, 1)
        armL.sh.rotation.set(REST.sx, 0, -REST.sz)
        armL.el.rotation.set(REST.ex, 0, 0)
      } else if (g === "FRIEND") {
        // Index fingers of both hands hook together alternately
        head.rotation.set(0.05, 0, 0)
        mouth.scale.set(1.25, 0.55, 1)
        ;[armR, armL].forEach((a) => {
          const s = a.s
          a.sh.rotation.set(0.75, s * -0.3, s * 0.2)
          a.el.rotation.set(-1.6, s * 0.45, 0)
          curl(a.hand.f[0], 1.0, true, s)
          curl(a.hand.f[1], 0.4, false, s)
          for (let i = 2; i < 5; i++) curl(a.hand.f[i], 1.0, false, s)
        })
      } else if (g === "NAMASTE") {
        // Both hands meet at chest with head nod & smile
        const nod = Math.sin(t * 3) * 0.06
        head.rotation.set(0.12 + nod, 0, 0)
        mouth.scale.set(1.2, 0.6, 1)

        ;[armR, armL].forEach((a) => {
          const s = a.s
          a.sh.rotation.set(0.85, s * -0.5, s * 0.35)
          a.el.rotation.set(-1.75, s * 0.7, 0)
          a.wr.rotation.set(0.2, 0, s * -0.3)
          for (let i = 0; i < 5; i++) {
            curl(a.hand.f[i], 0.05, i === 0, s) // Open flat hands
          }
        })
      } else if (g === "THANK_YOU") {
        // Hand moves from chin outward
        const phase = (Math.sin(t * 3) + 1) / 2
        head.rotation.set(0.08 + phase * 0.04, 0, 0)
        mouth.scale.set(1.15, 0.5, 1)

        armR.sh.rotation.set(0.5 + phase * 0.4, -0.3, 0.2)
        armR.el.rotation.set(-1.8 + phase * 0.8, 0.4, 0)
        armR.wr.rotation.set(0.2, 0, 0)
        for (let i = 0; i < 5; i++) curl(armR.hand.f[i], 0.1, i === 0, 1)

        armL.sh.rotation.set(REST.sx, 0, -REST.sz)
        armL.el.rotation.set(REST.ex, 0, 0)
      } else if (g === "WHAT_IS_YOUR_NAME") {
        // Eyebrows furrowed, palms shaking open
        const shake = Math.sin(t * 6) * 0.12
        head.rotation.set(0.05, Math.sin(t * 2) * 0.08, 0)
        lids.forEach((o) => {
          if (o.userData.y) o.position.y = o.userData.y - 0.008 // Furrowed
        })

        ;[armR, armL].forEach((a) => {
          const s = a.s
          a.sh.rotation.set(0.65, 0, s * (0.3 + shake))
          a.el.rotation.set(-1.5, s * 0.4, 0)
          a.wr.rotation.set(0.3, 0, s * (shake * 2))
          for (let i = 0; i < 5; i++) curl(a.hand.f[i], 0.15, i === 0, s)
        })
      } else if (g === "STUDENT") {
        // Self-pointing, then reading open palms
        const cycle = Math.sin(t * 2.5)
        ;[armR, armL].forEach((a) => {
          const s = a.s
          a.sh.rotation.set(0.7 + cycle * 0.08, s * -0.3, s * 0.2)
          a.el.rotation.set(-1.6, s * 0.5, 0)
          a.wr.rotation.set(0.2, 0, s * 0.1)
          for (let i = 0; i < 5; i++) curl(a.hand.f[i], 0.1, i === 0, s)
        })
      } else if (g === "HELP") {
        // Fist on flat open palm lifted upward
        const lift = (Math.sin(t * 3) + 1) * 0.08
        armR.sh.rotation.set(0.75 + lift, -0.2, 0.2)
        armR.el.rotation.set(-1.7, 0.5, 0)
        armL.sh.rotation.set(0.75 + lift, 0.2, -0.2)
        armL.el.rotation.set(-1.7, -0.5, 0)
        for (let i = 0; i < 5; i++) {
          curl(armR.hand.f[i], 1.0, i === 0, 1) // Right hand in fist
          curl(armL.hand.f[i], 0.05, i === 0, -1) // Left hand flat open
        }
      } else if (g === "WATER") {
        // 3 fingers W-handshape tapping chin
        const tap = Math.sin(t * 5) * 0.06
        armR.sh.rotation.set(0.85 + tap, -0.2, 0.2)
        armR.el.rotation.set(-1.9, 0.3, 0)
        curl(armR.hand.f[0], 0.9, true, 1)
        curl(armR.hand.f[1], 0.0, false, 1) // Index
        curl(armR.hand.f[2], 0.0, false, 1) // Middle
        curl(armR.hand.f[3], 0.0, false, 1) // Ring
        curl(armR.hand.f[4], 1.0, false, 1) // Pinky
      } else if (g === "YES") {
        head.rotation.x = Math.sin(t * 4) * 0.15
        armR.sh.rotation.set(0.65, -0.2, 0.2)
        armR.el.rotation.set(-1.7 + Math.sin(t * 4) * 0.1, 0.3, 0)
        for (let i = 0; i < 5; i++) curl(armR.hand.f[i], 1.0, i === 0, 1)
      } else if (g === "NO") {
        head.rotation.y = Math.sin(t * 4) * 0.18
        armR.sh.rotation.set(0.65, -0.2, 0.2)
        armR.el.rotation.set(-1.6, 0.3, 0)
        curl(armR.hand.f[1], Math.sin(t * 4) > 0 ? 0 : 0.8, false, 1)
        curl(armR.hand.f[2], Math.sin(t * 4) > 0 ? 0 : 0.8, false, 1)
      } else if (g.startsWith("NUMBER_") || g.startsWith("DIGIT_")) {
        // === OFFICIAL ISLRTC DIGIT PROCEDURAL RIGGING ===
        const num = g.replace("NUMBER_", "").replace("DIGIT_", "")
        head.rotation.set(0.05, 0, 0)
        mouth.scale.set(1.1, 0.4, 1)

        // Raise right hand to clear chest viewing position
        armR.sh.rotation.set(0.65, -0.2, 0.25)
        armR.el.rotation.set(-1.8, 0.3, 0)
        armR.wr.rotation.set(0.1, 0, 0)

        armL.sh.rotation.set(REST.sx, 0, -REST.sz)
        armL.el.rotation.set(REST.ex, 0, 0)

        if (num === "1") {
          // Index straight up, others closed
          curl(armR.hand.f[0], 1.0, true, 1)
          curl(armR.hand.f[1], 0.0, false, 1) // Index UP
          curl(armR.hand.f[2], 1.0, false, 1)
          curl(armR.hand.f[3], 1.0, false, 1)
          curl(armR.hand.f[4], 1.0, false, 1)
        } else if (num === "2") {
          // Index and Middle up in V shape
          curl(armR.hand.f[0], 1.0, true, 1)
          curl(armR.hand.f[1], 0.0, false, 1)
          curl(armR.hand.f[2], 0.0, false, 1)
          curl(armR.hand.f[3], 1.0, false, 1)
          curl(armR.hand.f[4], 1.0, false, 1)
        } else if (num === "3") {
          // Thumb, Index, Middle up
          curl(armR.hand.f[0], 0.0, true, 1)
          curl(armR.hand.f[1], 0.0, false, 1)
          curl(armR.hand.f[2], 0.0, false, 1)
          curl(armR.hand.f[3], 1.0, false, 1)
          curl(armR.hand.f[4], 1.0, false, 1)
        } else if (num === "4") {
          // Thumb folded across palm, 4 fingers extended straight up!
          curl(armR.hand.f[0], 1.0, true, 1) // Thumb folded across palm
          curl(armR.hand.f[1], 0.0, false, 1) // Index UP
          curl(armR.hand.f[2], 0.0, false, 1) // Middle UP
          curl(armR.hand.f[3], 0.0, false, 1) // Ring UP
          curl(armR.hand.f[4], 0.0, false, 1) // Pinky UP
        } else if (num === "5") {
          // All 5 fingers extended wide open!
          curl(armR.hand.f[0], 0.0, true, 1)
          curl(armR.hand.f[1], 0.0, false, 1)
          curl(armR.hand.f[2], 0.0, false, 1)
          curl(armR.hand.f[3], 0.0, false, 1)
          curl(armR.hand.f[4], 0.0, false, 1)
        } else if (num === "6") {
          // Pinky finger extended, others closed into fist
          curl(armR.hand.f[0], 1.0, true, 1)
          curl(armR.hand.f[1], 1.0, false, 1)
          curl(armR.hand.f[2], 1.0, false, 1)
          curl(armR.hand.f[3], 1.0, false, 1)
          curl(armR.hand.f[4], 0.0, false, 1) // Pinky UP
        } else if (num === "7") {
          // Index finger bent at knuckle
          curl(armR.hand.f[0], 1.0, true, 1)
          curl(armR.hand.f[1], 0.6, false, 1) // Bent
          curl(armR.hand.f[2], 1.0, false, 1)
          curl(armR.hand.f[3], 1.0, false, 1)
          curl(armR.hand.f[4], 1.0, false, 1)
        } else if (num === "8") {
          // Middle, Ring, Pinky extended
          curl(armR.hand.f[0], 1.0, true, 1)
          curl(armR.hand.f[1], 1.0, false, 1)
          curl(armR.hand.f[2], 0.0, false, 1)
          curl(armR.hand.f[3], 0.0, false, 1)
          curl(armR.hand.f[4], 0.0, false, 1)
        } else if (num === "9") {
          // Thumb pointing downward, others folded
          armR.wr.rotation.set(-0.5, 0, 0)
          curl(armR.hand.f[0], 0.0, true, 1)
          curl(armR.hand.f[1], 1.0, false, 1)
          curl(armR.hand.f[2], 1.0, false, 1)
          curl(armR.hand.f[3], 1.0, false, 1)
          curl(armR.hand.f[4], 1.0, false, 1)
        } else {
          // Zero: All fingertips touching thumb forming circle O
          for (let i = 0; i < 5; i++) curl(armR.hand.f[i], 0.55, i === 0, 1)
        }
      } else if (g.startsWith("LETTER_")) {
        // === OFFICIAL ISLRTC ALPHABETS PROCEDURAL RIGGING ===
        const letter = g.replace("LETTER_", "").toUpperCase()
        head.rotation.set(0.06, 0, 0)
        mouth.scale.set(1.1, 0.45, 1)

        if (letter === "A") {
          // Both hands fists with thumbs pointing vertically upright touching at the tips!
          armR.sh.rotation.set(0.8, -0.4, 0.3)
          armR.el.rotation.set(-1.7, 0.6, 0)
          armL.sh.rotation.set(0.8, 0.4, -0.3)
          armL.el.rotation.set(-1.7, -0.6, 0)
          ;[armR, armL].forEach((a) => {
            const s = a.s
            curl(a.hand.f[0], 0.0, true, s) // Thumb UP
            curl(a.hand.f[1], 1.0, false, s) // Fist
            curl(a.hand.f[2], 1.0, false, s)
            curl(a.hand.f[3], 1.0, false, s)
            curl(a.hand.f[4], 1.0, false, s)
          })
        } else if (letter === "B") {
          // Both hands curve thumb & index to form touching circles of B
          armR.sh.rotation.set(0.75, -0.3, 0.2)
          armR.el.rotation.set(-1.6, 0.5, 0)
          armL.sh.rotation.set(0.75, 0.3, -0.2)
          armL.el.rotation.set(-1.6, -0.5, 0)
          ;[armR, armL].forEach((a) => {
            const s = a.s
            for (let i = 0; i < 5; i++) curl(a.hand.f[i], 0.5, i === 0, s)
          })
        } else if (letter === "C") {
          // Right hand curved in C shape
          armR.sh.rotation.set(0.7, -0.2, 0.2)
          armR.el.rotation.set(-1.7, 0.3, 0)
          armL.sh.rotation.set(REST.sx, 0, -REST.sz)
          armL.el.rotation.set(REST.ex, 0, 0)
          for (let i = 0; i < 5; i++) curl(armR.hand.f[i], 0.45, i === 0, 1)
        } else if (letter === "D") {
          // Left index up, right thumb and index forming circle touching left index
          armL.sh.rotation.set(0.75, 0.3, -0.2)
          armL.el.rotation.set(-1.6, -0.4, 0)
          curl(armL.hand.f[0], 1.0, true, -1)
          curl(armL.hand.f[1], 0.0, false, -1) // Upright left index
          for (let i = 2; i < 5; i++) curl(armL.hand.f[i], 1.0, false, -1)

          armR.sh.rotation.set(0.75, -0.3, 0.2)
          armR.el.rotation.set(-1.6, 0.4, 0)
          for (let i = 0; i < 5; i++) curl(armR.hand.f[i], 0.5, i === 0, 1)
        } else if (letter === "E") {
          // Left index vertical, right 3 fingers touch top, middle, bottom
          armL.sh.rotation.set(0.75, 0.3, -0.2)
          armL.el.rotation.set(-1.6, -0.4, 0)
          curl(armL.hand.f[1], 0.0, false, -1) // Upright index
          for (let i = 2; i < 5; i++) curl(armL.hand.f[i], 1.0, false, -1)

          armR.sh.rotation.set(0.7, -0.25, 0.15)
          armR.el.rotation.set(-1.5, 0.35, 0)
          curl(armR.hand.f[0], 0.0, true, 1)
          curl(armR.hand.f[1], 0.0, false, 1)
          curl(armR.hand.f[2], 0.0, false, 1)
          curl(armR.hand.f[3], 1.0, false, 1)
          curl(armR.hand.f[4], 1.0, false, 1)
        } else if (letter === "F") {
          // Left index vertical, right index & middle crossed horizontally across top
          armL.sh.rotation.set(0.75, 0.3, -0.2)
          armL.el.rotation.set(-1.6, -0.4, 0)
          curl(armL.hand.f[1], 0.0, false, -1) // Upright index
          for (let i = 2; i < 5; i++) curl(armL.hand.f[i], 1.0, false, -1)

          armR.sh.rotation.set(0.8, -0.3, 0.2)
          armR.el.rotation.set(-1.7, 0.5, 0)
          armR.wr.rotation.set(0.3, 0, 0.4) // Horizontal cross
          curl(armR.hand.f[1], 0.0, false, 1)
          curl(armR.hand.f[2], 0.0, false, 1)
          curl(armR.hand.f[0], 1.0, true, 1)
          curl(armR.hand.f[3], 1.0, false, 1)
          curl(armR.hand.f[4], 1.0, false, 1)
        } else if (letter === "G") {
          // Both hands in fists, right fist on top of left fist
          armL.sh.rotation.set(0.7, 0.2, -0.15)
          armL.el.rotation.set(-1.5, -0.3, 0)
          for (let i = 0; i < 5; i++) curl(armL.hand.f[i], 1.0, i === 0, -1)

          armR.sh.rotation.set(0.8, -0.2, 0.15)
          armR.el.rotation.set(-1.7, 0.3, 0)
          for (let i = 0; i < 5; i++) curl(armR.hand.f[i], 1.0, i === 0, 1)
        } else if (letter === "H") {
          // Left open palm horizontal, right flat hand sweeps across left palm
          armL.sh.rotation.set(0.7, 0.3, -0.2)
          armL.el.rotation.set(-1.5, -0.4, 0)
          armL.wr.rotation.set(0, 0, -0.4)
          for (let i = 0; i < 5; i++) curl(armL.hand.f[i], 0.05, i === 0, -1) // Flat open left palm

          armR.sh.rotation.set(0.75, -0.2, 0.2)
          armR.el.rotation.set(-1.6, 0.4, 0)
          for (let i = 0; i < 5; i++) curl(armR.hand.f[i], 0.05, i === 0, 1) // Sweeping right hand
        } else if (letter === "I") {
          // Right index finger touching right cheek
          head.rotation.set(0.05, 0.1, 0)
          armR.sh.rotation.set(1.1, -0.2, 0.3)
          armR.el.rotation.set(-2.0, 0.2, 0)
          curl(armR.hand.f[1], 0.0, false, 1) // Index touches cheek
          for (let i = 0; i < 5; i++) if (i !== 1) curl(armR.hand.f[i], 1.0, i === 0, 1)

          armL.sh.rotation.set(REST.sx, 0, -REST.sz)
          armL.el.rotation.set(REST.ex, 0, 0)
        } else if (letter === "J") {
          // Left palm open, right index draws a J hook trajectory
          const hook = Math.sin(t * 3) * 0.15
          armL.sh.rotation.set(0.7, 0.3, -0.2)
          armL.el.rotation.set(-1.5, -0.4, 0)
          for (let i = 0; i < 5; i++) curl(armL.hand.f[i], 0.05, i === 0, -1)

          armR.sh.rotation.set(0.75, -0.2 + hook, 0.2)
          armR.el.rotation.set(-1.6 + hook, 0.4, 0)
          curl(armR.hand.f[1], 0.0, false, 1)
          for (let i = 0; i < 5; i++) if (i !== 1) curl(armR.hand.f[i], 1.0, i === 0, 1)
        } else if (letter === "K") {
          // Left index upright, right V shape rests against left index
          armL.sh.rotation.set(0.75, 0.3, -0.2)
          armL.el.rotation.set(-1.6, -0.4, 0)
          curl(armL.hand.f[1], 0.0, false, -1)
          for (let i = 2; i < 5; i++) curl(armL.hand.f[i], 1.0, false, -1)

          armR.sh.rotation.set(0.75, -0.3, 0.2)
          armR.el.rotation.set(-1.6, 0.4, 0)
          curl(armR.hand.f[1], 0.0, false, 1)
          curl(armR.hand.f[2], 0.0, false, 1) // V shape
          curl(armR.hand.f[0], 1.0, true, 1)
          curl(armR.hand.f[3], 1.0, false, 1)
          curl(armR.hand.f[4], 1.0, false, 1)
        } else if (letter === "L") {
          // Right thumb and index at 90 degrees forming 'L'
          armR.sh.rotation.set(0.7, -0.2, 0.2)
          armR.el.rotation.set(-1.7, 0.3, 0)
          armL.sh.rotation.set(REST.sx, 0, -REST.sz)
          armL.el.rotation.set(REST.ex, 0, 0)
          curl(armR.hand.f[0], 0.0, true, 1) // Thumb out
          curl(armR.hand.f[1], 0.0, false, 1) // Index up
          curl(armR.hand.f[2], 1.0, false, 1)
          curl(armR.hand.f[3], 1.0, false, 1)
          curl(armR.hand.f[4], 1.0, false, 1)
        } else if (letter === "M") {
          // Left palm flat horizontal, 3 fingers of right hand placed on palm
          armL.sh.rotation.set(0.7, 0.3, -0.2)
          armL.el.rotation.set(-1.5, -0.4, 0)
          for (let i = 0; i < 5; i++) curl(armL.hand.f[i], 0.05, i === 0, -1)

          armR.sh.rotation.set(0.75, -0.2, 0.2)
          armR.el.rotation.set(-1.6, 0.4, 0)
          curl(armR.hand.f[0], 1.0, true, 1)
          curl(armR.hand.f[1], 0.0, false, 1) // Index
          curl(armR.hand.f[2], 0.0, false, 1) // Middle
          curl(armR.hand.f[3], 0.0, false, 1) // Ring (3 prongs of M)
          curl(armR.hand.f[4], 1.0, false, 1)
        } else if (letter === "N") {
          // Left palm flat horizontal, 2 fingers of right hand placed on palm
          armL.sh.rotation.set(0.7, 0.3, -0.2)
          armL.el.rotation.set(-1.5, -0.4, 0)
          for (let i = 0; i < 5; i++) curl(armL.hand.f[i], 0.05, i === 0, -1)

          armR.sh.rotation.set(0.75, -0.2, 0.2)
          armR.el.rotation.set(-1.6, 0.4, 0)
          curl(armR.hand.f[0], 1.0, true, 1)
          curl(armR.hand.f[1], 0.0, false, 1) // Index
          curl(armR.hand.f[2], 0.0, false, 1) // Middle (2 prongs of N)
          curl(armR.hand.f[3], 1.0, false, 1)
          curl(armR.hand.f[4], 1.0, false, 1)
        } else if (letter === "O") {
          // Right hand fingers and thumb curved touching to form circular 'O'
          armR.sh.rotation.set(0.7, -0.2, 0.2)
          armR.el.rotation.set(-1.7, 0.3, 0)
          armL.sh.rotation.set(REST.sx, 0, -REST.sz)
          armL.el.rotation.set(REST.ex, 0, 0)
          for (let i = 0; i < 5; i++) curl(armR.hand.f[i], 0.55, i === 0, 1)
        } else if (letter === "P") {
          // Left index upright, right thumb & index form loop touching top of left index
          armL.sh.rotation.set(0.75, 0.3, -0.2)
          armL.el.rotation.set(-1.6, -0.4, 0)
          curl(armL.hand.f[1], 0.0, false, -1)
          for (let i = 2; i < 5; i++) curl(armL.hand.f[i], 1.0, false, -1)

          armR.sh.rotation.set(0.8, -0.25, 0.2)
          armR.el.rotation.set(-1.7, 0.4, 0)
          curl(armR.hand.f[0], 0.5, true, 1)
          curl(armR.hand.f[1], 0.5, false, 1)
          for (let i = 2; i < 5; i++) curl(armR.hand.f[i], 1.0, false, 1)
        } else if (letter === "Q") {
          // Right hand hook pointing downward over left index
          armL.sh.rotation.set(0.75, 0.3, -0.2)
          armL.el.rotation.set(-1.6, -0.4, 0)
          curl(armL.hand.f[1], 0.0, false, -1)

          armR.sh.rotation.set(0.8, -0.3, 0.2)
          armR.el.rotation.set(-1.7, 0.4, 0)
          armR.wr.rotation.set(-0.4, 0, 0)
          for (let i = 0; i < 5; i++) curl(armR.hand.f[i], 0.6, i === 0, 1)
        } else if (letter === "R") {
          // Left open palm flat, right index & middle crossed resting on left palm
          armL.sh.rotation.set(0.7, 0.3, -0.2)
          armL.el.rotation.set(-1.5, -0.4, 0)
          for (let i = 0; i < 5; i++) curl(armL.hand.f[i], 0.05, i === 0, -1)

          armR.sh.rotation.set(0.75, -0.2, 0.2)
          armR.el.rotation.set(-1.6, 0.4, 0)
          curl(armR.hand.f[1], 0.0, false, 1) // Crossed index
          curl(armR.hand.f[2], 0.0, false, 1) // Crossed middle
          curl(armR.hand.f[0], 1.0, true, 1)
          curl(armR.hand.f[3], 1.0, false, 1)
          curl(armR.hand.f[4], 1.0, false, 1)
        } else if (letter === "S") {
          // Pinky fingers of both hands hooked into each other firmly
          armR.sh.rotation.set(0.75, -0.3, 0.2)
          armR.el.rotation.set(-1.6, 0.5, 0)
          armL.sh.rotation.set(0.75, 0.3, -0.2)
          armL.el.rotation.set(-1.6, -0.5, 0)
          ;[armR, armL].forEach((a) => {
            const s = a.s
            curl(a.hand.f[0], 1.0, true, s)
            curl(a.hand.f[1], 1.0, false, s)
            curl(a.hand.f[2], 1.0, false, s)
            curl(a.hand.f[3], 1.0, false, s)
            curl(a.hand.f[4], 0.5, false, s) // Hooked pinky
          })
        } else if (letter === "T") {
          // Left index vertical, right index horizontal resting on top forming 'T'
          armL.sh.rotation.set(0.75, 0.3, -0.2)
          armL.el.rotation.set(-1.6, -0.4, 0)
          curl(armL.hand.f[1], 0.0, false, -1) // Vertical left stem
          for (let i = 2; i < 5; i++) curl(armL.hand.f[i], 1.0, false, -1)

          armR.sh.rotation.set(0.8, -0.25, 0.2)
          armR.el.rotation.set(-1.7, 0.4, 0)
          armR.wr.rotation.set(0.2, 0, 0.5) // Horizontal crossbar
          curl(armR.hand.f[1], 0.0, false, 1)
          for (let i = 2; i < 5; i++) curl(armR.hand.f[i], 1.0, false, 1)
        } else if (letter === "U") {
          // Right index & middle extended straight up parallel (touching)
          armR.sh.rotation.set(0.7, -0.2, 0.2)
          armR.el.rotation.set(-1.7, 0.3, 0)
          armL.sh.rotation.set(REST.sx, 0, -REST.sz)
          armL.el.rotation.set(REST.ex, 0, 0)
          curl(armR.hand.f[0], 1.0, true, 1)
          curl(armR.hand.f[1], 0.0, false, 1) // Index up
          curl(armR.hand.f[2], 0.0, false, 1) // Middle up parallel
          curl(armR.hand.f[3], 1.0, false, 1)
          curl(armR.hand.f[4], 1.0, false, 1)
        } else if (letter === "V") {
          // Right index & middle extended straight up in V shape
          armR.sh.rotation.set(0.7, -0.2, 0.2)
          armR.el.rotation.set(-1.7, 0.3, 0)
          armL.sh.rotation.set(REST.sx, 0, -REST.sz)
          armL.el.rotation.set(REST.ex, 0, 0)
          curl(armR.hand.f[0], 1.0, true, 1)
          curl(armR.hand.f[1], 0.0, false, 1)
          curl(armR.hand.f[2], 0.0, false, 1)
          curl(armR.hand.f[3], 1.0, false, 1)
          curl(armR.hand.f[4], 1.0, false, 1)
        } else if (letter === "W") {
          // Both hands loosely interlocked pointing upward forming 'W'
          armR.sh.rotation.set(0.75, -0.3, 0.2)
          armR.el.rotation.set(-1.6, 0.4, 0)
          armL.sh.rotation.set(0.75, 0.3, -0.2)
          armL.el.rotation.set(-1.6, -0.4, 0)
          ;[armR, armL].forEach((a) => {
            const s = a.s
            for (let i = 0; i < 5; i++) curl(a.hand.f[i], 0.1, i === 0, s)
          })
        } else if (letter === "X") {
          // Index fingers of both hands crossed over each other forming an 'X'
          armR.sh.rotation.set(0.75, -0.25, 0.2)
          armR.el.rotation.set(-1.65, 0.4, 0)
          armL.sh.rotation.set(0.75, 0.25, -0.2)
          armL.el.rotation.set(-1.65, -0.4, 0)
          ;[armR, armL].forEach((a) => {
            const s = a.s
            curl(a.hand.f[1], 0.0, false, s) // Crossed index
            for (let i = 0; i < 5; i++) if (i !== 1) curl(a.hand.f[i], 1.0, i === 0, s)
          })
        } else if (letter === "Y") {
          // Left index vertical, right thumb & index form 'V' cradling the stem
          armL.sh.rotation.set(0.75, 0.3, -0.2)
          armL.el.rotation.set(-1.6, -0.4, 0)
          curl(armL.hand.f[1], 0.0, false, -1)
          for (let i = 2; i < 5; i++) curl(armL.hand.f[i], 1.0, false, -1)

          armR.sh.rotation.set(0.7, -0.2, 0.2)
          armR.el.rotation.set(-1.5, 0.35, 0)
          curl(armR.hand.f[0], 0.0, true, 1)
          curl(armR.hand.f[1], 0.0, false, 1)
          for (let i = 2; i < 5; i++) curl(armR.hand.f[i], 1.0, false, 1)
        } else if (letter === "Z") {
          // Left index vertical, right flat hand resting horizontally across base
          armL.sh.rotation.set(0.75, 0.3, -0.2)
          armL.el.rotation.set(-1.6, -0.4, 0)
          curl(armL.hand.f[1], 0.0, false, -1) // Upright left index
          for (let i = 2; i < 5; i++) curl(armL.hand.f[i], 1.0, false, -1)

          armR.sh.rotation.set(0.7, -0.2, 0.2)
          armR.el.rotation.set(-1.5, 0.3, 0)
          for (let i = 0; i < 5; i++) curl(armR.hand.f[i], 0.05, i === 0, 1) // Horizontal flat hand
        }
      } else {
        // Default 10-Second Continuous Prototype Timeline
        const R = sm(seg(t, 4, 6)) * (1 - sm(seg(t, 8.2, 10)))
        const sw = sm(seg(t, 5.8, 6.6)) * (1 - sm(seg(t, 7.7, 8.4)))

        ;[armR, armL].forEach((a, idx) => {
          const s = a.s
          const ph = idx ? 1.4 : 0
          const w = t * 2.6
          const p = {
            sx: REST.sx + (READY.sx - REST.sx) * R,
            sz: REST.sz + (READY.sz - REST.sz) * R,
            ex: REST.ex + (READY.ex - REST.ex) * R,
            roll: REST.roll + (READY.roll - REST.roll) * R,
            wx: REST.wx + (READY.wx - REST.wx) * R,
            wz: REST.wz + (READY.wz - REST.wz) * R,
          }

          a.sh.rotation.set(
            p.sx + sw * 0.1 * Math.sin(w * 0.8 + ph),
            0,
            s * (p.sz + sw * 0.16 * Math.sin(w * 0.7 + ph + 1))
          )
          a.el.rotation.set(
            p.ex + sw * 0.25 * Math.sin(w * 0.9 + ph + 0.5),
            s * (p.roll + sw * 0.55 * Math.sin(w * 0.6 + ph)),
            0
          )
          a.wr.rotation.set(
            p.wx + sw * 0.35 * Math.sin(w * 1.1 + ph),
            0,
            s * (p.wz + sw * 0.22 * Math.sin(w + ph + 2))
          )

          const base = 0.22 - 0.12 * R
          for (let i = 0; i < 5; i++) {
            const c =
              base +
              sw * (0.5 + 0.5 * Math.sin(w * 1.3 + i * 0.8 + ph * 2)) * (i === 0 ? 0.7 : 0.95)
            curl(a.hand.f[i], clamp(c), i === 0, s)
          }
        })

        // Face & Blinking
        const turn = Math.sin(Math.PI * seg(t, 2, 4))
        head.rotation.y = 0.42 * turn
        head.rotation.x = 0.03 * turn + 0.05 * Math.sin(Math.PI * seg(t, 8, 9.5))
        head.rotation.z = 0.04 * turn
        const smile = 0.3 + 0.55 * turn + 0.3 * sm(seg(t, 8, 9))
        mouth.scale.set(1 + 0.15 * smile, 0.2 + 0.5 * smile, 1)

        const u = (t % 2.6) - 1
        const b = Math.max(0, 1 - Math.abs(u) / 0.09)
        lids.forEach((o) => {
          if (o.userData.y) o.position.y = o.userData.y + 0.004 * smile
          else o.scale.y = Math.max(0.001, b)
        })

        // Breathing
        torso.scale.y = 1 + 0.006 * Math.sin(t * 1.6)
        body.rotation.z = 0.008 * Math.sin(t * 0.7)

        // Phase text
        const PH = [
          [0, 2, "0–2s: Standing naturally, looking at the camera"],
          [2, 4, "2–4s: Gentle head turn, friendly expression"],
          [4, 6, "4–6s: Raising both hands into a signing position"],
          [6, 8, "6–8s: Smooth, controlled hand and finger movements"],
          [8, 10, "8–10s: Returning to a relaxed, welcoming position"],
        ] as const

        for (let i = 0; i < PH.length; i++) {
          if (t >= PH[i][0] && t < PH[i][1]) {
            setPhaseText(PH[i][2])
            break
          }
        }
      }
    }

    // Orbit Drag Interaction
    let isDragging = false
    let prevMouseX = 0
    let prevMouseY = 0

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true
      prevMouseX = e.clientX
      prevMouseY = e.clientY
    }

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      const dx = e.clientX - prevMouseX
      const dy = e.clientY - prevMouseY
      scene.rotation.y += dx * 0.01
      camera.position.y = Math.max(0.6, Math.min(2.0, camera.position.y - dy * 0.005))
      camera.lookAt(0, 0.95, 0)
      prevMouseX = e.clientX
      prevMouseY = e.clientY
    }

    const onMouseUp = () => {
      isDragging = false
    }

    stage.addEventListener("mousedown", onMouseDown)
    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseup", onMouseUp)

    // Render Loop
    let animId: number
    let lastTime = performance.now()

    const loop = (now: number) => {
      animId = requestAnimationFrame(loop)
      const delta = Math.min(0.05, (now - lastTime) / 1000)
      lastTime = now

      if (isPlayingRef.current) {
        timelineSecRef.current += delta * speedRef.current
        if (timelineSecRef.current >= 10) {
          timelineSecRef.current = 0
        }
        setTimelineSec(timelineSecRef.current)
      }

      animateTimeline(timelineSecRef.current)
      renderer.render(scene, camera)
    }

    animId = requestAnimationFrame(loop)

    // Resize
    const handleResize = () => {
      if (!stage) return
      const w = stage.clientWidth
      const h = stage.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }

    window.addEventListener("resize", handleResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener("resize", handleResize)
      stage.removeEventListener("mousedown", onMouseDown)
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseup", onMouseUp)
      renderer.dispose()
      if (stage.contains(renderer.domElement)) {
        stage.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-border/80 bg-slate-950 shadow-2xl flex flex-col">
      {/* 3D Canvas Stage */}
      <div
        ref={mountRef}
        className="w-full h-[400px] sm:h-[480px] cursor-grab active:cursor-grabbing relative"
      />

      {/* Badges on stage */}
      <div className="absolute top-3 left-3 pointer-events-none">
        <span className="text-[11px] font-bold text-cyan-200 bg-slate-950/70 border border-cyan-500/40 px-3 py-1 rounded-full backdrop-blur-md">
          BharatSign Bridge 3D Avatar
        </span>
      </div>

      <div className="absolute top-3 right-3 pointer-events-none">
        <span className="text-[11px] font-mono text-cyan-300 bg-slate-950/70 border border-cyan-500/40 px-3 py-1 rounded-full backdrop-blur-md">
          {currentGesture === "DEMO_10S" ? `${timelineSec.toFixed(1)}s / 10.0s` : currentGesture}
        </span>
      </div>

      {/* Phase Banner */}
      <div className="absolute left-0 right-0 bottom-16 sm:bottom-14 px-4 py-2 text-center text-xs font-bold text-white bg-gradient-to-t from-slate-950/90 to-transparent pointer-events-none">
        {currentGesture === "DEMO_10S"
          ? phaseText
          : `Procedural Sign Articulation: ${currentGesture.replace(/_/g, " ")}`}
      </div>

      {/* Interactive Controls Bar */}
      {showControls && (
        <div className="p-3 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-white">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="default"
              className="h-8 px-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause className="h-3.5 w-3.5 mr-1" /> : <Play className="h-3.5 w-3.5 mr-1" />}
              {isPlaying ? "Pause" : "Play"}
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="h-8 px-2.5 text-slate-300 border-slate-700 hover:bg-slate-800"
              onClick={() => {
                timelineSecRef.current = 0
                setTimelineSec(0)
                setIsPlaying(true)
              }}
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" /> Replay
            </Button>
          </div>

          {/* Timeline Scrubber */}
          <div className="flex-1 min-w-[140px] flex items-center gap-2 px-2">
            <input
              type="range"
              min="0"
              max="10"
              step="0.05"
              value={timelineSec}
              onChange={(e) => {
                const val = parseFloat(e.target.value)
                timelineSecRef.current = val
                setTimelineSec(val)
                setIsPlaying(false)
              }}
              className="w-full accent-cyan-400 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
            />
            <span className="font-mono text-[11px] text-cyan-300 min-w-[36px]">
              {timelineSec.toFixed(1)}s
            </span>
          </div>

          {/* Speed Buttons */}
          <div className="flex items-center gap-1 bg-slate-800/80 px-2 py-0.5 rounded-lg border border-slate-700">
            {[0.5, 1.0, 1.5].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  speed === s ? "bg-cyan-500 text-slate-950" : "text-slate-400 hover:text-white"
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Quick Gesture Switcher */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {["DEMO_10S", "NAMASTE", "THANK_YOU", "WHAT_IS_YOUR_NAME", "STUDENT"].map((g) => (
              <button
                key={g}
                onClick={() => {
                  setCurrentGesture(g)
                  currentGestureRef.current = g
                  timelineSecRef.current = 0
                }}
                className={`px-2 py-1 rounded text-[10px] font-bold transition-all whitespace-nowrap ${
                  currentGesture === g
                    ? "bg-cyan-500 text-slate-950 font-extrabold shadow-sm"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {g === "DEMO_10S" ? "10s Timeline" : g.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
