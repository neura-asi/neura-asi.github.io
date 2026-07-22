(function () {
  const SVGS = {
    user: `
<svg class="mv" viewBox="0 0 220 72" fill="none">
  <rect class="mv-chip" x="8" y="8" width="40" height="14"/>
  <text class="mv-label" x="28" y="18" text-anchor="middle">TUI</text>
  <rect class="mv-chip" x="54" y="8" width="40" height="14"/>
  <text class="mv-label" x="74" y="18" text-anchor="middle">CLI</text>
  <rect class="mv-chip" x="100" y="8" width="52" height="14"/>
  <text class="mv-label" x="126" y="18" text-anchor="middle">Remote</text>
  <rect class="mv-chip" x="158" y="8" width="48" height="14"/>
  <text class="mv-label" x="182" y="18" text-anchor="middle">Dapp</text>
  <line class="mv-rail" x1="110" y1="28" x2="110" y2="48"/>
  <circle class="mv-packet mv-user-packet" cx="110" cy="36" r="3.5"/>
  <rect class="mv-chip mv-chip-lit" x="70" y="52" width="80" height="14"/>
  <text class="mv-label" x="110" y="62" text-anchor="middle">session</text>
</svg>`,

    context: `
<svg class="mv" viewBox="0 0 220 72" fill="none">
  <circle class="mv-packet mv-intent-in" cx="24" cy="36" r="3.5"/>
  <rect class="mv-chip mv-chip-1" x="50" y="8" width="50" height="14"/>
  <text class="mv-label" x="75" y="18" text-anchor="middle">prompt</text>
  <rect class="mv-chip mv-chip-2" x="110" y="8" width="50" height="14"/>
  <text class="mv-label" x="135" y="18" text-anchor="middle">chat</text>
  <rect class="mv-chip mv-chip-3" x="50" y="30" width="50" height="14"/>
  <text class="mv-label" x="75" y="40" text-anchor="middle">tools</text>
  <rect class="mv-chip mv-chip-4" x="110" y="30" width="50" height="14"/>
  <text class="mv-label" x="135" y="40" text-anchor="middle">cwd</text>
  <rect class="mv-chip" x="70" y="52" width="80" height="14"/>
  <text class="mv-label" x="110" y="62" text-anchor="middle">curated</text>
  <circle class="mv-packet mv-intent-out" cx="200" cy="36" r="3.5"/>
</svg>`,

    memory: `
<svg class="mv mv--memory" viewBox="0 0 280 72" fill="none">
  <circle class="mv-packet mv-graph-pulse" cx="30" cy="36" r="3"/>
  <circle class="mv-gn" cx="70" cy="22" r="4"/>
  <circle class="mv-gn mv-gn-hit" cx="110" cy="36" r="4"/>
  <circle class="mv-gn" cx="70" cy="50" r="4"/>
  <circle class="mv-gn" cx="150" cy="22" r="3.5"/>
  <circle class="mv-gn" cx="150" cy="50" r="3.5"/>
  <line class="mv-rail" x1="70" y1="22" x2="110" y2="36"/>
  <line class="mv-rail" x1="70" y1="50" x2="110" y2="36"/>
  <line class="mv-rail" x1="110" y1="36" x2="150" y2="22"/>
  <line class="mv-rail" x1="110" y1="36" x2="150" y2="50"/>
  <text class="mv-label" x="210" y="30" text-anchor="middle">embed</text>
  <text class="mv-label" x="210" y="46" text-anchor="middle">cascade</text>
  <circle class="mv-packet mv-mem-comm" cx="180" cy="36" r="2.5"/>
</svg>`,

    sidecar: `
<svg class="mv" viewBox="0 0 220 72" fill="none">
  <rect class="mv-chip" x="20" y="26" width="70" height="20"/>
  <text class="mv-label" x="55" y="39" text-anchor="middle">main AI</text>
  <rect class="mv-chip mv-side-brain mv-chip-lit" x="120" y="26" width="70" height="20"/>
  <text class="mv-label" x="155" y="39" text-anchor="middle">sidecar</text>
  <circle class="mv-packet mv-side-in" cx="100" cy="36" r="2.5"/>
  <circle class="mv-packet mv-side-out-a" cx="200" cy="20" r="2"/>
  <circle class="mv-packet mv-side-out-b" cx="200" cy="36" r="2"/>
  <circle class="mv-packet mv-side-out-c" cx="200" cy="52" r="2"/>
</svg>`,

    diet: `
<svg class="mv" viewBox="0 0 220 72" fill="none">
  <rect class="mv-vault-big" x="20" y="16" width="70" height="40"/>
  <text class="mv-label" x="55" y="38" text-anchor="middle">large</text>
  <line class="mv-rail" x1="100" y1="36" x2="120" y2="36"/>
  <rect class="mv-vault-tok mv-chip-lit" x="128" y="24" width="70" height="24"/>
  <text class="mv-label mv-vault-tok-label" x="163" y="39" text-anchor="middle">&lt;ctx/&gt;</text>
</svg>`,

    assemble: `
<svg class="mv" viewBox="0 0 220 72" fill="none">
  <rect class="mv-chip mv-chip-1" x="10" y="8" width="60" height="12"/>
  <rect class="mv-chip mv-chip-2" x="10" y="24" width="80" height="12"/>
  <rect class="mv-chip mv-chip-3" x="10" y="40" width="50" height="12"/>
  <rect class="mv-chip mv-chip-4" x="10" y="56" width="70" height="12"/>
  <line class="mv-rail" x1="100" y1="36" x2="130" y2="36"/>
  <rect class="mv-chip mv-chip-lit" x="136" y="22" width="70" height="28"/>
  <text class="mv-label" x="171" y="39" text-anchor="middle">prompt</text>
</svg>`,

    provider: `
<svg class="mv" viewBox="0 0 240 72" fill="none">
  <circle class="mv-packet mv-ai-in" cx="20" cy="36" r="3.5"/>
  <rect class="mv-chip mv-ai-router" x="48" y="26" width="40" height="20"/>
  <text class="mv-label" x="68" y="39" text-anchor="middle">route</text>
  <rect class="mv-chip mv-ai-local" x="120" y="6" width="52" height="16"/>
  <text class="mv-label" x="146" y="17" text-anchor="middle">Local</text>
  <rect class="mv-chip mv-ai-remote" x="120" y="28" width="58" height="16"/>
  <text class="mv-label" x="149" y="39" text-anchor="middle">Remote</text>
  <rect class="mv-chip mv-ai-hybrid" x="120" y="50" width="52" height="16"/>
  <text class="mv-label" x="146" y="61" text-anchor="middle">Compat</text>
  <circle class="mv-packet mv-ai-out" cx="220" cy="36" r="3.5"/>
</svg>`,

    runtime: `
<svg class="mv" viewBox="0 0 260 72" fill="none">
  <circle class="mv-packet mv-tool-in" cx="18" cy="36" r="3"/>
  <rect class="mv-chip mv-tool-1" x="40" y="10" width="44" height="14"/>
  <text class="mv-label" x="62" y="20" text-anchor="middle">stream</text>
  <rect class="mv-chip mv-tool-2" x="96" y="10" width="40" height="14"/>
  <text class="mv-label" x="116" y="20" text-anchor="middle">tools</text>
  <rect class="mv-chip mv-tool-3" x="148" y="10" width="48" height="14"/>
  <text class="mv-label" x="172" y="20" text-anchor="middle">ctx_get</text>
  <rect class="mv-chip mv-tool-4" x="90" y="48" width="52" height="14"/>
  <text class="mv-label" x="116" y="58" text-anchor="middle">retry</text>
  <path class="mv-cache-miss" d="M116 28 V44"/>
  <circle class="mv-packet mv-tool-out" cx="230" cy="36" r="3"/>
</svg>`,

    answer: `
<svg class="mv" viewBox="0 0 200 72" fill="none">
  <polygon class="mv-arrowhead mv-answer-arrow" points="100,12 95,20 105,20"/>
  <line class="mv-rail" x1="100" y1="20" x2="100" y2="58"/>
  <circle class="mv-user-dot" cx="100" cy="58" r="5"/>
  <circle class="mv-packet mv-answer-packet" cx="100" cy="58" r="3.5"/>
</svg>`,

    after: `
<svg class="mv" viewBox="0 0 240 72" fill="none">
  <rect class="mv-chip mv-chip-1" x="20" y="28" width="50" height="16"/>
  <text class="mv-label" x="45" y="39" text-anchor="middle">persist</text>
  <rect class="mv-chip mv-chip-2" x="90" y="28" width="50" height="16"/>
  <text class="mv-label" x="115" y="39" text-anchor="middle">extract</text>
  <rect class="mv-chip mv-chip-3" x="160" y="28" width="58" height="16"/>
  <text class="mv-label" x="189" y="39" text-anchor="middle">garden</text>
  <circle class="mv-packet mv-cache-req" cx="70" cy="36" r="2.5"/>
  <circle class="mv-packet mv-mem-comm" cx="145" cy="36" r="2.5"/>
</svg>`,
  };

  // Map legacy aliases if any remain
  SVGS.intent = SVGS.context;
  SVGS.planner = SVGS.assemble;
  SVGS.tools = SVGS.runtime;
  SVGS.symbolic = SVGS.diet;
  SVGS.ai = SVGS.provider;

  document.querySelectorAll("[data-viz]").forEach(function (el) {
    const key = el.getAttribute("data-viz");
    if (SVGS[key]) el.innerHTML = SVGS[key];
  });
})();
