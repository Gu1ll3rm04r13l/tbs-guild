## Rol
Actúa como senior full-stack developer especializado en Next.js App Router, Supabase y autenticación OAuth.

@AGENTS.md

# TBS Guild — Centro de Mando

Plataforma web para la hermandad de WoW **The Burning Seagull** (Mítico/Semi-Tryhard).

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.1 (App Router) — **lee `node_modules/next/dist/docs/` antes de escribir código** |
| Language | TypeScript |
| Styles | Tailwind CSS v4 — dark mode absoluto |
| Auth | NextAuth.js v4 + Battle.net OAuth2 |
| Database | Supabase (PostgreSQL) + `@supabase/supabase-js` v2 |
| UI Components | Shadcn/ui (tema oscuro) |

## Reglas Críticas

- **Seguridad API**: El `BLIZZARD_CLIENT_SECRET` nunca llega al cliente. Toda llamada a Blizzard va por Server Components o Route Handlers (`/app/api/`).
- **ISR**: El Roster usa `revalidate = 3600` (60 min). No fetch en cada request.
- **Auth Guard**: La ruta `/dashboard` (Officer Dashboard) requiere `guild_rank` de oficial. Los ranks con acceso son `["guildmaster", "officer", "class-lead"]` (ver `lib/auth.ts`). No existe `middleware.ts` — el guard lo hace el Server Component con redirect a `/`.
- **Discord Webhook**: Al insertar en `applications`, disparar webhook a Discord. Implementado en `/api/applications/route.ts` vía `notifyNewApplication()` de `lib/discord.ts`. Nunca en el cliente.
- **Error Handling**: Si la API de Blizzard falla, mostrar estado de error elegante con datos en caché; nunca romper la UI.

## Esquema de Base de Datos (Supabase)

```sql
-- Perfiles vinculados a Battle.net
profiles (
  id uuid PRIMARY KEY,
  battle_tag text UNIQUE NOT NULL,
  guild_rank text,                -- e.g. 'officer', 'raider', 'trial'
  main_char_name text,
  avatar_url text
)

-- Postulaciones públicas
applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  char_name text NOT NULL,
  class text NOT NULL,
  spec text NOT NULL,
  rio_link text,
  logs_link text,
  ui_screenshot_url text,
  status text DEFAULT 'pending',  -- 'pending' | 'accepted' | 'rejected'
  created_at timestamptz DEFAULT now()
)

-- Progreso de raid
raid_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  raid_name text NOT NULL,
  bosses_down int NOT NULL,
  total_bosses int NOT NULL,
  difficulty text DEFAULT 'Mythic'
)
```

## Design Tokens

```css
/* Surfaces — warm dark (definidos en app/globals.css) */
--bg-base:       #080706   /* fondo principal */
--bg-surface:    #111009   /* tarjetas */
--bg-elevated:   #1a1710   /* modales, dropdowns */
--border-subtle: #2a2318   /* bordes */
--border-muted:  #3d3220

/* Texto */
--text-primary:   #f5efe8
--text-secondary: #b8a898
--text-muted:     #6b5e50

/* Fire palette — acento del logo */
--fire-red:    #C41A00
--fire-orange: #E8560A
--fire-amber:  #D4960A
--fire-gold:   #F0B830   /* ← color de acento principal (--color-accent) */
--ember:       #FF6B00

Fuentes:
  - Inter / Geist Sans → cuerpo / lectura técnica
  - Geist Mono         → números, stats, código

Clases utilitarias CSS (globals.css):
  .fire-gradient   → gradiente rojo→naranja→dorado (backgrounds)
  .fire-text       → texto con background-clip gradient
  .ember-glow      → box-shadow naranja suave (tarjetas activas)
  .ember-glow-strong → box-shadow naranja intenso

Colores de clase WoW — variables CSS (solo nombres / barras):
  --class-death-knight: #C41E3A  | --class-mage:          #3FC7EB
  --class-paladin:      #F48CBA  | --class-warrior:        #C69B3A
  --class-hunter:       #AAD372  | --class-rogue:          #FFF468
  --class-priest:       #FFFFFF  | --class-shaman:         #0070DD
  --class-druid:        #FF7C0A  | --class-monk:           #00FF98
  --class-demon-hunter: #A330C9  | --class-warlock:        #8788EE
  --class-evoker:       #33937F
```

## Layout de Secciones

1. **Sticky Navbar** — Logo, progreso rápido (`X/8 M`), links (Roster, Apply, Logs), Profile Dropdown (Login con Battle.net).
2. **Hero Status** — Widget de progreso visual: barra porcentual + iconos de jefes derrotados/pendientes. Datos de `raid_progress` en Supabase (entrada manual).
3. **Dynamic Roster** — Grid de tarjetas con ISR 1h. Stats (ilvl, spec) desde la API de Blizzard. **M+ score no es fetched en vivo** — el link a Raider.io se recoge en el formulario de postulación, no en el roster. En mobile: lista simplificada.
4. **Recruitment Hub** (público) — Formulario de postulación con validación de URLs (Raider.io / WarcraftLogs). Al enviar, se dispara el webhook de Discord automáticamente.
5. **Officer Dashboard** (privado, `/dashboard`) — Lista de aspirantes filtrable por estado, botones Aceptar/Rechazar, notas internas. Usa `force-dynamic`.

## Estructura de Carpetas

```
/app
  /api
    /applications         → POST (crear + Discord webhook), PATCH /:id (solo oficiales)
    /auth/[...nextauth]   → Handler NextAuth
    /blizzard/character   → Proxy: getCharacterProfile + getCharacterMedia en paralelo
  /apply                  → Formulario público de postulación
  /dashboard              → Panel privado de oficiales (auth guard, force-dynamic)
  /roster                 → Vista pública del roster (ISR revalidate=3600)
  globals.css             → Variables CSS + Tailwind v4 theme override
  layout.tsx
  page.tsx                → Hero + Status widget

/components
  /ui               → Shadcn/ui base components
  /roster           → RosterCard, RosterGrid
  /progress         → RaidProgressBar, BossIcon
  /apply            → ApplicationForm
  /dashboard        → ApplicantRow, StatusBadge
  Navbar.tsx        → Con Profile Dropdown y auth state
  SessionProvider.tsx → NextAuth wrapper (client component)

/lib
  blizzard.ts  → getAccessToken, getGuildRoster, getCharacterProfile, getCharacterMedia
  supabase.ts  → getSupabaseClient() (browser anon), createAdminClient() (server service role)
  auth.ts      → authOptions NextAuth + OFFICER_RANKS constant
  discord.ts   → notifyNewApplication() — webhook no bloqueante
  utils.ts     → cn() (clsx + tailwind-merge)
```

## QA Checklist

- [x] Auth Flow: Login Battle.net → callback → perfil guardado en `profiles`
- [x] Nueva postulación → notificación en Discord (webhook en `/api/applications`)
- [x] `/dashboard` inaccesible sin `guild_rank` de oficial (`OFFICER_RANKS` en `lib/auth.ts`)
- [x] ISR en roster: `revalidate = 3600`
- [ ] Imágenes de personaje cargan desde CDN de Blizzard (`render.worldofwarcraft.com`)
- [ ] Fallback elegante cuando la API de Blizzard no responde (actualmente silent-fail)
- [ ] Lighthouse Performance > 90 y SEO > 90
- [ ] `middleware.ts` para proteger `/dashboard` a nivel de Edge (hoy el guard está en el Server Component)
