/* ============================================================================
   NIMMERSATT — pitch foundation interactions
   Minimal, dependency-free. Native scroll only (no smooth-scroll libraries).
   Jobs: preloader, scroll-progress bar, nav scrollspy, on-scroll reveals.
   ========================================================================== */

(function () {
  "use strict";

  /* --- Preloader (GIF loader, like the real Nimmersatt site) -------------- */
  // Minimum on-screen time so the loader animation reads; tap/click skips it.
  var preloader = document.getElementById("preloader");
  var LOADER_DURATION = 2800;
  var preloadStart = Date.now();
  var loaderDone = false;

  function dismissPreloader() {
    if (loaderDone || !preloader) return;
    loaderDone = true;
    preloader.classList.add("is-done");
    // Stop decoding the now-hidden loader video to free the main thread.
    var pv = preloader.querySelector("video");
    if (pv && pv.pause) { try { pv.pause(); } catch (e) {} }
  }
  function scheduleDismiss() {
    var remaining = Math.max(0, LOADER_DURATION - (Date.now() - preloadStart));
    window.setTimeout(dismissPreloader, remaining);
  }
  if (preloader) {
    // Skip on tap/click; otherwise leave after the minimum once the page is ready.
    ["pointerdown", "click", "touchend"].forEach(function (evt) {
      preloader.addEventListener(evt, dismissPreloader);
    });
    if (document.readyState === "complete") scheduleDismiss();
    else window.addEventListener("load", scheduleDismiss);
    window.setTimeout(dismissPreloader, 6000); // absolute fallback — never stuck
  }

  /* --- Autoplay the inline loops (the "GIF") without a click ---------------
     These were real GIFs originally; as muted <video> some browsers leave them
     paused on the poster until a gesture. Force play, and retry on first input. */
  (function autoplayLoops() {
    var loops = Array.prototype.slice.call(
      document.querySelectorAll(".hero__mark, .hero__reel video, .tool-video video")
    );
    var pv = preloader ? preloader.querySelector("video") : null;
    if (pv) loops.push(pv);
    if (!loops.length) return;
    // The tool walkthrough carries visible controls. Once someone pauses it by
    // hand, no later retry is allowed to resurrect it. A pause that happens
    // while the video sits offscreen is the browser saving bandwidth, not the
    // user, so that one does not count.
    loops.forEach(function (v) {
      if (!v || !v.controls) return;
      v.addEventListener("pause", function () {
        var r = v.getBoundingClientRect();
        var onScreen = r.bottom > 0 && r.top < (window.innerHeight || 0);
        if (onScreen) v.dataset.userPaused = "1";
      });
      v.addEventListener("play", function () { delete v.dataset.userPaused; });
    });
    function kick() {
      loops.forEach(function (v) {
        if (!v || (v === pv && loaderDone)) return; // don't restart the dismissed loader
        if (v.dataset && v.dataset.userPaused) return;
        try {
          v.muted = true;
          v.playsInline = true;
          var p = v.play();
          if (p && p.catch) p.catch(function () {});
        } catch (e) {}
      });
    }
    kick();
    if (document.readyState !== "complete") window.addEventListener("load", kick, { once: true });
    ["pointerdown", "touchstart", "keydown", "scroll"].forEach(function (evt) {
      window.addEventListener(evt, kick, { once: true, passive: true });
    });
    // A couple of delayed retries cover slow metadata / late autoplay unlocks.
    window.setTimeout(kick, 400);
    window.setTimeout(kick, 1200);

    // The tool walkthrough sits far down the page, so every retry above has
    // already fired by the time anyone reaches it. If the browser held its
    // autoplay back while it was offscreen, start it as it comes into view.
    var deep = loops.filter(function (v) { return v && v.controls; });
    if (deep.length && "IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          var v = e.target;
          if (!e.isIntersecting || !v.paused || v.dataset.userPaused) return;
          try {
            v.muted = true;
            var p = v.play();
            if (p && p.catch) p.catch(function () {});
          } catch (err) {}
        });
      }, { threshold: 0.25 });
      deep.forEach(function (v) { io.observe(v); });
    }
  })();

  /* --- Header reveal — hidden over the hero, slides in once scrolled past -- */
  var header = document.getElementById("siteHeader");
  var heroEl = document.getElementById("hero");
  if (header && heroEl && "IntersectionObserver" in window) {
    // Header appears as soon as the hero has scrolled mostly out of view.
    var heroSpy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          header.classList.toggle("is-stuck", !e.isIntersecting);
        });
      },
      { rootMargin: "-12% 0px 0px 0px", threshold: 0 }
    );
    heroSpy.observe(heroEl);
  } else if (header) {
    header.classList.add("is-stuck");
  }

  /* --- Mobile nav: hamburger toggle opens the link panel ------------------- */
  (function navMenu() {
    var toggle = document.getElementById("navToggle");
    if (!header || !toggle) return;
    function setOpen(open) {
      header.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }
    toggle.addEventListener("click", function () {
      setOpen(!header.classList.contains("is-open"));
    });
    // Close after picking a destination, on Escape, or when widening to desktop.
    Array.prototype.forEach.call(header.querySelectorAll(".nav__links a"), function (a) {
      a.addEventListener("click", function () { setOpen(false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 760) setOpen(false);
    }, { passive: true });
  })();

  /* --- Contact anchors: on this long pitch, "Contact" means page end ------- */
  document.addEventListener("click", function (e) {
    if (window.lenis) return;
    var a = e.target && e.target.closest && e.target.closest("a[data-scroll-end]");
    if (!a) return;
    e.preventDefault();
    var rm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var getPageEnd = function () {
      var nativeEnd = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight
      ) - window.innerHeight;
      return Math.max(0, nativeEnd);
    };
    window.scrollTo({ top: getPageEnd(), behavior: rm ? "auto" : "smooth" });
    window.setTimeout(function () {
      window.scrollTo({ top: getPageEnd(), behavior: "auto" });
    }, rm ? 0 : 650);
  });

  /* --- Nav scrollspy (current section = bolder weight; no progress bar) ---- */
  var links = Array.prototype.slice.call(document.querySelectorAll(".nav__links a"));
  var sections = links
    .map(function (a) {
      var id = a.getAttribute("href");
      return id && id.charAt(0) === "#" ? document.querySelector(id) : null;
    })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var id = "#" + entry.target.id;
          links.forEach(function (a) {
            var on = a.getAttribute("href") === id;
            a.classList.toggle("is-active", on);
            if (on) a.setAttribute("aria-current", "true");
            else a.removeAttribute("aria-current");
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* --- Cross-deck pager (decks/ pages only) ------------------------------- */
  // Injected so navigation lives in one place. Order matches the deck system.
  var DECK_PAGES = [
    { href: "../index.html", label: "Agency Model", match: null },
    { href: "case-studies.html", label: "Case Studies", match: "case-studies.html" },
    { href: "artist-detail.html", label: "Artist in Detail", match: "artist-detail.html" },
    { href: "industry-fashion.html", label: "Industry Bundle", match: "industry-fashion.html" },
    { href: "artist-intro.html", label: "Artist Intro", match: "artist-intro.html" },
    { href: "treatment.html", label: "Client Treatment", match: "treatment.html" }
  ];
  (function buildPager() {
    var main = document.querySelector("main");
    if (!main) return;
    var file = window.location.pathname.split("/").pop() || "";
    var idx = -1;
    for (var i = 0; i < DECK_PAGES.length; i++) {
      if (DECK_PAGES[i].match && DECK_PAGES[i].match === file) { idx = i; break; }
    }
    if (idx === -1) return; // not a deck content page (hub / root index get no pager)

    var prev = DECK_PAGES[idx - 1] || null;
    var next = DECK_PAGES[idx + 1] || { href: "index.html", label: "All decks" };

    var nav = document.createElement("nav");
    nav.className = "deckpager shell";
    nav.setAttribute("aria-label", "Deck navigation");
    nav.innerHTML =
      (prev
        ? '<a class="deckpager__link deckpager__prev" href="' + prev.href + '">← ' + prev.label + "</a>"
        : '<span class="deckpager__link deckpager__prev" aria-hidden="true"></span>') +
      '<a class="deckpager__hub" href="index.html">All decks</a>' +
      '<a class="deckpager__link deckpager__next" href="' + next.href + '">' + next.label + " →</a>";
    main.appendChild(nav);
  })();

  /* --- Back to top (appears once you've scrolled; helps long pages) -------- */
  (function backToTop() {
    var rm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var btn = document.createElement("button");
    btn.className = "backtotop";
    btn.type = "button";
    btn.setAttribute("aria-label", "Back to top");
    btn.innerHTML = '<span aria-hidden="true">↑</span> Top';
    document.body.appendChild(btn);
    btn.addEventListener("click", function () {
      // Route through Lenis when the smooth-scroll layer is active, otherwise
      // fall back to native scrolling.
      if (window.lenis) window.lenis.scrollTo(0);
      else window.scrollTo({ top: 0, behavior: rm ? "auto" : "smooth" });
    });
    var shown = false, ticking = false;
    function update() {
      var should = window.scrollY > window.innerHeight * 0.9;
      if (should !== shown) { shown = should; btn.classList.toggle("is-shown", shown); }
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }, { passive: true });
    update();
  })();

  /* --- Text-scramble / glitch decode (ported from the Nimmersatt site) ----
     Decodes the About "what we do" row in on reveal, and roster artist names
     on hover. Honours reduced motion (just shows the final text). */
  var scrambleReduce =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var SCRAMBLE_CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&?+*<>";

  function runScramble(el, finalText, duration) {
    if (!el) return;
    duration = duration || 1000;
    if (scrambleReduce) { el.textContent = finalText; return; }
    var len = finalText.length;
    var start = performance.now();
    var revealAt = new Array(len);
    for (var i = 0; i < len; i++) {
      var base = (0.25 + 0.75 * (i / Math.max(1, len - 1))) * duration;
      revealAt[i] = Math.max(0, base + (Math.random() - 0.5) * duration * 0.18);
    }
    function keep(ch) {
      return ch === " " || ch === "&" || ch === "·" || ch === "-" || ch === "+";
    }
    function tick(now) {
      if (!el.isConnected) return;
      var elapsed = now - start;
      var out = "";
      for (var j = 0; j < len; j++) {
        var ch = finalText[j];
        if (keep(ch) || elapsed >= revealAt[j]) out += ch;
        else out += SCRAMBLE_CHARSET[Math.floor(Math.random() * SCRAMBLE_CHARSET.length)];
      }
      el.textContent = out;
      if (elapsed < duration + 60) window.requestAnimationFrame(tick);
      else el.textContent = finalText;
    }
    window.requestAnimationFrame(tick);
  }

  (function scrambleServices() {
    var row = document.querySelector("[data-scramble]");
    if (!row || scrambleReduce || !("IntersectionObserver" in window)) return;
    var items = Array.prototype.slice.call(row.children);
    var finals = items.map(function (li) { return li.textContent; });
    var fired = false;
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting || fired) return;
          fired = true;
          items.forEach(function (li, i) {
            window.setTimeout(function () { runScramble(li, finals[i], 900); }, i * 70);
          });
          io.disconnect();
        });
      },
      { threshold: 0.25 }
    );
    io.observe(row);
  })();

  (function scrambleArtists() {
    if (scrambleReduce) return;
    var names = document.querySelectorAll("[data-scramble-names] .artist__name");
    Array.prototype.forEach.call(names, function (el) {
      var finalText = el.textContent;
      var host = el.closest(".artist, .projectperson") || el;
      var busy = false;
      function go() {
        if (busy) return;
        busy = true;
        runScramble(el, finalText, 520);
        window.setTimeout(function () { busy = false; }, 560);
      }
      host.addEventListener("mouseenter", go);
      host.addEventListener("focus", go);
    });
  })();

  /* --- Concept reference strips: infinite panorama + image lightbox -------- */
  (function referenceStrips() {
    var reduce =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var rails = Array.prototype.slice.call(document.querySelectorAll(".concept__refs"));
    if (!rails.length) return;

    var lightbox = null;
    var lightboxImg = null;
    var lastLightboxFocus = null;
    function ensureLightbox() {
      if (lightbox) return;
      lightbox = document.createElement("div");
      lightbox.className = "ref-lightbox";
      lightbox.setAttribute("aria-hidden", "true");
      lightbox.setAttribute("role", "dialog");
      lightbox.setAttribute("aria-modal", "true");
      lightbox.innerHTML =
        '<button class="ref-lightbox__close" type="button">Close</button>' +
        '<figure class="ref-lightbox__figure"><img class="ref-lightbox__img" alt="" /></figure>';
      document.body.appendChild(lightbox);
      lightboxImg = lightbox.querySelector(".ref-lightbox__img");
      lightbox.addEventListener("click", function (e) {
        if (e.target === lightbox || e.target.closest(".ref-lightbox__close")) closeLightbox();
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && lightbox.classList.contains("is-open")) closeLightbox();
      });
    }
    function openLightbox(img) {
      ensureLightbox();
      lastLightboxFocus = document.activeElement;
      lightboxImg.src = img.currentSrc || img.src;
      lightboxImg.alt = img.alt || "Reference image";
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      document.documentElement.classList.add("reel-open");
      var close = lightbox.querySelector(".ref-lightbox__close");
      if (close) close.focus();
    }
    function closeLightbox() {
      if (!lightbox) return;
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      document.documentElement.classList.remove("reel-open");
      if (lightboxImg) lightboxImg.removeAttribute("src");
      if (lastLightboxFocus && lastLightboxFocus.focus) {
        try { lastLightboxFocus.focus(); } catch (e) {}
      }
    }

    /* Rug reference plates ([data-zoom]) open the same lightbox — click or keyboard. */
    document.addEventListener("click", function (e) {
      var z = e.target && e.target.closest && e.target.closest("[data-zoom]");
      if (!z) return;
      e.preventDefault();
      openLightbox(z);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Enter" && e.key !== " ") return;
      var z = document.activeElement;
      if (!z || !z.matches || !z.matches("[data-zoom]")) return;
      e.preventDefault();
      openLightbox(z);
    });

    rails.forEach(function (rail) {
      var track = rail.querySelector(".concept__refs-track");
      if (!track || !track.children.length) return;
      if (rail.getAttribute("data-ref-loop-ready") === "true") return;
      rail.setAttribute("data-ref-loop-ready", "true");

      // Wrap the strip so the stylized control bar sits under it (same editorial
      // mono/dotted language). Bar = left/right arrows + a draggable panorama slider.
      var wrap = document.createElement("div");
      wrap.className = "concept__refswrap";
      rail.parentNode.insertBefore(wrap, rail);
      wrap.appendChild(rail);
      var bar = document.createElement("div");
      bar.className = "concept__refsbar";
      bar.innerHTML =
        '<button class="concept__refsbtn" type="button" data-dir="-1" aria-label="Scroll references left"><span aria-hidden="true">&#8592;</span></button>' +
        '<div class="concept__slider" role="slider" tabindex="0" aria-label="Scrub references" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span class="concept__slider-thumb" aria-hidden="true"></span></div>' +
        '<button class="concept__refsbtn" type="button" data-dir="1" aria-label="Scroll references right"><span aria-hidden="true">&#8594;</span></button>';
      wrap.appendChild(bar);
      var sliderTrack = bar.querySelector(".concept__slider");
      var thumb = bar.querySelector(".concept__slider-thumb");
      var pauseUntil = 0;
      bar.addEventListener("click", function (e) {
        var btn = e.target && e.target.closest && e.target.closest(".concept__refsbtn");
        if (!btn) return;
        e.preventDefault();
        var dir = parseInt(btn.getAttribute("data-dir"), 10) || 1;
        pauseUntil = performance.now() + 1400;
        rail.scrollBy({ left: dir * Math.max(240, rail.clientWidth * 0.8), behavior: "smooth" });
      });

      var originals = Array.prototype.slice.call(track.children);
      originals.forEach(function (item, index) {
        if (index === 0) item.setAttribute("data-stack-start", "true");
      });

      var segment = 0;
      var x = 0;
      var normalizing = false;
      var last = 0;
      var speed = 0;
      var activeStackFigure = null;
      var stackCards = originals;
      var originalCount = originals.length;

      function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
      }
      function cardRatio(card) {
        var raw = card.style.getPropertyValue("--ar") || "1.6";
        var value = parseFloat(raw);
        return Number.isFinite(value) && value > 0 ? value : 1.6;
      }
      function railHeight() {
        var first = stackCards[0];
        var fromCard = first ? parseFloat(window.getComputedStyle(first).height) : 0;
        if (fromCard) return fromCard;
        return clamp(rail.clientWidth * 0.24, 210, 360);
      }
      function layoutStack(activeFigure) {
        if (!stackCards.length) stackCards = Array.prototype.slice.call(track.children);
        if (!stackCards.length || !originalCount) return;

        var railWidth = Math.max(1, rail.clientWidth);
        var baseHeight = railHeight();
        var maxCardWidth = railWidth * 0.74;
        var sizes = stackCards.map(function (card) {
          var ratio = cardRatio(card);
          var width = baseHeight * ratio;
          var height = baseHeight;
          if (width > maxCardWidth) {
            width = maxCardWidth;
            height = width / ratio;
          }
          return { width: width, height: height, ratio: ratio };
        });
        var maxWidth = sizes.reduce(function (max, size) { return Math.max(max, size.width); }, 0);
        var restStep = originalCount > 1
          ? clamp((railWidth - Math.min(maxWidth * 0.42, railWidth * 0.28)) / (originalCount - 1), 7, 18)
          : 0;
        var activeStep = clamp(railWidth * 0.026, 8, 18);
        var gap = clamp(railWidth * 0.018, 7, 14);
        var activeIndex = activeFigure ? stackCards.indexOf(activeFigure) : -1;

        segment = railWidth;
        track.style.width = railWidth + "px";
        track.style.height = baseHeight + "px";

        stackCards.forEach(function (card, index) {
          var within = index % originalCount;
          var size = sizes[index];
          var baseLeft = within * restStep;
          var left = baseLeft;
          var depth = within % 5;
          var tilt = (depth - 2) * 0.55;
          var y = depth * -2.2;

          if (activeIndex !== -1) {
            var activeSize = sizes[activeIndex];
            var activeLeft = clamp(
              activeIndex * restStep - activeSize.width * 0.28,
              activeStep * 2,
              Math.max(activeStep * 2, railWidth - activeSize.width - activeStep * 1.6)
            );
            var delta = index - activeIndex;
            if (delta < 0) left = activeLeft + delta * activeStep;
            else if (delta === 0) {
              left = activeLeft;
              tilt = 0;
              y = -6;
            } else {
              left = activeLeft + activeSize.width + gap + (delta - 1) * activeStep;
            }
          }

          left = clamp(left, -size.width * 0.88, railWidth - activeStep);

          card.style.left = left + "px";
          card.style.top = Math.max(0, (baseHeight - size.height) * 0.5) + "px";
          card.style.setProperty("--stack-width", size.width + "px");
          card.style.setProperty("--stack-height", size.height + "px");
          card.style.setProperty("--stack-tilt", tilt + "deg");
          card.style.setProperty("--stack-y", y + "px");
          card.style.zIndex = activeIndex === index ? 1000 : 10 + index;
        });
      }
      function measure() {
        layoutStack(activeStackFigure);
      }
      function setStart() {
        measure();
        rail.scrollLeft = 0;
        x = rail.scrollLeft;
      }
      function normalize() {
        if (!segment) measure();
        x = rail.scrollLeft;
      }

      // Panorama slider: thumb width = view/segment, position = progress within one
      // loop (mod segment, since the strip repeats). Dragging scrubs the panorama.
      function thumbWidth(trackW) {
        if (!segment) measure();
        return Math.max(30, Math.min(trackW, (rail.clientWidth / segment) * trackW));
      }
      function updateThumb() {
        if (!thumb || !sliderTrack) return;
        if (!segment) measure();
        if (!segment) return;
        var trackW = sliderTrack.clientWidth;
        var tw = thumbWidth(trackW);
        var frac = (((rail.scrollLeft % segment) + segment) % segment) / segment;
        thumb.style.width = tw + "px";
        thumb.style.transform = "translateX(" + frac * (trackW - tw) + "px)";
        sliderTrack.setAttribute("aria-valuenow", Math.round(frac * 100));
      }
      function scrubTo(clientX) {
        if (!segment) measure();
        var r = sliderTrack.getBoundingClientRect();
        var tw = thumbWidth(r.width);
        var frac = (clientX - r.left - tw / 2) / (r.width - tw);
        frac = Math.max(0, Math.min(1, frac));
        pauseUntil = performance.now() + 1400;
        rail.scrollLeft = segment + frac * segment;
        updateThumb();
      }
      var dragging = false;
      sliderTrack.addEventListener("pointerdown", function (e) {
        dragging = true;
        if (sliderTrack.setPointerCapture) { try { sliderTrack.setPointerCapture(e.pointerId); } catch (err) {} }
        scrubTo(e.clientX);
      });
      sliderTrack.addEventListener("pointermove", function (e) { if (dragging) scrubTo(e.clientX); });
      sliderTrack.addEventListener("pointerup", function () { dragging = false; });
      sliderTrack.addEventListener("pointercancel", function () { dragging = false; });
      sliderTrack.addEventListener("keydown", function (e) {
        if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
        e.preventDefault();
        pauseUntil = performance.now() + 1400;
        rail.scrollBy({ left: (e.key === "ArrowRight" ? 1 : -1) * Math.max(160, rail.clientWidth * 0.5), behavior: "smooth" });
      });

      function step(now) {
        if (!last) last = now;
        var delta = Math.min(80, now - last);
        last = now;
        // Hold the auto-advance while the user is driving (scroll buttons / drag);
        // read scrollLeft fresh so manual movement in either direction is honored.
        if (now < pauseUntil) { x = rail.scrollLeft; normalize(); updateThumb(); return; }
        if (!reduce && !document.hidden && !(lightbox && lightbox.classList.contains("is-open"))) {
          x = rail.scrollLeft + (speed * delta) / 1000;
          rail.scrollLeft = x;
          normalize();
        }
        updateThumb();
      }

      rail.addEventListener("scroll", function () {
        if (!normalizing) {
          x = rail.scrollLeft;
          normalize();
        }
        updateThumb();
      }, { passive: true });
      // Manual input (wheel / touch / drag) briefly holds the auto-advance.
      function holdOnInput() { pauseUntil = performance.now() + 1400; }
      function clearStackActive() {
        rail.classList.remove("is-accordion-active");
        activeStackFigure = null;
        Array.prototype.forEach.call(track.querySelectorAll(".is-stack-active, .is-stack-next, .is-stack-before, .is-stack-after, .is-stack-near"), function (el) {
          el.classList.remove("is-stack-active", "is-stack-next", "is-stack-before", "is-stack-after", "is-stack-near");
        });
        layoutStack(null);
      }
      function setStackActive(figure) {
        if (!figure) return;
        clearStackActive();
        activeStackFigure = figure;
        rail.classList.add("is-accordion-active");
        figure.classList.add("is-stack-active");
        if (figure.nextElementSibling) figure.nextElementSibling.classList.add("is-stack-next");
        var activeIndex = stackCards.indexOf(figure);
        stackCards.forEach(function (card, index) {
          var distance = Math.abs(index - activeIndex);
          if (distance === 0) return;
          if (index < activeIndex) card.classList.add("is-stack-before");
          if (index > activeIndex) card.classList.add("is-stack-after");
          if (distance <= 2) card.classList.add("is-stack-near");
        });
        layoutStack(figure);
        pauseUntil = performance.now() + 1800;
      }
      function figureFromPointer(e) {
        var rect = rail.getBoundingClientRect();
        var xInRail = clamp(e.clientX - rect.left, 0, rect.width);
        var index = Math.round((xInRail / Math.max(1, rect.width)) * (originalCount - 1));
        return stackCards[clamp(index, 0, originalCount - 1)];
      }
      rail.addEventListener("wheel", holdOnInput, { passive: true });
      rail.addEventListener("pointerdown", holdOnInput, { passive: true });
      rail.addEventListener("pointermove", function (e) {
        holdOnInput();
        var figure = figureFromPointer(e);
        if (figure && figure !== activeStackFigure) setStackActive(figure);
      }, { passive: true });
      rail.addEventListener("pointerenter", holdOnInput, { passive: true });
      rail.addEventListener("pointerover", function (e) {
        var figure = figureFromPointer(e);
        if (!figure) return;
        setStackActive(figure);
      });
      rail.addEventListener("pointerleave", clearStackActive);
      rail.addEventListener("focusin", function (e) {
        var figure = e.target && e.target.closest && e.target.closest(".concept__refs figure");
        if (figure) setStackActive(figure);
      });
      rail.addEventListener("focusout", clearStackActive);
      window.addEventListener("resize", function () {
        measure();
        normalize();
      }, { passive: true });

      if (document.readyState === "complete") window.requestAnimationFrame(setStart);
      else window.addEventListener("load", function () { window.requestAnimationFrame(setStart); }, { once: true });
      window.setInterval(function () { step(performance.now()); }, 32);
    });
  })();

  /* --- On-scroll reveals -------------------------------------------------- */
  var animated = document.querySelectorAll("[data-animate], [data-stagger]");
  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Static-export / screenshot mode: ?reveal=1 (or ?print=1) shows everything.
  var showAll = /[?&](reveal|print)=1/.test(window.location.search);

  if (showAll || reduceMotion || !("IntersectionObserver" in window)) {
    animated.forEach(function (el) { el.classList.add("is-visible"); });
    return;
  }

  var revealer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
  );
  animated.forEach(function (el) { revealer.observe(el); });
})();

