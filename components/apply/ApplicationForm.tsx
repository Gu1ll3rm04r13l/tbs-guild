"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

const WOW_CLASSES: Record<string, string[]> = {
  "Death Knight": ["Blood", "Frost", "Unholy"],
  "Demon Hunter": ["Havoc", "Vengeance" , "Devourer "],
  Druid: ["Balance", "Feral", "Guardian", "Restoration"],
  Evoker: ["Augmentation", "Devastation", "Preservation"],
  Hunter: ["Beast Mastery", "Marksmanship", "Survival"],
  Mage: ["Arcane", "Fire", "Frost"],
  Monk: ["Brewmaster", "Mistweaver", "Windwalker"],
  Paladin: ["Holy", "Protection", "Retribution"],
  Priest: ["Discipline", "Holy", "Shadow"],
  Rogue: ["Assassination", "Outlaw", "Subtlety"],
  Shaman: ["Elemental", "Enhancement", "Restoration"],
  Warlock: ["Affliction", "Demonology", "Destruction"],
  Warrior: ["Arms", "Fury", "Protection"],
};

const HOW_FOUND_OPTIONS = [
  "Chat dentro del juego",
  "Por medio de otra persona",
  "Wowprogress",
  "Raider.io",
  "Warcraftlogs",
  "Otro",
];

type FormData = {
  charName: string;
  realm: string;
  charClass: string;
  spec: string;
  specSecondary: string;
  pastProgression: string;
  rioLink: string;
  logsLink: string;
  streamLink: string;
  uiUrl: string;
  altClassAvailability: string;
  whyTbs: string;
  howFound: string;
  howFoundOther: string;
  guildHistory: string;
  whyLeaving: string;
  hadImportantPosition: string;
  knowSomeone: string;
  applicantBattleTag: string;
  discordId: string;
  country: string;
  extraInfo: string;
  ragnarosAlt: string;
};

const INITIAL: FormData = {
  charName: "", realm: "", charClass: "", spec: "", specSecondary: "",
  pastProgression: "", rioLink: "", logsLink: "", streamLink: "", uiUrl: "",
  altClassAvailability: "", whyTbs: "", howFound: "", howFoundOther: "",
  guildHistory: "", whyLeaving: "", hadImportantPosition: "", knowSomeone: "",
  applicantBattleTag: "", discordId: "", country: "", extraInfo: "", ragnarosAlt: "",
};

type FormStatus = "idle" | "loading" | "success" | "error";

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <div className="h-px flex-1 bg-[#2a2318]" />
      <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#6b5e50] whitespace-nowrap">
        {label}
      </span>
      <div className="h-px flex-1 bg-[#2a2318]" />
    </div>
  );
}

