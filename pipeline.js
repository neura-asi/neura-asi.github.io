(function () {
  const pipeline = document.getElementById("pipeline");
  if (!pipeline) return;

  const form = document.getElementById("prompt-form");
  const input = document.getElementById("prompt-input");
  const sendBtn = document.getElementById("prompt-send");
  const stopBtn = document.getElementById("prompt-stop");
  const barText = document.getElementById("sim-bar-text");
  const simBar = document.getElementById("sim-bar");

  const STAGE_ORDER = [
    "user",
    "intent",
    "planner",
    "memory",
    "tools",
    "symbolic",
    "ai",
    "verification",
    "answer",
  ];

  const MEM_ORDER = ["graph", "vault", "cache", "sidecar"];

  let simulating = false;
  let simToken = 0;
  const typeTimers = new WeakMap();
  const pendingTimeouts = [];

  function setBar(msg, mode) {
    if (barText) barText.textContent = msg;
    if (simBar) {
      simBar.classList.remove("is-run", "is-done", "is-idle");
      simBar.classList.add(mode || "is-idle");
    }
  }

  function wait(ms) {
    return new Promise(function (resolve) {
      const id = window.setTimeout(resolve, ms);
      pendingTimeouts.push(id);
    });
  }

  function clearPending() {
    while (pendingTimeouts.length) {
      window.clearTimeout(pendingTimeouts.pop());
    }
  }

  function clearTypewriter(el) {
    const prev = typeTimers.get(el);
    if (prev) {
      window.clearTimeout(prev);
      typeTimers.delete(el);
    }
    el.classList.remove("typing");
  }

  function typewriter(el, text, speed) {
    return new Promise(function (resolve) {
      clearTypewriter(el);
      el.textContent = "";
      el.classList.add("typing");
      let i = 0;
      const step = function () {
        if (el.getAttribute("data-sim") !== String(simToken)) {
          clearTypewriter(el);
          resolve();
          return;
        }
        i += 1;
        el.textContent = text.slice(0, i);
        if (i < text.length) {
          const id = window.setTimeout(step, speed + Math.random() * 12);
          typeTimers.set(el, id);
          pendingTimeouts.push(id);
        } else {
          el.classList.remove("typing");
          typeTimers.delete(el);
          resolve();
        }
      };
      const id = window.setTimeout(step, 20);
      typeTimers.set(el, id);
      pendingTimeouts.push(id);
    });
  }

  function field(name) {
    return pipeline.querySelector('[data-field="' + name + '"]');
  }

  function setFieldText(name, text) {
    const el = field(name);
    if (!el) return null;
    el.setAttribute("data-text", text);
    el.setAttribute("data-sim", String(simToken));
    return el;
  }

  function resetAllFields() {
    pipeline.querySelectorAll("[data-field]").forEach(function (el) {
      clearTypewriter(el);
      el.textContent = "";
      el.setAttribute("data-text", "—");
    });
  }

  function slugify(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 5)
      .join("_")
      .slice(0, 48) || "general_request";
  }

  function keywords(text) {
    const stop = {
      a: 1, an: 1, the: 1, to: 1, and: 1, or: 1, for: 1, of: 1, in: 1, on: 1,
      with: 1, keep: 1, dont: 1, be: 1, is: 1, are: 1, it: 1, this: 1,
      that: 1, my: 1, me: 1, i: 1, please: 1, can: 1, you: 1,
    };
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s.+_-]/g, " ")
      .split(/\s+/)
      .filter(function (w) {
        return w.length > 2 && !stop[w];
      })
      .slice(0, 8);
  }

  function guessFiles(keys, prompt) {
    const files = [];
    const p = prompt.toLowerCase();
    if (/auth|login|session|cookie|api.?key/.test(p)) {
      files.push("src/auth/middleware.ts", "src/cli/login.ts", "tests/auth.test.ts");
    }
    if (/test|jest|vitest|pytest/.test(p)) files.push("tests/suite.test.ts");
    if (/docker|deploy|ci/.test(p)) files.push(".github/workflows/ci.yml", "Dockerfile");
    if (/readme|doc/.test(p)) files.push("README.md");
    if (/css|ui|page|frontend|react/.test(p)) files.push("src/ui/App.tsx", "src/styles.css");
    if (/db|sql|schema|migrate/.test(p)) files.push("db/migrations/001.sql", "src/db/client.ts");
    if (!files.length) {
      const base = keys[0] || "app";
      files.push("src/" + base + ".ts", "tests/" + base + ".test.ts");
    }
    return files.slice(0, 4).join(" · ");
  }

  function buildSimulation(prompt) {
    const keys = keywords(prompt);
    const intent = slugify(prompt);
    const files = guessFiles(keys, prompt);
    const topic = keys.slice(0, 3).join(" ") || "request";
    const conf = (0.82 + Math.min(keys.length, 6) * 0.02).toFixed(2);
    const confOut = (0.9 + Math.random() * 0.07).toFixed(2);
    const short = prompt.length > 72 ? prompt.slice(0, 69).trim() + "…" : prompt;
    const ctxId = Math.random().toString(16).slice(2, 6);

    const needsCode = /code|refactor|fix|implement|bug|test|auth|api|ui|build/.test(prompt.toLowerCase());
    const route = needsCode ? "hybrid — local draft, remote harden" : "local — fast path";

    return {
      "user.session": "session_" + Date.now().toString(36) + " · reasoning opened",
      "intent.intent": intent,
      "intent.files": files,
      "intent.constraints": keys.slice(0, 4).join(" · ") || "complete request faithfully",
      "intent.tools": needsCode ? "read · edit · test · git_diff · search" : "search · memory · summarize",
      "intent.confidence": conf,
      "planner.1": "read context for “" + topic + "”",
      "planner.2": "search memory / cache for prior “" + (keys[0] || "work") + "”",
      "planner.3": needsCode ? "run tools → apply changes" : "assemble retrieved context",
      "planner.4": "generate response + verify",
      "memory.graph.hit": "related memory: “" + topic + "” preferences / decisions",
      "memory.graph.edges": "preference → project → “" + (keys[0] || "task") + "”",
      "memory.graph.retrieve": "embed(“" + short + "”) → cascade nearby nodes",
      "memory.vault.compress": 'prior turn → <ctx id="' + ctxId + '">',
      "memory.vault.store": "exact text stored locally",
      "memory.vault.restore": ".ctx_get(" + ctxId + ") → original on demand",
      "memory.cache.lookup": "signature(“" + intent + "”) → miss",
      "memory.cache.path": "execute normally → save result",
      "memory.sidecar.note": "helper model — not the main AI",
      "memory.sidecar.jobs": "extract · merge · summarize · verify · contradict",
      "tools.files": "read/patch → " + files.split(" · ")[0],
      "tools.shell": needsCode ? "test runner · lint touched files" : "skip heavy shell",
      "tools.git": "diff staged changes for review",
      "tools.search": "grep “" + (keys.slice(0, 2).join("|") || "topic") + "”",
      "symbolic.task": "validate structured fields / formats in plan",
      "symbolic.engine": "regex · dates · json/yaml — no LLM",
      "symbolic.result": "verified deterministic ✓",
      "ai.route": route,
      "ai.local": "outline approach for “" + topic + "”",
      "ai.remote": needsCode ? "finalize implementation details" : "polish final wording",
      "verification.tools": "✓ tool outputs match plan",
      "verification.tests": needsCode ? "✓ checks passed" : "✓ consistency checks passed",
      "verification.evidence": "✓ evidence ledger updated",
      "verification.confidence": confOut + " → trusted",
      "answer.response":
        "Done. For “" + short + "” Neura planned, retrieved memory, used tools where needed, verified the result, and is ready for the next turn.",
    };
  }

  function closeMem(mem) {
    mem.classList.remove("is-open", "is-active");
    const btn = mem.querySelector(":scope > .mem-node");
    const leaves = mem.querySelector(":scope > .mem-leaves");
    if (btn) btn.setAttribute("aria-expanded", "false");
    if (leaves) leaves.setAttribute("aria-hidden", "true");
  }

  function openMem(mem) {
    mem.classList.add("is-open", "is-active");
    const btn = mem.querySelector(":scope > .mem-node");
    const leaves = mem.querySelector(":scope > .mem-leaves");
    if (btn) btn.setAttribute("aria-expanded", "true");
    if (leaves) leaves.setAttribute("aria-hidden", "false");
  }

  function setStageState(stage, state) {
    stage.classList.remove("is-open", "is-active", "is-done", "is-flow");
    if (state) stage.classList.add(state);
    const btn = stage.querySelector(".tree-node");
    const branch = stage.querySelector(".tree-branch");
    const open = state === "is-open" || state === "is-active";
    if (btn) btn.setAttribute("aria-expanded", open ? "true" : "false");
    if (branch) branch.setAttribute("aria-hidden", open ? "false" : "true");
    if (!open) stage.querySelectorAll(".mem-branch.is-open").forEach(closeMem);
  }

  function stageEl(name) {
    return pipeline.querySelector('.tree-stage[data-stage="' + name + '"]');
  }

  async function pulseConnector(fromStage) {
    const connector = fromStage.querySelector(":scope > .tree-connector");
    if (!connector) return;
    const packet = connector.querySelector(".flow-packet");
    connector.classList.add("is-flowing");
    if (packet) {
      packet.classList.remove("is-travel");
      void packet.offsetWidth;
      packet.classList.add("is-travel");
    }
    await wait(520);
    connector.classList.remove("is-flowing");
  }

  async function typeNamed(map, names) {
    for (let i = 0; i < names.length; i++) {
      if (!simulating) return;
      const name = names[i];
      const el = setFieldText(name, map[name] || "—");
      if (el) await typewriter(el, map[name] || "—", 11 + Math.min(i, 6));
      await wait(90);
    }
  }

  async function runStage(name, map) {
    const stage = stageEl(name);
    if (!stage) return;

    STAGE_ORDER.forEach(function (s) {
      const el = stageEl(s);
      if (!el || el === stage) return;
      if (el.classList.contains("is-active") || el.classList.contains("is-open")) {
        setStageState(el, "is-done");
      }
    });

    setStageState(stage, "is-active");
    stage.scrollIntoView({ behavior: "smooth", block: "nearest" });
    await wait(180);

    if (name === "user") {
      setBar("User · receiving prompt", "is-run");
      await typeNamed(map, ["user.session"]);
    } else if (name === "intent") {
      setBar("Intent Parser · structuring request", "is-run");
      await typeNamed(map, [
        "intent.intent",
        "intent.files",
        "intent.constraints",
        "intent.tools",
        "intent.confidence",
      ]);
    } else if (name === "planner") {
      setBar("Planner · building execution plan", "is-run");
      await typeNamed(map, ["planner.1", "planner.2", "planner.3", "planner.4"]);
    } else if (name === "memory") {
      setBar("Memory System · retrieving reusable work", "is-run");
      for (let i = 0; i < MEM_ORDER.length; i++) {
        if (!simulating) return;
        const mem = stage.querySelector('.mem-branch[data-mem="' + MEM_ORDER[i] + '"]');
        if (!mem) continue;
        stage.querySelectorAll(".mem-branch.is-open").forEach(function (other) {
          if (other !== mem) {
            other.classList.remove("is-active");
            other.classList.add("is-done");
          }
        });
        openMem(mem);
        const prefix = "memory." + MEM_ORDER[i] + ".";
        const names = Object.keys(map).filter(function (k) {
          return k.indexOf(prefix) === 0;
        });
        setBar("Memory · " + MEM_ORDER[i], "is-run");
        await typeNamed(map, names);
        mem.classList.remove("is-active");
        mem.classList.add("is-done");
        await wait(160);
      }
    } else if (name === "tools") {
      setBar("Tools · performing real work", "is-run");
      await typeNamed(map, ["tools.files", "tools.shell", "tools.git", "tools.search"]);
    } else if (name === "symbolic") {
      setBar("Symbolic Engine · deterministic path", "is-run");
      await typeNamed(map, ["symbolic.task", "symbolic.engine", "symbolic.result"]);
    } else if (name === "ai") {
      setBar("Local / Remote AI · routing & generating", "is-run");
      await typeNamed(map, ["ai.route", "ai.local", "ai.remote"]);
    } else if (name === "verification") {
      setBar("Verification · checking evidence", "is-run");
      await typeNamed(map, [
        "verification.tools",
        "verification.tests",
        "verification.evidence",
        "verification.confidence",
      ]);
    } else if (name === "answer") {
      setBar("Answer · returning verified response", "is-run");
      await typeNamed(map, ["answer.response"]);
    }

    setStageState(stage, "is-done");
    // Keep branch visible after done during sim
    stage.classList.add("is-open", "is-done");
    const btn = stage.querySelector(".tree-node");
    const branch = stage.querySelector(".tree-branch");
    if (btn) btn.setAttribute("aria-expanded", "true");
    if (branch) branch.setAttribute("aria-hidden", "false");
  }

  async function runSimulation(prompt) {
    simToken += 1;
    simulating = true;
    clearPending();
    pipeline.classList.add("is-simulating");
    if (sendBtn) sendBtn.disabled = true;
    if (input) input.disabled = true;
    if (stopBtn) stopBtn.hidden = false;

    resetAllFields();
    STAGE_ORDER.forEach(function (name) {
      const el = stageEl(name);
      if (el) {
        setStageState(el, null);
        el.classList.remove("is-done", "is-active", "is-open", "is-flow");
      }
    });
    pipeline.querySelectorAll(".mem-branch").forEach(function (m) {
      closeMem(m);
      m.classList.remove("is-done");
    });

    const map = buildSimulation(prompt);
    setBar("Starting inference simulation…", "is-run");

    // Open user with composer still visible
    const user = stageEl("user");
    setStageState(user, "is-active");
    await wait(250);
    await typeNamed(map, ["user.session"]);
    await wait(200);
    await pulseConnector(user);
    setStageState(user, "is-done");
    user.classList.add("is-open", "is-done");

    for (let i = 1; i < STAGE_ORDER.length; i++) {
      if (!simulating) return;
      const name = STAGE_ORDER[i];
      const prev = stageEl(STAGE_ORDER[i - 1]);
      if (prev && i > 1) await pulseConnector(prev);
      else if (i === 1) {
        /* already pulsed from user */
      }
      await runStage(name, map);
      await wait(220);
    }

    if (!simulating) return;
    setBar("Simulation complete — click any stage to inspect, or send another prompt.", "is-done");
    finishSim(false);
  }

  function finishSim(stopped) {
    simulating = false;
    clearPending();
    pipeline.classList.remove("is-simulating");
    if (sendBtn) sendBtn.disabled = false;
    if (input) input.disabled = false;
    if (stopBtn) stopBtn.hidden = true;
    if (stopped) setBar("Simulation stopped.", "is-idle");
  }

  function stopSimulation() {
    if (!simulating) return;
    simToken += 1;
    simulating = false;
    clearPending();
    pipeline.querySelectorAll(".typewriter.typing").forEach(clearTypewriter);
    finishSim(true);
  }

  // Manual click explore (disabled interaction steal during sim except stop)
  function openStageManual(stage) {
    if (simulating) return;
    pipeline.querySelectorAll(".tree-stage.is-open").forEach(function (other) {
      if (other !== stage) {
        other.classList.remove("is-open", "is-active");
        const b = other.querySelector(".tree-node");
        const br = other.querySelector(".tree-branch");
        if (b) b.setAttribute("aria-expanded", "false");
        if (br) br.setAttribute("aria-hidden", "true");
        other.querySelectorAll(".mem-branch.is-open").forEach(closeMem);
      }
    });
    stage.classList.add("is-open", "is-active");
    stage.classList.remove("is-done");
    const btn = stage.querySelector(".tree-node");
    const branch = stage.querySelector(".tree-branch");
    if (btn) btn.setAttribute("aria-expanded", "true");
    if (branch) {
      branch.setAttribute("aria-hidden", "false");
      const els = Array.prototype.filter.call(branch.querySelectorAll(".typewriter"), function (el) {
        return !el.closest(".mem-leaves");
      });
      els.forEach(function (el, index) {
        const text = el.getAttribute("data-text") || "";
        if (!text || text === "—") return;
        window.setTimeout(function () {
          el.setAttribute("data-sim", String(simToken));
          typewriter(el, text, 14);
        }, 120 + index * 80);
      });
    }
  }

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      const prompt = (input && input.value ? input.value : "").trim();
      if (!prompt) {
        setBar("Enter a prompt to simulate.", "is-idle");
        if (input) input.focus();
        return;
      }
      runSimulation(prompt);
    });
  }

  if (stopBtn) {
    stopBtn.addEventListener("click", function (event) {
      event.preventDefault();
      stopSimulation();
    });
  }

  if (input) {
    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        form.requestSubmit();
      }
    });
  }

  pipeline.addEventListener("click", function (event) {
    if (event.target.closest(".composer")) return;

    const memBtn = event.target.closest(".mem-node");
    if (memBtn && pipeline.contains(memBtn)) {
      if (simulating) return;
      event.preventDefault();
      const mem = memBtn.closest(".mem-branch");
      if (!mem) return;
      if (mem.classList.contains("is-open")) closeMem(mem);
      else {
        openMem(mem);
        const leaves = mem.querySelectorAll(".typewriter");
        leaves.forEach(function (el, index) {
          const text = el.getAttribute("data-text") || "";
          if (!text || text === "—") return;
          window.setTimeout(function () {
            el.setAttribute("data-sim", String(simToken));
            typewriter(el, text, 14);
          }, 100 + index * 80);
        });
      }
      return;
    }

    const nodeBtn = event.target.closest(".tree-node");
    if (nodeBtn && pipeline.contains(nodeBtn)) {
      if (simulating) return;
      event.preventDefault();
      const stage = nodeBtn.closest(".tree-stage");
      if (!stage) return;
      if (stage.classList.contains("is-open") && !stage.classList.contains("is-done")) {
        stage.classList.remove("is-open", "is-active");
        const b = stage.querySelector(".tree-node");
        const br = stage.querySelector(".tree-branch");
        if (b) b.setAttribute("aria-expanded", "false");
        if (br) br.setAttribute("aria-hidden", "true");
      } else {
        openStageManual(stage);
      }
    }
  });

  setBar("Ready — enter a prompt to run a full inference simulation.", "is-idle");
})();
