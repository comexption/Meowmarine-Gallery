import { loadCaptionOverrides } from "./storage.js";

export async function loadGalleryData(url) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load gallery.json");
  return await res.json();
}

export function createState(data, prefs) {
  const overrides = loadCaptionOverrides();
  const images = (data.images || []).map((img) => {
    const caption = overrides[img.id] != null ? overrides[img.id] : (img.caption || "");
    return { ...img, caption };
  });

  const tags = data.tags || [];
  const theme = prefs.theme || "dark";
  const activeTag = prefs.activeTag || "all";
  const query = prefs.query || "";

  return {
    tags,
    images,
    theme,
    activeTag,
    query,
    viewer: null
  };
}

export function setActiveTag(state, tagId) {
  state.activeTag = tagId;
}

export function setQuery(state, q) {
  state.query = q;
}

export function getTagStats(state) {
  const byTag = new Map();
  for (const t of state.tags) byTag.set(t.id, 0);
  for (const img of state.images) {
    if (!byTag.has(img.tag)) byTag.set(img.tag, 0);
    byTag.set(img.tag, (byTag.get(img.tag) || 0) + 1);
  }
  byTag.set("all", state.images.length);
  return byTag;
}

function normalize(s) {
  return (s || "").toString().trim().toLowerCase();
}

function safeQueryRegExp(query) {
  const q = normalize(query);
  if (!q) return null;
  const escaped = q.replace(new RegExp("[.*+?^${}()|[\\]\\\\]", "g"), "\\$&");
  return new RegExp(escaped, "i");
}

export function getFilteredImages(state) {
  const re = safeQueryRegExp(state.query);
  return state.images.filter((img) => {
    const tagOk = state.activeTag === "all" ? true : img.tag === state.activeTag;
    if (!tagOk) return false;
    if (!re) return true;
    const hay = `${img.title || ""}\n${img.caption || ""}\n${img.tag || ""}\n${img.date || ""}`;
    return re.test(hay);
  });
}

export function findImageIndex(state, imageId) {
  return state.images.findIndex((x) => x.id === imageId);
}

export function getImageById(state, imageId) {
  return state.images.find((x) => x.id === imageId) || null;
}
