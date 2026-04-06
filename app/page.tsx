import { getServerSession } from "next-auth";
import { authOptions, OFFICER_RANKS } from "@/lib/auth";
import { getGuildInfo, HOME_CONTENT_DEFAULT } from "@/lib/guild-info";
import { HomeClient } from "./HomeClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [session, guildInfo] = await Promise.all([
    getServerSession(authOptions),
    getGuildInfo(),
  ]);

  const guildRank = (session?.user as { guildRank?: string | null })?.guildRank ?? "";
  const isOfficer = OFFICER_RANKS.includes(guildRank);

  // DB values override defaults
  const content = {
    ...HOME_CONTENT_DEFAULT,
    ...guildInfo.home_content,
    // deep-merge about_values (array can be patched partially)
    about_values: guildInfo.home_content?.about_values?.length
      ? guildInfo.home_content.about_values
      : HOME_CONTENT_DEFAULT.about_values,
  };

  return <HomeClient content={content} isOfficer={isOfficer} />;
}
