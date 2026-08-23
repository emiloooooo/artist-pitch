/* ===========================================================================
   Insurance funnel — Markel Pro Media (Berufshaftpflicht), as a CHAT.
   The bot ("nimmersatt Bot") walks the visitor through tariff, risk and
   contact one question at a time (tappable chips + short text prompts),
   shows the same live, clearly-non-binding premium ESTIMATE, surfaces the
   Haftpflicht PDF right in the conversation, and ends as a qualified
   application request POSTed to /api/funnel.
   - Since 2026-08-23 it lives inside "Auf die Liste" and runs in BOTH
     languages (?funnel=0 still switches it off). It is still a German-law
     product, which is what the one-time note and the first question say.
   - There is no second dropdown around it any more: the chat is the whole
     block, so the bot also ANSWERS the product — every fact that used to sit
     in a static list above the chat now lives in topics() and is asked for in
     the conversation itself. Keep those numbers in sync with the tariff table
     below and with agent/nimmersatt-versicherung-de.md.
   - German copy stays here as the fallback of T(); English lives in the
     'ins.*' keys of js/i18n.js, like every other JS-side string on the page.
   - The estimate is a transparent order-of-magnitude heuristic, NOT a real
     Markel rate. The binding premium comes from Markel after review.
   =========================================================================== */
