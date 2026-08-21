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

// Second knowledge source: everything the insurance funnel on this page knows.
// Optional on purpose — if the file is missing the contract bot keeps working
// exactly as before, it just never mentions the insurance.
function loadInsurance() {
  const candidates = [
    path.join(process.cwd(), 'agent', 'nimmersatt-versicherung-de.md'),
    path.join(__dirname, '..', 'agent', 'nimmersatt-versicherung-de.md'),
  ];
  for (const p of candidates) {
    try { return fs.readFileSync(p, 'utf8'); } catch (_) { /* try next */ }
  }
  console.warn('summarize: insurance knowledge source not found — insurance answers disabled');
  return '';
}
const INSURANCE = loadInsurance();

// Two separate things: ANSWERING an insurance question (always fine) and
// BRINGING IT UP unasked (only once the visitor has actually dug into the
// contract — the client decides that and says so per request).
const INSURANCE_RULES =
  '6. VERSICHERUNG, WENN GEFRAGT: Fragt jemand von sich aus nach Haftung, ' +
  'Regress, Schäden, Leistungsverzug, Schlechtleistung, Absicherung oder ' +
  'Versicherung, antworte vollständig aus beiden Quellen. Nenn § 12.5 ' +
  '(Haftung begrenzt auf Deckungssumme der Berufshaftpflicht plus ' +
  'Projekthonorar), § 12.7 (vier Wochen Zeit, eines von drei Dingen ' +
  'nachzuweisen: eigene Berufshaftpflicht, vergleichbare bestehende ' +
  'Versicherung, oder persönliche Haftung) und § 14 (Regress). Das ist eine ' +
  'Antwort, kein Verkaufsgespräch.\n' +
  '7. VERSICHERUNG VON DIR AUS: Ganz unten steht pro Nachricht eine Zeile in ' +
  'eckigen Klammern, [VERSICHERUNGS-HINWEIS: …]. Steht dort "gesperrt", ' +
  'verlierst du kein Wort über die Versicherung, ausser die Frage geht ' +
  'direkt danach (Regel 6). Steht dort "erlaubt", hängst du ans ENDE deiner ' +
  'Antwort GENAU EINEN kurzen Satz an, der auf den Versicherungs-Chat weiter ' +
  'unten auf dieser Seite hinweist ("Absicherung, ohne Kleingedrucktes") und ' +
  'ihn mit § 12.7 verknüpft. Ein Satz, kein Absatz, keine Preise, kein ' +
  'Drängeln, keine Wiederholung in späteren Antworten.\n' +
  '8. Voraussetzung nie verschweigen: die vermittelte Berufshaftpflicht setzt ' +
  'eine Meldung und eine Rechnungsadresse in Deutschland voraus. Ohne die geht ' +
  'nur der Weg über § 12.7 b oder c.\n';

const SYSTEM_PROMPT =
  'Du bist der nimmersatt Bot. Du kennst den kompletten NIMMERSATT-Vertrag ' +
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
  '1. Nur die Quellen unten: der Vertragstext und – wenn vorhanden – der ' +
  'Versicherungs-Steckbrief. Kein externes Wissen, keine Annahmen, keine ' +
  'allgemeine Rechts- oder Versicherungsberatung. Steht etwas nicht drin, sag ' +
  'es locker aber klar, z. B. "Dazu steht nichts im Vertrag." – niemals raten.\n' +
  '2. Der Ton ändert die WORTE, nie die FAKTEN. Alle Zahlen, Prozentsätze, ' +
  'Fristen, Paragrafen-Bezüge (§) und Bedingungen bleiben exakt und ' +
  'vollständig. Kürze die Länge, nie die Substanz.\n' +
  '3. Keine Umdeutung, keine Meinung, keine Empfehlung, die nicht im Text ' +
  'steht. Locker erklären ja, uminterpretieren nein.\n' +
  '4. Bei einer Gesamtübersicht geh die Paragrafen durch (§ 0–§ 20) und nenn ' +
  'sie als Anker, z. B. "§ 4 – Provision: …". Bei einer Einzelfrage nur den ' +
  'Punkt beantworten, mit § als Beleg.\n' +
  '5. Antworte in der Sprache der Frage. Fachbegriffe des Vertrags bleiben.\n' +
  (INSURANCE ? INSURANCE_RULES : '') +
  '\n--- VERTRAGSTEXT (Hauptquelle) ---\n' +
  CONTRACT +
  '\n--- ENDE VERTRAGSTEXT ---' +
  (INSURANCE
    ? '\n\n--- VERSICHERUNGS-STECKBRIEF (zweite zulässige Quelle) ---\n' +
      INSURANCE +
      '\n--- ENDE VERSICHERUNGS-STECKBRIEF ---'
    : '');

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
  // The page can be read in German or English; the bot follows it.
  const lang = (body && body.lang === 'en') ? 'en' : 'de';

  // The chat is otherwise stateless. A few previous turns come along so a
  // follow-up like "und wie lange gilt das?" still lands, and so the bot can
  // see what it has already said.
  const history = Array.isArray(body && body.history)
    ? body.history
        .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && m.content)
        .slice(-8)
        .map((m) => ({ role: m.role, content: String(m.content).slice(0, 1200) }))
    : [];

  // The client decides this: has the visitor gone deep enough into the contract,
  // and is the insurance section actually on screen (it is German-page only).
  const nudge = INSURANCE && body && body.insuranceNudge === true;
  // Spelled out rather than left as a flag: as a bare marker after 20k+ chars
  // of contract text the model read it and did nothing. This sits last in the
  // prompt, right before the question, and says what to do in full.
  const nudgeRule = !INSURANCE ? '' : (nudge
    ? '\n\n[VERSICHERUNGS-HINWEIS: erlaubt]\n' +
      'Für DIESE eine Antwort gilt: beantworte zuerst ganz normal die Frage. ' +
      'Hänge dann als ALLERLETZTES genau einen kurzen Satz an, der auf § 12.7 ' +
      'und den Versicherungs-Chat weiter unten auf dieser Seite ' +
      '("Absicherung, ohne Kleingedrucktes") hinweist. Ein Satz, locker, ohne ' +
      'Preise und ohne Druck. Nicht mehr als ein Satz.'
    : '\n\n[VERSICHERUNGS-HINWEIS: gesperrt]\n' +
      'Für DIESE Antwort gilt: sprich die Versicherung von dir aus nicht an. ' +
      'Nur wenn die Frage selbst nach Haftung, Schäden oder Versicherung geht, ' +
      'antwortest du darauf (Regel 6).');
  const langRule = lang === 'en'
    ? '\n\nSPRACHE: Die Seite steht gerade auf Englisch. Antworte auf Englisch, ' +
      'im gleichen lockeren Ton. Deutsche Rechtsbegriffe und Paragrafen-Bezuege ' +
      '(z. B. "§ 4", "Kuenstlersozialkasse") bleiben stehen, kurz erklaert. ' +
      'Nur wenn die Frage eindeutig auf Deutsch gestellt ist, antworte auf Deutsch.'
    : '';
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
          { role: 'system', content: SYSTEM_PROMPT + langRule + nudgeRule },
          ...history,
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
