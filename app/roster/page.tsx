import type { Metadata } from "next";
import { Users, AlertTriangle, Flame } from "lucide-react";
import { RosterGrid } from "@/components/roster/RosterGrid";
import { getGuildRoster, getCharacterProfile, getCharacterMedia } from "@/lib/blizzard";
import type { RosterMember } from "@/components/roster/RosterGrid";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Roster",
  description: "The Burning Seagull guild roster — live character data from Blizzard.",
};

const DISPLAY_RANKS = [0, 1, 2, 3, 4];

async function buildRoster(): Promise<{ members: RosterMember[]; error: boolean }> {
  const rawMembers = await getGuildRoster();
  if (rawMembers.length === 0) return { members: [], error: true };

  const filtered = rawMembers
    .filter((m) => DISPLAY_RANKS.includes(m.rank))
    .sort((a, b) => a.rank - b.rank || a.character.name.localeCompare(b.character.name));

  const top = filtered.slice(0, 40);
  const enriched = await Promise.allSettled(
    top.map(async (m): Promise<RosterMember> => {
      const realm = m.character.realm.slug;
      const name = m.character.name;
      const [profile, avatarUrl] = await Promise.all([
        getCharacterProfile(realm, name),
        getCharacterMedia(realm, name),
      ]);
      return {
        name,
        realm,
        rank: m.rank,
        characterClass: profile?.character_class?.name ?? m.character.playable_class?.name ?? "Unknown",
        avatarUrl,
        stats: profile ? {
          equipped_item_level: profile.equipped_item_level,
          average_item_level: profile.average_item_level,
          active_spec: profile.active_spec,
          character_class: profile.character_class,
        } : null,
      };
    })
  );

  const members = enriched
    .filter((r): r is PromiseFulfilledResult<RosterMember> => r.status === "fulfilled")
    .map((r) => r.value);

  return { members, error: false };
}

export default async function RosterPage() {
  const { members, error } = await buildRoster();

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
          Could not load roster from Blizzard API. Check your environment configuration.
        </div>
      )}

      <RosterGrid members={members} />
    </div>
  );
}
