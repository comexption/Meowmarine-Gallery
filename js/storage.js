const KEY = "meowmarine_gallery_prefs_v1";
const CAPTION_KEY = "meowmarine_gallery_captions_v1";

export function loadPrefs() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { theme: "dark" };
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : { theme: "dark" };
  } catch {
    return { theme: "dark" };
  }
}

function savePrefs(patch) {
  const cur = loadPrefs();
  const next = { ...cur, ...patch };
  localStorage.setItem(KEY, JSON.stringify(next));
}

export function saveThemePref(theme) {
  savePrefs({ theme });
}

export function saveActiveTagPref(activeTag) {
  savePrefs({ activeTag });
}

export function saveQueryPref(query) {
  savePrefs({ query });
}

export function loadCaptionOverrides() {
  try {
    const raw = localStorage.getItem(CAPTION_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function saveCaptionOverride(imageId, caption) {
  const cur = loadCaptionOverrides();
  const next = { ...cur, [imageId]: caption };
  localStorage.setItem(CAPTION_KEY, JSON.stringify(next));
}
