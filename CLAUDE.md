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
- **Auth Guard**: La ruta `/dashboard` (Officer Dashboard) requiere `guild_rank` de oficiales. Redirigir a `/` si no autorizado.
- **Discord Webhook**: Al insertar en `applications`, disparar webhook a Discord. Implementar en la Route Handler o Supabase Edge Function, nunca en el cliente.
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

```
--bg-base:       #0a0a0a   (Rich Black — fondo principal)
--bg-surface:    #161616   (tarjetas)
--border:        #262626   (bordes sutiles)
--text-primary:  #f5f5f5
--text-muted:    #6b7280

Fuentes:
  - Inter         → cuerpo / lectura técnica
  - Geist Mono    → números, stats, código

Colores de clase WoW (solo en nombres / barras):
  Death Knight #C41E3A | Mage #3FC7EB | Paladin #F48CBA
  Warrior #C69B3A      | Hunter #AAD372 | Rogue #FFF468
  Priest #FFFFFF       | Shaman #0070DD | Druid #FF7C0A
  Monk #00FF98         | Demon Hunter #A330C9 | Warlock #8788EE
  Evoker #33937F
```

## Layout de Secciones

1. **Sticky Navbar** — Logo, progreso rápido (`X/8 M`), links (Roster, Apply, Logs), Profile Dropdown (Login con Battle.net).
2. **Hero Status** — Widget de progreso visual: barra porcentual + iconos de jefes derrotados/pendientes.
3. **Dynamic Roster** — Grid de tarjetas. Hover revela ilvl y M+ score desde la API de Blizzard. En mobile: lista simplificada.
4. **Recruitment Hub** (público) — Formulario de postulación con validación de URLs (Raider.io / WarcraftLogs).
5. **Officer Dashboard** (privado, `/dashboard`) — Lista de aspirantes, botones Aceptar/Rechazar, comentarios internos.

## Estructura de Carpetas

```
/app
  /api              → Route Handlers (Blizzard proxy, Discord webhook)
  /apply            → Formulario público de postulación
  /dashboard        → Panel privado de oficiales (auth guard)
  /roster           → Vista pública del roster (ISR)
  layout.tsx
  page.tsx          → Hero + Status widget

/components
  /ui               → Shadcn/ui base components
  /roster           → RosterCard, RosterGrid
  /progress         → RaidProgressBar, BossIcon
  /apply            → ApplicationForm
  /dashboard        → ApplicantRow, StatusBadge

/lib
  blizzard.ts       → Fetch helpers para Game Data & Profile API
  supabase.ts       → Cliente Supabase (server y browser)
  auth.ts           → Configuración NextAuth + BattleNet provider
  discord.ts        → Webhook helper

/styles
  globals.css       → Variables CSS + Tailwind base
```

## QA Checklist

- [ ] Auth Flow: Login Battle.net → callback → perfil guardado en `profiles`
- [ ] Imágenes de personaje cargan desde CDN de Blizzard (`render.worldofwarcraft.com`)
- [ ] `/dashboard` inaccesible sin `guild_rank` de oficial
- [ ] Lighthouse Performance > 90 y SEO > 90
- [ ] Fallback elegante cuando la API de Blizzard no responde
- [ ] Nueva postulación → notificación en Discord
