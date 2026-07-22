(function () {
  const pipeline = document.getElementById("pipeline");
  if (!pipeline) return;

  const typeTimers = new WeakMap();

  function clearTypewriter(el) {
    const prev = typeTimers.get(el);
    if (prev) {
      window.clearTimeout(prev);
      typeTimers.delete(el);
    }
    el.classList.remove("typing");
  }

  function typewriter(el, text, speed) {
    clearTypewriter(el);
    el.textContent = "";
    el.classList.add("typing");
    let i = 0;
    const step = function () {
      i += 1;
      el.textContent = text.slice(0, i);
      if (i < text.length) {
        const id = window.setTimeout(step, speed + Math.random() * 16);
        typeTimers.set(el, id);
      } else {
        el.classList.remove("typing");
        typeTimers.delete(el);
      }
    };
    const id = window.setTimeout(step, 30);
    typeTimers.set(el, id);
  }

  function typeList(els, alive) {
    els.forEach(function (el, index) {
      const text = el.getAttribute("data-text") || "";
      window.setTimeout(function () {
        if (!alive()) return;
        typewriter(el, text, 14 + Math.min(index * 2, 10));
      }, 180 + index * 100);
    });
  }

  function resetTypewriters(root) {
    root.querySelectorAll(".typewriter").forEach(function (el) {
      clearTypewriter(el);
      el.textContent = "";
    });
  }

  function topLevelTypewriters(branch) {
    const leaves = branch.querySelector(":scope > .tree-leaves");
    if (!leaves) return [];
    return Array.prototype.filter.call(leaves.querySelectorAll(".typewriter"), function (el) {
      return !el.closest(".mem-leaves");
    });
  }

  function closeMem(mem) {
    mem.classList.remove("is-open");
    const btn = mem.querySelector(":scope > .mem-node");
    const leaves = mem.querySelector(":scope > .mem-leaves");
    if (btn) btn.setAttribute("aria-expanded", "false");
    if (leaves) {
      leaves.setAttribute("aria-hidden", "true");
      resetTypewriters(leaves);
    }
  }

  function openMem(mem) {
    mem.classList.add("is-open");
    const btn = mem.querySelector(":scope > .mem-node");
    const leaves = mem.querySelector(":scope > .mem-leaves");
    if (btn) btn.setAttribute("aria-expanded", "true");
    if (leaves) {
      leaves.setAttribute("aria-hidden", "false");
      typeList(leaves.querySelectorAll(".typewriter"), function () {
        return mem.classList.contains("is-open");
      });
    }
  }

  function closeStage(stage) {
    stage.classList.remove("is-open");
    const btn = stage.querySelector(".tree-node");
    const branch = stage.querySelector(".tree-branch");
    if (btn) btn.setAttribute("aria-expanded", "false");
    if (branch) {
      branch.setAttribute("aria-hidden", "true");
      resetTypewriters(branch);
    }
    stage.querySelectorAll(".mem-branch.is-open").forEach(closeMem);
  }

  function openStage(stage) {
    pipeline.querySelectorAll(".tree-stage.is-open").forEach(function (other) {
      if (other !== stage) closeStage(other);
    });
    stage.classList.add("is-open");
    const btn = stage.querySelector(".tree-node");
    const branch = stage.querySelector(".tree-branch");
    if (btn) btn.setAttribute("aria-expanded", "true");
    if (branch) {
      branch.setAttribute("aria-hidden", "false");
      typeList(topLevelTypewriters(branch), function () {
        return stage.classList.contains("is-open");
      });
    }
  }

  // Boot with User open + example prompt typing
  const boot = pipeline.querySelector('.tree-stage[data-stage="user"]');
  if (boot) {
    typeList(topLevelTypewriters(boot.querySelector(".tree-branch")), function () {
      return boot.classList.contains("is-open");
    });
  }

  pipeline.addEventListener("click", function (event) {
    const memBtn = event.target.closest(".mem-node");
    if (memBtn && pipeline.contains(memBtn)) {
      event.preventDefault();
      const mem = memBtn.closest(".mem-branch");
      if (!mem) return;
      if (mem.classList.contains("is-open")) closeMem(mem);
      else openMem(mem);
      return;
    }

    const nodeBtn = event.target.closest(".tree-node");
    if (nodeBtn && pipeline.contains(nodeBtn)) {
      event.preventDefault();
      const stage = nodeBtn.closest(".tree-stage");
      if (!stage) return;
      if (stage.classList.contains("is-open")) closeStage(stage);
      else openStage(stage);
    }
  });
})();
