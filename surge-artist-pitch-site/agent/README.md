# Contract-Summarizer Agent

Lets the chat box in the site summarize the NIMMERSATT contract with an LLM,
grounded **only** on the contract PDF.

## Files

- `contract-summarizer.agent.md` — the agent definition (role, rules, system prompt).
- `nimmersatt-vertrag-de.txt` — the ONLY knowledge source (extracted from the PDF).
- `260711_NIMMERSATT_Vertrag_DE.pdf` — original source PDF (10 pages).
- `../api/summarize.js` — serverless proxy that calls DeepSeek. **Holds the key server-side.**

## Security — read this first

**The API key must never live in this repo or in the browser.** The site is a
static, public site; anything shipped to the browser is readable by everyone.
The key is provided to the *server* only, as a secret environment variable.

If a key was ever pasted into chat/code/commits, **rotate it** (generate a new
one, delete the old) before going live.

## Deploy (Vercel example)

1. This folder must be the project root (it already contains `api/summarize.js`).
2. In the host dashboard, set environment variables:
   - `DEEPSEEK_API_KEY` = your DeepSeek key (secret)
   - `DEEPSEEK_MODEL` = the exact DeepSeek model id (optional; default `deepseek-chat`)
     - Note: "v4 flash" is **not** a known DeepSeek model name. Confirm the id in
       your DeepSeek dashboard; DeepSeek's OpenAI-compatible API commonly exposes
       `deepseek-chat` and `deepseek-reasoner`.
3. Deploy. The chat posts to `/api/summarize`; the function adds the contract as
   context and returns the answer.

Netlify/Cloudflare work the same way — move `api/summarize.js` to that platform's
functions folder and set the same env vars.

## Local / static hosting (no backend)

Without the proxy (e.g. `python3 -m http.server`), `/api/summarize` isn't
available, so the chat automatically **falls back** to the built-in canned
summary. The page never errors.
