const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1wk-hwzoFcBktFnVf6tQdww5V-Kc_fJqDxpKI4imIT4I/export?format=csv&gid=241918221";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AuditSummary = {
  refreshedAt: string;        // "29/03 23:40"
  missingEnchants: number;
  memberCount: number;
  weeklyDungeons: number;
  missingVaultOptions: number;
  avgIlvl: number;
};

export type AuditPlayer = {
  name: string;
  ilvl: number | null;
  tierPieces: number | null;
  weeklyDungeons: number | null;
  vaultSlots: number | null;   // 0–3 (M+ slots)
  ioRating: number | null;
};

export type WoWAuditData = {
  summary: AuditSummary;
  players: AuditPlayer[];
};

// ─── CSV parser (no external deps) ───────────────────────────────────────────

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function getWoWAuditData(): Promise<WoWAuditData | null> {
  try {
    const res = await fetch(SHEET_URL, {
      headers: { "User-Agent": "TBS-Guild-Site/1.0" },
      next: { revalidate: 1800 }, // 30 min — wowaudit refreshes ~hourly
    });
    if (!res.ok) return null;

    const text = await res.text();
    const rows = text.split(/\r?\n/).map(parseCSVLine);

    // ── Summary (rows 1 & 4, 0-indexed) ─────────────────────────────────────
    const refreshedAt = rows[1]?.[1] ?? "";
    const summaryVals = rows[4] ?? [];
    // cols: [empty, empty, missingEnchants, ..., members, ..., weeklyDungeons, ..., missingVault]
    const missingEnchants = parseInt(summaryVals[2]) || 0;
    const memberCount     = parseInt(summaryVals[7]) || 0;
    const weeklyDungeons  = parseInt(summaryVals[16]) || 0;
    const missingVaultOptions = parseInt(summaryVals[20]) || 0;

    // avg ilvl is on the last data row: `Average,,267.00,...`
    // We'll compute it from player data instead

    // ── Player data (starts at row 8, 0-indexed) ──────────────────────────────
    // Row 8 col layout (0-indexed within the row):
    //  [2]=rank [3]=name [5]=ilvl
    //  [7]=rank [8]=name [9]=tierPieces
    //  [16]=rank [17]=name [18]=weeklyDungeons
    //  [20]=rank [21]=name [22]=vaultSlots(M)
    //  [30]=rank [31]=name [32]=ioRating

    // Build maps per section, then merge by name
    const ilvlMap     = new Map<string, number>();
    const tierMap     = new Map<string, number>();
    const dungeonMap  = new Map<string, number>();
    const vaultMap    = new Map<string, number>();
    const ioMap       = new Map<string, number>();

    for (let i = 8; i < rows.length; i++) {
      const row = rows[i];
      // Stop at empty or summary rows
      const ilvlName = row[3];
      if (!ilvlName || ilvlName === "Average") break;

      const ilvl = parseFloat(row[5]);
      if (!isNaN(ilvl)) ilvlMap.set(ilvlName, ilvl);

      const tierName = row[8];
      const tierCount = parseInt(row[9]);
      if (tierName && !isNaN(tierCount)) tierMap.set(tierName, tierCount);

      const dungName = row[17];
      const dungCount = parseInt(row[18]);
      if (dungName && !isNaN(dungCount)) dungeonMap.set(dungName, dungCount);

      const vaultName = row[21];
      const vaultSlots = parseInt(row[22]);
      if (vaultName && !isNaN(vaultSlots)) vaultMap.set(vaultName, vaultSlots);

      const ioName = row[31];
      const ioRating = parseInt(row[32]);
      if (ioName && !isNaN(ioRating)) ioMap.set(ioName, ioRating);
    }

    // Merge: use ilvl section as authoritative name list
    const players: AuditPlayer[] = Array.from(ilvlMap.entries()).map(([name, ilvl]) => ({
      name,
      ilvl,
      tierPieces:     tierMap.get(name) ?? null,
      weeklyDungeons: dungeonMap.get(name) ?? null,
      vaultSlots:     vaultMap.get(name) ?? null,
      ioRating:       ioMap.get(name) ?? null,
    }));

    const validIlvls = players.map((p) => p.ilvl).filter((v): v is number => v !== null);
    const avgIlvl = validIlvls.length
      ? Math.round((validIlvls.reduce((a, b) => a + b, 0) / validIlvls.length) * 100) / 100
      : 0;

    return {
      summary: {
        refreshedAt,
        missingEnchants,
        memberCount,
        weeklyDungeons,
        missingVaultOptions,
        avgIlvl,
      },
      players,
    };
  } catch (err) {
    console.error("[wowaudit] fetch failed:", err);
    return null;
  }
}
