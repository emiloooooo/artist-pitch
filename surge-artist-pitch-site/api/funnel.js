// Serverless intake for the Markel Pro Media insurance funnel. The funnel runs
// in both page languages since 2026-08-23, so every record carries `lang`.
//
// Two payload shapes come through here:
//   kind "insurance-application-request"   — the full funnel (default)
//   kind "abroad-liability-declaration"    — the short § 12.7 declaration from
//     visitors without a German registration / billing address, who cannot be
//     quoted at all. Same CRM hop, much smaller record.
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

  // Short branch: no quote possible, the visitor declares how they are covered
  // instead (§ 12.7 b: comparable insurance abroad, or c: personal liability).
  if (str(body.kind, 40) === 'abroad-liability-declaration') {
    const declaration = pick(str(body.declaration, 24), ['insured_abroad', 'private_liability']);
    if (!declaration) {
      res.status(400).json({ error: 'Bitte eine der beiden Angaben nach § 12.7 wählen.' });
      return;
    }
    const receivedAt = new Date();
    const record = {
      kind: 'abroad-liability-declaration',
      contractClause: '§ 12.7',
      registeredInGermany: 'no',
      declaration: declaration,          // insured_abroad = § 12.7 b, private_liability = § 12.7 c
      billingCountry: str(body.billingCountry, 80),
      existingInsurer: str(body.existingInsurer, 120),
      proofOutstanding: declaration === 'insured_abroad',
      legalForm: str(body.legalForm, 60),
      company: str(body.company, 160),
      salutation: str(body.salutation, 20),
      firstName: firstName,
      lastName: lastName,
      email: email,
      phone: str(body.phone, 40),
      product: 'Markel Pro Media (Berufshaftpflicht) — nicht angeboten, Auslandsfall',
      source: 'artist-pitch/insurance-funnel',
      lang: pick(str(body.lang, 4), ['de', 'en'], 'de'),   // language the chat ran in
      receivedAt: receivedAt.toISOString(),
      // § 12.7 runs four weeks; the deadline is stamped here so the CRM does not
      // have to recompute it.
      deadlineAt: new Date(receivedAt.getTime() + 28 * 24 * 60 * 60 * 1000).toISOString(),
    };
    await forward(record, res);
    return;
  }

  const risk = (body.risk && typeof body.risk === 'object') ? body.risk : {};
  const modules = Array.isArray(body.modules)
    ? body.modules.map(function (m) { return str(m, 24); }).filter(Boolean).slice(0, 8)
    : [];
  const estimateAnnual = Number.isFinite(body.estimateAnnual) ? Math.round(body.estimateAnnual) : null;

  const lead = {
    // tariff selection
    registeredInGermany: pick(str(body.registeredInGermany, 4), ['yes', 'no'], 'yes'),
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
    street: str(body.street, 160),
    city: str(body.city, 120),
    country: pick(str(body.country, 4), ['DE', 'EU', 'EWR'], 'DE'),
    term: pick(str(body.term, 2), ['1', '3'], '1'),
    interval: pick(str(body.interval, 12), ['yearly', 'halfyearly', 'quarterly'], 'yearly'),
    startDate: str(body.startDate, 40),
    product: 'Markel Pro Media (Berufshaftpflicht)',
    kind: 'insurance-application-request',
    source: 'artist-pitch/insurance-funnel',
    lang: pick(str(body.lang, 4), ['de', 'en'], 'de'),   // language the chat ran in
    receivedAt: new Date().toISOString(),
  };

  await forward(lead, res);
};

// One CRM hop for both payload shapes. Without CRM_WEBHOOK_URL the record is
// logged and accepted, so the chat never dead-ends on a missing integration.
async function forward(record, res) {
  const hook = process.env.CRM_WEBHOOK_URL;
  if (hook) {
    try {
      const r = await fetch(hook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
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
    console.log('funnel record (no CRM_WEBHOOK_URL set):', JSON.stringify(record));
  }
  res.status(200).json({ ok: true });
}
