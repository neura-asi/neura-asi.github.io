(function () {
  const pipeline = document.getElementById("pipeline");
  if (!pipeline) return;

  function setExpanded(panel, open) {
    if (!panel) return;
    if (open) {
      panel.setAttribute("aria-hidden", "false");
      panel.removeAttribute("inert");
      // Force reflow so the 0fr → 1fr transition runs
      void panel.offsetHeight;
      panel.classList.add("is-expanded");
    } else {
      panel.classList.remove("is-expanded");
      panel.setAttribute("aria-hidden", "true");
      panel.setAttribute("inert", "");
    }
  }

  function closeStage(stage) {
    const btn = stage.querySelector(":scope > .stage__node");
    const panel = stage.querySelector(":scope > .stage__panel");
    stage.classList.remove("is-open");
    if (btn) btn.setAttribute("aria-expanded", "false");
    setExpanded(panel, false);
    stage.querySelectorAll(".mem-card.is-open").forEach(closeMemCard);
  }

  function openStage(stage) {
    pipeline.querySelectorAll(".stage.is-open").forEach(function (other) {
      if (other !== stage) closeStage(other);
    });
    const btn = stage.querySelector(":scope > .stage__node");
    const panel = stage.querySelector(":scope > .stage__panel");
    stage.classList.add("is-open");
    if (btn) btn.setAttribute("aria-expanded", "true");
    setExpanded(panel, true);
  }

  function closeMemCard(card) {
    const btn = card.querySelector(":scope > .mem-card__head");
    const body = card.querySelector(":scope > .mem-card__body");
    card.classList.remove("is-open");
    if (btn) btn.setAttribute("aria-expanded", "false");
    setExpanded(body, false);
  }

  function openMemCard(card) {
    const btn = card.querySelector(":scope > .mem-card__head");
    const body = card.querySelector(":scope > .mem-card__body");
    card.classList.add("is-open");
    if (btn) btn.setAttribute("aria-expanded", "true");
    setExpanded(body, true);
  }

  // Start closed + inert
  pipeline.querySelectorAll(".stage__panel, .mem-card__body").forEach(function (panel) {
    panel.setAttribute("inert", "");
    panel.setAttribute("aria-hidden", "true");
  });

  pipeline.addEventListener("click", function (event) {
    const memBtn = event.target.closest(".mem-card__head");
    if (memBtn && pipeline.contains(memBtn)) {
      event.preventDefault();
      const card = memBtn.closest(".mem-card");
      if (!card) return;
      if (card.classList.contains("is-open")) closeMemCard(card);
      else openMemCard(card);
      return;
    }

    const stageBtn = event.target.closest(".stage__node");
    if (stageBtn && pipeline.contains(stageBtn)) {
      event.preventDefault();
      const stage = stageBtn.closest(".stage");
      if (!stage) return;
      if (stage.classList.contains("is-open")) closeStage(stage);
      else openStage(stage);
    }
  });
})();
