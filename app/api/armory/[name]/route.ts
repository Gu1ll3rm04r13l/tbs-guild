import { getServerSession } from "next-auth";
import { authOptions, OFFICER_RANKS } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase";

const REALM_SLUG = process.env.BLIZZARD_REALM_SLUG ?? "ragnaros";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;
  const charName = decodeURIComponent(name);

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return Response.json({ error: "No autenticado" }, { status: 401 });
  }

  const user = session.user as {
    isOfficer?: boolean;
    battleTag?: string | null;
  };

  // Check authorization: officer OR owner of this character
  let canEdit = user.isOfficer ?? false;
  if (!canEdit) {
    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("main_char_name, guild_rank")
      .eq("battle_tag", user.battleTag ?? "")
      .maybeSingle();

    canEdit =
      OFFICER_RANKS.includes(profile?.guild_rank ?? "") ||
      profile?.main_char_name?.toLowerCase() === charName.toLowerCase();
  }

  if (!canEdit) {
    return Response.json({ error: "Sin permisos" }, { status: 403 });
  }

  const body = await req.json() as {
    notes?: string;
    rio_link?: string;
    logs_link?: string;
    media_url?: string;
  };

  const admin = createAdminClient();
  const { error } = await admin.from("character_armory").upsert(
    {
      char_name: charName,
      realm_slug: REALM_SLUG,
      notes: body.notes ?? null,
      rio_link: body.rio_link ?? null,
      logs_link: body.logs_link ?? null,
      media_url: body.media_url ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "char_name,realm_slug" }
  );

  if (error) {
    console.error("[armory] upsert error:", error);
    return Response.json({ error: "Error guardando" }, { status: 500 });
  }

  return Response.json({ ok: true });
}
