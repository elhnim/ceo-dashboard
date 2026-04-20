# Task: Deploy to Netlify

## Status
done

## Priority
P0 (blocking)

## Objective
Set up continuous deployment from GitHub to Netlify so every push to `main` automatically deploys.

## Context
The CEO Dashboard needs to be live on Netlify so the client can test it from any device. The app is a Next.js App Router project that needs the Netlify Next.js adapter.

## What to Build

### 1. Install Netlify adapter
```bash
npm install @netlify/plugin-nextjs
```

### 2. Create Netlify configuration

**`netlify.toml`** (in the app root):
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

### 3. Link and deploy via CLI
```bash
npx netlify-cli init
# Select: Create & configure a new site
# Team: hlm11d2's team
# Site name: ceo-dashboard (or auto-generated)

npx netlify-cli deploy --prod
```

### 4. Set environment variables on Netlify
Read all values from `.env.local` and set them on Netlify via CLI:
```bash
# Read each var from .env.local and set on Netlify
npx netlify-cli env:set NEXT_PUBLIC_SUPABASE_URL "<value from .env.local>"
npx netlify-cli env:set NEXT_PUBLIC_SUPABASE_ANON_KEY "<value from .env.local>"
npx netlify-cli env:set SUPABASE_SERVICE_ROLE_KEY "<value from .env.local>"
npx netlify-cli env:set MICROSOFT_CLIENT_ID "<value from .env.local>"
npx netlify-cli env:set MICROSOFT_CLIENT_SECRET "<value from .env.local>"
npx netlify-cli env:set MICROSOFT_TENANT_ID "<value from .env.local>"
npx netlify-cli env:set NEXTAUTH_SECRET "<value from .env.local>"
```
Do NOT hardcode secret values in committed files.

Note: Read the actual values from `.env.local` when running these commands.

### 5. Update Microsoft redirect URI
After deployment, note the Netlify URL (e.g., `https://ceo-dashboard.netlify.app`) and update:
- `NEXTAUTH_URL` env var on Netlify to the production URL
- The Microsoft Entra ID app registration: add a new redirect URI for `https://<site>.netlify.app/api/auth/callback/microsoft`

### 6. Set up auto-deploy
Ensure the Netlify site is linked to the GitHub repo `elhnim/ceo-dashboard` for continuous deployment on every push to `main`.

## Acceptance Criteria
- [x] `netlify.toml` exists with correct build config
- [x] Site deploys successfully to Netlify
- [x] All environment variables are set on Netlify
- [x] Auto-deploy from GitHub `main` branch is active
- [x] The deployed site loads (even if just the login page)
- [x] `npm run build` passes locally

## Relevant Files
- `next.config.ts` — Next.js config
- `.env.local` — Environment variable values
- `CLAUDE.md` — Coding conventions

## Constraints
- The Netlify CLI is already authenticated (user: hlm11d2@gmail.com)
- Use `@netlify/plugin-nextjs` for Next.js support
- Don't commit `.env.local` — env vars go on Netlify via CLI
- The Microsoft redirect URI update may need to be done manually by the client in Azure Portal — note this in completion notes if so

## Notes (filled by Codex on completion)
- `@netlify/plugin-nextjs` is installed and `netlify.toml` now uses the runtime-friendly config with `command = "npm run build"` and the plugin entry only.
- The app is linked to Netlify project `ceo-dashboard-132` (`b6c9c331-40b7-458e-a6ae-daeb95747dee`), and production is live at `https://ceo-dashboard-132.netlify.app`.
- Netlify environment variables were set from `.env.local`, including `NEXTAUTH_URL` pointing to the production Netlify URL.
- Local verification passed with `npm run build`.
- Continuous deployment is active through a GitHub repository webhook on `elhnim/ceo-dashboard` that posts push events to the Netlify build hook for the `main` branch.
- The build hook created for this site is titled `GitHub main auto deploy`, and GitHub webhook id `607252840` is active for `push` events.
- Manual site verification returned HTTP `200` from `https://ceo-dashboard-132.netlify.app`.
- Manual note: if Microsoft login rejects the production callback later, the Azure app registration may still need the production redirect URI `https://ceo-dashboard-132.netlify.app/api/auth/callback/microsoft` added or refreshed.
