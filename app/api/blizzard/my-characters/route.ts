import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const REGION = process.env.BLIZZARD_REGION ?? "eu";

export type WowCharacterSummary = {
  name: string;
  realm: string;
  realmSlug: string;
  charClass: string;
  level: number;
  faction: string;
};

export async function GET() {
  const session = await getServerSession(authOptions);
  const accessToken = (session?.user as { accessToken?: string })?.accessToken;

  if (!session || !accessToken) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = `https://${REGION}.api.blizzard.com/profile/user/wow?namespace=profile-${REGION}&locale=en_GB`;

  let data: {
    wow_accounts?: {
      characters?: {
        name: string;
        realm: { name: string; slug: string };
        playable_class: { name: string };
        level: number;
        faction: { type: string };
      }[];
    }[];
  };

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });

    if (!res.ok) {
      // Token expired or insufficient scope
      return Response.json({ error: "Blizzard API error", status: res.status }, { status: 502 });
    }

    data = await res.json();
  } catch {
    return Response.json({ error: "Network error" }, { status: 502 });
  }

  const characters: WowCharacterSummary[] = (data.wow_accounts ?? [])
    .flatMap((account) => account.characters ?? [])
    .filter((c) => c.level >= 10)
    .map((c) => ({
      name: c.name,
      realm: c.realm.name,
      realmSlug: c.realm.slug,
      charClass: c.playable_class.name,
      level: c.level,
      faction: c.faction.type, // "HORDE" | "ALLIANCE"
    }))
    .sort((a, b) => b.level - a.level);

  return Response.json(characters);
}
