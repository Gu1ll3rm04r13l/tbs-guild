import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import type { Metadata } from "next";
import { authOptions, OFFICER_RANKS } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase";
import { DashboardClient } from "./DashboardClient";
import type { Application } from "@/lib/supabase";
import { RecruitsHeader } from "./RecruitsHeader";

export const metadata: Metadata = {
  title: "Reclutamiento",
};

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
      <RecruitsHeader />

      <DashboardClient initialApplications={applications} />
    </div>
  );
}
