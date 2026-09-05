# Silva Life System Companion

A private, mobile-friendly web app that walks through the Silva Life System
course content, with exercises, reflection questions, rating scales, and
journaling bundled in each chapter/section.

Optimised for iPhone 13 mini (375 × 812) and installable as a PWA — Safari's
**Share → Add to Home Screen** turns it into a standalone app.

Answers sync to **Netlify Blobs** so you can open the app on any device and
pick up where you left off. Access is gated by a passphrase you set as a
Netlify environment variable.

## Project layout

```
index.html          shell
styles.css          mobile-first styles, light + dark auto
app.js              router, screens, block renderers
auth.js             passphrase prompt + localStorage token
store.js            debounced read/write against /api/answers
data/               course content (one file per chapter)
netlify.toml        Netlify build + redirects
netlify/functions/
  config.js         GET /api/config → { ok }
  answers.js        GET / PUT /api/answers → Netlify Blobs
  package.json      @netlify/blobs
```

## First-time deployment (Netlify)

### 1. Create the Netlify site

1. In Netlify: **Add new site → Import an existing project → GitHub**.
2. Pick this repo, branch `main`.
3. Build command: leave blank. Publish directory: `.` (the repo root).
4. Deploy — the first build installs `netlify/functions/package.json`.
5. Optional: **Site configuration → Change site name** to something you'll
   recognise, e.g. `silvamethod`. Your URL becomes
   `https://silvamethod.netlify.app`.

### 2. Set the passphrase

**Site configuration → Environment variables → Add a variable**:

| Key              | Value                                                       |
| ---------------- | ----------------------------------------------------------- |
| `APP_PASSPHRASE` | Any secret string — anyone who knows it can read and write. |

Pick something long (14+ chars). It's the only lock on your data, so treat
it like a password.

### 3. Trigger a deploy and open it on your phone

- **Deploys → Trigger deploy → Deploy site** (env vars take effect on the
  next deploy).
- When it goes green, open the Netlify URL in Safari.
- Enter your passphrase once — it's remembered on that device.
- **Share → Add to Home Screen** to install the standalone app.

### 4. Add more devices

Open the URL on any browser, enter the same passphrase, and you'll see the
same answers. Change the passphrase in Netlify to lock everyone out and
force fresh entries.

## Data & backup

- All answers live in a single JSON blob at `answers/user:default` in
  Netlify Blobs. You can browse and export it from the Netlify UI
  (**Integrations → Netlify Blobs**).
- The app's **Settings → Download JSON backup** exports the same object as
  a local file.

## Running it locally

```bash
npm install -g netlify-cli
netlify init         # link to your Netlify site
netlify env:pull     # download APP_PASSPHRASE
netlify dev          # serves everything on http://localhost:8888
```

For pure UI preview without the backend, `python3 -m http.server 8080` works
too — the app just can't read or save.

## Adding audio later

Exercises that reference a guided audio have an `audio-placeholder` block.
When you have the MP3s, we can swap those for a small player.

## Upgrading to Google Sign-In later

The `auth.js`/`store.js` interface is the same either way. If you decide to
add Google Sign-In later (or per-user accounts for friends), the swap is:

1. Restore the Google-auth version of `auth.js` + `netlify/functions/answers.js`
   (kept in git history — commit `c728538`).
2. Set `GOOGLE_CLIENT_ID` and `ALLOWED_EMAILS` env vars instead of
   `APP_PASSPHRASE`.

## Development branching

Feature work happens on `claude/<slug>` branches off `main`; merge to `main`
to trigger a Netlify production deploy.
