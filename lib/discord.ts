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

  const fields = [
    { name: "Class / Spec", value: `${app.class} — ${app.spec}`, inline: true },
    { name: "Status", value: "🟡 Pending Review", inline: true },
  ];

  if (app.rio_link) fields.push({ name: "Raider.io", value: app.rio_link, inline: false });
  if (app.logs_link) fields.push({ name: "WarcraftLogs", value: app.logs_link, inline: false });

  const embed = {
    title: `📋 New Application — ${app.char_name}`,
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
