const REGION = process.env.BLIZZARD_REGION ?? "eu";
const CLIENT_ID = process.env.BLIZZARD_CLIENT_ID!;
const CLIENT_SECRET = process.env.BLIZZARD_CLIENT_SECRET!;
const REALM_SLUG = process.env.BLIZZARD_REALM_SLUG ?? "";
const GUILD_SLUG = process.env.BLIZZARD_GUILD_SLUG ?? "";
const LOCALE = process.env.BLIZZARD_LOCALE ?? "en_GB";

const TOKEN_URL = `https://${REGION}.battle.net/oauth/token`;
const API_BASE = `https://${REGION}.api.blizzard.com`;

// ─── Token cache (module-level, server only) ──────────────────────────────────
let cachedToken: string | null = null;
let tokenExpiry = 0;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

  const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`Blizzard token request failed: ${res.status}`);

  const data = await res.json();
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  return cachedToken!;
}

async function blizzardFetch<T>(
  path: string,
  namespace: string,
  revalidate?: number
): Promise<T> {
  const token = await getAccessToken();
  const url = `${API_BASE}${path}?namespace=${namespace}&locale=${LOCALE}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    next: revalidate !== undefined ? { revalidate } : undefined,
  });

  if (!res.ok) {
    throw new Error(`Blizzard API error ${res.status} for ${path}`);
  }
  return res.json();
}

// ─── Guild roster ─────────────────────────────────────────────────────────────
export type GuildMember = {
  character: {
    name: string;
    id: number;
    realm: { slug: string };
    playable_class?: { name: string };
  };
  rank: number;
};

export async function getGuildRoster(): Promise<GuildMember[]> {
  try {
    const data = await blizzardFetch<{ members: GuildMember[] }>(
      `/data/wow/guild/${REALM_SLUG}/${GUILD_SLUG}/roster`,
      `profile-${REGION}`,
      3600
    );
    return data.members ?? [];
  } catch {
    return [];
  }
}

// ─── Character profile ────────────────────────────────────────────────────────
export type CharacterProfile = {
  name: string;
  realm: { slug: string; name: string };
  level: number;
  average_item_level: number;
  equipped_item_level: number;
  active_spec: { name: string };
  character_class: { name: string };
  guild?: { name: string };
  last_login_timestamp?: number;
};

export async function getCharacterProfile(
  realmSlug: string,
  characterName: string
): Promise<CharacterProfile | null> {
  try {
    return await blizzardFetch<CharacterProfile>(
      `/profile/wow/character/${realmSlug}/${characterName.toLowerCase()}`,
      `profile-${REGION}`,
      3600
    );
  } catch {
    return null;
  }
}

// ─── Character media (avatar) ─────────────────────────────────────────────────
export type CharacterMedia = {
  assets?: { key: string; value: string }[];
};

export async function getCharacterMedia(
  realmSlug: string,
  characterName: string
): Promise<string | null> {
  try {
    const data = await blizzardFetch<CharacterMedia>(
      `/profile/wow/character/${realmSlug}/${characterName.toLowerCase()}/character-media`,
      `profile-${REGION}`,
      3600
    );
    return (
      data.assets?.find((a) => a.key === "avatar")?.value ??
      data.assets?.[0]?.value ??
      null
    );
  } catch {
    return null;
  }
}

// ─── Raid progress (current tier) ─────────────────────────────────────────────
export type RaidBoss = {
  id: number;
  name: string;
  kill?: { completed_timestamp: number };
};

export type RaidEncounters = {
  expansions?: {
    expansion: { name: string };
    instances: {
      instance: { name: string };
      modes: {
        difficulty: { type: string; name: string };
        progress: { completed_count: number; total_count: number; encounters: RaidBoss[] };
      }[];
    }[];
  }[];
};

export async function getGuildRaidProgress(): Promise<RaidEncounters | null> {
  try {
    return await blizzardFetch<RaidEncounters>(
      `/data/wow/guild/${REALM_SLUG}/${GUILD_SLUG}/achievements`,
      `profile-${REGION}`,
      3600
    );
  } catch {
    return null;
  }
}
