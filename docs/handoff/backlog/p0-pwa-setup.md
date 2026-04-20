# Task: Configure PWA (Progressive Web App)

## Status
backlog

## Priority
P0 (blocking)

## Objective
Make the CEO Dashboard installable as a PWA on desktop and mobile, with offline capability and proper icons.

## Context
The CEO uses this app daily on both phone and desktop. PWA allows "Add to Home Screen" on mobile and desktop, offline access for cached data, and push notification support (needed later in Phase 8).

## What to Build

### 1. Install next-pwa
```bash
npm install next-pwa
```

### 2. Configure next-pwa

**Update `next.config.ts`**:
```typescript
import withPWA from 'next-pwa'

const nextConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
})({
  // existing next config
})

export default nextConfig
```

### 3. Create PWA manifest

**`public/manifest.json`**:
```json
{
  "name": "CEO Dashboard",
  "short_name": "CEO Dash",
  "description": "Personal executive function support tool",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#09090b",
  "theme_color": "#6366f1",
  "orientation": "any",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-maskable-192.png", "sizes": "192x192", "type": "image/png", "purpose": "maskable" },
    { "src": "/icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

### 4. Create placeholder icons

Create simple placeholder PNG icons at:
- `public/icons/icon-192.png` (192x192)
- `public/icons/icon-512.png` (512x512)
- `public/icons/icon-maskable-192.png` (192x192)
- `public/icons/icon-maskable-512.png` (512x512)

Use a simple indigo (#6366f1) square with "CD" text as placeholder. These will be replaced with proper icons later.

### 5. Update root layout metadata

**`src/app/layout.tsx`** — add manifest link and theme color:
```typescript
export const metadata: Metadata = {
  title: 'CEO Dashboard',
  description: 'Personal executive function support tool',
  manifest: '/manifest.json',
  themeColor: '#6366f1',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'CEO Dashboard',
  },
}
```

### 6. Add to .gitignore
```
# PWA generated files
public/sw.js
public/workbox-*.js
public/sw.js.map
public/workbox-*.js.map
```

## Acceptance Criteria
- [ ] App is installable as PWA (shows install prompt in Chrome)
- [ ] `manifest.json` is served at `/manifest.json`
- [ ] Service worker registers successfully
- [ ] Placeholder icons display correctly
- [ ] Meta tags for PWA are in the HTML head
- [ ] PWA works on mobile (installable, standalone mode)
- [ ] Generated SW files are gitignored
- [ ] `npm run build` passes

## Relevant Files
- `next.config.ts` — Next.js configuration
- `src/app/layout.tsx` — Root layout (add metadata)
- `CLAUDE.md` — Coding conventions

## Constraints
- Check `node_modules/next/dist/docs/` for metadata API if unsure
- Use the indigo color (#6366f1) as the brand color
- Don't over-engineer the service worker — default next-pwa config is fine for now
- Placeholder icons are temporary — Codex will generate proper ones in Phase 9

## Notes (filled by Codex on completion)
_Implementation notes, decisions made, anything to review._
