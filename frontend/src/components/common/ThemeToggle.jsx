import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";

import { useTheme } from "../../theme/ThemeProvider.jsx";

export default function ThemeToggle({ className = "" }) {
  const { mode, toggleMode } = useTheme();
  const isDark = mode === "dark";

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.9 }}
      onClick={toggleMode}
      className={`btn btn-ghost btn-square ${className}`}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      {isDark ? <Sun size={19} /> : <Moon size={19} />}
    </motion.button>
  );
}
