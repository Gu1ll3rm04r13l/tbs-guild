import { getServerSession } from "next-auth";
import { authOptions, OFFICER_RANKS } from "@/lib/auth";
import { getGuildAttendance } from "@/lib/warcraftlogs";

export const revalidate = 300; // 5 min

export async function GET() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { guildRank?: string | null; isOfficer?: boolean } | undefined;
  const isOfficer =
    user?.isOfficer ?? OFFICER_RANKS.includes(user?.guildRank ?? "");

  if (!isOfficer) {
    return Response.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const data = await getGuildAttendance();
    return Response.json(data);
  } catch {
    return Response.json({ error: "Error obteniendo asistencia" }, { status: 502 });
  }
}
