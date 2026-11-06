import { useState } from "react"
import {
  Settings as SettingsIcon,
  User,
  Volume2,
  Camera,
  CheckCircle2,
  Sparkles,
  Scissors,
  Shirt,
  Glasses,
  RotateCcw,
  Check,
} from "lucide-react"
import Breadcrumbs from "@/components/layout/Breadcrumbs"
import { Button } from "@/components/ui/button"
import { INDIC_LANGUAGES, speakText } from "@/lib/speech"
import ThreeAvatar, { type SignGesture } from "@/components/avatar/ThreeAvatar"
import {
  useAvatarCustomization,
  HAIRSTYLE_OPTIONS,
  CLOTHING_STYLE_OPTIONS,
  HAIR_COLOR_PALETTES,
  CLOTHING_COLOR_PALETTES,
  SKIN_TONE_PALETTES,
  CHARACTER_PRESETS,
  type HairColorType,
  type ClothingColorType,
  type SkinToneType,
} from "@/context/AvatarCustomizationContext"

interface SettingsProps {
  currentLanguage: string
  onLanguageChange: (code: string) => void
}

export default function Settings({ currentLanguage, onLanguageChange }: SettingsProps) {
  const { customization, updateCustomization, applyPreset, resetToDefault } =
    useAvatarCustomization()

  const [activeTab, setActiveTab] = useState<"hairstyle" | "clothes" | "identity" | "presets">(
    "hairstyle"
  )
  const [previewGesture, setPreviewGesture] = useState<SignGesture>("STAND_STRAIGHT")
  const [speechRate, setSpeechRate] = useState<number>(1.0)
  const [showSkeleton, setShowSkeleton] = useState<boolean>(true)
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false)

  const langObj = INDIC_LANGUAGES.find((l) => l.code === currentLanguage) || INDIC_LANGUAGES[0]

  const handleTestVoice = () => {
    speakText(`Testing speech synthesis in ${langObj.name}`, currentLanguage)
  }

  const handleSaveAndApplyAll = () => {
    // Persist current settings globally
    updateCustomization({})
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 4000)
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-8">
      <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 flex flex-col gap-8">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs items={[{ label: "Application Settings" }]} />

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
              <SettingsIcon className="h-8 w-8 text-primary" />
              <span>Platform & 3D Character Settings</span>
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Customize 3D presenter hairstyle, clothing attire, skin tone, multilingual voice synthesis, and vision overlays.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={resetToDefault}
              className="gap-1.5 text-xs border-border text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Avatar</span>
            </Button>

            <Button
              onClick={handleSaveAndApplyAll}
              className="gap-2 text-xs font-bold bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-lg shadow-blue-500/25"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Apply to All 3D Characters</span>
            </Button>
          </div>
        </div>

        {/* Global Save Feedback Alert */}
        {savedSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-950/40 border-2 border-emerald-500 text-emerald-300 text-xs sm:text-sm font-semibold flex items-center gap-3 animate-in fade-in shadow-lg">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold block text-emerald-200">
                Customization Saved & Applied Globally!
              </span>
              <span className="text-xs text-emerald-300/90 font-normal">
                Your customized hairstyle, clothing attire, and colors are now active on all 3D characters across Conversation, Learning Portal, Dictionary, and Creator Studio.
              </span>
            </div>
          </div>
        )}

        {/* ================= SECTION 1: 3D CHARACTER CUSTOMIZATION STUDIO ================= */}
        <div className="rounded-3xl bg-card border border-border shadow-md overflow-hidden">
          {/* Section Header */}
          <div className="p-6 border-b border-border/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-muted/20">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shadow-inner">
                <User className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-foreground">
                    3D Digital Human Avatar Studio
                  </h2>
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary border border-primary/20">
                    Live 3D Sync
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Changes made here apply dynamically across all 3D avatars in BharatSign Bridge.
                </p>
              </div>
            </div>

            {/* Gesture Preview Controls */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-muted-foreground font-semibold mr-1">
                Preview Gesture:
              </span>
              {(
                [
                  "STAND_STRAIGHT",
                  "NAMASTE",
                  "THANK_YOU",
                  "HELP",
                  "STUDENT",
                  "WHAT_IS_YOUR_NAME",
                ] as SignGesture[]
              ).map((g) => {
                const label =
                  g === "STAND_STRAIGHT" ? "Stand Straight" : g.replace(/_/g, " ")
                return (
                  <button
                    key={g}
                    onClick={() => setPreviewGesture(g)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                      previewGesture === g
                        ? "bg-primary text-white shadow-sm"
                        : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Interactive Split Studio: Left 3D Stage / Right Customization Tabs */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-border">
            {/* Left Column: Live 3D Avatar Preview (5 cols) */}
            <div className="lg:col-span-5 p-5 flex flex-col gap-4 bg-slate-950/40">
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-xl bg-slate-950">
                <ThreeAvatar
                  activeGesture={previewGesture}
                  showControls={false}
                  initialCameraView={customization.cameraFraming}
                  customization={customization}
                />

                {/* Floating Character Info Pill */}
                <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-cyan-500/30 text-white flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                  <div className="text-left">
                    <span className="text-xs font-bold block text-white leading-none">
                      {customization.characterName}
                    </span>
                    <span className="text-[10px] text-cyan-300 font-mono">
                      {HAIRSTYLE_OPTIONS.find((h) => h.id === customization.hairstyle)?.label} •{" "}
                      {CLOTHING_STYLE_OPTIONS.find((c) => c.id === customization.clothingStyle)?.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Info Helper */}
              <div className="p-3 rounded-xl bg-muted/40 border border-border/60 text-[11px] text-muted-foreground flex items-center justify-between">
                <span>Drag inside the 3D stage to orbit and view your avatar from any angle.</span>
                <span className="text-primary font-bold">Orbit Active</span>
              </div>
            </div>

            {/* Right Column: Customization Controls (7 cols) */}
            <div className="lg:col-span-7 p-6 flex flex-col gap-6">
              {/* Navigation Tabs */}
              <div className="flex items-center gap-1 p-1 rounded-2xl bg-muted/60 border border-border text-xs font-bold">
                <button
                  onClick={() => setActiveTab("hairstyle")}
                  className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === "hairstyle"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Scissors className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Hairstyle</span>
                </button>

                <button
                  onClick={() => setActiveTab("clothes")}
                  className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === "clothes"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Shirt className="h-3.5 w-3.5 text-blue-400" />
                  <span>Clothes & Attire</span>
                </button>

                <button
                  onClick={() => setActiveTab("identity")}
                  className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === "identity"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Glasses className="h-3.5 w-3.5 text-amber-400" />
                  <span>Features & Identity</span>
                </button>

                <button
                  onClick={() => setActiveTab("presets")}
                  className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === "presets"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Presets</span>
                </button>
              </div>

              {/* TAB 1: HAIRSTYLE & HAIR COLOR */}
              {activeTab === "hairstyle" && (
                <div className="flex flex-col gap-5 animate-in fade-in">
                  <div>
                    <label className="text-xs font-bold text-foreground block mb-2">
                      Choose Hairstyle:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {HAIRSTYLE_OPTIONS.map((style) => (
                        <button
                          key={style.id}
                          onClick={() => updateCustomization({ hairstyle: style.id })}
                          className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                            customization.hairstyle === style.id
                              ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                              : "border-border hover:bg-muted/40"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-foreground">
                              {style.label}
                            </span>
                            {customization.hairstyle === style.id && (
                              <Check className="h-4 w-4 text-primary" />
                            )}
                          </div>
                          <span className="text-[11px] text-muted-foreground leading-tight">
                            {style.description}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Hair Color Selection */}
                  <div className="pt-2 border-t border-border">
                    <label className="text-xs font-bold text-foreground block mb-2.5">
                      Hair Color Palette:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {(Object.keys(HAIR_COLOR_PALETTES) as HairColorType[]).map((key) => {
                        const pal = HAIR_COLOR_PALETTES[key]
                        const isSelected = customization.hairColor === key
                        return (
                          <button
                            key={key}
                            onClick={() => updateCustomization({ hairColor: key })}
                            className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all text-left ${
                              isSelected
                                ? "border-primary bg-primary/10 ring-2 ring-primary/30 font-bold"
                                : "border-border hover:bg-muted/40"
                            }`}
                          >
                            <span
                              className="h-5 w-5 rounded-full border border-white/20 shrink-0 shadow-sm"
                              style={{ backgroundColor: pal.preview }}
                            />
                            <span className="text-xs text-foreground truncate">{pal.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CLOTHES & ATTIRE */}
              {activeTab === "clothes" && (
                <div className="flex flex-col gap-5 animate-in fade-in">
                  <div>
                    <label className="text-xs font-bold text-foreground block mb-2">
                      Presenter Attire & Clothing Style:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {CLOTHING_STYLE_OPTIONS.map((style) => (
                        <button
                          key={style.id}
                          onClick={() => updateCustomization({ clothingStyle: style.id })}
                          className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                            customization.clothingStyle === style.id
                              ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                              : "border-border hover:bg-muted/40"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-foreground">
                              {style.label}
                            </span>
                            {customization.clothingStyle === style.id && (
                              <Check className="h-4 w-4 text-primary" />
                            )}
                          </div>
                          <span className="text-[11px] text-muted-foreground leading-tight">
                            {style.description}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Clothing Color Theme */}
                  <div className="pt-2 border-t border-border">
                    <label className="text-xs font-bold text-foreground block mb-2.5">
                      Attire Color Palette:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {(Object.keys(CLOTHING_COLOR_PALETTES) as ClothingColorType[]).map((key) => {
                        const pal = CLOTHING_COLOR_PALETTES[key]
                        const isSelected = customization.clothingColor === key
                        return (
                          <button
                            key={key}
                            onClick={() => updateCustomization({ clothingColor: key })}
                            className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all text-left ${
                              isSelected
                                ? "border-primary bg-primary/10 ring-2 ring-primary/30 font-bold"
                                : "border-border hover:bg-muted/40"
                            }`}
                          >
                            <span
                              className="h-5 w-5 rounded-full border border-white/20 shrink-0 shadow-sm"
                              style={{ backgroundColor: pal.preview }}
                            />
                            <span className="text-xs text-foreground whitespace-normal text-left leading-tight">{pal.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: IDENTITY & ACCESSORIES */}
              {activeTab === "identity" && (
                <div className="flex flex-col gap-5 animate-in fade-in">
                  {/* Skin Tone */}
                  <div>
                    <label className="text-xs font-bold text-foreground block mb-2">
                      Skin Tone:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(Object.keys(SKIN_TONE_PALETTES) as SkinToneType[]).map((key) => {
                        const tone = SKIN_TONE_PALETTES[key]
                        const isSelected = customization.skinTone === key
                        return (
                          <button
                            key={key}
                            onClick={() => updateCustomization({ skinTone: key })}
                            className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all ${
                              isSelected
                                ? "border-primary bg-primary/10 ring-2 ring-primary/30 font-bold"
                                : "border-border hover:bg-muted/40"
                            }`}
                          >
                            <span
                              className="h-5 w-5 rounded-full border border-white/30 shrink-0 shadow-sm"
                              style={{ backgroundColor: tone.preview }}
                            />
                            <span className="text-xs text-foreground whitespace-normal text-left leading-tight">{tone.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Accessories Toggles */}
                  <div className="pt-2 border-t border-border flex flex-col gap-3">
                    <label className="text-xs font-bold text-foreground block">
                      Facial Accents & Accessories:
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Glasses */}
                      <button
                        onClick={() =>
                          updateCustomization({ hasGlasses: !customization.hasGlasses })
                        }
                        className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                          customization.hasGlasses
                            ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                            : "border-border hover:bg-muted/40"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Glasses className="h-4 w-4 text-primary" />
                          <div className="text-left">
                            <span className="text-xs font-bold block text-foreground">
                              Wireframe Glasses
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              Modern metallic optical frame
                            </span>
                          </div>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            customization.hasGlasses
                              ? "bg-primary text-white"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {customization.hasGlasses ? "Enabled" : "Off"}
                        </span>
                      </button>

                      {/* Bindi / Tilak */}
                      <button
                        onClick={() => updateCustomization({ hasBindi: !customization.hasBindi })}
                        className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                          customization.hasBindi
                            ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                            : "border-border hover:bg-muted/40"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Sparkles className="h-4 w-4 text-rose-500" />
                          <div className="text-left">
                            <span className="text-xs font-bold block text-foreground">
                              Traditional Bindi
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              Classic cultural forehead accent
                            </span>
                          </div>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            customization.hasBindi
                              ? "bg-rose-600 text-white"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {customization.hasBindi ? "Enabled" : "Off"}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Camera Framing Preference */}
                  <div className="pt-2 border-t border-border">
                    <label className="text-xs font-bold text-foreground block mb-2">
                      Default 3D Camera Framing:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: "upper-body", label: "Upper Body" },
                        { id: "hands", label: "Both Hands" },
                        { id: "full-body", label: "Full Body" },
                        { id: "face", label: "Face View" },
                      ].map((cam) => (
                        <button
                          key={cam.id}
                          onClick={() =>
                            updateCustomization({
                              cameraFraming: cam.id as "upper-body" | "hands" | "full-body" | "face",
                            })
                          }
                          className={`p-2 rounded-xl border text-center font-semibold text-xs transition-all ${
                            customization.cameraFraming === cam.id
                              ? "border-primary bg-primary/10 text-primary font-bold ring-2 ring-primary/30"
                              : "border-border text-muted-foreground hover:bg-muted/40"
                          }`}
                        >
                          {cam.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: CHARACTER PRESETS */}
              {activeTab === "presets" && (
                <div className="flex flex-col gap-3 animate-in fade-in">
                  <label className="text-xs font-bold text-foreground block">
                    1-Click Character Presets:
                  </label>
                  <div className="grid grid-cols-1 gap-2.5">
                    {CHARACTER_PRESETS.map((preset) => {
                      const isCurrent = customization.presetId === preset.id
                      return (
                        <button
                          key={preset.id}
                          onClick={() => applyPreset(preset.id)}
                          className={`p-3.5 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all ${
                            isCurrent
                              ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                              : "border-border hover:bg-muted/40"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-sm font-black text-cyan-400 shrink-0">
                              {preset.name.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-foreground">
                                  {preset.name}
                                </span>
                                <span className="text-[10px] text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">
                                  {preset.role}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {preset.description}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${
                              isCurrent
                                ? "bg-primary text-white"
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                            }`}
                          >
                            {isCurrent ? "Active" : "Apply"}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Apply Everywhere Banner */}
              <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-xs text-muted-foreground text-center sm:text-left">
                  Saved preferences synchronize to local storage and update every 3D sign avatar in real-time.
                </span>

                <Button
                  onClick={handleSaveAndApplyAll}
                  className="w-full sm:w-auto gap-2 text-xs font-bold bg-primary hover:bg-primary/90 text-white shadow-md"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Save & Apply Globally</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* ================= SECTION 2: MULTILINGUAL SPEECH VOICE SYNTHESIS ================= */}
        <div className="p-6 rounded-3xl bg-card border border-border shadow-sm flex flex-col gap-6">
          <div className="flex items-center gap-2 text-sm font-bold text-foreground border-b border-border pb-3">
            <Volume2 className="h-4 w-4 text-cyan-400" />
            <span>Spoken Voice Synthesis Preferences</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Language Selector */}
            <div className="flex flex-col gap-2">
              <label className="font-bold text-foreground">Active Spoken Voice Output:</label>
              <select
                value={currentLanguage}
                onChange={(e) => onLanguageChange(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {INDIC_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name} ({lang.native}) — {lang.bcp47}
                  </option>
                ))}
              </select>
            </div>

            {/* Voice Rate Slider */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between font-bold text-foreground">
                <span>Speaking Rate / Speed:</span>
                <span className="text-primary font-mono">{speechRate}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.1"
                value={speechRate}
                onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-border flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Verify your browser's Web Speech API voice synthesis across 13 Indian languages.
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={handleTestVoice}
              className="gap-1.5 text-xs text-primary hover:bg-primary/10"
            >
              <Volume2 className="h-3.5 w-3.5" />
              <span>Test Audio Sample</span>
            </Button>
          </div>
        </div>

        {/* ================= SECTION 3: COMPUTER VISION & CAMERA ================= */}
        <div className="p-6 rounded-3xl bg-card border border-border shadow-sm flex flex-col gap-6">
          <div className="flex items-center gap-2 text-sm font-bold text-foreground border-b border-border pb-3">
            <Camera className="h-4 w-4 text-emerald-400" />
            <span>Computer Vision & Landmark Overlays</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-foreground block">
                Render 21 Hand Keypoint Skeletal Connectors:
              </span>
              <p className="text-muted-foreground mt-0.5">
                Displays real-time coloured bones and knuckle points over the webcam video canvas.
              </p>
            </div>

            <button
              onClick={() => setShowSkeleton(!showSkeleton)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                showSkeleton
                  ? "bg-emerald-600 text-white border-emerald-500"
                  : "bg-muted text-muted-foreground border-border"
              }`}
            >
              {showSkeleton ? "Enabled" : "Disabled"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
