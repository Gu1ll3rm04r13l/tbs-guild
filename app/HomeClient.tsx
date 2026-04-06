"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Shield, BarChart2, Pencil, X, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/LanguageProvider";
import type { HomeContentData } from "@/lib/guild-info";

// ─── Styles ───────────────────────────────────────────────────────────────────

const inputCls =
  "w-full bg-[#080706] border border-[#2a2318] rounded px-2.5 py-1.5 text-xs text-[#f5efe8] " +
  "placeholder-[#3d3220] focus:outline-none focus:border-[#E8560A]/50 transition-colors";
const textareaCls = inputCls + " resize-y min-h-[80px] leading-relaxed";
const labelCls = "text-[10px] font-mono uppercase tracking-wider text-[#6b5e50] mb-1 block";

// ─── API helper ───────────────────────────────────────────────────────────────

async function saveHomeContent(value: HomeContentData): Promise<boolean> {
  try {
    const res = await fetch("/api/guild-info/home_content", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(value),
    });
    return res.ok;
  } catch { return false; }
}

// ─── EditBar ──────────────────────────────────────────────────────────────────

function EditBar({
  editing, saving, onEdit, onSave, onCancel,
}: {
  editing: boolean; saving: boolean;
  onEdit: () => void; onSave: () => void; onCancel: () => void;
}) {
  if (!editing) {
    return (
      <button
        onClick={onEdit}
        className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 p-1 rounded text-[#6b5e50] hover:text-[#F0B830] hover:bg-[#1a1710]"
        title="Editar"
      >
        <Pencil className="h-3 w-3" />
      </button>
    );
  }
  return (
    <div className="flex items-center gap-1 ml-2">
      <button
        onClick={onSave}
        disabled={saving}
        className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-[#E8560A]/10 border border-[#E8560A]/30 text-[#E8560A] hover:bg-[#E8560A]/20 transition-colors disabled:opacity-50"
      >
        {saving ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : <Check className="h-2.5 w-2.5" />}
        Guardar
      </button>
      <button
        onClick={onCancel}
        className="p-1 rounded text-[#6b5e50] hover:text-[#f5efe8] hover:bg-[#1a1710]"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

// ─── Platforms ────────────────────────────────────────────────────────────────

const PLATFORMS = [
  { key: "rio" as const, name: "Raider.io",    href: "https://raider.io/guilds/us/ragnaros/The%20Burning%20Seagull",                   accent: "#1BABE4", icon: <Shield   className="h-5 w-5" /> },
  { key: "wcl" as const, name: "WarcraftLogs", href: "https://www.warcraftlogs.com/guild/us/ragnaros/the%20burning%20seagull", accent: "#E8560A", icon: <BarChart2 className="h-5 w-5" /> },
];

// ─── Main component ───────────────────────────────────────────────────────────

export function HomeClient({
  content: initial,
  isOfficer,
}: {
  content: HomeContentData;
  isOfficer: boolean;
}) {
  const { lang } = useLanguage();
  const L = lang; // "es" | "en"

  // ── State ─────────────────────────────────────────────────────────────────
  const [content, setContent]   = useState(initial);
  const [heroEdit, setHeroEdit] = useState(false);
  const [heroDraft, setHeroDraft] = useState(initial);
  const [heroSaving, setHeroSaving] = useState(false);

  const [aboutEdit, setAboutEdit] = useState(false);
  const [aboutDraft, setAboutDraft] = useState(initial);
  const [aboutSaving, setAboutSaving] = useState(false);

  const [valEdit, setValEdit]   = useState(false);
  const [valDraft, setValDraft] = useState(initial);
  const [valSaving, setValSaving] = useState(false);

  const [linkEdit, setLinkEdit]   = useState(false);
  const [linkDraft, setLinkDraft] = useState(initial);
  const [linkSaving, setLinkSaving] = useState(false);

  // ── Helpers ───────────────────────────────────────────────────────────────
  async function doSave(
    draft: HomeContentData,
    setSaving: (v: boolean) => void,
    setEdit: (v: boolean) => void,
  ) {
    setSaving(true);
    const merged = { ...content, ...draft };
    const ok = await saveHomeContent(merged);
    if (ok) { setContent(merged); setEdit(false); }
    setSaving(false);
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div>

      {/* ══ HERO ══════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[100vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#080706]" />
          <Image src="/Fiery emblem of The Burning Seagull.png" alt="emblem" fill className="object-contain object-right" priority sizes="100vw" style={{ opacity: 0.85 }} />
          <div className="absolute inset-0 bg-gradient-to-r from-[#080706] via-[#080706]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080706] via-transparent to-[#080706]/60" />
        </div>

        {/* Ember particles */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          {[...Array(30)].map((_, i) => {
            const colors = ["#E8560A", "#F0B830", "#C41A00", "#FF6B00", "#D4960A"];
            return (
              <div key={i} className="ember-particle absolute rounded-full" style={{
                width: `${1.2 + (i % 5) * 0.7}px`, height: `${1.2 + (i % 5) * 0.7}px`,
                background: colors[i % colors.length],
                left: `${(i * 3.17 + 2) % 95}%`, bottom: `${5 + (i * 5.3) % 42}%`,
                animationDuration: `${2.4 + (i * 0.41) % 2.8}s`, animationDelay: `${(i * 0.23) % 4}s`,
                opacity: 0.45 + (i % 4) * 0.14,
              }} />
            );
          })}
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 py-20 w-full">
          <div className="max-w-xl space-y-6">

            {/* Eyebrow */}
            <div className="group flex items-center gap-2">
              <div className="h-px w-8 bg-gradient-to-r from-[#E8560A] to-transparent" />
              {heroEdit ? (
                <input
                  className={inputCls + " text-[11px] font-mono uppercase tracking-[0.2em]"}
                  value={heroDraft.hero_eyebrow[L]}
                  onChange={(e) => setHeroDraft((d) => ({ ...d, hero_eyebrow: { ...d.hero_eyebrow, [L]: e.target.value } }))}
                />
              ) : (
                <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#E8560A]">
                  {content.hero_eyebrow[L]}
                </span>
              )}
              {isOfficer && <EditBar editing={heroEdit} saving={heroSaving}
                onEdit={() => { setHeroDraft(content); setHeroEdit(true); }}
                onSave={() => doSave(heroDraft, setHeroSaving, setHeroEdit)}
                onCancel={() => setHeroEdit(false)} />}
            </div>

            <div className="space-y-1">
              <h1 className="text-5xl sm:text-6xl font-black tracking-tight leading-none text-white">THE</h1>
              <h1 className="text-5xl sm:text-6xl font-black tracking-tight leading-none fire-text">BURNING</h1>
              <h1 className="text-5xl sm:text-6xl font-black tracking-tight leading-none text-white">SEAGULL</h1>
            </div>

            {/* Description */}
            <div className="group">
              {heroEdit ? (
                <textarea
                  className={textareaCls}
                  value={heroDraft.hero_description[L]}
                  onChange={(e) => setHeroDraft((d) => ({ ...d, hero_description: { ...d.hero_description, [L]: e.target.value } }))}
                />
              ) : (
                <p className="text-[#b8a898] text-base leading-relaxed max-w-sm">
                  {content.hero_description[L]}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button asChild size="lg"><Link href="/apply">Postúlate <ArrowRight className="h-4 w-4" /></Link></Button>
              <Button asChild variant="outline" size="lg"><Link href="/roster">Ver Roster</Link></Button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#080706] to-transparent z-10" />
      </section>

      {/* ══ ABOUT ═════════════════════════════════════════════════════════════ */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pb-24 pt-24">
        <section id="about" className="scroll-mt-20">

          <div className="flex items-center gap-3 mb-12">
            <div className="h-px w-6 bg-[#E8560A]" />
            <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-[#6b5e50]">
              {L === "es" ? "Sobre Nosotros" : "About Us"}
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-[#3d3220] to-transparent" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16">

            {/* Left: headings + paragraphs */}
            <div className="lg:col-span-3 space-y-5">
              <div className="group flex items-start gap-1">
                <h3 className="text-2xl sm:text-3xl font-bold text-[#f5efe8] leading-snug flex-1">
                  {aboutEdit ? (
                    <div className="space-y-2">
                      <input className={inputCls} value={aboutDraft.about_heading1[L]}
                        onChange={(e) => setAboutDraft((d) => ({ ...d, about_heading1: { ...d.about_heading1, [L]: e.target.value } }))} />
                      <input className={inputCls} value={aboutDraft.about_heading2[L]}
                        onChange={(e) => setAboutDraft((d) => ({ ...d, about_heading2: { ...d.about_heading2, [L]: e.target.value } }))} />
                    </div>
                  ) : (
                    <>{content.about_heading1[L]}<br /><span className="fire-text">{content.about_heading2[L]}</span></>
                  )}
                </h3>
                {isOfficer && <EditBar editing={aboutEdit} saving={aboutSaving}
                  onEdit={() => { setAboutDraft(content); setAboutEdit(true); }}
                  onSave={() => doSave(aboutDraft, setAboutSaving, setAboutEdit)}
                  onCancel={() => setAboutEdit(false)} />}
              </div>

              <div className="space-y-4 text-[#b8a898] leading-relaxed">
                {(["about_p1", "about_p2", "about_p3"] as const).map((key) => (
                  aboutEdit ? (
                    <textarea key={key} className={textareaCls}
                      value={aboutDraft[key][L]}
                      onChange={(e) => setAboutDraft((d) => ({ ...d, [key]: { ...d[key], [L]: e.target.value } }))} />
                  ) : (
                    <p key={key}>{content[key][L]}</p>
                  )
                ))}
              </div>
            </div>

            {/* Right: value cards */}
            <div className="group lg:col-span-2 space-y-3">
              {isOfficer && (
                <div className="flex justify-end h-4">
                  <EditBar editing={valEdit} saving={valSaving}
                    onEdit={() => { setValDraft(content); setValEdit(true); }}
                    onSave={() => doSave(valDraft, setValSaving, setValEdit)}
                    onCancel={() => setValEdit(false)} />
                </div>
              )}
              {content.about_values.map((v, i) => (
                <div key={i} className="rounded-lg border border-[#2a2318] bg-[#111009] p-5">
                  <div className="flex items-start gap-3">
                    <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#E8560A] shrink-0" />
                    <div className="flex-1 min-w-0">
                      {valEdit ? (
                        <div className="space-y-1.5">
                          <input className={inputCls} value={valDraft.about_values[i]?.title[L] ?? ""}
                            onChange={(e) => setValDraft((d) => {
                              const vals = d.about_values.map((vv, ii) =>
                                ii === i ? { ...vv, title: { ...vv.title, [L]: e.target.value } } : vv
                              );
                              return { ...d, about_values: vals };
                            })} />
                          <textarea className={textareaCls + " min-h-[56px]"} value={valDraft.about_values[i]?.desc[L] ?? ""}
                            onChange={(e) => setValDraft((d) => {
                              const vals = d.about_values.map((vv, ii) =>
                                ii === i ? { ...vv, desc: { ...vv.desc, [L]: e.target.value } } : vv
                              );
                              return { ...d, about_values: vals };
                            })} />
                        </div>
                      ) : (
                        <>
                          <p className="text-sm font-semibold text-[#f5efe8]">{v.title[L]}</p>
                          <p className="text-sm text-[#6b5e50] mt-1 leading-relaxed">{v.desc[L]}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Platform links */}
          <div className="mt-14 space-y-3">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-4 bg-[#3d3220]" />
              <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#3d3220]">
                {L === "es" ? "Encuéntranos en" : "Find us at"}
              </p>
              {isOfficer && <EditBar editing={linkEdit} saving={linkSaving}
                onEdit={() => { setLinkDraft(content); setLinkEdit(true); }}
                onSave={() => doSave(linkDraft, setLinkSaving, setLinkEdit)}
                onCancel={() => setLinkEdit(false)} />}
            </div>

            {PLATFORMS.map((p) => {
              const tagline = p.key === "rio" ? content.rio_tagline[L] : content.wcl_tagline[L];
              const desc    = p.key === "rio" ? content.rio_desc[L]    : content.wcl_desc[L];
              const taglineKey = p.key === "rio" ? "rio_tagline" : "wcl_tagline" as const;
              const descKey    = p.key === "rio" ? "rio_desc"    : "wcl_desc"    as const;

              return (
                <a key={p.name} href={p.href} target="_blank" rel="noopener noreferrer"
                  className="group relative flex items-center overflow-hidden rounded-lg border border-[#2a2318] bg-[#111009] transition-all duration-300 hover:-translate-y-px"
                  style={{ "--platform-accent": p.accent } as React.CSSProperties}
                >
                  <div className="relative shrink-0 flex items-center justify-center w-16 self-stretch border-r border-[#2a2318] transition-colors duration-300 group-hover:border-[color:var(--platform-accent)]/20">
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `linear-gradient(135deg, ${p.accent}18, transparent)` }} />
                    <span className="relative text-[#3d3220] transition-colors duration-300 group-hover:text-[color:var(--platform-accent)]">{p.icon}</span>
                  </div>
                  <div className="flex flex-1 items-center px-5 py-4 gap-4 min-w-0">
                    <div className="space-y-0.5 shrink-0 min-w-0 flex-1">
                      <p className="text-sm font-bold text-[#f5efe8]">{p.name}</p>
                      {linkEdit ? (
                        <div className="space-y-1 mt-1" onClick={(e) => e.preventDefault()}>
                          <div>
                            <label className={labelCls}>Tagline</label>
                            <input className={inputCls} value={linkDraft[taglineKey][L]}
                              onChange={(e) => setLinkDraft((d) => ({ ...d, [taglineKey]: { ...d[taglineKey], [L]: e.target.value } }))} />
                          </div>
                          <div>
                            <label className={labelCls}>Descripción</label>
                            <input className={inputCls} value={linkDraft[descKey][L]}
                              onChange={(e) => setLinkDraft((d) => ({ ...d, [descKey]: { ...d[descKey], [L]: e.target.value } }))} />
                          </div>
                        </div>
                      ) : (
                        <p className="text-[10px] font-mono text-[#6b5e50] tracking-wide">{tagline}</p>
                      )}
                    </div>
                    {!linkEdit && (
                      <>
                        <div className="h-px flex-1 hidden sm:block" style={{ background: `linear-gradient(to right, ${p.accent}40, transparent)` }} />
                        <p className="text-xs text-[#6b5e50] hidden md:block shrink-0">{desc}</p>
                        <ArrowRight className="h-4 w-4 shrink-0 ml-auto sm:ml-0 transition-all duration-300 group-hover:translate-x-1" style={{ color: "#3d3220" }} />
                      </>
                    )}
                  </div>
                  <div className="absolute bottom-0 left-0 h-px w-0 group-hover:w-full transition-all duration-500" style={{ backgroundColor: p.accent, opacity: 0.4 }} />
                </a>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
