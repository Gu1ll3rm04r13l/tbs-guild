"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";
import { Menu, X, ChevronDown, LogOut, LayoutDashboard, User, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ProgressBadgeProps = {
  bossesDown: number;
  totalBosses: number;
  raidName: string;
};

export function Navbar({ progress }: { progress?: ProgressBadgeProps }) {
  const { data: session, status } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const isOfficer = (session?.user as { isOfficer?: boolean })?.isOfficer;
  const battleTag = (session?.user as { battleTag?: string })?.battleTag ?? session?.user?.name;

  const navLinks = [
    { href: "/roster", label: "Roster" },
    { href: "/apply", label: "Apply" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-[#2a2318] bg-[#080706]/95 backdrop-blur-sm">
      {/* Top fire line */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-[#E8560A] to-transparent opacity-60" />

      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">

        {/* ── Logo ── */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="relative h-9 w-9 transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(232,86,10,0.8)]">
              <Image
                src="/logo.png"
                alt="The Burning Seagull"
                fill
                className="object-contain"
                sizes="36px"
                priority
                onError={(e) => {
                  // Fallback if image not yet added
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
              {/* Fallback icon shown when logo.png missing */}
              <Flame className="absolute inset-0 m-auto h-5 w-5 text-[#E8560A] logo-fallback" />
            </div>
            <div className="hidden sm:block">
              <span className="text-sm font-bold tracking-tight fire-text">
                The Burning Seagull
              </span>
              <p className="text-[10px] text-[#6b5e50] font-mono tracking-widest -mt-0.5">
                RAGNAROS · US
              </p>
            </div>
          </Link>

          {/* Progress badge */}
          {progress && (
            <div className="hidden md:flex items-center gap-1.5 rounded border border-[#E8560A]/20 bg-[#E8560A]/5 px-2.5 py-1">
              <Flame className="h-3 w-3 text-[#E8560A]" />
              <span className="text-xs text-[#b8a898]">{progress.raidName}</span>
              <span className="font-mono text-xs font-bold">
                <span className="text-[#F0B830]">{progress.bossesDown}</span>
                <span className="text-[#6b5e50]">/{progress.totalBosses} M</span>
              </span>
            </div>
          )}
        </div>

        {/* ── Nav links (desktop) ── */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded px-3 py-1.5 text-sm text-[#b8a898] hover:text-[#f5efe8] hover:bg-[#1a1710] transition-colors"
            >
              {link.label}
            </Link>
          ))}
          {isOfficer && (
            <Link
              href="/dashboard"
              className="rounded px-3 py-1.5 text-sm text-[#b8a898] hover:text-[#f5efe8] hover:bg-[#1a1710] transition-colors"
            >
              Dashboard
            </Link>
          )}
        </nav>

        {/* ── Auth ── */}
        <div className="flex items-center gap-3">
          {status === "loading" ? (
            <div className="h-8 w-8 rounded-full bg-[#1a1710] animate-pulse" />
          ) : session ? (
            <div className="relative">
              <button
                onClick={() => setProfileOpen((v) => !v)}
                className="flex items-center gap-2 group"
                aria-label="Profile menu"
              >
                {/* Avatar circle */}
                <div className="relative h-8 w-8 rounded-full border border-[#E8560A]/40 bg-gradient-to-br from-[#3d1f08] to-[#1a0d03] flex items-center justify-center text-xs font-bold text-[#E8560A] transition-all group-hover:border-[#E8560A]/80 group-hover:shadow-[0_0_10px_rgba(232,86,10,0.3)]">
                  {battleTag ? battleTag.charAt(0).toUpperCase() : <User className="h-3.5 w-3.5" />}
                </div>
                <ChevronDown className={cn("h-3 w-3 text-[#6b5e50] transition-transform hidden sm:block", profileOpen && "rotate-180")} />
              </button>

              {profileOpen && (
                <>
                  {/* Backdrop */}
                  <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 rounded-lg border border-[#2a2318] bg-[#0e0c09] shadow-2xl shadow-black/80 z-50 overflow-hidden">
                    {/* Header del perfil */}
                    <div className="px-4 py-3 border-b border-[#1e1a13]">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full border border-[#E8560A]/50 bg-gradient-to-br from-[#3d1f08] to-[#1a0d03] flex items-center justify-center text-sm font-bold text-[#E8560A]">
                          {battleTag ? battleTag.charAt(0).toUpperCase() : "?"}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#f5efe8] truncate">
                            {battleTag?.split("#")[0]}
                          </p>
                          <p className="text-[10px] text-[#6b5e50] font-mono truncate">
                            #{battleTag?.split("#")[1]}
                          </p>
                          {(session.user as { guildRank?: string | null }).guildRank && (
                            <span className="inline-block mt-0.5 text-[9px] font-mono uppercase tracking-wider text-[#E8560A] bg-[#E8560A]/10 border border-[#E8560A]/20 rounded px-1.5 py-0.5">
                              {(session.user as { guildRank?: string | null }).guildRank}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Links */}
                    <div className="py-1">
                      {isOfficer && (
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#b8a898] hover:bg-[#1a1710] hover:text-[#f5efe8] transition-colors"
                          onClick={() => setProfileOpen(false)}
                        >
                          <LayoutDashboard className="h-3.5 w-3.5 text-[#E8560A]" />
                          Officer Dashboard
                        </Link>
                      )}
                      <button
                        onClick={() => { signOut(); setProfileOpen(false); }}
                        className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-[#b8a898] hover:bg-[#1a1710] hover:text-[#f5efe8] transition-colors"
                      >
                        <LogOut className="h-3.5 w-3.5 text-[#6b5e50]" />
                        Sign out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Button size="sm" onClick={() => signIn("battlenet")}>
              Login with Battle.net
            </Button>
          )}

          {/* Mobile toggle */}
          <button
            className="md:hidden text-[#6b5e50] hover:text-[#f5efe8]"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile nav ── */}
      {mobileOpen && (
        <nav className="md:hidden border-t border-[#2a2318] bg-[#080706] px-4 py-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block rounded px-3 py-2 text-sm text-[#b8a898] hover:bg-[#1a1710] hover:text-[#f5efe8]"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {isOfficer && (
            <Link
              href="/dashboard"
              className="block rounded px-3 py-2 text-sm text-[#b8a898] hover:bg-[#1a1710] hover:text-[#f5efe8]"
              onClick={() => setMobileOpen(false)}
            >
              Officer Dashboard
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
