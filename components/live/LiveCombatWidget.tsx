import { Swords, Radio, Clock } from "lucide-react";
import type { LiveRaidStatus, BossProgress } from "@/lib/warcraftlogs";

type Props = {
  liveStatus: LiveRaidStatus;
  bossProgress: BossProgress[];
};

function relativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function LiveCombatWidget({ liveStatus, bossProgress }: Props) {
  if (liveStatus.isActive && liveStatus.currentBoss) {
    return <ActiveState liveStatus={liveStatus} />;
  }
  return <IdleState liveStatus={liveStatus} bossProgress={bossProgress} />;
}

// ─── Active State ─────────────────────────────────────────────────────────────

function ActiveState({ liveStatus }: { liveStatus: LiveRaidStatus }) {
  const { currentBoss, bestTry, pullCount, raidStart } = liveStatus;

  // bestTry = boss HP % remaining (lower is better)
  // damagePct = how much of the boss has been dealt damage to
  const damagePct = bestTry !== null ? 100 - bestTry : null;

  return (
    <div className="rounded-lg border border-[#E8560A]/30 bg-[#111009] p-5 ember-glow-strong">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Radio className="h-3.5 w-3.5 text-[#E8560A] animate-pulse" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#E8560A]">
            Raid in Progress
          </span>
        </div>
        {raidStart && (
          <div className="flex items-center gap-1.5 text-[#6b5e50]">
            <Clock className="h-3 w-3" />
            <span className="text-xs font-mono">{relativeTime(raidStart)}</span>
          </div>
        )}
      </div>

      {/* Boss name */}
      <div className="mb-5">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="text-xl font-bold text-[#f5efe8] tracking-tight">
            {currentBoss}
          </h3>
          <span className="text-xs font-mono text-[#6b5e50] flex-shrink-0">
            Pull #{pullCount}
          </span>
        </div>
        <p className="text-xs text-[#6b5e50] mt-0.5 font-mono uppercase tracking-widest">
          Mythic
        </p>
      </div>

      {/* HP Bar */}
      {damagePct !== null ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#6b5e50]">Boss HP</span>
            <span className="text-[#F0B830] font-bold">
              {bestTry!.toFixed(2)}% remaining
            </span>
          </div>

          {/* Bar track */}
          <div className="relative h-3 w-full rounded-full bg-[#1a1710] overflow-hidden">
            {/* Damage dealt (fire fill) */}
            <div
              className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
              style={{
                width: `${damagePct}%`,
                background:
                  "linear-gradient(90deg, #C41A00, #E8560A, #D4960A)",
                boxShadow: "0 0 8px rgba(232, 86, 10, 0.6)",
              }}
            />
            {/* Remaining HP (dim red at the edge) */}
            <div
              className="absolute top-0 h-full rounded-r-full"
              style={{
                left: `${damagePct}%`,
                width: `${bestTry}%`,
                background: "rgba(196, 26, 0, 0.25)",
              }}
            />
          </div>

          {/* Best try callout */}
          <div className="flex items-center gap-2 pt-1">
            <div className="h-px flex-1 bg-[#2a2318]" />
            <span className="text-[10px] font-mono text-[#6b5e50] uppercase tracking-widest">
              Best Try
            </span>
            <div className="h-px flex-1 bg-[#2a2318]" />
          </div>
        </div>
      ) : (
        <div className="h-3 w-full rounded-full bg-[#1a1710]">
          <div className="h-full w-full rounded-full bg-[#2a2318] animate-pulse" />
        </div>
      )}

      {/* Composition placeholder */}
      <div className="mt-4 text-[10px] font-mono text-[#3d3220] uppercase tracking-widest">
        Composition data coming soon
      </div>
    </div>
  );
}

// ─── Idle State ───────────────────────────────────────────────────────────────

function IdleState({
  liveStatus,
  bossProgress,
}: {
  liveStatus: LiveRaidStatus;
  bossProgress: BossProgress[];
}) {
  const kills = bossProgress.filter((b) => b.killed);
  const inProgress = bossProgress.find((b) => !b.killed && b.pullCount > 0);

  return (
    <div className="rounded-lg border border-[#2a2318] bg-[#111009] p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#3d3220]" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#6b5e50]">
            No Active Raid
          </span>
        </div>
        {liveStatus.reportCode && (
          <a
            href={`https://www.warcraftlogs.com/reports/${liveStatus.reportCode}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-mono text-[#3d3220] hover:text-[#6b5e50] transition-colors uppercase tracking-widest"
          >
            Last Report ↗
          </a>
        )}
      </div>

      {bossProgress.length > 0 ? (
        <div className="space-y-3">
          {/* Kill count summary */}
          <div className="flex items-center gap-3">
            <Swords className="h-4 w-4 text-[#E8560A]" />
            <span className="text-sm text-[#b8a898]">
              <span className="font-bold text-[#F0B830]">{kills.length}</span>
              <span className="text-[#3d3220]">/{bossProgress.length}</span>{" "}
              <span className="text-[#6b5e50]">bosses defeated this session</span>
            </span>
          </div>

          {/* Current wall boss */}
          {inProgress && (
            <div className="rounded border border-[#2a2318] bg-[#1a1710] px-3 py-2 flex items-center justify-between">
              <div>
                <p className="text-xs text-[#6b5e50] font-mono uppercase tracking-wider mb-0.5">
                  Current wall
                </p>
                <p className="text-sm font-semibold text-[#f5efe8]">
                  {inProgress.name}
                </p>
              </div>
              <div className="text-right">
                {inProgress.bestPercent !== null && (
                  <p className="text-sm font-mono font-bold text-[#F0B830]">
                    {inProgress.bestPercent.toFixed(2)}%
                  </p>
                )}
                <p className="text-[10px] font-mono text-[#3d3220]">
                  {inProgress.pullCount} pull{inProgress.pullCount !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-[#3d3220] font-mono">
          No recent Mythic data found.
        </p>
      )}
    </div>
  );
}
