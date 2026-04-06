export type Lang = "es" | "en";

export const t = {
  es: {
    nav: {
      about: "Nosotros",
      apply: "Aplicar",
      roster: "Roster",
      dashboard: "Dashboard",
      recruitment: "Reclutamiento",
    },
    roster: {
      eyebrow: "Guild Roster",
      title: "Miembros Activos",
      meta: (n: number) => `${n} miembros · actualizado cada hora`,
      rankings: "Rankings",
      loadingRankings: "Cargando rankings…",
      noData: "Sin datos disponibles.",
      topIO: "Top M+ Score",
      topIlvl: "Ranking iLvl",
      topParses: "Parse Promedio (Mítico)",
      globalAvg: "iLvl promedio global",
      raiders: "raiders",
    },
    hero: {
      eyebrow: "Progresión Mítica · Ragnaros US",
      description:
        "Raideo Mítico Semi-Tryhard. Progresión seria, sin excusas en noches de banda. Buen ambiente, altos estándares.",
      applyCta: "Aplicar",
      rosterCta: "Ver Roster",
    },
    about: {
      sectionLabel: "Sobre Nosotros",
      heading1: "Progresión seria.",
      heading2: "Sin perder de vista que es un juego.",
      p1: "The Burning Seagull es una hermandad Mítica Semi-Tryhard en Ragnaros US. Llevamos varios tiers juntos y la dinámica es clara: los días de banda son días de trabajo. Preparación, asistencia y actitud. Sin excusas.",
      p2: "Fuera del raid somos personas normales. No tenemos drama de hermandad, no micromanejamos tu vida y no te pedimos que vivas en el juego. Lo que sí pedimos es que cuando estés en la incursión, estés al 100%.",
      p3: "Si buscas una hermandad que progrese en serio pero donde también puedas ser tú mismo, este es tu sitio.",
      values: [
        {
          title: "Progresión Mítica",
          desc: "Empujamos lo que el tier permite. No somos world first, pero tampoco conformistas.",
        },
        {
          title: "Tres noches, plena concentración",
          desc: "Schedule ajustado, cada hora cuenta. Exigimos consumibles, preparación y actitud.",
        },
        {
          title: "Comunidad real",
          desc: "Personas primero. Llevamos años juntos porque nos llevamos bien, no solo porque progresamos.",
        },
      ],
      findUsAt: "Encuéntranos en",
      rioTagline: "Rankings · Progresión Mítica · Scores M+",
      rioDesc: "Perfil de hermandad, rankings en servidor y estadísticas de miembros.",
      wclTagline: "Logs de Banda · Parses · Rankings de Boss",
      wclDesc: "Historial completo de logs, rendimiento individual y análisis de cada encounter.",
    },
  },
  en: {
    nav: {
      about: "About",
      apply: "Apply",
      roster: "Roster",
      dashboard: "Dashboard",
      recruitment: "Recruitment",
    },
    roster: {
      eyebrow: "Guild Roster",
      title: "Active Members",
      meta: (n: number) => `${n} members · updated hourly`,
      rankings: "Rankings",
      loadingRankings: "Loading rankings…",
      noData: "No data available.",
      topIO: "Top M+ Score",
      topIlvl: "iLvl Ranking",
      topParses: "Avg Parse (Mythic)",
      globalAvg: "Global avg iLvl",
      raiders: "raiders",
    },
    hero: {
      eyebrow: "Mythic Progression · Ragnaros US",
      description:
        "Semi-tryhard Mythic raiding. Serious progression, no excuses on raid nights. Good vibes, high standards.",
      applyCta: "Apply Now",
      rosterCta: "View Roster",
    },
    about: {
      sectionLabel: "About Us",
      heading1: "Serious progression.",
      heading2: "Without losing sight of the game.",
      p1: "The Burning Seagull is a Semi-Tryhard Mythic raiding guild on Ragnaros US. We've been pushing together for several tiers and the dynamic is simple: raid nights are work nights. Preparation, attendance, and attitude. No excuses.",
      p2: "Outside of raid we're normal people. No guild drama, no micromanaging your life, no requirement to live in the game. What we do ask is that when you're in the raid, you're at 100%.",
      p3: "If you're looking for a guild that progresses seriously but where you can also just be yourself — this is your place.",
      values: [
        {
          title: "Mythic Progression",
          desc: "We push as far as the tier allows. Not world-first, but never complacent.",
        },
        {
          title: "Three nights, full focus",
          desc: "Tight schedule, every hour counts. We expect consumables, prep, and mindset.",
        },
        {
          title: "Real community",
          desc: "People first. We've stayed together for years because we actually get along.",
        },
      ],
      findUsAt: "Find us at",
      rioTagline: "Rankings · Mythic Progression · M+ Scores",
      rioDesc: "Our guild profile, server rankings and member statistics.",
      wclTagline: "Raid Logs · Parses · Boss Rankings",
      wclDesc: "Full log history, individual performance and fight breakdowns.",
    },
  },
} as const;
