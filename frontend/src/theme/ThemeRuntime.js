import { darken, isValidHex, lighten } from "./colorUtils.js";

export const DEFAULT_PRIMARY_COLOR = "#0f7a55";
export const DEFAULT_ACCENT_COLOR = "#c99a2e";

const TOKEN_PAIRS = [
  ["--color-brand", "--brand"],
  ["--color-deep-green", "--deep-green"],
  ["--color-dark-green", "--dark-green"],
  ["--color-accent", "--accent"],
];

function setVar(pair, value) {
  const root = document.documentElement;
  root.style.setProperty(pair[0], value);
  root.style.setProperty(pair[1], value);
}

/**
 * Applies the admin's brand colors app-wide by overriding the CSS custom properties
 * that Tailwind's @theme block AND the legacy hand-written :root CSS both read from
 * (bg-brand/text-brand/bg-accent utilities compile straight to var(--color-brand) etc).
 * Only brand/accent tokens are touched - status colors (success/error/warning) use raw
 * Tailwind palette classes elsewhere in the app and are never reachable from here.
 */
export function applyBrandColors(primaryHex, accentHex, mode = "light") {
  const primary = isValidHex(primaryHex) ? primaryHex : DEFAULT_PRIMARY_COLOR;
  const accent = isValidHex(accentHex) ? accentHex : DEFAULT_ACCENT_COLOR;

  if (mode === "dark") {
    setVar(TOKEN_PAIRS[0], lighten(primary, 12));
    setVar(TOKEN_PAIRS[1], darken(primary, 10));
    setVar(TOKEN_PAIRS[2], primary);
    setVar(TOKEN_PAIRS[3], lighten(accent, 8));
  } else {
    setVar(TOKEN_PAIRS[0], primary);
    setVar(TOKEN_PAIRS[1], darken(primary, 18));
    setVar(TOKEN_PAIRS[2], darken(primary, 8));
    setVar(TOKEN_PAIRS[3], accent);
  }
}

export const FONT_FAMILY_OPTIONS = [
  { value: "", label: "Default (Manrope)", stack: "Manrope, Inter, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif" },
  { value: "system", label: "System UI", stack: "system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif" },
  { value: "georgia", label: "Georgia (Serif)", stack: "Georgia, \"Times New Roman\", serif" },
  { value: "times", label: "Times New Roman (Serif)", stack: "\"Times New Roman\", Times, serif" },
  { value: "verdana", label: "Verdana (Sans)", stack: "Verdana, Geneva, sans-serif" },
  { value: "trebuchet", label: "Trebuchet MS (Sans)", stack: "\"Trebuchet MS\", sans-serif" },
  { value: "courier", label: "Courier New (Monospace)", stack: "\"Courier New\", Courier, monospace" },
];

export const FONT_SCALE_OPTIONS = [
  { value: "90", label: "Small (90%)" },
  { value: "", label: "Default (100%)" },
  { value: "110", label: "Large (110%)" },
  { value: "120", label: "Extra Large (120%)" },
];

/** Applies the admin's chosen site-wide font family and base text scale. Font-family
 * is set as a CSS custom property the body already inherits from (see index.css); the
 * scale is applied to the root html font-size so every rem-based Tailwind utility across
 * the whole site scales together, without touching individual component classes. */
export function applyFontSettings(fontFamily, fontScale) {
  const root = document.documentElement;
  const familyOption = FONT_FAMILY_OPTIONS.find((option) => option.value === fontFamily) || FONT_FAMILY_OPTIONS[0];
  root.style.setProperty("--site-font-family", familyOption.stack);
  const scale = FONT_SCALE_OPTIONS.some((option) => option.value === fontScale) ? fontScale : "";
  root.style.fontSize = scale ? `${scale}%` : "";
}

export function cacheSiteInfo(siteInfo) {
  try {
    localStorage.setItem("site-info-cache", JSON.stringify(siteInfo));
  } catch {
    // Ignore quota/availability errors - caching is a pure UX optimization.
  }
}

export function readCachedSiteInfo() {
  try {
    const raw = localStorage.getItem("site-info-cache");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
