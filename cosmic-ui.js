/* Small progressive UI touches. Content and controls work without this file. */
(() => {
  "use strict";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const updatePageVisibility = () => document.documentElement.classList.toggle("cosmic-page-hidden", document.hidden);
  document.addEventListener("visibilitychange", updatePageVisibility);
  updatePageVisibility();
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { entry.target.dataset.uiVisible = String(entry.isIntersecting); });
    }, { threshold: 0 });
    document.querySelectorAll(".timeline-item:first-child, .solar-system").forEach((item) => observer.observe(item));
  }

  document.querySelectorAll(".solar-choice, .solar-info").forEach((panel) => {
    let frame = 0;
    let clientX = 0;
    let clientY = 0;
    panel.addEventListener("pointermove", (event) => {
      if (!finePointer.matches || reducedMotion.matches) return;
      clientX = event.clientX;
      clientY = event.clientY;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const bounds = panel.getBoundingClientRect();
        panel.style.setProperty("--pointer-x", `${((clientX - bounds.left) / bounds.width * 100).toFixed(1)}%`);
        panel.style.setProperty("--pointer-y", `${((clientY - bounds.top) / bounds.height * 100).toFixed(1)}%`);
      });
    }, { passive: true });
    panel.addEventListener("pointerleave", () => {
      cancelAnimationFrame(frame);
      frame = 0;
      panel.style.removeProperty("--pointer-x");
      panel.style.removeProperty("--pointer-y");
    });
  });

  const detail = document.querySelector(".solar-info");
  const selection = document.getElementById("solar-title");
  let traceTimer;
  if (detail && selection && "MutationObserver" in window) {
    new MutationObserver(() => {
      if (reducedMotion.matches) return;
      detail.classList.remove("is-changing");
      // Restart only this brief selection response; orbital motion is untouched.
      void detail.offsetWidth;
      detail.classList.add("is-changing");
      clearTimeout(traceTimer);
      traceTimer = setTimeout(() => detail.classList.remove("is-changing"), 600);
    }).observe(selection, { childList: true, characterData: true, subtree: true });
  }
})();
