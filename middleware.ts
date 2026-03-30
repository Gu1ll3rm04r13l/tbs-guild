import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const OFFICER_RANKS = ["guildmaster", "officer", "class-lead"];

export default withAuth(
  function middleware(req) {
    const guildRank = req.nextauth.token?.guildRank as string | null | undefined;
    if (!guildRank || !OFFICER_RANKS.includes(guildRank)) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  },
  {
    callbacks: {
      // Only proceed to middleware fn when there's a valid session token
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*"],
};
