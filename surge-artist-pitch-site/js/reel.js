/* ===========================================================================
   NIMMERSATT — artist reel overlay
   Clicking a roster artist opens OUR OWN overlay and streams that artist's real
   reel directly from nimmersatt.fyi. Only the .mp4 bytes are cross-origin — we
   never embed the nimmersatt.fyi page, so the visitor never leaves this site.
   Mirrors the real site's player: native controls, the artist's real bio +
   role/based, prev/next between artists, and a clear "Back" control (not an ×).
   =========================================================================== */
(function () {
  "use strict";

  var REEL_BASE = "https://nimmersatt.fyi/assets/artists/";

  // Real per-artist data (role · based · bio) — verbatim from nimmersatt.fyi.
  var DATA = {
    pele:      { role: "Photography", based: "Berlin", bio: "" },
    adrian:    { role: "Director + Writer", based: "Berlin", bio: "Spent many years acting before jumping behind the lens, so he has this incredible way of getting the best out of a cast while keeping everything looking high-end and cinematic." },
    awedis:    { role: "Generative AI", based: "Berlin", bio: "Jumped into the visual world right as the AI wave hit, but he's really an artist at heart who's used that tech to get incredibly experimental with his work." },
    bene:      { role: "Editor + VFX", based: "Berlin", bio: "Is all about efficient, intelligent, modern storytelling, pieces that actually mean and question something, never just productions that go nowhere." },
    bruno:     { role: "Editor + Director", based: "Switzerland", bio: "Is right at home in the styling-rooms at runways and fashion events, where he's mastered the art of capturing those raw, behind-the-scenes moments." },
    clara:     { role: "Writer + Director", based: "Berlin", bio: "Works in film as an actress, while her work as a director is drawn to the delicate beauty of fleeting, often overlooked moments. She is fascinated by atmosphere, by what lingers quietly beneath the surface. Her artistic process is one of constant searching and attentive observation." },
    daniel:    { role: "3D + VFX", based: "Hamburg", bio: "With a strong gaming background, he brings a refined sense of pacing, energy, and immersion to his VFX and motion design, delivering dynamic, visually compelling work at a high-end production level." },
    ella:      { role: "Creative Director + Director of Photography", based: "Berlin", bio: "Connects her background in fashion and music into her experimental visual work, so she has this really instinctive way of operating as a true artist who just knows how to nail a unique vibe." },
    eric:      { role: "Director of Photography", based: "Berlin", bio: "Has a deep understanding of what feels current, drawing from endless inspiration to create work that stays in tune with the zeitgeist. Shaped by experience across a wide range of creative environments, from commercial sets to travel films." },
    finnian:   { role: "Director + Photographer", based: "Berlin", bio: "Has built a really unique career as a photographer and director within the fashion world, giving him this incredible, instinctive eye for creating visuals that feel totally fresh and high-end." },
    francis:   { role: "Editor", based: "Berlin", bio: "Is an editor working across commercial and artistic projects, focusing on precision, structure, and craft. They bring a thoughtful, easygoing presence to the process that keeps everything moving smoothly." },
    iliev:     { role: "VFX + Design", based: "Frankfurt", bio: "Is a young editor from Frankfurt, constantly pushing to expand his craft. Despite being relatively new to the field, he stands out through his fast-paced, chaotic, and flashy editing style, delivering dynamic work with distinctive energy." },
    joost:     { role: "Generative AI", based: "Berlin", bio: "Comes from a background in architecture and 3D-Design, so he has this really structured yet creative way of approaching AI. He's got the technical smarts to push the tools further than most, building pipelines and making his work look incredibly high-end and futuristic." },
    leonardo:  { role: "Director of Photography + Colorist", based: "Berlin", bio: "Brings a serious technical edge to his peculiar and stylistic cinematography, but he's also got this rare production-minded brain that keeps the whole shoot organized and running exactly how it should." },
    lorenz:    { role: "3D + Design", based: "Hamburg", bio: "Has this incredible eye for a very specific Y2K aesthetic, using his graphic design roots to create experiences and visuals that feel both nostalgic and super high-end at the same time." },
    mars:      { role: "Director of Photography", based: "Berlin", bio: "Has many years of experience, ranging from music videos to long-form documentary productions. He works confidently both independently and as part of a team, comfortable with a wide range of camera setups. He especially enjoys getting the most out of minimal resources while always aiming for cinematic, high-quality visuals." },
    otto:      { role: "Creative Director + Writer", based: "Berlin", bio: "Spent years in Berlin's music and fashion industry before shifting his focus to the big picture. He's got this incredible way of stripping a project down to its core to build creative strategies that aren't just high-end, but actually have something to say." },
    rio:       { role: "VFX + Design", based: "Tokyo", bio: "Comes from a graphic design world, which gives him this super sharp eye for composition when he's in the edit suite. He has this way of treating every frame like a piece of art, so his cuts always end up looking incredibly intentional and polished." },
    sebastian: { role: "VFX + Design", based: "Switzerland", bio: "Is this incredible editor originally from Switzerland who has a perfect handle on both high-end commercials and the raw energy of music videos. With his background in design, he has a really sharp way of cutting that makes every project feel distinct and visually intentional." },
    sislej:    { role: "VFX + Design", based: "Switzerland", bio: "Has developed his own visual language by blending motion design with cinematic digital atmospheres. With a sharp eye for composition and a deliberately raw approach, he transforms music and sound into immersive visual worlds." },
    tolga:     { role: "Creative Director", based: "Berlin", bio: "Brings a mix of architectural training from Munich and years of skating in Istanbul, which gives him a unique edge in creative direction. He's got a great eye for design and just knows how to make high-end visuals feel effortless and authentic." }
  };

  var modal = document.getElementById("reel");
  if (!modal) return;
  var video   = modal.querySelector(".reel__video");
  var elName  = modal.querySelector(".reel__name");
  var elRole  = modal.querySelector(".reel__role");
  var elBased = modal.querySelector(".reel__based");
  var elBio   = modal.querySelector(".reel__bio");
  var stage   = modal.querySelector(".reel__stage");
  var back    = modal.querySelector(".reel__back");

  // Roster order drives prev/next. Concept-team links can open the same reel,
  // but they do not alter the ordered roster navigation.
  var rosterLinks = Array.prototype.slice.call(document.querySelectorAll(".artist[data-artist], .projectperson[data-artist]"));
  var links = Array.prototype.slice.call(document.querySelectorAll(".artist[data-artist], .projectperson[data-artist], .concept__person[data-artist]"));
  if (!rosterLinks.length || !links.length) return;
  var order = rosterLinks
    .map(function (a) { return a.getAttribute("data-artist"); })
    .filter(function (slug, idx, arr) { return slug && arr.indexOf(slug) === idx; });
  var firstLinkBySlug = {};
  rosterLinks.forEach(function (a) {
    var slug = a.getAttribute("data-artist");
    if (slug && !firstLinkBySlug[slug]) firstLinkBySlug[slug] = a;
  });
  var current = -1;
  var lastFocus = null;

  // Snapshot the clean names ONCE at init — before any hover can fire the roster
  // name-scramble. Reading .artist__name live (as we used to) could copy a
  // mid-scramble, garbled string into the reel title. The reel name is plain,
  // no animation.
  var names = {};
  rosterLinks.forEach(function (a) {
    var n = a.querySelector(".artist__name");
    names[a.getAttribute("data-artist")] = n ? n.textContent.trim() : a.getAttribute("data-artist");
  });
  links.forEach(function (a) {
    var slug = a.getAttribute("data-artist");
    if (!names[slug]) names[slug] = (a.textContent || slug).trim();
  });

  function nameOf(slug) {
    return names[slug] || slug;
  }

  function setStage(slug) {
    var d = DATA[slug] || {};
    elName.textContent  = nameOf(slug);
    if (elRole)  elRole.textContent  = d.role || "";
    if (elBased) elBased.textContent = d.based || "";
    if (elBio)   elBio.textContent   = d.bio || "";
    stage.classList.add("is-loading");
    try { video.pause(); } catch (e) {}
    video.muted = false;
    video.src = REEL_BASE + slug + ".mp4";
    try { video.load(); } catch (e) {}
    var p = video.play();
    if (p && p.catch) p.catch(function () {
      video.muted = true;
      var p2 = video.play();
      if (p2 && p2.catch) p2.catch(function () {});
    });
  }

  if (video) {
    ["loadeddata", "canplay"].forEach(function (ev) {
      video.addEventListener(ev, function () { stage.classList.remove("is-loading"); });
    });
    // Match the stage box to the reel's real aspect so it never letterboxes
    // (no black side/top bars) — the card simply takes the video's shape.
    video.addEventListener("loadedmetadata", function () {
      if (video.videoWidth && video.videoHeight) {
        stage.style.setProperty("--reel-ar", video.videoWidth + " / " + video.videoHeight);
      }
    });
  }

  function open(slug, focusEl) {
    if (order.indexOf(slug) < 0) return;
    current = order.indexOf(slug);
    lastFocus = focusEl || document.activeElement;
    setStage(slug);
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.documentElement.classList.add("reel-open");
    if (window.lenis && window.lenis.stop) { try { window.lenis.stop(); } catch (e) {} }
    if (back) back.focus();
  }

  function close() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.documentElement.classList.remove("reel-open");
    try { video.pause(); } catch (e) {}
    video.removeAttribute("src");          // abort the cross-origin fetch
    try { video.load(); } catch (e) {}
    stage.classList.remove("is-loading");
    stage.style.removeProperty("--reel-ar");   // reset aspect for the next reel
    if (window.lenis && window.lenis.start) { try { window.lenis.start(); } catch (e) {} }
    if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) {} }
  }

  function step(dir) {
    if (current < 0) return;
    current = (current + dir + order.length) % order.length;
    setStage(order[current]);
    lastFocus = firstLinkBySlug[order[current]] || lastFocus;
  }

  // Roster links open the overlay (href stays as a no-JS fallback).
  links.forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      open(a.getAttribute("data-artist"), a);
    });
  });

  // Overlay controls.
  modal.addEventListener("click", function (e) {
    if (e.target.closest("[data-reel-close]")) { close(); return; }
    if (e.target.closest("[data-reel-prev]"))  { step(-1); return; }
    if (e.target.closest("[data-reel-next]"))  { step(1);  return; }
  });
  document.addEventListener("keydown", function (e) {
    if (!modal.classList.contains("is-open")) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft")  step(-1);
    else if (e.key === "ArrowRight") step(1);
  });
})();
