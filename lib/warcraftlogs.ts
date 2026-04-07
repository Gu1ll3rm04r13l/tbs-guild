const WCL_CLIENT_ID = process.env.WCL_CLIENT_ID!;
const WCL_CLIENT_SECRET = process.env.WCL_CLIENT_SECRET!;
const GUILD_NAME = process.env.WCL_GUILD_NAME ?? "The Burning Seagull";
const REALM_SLUG = process.env.WCL_REALM_SLUG ?? "ragnaros";
const REGION = process.env.WCL_REGION ?? "US";

const ZONE_ID = parseInt(process.env.WCL_ZONE_ID ?? "0");

const TOKEN_URL = "https://www.warcraftlogs.com/oauth/token";
const API_URL = "https://www.warcraftlogs.com/api/v2/client";

const MYTHIC_DIFFICULTY = 5;

// ─── Token cache (module-level, server only) ──────────────────────────────────
let cachedToken: string | null = null;
let tokenExpiry = 0;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

  const credentials = Buffer.from(`${WCL_CLIENT_ID}:${WCL_CLIENT_SECRET}`).toString("base64");
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`WCL token request failed: ${res.status}`);

  const data = await res.json();
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  return cachedToken!;
}

async function wclQuery<T>(
  query: string,
  variables: Record<string, unknown> = {},
  revalidate = 60
): Promise<T> {
  const token = await getAccessToken();

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate },
  });

  if (!res.ok) throw new Error(`WCL API error: ${res.status}`);

  const json = await res.json();
  if (json.errors) throw new Error(`WCL GraphQL error: ${JSON.stringify(json.errors)}`);

  return json.data as T;
}

// ─── Internal types ───────────────────────────────────────────────────────────

type WCLReport = {
  code: string;
  title: string;
  startTime: number; // epoch ms
  endTime: number;   // epoch ms — 0 if raid still in progress
};

type WCLFight = {
  id: number;
  encounterID: number;
  name: string;
  kill: boolean | null;
  bossPercentage: number; // 0–100 percent (0 = kill, 100 = full hp)
  difficulty: number;     // 5 = Mythic
  startTime: number;      // ms relative to report start
  endTime: number;
};

// ─── Public types ─────────────────────────────────────────────────────────────

export type LiveRaidStatus = {
  isActive: boolean;
  reportCode: string | null;
  currentBoss: string | null;
  bestTry: number | null;  // health % remaining at best wipe (lower = better)
  pullCount: number;
  raidStart: number | null; // epoch ms
};

export type BossProgress = {
  name: string;
  killed: boolean;
  killTimestamp: number | null; // epoch ms
  bestPercent: number | null;   // health % at best wipe; 0 if killed; null if never pulled
  pullCount: number;
  encounterID: number | null;
  firstKillReportCode: string | null;
};

export type RecentKill = {
  boss: string;
  killTimestamp: number; // epoch ms
  reportCode: string;
};

export type WCLRaidData = {
  liveStatus: LiveRaidStatus;
  recentKills: RecentKill[];
  bossProgress: BossProgress[];
  zoneName: string | null;
};

// ─── GraphQL queries ──────────────────────────────────────────────────────────

const GUILD_REPORTS_QUERY = `
  query GetGuildReports($guildName: String!, $serverSlug: String!, $serverRegion: String!) {
    reportData {
      reports(
        guildName: $guildName
        guildServerSlug: $serverSlug
        guildServerRegion: $serverRegion
        limit: 5
      ) {
        data {
          code
          title
          startTime
          endTime
        }
      }
    }
  }
`;

const REPORT_FIGHTS_QUERY = `
  query GetReportFights($code: String!) {
    reportData {
      report(code: $code) {
        startTime
        zone {
          name
        }
        fights(killType: Encounters) {
          id
          encounterID
          name
          kill
          bossPercentage
          difficulty
          startTime
          endTime
        }
      }
    }
  }
`;

// ─── Internal fetchers ────────────────────────────────────────────────────────

async function getRecentReports(): Promise<WCLReport[]> {
  const data = await wclQuery<{
    reportData: { reports: { data: WCLReport[] } };
  }>(
    GUILD_REPORTS_QUERY,
    { guildName: GUILD_NAME, serverSlug: REALM_SLUG, serverRegion: REGION },
    60 // 1 min — need to detect new/active reports quickly
  );
  return data.reportData.reports.data ?? [];
}

async function getReportFights(
  code: string,
  revalidate: number
): Promise<{ startTime: number; fights: WCLFight[]; zone: { name: string } | null }> {
  const data = await wclQuery<{
    reportData: { report: { startTime: number; fights: WCLFight[]; zone: { name: string } | null } };
  }>(REPORT_FIGHTS_QUERY, { code }, revalidate);
  return data.reportData.report;
}

// ─── Main export ──────────────────────────────────────────────────────────────

