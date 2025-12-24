import { loadGalleryData, createState, setActiveTag, setQuery, getFilteredImages, getTagStats } from "./state.js";
import { loadPrefs, saveThemePref } from "./storage.js";
import { renderTabsRow, renderIslandTabs, renderGrid, renderCounts, renderFooterStats } from "./ui_render.js";
import { initViewer } from "./viewer.js";
import { animateAppIn, animateGridChange, animateModalIn, animateModalOut } from "./animations.js";

const els = {
  tabsRow: document.getElementById("tabs_row"),
  grid: document.getElementById("grid"),
  empty: document.getElementById("empty_state"),
  tagCount: document.getElementById("tag_count"),
  imageCount: document.getElementById("image_count"),
  footerStats: document.getElementById("footer_stats"),
  searchInput: document.getElementById("search_input"),
  themeToggle: document.getElementById("theme_toggle"),
  island: document.getElementById("island"),
  islandTabs: document.getElementById("island_tabs"),
  islandTheme: document.getElementById("island_theme_btn"),
  islandSearch: document.getElementById("island_search_btn"),
  mobileSearchModal: document.getElementById("mobile_search_modal"),
  mobileSearchClose: document.getElementById("mobile_search_close"),
  mobileSearchInput: document.getElementById("mobile_search_input")
};

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  const iconName = theme === "light" ? "moon" : "sun";
  const mobileIconName = theme === "light" ? "moon" : "sun";
  setLucideIcon(els.themeToggle, iconName);
  setLucideIcon(els.islandTheme, mobileIconName);
  saveThemePref(theme);
  if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
}

function setLucideIcon(button, name) {
  const existing = button.querySelector("svg");
  if (existing) existing.remove();
  const i = document.createElement("i");
  i.setAttribute("data-lucide", name);
  button.appendChild(i);
}

function shouldUseMobileSearch() {
  return window.matchMedia("(max-width: 720px)").matches;
}

function openMobileSearch(current) {
  els.mobileSearchInput.value = current || "";
  els.mobileSearchModal.classList.remove("hidden");
  els.mobileSearchModal.setAttribute("aria-hidden", "false");
  animateModalIn(els.mobileSearchModal.querySelector(".mobile_search_card"), els.mobileSearchModal.querySelector(".mobile_search_backdrop"));
  setTimeout(() => els.mobileSearchInput.focus(), 60);
}

function closeMobileSearch() {
  const card = els.mobileSearchModal.querySelector(".mobile_search_card");
  const backdrop = els.mobileSearchModal.querySelector(".mobile_search_backdrop");
  animateModalOut(card, backdrop).then(() => {
    els.mobileSearchModal.classList.add("hidden");
    els.mobileSearchModal.setAttribute("aria-hidden", "true");
  });
}

function wireSearch(state) {
  const syncQuery = (q) => {
    setQuery(state, q);
    rerender(state, { animateGrid: true });
  };

  els.searchInput.addEventListener("input", (e) => {
    const q = e.target.value || "";
    syncQuery(q);
  });

  els.islandSearch.addEventListener("click", () => {
    if (!shouldUseMobileSearch()) {
      els.searchInput.focus();
      return;
    }
    openMobileSearch(state.query);
  });

  els.mobileSearchClose.addEventListener("click", () => closeMobileSearch());
  els.mobileSearchModal.querySelector(".mobile_search_backdrop").addEventListener("click", () => closeMobileSearch());

  els.mobileSearchInput.addEventListener("input", (e) => {
    const q = e.target.value || "";
    els.searchInput.value = q;
    syncQuery(q);
  });
}

function wireTheme(state) {
  const toggle = () => {
    const next = state.theme === "light" ? "dark" : "light";
    state.theme = next;
    applyTheme(next);
  };
  els.themeToggle.addEventListener("click", toggle);
  els.islandTheme.addEventListener("click", toggle);
}

function rerender(state, opts = {}) {
  const filtered = getFilteredImages(state);
  const tagStats = getTagStats(state);

  renderTabsRow(els.tabsRow, state, tagStats, (tagId) => {
    setActiveTag(state, tagId);
    rerender(state, { animateGrid: true });
  });

  renderIslandTabs(els.islandTabs, state, tagStats, (tagId) => {
    setActiveTag(state, tagId);
    rerender(state, { animateGrid: true });
  });

  const hasItems = filtered.length > 0;
  els.empty.classList.toggle("hidden", hasItems);

  renderGrid(els.grid, filtered, state, (imageId) => state.viewer.openById(imageId));

  renderCounts(els.tagCount, els.imageCount, state);
  renderFooterStats(els.footerStats, state, filtered.length);

  if (opts.animateGrid) animateGridChange(els.grid);
  if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
}

async function main() {
  const data = await loadGalleryData("data/gallery.json");
  const prefs = loadPrefs();
  const state = createState(data, prefs);

  state.viewer = initViewer(state, {
    root: document.getElementById("viewer"),
    img: document.getElementById("viewer_img"),
    title: document.getElementById("viewer_title"),
    subtitle: document.getElementById("viewer_subtitle"),
    caption: document.getElementById("viewer_caption"),
    info: document.getElementById("viewer_info"),
    close: document.getElementById("viewer_close"),
    prev: document.getElementById("viewer_prev"),
    next: document.getElementById("viewer_next")
  });

  els.searchInput.value = state.query || "";

  applyTheme(state.theme);
  wireSearch(state);
  wireTheme(state);

  rerender(state, { animateGrid: false });
  animateAppIn();

  window.addEventListener("resize", () => {
    if (!shouldUseMobileSearch() && !els.mobileSearchModal.classList.contains("hidden")) closeMobileSearch();
  });
}

main();
