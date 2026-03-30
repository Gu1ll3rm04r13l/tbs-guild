import { createAdminClient } from "./supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

export type WeLookForData    = { items: string[] };
export type ScheduleData     = { days: string; server_time: string; tz_ar_uy_cl: string; tz_pe_co: string; tz_mx: string; hours_note: string };
export type AddonsData       = { items: string[] };
export type RequirementsData = { items: { title: string; text: string }[] };
export type CuttingEdgesData = { entries: { xpac: string; raids: string }[] };
export type ObjectivesData   = { main: string; latam_note: string; no_extra: string; disclaimer: string };
export type LootSystemData   = { items: { label: string; desc: string }[] };
export type RosterInfoData   = { main: string; trial: string };
export type AmbienteData     = { text: string; streamers: { name: string; url: string }[] };

export type GuildInfoData = {
  we_look_for:  WeLookForData;
  schedule:     ScheduleData;
  addons:       AddonsData;
  requirements: RequirementsData;
  cutting_edges: CuttingEdgesData;
  objectives:   ObjectivesData;
  loot_system:  LootSystemData;
  roster_info:  RosterInfoData;
  ambiente:     AmbienteData;
};

export type GuildInfoKey = keyof GuildInfoData;

// ─── Defaults ────────────────────────────────────────────────────────────────

export const GUILD_INFO_DEFAULTS: GuildInfoData = {
  we_look_for: {
    items: [
      "Consistent raid attendance (80%+)",
      "Knowledge of your class at a competitive level",
      "Active presence on Discord",
      "Attitude over ego",
    ],
  },
  schedule: {
    days:        "Lunes · Miércoles · Jueves",
    server_time: "19:00 – 22:00 ST",
    tz_ar_uy_cl: "🇦🇷 🇺🇾 🇨🇱 21:00 – 00:00",
    tz_pe_co:    "🇵🇪 🇨🇴 19:00 – 22:00",
    tz_mx:       "🇲🇽 18:00 – 21:00",
    hours_note:  "3 hs/día · 9 hs semanales · Sin días extra, nunca.",
  },
  addons: {
    items: ["Method Raid Tools", "Big Wigs (o DBM)", "Weakauras 2", "GTFO"],
  },
  requirements: {
    items: [
      { title: "Buenos logs",            text: "Revisamos logs de Heroico (naranjas) y Mítico. Logs malos en Heroico = rotación poco clara." },
      { title: "Experiencia en Mítico",  text: "Buscamos progresión relevante, no pugs de pocos bosses. Preferimos Cutting Edges previos." },
      { title: "Rendimiento consistente", text: "Raideamos poco — necesitamos que cada spot cuente." },
    ],
  },
  cutting_edges: {
    entries: [
      { xpac: "Legion",       raids: "Antorus" },
      { xpac: "BfA",          raids: "Uldir · BoD · Eternal Palace · Ny'alotha" },
      { xpac: "Shadowlands",  raids: "Nathria · SoD · SotFO" },
      { xpac: "Dragonflight", raids: "Vault · Aberrus · Amirdrassil" },
      { xpac: "TWW",          raids: "Nerub'ar · Undermine · Manaforge Omega" },
    ],
  },
  objectives: {
    main:       "Sacar Cutting Edge en 9 horas semanales. Una alternativa para quienes quieren contenido serio con baja disponibilidad horaria.",
    latam_note: "Nuestro horario es el más tempranero de LATAM — ideal para AR/UY/CL.",
    no_extra:   "Jamás agregamos días ni horas extra. Nunca.*",
    disclaimer: "* excepto la primera semana del tier (heroico) donde algunas actividades son optativas y no se repiten en el resto del progress.",
  },
  loot_system: {
    items: [
      { label: "Loot Council", desc: "para ítems relevantes." },
      { label: "Free roll",    desc: "para el resto." },
    ],
  },
  roster_info: {
    main:  "Roster de ~25 personas. Es posible que en algunos bosses estés en banca por composición o rendimiento. Si eso pasa, esperamos que estés en Discord (voz, chat, o viendo el stream de un compañero).",
    trial: "No hay rango Trial — todos entran como Raider. Pero estaremos observando activamente las primeras semanas. Si algo no cierra, te lo comunicamos y podés quedar en rango social.",
  },
  ambiente: {
    text: "Guild adulta. Bajo nivel de toxicidad, respeto como base. Hacemos bromas y putadas como cualquier grupo de amigos, pero dentro de límites lógicos.",
    streamers: [
      { name: "Tolkien (Mage · GM/RL)",         url: "https://www.twitch.tv/tolk" },
      { name: "Stefanish (Healer · Officer)",    url: "https://www.twitch.tv/stefanish" },
      { name: "Pestilence (DPS · Officer)",      url: "https://www.twitch.tv/peestii" },
      { name: "Wor (DPS · Raider)",              url: "https://www.twitch.tv/nozit0" },
    ],
  },
};

// ─── Fetch ────────────────────────────────────────────────────────────────────

export async function getGuildInfo(): Promise<GuildInfoData> {
  try {
    const { data, error } = await createAdminClient()
      .from("guild_info")
      .select("key, value");

    if (error || !data?.length) return { ...GUILD_INFO_DEFAULTS };

    const result: GuildInfoData = { ...GUILD_INFO_DEFAULTS };
    for (const row of data) {
      if (row.key in result) {
        (result as Record<string, unknown>)[row.key] = row.value;
      }
    }
    return result;
  } catch {
    return { ...GUILD_INFO_DEFAULTS };
  }
}
