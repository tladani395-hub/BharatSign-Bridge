interface TelemetryEvent {
  city: string
  event: string
  metric: string
  icon: "check" | "zap" | "globe" | "sparkles"
}

const EVENTS: TelemetryEvent[] = [
  { city: "Ahmedabad", event: "Recognized 'NAMASTE' camera gesture", metric: "99.5% Conf", icon: "check" },
  { city: "Bengaluru", event: "Generated 3D Avatar Kinematics for 'વિદ્યાર્થી'", metric: "12ms Latency", icon: "zap" },
  { city: "Mumbai", event: "Two-way Hearing/Deaf Voice Room connected", metric: "Live Audio", icon: "globe" },
  { city: "New Delhi", event: "ISLRTC 26-Alphabet Quiz completed", metric: "Score 600", icon: "sparkles" },
  { city: "Kolkata", event: "60 FPS MediaPipe holistic landmarks tracked", metric: "0 Ghost Points", icon: "check" },
  { city: "Hyderabad", event: "Text translated into Telugu & ISL gloss", metric: "SOV Syntax", icon: "globe" },
  { city: "Chennai", event: "Speech synthesis active in தமிழ் (Tamil)", metric: "Native Audio", icon: "zap" },
  { city: "Jaipur", event: "MSJE Numeric Digit 0-9 practice room active", metric: "100% Accuracy", icon: "check" },
]

export default function NetworkMarquee() {
  return (
    <div className="w-full bg-slate-950/80 border-y border-cyan-500/20 py-2.5 overflow-hidden backdrop-blur-md">
      <div className="flex items-center animate-marquee whitespace-nowrap gap-8">
        {[...EVENTS, ...EVENTS].map((item, idx) => (
          <div
            key={idx}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-cyan-500/25 text-xs text-slate-300 shadow-sm"
          >
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="font-bold text-cyan-300 text-[11px]">{item.city}:</span>
            <span className="text-[11px] text-slate-300">{item.event}</span>
            <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 text-[10px] font-mono font-bold border border-cyan-500/30">
              {item.metric}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
