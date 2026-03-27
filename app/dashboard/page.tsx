import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import type { Metadata } from "next";
import { LayoutDashboard, AlertTriangle } from "lucide-react";
import { authOptions, OFFICER_RANKS } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase";
import { DashboardClient } from "./DashboardClient";
import type { Application } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Officer Dashboard",
};

// Don't cache — officers need live data
export const dynamic = "force-dynamic";

async function getApplications(): Promise<Application[]> {
  try {
    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from("applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data as Application[]) ?? [];
  } catch {
    return [];
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const guildRank = (session?.user as { guildRank?: string | null })?.guildRank;

  if (!session || !OFFICER_RANKS.includes(guildRank ?? "")) {
    redirect("/");
  }

  const applications = await getApplications();

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <p className="text-xs font-mono uppercase tracking-widest text-[#c9a84c]">Solo Oficiales</p>
        <h1 className="text-2xl font-bold text-[#f5f5f5] flex items-center gap-2.5">
          <LayoutDashboard className="h-6 w-6 text-[#6b7280]" />
          Panel de Reclutamiento
        </h1>
      </div>

      {applications.length === 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-[#262626] bg-[#161616] px-4 py-8 justify-center text-[#6b7280]">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm">No hay postulaciones aún.</span>
        </div>
      )}

      {/* Client component handles status mutations */}
      {applications.length > 0 && (
        <DashboardClient initialApplications={applications} />
      )}
    </div>
  );
}
