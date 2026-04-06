"use client";

import { useState } from "react";
import { ApplicantRow } from "@/components/dashboard/ApplicantRow";
import { useLanguage } from "@/components/LanguageProvider";
import { t } from "@/lib/i18n";
import type { Application } from "@/lib/supabase";

type StatusFilter = "all" | "pending" | "accepted" | "rejected";

export function DashboardClient({ initialApplications }: { initialApplications: Application[] }) {
  const { lang } = useLanguage();
  const TR = t[lang].recruits;

  const [applications, setApplications] = useState(initialApplications);
  const [filter, setFilter] = useState<StatusFilter>("all");

  async function handleStatusChange(id: string, status: "accepted" | "rejected" | "pending", notes?: string) {
    const res = await fetch(`/api/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, notes: notes ?? null }),
    });
    if (res.ok) {
      const data = await res.json();
      setApplications((prev) =>
        prev.map((a) => a.id === id ? { ...a, status, notes: notes ?? a.notes, reviewed_by: data.reviewed_by ?? a.reviewed_by } : a)
      );
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/applications/${id}`, { method: "DELETE" });
    if (res.ok) setApplications((prev) => prev.filter((a) => a.id !== id));
  }

  const filtered = filter === "all" ? applications : applications.filter((a) => a.status === filter);
  const pending  = applications.filter((a) => a.status === "pending").length;
  const accepted = applications.filter((a) => a.status === "accepted").length;
  const rejected = applications.filter((a) => a.status === "rejected").length;

  const filterOptions = [
    { label: TR.all,      value: "all"      as StatusFilter },
    { label: TR.pending,  value: "pending"  as StatusFilter },
    { label: TR.accepted, value: "accepted" as StatusFilter },
    { label: TR.rejected, value: "rejected" as StatusFilter },
  ];

  return (
    <div className="space-y-4">

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: TR.total,    value: applications.length, color: "text-[#f5f5f5]" },
          { label: TR.pending,  value: pending,             color: "text-amber-400" },
          { label: TR.accepted, value: accepted,            color: "text-green-400" },
          { label: TR.rejected, value: rejected,            color: "text-red-400"   },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg border border-[#262626] bg-[#161616] p-4 text-center">
            <p className={`text-2xl font-bold font-mono ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-[#6b7280] mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 rounded-lg border border-[#262626] bg-[#161616] p-1 w-fit">
        {filterOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              filter === opt.value ? "bg-[#262626] text-[#f5f5f5]" : "text-[#6b7280] hover:text-[#a3a3a3]"
            }`}
          >
            {opt.label}
            {opt.value !== "all" && (
              <span className="ml-1.5 font-mono text-[10px] opacity-70">
                {applications.filter((a) => a.status === opt.value).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <p className="text-center text-sm text-[#6b7280] py-8">{TR.noApplications}</p>
        ) : (
          filtered.map((app) => (
            <ApplicantRow key={app.id} application={app} onStatusChange={handleStatusChange} onDelete={handleDelete} />
          ))
        )}
      </div>
    </div>
  );
}
