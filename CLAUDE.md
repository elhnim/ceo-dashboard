@AGENTS.md

# CEO Dashboard — Project Conventions

## Stack
- Next.js 16.2.4 (App Router), React 19, TypeScript (strict)
- Tailwind CSS v4, shadcn/ui (base-nova style, Lucide icons)
- Supabase (Postgres + client SDK)
- NextAuth.js for Microsoft SSO
- PWA (service worker + manifest)
- Deployed on Netlify

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (providers, nav)
│   ├── page.tsx                  # My Day landing page
│   ├── (auth)/                   # Auth route group
│   │   ├── login/page.tsx
│   │   └── api/auth/[...nextauth]/route.ts
│   ├── businesses/               # Business module
│   │   ├── page.tsx              # Business list
│   │   ├── [id]/page.tsx         # Business detail
│   │   └── [id]/vmv/page.tsx     # Vision/Mission/Values
│   ├── okrs/                     # OKR module
│   ├── tasks/                    # Tasks module
│   ├── calendar/                 # Calendar module
│   ├── email/                    # Email triage module
│   └── api/                      # API route handlers
│       ├── businesses/route.ts
│       ├── businesses/[id]/route.ts
│       ├── businesses/[id]/vmv/route.ts
│       ├── okrs/route.ts
│       └── ...
├── components/
│   ├── ui/                       # shadcn/ui (DO NOT MODIFY)
│   ├── layout/                   # App shell: nav, sidebar, header
│   ├── businesses/               # Business-specific components
│   ├── okrs/                     # OKR-specific components
│   ├── tasks/                    # Task-specific components
│   ├── calendar/                 # Calendar-specific components
│   ├── email/                    # Email-specific components
│   └── shared/                   # Cross-module components
├── lib/
│   ├── utils.ts                  # shadcn utility (cn function)
│   ├── supabase/
│   │   ├── client.ts             # Browser Supabase client
│   │   ├── server.ts             # Server Supabase client
│   │   └── admin.ts              # Service role client (migrations only)
│   └── services/
│       ├── microsoft-graph.ts    # MS Graph API abstraction
│       ├── businesses.ts         # Business data operations
│       ├── okrs.ts               # OKR data operations
│       └── ...
├── hooks/                        # Custom React hooks
│   ├── use-mobile.ts             # Mobile detection (shadcn)
│   └── ...
└── types/
    ├── database.ts               # Supabase generated types
    ├── business.ts               # Business domain types
    ├── okr.ts                    # OKR domain types
    └── ...
```

## Coding Rules

### TypeScript
- Strict mode — no `any` unless absolutely necessary
- Use `@/*` import alias (maps to `./src/*`)
- Named exports (except Next.js pages/layouts which use default)
- Define types in `src/types/` and import them

### Next.js
- Server Components by default — only `"use client"` for browser APIs, hooks, event handlers
- API routes: `src/app/api/[resource]/route.ts`
- Use `Response.json()` in route handlers
- Dynamic route params via `params` prop (NOT useParams in server components)
- Read `node_modules/next/dist/docs/` for current API docs — this version may differ from training data

### React
- Functional components only
- Custom hooks in `src/hooks/`
- State management via React context (no Redux/Zustand unless needed later)

### Styling
- Tailwind v4 utility classes
- `cn()` from `@/lib/utils` to merge classes
- shadcn/ui components from `@/components/ui/` — use them, don't reinvent
- DO NOT modify `src/components/ui/*` — managed by shadcn CLI
- Custom components go in `src/components/[module]/`

### Supabase
- Browser client: `@/lib/supabase/client.ts`
- Server client: `@/lib/supabase/server.ts`
- Admin client: `@/lib/supabase/admin.ts` (service role, migrations only)
- Always use typed queries with types from `@/types/database.ts`

### API Service Layer
- All external API calls go through service files in `src/lib/services/`
- Services are the abstraction layer — components never call APIs directly
- Each service exports typed functions, not classes

### File Naming
- Components: PascalCase (`BusinessCard.tsx`)
- Utilities/services: camelCase (`supabase.ts`, `microsoftGraph.ts`)
- Types: PascalCase files (`Business.ts`) with named type exports
- API routes: kebab-case dirs (`/api/businesses/route.ts`)

### No Comments Unless
- Explaining a non-obvious "why"
- Documenting a workaround for a specific bug
- A hidden constraint that would surprise a reader

### Error Handling
- API routes: return proper HTTP status codes with `{ error: string }` body
- UI: show user-friendly error states using shadcn components
- Services: throw typed errors, let callers handle display

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL          # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY     # Supabase anon/public key
SUPABASE_SERVICE_ROLE_KEY         # Supabase service role (server only)
MICROSOFT_CLIENT_ID               # Azure AD app client ID
MICROSOFT_CLIENT_SECRET           # Azure AD app client secret
MICROSOFT_TENANT_ID               # Azure AD tenant ID
NEXTAUTH_SECRET                   # NextAuth encryption secret
NEXTAUTH_URL                      # App URL (http://localhost:3000)
```

## Module Independence
Each module (businesses, okrs, tasks, calendar, email) is self-contained:
- Own page routes in `src/app/[module]/`
- Own API routes in `src/app/api/[module]/`
- Own components in `src/components/[module]/`
- Own service in `src/lib/services/[module].ts`
- Own types in `src/types/[module].ts`
- Modules never import from each other's components — shared things go in `src/components/shared/`
