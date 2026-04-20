# Task: Set Up Supabase Client + Run Database Schema

## Status
done

## Priority
P0 (blocking)

## Objective
Set up the Supabase client libraries and create the database tables by running the schema SQL.

## Context
The CEO Dashboard uses Supabase as its database. The schema has been designed by the Tech Lead and needs to be applied to the Supabase project. The app needs client files to connect to Supabase from both browser and server contexts.

## What to Build

### 1. Install Supabase SDK
```bash
npm install @supabase/supabase-js @supabase/ssr
```

### 2. Create Supabase client files

**`src/lib/supabase/client.ts`** — Browser client (for client components):
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**`src/lib/supabase/server.ts`** — Server client (for server components and API routes):
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignore in Server Components (read-only)
          }
        },
      },
    }
  )
}
```

**`src/lib/supabase/admin.ts`** — Admin client (service role, for migrations):
```typescript
import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
```

### 3. Copy type definitions
Copy `docs/architecture/types.ts` to `src/types/database.ts`

### 4. Run the database schema
Go to the Supabase SQL Editor (or use the admin client) and run `docs/architecture/database-schema.sql` to create all tables, triggers, indexes, and RLS policies.

Create a seed script at `scripts/seed-db.ts` that can be run to apply the schema:
```typescript
// Read the SQL file and execute it via the admin client
```

## Acceptance Criteria
- [x] `@supabase/supabase-js` and `@supabase/ssr` installed
- [x] `src/lib/supabase/client.ts` created and exports `createClient()`
- [x] `src/lib/supabase/server.ts` created and exports `createClient()`
- [x] `src/lib/supabase/admin.ts` created and exports `createAdminClient()`
- [x] `src/types/database.ts` contains all type definitions from `docs/architecture/types.ts`
- [x] Database schema applied to Supabase (all tables exist)
- [x] `npm run build` passes

## Relevant Files
- `docs/architecture/database-schema.sql` — Full SQL schema
- `docs/architecture/types.ts` — TypeScript type definitions
- `.env.local` — Environment variables (already configured)
- `CLAUDE.md` — Coding conventions

## Constraints
- Follow the exact file paths specified in CLAUDE.md
- Use `@supabase/ssr` for Next.js integration (not raw `@supabase/supabase-js` in components)
- Check Next.js docs at `node_modules/next/dist/docs/` for cookies API if unsure

## Notes (filled by Codex on completion)
- Added `@supabase/ssr` and `@supabase/supabase-js` to the app dependencies and added a `seed:db` script to run the schema loader against a configured Supabase project.
- Created the browser, server, and admin Supabase helpers under `src/lib/supabase/` using the Next.js 16 async `cookies()` API for the server client.
- Copied the shared database/domain type definitions from `docs/architecture/types.ts` into `src/types/database.ts`.
- Added `scripts/seed-db.ts`, which reads `docs/architecture/database-schema.sql`, applies it through `SUPABASE_PG_META_URL` when that admin endpoint is configured, and otherwise verifies the expected public tables through the Supabase service-role API.
- Removed a local temporary Supabase module shim so the real package types are used instead of `unknown`.
- Verification: `npm.cmd run lint` passed, `npm.cmd run build` passed, and `npm.cmd run seed:db` verified the six required public tables through Supabase using the configured service-role key.
- Decision made: because the current `.env.local` does not include a direct SQL admin endpoint, the seed script treats `SUPABASE_PG_META_URL` as optional and falls back to schema verification when the database already exists.
- What to test: if you later add `SUPABASE_PG_META_URL`, rerun `npm run seed:db` to confirm raw SQL application also works for fresh environments.
