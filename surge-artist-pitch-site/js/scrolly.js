/* ============================================================================
   NIMMERSATT: scrollytelling (canvas frame-scrub)
   Inspired by the real Nimmersatt site: scrolling scrubs a project's frame
   sequence so each project emerges from a small fragment to the whole, then
   fades to white into the next. Contained to one sticky section (no scroll
   hijacking). Strictly black & white (canvas is grayscaled in CSS).
   ========================================================================== */
(function () {
  "use strict";

  var section = document.getElementById("scrolly");
  var canvas = document.getElementById("scrollyCanvas");
  if (!section || !canvas) return;

  var ctx = canvas.getContext("2d");
  var cap = document.getElementById("scrollyCap");
  var capTitle = document.getElementById("scrollyTitle");
  var capMeta = document.getElementById("scrollyMeta");

  var PROJECTS = [
    { slug: "brat",    frames: 79, title: "Charli XCX",          meta: "Moment · Berlinale · 2026" },
    { slug: "wedding", frames: 79, title: "Soyhan",              meta: "Universal Music · 2025" },
    { slug: "garage",  frames: 79, title: "Berlin Fashion Week", meta: "Reference Studio · FW26" }
  ];

  function frameSrc(slug, i) {
    return "assets/frames/" + slug + "/frame" + String(i).padStart(4, "0") + ".webp";
  }

  // The frame sequence is ~9.6MB (≈40KB/frame × 237). Loading it eagerly on
  // page load saturated the network and wrecked the initial load. Instead we
  // keep empty slots and only start fetching once the section is approaching
  // the viewport (IntersectionObserver with a generous margin, so frames have
  // time to decode before the user arrives). nearest() degrades gracefully
  // until they land.
  var imgs = PROJECTS.map(function (p) { return new Array(p.frames); });
  var framesRequested = false;
  function loadFrames() {
    if (framesRequested) return;
    framesRequested = true;
    PROJECTS.forEach(function (p, pIdx) {
      var arr = imgs[pIdx];
      for (var i = 1; i <= p.frames; i++) {
        var im = new Image();
        im.decoding = "async";
        im.src = frameSrc(p.slug, i);
        arr[i - 1] = im;
      }
    });
  }
  // Arm frame-loading only AFTER the page's critical load has finished, so the
  // 9.6MB sequence never competes with HTML/CSS/fonts/loader on the initial
  // paint. Once armed, an IntersectionObserver (~1.2 viewports of lead) starts
  // the fetch as the section approaches, or immediately if it is already near.
  function armFrameLoading() {
    if ("IntersectionObserver" in window) {
      var frameIO = new IntersectionObserver(function (entries) {
        if (entries.some(function (e) { return e.isIntersecting; })) {
          loadFrames();
          frameIO.disconnect();
        }
      }, { rootMargin: "120% 0px 120% 0px" });
      frameIO.observe(section);
    } else {
      loadFrames();   // no IO support → just load them
    }
  }
  if (document.readyState === "complete") armFrameLoading();
  else window.addEventListener("load", armFrameLoading);

  // Ken Perlin smootherstep with continuous easing (same as the real site).
  function smoother(t) {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    return t * t * t * (t * (6 * t - 15) + 10);
  }
  function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }

  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  function resize() {
    var w = canvas.clientWidth, h = canvas.clientHeight;
    canvas.width = Math.max(1, Math.round(w * dpr));
    canvas.height = Math.max(1, Math.round(h * dpr));
  }

  // Nearest already-decoded frame (graceful while loading).
  function nearest(arr, idx) {
    if (arr[idx] && arr[idx].complete && arr[idx].naturalWidth) return arr[idx];
    for (var d = 1; d < arr.length; d++) {
      var a = arr[idx - d], b = arr[idx + d];
      if (a && a.complete && a.naturalWidth) return a;
      if (b && b.complete && b.naturalWidth) return b;
    }
    return null;
  }

  function draw(img, scale, alpha) {
    var cw = canvas.width, ch = canvas.height;
    ctx.clearRect(0, 0, cw, ch);
    if (!img) return;
    var iw = img.naturalWidth, ih = img.naturalHeight;
    var base = Math.min(cw / iw, ch / ih);   // contain: the whole frame stays visible
    var s = base * scale;
    var dw = iw * s, dh = ih * s;
    ctx.globalAlpha = alpha;
    ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
    ctx.globalAlpha = 1;
  }

  var ticking = false;
  function render() {
    ticking = false;
    var rect = section.getBoundingClientRect();
    var vh = window.innerHeight;
    // Only work while the sticky stage is on screen.
    if (rect.bottom < 0 || rect.top > vh) return;

    var total = section.offsetHeight - vh;
    var scrolled = clamp01(total > 0 ? -rect.top / total : 0);
    var N = PROJECTS.length;
    var g = scrolled * N;                       // 0 .. N
    var pi = Math.min(N - 1, Math.floor(g));
    var local = clamp01(g - pi);                // 0 .. 1 within project
    // Play forward to the END frame while growing, then REVERSE back to the
    // start while shrinking. Only then does the next project emerge. One
    // triangle (0→1→0) drives both the frame index and the scale.
    var tri = local < 0.5 ? (local / 0.5) : (1 - (local - 0.5) / 0.5);
    var e = smoother(clamp01(tri));

    var p = PROJECTS[pi];
    var frameIdx = Math.round(e * (p.frames - 1));   // 0→N on the way out, N→0 back
    // Much smaller than before: a compact clip that never dominates the frame.
    // On phones the contained clip read too small, so enlarge it ~50% (only the
    // contain-fit factor is scaled, so the aspect ratio is preserved and the
    // frame still never overflows; peak 0.54 × 1.5 = 0.81). The section layout
    // is untouched; recomputed each frame so it stays responsive on resize.
    var mobileBoost = window.innerWidth <= 760 ? 1.5 : 1;
    var scale = (0.24 + e * 0.30) * mobileBoost;   // ~0.24→0.54 (×1.5 on phones)
    var alpha = smoother(clamp01(local / 0.08)) * (1 - smoother(clamp01((local - 0.92) / 0.08)));

    draw(nearest(imgs[pi], frameIdx), scale, alpha);

    if (capTitle && capTitle.textContent !== p.title) {
      capTitle.textContent = p.title;
      capMeta.textContent = p.meta;
    }
    if (cap) cap.style.opacity = (alpha * 0.96).toFixed(3);
  }

  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(render); }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", function () { resize(); render(); }, { passive: true });

  // Kick off once the canvas has a box.
  var waitId = setInterval(function () {
    if (canvas.clientWidth) { clearInterval(waitId); resize(); render(); }
  }, 80);

  // Dev/QA helper: ?sy=0.4 jumps to 40% through this section (for screenshots).
  var m = window.location.search.match(/[?&]sy=([0-9.]+)/);
  if (m) {
    window.addEventListener("load", function () {
      setTimeout(function () {
        var total = section.offsetHeight - window.innerHeight;
        var y = section.offsetTop + total * clamp01(parseFloat(m[1]));
        if (window.lenis) window.lenis.scrollTo(y, { immediate: true });
        else window.scrollTo(0, y);
      }, 700);
    });
  }
})();
