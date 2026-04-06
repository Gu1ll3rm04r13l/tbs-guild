import { getGuildRoster } from "@/lib/blizzard";
import { getGuildParses } from "@/lib/warcraftlogs";

export const revalidate = 300; // 5 min

const RAIDER_RANKS = [0, 1, 4];

function parseColor(pct: number): string {
  if (pct >= 100) return "#e5cc80";
  if (pct >= 99)  return "#e268a8";
  if (pct >= 95)  return "#ff8000";
  if (pct >= 75)  return "#a335ee";
  if (pct >= 50)  return "#0070dd";
  if (pct >= 25)  return "#1eff00";
  return "#9d9d9d";
}

export async function GET() {
  try {
    const rawMembers = await getGuildRoster();
    const names = rawMembers
      .filter((m) => RAIDER_RANKS.includes(m.rank))
      .map((m) => m.character.name);

    // Single batched WCL query — 1 HTTP request regardless of roster size
    const parses = await getGuildParses(names);

    const rows = Object.entries(parses)
      .filter(([, v]) => v !== null)
      .sort(([, a], [, b]) => (b ?? 0) - (a ?? 0))
      .slice(0, 20)
      .map(([name, value]) => ({
        name,
        value: `${value}%`,
        color: parseColor(value ?? 0),
        bar: value ?? 0,
      }));

    return Response.json({ rows });
  } catch {
    return Response.json({ rows: [] }, { status: 502 });
  }
}
