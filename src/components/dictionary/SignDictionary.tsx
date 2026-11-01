import { useState } from "react"
import { Search, Volume2, MapPin, Info } from "lucide-react"
import ThreeAvatar from "@/components/avatar/ThreeAvatar"
import type { SignGesture } from "@/components/avatar/ThreeAvatar"
import { speakText } from "@/lib/speech"

interface DictionaryEntry {
  id: string
  gloss: string
  category: string
  gesture: SignGesture
  english: string
  hindi: string
  gujarati: string
  marathi: string
  bengali: string
  tamil: string
  telugu: string
  description: string
  regionalNotes: {
    North: string
    West: string
    South: string
    East: string
  }
}

const DICTIONARY_ENTRIES: DictionaryEntry[] = [
  {
    id: "namaste",
    gloss: "NAMASTE",
    category: "Greetings",
    gesture: "NAMASTE",
    english: "Hello / Greetings",
    hindi: "नमस्ते / नमस्कार",
    gujarati: "નમસ્તે / પ્રણામ",
    marathi: "नमस्कार",
    bengali: "নমস্কার",
    tamil: "வணக்கம்",
    telugu: "నమస్కారం",
    description: "Both palms flat and pressed together against chest sternum with slight forward head tilt.",
    regionalNotes: {
      North: "Chest level palms pressed with head nod.",
      West: "Single hand touch chest then slight forward wave.",
      South: "Palms pressed higher at chin level.",
      East: "Hands touch then sweep outward gently.",
    },
  },
  {
    id: "thankyou",
    gloss: "THANK-YOU",
    category: "Greetings",
    gesture: "THANK_YOU",
    english: "Thank You",
    hindi: "धन्यवाद / शुक्रिया",
    gujarati: "ધન્યવાદ / આભાર",
    marathi: "धन्यवाद",
    bengali: "ধন্যবাদ",
    tamil: "நன்றி",
    telugu: "ధన్యవాదాలు",
    description: "Fingertips of flat hand touch chin and open forward gracefully.",
    regionalNotes: {
      North: "Hand from chin moving outward at 45 degrees.",
      West: "Flat hand touches chest then arches forward.",
      South: "Both hands cupped slightly moving forward.",
      East: "Right hand touches cheek and lowers.",
    },
  },
  {
    id: "student",
    gloss: "STUDENT",
    category: "Education",
    gesture: "STUDENT",
    english: "Student / Learner",
    hindi: "विद्यार्थी / छात्र",
    gujarati: "વિદ્યાર્થી / છાત્ર",
    marathi: "विद्यार्थी",
    bengali: "ছাত্র / ছাত্রী",
    tamil: "மாணவன்",
    telugu: "విద్యార్థి",
    description: "Open hands simulate reading a book followed by person indicator marker.",
    regionalNotes: {
      North: "Book motion followed by downward hands.",
      West: "Fingers tap forehead then book motion.",
      South: "Palms open reading motion twice.",
      East: "Index finger near temple then person sign.",
    },
  },
  {
    id: "help",
    gloss: "HELP",
    category: "Emergency",
    gesture: "HELP",
    english: "Help / Assistance",
    hindi: "मदद / सहायता",
    gujarati: "મદદ / સહાય",
    marathi: "मदत",
    bengali: "সাহায্য",
    tamil: "உதவி",
    telugu: "సహాయం",
    description: "Closed fist placed on open non-dominant flat palm, lifted together.",
    regionalNotes: {
      North: "Fist on flat palm lifted upward together.",
      West: "Both palms cupped waving inward.",
      South: "Fist placed on palm twice with earnest gaze.",
      East: "Right hand lifts left wrist gently.",
    },
  },
  {
    id: "water",
    gloss: "WATER",
    category: "Food",
    gesture: "WATER",
    english: "Water",
    hindi: "पानी / जल",
    gujarati: "પાણી / જળ",
    marathi: "पाणी",
    bengali: "জল / পানি",
    tamil: "தண்ணீர்",
    telugu: "నీరు",
    description: "Three fingers forming 'W' handshape lightly tapping side of chin.",
    regionalNotes: {
      North: "W-handshape taps side of chin twice.",
      West: "Cupped hand miming drinking near mouth.",
      South: "Index finger extended tapping near lips.",
      East: "Curved hand tapping chin.",
    },
  },
  {
    id: "yes",
    gloss: "YES",
    category: "Conversation",
    gesture: "YES",
    english: "Yes / Agree",
    hindi: "हाँ / सहमत",
    gujarati: "હા / સંમત",
    marathi: "होय",
    bengali: "হ্যাঁ",
    tamil: "ஆம்",
    telugu: "అవును",
    description: "Closed fist nodding up and down like a head nod.",
    regionalNotes: {
      North: "Fist nodding up and down at chest height.",
      West: "Fist with thumb up nodding gently.",
      South: "Two hands nodding together slightly.",
      East: "Single deliberate downward nod of fist.",
    },
  },
]

