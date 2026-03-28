import type { LiveRaidStatus, RecentKill } from "@/lib/warcraftlogs";

type Props = {
  liveStatus: LiveRaidStatus;
  recentKills: RecentKill[];
};

function relativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function LiveTicker({ liveStatus, recentKills }: Props) {
  const isLive = liveStatus.isActive && liveStatus.currentBoss;

  let message: string;
  if (isLive) {
    const tryText =
      liveStatus.bestTry !== null
        ? ` · Best Try: ${liveStatus.bestTry.toFixed(2)}%`
        : "";
    message = `TBS is currently progressing on ${liveStatus.currentBoss}${tryText}`;
  } else if (recentKills.length > 0) {
    const { boss, killTimestamp } = recentKills[0];
    message = `Last kill: ${boss} · ${relativeTime(killTimestamp)}`;
  } else {
    message = "The Burning Seagull · Mythic Progression · Ragnaros US";
  }

  return (
    <div className="border-b border-[#2a2318] bg-[#0d0c0a]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-2 flex items-center gap-3">
        <span
          className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${
            isLive ? "bg-[#E8560A] animate-pulse" : "bg-[#3d3220]"
          }`}
        />
        {isLive && (
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#E8560A] flex-shrink-0">
            LIVE
          </span>
        )}
        <p className="text-xs font-mono text-[#6b5e50] truncate">{message}</p>
      </div>
    </div>
  );
}
