import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/SessionProvider";
import { Navbar } from "@/components/Navbar";
import { createAdminClient } from "@/lib/supabase";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "The Burning Seagull — Ragnaros US",
    template: "%s | The Burning Seagull",
  },
  description:
    "Mythic raiding guild on Ragnaros US. Command center for roster, recruitment, and progression tracking.",
  keywords: ["World of Warcraft", "WoW guild", "Mythic raiding", "The Burning Seagull", "Ragnaros US"],
  openGraph: {
    title: "The Burning Seagull",
    description: "Mythic raiding guild — Ragnaros US",
    type: "website",
  },
};

async function getRaidProgress() {
  try {
    const adminClient = createAdminClient();
    const { data } = await adminClient
      .from("raid_progress")
      .select("*")
      .order("bosses_down", { ascending: false })
      .limit(1)
      .maybeSingle();
    return data;
  } catch {
    return null;
  }
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const progress = await getRaidProgress();

  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} ${geist.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-[#0a0a0a] antialiased">
        <SessionProvider>
          <Navbar
            progress={
              progress
                ? {
                    raidName: progress.raid_name,
                    bossesDown: progress.bosses_down,
                    totalBosses: progress.total_bosses,
                  }
                : undefined
            }
          />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-[#2a2318] py-6 text-center text-xs text-[#6b5e50]">
            <span className="fire-text font-bold">The Burning Seagull</span>
            {" "}&copy; {new Date().getFullYear()} &mdash; Ragnaros US &mdash; World of Warcraft Guild
          </footer>
        </SessionProvider>
      </body>
    </html>
  );
}
