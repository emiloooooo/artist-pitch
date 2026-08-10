(function () {
  "use strict";

  var nav = document.getElementById("siteNav");
  var progress = document.getElementById("progressBar");
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function updateScrollUI() {
    var top = window.scrollY || document.documentElement.scrollTop;
    var max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    if (nav) nav.classList.toggle("is-scrolled", top > 24);
    if (progress) progress.style.width = Math.min(100, (top / max) * 100) + "%";
  }

  window.addEventListener("scroll", updateScrollUI, { passive: true });
  window.addEventListener("resize", updateScrollUI, { passive: true });
  updateScrollUI();

  var reveals = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));
  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { observer.observe(el); });
  }

  var baseCopy = {
    idea: "You bring the idea and infrastructure.",
    infrastructure: "You bring the infrastructure; the idea needs shaping.",
    brief: "You bring the brief; Nimmersatt can structure the full creative arc."
  };

  var moduleCopy = {
    concept: { label: "Concept", phrase: "a focused concept half-day" },
    artist: { label: "Artist", phrase: "one artist matched to the core craft" },
    unit: { label: "Unit", phrase: "an established artist unit" },
    production: { label: "Production", phrase: "production and communication support" },
    delivery: { label: "Delivery", phrase: "post supervision through delivery" }
  };

  var builder = document.querySelector(".builder");
  var model = document.getElementById("tetrisModel");
  var count = document.getElementById("moduleCount");
  var summary = document.getElementById("builderSummary");
  var mail = document.getElementById("builderMail");

  function selectedValue(name) {
    var input = document.querySelector('input[name="' + name + '"]:checked');
    return input ? input.value : "";
  }

  function selectedModules() {
    return Array.prototype.slice.call(document.querySelectorAll('input[name="module"]:checked')).map(function (input) {
      return input.value;
    });
  }

  function humanList(items) {
    if (items.length === 0) return "a capacity recommendation";
    if (items.length === 1) return items[0];
    if (items.length === 2) return items[0] + " and " + items[1];
    return items.slice(0, -1).join(", ") + ", and " + items[items.length - 1];
  }

  function renderBuilder() {
    if (!model || !summary || !count || !mail) return;
    var base = selectedValue("base") || "idea";
    var modules = selectedModules();
    model.innerHTML = "";

    var baseBlock = document.createElement("span");
    baseBlock.className = "tetris__block tetris__block--base";
    baseBlock.textContent = base === "brief" ? "Your brief" : "Your existing setup";
    model.appendChild(baseBlock);

    modules.forEach(function (key, index) {
      var block = document.createElement("span");
      block.className = "tetris__block tetris__block--" + key;
      block.style.animationDelay = (index * 0.05) + "s";
      block.textContent = moduleCopy[key].label;
      model.appendChild(block);
    });

    count.textContent = modules.length + (modules.length === 1 ? " module" : " modules");
    var phrases = modules.map(function (key) { return moduleCopy[key].phrase; });
    var sentence = baseCopy[base] + " Nimmersatt adds " + humanList(phrases) + ".";
    summary.textContent = sentence;
    mail.href = "mailto:booking@nimmersatt.fyi?subject=" + encodeURIComponent("My modular Nimmersatt setup") + "&body=" + encodeURIComponent(sentence + "\n\nProject / timing:\n");
  }

  if (builder) {
    builder.addEventListener("change", function (event) {
      if (event.target && event.target.name === "module") {
        var checkedArtist = document.querySelector('input[name="module"][value="artist"]');
        var checkedUnit = document.querySelector('input[name="module"][value="unit"]');
        if (event.target.value === "artist" && event.target.checked && checkedUnit) checkedUnit.checked = false;
        if (event.target.value === "unit" && event.target.checked && checkedArtist) checkedArtist.checked = false;
      }
      renderBuilder();
    });
    renderBuilder();
  }
})();
