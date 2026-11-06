import LiveISLCameraStudio from "@/components/camera/LiveISLCameraStudio"
import Breadcrumbs from "@/components/layout/Breadcrumbs"
import { INDIC_LANGUAGES } from "@/lib/speech"
import { Globe } from "lucide-react"

interface LiveCameraProps {
  currentLanguage: string
  onLanguageChange?: (code: string) => void
}

export default function LiveCamera({ currentLanguage, onLanguageChange }: LiveCameraProps) {
  const langObj = INDIC_LANGUAGES.find((l) => l.code === currentLanguage) || INDIC_LANGUAGES[0]

  return (
    <div className="min-h-screen bg-background text-foreground py-8">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs
          items={[
            { label: "Communication Suite" },
            { label: "Live Webcam Gesture Recognition" },
          ]}
        />

        {/* Studio Title Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-500 border border-emerald-500/20 mb-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>MediaPipe Holistic & Spatial-Temporal Classifier</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
              Live AI Indian Sign Language Studio
            </h1>
            <p className="mt-1 text-sm text-muted-foreground max-w-3xl">
              Real-time 21-joint dual hand tracking, 33-joint body pose, and facial non-manual marker recognition.
              Predictions are classified with sub-50ms latency and spoken aloud in{" "}
              <strong className="text-foreground">{langObj.name} ({langObj.native})</strong>.
            </p>
          </div>

          {/* Quick Voice & Sentence Language Selector */}
          <div className="flex items-center gap-2 self-start md:self-end bg-card border border-border p-2 rounded-2xl shadow-sm">
            <Globe className="h-4 w-4 text-primary shrink-0" />
            <span className="text-xs font-bold text-muted-foreground whitespace-nowrap">Voice & Sentence Language:</span>
            <select
              value={currentLanguage}
              onChange={(e) => onLanguageChange && onLanguageChange(e.target.value)}
              className="bg-muted text-foreground text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary border border-border"
            >
              {INDIC_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.name} ({l.native})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Live Camera Studio Component (Pure ML & Webcam, No Avatar) */}
        <LiveISLCameraStudio
          selectedLanguage={currentLanguage}
          onLanguageChange={onLanguageChange}
        />
      </div>
    </div>
  )
}
