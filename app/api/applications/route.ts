import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { notifyNewApplication } from "@/lib/discord";
import type { Application } from "@/lib/supabase";

const URL_PATTERN = /^https?:\/\/.+/;
const RIO_PATTERN = /raider\.io\/characters/i;
const LOGS_PATTERN = /warcraftlogs\.com/i;

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { char_name, class: charClass, spec, rio_link, logs_link, ui_screenshot_url } = body;

  // Validation
  if (!char_name || typeof char_name !== "string" || char_name.trim().length < 2) {
    return Response.json({ error: "Character name is required" }, { status: 422 });
  }
  if (!charClass || typeof charClass !== "string") {
    return Response.json({ error: "Class is required" }, { status: 422 });
  }
  if (!spec || typeof spec !== "string") {
    return Response.json({ error: "Spec is required" }, { status: 422 });
  }
  if (rio_link && !RIO_PATTERN.test(String(rio_link))) {
    return Response.json({ error: "Rio link must be a valid raider.io URL" }, { status: 422 });
  }
  if (logs_link && !LOGS_PATTERN.test(String(logs_link))) {
    return Response.json({ error: "Logs link must be a valid warcraftlogs.com URL" }, { status: 422 });
  }
  if (ui_screenshot_url && !URL_PATTERN.test(String(ui_screenshot_url))) {
    return Response.json({ error: "UI screenshot must be a valid URL" }, { status: 422 });
  }

  const adminClient = createAdminClient();

  // Check for duplicate pending application from same character
  const { data: existing } = await adminClient
    .from("applications")
    .select("id")
    .eq("char_name", String(char_name).trim())
    .eq("status", "pending")
    .maybeSingle();

  if (existing) {
    return Response.json(
      { error: "There is already a pending application for this character" },
      { status: 409 }
    );
  }

  const { data, error } = await adminClient
    .from("applications")
    .insert({
      char_name: String(char_name).trim(),
      class: charClass,
      spec,
      rio_link: rio_link ?? null,
      logs_link: logs_link ?? null,
      ui_screenshot_url: ui_screenshot_url ?? null,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    return Response.json({ error: "Failed to save application" }, { status: 500 });
  }

  // Fire-and-forget Discord notification
  notifyNewApplication(data as Application);

  return Response.json({ success: true, id: data.id }, { status: 201 });
}
