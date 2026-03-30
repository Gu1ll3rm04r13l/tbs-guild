import { getGuildRoster, getCharacterProfile } from "@/lib/blizzard";
import { getCharacterStats } from "@/lib/raiderio";
import { getCharacterWCLStats } from "@/lib/warcraftlogs";

const RAIDER_RANKS = [0, 1, 4];

type RaiderStat = {
  name: string;
  ilvl: number;
  io: number;
  ioColor: string;
  avgParse: number | null;
};

function avg(arr: number[]) {
  if (!arr.length) return 0;
  return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
}

function parseColor(pct: number): string {
  if (pct >= 100) return "#e5cc80";
  if (pct >= 99)  return "#e268a8";
  if (pct >= 95)  return "#ff8000";
  if (pct >= 75)  return "#a335ee";
  if (pct >= 50)  return "#0070dd";
  if (pct >= 25)  return "#1eff00";
  return "#9d9d9d";
}

function RankingList({
  title,
  rows,
}: {
  title: string;
  rows: { name: string; value: string | number; color: string; bar: number }[];
}) {
  return (
    <div className="rounded-xl border border-[#2a2318] bg-[#111009] p-5 space-y-3 flex-1 min-w-0">
      <h3 className="text-xs font-mono uppercase tracking-[0.15em] text-[#E8560A]">{title}</h3>
      <div className="space-y-2">
        {rows.map((r, i) => (
          <div key={r.name} className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-[#3d3220] w-4 text-right shrink-0">
              {i + 1}
            </span>
            <span className="text-xs text-[#b8a898] w-28 truncate shrink-0">{r.name}</span>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="flex-1 h-1.5 rounded-full bg-[#2a2318] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${r.bar}%`, background: r.color }}
                />
              </div>
              <span className="text-xs font-mono shrink-0 w-12 text-right" style={{ color: r.color }}>
                {r.value}
              </span>
            </div>
          </div>
        ))}
        {rows.length === 0 && (
          <p className="text-sm text-[#6b5e50] italic">Sin datos disponibles.</p>
        )}
      </div>
    </div>
  );
}

export async function GuildStats() {
  const rawMembers = await getGuildRoster();
  const raiders = rawMembers.filter((m) => RAIDER_RANKS.includes(m.rank)).slice(0, 30);

  const results = await Promise.allSettled(
    raiders.map(async (m): Promise<RaiderStat | null> => {
      const name  = m.character.name;
      const realm = m.character.realm.slug;
      const [profile, charStats, wclStats] = await Promise.all([
        getCharacterProfile(realm, name),
        getCharacterStats(realm, name),
        getCharacterWCLStats(name),
      ]);
      if (!profile?.equipped_item_level) return null;
      return {
        name,
        ilvl:     profile.equipped_item_level,
        io:       charStats.mythicScore?.score ?? 0,
        ioColor:  charStats.mythicScore?.color ?? "#6b5e50",
        avgParse: wclStats?.avgParse ?? null,
      };
    })
  );

  const stats: RaiderStat[] = results
    .filter((r): r is PromiseFulfilledResult<RaiderStat | null> => r.status === "fulfilled")
    .map((r) => r.value)
    .filter((v): v is RaiderStat => v !== null);

  const topIO = [...stats].sort((a, b) => b.io - a.io).slice(0, 10);
  const maxIO = topIO[0]?.io || 1;

  const topIlvl = [...stats].sort((a, b) => b.ilvl - a.ilvl).slice(0, 10);
  const maxIlvl = topIlvl[0]?.ilvl || 1;

  const topParses = [...stats]
    .filter((s) => s.avgParse !== null)
    .sort((a, b) => (b.avgParse ?? 0) - (a.avgParse ?? 0))
    .slice(0, 10);

  const globalAvgIlvl = avg(stats.map((s) => s.ilvl));

  return (
    <div className="space-y-4">

      {/* Global summary */}
      <div className="flex items-center gap-4 text-xs text-[#6b5e50] font-mono px-1">
        <span>iLvl promedio global: <span className="text-[#F0B830] font-bold">{globalAvgIlvl}</span></span>
        <span>·</span>
        <span>{stats.length} raiders</span>
      </div>

      {/* 3-column rankings */}
      <div className="flex flex-col lg:flex-row gap-4">

        <RankingList
          title="Top M+ Score"
          rows={topIO.map((s) => ({
            name:  s.name,
            value: s.io,
            color: s.ioColor,
            bar:   Math.round((s.io / maxIO) * 100),
          }))}
        />

        <RankingList
          title="Ranking iLvl"
          rows={topIlvl.map((s) => ({
            name:  s.name,
            value: s.ilvl,
            color: s.ilvl >= 272 ? "#F0B830" : s.ilvl >= 268 ? "#b8a898" : "#6b5e50",
            bar:   Math.round(((s.ilvl - (maxIlvl - 15)) / 15) * 100),
          }))}
        />

        <RankingList
          title="Parse Promedio (Mítico)"
          rows={topParses.map((s) => ({
            name:  s.name,
            value: `${s.avgParse}%`,
            color: parseColor(s.avgParse ?? 0),
            bar:   s.avgParse ?? 0,
          }))}
        />

      </div>
    </div>
  );
}
