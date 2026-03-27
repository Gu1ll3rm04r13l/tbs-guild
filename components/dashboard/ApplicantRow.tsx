"use client";

import { useState } from "react";
import { ExternalLink, ChevronDown, ChevronUp, Loader2, Save, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "./StatusBadge";
import { getClassColor } from "@/lib/utils";
import type { Application } from "@/lib/supabase";

type ApplicantRowProps = {
  application: Application;
  onStatusChange: (
    id: string,
    status: "accepted" | "rejected" | "pending",
    notes?: string
  ) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

export function ApplicantRow({ application: app, onStatusChange, onDelete }: ApplicantRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState(app.notes ?? "");
  const [loading, setLoading] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);
  const [deleteStage, setDeleteStage] = useState<"idle" | "confirm">("idle");
  const [deleting, setDeleting] = useState(false);
  const classColor = getClassColor(app.class);

  async function handleStatus(status: "accepted" | "rejected" | "pending") {
    setLoading(true);
    try {
      await onStatusChange(app.id, status, notes || undefined);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveNotes() {
    setSavingNotes(true);
    try {
      await onStatusChange(app.id, app.status, notes || undefined);
    } finally {
      setSavingNotes(false);
    }
  }

  async function handleDeleteConfirm() {
    setDeleting(true);
    try {
      await onDelete(app.id);
    } finally {
      setDeleting(false);
      setDeleteStage("idle");
    }
  }

  return (
    <div className="rounded-lg border border-[#262626] bg-[#161616] overflow-hidden">
      {/* Class color top line */}
      <div className="h-0.5" style={{ background: classColor }} />

      {/* Main row */}
      <div className="flex items-center gap-3 px-4 py-3">

        {/* Character info — clickeable para expandir */}
        <div
          className="flex-1 min-w-0 cursor-pointer select-none"
          onClick={() => setExpanded((v) => !v)}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm" style={{ color: classColor }}>
              {app.char_name}
            </span>
            {app.realm && (
              <span className="text-xs text-[#6b7280]">({app.realm})</span>
            )}
            <span className="text-xs text-[#6b7280]">
              {app.class} — {app.spec}
              {app.spec_secondary && ` / ${app.spec_secondary}`}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
            <p className="text-xs text-[#6b7280]">
              {new Date(app.created_at).toLocaleDateString("en-GB", {
                day: "2-digit", month: "short", year: "numeric",
              })}
            </p>
            {app.applicant_battle_tag && (
              <p className="text-xs text-[#6b7280] font-mono">{app.applicant_battle_tag}</p>
            )}
            {app.discord_id && (
              <p className="text-xs text-[#6b7280]">{app.discord_id}</p>
            )}
          </div>
        </div>

        {/* Right side: action buttons + status + delete + chevron */}
        <div className="flex items-center gap-2 shrink-0">

          {/* StatusBadge */}
          <StatusBadge status={app.status} />

          {/* Delete — idle: icono papelera / confirm: advertencia inline */}
          {deleteStage === "idle" ? (
            <button
              onClick={() => setDeleteStage("confirm")}
              className="text-[#6b7280] hover:text-red-400 transition-colors p-1 rounded"
              title="Eliminar postulación"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          ) : (
            <div className="flex items-center gap-1.5 rounded border border-red-800/60 bg-red-950/40 px-2 py-1">
              <AlertTriangle className="h-3 w-3 text-red-400 shrink-0" />
              <span className="text-[10px] text-red-300 whitespace-nowrap">
                Se eliminará permanentemente
              </span>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="text-[10px] font-semibold text-red-400 hover:text-red-300 transition-colors ml-1 disabled:opacity-50"
              >
                {deleting ? <Loader2 className="h-3 w-3 animate-spin" /> : "Confirmar"}
              </button>
              <button
                onClick={() => setDeleteStage("idle")}
                className="text-[10px] text-[#6b7280] hover:text-[#a3a3a3] transition-colors"
              >
                Cancelar
              </button>
            </div>
          )}

          {/* Chevron */}
          <div
            className="text-[#6b7280] cursor-pointer transition-colors"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-[#262626] px-4 py-4 space-y-5">

          {/* Botones de acción */}
          <div className="flex gap-2">
            {app.status === "pending" && (
              <>
                <Button variant="success" size="sm" disabled={loading} onClick={() => handleStatus("accepted")}>
                  {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Aceptar"}
                </Button>
                <Button variant="destructive" size="sm" disabled={loading} onClick={() => handleStatus("rejected")}>
                  {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Rechazar"}
                </Button>
              </>
            )}
            {app.status !== "pending" && (
              <Button variant="outline" size="sm" disabled={loading} onClick={() => handleStatus("pending")}>
                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Volver a Pendiente"}
              </Button>
            )}
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-3">
            {app.rio_link && (
              <a href={app.rio_link} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-[#3FC7EB] hover:underline">
                <ExternalLink className="h-3 w-3" />Raider.io
              </a>
            )}
            {app.logs_link && (
              <a href={app.logs_link} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-[#FF7C0A] hover:underline">
                <ExternalLink className="h-3 w-3" />WarcraftLogs
              </a>
            )}
            {app.ui_screenshot_url && (
              <a href={app.ui_screenshot_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-[#a3a3a3] hover:underline">
                <ExternalLink className="h-3 w-3" />Captura de UI
              </a>
            )}
            {app.stream_link && (
              <a href={app.stream_link} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-purple-400 hover:underline">
                <ExternalLink className="h-3 w-3" />Stream
              </a>
            )}
          </div>

          {/* Datos rápidos */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2">
            {app.realm && <InfoItem label="Realm" value={app.realm} />}
            {app.country && <InfoItem label="País" value={app.country} />}
            {app.alt_class_availability && <InfoItem label="Alt Disponible" value={app.alt_class_availability} />}
            {app.ragnaros_alt && <InfoItem label="Alt en Ragnaros" value={app.ragnaros_alt} />}
          </div>

          {/* Respuestas del cuestionario */}
          <div className="space-y-3">
            {app.past_progression && (
              <QuestionBlock label="Progresión Pasada" value={app.past_progression} />
            )}
            {app.why_tbs && (
              <QuestionBlock label="¿Por qué TBS?" value={app.why_tbs} />
            )}
            {app.guild_history && (
              <QuestionBlock label="Guilds Anteriores" value={app.guild_history} />
            )}
            {app.why_leaving && (
              <QuestionBlock label="¿Por qué me fui?" value={app.why_leaving} />
            )}
            {app.had_important_position && (
              <QuestionBlock label="¿Ocupé rangos relevantes?" value={app.had_important_position} />
            )}
            {app.know_someone && (
              <QuestionBlock label="¿Conozco a alguien en TBS?" value={app.know_someone} />
            )}
            {app.how_found && (
              <QuestionBlock label="¿Cómo conocí TBS?" value={app.how_found} />
            )}
            {app.extra_info && (
              <QuestionBlock label="Información Adicional" value={app.extra_info} />
            )}
          </div>

          {/* Notas internas */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#6b7280] uppercase tracking-wide">
              Notas Internas
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Comentarios de oficiales..."
              rows={3}
            />
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" disabled={savingNotes} onClick={handleSaveNotes}>
                {savingNotes
                  ? <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                  : <Save className="h-3 w-3 mr-1.5" />}
                Guardar Notas
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-wide text-[#6b7280]">{label}</p>
      <p className="text-xs text-[#f5f5f5] mt-0.5">{value}</p>
    </div>
  );
}

function QuestionBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-[#262626] bg-[#0d0d0d] px-3 py-2.5 space-y-1">
      <p className="text-[10px] font-medium uppercase tracking-widest text-[#6b7280]">{label}</p>
      <p className="text-xs text-[#b8a898] whitespace-pre-wrap leading-relaxed">{value}</p>
    </div>
  );
}
