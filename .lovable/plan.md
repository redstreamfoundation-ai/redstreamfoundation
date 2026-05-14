
## Status: not good to go — dev server is currently failing

I checked the live dev-server logs and the app is not booting. The optimizer is throwing on TanStack Start virtual imports:

```
✘ Could not resolve "#tanstack-start-entry"
✘ Could not resolve "#tanstack-start-plugin-adapters"
✘ Could not resolve "tanstack-start-manifest:v"
✘ Could not resolve "tanstack-start-injected-head-scripts:v"
   in node_modules/@tanstack/start-server-core/...
```

Root cause: in the previous turn I added `optimizeDeps.force: true` to `vite.config.ts` plus a `predev` script that wipes `.vite`. That combination forces Vite/esbuild to pre-bundle `@tanstack/start-server-core`, which only resolves through virtual imports injected by the TanStack Start Vite plugin at runtime. Forcing pre-bundling makes esbuild try to resolve them at bundle time and fail.

Until this is fixed, no UI / fonts / clicks / animations will render at all in preview, so a "good to go" review cannot be completed.

## Plan

### Step 1 — Restore a working dev server (must do first)

In `vite.config.ts`:
- Remove `optimizeDeps.force: true`.
- Add `optimizeDeps.exclude: ["@tanstack/start-server-core", "@tanstack/react-start", "@tanstack/start-client-core"]` so the optimizer never tries to pre-bundle TanStack Start internals.
- Keep the `startupDiagnosticsPlugin` (it's harmless and useful for future failures).

In `package.json`:
- Replace the aggressive `predev` cache wipe with a narrower one that only clears `node_modules/.vite/deps` (the dependency-optimizer cache), not the whole `.vite` directory. This keeps the user-requested "auto-clear stale cache" behavior without blowing away artifacts the TanStack Router plugin needs.

Confirm green by tailing daemon logs until Vite reports `ready in …` with no esbuild errors.

### Step 2 — Full QA pass (only after Step 1 is green)

Routes to walk through in preview, in this order, capturing screenshots and console/network logs:

```text
/                       → landing (Hero, animations, CTAs)
/auth                   → login + signup, Google OAuth button
/donor                  → donor hub
/donor/register         → form validation, blood group, locality
/donor/availability     → toggles, sliders persist
/donor/dashboard        → data loads from donors table
/request                → request hub
/request/blood          → blood group, units, urgency
/request/hospital       → hospital + locality combobox
/request/proof          → upload
/request/review         → summary
/request/submitted      → confirmation
/request/matching       → live matches
/admin                  → Donors, Patient Requests, Settings, Matched Donors
/privacy                → legal copy
```

For each route, verify:
- **Render** — no blank screen, no React error boundary, no 404.
- **Clicks / nav** — every `<Link>` resolves to an existing route file.
- **Forms** — required fields validate, submit succeeds, Supabase row appears.
- **Auth gating** — `_authenticated` parents redirect anonymous users.
- **Data** — admin tables populate from `donors`, `blood_requests`, `app_settings`.
- **Fonts** — heading + body fonts load (no FOUT, no fallback to system).
- **Graphics** — logo, hero, coverage map, icons render at correct sizes.
- **Animations** — Hero, AnimatedCounter, MatchingWave, LiveActivityFeed, DelhiTicker run without jank.
- **Console** — zero errors, zero warnings other than known dev-only ones.
- **Network** — no 4xx/5xx on Supabase calls; RLS denials surface as friendly UI states, not crashes.
- **Responsive** — recheck at 375 / 768 / 1280 widths.
- **SEO** — each route has unique `<title>` and meta description in `head()`.

### Step 3 — Report

Produce a single checklist of pass / fail per route + per category, with screenshots and any concrete bugs found, then fix them in a follow-up build-mode turn.

## Technical details

- The TanStack Start Vite plugin owns the virtual modules `#tanstack-start-entry`, `#tanstack-start-plugin-adapters`, `tanstack-start-manifest:v`, and `tanstack-start-injected-head-scripts:v`. They must stay outside `optimizeDeps`.
- `optimizeDeps.force` is the wrong tool for "clear stale cache on start" because it runs the optimizer over packages that opt out of pre-bundling. The right tool is deleting `node_modules/.vite/deps` before launch (which Vite then rebuilds lazily on demand) — never combined with `force: true`.
- `startupDiagnosticsPlugin` stays as-is so the next failure surfaces a real stack instead of "did not become healthy within 45s".