const EMPTY: WCLRaidData = {
  liveStatus: {
    isActive: false,
    reportCode: null,
    currentBoss: null,
    bestTry: null,
    pullCount: 0,
    raidStart: null,
  },
  recentKills: [],
  bossProgress: [],
  zoneName: null,
};

export async function getWCLRaidData(): Promise<WCLRaidData> {
  try {
    const reports = await getRecentReports();
    if (reports.length === 0) return EMPTY;

    const [latest] = reports;
    const isActive = latest.endTime === 0;
    const latestCacheTtl = isActive ? 60 : 300;

    // Fetch fights for all recent reports in parallel.
    // Latest report: short cache if active. Older reports: always 5 min (completed).
    const allFightData = await Promise.all(
      reports.map((r, i) =>
        getReportFights(r.code, i === 0 ? latestCacheTtl : 300).catch(() => null)
      )
    );

    const latestFightData = allFightData[0];
    if (!latestFightData) {
      return {
        ...EMPTY,
        liveStatus: { ...EMPTY.liveStatus, isActive, reportCode: latest.code },
      };
    }

    // ── Live status (latest report only) ─────────────────────────────────────
    const latestMythic = latestFightData.fights
      .filter((f) => f.difficulty === MYTHIC_DIFFICULTY)
      .sort((a, b) => a.startTime - b.startTime);

    const latestBossMap = new Map<string, { kills: WCLFight[]; wipes: WCLFight[] }>();
    for (const f of latestMythic) {
      if (!latestBossMap.has(f.name)) latestBossMap.set(f.name, { kills: [], wipes: [] });
      const entry = latestBossMap.get(f.name)!;
      if (f.kill) entry.kills.push(f);
      else entry.wipes.push(f);
    }

    let liveStatus: LiveRaidStatus;
    if (isActive && latestMythic.length > 0) {
      const lastFight = latestMythic[latestMythic.length - 1];
      const currentBossName = lastFight.kill ? null : lastFight.name;
      let bestTry: number | null = null;
      let pullCount = 0;

      if (currentBossName) {
        const entry = latestBossMap.get(currentBossName);
        if (entry) {
          pullCount = entry.kills.length + entry.wipes.length;
          const bestWipe = entry.wipes.reduce<WCLFight | null>(
            (best, f) =>
              f.bossPercentage != null && (!best || f.bossPercentage < best.bossPercentage)
                ? f : best,
            null
          );
          bestTry = bestWipe ? bestWipe.bossPercentage : null;
        }
      }
      liveStatus = {
        isActive: true,
        reportCode: latest.code,
        currentBoss: currentBossName,
        bestTry,
        pullCount,
        raidStart: latest.startTime,
      };
    } else {
      liveStatus = {
        isActive: false,
        reportCode: latest.code,
        currentBoss: null,
        bestTry: null,
        pullCount: 0,
        raidStart: null,
      };
    }

    // ── Aggregate boss progress across ALL reports ────────────────────────────
    type FightAbs = WCLFight & { absoluteStart: number; reportCode: string };
    const aggMap = new Map<string, { kills: FightAbs[]; wipes: FightAbs[] }>();

    for (let i = 0; i < reports.length; i++) {
      const fd = allFightData[i];
      if (!fd) continue;

      const mythicFights = fd.fights
        .filter((f) => f.difficulty === MYTHIC_DIFFICULTY)
        .sort((a, b) => a.startTime - b.startTime);

      for (const f of mythicFights) {
        if (!aggMap.has(f.name)) aggMap.set(f.name, { kills: [], wipes: [] });
        const entry = aggMap.get(f.name)!;
        const fa: FightAbs = {
          ...f,
          absoluteStart: fd.startTime + f.startTime,
          reportCode: reports[i].code,
        };
        if (f.kill) entry.kills.push(fa);
        else entry.wipes.push(fa);
      }
    }

    const bossProgress: BossProgress[] = Array.from(aggMap.entries()).map(
      ([name, { kills, wipes }]) => {
        const killed = kills.length > 0;
        // First kill across all reports = minimum absolute timestamp
        const firstKill = killed
          ? kills.reduce((earliest, k) =>
              k.absoluteStart < earliest.absoluteStart ? k : earliest
            )
          : null;

        const bestWipe = wipes.reduce<FightAbs | null>(
          (best, f) =>
            f.bossPercentage != null && (!best || f.bossPercentage < best.bossPercentage)
              ? f : best,
          null
        );

        return {
          name,
          killed,
          killTimestamp: firstKill?.absoluteStart ?? null,
          bestPercent: killed ? 0 : bestWipe ? bestWipe.bossPercentage : null,
          pullCount: kills.length + wipes.length,
          encounterID: (kills[0] ?? wipes[0])?.encounterID ?? null,
          firstKillReportCode: firstKill?.reportCode ?? null,
        };
      }
    );

    // Sort: killed first in chronological order, then un-killed
    bossProgress.sort((a, b) => {
      if (a.killed && b.killed) return (a.killTimestamp ?? 0) - (b.killTimestamp ?? 0);
      if (a.killed) return -1;
      if (b.killed) return 1;
      return 0;
    });

    // ── Recent kills (across all reports, most recent first) ─────────────────
    const recentKills: RecentKill[] = reports
      .flatMap((r, i) => {
        const fd = allFightData[i];
        if (!fd) return [];
        return fd.fights
          .filter((f) => f.difficulty === MYTHIC_DIFFICULTY && f.kill)
          .map((f) => ({
            boss: f.name,
            killTimestamp: fd.startTime + f.startTime,
            reportCode: r.code,
          }));
      })
      .sort((a, b) => b.killTimestamp - a.killTimestamp)
      .slice(0, 10);

    const zoneName = latestFightData.zone?.name ?? null;

    return { liveStatus, recentKills, bossProgress, zoneName };
  } catch (err) {
    console.error("[WCL] getWCLRaidData failed:", err);
    return EMPTY;
  }
}

