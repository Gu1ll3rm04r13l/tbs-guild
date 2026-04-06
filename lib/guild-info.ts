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

// ─── Home page editable content ──────────────────────────────────────────────

type BilingualString = { es: string; en: string };
type BilingualValue  = { title: BilingualString; desc: BilingualString };

export type HomeContentData = {
  hero_eyebrow:    BilingualString;
  hero_description: BilingualString;
  about_heading1:  BilingualString;
  about_heading2:  BilingualString;
  about_p1:        BilingualString;
  about_p2:        BilingualString;
  about_p3:        BilingualString;
  about_values:    BilingualValue[];
  rio_tagline:     BilingualString;
  rio_desc:        BilingualString;
  wcl_tagline:     BilingualString;
  wcl_desc:        BilingualString;
};

export type GuildInfoData = {
  we_look_for:   WeLookForData;
  schedule:      ScheduleData;
  addons:        AddonsData;
  requirements:  RequirementsData;
  cutting_edges: CuttingEdgesData;
  objectives:    ObjectivesData;
  loot_system:   LootSystemData;
  roster_info:   RosterInfoData;
  ambiente:      AmbienteData;
  home_content:  HomeContentData;
};

export type GuildInfoKey = keyof GuildInfoData;

// ─── Defaults ────────────────────────────────────────────────────────────────

export const HOME_CONTENT_DEFAULT: HomeContentData = {
  hero_eyebrow:     { es: "Progresión Mítica · Ragnaros US",      en: "Mythic Progression · Ragnaros US" },
  hero_description: {
    es: "Raideo Mítico Semi-Tryhard. Progresión seria, sin excusas en noches de banda. Buen ambiente, altos estándares.",
    en: "Semi-tryhard Mythic raiding. Serious progression, no excuses on raid nights. Good vibes, high standards.",
  },
  about_heading1: { es: "Progresión seria.",                    en: "Serious progression." },
  about_heading2: { es: "Sin perder de vista que es un juego.", en: "Without losing sight of the game." },
  about_p1: {
    es: "The Burning Seagull es una hermandad Mítica Semi-Tryhard en Ragnaros US. Llevamos varios tiers juntos y la dinámica es clara: los días de banda son días de trabajo. Preparación, asistencia y actitud. Sin excusas.",
    en: "The Burning Seagull is a Semi-Tryhard Mythic raiding guild on Ragnaros US. We've been pushing together for several tiers and the dynamic is simple: raid nights are work nights. Preparation, attendance, and attitude. No excuses.",
  },
  about_p2: {
    es: "Fuera del raid somos personas normales. No tenemos drama de hermandad, no micromanejamos tu vida y no te pedimos que vivas en el juego. Lo que sí pedimos es que cuando estés en la incursión, estés al 100%.",
    en: "Outside of raid we're normal people. No guild drama, no micromanaging your life, no requirement to live in the game. What we do ask is that when you're in the raid, you're at 100%.",
  },
  about_p3: {
    es: "Si buscas una hermandad que progrese en serio pero donde también puedas ser tú mismo, este es tu sitio.",
    en: "If you're looking for a guild that progresses seriously but where you can also just be yourself — this is your place.",
  },
  about_values: [
    {
      title: { es: "Progresión Mítica",            en: "Mythic Progression" },
      desc:  { es: "Empujamos lo que el tier permite. No somos world first, pero tampoco conformistas.", en: "We push as far as the tier allows. Not world-first, but never complacent." },
    },
    {
      title: { es: "Tres noches, plena concentración", en: "Three nights, full focus" },
      desc:  { es: "Schedule ajustado, cada hora cuenta. Exigimos consumibles, preparación y actitud.", en: "Tight schedule, every hour counts. We expect consumables, prep, and mindset." },
    },
    {
      title: { es: "Comunidad real",   en: "Real community" },
      desc:  { es: "Personas primero. Llevamos años juntos porque nos llevamos bien, no solo porque progresamos.", en: "People first. We've stayed together for years because we actually get along." },
    },
  ],
  rio_tagline: { es: "Rankings · Progresión Mítica · Scores M+",   en: "Rankings · Mythic Progression · M+ Scores" },
  rio_desc:    { es: "Perfil de hermandad, rankings en servidor y estadísticas de miembros.", en: "Our guild profile, server rankings and member statistics." },
  wcl_tagline: { es: "Logs de Banda · Parses · Rankings de Boss",  en: "Raid Logs · Parses · Boss Rankings" },
  wcl_desc:    { es: "Historial completo de logs, rendimiento individual y análisis de cada encounter.", en: "Full log history, individual performance and fight breakdowns." },
};

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
  home_content: HOME_CONTENT_DEFAULT,
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
