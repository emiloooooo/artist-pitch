// Serverless intake for the "Melde mich an" / "Sign me up" shortcut in the
// Haftpflicht chat (js/funnel.js).
//
// The full funnel (/api/funnel) asks about twenty questions before it has a
// lead. Not everyone wants that. This endpoint is the short door: name and
// email, nothing else, and a human comes back to them.
//
// Receives POST /api/signup { name, email, lang, ref } and writes one row into
// public.insurance_signups in Supabase (project nimmersatt-hermes) with the
// service_role key. RLS is on and the table has no policies, so anon can
// neither read nor write it — only this function and the Supabase dashboard.
//
// Env on the host:
//   SUPABASE_URL               https://<ref>.supabase.co        (required)
//   SUPABASE_SERVICE_ROLE_KEY  server-only key, never in the client (required)
//   SIGNUP_NOTIFY_TO           e.g. hello@nimmersatt.fyi        (optional)
//   RESEND_API_KEY             turns the notification mail on   (optional)
// Without the two optional ones the row is still stored and only the mail is
// skipped. Without the two required ones the endpoint answers 503 and the chat
// tells the visitor to write to hello@nimmersatt.fyi instead — a sign-up is
// never silently swallowed.

const TABLE = 'insurance_signups';
const MAX_BODY = 4000;          // bytes; the payload is four short fields
const THROTTLE_MS = 20 * 1000;  // per IP, best effort inside one warm instance
const DEDUPE_MS = 10 * 60 * 1000;

const recent = new Map();       // ip -> timestamp of the last accepted sign-up

function str(s, max) {
  return String(s == null ? '' : s).replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max);
}
function clientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  const first = Array.isArray(fwd) ? fwd[0] : String(fwd || '').split(',')[0];
  return str(first, 60) || 'unknown';
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') {
    if (body.length > MAX_BODY) { res.status(413).json({ error: 'Payload too large' }); return; }
    try { body = JSON.parse(body); } catch (_) { body = {}; }
  }
  if (!body || typeof body !== 'object') body = {};

  const name = str(body.name, 120);
  const email = str(body.email, 160).toLowerCase();
  const lang = body.lang === 'en' ? 'en' : 'de';
  const ref = str(body.ref, 24) || null;

  if (name.length < 2) {
    res.status(400).json({ error: 'Bitte einen Namen angeben.' });
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    res.status(400).json({ error: 'Bitte eine gültige E-Mail-Adresse angeben.' });
    return;
  }

  // Cheap flood brake. A cold start resets it, which is fine: this only has to
  // stop one tab hammering the endpoint, not a determined attacker.
  const ip = clientIp(req);
  const now = Date.now();
  const last = recent.get(ip);
  if (last && now - last < THROTTLE_MS) {
    res.status(429).json({ error: 'Einen Moment noch.' });
    return;
  }
  if (recent.size > 500) recent.clear();

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('signup: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not configured');
    res.status(503).json({ error: 'Speicher ist gerade nicht erreichbar.' });
    return;
  }
  const rest = url.replace(/\/+$/, '') + '/rest/v1/' + TABLE;
  const headers = {
    apikey: key,
    Authorization: 'Bearer ' + key,
    'Content-Type': 'application/json',
  };

  // Double tap on the chip, or someone signing up twice in one session: answer
  // ok, do not create a second row.
  try {
    const since = new Date(now - DEDUPE_MS).toISOString();
    const q = rest + '?select=id&email=eq.' + encodeURIComponent(email) +
      '&created_at=gte.' + encodeURIComponent(since) + '&limit=1';
    const dup = await fetch(q, { headers: headers });
    if (dup.ok) {
      const rows = await dup.json();
      if (Array.isArray(rows) && rows.length) {
        recent.set(ip, now);
        res.status(200).json({ ok: true, duplicate: true });
        return;
      }
    }
  } catch (e) {
    // A failing dedupe read must not cost us the sign-up: fall through, insert.
    console.error('signup: dedupe check failed', String(e).slice(0, 200));
  }

  const row = {
    name: name,
    email: email,
    lang: lang,
    ref: ref,
    source: 'artist-pitch/insurance-chat',
    status: 'new',
  };

  try {
    const r = await fetch(rest, {
      method: 'POST',
      headers: Object.assign({ Prefer: 'return=minimal' }, headers),
      body: JSON.stringify(row),
    });
    if (!r.ok) {
      const detail = await r.text();
      console.error('signup: insert failed', r.status, detail.slice(0, 300));
      res.status(502).json({ error: 'Konnte gerade nicht gespeichert werden.' });
      return;
    }
  } catch (e) {
    console.error('signup: insert threw', String(e).slice(0, 200));
    res.status(502).json({ error: 'Konnte gerade nicht gespeichert werden.' });
    return;
  }

  recent.set(ip, now);
  await notify(row);
  res.status(200).json({ ok: true });
};

// Optional heads-up mail, so a sign-up does not sit unseen in the table.
// Stays off until RESEND_API_KEY and SIGNUP_NOTIFY_TO are set; a failure here
// never fails the request, the row is already saved.
async function notify(row) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.SIGNUP_NOTIFY_TO;
  if (!apiKey || !to) return;
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.SIGNUP_NOTIFY_FROM || 'nimmersatt pitch <onboarding@resend.dev>',
        to: [to],
        reply_to: row.email,
        subject: 'Haftpflicht: ' + row.name + ' will Kontakt',
        text: [
          'Neue Anmeldung aus dem Haftpflicht-Chat.',
          '',
          'Name:     ' + row.name,
          'E-Mail:   ' + row.email,
          'Sprache:  ' + row.lang,
          'Referenz: ' + (row.ref || '-'),
          'Quelle:   ' + row.source,
          '',
          'Steht auch in Supabase, Tabelle insurance_signups.',
        ].join('\n'),
      }),
    });
    if (!r.ok) console.error('signup: notify mail returned', r.status);
  } catch (e) {
    console.error('signup: notify mail failed', String(e).slice(0, 200));
  }
}
