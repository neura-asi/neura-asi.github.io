(function () {
  const pipeline = document.getElementById("pipeline");
  if (!pipeline) return;

  const input = document.getElementById("prompt-input");
  const barText = document.getElementById("sim-bar-text");
  const simBar = document.getElementById("sim-bar");

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
  let promptIndex = 0;
  let loopTimer = null;
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
    while (pendingTimeouts.length) window.clearTimeout(pendingTimeouts.pop());
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
        const chunk = text.length > 80 ? 3 : text.length > 40 ? 2 : 1;
        i = Math.min(text.length, i + chunk);
        el.textContent = text.slice(0, i);
        if (i < text.length) {
          const id = window.setTimeout(step, speed + Math.random() * 8);
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

  function keywords(text) {
    const stop = {
      a: 1, an: 1, the: 1, to: 1, and: 1, or: 1, for: 1, of: 1, in: 1, on: 1,
      with: 1, keep: 1, dont: 1, be: 1, is: 1, are: 1, it: 1, this: 1,
      that: 1, my: 1, me: 1, i: 1, please: 1, can: 1, you: 1, why: 1, how: 1,
      only: 1, about: 1, from: 1, into: 1, under: 1, after: 1,
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
    if (/ci|pipeline|ubuntu|github/.test(p)) {
      files.push(".github/workflows/ci.yml", "scripts/ci.sh");
    }
    if (/dark.?mode|settings|ui|page|frontend|react|design.?token/.test(p)) {
      files.push("src/ui/Settings.tsx", "src/styles/tokens.css");
    }
    if (/memory|embed|graph|vault|cache|sidecar/.test(p)) {
      files.push("src/memory/graph.ts", "src/memory/vault.ts", "src/cache/store.ts");
    }
    if (/docker|image|mb/.test(p)) files.push("Dockerfile", "docker/sidecar.Dockerfile");
    if (/migration|orm|column|sql|schema/.test(p)) {
      files.push("db/migrations/002_api_key.sql", "src/db/models/user.ts");
    }
    if (/websocket|reconnect|flaky|test/.test(p)) {
      files.push("tests/ws.reconnect.test.ts", "src/net/ws.ts");
    }
    if (/changelog|readme|adr|docs/.test(p)) files.push("CHANGELOG.md", "README.md", "docs/adr/");
    if (/regex|date|symbolic|yaml|json.?schema/.test(p)) {
      files.push("src/symbolic/dates.ts", "src/config/schema.json");
    }
    if (/race|verification|tool write/.test(p)) {
      files.push("src/verify/runner.ts", "src/tools/fs.ts");
    }
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
    const needsCode = /code|refactor|fix|implement|bug|test|auth|api|ui|build|docker|migration|patch|debug|optimize|script|dockerfile|schema|race/.test(
      prompt.toLowerCase()
    );

    return {
      "user.prompt": prompt,
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
      "ai.route": needsCode ? "hybrid — local draft, remote harden" : "local — fast path",
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
    await wait(360);
    connector.classList.remove("is-flowing");
  }

  async function typeNamed(map, names) {
    for (let i = 0; i < names.length; i++) {
      if (!simulating) return;
      const name = names[i];
      const text = map[name] || "—";
      const el = setFieldText(name, text);
      if (el) {
        const speed = text.length > 70 ? 5 : text.length > 35 ? 7 : 9;
        await typewriter(el, text, speed);
      }
      await wait(30);
    }
  }

  async function runStage(name, map) {
    const stage = stageEl(name);
    if (!stage) return;

    activateStage(stage);
    await wait(90);

    if (name === "user") {
      setBar("User · receiving prompt", "is-run");
      await typeNamed(map, ["user.prompt", "user.session"]);
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
        stage.querySelectorAll(".mem-branch.is-active").forEach(function (other) {
          if (other !== mem) {
            other.classList.remove("is-active");
            other.classList.add("is-open", "is-done");
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
        mem.classList.add("is-open", "is-done");
        await wait(50);
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

    completeStage(stage);
  }

  function showPrompt(prompt) {
    if (input) input.value = prompt;
  }

  async function runSimulation(prompt) {
    simToken += 1;
    simulating = true;
    clearPending();
    pipeline.classList.add("is-simulating");
    document.body.classList.add("is-simulating");

    showPrompt(prompt);
    resetAllFields();
    STAGE_ORDER.forEach(function (name) {
      const el = stageEl(name);
      if (el) resetStage(el);
    });

    const map = buildSimulation(prompt);
    setBar("Demo " + (promptIndex + 1) + "/" + PROMPTS.length + " · running", "is-run");

    for (let i = 0; i < STAGE_ORDER.length; i++) {
      if (!simulating) return;
      if (i > 0) await pulseConnector(stageEl(STAGE_ORDER[i - 1]));
      await runStage(STAGE_ORDER[i], map);
      await wait(60);
    }

    if (!simulating) return;
    setBar("Demo " + (promptIndex + 1) + "/" + PROMPTS.length + " · complete — next prompt soon", "is-done");
    simulating = false;
    pipeline.classList.remove("is-simulating");
    document.body.classList.remove("is-simulating");

    promptIndex = (promptIndex + 1) % PROMPTS.length;
    loopTimer = window.setTimeout(function () {
      runSimulation(PROMPTS[promptIndex]);
    }, 1800);
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

  // Auto-start demo loop
  const boot = stageEl("user");
  if (boot) activateStage(boot);
  showPrompt(PROMPTS[0]);
  setBar("Starting live demo…", "is-run");
  window.setTimeout(function () {
    runSimulation(PROMPTS[0]);
  }, 600);
})();
