import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase";
import { getCharacterMedia } from "@/lib/blizzard";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const battleTag = (session.user as { battleTag?: string }).battleTag;
  if (!battleTag) return NextResponse.json({ error: "No battle tag" }, { status: 401 });

  const body = await req.json();
  const charName: string = body.charName;
  const realm: string   = body.realm;

  if (!charName || !realm) {
    return NextResponse.json({ error: "charName y realm requeridos" }, { status: 400 });
  }

  const avatarUrl = await getCharacterMedia(realm, charName);

  const { error } = await createAdminClient()
    .from("profiles")
    .update({ main_char_name: charName, avatar_url: avatarUrl })
    .eq("battle_tag", battleTag);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, avatarUrl });
}
