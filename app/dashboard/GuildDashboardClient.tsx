"use client";

import { useState } from "react";
import { AlertTriangle, ChevronUp, ChevronDown } from "lucide-react";
import { VaultTracker } from "@/components/dashboard/VaultTracker";
import type { WoWAuditData, AuditPlayer } from "@/lib/wowaudit";

type SortKey = "ilvl" | "tier" | "dungeons" | "vault" | "io";
type SortDir = "asc" | "desc";
type Tab = "guild" | "vault" | "stats";

function StatCard({
  label,
  value,
  sub,
  warn,
}: {
  label: string;
  value: string | number;
  sub?: string;
  warn?: boolean;
}) {
  return (
    <div className={`rounded-xl border p-4 space-y-1 ${
      warn
        ? "border-[#E8560A]/30 bg-[#E8560A]/5"
        : "border-[#2a2318] bg-[#111009]"
    }`}>
      <p className={`text-2xl font-black font-mono ${warn ? "text-[#E8560A]" : "text-[#F0B830]"}`}>
        {value}
      </p>
      <p className="text-xs text-[#6b5e50]">{label}</p>
      {sub && <p className="text-[10px] text-[#3d3220] font-mono">{sub}</p>}
    </div>
  );
}

function VaultPips({ slots }: { slots: number }) {
  return (
    <div className="flex gap-1 justify-center">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-2 w-2 rounded-sm border"
          style={{
            background: slots >= i ? "#F0B830" : "transparent",
            borderColor: slots >= i ? "#F0B830" : "#3d3220",
          }}
        />
      ))}
    </div>
  );
}

function SortHeader({
  label,
  col,
  current,
  dir,
  onClick,
}: {
  label: string;
  col: SortKey;
  current: SortKey;
  dir: SortDir;
  onClick: (k: SortKey) => void;
}) {
  const active = current === col;
  return (
    <th
      className="text-right py-2 px-3 font-medium cursor-pointer select-none hover:text-[#F0B830] transition-colors"
      onClick={() => onClick(col)}
    >
      <span className="flex items-center justify-end gap-1">
        {label}
        {active ? (
          dir === "desc" ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3 opacity-20" />
        )}
      </span>
    </th>
  );
}