/* --- Concept reference accordion: horizontal stacked images ----------------
   Every card is ALWAYS its image's true aspect ratio (width = height × ar), so
   nothing is ever cropped — the resting sliver is just the left slice of that
   real image. Hovering (or tapping) opens a card to its full width while the
   others contract (you see less of their edges), a horizontal accordion.
   No borders — the images sit edge to edge; each casts a shadow on the one behind. */
(function conceptAccordion() {
  "use strict";
  var fans = Array.prototype.slice.call(document.querySelectorAll("[data-stack]"));
  if (!fans.length) return;

  var MIN_STEP = 8;         // narrowest a contracted sliver may get
  var HEIGHT_RATIO = 0.9;   // card height as a fraction of the deck height
  var MAX_REVEAL = 0.82;    // cap the opened card to this fraction of the deck width

  // --- Shared soft-fullscreen lightbox (blurred backdrop, page visible behind) ---
  var lb = null, lbImg = null;
  function ensureLightbox() {
    if (lb) return;
    lb = document.createElement("div");
    lb.className = "cc-lightbox";
    lb.setAttribute("aria-hidden", "true");
    lb.setAttribute("role", "dialog");
    lb.setAttribute("aria-modal", "true");
    lb.innerHTML =
      '<img class="cc-lightbox__img" alt="" />' +
      '<button class="cc-lightbox__close" type="button" aria-label="Close">Close</button>';
    document.body.appendChild(lb);
    lbImg = lb.querySelector(".cc-lightbox__img");
    lb.addEventListener("click", function (e) {
      if (e.target === lb || (e.target.closest && e.target.closest(".cc-lightbox__close"))) closeLightbox();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && lb.classList.contains("is-open")) closeLightbox();
    });
  }
  function openLightbox(src, alt) {
    ensureLightbox();
    lbImg.src = src;
    lbImg.alt = alt || "";
    lb.classList.add("is-open");
    lb.setAttribute("aria-hidden", "false");
    document.documentElement.classList.add("cc-lightbox-open");
    if (window.lenis && window.lenis.stop) { try { window.lenis.stop(); } catch (e) {} }
  }
  function closeLightbox() {
    if (!lb) return;
    lb.classList.remove("is-open");
    lb.setAttribute("aria-hidden", "true");
    document.documentElement.classList.remove("cc-lightbox-open");
    if (window.lenis && window.lenis.start) { try { window.lenis.start(); } catch (e) {} }
  }

  fans.forEach(function (stack) {
    var deck = stack.querySelector(".conceptstack__deck");
    if (!deck) return;
    var cards = Array.prototype.slice.call(deck.querySelectorAll(".conceptstack__card"));
    var N = cards.length;
    if (!N) return;

    deck.removeAttribute("role");
    deck.removeAttribute("tabindex");
    deck.removeAttribute("aria-label");

    var ars = [];
    var active = null;
    var pos = 0; // persistent cursor for the prev/next buttons
    var idxEl = stack.querySelector("[data-stack-index]");
    var totalEl = stack.querySelector("[data-stack-total]");
    function pad(n) { return ("0" + n).slice(-2); }
    if (totalEl) totalEl.textContent = pad(N);
    function setCount(i) { if (idxEl) idxEl.textContent = pad(i + 1); }

    cards.forEach(function (card, i) {
      card.setAttribute("tabindex", "0");
      ars[i] = 1.6;
      var img = card.querySelector("img");
      if (img) {
        var setAR = function () {
          if (img.naturalWidth && img.naturalHeight) {
            ars[i] = img.naturalWidth / img.naturalHeight;
            layout(active); // keep the true-aspect widths correct as images load
          }
        };
        if (img.complete && img.naturalWidth) setAR();
        else img.addEventListener("load", setAR, { once: true });
      }
    });

    function cardH() { return Math.round(deck.clientHeight * HEIGHT_RATIO); }
    function widthOf(i) { return cardH() * ars[i]; } // full aspect-ratio width

    // Touch / narrow screens have no hover and 30+ slivers are unusable, so they
    // get a one-image carousel (buttons + swipe) instead of the overlap accordion.
    function isMobile() {
      return window.matchMedia("(hover: none)").matches || window.innerWidth <= 760;
    }

    function layout(act) {
      if (isMobile()) { layoutMobile(act == null ? pos : act); return; }
      deck.style.height = ""; // drop any mobile inline height → back to the CSS clamp
      var deckW = deck.clientWidth, H = cardH();
      var slots = new Array(N); // horizontal advance per card (the visible sliver)
      if (act == null) {
        var s = deckW / N;
        for (var i = 0; i < N; i++) slots[i] = s;
      } else {
        var Wk = Math.min(widthOf(act), deckW * MAX_REVEAL);
        var sO = Math.max(MIN_STEP, (deckW - Wk) / (N - 1));
        for (var j = 0; j < N; j++) slots[j] = j === act ? Wk : sO;
      }
      var x = 0;
      cards.forEach(function (c, i) {
        c.style.left = "0px";        // reset any mobile centering
        c.style.opacity = "1";
        c.style.pointerEvents = "";
        c.style.height = H + "px";
        c.style.width = widthOf(i) + "px"; // always the real aspect ratio
        c.style.transform = "translate(" + x + "px, -50%)";
        c.style.zIndex = i === act ? "999" : String(i); // later cards sit in front
        if (i === act) c.classList.add("is-open");
        else c.classList.remove("is-open");
        x += slots[i];
      });
    }

    // One image at full width, its true aspect ratio, no crop. The deck height
    // follows the shown image (short for wide stills, taller for portraits, capped
    // so it never dominates the screen); the rest fade out. Buttons + swipe step.
    function layoutMobile(shown) {
      var deckW = deck.clientWidth;
      var ar = ars[shown] || 1.6;
      var maxH = Math.round((window.innerHeight || 800) * 0.6);
      var h = deckW / ar;
      if (h > maxH) h = maxH; // very tall portraits are capped
      deck.style.height = Math.round(h) + "px";
      cards.forEach(function (c, i) {
        var a = ars[i] || 1.6;
        var cw = Math.min(deckW, h * a);
        var ch = cw / a;
        c.style.left = "50%";
        c.style.top = "50%";
        c.style.width = cw + "px";
        c.style.height = ch + "px";
        c.style.transform = "translate(-50%, -50%)";
        var on = i === shown;
        c.style.opacity = on ? "1" : "0";
        c.style.zIndex = on ? "2" : "0";
        c.style.pointerEvents = on ? "auto" : "none";
        if (on) c.classList.add("is-open");
        else c.classList.remove("is-open");
      });
      setCount(shown);
    }

    function open(i) { active = i; pos = i; setCount(i); layout(i); }
    function close() { active = null; layout(null); }
    // Buttons move to the immediate neighbour of the current image (no wrap, no jump).
    function step(dir) { open(Math.max(0, Math.min(N - 1, pos + dir))); }

    // Hover (desktop only) maps the pointer's x to a fixed zone, so moving the mouse
    // a little always reveals the very next image — never a jump across the stack.
    deck.addEventListener("mousemove", function (e) {
      if (isMobile()) return;
      var rect = deck.getBoundingClientRect();
      var i = Math.floor((e.clientX - rect.left) / (rect.width / N));
      i = Math.max(0, Math.min(N - 1, i));
      if (i !== active) open(i);
    });
    deck.addEventListener("mouseleave", function () { if (!isMobile()) close(); });

    // Touch: swipe to step; a swipe must not also trigger the lightbox.
    var touchStartX = null, swiping = false;
    deck.addEventListener("touchstart", function (e) {
      touchStartX = e.touches[0].clientX; swiping = false;
    }, { passive: true });
    deck.addEventListener("touchmove", function (e) {
      if (touchStartX != null && Math.abs(e.touches[0].clientX - touchStartX) > 10) swiping = true;
    }, { passive: true });
    deck.addEventListener("touchend", function (e) {
      if (touchStartX == null) return;
      var dx = e.changedTouches[0].clientX - touchStartX;
      touchStartX = null;
      if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
    });

    cards.forEach(function (card, i) {
      card.addEventListener("focus", function () { if (!isMobile()) open(i); });
      card.addEventListener("blur", function () { if (!isMobile() && active === i) close(); });
      // Click / tap opens the image in the soft fullscreen lightbox.
      card.addEventListener("click", function () {
        if (swiping) { swiping = false; return; } // was a swipe, not a tap
        var img = card.querySelector("img");
        if (img) openLightbox(img.currentSrc || img.src, img.alt);
      });
    });

    var prevBtn = stack.querySelector("[data-stack-prev]");
    var nextBtn = stack.querySelector("[data-stack-next]");
    if (prevBtn) prevBtn.addEventListener("click", function (e) { e.preventDefault(); step(-1); });
    if (nextBtn) nextBtn.addEventListener("click", function (e) { e.preventDefault(); step(1); });

    window.addEventListener("resize", function () { layout(active); }, { passive: true });

    setCount(0);
    layout(null);
  });
})();

/* --- Fade the crown panel out once the footer (closing section) is reached --- */
(function crownFooterFade() {
  "use strict";
  var crown = document.querySelector(".client-crown");
  var footer = document.getElementById("contact");
  if (!crown || !footer || !("IntersectionObserver" in window)) return;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      crown.classList.toggle("is-hidden", e.isIntersecting);
    });
  }, { threshold: 0, rootMargin: "0px 0px -35% 0px" });
  io.observe(footer);
})();
