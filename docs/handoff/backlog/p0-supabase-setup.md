# Task: Set Up Supabase Client + Run Database Schema

## Status
backlog

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
- [ ] `@supabase/supabase-js` and `@supabase/ssr` installed
- [ ] `src/lib/supabase/client.ts` created and exports `createClient()`
- [ ] `src/lib/supabase/server.ts` created and exports `createClient()`
- [ ] `src/lib/supabase/admin.ts` created and exports `createAdminClient()`
- [ ] `src/types/database.ts` contains all type definitions from `docs/architecture/types.ts`
- [ ] Database schema applied to Supabase (all tables exist)
- [ ] `npm run build` passes

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
_Implementation notes, decisions made, anything to review._
