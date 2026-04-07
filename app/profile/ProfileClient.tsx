"use client";

import { useState } from "react";
import Image from "next/image";
import { RefreshCw, Star, CheckCircle2 } from "lucide-react";
import { getClassColor } from "@/lib/utils";
import type { SyncCharacter } from "@/app/api/profile/sync/route";

type Props = {
  battleTag: string;
  guildRank: string | null;
  initialMainChar: string | null;
  initialAvatarUrl: string | null;
};

export function ProfileClient({ battleTag, guildRank, initialMainChar, initialAvatarUrl }: Props) {
  const [characters, setCharacters]   = useState<SyncCharacter[] | null>(null);
  const [mainChar, setMainChar]       = useState(initialMainChar);
  const [avatarUrl, setAvatarUrl]     = useState(initialAvatarUrl);
  const [syncing, setSyncing]         = useState(false);
  const [settingMain, setSettingMain] = useState<string | null>(null);
  const [syncError, setSyncError]     = useState<string | null>(null);

  async function handleSync() {
    setSyncing(true);
    setSyncError(null);
    try {
      const res = await fetch("/api/profile/sync");
      if (!res.ok) {
        const data = await res.json();
        setSyncError(data.error ?? "Error al sincronizar.");
        return;
      }
      setCharacters(await res.json());
    } catch {
      setSyncError("Error de red.");
    } finally {
      setSyncing(false);
    }
  }

  async function handleSetMain(char: SyncCharacter) {
    setSettingMain(char.name);
    try {
      const res = await fetch("/api/profile/set-main", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ charName: char.name, realm: char.realm }),
      });
      if (res.ok) {
        const data = await res.json();
        setMainChar(char.name);
        setAvatarUrl(data.avatarUrl ?? null);
      }
    } finally {
      setSettingMain(null);
    }
  }

  const name = battleTag.split("#")[0];
  const tag  = battleTag.split("#")[1];

  return (
    <div className="space-y-8">

      {/* ── Perfil header ── */}
      <div className="flex items-center gap-5 rounded-xl border border-[#2a2318] bg-[#111009] p-5">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={mainChar ?? "avatar"}
            width={72}
            height={72}
            className="rounded-full border-2 border-[#E8560A]/40 object-cover"
          />
        ) : (
          <div className="h-[72px] w-[72px] rounded-full border-2 border-[#2a2318] bg-[#1a1710] flex items-center justify-center text-2xl font-black text-[#E8560A]">
            {name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="space-y-1">
          <p className="text-xl font-bold text-[#f5efe8]">{name}</p>
          <p className="text-xs font-mono text-[#6b5e50]">#{tag}</p>
          {guildRank && (
            <span className="inline-block text-[9px] font-mono uppercase tracking-wider text-[#E8560A] bg-[#E8560A]/10 border border-[#E8560A]/20 rounded px-1.5 py-0.5">
              {guildRank}
            </span>
          )}
          {mainChar && (
            <p className="text-sm text-[#b8a898]">
              Main: <span className="font-semibold text-[#f5efe8]">{mainChar}</span>
            </p>
          )}
        </div>

      </div>

      {/* ── Sincronizar ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-[#f5efe8]">Mis personajes</h2>
            <p className="text-xs text-[#6b5e50] mt-0.5">
              {characters
                ? `${characters.length} personajes en Ragnaros`
                : "Sincronizá para ver tus personajes de Battle.net"}
            </p>
          </div>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-1.5 rounded-lg border border-[#2a2318] bg-[#1a1710] px-3 py-2 text-xs font-medium text-[#b8a898] hover:text-[#F0B830] hover:border-[#F0B830]/40 transition-colors disabled:opacity-40"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Cargando…" : "Mostrar Personajes"}
          </button>
        </div>

        {syncError && (
          <p className="text-sm text-[#E8560A] rounded-lg border border-[#E8560A]/20 bg-[#E8560A]/5 px-4 py-3">
            {syncError}
          </p>
        )}

        {/* Character list */}
        {characters && (
          <div className="space-y-2">
            {characters.length === 0 && (
              <p className="text-sm text-[#6b5e50] text-center py-8">
                No se encontraron personajes en Ragnaros con este Battle.net.
              </p>
            )}
            {[...characters].sort((a, b) => {
              const aMain = a.name.toLowerCase() === mainChar?.toLowerCase() ? -1 : 0;
              const bMain = b.name.toLowerCase() === mainChar?.toLowerCase() ? -1 : 0;
              return aMain - bMain;
            }).map((char) => {
              const isMain   = char.name.toLowerCase() === mainChar?.toLowerCase();
              const isSetting = settingMain === char.name;
              const classColor = getClassColor(char.characterClass);

              return (
                <div
                  key={char.id}
                  className={`flex items-center gap-4 rounded-xl border px-4 py-3 transition-colors ${
                    isMain
                      ? "border-[#F0B830]/30 bg-[#F0B830]/5"
                      : "border-[#2a2318] bg-[#111009] hover:bg-[#1a1710]"
                  }`}
                >
                  {/* Class color dot */}
                  <div
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ background: classColor }}
                  />

                  {/* Name + class + race */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold" style={{ color: classColor }}>
                      {char.name}
                    </p>
                    <p className="text-xs text-[#6b5e50]">
                      {char.characterClass} · {char.race} · Nv {char.level}
                    </p>
                    {char.faction && (
                      <p className="text-[10px] font-mono mt-0.5" style={{
                        color: char.faction === "Alliance" ? "#3FC7EB" : "#E8560A",
                      }}>
                        {char.faction}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {isMain ? (
                      <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-[#F0B830]">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Main
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSetMain(char)}
                        disabled={!!settingMain}
                        className="flex items-center gap-1 rounded border border-[#2a2318] px-2 py-1 text-[10px] font-mono text-[#6b5e50] hover:text-[#F0B830] hover:border-[#F0B830]/40 transition-colors disabled:opacity-40"
                      >
                        {isSetting ? (
                          <RefreshCw className="h-3 w-3 animate-spin" />
                        ) : (
                          <Star className="h-3 w-3" />
                        )}
                        {isSetting ? "Guardando…" : "Establecer main"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
