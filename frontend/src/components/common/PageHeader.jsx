import {motion, useReducedMotion} from "framer-motion";
import {fadeIn, fadeDown} from "./motionVariants.js";
import PageIllustration, { illustrationForPage } from "./PageIllustration.jsx";

export default function PageHeader({ eyebrow, title, description, actions, className = "" }) {
  const reduce = useReducedMotion();
  return (
    <motion.header variants={reduce ? fadeIn : fadeDown} initial="hidden" animate="show" className={`flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between ${className}`}>
      <div className="min-w-0">
        {eyebrow && <p className="text-sm font-black uppercase tracking-wide text-brand">{eyebrow}</p>}
        <h1 className="mt-1 text-2xl font-black text-ink sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm font-semibold text-muted">{description}</p>}
      </div>
      <PageIllustration kind={illustrationForPage(title)} className="hidden sm:ml-auto sm:block" />
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </motion.header>
  );
}
