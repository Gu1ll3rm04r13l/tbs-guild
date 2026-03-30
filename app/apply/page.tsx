import type { Metadata } from "next";
import Image from "next/image";
import { Flame } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions, OFFICER_RANKS } from "@/lib/auth";
import { getGuildInfo } from "@/lib/guild-info";
import { ApplicationForm } from "@/components/apply/ApplicationForm";
import {
  GuildInfoLeftSidebar,
  GuildInfoRightSidebar,
  GuildInfoMobileCards,
} from "@/components/apply/GuildInfoSidebars";

export const metadata: Metadata = {
  title: "Apply",
  description: "Apply to join The Burning Seagull — Mythic raiding guild recruitment.",
};

export default async function ApplyPage() {
  const [info, session] = await Promise.all([
    getGuildInfo(),
    getServerSession(authOptions),
  ]);

  const isOfficer = OFFICER_RANKS.includes(
    (session?.user as { guildRank?: string })?.guildRank ?? ""
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      <div className="lg:grid lg:grid-cols-[260px_1fr_240px] lg:gap-8 lg:items-start">

        {/* ── Left sidebar ── */}
        <aside className="hidden lg:flex lg:flex-col lg:gap-4">
          <GuildInfoLeftSidebar info={info} isOfficer={isOfficer} />
        </aside>

        {/* ── Main content ── */}
        <div className="space-y-8">

          {/* Header */}
          <div className="space-y-3 text-center">
            <div className="flex justify-center">
              <div className="relative h-16 w-16">
                <Image
                  src="/logo.png"
                  alt="TBS Logo"
                  fill
                  className="object-contain drop-shadow-[0_0_16px_rgba(232,86,10,0.4)]"
                  sizes="64px"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 mb-1">
                <Flame className="h-3.5 w-3.5 text-[#E8560A]" />
                <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#E8560A]">Recruitment</span>
              </div>
              <h1 className="text-2xl font-black text-[#f5efe8]">Apply to TBS</h1>
              <p className="text-sm text-[#6b5e50] max-w-sm mx-auto mt-2">
                We raid semi-hardcore Mythic. We expect prepared players, not perfect ones.
                Fill in your details and we&apos;ll be in touch via Discord.
              </p>
            </div>
          </div>

          {/* Mobile info (only on small screens) */}
          <div className="lg:hidden space-y-4">
            <GuildInfoMobileCards info={info} isOfficer={isOfficer} />
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-[#E8560A]/30 to-transparent" />

          {/* Form */}
          <ApplicationForm />
        </div>

        {/* ── Right sidebar ── */}
        <aside className="hidden lg:flex lg:flex-col lg:gap-4">
          <GuildInfoRightSidebar info={info} isOfficer={isOfficer} />
        </aside>

      </div>
    </div>
  );
}
