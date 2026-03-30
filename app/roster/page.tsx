import type { Metadata } from "next";
import { Users, AlertTriangle, Flame } from "lucide-react";
import { RosterGrid } from "@/components/roster/RosterGrid";
import { getGuildRoster, getCharacterProfile, getCharacterMedia } from "@/lib/blizzard";
import { getCharacterStats } from "@/lib/raiderio";
import type { RosterMember } from "@/components/roster/RosterGrid";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Roster",
  description: "The Burning Seagull guild roster — live character data from Blizzard.",
};

// Guildmaster (0), Officer (1), Raider (4)
const DISPLAY_RANKS = [0, 1, 4];
const MAX_LEVEL = 80;

async function buildRoster(): Promise<{ members: RosterMember[]; error: boolean; partialFail: number }> {
  const rawMembers = await getGuildRoster();
  if (rawMembers.length === 0) return { members: [], error: true, partialFail: 0 };

  const filtered = rawMembers
    .filter(
      (m) =>
        DISPLAY_RANKS.includes(m.rank) &&
        (m.character.level === undefined || m.character.level >= MAX_LEVEL)
    )
    .sort((a, b) => a.rank - b.rank || a.character.name.localeCompare(b.character.name));

  const enriched = await Promise.allSettled(
    filtered.map(async (m): Promise<RosterMember> => {
      const realm = m.character.realm.slug;
      const name = m.character.name;
      const [profile, avatarUrl, charStats] = await Promise.all([
        getCharacterProfile(realm, name),
        getCharacterMedia(realm, name),
        getCharacterStats(realm, name),
      ]);
      return {
        name,
        realm,
        rank: m.rank,
        characterClass: profile?.character_class?.name ?? m.character.playable_class?.name ?? "Unknown",
        avatarUrl,
        stats: profile
          ? {
              equipped_item_level: profile.equipped_item_level,
              average_item_level: profile.average_item_level,
              active_spec: profile.active_spec,
              character_class: profile.character_class,
            }
          : null,
        raidProgress: charStats.raidProgress,
        mythicScore: charStats.mythicScore,
      };
    })
  );

  const members = enriched
    .filter((r): r is PromiseFulfilledResult<RosterMember> => r.status === "fulfilled")
    .map((r) => r.value);

  const partialFail = enriched.filter((r) => r.status === "rejected").length;

  return { members, error: false, partialFail };
}

export default async function RosterPage() {
  const { members, error, partialFail } = await buildRoster();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Flame className="h-3.5 w-3.5 text-[#E8560A]" />
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-[#E8560A]">
              Guild Roster
            </p>
          </div>
          <h1 className="text-2xl font-black text-[#f5efe8] flex items-center gap-2.5">
            <Users className="h-6 w-6 text-[#6b5e50]" />
            Active Members
          </h1>
        </div>
        <p className="text-xs text-[#6b5e50] font-mono">
          {members.length} members · updated hourly
        </p>
      </div>

      {/* Top accent line */}
      <div className="h-px w-full bg-gradient-to-r from-[#E8560A]/40 via-[#D4960A]/20 to-transparent" />

      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-[#E8560A]/20 bg-[#E8560A]/5 px-4 py-3 text-sm text-[#E8560A]">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          Could not load roster from Blizzard API. Showing cached data if available.
        </div>
      )}

      {!error && partialFail > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-[#D4960A]/20 bg-[#D4960A]/5 px-4 py-3 text-sm text-[#D4960A]">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {partialFail} character{partialFail > 1 ? "s" : ""} could not be loaded from Blizzard API and may be missing from the list.
        </div>
      )}

      <RosterGrid members={members} />
    </div>
  );
}
