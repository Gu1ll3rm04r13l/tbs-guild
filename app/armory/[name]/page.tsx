import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCharacterProfile, getCharacterMedia } from "@/lib/blizzard";
import { getCharacterStats } from "@/lib/raiderio";
import { getCharacterWCLStats } from "@/lib/warcraftlogs";
import { createAdminClient } from "@/lib/supabase";
import { ArmoryClient } from "./ArmoryClient";
import type { ArmoryClientProps } from "./ArmoryClient";

const REALM_SLUG = process.env.BLIZZARD_REALM_SLUG ?? "ragnaros";

const RANK_LABELS: Record<number, string> = {
  0: "Guild Master",
  1: "Officer",
  4: "Raider",
};

const ROLE_BY_SPEC: Record<string, "tank" | "healer" | "dps"> = {
  blood: "tank", protection: "tank", guardian: "tank", brewmaster: "tank", vengeance: "tank",
  holy: "healer", discipline: "healer", restoration: "healer", mistweaver: "healer", preservation: "healer",
};

export async function generateMetadata(
  { params }: { params: Promise<{ name: string }> }
): Promise<Metadata> {
  const { name } = await params;
  const charName = decodeURIComponent(name);
  return {
    title: `${charName} — Armería`,
    description: `Perfil de ${charName} en The Burning Seagull.`,
  };
}

export default async function ArmoryPage(
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;
  const charName = decodeURIComponent(name);

  // Fetch everything in parallel
  const [profile, avatarUrl, charStats, wclStats, armoryRow, session] = await Promise.all([
    getCharacterProfile(REALM_SLUG, charName),
    getCharacterMedia(REALM_SLUG, charName),
    getCharacterStats(REALM_SLUG, charName),
    getCharacterWCLStats(charName),
    createAdminClient()
      .from("character_armory")
      .select("notes,rio_link,logs_link,media_url")
      .eq("char_name", charName)
      .eq("realm_slug", REALM_SLUG)
      .maybeSingle()
      .then((r) => r.data),
    getServerSession(authOptions),
  ]);

  if (!profile) notFound();

  // Determine edit permission
  const user = session?.user as {
    isOfficer?: boolean;
    battleTag?: string | null;
    guildRank?: string | null;
  } | undefined;

  let canEdit = false;
  if (user?.battleTag) {
    const { data: userProfile } = await createAdminClient()
      .from("profiles")
      .select("main_char_name")
      .eq("battle_tag", user.battleTag)
      .maybeSingle();
    canEdit = userProfile?.main_char_name?.toLowerCase() === charName.toLowerCase();
  }

  const specName = profile.active_spec?.name ?? "";
  const role = ROLE_BY_SPEC[specName.toLowerCase()] ?? "dps";
  const rankLabel = RANK_LABELS[profile.level] ?? "Miembro"; // fallback

  const props: ArmoryClientProps = {
    charName,
    characterClass: profile.character_class?.name ?? "Unknown",
    specName,
    role,
    rank: 4, // default — not returned by character profile endpoint
    rankLabel: rankLabel,
    ilvl: profile.equipped_item_level ?? null,
    lastLogin: profile.last_login_timestamp ?? null,
    avatarUrl: avatarUrl ?? null,
    canEdit,
    armoryData: {
      notes: armoryRow?.notes ?? null,
      rio_link: armoryRow?.rio_link ?? null,
      logs_link: armoryRow?.logs_link ?? null,
      media_url: armoryRow?.media_url ?? null,
    },
    wclStats: wclStats ?? null,
    raidProgress: charStats.raidProgress ?? null,
    mythicScore: charStats.mythicScore ?? null,
  };

  return <ArmoryClient {...props} />;
}
