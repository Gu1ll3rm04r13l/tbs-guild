import type { NextAuthOptions } from "next-auth";
import { createAdminClient } from "@/lib/supabase";

const OFFICER_RANKS = ["guildmaster", "officer", "class-lead"];

// Numeric guild rank → name mapping (rank 0 = GM, always)
const RANK_INDEX_TO_NAME: Record<number, string> = {
  0: "guildmaster",
  1: "officer",
  2: "class-lead",
};

/**
 * Fetches the user's WoW characters (via their OAuth access token),
 * cross-references with the guild roster, and returns:
 *   - rank name string → character is in the guild
 *   - null             → character is NOT in the guild (or not on realm)
 *   - undefined        → API call failed; caller should skip updating rank
 */
async function detectGuildRank(accessToken: string): Promise<string | null | undefined> {
  const REGION = process.env.BLIZZARD_REGION ?? "us";
  const REALM_SLUG = process.env.BLIZZARD_REALM_SLUG ?? "";

  try {
    // 1. Fetch the Battle.net account's WoW characters
    const charsRes = await fetch(
      `https://${REGION}.api.blizzard.com/profile/user/wow?namespace=profile-${REGION}&locale=en_US`,
      { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" }
    );
    if (!charsRes.ok) {
      console.error("[auth] detectGuildRank: /profile/user/wow returned", charsRes.status);
      return undefined; // API error — don't wipe existing rank
    }
    const charsData = await charsRes.json();
    const characters: { name: string; realm: { slug: string } }[] = (
      charsData.wow_accounts ?? []
    ).flatMap(
      (acc: { characters?: { name: string; realm: { slug: string } }[] }) =>
        acc.characters ?? []
    ).filter((c: { realm: { slug: string } }) => c.realm.slug === REALM_SLUG);

    if (!characters.length) return null; // No characters on guild realm

    // 2. Fetch guild roster (uses client-credentials + ISR cache)
    const { getGuildRoster } = await import("@/lib/blizzard");
    const roster = await getGuildRoster();
    if (!roster.length) {
      console.error("[auth] detectGuildRank: guild roster empty or unavailable");
      return undefined; // Can't verify — don't wipe rank
    }

    // 3. Find the highest rank (lowest index) among the user's characters
    let bestRankIndex: number | null = null;
    for (const char of characters) {
      const member = roster.find(
        (m) => m.character.name.toLowerCase() === char.name.toLowerCase()
      );
      if (member !== undefined) {
        if (bestRankIndex === null || member.rank < bestRankIndex) {
          bestRankIndex = member.rank;
        }
      }
    }

    if (bestRankIndex === null) return null; // Not in guild
    return RANK_INDEX_TO_NAME[bestRankIndex] ?? `rank-${bestRankIndex}`;
  } catch (err) {
    console.error("[auth] detectGuildRank error:", err);
    return undefined; // Unknown error — don't wipe rank
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    {
      id: "battlenet",
      name: "Battle.net",
      type: "oauth",
      authorization: {
        url: `https://${process.env.BLIZZARD_REGION}.battle.net/oauth/authorize`,
        params: { scope: "openid wow.profile" },
      },
      token: {
        url: `https://${process.env.BLIZZARD_REGION}.battle.net/oauth/token`,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        async request({ provider, params }: any) {
          const creds = Buffer.from(`${provider.clientId}:${provider.clientSecret}`).toString("base64");
          const res = await fetch(`https://${process.env.BLIZZARD_REGION}.battle.net/oauth/token`, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Authorization: `Basic ${creds}`,
            },
            body: new URLSearchParams({
              grant_type: "authorization_code",
              code: params.code ?? "",
              redirect_uri: provider.callbackUrl,
            }),
          });
          if (!res.ok) {
            const text = await res.text();
            console.error("[auth] token HTTP error:", res.status, text);
            throw new Error(`token exchange failed: ${res.status}`);
          }
          const tokens = await res.json();
          console.log("[auth] token OK, scope:", tokens.scope);
          return { tokens };
        },
      },
      userinfo: {
        url: `https://${process.env.BLIZZARD_REGION}.battle.net/oauth/userinfo`,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        async request({ tokens }: any) {
          const res = await fetch(
            `https://${process.env.BLIZZARD_REGION}.battle.net/oauth/userinfo`,
            { headers: { Authorization: `Bearer ${tokens.access_token}` } }
          );
          if (!res.ok) {
            const text = await res.text();
            console.error("[auth] userinfo HTTP error:", res.status, text);
            throw new Error(`userinfo ${res.status}`);
          }
          const data = await res.json();
          console.log("[auth] userinfo OK:", JSON.stringify(data));
          return data;
        },
      },
      checks: ["state"],
      clientId: process.env.BLIZZARD_CLIENT_ID!,
      clientSecret: process.env.BLIZZARD_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: String(profile.sub),
          name: profile.battletag,
          email: null,
          image: null,
          battleTag: profile.battletag,
        };
      },
    },
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user, account }) {
      try {
        const adminClient = createAdminClient();
        const battleTag = (user as { battleTag?: string }).battleTag ?? user.name ?? "";

        // Detect guild rank from Blizzard API using the fresh OAuth access token
        const accessToken = account?.access_token;
        const detectedRank = accessToken
          ? await detectGuildRank(accessToken)
          : undefined;

        const { data: existing } = await adminClient
          .from("profiles")
          .select("id")
          .eq("battle_tag", battleTag)
          .maybeSingle();

        if (!existing) {
          // New user — insert with detected rank (may be null if not in guild)
          const { randomUUID } = await import("crypto");
          await adminClient.from("profiles").insert({
            id: randomUUID(),
            battle_tag: battleTag,
            guild_rank: detectedRank ?? null,
            main_char_name: null,
            avatar_url: null,
          });
        } else if (detectedRank !== undefined) {
          // Existing user — sync rank on every login (undefined = API error, skip update)
          await adminClient
            .from("profiles")
            .update({ guild_rank: detectedRank })
            .eq("battle_tag", battleTag);
        }
      } catch (err) {
        console.error("[auth] signIn Supabase error:", err);
        // Non-blocking — allow sign in even if DB write fails
      }
      return true;
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.battleTag = (user as { battleTag?: string }).battleTag ?? user.name;
        token.sub = user.id;
      }
      // Persist the user's access token so server routes can call wow.profile APIs
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      // Fetch guild rank by battle_tag (not by id — bnet id is numeric, not uuid)
      if (token.battleTag) {
        try {
          const adminClient = createAdminClient();
          const { data: profile } = await adminClient
            .from("profiles")
            .select("guild_rank, main_char_name, avatar_url")
            .eq("battle_tag", token.battleTag as string)
            .maybeSingle();
          token.guildRank    = profile?.guild_rank    ?? null;
          token.mainCharName = profile?.main_char_name ?? null;
          token.avatarUrl    = profile?.avatar_url    ?? null;
        } catch (err) {
          console.error("[auth] jwt Supabase error:", err);
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        (session.user as { id?: string }).id = token.sub as string;
        (session.user as { battleTag?: string | null }).battleTag = token.battleTag as string | null;
        (session.user as { guildRank?: string | null }).guildRank = token.guildRank as string | null;
        (session.user as { isOfficer?: boolean }).isOfficer = OFFICER_RANKS.includes(
          (token.guildRank as string) ?? ""
        );
        (session.user as { accessToken?: string }).accessToken = token.accessToken as string ?? undefined;
        (session.user as { mainCharName?: string | null }).mainCharName = token.mainCharName as string | null;
        (session.user as { avatarUrl?: string | null }).avatarUrl = token.avatarUrl as string | null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
};

export { OFFICER_RANKS };
