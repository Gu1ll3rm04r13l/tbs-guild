"use client";

import { useState } from "react";
import Image from "next/image";
import { ExternalLink, Edit2, Save, X, Shield, Swords, HeartPulse, Star } from "lucide-react";
import { getClassColor } from "@/lib/utils";

type ArmoryData = {
  notes: string | null;
  rio_link: string | null;
  logs_link: string | null;
  media_url: string | null;
};

type WCLStats = {
  avgParse: number | null;
  bestParse: { boss: string; percent: number; spec: string } | null;
  wclProfileUrl: string;
} | null;

type RaidProgress = {
  bossesDown: number;
  totalBosses: number;
  summary: string;
} | null;

type MythicScore = {
  score: number;
  color: string;
} | null;

export type ArmoryClientProps = {
  charName: string;
  characterClass: string;
  specName: string;
  role: "tank" | "healer" | "dps";
  rank: number;
  rankLabel: string;
  ilvl: number | null;
  lastLogin: number | null;
  avatarUrl: string | null;
  canEdit: boolean;
  armoryData: ArmoryData;
  wclStats: WCLStats;
  raidProgress: RaidProgress;
  mythicScore: MythicScore;
};

function parseColor(pct: number): string {
  if (pct >= 100) return "#e5cc80";
  if (pct >= 99)  return "#e268a8";
  if (pct >= 95)  return "#ff8000";
  if (pct >= 75)  return "#a335ee";
  if (pct >= 50)  return "#0070dd";
  if (pct >= 25)  return "#1eff00";
  return "#9d9d9d";
}

function RoleIcon({ role }: { role: "tank" | "healer" | "dps" }) {
  if (role === "tank")   return <Shield     className="h-4 w-4 text-sky-400" />;
  if (role === "healer") return <HeartPulse className="h-4 w-4 text-green-400" />;
  return                        <Swords     className="h-4 w-4 text-red-400" />;
}

