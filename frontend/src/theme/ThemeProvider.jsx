import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { publicSiteInfoApi } from "../services/resourceApi.js";
import { applyBrandColors, applyFontSettings, cacheSiteInfo, readCachedSiteInfo } from "./ThemeRuntime.js";

const ThemeContext = createContext(null);

function resolveInitialMode() {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem("theme-mode");
  if (stored === "light" || stored === "dark") return stored;
  return "system";
}
function resolveInitialPalette() {
  if (typeof window === "undefined") return "heritage";
  const stored = window.localStorage.getItem("theme-palette");
  // Migrate users who were left on the former blue default when Heritage
  // became the institution's default palette.
  if (stored === "campus") return "heritage";
  return ["heritage", "sunrise"].includes(stored) ? stored : "heritage";
}

export function ThemeProvider({ children }) {
  const [preference, setPreference] = useState(resolveInitialMode);
  const [palette, setPalette] = useState(resolveInitialPalette);
  const [systemDark, setSystemDark] = useState(() => window.matchMedia?.("(prefers-color-scheme: dark)").matches);
  const mode = preference === "system" ? (systemDark ? "dark" : "light") : preference;
  const [motion, setMotion] = useState(() => localStorage.getItem("motion-preference") || "system");
  const [siteInfo, setSiteInfo] = useState(readCachedSiteInfo);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", mode);
    document.documentElement.setAttribute("data-palette", palette);
    window.localStorage.setItem("theme-mode", preference);
    window.localStorage.setItem("theme-palette", palette);
  }, [mode, preference, palette]);

  useEffect(() => {
    const media = matchMedia("(prefers-color-scheme: dark)");
    const update = () => setSystemDark(media.matches);
    media.addEventListener("change", update);
    const eco = navigator.connection?.saveData || navigator.hardwareConcurrency <= 4 || navigator.deviceMemory <= 4;
    document.documentElement.dataset.eco = String(Boolean(eco));
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    localStorage.setItem("motion-preference", motion);
    document.documentElement.dataset.motion = motion;
    window.dispatchEvent(new Event("campus-preferences"));
  }, [motion]);

  useEffect(() => {
    applyBrandColors(siteInfo?.theme_primary_color, siteInfo?.theme_accent_color, mode);
  }, [siteInfo, mode]);

  useEffect(() => {
    applyFontSettings(siteInfo?.theme_font_family, siteInfo?.theme_font_scale);
  }, [siteInfo]);

  useEffect(() => {
    publicSiteInfoApi
      .get()
      .then((data) => {
        if (data && Object.keys(data).length) {
          setSiteInfo(data);
          cacheSiteInfo(data);
        }
      })
      .catch(() => {
        // Keep whatever was cached/default - the site must never break on a failed fetch.
      });
  }, []);

  const toggleMode = useCallback(() => {
    setPreference(mode === "dark" ? "light" : "dark");
  }, [mode]);

  const value = useMemo(() => ({ mode, preference, setPreference, palette, setPalette, motion, setMotion, toggleMode, siteInfo }), [mode, preference, palette, motion, toggleMode, siteInfo]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
}
