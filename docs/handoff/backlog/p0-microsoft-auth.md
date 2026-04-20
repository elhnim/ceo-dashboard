# Task: Set Up Microsoft SSO Authentication

## Status
backlog

## Priority
P0 (blocking)

## Objective
Implement Microsoft SSO login using NextAuth.js so the user can sign in with their Microsoft account. All pages should be protected — unauthenticated users see a login page.

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
export { auth, signIn, signOut } from './auth-config'

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
Read actual values from `.env.local` — do not hardcode secrets.

## Acceptance Criteria
- [ ] Microsoft SSO login works — clicking "Sign in with Microsoft" redirects to MS login
- [ ] After login, user is redirected to the dashboard (home page)
- [ ] Session includes the Microsoft access token (for later Graph API use)
- [ ] All routes except `/login` and `/api/auth/*` require authentication
- [ ] Unauthenticated users are redirected to `/login`
- [ ] Login page looks clean and professional
- [ ] `npm run build` passes

## Relevant Files
- `CLAUDE.md` — Coding conventions
- `src/app/layout.tsx` — Root layout (needs SessionProvider)
- `node_modules/next/dist/docs/` — Next.js API docs (check middleware docs)

## Constraints
- Use NextAuth.js v5 (App Router compatible)
- Must store the Microsoft access token in the session — we'll need it for Graph API in Phase 3
- Must request ALL the scopes listed above (even though we won't use them all yet)
- Follow file paths in CLAUDE.md

## Notes (filled by Codex on completion)
_Implementation notes, decisions made, anything to review._
