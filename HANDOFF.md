# Handoff — Nimmersatt Artist Pitch Site

This document gives an independent person the full context to open the project and
keep working, without needing the original chat. Read this together with
`README.md` (how to run) and `surge-artist-pitch-site/agent/README.md` (the LLM part).

Last updated: 2026-08-17.

---

## 1. What this is

A single-page static pitch site for **Nimmersatt** (artist management / creative
production, Berlin). Plain **HTML + CSS + vanilla JS**, no build step, no framework.
It has been iterated through many rounds of copy/design feedback (see change log
below). It is served as static files locally and can deploy to any static host.

Live-preview locally:

```bash
cd surge-artist-pitch-site
python3 -m http.server 8000     # → http://localhost:8000
```

## 2. Repo structure

```
├── README.md                     # structure + run/deploy
├── HANDOFF.md                    # this file
└── surge-artist-pitch-site/
    ├── index.html                # the whole page + inline chat-demo script (bottom)
    ├── css/                      # tokens.css (design tokens), pitch.css (main), deck.css
    ├── js/                       # motion.js, main.js, vendor/ (GSAP, ScrollTrigger, Lenis)
    ├── assets/                   # images, video, logo, PDFs, tool screenshots
    ├── agent/                    # LLM contract-summarizer agent (definition + grounding data)
    └── api/                      # serverless proxy for the summarizer (key stays server-side)
```

Where to edit:
- **Copy / text / structure** → `surge-artist-pitch-site/index.html`
- **Layout / styling** → `css/pitch.css` (main), `css/tokens.css` (colors, spacing, type scale)
- **Scroll / motion behaviour** → `js/motion.js`, `js/main.js`
- **Chat demo behaviour** → inline `<script>` at the bottom of `index.html`

## 3. Page sections (current order)

1. **Hero** (`#hero`) — wordmark, subline, three service labels. (The decorative
   dot image was removed on request.)
2. **About / FYI** (`#about`) — manifesto + a "what we do" services list rendered
   as a left-aligned **staircase** (rows of 2 / 3 / 5 / 4, forced via
   `.about__services-br` line-break items).
3. **Workflow** (`#work`) — "One workflow…" with an **inline muted YouTube player**
   (video id `L8e_iV6BrQo`, privacy `youtube-nocookie`) and two real product
   screenshots (`assets/tool/dashboard.png`, `assets/tool/ki-assistant.png`).
4. **Pillars / "the catch"** (`#pillars`) — the contract terms: Non-Exclusivity,
   Commission, Exit.
5. **Industries** (`#industries`) — "But go ahead / And see for yourself" + the
   **chat box** (ChatGPT/Gemini/Claude tabs) that summarizes the contract. See §5.
6. **Code of Conduct** (`#proof`) — heading forced to one row
   (`.manifesto__line--onerow`).
7. **Collective / Agreement** (`#collective`) — three tiles (Discord / Contract /
   Package) + "What we expect from you" (three partners).
8. **Clients** — logo wall.
9. **Contact** (`#contact`) — application timeline (3 steps), CTA email, document
   downloads (dropdown), footer.

