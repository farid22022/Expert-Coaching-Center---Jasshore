import { Moon, Palette, Sun } from "lucide-react";

import { useTheme } from "../../theme/ThemeProvider.jsx";

export default function ThemeToggle({ className = "" }) {
  const { mode, palette, setPalette, toggleMode } = useTheme();
  const isDark = mode === "dark";

  return <div className={`flex items-center gap-1 ${className}`}>
    <button
      type="button"
      onClick={toggleMode}
      className="btn btn-ghost btn-square"
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      {isDark ? <Sun size={19} /> : <Moon size={19} />}
    </button>
    <button type="button" className="btn btn-ghost btn-square" aria-label="Change color theme" title={`Color theme: ${palette}`} onClick={() => setPalette(palette === "campus" ? "heritage" : palette === "heritage" ? "sunrise" : "campus")}><Palette size={18}/></button>
  </div>;
}
