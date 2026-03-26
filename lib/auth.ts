import type { NextAuthOptions } from "next-auth";
import { createAdminClient } from "@/lib/supabase";

const OFFICER_RANKS = ["guildmaster", "officer", "class-lead"];

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
      token: `https://${process.env.BLIZZARD_REGION}.battle.net/oauth/token`,
      userinfo: `https://${process.env.BLIZZARD_REGION}.battle.net/oauth/userinfo`,
      clientId: process.env.BLIZZARD_CLIENT_ID!,
      clientSecret: process.env.BLIZZARD_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: String(profile.id ?? profile.sub),
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
    async signIn({ user }) {
      try {
        const adminClient = createAdminClient();
        const battleTag = (user as { battleTag?: string }).battleTag ?? user.name ?? "";

        const { data: existing } = await adminClient
          .from("profiles")
          .select("id")
          .eq("battle_tag", battleTag)
          .maybeSingle();

        if (!existing) {
          await adminClient.from("profiles").insert({
            id: user.id,
            battle_tag: battleTag,
            guild_rank: null,
            main_char_name: null,
            avatar_url: null,
          });
        }
      } catch {
        // Non-blocking — allow sign in even if DB write fails
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.battleTag = (user as { battleTag?: string }).battleTag ?? user.name;
        token.sub = user.id;
      }
      // Fetch guild rank on each token refresh
      if (token.sub) {
        try {
          const adminClient = createAdminClient();
          const { data: profile } = await adminClient
            .from("profiles")
            .select("guild_rank")
            .eq("id", token.sub)
            .maybeSingle();
          token.guildRank = profile?.guild_rank ?? null;
        } catch {
          // keep existing rank
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
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
    error: "/",
  },
};

export { OFFICER_RANKS };
