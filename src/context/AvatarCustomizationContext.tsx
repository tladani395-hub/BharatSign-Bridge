import React, { createContext, useContext, useState, useEffect } from "react"

export type HairstyleType =
  | "short-modern"
  | "high-bun"
  | "ponytail"
  | "long-waves"
  | "traditional-turban"

export type ClothingStyleType =
  | "kurta"
  | "blazer"
  | "hoodie"
  | "tshirt"
  | "traditional-sari"

export type HairColorType =
  | "jet-black"
  | "dark-brown"
  | "chestnut"
  | "silver-grey"
  | "auburn"

export type ClothingColorType =
  | "deep-navy"
  | "royal-saffron"
  | "emerald-green"
  | "crimson-maroon"
  | "slate-cyber"
  | "pure-white"

export type SkinToneType =
  | "wheatish"
  | "warm-fair"
  | "golden-deep"
  | "rich-bronze"

export interface AvatarCustomization {
  presetId: string
  characterName: string
  hairstyle: HairstyleType
  hairColor: HairColorType
  clothingStyle: ClothingStyleType
  clothingColor: ClothingColorType
  skinTone: SkinToneType
  hasGlasses: boolean
  hasBindi: boolean
  cameraFraming: "upper-body" | "hands" | "full-body" | "face"
}

export const HAIR_COLOR_PALETTES: Record<
  HairColorType,
  { hex: number; label: string; preview: string }
> = {
  "jet-black": { hex: 0x0c0c10, label: "Jet Black", preview: "#0c0c10" },
  "dark-brown": { hex: 0x2a170d, label: "Dark Espresso", preview: "#2a170d" },
  "chestnut": { hex: 0x482718, label: "Warm Chestnut", preview: "#482718" },
  "silver-grey": { hex: 0x71717a, label: "Silver Grey", preview: "#71717a" },
  "auburn": { hex: 0x612519, label: "Auburn Copper", preview: "#612519" },
}

export const CLOTHING_COLOR_PALETTES: Record<
  ClothingColorType,
  { primary: number; secondary: number; label: string; preview: string; tailwind: string }
> = {
  "deep-navy": {
    primary: 0x102a43,
    secondary: 0x1d3a72,
    label: "Deep Navy",
    preview: "#102a43",
    tailwind: "bg-[#102A43]",
  },
  "royal-saffron": {
    primary: 0xb45309,
    secondary: 0xd97706,
    label: "Royal Saffron",
    preview: "#b45309",
    tailwind: "bg-amber-600",
  },
  "emerald-green": {
    primary: 0x064e3b,
    secondary: 0x059669,
    label: "Emerald Green",
    preview: "#064e3b",
    tailwind: "bg-emerald-700",
  },
  "crimson-maroon": {
    primary: 0x7f1d1d,
    secondary: 0x991b1b,
    label: "Crimson Maroon",
    preview: "#7f1d1d",
    tailwind: "bg-rose-900",
  },
  "slate-cyber": {
    primary: 0x1e293b,
    secondary: 0x38bdf8,
    label: "Cyber Slate",
    preview: "#1e293b",
    tailwind: "bg-slate-800",
  },
  "pure-white": {
    primary: 0xf1f5f9,
    secondary: 0x94a3b8,
    label: "Classic White",
    preview: "#f1f5f9",
    tailwind: "bg-slate-200",
  },
}

export const SKIN_TONE_PALETTES: Record<
  SkinToneType,
  { hex: number; label: string; preview: string }
> = {
  "wheatish": { hex: 0xc48a5a, label: "Wheatish Golden", preview: "#c48a5a" },
  "warm-fair": { hex: 0xe0aa80, label: "Warm Fair", preview: "#e0aa80" },
  "golden-deep": { hex: 0xa0673d, label: "Deep Amber", preview: "#a0673d" },
  "rich-bronze": { hex: 0x7d4b27, label: "Rich Bronze", preview: "#7d4b27" },
}

export const HAIRSTYLE_OPTIONS: { id: HairstyleType; label: string; description: string }[] = [
  { id: "short-modern", label: "Short Modern Crop", description: "Clean structured contemporary trim" },
  { id: "high-bun", label: "Top Knot / High Bun", description: "Traditional neat ISL presenter bun with accent tie" },
  { id: "ponytail", label: "Sleek Ponytail", description: "Professional pulled-back ponytail tail" },
  { id: "long-waves", label: "Shoulder Waves", description: "Flowing side locks framing the jawline" },
  { id: "traditional-turban", label: "Traditional Pagri / Turban", description: "Authentic multi-fold ceremonial turban" },
]

export const CLOTHING_STYLE_OPTIONS: { id: ClothingStyleType; label: string; description: string }[] = [
  { id: "kurta", label: "Nehru Kurta / Sherwani", description: "Mandarin collar tunic with front button placket" },
  { id: "blazer", label: "Formal Suit & Blazer", description: "Professional lapel jacket with white inner shirt" },
  { id: "hoodie", label: "Cyber Tech Hoodie", description: "Relaxed streetwear hoodie with front kangaroo pouch" },
  { id: "tshirt", label: "Classic Crewneck Tee", description: "Fitted athletic crewneck with ribbed collar" },
  { id: "traditional-sari", label: "Traditional Saree / Dupatta", description: "Diagonal draped cultural sash across chest" },
]

