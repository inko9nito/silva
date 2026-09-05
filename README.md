# Silva Life System Companion

A mobile-friendly web app that walks through the Silva Life System course
content, with exercises, reflection questions, and rating scales bundled in
their proper chapter/section context.

Built as a personal companion — nothing gets sent off-device. All answers
live in the browser (`localStorage`) on the phone you use it from.

## Running it

Open `index.html` in a browser, or serve the folder statically:

```
python3 -m http.server 8080
```

On iPhone (Safari), tap **Share → Add to Home Screen** to install it as a
standalone app.

## Structure

- `index.html` — single page shell
- `styles.css` — mobile-first styles, tuned for iPhone 13 mini (375×812)
- `app.js` — router, storage, rendering
- `data/` — course content (one file per chapter)
- `manifest.webmanifest` — PWA install metadata
