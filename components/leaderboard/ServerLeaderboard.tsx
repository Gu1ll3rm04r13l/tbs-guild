import { Trophy } from "lucide-react";
import type { LeaderboardEntry } from "@/lib/raiderio";

type Props = {
  entries: LeaderboardEntry[];
  raidName?: string;
};

export function ServerLeaderboard({ entries, raidName = "Ragnaros" }: Props) {
  if (entries.length === 0) {
    return (
      <p className="text-sm text-[#3d3220] font-mono">
        No leaderboard data available.
      </p>
    );
  }

  const maxKills = Math.max(...entries.map((e) => e.mythicKills));

  return (
    <div className="space-y-1">
      {/* Column headers */}
      <div className="grid grid-cols-[2rem_1fr_auto_auto] sm:grid-cols-[2rem_1fr_auto_auto_auto] gap-x-4 px-3 pb-2">
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#3d3220]">#</span>
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#3d3220]">Guild</span>
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#3d3220] text-right">Progress</span>
        <span className="hidden sm:block text-[10px] font-mono uppercase tracking-widest text-[#3d3220] text-right">World</span>
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#3d3220] text-right">{raidName}</span>
      </div>

      {/* Rows */}
      {entries.map((entry) => (
        <GuildRow key={entry.name} entry={entry} maxKills={maxKills} raidName={raidName} />
      ))}
    </div>
  );
}

function GuildRow({
  entry,
  maxKills,
  raidName,
}: {
  entry: LeaderboardEntry;
  maxKills: number;
  raidName: string;
}) {
  const barPct = maxKills > 0 ? (entry.mythicKills / entry.totalBosses) * 100 : 0;
  const isFullClear = entry.mythicKills === entry.totalBosses;

  return (
    <div
      className={`
        grid grid-cols-[2rem_1fr_auto_auto] sm:grid-cols-[2rem_1fr_auto_auto_auto]
        gap-x-4 items-center rounded px-3 py-2.5 transition-colors
        ${
          entry.isTBS
            ? "bg-[#1a1710] border border-[#E8560A]/20 ember-glow"
            : "hover:bg-[#111009] border border-transparent"
        }
      `}
    >
      {/* Rank */}
      <span
        className={`text-sm font-mono font-bold ${
          entry.serverRank === 1
            ? "text-[#F0B830]"
            : entry.serverRank <= 3
            ? "text-[#b8a898]"
            : "text-[#3d3220]"
        }`}
      >
        {entry.serverRank === 1 ? (
          <Trophy className="h-3.5 w-3.5 text-[#F0B830] inline" />
        ) : (
          entry.serverRank
        )}
      </span>

      {/* Guild name + progress bar */}
      <div className="min-w-0 space-y-1.5">
        <div className="flex items-center gap-2">
          <span
            className={`text-sm font-semibold truncate ${
              entry.isTBS ? "fire-text" : "text-[#f5efe8]"
            }`}
          >
            {entry.name}
          </span>
          {entry.isTBS && (
            <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#E8560A] border border-[#E8560A]/30 px-1 rounded flex-shrink-0">
              TBS
            </span>
          )}
        </div>

        {/* Progress bar */}
        <div className="h-1 w-full rounded-full bg-[#1a1710] overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${barPct}%`,
              background: isFullClear
                ? "linear-gradient(90deg, #C41A00, #E8560A, #F0B830)"
                : entry.isTBS
                ? "linear-gradient(90deg, #C41A00, #E8560A, #D4960A)"
                : "linear-gradient(90deg, #3d3220, #6b5e50)",
            }}
          />
        </div>
      </div>

      {/* Progress text */}
      <span
        className={`text-sm font-mono font-bold text-right ${
          isFullClear ? "text-[#F0B830]" : entry.isTBS ? "text-[#E8560A]" : "text-[#b8a898]"
        }`}
      >
        {entry.summary}
      </span>

      {/* World rank */}
      <span className="hidden sm:block text-xs font-mono text-[#6b5e50] text-right">
        {entry.ranks.world > 0 ? `#${entry.ranks.world}` : "—"}
      </span>

      {/* Realm rank */}
      <span
        className={`text-xs font-mono text-right ${
          entry.isTBS ? "text-[#F0B830]" : "text-[#6b5e50]"
        }`}
      >
        #{entry.serverRank}
      </span>
    </div>
  );
}
