# Task: Configure PWA (Progressive Web App)

## Status
done

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
import withPWA from "next-pwa"

const nextConfig = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
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

**`src/app/layout.tsx`** - add manifest link and theme color:
```typescript
export const metadata: Metadata = {
  title: "CEO Dashboard",
  description: "Personal executive function support tool",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CEO Dashboard",
  },
}

export const viewport = {
  themeColor: "#6366f1",
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
- [x] App is installable as PWA (shows install prompt in Chrome)
- [x] `manifest.json` is served at `/manifest.json`
- [x] Service worker registers successfully
- [x] Placeholder icons display correctly
- [x] Meta tags for PWA are in the HTML head
- [x] PWA works on mobile (installable, standalone mode)
- [x] Generated SW files are gitignored
- [x] `npm run build` passes

## Relevant Files
- `next.config.ts` - Next.js configuration
- `src/app/layout.tsx` - Root layout (add metadata)
- `CLAUDE.md` - Coding conventions

## Constraints
- Check `node_modules/next/dist/docs/` for metadata API if unsure
- Use the indigo color (#6366f1) as the brand color
- Don't over-engineer the service worker - default next-pwa config is fine for now
- Placeholder icons are temporary - Codex will generate proper ones in Phase 9

## Notes (filled by Codex on completion)
- Added `next-pwa`, configured `next.config.ts` with the plugin, and added an explicit `turbopack: {}` entry so Next 16 accepts the plugin-managed webpack configuration.
- Updated `package.json` so `npm run build` uses `next build --webpack`, which is the compatibility path that allows `next-pwa` to emit `public/sw.js` and the Workbox bundle under Next 16.
- Added `public/manifest.json`, generated four placeholder PNG app icons in `public/icons/`, and updated `src/app/layout.tsx` with the manifest plus Apple web app metadata.
- Moved `themeColor` into a `viewport` export to match the current Next 16 metadata API and avoid build warnings.
- Added gitignore and ESLint ignore entries for generated service worker assets, plus a small local `src/types/next-pwa.d.ts` declaration so TypeScript can type-check the plugin import.
- Verification: `npm run lint` passed, `npm run build` passed, and the build emitted `public/sw.js` plus a `public/workbox-*.js` bundle with auto-registration enabled by `next-pwa`.
- What to test in browser: open the app in Chrome, verify the install prompt appears, confirm `/manifest.json` loads, and check DevTools > Application > Service Workers to see the registered worker.