Nav labels: **FYI** (→#about), **Workflow**, **Agreement** (→#collective),
**Contact**. (Nav text is uppercased by CSS.)

## 4. Change log of this working session (high level)

Copy/design, applied from annotation feedback:
- Hero: subline now ends "…get you booked – without compromising identity nor
  your art"; decorative dot image **removed**.
- About services list reformatted into the 2/3/5/4 staircase; "Cinematic
  Storytelling" removed; rows 3↔4 swapped per feedback.
- Workflow moved **above** the pillars; GIF placeholder replaced by the inline
  video; photo placeholders replaced by the two screenshots; labels → "AI AGENT",
  "STRUCTURE · PLAN · OVERVIEW"; H3 "Free and easy to join" → "Your own
  secretary"; overview copy → "what's moving, what's waiting … your focus"; lead →
  "Our team is currently pulling all-nighters … Once listed in our roster …".
- Pillars reframed as contract terms; "Non-Exclusivity" one row; "Term & Exit" →
  "Exit".
- Code of Conduct heading forced to one row; lead → "Listen, we've all been
  there… You are what you eat. So don't let anyone eat shit. Keep it a hunnid…".
- Collective: heading "Don't fight over fucking crumbles. Let's bake the cake
  together"; trimmed to 3 tiles (Discord/Contract/Package), tile headlines
  top-aligned; "What we expect from you" reduced to 3 (Authenticity → "please
  stay yourself"; Reliability; Appetite), laid out in 3 columns.
- Contact timeline: steps "Make it here / Take a decision / Book your date";
  step-01 copy rewritten and a line added ("That being said – it's a wrap. Hope
  to speak to you soon!"); the "admin here…" note pushed further down
  (`.timeline__note--lower2`); step-03 note is a **Calendly link**
  ("send me to calendly" → https://calendly.com/otto-c-windmoeller/nimmersatt-meet-greet);
  step-02 ends "…or whatever is you"; CTA label "anything else".

Small helper CSS classes added: `.manifesto__line--onerow`, `.partners--three`,
`.timeline__note--lower`, `.timeline__note--lower2`, `.tool-video`, `.tool-shot`.

## 5. Contract-summarizer agent + chat (IMPORTANT — read before enabling)

Goal: the chat box in the Industries section should summarize the NIMMERSATT
contract with an LLM (DeepSeek was requested), grounded **only** on the contract.

Built (see `surge-artist-pitch-site/agent/README.md` for details):
- `agent/contract-summarizer.agent.md` — agent definition: faithful, fact-based,
  uses ONLY the contract, preserves numbers/terms/context, refuses out-of-scope.
- `agent/nimmersatt-vertrag-de.txt` — the only knowledge source (extracted from
  the 10-page PDF).
- `agent/260711_NIMMERSATT_Vertrag_DE.pdf` — the source PDF.
- `api/summarize.js` — serverless proxy (Vercel/Netlify/Cloudflare style). Calls
  DeepSeek. Reads the key from env `DEEPSEEK_API_KEY` and model from
  `DEEPSEEK_MODEL` (default `deepseek-chat`).
- The chat script posts to `/api/summarize`; **without a backend it falls back**
  to a built-in canned summary, so the static/local site always works.

### Security — do this first
- **The API key must never be committed or shipped to the browser.** This is a
  public static site; anything in the frontend is readable by everyone.
- A DeepSeek key was shared in plain text during setup — treat it as
  **compromised and rotate it** (generate a new one, delete the old). It was
  deliberately never written into any file in this repo.

### To make the live summary work (TODO)
1. Rotate the DeepSeek key.
2. Deploy on a host that runs functions (Vercel/Netlify/Cloudflare) with the site
   folder as root.
3. Set env vars there: `DEEPSEEK_API_KEY` (secret) and optionally `DEEPSEEK_MODEL`.
4. Confirm the exact model id — **"DeepSeek v4 flash" is not a known DeepSeek
   model name**; DeepSeek's OpenAI-compatible API typically exposes
   `deepseek-chat` and `deepseek-reasoner`.

## 6. Open items / decisions to confirm

- **Hero animated GIF**: the request was to use `nimmersatt_gif_artists.gif`
  (animated), but only a static `.jpg` was ever provided, and the hero image was
  later removed entirely. If an animated hero is still wanted, supply the real
  `.gif` or an mp4/webm loop.
- **Download PDF version**: the summarizer PDF is a **10-page** version
  (`260711_…`). The public download in the Contact section still points at an
  earlier contract file under `assets/documents/`. Decide whether to replace it.
- **Step-01 copy** repeats "it's a wrap" twice (by request) — tighten if desired.
- Minor wording kept verbatim per feedback even where slightly unusual
  (e.g. "whatever is you").

## 7. Git / deploy

- GitHub: `https://github.com/emiloooooo/artist-pitch`, default branch `main`.
- All work lives on `main` (feature branch merged). Clone `main` to get everything.
- `.context/` (raw annotation attachments incl. any pasted secrets) is
  **git-ignored** and never pushed.
- Deploy: static hosts serve `surge-artist-pitch-site/` as-is. For the live chat,
  use a functions-capable host as in §5.
