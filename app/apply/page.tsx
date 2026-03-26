import type { Metadata } from "next";
import Image from "next/image";
import {
  Flame, Clock, Puzzle, Package, Users, Tv2, ScrollText, ChevronRight,
} from "lucide-react";
import { ApplicationForm } from "@/components/apply/ApplicationForm";

export const metadata: Metadata = {
  title: "Apply",
  description: "Apply to join The Burning Seagull — Mythic raiding guild recruitment.",
};

// ─── Info card components ─────────────────────────────────────────────────────

function InfoCard({
  icon: Icon, label, children,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-[#2a2318] bg-[#111009] px-4 py-4 space-y-3">
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-[#E8560A] shrink-0" />
        <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#6b5e50]">{label}</p>
      </div>
      {children}
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <ChevronRight className="h-3.5 w-3.5 text-[#E8560A] shrink-0 mt-0.5" />
      <span>{children}</span>
    </li>
  );
}

// ─── Left sidebar cards ───────────────────────────────────────────────────────

function WeLookForCard() {
  return (
    <InfoCard icon={ScrollText} label="We look for">
      <ul className="space-y-2 text-sm text-[#b8a898]">
        {[
          "Consistent raid attendance (80%+)",
          "Knowledge of your class at a competitive level",
          "Active presence on Discord",
          "Attitude over ego",
        ].map((r) => (
          <li key={r} className="flex items-start gap-2">
            <span className="text-[#E8560A] font-bold shrink-0 mt-0.5">→</span>
            {r}
          </li>
        ))}
      </ul>
    </InfoCard>
  );
}

function ScheduleCard() {
  return (
    <InfoCard icon={Clock} label="Horario de raids">
      <div className="space-y-2 text-sm text-[#b8a898]">
        <p className="font-semibold text-[#f5efe8]">Lunes · Miércoles · Jueves</p>
        <p className="font-mono text-[#E8560A] text-base font-bold">19:00 – 22:00 ST</p>
        <div className="pt-1 space-y-0.5 text-xs text-[#6b5e50]">
          <p>🇦🇷 🇺🇾 🇨🇱 21:00 – 00:00</p>
          <p>🇵🇪 🇨🇴 19:00 – 22:00</p>
          <p>🇲🇽 18:00 – 21:00</p>
        </div>
        <p className="text-xs text-[#6b5e50] pt-1 leading-snug">
          3 hs/día · 9 hs semanales · Sin días extra, nunca.
        </p>
      </div>
    </InfoCard>
  );
}

function AddonsCard() {
  return (
    <InfoCard icon={Puzzle} label="Addons obligatorios">
      <ul className="space-y-1.5 text-sm text-[#b8a898]">
        <Bullet>Method Raid Tools</Bullet>
        <Bullet>Big Wigs <span className="text-[#6b5e50]">(o DBM)</span></Bullet>
        <Bullet>Weakauras 2</Bullet>
        <Bullet>GTFO</Bullet>
      </ul>
    </InfoCard>
  );
}

function RequirementsCard() {
  return (
    <InfoCard icon={ScrollText} label="Requisitos">
      <ul className="space-y-3 text-sm text-[#b8a898]">
        <li>
          <p className="text-xs font-semibold text-[#f5efe8] uppercase tracking-wide mb-0.5">Buenos logs</p>
          <p className="text-xs leading-snug">Revisamos logs de Heroico (naranjas) y Mítico. Logs malos en Heroico = rotación poco clara.</p>
        </li>
        <li>
          <p className="text-xs font-semibold text-[#f5efe8] uppercase tracking-wide mb-0.5">Experiencia en Mítico</p>
          <p className="text-xs leading-snug">Buscamos progresión relevante, no pugs de pocos bosses. Preferimos Cutting Edges previos.</p>
        </li>
        <li>
          <p className="text-xs font-semibold text-[#f5efe8] uppercase tracking-wide mb-0.5">Rendimiento consistente</p>
          <p className="text-xs leading-snug">Raideamos poco — necesitamos que cada spot cuente.</p>
        </li>
      </ul>
    </InfoCard>
  );
}

// ─── Right sidebar cards ──────────────────────────────────────────────────────

const CUTTING_EDGES: [string, string][] = [
  ["Legion", "Antorus"],
  ["BfA", "Uldir · BoD · Eternal Palace · Ny'alotha"],
  ["Shadowlands", "Nathria · SoD · SotFO"],
  ["Dragonflight", "Vault · Aberrus · Amirdrassil"],
  ["TWW", "Nerub'ar · Undermine · Manaforge Omega"],
];

function CuttingEdgesCard() {
  return (
    <InfoCard icon={Flame} label="Cutting Edges">
      <ul className="space-y-2">
        {CUTTING_EDGES.map(([xpac, raids]) => (
          <li key={xpac}>
            <p className="text-xs font-semibold text-[#E8560A]">{xpac}</p>
            <p className="text-xs text-[#b8a898] leading-snug">{raids}</p>
          </li>
        ))}
      </ul>
    </InfoCard>
  );
}

function ObjectivesCard() {
  return (
    <InfoCard icon={Flame} label="Objetivo">
      <div className="space-y-2 text-xs text-[#b8a898] leading-snug">
        <p>
          Sacar <span className="text-[#f5efe8] font-semibold">Cutting Edge</span> en{" "}
          <span className="text-[#E8560A] font-bold">9 horas semanales</span>. Una alternativa para
          quienes quieren contenido serio con baja disponibilidad horaria.
        </p>
        <p>
          Nuestro horario es el más tempranero de LATAM — ideal para AR/UY/CL.
        </p>
        <p className="text-[#E8560A] font-semibold text-[11px]">
          Jamás agregamos días ni horas extra. Nunca.*
        </p>
        <p className="text-[#6b5e50] text-[10px] leading-snug">
          * excepto la primera semana del tier (heroico) donde algunas actividades son optativas y no se repiten en el resto del progress.
        </p>
      </div>
    </InfoCard>
  );
}

function LootCard() {
  return (
    <InfoCard icon={Package} label="Loot system">
      <div className="space-y-1.5 text-xs text-[#b8a898]">
        <p>
          <span className="text-[#f5efe8] font-semibold">Loot Council</span> para ítems relevantes.
        </p>
        <p>
          <span className="text-[#f5efe8] font-semibold">Free roll</span> para el resto.
        </p>
      </div>
    </InfoCard>
  );
}

function RosterCard() {
  return (
    <InfoCard icon={Users} label="Roster & Trial">
      <div className="space-y-2 text-xs text-[#b8a898] leading-snug">
        <p>Roster de ~25 personas. Es posible que en algunos bosses estés en banca por composición o rendimiento. Si eso pasa, esperamos que estés en Discord (voz, chat, o viendo el stream de un compañero).</p>
        <p>
          <span className="text-[#f5efe8] font-semibold">No hay rango Trial</span> — todos entran como Raider. Pero estaremos observando activamente las primeras semanas. Si algo no cierra, te lo comunicamos y podés quedar en rango social.
        </p>
      </div>
    </InfoCard>
  );
}

function AmbienteCard() {
  const streamers = [
    { name: "Tolkien (Mage · GM/RL)", url: "https://www.twitch.tv/tolk" },
    { name: "Stefanish (Healer · Officer)", url: "https://www.twitch.tv/stefanish" },
    { name: "Pestilence (DPS · Officer)", url: "https://www.twitch.tv/peestii" },
    { name: "Wor (DPS · Raider)", url: "https://www.twitch.tv/nozit0" },
  ];
  return (
    <InfoCard icon={Tv2} label="Ambiente">
      <div className="space-y-3">
        <p className="text-xs text-[#b8a898] leading-snug">
          Guild adulta. Bajo nivel de toxicidad, respeto como base. Hacemos bromas y putadas como cualquier
          grupo de amigos, pero dentro de límites lógicos.
        </p>
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-[#6b5e50] mb-2">
            Streams de raiders
          </p>
          <ul className="space-y-1.5">
            {streamers.map(({ name, url }) => (
              <li key={name}>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#E8560A] hover:text-[#F0B830] transition-colors underline underline-offset-2 decoration-[#E8560A]/30"
                >
                  {name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </InfoCard>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ApplyPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      <div className="lg:grid lg:grid-cols-[260px_1fr_240px] lg:gap-8 lg:items-start">

        {/* ── Left sidebar ── */}
        <aside className="hidden lg:flex lg:flex-col lg:gap-4">
          <WeLookForCard />
          <ScheduleCard />
          <AddonsCard />
          <RequirementsCard />
        </aside>

        {/* ── Main content ── */}
        <div className="space-y-8">

          {/* Header */}
          <div className="space-y-3 text-center">
            <div className="flex justify-center">
              <div className="relative h-16 w-16">
                <Image
                  src="/logo.png"
                  alt="TBS Logo"
                  fill
                  className="object-contain drop-shadow-[0_0_16px_rgba(232,86,10,0.4)]"
                  sizes="64px"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 mb-1">
                <Flame className="h-3.5 w-3.5 text-[#E8560A]" />
                <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#E8560A]">Recruitment</span>
              </div>
              <h1 className="text-2xl font-black text-[#f5efe8]">Apply to TBS</h1>
              <p className="text-sm text-[#6b5e50] max-w-sm mx-auto mt-2">
                We raid semi-hardcore Mythic. We expect prepared players, not perfect ones.
                Fill in your details and we&apos;ll be in touch via Discord.
              </p>
            </div>
          </div>

          {/* Mobile info (only on small screens) */}
          <div className="lg:hidden space-y-4">
            <WeLookForCard />
            <ScheduleCard />
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-[#E8560A]/30 to-transparent" />

          {/* Form */}
          <ApplicationForm />
        </div>

        {/* ── Right sidebar ── */}
        <aside className="hidden lg:flex lg:flex-col lg:gap-4">
          <CuttingEdgesCard />
          <ObjectivesCard />
          <LootCard />
          <RosterCard />
          <AmbienteCard />
        </aside>

      </div>
    </div>
  );
}
