import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

const REGION    = process.env.BLIZZARD_REGION    ?? "us";
const REALM_SLUG = process.env.BLIZZARD_REALM_SLUG ?? "ragnaros";

export type SyncCharacter = {
  name: string;
  realm: string;
  realmName: string;
  characterClass: string;
  race: string;
  faction: "Alliance" | "Horde" | string;
  level: number;
  id: number;
};

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const accessToken = (session.user as { accessToken?: string }).accessToken;
  if (!accessToken) {
    return NextResponse.json({ error: "No access token — volvé a loguearte." }, { status: 401 });
  }

  const res = await fetch(
    `https://${REGION}.api.blizzard.com/profile/user/wow?namespace=profile-${REGION}&locale=en_US`,
    { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" }
  );

  if (!res.ok) {
    if (res.status === 401) {
      return NextResponse.json(
        { error: "Token expirado. Cerrá sesión y volvé a ingresar." },
        { status: 401 }
      );
    }
    return NextResponse.json({ error: `Battle.net API error ${res.status}` }, { status: 502 });
  }

  const data = await res.json();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allChars = (data.wow_accounts ?? []).flatMap((acc: any) => acc.characters ?? []);

  const characters: SyncCharacter[] = allChars
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((c: any) => c.level >= 10 && c.realm?.slug === REALM_SLUG)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((c: any) => ({
      name:           c.name,
      realm:          c.realm.slug,
      realmName:      c.realm.name,
      characterClass: c.playable_class?.name ?? "Unknown",
      race:           c.playable_race?.name   ?? "",
      faction:        c.faction?.name         ?? "",
      level:          c.level as number,
      id:             c.id as number,
    }))
    .sort((a: SyncCharacter, b: SyncCharacter) => b.level - a.level);

  return NextResponse.json(characters);
}
