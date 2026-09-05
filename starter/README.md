# Mobile web app starter

The recurring conventions and code for spinning up a new mobile-first web app that gets installed to an iPhone home screen, deployed to Netlify, and stores per-user state in Netlify Blobs.

## What's here

```
SKILL.md                   The playbook (also a Claude Code skill file)
templates/                 Copy to a new project's root
  index.html               Shell with the iOS PWA meta tags that matter
  styles.css               Design tokens + iOS-style .screen nav stack
  app.js                   Hash router + push/pop transitions + boot flow
  store.js                 Debounced cloud sync with status events
  manifest.webmanifest     Add-to-Home-Screen metadata
netlify/                   Copy to project root, preserving structure
  netlify.toml             API redirect + no-cache headers
  package.json             Root deps (the one Netlify actually installs)
  functions/data.js        Function template with real error surfacing
```

## Use it three ways

### 1. As a Claude Code skill (recommended)

Symlink or copy this folder into `~/.claude/skills/`:

```bash
ln -s "$PWD/starter" ~/.claude/skills/mobile-web-app-starter
```

Then whenever you ask Claude Code to "spin up a mobile web app for X", it'll load `SKILL.md`, know the traps, and reach for the templates automatically.

### 2. As a template repo

```bash
# From this folder
git init && git add -A && git commit -m "Initial commit"
gh repo create mobile-web-app-starter --public --source=. --push
gh repo edit --template  # mark as a GitHub template
```

New projects: `gh repo create my-app --template inko9nito/mobile-web-app-starter`.

### 3. As a manual reference

Read `SKILL.md`, copy files from `templates/` and `netlify/` into a new project, replace the `{{APP_NAME}}` / `{{APP_SHORT_NAME}}` / `{{APP_TITLE}}` placeholders, and go.

## Placeholders to replace

- `{{APP_NAME}}` — full app name ("Silva Life System Companion")
- `{{APP_SHORT_NAME}}` — home-screen label, ≤12 chars ("Silva")
- `{{APP_TITLE}}` — HTML `<title>` (usually same as APP_NAME)

Grep + sed does the whole job:

```bash
grep -rl '{{APP_NAME}}' . | xargs sed -i '' 's/{{APP_NAME}}/My App/g'
```

## Where this came from

Built after debugging one project's iOS auto-zoom, aggressive Safari caching, Netlify Functions dependency resolution, and Bearer-token-with-spaces failures in the same afternoon. Every trap in `SKILL.md` cost real time on that project — the fixes here already work in production.
