import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { notifyNewApplication } from "@/lib/discord";
import type { Application } from "@/lib/supabase";

const RIO_PATTERN = /raider\.io/i;
const LOGS_PATTERN = /warcraftlogs\.com/i;
const URL_PATTERN = /^https?:\/\/.+/;

function str(v: unknown): string | null {
  return v && typeof v === "string" && v.trim() ? v.trim() : null;
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const charName = str(body.char_name);
  const realm = str(body.realm);
  const charClass = str(body.class);
  const spec = str(body.spec);
  const pastProgression = str(body.past_progression);
  const whyTbs = str(body.why_tbs);
  const howFound = str(body.how_found);
  const guildHistory = str(body.guild_history);
  const whyLeaving = str(body.why_leaving);
  const hadImportantPosition = str(body.had_important_position);
  const knowSomeone = str(body.know_someone);
  const applicantBattleTag = str(body.applicant_battle_tag);
  const discordId = str(body.discord_id);
  const rioLink = str(body.rio_link);
  const logsLink = str(body.logs_link);
  const uiUrl = str(body.ui_screenshot_url);
  const streamLink = str(body.stream_link);

  // Required field validation
  const missing = [
    !charName && "char_name",
    !realm && "realm",
    !charClass && "class",
    !spec && "spec",
    !pastProgression && "past_progression",
    !whyTbs && "why_tbs",
    !howFound && "how_found",
    !guildHistory && "guild_history",
    !whyLeaving && "why_leaving",
    !hadImportantPosition && "had_important_position",
    !knowSomeone && "know_someone",
    !applicantBattleTag && "applicant_battle_tag",
    !discordId && "discord_id",
  ].filter(Boolean);

  if (missing.length) {
    return Response.json({ error: `Missing required fields: ${missing.join(", ")}` }, { status: 422 });
  }

  // URL validation
  if (rioLink && !RIO_PATTERN.test(rioLink)) {
    return Response.json({ error: "El link de Raider.io debe ser una URL de raider.io válida." }, { status: 422 });
  }
  if (logsLink && !LOGS_PATTERN.test(logsLink)) {
    return Response.json({ error: "El link de Warcraft Logs debe ser una URL de warcraftlogs.com válida." }, { status: 422 });
  }
  if (uiUrl && !URL_PATTERN.test(uiUrl)) {
    return Response.json({ error: "El link de la captura de pantalla debe ser una URL válida." }, { status: 422 });
  }
  if (streamLink && !URL_PATTERN.test(streamLink)) {
    return Response.json({ error: "El link de stream debe ser una URL válida." }, { status: 422 });
  }

  const adminClient = createAdminClient();

  // Check for duplicate pending application
  const { data: existing } = await adminClient
    .from("applications")
    .select("id")
    .eq("char_name", charName!)
    .eq("status", "pending")
    .maybeSingle();

  if (existing) {
    return Response.json(
      { error: "Ya existe un apply pendiente para este personaje." },
      { status: 409 }
    );
  }

  const { data, error } = await adminClient
    .from("applications")
    .insert({
      char_name: charName,
      realm,
      class: charClass,
      spec,
      spec_secondary: str(body.spec_secondary),
      past_progression: pastProgression,
      rio_link: rioLink,
      logs_link: logsLink,
      stream_link: streamLink,
      ui_screenshot_url: uiUrl,
      alt_class_availability: str(body.alt_class_availability),
      why_tbs: whyTbs,
      how_found: howFound,
      guild_history: guildHistory,
      why_leaving: whyLeaving,
      had_important_position: hadImportantPosition,
      know_someone: knowSomeone,
      applicant_battle_tag: applicantBattleTag,
      discord_id: discordId,
      country: str(body.country),
      extra_info: str(body.extra_info),
      ragnaros_alt: str(body.ragnaros_alt),
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    console.error("[applications] insert error:", error);
    return Response.json({ error: "Failed to save application" }, { status: 500 });
  }

  await notifyNewApplication(data as Application);

  return Response.json({ success: true, id: data.id }, { status: 201 });
}