export function GuildDashboardClient({ data, statsSlot }: { data: WoWAuditData; statsSlot: React.ReactNode }) {
  const { summary, players } = data;
  const [tab, setTab] = useState<Tab>("guild");
  const [sort, setSort] = useState<SortKey>("ilvl");
  const [dir, setDir] = useState<SortDir>("desc");
  const [search, setSearch] = useState("");

  const handleSort = (key: SortKey) => {
    if (sort === key) setDir((d) => (d === "desc" ? "asc" : "desc"));
    else { setSort(key); setDir("desc"); }
  };

  const sorted = [...players]
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const getVal = (p: AuditPlayer): number => {
        if (sort === "ilvl")     return p.ilvl ?? 0;
        if (sort === "tier")     return p.tierPieces ?? 0;
        if (sort === "dungeons") return p.weeklyDungeons ?? 0;
        if (sort === "vault")    return p.vaultSlots ?? 0;
        if (sort === "io")       return p.ioRating ?? 0;
        return 0;
      };
      return dir === "desc" ? getVal(b) - getVal(a) : getVal(a) - getVal(b);
    });

  const vaultFull       = players.filter((p) => (p.vaultSlots ?? 0) >= 3).length;
  const vaultPartial    = players.filter((p) => { const s = p.vaultSlots ?? 0; return s >= 1 && s < 3; }).length;
  const vaultNone       = players.filter((p) => (p.vaultSlots ?? 0) === 0).length;
  const missingFullVault = players.length - vaultFull;
  const avgDungeons = players.length
    ? Math.round(players.reduce((s, p) => s + (p.weeklyDungeons ?? 0), 0) / players.length)
    : 0;

  const tabs: { id: Tab; label: string }[] = [
    { id: "guild", label: "Guild Stats" },
    { id: "vault", label: "Vault M+" },
    { id: "stats", label: "Rankings" },
  ];

  return (
    <div className="space-y-6">

      {/* ── Tab bar ───────────────────────────────────────────────────── */}
      <div className="flex gap-1 rounded-lg border border-[#2a2318] bg-[#111009] p-1 w-fit">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              tab === t.id
                ? "bg-[#1a1710] text-[#f5efe8]"
                : "text-[#6b5e50] hover:text-[#b8a898]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Vault M+ ── */}
      {tab === "vault" && (
        <div className="rounded-xl border border-[#2a2318] bg-[#111009] p-5">
          <VaultTracker />
        </div>
      )}

      {/* ── Rankings ── */}
      {tab === "stats" && statsSlot}

      {/* ── Guild Stats (WoWAudit) ─────────────────────────────────── */}
      {tab === "guild" && <div className="space-y-6">

      {/* ── Summary cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Miembros"          value={summary.memberCount} />
        <StatCard label="iLvl promedio"     value={summary.avgIlvl.toFixed(2)} />
        <StatCard label="Dungeons semanales" value={summary.weeklyDungeons} sub={`~${avgDungeons} por jugador`} />
        <StatCard
          label="Vault M+ completa (3 slots)"
          value={`${vaultFull}/${summary.memberCount}`}
          sub={vaultPartial > 0 ? `${vaultPartial} parcial · ${vaultNone} sin vault` : `${vaultNone} sin vault`}
        />
        <StatCard
          label="Sin vault completo M+"
          value={missingFullVault}
          warn={missingFullVault > 0}
        />
        <StatCard
          label="Enchants/Gems faltantes"
          value={summary.missingEnchants}
          warn={summary.missingEnchants > 0}
        />
      </div>

      {/* ── Warnings ──────────────────────────────────────────────────── */}
      {summary.missingEnchants > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-[#E8560A]/20 bg-[#E8560A]/5 px-4 py-3 text-sm text-[#E8560A]">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {summary.missingEnchants} enchants/gems faltantes en el roster.
        </div>
      )}

      {/* ── Player table ──────────────────────────────────────────────── */}
      <div className="rounded-xl border border-[#2a2318] bg-[#111009] overflow-hidden">

        {/* Search */}
        <div className="px-4 py-3 border-b border-[#2a2318]">
          <input
            type="text"
            placeholder="Buscar jugador…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-xs rounded-lg border border-[#3d3220] bg-[#080706] px-3 py-1.5 text-sm text-[#f5efe8] placeholder-[#6b5e50] focus:outline-none focus:border-[#F0B830]"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="border-b border-[#2a2318] text-[#6b5e50]">
              <tr>
                <th className="text-left py-2 px-3 font-medium w-8">#</th>
                <th className="text-left py-2 px-3 font-medium">Jugador</th>
                <SortHeader label="iLvl"     col="ilvl"     current={sort} dir={dir} onClick={handleSort} />
                <SortHeader label="Tier"     col="tier"     current={sort} dir={dir} onClick={handleSort} />
                <SortHeader label="Dungeons" col="dungeons" current={sort} dir={dir} onClick={handleSort} />
                <SortHeader label="Vault"    col="vault"    current={sort} dir={dir} onClick={handleSort} />
                <SortHeader label="IO"       col="io"       current={sort} dir={dir} onClick={handleSort} />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1710]">
              {sorted.map((player, i) => {
                const vaultSlots = player.vaultSlots ?? 0;
                const ilvlColor =
                  (player.ilvl ?? 0) >= 272 ? "#F0B830" :
                  (player.ilvl ?? 0) >= 268 ? "#b8a898" :
                  "#6b5e50";

                return (
                  <tr key={player.name} className="hover:bg-[#1a1710]/60 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-[#3d3220]">{i + 1}</td>
                    <td className="py-2.5 px-3 font-semibold text-[#f5efe8]">{player.name}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold" style={{ color: ilvlColor }}>
                      {player.ilvl?.toFixed(2) ?? "—"}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-[#b8a898]">
                      {player.tierPieces !== null ? (
                        <span className={player.tierPieces >= 4 ? "text-[#F0B830]" : ""}>
                          {player.tierPieces}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-[#b8a898]">
                      {player.weeklyDungeons !== null ? (
                        <span className={player.weeklyDungeons >= 8 ? "text-green-400" : player.weeklyDungeons >= 4 ? "text-amber-400" : ""}>
                          {player.weeklyDungeons}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {player.vaultSlots !== null ? (
                        <VaultPips slots={vaultSlots} />
                      ) : "—"}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-[#b8a898]">
                      {player.ioRating ?? "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      </div>}

    </div>
  );
}
