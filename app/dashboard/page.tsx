import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import type { Metadata } from "next";
import { authOptions, OFFICER_RANKS } from "@/lib/auth";
import { getWoWAuditData } from "@/lib/wowaudit";
import { GuildDashboardClient } from "./GuildDashboardClient";
import { GuildStats } from "@/components/dashboard/GuildStats";

export const metadata: Metadata = { title: "Dashboard de Guild" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const guildRank = (session?.user as { guildRank?: string | null })?.guildRank;

  if (!session || !OFFICER_RANKS.includes(guildRank ?? "")) {
    redirect("/");
  }

  const data = await getWoWAuditData();

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 space-y-8">
      <div className="space-y-1">
        <p className="text-xs font-mono uppercase tracking-widest text-[#c9a84c]">Solo Oficiales</p>
        <h1 className="text-2xl font-bold text-[#f5efe8]">Dashboard de Guild</h1>
        {data && (
          <p className="text-xs text-[#6b5e50] font-mono">
            WoWAudit · actualizado {data.summary.refreshedAt}
          </p>
        )}
      </div>

      {!data ? (
        <div className="rounded-xl border border-[#E8560A]/20 bg-[#E8560A]/5 px-4 py-6 text-sm text-[#E8560A]">
          No se pudo cargar WoWAudit. Verificá que el sheet sea público.
        </div>
      ) : (
        <GuildDashboardClient data={data} statsSlot={<GuildStats />} />
      )}
    </div>
  );
}
