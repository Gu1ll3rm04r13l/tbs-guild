import { getGuildRoster } from "@/lib/blizzard";

const RIO_BASE = "https://raider.io/api/v1";
const REGION = (process.env.WCL_REGION ?? "US").toLowerCase();
const REALM_SLUG = process.env.WCL_REALM_SLUG ?? "ragnaros";
const RAID_SLUG = process.env.RIO_RAID_SLUG ?? "liberation-of-undermine";
const TBS_NAME = process.env.WCL_GUILD_NAME ?? "The Burning Seagull";

const RAIDER_RANKS = [0, 1, 4];

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

// ─── Character stats (M+ score + current raid progress) ──────────────────────

export type CharacterMythicScore = {
  score: number;
  color: string;
};

export type CharacterRaidProgressRIO = {
  bossesDown: number;
  totalBosses: number;
  summary: string; // e.g. "1/9 M"
};

export type CharacterStats = {
  mythicScore: CharacterMythicScore | null;
  raidProgress: CharacterRaidProgressRIO | null;
};

export async function getCharacterStats(
  realmSlug: string,
  characterName: string
): Promise<CharacterStats> {
  const url = new URL(`${RIO_BASE}/characters/profile`);
  url.searchParams.set("region", REGION);
  url.searchParams.set("realm", realmSlug);
  url.searchParams.set("name", characterName);
  url.searchParams.set("fields", `mythic_plus_scores_by_season:current,raid_progression`);

  try {
    const res = await fetch(url.toString(), {
      headers: { "User-Agent": "TBS-Guild-Site/1.0" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return { mythicScore: null, raidProgress: null };
    const data = await res.json();

    // M+ score
    const seasons = data.mythic_plus_scores_by_season as
      | { scores: { all: number }; segments: { all: { color: string } } }[]
      | undefined;
    const mythicScore: CharacterMythicScore | null = seasons?.length
      ? {
          score: Math.round(seasons[0].scores?.all ?? 0),
          color: seasons[0].segments?.all?.color ?? "#b8a898",
        }
      : null;

    // Raid progress for current tier
    const prog = data.raid_progression?.[RAID_SLUG] as
      | { summary: string; mythic_bosses_killed: number; total_bosses: number }
      | undefined;
    const raidProgress: CharacterRaidProgressRIO | null = prog
      ? {
          bossesDown: prog.mythic_bosses_killed ?? 0,
          totalBosses: prog.total_bosses ?? 0,
          summary: prog.summary ?? `${prog.mythic_bosses_killed}/${prog.total_bosses} M`,
        }
      : null;

    return { mythicScore, raidProgress };
  } catch {
    return { mythicScore: null, raidProgress: null };
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

// ─── Guild Vault Tracker ──────────────────────────────────────────────────────

export type VaultEntry = {
  name: string;
  characterClass: string;
  weeklyRuns: number;
  vaultSlots: 0 | 1 | 2 | 3;
  topKeys: number[]; // sorted desc, max 8
};

export async function getGuildVaultStatus(): Promise<VaultEntry[]> {
  const rawMembers = await getGuildRoster();
  const raiders = rawMembers.filter((m) => RAIDER_RANKS.includes(m.rank));

  const results = await Promise.allSettled(
    raiders.map(async (m): Promise<VaultEntry | null> => {
      const name = m.character.name;
      const realm = m.character.realm.slug;

      const url = new URL(`${RIO_BASE}/characters/profile`);
      url.searchParams.set("region", REGION);
      url.searchParams.set("realm", realm);
      url.searchParams.set("name", name);
      url.searchParams.set("fields", "mythic_plus_weekly_highest_level_runs,class");

      const res = await fetch(url.toString(), {
        headers: { "User-Agent": "TBS-Guild-Site/1.0" },
        next: { revalidate: 1800 }, // 30min — vault resets Tuesday
      });
      if (!res.ok) return null;

      const data = await res.json();
      const runs = (data.mythic_plus_weekly_highest_level_runs ?? []) as { mythic_level: number }[];
      const weeklyRuns = runs.length;
      const vaultSlots: 0 | 1 | 2 | 3 =
        weeklyRuns >= 8 ? 3 : weeklyRuns >= 4 ? 2 : weeklyRuns >= 1 ? 1 : 0;

      return {
        name,
        characterClass: (data.class as string) ?? m.character.playable_class?.name ?? "Unknown",
        weeklyRuns,
        vaultSlots,
        topKeys: runs.map((r) => r.mythic_level).sort((a, b) => b - a),
      };
    })
  );

  return results
    .filter((r): r is PromiseFulfilledResult<VaultEntry | null> => r.status === "fulfilled")
    .map((r) => r.value)
    .filter((v): v is VaultEntry => v !== null)
    .sort((a, b) => b.weeklyRuns - a.weeklyRuns || a.name.localeCompare(b.name));
}
