# Silva Life System Companion

A private, mobile-friendly web app that walks through the Silva Life System
course content, with exercises, reflection questions, rating scales, and
journaling bundled in each chapter/section.

Optimised for iPhone 13 mini (375 × 812) and installable as a PWA — Safari's
**Share → Add to Home Screen** turns it into a standalone app.

Answers sync to **Netlify Blobs** (server-side, per Google account) so you can
open the app on any device and pick up where you left off.

## Project layout

```
index.html          shell
styles.css          mobile-first styles, light + dark auto
app.js              router, screens, block renderers
auth.js             Google Identity Services (Sign in with Google)
store.js            debounced read/write against /api/answers
data/               course content (one file per chapter)
netlify.toml        Netlify build + redirects
netlify/functions/
  config.js         GET /api/config → { googleClientId }
  answers.js        GET / PUT /api/answers → Netlify Blobs
  package.json      @netlify/blobs + google-auth-library
```

## First-time deployment (Netlify)

You need a Google OAuth **Web** client ID and a Netlify site.

### 1. Create the Google OAuth client

1. Go to <https://console.cloud.google.com/apis/credentials>.
2. **Create Credentials → OAuth client ID → Web application**.
3. Under *Authorized JavaScript origins* add:
   - `http://localhost:8080` (for local testing)
   - your Netlify URL, e.g. `https://silva-workbook.netlify.app`
   - your custom domain if you have one
4. Copy the **Client ID** (looks like `12345-abc.apps.googleusercontent.com`).

### 2. Create the Netlify site

1. In Netlify: **Add new site → Import an existing project → GitHub**.
2. Pick this repo, branch `main`.
3. Build command: leave blank. Publish directory: `.` (the repo root).
4. Deploy — the first build installs `netlify/functions/package.json` for you.

### 3. Set environment variables (Site settings → Environment variables)

| Key                | Value                                           |
| ------------------ | ----------------------------------------------- |
| `GOOGLE_CLIENT_ID` | The Web client ID from step 1                   |
| `ALLOWED_EMAILS`   | Your Gmail address (comma-separated if more)    |

`ALLOWED_EMAILS` is the guest list — only these Google accounts can read or
write. If you leave it blank, **any** Google account gets access — leave it
set.

### 4. Enable Netlify Blobs

Netlify Blobs is on by default for new sites. If a request returns "no blob
store" during first use, open **Site → Integrations → Netlify Blobs** and
turn it on. There is nothing else to configure.

### 5. Trigger a deploy and open it on your phone

- Push to `main` or hit **Trigger deploy** in Netlify.
- Open the site in Safari on your iPhone.
- Tap **Share → Add to Home Screen** to install it as a standalone app.
- Sign in with Google the first time; the token refreshes silently after that.

## Running it locally

Netlify Functions run through the Netlify CLI, so the auth + storage layer
needs it locally too:

```bash
npm install -g netlify-cli
netlify init         # link to your Netlify site
netlify env:pull     # download GOOGLE_CLIENT_ID / ALLOWED_EMAILS
netlify dev          # serves index.html + functions on http://localhost:8888
```

`http://localhost:8888` must be in the OAuth client's *Authorized JavaScript
origins* for sign-in to work locally.

If you only want to preview the UI (no sign-in, no saving), a plain static
server works:

```bash
python3 -m http.server 8080
```

## Adding audio later

Exercises that reference a guided audio have an `audio-placeholder` block.
When you have the MP3s, we can swap those for a small player wired up to
files served from `/audio/` (or from a Netlify Blob).

## Development branching

Feature work happens on `claude/<slug>` branches off `main`; merge to `main`
to trigger a Netlify production deploy.