function Field({
  label, hint, required, children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-[#a3a3a3]">
        {label}
        {required && <span className="text-[#E8560A] ml-0.5">*</span>}
      </label>
      {hint && <p className="text-xs text-[#6b5e50] leading-snug">{hint}</p>}
      {children}
    </div>
  );
}

export function ApplicationForm() {
  const [form, setForm] = useState<FormData>(INITIAL);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const availableSpecs = form.charClass ? WOW_CLASSES[form.charClass] ?? [] : [];

  function setField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleInput(key: keyof FormData) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setField(key, e.target.value);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.charClass || !form.spec) {
      setErrorMsg("Por favor seleccioná una clase y especialización.");
      setStatus("error");
      return;
    }
    if (!form.howFound) {
      setErrorMsg("Por favor indicá cómo conociste la guild.");
      setStatus("error");
      return;
    }
    if (form.howFound === "Otro" && !form.howFoundOther.trim()) {
      setErrorMsg("Por favor detallá cómo conociste la guild.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    const payload = {
      char_name: form.charName,
      realm: form.realm,
      class: form.charClass,
      spec: form.spec,
      spec_secondary: form.specSecondary || undefined,
      past_progression: form.pastProgression,
      rio_link: form.rioLink || undefined,
      logs_link: form.logsLink || undefined,
      stream_link: form.streamLink || undefined,
      ui_screenshot_url: form.uiUrl || undefined,
      alt_class_availability: form.altClassAvailability || undefined,
      why_tbs: form.whyTbs,
      how_found: form.howFound === "Otro" ? `Otro: ${form.howFoundOther}` : form.howFound,
      guild_history: form.guildHistory,
      why_leaving: form.whyLeaving,
      had_important_position: form.hadImportantPosition,
      know_someone: form.knowSomeone,
      applicant_battle_tag: form.applicantBattleTag,
      discord_id: form.discordId,
      country: form.country || undefined,
      extra_info: form.extraInfo || undefined,
      ragnaros_alt: form.ragnarosAlt || undefined,
    };

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error ?? "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }
      setStatus("success");
    } catch {
      setErrorMsg("Network error. Please check your connection.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center gap-5 py-20 text-center">
        <CheckCircle className="h-14 w-14 text-green-400" />
        <div>
          <h3 className="text-xl font-bold text-[#f5efe8]">¡Apply enviado!</h3>
          <p className="text-sm text-[#b8a898] max-w-sm mt-2">
            Lo revisamos y te contactamos por Discord. Asegurate de estar en el servidor de TBS.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* ── Tu personaje ── */}
      <SectionHeader label="Tu personaje" />

      <Field label="Nombre del personaje" required>
        <Input
          required
          value={form.charName}
          onChange={handleInput("charName")}
          placeholder="Arthas"
          minLength={2}
          maxLength={32}
        />
      </Field>

      <Field label="¿En qué Realm está el pj con que aplicas?" required>
        <Input
          required
          value={form.realm}
          onChange={handleInput("realm")}
          placeholder="Ragnaros"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Clase" required>
          <Select
            value={form.charClass}
            onValueChange={(v) => setForm((p) => ({ ...p, charClass: v, spec: "" }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(WOW_CLASSES).map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Especialización primaria" required>
          <Select
            value={form.spec}
            onValueChange={(v) => setField("spec", v)}
            disabled={!form.charClass}
          >
            <SelectTrigger>
              <SelectValue placeholder={form.charClass ? "Seleccionar" : "Elegí clase primero"} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>{form.charClass || "—"}</SelectLabel>
                {availableSpecs.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
      </div>

      <Field
        label="Especialización(es) secundaria(s)"
        hint="Si jugás más de una spec, mencioná cuáles."
      >
        <Input
          value={form.specSecondary}
          onChange={handleInput("specSecondary")}
          placeholder="Ej: Frost / Blood"
        />
      </Field>

      {/* ── Experiencia ── */}
      <SectionHeader label="Experiencia" />

      <Field
        label="Progresión en expansiones/raids pasadas"
        required
        hint="Comentanos si obtuviste un Cutting Edge en el pasado o tuviste progresión relevante en alguna raid anterior. En caso de que hayas progresado activamente con un pj DIFERENTE al que aplicas, dejanos su información (Nombre / Logs / Raider.io)."
      >
        <Textarea
          required
          value={form.pastProgression}
          onChange={handleInput("pastProgression")}
          placeholder="CE en Aberrus con Mago. También progresé hasta 7/9M en Amirdrassil con Guerrero — Logs: warcraftlogs.com/..."
          rows={4}
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Link a tu Raider.io" required>
          <Input
            required
            type="url"
            value={form.rioLink}
            onChange={handleInput("rioLink")}
            placeholder="https://raider.io/..."
          />
        </Field>
        <Field label="Link a tu perfil de Warcraft Logs" required>
          <Input
            required
            type="url"
            value={form.logsLink}
            onChange={handleInput("logsLink")}
            placeholder="https://www.warcraftlogs.com/..."
          />
        </Field>
      </div>

      <Field label="Si stremeas, link a tu canal">
        <Input
          type="url"
          value={form.streamLink}
          onChange={handleInput("streamLink")}
          placeholder="https://www.twitch.tv/..."
        />
      </Field>

      {/* ── Jugabilidad ── */}
      <SectionHeader label="Jugabilidad" />

      <Field
        label="Captura de pantalla de tu interfaz durante una raid y/o en combate"
        hint="Si no tenés una durante raid, pegale a un dummy. Subí la imagen a Imgur u otro host y pegá el link."
      >
        <Input
          type="url"
          value={form.uiUrl}
          onChange={handleInput("uiUrl")}
          placeholder="https://imgur.com/..."
        />
      </Field>

      <Field
        label="¿Tenés disponibilidad de otra clase para jugar?"
        hint="Muchas veces aplican players interesantes pero en clases no prioritarias. En caso afirmativo, comentanos brevemente."
      >
        <Textarea
          value={form.altClassAvailability}
          onChange={handleInput("altClassAvailability")}
          placeholder="Sí, tengo un Paladin tanque a full gear que podría jugar si es necesario."
          rows={2}
        />
      </Field>

      {/* ── Sobre vos ── */}
      <SectionHeader label="Sobre vos" />

      <Field label="¿Por qué estás interesado en entrar a TBS?" required>
        <Textarea
          required
          value={form.whyTbs}
          onChange={handleInput("whyTbs")}
          rows={3}
        />
      </Field>

      <Field label="¿Cómo conociste la guild?" required>
        <Select
          value={form.howFound}
          onValueChange={(v) => setField("howFound", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar" />
          </SelectTrigger>
          <SelectContent>
            {HOW_FOUND_OPTIONS.map((o) => (
              <SelectItem key={o} value={o}>{o}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {form.howFound === "Otro" && (
          <Input
            className="mt-2"
            value={form.howFoundOther}
            onChange={handleInput("howFoundOther")}
            placeholder="¿Cómo?"
          />
        )}
      </Field>

      <Field label="Indica las guilds por las que transitaste en el último tiempo" required>
        <Textarea
          required
          value={form.guildHistory}
          onChange={handleInput("guildHistory")}
          placeholder="Ej: <Nombre Guild> (Servidor) — 6 meses, DPS DK"
          rows={3}
        />
      </Field>

      <Field label="¿Por qué quieres dejar/dejaste tu guild actual?" required>
        <Textarea
          required
          value={form.whyLeaving}
          onChange={handleInput("whyLeaving")}
          rows={3}
        />
      </Field>

      <Field
        label="¿Tuviste una posición importante dentro de tu guild anterior?"
        hint="Officer, Guild Master o Raid Leader."
        required
      >
        <Textarea
          required
          value={form.hadImportantPosition}
          onChange={handleInput("hadImportantPosition")}
          placeholder="No / Sí, fui Officer en <guild> durante X tiempo."
          rows={2}
        />
      </Field>

      <Field label="¿Conoces a alguien dentro de nuestra guild? ¿Quién?" required>
        <Input
          required
          value={form.knowSomeone}
          onChange={handleInput("knowSomeone")}
          placeholder="No / Sí, conozco a Fulano#1234"
        />
      </Field>

      {/* ── Contacto ── */}
      <SectionHeader label="Contacto" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Indica tu Battletag" required>
          <Input
            required
            value={form.applicantBattleTag}
            onChange={handleInput("applicantBattleTag")}
            placeholder="NombreDeJugador#1234"
          />
        </Field>
        <Field label="Indica tu Discord ID" required>
          <Input
            required
            value={form.discordId}
            onChange={handleInput("discordId")}
            placeholder="usuario o @usuario"
          />
        </Field>
      </div>

      <Field label="¿De qué país eres?">
        <Input
          value={form.country}
          onChange={handleInput("country")}
          placeholder="Argentina"
        />
      </Field>

      {/* ── Extra ── */}
      <SectionHeader label="Extra" />

      <Field label="Información extra que quieras agregar">
        <Textarea
          value={form.extraInfo}
          onChange={handleInput("extraInfo")}
          rows={3}
        />
      </Field>

      <Field
        label="PJ en Ragnaros para notificación"
        hint="En caso de que el pj con el que aplicas no esté en Ragnaros, creá un pj allí (Horda preferentemente) y dejá su nombre. Te mandaremos un correo al pj con el resultado de tu apply."
      >
        <Input
          value={form.ragnarosAlt}
          onChange={handleInput("ragnarosAlt")}
          placeholder="Nombre del personaje en Ragnaros"
        />
      </Field>

      {status === "error" && (
        <div className="flex items-center gap-2 rounded border border-red-800/50 bg-red-950/30 px-3 py-2.5 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {errorMsg}
        </div>
      )}

      <Button
        type="submit"
        className="w-full mt-2"
        disabled={status === "loading"}
      >
        {status === "loading" ? (
          <><Loader2 className="h-4 w-4 animate-spin mr-2" />Enviando...</>
        ) : "Enviar Apply"}
      </Button>
    </form>
  );
}
