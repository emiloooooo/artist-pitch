/* ============================================================================
   NIMMERSATT Deck Builder
   Local-first authoring. No backend, no dependencies, exports one HTML file.
   ========================================================================== */

(function () {
  "use strict";

  var STORAGE_KEY = "nimmersatt.deckBuilder.v2";
  var LEGACY_KEY = "nimmersatt.deckBuilder.v1";

  var deckTypes = {
    agency: {
      no: "01",
      name: "Agency model",
      meta: "General pitch",
      title: "Agency model",
      formHeadline: "Explain the model.",
      formDescription: "For brands and agencies that need to understand what Nimmersatt is, what it can deliver, and why the hybrid model matters.",
      fields: [
        ["headline", "Headline", "Nimmersatt"],
        ["subline", "Intro", "A Berlin artist management: artist booking, career development and creative production."],
        ["proof", "Proof line", "20 artists, 4 partner studios, selected clients across music, fashion and brand."],
        ["cta", "CTA", "Bring us in when the work needs to feel native, not translated."]
      ],
      images: [["hero", "Hero image", "Optional first visual"]]
    },
    caseStudy: {
      no: "02",
      name: "Case study",
      meta: "Project proof",
      title: "Case study",
      formHeadline: "Make proof concrete.",
      formDescription: "A deep-dive for one project: brief, idea, execution, numbers and frames. Strongest when every claim has a proof point.",
      fields: [
        ["project", "Project", "Soyhan"],
        ["client", "Client", "Universal Music"],
        ["headline", "Headline", "A visualizer that scaled into a live show."],
        ["brief", "Brief", "Build a visual identity for an artist on a major label that could carry a release and travel into the live setting."],
        ["execution", "Execution", "A modular visual system across motion, typography and stills, built to be recut for release, shows and merchandise."],
        ["numbers", "Numbers", "6M+ streams, 1,000 images, 50 typefaces, 3 concerts."],
        ["cta", "CTA", "Want the full case?"]
      ],
      images: [["hero", "Hero still", "Main case visual"], ["mood1", "Mood 01", "Supporting frame"], ["mood2", "Mood 02", "Supporting frame"]]
    },
    artistDetail: {
      no: "03A",
      name: "Artist detail",
      meta: "Portfolio deck",
      title: "Artist detail",
      formHeadline: "Frame one artist.",
      formDescription: "For a single artist pitch. The page should feel curated, specific and portfolio-led, not like a roster entry.",
      fields: [
        ["artist", "Artist", "Daniel"],
        ["role", "Role", "3D + VFX"],
        ["headline", "Headline", "Craft that disappears into the cut."],
        ["bio", "Bio", "A 3D and VFX artist who builds impossible shots, brand integrations and visual systems that feel native to the film."],
        ["credits", "Credits", "Charli XCX, Soyhan, 3 Strikes, Nimmersatt in-house."],
        ["cta", "CTA", "Available through Nimmersatt."]
      ],
      images: [["hero", "Artist hero", "Portrait or key visual"], ["mood1", "Portfolio 01", "Selected frame"], ["mood2", "Portfolio 02", "Selected frame"]]
    },
    industry: {
      no: "03B",
      name: "Industry bundle",
      meta: "One scene",
      title: "Industry bundle",
      formHeadline: "Bundle one scene.",
      formDescription: "For fashion, music, automotive or another industry. Pull multiple cases into one confident sector-specific page.",
      fields: [
        ["industry", "Industry", "Fashion"],
        ["headline", "Headline", "Built for the 48-hour window."],
        ["intro", "Intro", "Not one runway film, every fashion case bundled for the next season."],
        ["cases", "Cases", "Berlin Fashion Week, 032c x Cupra, GmbH, David Koma, Ottolinger, Marie Lueder."],
        ["numbers", "Numbers", "4 brands in 2 days, 2 seasons, one repeatable pipeline."],
        ["cta", "CTA", "Bring us in before the next show."]
      ],
      images: [["hero", "Industry hero", "Main industry visual"], ["mood1", "Case visual 01", "Supporting frame"], ["mood2", "Case visual 02", "Supporting frame"]]
    },
    artistIntro: {
      no: "04",
      name: "Artist intro",
      meta: "Fast outreach",
      title: "Artist intro",
      formHeadline: "Send better than a DM.",
      formDescription: "For artists Otto finds quickly. Personal hook first, then Nimmersatt from the artist's side of the table.",
      fields: [
        ["artist", "Artist", "Mira"],
        ["hook", "Personal hook", "We saw your 3 Strikes visuals and the way you treat motion like atmosphere."],
        ["headline", "Headline", "A Berlin studio for artists."],
        ["intro", "Intro", "Nimmersatt is an artist management and production studio. We book artists, build portfolios and create the work around them."],
        ["offer", "Offer", "Booking, management and production in one loop, so the artist is not just placed, but built."],
        ["cta", "CTA", "No pitch, just a chat?"]
      ],
      images: [["hero", "Artist reference", "Image from the artist or reference"], ["mood1", "Nimmersatt proof", "Optional project still"]]
    },
    treatment: {
      no: "05",
      name: "Treatment",
      meta: "Live brief",
      title: "Client treatment",
      formHeadline: "Build the treatment.",
      formDescription: "For an existing request. Mix Nimmersatt structure with client context, mood images and a clear production path.",
      fields: [
        ["client", "Client", "Cupra"],
        ["project", "Project", "Moment"],
        ["clientColor", "Client color", "#6f6f6f", "color"],
        ["headline", "Headline", "The car as the seventh guest."],
        ["understanding", "Understanding", "The ask is not to place a product into a film, but to make the product feel native to the night."],
        ["concept", "Concept", "A camera language that treats the brand object as part of the social architecture: seen, felt and reflected, never forced."],
        ["visual", "Visual language", "Black club space, hard highlights, reflective surfaces, faces in motion, a controlled amount of brand color."],
        ["feasibility", "Feasibility", "Lean crew, fast edit path, one hero film, cutdowns and stills for social."],
        ["cta", "CTA", "Let's pressure-test this together."]
      ],
      images: [["hero", "Hero reference", "Main treatment image"], ["mood1", "Mood 01", "Light / color"], ["mood2", "Mood 02", "Texture / scene"], ["mood3", "Mood 03", "Talent / movement"]]
    }
  };

  var state = loadState();
  var activeType = state.activeType || "artistIntro";
  var previewMode = state.previewMode || "fit";
  var toastTimer = null;

  var tabsEl = document.getElementById("deckTabs");
  var fieldListEl = document.getElementById("fieldList");
  var imageSlotsEl = document.getElementById("imageSlots");
  var previewEl = document.getElementById("previewFrame");
  var previewTitleEl = document.getElementById("previewTitle");
  var previewSubEl = document.getElementById("previewSub");
  var saveStateEl = document.getElementById("saveState");
  var readyScoreEl = document.getElementById("readyScore");
  var readyMeterEl = document.getElementById("readyMeter");
  var readyListEl = document.getElementById("readyList");
  var formHeadlineEl = document.getElementById("formHeadline");
  var formDescriptionEl = document.getElementById("formDescription");
  var fieldCountEl = document.getElementById("fieldCount");
  var imageCountEl = document.getElementById("imageCount");
  var toastEl = document.getElementById("toast");
  var importFileEl = document.getElementById("importDraftFile");

  function loadState() {
    var raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_KEY) || "{}";
    try {
      return JSON.parse(raw);
    } catch (error) {
      return {};
    }
  }

  function persist() {
    state.activeType = activeType;
    state.previewMode = previewMode;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      saveStateEl.textContent = "Draft saved locally";
    } catch (error) {
      saveStateEl.textContent = "Draft too large for autosave";
      showToast("Large images are in memory. Export before closing.");
    }
  }

  function showToast(message) {
    window.clearTimeout(toastTimer);
    toastEl.textContent = message;
    toastEl.classList.add("is-visible");
    toastTimer = window.setTimeout(function () {
      toastEl.classList.remove("is-visible");
    }, 2800);
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function slugify(value) {
    return String(value || "nimmersatt-deck")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 70) || "nimmersatt-deck";
  }

  function deckState(type) {
    if (!state.decks) state.decks = {};
    if (!state.decks[type]) state.decks[type] = { fields: {}, images: {}, imageNames: {} };
    if (!state.decks[type].imageNames) state.decks[type].imageNames = {};
    return state.decks[type];
  }

  function fieldConfig(type, id) {
    return deckTypes[type].fields.find(function (field) { return field[0] === id; });
  }

  function fieldValue(type, id) {
    var item = fieldConfig(type, id);
    var current = deckState(type).fields[id];
    return current == null ? (item ? item[2] : "") : current;
  }

  function imageValue(type, id) {
    return deckState(type).images[id] || "";
  }

  function imageName(type, id) {
    return deckState(type).imageNames[id] || "";
  }

  function isTextareaField(id, value) {
    return String(value).length > 70 || ["brief", "execution", "understanding", "concept", "visual", "feasibility", "intro", "offer", "bio", "cases", "proof", "subline", "numbers"].indexOf(id) !== -1;
  }

  function renderTabs() {
    tabsEl.innerHTML = Object.keys(deckTypes).map(function (key) {
      var deck = deckTypes[key];
      var active = key === activeType ? " is-active" : "";
      return '<button class="deck-tab' + active + '" type="button" data-type="' + key + '">' +
        '<span><span class="deck-tab__name">' + escapeHtml(deck.name) + '</span>' +
        '<span class="deck-tab__meta">' + escapeHtml(deck.meta) + '</span></span>' +
        '<span class="deck-tab__no">' + escapeHtml(deck.no) + '</span>' +
      '</button>';
    }).join("");
  }

  function renderForm() {
    var deck = deckTypes[activeType];
    previewTitleEl.textContent = deck.title;
    previewSubEl.textContent = deck.meta;
    formHeadlineEl.textContent = deck.formHeadline;
    formDescriptionEl.textContent = deck.formDescription;
    fieldCountEl.textContent = deck.fields.length + " fields";
    imageCountEl.textContent = deck.images.length + " slots";

    fieldListEl.innerHTML = deck.fields.map(function (field) {
      var id = field[0], label = field[1], type = field[3] || "text";
      var value = fieldValue(activeType, id);
      var count = type === "color" ? "" : '<span class="field__meta">' + String(value).length + " chars</span>";
      if (type === "color") {
        return '<div class="field"><label for="field-' + id + '">' + escapeHtml(label) + '</label>' +
          '<input id="field-' + id + '" data-field="' + id + '" type="color" value="' + escapeHtml(value) + '" /></div>';
      }
      if (isTextareaField(id, value)) {
        return '<div class="field"><label for="field-' + id + '">' + escapeHtml(label) + '</label>' +
          '<textarea id="field-' + id + '" data-field="' + id + '">' + escapeHtml(value) + '</textarea>' + count + '</div>';
      }
      return '<div class="field"><label for="field-' + id + '">' + escapeHtml(label) + '</label>' +
        '<input id="field-' + id + '" data-field="' + id + '" type="text" value="' + escapeHtml(value) + '" />' + count + '</div>';
    }).join("");

    imageSlotsEl.innerHTML = deck.images.map(function (slot) {
      var id = slot[0], label = slot[1], hint = slot[2];
      var img = imageValue(activeType, id);
      var name = imageName(activeType, id);
      var inputId = "image-" + activeType + "-" + id;
      return '<div class="drop-slot" data-slot="' + id + '">' +
        '<div class="drop-slot__top"><span><span class="drop-slot__name">' + escapeHtml(label) + '</span>' +
        '<span class="drop-slot__hint">' + escapeHtml(hint) + '</span>' +
        '<span class="drop-slot__status">' + escapeHtml(name || "No image selected") + '</span></span></div>' +
        (img ? '<img class="drop-slot__thumb" src="' + img + '" alt="" />' : "") +
        '<div class="drop-slot__actions">' +
        '<label class="mini-button" for="' + inputId + '">Choose</label>' +
        (img ? '<button class="mini-button" type="button" data-clear-image="' + id + '">Clear</button>' : "") +
        '</div>' +
        '<input class="visually-hidden" id="' + inputId + '" data-image="' + id + '" type="file" accept="image/*" />' +
      '</div>';
    }).join("");
  }

  function renderPreviewMode() {
    previewEl.classList.remove("is-fit", "is-desktop", "is-mobile");
    previewEl.classList.add("is-" + previewMode);
    document.querySelectorAll("[data-preview-mode]").forEach(function (button) {
      button.classList.toggle("is-active", button.getAttribute("data-preview-mode") === previewMode);
    });
  }

  function renderPreview() {
    previewEl.innerHTML = buildDeckMarkup(activeType, false);
    renderPreviewMode();
    renderReady();
  }

  function getFields(type) {
    var fields = {};
    deckTypes[type].fields.forEach(function (field) {
      fields[field[0]] = fieldValue(type, field[0]);
    });
    return fields;
  }

  function getImages(type) {
    var images = {};
    deckTypes[type].images.forEach(function (slot) {
      images[slot[0]] = imageValue(type, slot[0]);
    });
    return images;
  }

  function changedFieldCount(type) {
    return deckTypes[type].fields.filter(function (field) {
      if (field[3] === "color") return false;
      return fieldValue(type, field[0]).trim() !== String(field[2]).trim();
    }).length;
  }

  function renderReady() {
    var deck = deckTypes[activeType];
    var textFields = deck.fields.filter(function (field) { return field[3] !== "color"; });
    var filledText = textFields.every(function (field) { return fieldValue(activeType, field[0]).trim().length > 0; });
    var heroReady = !deck.images.some(function (slot) { return slot[0] === "hero"; }) || !!imageValue(activeType, "hero");
    var allImagesReady = deck.images.length === 0 || deck.images.every(function (slot) { return !!imageValue(activeType, slot[0]); });
    var personalized = changedFieldCount(activeType) >= 2 || activeType === "agency";
    var checks = [
      ["All text fields are filled", filledText],
      ["Hero image is selected", heroReady],
      ["All image slots are filled", allImagesReady],
      ["Starter copy has been personalized", personalized]
    ];
    var done = checks.filter(function (check) { return check[1]; }).length;
    var score = Math.round((done / checks.length) * 100);
    readyScoreEl.textContent = score + "%";
    readyMeterEl.style.width = score + "%";
    readyListEl.innerHTML = checks.map(function (check) {
      return '<li class="' + (check[1] ? "is-done" : "") + '">' + escapeHtml(check[0]) + '</li>';
    }).join("");
    return score;
  }

  function imageCard(src, label) {
    if (!src) {
      return '<div class="preview-image"><span>' + escapeHtml(label) + '</span></div>';
    }
    return '<div class="preview-image"><img src="' + src + '" alt="" /><span>' + escapeHtml(label) + '</span></div>';
  }

  function splitList(value) {
    return String(value || "")
      .split(/,|\n/)
      .map(function (item) { return item.trim(); })
      .filter(Boolean);
  }

  function buildDeckMarkup(type, standalone) {
    var fields = getFields(type);
    var images = getImages(type);
    var clientColor = fields.clientColor || "#050505";
    var title = deckTypes[type].title;
    var coverName = fields.artist || fields.client || fields.project || fields.industry || fields.headline || "Nimmersatt";
    var heroImage = images.hero ? '<div class="preview-images preview-images--hero">' + imageCard(images.hero, "Hero") + '</div>' : "";
    var moodImages = Object.keys(images).filter(function (id) { return id !== "hero"; }).map(function (id, index) {
      return imageCard(images[id], "Mood " + String(index + 1).padStart(2, "0"));
    }).join("");
    var body = "";

    if (type === "artistIntro") {
      body = cover("Hi " + fields.artist + ".", fields.hook, "Intro / for an artist", heroImage) +
        section("Who we are", fields.headline, fields.intro) +
        cards([
          ["01 / Booking", "We can place the right opportunities around the work you already make."],
          ["02 / Management", "We help shape the portfolio, positioning and long game."],
          ["03 / Production", fields.offer]
        ]) +
        closing(fields.cta, "booking@nimmersatt.fyi");
    } else if (type === "treatment") {
      body = cover("Nimmersatt x " + fields.client, fields.headline, "Treatment / " + fields.project, heroImage) +
        section("01 / Understanding", "What we heard.", fields.understanding) +
        section("02 / Concept", fields.headline, fields.concept) +
        moodSection("03 / Visual language", "Look and feel.", fields.visual, moodImages) +
        cards([
          ["Beat 01", "Opening texture: establish place, bodies, material and the client object without announcing it."],
          ["Beat 02", "The product enters through reflection, sound and light before it becomes a hero."],
          ["Beat 03", fields.feasibility]
        ]) +
        closing(fields.cta, "production@nimmersatt.fyi");
    } else if (type === "caseStudy") {
      body = cover(fields.project, fields.headline, fields.client, heroImage) +
        section("The brief", "What needed to happen.", fields.brief) +
        section("What we did", "Execution.", fields.execution) +
        cards([["Proof", fields.numbers], ["Client", fields.client], ["Next", fields.cta]]) +
        (moodImages ? '<section><p class="preview-index">Frames</p><div class="preview-images">' + moodImages + '</div></section>' : "") +
        closing(fields.cta, "production@nimmersatt.fyi");
    } else if (type === "artistDetail") {
      body = cover(fields.artist, fields.bio, fields.role, heroImage) +
        section("The approach", fields.headline, fields.bio) +
        cards(splitList(fields.credits).slice(0, 6).map(function (credit, index) {
          return ["Credit " + String(index + 1).padStart(2, "0"), credit];
        })) +
        (moodImages ? '<section><p class="preview-index">Portfolio</p><div class="preview-images">' + moodImages + '</div></section>' : "") +
        closing(fields.cta, "booking@nimmersatt.fyi");
    } else if (type === "industry") {
      body = cover("Nimmersatt x " + fields.industry, fields.intro, "Industry bundle", heroImage) +
        section("Why us for " + fields.industry, fields.headline, fields.intro) +
        cards(splitList(fields.cases).slice(0, 6).map(function (item, index) {
          return ["Case " + String(index + 1).padStart(2, "0"), item];
        })) +
        section("Numbers", "Proof in the scene.", fields.numbers) +
        (moodImages ? '<section><p class="preview-index">References</p><div class="preview-images">' + moodImages + '</div></section>' : "") +
        closing(fields.cta, "production@nimmersatt.fyi");
    } else {
      body = cover(fields.headline, fields.subline, "Artist Booking / Management / Production", heroImage) +
        cards([
          ["Artist Booking", "The right artist for the moment, sourced and secured."],
          ["Artist Management", "Portfolio, positioning and the long game."],
          ["Creative Production", "Concept to final cut: treatments, editorials, music videos and brand worlds."]
        ]) +
        section("Proof", "Built like a network, run like a studio.", fields.proof) +
        closing(fields.cta, "hello@nimmersatt.fyi");
    }

    if (!standalone) {
      return '<article class="deck-preview" style="--client:' + escapeHtml(clientColor) + '">' + body + "</article>";
    }

    return '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8" />' +
      '<meta name="viewport" content="width=device-width, initial-scale=1.0" />' +
      '<title>NIMMERSATT, ' + escapeHtml(title) + " / " + escapeHtml(coverName) + '</title>' +
      '<link rel="preconnect" href="https://fonts.googleapis.com" />' +
      '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />' +
      '<link href="https://fonts.googleapis.com/css2?family=Rock+3D&family=Martian+Mono:wght@100..800&display=swap" rel="stylesheet" />' +
      '<style>' + exportCss() + '</style></head>' +
      '<body style="--client:' + escapeHtml(clientColor) + '">' +
      '<header class="export-nav"><span>Nimmersatt</span><span>' + escapeHtml(title) + '</span></header>' +
      '<main class="export-deck">' + body + '</main></body></html>';

    function cover(headline, copy, kicker, extra) {
      return '<section class="export-cover"><p class="preview-kicker">' + escapeHtml(kicker) + '</p>' +
        '<h1 class="preview-heading">' + escapeHtml(headline) + '</h1>' +
        '<p class="preview-copy">' + escapeHtml(copy) + '</p>' + (extra || "") + '</section>';
    }

    function section(index, headline, copy) {
      return '<section><p class="preview-index">' + escapeHtml(index) + '</p>' +
        '<h2 class="preview-title">' + escapeHtml(headline) + '</h2>' +
        '<p class="preview-copy">' + escapeHtml(copy) + '</p></section>';
    }

    function moodSection(index, headline, copy, imgs) {
      return '<section><p class="preview-index">' + escapeHtml(index) + '</p>' +
        '<h2 class="preview-title">' + escapeHtml(headline) + '</h2>' +
        '<p class="preview-copy">' + escapeHtml(copy) + '</p>' +
        (imgs ? '<div class="preview-images">' + imgs + '</div>' : "") + '</section>';
    }

    function cards(items) {
      var html = items.map(function (item) {
        return '<article class="preview-card"><h3>' + escapeHtml(item[0]) + '</h3><p>' + escapeHtml(item[1]) + '</p></article>';
      }).join("");
      return '<section><div class="preview-grid">' + html + '</div></section>';
    }

    function closing(copy, email) {
      return '<section class="preview-dark"><p class="preview-index">Next step</p>' +
        '<h2 class="preview-title">' + escapeHtml(copy) + '</h2>' +
        '<p class="preview-copy"><a href="mailto:' + escapeHtml(email) + '">' + escapeHtml(email) + '</a></p></section>';
    }
  }

  function exportCss() {
    return [
      ":root{--bg:#fff;--fg:#050505;--muted:rgba(5,5,5,.58);--ink:rgba(5,5,5,.72);--panel:#f6f6f2;--dark:#090909;--on-dark:#f5f5f0;--faint:rgba(5,5,5,.12);--accent:#050505;--font-display:'Rock 3D',system-ui,sans-serif;--font-mono:'Martian Mono',ui-monospace,SFMono-Regular,Menlo,monospace}*{box-sizing:border-box}html{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;background:var(--bg);color:var(--fg);font-family:var(--font-mono)}body{margin:0;background:var(--bg);color:var(--fg);font-feature-settings:'lnum' 1,'tnum' 1}.export-nav{position:fixed;inset:0 0 auto;z-index:5;display:flex;justify-content:space-between;gap:1rem;padding:1rem clamp(1.25rem,4vw,4.5rem);background:color-mix(in srgb,var(--bg) 88%,transparent);border-bottom:1px solid var(--faint);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}.export-nav span{font-size:clamp(.62rem,.78vw,.78rem);font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:var(--muted)}.export-deck{width:100%;overflow:hidden}.export-deck section{min-height:100vh;padding:clamp(4rem,8vw,7rem) clamp(1.25rem,6vw,6rem);border-top:1px solid var(--faint);display:flex;flex-direction:column;justify-content:center}.export-deck section:first-child{border-top:0;justify-content:flex-end}.preview-kicker,.preview-index{margin:0 0 1rem;color:var(--client,var(--fg));font-size:clamp(.62rem,.78vw,.78rem);font-weight:800;letter-spacing:.16em;text-transform:uppercase}.preview-heading{margin:0;max-width:13ch;font-family:var(--font-display);font-size:clamp(3rem,12vw,10rem);font-weight:400;letter-spacing:0;line-height:.9;text-transform:uppercase;overflow-wrap:anywhere}.preview-title{margin:0;max-width:20ch;font-size:clamp(1.8rem,5vw,4rem);line-height:1.08}.preview-copy{max-width:64ch;margin-top:1rem;color:var(--ink);line-height:1.72;font-size:clamp(.95rem,1.2vw,1.08rem);font-weight:460}.preview-grid,.preview-images{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;margin-top:2rem;background:var(--faint);border:1px solid var(--faint)}.preview-card{min-height:220px;padding:1.4rem;background:var(--bg)}.preview-card h3{margin:0 0 1.3rem;color:var(--client,var(--fg));font-size:.72rem;letter-spacing:.14em;text-transform:uppercase}.preview-card p{margin:0;color:var(--ink);line-height:1.62}.preview-image{position:relative;min-height:260px;background:var(--panel);overflow:hidden}.preview-image img{width:100%;height:100%;min-height:260px;object-fit:cover;display:block}.preview-image span{position:absolute;left:0;bottom:0;padding:.45rem .6rem;background:rgba(5,5,5,.75);color:var(--on-dark);font-size:.7rem;letter-spacing:.12em;text-transform:uppercase}.preview-dark{background:var(--dark);color:var(--on-dark)}.preview-dark .preview-title,.preview-dark .preview-copy,.preview-dark a{color:var(--on-dark)}@media(max-width:760px){.preview-grid,.preview-images{grid-template-columns:1fr}.export-deck section{min-height:auto;padding-block:4rem}.export-nav{position:static}}@media print{.export-nav{display:none}.export-deck section{min-height:100vh;break-after:page;-webkit-print-color-adjust:exact;print-color-adjust:exact}}"
    ].join("");
  }

  function handleFile(file, slotId) {
    if (!file || !file.type.match(/^image\//)) {
      showToast("Choose an image file.");
      return;
    }
    var reader = new FileReader();
    reader.onload = function () {
      var current = deckState(activeType);
      current.images[slotId] = reader.result;
      current.imageNames[slotId] = file.name;
      persist();
      renderForm();
      renderPreview();
      showToast("Image added.");
    };
    reader.readAsDataURL(file);
  }

  function exportHtml() {
    var score = renderReady();
    var fields = getFields(activeType);
    var name = fields.artist || fields.client || fields.project || fields.industry || deckTypes[activeType].name;
    var html = buildDeckMarkup(activeType, true);
    var blob = new Blob([html], { type: "text/html;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = slugify("nimmersatt-" + deckTypes[activeType].name + "-" + name) + ".html";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 600);
    showToast(score < 75 ? "HTML exported. Check missing items before sending." : "HTML exported.");
  }

  function exportDraft() {
    var payload = {
      app: "Nimmersatt Deck Builder",
      version: 2,
      exportedAt: new Date().toISOString(),
      activeType: activeType,
      decks: state.decks || {}
    };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = slugify("nimmersatt-builder-draft-" + activeType) + ".json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 600);
    showToast("Draft JSON exported.");
  }

  function importDraft(file) {
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var payload = JSON.parse(reader.result);
        state.decks = payload.decks || {};
        activeType = payload.activeType && deckTypes[payload.activeType] ? payload.activeType : activeType;
        persist();
        render();
        showToast("Draft imported.");
      } catch (error) {
        showToast("Draft import failed.");
      }
    };
    reader.readAsText(file);
  }

  function openPreview() {
    var html = buildDeckMarkup(activeType, true);
    var win = window.open("", "_blank");
    if (!win) {
      showToast("Popup blocked. Use Export HTML instead.");
      return;
    }
    win.document.open();
    win.document.write(html);
    win.document.close();
  }

  tabsEl.addEventListener("click", function (event) {
    var button = event.target.closest("[data-type]");
    if (!button) return;
    activeType = button.getAttribute("data-type");
    persist();
    render();
  });

  fieldListEl.addEventListener("input", function (event) {
    var field = event.target.getAttribute("data-field");
    if (!field) return;
    deckState(activeType).fields[field] = event.target.value;
    persist();
    renderPreview();
  });

  imageSlotsEl.addEventListener("change", function (event) {
    var slot = event.target.getAttribute("data-image");
    if (slot) handleFile(event.target.files && event.target.files[0], slot);
  });

  imageSlotsEl.addEventListener("click", function (event) {
    var clear = event.target.closest("[data-clear-image]");
    if (!clear) return;
    var id = clear.getAttribute("data-clear-image");
    delete deckState(activeType).images[id];
    delete deckState(activeType).imageNames[id];
    persist();
    renderForm();
    renderPreview();
    showToast("Image cleared.");
  });

  imageSlotsEl.addEventListener("dragover", function (event) {
    var slot = event.target.closest(".drop-slot");
    if (!slot) return;
    event.preventDefault();
    slot.classList.add("is-dragging");
  });

  imageSlotsEl.addEventListener("dragleave", function (event) {
    var slot = event.target.closest(".drop-slot");
    if (slot) slot.classList.remove("is-dragging");
  });

  imageSlotsEl.addEventListener("drop", function (event) {
    var slot = event.target.closest(".drop-slot");
    if (!slot) return;
    event.preventDefault();
    slot.classList.remove("is-dragging");
    handleFile(event.dataTransfer.files && event.dataTransfer.files[0], slot.getAttribute("data-slot"));
  });

  document.addEventListener("click", function (event) {
    var modeButton = event.target.closest("[data-preview-mode]");
    if (!modeButton) return;
    previewMode = modeButton.getAttribute("data-preview-mode");
    persist();
    renderPreviewMode();
  });

  document.getElementById("exportHtml").addEventListener("click", exportHtml);
  document.getElementById("exportDraft").addEventListener("click", exportDraft);
  document.getElementById("importDraft").addEventListener("click", function () { importFileEl.click(); });
  importFileEl.addEventListener("change", function () {
    importDraft(importFileEl.files && importFileEl.files[0]);
    importFileEl.value = "";
  });
  document.getElementById("openPreview").addEventListener("click", openPreview);
  document.getElementById("resetDraft").addEventListener("click", function () {
    if (!window.confirm("Reset local builder draft?")) return;
    localStorage.removeItem(STORAGE_KEY);
    state = {};
    activeType = "artistIntro";
    previewMode = "fit";
    render();
    persist();
    showToast("Draft reset.");
  });

  function render() {
    renderTabs();
    renderForm();
    renderPreview();
  }

  render();
  persist();
})();