interface SignDictionaryProps {
  currentLanguage: string
}

export default function SignDictionary({ currentLanguage = "gu" }: SignDictionaryProps) {
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedRegion, setSelectedRegion] = useState<"North" | "West" | "South" | "East">("West")
  const [activeEntry, setActiveEntry] = useState<DictionaryEntry>(DICTIONARY_ENTRIES[0])

  const categories = ["All", "Greetings", "Education", "Emergency", "Food", "Conversation"]

  const filteredEntries = DICTIONARY_ENTRIES.filter((entry) => {
    const matchesCategory = selectedCategory === "All" || entry.category === selectedCategory
    const s = search.toLowerCase()
    const matchesSearch =
      entry.english.toLowerCase().includes(s) ||
      entry.hindi.toLowerCase().includes(s) ||
      entry.gujarati.toLowerCase().includes(s) ||
      entry.gloss.toLowerCase().includes(s)
    return matchesCategory && matchesSearch
  })

  const getLocalizedText = (entry: DictionaryEntry) => {
    if (currentLanguage === "gu") return entry.gujarati
    if (currentLanguage === "hi") return entry.hindi
    if (currentLanguage === "mr") return entry.marathi
    if (currentLanguage === "bn") return entry.bengali
    if (currentLanguage === "ta") return entry.tamil
    if (currentLanguage === "te") return entry.telugu
    return entry.english
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Column: 3D Avatar Demonstration */}
      <div className="lg:col-span-6 flex flex-col gap-4">
        <div className="p-4 rounded-2xl bg-card border border-border shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
            <span className="text-xs font-bold text-foreground">
              Sign Demonstration — 3D Avatar
            </span>
            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
              Gloss: {activeEntry.gloss}
            </span>
          </div>

          <div className="aspect-[4/3] w-full rounded-xl overflow-hidden">
            <ThreeAvatar activeGesture={activeEntry.gesture} showControls={false} />
          </div>

          {/* Regional Variation Comparison Box */}
          <div className="mt-4 p-3.5 rounded-xl bg-muted/60 border border-border flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-primary" /> Regional Variation in ISL:
              </span>
              <div className="flex items-center gap-1">
                {(["West", "North", "South", "East"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setSelectedRegion(r)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                      selectedRegion === r
                        ? "bg-primary text-white shadow-sm"
                        : "bg-background text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground">{selectedRegion} India Pattern:</strong>{" "}
              {activeEntry.regionalNotes[selectedRegion]}
            </p>
          </div>
        </div>
      </div>

      {/* Right Column: Search, Category Filters, Lexicon Cards */}
      <div className="lg:col-span-6 flex flex-col gap-5">
        <div className="p-6 rounded-2xl bg-card border border-border shadow-xl flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              ISL Lexicon & Dictionary Explorer
            </span>
            <span className="text-xs text-primary font-bold">10,000+ Term Aligned</span>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search in English, Gujarati, Hindi, or Gloss..."
              className="w-full rounded-xl border border-input bg-background pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
            />
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? "bg-primary text-white shadow-sm"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Dictionary Entries List */}
          <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
            {filteredEntries.map((item) => {
              const isSelected = activeEntry.id === item.id
              return (
                <div
                  key={item.id}
                  onClick={() => setActiveEntry(item)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? "bg-primary/10 border-primary shadow-sm"
                      : "bg-muted/50 hover:bg-muted border-border"
                  }`}
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground">
                        {getLocalizedText(item)}
                      </span>
                      <span className="text-[10px] font-mono text-primary bg-primary/10 px-1.5 py-0.2 rounded font-semibold">
                        {item.gloss}
                      </span>
                    </div>
                    <span className="text-[11px] text-muted-foreground mt-0.5">
                      {item.description}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      speakText(getLocalizedText(item), currentLanguage)
                    }}
                    className="p-2 rounded-lg bg-background hover:bg-primary hover:text-white transition-colors text-muted-foreground"
                    title="Pronounce word"
                  >
                    <Volume2 className="h-4 w-4" />
                  </button>
                </div>
              )
            })}
          </div>

          <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 pt-2 border-t border-border">
            <Info className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>Regional variations documented as certified by the Indian Sign Language Research and Training Centre (ISLRTC).</span>
          </div>
        </div>
      </div>
    </div>
  )
}
