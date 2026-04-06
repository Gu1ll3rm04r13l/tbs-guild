"use client";

import { useState, useMemo } from "react";
import { Users, Flame, Trophy, ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/LanguageProvider";
import { t } from "@/lib/i18n";
import type { RosterMember } from "./RosterGrid";

type RankRow = { name: string; value: string | number; color: string; bar: number };

function RankingList({
  title,
  rows,
  noData,
  loading,
}: {
  title: string;
  rows: RankRow[];
  noData: string;
  loading?: boolean;
}) {
  return (
    <div className="flex-1 min-w-0 space-y-3">
      <h3 className="text-[11px] font-mono uppercase tracking-[0.15em] text-[#E8560A] flex items-center gap-1.5">
        {title}
        {loading && <Loader2 className="h-2.5 w-2.5 animate-spin opacity-60" />}
      </h3>
      <div className="space-y-1.5">
        {!loading && rows.length === 0 && (
          <p className="text-xs text-[#6b5e50] italic">{noData}</p>
        )}
        {rows.map((r, i) => (
          <div key={r.name} className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-[#3d3220] w-4 text-right shrink-0">{i + 1}</span>
            <span className="text-xs text-[#b8a898] w-28 truncate shrink-0">{r.name}</span>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="flex-1 h-1 rounded-full bg-[#2a2318] overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${r.bar}%`, background: r.color }} />
              </div>
              <span className="text-xs font-mono shrink-0 w-16 text-right" style={{ color: r.color }}>
                {r.value}
              </span>
            </div>
          </div>
        ))}
        {loading && rows.length === 0 && (
          <div className="space-y-1.5 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-3 rounded bg-[#2a2318]" style={{ width: `${85 - i * 8}%` }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function RosterHeader({ members }: { members: RosterMember[] }) {
  const { lang } = useLanguage();
  const TR = t[lang].roster;

  const [open, setOpen] = useState(false);
  const [parseRows, setParseRows] = useState<RankRow[]>([]);
  const [parsesLoading, setParsesLoading] = useState(false);
  const [parsesFetched, setParsesFetched] = useState(false);

  const { topIO, topIlvl, globalAvgIlvl } = useMemo(() => {
    const withIlvl = members
      .filter((m) => (m.stats?.equipped_item_level ?? 0) > 0)
      .map((m) => ({ name: m.name, ilvl: m.stats!.equipped_item_level! }));

    const withIO = members
      .filter((m) => (m.mythicScore?.score ?? 0) > 0)
      .map((m) => ({ name: m.name, io: m.mythicScore!.score, color: m.mythicScore!.color }));

    const sortedIlvl = [...withIlvl].sort((a, b) => b.ilvl - a.ilvl).slice(0, 20);
    const sortedIO   = [...withIO].sort((a, b) => b.io - a.io).slice(0, 20);

    const maxIlvl = sortedIlvl[0]?.ilvl || 1;
    const maxIO   = sortedIO[0]?.io || 1;

    const avg = withIlvl.length
      ? Math.round(withIlvl.reduce((s, m) => s + m.ilvl, 0) / withIlvl.length)
      : 0;

    return {
      globalAvgIlvl: avg,
      topIlvl: sortedIlvl.map((m) => ({
        name:  m.name,
        value: m.ilvl,
        color: m.ilvl >= 272 ? "#F0B830" : m.ilvl >= 268 ? "#b8a898" : "#6b5e50",
        bar:   Math.round(((m.ilvl - (maxIlvl - 15)) / 15) * 100),
      })),
      topIO: sortedIO.map((m) => ({
        name:  m.name,
        value: m.io,
        color: m.color,
        bar:   Math.round((m.io / maxIO) * 100),
      })),
    };
  }, [members]);

  const handleToggle = async () => {
    const next = !open;
    setOpen(next);
    // Fetch parses only once, on first open
    if (next && !parsesFetched) {
      setParsesLoading(true);
      setParsesFetched(true);
      try {
        const res = await fetch("/api/guild-parses");
        if (res.ok) {
          const json = await res.json();
          setParseRows(json.rows ?? []);
        }
      } catch { /* silent — column stays empty */ }
      finally { setParsesLoading(false); }
    }
  };

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Flame className="h-3.5 w-3.5 text-[#E8560A]" />
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-[#E8560A]">{TR.eyebrow}</p>
          </div>
          <h1 className="text-2xl font-black text-[#f5efe8] flex items-center gap-2.5">
            <Users className="h-6 w-6 text-[#6b5e50]" />
            {TR.title}
          </h1>
        </div>

        <div className="flex items-center gap-3 pt-1 shrink-0">
          <p className="hidden sm:block text-xs text-[#6b5e50] font-mono">{TR.meta(members.length)}</p>
          <button
            onClick={handleToggle}
            className={cn(
              "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-200",
              open
                ? "border-[#F0B830]/40 bg-[#F0B830]/5 text-[#F0B830]"
                : "border-[#2a2318] bg-[#111009] text-[#b8a898] hover:border-[#F0B830]/30 hover:text-[#F0B830]"
            )}
          >
            <Trophy className="h-3.5 w-3.5 shrink-0" />
            {TR.rankings}
            <ChevronDown className={cn("h-3 w-3 ml-0.5 transition-transform duration-200", open && "rotate-180")} />
          </button>
        </div>
      </div>

      {/* Rankings panel */}
      {open && (
        <div className="rounded-xl border border-[#2a2318] bg-[#111009] p-5 space-y-4">
          <p className="text-[11px] font-mono text-[#6b5e50]">
            {TR.globalAvg}: <span className="text-[#F0B830] font-bold">{globalAvgIlvl}</span>
            <span className="mx-1.5 opacity-30">·</span>
            {members.length} {TR.raiders}
          </p>
          <div className="flex flex-col lg:flex-row gap-6">
            <RankingList title={TR.topIO}     rows={topIO}     noData={TR.noData} />
            <RankingList title={TR.topIlvl}   rows={topIlvl}   noData={TR.noData} />
            <RankingList title={TR.topParses} rows={parseRows} noData={TR.noData} loading={parsesLoading} />
          </div>
        </div>
      )}
    </div>
  );
}
