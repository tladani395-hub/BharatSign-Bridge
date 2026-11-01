import { ShieldCheck, Award, Database, BookOpen, Layers } from "lucide-react"

export interface BrandList {
  image: string
  lightimg?: string
  name: string
}

interface BrandSliderProps {
  brandList: BrandList[]
}

export default function BrandSlider({ brandList }: BrandSliderProps) {
  return (
    <section className="border-y border-border/50 bg-muted/30 py-8 overflow-hidden">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center mb-6">
          <p className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
            Research Datasets, Standards & Academic References Integrated
          </p>
        </div>

        {/* Brand slider / logo grid */}
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 lg:gap-16 opacity-85 hover:opacity-100 transition-opacity">
          {brandList.map((brand, index) => (
            <div
              key={index}
              className="group flex items-center gap-2.5 px-4 py-2 rounded-xl bg-card/60 border border-border/40 shadow-sm hover:border-primary/40 hover:shadow-md transition-all"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {index === 0 ? (
                  <Database className="h-4 w-4" />
                ) : index === 1 ? (
                  <BookOpen className="h-4 w-4" />
                ) : index === 2 ? (
                  <Award className="h-4 w-4" />
                ) : index === 3 ? (
                  <ShieldCheck className="h-4 w-4" />
                ) : (
                  <Layers className="h-4 w-4" />
                )}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                  {brand.name}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {index === 0
                    ? "INCLUDE (4,292 videos)"
                    : index === 1
                    ? "ISLRTC 10k Dictionary"
                    : index === 2
                    ? "ACL ISLTranslate (31k pairs)"
                    : index === 3
                    ? "ISH-NEWS Continuous"
                    : "MediaPipe Holistic AI"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
