/* ===========================================================================
   Language layer — German (default) / English, switched live, no reload.

   How it works
   - The German copy stays in index.html and is the source of truth.
   - EN below is keyed by the data-i18n / data-i18n-html / data-i18n-attr
     attributes in the markup. Editing English = editing this file only.
   - On first paint the German is already there, so the default language never
     flashes. Switching swaps text in place and remembers the choice.
   - Order: ?lang=en|de  ->  saved choice  ->  browser language  ->  de.
   =========================================================================== */
(function () {
  'use strict';

  var STORE = 'nsat-lang';
  var LANGS = { de: 'Deutsch', en: 'English' };

  /* --- English copy ------------------------------------------------------- */
  var EN = {
    /* chrome */
    'pre.enter': 'Tap to enter',
    'nav.home': 'Nimmersatt, home',
    'nav.contact': 'Contact',
    'nav.menu': 'Open menu',

    /* hero */
    'hero.sub': 'You found your own visual language a long time ago. We built the infrastructure that protects it, makes it bigger and brings you work, without bending you or your art out of shape.',
    'hero.m1': 'Artist Management',
    'hero.m2': 'Visual Production',
    'hero.m3': 'Creative Community',

    /* about */
    'about.lead1': 'At nimmersatt we believe<br />in one simple truth:',
    'about.p1': 'The ideas we take in shape what we make. That is why every project starts with culture, not with content. Out of research, real insights and decoding a whole generation, we read what catches fire on its own and how the next generation actually works. That is how we bring brands in from the inside: they play along honestly instead of just broadcasting.',
    'about.p2': 'We are a creative studio, an artist management and a production company in one. Instead of forcing projects into rigid agency structures, we build a dedicated team for every job from our circle of directors, designers, photographers, strategists, editors, developers and producers. Whether a project needs a single head or a full team from start to finish: the team is built around the brief, not the other way around.',
    'about.p3': 'In our network, old hands from the industry meet the next generation of creative voices. We put experienced heads together with young talent, and out of that comes work that combines craft with a fresh perspective and holds up at any scale and any budget.',
    'about.s1': 'What we make mirrors what we take in. We built a collective of Berlin’s strongest visual minds, found on the street and in the networks of the city.',
    'about.s2': 'Our artists are self-taught. Instead of university there was raw trial and error, and outdated processes mean nothing to them.',
    'about.s3': 'We do not just manage talent, we run the whole process, from the first input to the finished, cinematic result. The interface between established brands and the new generation.',
    'about.s4': 'Concept and production from one source. Versatile, precise, at any scale:',
    'about.svcLabel': 'What we do',
    'svc.1': 'Decoding generations',
    'svc.2': 'Brand identity',
    'svc.3': 'Creative direction',
    'svc.4': 'Personal branding',
    'svc.5': 'Treatment design',
    'svc.6': 'Fashion editorials',
    'svc.7': 'Sourcing & scouting',
    'svc.8': 'Graphic design',
    'svc.9': 'Motion design',
    'svc.10': 'Lookbooks',
    'svc.11': 'Concept & execution',
    'svc.12': 'Illustration & graphics',
    'svc.13': 'Heritage modernisation',
    'svc.14': 'Web experiences',

    /* workflow tool */
    'work.h': 'One workflow.<br />We’re still on it…',
    'work.lead': 'Our team is pulling night shifts in the backend to make this properly good. As soon as you are on the roster you get your account, and we help you find your people.',
    'work.l1': '01 / Every project in one place',
    'work.vidTitle': 'Nimmersatt workflow tool overview',
    'work.o1h': 'Your overview',
    'work.o1p': 'Every running project sits here with its phase, deadline and team. You always see what is moving, what is waiting and where you are needed right now.',
    'work.o2h': 'Your tasks',
    'work.o2p': 'Briefings turn into clear tasks, with owners and deadlines. You see exactly what Nimmersatt needs from you and what we take off your plate.',
    'work.l2': '02 / Built for the artist side',
    'work.alt1': 'Nimmersatt project dashboard: overview, deadlines and team',
    'work.s1t': 'Task view',
    'work.s1m': 'Briefings · Tasks · Approvals',
    'work.n1h': 'One shared source',
    'work.n1p': 'Files, feedback and approvals live on the project itself. No lost links, no voice notes buried somewhere, no three versions haunting separate chats.',
    'work.alt2': 'Nimmersatt AI assistant creating a task inside the tool',
    'work.s2t': 'AI AGENT',
    'work.s2m': 'STRUCTURE · PLAN · OVERVIEW',
    'work.n2h': 'Your own back office',
    'work.n2p': 'Your account is free. Setup takes a few minutes, and the structure is already there before you walk in. You take care of the work, not of yet another system.',

    /* the three pillars */
    'pil.h': 'Let’s talk about the elephant in the room. Where the hell is the catch?',
    'pil.1n': 'No exclusivity',
    'pil.1d': 'You are not signed away. Your own clients stay your clients, and nobody stops you from working outside the network. We ask for one thing only: anything that touches our name, our references and our contacts runs through us, for as long as we work together and one year beyond. We represent you worldwide, speak to clients with one voice and set your rates so that nobody sells you below your worth.',
    'pil.2n': 'Commission',
    'pil.2d': 'Twenty percent of the net fee, on projects we bring in. Nothing hides behind that. We set your day rate together, and nobody moves it alone, no discount over your head. Your money is there no later than thirty days after the client has paid us. And if a job goes sideways, the crew around you gets paid before anyone argues about the rest.',
    'pil.3n': 'Exit',
    'pil.3d': 'Open-ended, three months probation, then one month’s notice to the end of the month. No shackles, no ten-page exit. Anything already running is finished properly and settled, no matter who gives notice or why. The only thing that outlives the contract: for twelve months you do not take with you the clients we introduced you to.',

    /* contract chat */
    'ind.h': 'But please,<br />see for yourself',
    'ind.lead': 'Or read the 12,428 characters yourself. If you do, set a timer: there is a bet running on the roster about who gets through fastest.',
    'chat.meta': 'reads the whole contract for you',
    'chat.hello': 'Hey! I read the whole Nimmersatt contract so you don’t have to. Ask me anything: commission, exit, your rights, and I’ll keep it short.',
    'chat.ph': 'Ask about commission, exit, your rights…',
    'chat.aria': 'Message the nimmersatt Bot',
    'chat.send': 'Send message',
    'chat.offline': 'I’ve only got the Nimmersatt contract loaded right now — try “Summarize each paragraph of the contract”.',

    /* lead form */
    'lead.title': 'Get on the list',
    'lead.sub': 'Quick intro, then we get in touch',
    'lead.intro': 'We briefly ask for your approximate income because it is the basis for your cover through the German artists’ social insurance fund (Künstlersozialkasse, KSK): your health, long-term care and pension contributions are calculated from it, and through the KSK you only pay about half of them. A rough ballpark is completely enough for us.',
    'lead.first': 'First name',
    'lead.last': 'Last name',
    'lead.period': 'Period',
    'lead.monthly': 'Monthly',
    'lead.yearly': 'Yearly',
    'lead.choose': 'Please choose…',
    'lead.incomeM': 'Approximate income (per month)',
    'lead.incomeY': 'Approximate income (per year)',
    'lead.disclaimer': 'This is voluntary and only a rough self-assessment for our conversation, not an official declaration to the KSK. Please give a realistic figure and no wishful numbers: incorrect or incomplete statements to the Künstlersozialkasse can lead to back payments and, under § 36 KSVG, to a fine. This information does not replace legal or tax advice; only the KSK can give binding statements.',
    'lead.submit': 'Get on the list',
    'lead.doneT': 'Thanks, you’re on the list.',
    'lead.doneP': 'We’ll get back to you. Until then: stay hungry.',
    'lead.errName': 'Please fill in your first and last name.',
    'lead.sending': 'Sending…',
    'lead.errSend': 'That didn’t work just now. Just write to us at hello@nimmersatt.fyi.',

    /* code of conduct */
    'cc.lead': 'Honestly, we all know it… You are what you eat. So don’t eat crap and don’t let anyone sell you any. Stay real, with yourself and with everyone around you.',
    'cc.1l': 'Culture, craft & quality',
    'cc.1a': '<strong>Understand first, then make:</strong> Dive into the brief and into the culture, no empty noise, only work that actually lands with modern communities.',
    'cc.1b': '<strong>Cinematic standard:</strong> Whether strategy, set, design or post, hold a high-end, cinematic standard everywhere, at every budget.',
    'cc.2l': 'Responsibility & respect in the team',
    'cc.2a': '<strong>Think across generations:</strong> Bring experienced heads and young perspectives together, with respect and openness in both directions.',
    'cc.2b': '<strong>Lean execution:</strong> Work directly, without agency ballast, own your part and bring real value to every result.',
    'cc.3l': 'Straight talk & growing together',
    'cc.3a': '<strong>Speak up early:</strong> Say something early when capacity, limits or bottlenecks start to press, before a small thing turns into a production problem.',
    'cc.3b': '<strong>Career, not just calendar:</strong> Stick to clear briefs and deadlines, and use every job to push your portfolio and the work of the collective forward.',
    'cc.signoff': 'Always hungry. Never full.',

    /* collective */
    'ros.h': 'Don’t fight over the crumbs. Let’s bake the cake together.',
    'ros.lead': 'We are not a roster. The people here film each other’s work, lend each other crew and hold the same minimum rate. Nobody fights over the same three jobs, because everyone brings in different ones.',
    'ros.discord': 'connect with the community before you’re even in',
    'ros.contract': 'Contract',
    'ros.contractR': 'the full contract is here to download',
    'ros.pack': 'Package',
    'ros.packR': 'save this one for the call. good of you to look in',
    'ros.expect': 'What we expect from you',
    'ros.p1n': 'Authenticity',
    'ros.p1r': 'just stay yourself',
    'ros.p2n': 'Reliability',
    'ros.p2r': 'trust the freedom',
    'ros.p3n': 'Appetite',
    'ros.p3r': 'make something of it',

    /* clients */
    'cli.h': 'Where your work can end up',

    /* closing */
    'clo.h': 'We read the room before we set the table.',
    'clo.lead': 'We answer. You work.<br />We handle it. You keep going.<br />We negotiate. You create.',
    'clo.1h': 'Land here',
    'clo.1p': 'Thanks for taking the time for nimmersatt, it was a real pleasure. That’s it from my side, from here it’s on you.<br />And that’s it for today. See you soon, hopefully!',
    'clo.1n': 'admin here: thanks, folks, seriously',
    'clo.2h': 'Make your decision',
    'clo.2p': 'If you’re up for it, pull your portfolio together and decide. The files themselves you send via Google Drive, swisstransfer or whatever your thing is.',
    'clo.3h': 'Book your slot',
    'clo.3p': 'Bring questions, feedback and thirty minutes. Our team meets you and goes through every detail.<br />until then: stay hungry, but humble',
    'clo.3cal': 'off to Calendly',
    'clo.cta': 'anything else',
    'doc.h': 'Documents',
    'doc.a1': 'Download artist agreement',
    'doc.a2': 'Download deal package',
    'foot.tag': 'Never full · Never finished',

    /* head */
    'meta.title': 'NIMMERSATT — Your place in the collective',
    'meta.desc': 'An infrastructure that protects your visual language, makes your work bigger and brings you jobs, without bending your creative identity out of shape.'
  };

  /* Documents that exist in both languages. */
  var DOCS = {
    contract: {
      de: { href: 'assets/documents/nimmersatt-vertrag-de.download', name: 'NIMMERSATT-Vertrag-DE.pdf' },
      en: { href: 'assets/documents/nimmersatt-contract-en.download', name: 'NIMMERSATT-Contract-EN.pdf' }
    },
    deal: {
      de: { href: 'assets/documents/nimmersatt-dealpaket-de.download', name: 'NIMMERSATT-Dealpaket-DE.pdf' },
      en: { href: 'assets/documents/nimmersatt-deal-package-en.download', name: 'NIMMERSATT-Deal-Package-EN.pdf' }
    }
  };

  /* --- State -------------------------------------------------------------- */
  function stored() {
    try { return localStorage.getItem(STORE); } catch (_) { return null; }
  }
  function remember(l) {
    try { localStorage.setItem(STORE, l); } catch (_) { /* private mode */ }
  }
  // German is the default for everyone. Deliberately NOT auto-detected from the
  // browser locale: this is a German-first pitch, and a page that silently
  // changes language per visitor is impossible to link to or to check.
  // Explicit choice wins, and it is remembered.
  function initial() {
    var q = /[?&]lang=(de|en)\b/i.exec(window.location.search);
    if (q) return q[1].toLowerCase();
    var s = stored();
    if (s === 'de' || s === 'en') return s;
    return 'de';
  }

  var current = 'de';

  /* --- Applying a language ------------------------------------------------ */
  // The German original is captured lazily the first time an element is
  // translated, so switching back is always byte-identical to the markup.
  function original(el, kind) {
    var slot = '__de_' + kind;
    if (el[slot] === undefined) {
      el[slot] = kind === 'html' ? el.innerHTML : el.textContent;
    }
    return el[slot];
  }
  function originalAttr(el, attr) {
    var slot = '__de_attr_' + attr;
    if (el[slot] === undefined) el[slot] = el.getAttribute(attr);
    return el[slot];
  }

  function t(key) {
    return (current === 'en' && EN[key] !== undefined) ? EN[key] : null;
  }

  function apply(lang) {
    current = (lang === 'en') ? 'en' : 'de';
    var en = current === 'en';

    document.documentElement.lang = current;

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var k = el.getAttribute('data-i18n');
      var de = original(el, 'text');
      el.textContent = (en && EN[k] !== undefined) ? EN[k] : de;
    });

    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      var k = el.getAttribute('data-i18n-html');
      var de = original(el, 'html');
      el.innerHTML = (en && EN[k] !== undefined) ? EN[k] : de;
    });

    // data-i18n-attr="placeholder:chat.ph;aria-label:chat.aria"
    document.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
      el.getAttribute('data-i18n-attr').split(';').forEach(function (pair) {
        var bits = pair.split(':');
        if (bits.length !== 2) return;
        var attr = bits[0].trim(), k = bits[1].trim();
        var de = originalAttr(el, attr);
        var val = (en && EN[k] !== undefined) ? EN[k] : de;
        if (val !== null && val !== undefined) el.setAttribute(attr, val);
      });
    });

    // Bilingual PDFs follow the page language.
    document.querySelectorAll('[data-i18n-doc]').forEach(function (a) {
      var doc = DOCS[a.getAttribute('data-i18n-doc')];
      if (!doc) return;
      var pick = doc[current];
      a.setAttribute('href', pick.href);
      a.setAttribute('download', pick.name);
    });

    // Head: title + description, so shares and tabs match the page.
    document.title = (en && EN['meta.title']) ? EN['meta.title'] : DE_TITLE;
    setMeta('name', 'description', en ? EN['meta.desc'] : DE_DESC);
    setMeta('property', 'og:title', document.title);
    setMeta('property', 'og:description', en ? EN['meta.desc'] : DE_DESC);
    setMeta('property', 'og:locale', en ? 'en_GB' : 'de_DE');
    setMeta('name', 'twitter:title', document.title);
    setMeta('name', 'twitter:description', en ? EN['meta.desc'] : DE_DESC);

    // German-law product (KSK / VVG / SEPA): only shown on the German page.
    document.querySelectorAll('[data-de-only]').forEach(function (el) {
      if (en) el.setAttribute('hidden', '');
      else if (el.getAttribute('data-de-ready') === '1') el.removeAttribute('hidden');
    });

    remember(current);
    document.querySelectorAll('[data-lang-slot]').forEach(paint);
    document.dispatchEvent(new CustomEvent('nsat:langchange', { detail: { lang: current } }));
  }

  function setMeta(attr, name, value) {
    var el = document.querySelector('meta[' + attr + '="' + name + '"]');
    if (el && value) el.setAttribute('content', value);
  }

  var DE_TITLE = document.title;
  var DE_DESC = (function () {
    var m = document.querySelector('meta[name="description"]');
    return m ? m.getAttribute('content') : '';
  })();

  /* --- The switcher ------------------------------------------------------- */
  // One component, mounted into every [data-lang-slot]: a button that opens a
  // small listbox. Both instances (hero + header) stay in sync through apply().
  function build(slot) {
    slot.innerHTML = '';
    slot.classList.add('langswitch');

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'langswitch__btn';
    btn.setAttribute('aria-haspopup', 'listbox');
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = '<span class="langswitch__code"></span><span class="langswitch__caret" aria-hidden="true">↓</span>';

    var list = document.createElement('ul');
    list.className = 'langswitch__menu';
    list.setAttribute('role', 'listbox');
    list.hidden = true;

    Object.keys(LANGS).forEach(function (code) {
      var li = document.createElement('li');
      li.className = 'langswitch__opt';
      li.setAttribute('role', 'option');
      li.tabIndex = -1;
      li.dataset.lang = code;
      li.innerHTML = '<span class="langswitch__optcode">' + code.toUpperCase() + '</span>' +
                     '<span class="langswitch__optname">' + LANGS[code] + '</span>';
      li.addEventListener('click', function () { close(true); apply(code); });
      list.appendChild(li);
    });

    slot.appendChild(btn);
    slot.appendChild(list);

    function open() {
      list.hidden = false;
      slot.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');
      var sel = list.querySelector('[aria-selected="true"]') || list.firstChild;
      if (sel) sel.focus();
    }
    function close(focusBtn) {
      list.hidden = true;
      slot.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
      if (focusBtn) btn.focus();
    }

    btn.addEventListener('click', function () {
      list.hidden ? open() : close(false);
    });
    slot.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !list.hidden) { e.preventDefault(); close(true); return; }
      if (list.hidden) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); open(); }
        return;
      }
      var opts = Array.prototype.slice.call(list.children);
      var i = opts.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') { e.preventDefault(); (opts[i + 1] || opts[0]).focus(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); (opts[i - 1] || opts[opts.length - 1]).focus(); }
      else if (e.key === 'Enter' || e.key === ' ') {
        if (i > -1) { e.preventDefault(); var c = opts[i].dataset.lang; close(true); apply(c); }
      }
    });

    document.addEventListener('click', function (e) {
      if (!slot.contains(e.target) && !list.hidden) close(false);
    });

    paint(slot);
  }

  function paint(slot) {
    var code = slot.querySelector('.langswitch__code');
    if (code) code.textContent = current.toUpperCase();
    var btn = slot.querySelector('.langswitch__btn');
    if (btn) btn.setAttribute('aria-label',
      current === 'en' ? 'Language: English. Change language' : 'Sprache: Deutsch. Sprache wechseln');
    slot.querySelectorAll('.langswitch__opt').forEach(function (li) {
      var on = li.dataset.lang === current;
      li.setAttribute('aria-selected', on ? 'true' : 'false');
      li.classList.toggle('is-current', on);
    });
  }

  /* --- Boot --------------------------------------------------------------- */
  function boot() {
    document.querySelectorAll('[data-lang-slot]').forEach(build);
    apply(initial());
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.nsatLang = {
    get: function () { return current; },
    set: apply,
    t: function (key, fallbackDe) { var v = t(key); return v === null ? fallbackDe : v; }
  };
})();
