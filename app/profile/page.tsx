import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import type { Metadata } from "next";
import { User } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase";
import { ProfileClient } from "./ProfileClient";

export const metadata: Metadata = { title: "Mi Perfil" };
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  const battleTag = (session.user as { battleTag?: string }).battleTag ?? "";
  const guildRank = (session.user as { guildRank?: string | null }).guildRank ?? null;

  const { data: profile } = await createAdminClient()
    .from("profiles")
    .select("main_char_name, avatar_url")
    .eq("battle_tag", battleTag)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10 space-y-8">
      <div className="space-y-1">
        <p className="text-xs font-mono uppercase tracking-widest text-[#c9a84c]">Cuenta</p>
        <h1 className="text-2xl font-bold text-[#f5efe8] flex items-center gap-2.5">
          <User className="h-6 w-6 text-[#6b5e50]" />
          Mi Perfil
        </h1>
      </div>

      <ProfileClient
        battleTag={battleTag}
        guildRank={guildRank}
        initialMainChar={profile?.main_char_name ?? null}
        initialAvatarUrl={profile?.avatar_url ?? null}
      />
    </div>
  );
}
