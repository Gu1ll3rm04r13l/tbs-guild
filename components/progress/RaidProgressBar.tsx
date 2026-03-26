import { cn } from "@/lib/utils";

type Boss = {
  id: number;
  name: string;
  defeated: boolean;
};

type RaidProgressBarProps = {
  raidName: string;
  bossesDown: number;
  totalBosses: number;
  bosses?: Boss[];
  difficulty?: string;
};

export function RaidProgressBar({
  raidName,
  bossesDown,
  totalBosses,
  bosses,
  difficulty = "Mythic",
}: RaidProgressBarProps) {
  const percentage = totalBosses > 0 ? (bossesDown / totalBosses) * 100 : 0;
  const isFullClear = bossesDown === totalBosses;

  return (
    <div className="w-full space-y-3">
      <div className="flex items-baseline justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-bold text-[#f5efe8] tracking-tight">{raidName}</h2>
          <span className={cn(
            "text-xs font-mono font-medium uppercase tracking-widest border px-2 py-0.5 rounded",
            isFullClear
              ? "text-[#F0B830] border-[#E8560A]/40 bg-[#E8560A]/10"
              : "text-[#E8560A] border-[#E8560A]/30 bg-[#E8560A]/5"
          )}>
            {difficulty}
          </span>
        </div>
        <span className="font-mono text-2xl font-black">
          <span className="text-[#F0B830]">{bossesDown}</span>
          <span className="text-[#3d3220]">/{totalBosses}</span>
        </span>
      </div>

      {/* Progress track */}
      <div className="relative h-2 w-full rounded-full bg-[#1a1710] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${percentage}%`,
            background: isFullClear
              ? "linear-gradient(90deg, #C41A00, #E8560A, #F0B830, #FFD700)"
              : "linear-gradient(90deg, #C41A00, #E8560A, #D4960A)",
            boxShadow: "0 0 8px rgba(232, 86, 10, 0.5)",
          }}
        />
      </div>

      {/* Boss dots */}
      {bosses && bosses.length > 0 && (
        <div className="flex gap-1.5 flex-wrap">
          {bosses.map((boss, i) => (
            <BossIcon key={boss.id ?? i} name={boss.name} defeated={boss.defeated} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

type BossIconProps = {
  name: string;
  defeated: boolean;
  index: number;
};

function BossIcon({ name, defeated, index }: BossIconProps) {
  return (
    <div
      title={name}
      className={cn(
        "relative flex h-8 w-8 items-center justify-center rounded border text-xs font-mono font-bold transition-all",
        defeated
          ? "border-[#E8560A]/50 bg-gradient-to-b from-[#E8560A]/20 to-[#C41A00]/10 text-[#F0B830]"
          : "border-[#2a2318] bg-[#111009] text-[#3d3220]"
      )}
    >
      {index + 1}
      {defeated && (
        <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-[#E8560A] shadow-[0_0_4px_rgba(232,86,10,0.8)]" />
      )}
    </div>
  );
}
