import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/SessionProvider";
import { Navbar } from "@/components/Navbar";
import { LanguageProvider } from "@/components/LanguageProvider";

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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "The Burning Seagull — Ragnaros US",
    template: "%s | The Burning Seagull",
  },
  description:
    "Mythic raiding guild on Ragnaros US. Command center for roster, recruitment, and progression tracking.",
  keywords: ["World of Warcraft", "WoW guild", "Mythic raiding", "The Burning Seagull", "Ragnaros US"],
  icons: { icon: "/logo.png" },
  openGraph: {
    title: "The Burning Seagull",
    description: "Mythic raiding guild — Ragnaros US",
    type: "website",
    images: [{ url: "/logo-banner.png", width: 1200, height: 630, alt: "The Burning Seagull" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Burning Seagull",
    description: "Mythic raiding guild — Ragnaros US",
    images: ["/logo-banner.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} ${geist.variable} h-full scroll-smooth`}
    >
      <head>
        <link rel="preconnect" href="https://render.worldofwarcraft.com" />
        <link rel="dns-prefetch" href="https://us.api.blizzard.com" />
      </head>
      <body className="min-h-full flex flex-col bg-[#0a0a0a] antialiased">
        <LanguageProvider>
        <SessionProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-[#2a2318] py-6 text-center text-xs text-[#6b5e50]">
            <span className="fire-text font-bold">The Burning Seagull</span>
            {" "}&copy; {new Date().getFullYear()} &mdash; Ragnaros US &mdash; World of Warcraft Guild
          </footer>
        </SessionProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
