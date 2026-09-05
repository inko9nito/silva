---
name: mobile-web-app-starter
description: Use when scaffolding a new mobile-friendly web app — especially one that will be installed to an iPhone home screen (PWA), hosted on Netlify, and persist per-user state via Netlify Blobs or a similar backend. Covers the recurring iOS Safari traps (input auto-zoom, aggressive caching, safe-area insets, standalone-mode meta tags), Netlify gotchas (Function dependencies in the root package.json, no-cache headers so deploys reach devices immediately), the auth pitfalls around HTTP Bearer tokens with spaces, and provides copy-ready templates for an iOS-style nav-stack router, cloud sync store, and Netlify Function with proper error surfacing. Load whenever the user says "spin up a mobile app", "make a PWA", "iPhone-friendly web app", "mobile-first site", "add to home screen", or asks about a companion / journaling / workbook / notes app for their phone.
---

# Mobile web app starter

The gotchas below cost the author of this skill a full session of debugging. This skill exists so future projects skip that pain.

Load the templates in `templates/` and `netlify/` as the starting point for a new project; don't reinvent them.

## When to invoke

Match on any of: "mobile app", "PWA", "install to home screen", "iPhone web app", "mobile-first", "companion app for my phone", "journaling app I use on my phone", or any project targeting a phone browser as the primary surface.

Also match when a project is destined for Netlify hosting with per-user state — the auth + Blobs + Functions patterns here are the ones that actually work in production.

## Setup order

1. Copy `templates/*` to project root, `netlify/*` to project root (keep the `netlify/functions` structure).
2. Replace `{{APP_NAME}}`, `{{APP_SHORT_NAME}}`, `{{APP_TITLE}}` placeholders in `index.html`, `manifest.webmanifest`, `styles.css` header.
3. Add a favicon (SVG + 180×180 PNG for iOS Add to Home Screen).
4. Wire your data model into `app.js` (chapters/sections/blocks pattern, or replace with whatever your app is).
5. Deploy to Netlify: import repo, build command empty, publish `.`. Set env vars if using auth (see below). Confirm the first build succeeds.
6. Open on iPhone in Safari → Share → Add to Home Screen.

Everything below is what the templates already encode. Read this if a template file doesn't look obvious.

## iOS Safari gotchas (the expensive ones)

### Input auto-zoom

Any `<input>` / `<textarea>` / `<select>` with `font-size < 16px` causes iOS Safari to zoom in on tap and never zoom back. The templates set `font-size: 16px` on every input as a global safety net — don't override it downward. Style with padding/height instead of shrinking the type.

### Standalone-mode meta tags

For Add-to-Home-Screen to launch full-screen instead of inside a Safari chrome mini-window, `index.html` needs the full set:

```html
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Short Name">
<meta name="theme-color" content="#your-color">
<link rel="apple-touch-icon" href="./icons/icon-180.png">
```

`black-translucent` makes the status bar overlay your header — pair with `viewport-fit=cover` in the viewport meta and safe-area padding in CSS (below).

### Safe-area insets

iPhone notch + home indicator need respect. In the viewport meta:

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```

In CSS:

```css
:root {
  --safe-top: env(safe-area-inset-top);
  --safe-bottom: env(safe-area-inset-bottom);
}
.topbar { padding-top: calc(var(--safe-top) + 10px); }
.nav-footer { padding-bottom: calc(var(--safe-bottom) + 10px); }
```

### Aggressive caching

Safari caches HTML/JS/CSS more aggressively than any other browser. A fresh deploy can take 24 hours to reach a device that's already loaded the site once. Fix in `netlify.toml`:

```toml
[[headers]]
  for = "/*.js"
  [headers.values]
    Cache-Control = "no-cache, must-revalidate"
