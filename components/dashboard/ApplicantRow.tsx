"use client";

import { useState } from "react";
import { ExternalLink, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "./StatusBadge";
import { getClassColor } from "@/lib/utils";
import type { Application } from "@/lib/supabase";

type ApplicantRowProps = {
  application: Application;
  onStatusChange: (id: string, status: "accepted" | "rejected" | "pending") => Promise<void>;
};

export function ApplicantRow({ application: app, onStatusChange }: ApplicantRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState(app.notes ?? "");
  const [loading, setLoading] = useState(false);
  const classColor = getClassColor(app.class);

  async function handleStatus(status: "accepted" | "rejected") {
    setLoading(true);
    try {
      await onStatusChange(app.id, status);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-[#262626] bg-[#161616] overflow-hidden">
      {/* Class color top line */}
      <div className="h-0.5" style={{ background: classColor }} />

      {/* Main row */}
      <div className="flex items-center gap-4 px-4 py-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm" style={{ color: classColor }}>
              {app.char_name}
            </span>
            <span className="text-xs text-[#6b7280]">
              {app.class} — {app.spec}
            </span>
          </div>
          <p className="text-xs text-[#6b7280] mt-0.5">
            {new Date(app.created_at).toLocaleDateString("en-GB", {
              day: "2-digit", month: "short", year: "numeric",
            })}
          </p>
        </div>

        <StatusBadge status={app.status} />

        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-[#6b7280] hover:text-[#f5f5f5] transition-colors ml-2"
          aria-label="Toggle details"
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-[#262626] px-4 py-4 space-y-4">
          {/* Links */}
          <div className="flex flex-wrap gap-3">
            {app.rio_link && (
              <a
                href={app.rio_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-[#3FC7EB] hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
                Raider.io
              </a>
            )}
            {app.logs_link && (
              <a
                href={app.logs_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-[#FF7C0A] hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
                WarcraftLogs
              </a>
            )}
            {app.ui_screenshot_url && (
              <a
                href={app.ui_screenshot_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-[#a3a3a3] hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
                UI Screenshot
              </a>
            )}
          </div>

          {/* Internal notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#6b7280] uppercase tracking-wide">
              Internal Notes
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Officer comments..."
              rows={3}
            />
          </div>

          {/* Action buttons */}
          {app.status === "pending" && (
            <div className="flex gap-2">
              <Button
                variant="success"
                size="sm"
                disabled={loading}
                onClick={() => handleStatus("accepted")}
              >
                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Accept"}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={loading}
                onClick={() => handleStatus("rejected")}
              >
                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Reject"}
              </Button>
            </div>
          )}
          {app.status !== "pending" && (
            <Button
              variant="outline"
              size="sm"
              disabled={loading}
              onClick={() => handleStatus("pending" as "accepted")}
            >
              Reset to Pending
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
