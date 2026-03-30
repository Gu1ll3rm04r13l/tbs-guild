import { getServerSession } from "next-auth";
import { authOptions, OFFICER_RANKS } from "@/lib/auth";
import { getWoWAuditData } from "@/lib/wowaudit";

export const revalidate = 1800;

export async function GET() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { guildRank?: string | null; isOfficer?: boolean } | undefined;
  const isOfficer = user?.isOfficer ?? OFFICER_RANKS.includes(user?.guildRank ?? "");

  if (!isOfficer) {
    return Response.json({ error: "No autorizado" }, { status: 403 });
  }

  const data = await getWoWAuditData();
  if (!data) {
    return Response.json({ error: "No se pudo obtener datos de WoWAudit" }, { status: 502 });
  }

  return Response.json(data);
}
