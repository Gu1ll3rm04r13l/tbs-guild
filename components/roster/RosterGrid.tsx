import { RosterCard } from "./RosterCard";

export type RosterMember = {
  name: string;
  realm: string;
  rank: number;
  characterClass: string;
  avatarUrl?: string | null;
  stats?: {
    equipped_item_level?: number;
    average_item_level?: number;
    active_spec?: { name: string };
    character_class?: { name: string };
  } | null;
};

type RosterGridProps = {
  members: RosterMember[];
};

export function RosterGrid({ members }: RosterGridProps) {
  if (members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-[#6b7280] text-sm">No roster data available.</p>
        <p className="text-[#6b7280] text-xs mt-1">Check your Blizzard API configuration.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {members.map((m) => (
        <RosterCard
          key={`${m.name}-${m.realm}`}
          name={m.name}
          realm={m.realm}
          rank={m.rank}
          characterClass={m.characterClass}
          avatarUrl={m.avatarUrl}
          stats={m.stats}
        />
      ))}
    </div>
  );
}