export const CHARACTER_PRESETS = [
  {
    id: "aanya",
    name: "Aanya",
    role: "National ISL Anchor & Educator",
    description: "Traditional high bun with Royal Saffron attire and elegant accents.",
    customization: {
      presetId: "aanya",
      characterName: "Aanya",
      hairstyle: "high-bun" as HairstyleType,
      hairColor: "jet-black" as HairColorType,
      clothingStyle: "kurta" as ClothingStyleType,
      clothingColor: "royal-saffron" as ClothingColorType,
      skinTone: "wheatish" as SkinToneType,
      hasGlasses: false,
      hasBindi: true,
      cameraFraming: "upper-body" as const,
    },
  },
  {
    id: "aarav",
    name: "Aarav",
    role: "Lead ISL AI Presenter",
    description: "Short modern hair, Deep Navy Nehru Kurta, and wireframe glasses.",
    customization: {
      presetId: "aarav",
      characterName: "Aarav",
      hairstyle: "short-modern" as HairstyleType,
      hairColor: "jet-black" as HairColorType,
      clothingStyle: "kurta" as ClothingStyleType,
      clothingColor: "deep-navy" as ClothingColorType,
      skinTone: "wheatish" as SkinToneType,
      hasGlasses: true,
      hasBindi: false,
      cameraFraming: "upper-body" as const,
    },
  },
  {
    id: "kabir",
    name: "Kabir",
    role: "Deaf Student Ambassador",
    description: "Contemporary crop cut in Cyber Slate Tech Hoodie.",
    customization: {
      presetId: "kabir",
      characterName: "Kabir",
      hairstyle: "short-modern" as HairstyleType,
      hairColor: "dark-brown" as HairColorType,
      clothingStyle: "hoodie" as ClothingStyleType,
      clothingColor: "slate-cyber" as ClothingColorType,
      skinTone: "warm-fair" as SkinToneType,
      hasGlasses: false,
      hasBindi: false,
      cameraFraming: "upper-body" as const,
    },
  },
  {
    id: "priya",
    name: "Priya",
    role: "Professional Sign Linguist",
    description: "Sleek ponytail with professional Emerald Green blazer.",
    customization: {
      presetId: "priya",
      characterName: "Priya",
      hairstyle: "ponytail" as HairstyleType,
      hairColor: "dark-brown" as HairColorType,
      clothingStyle: "blazer" as ClothingStyleType,
      clothingColor: "emerald-green" as ClothingColorType,
      skinTone: "warm-fair" as SkinToneType,
      hasGlasses: true,
      hasBindi: false,
      cameraFraming: "upper-body" as const,
    },
  },
  {
    id: "gurpreet",
    name: "Gurpreet",
    role: "Community Sign Advocate",
    description: "Ceremonial Pagri / Turban with Crimson Maroon Kurta.",
    customization: {
      presetId: "gurpreet",
      characterName: "Gurpreet",
      hairstyle: "traditional-turban" as HairstyleType,
      hairColor: "jet-black" as HairColorType,
      clothingStyle: "kurta" as ClothingStyleType,
      clothingColor: "crimson-maroon" as ClothingColorType,
      skinTone: "golden-deep" as SkinToneType,
      hasGlasses: false,
      hasBindi: false,
      cameraFraming: "upper-body" as const,
    },
  },
]

export const DEFAULT_AVATAR_CUSTOMIZATION: AvatarCustomization = {
  presetId: "aarav",
  characterName: "Aarav",
  hairstyle: "short-modern",
  hairColor: "jet-black",
  clothingStyle: "kurta",
  clothingColor: "deep-navy",
  skinTone: "wheatish",
  hasGlasses: false,
  hasBindi: false,
  cameraFraming: "upper-body",
}

const STORAGE_KEY = "bharatsign_avatar_customization"

export function getStoredAvatarCustomization(): AvatarCustomization {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return { ...DEFAULT_AVATAR_CUSTOMIZATION, ...parsed }
    }
  } catch (e) {
    console.warn("Failed to read avatar customization from localStorage", e)
  }
  return DEFAULT_AVATAR_CUSTOMIZATION
}

interface AvatarCustomizationContextType {
  customization: AvatarCustomization
  updateCustomization: (updates: Partial<AvatarCustomization>) => void
  applyPreset: (presetId: string) => void
  resetToDefault: () => void
}

const AvatarCustomizationContext = createContext<AvatarCustomizationContextType>({
  customization: DEFAULT_AVATAR_CUSTOMIZATION,
  updateCustomization: () => {},
  applyPreset: () => {},
  resetToDefault: () => {},
})

export const AvatarCustomizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customization, setCustomization] = useState<AvatarCustomization>(getStoredAvatarCustomization)

  const saveAndBroadcast = (next: AvatarCustomization) => {
    setCustomization(next)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      window.dispatchEvent(new CustomEvent("bharatsign_avatar_changed", { detail: next }))
    } catch (e) {
      console.warn("Failed to persist avatar customization", e)
    }
  }

  const updateCustomization = (updates: Partial<AvatarCustomization>) => {
    saveAndBroadcast({ ...customization, ...updates })
  }

  const applyPreset = (presetId: string) => {
    const found = CHARACTER_PRESETS.find((p) => p.id === presetId)
    if (found) {
      saveAndBroadcast({ ...found.customization })
    }
  }

  const resetToDefault = () => {
    saveAndBroadcast(DEFAULT_AVATAR_CUSTOMIZATION)
  }

  // Cross-tab synchronization
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue)
          setCustomization({ ...DEFAULT_AVATAR_CUSTOMIZATION, ...parsed })
        } catch {
          // ignore
        }
      }
    }
    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  return (
    <AvatarCustomizationContext.Provider
      value={{ customization, updateCustomization, applyPreset, resetToDefault }}
    >
      {children}
    </AvatarCustomizationContext.Provider>
  )
}

export function useAvatarCustomization() {
  return useContext(AvatarCustomizationContext)
}
