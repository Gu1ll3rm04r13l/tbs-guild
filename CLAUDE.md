## Rol
Actúa como senior full-stack developer especializado en Next.js App Router, Supabase y autenticación OAuth.

@AGENTS.md

# TBS Guild — Sitio Web

Hermandad WoW **The Burning Seagull** (Mítico/Semi-Tryhard, Ragnaros US).
Enfoque del sitio: **Conocernos → Ver redes → Aplicar.**

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.1 (App Router) |
| Language | TypeScript |
| Styles | Tailwind CSS v4 — dark mode absoluto |
| Auth | NextAuth.js v4 + Battle.net OAuth2 |
| Database | Supabase (PostgreSQL) + `@supabase/supabase-js` v2 |
| UI | Shadcn/ui (tema oscuro) |

## Reglas Críticas

- **Seguridad API**: `BLIZZARD_CLIENT_SECRET` nunca al cliente. Toda llamada a Blizzard va por Server Components o Route Handlers.
- **ISR**: Roster usa `revalidate = 3600`. No fetch en cada request.
- **Auth Guard**: `/recruits` requiere `guild_rank` oficial — `OFFICER_RANKS` en `lib/auth.ts`. Guard en el Server Component con redirect a `/`. No hay `middleware.ts`.
- **Discord Webhook**: Al insertar en `applications` → `notifyNewApplication()` en `lib/discord.ts`. Nunca desde el cliente.
- **Error Handling**: Si Blizzard API falla → error elegante con datos en caché; nunca romper la UI.

## Rutas

| Ruta | Acceso | Descripción |
|---|---|---|
| `/` | Público | Hero + About Us + links a Raider.io / WarcraftLogs |
| `/roster` | Público | Grid de miembros (ISR 1h) + Rankings desplegable |
| `/apply` | Público | Formulario de postulación → webhook Discord |
| `/recruits` | Oficiales | Gestión de postulaciones (force-dynamic) |
| `/profile` | Autenticado | Vincular personaje principal |

## DB Schema (Supabase)

```sql
profiles      (id, battle_tag, guild_rank, main_char_name, avatar_url)
applications  (id, char_name, class, spec, rio_link, logs_link, ui_screenshot_url, status, created_at)
raid_progress (id, raid_name, bosses_down, total_bosses, difficulty)
```

## Design Tokens

Variables CSS en `app/globals.css`. Paleta principal:
- Superficies: `#080706` base · `#111009` surface · `#1a1710` elevated
- Bordes: `#2a2318` subtle · `#3d3220` muted
- Texto: `#f5efe8` primary · `#b8a898` secondary · `#6b5e50` muted
- Acento fire: `#E8560A` orange · `#F0B830` gold (accent principal) · `#D4960A` amber
- Clases WoW y utilidades `.fire-gradient`, `.fire-text`, `.ember-glow` → ver `globals.css`

## Estructura Clave

```
/app
  page.tsx                  → Hero + About
  /roster/page.tsx          → Grid + RankingsCollapsible (Suspense → GuildStats)
  /apply/page.tsx           → ApplicationForm
  /recruits/page.tsx        → DashboardClient (officer guard)
  /profile/                 → ProfileClient
  /api/applications/        → POST + PATCH/DELETE /:id
  /api/blizzard/            → character · my-characters
  /api/leaderboard/         → guild rankings (Raider.io)
  /api/wcl/raid-status/     → WarcraftLogs
  /api/profile/             → set-main · sync

/components
  Navbar.tsx                → auth state, lang toggle
  /roster/                  → RosterCard, RosterGrid, RankingsCollapsible
  /dashboard/               → ApplicantRow, StatusBadge, GuildStats (rankings)
  /apply/                   → ApplicationForm, GuildInfoSidebars

/lib
  blizzard.ts · raiderio.ts · warcraftlogs.ts · supabase.ts · auth.ts · discord.ts · i18n.ts
```

## QA

- [x] Auth Battle.net → perfil en `profiles`
- [x] Postulación → webhook Discord
- [x] `/recruits` bloqueado sin rank oficial
- [x] ISR roster `revalidate = 3600`
- [x] Fallback elegante en error de Blizzard API
- [x] Rankings en roster — desplegable, Suspense, no bloquea render
- [ ] Lighthouse Performance > 90 y SEO > 90
