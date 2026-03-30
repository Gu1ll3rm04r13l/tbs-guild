const WCL_CLIENT_ID = process.env.WCL_CLIENT_ID!;
const WCL_CLIENT_SECRET = process.env.WCL_CLIENT_SECRET!;
const GUILD_NAME = process.env.WCL_GUILD_NAME ?? "The Burning Seagull";
const REALM_SLUG = process.env.WCL_REALM_SLUG ?? "ragnaros";
const REGION = process.env.WCL_REGION ?? "US";

const ZONE_ID = parseInt(process.env.WCL_ZONE_ID ?? "0");
const ATTENDANCE_REPORTS = 10;

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
        fights(killType: Encounters) {
          id
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
): Promise<{ startTime: number; fights: WCLFight[] }> {
  const data = await wclQuery<{
    reportData: { report: { startTime: number; fights: WCLFight[] } };
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
};

export async function getWCLRaidData(): Promise<WCLRaidData> {
  try {
    const reports = await getRecentReports();
    if (reports.length === 0) return EMPTY;

    const [latest] = reports;
    const isActive = latest.endTime === 0;

    // Active raids get shorter cache to reflect pulls in near-real-time.
    // Completed raids can be cached longer.
    const fightsCacheTtl = isActive ? 60 : 300;

    const { startTime: reportStart, fights } = await getReportFights(
      latest.code,
      fightsCacheTtl
    );

    const mythicFights = fights
      .filter((f) => f.difficulty === MYTHIC_DIFFICULTY)
      .sort((a, b) => a.startTime - b.startTime); // ensure chronological order

    if (mythicFights.length === 0) {
      return {
        ...EMPTY,
        liveStatus: { ...EMPTY.liveStatus, isActive, reportCode: latest.code },
      };
    }

    // ── Build per-boss map ────────────────────────────────────────────────────
    const bossMap = new Map<string, { kills: WCLFight[]; wipes: WCLFight[] }>();
    for (const f of mythicFights) {
      if (!bossMap.has(f.name)) bossMap.set(f.name, { kills: [], wipes: [] });
      const entry = bossMap.get(f.name)!;
      if (f.kill) entry.kills.push(f);
      else entry.wipes.push(f);
    }

    // ── Boss progress ─────────────────────────────────────────────────────────
    const bossProgress: BossProgress[] = Array.from(bossMap.entries()).map(
      ([name, { kills, wipes }]) => {
        const killed = kills.length > 0;

        const killTimestamp = killed
          ? reportStart + Math.max(...kills.map((k) => k.startTime))
          : null;

        const bestWipe = wipes.reduce<WCLFight | null>(
          (best, f) =>
            f.bossPercentage != null &&
            (!best || f.bossPercentage < best.bossPercentage)
              ? f
              : best,
          null
        );

        return {
          name,
          killed,
          killTimestamp,
          bestPercent: killed ? 0 : bestWipe ? bestWipe.bossPercentage : null,
          pullCount: kills.length + wipes.length,
        };
      }
    );

    // ── Recent kills ──────────────────────────────────────────────────────────
    const recentKills: RecentKill[] = mythicFights
      .filter((f) => f.kill)
      .sort((a, b) => b.startTime - a.startTime)
      .slice(0, 10)
      .map((f) => ({
        boss: f.name,
        killTimestamp: reportStart + f.startTime,
        reportCode: latest.code,
      }));

    // ── Live status ───────────────────────────────────────────────────────────
    let liveStatus: LiveRaidStatus;

    if (isActive) {
      // Current boss = last fight pulled that hasn't been killed yet
      const lastFight = mythicFights[mythicFights.length - 1];
      const currentBossName = lastFight.kill ? null : lastFight.name;

      let bestTry: number | null = null;
      let pullCount = 0;

      if (currentBossName) {
        const entry = bossMap.get(currentBossName);
        if (entry) {
          pullCount = entry.kills.length + entry.wipes.length;
          const bestWipe = entry.wipes.reduce<WCLFight | null>(
            (best, f) =>
              f.bossPercentage != null &&
              (!best || f.bossPercentage < best.bossPercentage)
                ? f
                : best,
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

    return { liveStatus, recentKills, bossProgress };
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

// ─── Guild Attendance & Loot ──────────────────────────────────────────────────

export type AttendanceEntry = {
  name: string;
  attended: number;       // reports present in
  total: number;          // reports analyzed
  attendancePct: number;  // 0–100
  lootReceived: number;
  ratio: number | null;   // loot per raid attended
};

const ATTENDANCE_QUERY = `
  query GetGuildAttendance($guildName: String!, $serverSlug: String!, $serverRegion: String!, $limit: Int!) {
    reportData {
      reports(
        guildName: $guildName
        guildServerSlug: $serverSlug
        guildServerRegion: $serverRegion
        limit: $limit
      ) {
        data {
          code
          startTime
          masterData(translate: false) {
            actors { name type }
          }
          events(
            dataType: Loot
            difficulty: 5
            startTime: 0
            endTime: 99999999
            limit: 500
          ) {
            data
          }
        }
      }
    }
  }
`;

export async function getGuildAttendance(): Promise<AttendanceEntry[]> {
  try {
    const data = await wclQuery<{
      reportData: {
        reports: {
          data: {
            code: string;
            masterData: { actors: { name: string; type: string }[] };
            events: { data: unknown[] };
          }[];
        };
      };
    }>(ATTENDANCE_QUERY, {
      guildName: GUILD_NAME,
      serverSlug: REALM_SLUG,
      serverRegion: REGION,
      limit: ATTENDANCE_REPORTS,
    }, 300);

    const reports = data.reportData.reports.data ?? [];
    if (!reports.length) return [];

    // Count per-player attendance and loot
    const playerMap = new Map<string, { attended: number; loot: number }>();

    for (const report of reports) {
      const players = new Set(
        (report.masterData?.actors ?? [])
          .filter((a) => a.type === "Player")
          .map((a) => a.name)
      );

      for (const name of players) {
        if (!playerMap.has(name)) playerMap.set(name, { attended: 0, loot: 0 });
        playerMap.get(name)!.attended += 1;
      }

      // Count loot events per player
      for (const event of report.events?.data ?? []) {
        const e = event as { targetID?: number; type?: string };
        // WCL loot events have targetID → resolve via actors
        const actors = report.masterData?.actors ?? [];
        if (e.targetID != null) {
          const actor = actors[e.targetID - 1];
          if (actor?.type === "Player") {
            const entry = playerMap.get(actor.name);
            if (entry) entry.loot += 1;
          }
        }
      }
    }

    const total = reports.length;

    return Array.from(playerMap.entries())
      .map(([name, { attended, loot }]) => ({
        name,
        attended,
        total,
        attendancePct: Math.round((attended / total) * 100),
        lootReceived: loot,
        ratio: attended > 0 ? Math.round((loot / attended) * 10) / 10 : null,
      }))
      .filter((e) => e.attendancePct >= 10) // filter out occasional guests
      .sort((a, b) => b.attendancePct - a.attendancePct || a.name.localeCompare(b.name));
  } catch (err) {
    console.error("[WCL] getGuildAttendance failed:", err);
    return [];
  }
}
