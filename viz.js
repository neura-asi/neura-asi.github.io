(function () {
  const SVGS = {
    user: `
<svg class="mv" viewBox="0 0 200 72" fill="none">
  <circle class="mv-user-dot" cx="100" cy="14" r="5"/>
  <line class="mv-rail" x1="100" y1="20" x2="100" y2="58"/>
  <polygon class="mv-arrowhead" points="100,64 95,56 105,56"/>
  <circle class="mv-packet mv-user-packet" cx="100" cy="20" r="3.5"/>
</svg>`,

    intent: `
<svg class="mv" viewBox="0 0 220 72" fill="none">
  <circle class="mv-packet mv-intent-in" cx="30" cy="36" r="3.5"/>
  <line class="mv-rail" x1="40" y1="36" x2="70" y2="36"/>
  <g class="mv-intent-bits">
    <rect class="mv-chip mv-chip-1" x="78" y="8" width="44" height="14"/>
    <text class="mv-label" x="100" y="18" text-anchor="middle">Intent</text>
    <rect class="mv-chip mv-chip-2" x="132" y="8" width="40" height="14"/>
    <text class="mv-label" x="152" y="18" text-anchor="middle">Files</text>
    <rect class="mv-chip mv-chip-3" x="78" y="50" width="58" height="14"/>
    <text class="mv-label" x="107" y="60" text-anchor="middle">Constraints</text>
    <rect class="mv-chip mv-chip-4" x="144" y="50" width="40" height="14"/>
    <text class="mv-label" x="164" y="60" text-anchor="middle">Tools</text>
  </g>
  <line class="mv-rail mv-intent-out-rail" x1="190" y1="36" x2="210" y2="36"/>
  <circle class="mv-packet mv-intent-out" cx="210" cy="36" r="3.5"/>
</svg>`,

    planner: `
<svg class="mv" viewBox="0 0 220 72" fill="none">
  <circle class="mv-packet mv-plan-in" cx="28" cy="36" r="3.5"/>
  <line class="mv-rail" x1="36" y1="36" x2="70" y2="36"/>
  <line class="mv-rail mv-branch mv-branch-a" x1="70" y1="36" x2="130" y2="14"/>
  <line class="mv-rail mv-branch mv-branch-b" x1="70" y1="36" x2="130" y2="36"/>
  <line class="mv-rail mv-branch mv-branch-c" x1="70" y1="36" x2="130" y2="58"/>
  <circle class="mv-node mv-pick-a" cx="138" cy="14" r="4"/>
  <circle class="mv-node mv-pick-b" cx="138" cy="36" r="4"/>
  <circle class="mv-node mv-pick-c" cx="138" cy="58" r="4"/>
  <circle class="mv-packet mv-plan-out" cx="180" cy="36" r="3.5"/>
  <line class="mv-rail mv-plan-chosen" x1="146" y1="36" x2="172" y2="36"/>
</svg>`,

    memory: `
<svg class="mv mv--memory" viewBox="0 0 320 88" fill="none">
  <!-- Graph -->
  <g class="mv-mod mv-mod-graph">
    <rect class="mv-mod-frame" x="4" y="8" width="72" height="72"/>
    <text class="mv-mod-title" x="40" y="20" text-anchor="middle">Graph</text>
    <circle class="mv-gn" cx="24" cy="40" r="3"/>
    <circle class="mv-gn mv-gn-hit" cx="40" cy="52" r="3"/>
    <circle class="mv-gn" cx="56" cy="38" r="3"/>
    <circle class="mv-gn" cx="40" cy="32" r="2.5"/>
    <line class="mv-rail" x1="24" y1="40" x2="40" y2="32"/>
    <line class="mv-rail" x1="40" y1="32" x2="56" y2="38"/>
    <line class="mv-rail" x1="40" y1="32" x2="40" y2="52"/>
    <line class="mv-rail" x1="24" y1="40" x2="40" y2="52"/>
    <circle class="mv-packet mv-graph-pulse" cx="24" cy="40" r="2.5"/>
  </g>
  <!-- Vault -->
  <g class="mv-mod mv-mod-vault">
    <rect class="mv-mod-frame" x="84" y="8" width="72" height="72"/>
    <text class="mv-mod-title" x="120" y="20" text-anchor="middle">Vault</text>
    <rect class="mv-vault-big" x="96" y="30" width="48" height="20"/>
    <rect class="mv-vault-tok" x="110" y="54" width="20" height="12"/>
    <text class="mv-label mv-vault-tok-label" x="120" y="63" text-anchor="middle">&lt;ctx&gt;</text>
  </g>
  <!-- Cache -->
  <g class="mv-mod mv-mod-cache">
    <rect class="mv-mod-frame" x="164" y="8" width="72" height="72"/>
    <text class="mv-mod-title" x="200" y="20" text-anchor="middle">Cache</text>
    <circle class="mv-packet mv-cache-req" cx="176" cy="44" r="2.5"/>
    <rect class="mv-cache-box" x="186" y="34" width="28" height="20"/>
    <path class="mv-cache-hit" d="M214 44 H228"/>
    <path class="mv-cache-miss" d="M200 54 V66 H228"/>
  </g>
  <!-- Sidecar -->
  <g class="mv-mod mv-mod-sidecar">
    <rect class="mv-mod-frame mv-sidecar-frame" x="244" y="8" width="72" height="72"/>
    <text class="mv-mod-title" x="280" y="20" text-anchor="middle">Sidecar</text>
    <circle class="mv-packet mv-side-in" cx="256" cy="40" r="2.5"/>
    <rect class="mv-side-brain" x="266" y="32" width="28" height="24"/>
    <circle class="mv-packet mv-side-out-a" cx="304" cy="30" r="2"/>
    <circle class="mv-packet mv-side-out-b" cx="304" cy="44" r="2"/>
    <circle class="mv-packet mv-side-out-c" cx="304" cy="58" r="2"/>
  </g>
  <!-- comm pulses between modules -->
  <circle class="mv-packet mv-mem-comm" cx="76" cy="44" r="2"/>
</svg>`,

    tools: `
<svg class="mv" viewBox="0 0 240 72" fill="none">
  <circle class="mv-packet mv-tool-in" cx="20" cy="36" r="3.5"/>
  <line class="mv-rail" x1="28" y1="36" x2="52" y2="36"/>
  <g class="mv-tool mv-tool-1"><rect class="mv-chip" x="56" y="8" width="36" height="16"/><text class="mv-label" x="74" y="19" text-anchor="middle">File</text></g>
  <g class="mv-tool mv-tool-2"><rect class="mv-chip" x="100" y="8" width="40" height="16"/><text class="mv-label" x="120" y="19" text-anchor="middle">Shell</text></g>
  <g class="mv-tool mv-tool-3"><rect class="mv-chip" x="148" y="8" width="44" height="16"/><text class="mv-label" x="170" y="19" text-anchor="middle">Search</text></g>
  <g class="mv-tool mv-tool-4"><rect class="mv-chip" x="78" y="48" width="32" height="16"/><text class="mv-label" x="94" y="59" text-anchor="middle">Git</text></g>
  <g class="mv-tool mv-tool-5"><rect class="mv-chip" x="120" y="48" width="40" height="16"/><text class="mv-label" x="140" y="59" text-anchor="middle">Tests</text></g>
  <circle class="mv-packet mv-tool-out" cx="210" cy="36" r="3.5"/>
</svg>`,

    symbolic: `
<svg class="mv" viewBox="0 0 220 72" fill="none">
  <circle class="mv-packet mv-sym-in" cx="24" cy="36" r="3.5"/>
  <line class="mv-rail" x1="32" y1="36" x2="58" y2="36"/>
  <g transform="translate(78 36)">
    <g class="mv-gear mv-gear-1">
      <circle class="mv-gear-ring" r="14"/>
      <circle class="mv-gear-hub" r="4"/>
      <line class="mv-rail" x1="0" y1="-14" x2="0" y2="14"/>
      <line class="mv-rail" x1="-14" y1="0" x2="14" y2="0"/>
    </g>
  </g>
  <g transform="translate(112 36)">
    <g class="mv-gear mv-gear-2">
      <circle class="mv-gear-ring" r="10"/>
      <circle class="mv-gear-hub" r="3"/>
      <line class="mv-rail" x1="0" y1="-10" x2="0" y2="10"/>
      <line class="mv-rail" x1="-10" y1="0" x2="10" y2="0"/>
    </g>
  </g>
  <rect class="mv-chip mv-sym-out-box" x="138" y="26" width="52" height="20"/>
  <text class="mv-label" x="164" y="39" text-anchor="middle">Verified</text>
  <circle class="mv-packet mv-sym-out" cx="204" cy="36" r="3.5"/>
</svg>`,

    ai: `
<svg class="mv" viewBox="0 0 240 72" fill="none">
  <circle class="mv-packet mv-ai-in" cx="20" cy="36" r="3.5"/>
  <line class="mv-rail" x1="28" y1="36" x2="58" y2="36"/>
  <rect class="mv-chip mv-ai-router" x="58" y="26" width="36" height="20"/>
  <text class="mv-label" x="76" y="39" text-anchor="middle">Route</text>
  <line class="mv-rail mv-ai-path mv-ai-path-l" x1="94" y1="36" x2="130" y2="16"/>
  <line class="mv-rail mv-ai-path mv-ai-path-r" x1="94" y1="36" x2="130" y2="36"/>
  <line class="mv-rail mv-ai-path mv-ai-path-h" x1="94" y1="36" x2="130" y2="56"/>
  <rect class="mv-chip mv-ai-model mv-ai-local" x="132" y="6" width="48" height="18"/>
  <text class="mv-label" x="156" y="18" text-anchor="middle">Local</text>
  <rect class="mv-chip mv-ai-model mv-ai-remote" x="132" y="27" width="52" height="18"/>
  <text class="mv-label" x="158" y="39" text-anchor="middle">Remote</text>
  <rect class="mv-chip mv-ai-model mv-ai-hybrid" x="132" y="48" width="48" height="18"/>
  <text class="mv-label" x="156" y="60" text-anchor="middle">Hybrid</text>
  <g class="mv-tokens">
    <circle class="mv-token mv-token-1" cx="192" cy="36" r="1.8"/>
    <circle class="mv-token mv-token-2" cx="200" cy="36" r="1.8"/>
    <circle class="mv-token mv-token-3" cx="208" cy="36" r="1.8"/>
  </g>
  <circle class="mv-packet mv-ai-out" cx="224" cy="36" r="3.5"/>
</svg>`,

    verification: `
<svg class="mv" viewBox="0 0 240 72" fill="none">
  <circle class="mv-packet mv-ver-packet" cx="24" cy="36" r="3.5"/>
  <g class="mv-check mv-check-1"><rect class="mv-chip" x="48" y="26" width="34" height="20"/><text class="mv-label" x="65" y="39" text-anchor="middle">Tool</text></g>
  <g class="mv-check mv-check-2"><rect class="mv-chip" x="90" y="26" width="42" height="20"/><text class="mv-label" x="111" y="39" text-anchor="middle">Evidence</text></g>
  <g class="mv-check mv-check-3"><rect class="mv-chip" x="140" y="26" width="34" height="20"/><text class="mv-label" x="157" y="39" text-anchor="middle">Tests</text></g>
  <g class="mv-check mv-check-4"><rect class="mv-chip" x="182" y="26" width="40" height="20"/><text class="mv-label" x="202" y="39" text-anchor="middle">Conf</text></g>
  <path class="mv-ver-fail" d="M120 46 Q100 62 80 50"/>
</svg>`,

    answer: `
<svg class="mv" viewBox="0 0 200 72" fill="none">
  <polygon class="mv-arrowhead mv-answer-arrow" points="100,12 95,20 105,20"/>
  <line class="mv-rail" x1="100" y1="20" x2="100" y2="58"/>
  <circle class="mv-user-dot" cx="100" cy="58" r="5"/>
  <circle class="mv-packet mv-answer-packet" cx="100" cy="58" r="3.5"/>
</svg>`,
  };

  document.querySelectorAll("[data-viz]").forEach(function (el) {
    const key = el.getAttribute("data-viz");
    if (SVGS[key]) el.innerHTML = SVGS[key];
  });
})();
