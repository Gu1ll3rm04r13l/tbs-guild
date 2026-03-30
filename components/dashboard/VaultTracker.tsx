"use client";

import { useState, useEffect } from "react";
import { getClassColor } from "@/lib/utils";
import { RefreshCw } from "lucide-react";

type VaultEntry = {
  name: string;
  characterClass: string;
  weeklyRuns: number;
  vaultSlots: 0 | 1 | 2 | 3;
  topKeys: number[];
};

function SlotPips({ slots, runs }: { slots: 0 | 1 | 2 | 3; runs: number }) {
  // Thresholds: 1=1 run, 4=2 slots, 8=3 slots
  const thresholds = [1, 4, 8];
  return (
    <div className="flex items-center gap-1.5">
      {thresholds.map((t, i) => (
        <div
          key={i}
          title={`${t} keys para slot ${i + 1}`}
          className="h-2.5 w-2.5 rounded-sm border transition-colors"
          style={{
            background: runs >= t ? "#F0B830" : "transparent",
            borderColor: runs >= t ? "#F0B830" : "#3d3220",
          }}
        />
      ))}
      <span className="text-xs font-mono text-[#6b5e50] ml-1">{slots}/3 slots</span>
    </div>
  );
}

export function VaultTracker() {
  const [data, setData] = useState<VaultEntry[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/dashboard/vault");
      if (!res.ok) throw new Error();
      setData(await res.json());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const compliant = data?.filter((e) => e.vaultSlots >= 1).length ?? 0;
  const total = data?.length ?? 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[#f5efe8]">Vault M+ Semanal</h3>
          {data && (
            <p className="text-xs text-[#6b5e50] mt-0.5">
              {compliant}/{total} raiders con al menos 1 slot
            </p>
          )}
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs text-[#6b5e50] hover:text-[#F0B830] transition-colors disabled:opacity-40"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Actualizar
        </button>
      </div>

      {/* Progress bar overall */}
      {data && (
        <div className="space-y-1.5">
          <div className="h-1.5 w-full rounded-full bg-[#2a2318] overflow-hidden">
            <div
              className="h-full rounded-full bg-[#F0B830] transition-all duration-500"
              style={{ width: `${total > 0 ? (compliant / total) * 100 : 0}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-[#6b5e50]">
            <span>0</span>
            <span className="text-[#F0B830] font-bold">{Math.round(total > 0 ? (compliant / total) * 100 : 0)}% cumplen</span>
            <span>{total}</span>
          </div>
        </div>
      )}

      {/* Table */}
      {loading && (
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-10 rounded-lg bg-[#1a1710] animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <p className="text-sm text-[#E8560A] text-center py-4">
          Error cargando datos. Verificá WCL_ZONE_ID en el env.
        </p>
      )}

      {data && !loading && (
        <div className="divide-y divide-[#2a2318]">
          {data.map((entry) => {
            const classColor = getClassColor(entry.characterClass);
            return (
              <div key={entry.name} className="flex items-center gap-3 py-2.5">
                {/* Name */}
                <span
                  className="text-sm font-semibold w-32 truncate shrink-0"
                  style={{ color: classColor }}
                >
                  {entry.name}
                </span>

                {/* Top keys */}
                <div className="flex gap-1 flex-1 flex-wrap">
                  {entry.topKeys.slice(0, 8).map((k, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1a1710] border border-[#2a2318]"
                      style={{ color: k >= 10 ? "#F0B830" : "#b8a898" }}
                    >
                      +{k}
                    </span>
                  ))}
                  {entry.topKeys.length === 0 && (
                    <span className="text-xs text-[#3d3220] italic">Sin runs esta semana</span>
                  )}
                </div>

                {/* Slot pips */}
                <SlotPips slots={entry.vaultSlots} runs={entry.weeklyRuns} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
