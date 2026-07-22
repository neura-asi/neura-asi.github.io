(function () {
  const SVGS = {
    user: `
<svg class="mv mv-user" viewBox="0 0 260 96" fill="none">
  <path class="mv-flow-line" d="M30 22 V42 H130 V54"/>
  <path class="mv-flow-line" d="M90 22 V42"/>
  <path class="mv-flow-line" d="M156 22 V42 H130"/>
  <path class="mv-flow-line" d="M220 22 V42 H130"/>
  <g class="mv-surfaces">
    <rect class="mv-chip mv-surf mv-surf-0" x="6" y="8" width="48" height="20"/>
    <text class="mv-label" x="30" y="21" text-anchor="middle">TUI</text>
    <rect class="mv-chip mv-surf mv-surf-1" x="66" y="8" width="48" height="20"/>
    <text class="mv-label" x="90" y="21" text-anchor="middle">CLI</text>
    <rect class="mv-chip mv-surf mv-surf-2" x="126" y="8" width="60" height="20"/>
    <text class="mv-label" x="156" y="21" text-anchor="middle">Remote</text>
    <rect class="mv-chip mv-surf mv-surf-3" x="196" y="8" width="52" height="20"/>
    <text class="mv-label" x="222" y="21" text-anchor="middle">Dapp</text>
  </g>
  <circle class="mv-packet mv-pkt-a" r="3.5">
    <animateMotion dur="2.2s" repeatCount="indefinite" path="M30 22 V42 H130 V54"/>
  </circle>
  <circle class="mv-packet mv-pkt-dim" r="2">
    <animateMotion dur="2.2s" begin="0.35s" repeatCount="indefinite" path="M30 22 V42 H130 V54"/>
  </circle>
  <circle class="mv-packet mv-pkt-b" r="2.5">
    <animateMotion dur="2.6s" begin="0.5s" repeatCount="indefinite" path="M90 22 V42 H130"/>
  </circle>
  <circle class="mv-packet mv-pkt-c" r="2.5">
    <animateMotion dur="2.4s" begin="0.9s" repeatCount="indefinite" path="M220 22 V42 H130 V54"/>
  </circle>
  <circle class="mv-packet mv-pkt-dim" r="2">
    <animateMotion dur="2.5s" begin="1.3s" repeatCount="indefinite" path="M156 22 V42 H130 V54"/>
  </circle>
  <rect class="mv-chip mv-session" x="78" y="62" width="104" height="22"/>
  <text class="mv-label" x="130" y="76" text-anchor="middle">~/.neura/sessions</text>
  <circle class="mv-pulse-ring" cx="130" cy="73" r="8"/>
</svg>`,

    context: `
<svg class="mv mv-context" viewBox="0 0 260 96" fill="none">
  <path class="mv-flow-line" d="M14 48 H48"/>
  <path class="mv-flow-line" d="M210 48 H246"/>
  <g class="mv-pool">
    <rect class="mv-chip mv-pool-i mv-pool-0" x="48" y="10" width="56" height="18"/>
    <text class="mv-label" x="76" y="22" text-anchor="middle">prompt</text>
    <rect class="mv-chip mv-pool-i mv-pool-1" x="114" y="10" width="50" height="18"/>
    <text class="mv-label" x="139" y="22" text-anchor="middle">chat</text>
    <rect class="mv-chip mv-pool-i mv-pool-2" x="174" y="10" width="50" height="18"/>
    <text class="mv-label" x="199" y="22" text-anchor="middle">sys</text>
    <rect class="mv-chip mv-pool-i mv-pool-3" x="48" y="38" width="50" height="18"/>
    <text class="mv-label" x="73" y="50" text-anchor="middle">tools</text>
    <rect class="mv-chip mv-pool-i mv-pool-4" x="108" y="38" width="50" height="18"/>
    <text class="mv-label" x="133" y="50" text-anchor="middle">cwd</text>
    <rect class="mv-chip mv-pool-i mv-pool-5" x="168" y="38" width="56" height="18"/>
    <text class="mv-label" x="196" y="50" text-anchor="middle">latent</text>
  </g>
  <path class="mv-flow-line" d="M100 60 H130 V70"/>
  <rect class="mv-chip mv-curated" x="78" y="68" width="104" height="20"/>
  <text class="mv-label" x="130" y="81" text-anchor="middle">curated pool</text>
  <circle class="mv-packet" r="3.5">
    <animateMotion dur="2.6s" repeatCount="indefinite" path="M14 48 H48"/>
  </circle>
  <circle class="mv-packet mv-pkt-dim" r="3">
    <animateMotion dur="3s" begin="0.8s" repeatCount="indefinite" path="M130 56 V70"/>
  </circle>
  <circle class="mv-packet" r="3.5">
    <animateMotion dur="2.4s" begin="1.4s" repeatCount="indefinite" path="M210 48 H246"/>
  </circle>
</svg>`,

    memory: `
<svg class="mv mv-memory" viewBox="0 0 280 96" fill="none">
  <circle class="mv-ring mv-ring-a" cx="120" cy="48" r="18"/>
  <circle class="mv-ring mv-ring-b" cx="120" cy="48" r="28"/>
  <circle class="mv-ring mv-ring-c" cx="120" cy="48" r="38"/>
  <line class="mv-edge" x1="78" y1="28" x2="120" y2="48"/>
  <line class="mv-edge" x1="78" y1="68" x2="120" y2="48"/>
  <line class="mv-edge" x1="120" y1="48" x2="162" y2="28"/>
  <line class="mv-edge" x1="120" y1="48" x2="162" y2="68"/>
  <line class="mv-edge" x1="162" y1="28" x2="190" y2="48"/>
  <line class="mv-edge" x1="162" y1="68" x2="190" y2="48"/>
  <circle class="mv-gn mv-gn-0" cx="78" cy="28" r="5.5"/>
  <circle class="mv-gn mv-gn-hit" cx="120" cy="48" r="7"/>
  <circle class="mv-gn mv-gn-1" cx="78" cy="68" r="5.5"/>
  <circle class="mv-gn mv-gn-2" cx="162" cy="28" r="5"/>
  <circle class="mv-gn mv-gn-3" cx="162" cy="68" r="5"/>
  <circle class="mv-gn mv-gn-4" cx="190" cy="48" r="4"/>
  <circle class="mv-packet" r="3">
    <animateMotion dur="2.4s" repeatCount="indefinite" path="M78 28 L120 48 L162 28 L190 48"/>
  </circle>
  <circle class="mv-packet mv-pkt-dim" r="2">
    <animateMotion dur="2.4s" begin="0.4s" repeatCount="indefinite" path="M78 28 L120 48 L162 28 L190 48"/>
  </circle>
  <circle class="mv-packet mv-pkt-dim" r="2.5">
    <animateMotion dur="2.8s" begin="0.7s" repeatCount="indefinite" path="M78 68 L120 48 L162 68 L190 48"/>
  </circle>
  <circle class="mv-packet" r="2.2">
    <animateMotion dur="3s" begin="1.2s" repeatCount="indefinite" path="M78 28 L120 48 L162 68 L190 48"/>
  </circle>
  <text class="mv-label mv-mem-tag" x="240" y="36" text-anchor="middle">embed</text>
  <text class="mv-label mv-mem-tag2" x="240" y="54" text-anchor="middle">cascade</text>
  <path class="mv-scan" d="M218 20 V76"/>
</svg>`,

    sidecar: `
<svg class="mv mv-sidecar" viewBox="0 0 260 96" fill="none">
  <path class="mv-flow-line" d="M108 48 H128"/>
  <path class="mv-flow-line" d="M214 30 H236"/>
  <path class="mv-flow-line" d="M214 48 H236"/>
  <path class="mv-flow-line" d="M214 66 H236"/>
  <rect class="mv-chip mv-main" x="16" y="34" width="88" height="28"/>
  <text class="mv-label" x="60" y="51" text-anchor="middle">main model</text>
  <rect class="mv-chip mv-side-brain" x="132" y="24" width="80" height="48"/>
  <circle class="mv-brain-core" cx="172" cy="48" r="10"/>
  <circle class="mv-brain-core mv-brain-core-2" cx="172" cy="48" r="16"/>
  <text class="mv-label" x="172" y="42" text-anchor="middle">sidecar</text>
  <text class="mv-label mv-side-sub" x="172" y="56" text-anchor="middle">helper</text>
  <circle class="mv-packet" r="3">
    <animateMotion dur="1.8s" repeatCount="indefinite" path="M108 48 H128"/>
  </circle>
  <circle class="mv-packet mv-pkt-dim" r="2.4">
    <animateMotion dur="2.2s" begin="0.4s" repeatCount="indefinite" path="M212 30 H236"/>
  </circle>
  <circle class="mv-packet mv-pkt-dim" r="2.4">
    <animateMotion dur="2.2s" begin="0.7s" repeatCount="indefinite" path="M212 48 H236"/>
  </circle>
  <circle class="mv-packet mv-pkt-dim" r="2.4">
    <animateMotion dur="2.2s" begin="1s" repeatCount="indefinite" path="M212 66 H236"/>
  </circle>
</svg>`,

    diet: `
<svg class="mv mv-diet" viewBox="0 0 260 96" fill="none">
  <g class="mv-blocks">
    <rect class="mv-block mv-b0" x="12" y="14" width="32" height="18"/>
    <rect class="mv-block mv-b1" x="50" y="14" width="40" height="18"/>
    <rect class="mv-block mv-b2" x="12" y="40" width="44" height="18"/>
    <rect class="mv-block mv-b3" x="62" y="40" width="28" height="18"/>
    <rect class="mv-block mv-b4" x="30" y="66" width="40" height="14"/>
  </g>
  <path class="mv-flow-line" d="M108 48 H132"/>
  <polygon class="mv-arrowhead" points="136,48 128,43 128,53"/>
  <rect class="mv-chip mv-vault-tok" x="144" y="34" width="96" height="28"/>
  <text class="mv-label mv-vault-tok-label" x="192" y="51" text-anchor="middle">&lt;ctx id=…/&gt;</text>
  <circle class="mv-packet" r="3.2">
    <animateMotion dur="2s" repeatCount="indefinite" path="M100 48 H140"/>
  </circle>
  <circle class="mv-compress-ring" cx="56" cy="40" r="20"/>
</svg>`,

    assemble: `
<svg class="mv mv-assemble" viewBox="0 0 260 96" fill="none">
  <path class="mv-flow-line" d="M118 16 H142 V80 H118"/>
  <path class="mv-flow-line" d="M142 48 H164"/>
  <rect class="mv-chip mv-layer mv-layer-0" x="10" y="10" width="78" height="14"/>
  <rect class="mv-chip mv-layer mv-layer-1" x="10" y="30" width="96" height="14"/>
  <rect class="mv-chip mv-layer mv-layer-2" x="10" y="50" width="64" height="14"/>
  <rect class="mv-chip mv-layer mv-layer-3" x="10" y="70" width="84" height="14"/>
  <rect class="mv-chip mv-final" x="168" y="32" width="80" height="32"/>
  <text class="mv-label" x="208" y="51" text-anchor="middle">messages[]</text>
  <circle class="mv-packet" r="2.8">
    <animateMotion dur="2.8s" repeatCount="indefinite" path="M100 17 H142"/>
  </circle>
  <circle class="mv-packet mv-pkt-dim" r="2.8">
    <animateMotion dur="2.8s" begin="0.5s" repeatCount="indefinite" path="M110 37 H142"/>
  </circle>
  <circle class="mv-packet mv-pkt-dim" r="2.8">
    <animateMotion dur="2.8s" begin="1s" repeatCount="indefinite" path="M90 57 H142 V48 H164"/>
  </circle>
  <circle class="mv-packet" r="2.8">
    <animateMotion dur="2.8s" begin="1.5s" repeatCount="indefinite" path="M100 77 H142 V48 H168"/>
  </circle>
</svg>`,

    provider: `
<svg class="mv mv-provider" viewBox="0 0 280 96" fill="none">
  <path class="mv-flow-line mv-ai-path-l" d="M100 40 L132 20"/>
  <path class="mv-flow-line mv-ai-path-r" d="M100 48 H132"/>
  <path class="mv-flow-line mv-ai-path-h" d="M100 56 L132 76"/>
  <path class="mv-flow-line" d="M16 48 H48"/>
  <path class="mv-flow-line" d="M220 48 H264"/>
  <rect class="mv-chip mv-ai-router" x="48" y="34" width="52" height="28"/>
  <text class="mv-label" x="74" y="51" text-anchor="middle">route</text>
  <rect class="mv-chip mv-ai-local" x="136" y="10" width="64" height="20"/>
  <text class="mv-label" x="168" y="23" text-anchor="middle">Local</text>
  <rect class="mv-chip mv-ai-remote" x="136" y="38" width="70" height="20"/>
  <text class="mv-label" x="171" y="51" text-anchor="middle">Remote</text>
  <rect class="mv-chip mv-ai-hybrid" x="136" y="66" width="64" height="20"/>
  <text class="mv-label" x="168" y="79" text-anchor="middle">Compat</text>
  <circle class="mv-packet" r="3.2">
    <animateMotion dur="2s" repeatCount="indefinite" path="M16 48 H48"/>
  </circle>
  <circle class="mv-packet mv-token-1" r="2.2">
    <animateMotion dur="2.4s" begin="0.3s" repeatCount="indefinite" path="M210 48 H260"/>
  </circle>
  <circle class="mv-packet mv-token-2" r="2.2">
    <animateMotion dur="2.4s" begin="0.55s" repeatCount="indefinite" path="M210 48 H260"/>
  </circle>
  <circle class="mv-packet mv-token-3" r="2.2">
    <animateMotion dur="2.4s" begin="0.8s" repeatCount="indefinite" path="M210 48 H260"/>
  </circle>
</svg>`,

    runtime: `
<svg class="mv mv-runtime" viewBox="0 0 280 96" fill="none">
  <circle class="mv-orbit" cx="140" cy="48" r="30"/>
  <circle class="mv-orbit mv-orbit-2" cx="140" cy="48" r="20"/>
  <g class="mv-orbit-arm">
    <circle class="mv-packet" cx="140" cy="18" r="4"/>
    <circle class="mv-packet mv-pkt-dim" cx="140" cy="18" r="2" transform="rotate(120 140 48)"/>
  </g>
  <g class="mv-orbit-arm mv-orbit-arm-2">
    <circle class="mv-packet mv-pkt-dim" cx="140" cy="28" r="2.5"/>
    <circle class="mv-packet" cx="140" cy="28" r="2" transform="rotate(180 140 48)"/>
  </g>
  <rect class="mv-chip mv-rt mv-rt-0" x="20" y="14" width="56" height="18"/>
  <text class="mv-label" x="48" y="26" text-anchor="middle">stream</text>
  <rect class="mv-chip mv-rt mv-rt-1" x="204" y="14" width="52" height="18"/>
  <text class="mv-label" x="230" y="26" text-anchor="middle">tools</text>
  <rect class="mv-chip mv-rt mv-rt-2" x="204" y="64" width="56" height="18"/>
  <text class="mv-label" x="232" y="76" text-anchor="middle">ctx_get</text>
  <rect class="mv-chip mv-rt mv-rt-3" x="20" y="64" width="56" height="18"/>
  <text class="mv-label" x="48" y="76" text-anchor="middle">retry</text>
  <text class="mv-label mv-rt-center" x="140" y="52" text-anchor="middle">loop</text>
  <path class="mv-flow-line" d="M76 23 H110"/>
  <path class="mv-flow-line" d="M170 23 H204"/>
  <path class="mv-flow-line" d="M170 73 H204"/>
  <path class="mv-flow-line" d="M76 73 H110"/>
</svg>`,

    answer: `
<svg class="mv mv-answer" viewBox="0 0 240 96" fill="none">
  <path class="mv-flow-line" d="M120 34 V58"/>
  <rect class="mv-chip mv-ans-box" x="70" y="10" width="100" height="22"/>
  <text class="mv-label" x="120" y="24" text-anchor="middle">verified</text>
  <polygon class="mv-arrowhead mv-answer-arrow" points="120,66 114,56 126,56"/>
  <circle class="mv-user-dot" cx="120" cy="78" r="8"/>
  <circle class="mv-pulse-ring" cx="120" cy="78" r="8"/>
  <circle class="mv-packet" r="3.5">
    <animateMotion dur="2.4s" repeatCount="indefinite" path="M120 34 V74"/>
  </circle>
</svg>`,

    after: `
<svg class="mv mv-after" viewBox="0 0 280 96" fill="none">
  <path class="mv-flow-line" d="M84 48 H108"/>
  <path class="mv-flow-line" d="M172 48 H196"/>
  <rect class="mv-chip mv-af mv-af-0" x="16" y="34" width="68" height="28"/>
  <text class="mv-label" x="50" y="51" text-anchor="middle">persist</text>
  <rect class="mv-chip mv-af mv-af-1" x="108" y="34" width="64" height="28"/>
  <text class="mv-label" x="140" y="51" text-anchor="middle">extract</text>
  <rect class="mv-chip mv-af mv-af-2" x="196" y="34" width="68" height="28"/>
  <text class="mv-label" x="230" y="51" text-anchor="middle">garden</text>
  <circle class="mv-packet" r="3.2">
    <animateMotion dur="3s" repeatCount="indefinite" path="M84 48 H108 H172 H196 H230"/>
  </circle>
  <g class="mv-sprouts">
    <path class="mv-sprout mv-sprout-0" d="M230 28 C224 16, 236 16, 230 28"/>
    <path class="mv-sprout mv-sprout-1" d="M242 30 C246 18, 252 22, 242 30"/>
    <path class="mv-sprout mv-sprout-2" d="M218 30 C212 20, 216 16, 218 30"/>
  </g>
</svg>`,
  };

  function syncMotion(stage) {
    const scale = stage.classList.contains("is-active")
      ? 0.48
      : stage.classList.contains("is-done")
        ? 1.12
        : 1;
    stage.querySelectorAll("animateMotion").forEach(function (am) {
      if (!am.dataset.baseDur) {
        am.dataset.baseDur = am.getAttribute("dur") || "2.5s";
      }
      const base = parseFloat(am.dataset.baseDur);
      if (!Number.isFinite(base)) return;
      const next = (base * scale).toFixed(2) + "s";
      if (am.getAttribute("dur") !== next) {
        am.setAttribute("dur", next);
        try {
          am.beginElement();
        } catch (_) {
          /* ignore */
        }
      }
    });
  }

  document.querySelectorAll("[data-viz]").forEach(function (el) {
    const key = el.getAttribute("data-viz");
    if (SVGS[key]) el.innerHTML = SVGS[key];
  });

  document.querySelectorAll(".tree-stage").forEach(function (stage) {
    syncMotion(stage);
    new MutationObserver(function () {
      syncMotion(stage);
    }).observe(stage, { attributes: true, attributeFilter: ["class"] });
  });
})();