```

Repeat for HTML, CSS, and any inline data files. Long-lived assets (images, fonts, hashed bundles) can still cache normally.

### Fixed positioning + transformed parents

`position: fixed` inside a `transform`-ed ancestor resolves relative to the ancestor, not the viewport. If you use an iOS-style nav stack (screens are absolute + transformed), your fixed footer will be relative to the screen, not the page — which is what you want, but use `position: sticky; bottom: 0` inside a flex column instead of `fixed`. Simpler and doesn't fight the transform layer.

## Netlify gotchas

### Function dependencies live at site root

`netlify/functions/package.json` is ignored. Put `@netlify/blobs` (and anything else your function imports) in the site-**root** `package.json`. If you don't, deployment succeeds but the function crashes at runtime with `ERR_MODULE_NOT_FOUND`. The template's root `package.json` is set up correctly.

### Netlify Blobs auto-config

`getStore({ name: 'foo' })` inside a Netlify Function auto-reads siteID and token from the runtime environment. No env vars to set. Works locally through `netlify dev`. If it throws about "missing environment", you're either running outside `netlify dev` or Blobs isn't enabled on the site (Site → Integrations → Netlify Blobs → Enable).

### Env vars only apply to new builds

Setting an env var doesn't hot-reload the function. Always **Deploys → Trigger deploy → Deploy site** after editing env vars, then wait for green.

### Surface function errors on the client

When a function crashes in production, the user sees a generic Netlify error page — useless for debugging. Wrap every function body in try/catch and return the error message as JSON. The template `netlify/functions/data.js` does this. Combined with a client-side error splash that shows the message inline, you can diagnose without ever opening Netlify logs.

## HTTP Bearer tokens can't contain spaces

RFC 6750 restricts Bearer token chars — spaces, punctuation, and unicode may be silently stripped or normalized by proxies. If a user's passphrase / API key contains anything unusual, the token round-trip fails intermittently.

**Fix**: base64-encode the token on the client before setting `Authorization`, decode on the server. The template's `store.js` and `netlify/functions/data.js` do this. Handles any character.

## iOS-style nav-stack transitions

The template's `app.js` implements a UIKit-style push/pop transition:
- **Forward** nav: incoming screen slides in from the right, current screen parallax-glides ~24% to the left underneath.
- **Back** nav: top screen slides out to the right, revealed screen glides back to center from a partial-left offset.
- Timing: 340ms with `cubic-bezier(0.32, 0.72, 0, 1)` matches iOS.
- Direction is inferred from route-depth changes — no need to track history manually. Home = 0, chapter = 1, section = 2. Deeper is forward, shallower is back.
- Respects `prefers-reduced-motion`.

Each screen scrolls independently, so the topbar sticks per-screen and scroll position is preserved when the previous layer comes back.

## Sync-store pattern

The template `store.js`:
- In-memory cache mirrors the server document.
- Every `set()` marks dirty and schedules a debounced flush (~700ms).
- Flush sends the whole doc as JSON PUT (fine at personal scale; add per-key updates if the doc grows past a few MB).
- Emits status events (`dirty` / `saving` / `saved` / `error`) — hook a "Saving…" indicator into these.
- Captures `lastError` on failure so the UI can surface the real problem.

For a personal-scale app this beats a full ORM. Upgrade path when you outgrow it: add a `version` field and a merge strategy for concurrent writes from multiple devices.

## Debug patterns to keep

- **Surface errors visibly.** Client and server both. `Cannot find module 'foo'` on a splash beats hunting logs.
- **`/api/config` endpoint** that returns non-secret runtime state (env-var presence, feature flags). Lets you verify a deploy shipped what you expected without exposing anything.
- **Preview-mode build.** For any app that gates content behind auth or a live server, ship a preview build that inlines demo data and short-circuits auth — helpful for design review before deploying.

## When something breaks in production

Order of triage:
1. Hit the endpoint directly in a browser (`/api/foo`) — is it returning JSON, a Netlify error page, or 401?
2. Netlify dashboard → Deploys → latest deploy → Function logs.
3. Compare current head commit on `main` against what the browser sees — a hard refresh (or a private window) is often the whole fix.
4. If you added an env var recently: did you trigger a redeploy after?

## What NOT to include

- Frameworks (React, Vue, Svelte) — vanilla JS + a small render function handles this scale without a build step, and no build step means faster iteration and no toolchain rot.
- A service worker for offline. Add later if actually needed — they're a debugging nightmare and iOS support has quirks.
- Complex auth up front. If it's a personal app, start with no gate or a shared passphrase. Add per-user auth (Google, magic link) only when there's a second user.

## Templates in this folder

- `templates/index.html` — HTML shell with all the iOS meta tags
- `templates/styles.css` — design tokens (light + dark), 16px input rule, safe-area padding, `.screen` transitions, sticky nav-footer
- `templates/app.js` — hash router, `swapScreens()` transition engine, boot flow with data loading
- `templates/store.js` — cloud sync store with status events and `lastError`
- `templates/manifest.webmanifest` — PWA install metadata
- `netlify/netlify.toml` — API redirect, cache-control headers
- `netlify/package.json` — root package with `@netlify/blobs`
- `netlify/functions/data.js` — Function with try/catch, Blobs `getStore`, base64 Bearer decode

## Rollout of this skill

Put the folder at `~/.claude/skills/mobile-web-app-starter/` on any machine where you use Claude Code, and Claude will invoke it whenever a matching mobile-app task comes up. Or fork it as a GitHub template repo and `gh repo create --template` for new projects.
