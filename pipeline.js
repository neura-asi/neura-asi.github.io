(function () {
  const pipeline = document.getElementById("pipeline");
  if (!pipeline) return;

  const input = document.getElementById("prompt-input");
  const barText = document.getElementById("sim-bar-text");
  const simBar = document.getElementById("sim-bar");
  const btnPause = document.getElementById("btn-pause");
  const btnSlow = document.getElementById("btn-slow");
  const btnNext = document.getElementById("btn-next");
  const playbackMeta = document.getElementById("playback-meta");

  const PROMPTS = [
    "Refactor auth middleware to support API keys + session cookies without breaking CLI login.",
    "Find why the CI pipeline fails only on ubuntu-latest and propose a minimal fix.",
    "Add dark mode to the settings page and keep the existing design tokens.",
    "Summarize the last three design decisions about the memory graph and cite sources.",
    "Write a migration to add a users.api_key_hash column and update the ORM models.",
    "Debug the flaky websocket reconnect test — it fails about 1 in 8 runs.",
    "Generate a changelog for commits since v0.4.2 focused on user-facing changes.",
    "Optimize the context vault compression path — large chats are still too slow.",
    "Create a Dockerfile for the inference sidecar that stays under 200MB.",
    "Explain how cache hits interact with the planner before tools are invoked.",
    "Patch the regex date parser so ISO weeks and timezones parse correctly.",
    "Search the repo for unused feature flags and list safe deletion candidates.",
    "Draft an ADR for hybrid local/remote model routing with hardware constraints.",
    "Fix the race where verification reads files before the tool write completes.",
    "Convert the YAML config schema to JSON Schema and validate on startup.",
    "Build a small script that replays a cached tool result for offline demos.",
    "Update the README quickstart for Apple Silicon and CUDA hosts.",
    "Investigate why embedding search returns stale memories after consolidation.",
    "Add unit tests for the symbolic engine unit-conversion helpers.",
    "Plan a safe rollout of the new intent parser behind a 10% traffic flag.",
  ];

  const STAGE_ORDER = [
    "user",
    "context",
    "memory",
    "sidecar",
    "diet",
    "assemble",
    "provider",
    "runtime",
    "answer",
    "after",
  ];

  const NESTED = {
    memory: ["embed", "graph"],
    diet: ["vault", "tokens"],
    runtime: ["stream", "tools", "ctx", "recover"],
    after: ["persist", "extract", "maintain"],
  };

  const SURFACES = ["TUI / desktop UI", "CLI / headless", "remote / mobile bridge", "dapp / widget bridge"];

  let simulating = false;
  let simToken = 0;
  let promptIndex = 0;
  let loopTimer = null;
  let paused = false;
  let speedFactor = 1;
  const typeTimers = new WeakMap();
  const pendingTimeouts = [];
  const sleepResolvers = [];

  function setBar(msg, mode) {
    if (barText) barText.textContent = msg;
    if (simBar) {
      simBar.classList.remove("is-run", "is-done", "is-idle", "is-paused");
      if (paused && mode !== "is-idle") {
        simBar.classList.add("is-paused");
      } else {
        simBar.classList.add(mode || "is-idle");
      }
    }
  }

  function syncPlaybackUI() {
    if (btnPause) {
      btnPause.textContent = paused ? "Resume" : "Pause";
      btnPause.setAttribute("aria-pressed", paused ? "true" : "false");
    }
    if (btnSlow) {
      btnSlow.textContent = speedFactor > 1 ? "Slow · on" : "Slow";
      btnSlow.setAttribute("aria-pressed", speedFactor > 1 ? "true" : "false");
    }
    if (btnNext) {
      btnNext.textContent = simulating || loopTimer ? "Next" : "Start";
    }
    if (playbackMeta) {
      playbackMeta.textContent = promptIndex + 1 + " / " + PROMPTS.length;
    }
    document.body.classList.toggle("is-paused", paused);
    document.body.classList.toggle("is-slow", speedFactor > 1);
  }

  function sleep(ms) {
    return new Promise(function (resolve) {
      const id = window.setTimeout(function () {
        resolve();
      }, ms);
      pendingTimeouts.push(id);
      sleepResolvers.push(resolve);
    });
  }

  async function wait(ms) {
    const token = simToken;
    let left = Math.max(0, ms * speedFactor);
    while (left > 0) {
      if (!simulating || simToken !== token) return;
      while (paused) {
        await sleep(60);
        if (!simulating || simToken !== token) return;
      }
      const slice = Math.min(60, left);
      await sleep(slice);
      if (simToken !== token) return;
      left -= slice;
    }
  }

  function clearPending() {
    while (pendingTimeouts.length) window.clearTimeout(pendingTimeouts.pop());
    while (sleepResolvers.length) sleepResolvers.pop()();
    if (loopTimer) {
      window.clearTimeout(loopTimer);
      loopTimer = null;
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
        if (paused) {
          const id = window.setTimeout(step, 70);
          typeTimers.set(el, id);
          pendingTimeouts.push(id);
          return;
        }
        const chunk =
          speedFactor >= 2.5 ? 1 : text.length > 80 ? 3 : text.length > 40 ? 2 : 1;
        i = Math.min(text.length, i + chunk);
        el.textContent = text.slice(0, i);
        if (i < text.length) {
          const delay = (speed + Math.random() * 8) * speedFactor;
          const id = window.setTimeout(step, delay);
          typeTimers.set(el, id);
          pendingTimeouts.push(id);
        } else {
          el.classList.remove("typing");
          typeTimers.delete(el);
          resolve();
        }
      };
      const id = window.setTimeout(step, 16);
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

  function keywords(text) {
    const stop = {
      a: 1, an: 1, the: 1, to: 1, and: 1, or: 1, for: 1, of: 1, in: 1, on: 1,
      with: 1, keep: 1, dont: 1, be: 1, is: 1, are: 1, it: 1, this: 1,
      that: 1, my: 1, me: 1, i: 1, please: 1, can: 1, you: 1, why: 1, how: 1,
      only: 1, about: 1, from: 1, into: 1, under: 1, after: 1, without: 1,
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

  function slugify(text) {
    return (
      text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 5)
        .join("_")
        .slice(0, 48) || "general_request"
    );
  }

  function buildSimulation(prompt) {
    const keys = keywords(prompt);
    const topic = keys.slice(0, 3).join(" ") || "request";
    const short = prompt.length > 68 ? prompt.slice(0, 65).trim() + "…" : prompt;
    const ctxId = Math.random().toString(16).slice(2, 8);
    const surface = SURFACES[promptIndex % SURFACES.length];
    const sid = "sess_" + Date.now().toString(36);
    const needsTools = /fix|refactor|debug|test|migration|docker|search|patch|script|readme|schema|race|ci/.test(
      prompt.toLowerCase()
    );
    const sidecarOn = promptIndex % 3 !== 2;

    return {
      "user.prompt": prompt,
      "user.surface": surface,
      "user.captures": "session · cwd · model · tools · UI state · recent chat",
      "user.session": "~/.neura/sessions/" + sid,

      "context.gather": "prompt · recent messages · system/dev instructions · cwd · model",
      "context.tools": "tool schemas · recent tool outputs · background tasks",
      "context.state": "project/global memories · ctx refs · latent/reflection · workspace meta",
      "context.note": "model does not see the whole machine — curated pool only",

      "memory.store": "~/.neura/memory/global.json · projects/*.json",
      "memory.embed.query": "embed(“" + short + "”) via local MiniLM",
      "memory.embed.hits": "nearest nodes for “" + topic + "”",
      "memory.graph.edges": "supports · contradicts · depends_on · supersedes · similar_to",
      "memory.graph.rank": "cascade related nodes → ranked memory candidates",

      "sidecar.note": "optional helper — not the main reasoning model",
      "sidecar.jobs": "relevance · extract · summarize · contradict · consolidate",
      "sidecar.status": sidecarOn
        ? "reachable · OpenAI-compatible / Ollama / local GGUF"
        : "unavailable → embedding-only fallback",

      "diet.vault.compress": 'bulky block → <ctx v=1 id="ctx:' + ctxId + '" s="…"/>',
      "diet.vault.store": "~/.neura/ctx-vault/" + ctxId.slice(0, 2) + "/" + ctxId + ".json",
      "diet.vault.rule": "do not invent hidden details — request .ctx_get if exact text needed",
      "diet.tokens.tokenizer": "~/.neura/models/all-MiniLM-L6-v2/tokenizer.json",
      "diet.tokens.uses": "compact threshold · memory packing · oversized-prompt guard · telemetry",

      "assemble.layers": "system · developer/harness · tool rules · vault decoder · recent msgs",
      "assemble.memory": "injected anchors / .mem_get pointers (not always full dumps)",
      "assemble.request": "current user request + tool schemas → final message list",

      "provider.route": needsTools ? "remote OpenAI-compatible · streaming on" : "local endpoint · streaming on",
      "provider.handles": "auth · JSON shape · stream parse · failover · context-limit errors",
      "provider.vs": "sidecar prepares/supports · provider model generates answer/tool calls",

      "runtime.stream.deltas": "text · reasoning · tool calls · stop · usage/compaction meta",
      "runtime.stream.pause": needsTools ? "tool call detected → pause completion" : "stream toward final answer",
      "runtime.tools.run": needsTools
        ? "harness runs shell/files/grep/patch/browser/MCP — not the model"
        : "no tool call this turn",
      "runtime.tools.return": needsTools
        ? "normalize · maybe compact → append → model continues"
        : "skip tool round-trip",
      "runtime.ctx.intercept": ".ctx_get id=ctx:" + ctxId + " / .ctx_search / .mem_get",
      "runtime.ctx.inject": "load exact text from vault or stash → system reminder → continue",
      "runtime.recover.limit": "provider too-large → compact older msgs → retry",
      "runtime.recover.latent": "reflection priors filtered — tools still win over observer claims",

      "answer.response":
        "Final assistant response for “" + short + "” — no pending tools, ctx_get, or recovery.",
      "answer.save": "assistant message written into session " + sid,

      "after.persist.write": "messages · tools · compression stats · retrieval diagnostics",
      "after.persist.logs": "~/.neura/logs · interlang-stats.jsonl · live_operational_fabric/",
      "after.extract.sidecar": sidecarOn
        ? "sidecar extracts durable prefs/facts/workflows/decisions as JSON"
        : "skip extract — sidecar offline",
      "after.extract.keep": "write durable nodes into project memory graph",
      "after.maintain.garden": "link · decay · prune · consolidate · contradict · re-embed · cluster",
      "after.maintain.next": "local state ready — next prompt reuses memory/vault/telemetry",
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
    mem.classList.remove("is-done");
    const btn = mem.querySelector(":scope > .mem-node");
    const leaves = mem.querySelector(":scope > .mem-leaves");
    if (btn) btn.setAttribute("aria-expanded", "true");
    if (leaves) leaves.setAttribute("aria-hidden", "false");
  }

  function keepBranchOpen(stage) {
    const btn = stage.querySelector(".tree-node");
    const branch = stage.querySelector(".tree-branch");
    if (btn) btn.setAttribute("aria-expanded", "true");
    if (branch) branch.setAttribute("aria-hidden", "false");
  }

  function activateStage(stage) {
    stage.classList.add("is-open", "is-active");
    stage.classList.remove("is-done");
    keepBranchOpen(stage);
  }

  function completeStage(stage) {
    stage.classList.remove("is-active");
    stage.classList.add("is-open", "is-done");
    keepBranchOpen(stage);
  }

  function resetStage(stage) {
    stage.classList.remove("is-open", "is-active", "is-done", "is-flow");
    const btn = stage.querySelector(".tree-node");
    const branch = stage.querySelector(".tree-branch");
    if (btn) btn.setAttribute("aria-expanded", "false");
    if (branch) branch.setAttribute("aria-hidden", "true");
    stage.querySelectorAll(".mem-branch").forEach(function (mem) {
      closeMem(mem);
      mem.classList.remove("is-done");
    });
  }

  function stageEl(name) {
    return pipeline.querySelector('.tree-stage[data-stage="' + name + '"]');
  }

  async function pulseConnector(fromStage) {
    const connector = fromStage && fromStage.querySelector(":scope > .tree-connector");
    if (!connector) return;
    const packet = connector.querySelector(".flow-packet");
    connector.classList.add("is-flowing");
    if (packet) {
      packet.classList.remove("is-travel");
      void packet.offsetWidth;
      packet.classList.add("is-travel");
    }
    await wait(340);
    connector.classList.remove("is-flowing");
  }

  async function revealNamed(map, names) {
    const token = simToken;
    for (let i = 0; i < names.length; i++) {
      if (!simulating || simToken !== token) return;
      const name = names[i];
      const text = map[name] || "—";
      const el = setFieldText(name, text);
      if (!el) continue;

      const typeIt =
        /\.(prompt|response)$/.test(name) ||
        (text.length > 58 && !text.includes(" · ") && text.indexOf("~/.neura") !== 0);

      if (typeIt) {
        const speed = text.length > 90 ? 4 : text.length > 50 ? 6 : 8;
        await typewriter(el, text, speed);
        if (simToken !== token) return;
        await wait(40);
      } else {
        // Metadata / paths / chip-lists appear instantly with a flash
        el.classList.remove("typing");
        el.classList.add("reveal-flash");
        el.textContent = text;
        await wait(70);
        if (simToken !== token) return;
        el.classList.remove("reveal-flash");
        await wait(35);
      }
    }
  }

  async function runNested(stage, stageName, map) {
    const order = NESTED[stageName] || [];
    for (let i = 0; i < order.length; i++) {
      if (!simulating) return;
      const mem = stage.querySelector('.mem-branch[data-mem="' + order[i] + '"]');
      if (!mem) continue;
      stage.querySelectorAll(".mem-branch.is-active").forEach(function (other) {
        if (other !== mem) {
          other.classList.remove("is-active");
          other.classList.add("is-open", "is-done");
        }
      });
      openMem(mem);
      const keys = Object.keys(map).filter(function (k) {
        if (stageName === "memory") return k.indexOf("memory." + order[i] + ".") === 0;
        if (stageName === "diet") return k.indexOf("diet." + order[i] + ".") === 0;
        if (stageName === "runtime") return k.indexOf("runtime." + order[i] + ".") === 0;
        if (stageName === "after") return k.indexOf("after." + order[i] + ".") === 0;
        return false;
      });
      setBar(stageName + " · " + order[i], "is-run");
      await revealNamed(map, keys);
      mem.classList.remove("is-active");
      mem.classList.add("is-open", "is-done");
      await wait(40);
    }
  }

  async function runStage(name, map) {
    const stage = stageEl(name);
    if (!stage) return;
    activateStage(stage);
    await wait(80);

    if (name === "user") {
      setBar("User · surface captures the turn", "is-run");
      await revealNamed(map, ["user.prompt", "user.surface", "user.captures", "user.session"]);
    } else if (name === "context") {
      setBar("Context Pool · curating candidates", "is-run");
      await revealNamed(map, ["context.gather", "context.tools", "context.state", "context.note"]);
    } else if (name === "memory") {
      setBar("Memory Lookup · graph + embeddings", "is-run");
      await revealNamed(map, ["memory.store"]);
      await runNested(stage, "memory", map);
    } else if (name === "sidecar") {
      setBar("Sidecar · optional helper pass", "is-run");
      await revealNamed(map, ["sidecar.note", "sidecar.jobs", "sidecar.status"]);
    } else if (name === "diet") {
      setBar("Context Diet · vault + token budget", "is-run");
      await runNested(stage, "diet", map);
    } else if (name === "assemble") {
      setBar("Assemble Prompt · final message list", "is-run");
      await revealNamed(map, ["assemble.layers", "assemble.memory", "assemble.request"]);
    } else if (name === "provider") {
      setBar("Provider Routing · main model path", "is-run");
      await revealNamed(map, ["provider.route", "provider.handles", "provider.vs"]);
    } else if (name === "runtime") {
      setBar("Runtime Loop · stream / tools / recover", "is-run");
      await runNested(stage, "runtime", map);
    } else if (name === "answer") {
      setBar("Answer · finalize to user", "is-run");
      await revealNamed(map, ["answer.response", "answer.save"]);
    } else if (name === "after") {
      setBar("After Turn · persist / extract / garden", "is-run");
      await runNested(stage, "after", map);
    }

    completeStage(stage);
  }

  function showPrompt(prompt) {
    if (input) input.value = prompt;
  }

  function startPromptAt(index) {
    promptIndex = ((index % PROMPTS.length) + PROMPTS.length) % PROMPTS.length;
    paused = false;
    syncPlaybackUI();
    runSimulation(PROMPTS[promptIndex]);
  }

  function goNextPrompt() {
    const next = (promptIndex + 1) % PROMPTS.length;
    startPromptAt(next);
  }

  async function runSimulation(prompt) {
    const myToken = ++simToken;
    simulating = true;
    clearPending();
    pipeline.classList.add("is-simulating");
    document.body.classList.add("is-simulating");
    syncPlaybackUI();

    showPrompt(prompt);
    resetAllFields();
    STAGE_ORDER.forEach(function (name) {
      const el = stageEl(name);
      if (el) resetStage(el);
    });

    const map = buildSimulation(prompt);
    setBar(
      "Demo " + (promptIndex + 1) + "/" + PROMPTS.length + " · running" + (speedFactor > 1 ? " · slow" : ""),
      "is-run"
    );
    syncPlaybackUI();

    for (let i = 0; i < STAGE_ORDER.length; i++) {
      if (!simulating || simToken !== myToken) return;
      if (i > 0) await pulseConnector(stageEl(STAGE_ORDER[i - 1]));
      if (!simulating || simToken !== myToken) return;
      await runStage(STAGE_ORDER[i], map);
      if (!simulating || simToken !== myToken) return;
      await wait(50);
    }

    if (!simulating || simToken !== myToken) return;
    setBar(
      "Demo " + (promptIndex + 1) + "/" + PROMPTS.length + " · complete — next prompt soon",
      "is-done"
    );
    simulating = false;
    pipeline.classList.remove("is-simulating");
    document.body.classList.remove("is-simulating");
    syncPlaybackUI();

    const nextIndex = (promptIndex + 1) % PROMPTS.length;
    let left = 2000 * speedFactor;
    while (left > 0) {
      if (simToken !== myToken) return;
      while (paused) {
        setBar(
          "Demo " + (promptIndex + 1) + "/" + PROMPTS.length + " · paused — resume or next",
          "is-paused"
        );
        await sleep(80);
        if (simToken !== myToken) return;
      }
      setBar(
        "Demo " + (promptIndex + 1) + "/" + PROMPTS.length + " · complete — next prompt soon",
        "is-done"
      );
      const slice = Math.min(80, left);
      await sleep(slice);
      if (simToken !== myToken) return;
      left -= slice;
    }

    if (simToken !== myToken) return;
    promptIndex = nextIndex;
    runSimulation(PROMPTS[promptIndex]);
  }

  function togglePause() {
    paused = !paused;
    syncPlaybackUI();
    if (paused) {
      setBar(
        "Demo " + (promptIndex + 1) + "/" + PROMPTS.length + " · paused",
        "is-paused"
      );
    } else if (simulating) {
      setBar(
        "Demo " +
          (promptIndex + 1) +
          "/" +
          PROMPTS.length +
          " · running" +
          (speedFactor > 1 ? " · slow" : ""),
        "is-run"
      );
    }
  }

  function toggleSlow() {
    speedFactor = speedFactor > 1 ? 1 : 3.2;
    syncPlaybackUI();
    if (simulating && !paused) {
      setBar(
        "Demo " +
          (promptIndex + 1) +
          "/" +
          PROMPTS.length +
          " · running" +
          (speedFactor > 1 ? " · slow" : ""),
        "is-run"
      );
    }
  }

  if (btnPause) btnPause.addEventListener("click", togglePause);
  if (btnSlow) btnSlow.addEventListener("click", toggleSlow);
  if (btnNext) {
    btnNext.addEventListener("click", function () {
      if (!simulating && !loopTimer && simToken === 0) {
        startPromptAt(0);
        return;
      }
      goNextPrompt();
    });
  }

  function openStageManual(stage) {
    if (simulating) return;
    pipeline.querySelectorAll(".tree-stage.is-active").forEach(function (other) {
      if (other !== stage) {
        other.classList.remove("is-active");
        if (other.querySelector("[data-field]") && other.querySelector("[data-field]").textContent) {
          other.classList.add("is-open", "is-done");
          keepBranchOpen(other);
        }
      }
    });
    stage.classList.add("is-open", "is-active");
    stage.classList.remove("is-done");
    keepBranchOpen(stage);
  }

  pipeline.addEventListener("click", function (event) {
    const memBtn = event.target.closest(".mem-node");
    if (memBtn && pipeline.contains(memBtn)) {
      if (simulating) return;
      event.preventDefault();
      const mem = memBtn.closest(".mem-branch");
      if (!mem) return;
      if (mem.classList.contains("is-open") && !mem.classList.contains("is-done")) closeMem(mem);
      else openMem(mem);
      return;
    }
    const nodeBtn = event.target.closest(".tree-node");
    if (nodeBtn && pipeline.contains(nodeBtn)) {
      if (simulating) return;
      event.preventDefault();
      const stage = nodeBtn.closest(".tree-stage");
      if (stage) openStageManual(stage);
    }
  });

  const boot = stageEl("user");
  if (boot) activateStage(boot);
  showPrompt(PROMPTS[0]);
  syncPlaybackUI();
  setBar("Starting live Neura turn-loop demo…", "is-run");
  window.setTimeout(function () {
    runSimulation(PROMPTS[0]);
  }, 500);
})();
