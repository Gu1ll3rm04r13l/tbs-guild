"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useCallback } from "react";
import { Menu, X, Flame, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/LanguageProvider";
import { t } from "@/lib/i18n";

// ─── Smooth scroll utility (easeInOutSine, 800ms) ────────────────────────────
function smoothScroll(targetY: number) {
  const start = window.scrollY;
  if (Math.abs(start - targetY) < 2) return;
  const duration = 800;
  const startTime = performance.now();
  function ease(t: number) { return -(Math.cos(Math.PI * t) - 1) / 2; }
  function step(now: number) {
    const progress = Math.min((now - startTime) / duration, 1);
    window.scrollTo(0, start + (targetY - start) * ease(progress));
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function slowScrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  smoothScroll(el.getBoundingClientRect().top + window.scrollY - 60);
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const { lang, setLang } = useLanguage();
  const T = t[lang];

  const handleLogoClick = useCallback((e: React.MouseEvent) => {
    if (window.location.pathname === "/") { e.preventDefault(); smoothScroll(0); }
  }, []);

  const handleAboutClick = useCallback((e: React.MouseEvent) => {
    if (window.location.pathname === "/") { e.preventDefault(); slowScrollToId("about"); }
    setMobileOpen(false);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-[#2a2318] bg-[#080706]/95 backdrop-blur-sm">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-[#E8560A] to-transparent opacity-60" />

      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">

        {/* ── Logo ── */}
        <div className="flex items-center gap-4">
          <Link href="/" onClick={handleLogoClick} className="flex items-center gap-2.5 shrink-0 group">
            <div className="relative h-9 w-9 transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(232,86,10,0.8)]">
              <Image src="/logo.png" alt="The Burning Seagull" fill className="object-contain" sizes="36px" priority
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
              <Flame className="absolute inset-0 m-auto h-5 w-5 text-[#E8560A] logo-fallback" />
            </div>
            <div className="hidden sm:block">
              <span className="text-sm font-bold tracking-tight fire-text">The Burning Seagull</span>
              <p className="text-[10px] text-[#6b5e50] font-mono tracking-widest -mt-0.5">RAGNAROS · US</p>
            </div>
          </Link>
        </div>

        {/* ── Nav links (desktop) ── */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/#about"
            onClick={handleAboutClick}
            className="rounded px-3 py-1.5 text-sm text-[#b8a898] hover:text-[#f5efe8] hover:bg-[#1a1710] transition-colors"
          >
            {T.nav.about}
          </Link>
        </nav>

        {/* ── Right side: lang toggle ── */}
        <div className="flex items-center gap-3">

          {/* Language toggle — globe dropdown */}
          <div className="relative">
            <button
              onClick={() => setLangOpen((v) => !v)}
              className={cn(
                "flex items-center gap-1.5 rounded border px-2 py-1 text-[11px] font-mono uppercase tracking-widest transition-colors",
                langOpen
                  ? "border-[#2a2318] text-[#6b5e50]"
                  : "border-[#E8560A]/40 text-[#E8560A] hover:border-[#E8560A]/70"
              )}
              aria-label="Language"
            >
              <Globe className="h-3 w-3" />
              {lang}
            </button>
            {langOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
                <div className="absolute right-0 mt-1.5 w-32 rounded-lg border border-[#2a2318] bg-[#0e0c09] shadow-xl z-50 overflow-hidden py-1">
                  {([["es", "Español"], ["en", "English"]] as const).map(([code, label]) => (
                    <button
                      key={code}
                      onClick={() => { setLang(code); setLangOpen(false); }}
                      className={cn(
                        "flex w-full items-center justify-between px-3 py-1.5 text-xs transition-colors",
                        lang === code
                          ? "text-[#E8560A] bg-[#E8560A]/8"
                          : "text-[#b8a898] hover:bg-[#1a1710] hover:text-[#f5efe8]"
                      )}
                    >
                      {label}
                      {lang === code && <span className="text-[9px] font-mono text-[#E8560A]">✓</span>}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-[#6b5e50] hover:text-[#f5efe8]"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile nav ── */}
      {mobileOpen && (
        <nav className="md:hidden border-t border-[#2a2318] bg-[#080706] px-4 py-3 space-y-1">
          <Link
            href="/#about"
            onClick={handleAboutClick}
            className="block rounded px-3 py-2 text-sm text-[#b8a898] hover:bg-[#1a1710] hover:text-[#f5efe8]"
          >
            {T.nav.about}
          </Link>
        </nav>
      )}
    </header>
  );
}
