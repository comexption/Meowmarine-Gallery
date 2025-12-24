import { findImageIndex, getImageById } from "./state.js";
import { saveCaptionOverride } from "./storage.js";
import { animateViewerIn, animateViewerOut, animateViewerImageSwap } from "./animations.js";

function setHidden(root, hidden) {
  root.classList.toggle("hidden", hidden);
  root.setAttribute("aria-hidden", hidden ? "true" : "false");
}

function fmtInfoRow(label, value) {
  const row = document.createElement("div");
  row.style.display = "flex";
  row.style.justifyContent = "space-between";
  row.style.gap = "12px";
  const a = document.createElement("div");
  a.textContent = label;
  a.style.color = "var(--text2)";
  a.style.fontSize = "12px";
  const b = document.createElement("div");
  b.textContent = value || "—";
  b.style.color = "var(--text1)";
  b.style.fontSize = "12px";
  b.style.textAlign = "right";
  row.appendChild(a);
  row.appendChild(b);
  return row;
}

export function initViewer(state, els) {
  let openId = null;
  let keyHandler = null;
  let captionHandler = null;

  const backdrop = els.root.querySelector(".viewer_backdrop");

  function render(id, opts = {}) {
    const img = getImageById(state, id);
    if (!img) return;

    els.title.textContent = img.title || "Untitled";
    els.subtitle.textContent = `${img.tag || "—"} · ${img.date || "—"} · ${img.id}`;

    const currentSrc = els.img.getAttribute("src") || "";
    const nextSrc = img.src;

    if (opts.swap && currentSrc && currentSrc !== nextSrc) {
      animateViewerImageSwap(els.img, () => {
        els.img.src = nextSrc;
        els.img.alt = img.title || "";
      });
    } else {
      els.img.src = nextSrc;
      els.img.alt = img.title || "";
    }

    if (captionHandler) els.caption.removeEventListener("input", captionHandler);
    els.caption.value = img.caption || "";

    captionHandler = (e) => {
      const next = e.target.value || "";
      const idx = findImageIndex(state, id);
      if (idx >= 0) state.images[idx].caption = next;
      saveCaptionOverride(id, next);
      const cards = document.querySelectorAll(".card");
      for (const c of cards) {
        const aria = c.getAttribute("aria-label") || "";
        const re = new RegExp(`打开：${img.title || img.id}`);
        if (re.test(aria)) {
          const cap = c.querySelector(".card_caption");
          if (cap) cap.textContent = next.trim() || "—";
        }
      }
    };

    els.caption.addEventListener("input", captionHandler);

    while (els.info.firstChild) els.info.removeChild(els.info.firstChild);
    els.info.appendChild(fmtInfoRow("标签", img.tag || "—"));
    els.info.appendChild(fmtInfoRow("日期", img.date || "—"));
    els.info.appendChild(fmtInfoRow("文件", img.src || "—"));
  }

  function openById(id) {
    openId = id;
    render(id);
    setHidden(els.root, false);
    animateViewerIn(els.root.querySelector(".viewer_shell"), backdrop);
    if (keyHandler) window.removeEventListener("keydown", keyHandler);

    keyHandler = (e) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", keyHandler);
  }

  function close() {
    const shell = els.root.querySelector(".viewer_shell");
    animateViewerOut(shell, backdrop).then(() => {
      setHidden(els.root, true);
      openId = null;
    });
    if (keyHandler) window.removeEventListener("keydown", keyHandler);
    keyHandler = null;
  }

  function step(dir) {
    if (!openId) return;
    const idx = findImageIndex(state, openId);
    if (idx < 0) return;
    const nextIdx = (idx + dir + state.images.length) % state.images.length;
    const nextId = state.images[nextIdx].id;
    openId = nextId;
    render(nextId, { swap: true });
  }

  function prev() {
    step(-1);
  }

  function next() {
    step(1);
  }

  els.close.addEventListener("click", close);
  els.prev.addEventListener("click", prev);
  els.next.addEventListener("click", next);
  backdrop.addEventListener("click", close);

  return { openById, close, next, prev };
}
