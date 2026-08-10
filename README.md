# Nimmersatt — Artist Pitch Site

Static one-page pitch site for Nimmersatt (HTML + CSS + vanilla JS, no build step).

## Structure

```
surge-artist-pitch-site/
├── index.html        # the whole page
├── css/              # tokens.css, pitch.css, deck.css
├── js/               # interactions (scroll animations, chat demo, nav)
└── assets/           # images, video, logo, tool screenshots
```

## Run locally

No build, no dependencies — just serve the folder over HTTP:

```bash
cd surge-artist-pitch-site
python3 -m http.server 8000
```

Then open http://localhost:8000

(Any static server works, e.g. `npx serve`. Opening `index.html` directly via `file://`
mostly works too, but a local server is recommended so the fonts, video and screenshots load correctly.)

## Editing

- Copy / text: `surge-artist-pitch-site/index.html`
- Styling / layout: `surge-artist-pitch-site/css/pitch.css` (main), `tokens.css` (colors, spacing, type scale)
- Behaviour: `surge-artist-pitch-site/js/`

## Deploy

The site is designed to deploy as-is to any static host (Surge, Netlify, Vercel,
GitHub Pages). Point the host at the `surge-artist-pitch-site/` directory as the
publish/root folder.
