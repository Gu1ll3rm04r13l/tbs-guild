import { NextRequest } from "next/server";
import { getCharacterProfile, getCharacterMedia } from "@/lib/blizzard";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const realm = searchParams.get("realm");
  const name = searchParams.get("name");

  if (!realm || !name) {
    return Response.json({ error: "Missing realm or name" }, { status: 400 });
  }

  try {
    const [profile, avatarUrl] = await Promise.all([
      getCharacterProfile(realm, name),
      getCharacterMedia(realm, name),
    ]);

    if (!profile) {
      return Response.json({ error: "Character not found" }, { status: 404 });
    }

    return Response.json({ profile, avatarUrl });
  } catch {
    return Response.json({ error: "Blizzard API unavailable" }, { status: 503 });
  }
}
