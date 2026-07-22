(function () {
  const root = document.documentElement;
  const toggle = document.getElementById("theme-toggle");
  const storageKey = "neura-theme";

  function applyTheme(theme) {
    const next = theme === "light" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    if (toggle) {
      toggle.setAttribute(
        "aria-label",
        next === "dark" ? "Switch to light mode" : "Switch to dark mode"
      );
    }
  }

  const stored = localStorage.getItem(storageKey);
  if (stored === "light" || stored === "dark") {
    applyTheme(stored);
  } else {
    applyTheme("dark");
  }

  if (!toggle) return;

  toggle.addEventListener("click", function () {
    const current = root.getAttribute("data-theme") === "light" ? "light" : "dark";
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next);
    localStorage.setItem(storageKey, next);
  });
})();
