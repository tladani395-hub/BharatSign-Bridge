import Breadcrumbs from "@/components/layout/Breadcrumbs"
import LiveConversationRoom from "@/components/conversation/LiveConversationRoom"
import { MessageSquare, Globe2 } from "lucide-react"
import { INDIC_LANGUAGES } from "@/lib/speech"

interface ConversationProps {
  currentLanguage: string
  onLanguageChange?: (code: string) => void
}

export default function Conversation({ currentLanguage, onLanguageChange }: ConversationProps) {
  const langObj = INDIC_LANGUAGES.find((l) => l.code === currentLanguage) || INDIC_LANGUAGES[0]

  return (
    <div className="min-h-screen bg-background text-foreground py-8">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs
          items={[
            { label: "Communication Suite" },
            { label: "Two-Way Deaf ⇄ Hearing Live Room" },
          ]}
        />

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary border border-primary/20 mb-2">
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Bidirectional Multimodal Communication Bridge</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
              Two-Way Live Conversation Room
            </h1>
            <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
              Real-time dialogue between a deaf signer and a hearing speaker. Spoken voice is instantly translated into 3D ISL avatar signs, and signed gestures are spoken aloud in{" "}
              <strong>{langObj.name} ({langObj.native})</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground">Voice Language:</span>
            <div className="flex items-center gap-1.5 bg-card border border-border px-3 py-1.5 rounded-xl shadow-sm">
              <Globe2 className="h-4 w-4 text-primary shrink-0" />
              <select
                value={currentLanguage}
                onChange={(e) => onLanguageChange && onLanguageChange(e.target.value)}
                className="bg-transparent text-foreground text-xs font-bold cursor-pointer focus:outline-none"
              >
                {INDIC_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code} className="bg-card text-foreground">
                    {l.name} ({l.native})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Live Two-Way Communication Studio */}
        <div className="rounded-3xl overflow-hidden bg-card border border-border shadow-2xl p-6">
          <LiveConversationRoom currentLanguage={currentLanguage} />
        </div>
      </div>
    </div>
  )
}
