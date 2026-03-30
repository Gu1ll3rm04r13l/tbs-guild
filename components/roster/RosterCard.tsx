"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Shield, Swords, HeartPulse, Star } from "lucide-react";
import { cn, getClassColor } from "@/lib/utils";

type CharacterStats = {
  equipped_item_level?: number;
  average_item_level?: number;
  active_spec?: { name: string };
  character_class?: { name: string };
};

type RosterCardProps = {
  name: string;
  realm: string;
  rank: number;
  characterClass: string;
  avatarUrl?: string | null;
  stats?: CharacterStats | null;
  raidProgress?: { bossesDown: number; totalBosses: number; summary: string } | null;
  mythicScore?: { score: number; color: string } | null;
};

const ROLE_BY_SPEC: Record<string, "tank" | "healer" | "dps"> = {
  "blood": "tank", "protection": "tank", "guardian": "tank", "brewmaster": "tank", "vengeance": "tank",
  "holy": "healer", "discipline": "healer", "restoration": "healer", "mistweaver": "healer", "preservation": "healer",
};

function inferRole(specName: string): "tank" | "healer" | "dps" {
  return ROLE_BY_SPEC[specName.toLowerCase()] ?? "dps";
}

function RoleIcon({ role }: { role: "tank" | "healer" | "dps" }) {
  if (role === "tank")   return <Shield     className="h-3 w-3 text-sky-400" />;
  if (role === "healer") return <HeartPulse className="h-3 w-3 text-green-400" />;
  return                        <Swords     className="h-3 w-3 text-red-400" />;
}

const RANK_LABELS: Record<number, string> = {
  0: "Guild Master",
  1: "Officer",
  4: "Raider",
};

export function RosterCard({ name, rank, characterClass, avatarUrl, stats, raidProgress, mythicScore }: RosterCardProps) {
  const [hovered, setHovered] = useState(false);
  const [imgError, setImgError] = useState(false);
  const classColor = getClassColor(characterClass);
  const specName = stats?.active_spec?.name ?? "";
  const role = specName ? inferRole(specName) : "dps";
  const ilvl = stats?.equipped_item_level;
  const rankLabel = RANK_LABELS[rank] ?? `Rank ${rank}`;

  return (
    <Link
      href={`/armory/${encodeURIComponent(name)}`}
      className={cn(
        "group relative overflow-hidden rounded-lg border bg-[#111009] transition-all duration-200 block",
        hovered
          ? "border-[#3d3220] shadow-lg shadow-black/60"
          : "border-[#2a2318]"
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Class color top line */}
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: classColor }} />

      {/* Hover glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at top, ${classColor}08 0%, transparent 70%)` }}
      />

      <div className="p-4 flex items-center gap-3">
        {/* Avatar */}
        <div className="relative h-12 w-12 rounded overflow-hidden bg-[#080706] border border-[#2a2318] shrink-0">
          {avatarUrl && !imgError ? (
            <Image
              src={avatarUrl}
              alt={name}
              fill
              className="object-cover"
              sizes="48px"
              onError={() => setImgError(true)}
            />
          ) : (
            <div
              className="h-full w-full flex items-center justify-center text-lg font-black"
              style={{ color: classColor }}
            >
              {name[0].toUpperCase()}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm truncate" style={{ color: classColor }}>
              {name}
            </span>
            {rank <= 1 && <Star className="h-3 w-3 text-[#F0B830] shrink-0 fill-[#F0B830]" />}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <RoleIcon role={role} />
            <span className="text-xs text-[#6b5e50] truncate">
              {specName ? `${specName} · ` : ""}{characterClass}
            </span>
          </div>
        </div>

        {/* ilvl — revealed on hover */}
        {ilvl && (
          <div className={cn(
            "shrink-0 text-right transition-all duration-200",
            hovered ? "opacity-100" : "opacity-0"
          )}>
            <span className="font-mono text-sm font-black text-[#F0B830]">{ilvl}</span>
            <p className="text-[10px] text-[#6b5e50]">ilvl</p>
          </div>
        )}
      </div>

      {/* Bottom stats row */}
      <div className="px-4 pb-3 flex items-center gap-2 text-xs font-mono">
        <span className="text-[#6b5e50] flex-1">{rankLabel}</span>

        {raidProgress && (
          <span className="text-[#D4960A]" title="Mythic progress (current tier)">
            {raidProgress.summary}
          </span>
        )}

        <span
          style={{ color: mythicScore ? mythicScore.color : "#3d3220" }}
          title="Mythic+ score (Raider.io)"
        >
          {mythicScore ? mythicScore.score.toLocaleString() : "—"} io
        </span>
      </div>
    </Link>
  );
}
