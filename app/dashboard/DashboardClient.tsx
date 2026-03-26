"use client";

import { useState } from "react";
import { ApplicantRow } from "@/components/dashboard/ApplicantRow";
import type { Application } from "@/lib/supabase";

type DashboardClientProps = {
  initialApplications: Application[];
};

type StatusFilter = "all" | "pending" | "accepted" | "rejected";

export function DashboardClient({ initialApplications }: DashboardClientProps) {
  const [applications, setApplications] = useState(initialApplications);
  const [filter, setFilter] = useState<StatusFilter>("all");

  async function handleStatusChange(
    id: string,
    status: "accepted" | "rejected" | "pending"
  ) {
    const res = await fetch(`/api/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (res.ok) {
      setApplications((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status } : a))
      );
    }
  }

  const filtered =
    filter === "all" ? applications : applications.filter((a) => a.status === filter);

  const filterOptions: { label: string; value: StatusFilter }[] = [
    { label: "All", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Accepted", value: "accepted" },
    { label: "Rejected", value: "rejected" },
  ];

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-1 rounded-lg border border-[#262626] bg-[#161616] p-1 w-fit">
        {filterOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              filter === opt.value
                ? "bg-[#262626] text-[#f5f5f5]"
                : "text-[#6b7280] hover:text-[#a3a3a3]"
            }`}
          >
            {opt.label}
            {opt.value !== "all" && (
              <span className="ml-1.5 font-mono text-[10px] opacity-70">
                {applications.filter((a) =>
                  opt.value === "all" ? true : a.status === opt.value
                ).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <p className="text-center text-sm text-[#6b7280] py-8">No applications in this category.</p>
        ) : (
          filtered.map((app) => (
            <ApplicantRow
              key={app.id}
              application={app}
              onStatusChange={handleStatusChange}
            />
          ))
        )}
      </div>
    </div>
  );
}
