import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { publicSiteInfoApi } from "../services/resourceApi.js";
import { applyBrandColors, applyFontSettings, cacheSiteInfo, readCachedSiteInfo } from "./ThemeRuntime.js";

const ThemeContext = createContext(null);

function resolveInitialMode() {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem("theme-mode");
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(resolveInitialMode);
  const [siteInfo, setSiteInfo] = useState(readCachedSiteInfo);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", mode);
    window.localStorage.setItem("theme-mode", mode);
  }, [mode]);

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
    setMode((current) => (current === "dark" ? "light" : "dark"));
  }, []);

  const value = useMemo(() => ({ mode, toggleMode, siteInfo }), [mode, toggleMode, siteInfo]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
}
