/* ===========================================================================
   Insurance funnel — Markel Pro Media (Berufshaftpflicht).
   - Gate: shown to German-language visitors only (?funnel=1 forces on, =0 off).
   - Step 1: live, clearly-non-binding premium ESTIMATE from the selections.
   - Step 2: risk questions with conditional detail fields.
   - Step 3: master data + consents -> qualified lead POST /api/funnel.
   The estimate is a transparent heuristic for order-of-magnitude only; it is
   not a real Markel rate. The binding premium comes from Markel after review.
   =========================================================================== */
(function () {
  var section = document.getElementById('versicherung');
  var form = document.getElementById('insuranceFunnel');
  if (!section || !form) return;

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
  if (forceOff || (!force && !isGerman())) return;   // stays hidden, unwired

  section.hidden = false;

  // Reveal the section's content directly. main.js's global scroll-reveal
  // observer registered these targets while the section was still display:none,
  // so it can't be relied on to re-fire once we unhide them (and the tall form
  // never reaches its visibility threshold). The section sits well below the
  // fold, so revealing immediately costs no visible "pop".
  section.querySelectorAll('[data-animate], [data-stagger]').forEach(function (el) {
    el.classList.add('is-visible');
  });

  /* --- Pricing model (order-of-magnitude estimate only) ------------------- */
  var BASE = { video: 168, design: 156, agency: 192, text: 150, music: 174, consulting: 210 };
  var REV  = { r50: 1.0, r100: 1.35, r250: 1.9, r500: 2.6, r500plus: 3.4 };
  var VSHF = { '300000': 1.0, '500000': 1.18, '1000000': 1.4, '2000000': 1.7, '5000000': 2.1, '10000000': 2.5 };
  var SBF  = { '0': 1.0, '250': 0.95, '500': 0.90, '1000': 0.83 };
  var MOD  = { cyber: 96, eigenschaden: 72, druck: 48, veranstaltung: 84, doe: 60 };

  var eur = (typeof Intl !== 'undefined' && Intl.NumberFormat)
    ? new Intl.NumberFormat('de-DE')
    : { format: function (n) { return String(n); } };
  function euro(n) { return eur.format(Math.round(n)) + ' €'; }

  function val(name) {
    var el = form.querySelector('input[name="' + name + '"]:checked, select[name="' + name + '"]');
    return el ? el.value : '';
  }
  function modules() {
    return Array.prototype.slice
      .call(form.querySelectorAll('input[name="module"]:checked'))
      .map(function (el) { return el.value; });
  }

  function estimate() {
    var prof = val('prof');
    var rev = val('revenue');
    if (!prof || !rev || !BASE[prof] || !REV[rev]) return { valid: false };

    var vsh = val('vsh') || '1000000';
    var sb = val('sb') || '0';
    var annual = BASE[prof] * REV[rev] * (VSHF[vsh] || 1) * (SBF[sb] || 1);

    if (val('bhp') === 'yes') {
      var bs = val('bhpsum') || '3000000';
      annual += (bs === '5000000' ? 130 : 95) * REV[rev];
    }
    modules().forEach(function (m) { annual += (MOD[m] || 0); });

    annual = Math.max(120, Math.round(annual));
    return { valid: true, annual: annual, monthly: Math.round(annual / 12), vsh: vsh, sb: sb };
  }

  var priceEl = document.getElementById('funPrice');
  var basisEl = document.getElementById('funBasis');
  var PROF_LABEL = {
    video: 'Video, Film & Content', design: 'Grafik, Web & Design', agency: 'Marketing- & Medienagentur',
    text: 'Text, Redaktion & Verlag', music: 'Musik, Audio & Event', consulting: 'Beratung / Dienstleistung'
  };

  function coverText(e) {
    var parts = ['VSH ' + euro(e.vsh), 'SB ' + euro(e.sb)];
    if (val('bhp') === 'yes') parts.push('inkl. BHP ' + (val('bhpsum') === '5000000' ? '5 Mio' : '3 Mio'));
    var m = modules().length;
    if (m) parts.push('+' + m + ' ' + (m === 1 ? 'Baustein' : 'Bausteine'));
    return parts.join(' · ');
  }

  function renderPrice() {
    var e = estimate();
    if (!e.valid) {
      priceEl.className = 'funnel__price funnel__price--empty';
      priceEl.innerHTML = '<span class="funnel__price-main">Wähle Bereich &amp; Umsatz</span>';
      basisEl.textContent = 'Sobald Berufsfeld und Umsatz gesetzt sind, rechnen wir dir eine grobe Größenordnung aus.';
      return;
    }
    priceEl.className = 'funnel__price';
    priceEl.innerHTML =
      '<span class="funnel__price-main">ca. ' + euro(e.annual) + '</span>' +
      '<span class="funnel__price-per">/ Jahr</span>' +
      '<span class="funnel__price-alt">≈ ' + euro(e.monthly) + ' / Monat</span>';
    basisEl.textContent = coverText(e) + '. Unverbindliche Schätzung, keine verbindliche Markel-Prämie.';
  }

  function renderReview() {
    var e = estimate();
    var set = function (key, txt) {
      var el = form.querySelector('[data-review="' + key + '"]');
      if (el) el.textContent = txt;
    };
    set('prof', PROF_LABEL[val('prof')] || '—');
    set('cover', e.valid ? coverText(e) : '—');
    set('price', e.valid ? ('ca. ' + euro(e.annual) + ' / Jahr (≈ ' + euro(e.monthly) + ' / Monat)') : '—');
  }

  /* --- Conditional reveals ------------------------------------------------ */
  // Route programmatic scroll through Lenis when the smooth-scroll layer is
  // active (native scrollTo fights it), matching how main.js scrolls.
  function scrollToY(top) {
    if (window.lenis && window.lenis.scrollTo) window.lenis.scrollTo(top, { offset: 0 });
    else window.scrollTo({ top: top, behavior: 'smooth' });
  }
  function funnelTop() { return section.getBoundingClientRect().top + window.pageYOffset - 90; }

  function openDetail(el, open) { if (el) el.classList.toggle('is-open', !!open); }

  function syncConditionals() {
    // BHP coverage sum
    openDetail(document.getElementById('funBhpDetail'), val('bhp') === 'yes');

    // Step-2 "Ja" detail blocks
    form.querySelectorAll('.funnel__detail[data-detail-for]').forEach(function (d) {
      var name = d.getAttribute('data-detail-for');
      var trigger = d.getAttribute('data-detail-value') || 'yes';
      openDetail(d, val(name) === trigger);
    });

    // Vorversicherung question only when NOT a startup
    var prevQ = form.querySelector('[data-only-when="q_startup=no"]');
    if (prevQ) {
      var show = val('q_startup') === 'no';
      prevQ.hidden = !show;
      if (!show) {
        // clear the answer so a hidden question can't block validation
        form.querySelectorAll('input[name="q_prev"]').forEach(function (i) { i.checked = false; });
        openDetail(form.querySelector('.funnel__detail[data-detail-for="q_prev"]'), false);
      }
    }

    // Activity-exclusion warning
    var exclNote = document.getElementById('funExclNote');
    if (exclNote) exclNote.hidden = val('q_excl') !== 'yes';
  }

  /* --- Step navigation ---------------------------------------------------- */
  var panels = Array.prototype.slice.call(form.querySelectorAll('.funnel__panel'));
  var indicators = Array.prototype.slice.call(form.querySelectorAll('.funnel__step'));
  var current = 1;

  function showStep(n) {
    current = n;
    panels.forEach(function (p) { p.classList.toggle('is-active', +p.getAttribute('data-panel') === n); });
    indicators.forEach(function (s) {
      var i = +s.getAttribute('data-step-ind');
      s.classList.toggle('is-active', i === n);
      s.classList.toggle('is-done', i < n);
    });
    if (n === 3) renderReview();
    // Bring the funnel header into view so the user doesn't lose the context.
    var top = funnelTop();
    if (window.pageYOffset > top || n > 1) scrollToY(top);
  }

  function note(id, msg) {
    var el = document.getElementById(id);
    if (!el) return;
    el.className = 'funnel__note' + (msg ? ' funnel__note--error' : '');
    el.textContent = msg || '';
  }

  function validateStep1() {
    if (!val('prof')) return 'Bitte wähle deinen Hauptbereich.';
    if (!val('revenue')) return 'Bitte gib deinen ungefähren Jahresnettoumsatz an.';
    return '';
  }
  function validateStep2() {
    var required = ['q_claims', 'q_known', 'q_startup', 'q_us', 'q_excl'];
    if (val('q_startup') === 'no') required.push('q_prev');
    for (var i = 0; i < required.length; i++) {
      if (!val(required[i])) return 'Bitte beantworte alle Risikofragen.';
    }
    if (val('q_claims') === 'yes' && !form.querySelector('[name="q_claims_detail"]').value.trim())
      return 'Bitte beschreibe die Vorschäden kurz.';
    if (val('q_known') === 'yes' && !form.querySelector('[name="q_known_detail"]').value.trim())
      return 'Bitte schildere die bekannten Umstände kurz.';
    return '';
  }

  form.addEventListener('click', function (e) {
    var next = e.target.closest && e.target.closest('[data-next]');
    var prev = e.target.closest && e.target.closest('[data-prev]');
    if (next) {
      var err = current === 1 ? validateStep1() : validateStep2();
      if (err) { note('funNote' + current, err); return; }
      note('funNote' + current, '');
      showStep(current + 1);
    } else if (prev) {
      note('funNote' + current, '');
      showStep(current - 1);
    }
  });

  /* --- Live updates ------------------------------------------------------- */
  form.addEventListener('change', function () { syncConditionals(); renderPrice(); if (current === 3) renderReview(); });
  form.addEventListener('input', function (e) {
    if (e.target && e.target.type === 'number') renderPrice();
  });

  /* --- Submit ------------------------------------------------------------- */
  function fieldVal(name) {
    var el = form.querySelector('[name="' + name + '"]');
    return el ? String(el.value || '').trim() : '';
  }
  function validEmail(s) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s); }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (current !== 3) return;

    var first = fieldVal('firstName'), last = fieldVal('lastName'), email = fieldVal('email');
    if (!first || !last) return note('funNote3', 'Bitte Vor- und Nachnamen angeben.');
    if (!validEmail(email)) return note('funNote3', 'Bitte eine gültige E-Mail-Adresse angeben.');
    if (!form.querySelector('[name="c_vvg"]').checked ||
        !form.querySelector('[name="c_avb"]').checked ||
        !form.querySelector('[name="c_dsgvo"]').checked) {
      return note('funNote3', 'Bitte bestätige die drei Pflichthinweise, um fortzufahren.');
    }
    note('funNote3', '');

    var e2 = estimate();
    var payload = {
      profession: val('prof'),
      revenueBand: val('revenue'),
      vshSum: val('vsh'),
      deductible: val('sb'),
      bhp: val('bhp'),
      bhpSum: val('bhp') === 'yes' ? val('bhpsum') : '',
      modules: modules(),
      estimateAnnual: e2.valid ? e2.annual : null,
      risk: {
        priorClaims: val('q_claims'), priorClaimsDetail: fieldVal('q_claims_detail'),
        knownCircumstances: val('q_known'), knownCircumstancesDetail: fieldVal('q_known_detail'),
        startup: val('q_startup'),
        priorInsurance: val('q_prev'),
        priorInsurer: fieldVal('q_prev_insurer'), priorEnd: fieldVal('q_prev_end'), priorReason: fieldVal('q_prev_reason'),
        usCanada: val('q_us'), usShare: fieldVal('q_us_share'),
        excludedActivity: val('q_excl')
      },
      legalForm: fieldVal('legalForm'),
      company: fieldVal('company'),
      salutation: fieldVal('salutation'),
      firstName: first,
      lastName: last,
      email: email,
      phone: fieldVal('phone'),
      website: fieldVal('website'),
      city: fieldVal('city'),
      country: fieldVal('country'),
      term: fieldVal('term'),
      interval: fieldVal('interval'),
      startDate: fieldVal('startDate')
    };

    var submit = document.getElementById('funSubmit');
    submit.disabled = true;
    note('funNote3', '');
    var noteEl = document.getElementById('funNote3');
    noteEl.className = 'funnel__note';
    noteEl.textContent = 'Wird gesendet…';

    function done() {
      var ref = 'NIM-' + Date.now().toString(36).toUpperCase().slice(-6);
      var refEl = document.getElementById('funDoneRef');
      if (refEl) refEl.textContent = 'Referenz: ' + ref;
      noteEl.textContent = '';
      form.classList.add('is-sent');
      scrollToY(funnelTop());
    }

    fetch('/api/funnel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function (r) { if (!r.ok) throw new Error('bad'); return r.json(); })
      .then(done)
      .catch(function () {
        // No backend present (e.g. static preview) — still confirm so the demo
        // flow completes; a real deploy has /api/funnel wired.
        if (/^(localhost|127\.|0\.0\.0\.0)/.test(window.location.hostname) || window.location.protocol === 'file:') {
          done();
          return;
        }
        submit.disabled = false;
        noteEl.className = 'funnel__note funnel__note--error';
        noteEl.textContent = 'Hat gerade nicht geklappt. Schreib uns einfach an hello@nimmersatt.fyi.';
      });
  });

  /* --- Init --------------------------------------------------------------- */
  syncConditionals();
  renderPrice();
})();
