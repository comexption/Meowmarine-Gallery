import { saveActiveTagPref, saveQueryPref } from "./storage.js";

function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

function tagLabel(state, tagId) {
  const t = (state.tags || []).find((x) => x.id === tagId);
  return t ? t.label : tagId;
}

export function renderTabsRow(root, state, tagStats, onSelect) {
  clear(root);
  for (const t of state.tags) {
    const btn = document.createElement("button");
    btn.className = "tab_btn";
    btn.type = "button";
    btn.textContent = `${t.label} · ${tagStats.get(t.id) || 0}`;
    btn.dataset.active = state.activeTag === t.id ? "true" : "false";
    btn.addEventListener("click", () => {
      saveActiveTagPref(t.id);
      onSelect(t.id);
    });
    root.appendChild(btn);
  }
}

export function renderIslandTabs(root, state, tagStats, onSelect) {
  clear(root);
  for (const t of state.tags) {
    const btn = document.createElement("button");
    btn.className = "island_tab";
    btn.type = "button";
    btn.textContent = t.label;
    btn.dataset.active = state.activeTag === t.id ? "true" : "false";
    btn.setAttribute("title", `${t.label} · ${tagStats.get(t.id) || 0}`);
    btn.addEventListener("click", () => {
      saveActiveTagPref(t.id);
      onSelect(t.id);
    });
    root.appendChild(btn);
  }
}

export function renderGrid(root, images, state, onOpen) {
  clear(root);
  for (const img of images) {
    const card = document.createElement("article");
    card.className = "card";
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `打开：${img.title || img.id}`);

    const media = document.createElement("div");
    media.className = "card_media";

    const imageEl = document.createElement("img");
    imageEl.src = img.src;
    imageEl.alt = img.title || "";
    imageEl.loading = "lazy";

    const overlay = document.createElement("div");
    overlay.className = "card_overlay";

    const meta = document.createElement("div");
    meta.className = "card_meta";

    const left = document.createElement("div");
    const title = document.createElement("div");
    title.className = "card_title";
    title.textContent = img.title || "Untitled";

    const caption = document.createElement("div");
    caption.className = "card_caption";
    caption.textContent = (img.caption || "").trim() || "—";

    left.appendChild(title);
    left.appendChild(caption);

    const badge = document.createElement("div");
    badge.className = "card_badge";
    badge.textContent = tagLabel(state, img.tag);

    meta.appendChild(left);
    meta.appendChild(badge);

    media.appendChild(imageEl);
    media.appendChild(overlay);
    media.appendChild(meta);

    card.appendChild(media);

    const open = () => onOpen(img.id);
    card.addEventListener("click", open);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") open();
    });

    root.appendChild(card);
  }
}

export function renderCounts(tagCountEl, imageCountEl, state) {
  const tagCount = (state.tags || []).filter((t) => t.id !== "all").length;
  const imageCount = (state.images || []).length;
  tagCountEl.textContent = `${tagCount} 标签`;
  imageCountEl.textContent = `${imageCount} 图片`;
}

export function renderFooterStats(el, state, filteredCount) {
  const total = (state.images || []).length;
  const tag = state.activeTag;
  const tagText = tag === "all" ? "全部" : tag;
  const q = (state.query || "").trim();
  const qText = q ? ` · 搜索: "${q}"` : "";
  el.textContent = `${filteredCount}/${total} · 标签: ${tagText}${qText}`;
  saveQueryPref(state.query || "");
}

const backToTop = document.getElementById("backToTop");

window.addEventListener("scroll", () => {
  if (window.scrollY > 300) { // 滚动超过 300px 时显示
    backToTop.classList.add("show");
  } else {
    backToTop.classList.remove("show");
  }
});

backToTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});
