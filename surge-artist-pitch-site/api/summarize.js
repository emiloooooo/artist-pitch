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
  const candidates = [
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
  'Du bist der NIMMERSATT-Vertrags-Zusammenfasser. Fasse ausschließlich auf ' +
  'Basis des unten stehenden Vertragstextes zusammen. Nutze kein externes ' +
  'Wissen. Wenn eine Information nicht im Text steht, antworte "Das steht nicht ' +
  'in diesem Vertrag." Bewahre alle Zahlen, Fristen, Prozentsätze und Bezüge ' +
  'exakt. Kürze die Länge, nicht die Substanz. Antworte in der Sprache der Frage.' +
  '\n\n--- VERTRAGSTEXT (einzige zulässige Quelle) ---\n' +
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
        temperature: 0.2,
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