// ─── Character parses (Armory) ────────────────────────────────────────────────

export type CharacterWCLStats = {
  avgParse: number | null;
  bestParse: { boss: string; percent: number; spec: string } | null;
  wclProfileUrl: string;
};

const CHAR_RANKINGS_QUERY = `
  query GetCharacterRankings($name: String!, $serverSlug: String!, $serverRegion: String!, $zoneID: Int!) {
    characterData {
      character(name: $name, serverSlug: $serverSlug, serverRegion: $serverRegion) {
        zoneRankings(zoneID: $zoneID, difficulty: 5)
      }
    }
  }
`;

export async function getCharacterWCLStats(
  characterName: string
): Promise<CharacterWCLStats | null> {
  const wclProfileUrl = `https://www.warcraftlogs.com/character/${REGION.toLowerCase()}/${REALM_SLUG}/${characterName.toLowerCase()}`;

  if (!ZONE_ID) return { avgParse: null, bestParse: null, wclProfileUrl };

  try {
    const data = await wclQuery<{
      characterData: {
        character: {
          zoneRankings: {
            bestPerformanceAverage?: number;
            rankings?: { encounter: { name: string }; rankPercent: number; spec: string }[];
          } | null;
        } | null;
      };
    }>(
      CHAR_RANKINGS_QUERY,
      { name: characterName, serverSlug: REALM_SLUG, serverRegion: REGION, zoneID: ZONE_ID },
      300
    );

    const zr = data.characterData?.character?.zoneRankings;
    if (!zr) return { avgParse: null, bestParse: null, wclProfileUrl };

    const avgParse = zr.bestPerformanceAverage != null
      ? Math.round(zr.bestPerformanceAverage)
      : null;

    const bestParse = (zr.rankings ?? []).reduce<CharacterWCLStats["bestParse"]>(
      (best, r) =>
        !best || r.rankPercent > best.percent
          ? { boss: r.encounter.name, percent: Math.round(r.rankPercent), spec: r.spec }
          : best,
      null
    );

    return { avgParse, bestParse, wclProfileUrl };
  } catch {
    return { avgParse: null, bestParse: null, wclProfileUrl };
  }
}

// ─── Guild Parses — batched single query ─────────────────────────────────────
// One GraphQL request with N aliases instead of N individual requests.

export type GuildParses = Record<string, number | null>; // characterName → avgParse

export async function getGuildParses(
  characterNames: string[]
): Promise<GuildParses> {
  if (!ZONE_ID || characterNames.length === 0) return {};

  // GraphQL alias names must be /[_a-zA-Z][_a-zA-Z0-9]*/
  const toAlias = (name: string) => `c_${name.replace(/[^a-zA-Z0-9]/g, "_")}`;

  const fields = characterNames
    .map(
      (name) =>
        `${toAlias(name)}: character(name: "${name}", serverSlug: $serverSlug, serverRegion: $serverRegion) { zoneRankings(zoneID: $zoneID, difficulty: 5) }`
    )
    .join("\n");

  const query = `
    query GuildParses($serverSlug: String!, $serverRegion: String!, $zoneID: Int!) {
      characterData {
        ${fields}
      }
    }
  `;

  try {
    const data = await wclQuery<{
      characterData: Record<string, { zoneRankings: { bestPerformanceAverage?: number } | null } | null>;
    }>(query, { serverSlug: REALM_SLUG, serverRegion: REGION, zoneID: ZONE_ID }, 300);

    const result: GuildParses = {};
    for (const name of characterNames) {
      const alias = toAlias(name);
      const zr = data.characterData?.[alias]?.zoneRankings;
      result[name] = zr?.bestPerformanceAverage != null
        ? Math.round(zr.bestPerformanceAverage)
        : null;
    }
    return result;
  } catch {
    return {};
  }
}
