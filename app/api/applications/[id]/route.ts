import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, OFFICER_RANKS } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const guildRank = (session?.user as { guildRank?: string | null })?.guildRank;

  if (!session || !OFFICER_RANKS.includes(guildRank ?? "")) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { status, notes } = body;

  if (!["accepted", "rejected", "pending"].includes(String(status))) {
    return Response.json({ error: "Invalid status" }, { status: 422 });
  }

  const adminClient = createAdminClient();
  const { error } = await adminClient
    .from("applications")
    .update({ status, notes: notes ?? null })
    .eq("id", id);

  if (error) {
    return Response.json({ error: "Update failed" }, { status: 500 });
  }

  return Response.json({ success: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const guildRank = (session?.user as { guildRank?: string | null })?.guildRank;

  if (!session || !OFFICER_RANKS.includes(guildRank ?? "")) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const adminClient = createAdminClient();
  const { error } = await adminClient.from("applications").delete().eq("id", id);

  if (error) {
    return Response.json({ error: "Delete failed" }, { status: 500 });
  }

  return Response.json({ success: true });
}
