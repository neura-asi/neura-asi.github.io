(function () {
    const SVGS = {
    user: `
<svg class="mv mv-user" viewBox="0 0 240 80" fill="none">
  <g class="mv-surfaces">
    <rect class="mv-chip mv-surf mv-surf-0" x="8" y="10" width="48" height="18" rx="2"/>
    <text class="mv-label" x="32" y="22" text-anchor="middle">TUI</text>
    <rect class="mv-chip mv-surf mv-surf-1" x="66" y="10" width="48" height="18" rx="2"/>
    <text class="mv-label" x="90" y="22" text-anchor="middle">CLI</text>
    <rect class="mv-chip mv-surf mv-surf-2" x="124" y="10" width="52" height="18" rx="2"/>
    <text class="mv-label" x="150" y="22" text-anchor="middle">Remote</text>
    <rect class="mv-chip mv-surf mv-surf-3" x="186" y="10" width="46" height="18" rx="2"/>
    <text class="mv-label" x="209" y="22" text-anchor="middle">Dapp</text>
  </g>
  <path class="mv-rail mv-funnel" d="M32 28 V40 H120 V48 M90 28 V40 M150 28 V40 M209 28 V40 H120"/>
  <circle class="mv-packet mv-user-packet" cx="120" cy="36" r="4"/>
  <rect class="mv-chip mv-session" x="78" y="54" width="84" height="18" rx="2"/>
  <text class="mv-label" x="120" y="66" text-anchor="middle">~/.neura/sessions</text>
</svg>`,

    context: `
<svg class="mv mv-context" viewBox="0 0 240 80" fill="none">
  <circle class="mv-packet mv-pool-in" cx="16" cy="40" r="3.5"/>
  <g class="mv-pool">
    <rect class="mv-chip mv-pool-i mv-pool-0" x="40" y="8" width="54" height="16"/>
    <text class="mv-label" x="67" y="19" text-anchor="middle">prompt</text>
    <rect class="mv-chip mv-pool-i mv-pool-1" x="104" y="8" width="48" height="16"/>
    <text class="mv-label" x="128" y="19" text-anchor="middle">chat</text>
    <rect class="mv-chip mv-pool-i mv-pool-2" x="162" y="8" width="48" height="16"/>
    <text class="mv-label" x="186" y="19" text-anchor="middle">sys</text>
    <rect class="mv-chip mv-pool-i mv-pool-3" x="40" y="32" width="48" height="16"/>
    <text class="mv-label" x="64" y="43" text-anchor="middle">tools</text>
    <rect class="mv-chip mv-pool-i mv-pool-4" x="98" y="32" width="48" height="16"/>
    <text class="mv-label" x="122" y="43" text-anchor="middle">cwd</text>
    <rect class="mv-chip mv-pool-i mv-pool-5" x="156" y="32" width="54" height="16"/>
    <text class="mv-label" x="183" y="43" text-anchor="middle">latent</text>
  </g>
  <path class="mv-rail" d="M100 52 H120 V60"/>
  <rect class="mv-chip mv-curated" x="78" y="58" width="84" height="16"/>
  <text class="mv-label" x="120" y="69" text-anchor="middle">curated pool</text>
  <circle class="mv-packet mv-pool-out" cx="224" cy="40" r="3.5"/>
</svg>`,

    memory: `
<svg class="mv mv-memory" viewBox="0 0 280 80" fill="none">
  <circle class="mv-ring mv-ring-a" cx="110" cy="40" r="22"/>
  <circle class="mv-ring mv-ring-b" cx="110" cy="40" r="32"/>
  <circle class="mv-gn" cx="72" cy="24" r="5"/>
  <circle class="mv-gn mv-gn-hit" cx="110" cy="40" r="6"/>
  <circle class="mv-gn" cx="72" cy="56" r="5"/>
  <circle class="mv-gn" cx="148" cy="24" r="4.5"/>
  <circle class="mv-gn" cx="148" cy="56" r="4.5"/>
  <circle class="mv-gn" cx="170" cy="40" r="3.5"/>
  <line class="mv-rail" x1="72" y1="24" x2="110" y2="40"/>
  <line class="mv-rail" x1="72" y1="56" x2="110" y2="40"/>
  <line class="mv-rail" x1="110" y1="40" x2="148" y2="24"/>
  <line class="mv-rail" x1="110" y1="40" x2="148" y2="56"/>
  <line class="mv-rail" x1="148" y1="24" x2="170" y2="40"/>
  <line class="mv-rail" x1="148" y1="56" x2="170" y2="40"/>
  <circle class="mv-packet mv-graph-pulse" cx="72" cy="24" r="3"/>
  <text class="mv-label mv-mem-tag" x="230" y="30" text-anchor="middle">embed</text>
  <text class="mv-label mv-mem-tag2" x="230" y="48" text-anchor="middle">cascade</text>
  <path class="mv-rail mv-scan" d="M200 20 V60"/>
</svg>`,

    sidecar: `
<svg class="mv mv-sidecar" viewBox="0 0 240 80" fill="none">
  <rect class="mv-chip mv-main" x="18" y="28" width="78" height="24"/>
  <text class="mv-label" x="57" y="43" text-anchor="middle">main model</text>
  <path class="mv-rail mv-side-bridge" d="M100 40 H118"/>
  <rect class="mv-chip mv-side-brain" x="124" y="22" width="78" height="36"/>
  <text class="mv-label" x="163" y="36" text-anchor="middle">sidecar</text>
  <text class="mv-label mv-side-sub" x="163" y="50" text-anchor="middle">helper</text>
  <circle class="mv-packet mv-side-in" cx="108" cy="40" r="3"/>
  <circle class="mv-packet mv-side-out-a" cx="220" cy="22" r="2.5"/>
  <circle class="mv-packet mv-side-out-b" cx="220" cy="40" r="2.5"/>
  <circle class="mv-packet mv-side-out-c" cx="220" cy="58" r="2.5"/>
  <path class="mv-rail" d="M202 30 H214 M202 40 H214 M202 50 H214"/>
</svg>`,

    diet: `
<svg class="mv mv-diet" viewBox="0 0 240 80" fill="none">
  <g class="mv-blocks">
    <rect class="mv-block mv-b0" x="12" y="14" width="28" height="16"/>
    <rect class="mv-block mv-b1" x="44" y="14" width="36" height="16"/>
    <rect class="mv-block mv-b2" x="12" y="36" width="40" height="16"/>
    <rect class="mv-block mv-b3" x="56" y="36" width="24" height="16"/>
    <rect class="mv-block mv-b4" x="28" y="58" width="36" height="12"/>
  </g>
  <path class="mv-rail" d="M96 40 H118"/>
  <polygon class="mv-arrowhead" points="122,40 114,36 114,44"/>
  <rect class="mv-chip mv-vault-tok" x="128" y="28" width="84" height="24"/>
  <text class="mv-label mv-vault-tok-label" x="170" y="43" text-anchor="middle">&lt;ctx id=…/&gt;</text>
  <circle class="mv-packet mv-diet-pkt" cx="108" cy="40" r="3"/>
</svg>`,

    assemble: `
<svg class="mv mv-assemble" viewBox="0 0 240 80" fill="none">
  <rect class="mv-chip mv-layer mv-layer-0" x="10" y="8" width="70" height="12"/>
  <rect class="mv-chip mv-layer mv-layer-1" x="10" y="24" width="88" height="12"/>
  <rect class="mv-chip mv-layer mv-layer-2" x="10" y="40" width="56" height="12"/>
  <rect class="mv-chip mv-layer mv-layer-3" x="10" y="56" width="76" height="12"/>
  <path class="mv-rail" d="M110 14 H130 V66 H110"/>
  <path class="mv-rail mv-assemble-beam" d="M130 40 H152"/>
  <rect class="mv-chip mv-final" x="156" y="26" width="72" height="28"/>
  <text class="mv-label" x="192" y="43" text-anchor="middle">messages[]</text>
  <circle class="mv-packet mv-assemble-pkt" cx="140" cy="40" r="3"/>
</svg>`,

    provider: `
<svg class="mv mv-provider" viewBox="0 0 260 80" fill="none">
  <circle class="mv-packet mv-ai-in" cx="18" cy="40" r="3.5"/>
  <rect class="mv-chip mv-ai-router" x="42" y="28" width="48" height="24"/>
  <text class="mv-label" x="66" y="43" text-anchor="middle">route</text>
  <path class="mv-rail mv-ai-path-l" d="M90 34 L118 18"/>
  <path class="mv-rail mv-ai-path-r" d="M90 40 H118"/>
  <path class="mv-rail mv-ai-path-h" d="M90 46 L118 62"/>
  <rect class="mv-chip mv-ai-local" x="122" y="8" width="58" height="18"/>
  <text class="mv-label" x="151" y="20" text-anchor="middle">Local</text>
  <rect class="mv-chip mv-ai-remote" x="122" y="31" width="64" height="18"/>
  <text class="mv-label" x="154" y="43" text-anchor="middle">Remote</text>
  <rect class="mv-chip mv-ai-hybrid" x="122" y="54" width="58" height="18"/>
  <text class="mv-label" x="151" y="66" text-anchor="middle">Compat</text>
  <g class="mv-tokens">
    <circle class="mv-token mv-token-1" cx="204" cy="40" r="2.2"/>
    <circle class="mv-token mv-token-2" cx="214" cy="40" r="2.2"/>
    <circle class="mv-token mv-token-3" cx="224" cy="40" r="2.2"/>
  </g>
  <circle class="mv-packet mv-ai-out" cx="244" cy="40" r="3.5"/>
</svg>`,

    runtime: `
<svg class="mv mv-runtime" viewBox="0 0 280 80" fill="none">
  <circle class="mv-orbit" cx="140" cy="40" r="28"/>
  <g class="mv-orbit-arm">
    <circle class="mv-packet" cx="140" cy="12" r="3.5"/>
  </g>
  <rect class="mv-chip mv-rt mv-rt-0" x="28" y="14" width="52" height="16"/>
  <text class="mv-label" x="54" y="25" text-anchor="middle">stream</text>
  <rect class="mv-chip mv-rt mv-rt-1" x="200" y="14" width="48" height="16"/>
  <text class="mv-label" x="224" y="25" text-anchor="middle">tools</text>
  <rect class="mv-chip mv-rt mv-rt-2" x="200" y="50" width="52" height="16"/>
  <text class="mv-label" x="226" y="61" text-anchor="middle">ctx_get</text>
  <rect class="mv-chip mv-rt mv-rt-3" x="28" y="50" width="52" height="16"/>
  <text class="mv-label" x="54" y="61" text-anchor="middle">retry</text>
  <text class="mv-label mv-rt-center" x="140" y="44" text-anchor="middle">loop</text>
</svg>`,

    answer: `
<svg class="mv mv-answer" viewBox="0 0 220 80" fill="none">
  <rect class="mv-chip mv-ans-box" x="70" y="8" width="80" height="18"/>
  <text class="mv-label" x="110" y="20" text-anchor="middle">verified</text>
  <line class="mv-rail" x1="110" y1="26" x2="110" y2="52"/>
  <polygon class="mv-arrowhead mv-answer-arrow" points="110,56 105,48 115,48"/>
  <circle class="mv-user-dot" cx="110" cy="66" r="6"/>
  <circle class="mv-packet mv-answer-packet" cx="110" cy="30" r="3.5"/>
</svg>`,

    after: `
<svg class="mv mv-after" viewBox="0 0 260 80" fill="none">
  <rect class="mv-chip mv-af mv-af-0" x="16" y="28" width="60" height="22"/>
  <text class="mv-label" x="46" y="42" text-anchor="middle">persist</text>
  <rect class="mv-chip mv-af mv-af-1" x="100" y="28" width="60" height="22"/>
  <text class="mv-label" x="130" y="42" text-anchor="middle">extract</text>
  <rect class="mv-chip mv-af mv-af-2" x="184" y="28" width="60" height="22"/>
  <text class="mv-label" x="214" y="42" text-anchor="middle">garden</text>
  <path class="mv-rail" d="M76 39 H100 M160 39 H184"/>
  <circle class="mv-packet mv-after-pkt" cx="76" cy="39" r="3"/>
  <path class="mv-sprout" d="M214 18 C210 10, 218 10, 214 18"/>
</svg>`,
  };

  document.querySelectorAll("[data-viz]").forEach(function (el) {
    const key = el.getAttribute("data-viz");
    if (SVGS[key]) el.innerHTML = SVGS[key];
  });
})();
