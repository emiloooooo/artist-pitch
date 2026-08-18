// Serverless intake for the Markel Pro Media insurance funnel (DE visitors).
//
// Receives POST /api/funnel with the funnel selections + applicant master data
// and hands it off to a CRM, exactly like /api/lead. This is a QUALIFIED LEAD /
// non-binding application request: no bank data (IBAN) is collected and no
// contract is bound here — the binding Markel offer follows after review.
//
// CRM WIRING: provider-agnostic. Set ONE secret env var on the host, no code
// change needed:
//   CRM_WEBHOOK_URL = https://...   (HubSpot/Pipedrive/Make/Zapier/etc. hook)
// If unset, the lead is accepted and logged (visible in function logs) so the
// form always works; nothing is silently dropped.

function str(s, max) {
  return String(s == null ? '' : s).trim().slice(0, max || 200);
}
function pick(v, allowed, fallback) {
  return allowed.indexOf(v) !== -1 ? v : (fallback || '');
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (_) { body = {}; } }
  if (!body || typeof body !== 'object') body = {};

  const firstName = str(body.firstName, 80);
  const lastName = str(body.lastName, 80);
  const email = str(body.email, 160);

  if (!firstName || !lastName) {
    res.status(400).json({ error: 'Bitte Vor- und Nachnamen angeben.' });
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ error: 'Bitte eine gültige E-Mail-Adresse angeben.' });
    return;
  }

  const risk = (body.risk && typeof body.risk === 'object') ? body.risk : {};
  const modules = Array.isArray(body.modules)
    ? body.modules.map(function (m) { return str(m, 24); }).filter(Boolean).slice(0, 8)
    : [];
  const estimateAnnual = Number.isFinite(body.estimateAnnual) ? Math.round(body.estimateAnnual) : null;

  const lead = {
    // tariff selection
    profession: pick(str(body.profession, 24), ['video', 'design', 'agency', 'text', 'music', 'consulting']),
    revenueBand: pick(str(body.revenueBand, 12), ['r50', 'r100', 'r250', 'r500', 'r500plus']),
    vshSum: str(body.vshSum, 12),
    deductible: str(body.deductible, 8),
    bhp: pick(str(body.bhp, 4), ['yes', 'no']),
    bhpSum: str(body.bhpSum, 12),
    modules: modules,
    estimateAnnual: estimateAnnual, // rough, non-binding indication in EUR/year
    // risk answers
    risk: {
      priorClaims: pick(str(risk.priorClaims, 4), ['yes', 'no']),
      priorClaimsDetail: str(risk.priorClaimsDetail, 1000),
      knownCircumstances: pick(str(risk.knownCircumstances, 4), ['yes', 'no']),
      knownCircumstancesDetail: str(risk.knownCircumstancesDetail, 1000),
      startup: pick(str(risk.startup, 4), ['yes', 'no']),
      priorInsurance: pick(str(risk.priorInsurance, 4), ['yes', 'no']),
      priorInsurer: str(risk.priorInsurer, 120),
      priorEnd: str(risk.priorEnd, 40),
      priorReason: str(risk.priorReason, 200),
      usCanada: pick(str(risk.usCanada, 4), ['yes', 'no']),
      usShare: str(risk.usShare, 6),
      excludedActivity: pick(str(risk.excludedActivity, 4), ['yes', 'no']),
    },
    // applicant master data (no bank data)
    legalForm: str(body.legalForm, 60),
    company: str(body.company, 160),
    salutation: str(body.salutation, 20),
    firstName: firstName,
    lastName: lastName,
    email: email,
    phone: str(body.phone, 40),
    website: str(body.website, 200),
    city: str(body.city, 120),
    country: pick(str(body.country, 4), ['DE', 'EU', 'EWR'], 'DE'),
    term: pick(str(body.term, 2), ['1', '3'], '1'),
    interval: pick(str(body.interval, 12), ['yearly', 'halfyearly', 'quarterly'], 'yearly'),
    startDate: str(body.startDate, 40),
    product: 'Markel Pro Media (Berufshaftpflicht)',
    kind: 'insurance-application-request',
    source: 'artist-pitch/insurance-funnel',
    receivedAt: new Date().toISOString(),
  };

  const hook = process.env.CRM_WEBHOOK_URL;
  if (hook) {
    try {
      const r = await fetch(hook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lead),
      });
      if (!r.ok) {
        console.error('funnel: CRM webhook returned', r.status);
        res.status(502).json({ error: 'CRM konnte nicht erreicht werden.' });
        return;
      }
    } catch (e) {
      console.error('funnel: CRM webhook failed', String(e).slice(0, 200));
      res.status(502).json({ error: 'CRM konnte nicht erreicht werden.' });
      return;
    }
  } else {
    console.log('funnel lead (no CRM_WEBHOOK_URL set):', JSON.stringify(lead));
  }

  res.status(200).json({ ok: true });
};
