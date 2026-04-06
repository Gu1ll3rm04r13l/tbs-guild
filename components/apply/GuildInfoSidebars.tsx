"use client";

import { useState } from "react";
import {
  Flame, Clock, Puzzle, ScrollText, Package, Users, Tv2,
  Pencil, X, Check, Plus, Trash2, Loader2, ChevronRight,
} from "lucide-react";
import type {
  GuildInfoData,
  GuildInfoKey,
  WeLookForData,
  ScheduleData,
  AddonsData,
  RequirementsData,
  CuttingEdgesData,
  ObjectivesData,
  LootSystemData,
  RosterInfoData,
  AmbienteData,
} from "@/lib/guild-info";

// ─── Shared styles ────────────────────────────────────────────────────────────

const inputCls =
  "w-full bg-[#080706] border border-[#2a2318] rounded px-2.5 py-1.5 text-xs text-[#f5efe8] " +
  "placeholder-[#3d3220] focus:outline-none focus:border-[#E8560A]/50 transition-colors";

const textareaCls =
  inputCls + " resize-y min-h-[72px] leading-relaxed";

// ─── API helper ───────────────────────────────────────────────────────────────

async function saveSection(key: GuildInfoKey, value: unknown): Promise<boolean> {
  try {
    const res = await fetch(`/api/guild-info/${key}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(value),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ─── useEditState hook ────────────────────────────────────────────────────────

function useEditState<T>(initial: T) {
  const [data, setData] = useState<T>(initial);
  const [draft, setDraft] = useState<T>(initial);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startEdit() {
    setDraft(data);
    setEditing(true);
    setError(null);
  }

  function cancelEdit() {
    setEditing(false);
    setError(null);
  }

  async function save(key: GuildInfoKey, value: T) {
    setSaving(true);
    setError(null);
    const ok = await saveSection(key, value);
    if (ok) {
      setData(value);
      setEditing(false);
    } else {
      setError("Error al guardar. Intentá de nuevo.");
    }
    setSaving(false);
  }

  return { data, draft, setDraft, editing, saving, error, startEdit, cancelEdit, save };
}

// ─── UI primitives ────────────────────────────────────────────────────────────

function InfoCard({
  icon: Icon,
  label,
  isOfficer,
  editing,
  onEdit,
  onCancel,
  children,
}: {
  icon: React.ElementType;
  label: string;
  isOfficer?: boolean;
  editing?: boolean;
  onEdit?: () => void;
  onCancel?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-[#2a2318] bg-[#111009] px-4 py-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-3.5 w-3.5 text-[#E8560A] shrink-0" />
          <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#6b5e50]">{label}</p>
        </div>
        {isOfficer && (
          <button
            onClick={editing ? onCancel : onEdit}
            className="text-[#3d3220] hover:text-[#E8560A] transition-colors"
            title={editing ? "Cancelar edición" : "Editar sección"}
          >
            {editing ? <X className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function SaveBar({
  onSave,
  onCancel,
  saving,
  error,
}: {
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  error: string | null;
}) {
  return (
    <div className="space-y-2 pt-2 border-t border-[#2a2318] mt-2">
      {error && <p className="text-[10px] text-red-400">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-[#E8560A] text-white hover:bg-[#C41A00] disabled:opacity-50 transition-colors"
        >
          {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
          Guardar
        </button>
        <button
          onClick={onCancel}
          disabled={saving}
          className="px-3 py-1.5 rounded text-xs font-semibold border border-[#2a2318] text-[#6b5e50] hover:text-[#b8a898] hover:border-[#3d3220] disabled:opacity-50 transition-colors"
        >
          Cancelar
        </button>
      </div>
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

// ─── Editor sub-components ────────────────────────────────────────────────────

/** One item per line textarea → string[] */
function StringListEditor({
  items,
  onChange,
  placeholder = "Un ítem por línea",
  rows = 4,
}: {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  rows?: number;
}) {
  const [text, setText] = useState(items.join("\n"));
  return (
    <textarea
      value={text}
      rows={rows}
      placeholder={placeholder}
      className={textareaCls}
      onChange={(e) => {
        setText(e.target.value);
        onChange(e.target.value.split("\n").filter((s) => s.trim().length > 0));
      }}
    />
  );
}

/** Dynamic list of {title, text} pairs */
function TitleTextListEditor({
  items,
  onChange,
}: {
  items: { title: string; text: string }[];
  onChange: (items: { title: string; text: string }[]) => void;
}) {
  function update(i: number, field: "title" | "text", value: string) {
    const next = items.map((it, idx) => (idx === i ? { ...it, [field]: value } : it));
    onChange(next);
  }
  function add() { onChange([...items, { title: "", text: "" }]); }
  function remove(i: number) { onChange(items.filter((_, idx) => idx !== i)); }

  return (
    <div className="space-y-3">
      {items.map((it, i) => (
        <div key={i} className="space-y-1.5">
          <div className="flex items-center gap-2">
            <input
              value={it.title}
              placeholder="Título"
              className={inputCls + " flex-1"}
              onChange={(e) => update(i, "title", e.target.value)}
            />
            <button onClick={() => remove(i)} className="text-[#6b5e50] hover:text-red-400 transition-colors shrink-0">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
          <textarea
            value={it.text}
            placeholder="Descripción"
            rows={2}
            className={textareaCls}
            onChange={(e) => update(i, "text", e.target.value)}
          />
        </div>
      ))}
      <button onClick={add} className="text-[10px] text-[#6b5e50] hover:text-[#E8560A] flex items-center gap-1 transition-colors">
        <Plus className="h-3 w-3" /> Agregar ítem
      </button>
    </div>
  );
}

/** Dynamic list of {xpac, raids} pairs */
function XpacRaidsEditor({
  entries,
  onChange,
}: {
  entries: { xpac: string; raids: string }[];
  onChange: (entries: { xpac: string; raids: string }[]) => void;
}) {
  function update(i: number, field: "xpac" | "raids", value: string) {
    const next = entries.map((e, idx) => (idx === i ? { ...e, [field]: value } : e));
    onChange(next);
  }
  function add() { onChange([...entries, { xpac: "", raids: "" }]); }
  function remove(i: number) { onChange(entries.filter((_, idx) => idx !== i)); }

  return (
    <div className="space-y-2">
      {entries.map((e, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input
            value={e.xpac}
            placeholder="Expansión"
            className={inputCls}
            style={{ width: "90px", flexShrink: 0 }}
            onChange={(ev) => update(i, "xpac", ev.target.value)}
          />
          <input
            value={e.raids}
            placeholder="Raids (separados por ·)"
            className={inputCls + " flex-1"}
            onChange={(ev) => update(i, "raids", ev.target.value)}
          />
          <button onClick={() => remove(i)} className="text-[#6b5e50] hover:text-red-400 transition-colors shrink-0">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      <button onClick={add} className="text-[10px] text-[#6b5e50] hover:text-[#E8560A] flex items-center gap-1 transition-colors">
        <Plus className="h-3 w-3" /> Agregar expansión
      </button>
    </div>
  );
}

/** Dynamic list of {label, desc} pairs */
function LabelDescEditor({
  items,
  onChange,
}: {
  items: { label: string; desc: string }[];
  onChange: (items: { label: string; desc: string }[]) => void;
}) {
  function update(i: number, field: "label" | "desc", value: string) {
    const next = items.map((it, idx) => (idx === i ? { ...it, [field]: value } : it));
    onChange(next);
  }
  function add() { onChange([...items, { label: "", desc: "" }]); }
  function remove(i: number) { onChange(items.filter((_, idx) => idx !== i)); }

  return (
    <div className="space-y-2">
      {items.map((it, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input value={it.label} placeholder="Nombre" className={inputCls} style={{ width: "110px", flexShrink: 0 }} onChange={(e) => update(i, "label", e.target.value)} />
          <input value={it.desc}  placeholder="Descripción" className={inputCls + " flex-1"} onChange={(e) => update(i, "desc", e.target.value)} />
          <button onClick={() => remove(i)} className="text-[#6b5e50] hover:text-red-400 transition-colors shrink-0"><Trash2 className="h-3.5 w-3.5" /></button>
        </div>
      ))}
      <button onClick={add} className="text-[10px] text-[#6b5e50] hover:text-[#E8560A] flex items-center gap-1 transition-colors">
        <Plus className="h-3 w-3" /> Agregar ítem
      </button>
    </div>
  );
}

/** Dynamic list of {name, url} pairs */
function StreamersEditor({
  streamers,
  onChange,
}: {
  streamers: { name: string; url: string }[];
  onChange: (s: { name: string; url: string }[]) => void;
}) {
  function update(i: number, field: "name" | "url", value: string) {
    const next = streamers.map((s, idx) => (idx === i ? { ...s, [field]: value } : s));
    onChange(next);
  }
  function add() { onChange([...streamers, { name: "", url: "" }]); }
  function remove(i: number) { onChange(streamers.filter((_, idx) => idx !== i)); }

  return (
    <div className="space-y-2">
      {streamers.map((s, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input value={s.name} placeholder="Nombre" className={inputCls + " flex-1"} onChange={(e) => update(i, "name", e.target.value)} />
          <input value={s.url}  placeholder="URL Twitch" className={inputCls + " flex-1"} onChange={(e) => update(i, "url", e.target.value)} />
          <button onClick={() => remove(i)} className="text-[#6b5e50] hover:text-red-400 transition-colors shrink-0"><Trash2 className="h-3.5 w-3.5" /></button>
        </div>
      ))}
      <button onClick={add} className="text-[10px] text-[#6b5e50] hover:text-[#E8560A] flex items-center gap-1 transition-colors">
        <Plus className="h-3 w-3" /> Agregar streamer
      </button>
    </div>
  );
}

// ─── Card components ──────────────────────────────────────────────────────────

function WeLookForCard({ initial, isOfficer }: { initial: WeLookForData; isOfficer?: boolean }) {
  const { data, draft, setDraft, editing, saving, error, startEdit, cancelEdit, save } = useEditState(initial);

  return (
    <InfoCard icon={ScrollText} label="We look for" isOfficer={isOfficer} editing={editing} onEdit={startEdit} onCancel={cancelEdit}>
      {editing ? (
        <>
          <StringListEditor items={draft.items} onChange={(items) => setDraft({ ...draft, items })} placeholder="Un requisito por línea" rows={5} />
          <SaveBar onSave={() => save("we_look_for", draft)} onCancel={cancelEdit} saving={saving} error={error} />
        </>
      ) : (
        <ul className="space-y-2 text-sm text-[#b8a898]">
          {data.items.map((r) => (
            <li key={r} className="flex items-start gap-2">
              <span className="text-[#E8560A] font-bold shrink-0 mt-0.5">→</span>
              {r}
            </li>
          ))}
        </ul>
      )}
    </InfoCard>
  );
}

const TZ_ROWS = [
  { key: "tz_ar_uy" as const, flags: "🇦🇷 🇺🇾", label: "AR / UY" },
  { key: "tz_cl"    as const, flags: "🇨🇱",       label: "CL (cambia con horario de verano)" },
  { key: "tz_pe_co" as const, flags: "🇵🇪 🇨🇴", label: "PE / CO" },
  { key: "tz_mx"    as const, flags: "🇲🇽",       label: "MX" },
];

function ScheduleCard({ initial, isOfficer }: { initial: ScheduleData; isOfficer?: boolean }) {
  const { data, draft, setDraft, editing, saving, error, startEdit, cancelEdit, save } = useEditState(initial);

  return (
    <InfoCard icon={Clock} label="Horario de raids" isOfficer={isOfficer} editing={editing} onEdit={startEdit} onCancel={cancelEdit}>
      {editing ? (
        <>
          <div className="space-y-2">
            <div>
              <p className="text-[9px] font-mono uppercase tracking-wider text-[#3d3220] mb-0.5">Días</p>
              <input value={draft.days} className={inputCls} onChange={(e) => setDraft({ ...draft, days: e.target.value })} />
            </div>
            <div>
              <p className="text-[9px] font-mono uppercase tracking-wider text-[#3d3220] mb-0.5">Server time</p>
              <input value={draft.server_time} className={inputCls} onChange={(e) => setDraft({ ...draft, server_time: e.target.value })} />
            </div>
            {TZ_ROWS.map(({ key, flags, label }) => (
              <div key={key}>
                <p className="text-[9px] font-mono uppercase tracking-wider text-[#3d3220] mb-0.5">
                  {flags} {label}
                </p>
                <input
                  value={draft[key]}
                  placeholder="HH:MM – HH:MM"
                  className={inputCls}
                  onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                />
              </div>
            ))}
            <div>
              <p className="text-[9px] font-mono uppercase tracking-wider text-[#3d3220] mb-0.5">Nota de horas</p>
              <input value={draft.hours_note} className={inputCls} onChange={(e) => setDraft({ ...draft, hours_note: e.target.value })} />
            </div>
          </div>
          <SaveBar onSave={() => save("schedule", draft)} onCancel={cancelEdit} saving={saving} error={error} />
        </>
      ) : (
        <div className="space-y-2 text-sm text-[#b8a898]">
          <p className="font-semibold text-[#f5efe8]">{data.days}</p>
          <p className="font-mono text-[#E8560A] text-base font-bold">{data.server_time}</p>
          <div className="pt-1 space-y-1 text-xs text-[#6b5e50]">
            {TZ_ROWS.map(({ key, flags }) => (
              <p key={key}>
                <span className="mr-1.5">{flags}</span>{data[key]}
              </p>
            ))}
          </div>
          <p className="text-xs text-[#6b5e50] pt-1 leading-snug">{data.hours_note}</p>
        </div>
      )}
    </InfoCard>
  );
}

function AddonsCard({ initial, isOfficer }: { initial: AddonsData; isOfficer?: boolean }) {
  const { data, draft, setDraft, editing, saving, error, startEdit, cancelEdit, save } = useEditState(initial);

  return (
    <InfoCard icon={Puzzle} label="Addons obligatorios" isOfficer={isOfficer} editing={editing} onEdit={startEdit} onCancel={cancelEdit}>
      {editing ? (
        <>
          <StringListEditor items={draft.items} onChange={(items) => setDraft({ ...draft, items })} placeholder="Un addon por línea" rows={5} />
          <SaveBar onSave={() => save("addons", draft)} onCancel={cancelEdit} saving={saving} error={error} />
        </>
      ) : (
        <ul className="space-y-1.5 text-sm text-[#b8a898]">
          {data.items.map((a) => <Bullet key={a}>{a}</Bullet>)}
        </ul>
      )}
    </InfoCard>
  );
}

function RequirementsCard({ initial, isOfficer }: { initial: RequirementsData; isOfficer?: boolean }) {
  const { data, draft, setDraft, editing, saving, error, startEdit, cancelEdit, save } = useEditState(initial);

  return (
    <InfoCard icon={ScrollText} label="Requisitos" isOfficer={isOfficer} editing={editing} onEdit={startEdit} onCancel={cancelEdit}>
      {editing ? (
        <>
          <TitleTextListEditor items={draft.items} onChange={(items) => setDraft({ ...draft, items })} />
          <SaveBar onSave={() => save("requirements", draft)} onCancel={cancelEdit} saving={saving} error={error} />
        </>
      ) : (
        <ul className="space-y-3 text-sm text-[#b8a898]">
          {data.items.map((r) => (
            <li key={r.title}>
              <p className="text-xs font-semibold text-[#f5efe8] uppercase tracking-wide mb-0.5">{r.title}</p>
              <p className="text-xs leading-snug">{r.text}</p>
            </li>
          ))}
        </ul>
      )}
    </InfoCard>
  );
}

function CuttingEdgesCard({ initial, isOfficer }: { initial: CuttingEdgesData; isOfficer?: boolean }) {
  const { data, draft, setDraft, editing, saving, error, startEdit, cancelEdit, save } = useEditState(initial);

  return (
    <InfoCard icon={Flame} label="Cutting Edges" isOfficer={isOfficer} editing={editing} onEdit={startEdit} onCancel={cancelEdit}>
      {editing ? (
        <>
          <XpacRaidsEditor entries={draft.entries} onChange={(entries) => setDraft({ ...draft, entries })} />
          <SaveBar onSave={() => save("cutting_edges", draft)} onCancel={cancelEdit} saving={saving} error={error} />
        </>
      ) : (
        <ul className="space-y-2">
          {data.entries.map(({ xpac, raids }) => (
            <li key={xpac}>
              <p className="text-xs font-semibold text-[#E8560A]">{xpac}</p>
              <p className="text-xs text-[#b8a898] leading-snug">{raids}</p>
            </li>
          ))}
        </ul>
      )}
    </InfoCard>
  );
}

function ObjectivesCard({ initial, isOfficer }: { initial: ObjectivesData; isOfficer?: boolean }) {
  const { data, draft, setDraft, editing, saving, error, startEdit, cancelEdit, save } = useEditState(initial);

  return (
    <InfoCard icon={Flame} label="Objetivo" isOfficer={isOfficer} editing={editing} onEdit={startEdit} onCancel={cancelEdit}>
      {editing ? (
        <>
          <div className="space-y-2">
            {(["main", "latam_note", "no_extra", "disclaimer"] as const).map((field) => (
              <div key={field}>
                <p className="text-[9px] font-mono uppercase tracking-wider text-[#3d3220] mb-0.5">
                  {field === "main" ? "Texto principal" : field === "latam_note" ? "Nota LATAM" : field === "no_extra" ? "Frase destacada" : "Asterisco / disclaimer"}
                </p>
                <textarea value={draft[field]} rows={2} className={textareaCls} onChange={(e) => setDraft({ ...draft, [field]: e.target.value })} />
              </div>
            ))}
          </div>
          <SaveBar onSave={() => save("objectives", draft)} onCancel={cancelEdit} saving={saving} error={error} />
        </>
      ) : (
        <div className="space-y-2 text-xs text-[#b8a898] leading-snug">
          <p>
            Sacar <span className="text-[#f5efe8] font-semibold">Cutting Edge</span> en{" "}
            <span className="text-[#E8560A] font-bold">9 horas semanales</span>. {data.main.replace(/^Sacar Cutting Edge en 9 horas semanales\. /, "")}
          </p>
          <p>{data.latam_note}</p>
          <p className="text-[#E8560A] font-semibold text-[11px]">{data.no_extra}</p>
          <p className="text-[#6b5e50] text-[10px] leading-snug">{data.disclaimer}</p>
        </div>
      )}
    </InfoCard>
  );
}

function LootCard({ initial, isOfficer }: { initial: LootSystemData; isOfficer?: boolean }) {
  const { data, draft, setDraft, editing, saving, error, startEdit, cancelEdit, save } = useEditState(initial);

  return (
    <InfoCard icon={Package} label="Loot system" isOfficer={isOfficer} editing={editing} onEdit={startEdit} onCancel={cancelEdit}>
      {editing ? (
        <>
          <LabelDescEditor items={draft.items} onChange={(items) => setDraft({ ...draft, items })} />
          <SaveBar onSave={() => save("loot_system", draft)} onCancel={cancelEdit} saving={saving} error={error} />
        </>
      ) : (
        <div className="space-y-1.5 text-xs text-[#b8a898]">
          {data.items.map(({ label, desc }) => (
            <p key={label}>
              <span className="text-[#f5efe8] font-semibold">{label}</span> {desc}
            </p>
          ))}
        </div>
      )}
    </InfoCard>
  );
}

function RosterInfoCard({ initial, isOfficer }: { initial: RosterInfoData; isOfficer?: boolean }) {
  const { data, draft, setDraft, editing, saving, error, startEdit, cancelEdit, save } = useEditState(initial);

  return (
    <InfoCard icon={Users} label="Roster & Trial" isOfficer={isOfficer} editing={editing} onEdit={startEdit} onCancel={cancelEdit}>
      {editing ? (
        <>
          <div className="space-y-2">
            <div>
              <p className="text-[9px] font-mono uppercase tracking-wider text-[#3d3220] mb-0.5">Texto de roster</p>
              <textarea value={draft.main}  rows={3} className={textareaCls} onChange={(e) => setDraft({ ...draft, main: e.target.value })} />
            </div>
            <div>
              <p className="text-[9px] font-mono uppercase tracking-wider text-[#3d3220] mb-0.5">Política de trial</p>
              <textarea value={draft.trial} rows={3} className={textareaCls} onChange={(e) => setDraft({ ...draft, trial: e.target.value })} />
            </div>
          </div>
          <SaveBar onSave={() => save("roster_info", draft)} onCancel={cancelEdit} saving={saving} error={error} />
        </>
      ) : (
        <div className="space-y-2 text-xs text-[#b8a898] leading-snug">
          <p>{data.main}</p>
          <p>
            <span className="text-[#f5efe8] font-semibold">No hay rango Trial</span>{" "}
            — {data.trial.replace(/^No hay rango Trial — /, "")}
          </p>
        </div>
      )}
    </InfoCard>
  );
}

function AmbienteCard({ initial, isOfficer }: { initial: AmbienteData; isOfficer?: boolean }) {
  const { data, draft, setDraft, editing, saving, error, startEdit, cancelEdit, save } = useEditState(initial);

  return (
    <InfoCard icon={Tv2} label="Ambiente" isOfficer={isOfficer} editing={editing} onEdit={startEdit} onCancel={cancelEdit}>
      {editing ? (
        <>
          <div className="space-y-3">
            <textarea value={draft.text} rows={3} className={textareaCls} onChange={(e) => setDraft({ ...draft, text: e.target.value })} />
            <div>
              <p className="text-[9px] font-mono uppercase tracking-wider text-[#3d3220] mb-1.5">Streamers</p>
              <StreamersEditor streamers={draft.streamers} onChange={(streamers) => setDraft({ ...draft, streamers })} />
            </div>
          </div>
          <SaveBar onSave={() => save("ambiente", draft)} onCancel={cancelEdit} saving={saving} error={error} />
        </>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-[#b8a898] leading-snug">{data.text}</p>
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-[#6b5e50] mb-2">Streams de raiders</p>
            <ul className="space-y-1.5">
              {data.streamers.map(({ name, url }) => (
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
      )}
    </InfoCard>
  );
}

// ─── Public exports ───────────────────────────────────────────────────────────

export function GuildInfoLeftSidebar({
  info,
  isOfficer,
}: {
  info: GuildInfoData;
  isOfficer?: boolean;
}) {
  return (
    <>
      <WeLookForCard    initial={info.we_look_for}  isOfficer={isOfficer} />
      <ScheduleCard     initial={info.schedule}      isOfficer={isOfficer} />
      <AddonsCard       initial={info.addons}        isOfficer={isOfficer} />
      <RequirementsCard initial={info.requirements}  isOfficer={isOfficer} />
    </>
  );
}

export function GuildInfoRightSidebar({
  info,
  isOfficer,
}: {
  info: GuildInfoData;
  isOfficer?: boolean;
}) {
  return (
    <>
      <CuttingEdgesCard initial={info.cutting_edges} isOfficer={isOfficer} />
      <ObjectivesCard   initial={info.objectives}    isOfficer={isOfficer} />
      <LootCard         initial={info.loot_system}   isOfficer={isOfficer} />
      <RosterInfoCard   initial={info.roster_info}   isOfficer={isOfficer} />
      <AmbienteCard     initial={info.ambiente}      isOfficer={isOfficer} />
    </>
  );
}

/** Only WeLookFor + Schedule — for the mobile section inside main column */
export function GuildInfoMobileCards({
  info,
  isOfficer,
}: {
  info: GuildInfoData;
  isOfficer?: boolean;
}) {
  return (
    <>
      <WeLookForCard initial={info.we_look_for} isOfficer={isOfficer} />
      <ScheduleCard  initial={info.schedule}     isOfficer={isOfficer} />
    </>
  );
}
