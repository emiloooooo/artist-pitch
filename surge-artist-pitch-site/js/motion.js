/* ============================================================================
   NIMMERSATT — fluid motion layer
   Lenis smooth-scroll + GSAP ScrollTrigger light parallax. Libraries are
   vendored locally under js/vendor/ (no CDN dependency for the pitch).

   Fully gated: with prefers-reduced-motion, or if a library failed to load,
   nothing here runs — the page falls back to native scrolling, no parallax.
   Only transform/opacity are animated. No window 'scroll' listeners.
   ========================================================================== */
(function () {
  "use strict";

  var reduce =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasLibs = window.gsap && window.ScrollTrigger && window.Lenis;
  if (reduce || !hasLibs) return;

  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger;
  gsap.registerPlugin(ScrollTrigger);

  /* --- Lenis: the smooth, weighted scroll that makes the page feel fluid -- */
  var lenis = new window.Lenis({
    duration: 1.05,
    lerp: 0.11,            // lower = heavier, more cinematic glide
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 1.4
  });
  window.lenis = lenis;    // main.js routes back-to-top through this

  // Drive Lenis from GSAP's ticker so scroll + ScrollTrigger share one clock.
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
  gsap.ticker.lagSmoothing(0);

  // Signal the stylesheet that the motion-only CSS (taller parallax images)
  // may now apply.
  document.documentElement.classList.add("motion-on");

  /* --- Smooth in-page anchor jumps go through Lenis ----------------------- */
  document.addEventListener("click", function (e) {
    var a = e.target && e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute("href");
    if (!id || id === "#") return;
    var target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    if (a.hasAttribute("data-scroll-end")) {
      var getPageEnd = function () {
        if (lenis.resize) lenis.resize();
        ScrollTrigger.refresh();
        var nativeEnd = Math.max(
          document.documentElement.scrollHeight,
          document.body.scrollHeight
        ) - window.innerHeight;
        return Math.max(0, nativeEnd, lenis.limit || 0);
      };
      var maxScroll = getPageEnd();
      lenis.scrollTo(maxScroll, { duration: 1.05, force: true, lock: true });
      window.setTimeout(function () {
        lenis.scrollTo(getPageEnd(), { immediate: true, force: true });
      }, 1150);
      return;
    }
    lenis.scrollTo(target, { offset: -8 });
  });

  /* --- Light parallax: media drifts a touch slower than the page ---------- */
  // Images carry extra height in CSS (.motion-on), so the drift never reveals
  // an edge. Each is scrubbed against its own frame moving through the viewport.
  function buildParallax() {
    var imgs = document.querySelectorAll(
      ".case__thumb img, .casefeature .mood img"
    );
    imgs.forEach(function (img) {
      var frame = img.closest(".case__thumb, .mood");
      if (!frame) return;
      gsap.fromTo(
        img,
        { yPercent: -1 },
        {
          yPercent: -9,                 // stays within the 14% overage
          ease: "none",
          scrollTrigger: {
            trigger: frame,
            start: "top bottom",
            end: "bottom top",
            scrub: true
          }
        }
      );
    });
  }

  function start() {
    buildParallax();
    // Fonts (Rock 3D / Martian Mono) change layout heights — remeasure once
    // they're in, so triggers line up with the final layout.
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
    }
    ScrollTrigger.refresh();
  }

  if (document.readyState === "complete") start();
  else window.addEventListener("load", start);
})();
