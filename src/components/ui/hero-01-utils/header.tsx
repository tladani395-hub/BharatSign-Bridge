import * as React from "react"
import { Menu, Sparkles, Languages, BookOpen, Layers, Video, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export interface NavigationSection {
  title: string
  href: string
  isActive?: boolean
  badge?: string
}

interface HeaderProps {
  navigationData: NavigationSection[]
}

export default function Header({ navigationData }: HeaderProps) {
  const [selectedLang, setSelectedLang] = React.useState("EN")

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Tag */}
        <div className="flex items-center gap-3">
          <a href="#" className="flex items-center gap-2.5 group">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-0.5 shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950 text-white font-bold text-lg">
                <span className="bg-gradient-to-r from-cyan-400 to-indigo-300 bg-clip-text text-transparent">BS</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-foreground flex items-center gap-1.5">
                BharatSign<span className="text-primary font-extrabold">Bridge</span>
                <span className="inline-flex items-center rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary border border-primary/20">
                  ISL AI
                </span>
              </span>
              <span className="text-[11px] text-muted-foreground font-medium">
                Research & Communication Ecosystem
              </span>
            </div>
          </a>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navigationData.map((item) => (
            <a
              key={item.title}
              href={item.href}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors relative ${
                item.isActive
                  ? "text-primary bg-primary/10 font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              {item.title}
              {item.badge && (
                <span className="ml-1.5 rounded-full bg-cyan-500/10 px-1.5 py-0.2 text-[9px] font-semibold text-cyan-600 dark:text-cyan-400">
                  {item.badge}
                </span>
              )}
            </a>
          ))}
        </nav>

        {/* Actions & Language & Mobile Drawer */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Multilingual Selector Badge */}
          <div className="relative hidden sm:flex items-center gap-1 rounded-lg border border-border bg-card/60 px-2 py-1 text-xs font-medium text-muted-foreground shadow-sm">
            <Languages className="h-3.5 w-3.5 text-primary" />
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              className="bg-transparent text-xs font-medium text-foreground focus:outline-none cursor-pointer"
            >
              <option value="EN">English (EN)</option>
              <option value="HI">हिन्दी (Hindi)</option>
              <option value="GU">ગુજરાતી (Gujarati)</option>
              <option value="MR">मराठी (Marathi)</option>
              <option value="BN">বাংলা (Bengali)</option>
              <option value="TA">தமிழ் (Tamil)</option>
              <option value="TE">తెలుగు (Telugu)</option>
            </select>
          </div>

          <a href="#live-translator">
            <Button size="sm" variant="default" className="gap-1.5 shadow-sm shadow-primary/20 bg-primary hover:bg-primary/90 text-white font-medium">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Launch Studio</span>
            </Button>
          </a>

          {/* Mobile Sheet Drawer */}
          <div className="flex lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9">
                  <Menu className="h-4 w-4" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[350px]">
                <SheetHeader className="border-b pb-4 mb-4">
                  <SheetTitle className="text-left flex items-center gap-2 text-base font-bold">
                    <span className="text-primary">BharatSign</span>Bridge
                  </SheetTitle>
                  <p className="text-xs text-muted-foreground text-left">
                    Indian Sign Language AI Platform & Research Lab
                  </p>
                </SheetHeader>
                <div className="flex flex-col gap-2">
                  {navigationData.map((item) => (
                    <a
                      key={item.title}
                      href={item.href}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                        item.isActive
                          ? "bg-primary/10 text-primary font-semibold"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <span>{item.title}</span>
                      {item.badge && (
                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </a>
                  ))}
                  <div className="mt-4 pt-4 border-t border-border flex flex-col gap-2">
                    <div className="text-xs font-semibold text-muted-foreground mb-1">
                      Platform Modules
                    </div>
                    <a href="#live-translator" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary py-1">
                      <Video className="h-3.5 w-3.5 text-primary" /> Live ISL Recognition
                    </a>
                    <a href="#avatar-studio" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary py-1">
                      <Layers className="h-3.5 w-3.5 text-primary" /> 3D Digital Human Avatar
                    </a>
                    <a href="#learning-portal" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary py-1">
                      <BookOpen className="h-3.5 w-3.5 text-primary" /> ISL Learning Portal (A-Z, 0-9)
                    </a>
                    <a href="#research-lab" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary py-1">
                      <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Research Papers & Benchmarks
                    </a>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
