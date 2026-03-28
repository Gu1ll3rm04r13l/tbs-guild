import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Users, ScrollText, Flame, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RaidProgressBar } from "@/components/progress/RaidProgressBar";
import { LiveTicker } from "@/components/live/LiveTicker";
import { LiveCombatWidget } from "@/components/live/LiveCombatWidget";
import { KillFeed } from "@/components/live/KillFeed";
import { ServerLeaderboard } from "@/components/leaderboard/ServerLeaderboard";
import { createAdminClient } from "@/lib/supabase";
import { getWCLRaidData } from "@/lib/warcraftlogs";
import { getServerLeaderboard } from "@/lib/raiderio";

async function getRaidProgressData() {
  try {
    const adminClient = createAdminClient();
    const { data } = await adminClient
      .from("raid_progress")
      .select("*")
      .order("bosses_down", { ascending: false });
    return data ?? [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [progressList, wclData, leaderboard] = await Promise.all([
    getRaidProgressData(),
    getWCLRaidData(),
    getServerLeaderboard(),
  ]);

  return (
    <div>
      {/* ══════════════════════════════════════════
          HERO — Cinematic Banner
      ══════════════════════════════════════════ */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">

        {/* Background: cinematic banner image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/logo-banner.png"
            alt="The Burning Seagull banner"
            fill
            className="object-cover object-center"
            priority
            sizes="100vw"
          />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#080706]/95 via-[#080706]/70 to-[#080706]/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080706] via-transparent to-[#080706]/40" />
        </div>

        {/* Ember particles (pure CSS) */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="ember-particle absolute rounded-full"
              style={{
                width: `${2 + (i % 3)}px`,
                height: `${2 + (i % 3)}px`,
                background: i % 2 === 0 ? "#E8560A" : "#F0B830",
                left: `${10 + i * 11}%`,
                bottom: `${15 + (i % 4) * 10}%`,
                animationDuration: `${3 + i * 0.7}s`,
                animationDelay: `${i * 0.4}s`,
                opacity: 0.7,
              }}
            />
          ))}
        </div>

        {/* Hero content */}
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 py-20 w-full">
          <div className="max-w-xl space-y-6">

            {/* Eyebrow */}
            <div className="flex items-center gap-2">
              <div className="h-px w-8 bg-gradient-to-r from-[#E8560A] to-transparent" />
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#E8560A]">
                Mythic Progression · Ragnaros US
              </span>
            </div>

            {/* Title */}
            <div className="space-y-1">
              <h1 className="text-5xl sm:text-6xl font-black tracking-tight leading-none text-white">
                THE
              </h1>
              <h1 className="text-5xl sm:text-6xl font-black tracking-tight leading-none fire-text">
                BURNING
              </h1>
              <h1 className="text-5xl sm:text-6xl font-black tracking-tight leading-none text-white">
                SEAGULL
              </h1>
            </div>

            {/* Description */}
            <p className="text-[#b8a898] text-base leading-relaxed max-w-sm">
              Semi-tryhard Mythic raiding. Serious progression, no excuses on raid nights.
              Good vibes, high standards.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 pt-2">
              <Button asChild size="lg">
                <Link href="/apply">
                  Apply Now <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/roster">
                  <Users className="h-4 w-4" />
                  View Roster
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#080706] to-transparent z-10" />
      </section>

      {/* ══════════════════════════════════════════
          LIVE TICKER
      ══════════════════════════════════════════ */}
      <LiveTicker liveStatus={wclData.liveStatus} recentKills={wclData.recentKills} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 pb-20 space-y-16 pt-10">

        {/* ══════════════════════════════════════════
            LIVE COMBAT WIDGET
        ══════════════════════════════════════════ */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <Flame className="h-4 w-4 text-[#E8560A]" />
            <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-[#6b5e50]">
              Burning Status
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-[#3d3220] to-transparent" />
          </div>
          <LiveCombatWidget
            liveStatus={wclData.liveStatus}
            bossProgress={wclData.bossProgress}
          />
        </section>

        {/* ══════════════════════════════════════════
            RAID PROGRESS (Supabase — overall tier)
        ══════════════════════════════════════════ */}
        {progressList.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <Flame className="h-4 w-4 text-[#E8560A]" />
              <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-[#6b5e50]">
                Current Progression
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-[#3d3220] to-transparent" />
            </div>

            <div className="space-y-4">
              {progressList.map((raid) => {
                const bosses = Array.from({ length: raid.total_bosses }, (_, i) => ({
                  id: i,
                  name: `Boss ${i + 1}`,
                  defeated: i < raid.bosses_down,
                }));
                return (
                  <div
                    key={raid.id}
                    className="rounded-lg border border-[#2a2318] bg-[#111009] p-5 ember-glow"
                  >
                    <RaidProgressBar
                      raidName={raid.raid_name}
                      bossesDown={raid.bosses_down}
                      totalBosses={raid.total_bosses}
                      bosses={bosses}
                      difficulty={raid.difficulty}
                    />
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════
            KILL FEED
        ══════════════════════════════════════════ */}
        {wclData.recentKills.length > 0 && (
          <div className="rounded-lg border border-[#2a2318] bg-[#111009] p-5">
            <KillFeed kills={wclData.recentKills} />
          </div>
        )}

        {/* ══════════════════════════════════════════
            SERVER LEADERBOARD
        ══════════════════════════════════════════ */}
        {leaderboard.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <Trophy className="h-4 w-4 text-[#E8560A]" />
              <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-[#6b5e50]">
                Top Guilds — Ragnaros
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-[#3d3220] to-transparent" />
            </div>
            <div className="rounded-lg border border-[#2a2318] bg-[#111009] p-4">
              <ServerLeaderboard entries={leaderboard} raidName="Ragnaros" />
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════
            QUICK LINKS
        ══════════════════════════════════════════ */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/roster"
            className="group relative rounded-lg border border-[#2a2318] bg-[#111009] p-5 overflow-hidden hover:border-[#E8560A]/30 transition-all duration-300 hover:ember-glow"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#E8560A]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded border border-[#3d3220] bg-[#1a1710] text-[#E8560A] group-hover:border-[#E8560A]/40 transition-colors">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-[#f5efe8] group-hover:fire-text transition-colors">
                  Guild Roster
                </h3>
                <p className="text-sm text-[#6b5e50] mt-1">
                  Full roster with live character data from Blizzard API.
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/apply"
            className="group relative rounded-lg border border-[#2a2318] bg-[#111009] p-5 overflow-hidden hover:border-[#E8560A]/30 transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#E8560A]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded border border-[#3d3220] bg-[#1a1710] text-[#E8560A] group-hover:border-[#E8560A]/40 transition-colors">
                <ScrollText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-[#f5efe8]">Recruitment</h3>
                <p className="text-sm text-[#6b5e50] mt-1">
                  Apply to join. We evaluate all applications within 48 hours.
                </p>
              </div>
            </div>
          </Link>
        </section>
      </div>
    </div>
  );
}
