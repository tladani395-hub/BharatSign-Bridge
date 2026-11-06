import { useState } from "react"
import { Link } from "react-router-dom"
import {
  Volume2,
  Search,
  Filter,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from "lucide-react"
import ThreeAvatar from "@/components/avatar/ThreeAvatar"
import Breadcrumbs from "@/components/layout/Breadcrumbs"
import { Button } from "@/components/ui/button"
import { VOCABULARY_SIGNS, getAllCategories } from "@/data/vocabularyData"
import type { SignEntry } from "@/data/vocabularyData"
import { speakText } from "@/lib/speech"

interface WordsGridProps {
  currentLanguage: string
}

export default function WordsGrid({ currentLanguage }: WordsGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [previewSign, setPreviewSign] = useState<SignEntry>(VOCABULARY_SIGNS[0])
  const [signingSpeed, setSigningSpeed] = useState(1.0)

  const categories = getAllCategories()

  const filteredSigns = VOCABULARY_SIGNS.filter((sign) => {
    const matchesCategory =
      selectedCategory === "all" || sign.category.toLowerCase() === selectedCategory.toLowerCase()
    const matchesSearch =
      sign.gloss.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sign.meaning.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-background text-foreground py-8">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col gap-8">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs
          items={[
            { label: "Learning Portal", href: "/learn" },
            { label: "Vocabulary Dictionary" },
          ]}
        />

        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-400 border border-cyan-500/20 mb-2">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>ISLRTC Standard Vocabulary Lexicon</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
              ISL Vocabulary & Sign Dictionary
            </h1>
            <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
              Explore standardized Indian Sign Language lexical signs with multi-regional dialect variants, facial expressions, and 3D kinetic playback.
            </p>
          </div>

          <Link to="/learn/practice">
            <Button className="gap-2 text-xs font-bold shadow-md bg-gradient-to-r from-primary to-cyan-600 hover:from-primary/90 text-white self-start md:self-auto">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Enter Practice Studio</span>
            </Button>
          </Link>
        </div>

        {/* Featured Avatar Presenter Card */}
        <div className="rounded-3xl bg-gradient-to-br from-card via-slate-900 to-card border border-border p-6 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* 3D Avatar */}
            <div className="lg:col-span-5 aspect-[4/3] rounded-2xl overflow-hidden bg-slate-950 border border-border/80 shadow-inner relative">
              <ThreeAvatar
                activeGesture={previewSign.gloss}
                signingSpeed={signingSpeed}
                showControls={false}
                initialCameraView="upper-body"
              />
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white border border-white/10 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>Gloss: {previewSign.gloss}</span>
              </div>
            </div>

            {/* Selected Sign Details */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                    {previewSign.category}
                  </span>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-3xl sm:text-4xl font-black text-foreground">
                      {previewSign.meaning}
                    </span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full border bg-cyan-950/60 text-cyan-300 border-cyan-800">
                      Gloss: {previewSign.gloss}
                    </span>
                  </div>
                </div>

                <Link to={`/learn/words/${previewSign.gloss.toLowerCase()}`}>
                  <Button className="gap-2 text-xs font-bold shadow-md bg-primary hover:bg-primary/90 text-white">
                    <span>Deep-Dive Lesson</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-card/60 p-4 rounded-xl border border-border">
                <div>
                  <span className="font-semibold text-foreground block">Hand Formation:</span>
                  <p className="text-muted-foreground mt-0.5 leading-relaxed">{previewSign.hand_configuration}</p>
                </div>
                <div>
                  <span className="font-semibold text-foreground block">Signing Location:</span>
                  <p className="text-muted-foreground mt-0.5 leading-relaxed">{previewSign.signing_location}</p>
                </div>
                <div className="sm:col-span-2">
                  <span className="font-semibold text-foreground block">Movement Sequence:</span>
                  <p className="text-muted-foreground mt-0.5 leading-relaxed">{previewSign.movement_sequence}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">Speed:</span>
                  {[0.5, 1.0, 1.5].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => setSigningSpeed(speed)}
                      className={`px-2 py-0.5 rounded text-xs font-bold transition-colors ${
                        signingSpeed === speed
                          ? "bg-primary text-white"
                          : "bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => speakText(previewSign.meaning, currentLanguage)}
                  className="gap-1.5 text-xs text-primary hover:underline"
                >
                  <Volume2 className="h-3.5 w-3.5" />
                  <span>Pronounce Sign</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Filter & Search Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 self-start sm:self-auto">
            <span className="text-xs font-bold text-muted-foreground flex items-center gap-1 mr-1">
              <Filter className="h-3.5 w-3.5" />
              <span>Category:</span>
            </span>
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === "all"
                  ? "bg-primary text-white shadow-sm"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              All Categories ({VOCABULARY_SIGNS.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-cyan-600 text-white shadow-sm"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search sign or meaning..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-card border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Word Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredSigns.map((sign) => {
            const isSelected = previewSign.sign_id === sign.sign_id

            return (
              <div
                key={sign.sign_id}
                onClick={() => setPreviewSign(sign)}
                className={`group relative flex flex-col justify-between p-5 rounded-2xl bg-card border transition-all duration-200 cursor-pointer hover:shadow-xl hover:-translate-y-1 ${
                  isSelected
                    ? "border-cyan-500 ring-2 ring-cyan-500/40 shadow-lg bg-card/90"
                    : "border-border hover:border-cyan-500/50"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">
                      {sign.category}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" />
                      <span>Validated</span>
                    </span>
                  </div>

                  <h3 className="mt-3 text-lg font-bold text-foreground group-hover:text-cyan-400 transition-colors">
                    {sign.meaning}
                  </h3>
                  <div className="text-xs font-mono text-muted-foreground mt-0.5">
                    GLOSS: {sign.gloss}
                  </div>

                  <p className="mt-2.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {sign.hand_configuration}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-border/60 flex items-center justify-between">
                  <Link
                    to={`/learn/words/${sign.gloss.toLowerCase()}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs font-bold text-cyan-400 group-hover:underline flex items-center gap-1"
                  >
                    <span>Full Details</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      speakText(sign.meaning, currentLanguage)
                    }}
                    className="h-7 w-7 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
                    title="Pronounce"
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
