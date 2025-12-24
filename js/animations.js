export function animateAppIn() {
  if (!window.gsap) return;
  const topbar = document.querySelector(".topbar");
  const tabs = document.querySelector(".tabs_row");
  const grid = document.querySelector(".gallery_grid");
  const island = document.querySelector(".island");
  const footer = document.querySelector(".footer_inner");

  window.gsap.set([topbar, tabs, grid, island, footer].filter(Boolean), { opacity: 0, y: 10 });
  window.gsap.to([topbar, tabs, grid].filter(Boolean), {
    opacity: 1,
    y: 0,
    duration: 0.7,
    ease: "power2.out",
    stagger: 0.06
  });
  window.gsap.to([island, footer].filter(Boolean), {
    opacity: 1,
    y: 0,
    duration: 0.8,
    ease: "power2.out",
    delay: 0.12
  });
}

export function animateGridChange(gridEl) {
  if (!window.gsap || !gridEl) return;
  const items = Array.from(gridEl.children);
  window.gsap.fromTo(
    items,
    { opacity: 0, y: 10 },
    { opacity: 1, y: 0, duration: 0.45, ease: "power2.out", stagger: 0.02, overwrite: true }
  );
}

export function animateViewerIn(shell, backdrop) {
  if (!window.gsap) return;
  window.gsap.fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: "power2.out", overwrite: true });
  window.gsap.fromTo(
    shell,
    { opacity: 0, y: 14, scale: 0.985 },
    { opacity: 1, y: 0, scale: 1, duration: 0.34, ease: "power2.out", overwrite: true }
  );
}

export function animateViewerOut(shell, backdrop) {
  return new Promise((resolve) => {
    if (!window.gsap) {
      resolve();
      return;
    }
    const tl = window.gsap.timeline({
      onComplete: () => resolve()
    });
    tl.to(shell, { opacity: 0, y: 10, scale: 0.99, duration: 0.22, ease: "power2.in", overwrite: true }, 0);
    tl.to(backdrop, { opacity: 0, duration: 0.22, ease: "power2.in", overwrite: true }, 0);
  });
}

export function animateViewerImageSwap(imgEl, swapFn) {
  if (!window.gsap || !imgEl) {
    swapFn();
    return;
  }
  const tl = window.gsap.timeline();
  tl.to(imgEl, { opacity: 0, duration: 0.12, ease: "power1.out" });
  tl.add(() => swapFn());
  tl.to(imgEl, { opacity: 1, duration: 0.18, ease: "power1.out" });
}

export function animateModalIn(card, backdrop) {
  if (!window.gsap) return;
  window.gsap.fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: "power2.out" });
  window.gsap.fromTo(card, { opacity: 0, y: 12, scale: 0.99 }, { opacity: 1, y: 0, scale: 1, duration: 0.26, ease: "power2.out" });
}

export function animateModalOut(card, backdrop) {
  return new Promise((resolve) => {
    if (!window.gsap) {
      resolve();
      return;
    }
    const tl = window.gsap.timeline({ onComplete: () => resolve() });
    tl.to(card, { opacity: 0, y: 10, scale: 0.995, duration: 0.18, ease: "power2.in" }, 0);
    tl.to(backdrop, { opacity: 0, duration: 0.18, ease: "power2.in" }, 0);
  });
}
