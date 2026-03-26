import { createClient } from "@supabase/supabase-js";

// Browser / client-side client (uses anon key) — lazy singleton
let _browserClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (!_browserClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    _browserClient = createClient(url, key);
  }
  return _browserClient;
}

// Keep named export for convenience in client components
export const supabase = { get client() { return getSupabaseClient(); } };

// Server-side admin client (uses service role key — NEVER expose to client)
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  }
  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type Profile = {
  id: string;
  battle_tag: string;
  guild_rank: string | null;
  main_char_name: string | null;
  avatar_url: string | null;
};

export type Application = {
  id: string;
  char_name: string;
  class: string;
  spec: string;
  rio_link: string | null;
  logs_link: string | null;
  ui_screenshot_url: string | null;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
  notes?: string | null;
};

export type RaidProgress = {
  id: string;
  raid_name: string;
  bosses_down: number;
  total_bosses: number;
  difficulty: string;
};
