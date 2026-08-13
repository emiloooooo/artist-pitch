/* ============================================================================
   NIMMERSATT — Contract explorer (contract.html)

   Renders window.CONTRACT_DATA into 21 expandable sections. Jobs:
     · per-section plain-language summary, with the verbatim German underneath
     · global Summary / Full-text mode + expand-all
     · summary language switch (DE / EN) — the verbatim text stays German
     · sidebar index with scrollspy, search filter, mobile sheet
     · deep links (#p12) and download-arrival note (?from=download)

   Dependency-free, same vanilla style as js/main.js.
   ========================================================================== */

(function () {
  "use strict";

  var DATA = window.CONTRACT_DATA;
  var root = document.getElementById("contractSections");
  if (!DATA || !root) return;

  var indexList = document.getElementById("contractIndex");
  var LS_LANG = "nimmersatt.contract.lang";

  /* Summary language. Verbatim clauses are always German. */
  var lang = "de";
  try {
    var saved = window.localStorage.getItem(LS_LANG);
    if (saved === "de" || saved === "en") lang = saved;
  } catch (e) {}

  var LABELS = {
    de: {
      keys: "Kernpunkte",
      summary: "Zusammenfassung",
      openFull: "Originaltext anzeigen",
      closeFull: "Originaltext ausblenden",
      original: "Originaltext (verbindlich)",
      notBinding: "Zusammenfassung — nicht verbindlich",
      flag: "Genau lesen",
      langName: "German"
    },
    en: {
      keys: "Key points",
      summary: "Summary",
      openFull: "Show original wording",
      closeFull: "Hide original wording",
      original: "Original wording (binding, German)",
      notBinding: "Summary — not legally binding",
      flag: "Read closely",
      langName: "English"
    }
  };

  function t(key) { return LABELS[lang][key]; }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  /* ---------------------------------------------------------------------
     Masthead meta
     ------------------------------------------------------------------ */
  (function meta() {
    var rev = document.querySelector("[data-contract-revision]");
    var count = document.querySelector("[data-contract-count]");
    if (rev) rev.textContent = DATA.meta.revision;
    if (count) count.textContent = "§ 0 – § " + DATA.sections[DATA.sections.length - 1].no;
  })();

  /* ---------------------------------------------------------------------
     Build one section card
     ------------------------------------------------------------------ */
  function buildSection(sec, i) {
    var art = el("article", "csec");
    art.id = sec.id;
    art.setAttribute("data-id", sec.id);

    /* --- header (click target) --- */
    var h = el("h2", "csec__head");
    var btn = el("button", "csec__toggle");
    btn.type = "button";
    btn.setAttribute("aria-expanded", "true");
    btn.setAttribute("aria-controls", sec.id + "-panel");

    btn.appendChild(el("span", "csec__no", "§ " + sec.no));

    var titleWrap = el("span", "csec__titlewrap");
    titleWrap.appendChild(el("span", "csec__title", sec.title[lang]));
    if (sec.flag) titleWrap.appendChild(el("span", "csec__flag", t("flag")));
    btn.appendChild(titleWrap);

    var chev = el("span", "csec__chev");
    chev.setAttribute("aria-hidden", "true");
    btn.appendChild(chev);

    h.appendChild(btn);
    art.appendChild(h);

    /* --- animated wrapper --- */
    var wrap = el("div", "csec__panelwrap");
    var panel = el("div", "csec__panel");
    panel.id = sec.id + "-panel";

    /* key points */
    if (sec.key && sec.key[lang] && sec.key[lang].length) {
      var keys = el("ul", "csec__keys");
      sec.key[lang].forEach(function (k) { keys.appendChild(el("li", null, k)); });
      panel.appendChild(keys);
    }

    /* summary */
    var sumWrap = el("div", "csec__summary");
    sumWrap.appendChild(el("p", "csec__summary-tag", t("notBinding")));
    sumWrap.appendChild(el("p", "csec__summary-text", sec.summary[lang]));
    panel.appendChild(sumWrap);

    /* --- original wording --- */
    var full = el("div", "csec__full");
    var fullBtn = el("button", "csec__fulltoggle");
    fullBtn.type = "button";
    fullBtn.setAttribute("aria-expanded", "false");
    fullBtn.setAttribute("aria-controls", sec.id + "-full");
    fullBtn.appendChild(el("span", "csec__fulltoggle-label", t("openFull")));
    var fchev = el("span", "csec__fulltoggle-chev", "▾");
    fchev.setAttribute("aria-hidden", "true");
    fullBtn.appendChild(fchev);
    full.appendChild(fullBtn);

    var clausesWrap = el("div", "csec__clauseswrap");
    var clauses = el("div", "csec__clauses");
    clauses.id = sec.id + "-full";
    clauses.setAttribute("lang", "de");

    clauses.appendChild(el("p", "csec__clauses-tag", t("original")));

    sec.clauses.forEach(function (c) {
      var box = el("div", "cclause");
      var p = el("p", "cclause__body");
      p.appendChild(el("span", "cclause__no", c.no));
      p.appendChild(document.createTextNode(" " + c.text));
      box.appendChild(p);

      if (c.bullets) {
        var ul = el("ul", "cclause__list");
        c.bullets.forEach(function (b) { ul.appendChild(el("li", null, b)); });
        box.appendChild(ul);
      }
      if (c.lettered) {
        var lul = el("ul", "cclause__list cclause__list--lettered");
        c.lettered.forEach(function (b) { lul.appendChild(el("li", null, b)); });
        box.appendChild(lul);
      }
      if (c.ordered) {
        var ol = el("ol", "cclause__list cclause__list--ordered");
        c.ordered.forEach(function (b) { ol.appendChild(el("li", null, b)); });
        box.appendChild(ol);
      }
      if (c.after) box.appendChild(el("p", "cclause__after", c.after));

      clauses.appendChild(box);
    });

    clausesWrap.appendChild(clauses);
    full.appendChild(clausesWrap);
    panel.appendChild(full);

    wrap.appendChild(panel);
    art.appendChild(wrap);

    /* open by default: the page should read as the whole summarised contract */
    art.classList.add("is-open");

    /* --- interactions --- */
    btn.addEventListener("click", function () { toggleSection(art); });
    fullBtn.addEventListener("click", function () { toggleFull(art); });

    return art;
  }

  function toggleSection(art, force) {
    var open = force != null ? force : !art.classList.contains("is-open");
    art.classList.toggle("is-open", open);
    var btn = art.querySelector(".csec__toggle");
    if (btn) btn.setAttribute("aria-expanded", open ? "true" : "false");
    /* closing the card also closes its original-wording block */
    if (!open) toggleFull(art, false);
    syncToggleAll();
  }

  function toggleFull(art, force) {
    var open = force != null ? force : !art.classList.contains("is-full");
    art.classList.toggle("is-full", open);
    var btn = art.querySelector(".csec__fulltoggle");
    if (btn) {
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      var label = btn.querySelector(".csec__fulltoggle-label");
      if (label) label.textContent = open ? t("closeFull") : t("openFull");
    }
  }

  /* ---------------------------------------------------------------------
     Render everything
     ------------------------------------------------------------------ */
  var cards = [];

  function render() {
    root.textContent = "";
    if (indexList) indexList.textContent = "";
    cards = [];

    DATA.sections.forEach(function (sec, i) {
      var card = buildSection(sec, i);
      root.appendChild(card);
      cards.push(card);

      if (indexList) {
        var li = el("li", "cdoc-index__item");
        li.setAttribute("data-for", sec.id);
        var a = el("a", "cdoc-index__link");
        a.href = "#" + sec.id;
        a.appendChild(el("span", "cdoc-index__no", "§ " + sec.no));
        a.appendChild(el("span", "cdoc-index__label", sec.title[lang]));
        li.appendChild(a);
        indexList.appendChild(li);
      }
    });

    renderTldr();
    spy();
  }

  function renderTldr() {
    var host = document.querySelector("[data-tldr]");
    if (!host || !DATA.meta.tldr) return;
    host.textContent = "";
    DATA.meta.tldr[lang].forEach(function (line) {
      host.appendChild(el("li", null, line));
    });
  }

  /* ---------------------------------------------------------------------
     Controls: mode / language / expand-all
     ------------------------------------------------------------------ */
  var bar = document.getElementById("cdocBar");
  var toggleAllBtn = document.getElementById("cdocToggleAll");

  function setMode(mode) {
    if (bar) {
      Array.prototype.forEach.call(bar.querySelectorAll("[data-mode]"), function (b) {
        var on = b.getAttribute("data-mode") === mode;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      });
    }
    cards.forEach(function (art) {
      toggleSection(art, true);
      toggleFull(art, mode === "full");
    });
    syncToggleAll();
  }

  function setLang(next) {
    if (next === lang) return;
    lang = next;
    try { window.localStorage.setItem(LS_LANG, lang); } catch (e) {}

    if (bar) {
      Array.prototype.forEach.call(bar.querySelectorAll("[data-lang]"), function (b) {
        var on = b.getAttribute("data-lang") === lang;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      });
    }
    var langName = document.querySelector("[data-lang-name]");
    if (langName) langName.textContent = LABELS[lang].langName;

    /* remember what was open, re-render, restore */
    var openIds = {}, fullIds = {};
    cards.forEach(function (c) {
      openIds[c.id] = c.classList.contains("is-open");
      fullIds[c.id] = c.classList.contains("is-full");
    });
    render();
    cards.forEach(function (c) {
      toggleSection(c, !!openIds[c.id]);
      if (openIds[c.id]) toggleFull(c, !!fullIds[c.id]);
    });
    applyFilter(searchInput ? searchInput.value : "");
  }

  function syncToggleAll() {
    if (!toggleAllBtn) return;
    var anyOpen = cards.some(function (c) { return c.classList.contains("is-open"); });
    toggleAllBtn.textContent = anyOpen ? "Collapse all" : "Expand all";
    toggleAllBtn.setAttribute("aria-pressed", anyOpen ? "true" : "false");
  }

  if (bar) {
    bar.addEventListener("click", function (e) {
      var b = e.target.closest ? e.target.closest("button") : null;
      if (!b || !bar.contains(b)) return;
      if (b.hasAttribute("data-mode")) setMode(b.getAttribute("data-mode"));
      else if (b.hasAttribute("data-lang")) setLang(b.getAttribute("data-lang"));
    });
  }

  if (toggleAllBtn) {
    toggleAllBtn.addEventListener("click", function () {
      var anyOpen = cards.some(function (c) { return c.classList.contains("is-open"); });
      cards.forEach(function (c) { toggleSection(c, !anyOpen); });
      syncToggleAll();
    });
  }

  /* ---------------------------------------------------------------------
     Search — filters both the index and the section list
     ------------------------------------------------------------------ */
  var searchInput = document.getElementById("cdocSearch");
  var noHits = document.getElementById("cdocNoHits");

  function haystack(sec) {
    var parts = [sec.no, sec.title.de, sec.title.en, sec.summary.de, sec.summary.en];
    if (sec.key) parts = parts.concat(sec.key.de, sec.key.en);
    sec.clauses.forEach(function (c) {
      parts.push(c.no, c.text);
      if (c.bullets) parts = parts.concat(c.bullets);
      if (c.lettered) parts = parts.concat(c.lettered);
      if (c.ordered) parts = parts.concat(c.ordered);
      if (c.after) parts.push(c.after);
    });
    return parts.join(" ").toLowerCase();
  }

  var HAY = DATA.sections.map(haystack);

  function applyFilter(raw) {
    var q = (raw || "").trim().toLowerCase();
    var hits = 0;

    DATA.sections.forEach(function (sec, i) {
      var match = !q || HAY[i].indexOf(q) !== -1;
      if (match) hits++;
      var card = cards[i];
      if (card) card.hidden = !match;
      var item = indexList && indexList.querySelector('[data-for="' + sec.id + '"]');
      if (item) item.hidden = !match;
    });

    if (noHits) noHits.hidden = hits !== 0;
    root.classList.toggle("is-filtered", !!q);
  }

  if (searchInput) {
    searchInput.addEventListener("input", function () { applyFilter(searchInput.value); });
    searchInput.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { searchInput.value = ""; applyFilter(""); }
    });
  }

  /* ---------------------------------------------------------------------
     Scrollspy — highlight the section you are reading
     ------------------------------------------------------------------ */
  var spyObserver = null;
  function spy() {
    if (!indexList || !("IntersectionObserver" in window)) return;
    if (spyObserver) spyObserver.disconnect();

    spyObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        Array.prototype.forEach.call(indexList.querySelectorAll("[data-for]"), function (li) {
          li.classList.toggle("is-current", li.getAttribute("data-for") === id);
        });
      });
    }, { rootMargin: "-20% 0px -70% 0px", threshold: 0 });

    cards.forEach(function (c) { spyObserver.observe(c); });
  }

  /* ---------------------------------------------------------------------
     Mobile: the sidebar becomes a sheet
     ------------------------------------------------------------------ */
  (function mobileSheet() {
    var side = document.querySelector(".cdoc__side");
    if (!side) return;

    var open = el("button", "cdoc-sheetbtn", "Contents");
    open.type = "button";
    open.setAttribute("aria-expanded", "false");
    open.setAttribute("aria-controls", "cdocSide");
    side.id = "cdocSide";

    var backdrop = el("div", "cdoc-sheet-backdrop");
    backdrop.hidden = true;

    var close = el("button", "cdoc-sheet-close", "Close");
    close.type = "button";
    side.insertBefore(close, side.firstChild);

    document.body.appendChild(open);
    document.body.appendChild(backdrop);

    function setOpen(isOpen) {
      document.body.classList.toggle("cdoc-sheet-open", isOpen);
      side.classList.toggle("is-sheet-open", isOpen);
      backdrop.hidden = !isOpen;
      open.setAttribute("aria-expanded", isOpen ? "true" : "false");
      if (isOpen) {
        var first = side.querySelector(".cdoc-sheet-close");
        if (first) first.focus();
      } else {
        open.focus();
      }
    }

    open.addEventListener("click", function () { setOpen(true); });
    close.addEventListener("click", function () { setOpen(false); });
    backdrop.addEventListener("click", function () { setOpen(false); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && document.body.classList.contains("cdoc-sheet-open")) setOpen(false);
    });
    /* picking a section closes the sheet */
    side.addEventListener("click", function (e) {
      var a = e.target.closest ? e.target.closest("a[href^='#']") : null;
      if (a) setOpen(false);
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 1000) setOpen(false);
    }, { passive: true });
  })();

  /* ---------------------------------------------------------------------
     Deep links + arrival from a download link
     ------------------------------------------------------------------ */
  function focusFromHash() {
    var id = (window.location.hash || "").replace("#", "");
    if (!id) return;
    var card = document.getElementById(id);
    if (!card || !card.classList.contains("csec")) return;
    toggleSection(card, true);
    /* let layout settle before scrolling to it */
    window.setTimeout(function () {
      card.scrollIntoView({ behavior: "auto", block: "start" });
    }, 60);
  }

  window.addEventListener("hashchange", focusFromHash);

  (function arrival() {
    var note = document.getElementById("cdocDownloaded");
    if (!note) return;
    if (/[?&]from=download/.test(window.location.search)) note.hidden = false;
  })();

  /* ---------------------------------------------------------------------
     Go
     ------------------------------------------------------------------ */
  var langName = document.querySelector("[data-lang-name]");
  if (langName) langName.textContent = LABELS[lang].langName;
  if (bar) {
    Array.prototype.forEach.call(bar.querySelectorAll("[data-lang]"), function (b) {
      var on = b.getAttribute("data-lang") === lang;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  render();
  syncToggleAll();
  focusFromHash();
})();