export function ArmoryClient({
  charName,
  characterClass,
  specName,
  role,
  rank,
  rankLabel,
  ilvl,
  lastLogin,
  avatarUrl,
  canEdit,
  armoryData,
  wclStats,
  raidProgress,
  mythicScore,
}: ArmoryClientProps) {
  const classColor = getClassColor(characterClass);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ArmoryData>(armoryData);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`/api/armory/${encodeURIComponent(charName)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm(armoryData);
    setEditing(false);
  };

  const displayImage = form.media_url || avatarUrl;
  const lastLoginDate = lastLogin
    ? new Date(lastLogin).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })
    : null;

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 space-y-8">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden rounded-xl border border-[#2a2318] bg-[#111009] p-6"
        style={{ boxShadow: `0 0 40px ${classColor}10` }}
      >
        {/* Class top accent */}
        <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: classColor }} />

        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div
            className="relative h-24 w-24 rounded-lg overflow-hidden border-2 shrink-0"
            style={{ borderColor: `${classColor}60` }}
          >
            {displayImage ? (
              <Image src={displayImage} alt={charName} fill className="object-cover" sizes="96px" />
            ) : (
              <div
                className="h-full w-full flex items-center justify-center text-4xl font-black"
                style={{ color: classColor }}
              >
                {charName[0].toUpperCase()}
              </div>
            )}
          </div>

          {/* Identity */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-3xl font-black" style={{ color: classColor }}>
                {charName}
              </h1>
              {rank <= 1 && <Star className="h-5 w-5 text-[#F0B830] fill-[#F0B830]" />}
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <RoleIcon role={role} />
              <span className="text-[#b8a898] text-sm">
                {specName ? `${specName} · ` : ""}{characterClass}
              </span>
            </div>
            <p className="text-xs text-[#6b5e50] mt-1">{rankLabel}</p>

            {/* Stats chips */}
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              {ilvl && (
                <div className="flex items-center gap-1.5 rounded-md bg-[#1a1710] border border-[#2a2318] px-2.5 py-1">
                  <span className="font-mono text-sm font-black text-[#F0B830]">{ilvl}</span>
                  <span className="text-xs text-[#6b5e50]">ilvl</span>
                </div>
              )}
              {raidProgress && (
                <div className="flex items-center gap-1.5 rounded-md bg-[#1a1710] border border-[#2a2318] px-2.5 py-1">
                  <span className="font-mono text-sm text-[#D4960A]">{raidProgress.summary}</span>
                </div>
              )}
              {mythicScore && (
                <div className="flex items-center gap-1.5 rounded-md bg-[#1a1710] border border-[#2a2318] px-2.5 py-1">
                  <span className="font-mono text-sm font-black" style={{ color: mythicScore.color }}>
                    {mythicScore.score.toLocaleString()}
                  </span>
                  <span className="text-xs text-[#6b5e50]">io</span>
                </div>
              )}
              {lastLoginDate && (
                <span className="text-xs text-[#6b5e50] font-mono">
                  Activo: {lastLoginDate}
                </span>
              )}
            </div>
          </div>

          {/* Edit button */}
          {canEdit && !editing && (
            <button
              onClick={() => setEditing(true)}
              className="shrink-0 flex items-center gap-1.5 rounded-md border border-[#3d3220] bg-[#1a1710] px-3 py-1.5 text-xs text-[#b8a898] hover:border-[#F0B830] hover:text-[#F0B830] transition-colors"
            >
              <Edit2 className="h-3.5 w-3.5" />
              Editar
            </button>
          )}
          {editing && (
            <div className="shrink-0 flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 rounded-md bg-[#F0B830] px-3 py-1.5 text-xs font-bold text-[#080706] hover:bg-[#D4960A] transition-colors disabled:opacity-50"
              >
                <Save className="h-3.5 w-3.5" />
                {saving ? "Guardando…" : "Guardar"}
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-1.5 rounded-md border border-[#3d3220] px-3 py-1.5 text-xs text-[#6b5e50] hover:text-[#b8a898] transition-colors"
              >
                <X className="h-3.5 w-3.5" />
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── WCL Module ─────────────────────────────────────────────────── */}
      {wclStats && (
        <div className="rounded-xl border border-[#2a2318] bg-[#111009] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono uppercase tracking-[0.15em] text-[#E8560A]">
              WarcraftLogs
            </h2>
            <a
              href={wclStats.wclProfileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-[#6b5e50] hover:text-[#F0B830] transition-colors"
            >
              Ver perfil <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {/* Avg parse */}
            <div className="space-y-1">
              <p className="text-xs text-[#6b5e50]">Parse promedio</p>
              {wclStats.avgParse != null ? (
                <p className="text-2xl font-black font-mono" style={{ color: parseColor(wclStats.avgParse) }}>
                  {wclStats.avgParse}
                  <span className="text-sm font-normal text-[#6b5e50]">%</span>
                </p>
              ) : (
                <p className="text-2xl font-black font-mono text-[#3d3220]">—</p>
              )}
            </div>

            {/* Best parse */}
            {wclStats.bestParse && (
              <div className="space-y-1 col-span-2 sm:col-span-2">
                <p className="text-xs text-[#6b5e50]">Mejor parse</p>
                <div className="flex items-baseline gap-2">
                  <p
                    className="text-2xl font-black font-mono"
                    style={{ color: parseColor(wclStats.bestParse.percent) }}
                  >
                    {wclStats.bestParse.percent}
                    <span className="text-sm font-normal text-[#6b5e50]">%</span>
                  </p>
                  <span className="text-sm text-[#b8a898] truncate">
                    {wclStats.bestParse.boss}
                    <span className="text-[#6b5e50]"> · {wclStats.bestParse.spec}</span>
                  </span>
                </div>
              </div>
            )}

            {!wclStats.avgParse && !wclStats.bestParse && (
              <p className="text-sm text-[#6b5e50] col-span-2">
                Sin parses registrados para el tier actual.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Notas / Bio ────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-[#2a2318] bg-[#111009] p-5 space-y-3">
        <h2 className="text-xs font-mono uppercase tracking-[0.15em] text-[#E8560A]">
          Sobre el jugador
        </h2>
        {editing ? (
          <textarea
            value={form.notes ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            placeholder="Bio, notas, info relevante…"
            rows={4}
            className="w-full rounded-lg border border-[#3d3220] bg-[#080706] px-3 py-2 text-sm text-[#f5efe8] placeholder-[#6b5e50] focus:outline-none focus:border-[#F0B830] resize-none"
          />
        ) : (
          <p className="text-sm text-[#b8a898] whitespace-pre-wrap">
            {form.notes || <span className="text-[#6b5e50] italic">Sin notas.</span>}
          </p>
        )}
      </div>

      {/* ── Links & Media ──────────────────────────────────────────────── */}
      <div className="rounded-xl border border-[#2a2318] bg-[#111009] p-5 space-y-4">
        <h2 className="text-xs font-mono uppercase tracking-[0.15em] text-[#E8560A]">
          Links
        </h2>

        {editing ? (
          <div className="space-y-3">
            <Field
              label="Raider.io"
              value={form.rio_link ?? ""}
              onChange={(v) => setForm((f) => ({ ...f, rio_link: v }))}
              placeholder="https://raider.io/characters/..."
            />
            <Field
              label="WarcraftLogs"
              value={form.logs_link ?? ""}
              onChange={(v) => setForm((f) => ({ ...f, logs_link: v }))}
              placeholder="https://www.warcraftlogs.com/character/..."
            />
            <Field
              label="Imagen personalizada (URL)"
              value={form.media_url ?? ""}
              onChange={(v) => setForm((f) => ({ ...f, media_url: v }))}
              placeholder="https://... (screenshot, armory, etc.)"
            />
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {form.rio_link && (
              <LinkChip href={form.rio_link} label="Raider.io" />
            )}
            {form.logs_link && (
              <LinkChip href={form.logs_link} label="WarcraftLogs" />
            )}
            {wclStats?.wclProfileUrl && !form.logs_link && (
              <LinkChip href={wclStats.wclProfileUrl} label="WarcraftLogs" />
            )}
            {!form.rio_link && !form.logs_link && !wclStats && (
              <p className="text-sm text-[#6b5e50] italic">Sin links configurados.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-[#6b5e50]">{label}</label>
      <input
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-[#3d3220] bg-[#080706] px-3 py-2 text-sm text-[#f5efe8] placeholder-[#6b5e50] focus:outline-none focus:border-[#F0B830]"
      />
    </div>
  );
}

function LinkChip({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1.5 rounded-md border border-[#2a2318] bg-[#1a1710] px-3 py-1.5 text-xs text-[#b8a898] hover:border-[#F0B830] hover:text-[#F0B830] transition-colors"
    >
      {label}
      <ExternalLink className="h-3 w-3" />
    </a>
  );
}