(function () {
  var slot = document.getElementById('versicherung');
  var chat = document.getElementById('insuranceChat');
  if (!slot || !chat) return;

  if (/[?&]funnel=0/.test(window.location.search)) { slot.hidden = true; return; }

  /* --- Language ----------------------------------------------------------
     Same contract as the other JS-side copy on this page: German inline as
     the fallback, English in js/i18n.js. A line that has already been printed
     stays in the language it was printed in — a chat log is a transcript, not
     a re-rendered page — but every question from here on follows the switch. */
  function T(key, de) {
    return (window.nsatLang && window.nsatLang.t) ? window.nsatLang.t('ins.' + key, de) : de;
  }
  function isEN() {
    return !!(window.nsatLang && window.nsatLang.get && window.nsatLang.get() === 'en');
  }

  var win = document.getElementById('ifunnelWindow');
  var form = document.getElementById('ifunnelForm');
  var input = document.getElementById('ifunnelInput');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- Pricing model (order-of-magnitude estimate only) — unchanged ------- */
  var BASE = { video: 168, design: 156, agency: 192, text: 150, music: 174, consulting: 210 };
  var REV  = { r50: 1.0, r100: 1.35, r250: 1.9, r500: 2.6, r500plus: 3.4 };
  var VSHF = { '300000': 1.0, '500000': 1.18, '1000000': 1.4, '2000000': 1.7, '5000000': 2.1, '10000000': 2.5 };
  var SBF  = { '0': 1.0, '250': 0.95, '500': 0.90, '1000': 0.83 };
  var MOD  = { cyber: 96, eigenschaden: 72, druck: 48, veranstaltung: 84, doe: 60 };

  // "1.700 €" in German, "€1,700" in English: same amount, opposite meaning of
  // the separator, so the format follows the page language.
  var FMT = {};
  function nf(locale) {
    if (!FMT[locale]) {
      FMT[locale] = (typeof Intl !== 'undefined' && Intl.NumberFormat)
        ? new Intl.NumberFormat(locale)
        : { format: function (n) { return String(n); } };
    }
    return FMT[locale];
  }
  function euro(n) {
    var v = Math.round(n);
    return isEN() ? '€' + nf('en-GB').format(v) : nf('de-DE').format(v) + ' €';
  }

  /* --- Data model (feeds the /api/funnel payload) ------------------------- */
  var data = {
    // Gate: Markel Pro Media is a German-law product, so a German registration
    // and a German billing address are a hard precondition (see abroadFlow).
    de_registered: '', abroad_choice: '', abroad_country: '', abroad_insurer: '',
    prof: '', revenue: '', vsh: '1000000', sb: '0', bhp: 'no', bhpsum: '3000000', modules: [],
    q_claims: '', q_claims_detail: '', q_known: '', q_known_detail: '',
    q_startup: '', q_prev: '', q_prev_insurer: '', q_prev_end: '', q_prev_reason: '',
    q_us: '', q_us_share: '', q_excl: '',
    legalForm: '', company: '', salutation: '', firstName: '', lastName: '',
    email: '', phone: '', website: '', city: '', country: 'DE',
    term: '1', interval: 'yearly', startDate: ''
  };

  function estimate() {
    if (!data.prof || !data.revenue || !BASE[data.prof] || !REV[data.revenue]) return { valid: false };
    var annual = BASE[data.prof] * REV[data.revenue] * (VSHF[data.vsh] || 1) * (SBF[data.sb] || 1);
    if (data.bhp === 'yes') annual += (data.bhpsum === '5000000' ? 130 : 95) * REV[data.revenue];
    data.modules.forEach(function (m) { annual += (MOD[m] || 0); });
    annual = Math.max(120, Math.round(annual));
    return { valid: true, annual: annual, monthly: Math.round(annual / 12) };
  }
  // The six trade labels, used both as chips and in the review summary.
  function profLabel(v) {
    return {
      video: T('prof.video', 'Video, Film & Content'),
      design: T('prof.design', 'Grafik, Web & Design'),
      agency: T('prof.agency', 'Marketing- & Medienagentur'),
      text: T('prof.text', 'Text, Redaktion & Verlag'),
      music: T('prof.music', 'Musik, Audio & Event'),
      consulting: T('prof.consulting', 'Beratung / Dienstleistung')
    }[v];
  }
  function coverText() {
    var parts = [T('cov.vsh', 'VSH') + ' ' + euro(data.vsh), T('cov.sb', 'SB') + ' ' + euro(data.sb)];
    if (data.bhp === 'yes') {
      var five = data.bhpsum === '5000000';
      parts.push(T('cov.bhp', 'inkl. BHP') + ' ' + T(five ? 'cov.bhp5' : 'cov.bhp3', five ? '5 Mio' : '3 Mio'));
    }
    var m = data.modules.length;
    if (m) parts.push('+' + m + ' ' + T(m === 1 ? 'cov.mod1' : 'cov.modN', m === 1 ? 'Baustein' : 'Bausteine'));
    return parts.join(' · ');
  }

  /* --- Chat primitives ---------------------------------------------------- */
  function scrollDown() { win.scrollTop = win.scrollHeight; }

  function botMsg(text) {
    var wrap = document.createElement('div');
    wrap.className = 'chat__msg chat__msg--bot';
    var who = document.createElement('span');
    who.className = 'chat__who'; who.textContent = 'nimmersatt Bot';
    var p = document.createElement('p');
    p.textContent = text;
    wrap.appendChild(who); wrap.appendChild(p);
    win.appendChild(wrap); scrollDown();
    return wrap;
  }
  function userMsg(text) {
    var wrap = document.createElement('div');
    wrap.className = 'chat__msg chat__msg--user';
    var p = document.createElement('p'); p.textContent = text;
    wrap.appendChild(p); win.appendChild(wrap); scrollDown();
    return wrap;
  }
  function typing() {
    var wrap = document.createElement('div');
    wrap.className = 'chat__msg chat__msg--bot chat__msg--typing';
    var p = document.createElement('p');
    p.className = 'chat__dots'; p.setAttribute('aria-label', T('typing', 'schreibt'));
    p.innerHTML = '<i></i><i></i><i></i>';
    wrap.appendChild(p); win.appendChild(wrap); scrollDown();
    return wrap;
  }
  // Say one or more bot lines, then run cb. quick=true is for the info answers:
  // those are read, not waited for, so they come in at a steady fast tick.
  function botSay(lines, cb, quick) {
    if (typeof lines === 'string') lines = [lines];
    var i = 0;
    function step() {
      if (i >= lines.length) { if (cb) cb(); return; }
      var t = typing();
      var delay = reduce ? 120 : (quick ? 240 : Math.min(900, 260 + lines[i].length * 12));
      window.setTimeout(function () {
        t.remove(); botMsg(lines[i]); i++; step();
      }, delay);
    }
    step();
  }

  // A removable control block (chips / doc / consents) at the bottom of the window.
  function controls() {
    var c = document.createElement('div');
    c.className = 'ictrl';
    win.appendChild(c); scrollDown();
    return c;
  }
  function setInput(on, placeholder) {
    form.hidden = !on;
    if (on) {
      input.value = '';
      input.placeholder = placeholder || T('ph.default', 'Deine Antwort…');
      if (!reduce) { try { input.focus({ preventScroll: true }); } catch (e) { input.focus(); } }
    }
  }

  /* --- Control renderers -------------------------------------------------- */
  function chip(label, onClick, variant) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'ichip' + (variant ? ' ichip--' + variant : '');
    b.textContent = label;
    // The one-time Germany note is raised on the first tap anywhere in the
    // chat — there is no dropdown left to hang it on — and the tap is not
    // lost: it runs the moment the note is acknowledged. noteDone/showNote are
    // declared at the bottom of this IIFE; a click can only happen after it ran.
    b.addEventListener('click', function () {
      if (!noteDone) { pendingTap = onClick; showNote(); return; }
      onClick();
    });
    return b;
  }

  // Single choice: [{value,label,sub}] -> stores field, echoes label.
  function askChoice(field, opts, done) {
    setInput(false);
    var c = controls();
    var row = document.createElement('div'); row.className = 'ichips';
    opts.forEach(function (o) {
      var b = chip(o.label, function () {
        data[field] = o.value;
        userMsg(o.label);
        c.remove();
        done();
      });
      if (o.sub) b.title = o.sub;
      row.appendChild(b);
    });
    c.appendChild(row);
    scrollDown();
  }

  // Multi choice (modules): checkboxes + "Weiter".
  function askModules(done) {
    setInput(false);
    var c = controls();
    var list = document.createElement('div'); list.className = 'imods';
    var MODULES = [
      { v: 'cyber', n: T('mod.cyber.n', 'Cyber & Daten-Eigenschaden'), d: T('mod.cyber.d', 'Hackerangriff, Datenrettung, DSGVO-Krise'), p: 96 },
      { v: 'eigenschaden', n: T('mod.own.n', 'Eigenschadendeckung'), d: T('mod.own.d', 'Projektrücktritt, Reputation, Phishing'), p: 72 },
      { v: 'druck', n: T('mod.print.n', 'Druckeigenschaden'), d: T('mod.print.d', 'Fehlerhafte Druckaufträge'), p: 48 },
      { v: 'veranstaltung', n: T('mod.event.n', 'Erweiterte Veranstaltungsdeckung'), d: T('mod.event.d', 'Events für Dritte, bis 250 Pers.'), p: 84 },
      { v: 'doe', n: T('mod.doe.n', 'D&O-Außenhaftung'), d: T('mod.doe.d', 'Persönliche Organhaftung'), p: 60 }
    ];
    var chosen = {};
    MODULES.forEach(function (m) {
      var lab = document.createElement('label'); lab.className = 'imod';
      var box = document.createElement('input'); box.type = 'checkbox'; box.value = m.v;
      box.addEventListener('change', function () {
        chosen[m.v] = box.checked; lab.classList.toggle('is-on', box.checked);
      });
      var body = document.createElement('span'); body.className = 'imod__body';
      body.innerHTML = '<span class="imod__name"></span><span class="imod__desc"></span>';
      body.querySelector('.imod__name').textContent = m.n;
      body.querySelector('.imod__desc').textContent = m.d;
      var price = document.createElement('span'); price.className = 'imod__price';
      price.textContent = T('mod.price', '+ ca. {n} €/J').replace('{n}', m.p);
      var mark = document.createElement('span'); mark.className = 'imod__check'; mark.setAttribute('aria-hidden', 'true');
      lab.appendChild(box); lab.appendChild(mark); lab.appendChild(body); lab.appendChild(price);
      list.appendChild(lab);
    });
    var nav = document.createElement('div'); nav.className = 'ichips';
    var go = chip(T('next', 'Weiter'), function () {
      data.modules = MODULES.map(function (m) { return m.v; }).filter(function (v) { return chosen[v]; });
      var n = data.modules.length;
      userMsg(n
        ? T(n === 1 ? 'mods.one' : 'mods.many', n === 1 ? '{n} Baustein dazu' : '{n} Bausteine dazu').replace('{n}', n)
        : T('mods.none', 'Keine Zusatzbausteine'));
      c.remove();
      done();
    }, 'primary');
    nav.appendChild(go);
    c.appendChild(list); c.appendChild(nav);
    scrollDown();
  }

  // Free text. opts: { placeholder, optional, validate(v)->err|'', transform(v) }
  function askText(field, opts, done) {
    opts = opts || {};
    var c = controls();
    if (opts.optional) {
      var skipRow = document.createElement('div'); skipRow.className = 'ichips';
      skipRow.appendChild(chip(T('skip', 'Überspringen'), function () {
        cleanup(); userMsg(T('skipped', '— übersprungen —')); done();
      }, 'ghost'));
      c.appendChild(skipRow); scrollDown();
    }
    setInput(true, opts.placeholder);
    pendingText = function (raw) {
      var v = String(raw || '').trim();
      if (!v) {
        if (opts.optional) { cleanup(); userMsg(T('skipped', '— übersprungen —')); done(); return; }
        showErr(c, T('err.empty', 'Bitte kurz ausfüllen.')); return;
      }
      if (opts.validate) {
        var err = opts.validate(v);
        if (err) { showErr(c, err); return; }
      }
      data[field] = opts.transform ? opts.transform(v) : v;
      cleanup(); userMsg(v); done();
    };
    function cleanup() { pendingText = null; setInput(false); c.remove(); }
  }
  function showErr(c, msg) {
    var e = c.querySelector('.ichat__err');
    if (!e) { e = document.createElement('p'); e.className = 'ichat__err'; c.appendChild(e); }
    e.textContent = msg; scrollDown();
  }

  var pendingText = null;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (pendingText) pendingText(input.value);
  });

  // The Haftpflicht PDF as an in-chat document card. The overview only exists
  // in German, which the English meta line says out loud.
  function showDoc() {
    var c = controls();
    var card = document.createElement('div'); card.className = 'idoc';
    var href = 'assets/documents/markel-berufshaftpflicht-info.pdf';
    card.innerHTML =
      '<span class="idoc__icon" aria-hidden="true">PDF</span>' +
      '<span class="idoc__text">' +
        '<span class="idoc__title"></span>' +
        '<span class="idoc__meta"></span>' +
      '</span>' +
      '<span class="idoc__actions">' +
        '<a class="idoc__btn" href="' + href + '" target="_blank" rel="noopener"></a>' +
        '<a class="idoc__btn idoc__btn--ghost" href="' + href + '" download="Berufshaftpflicht-Markel-Pro-Media.pdf"></a>' +
      '</span>';
    card.querySelector('.idoc__title').textContent = T('doc.title', 'Berufshaftpflicht — das Wichtigste');
    card.querySelector('.idoc__meta').textContent = T('doc.meta', 'Markel Pro Media · Übersicht · PDF');
    card.querySelector('.idoc__btn').textContent = T('doc.open', 'Öffnen');
    card.querySelector('.idoc__btn--ghost').textContent = T('doc.save', 'Sichern');
    c.appendChild(card); scrollDown();
  }

  // Live premium estimate as a styled bubble.
  function showEstimate() {
    var e = estimate();
    if (!e.valid) return;
    var c = controls();
    var box = document.createElement('div'); box.className = 'iprice';
    box.innerHTML =
      '<span class="iprice__tag"></span>' +
      '<span class="iprice__main"></span>' +
      '<span class="iprice__alt"></span>' +
      '<span class="iprice__basis"></span>';
    box.querySelector('.iprice__tag').textContent = T('est.tag', 'Unverbindliche Schätzung');
    box.querySelector('.iprice__main').innerHTML =
      T('est.approx', 'ca.') + ' ' + euro(e.annual) + '<span class="iprice__per"> / ' + T('est.year', 'Jahr') + '</span>';
    box.querySelector('.iprice__alt').textContent = '≈ ' + euro(e.monthly) + ' / ' + T('est.month', 'Monat');
    box.querySelector('.iprice__basis').textContent =
      coverText() + '. ' + T('est.basis', 'Keine verbindliche Markel-Prämie — die kommt nach der Prüfung.');
    c.appendChild(box); scrollDown();
  }

  // Review summary bubble.
  function showReview() {
    var e = estimate();
    var c = controls();
    var box = document.createElement('div'); box.className = 'ireview';
    var dl = document.createElement('dl');
    function row(k, v) {
      var r = document.createElement('div'); r.className = 'ireview__row';
      var dt = document.createElement('dt'); dt.textContent = k;
      var dd = document.createElement('dd'); dd.textContent = v;
      r.appendChild(dt); r.appendChild(dd); dl.appendChild(r);
    }
    row(T('rev.prof', 'Tätigkeit'), profLabel(data.prof) || '—');
    row(T('rev.cover', 'Deckung'), coverText());
    row(T('rev.premium', 'Geschätzte Prämie'),
      e.valid ? (T('est.approx', 'ca.') + ' ' + euro(e.annual) + ' / ' + T('est.year', 'Jahr')) : '—');
    box.appendChild(dl);
    c.appendChild(box); scrollDown();
  }

  // Consents + final submit.
  function askConsents() {
    setInput(false);
    var c = controls();
    var wrap = document.createElement('div'); wrap.className = 'iconsents';
    var CONSENTS = [
      { name: 'c_vvg', text: T('consent.vvg', 'Meine Angaben sind wahrheitsgemäß und vollständig (§ 19 Abs. 5 VVG).') },
      { name: 'c_avb', text: T('consent.avb', 'Mir werden vor Abschluss die AVB, das Produktinformationsblatt (IPID) und die 14-tägige Widerrufsbelehrung zugestellt.') },
      { name: 'c_dsgvo', text: T('consent.dsgvo', 'Ich willige in die Verarbeitung meiner Daten zur Bearbeitung dieser Anfrage nach DSGVO ein.') }
    ];
    var boxes = [];
    CONSENTS.forEach(function (co) {
      var lab = document.createElement('label'); lab.className = 'funnel__consent';
      var cb = document.createElement('input'); cb.type = 'checkbox'; cb.name = co.name;
      var mark = document.createElement('span'); mark.className = 'funnel__consent-box'; mark.setAttribute('aria-hidden', 'true');
      var txt = document.createElement('span'); txt.className = 'funnel__consent-text'; txt.textContent = co.text;
      lab.appendChild(cb); lab.appendChild(mark); lab.appendChild(txt);
      wrap.appendChild(lab); boxes.push(cb);
    });
    var nav = document.createElement('div'); nav.className = 'ichips';
    var submit = chip(T('submit.request', 'Anfrage absenden'), function () {
      if (!boxes.every(function (b) { return b.checked; })) {
        showErr(c, T('err.consents', 'Bitte bestätige die drei Pflichthinweise, um abzusenden.')); return;
      }
      submit.disabled = true;
      sendLead(c, submit);
    }, 'primary');
    nav.appendChild(submit);
    wrap.appendChild(nav);
    c.appendChild(wrap); scrollDown();
  }

  /* --- Submit ------------------------------------------------------------- */
  function buildPayload() {
    return {
      registeredInGermany: data.de_registered,
      profession: data.prof, revenueBand: data.revenue, vshSum: data.vsh, deductible: data.sb,
      bhp: data.bhp, bhpSum: data.bhp === 'yes' ? data.bhpsum : '', modules: data.modules,
      estimateAnnual: (function () { var e = estimate(); return e.valid ? e.annual : null; })(),
      risk: {
        priorClaims: data.q_claims, priorClaimsDetail: data.q_claims_detail,
        knownCircumstances: data.q_known, knownCircumstancesDetail: data.q_known_detail,
        startup: data.q_startup, priorInsurance: data.q_prev,
        priorInsurer: data.q_prev_insurer, priorEnd: data.q_prev_end, priorReason: data.q_prev_reason,
        usCanada: data.q_us, usShare: data.q_us_share, excludedActivity: data.q_excl
      },
      legalForm: data.legalForm, company: data.company, salutation: data.salutation,
      firstName: data.firstName, lastName: data.lastName, email: data.email, phone: data.phone,
      website: data.website, city: data.city, country: data.country,
      term: data.term, interval: data.interval, startDate: data.startDate,
      lang: isEN() ? 'en' : 'de'
    };
  }
  function ref() { return 'NIM-' + Date.now().toString(36).toUpperCase().slice(-6); }
  function refLine() {
    return T('ref', 'Referenz: {ref}. Bis dahin: bleib hungrig.').replace('{ref}', ref());
  }
  function finish() {
    botSay([
      T('done.sent', 'Danke, deine Anfrage ist raus. Wir prüfen deine Angaben, holen das verbindliche Markel-Angebot ein und melden uns bei dir.'),
      refLine()
    ]);
  }
  function sendLead(c, submit) {
    var e = c.querySelector('.ichat__err'); if (e) e.textContent = '';
    botSay(T('sending.request', 'Sekunde, ich schick das ab…'), function () {
      fetch('/api/funnel', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload())
      })
        .then(function (r) { if (!r.ok) throw new Error('bad'); return r.json(); })
        .then(function () { c.remove(); finish(); })
        .catch(function () {
          if (/^(localhost|127\.|0\.0\.0\.0)/.test(window.location.hostname) || window.location.protocol === 'file:') {
            c.remove(); finish(); return;
          }
          submit.disabled = false;
          showErr(c, T('err.send', 'Hat gerade nicht geklappt. Schreib uns einfach an hello@nimmersatt.fyi.'));
        });
    });
  }

  /* --- Abroad branch (§ 12.7) --------------------------------------------
     No German registration or a billing address abroad means our partner
     cannot quote at all. The contract already covers that case: § 12.7 gives
     the artist four weeks to tell us whether they are comparably insured where
     they are (b) or carry the liability personally (c). We take that
     declaration right here instead of dropping the visitor.
     The main funnel simply stops: the engine only advances through done(), and
     this branch never calls it. */
  function buildDeclarationPayload() {
    return {
      kind: 'abroad-liability-declaration',
      registeredInGermany: 'no',
      declaration: data.abroad_choice,
      billingCountry: data.abroad_country,
      existingInsurer: data.abroad_insurer,
      legalForm: data.legalForm, company: data.company, salutation: data.salutation,
      firstName: data.firstName, lastName: data.lastName, email: data.email, phone: data.phone,
      lang: isEN() ? 'en' : 'de'
    };
  }

  function finishAbroad() {
    var lines = [T('ab.noted', 'Notiert. Damit liegt uns deine Rückmeldung nach § 12.7 vor, innerhalb der vier Wochen.')];
    if (data.abroad_choice === 'insured_abroad') {
      lines.push(T('ab.proof', 'Ein Nachweis fehlt noch: schick uns die Police oder die Versicherungsbestätigung an hello@nimmersatt.fyi, dann ist es komplett.'));
    } else {
      lines.push(T('ab.personal', 'Heißt konkret: für Schäden aus Leistungsverzug und Schlechtleistung stehst du nach § 12.5 selbst gerade — begrenzt auf dein Projekthonorar, darüber hinaus nur bei Vorsatz oder grober Fahrlässigkeit.'));
    }
    lines.push(refLine());
    botSay(lines);
  }

  function sendDeclaration(c, submit) {
    var e = c.querySelector('.ichat__err'); if (e) e.textContent = '';
    botSay(T('sending.declaration', 'Sekunde, ich schreib das auf…'), function () {
      fetch('/api/funnel', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildDeclarationPayload())
      })
        .then(function (r) { if (!r.ok) throw new Error('bad'); return r.json(); })
        .then(function () { c.remove(); finishAbroad(); })
        .catch(function () {
          if (/^(localhost|127\.|0\.0\.0\.0)/.test(window.location.hostname) || window.location.protocol === 'file:') {
            c.remove(); finishAbroad(); return;
          }
          submit.disabled = false;
          showErr(c, T('err.send', 'Hat gerade nicht geklappt. Schreib uns einfach an hello@nimmersatt.fyi.'));
        });
    });
  }

  // One consent only: this is a short declaration, not an insurance application,
  // so the VVG / AVB confirmations of the main funnel do not apply here.
  function askDeclarationConsent() {
    setInput(false);
    var c = controls();
    var wrap = document.createElement('div'); wrap.className = 'iconsents';
    var lab = document.createElement('label'); lab.className = 'funnel__consent';
    var cb = document.createElement('input'); cb.type = 'checkbox'; cb.name = 'c_dsgvo';
    var mark = document.createElement('span'); mark.className = 'funnel__consent-box'; mark.setAttribute('aria-hidden', 'true');
    var txt = document.createElement('span'); txt.className = 'funnel__consent-text';
    txt.textContent = T('ab.consent', 'Ich willige in die Verarbeitung meiner Daten zur Dokumentation dieser Erklärung nach DSGVO ein.');
    lab.appendChild(cb); lab.appendChild(mark); lab.appendChild(txt);
    wrap.appendChild(lab);
    var nav = document.createElement('div'); nav.className = 'ichips';
    var submit = chip(T('ab.submit', 'Erklärung absenden'), function () {
      if (!cb.checked) { showErr(c, T('ab.errConsent', 'Bitte bestätige den Hinweis, um abzusenden.')); return; }
      submit.disabled = true;
      sendDeclaration(c, submit);
    }, 'primary');
    nav.appendChild(submit);
    wrap.appendChild(nav);
    c.appendChild(wrap); scrollDown();
  }

  // Built on demand (not at load) so every question is rendered in the
  // language the page is in when the step actually runs.
  function abroadSteps() {
    return [
      { bot: [T('ab.q1a', 'Danke fürs ehrliche Antippen. Dann können wir dir über unseren Partner kein Angebot machen: Markel Pro Media setzt eine deutsche Meldung und eine deutsche Rechnungsadresse voraus.'),
              T('ab.q1b', 'Der Vertrag kennt diesen Fall aber. § 12.7 gibt dir vier Wochen, uns zu sagen, wie du stattdessen abgesichert bist. Zwei Wege, beide völlig in Ordnung:')],
        render: function (done) { askChoice('abroad_choice', [
          { value: 'insured_abroad', label: T('ab.optInsured', 'Ich bin dort vergleichbar versichert'), sub: '§ 12.7 b' },
          { value: 'private_liability', label: T('ab.optPersonal', 'Ich hafte persönlich'), sub: '§ 12.7 c' }
        ], done); } },

      { bot: T('ab.country', 'In welchem Land liegt deine Rechnungsadresse?'),
        render: function (done) { askText('abroad_country', { placeholder: T('ab.countryPh', 'z. B. Österreich') }, done); } },

      { skipIf: function () { return data.abroad_choice !== 'insured_abroad'; },
        bot: T('ab.insurer', 'Bei welchem Versicherer bist du dort? Kannst du auch überspringen.'),
        render: function (done) { askText('abroad_insurer', { placeholder: T('ab.insurerPh', 'Name des Versicherers (optional)'), optional: true }, done); } },

      { bot: T('ab.first', 'Dann halte ich das für dich fest. Wie heißt du mit Vornamen?'),
        render: function (done) { askText('firstName', { placeholder: T('ph.first', 'Vorname') }, done); } },
      { bot: T('q.last', 'Und der Nachname?'),
        render: function (done) { askText('lastName', { placeholder: T('ph.last', 'Nachname') }, done); } },
      { bot: T('ab.email', 'An welche E-Mail sollen wir uns halten?'),
        render: function (done) { askText('email', {
          placeholder: T('ph.email', 'name@mail.de'),
          validate: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : T('err.email', 'Bitte eine gültige E-Mail-Adresse.'); }
        }, done); } },

      { bot: T('ab.consentIntro', 'Zum Absenden noch ein Häkchen:'),
        render: function () { askDeclarationConsent(); } }   // terminal
    ];
  }

  function abroadFlow() { runSteps(abroadSteps()); }

  /* --- The cover, answered in the chat ------------------------------------
     This used to be a static list above the conversation, behind a second
     dropdown. It is the same content, spoken by the bot on request: the whole
     product before the first question, without a wall of text nobody scrolls.
     Every number here mirrors the tariff table at the top of this file and
     agent/nimmersatt-versicherung-de.md — change one, change all three. */
  function topics() {
    return [
      { id: 'what', q: T('info.what.q', 'Was ist das überhaupt?'), a: [
        T('info.what.1', 'Es geht um die Berufshaftpflicht für Medienberufe, Markel Pro Media. NIMMERSATT vermittelt sie, versichert wird bei Markel.'),
        T('info.what.2', 'Gedacht ist sie für Artists, die in Deutschland gemeldet sind und deren Rechnungsadresse in Deutschland liegt. Fehlt eines von beidem, kann über diesen Partner kein Angebot entstehen. Dann führe ich dich in den § 12.7-Zweig, das klärt gleich meine erste Frage.'),
        T('info.what.3', 'Abgedeckt sind reine Vermögensschäden aus deiner Arbeit, vor allem Leistungsverzug und Schlechtleistung. Personen-, Sach- und Mietsachschäden am Set, on location oder im Büro kommen optional über die Betriebshaftpflicht dazu.'),
        T('info.what.4', 'Tätigkeiten: Video, Film & Content · Grafik, Web & Design · Marketing- & Medienagentur · Text, Redaktion & Verlag · Musik, Audio & Event · Beratung / Dienstleistung.')
      ] },

      { id: 'cost', q: T('info.cost.q', 'Was kostet das?'), a: [
        T('info.cost.1', 'Die Schätzung hier im Chat rechnet aus Tätigkeit, Jahresnettoumsatz (bis 50.000 €, bis 100.000 €, bis 250.000 €, bis 500.000 € oder darüber), Versicherungssumme, Selbstbeteiligung und den Bausteinen, die du dazunimmst. Mindestens 120 € im Jahr. Das ist eine Größenordnung, keine Markel-Prämie.'),
        T('info.cost.2', 'Versicherungssumme für Vermögensschäden: 300.000 €, 500.000 €, 1 Mio. € (empfohlen), 2 Mio. €, 5 Mio. € oder 10 Mio. €.'),
        T('info.cost.3', 'Selbstbeteiligung: 0 €, 250 €, 500 € oder 1.000 € je Schaden. Mehr Selbstbeteiligung heißt weniger Beitrag.'),
        T('info.cost.4', 'Betriebshaftpflicht optional dazu, 3 Mio. € oder 5 Mio. € pauschal für Personen-, Sach- und Mietsachschäden.'),
        T('info.cost.5', 'Zusatzbausteine, alle freiwillig: Cyber & Daten-Eigenschaden ca. 96 €/Jahr · Eigenschadendeckung ca. 72 €/Jahr · Druckeigenschaden ca. 48 €/Jahr · Erweiterte Veranstaltungsdeckung bis 250 Personen ca. 84 €/Jahr · D&O-Außenhaftung ca. 60 €/Jahr.'),
        T('info.cost.6', 'Laufzeit 1 Jahr mit automatischer Verlängerung oder 3 Jahre. Zahlung jährlich (ohne Zuschlag), halbjährlich oder vierteljährlich. Beginn nach deinem Wunschtermin.')
      ] },

      { id: 'ask', q: T('info.ask.q', 'Was fragst du mich?'), a: [
        T('info.ask.1', 'Erst Tarif und Deckung, dann die Risikofragen: Vorschäden oder anhängige Streitigkeiten der letzten 3 bis 5 Jahre, bekannte Umstände mit möglichen künftigen Ansprüchen, Neugründung in den letzten 12 Monaten, Vorversicherer samt Ablaufdatum und Kündigungsgrund, Umsatzanteil in USA und Kanada, ausgeschlossene Tätigkeiten.'),
        T('info.ask.2', 'Zum Schluss die Stammdaten: Rechtsform, Firmenname, Anrede, Vor- und Nachname, E-Mail, Telefon, Webseite oder Social-Profil, PLZ und Ort. Keine Bankdaten, keine IBAN, kein SEPA-Mandat.'),
        T('info.ask.3', 'Abgeschickt geht eine unverbindliche Antragsanfrage raus, kein Vertrag. Du bekommst eine Referenznummer, NIMMERSATT prüft die Angaben, holt das verbindliche Markel-Angebot ein und meldet sich. Vor Abschluss bekommst du AVB, Produktinformationsblatt (IPID) und die 14-tägige Widerrufsbelehrung. Deine Angaben müssen wahrheitsgemäß und vollständig sein (§ 19 Abs. 5 VVG).'),
        T('info.ask.4', 'Nicht im Standardtarif: Architektur oder Ingenieurwesen mit Bauüberwachung, Anlage- und Vermögensberatung sowie die Planung von Waffensystemen oder kerntechnischen Anlagen. Dafür gibt es ein Sonderkonzept, anfragen kannst du trotzdem.')
      ] },

      { id: 'why', q: T('info.why.q', 'Warum brauche ich das?'), a: [
        T('info.why.1', '§ 12.5: Verursachst du durch Leistungsverzug oder Schlechtleistung einen finanziellen Ausfall, haftest du dafür. Die Haftung ist begrenzt auf die Deckungssumme deiner Berufshaftpflicht zzgl. deines Projekthonorars. Ans Privatvermögen geht es nur bei Vorsatz, grober Fahrlässigkeit oder wenn die Versicherung nicht leistet.'),
        T('info.why.2', '§ 12.7: Innerhalb von vier Wochen, nachdem dir ein konkretes Angebot vorliegt, weist du eine von drei Absicherungen nach: a) eine Berufshaftpflicht für Leistungsverzug und Schlechtleistung, b) eine bestehende Versicherung mit vergleichbarem Deckungsumfang, oder c) du haftest persönlich. Es gibt also keinen Abschlusszwang, die Versicherung ist nur die bequemste der drei Türen.'),
        T('info.why.3', '§ 14.4: Haftet NIMMERSATT gegenüber Agentur oder Endkunde für deinen Fehler, besteht im Innenverhältnis ein Regressanspruch, soweit du die Pflichtverletzung zu vertreten hast.')
      ] }
    ];
  }

  // The menu itself. It is re-rendered under the newest answer (never left
  // sitting mid-conversation), keeps track of what has been read, and hands
  // over to the funnel through done() when the visitor wants the number.
  function askTopics(done) {
    setInput(false);
    var seen = {};
    var wrapped = false;   // "that was all of it" is said once
    var busy = false;

    function allSeen() {
      return topics().every(function (t) { return seen[t.id]; });
    }

    function menu() {
      var c = controls();
      var row = document.createElement('div'); row.className = 'ichips';
      topics().forEach(function (t) {
        var b = chip(t.q, function () {
          if (busy) return;
          busy = true; c.remove(); answer(t, function () { busy = false; menu(); });
        });
        if (seen[t.id]) b.classList.add('is-done');
        row.appendChild(b);
      });

      var nav = document.createElement('div'); nav.className = 'ichips';
      if (!allSeen()) {
        nav.appendChild(chip(T('info.all', 'Zeig mir einfach alles'), function () {
          if (busy) return;
          busy = true; c.remove(); userMsg(T('info.all', 'Zeig mir einfach alles'));
          var list = topics(); var i = 0;
          (function next() {
            if (i >= list.length) { busy = false; menu(); return; }
            answer(list[i++], next, true);
          })();
        }, 'ghost'));
      }
      var go = T('info.start', 'Los, rechne mir das aus');
      nav.appendChild(chip(go, function () {
        if (busy) return;
        busy = true; c.remove(); userMsg(go); done();
      }, 'primary'));

      c.appendChild(row); c.appendChild(nav);
      scrollDown();
    }

    // One topic: echo it as the visitor's question, then answer it.
    function answer(t, cb, silent) {
      if (!silent) userMsg(t.q);
      seen[t.id] = true;
      botSay(t.a, function () {
        if (allSeen() && !wrapped) {
          wrapped = true;
          botSay(T('info.wrap', 'Das war alles, was ich dazu habe. Sollen wir rechnen?'), cb);
          return;
        }
        cb();
      }, true);
    }

    menu();
  }

  /* --- The scripted conversation ----------------------------------------- */
  function YESNO(noLabel, yesLabel) {
    return [
      { value: 'no', label: noLabel || T('no', 'Nein') },
      { value: 'yes', label: yesLabel || T('yes', 'Ja') }
    ];
  }

  function steps() {
    return [
      { bot: [T('q.hello1', 'Hey, ich bin der nimmersatt Bot. Ich habe hier alles zur Berufshaftpflicht für Medienberufe und rechne dir live aus, was sie ungefähr kostet.'),
              T('q.hello2', 'Vorab alles Wichtige zur Haftpflicht als PDF, zum Nachlesen wann du willst:')],
        render: function (done) { showDoc(); done(); } },

      // Everything about the cover, on request, in the same conversation that
      // collects the application. There is no static list next to the chat.
      { bot: [T('info.intro', 'Frag mich einfach, was du wissen willst. Oder wir legen direkt los und ich rechne dir eine Größenordnung.'),
              T('info.fine', 'Eins vorweg: Das hier ist keine Versicherungs- oder Rechtsberatung, keine verbindliche Prämie und keine Zusage auf Annahme. Verbindlich wird alles erst mit dem geprüften Angebot von Markel.')],
        render: function (done) { askTopics(done); } },

      // Hard gate, deliberately the first question: no German registration means
      // no offer, so asking anything else first would waste the visitor's time.
      { bot: [T('q.gate1', 'Eine Sache vorweg, sonst rechne ich dir etwas aus, das du gar nicht bekommen kannst: Markel Pro Media ist ein Produkt nach deutschem Recht.'),
              T('q.gate2', 'Bist du mit deiner Tätigkeit in Deutschland gemeldet — und liegt deine Rechnungsadresse ebenfalls in Deutschland?')],
        render: function (done) { askChoice('de_registered', [
          { value: 'yes', label: T('q.gateYes', 'Ja, beides in Deutschland') },
          { value: 'no', label: T('q.gateNo', 'Nein, oder Rechnungsadresse im Ausland') }
        ], function () {
          if (data.de_registered === 'yes') { done(); return; }
          abroadFlow();   // no done(): the main funnel ends here
        }); } },

      { bot: T('q.prof', 'Gut. Legen wir los — in welchem Bereich bist du überwiegend unterwegs?'),
        render: function (done) { askChoice('prof', [
          { value: 'video', label: profLabel('video') },
          { value: 'design', label: profLabel('design') },
          { value: 'agency', label: profLabel('agency') },
          { value: 'text', label: profLabel('text') },
          { value: 'music', label: profLabel('music') },
          { value: 'consulting', label: profLabel('consulting') }
        ], done); } },

      { bot: T('q.revenue', 'Und was machst du ungefähr an Jahresnettoumsatz?'),
        render: function (done) { askChoice('revenue', [
          { value: 'r50', label: T('upTo', 'bis {v}').replace('{v}', euro(50000)) },
          { value: 'r100', label: T('upTo', 'bis {v}').replace('{v}', euro(100000)) },
          { value: 'r250', label: T('upTo', 'bis {v}').replace('{v}', euro(250000)) },
          { value: 'r500', label: T('upTo', 'bis {v}').replace('{v}', euro(500000)) },
          { value: 'r500plus', label: T('over', 'über {v}').replace('{v}', euro(500000)) }
        ], done); } },

      { bot: T('q.vsh', 'Wie hoch soll die Versicherungssumme für reine Vermögensschäden sein?'),
        render: function (done) { askChoice('vsh', [
          { value: '300000', label: euro(300000) },
          { value: '500000', label: euro(500000) },
          { value: '1000000', label: euro(1000000) + ' ' + T('recommended', '(empfohlen)') },
          { value: '2000000', label: euro(2000000) },
          { value: '5000000', label: euro(5000000) },
          { value: '10000000', label: euro(10000000) }
        ], done); } },

      { bot: T('q.sb', 'Möchtest du eine Selbstbeteiligung pro Schaden? Mehr Selbstbehalt = günstigere Prämie.'),
        render: function (done) { askChoice('sb', [
          { value: '0', label: euro(0) + ' ' + T('q.sbNone', '(ohne Selbstbehalt)') },
          { value: '250', label: euro(250) },
          { value: '500', label: euro(500) },
          { value: '1000', label: euro(1000) }
        ], done); } },

      { bot: T('q.bhp', 'Sollen auch physische Schäden mit rein? Also Personen-, Sach- und Mietsachschäden am Set, Drehort oder im Büro (Betriebshaftpflicht).'),
        render: function (done) { askChoice('bhp', [
          { value: 'no', label: T('q.bhpNo', 'Nein, nur Vermögensschäden') },
          { value: 'yes', label: T('q.bhpYes', 'Ja, auch physische Schäden') }
        ], done); } },

      { skipIf: function () { return data.bhp !== 'yes'; },
        bot: T('q.bhpsum', 'Welche Deckungssumme für Personen- & Sachschäden?'),
        render: function (done) { askChoice('bhpsum', [
          { value: '3000000', label: T('q.bhpsum3', '3 Mio. € pauschal') },
          { value: '5000000', label: T('q.bhpsum5', '5 Mio. € pauschal') }
        ], done); } },

      { bot: T('q.modules', 'Optional gibt es Zusatzbausteine. Tipp an, was du brauchst — oder direkt weiter.'),
        render: function (done) { askModules(done); } },

      { bot: T('q.estimate', 'So, grobe Größenordnung auf Basis deiner Angaben:'),
        render: function (done) { showEstimate(); done(); } },

      { bot: T('q.claims', 'Jetzt ein paar kurze Risikofragen, damit die Prüfung sauber läuft. Gab es in den letzten 3 bis 5 Jahren Haftpflichtansprüche, Vermögens- oder Eigenschäden oder anhängige Streitigkeiten aus deiner Arbeit?'),
        render: function (done) { askChoice('q_claims', YESNO(), done); } },
      { skipIf: function () { return data.q_claims !== 'yes'; },
        bot: T('q.claimsDetail', 'Beschreib die Vorschäden bitte kurz: Datum, Höhe, Ursache und Regulierungsstatus.'),
        render: function (done) { askText('q_claims_detail', { placeholder: T('ph.claims', 'Datum, Höhe, Ursache, Status') }, done); } },

      { bot: T('q.known', 'Sind dir aktuell Umstände oder Fälle bekannt, die zu künftigen Ansprüchen gegen dich führen könnten?'),
        render: function (done) { askChoice('q_known', YESNO(), done); } },
      { skipIf: function () { return data.q_known !== 'yes'; },
        bot: T('q.knownDetail', 'Schilder den Sachverhalt bitte kurz.'),
        render: function (done) { askText('q_known_detail', { placeholder: T('ph.known', 'Kurze Schilderung') }, done); } },

      { bot: T('q.startup', 'Wurde dein Unternehmen in den letzten 12 Monaten neu gegründet?'),
        render: function (done) { askChoice('q_startup', [
          { value: 'yes', label: T('q.startupYes', 'Ja, Neugründung') },
          { value: 'no', label: T('no', 'Nein') }
        ], done); } },
      { skipIf: function () { return data.q_startup !== 'no'; },
        bot: T('q.prev', 'Bestand direkt vor diesem Antrag schon eine gleichartige Berufshaftpflicht?'),
        render: function (done) { askChoice('q_prev', YESNO(), done); } },
      { skipIf: function () { return data.q_prev !== 'yes'; },
        bot: T('q.prevInsurer', 'Bei welchem Vorversicherer warst du?'),
        render: function (done) { askText('q_prev_insurer', { placeholder: T('ph.prevInsurer', 'Name des Vorversicherers') }, done); } },
      { skipIf: function () { return data.q_prev !== 'yes'; },
        bot: T('q.prevEnd', 'Und das Ablaufdatum?'),
        render: function (done) { askText('q_prev_end', { placeholder: T('ph.date', 'TT.MM.JJJJ') }, done); } },
      { skipIf: function () { return data.q_prev !== 'yes'; },
        bot: T('q.prevReason', 'Was war der Kündigungsgrund?'),
        render: function (done) { askText('q_prev_reason', { placeholder: T('ph.prevReason', 'Kündigungsgrund') }, done); } },

      { bot: T('q.us', 'Machst du Umsätze mit direkten Auftraggebern in den USA oder Kanada, oder arbeitest du dort vor Ort?'),
        render: function (done) { askChoice('q_us', YESNO(), done); } },
      { skipIf: function () { return data.q_us !== 'yes'; },
        bot: T('q.usShare', 'Wie hoch ist der US-/Kanada-Umsatzanteil, ungefähr in Prozent?'),
        render: function (done) { askText('q_us_share', {
          placeholder: T('ph.usShare', 'z. B. 15'),
          validate: function (v) { return /^\d{1,3}\s*%?$/.test(v) ? '' : T('err.percent', 'Bitte eine Zahl von 0 bis 100.'); },
          transform: function (v) { return v.replace(/[^\d]/g, ''); }
        }, done); } },

      { bot: T('q.excl', 'Übst du Tätigkeiten als Architekt/Ingenieur mit Bauüberwachung, Anlage-/Vermögensberatung oder Planung von Waffensystemen bzw. kerntechnischen Anlagen aus?'),
        render: function (done) { askChoice('q_excl', YESNO(), done); } },
      { skipIf: function () { return data.q_excl !== 'yes'; },
        bot: T('q.exclNote', 'Alles klar. Diese Tätigkeiten sind im Standardtarif ausgeschlossen — wir leiten dich an ein passendes Sonderkonzept weiter. Deine Anfrage kannst du trotzdem absenden.'),
        render: function (done) { done(); } },

      { bot: T('q.legalForm', 'Fast geschafft. Jetzt nur noch deine Daten für die Anfrage. Welche Rechtsform hast du?'),
        render: function (done) { askChoice('legalForm', [
          { value: 'Freiberufler:in', label: T('lf.freelance', 'Freiberufler:in') },
          { value: 'Einzelunternehmen', label: T('lf.sole', 'Einzelunternehmen') },
          { value: 'GbR', label: 'GbR' },
          { value: 'UG (haftungsbeschränkt)', label: 'UG (haftungsbeschränkt)' },
          { value: 'GmbH', label: 'GmbH' },
          { value: 'Sonstige', label: T('lf.other', 'Sonstige') }
        ], done); } },
      { bot: T('q.company', 'Gibt es einen Firmen- oder Unternehmensnamen?'),
        render: function (done) { askText('company', { placeholder: T('ph.company', 'Firmenname (optional)'), optional: true }, done); } },
      { bot: T('q.salutation', 'Wie sprechen wir dich an?'),
        render: function (done) { askChoice('salutation', [
          { value: 'Frau', label: T('sal.f', 'Frau') },
          { value: 'Herr', label: T('sal.m', 'Herr') },
          { value: 'Divers', label: T('sal.d', 'Divers') },
          { value: '', label: T('sal.none', 'Keine Angabe') }
        ], done); } },
      { bot: T('q.first', 'Wie heißt du mit Vornamen?'),
        render: function (done) { askText('firstName', { placeholder: T('ph.first', 'Vorname') }, done); } },
      { bot: T('q.last', 'Und der Nachname?'),
        render: function (done) { askText('lastName', { placeholder: T('ph.last', 'Nachname') }, done); } },
      { bot: T('q.email', 'An welche E-Mail sollen wir das Angebot schicken?'),
        render: function (done) { askText('email', {
          placeholder: T('ph.email', 'name@mail.de'),
          validate: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : T('err.email', 'Bitte eine gültige E-Mail-Adresse.'); }
        }, done); } },
      { bot: T('q.phone', 'Telefon oder Mobil, falls Rückfragen? Kannst du auch überspringen.'),
        render: function (done) { askText('phone', { placeholder: T('ph.phone', 'Telefon / Mobil (optional)'), optional: true }, done); } },
      { bot: T('q.website', 'Webseite oder Social-Media-Profil zur Verifikation?'),
        render: function (done) { askText('website', { placeholder: T('ph.website', 'z. B. instagram.com/… (optional)'), optional: true }, done); } },
      { bot: T('q.city', 'PLZ und Ort?'),
        render: function (done) { askText('city', { placeholder: T('ph.city', 'PLZ, Ort (optional)'), optional: true }, done); } },
      // (No "Wo ist dein Sitz?" step any more — the gate above already settled
      // that, and offering EU/EWR here would let the answer contradict it.
      // data.country stays 'DE'.)
      { bot: T('q.term', 'Welche Laufzeit hättest du gern?'),
        render: function (done) { askChoice('term', [
          { value: '1', label: T('q.term1', '1 Jahr (autom. Verlängerung)') },
          { value: '3', label: T('q.term3', '3 Jahre') }
        ], done); } },
      { bot: T('q.interval', 'Und das Zahlungsintervall?'),
        render: function (done) { askChoice('interval', [
          { value: 'yearly', label: T('q.intYear', 'Jährlich (ohne Zuschlag)') },
          { value: 'halfyearly', label: T('q.intHalf', 'Halbjährlich') },
          { value: 'quarterly', label: T('q.intQuarter', 'Vierteljährlich') }
        ], done); } },
      { bot: T('q.start', 'Ab wann soll die Versicherung laufen?'),
        render: function (done) { askText('startDate', { placeholder: T('ph.start', 'sofort oder TT.MM.JJJJ (optional)'), optional: true }, done); } },

      { bot: T('q.review', 'Perfekt. Kurz dein Überblick:'),
        render: function (done) { showReview(); done(); } },
      { bot: T('q.consents', 'Zum Absenden bestätige bitte noch die drei Pflichthinweise:'),
        render: function () { askConsents(); } }   // terminal: submit takes over
    ];
  }

  /* --- Engine ------------------------------------------------------------- */
  // Walks a step list. A step advances only when its render() calls done(), so
  // a branch that never calls it (abroadFlow) simply ends the conversation.
  function runSteps(list) {
    var idx = -1;
    (function next() {
      idx++;
      if (idx >= list.length) return;
      var step = list[idx];
      if (step.skipIf && step.skipIf()) { next(); return; }
      botSay(step.bot, function () { step.render(next); });
    })();
  }

  /* --- One-time Germany note, and kickoff --------------------------------
     The chat has no dropdown around it any more: it is part of the "Auf die
     Liste" card and starts talking once it scrolls into view. The note is
     raised on the visitor's FIRST tap inside the chat (see chip()), because
     Markel Pro Media is a German-law product and an artist billing from abroad
     should hear that before answering ten questions. It is informational only:
     the funnel's own first question is the Germany gate and routes a "no" into
     the § 12.7 branch. The tap that raised it is replayed afterwards, so no
     click is lost.
     ?funnel=0 hides the whole slot further up, so nothing here runs then. */
  var note = document.getElementById('insuranceNote');
  var noteSeen = false;
  var noteDone = !note;      // no note on the page: nothing to wait for
  var pendingTap = null;     // the chip tap that raised the note

  var started = false;
  function start() {
    if (started) return;
    started = true;
    runSteps(steps());
  }

  function closeNote() {
    if (!note) return;
    if (typeof note.close === 'function' && note.open) {
      try { note.close(); } catch (err) { /* was not open as a modal */ }
    }
    note.removeAttribute('open');
    note.classList.remove('inote--fallback');
  }
  function showNote() {
    if (noteSeen || !note) return;
    noteSeen = true;
    if (typeof note.showModal === 'function') {
      try { note.showModal(); return; } catch (err) { /* fall through */ }
    }
    // No <dialog> support: css/funnel.css centres it as a plain fixed panel.
    note.classList.add('inote--fallback');
    note.setAttribute('open', '');
  }
  function dismissNote() {
    noteDone = true;
    closeNote();
    var tap = pendingTap; pendingTap = null;
    if (tap) tap();
  }

  if (note) {
    note.addEventListener('click', function (e) {
      // The button closes it; so does the backdrop, which reports the dialog
      // element itself as the click target.
      if (e.target === note || (e.target.closest && e.target.closest('[data-note-close]'))) {
        dismissNote();
      }
    });
    // Esc (or any other native close) counts as read, too.
    note.addEventListener('close', dismissNote);
  }

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.disconnect();
        start();
      });
    }, { threshold: 0.35 });
    io.observe(chat);
  } else {
    start();
  }
})();
