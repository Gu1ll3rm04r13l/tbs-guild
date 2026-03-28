import { getServerLeaderboard } from "@/lib/raiderio";

export const revalidate = 300; // 5 min

export async function GET() {
  try {
    const data = await getServerLeaderboard();
    return Response.json(data);
  } catch {
    return Response.json({ error: "Failed to fetch leaderboard" }, { status: 502 });
  }
}
