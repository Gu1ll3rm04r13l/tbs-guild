import { Swords } from "lucide-react";
import type { RecentKill } from "@/lib/warcraftlogs";

type Props = {
  kills: RecentKill[];
};

function relativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function KillFeed({ kills }: Props) {
  if (kills.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <Swords className="h-4 w-4 text-[#E8560A]" />
        <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-[#6b5e50]">
          Recent Kills
        </h2>
        <div className="h-px flex-1 bg-gradient-to-r from-[#3d3220] to-transparent" />
      </div>

      <div className="divide-y divide-[#1a1710]">
        {kills.map((kill, i) => (
          <div
            key={`${kill.boss}-${kill.killTimestamp}`}
            className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0"
          >
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-[#3d3220] w-4 text-right">
                {i + 1}
              </span>
              <div
                className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                style={{ background: "#E8560A", boxShadow: "0 0 4px #E8560A" }}
              />
              <span className="text-sm text-[#b8a898] font-medium">{kill.boss}</span>
              <span className="text-[10px] font-mono text-[#3d3220] uppercase tracking-wider">
                Mythic
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-[#6b5e50]">
                {relativeTime(kill.killTimestamp)}
              </span>
              <a
                href={`https://www.warcraftlogs.com/reports/${kill.reportCode}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-mono text-[#3d3220] hover:text-[#6b5e50] transition-colors"
              >
                ↗
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
