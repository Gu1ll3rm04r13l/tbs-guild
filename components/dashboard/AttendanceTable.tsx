"use client";

import { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";

type AttendanceEntry = {
  name: string;
  attended: number;
  total: number;
  attendancePct: number;
  lootReceived: number;
  ratio: number | null;
};

function AttBar({ pct }: { pct: number }) {
  const color =
    pct >= 80 ? "#4ade80" :
    pct >= 50 ? "#F0B830" :
    "#E8560A";
  return (
    <div className="flex items-center gap-2 flex-1 min-w-0">
      <div className="h-1.5 w-full rounded-full bg-[#2a2318] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="text-xs font-mono w-9 text-right shrink-0" style={{ color }}>
        {pct}%
      </span>
    </div>
  );
}

export function AttendanceTable() {
  const [data, setData] = useState<AttendanceEntry[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/dashboard/attendance");
      if (!res.ok) throw new Error();
      setData(await res.json());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[#f5efe8]">Asistencia & Loot</h3>
          {data && (
            <p className="text-xs text-[#6b5e50] mt-0.5">
              Últimos {data[0]?.total ?? "?"} raids · ratio = loot por raid asistido
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

      {loading && (
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-10 rounded-lg bg-[#1a1710] animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <p className="text-sm text-[#E8560A] text-center py-4">
          Error cargando asistencia. Verificá WCL_CLIENT_ID / WCL_CLIENT_SECRET.
        </p>
      )}

      {data && !loading && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#2a2318] text-[#6b5e50]">
                <th className="text-left py-2 pr-4 font-medium">Jugador</th>
                <th className="text-left py-2 pr-4 font-medium min-w-[140px]">Asistencia</th>
                <th className="text-right py-2 pr-4 font-medium">Raids</th>
                <th className="text-right py-2 pr-4 font-medium">Loot</th>
                <th className="text-right py-2 font-medium">Ratio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2318]">
              {data.map((e) => (
                <tr key={e.name} className="hover:bg-[#1a1710]/50 transition-colors">
                  <td className="py-2.5 pr-4 font-semibold text-[#f5efe8]">{e.name}</td>
                  <td className="py-2.5 pr-4">
                    <AttBar pct={e.attendancePct} />
                  </td>
                  <td className="py-2.5 pr-4 text-right font-mono text-[#b8a898]">
                    {e.attended}/{e.total}
                  </td>
                  <td className="py-2.5 pr-4 text-right font-mono text-[#b8a898]">
                    {e.lootReceived}
                  </td>
                  <td className="py-2.5 text-right font-mono">
                    <span className={
                      e.ratio === null ? "text-[#3d3220]" :
                      e.ratio >= 1.5 ? "text-amber-400" :
                      "text-[#b8a898]"
                    }>
                      {e.ratio !== null ? e.ratio.toFixed(1) : "—"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
