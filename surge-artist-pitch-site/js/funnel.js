/* ===========================================================================
   Insurance funnel — Markel Pro Media (Berufshaftpflicht), as a CHAT.
   The bot ("nimmersatt Bot") walks the visitor through tariff, risk and
   contact one question at a time (tappable chips + short text prompts),
   shows the same live, clearly-non-binding premium ESTIMATE, surfaces the
   Haftpflicht PDF right in the conversation, and ends as a qualified
   application request POSTed to /api/funnel.
   - Gate: German-language visitors only (?funnel=1 forces on, =0 off).
   - The estimate is a transparent order-of-magnitude heuristic, NOT a real
     Markel rate. The binding premium comes from Markel after review.
   =========================================================================== */
(function () {
  var section = document.getElementById('versicherung');
  var chat = document.getElementById('insuranceChat');
  if (!section || !chat) return;

  /* --- Language gate ------------------------------------------------------ */
  var q = window.location.search;
  var force = /[?&]funnel=1/.test(q);
  var forceOff = /[?&]funnel=0/.test(q);
  function isGerman() {
    var langs = navigator.languages && navigator.languages.length
      ? navigator.languages
      : [navigator.language || navigator.userLanguage || ''];
    return langs.some(function (l) { return /^de/i.test(l || ''); });
  }
  if (forceOff) return;   // stays hidden, unwired

  // The section is wired either way, but it is only SHOWN on the German page:
  // the visitor can switch language at any time, so visibility follows the
  // current page language (js/i18n.js) and falls back to the browser locale
  // when the language layer is not present.
  section.setAttribute('data-de-ready', '1');
  function pageLang() {
    if (window.nsatLang && window.nsatLang.get) return window.nsatLang.get();
    return isGerman() ? 'de' : 'en';
  }
  function syncVisibility() {
    // Two conditions, both required: the page has to be in German AND the
    // visitor's browser has to be German (the original gate — this is a
    // German-law product). Switching the page to English hides it either way.
    if (!force && (pageLang() !== 'de' || !isGerman())) { section.hidden = true; return; }
    section.hidden = false;
    // main.js's scroll-reveal observer registered these while the section was
    // display:none, so reveal them directly (the section sits below the fold).
    section.querySelectorAll('[data-animate], [data-stagger]').forEach(function (el) {
      el.classList.add('is-visible');
    });
  }
  document.addEventListener('nsat:langchange', syncVisibility);
  syncVisibility();

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

  var eur = (typeof Intl !== 'undefined' && Intl.NumberFormat)
    ? new Intl.NumberFormat('de-DE')
    : { format: function (n) { return String(n); } };
  function euro(n) { return eur.format(Math.round(n)) + ' €'; }

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
  var PROF_LABEL = {
    video: 'Video, Film & Content', design: 'Grafik, Web & Design', agency: 'Marketing- & Medienagentur',
    text: 'Text, Redaktion & Verlag', music: 'Musik, Audio & Event', consulting: 'Beratung / Dienstleistung'
  };
  function coverText() {
    var parts = ['VSH ' + euro(data.vsh), 'SB ' + euro(data.sb)];
    if (data.bhp === 'yes') parts.push('inkl. BHP ' + (data.bhpsum === '5000000' ? '5 Mio' : '3 Mio'));
    var m = data.modules.length;
    if (m) parts.push('+' + m + ' ' + (m === 1 ? 'Baustein' : 'Bausteine'));
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
    p.className = 'chat__dots'; p.setAttribute('aria-label', 'schreibt');
    p.innerHTML = '<i></i><i></i><i></i>';
    wrap.appendChild(p); win.appendChild(wrap); scrollDown();
    return wrap;
  }
  // Say one or more bot lines, then run cb.
  function botSay(lines, cb) {
    if (typeof lines === 'string') lines = [lines];
    var i = 0;
    function step() {
      if (i >= lines.length) { if (cb) cb(); return; }
      var t = typing();
      var delay = reduce ? 120 : Math.min(900, 260 + lines[i].length * 12);
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
      input.placeholder = placeholder || 'Deine Antwort…';
      if (!reduce) { try { input.focus({ preventScroll: true }); } catch (e) { input.focus(); } }
    }
  }

  /* --- Control renderers -------------------------------------------------- */
  function chip(label, onClick, variant) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'ichip' + (variant ? ' ichip--' + variant : '');
    b.textContent = label;
    b.addEventListener('click', onClick);
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
      { v: 'cyber', n: 'Cyber & Daten-Eigenschaden', d: 'Hackerangriff, Datenrettung, DSGVO-Krise', p: 96 },
      { v: 'eigenschaden', n: 'Eigenschadendeckung', d: 'Projektrücktritt, Reputation, Phishing', p: 72 },
      { v: 'druck', n: 'Druckeigenschaden', d: 'Fehlerhafte Druckaufträge', p: 48 },
      { v: 'veranstaltung', n: 'Erweiterte Veranstaltungsdeckung', d: 'Events für Dritte, bis 250 Pers.', p: 84 },
      { v: 'doe', n: 'D&O-Außenhaftung', d: 'Persönliche Organhaftung', p: 60 }
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
      price.textContent = '+ ca. ' + m.p + ' €/J';
      var mark = document.createElement('span'); mark.className = 'imod__check'; mark.setAttribute('aria-hidden', 'true');
      lab.appendChild(box); lab.appendChild(mark); lab.appendChild(body); lab.appendChild(price);
      list.appendChild(lab);
    });
    var nav = document.createElement('div'); nav.className = 'ichips';
    var go = chip('Weiter', function () {
      data.modules = MODULES.map(function (m) { return m.v; }).filter(function (v) { return chosen[v]; });
      userMsg(data.modules.length
        ? (data.modules.length + ' ' + (data.modules.length === 1 ? 'Baustein' : 'Bausteine') + ' dazu')
        : 'Keine Zusatzbausteine');
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
      skipRow.appendChild(chip('Überspringen', function () {
        cleanup(); userMsg('— übersprungen —'); done();
      }, 'ghost'));
      c.appendChild(skipRow); scrollDown();
    }
    setInput(true, opts.placeholder);
    pendingText = function (raw) {
      var v = String(raw || '').trim();
      if (!v) {
        if (opts.optional) { cleanup(); userMsg('— übersprungen —'); done(); return; }
        showErr(c, 'Bitte kurz ausfüllen.'); return;
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

  // The Haftpflicht PDF as an in-chat document card.
  function showDoc() {
    var c = controls();
    var card = document.createElement('div'); card.className = 'idoc';
    var href = 'assets/documents/markel-berufshaftpflicht-info.pdf';
    card.innerHTML =
      '<span class="idoc__icon" aria-hidden="true">PDF</span>' +
      '<span class="idoc__text">' +
        '<span class="idoc__title">Berufshaftpflicht — das Wichtigste</span>' +
        '<span class="idoc__meta">Markel Pro Media · Übersicht · PDF</span>' +
      '</span>' +
      '<span class="idoc__actions">' +
        '<a class="idoc__btn" href="' + href + '" target="_blank" rel="noopener">Öffnen</a>' +
        '<a class="idoc__btn idoc__btn--ghost" href="' + href + '" download="Berufshaftpflicht-Markel-Pro-Media.pdf">Sichern</a>' +
      '</span>';
    c.appendChild(card); scrollDown();
  }

  // Live premium estimate as a styled bubble.
  function showEstimate() {
    var e = estimate();
    if (!e.valid) return;
    var c = controls();
    var box = document.createElement('div'); box.className = 'iprice';
    box.innerHTML =
      '<span class="iprice__tag">Unverbindliche Schätzung</span>' +
      '<span class="iprice__main">ca. ' + euro(e.annual) + '<span class="iprice__per"> / Jahr</span></span>' +
      '<span class="iprice__alt">≈ ' + euro(e.monthly) + ' / Monat</span>' +
      '<span class="iprice__basis"></span>';
    box.querySelector('.iprice__basis').textContent =
      coverText() + '. Keine verbindliche Markel-Prämie — die kommt nach der Prüfung.';
    c.appendChild(box); scrollDown();
  }

  // Review summary bubble.
  function showReview() {
    var e = estimate();
    var c = controls();
    var box = document.createElement('div'); box.className = 'ireview';
    function row(k, v) { return '<div class="ireview__row"><dt>' + k + '</dt><dd>' + v + '</dd></div>'; }
    box.innerHTML = '<dl>' +
      row('Tätigkeit', PROF_LABEL[data.prof] || '—') +
      row('Deckung', coverText()) +
      row('Geschätzte Prämie', e.valid ? ('ca. ' + euro(e.annual) + ' / Jahr') : '—') +
    '</dl>';
    c.appendChild(box); scrollDown();
  }

  // Consents + final submit.
  function askConsents() {
    setInput(false);
    var c = controls();
    var wrap = document.createElement('div'); wrap.className = 'iconsents';
    var CONSENTS = [
      { name: 'c_vvg', text: 'Meine Angaben sind wahrheitsgemäß und vollständig (§ 19 Abs. 5 VVG).' },
      { name: 'c_avb', text: 'Mir werden vor Abschluss die AVB, das Produktinformationsblatt (IPID) und die 14-tägige Widerrufsbelehrung zugestellt.' },
      { name: 'c_dsgvo', text: 'Ich willige in die Verarbeitung meiner Daten zur Bearbeitung dieser Anfrage nach DSGVO ein.' }
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
    var submit = chip('Anfrage absenden', function () {
      if (!boxes.every(function (b) { return b.checked; })) {
        showErr(c, 'Bitte bestätige die drei Pflichthinweise, um abzusenden.'); return;
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
      term: data.term, interval: data.interval, startDate: data.startDate
    };
  }
  function finish() {
    var ref = 'NIM-' + Date.now().toString(36).toUpperCase().slice(-6);
    botSay([
      'Danke, deine Anfrage ist raus. Wir prüfen deine Angaben, holen das verbindliche Markel-Angebot ein und melden uns bei dir.',
      'Referenz: ' + ref + '. Bis dahin: bleib hungrig.'
    ]);
  }
  function sendLead(c, submit) {
    var e = c.querySelector('.ichat__err'); if (e) e.textContent = '';
    botSay('Sekunde, ich schick das ab…', function () {
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
          showErr(c, 'Hat gerade nicht geklappt. Schreib uns einfach an hello@nimmersatt.fyi.');
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
      firstName: data.firstName, lastName: data.lastName, email: data.email, phone: data.phone
    };
  }

  function finishAbroad() {
    var ref = 'NIM-' + Date.now().toString(36).toUpperCase().slice(-6);
    var lines = ['Notiert. Damit liegt uns deine Rückmeldung nach § 12.7 vor, innerhalb der vier Wochen.'];
    if (data.abroad_choice === 'insured_abroad') {
      lines.push('Ein Nachweis fehlt noch: schick uns die Police oder die Versicherungsbestätigung an hello@nimmersatt.fyi, dann ist es komplett.');
    } else {
      lines.push('Heißt konkret: für Schäden aus Leistungsverzug und Schlechtleistung stehst du nach § 12.5 selbst gerade — begrenzt auf dein Projekthonorar, darüber hinaus nur bei Vorsatz oder grober Fahrlässigkeit.');
    }
    lines.push('Referenz: ' + ref + '. Bis dahin: bleib hungrig.');
    botSay(lines);
  }

  function sendDeclaration(c, submit) {
    var e = c.querySelector('.ichat__err'); if (e) e.textContent = '';
    botSay('Sekunde, ich schreib das auf…', function () {
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
          showErr(c, 'Hat gerade nicht geklappt. Schreib uns einfach an hello@nimmersatt.fyi.');
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
    txt.textContent = 'Ich willige in die Verarbeitung meiner Daten zur Dokumentation dieser Erklärung nach DSGVO ein.';
    lab.appendChild(cb); lab.appendChild(mark); lab.appendChild(txt);
    wrap.appendChild(lab);
    var nav = document.createElement('div'); nav.className = 'ichips';
    var submit = chip('Erklärung absenden', function () {
      if (!cb.checked) { showErr(c, 'Bitte bestätige den Hinweis, um abzusenden.'); return; }
      submit.disabled = true;
      sendDeclaration(c, submit);
    }, 'primary');
    nav.appendChild(submit);
    wrap.appendChild(nav);
    c.appendChild(wrap); scrollDown();
  }

  var ABROAD_STEPS = [
    { bot: ['Danke fürs ehrliche Antippen. Dann können wir dir über unseren Partner kein Angebot machen: Markel Pro Media setzt eine deutsche Meldung und eine deutsche Rechnungsadresse voraus.',
            'Der Vertrag kennt diesen Fall aber. § 12.7 gibt dir vier Wochen, uns zu sagen, wie du stattdessen abgesichert bist. Zwei Wege, beide völlig in Ordnung:'],
      render: function (done) { askChoice('abroad_choice', [
        { value: 'insured_abroad', label: 'Ich bin dort vergleichbar versichert', sub: '§ 12.7 b' },
        { value: 'private_liability', label: 'Ich hafte persönlich', sub: '§ 12.7 c' }
      ], done); } },

    { bot: 'In welchem Land liegt deine Rechnungsadresse?',
      render: function (done) { askText('abroad_country', { placeholder: 'z. B. Österreich' }, done); } },

    { skipIf: function () { return data.abroad_choice !== 'insured_abroad'; },
      bot: 'Bei welchem Versicherer bist du dort? Kannst du auch überspringen.',
      render: function (done) { askText('abroad_insurer', { placeholder: 'Name des Versicherers (optional)', optional: true }, done); } },

    { bot: 'Dann halte ich das für dich fest. Wie heißt du mit Vornamen?',
      render: function (done) { askText('firstName', { placeholder: 'Vorname' }, done); } },
    { bot: 'Und der Nachname?',
      render: function (done) { askText('lastName', { placeholder: 'Nachname' }, done); } },
    { bot: 'An welche E-Mail sollen wir uns halten?',
      render: function (done) { askText('email', {
        placeholder: 'name@mail.de',
        validate: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Bitte eine gültige E-Mail-Adresse.'; }
      }, done); } },

    { bot: 'Zum Absenden noch ein Häkchen:',
      render: function () { askDeclarationConsent(); } }   // terminal
  ];

  function abroadFlow() { runSteps(ABROAD_STEPS); }

  /* --- The scripted conversation ----------------------------------------- */
  var YESNO = function (noLabel, yesLabel) {
    return [{ value: 'no', label: noLabel || 'Nein' }, { value: 'yes', label: yesLabel || 'Ja' }];
  };

  var STEPS = [
    { bot: ['Hey, ich bin der nimmersatt Bot. Ich schau mit dir in ein paar Minuten deine Berufshaftpflicht durch und rechne dir live, was sie ungefähr kostet.',
            'Vorab alles Wichtige zur Haftpflicht als PDF, zum Nachlesen wann du willst:'],
      render: function (done) { showDoc(); done(); } },

    // Hard gate, deliberately the first question: no German registration means
    // no offer, so asking anything else first would waste the visitor's time.
    { bot: ['Eine Sache vorweg, sonst rechne ich dir etwas aus, das du gar nicht bekommen kannst: Markel Pro Media ist ein Produkt nach deutschem Recht.',
            'Bist du mit deiner Tätigkeit in Deutschland gemeldet — und liegt deine Rechnungsadresse ebenfalls in Deutschland?'],
      render: function (done) { askChoice('de_registered', [
        { value: 'yes', label: 'Ja, beides in Deutschland' },
        { value: 'no', label: 'Nein, oder Rechnungsadresse im Ausland' }
      ], function () {
        if (data.de_registered === 'yes') { done(); return; }
        abroadFlow();   // no done(): the main funnel ends here
      }); } },

    { bot: 'Gut. Legen wir los — in welchem Bereich bist du überwiegend unterwegs?',
      render: function (done) { askChoice('prof', [
        { value: 'video', label: 'Video, Film & Content' },
        { value: 'design', label: 'Grafik, Web & Design' },
        { value: 'agency', label: 'Marketing- & Medienagentur' },
        { value: 'text', label: 'Text, Redaktion & Verlag' },
        { value: 'music', label: 'Musik, Audio & Event' },
        { value: 'consulting', label: 'Beratung / Dienstleistung' }
      ], done); } },

    { bot: 'Und was machst du ungefähr an Jahresnettoumsatz?',
      render: function (done) { askChoice('revenue', [
        { value: 'r50', label: 'bis 50.000 €' },
        { value: 'r100', label: 'bis 100.000 €' },
        { value: 'r250', label: 'bis 250.000 €' },
        { value: 'r500', label: 'bis 500.000 €' },
        { value: 'r500plus', label: 'über 500.000 €' }
      ], done); } },

    { bot: 'Wie hoch soll die Versicherungssumme für reine Vermögensschäden sein?',
      render: function (done) { askChoice('vsh', [
        { value: '300000', label: '300.000 €' },
        { value: '500000', label: '500.000 €' },
        { value: '1000000', label: '1.000.000 € (empfohlen)' },
        { value: '2000000', label: '2.000.000 €' },
        { value: '5000000', label: '5.000.000 €' },
        { value: '10000000', label: '10.000.000 €' }
      ], done); } },

    { bot: 'Möchtest du eine Selbstbeteiligung pro Schaden? Mehr Selbstbehalt = günstigere Prämie.',
      render: function (done) { askChoice('sb', [
        { value: '0', label: '0 € (ohne Selbstbehalt)' },
        { value: '250', label: '250 €' },
        { value: '500', label: '500 €' },
        { value: '1000', label: '1.000 €' }
      ], done); } },

    { bot: 'Sollen auch physische Schäden mit rein? Also Personen-, Sach- und Mietsachschäden am Set, Drehort oder im Büro (Betriebshaftpflicht).',
      render: function (done) { askChoice('bhp', [
        { value: 'no', label: 'Nein, nur Vermögensschäden' },
        { value: 'yes', label: 'Ja, auch physische Schäden' }
      ], done); } },

    { skipIf: function () { return data.bhp !== 'yes'; },
      bot: 'Welche Deckungssumme für Personen- & Sachschäden?',
      render: function (done) { askChoice('bhpsum', [
        { value: '3000000', label: '3 Mio. € pauschal' },
        { value: '5000000', label: '5 Mio. € pauschal' }
      ], done); } },

    { bot: 'Optional gibt es Zusatzbausteine. Tipp an, was du brauchst — oder direkt weiter.',
      render: function (done) { askModules(done); } },

    { bot: 'So, grobe Größenordnung auf Basis deiner Angaben:',
      render: function (done) { showEstimate(); done(); } },

    { bot: 'Jetzt ein paar kurze Risikofragen, damit die Prüfung sauber läuft. Gab es in den letzten 3 bis 5 Jahren Haftpflichtansprüche, Vermögens- oder Eigenschäden oder anhängige Streitigkeiten aus deiner Arbeit?',
      render: function (done) { askChoice('q_claims', YESNO(), done); } },
    { skipIf: function () { return data.q_claims !== 'yes'; },
      bot: 'Beschreib die Vorschäden bitte kurz: Datum, Höhe, Ursache und Regulierungsstatus.',
      render: function (done) { askText('q_claims_detail', { placeholder: 'Datum, Höhe, Ursache, Status' }, done); } },

    { bot: 'Sind dir aktuell Umstände oder Fälle bekannt, die zu künftigen Ansprüchen gegen dich führen könnten?',
      render: function (done) { askChoice('q_known', YESNO(), done); } },
    { skipIf: function () { return data.q_known !== 'yes'; },
      bot: 'Schilder den Sachverhalt bitte kurz.',
      render: function (done) { askText('q_known_detail', { placeholder: 'Kurze Schilderung' }, done); } },

    { bot: 'Wurde dein Unternehmen in den letzten 12 Monaten neu gegründet?',
      render: function (done) { askChoice('q_startup', [
        { value: 'yes', label: 'Ja, Neugründung' },
        { value: 'no', label: 'Nein' }
      ], done); } },
    { skipIf: function () { return data.q_startup !== 'no'; },
      bot: 'Bestand direkt vor diesem Antrag schon eine gleichartige Berufshaftpflicht?',
      render: function (done) { askChoice('q_prev', YESNO(), done); } },
    { skipIf: function () { return data.q_prev !== 'yes'; },
      bot: 'Bei welchem Vorversicherer warst du?',
      render: function (done) { askText('q_prev_insurer', { placeholder: 'Name des Vorversicherers' }, done); } },
    { skipIf: function () { return data.q_prev !== 'yes'; },
      bot: 'Und das Ablaufdatum?',
      render: function (done) { askText('q_prev_end', { placeholder: 'TT.MM.JJJJ' }, done); } },
    { skipIf: function () { return data.q_prev !== 'yes'; },
      bot: 'Was war der Kündigungsgrund?',
      render: function (done) { askText('q_prev_reason', { placeholder: 'Kündigungsgrund' }, done); } },

    { bot: 'Machst du Umsätze mit direkten Auftraggebern in den USA oder Kanada, oder arbeitest du dort vor Ort?',
      render: function (done) { askChoice('q_us', YESNO(), done); } },
    { skipIf: function () { return data.q_us !== 'yes'; },
      bot: 'Wie hoch ist der US-/Kanada-Umsatzanteil, ungefähr in Prozent?',
      render: function (done) { askText('q_us_share', {
        placeholder: 'z. B. 15',
        validate: function (v) { return /^\d{1,3}\s*%?$/.test(v) ? '' : 'Bitte eine Zahl von 0 bis 100.'; },
        transform: function (v) { return v.replace(/[^\d]/g, ''); }
      }, done); } },

    { bot: 'Übst du Tätigkeiten als Architekt/Ingenieur mit Bauüberwachung, Anlage-/Vermögensberatung oder Planung von Waffensystemen bzw. kerntechnischen Anlagen aus?',
      render: function (done) { askChoice('q_excl', YESNO(), done); } },
    { skipIf: function () { return data.q_excl !== 'yes'; },
      bot: 'Alles klar. Diese Tätigkeiten sind im Standardtarif ausgeschlossen — wir leiten dich an ein passendes Sonderkonzept weiter. Deine Anfrage kannst du trotzdem absenden.',
      render: function (done) { done(); } },

    { bot: 'Fast geschafft. Jetzt nur noch deine Daten für die Anfrage. Welche Rechtsform hast du?',
      render: function (done) { askChoice('legalForm', [
        { value: 'Freiberufler:in', label: 'Freiberufler:in' },
        { value: 'Einzelunternehmen', label: 'Einzelunternehmen' },
        { value: 'GbR', label: 'GbR' },
        { value: 'UG (haftungsbeschränkt)', label: 'UG (haftungsbeschränkt)' },
        { value: 'GmbH', label: 'GmbH' },
        { value: 'Sonstige', label: 'Sonstige' }
      ], done); } },
    { bot: 'Gibt es einen Firmen- oder Unternehmensnamen?',
      render: function (done) { askText('company', { placeholder: 'Firmenname (optional)', optional: true }, done); } },
    { bot: 'Wie sprechen wir dich an?',
      render: function (done) { askChoice('salutation', [
        { value: 'Frau', label: 'Frau' },
        { value: 'Herr', label: 'Herr' },
        { value: 'Divers', label: 'Divers' },
        { value: '', label: 'Keine Angabe' }
      ], done); } },
    { bot: 'Wie heißt du mit Vornamen?',
      render: function (done) { askText('firstName', { placeholder: 'Vorname' }, done); } },
    { bot: 'Und der Nachname?',
      render: function (done) { askText('lastName', { placeholder: 'Nachname' }, done); } },
    { bot: 'An welche E-Mail sollen wir das Angebot schicken?',
      render: function (done) { askText('email', {
        placeholder: 'name@mail.de',
        validate: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Bitte eine gültige E-Mail-Adresse.'; }
      }, done); } },
    { bot: 'Telefon oder Mobil, falls Rückfragen? Kannst du auch überspringen.',
      render: function (done) { askText('phone', { placeholder: 'Telefon / Mobil (optional)', optional: true }, done); } },
    { bot: 'Webseite oder Social-Media-Profil zur Verifikation?',
      render: function (done) { askText('website', { placeholder: 'z. B. instagram.com/… (optional)', optional: true }, done); } },
    { bot: 'PLZ und Ort?',
      render: function (done) { askText('city', { placeholder: 'PLZ, Ort (optional)', optional: true }, done); } },
    // (No "Wo ist dein Sitz?" step any more — the gate above already settled
    // that, and offering EU/EWR here would let the answer contradict it.
    // data.country stays 'DE'.)
    { bot: 'Welche Laufzeit hättest du gern?',
      render: function (done) { askChoice('term', [
        { value: '1', label: '1 Jahr (autom. Verlängerung)' },
        { value: '3', label: '3 Jahre' }
      ], done); } },
    { bot: 'Und das Zahlungsintervall?',
      render: function (done) { askChoice('interval', [
        { value: 'yearly', label: 'Jährlich (ohne Zuschlag)' },
        { value: 'halfyearly', label: 'Halbjährlich' },
        { value: 'quarterly', label: 'Vierteljährlich' }
      ], done); } },
    { bot: 'Ab wann soll die Versicherung laufen?',
      render: function (done) { askText('startDate', { placeholder: 'sofort oder TT.MM.JJJJ (optional)', optional: true }, done); } },

    { bot: 'Perfekt. Kurz dein Überblick:',
      render: function (done) { showReview(); done(); } },
    { bot: 'Zum Absenden bestätige bitte noch die drei Pflichthinweise:',
      render: function () { askConsents(); } }   // terminal: submit takes over
  ];

  /* --- Engine ------------------------------------------------------------- */
  // Walks a step list. A step advances only when its render() calls done(), so
  // a branch that never calls it (abroadFlow) simply ends the conversation.
  function runSteps(steps) {
    var idx = -1;
    (function next() {
      idx++;
      if (idx >= steps.length) return;
      var step = steps[idx];
      if (step.skipIf && step.skipIf()) { next(); return; }
      botSay(step.bot, function () { step.render(next); });
    })();
  }

  /* --- Dropdown, one-time Germany note, and kickoff ----------------------- */
  // The chat is opt-in: it lives inside <details id="insuranceDrop">, so while
  // that is closed its content is display:none and nothing runs. Opening it
  // raises the note once (Markel Pro Media is a German-law product, so an
  // artist registered abroad should hear that before answering ten questions)
  // and the bot starts talking as soon as the note is away. The note is
  // informational only: the funnel's own first step is the Germany gate and
  // routes a "no" into the § 12.7 branch.
  var drop = document.getElementById('insuranceDrop');
  var note = document.getElementById('insuranceNote');
  var noteSeen = false;
  var noteDone = !(drop && note);   // no dropdown/note on the page: nothing to wait for

  var started = false;
  function start() {
    if (started || !noteDone) return;   // never talk underneath the open note
    started = true;
    runSteps(STEPS);
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
  function dismissNote() { noteDone = true; closeNote(); start(); }

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
  if (drop) {
    drop.addEventListener('toggle', function () {
      if (!drop.open) return;
      if (!noteSeen) { showNote(); return; }
      start();
    });
  }

  // Kick off once the chat scrolls into view, so the first lines don't fire
  // far above the fold (and it feels like the bot greets you when you arrive).
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { start(); if (started) io.disconnect(); } });
    }, { threshold: 0.35 });
    io.observe(chat);
  } else {
    start();
  }
})();
