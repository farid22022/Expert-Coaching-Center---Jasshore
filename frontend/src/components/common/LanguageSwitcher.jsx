import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export default function LanguageSwitcher({ className = "" }) {
  const { i18n } = useTranslation();
  const isBangla = i18n.language?.startsWith("bn");

  const toggle = () => {
    i18n.changeLanguage(isBangla ? "en" : "bn");
  };

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.9 }}
      onClick={toggle}
      className={`btn btn-ghost btn-sm font-black ${className}`}
      aria-label={isBangla ? "Switch to English" : "বাংলায় দেখুন"}
      title={isBangla ? "Switch to English" : "বাংলায় দেখুন"}
    >
      {isBangla ? "EN" : "বাং"}
    </motion.button>
  );
}
