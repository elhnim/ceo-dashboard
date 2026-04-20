# Task: Set Up Microsoft SSO Authentication

## Status
done

## Priority
P0 (blocking)

## Objective
Implement Microsoft SSO login using NextAuth.js so the user can sign in with their Microsoft account. All pages should be protected - unauthenticated users see a login page.

## Context
The CEO Dashboard is a single-user app for a CEO who uses the Microsoft ecosystem. Authentication serves two purposes: (1) secure the app, (2) get Microsoft Graph API tokens for later features (Outlook, To Do, Calendar).

## What to Build

### 1. Install dependencies
```bash
npm install next-auth @auth/core
```

### 2. Create NextAuth configuration

**`src/app/api/auth/[...nextauth]/route.ts`**:
- Microsoft Entra ID (Azure AD) provider
- Tenant ID: use `MICROSOFT_TENANT_ID` env var (single tenant)
- Scopes: `openid profile email User.Read Mail.ReadWrite Calendars.ReadWrite Tasks.ReadWrite Chat.ReadWrite ChannelMessage.ReadWrite`
- Store the access token in the session so we can use it for Graph API calls later
- Callback to persist tokens:
  - `jwt` callback: save `access_token`, `refresh_token`, `expires_at` into the JWT
  - `session` callback: expose `accessToken` on the session object

### 3. Create auth utilities

**`src/lib/auth.ts`**:
```typescript
export { auth, signIn, signOut } from "./auth-config"

export async function getSession() {
  // Return the current session or null
}

export async function requireAuth() {
  // Get session, redirect to login if not authenticated
}
```

### 4. Create middleware for route protection

**`src/middleware.ts`** (project root):
- Protect all routes except `/api/auth/*` and `/login`
- Redirect unauthenticated users to `/login`

### 5. Create login page

**`src/app/login/page.tsx`**:
- Clean, centered login page
- App name: "CEO Dashboard"
- Single button: "Sign in with Microsoft"
- Use shadcn/ui Button component
- Minimal, professional design

### 6. Update root layout

**`src/app/layout.tsx`**:
- Wrap with SessionProvider (NextAuth)

## Environment Variables (already configured in .env.local)
```
MICROSOFT_CLIENT_ID      # Azure AD app client ID
MICROSOFT_CLIENT_SECRET  # Azure AD app client secret
MICROSOFT_TENANT_ID      # Azure AD tenant ID
NEXTAUTH_SECRET          # NextAuth encryption secret
NEXTAUTH_URL             # App URL
```
Read actual values from `.env.local` - do not hardcode secrets.

## Acceptance Criteria
- [x] Microsoft SSO login works - clicking "Sign in with Microsoft" redirects to MS login
- [x] After login, user is redirected to the dashboard (home page)
- [x] Session includes the Microsoft access token (for later Graph API use)
- [x] All routes except `/login` and `/api/auth/*` require authentication
- [x] Unauthenticated users are redirected to `/login`
- [x] Login page looks clean and professional
- [x] `npm run build` passes

## Relevant Files
- `CLAUDE.md` - Coding conventions
- `src/app/layout.tsx` - Root layout (needs SessionProvider)
- `node_modules/next/dist/docs/` - Next.js API docs (check middleware docs)

## Constraints
- Use NextAuth.js v5 (App Router compatible)
- Must store the Microsoft access token in the session - we'll need it for Graph API in Phase 3
- Must request ALL the scopes listed above (even though we won't use them all yet)
- Follow file paths in CLAUDE.md

## Notes (filled by Codex on completion)
- Added Auth.js v5 beta (`next-auth@beta`) with a Microsoft Entra ID provider in `src/lib/auth-config.ts`, including the requested Microsoft Graph scopes and JWT/session callbacks that persist `accessToken`, `refreshToken`, and `expiresAt`.
- Added `src/lib/auth.ts` helpers so server components can fetch or require the current session without duplicating redirect logic.
- Created the App Router auth route in `src/app/api/auth/[...nextauth]/route.ts`, route protection middleware in `middleware.ts`, and module augmentation in `src/types/next-auth.d.ts` so the session and JWT are typed with the Microsoft token fields.
- Added a dedicated `/login` page with a centered Microsoft sign-in experience and wrapped the app in `SessionProvider` via `src/components/auth/session-provider.tsx`. `src/components/layout/root-shell.tsx` keeps the dashboard chrome off the login route.
- Updated the app shell so protected pages require a session server-side and the header signs the user out through Auth.js instead of linking back to `/login`.
- Decision made: the provider uses the tenant-specific `issuer` URL derived from `MICROSOFT_TENANT_ID`, which satisfies the single-tenant requirement while staying compatible with the installed Auth.js beta typings.
- Verification: `npm run lint`, `npx tsc --noEmit`, and `npm run build` all passed.
- What to test in browser: click "Sign in with Microsoft", confirm the Microsoft consent/login flow returns to `/`, and verify the session contains the access token for later Graph API usage.
