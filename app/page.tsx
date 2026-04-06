"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Shield, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/LanguageProvider";
import { t } from "@/lib/i18n";

const PLATFORMS = [
  {
    key: "rio" as const,
    name: "Raider.io",
    href: "https://raider.io/guilds/us/ragnaros/The%20Burning%20Seagull",
    accent: "#1BABE4",
    icon: <Shield className="h-5 w-5" />,
  },
  {
    key: "wcl" as const,
    name: "WarcraftLogs",
    href: "https://www.warcraftlogs.com/guild/us/ragnaros/the%20burning%20seagull",
    accent: "#E8560A",
    icon: <BarChart2 className="h-5 w-5" />,
  },
];

export default function HomePage() {
  const { lang } = useLanguage();
  const T = t[lang];

  return (
    <div>
      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section className="relative min-h-[100vh] flex items-center overflow-hidden">

        {/* Background: guild emblem */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#080706]" />
          <Image
            src="/Fiery emblem of The Burning Seagull.png"
            alt="The Burning Seagull emblem"
            fill
            className="object-contain object-right"
            priority
            sizes="100vw"
            style={{ opacity: 0.85 }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#080706] via-[#080706]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080706] via-transparent to-[#080706]/60" />
        </div>

        {/* Ember particles */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          {[...Array(30)].map((_, i) => {
            const colors = ["#E8560A", "#F0B830", "#C41A00", "#FF6B00", "#D4960A"];
            return (
              <div
                key={i}
                className="ember-particle absolute rounded-full"
                style={{
                  width: `${1.2 + (i % 5) * 0.7}px`,
                  height: `${1.2 + (i % 5) * 0.7}px`,
                  background: colors[i % colors.length],
                  left: `${(i * 3.17 + 2) % 95}%`,
                  bottom: `${5 + (i * 5.3) % 42}%`,
                  animationDuration: `${2.4 + (i * 0.41) % 2.8}s`,
                  animationDelay: `${(i * 0.23) % 4}s`,
                  opacity: 0.45 + (i % 4) * 0.14,
                }}
              />
            );
          })}
        </div>

        {/* Hero content */}
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 py-20 w-full">
          <div className="max-w-xl space-y-6">

            <div className="flex items-center gap-2">
              <div className="h-px w-8 bg-gradient-to-r from-[#E8560A] to-transparent" />
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#E8560A]">
                {T.hero.eyebrow}
              </span>
            </div>

            <div className="space-y-1">
              <h1 className="text-5xl sm:text-6xl font-black tracking-tight leading-none text-white">THE</h1>
              <h1 className="text-5xl sm:text-6xl font-black tracking-tight leading-none fire-text">BURNING</h1>
              <h1 className="text-5xl sm:text-6xl font-black tracking-tight leading-none text-white">SEAGULL</h1>
            </div>

            <p className="text-[#b8a898] text-base leading-relaxed max-w-sm">
              {T.hero.description}
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button asChild size="lg">
                <Link href="/apply">
                  {T.hero.applyCta} <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/roster">{T.hero.rosterCta}</Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#080706] to-transparent z-10" />
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 pb-24 pt-24">

        {/* ══════════════════════════════════════════
            ABOUT US
        ══════════════════════════════════════════ */}
        <section id="about" className="scroll-mt-20">

          <div className="flex items-center gap-3 mb-12">
            <div className="h-px w-6 bg-[#E8560A]" />
            <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-[#6b5e50]">
              {T.about.sectionLabel}
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-[#3d3220] to-transparent" />
          </div>

          {/* Narrative + Values */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16">

            <div className="lg:col-span-3 space-y-5">
              <h3 className="text-2xl sm:text-3xl font-bold text-[#f5efe8] leading-snug">
                {T.about.heading1}<br />
                <span className="fire-text">{T.about.heading2}</span>
              </h3>
              <div className="space-y-4 text-[#b8a898] leading-relaxed">
                <p>{T.about.p1}</p>
                <p>{T.about.p2}</p>
                <p>{T.about.p3}</p>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-3">
              {T.about.values.map((v) => (
                <div key={v.title} className="rounded-lg border border-[#2a2318] bg-[#111009] p-5">
                  <div className="flex items-start gap-3">
                    <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#E8560A] shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-[#f5efe8]">{v.title}</p>
                      <p className="text-sm text-[#6b5e50] mt-1 leading-relaxed">{v.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Platform Links */}
          <div className="mt-14 space-y-3">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-4 bg-[#3d3220]" />
              <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#3d3220]">
                {T.about.findUsAt}
              </p>
            </div>

            {PLATFORMS.map((p) => (
              <a
                key={p.name}
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center overflow-hidden rounded-lg border border-[#2a2318] bg-[#111009] transition-all duration-300 hover:-translate-y-px"
                style={{ "--platform-accent": p.accent } as React.CSSProperties}
              >
                {/* Icon column */}
                <div className="relative shrink-0 flex items-center justify-center w-16 self-stretch border-r border-[#2a2318] transition-colors duration-300 group-hover:border-[color:var(--platform-accent)]/20">
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: `linear-gradient(135deg, ${p.accent}18, transparent)` }}
                  />
                  <span className="relative text-[#3d3220] transition-colors duration-300 group-hover:text-[color:var(--platform-accent)]">
                    {p.icon}
                  </span>
                </div>

                {/* Content */}
                <div className="flex flex-1 items-center px-5 py-4 gap-4 min-w-0">
                  <div className="space-y-0.5 shrink-0">
                    <p className="text-sm font-bold text-[#f5efe8]">{p.name}</p>
                    <p className="text-[10px] font-mono text-[#6b5e50] tracking-wide">
                      {p.key === "rio" ? T.about.rioTagline : T.about.wclTagline}
                    </p>
                  </div>
                  <div
                    className="h-px flex-1 hidden sm:block"
                    style={{ background: `linear-gradient(to right, ${p.accent}40, transparent)` }}
                  />
                  <p className="text-xs text-[#6b5e50] hidden md:block shrink-0">
                    {p.key === "rio" ? T.about.rioDesc : T.about.wclDesc}
                  </p>
                  <ArrowRight
                    className="h-4 w-4 shrink-0 ml-auto sm:ml-0 transition-all duration-300 group-hover:translate-x-1"
                    style={{ color: "#3d3220" }}
                  />
                </div>

                {/* Bottom accent line slide-in */}
                <div
                  className="absolute bottom-0 left-0 h-px w-0 group-hover:w-full transition-all duration-500"
                  style={{ backgroundColor: p.accent, opacity: 0.4 }}
                />
              </a>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
