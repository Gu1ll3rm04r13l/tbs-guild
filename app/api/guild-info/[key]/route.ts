import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, OFFICER_RANKS } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase";
import type { GuildInfoKey } from "@/lib/guild-info";

const VALID_KEYS: GuildInfoKey[] = [
  "we_look_for", "schedule", "addons", "requirements",
  "cutting_edges", "objectives", "loot_system", "roster_info", "ambiente",
  "home_content",
];

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  const session = await getServerSession(authOptions);
  const guildRank = (session?.user as { guildRank?: string })?.guildRank ?? "";

  if (!session || !OFFICER_RANKS.includes(guildRank)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { key } = await params;

  if (!VALID_KEYS.includes(key as GuildInfoKey)) {
    return NextResponse.json({ error: "Invalid key" }, { status: 400 });
  }

  const value = await req.json();

  const { error } = await createAdminClient()
    .from("guild_info")
    .upsert({ key, value, updated_at: new Date().toISOString() });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
