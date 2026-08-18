// Serverless proxy for the contract-summarizer agent (Vercel / Netlify style).
//
// SECURITY: the DeepSeek API key is read from the environment ONLY. It must NEVER
// be written into this file or shipped to the browser. Set it on your host as a
// secret env var:
//   DEEPSEEK_API_KEY = sk-...        (required)
//   DEEPSEEK_MODEL   = deepseek-chat (optional; "v4 flash" is not an official
//                                     DeepSeek model id — confirm the exact one)
//
// The browser calls POST /api/summarize { "question": "..." } and gets back
// { "answer": "..." }. The key stays on the server.

const fs = require('fs');
const path = require('path');

// The ONLY knowledge source. Loaded once, at cold start.
// Resolve robustly: on Vercel the function bundle may root either at the
// deployment cwd or next to this file (see vercel.json `includeFiles`).
function loadContract() {
  // The whole contract, as clean markdown. Prefer the .md (full document, no
  // summary); fall back to the older .txt extraction if the .md is missing.
  const candidates = [
    path.join(process.cwd(), 'agent', 'nimmersatt-vertrag-de.md'),
    path.join(__dirname, '..', 'agent', 'nimmersatt-vertrag-de.md'),
    path.join(process.cwd(), 'agent', 'nimmersatt-vertrag-de.txt'),
    path.join(__dirname, '..', 'agent', 'nimmersatt-vertrag-de.txt'),
  ];
  for (const p of candidates) {
    try { return fs.readFileSync(p, 'utf8'); } catch (_) { /* try next */ }
  }
  throw new Error('contract knowledge source not found in any known path');
}
const CONTRACT = loadContract();

const SYSTEM_PROMPT =
  'Du bist der Nimmersatt Bot. Du kennst den kompletten NIMMERSATT-Vertrag ' +
  '(steht unten) und erklärst ihn Artists, die gerade überlegen, ob sie ' +
  'unterschreiben.\n\n' +
  'DEIN TON:\n' +
  '- Locker, jung, freundlich, mit trockenem Humor. Sprich wie ein kluger ' +
  'Kumpel, der den Vertrag schon gelesen hat und ihn dir schnell rüberbringt, ' +
  'nicht wie ein Anwalt und nicht wie ein Behördenschreiben.\n' +
  '- Kurze, klare Sätze. Kein Juristendeutsch, keine Floskeln, kein ' +
  '"gemäß den vorstehenden Ausführungen". Ruhig mal ein lockerer Einstieg ' +
  'oder ein kleiner Spruch – aber sparsam, Inhalt geht vor Gag.\n' +
  '- GLEICHER Ton für alles: eine Zusammenfassung klingt genauso locker wie ' +
  'eine normale Antwort. Schalte für Zusammenfassungen NICHT in einen ' +
  'steifen Modus.\n\n' +
  'HARTE REGELN (die brechen wir nie):\n' +
  '1. Nur der Vertrag unten. Kein externes Wissen, keine Annahmen, keine ' +
  'allgemeine Rechtsauskunft. Steht etwas nicht drin, sag es locker aber klar, ' +
  'z. B. "Dazu steht nichts im Vertrag." – niemals raten.\n' +
  '2. Der Ton ändert die WORTE, nie die FAKTEN. Alle Zahlen, Prozentsätze, ' +
  'Fristen, Paragrafen-Bezüge (§) und Bedingungen bleiben exakt und ' +
  'vollständig. Kürze die Länge, nie die Substanz.\n' +
  '3. Keine Umdeutung, keine Meinung, keine Empfehlung, die nicht im Text ' +
  'steht. Locker erklären ja, uminterpretieren nein.\n' +
  '4. Bei einer Gesamtübersicht geh die Paragrafen durch (§ 0–§ 20) und nenn ' +
  'sie als Anker, z. B. "§ 4 – Provision: …". Bei einer Einzelfrage nur den ' +
  'Punkt beantworten, mit § als Beleg.\n' +
  '5. Antworte in der Sprache der Frage. Fachbegriffe des Vertrags bleiben.\n' +
  '\n--- VERTRAGSTEXT (einzige zulässige Quelle) ---\n' +
  CONTRACT +
  '\n--- ENDE VERTRAGSTEXT ---';

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) {
    res.status(500).json({ error: 'Server not configured: missing DEEPSEEK_API_KEY' });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (_) { body = {}; } }
  const question = (body && body.question ? String(body.question) : '').slice(0, 2000).trim();
  if (!question) {
    res.status(400).json({ error: 'Missing "question"' });
    return;
  }

  try {
    const r = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + key,
      },
      body: JSON.stringify({
        model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
        temperature: 0.45,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: question },
        ],
      }),
    });

    if (!r.ok) {
      const detail = await r.text();
      res.status(502).json({ error: 'Upstream error', detail: detail.slice(0, 500) });
      return;
    }
    const data = await r.json();
    const answer = data.choices && data.choices[0] && data.choices[0].message
      ? data.choices[0].message.content
      : '';
    res.status(200).json({ answer });
  } catch (e) {
    res.status(500).json({ error: 'Request failed', detail: String(e).slice(0, 300) });
  }
};
