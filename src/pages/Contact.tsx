import { useState } from "react"
import { Mail, Send, CheckCircle2, ShieldCheck, Building } from "lucide-react"
import Breadcrumbs from "@/components/layout/Breadcrumbs"
import { Button } from "@/components/ui/button"

export default function Contact() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [organization, setOrganization] = useState("")
  const [message, setMessage] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-8">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 flex flex-col gap-8">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs items={[{ label: "Contact & Collaboration" }]} />

        {/* Header */}
        <div className="border-b border-border pb-6">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary border border-primary/20 mb-3">
            <Building className="h-3.5 w-3.5" />
            <span>Academic & Institutional Partnership</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            Contact & University Collaboration
          </h1>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Interested in demonstrating BharatSign Bridge at your university, deploying our ISL models in educational centers, or collaborating on dataset validation? Reach out below.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left: Contact Form */}
          <div className="md:col-span-7">
            <div className="p-6 rounded-3xl bg-card border border-border shadow-md">
              {submitted ? (
                <div className="p-6 flex flex-col items-center text-center gap-3">
                  <div className="h-14 w-14 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Message Dispatched!</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Thank you for reaching out. Our research team will review your inquiry and follow up within 24 to 48 hours.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSubmitted(false)}
                    className="mt-2 text-xs"
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
                  <div>
                    <label className="font-bold text-foreground block mb-1">Your Full Name:</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Prof. Rajesh Sharma"
                      className="w-full p-2.5 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-foreground block mb-1">Email Address:</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="rajesh.sharma@university.ac.in"
                      className="w-full p-2.5 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-foreground block mb-1">
                      Institution / Organization:
                    </label>
                    <input
                      type="text"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      placeholder="Department of Computer Science, University"
                      className="w-full p-2.5 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-foreground block mb-1">Your Message:</label>
                    <textarea
                      rows={4}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Describe your research proposal, university demo schedule, or collaboration scope..."
                      className="w-full p-2.5 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full mt-2 gap-2 text-xs font-bold bg-primary hover:bg-primary/90 text-white shadow-md"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Submit Inquiry</span>
                  </Button>
                </form>
              )}
            </div>
          </div>

          {/* Right: Institutional Details */}
          <div className="md:col-span-5 flex flex-col gap-4 text-xs">
            <div className="p-5 rounded-2xl bg-card border border-border flex flex-col gap-3">
              <span className="font-bold text-foreground text-sm">Research Consortium Hub</span>
              <p className="text-muted-foreground leading-relaxed">
                BharatSign Bridge AI Research Consortium. Working in coordination with deaf schools, disability advocacy groups, and universities.
              </p>
              <div className="flex items-center gap-2 text-muted-foreground pt-2 border-t border-border">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <span>contact@bharatsign-bridge.org</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-cyan-950/20 border border-cyan-800/40 text-cyan-300 flex flex-col gap-2">
              <span className="font-bold flex items-center gap-1.5 text-cyan-400">
                <ShieldCheck className="h-4 w-4" /> Academic Presentations
              </span>
              <p className="text-[11px] leading-relaxed opacity-90">
                Academic institutions may request our live presentation deck, offline MediaPipe model checkpoints, and experimental benchmark logs for conference demos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
