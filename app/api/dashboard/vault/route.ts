import { getServerSession } from "next-auth";
import { authOptions, OFFICER_RANKS } from "@/lib/auth";
import { getGuildVaultStatus } from "@/lib/raiderio";

export const revalidate = 1800; // 30 min

export async function GET() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { guildRank?: string | null; isOfficer?: boolean } | undefined;
  const isOfficer =
    user?.isOfficer ?? OFFICER_RANKS.includes(user?.guildRank ?? "");

  if (!isOfficer) {
    return Response.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const data = await getGuildVaultStatus();
    return Response.json(data);
  } catch {
    return Response.json({ error: "Error obteniendo datos de vault" }, { status: 502 });
  }
}
