import { getWCLRaidData } from "@/lib/warcraftlogs";

// Revalidate every 60s — matches the cache TTL in the lib layer
export const revalidate = 60;

export async function GET() {
  try {
    const data = await getWCLRaidData();
    return Response.json(data);
  } catch {
    return Response.json({ error: "Failed to fetch WCL raid data" }, { status: 502 });
  }
}
