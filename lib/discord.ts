import type { Application } from "@/lib/supabase";

const CLASS_COLORS: Record<string, number> = {
  "death-knight": 0xc41e3a,
  "demon-hunter": 0xa330c9,
  druid: 0xff7c0a,
  evoker: 0x33937f,
  hunter: 0xaad372,
  mage: 0x3fc7eb,
  monk: 0x00ff98,
  paladin: 0xf48cba,
  priest: 0xffffff,
  rogue: 0xfff468,
  shaman: 0x0070dd,
  warlock: 0x8788ee,
  warrior: 0xc69b3a,
};

function getEmbedColor(className: string): number {
  const key = className.toLowerCase().replace(/\s+/g, "-");
  return CLASS_COLORS[key] ?? 0xc9a84c;
}

export async function notifyNewApplication(app: Application): Promise<void> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;

  const specLabel = app.spec_secondary ? `${app.spec} *(+ ${app.spec_secondary})*` : app.spec;
  const fields: { name: string; value: string; inline: boolean }[] = [
    { name: "Clase / Spec", value: `${app.class} — ${specLabel}`, inline: true },
    { name: "Realm", value: app.realm ?? "—", inline: true },
    { name: "Status", value: "🟡 Pendiente", inline: true },
  ];
  if (app.applicant_battle_tag)
    fields.push({ name: "Battletag", value: app.applicant_battle_tag, inline: true });
  if (app.discord_id)
    fields.push({ name: "Discord", value: app.discord_id, inline: true });
  if (app.country)
    fields.push({ name: "País", value: app.country, inline: true });
  if (app.rio_link)
    fields.push({ name: "Raider.io", value: app.rio_link, inline: false });
  if (app.logs_link)
    fields.push({ name: "WarcraftLogs", value: app.logs_link, inline: false });
  if (app.past_progression)
    fields.push({ name: "Progresión pasada", value: app.past_progression.slice(0, 300), inline: false });
  if (app.why_tbs)
    fields.push({ name: "¿Por qué TBS?", value: app.why_tbs.slice(0, 300), inline: false });
  if (app.guild_history)
    fields.push({ name: "Guilds anteriores", value: app.guild_history.slice(0, 300), inline: false });

  const embed = {
    title: `📋 Nuevo Apply — ${app.char_name}`,
    color: getEmbedColor(app.class),
    fields,
    footer: { text: "The Burning Seagull — Recruitment" },
    timestamp: new Date().toISOString(),
  };

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds: [embed] }),
    });
  } catch {
    // Non-blocking — don't fail the request if Discord is down
  }
}
