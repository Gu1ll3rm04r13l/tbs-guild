const RIO_BASE = "https://raider.io/api/v1";
const REGION = (process.env.WCL_REGION ?? "US").toLowerCase();
const REALM_SLUG = process.env.WCL_REALM_SLUG ?? "ragnaros";
const RAID_SLUG = process.env.RIO_RAID_SLUG ?? "liberation-of-undermine";
const TBS_NAME = process.env.WCL_GUILD_NAME ?? "The Burning Seagull";

// ─── Types ────────────────────────────────────────────────────────────────────

export type GuildRanks = {
  world: number;
  region: number;
  realm: number;
};

export type GuildProfile = {
  name: string;
  realm: string;
  faction: "horde" | "alliance" | string;
  mythicKills: number;
  totalBosses: number;
  summary: string;      // e.g. "7/8 M"
  ranks: GuildRanks;
};

export type LeaderboardEntry = GuildProfile & {
  serverRank: number;
  isTBS: boolean;
};

// ─── Fetcher ──────────────────────────────────────────────────────────────────

async function fetchGuildProfile(name: string): Promise<GuildProfile | null> {
  const url = new URL(`${RIO_BASE}/guilds/profile`);
  url.searchParams.set("region", REGION);
  url.searchParams.set("realm", REALM_SLUG);
  url.searchParams.set("name", name);
  url.searchParams.set("fields", "raid_progression,raid_rankings");

  try {
    const res = await fetch(url.toString(), {
      headers: { "User-Agent": "TBS-Guild-Site/1.0" },
      next: { revalidate: 300 }, // 5 min cache
    });

    if (!res.ok) return null;

    const data = await res.json();

    const progression = data.raid_progression?.[RAID_SLUG];
    const rankings = data.raid_rankings?.[RAID_SLUG]?.mythic;

    if (!progression) return null;

    return {
      name: data.name as string,
      realm: data.realm as string,
      faction: data.faction as string,
      mythicKills: (progression.mythic_bosses_killed as number) ?? 0,
      totalBosses: (progression.total_bosses as number) ?? 8,
      summary: (progression.summary as string) ?? "0/8 M",
      ranks: {
        world: (rankings?.world as number) ?? 0,
        region: (rankings?.region as number) ?? 0,
        realm: (rankings?.realm as number) ?? 0,
      },
    };
  } catch {
    return null;
  }
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function getServerLeaderboard(): Promise<LeaderboardEntry[]> {
  const guildNames = (process.env.LEADERBOARD_GUILDS ?? TBS_NAME)
    .split(",")
    .map((g) => g.trim())
    .filter(Boolean);

  const results = await Promise.all(guildNames.map(fetchGuildProfile));

  const valid = results
    .filter((p): p is GuildProfile => p !== null)
    .sort((a, b) => {
      if (b.mythicKills !== a.mythicKills) return b.mythicKills - a.mythicKills;
      // Tiebreak by realm rank (lower = better)
      const ra = a.ranks.realm || 9999;
      const rb = b.ranks.realm || 9999;
      return ra - rb;
    });

  return valid.map((entry, i) => ({
    ...entry,
    serverRank: i + 1,
    isTBS: entry.name.toLowerCase() === TBS_NAME.toLowerCase(),
  }));
}
