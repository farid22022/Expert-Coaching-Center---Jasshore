import { useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";

export default function AnimatedDisclosure({ title, children, defaultOpen = false, forceOpen = false, className = "", buttonClassName = "" }) {
  const [open, setOpen] = useState(defaultOpen);
  const reduce = useReducedMotion();
  const id = useId();
  const expanded = forceOpen || open;
  return <div className={className}>
    <button type="button" aria-expanded={expanded} aria-controls={id} onClick={() => setOpen((value) => !value)} className={`flex w-full items-center gap-2 text-left ${buttonClassName}`}>
      <span className="min-w-0 flex-1">{title}</span><ChevronDown aria-hidden="true" size={16} className={`shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`}/>
    </button>
    <AnimatePresence initial={false}>{expanded && <motion.div id={id} initial={{opacity:0,y:reduce ? 0 : -6}} animate={{opacity:1,y:0}} exit={{opacity:0,y:reduce ? 0 : -4}} transition={{duration:reduce ? 0.05 : 0.18}}>{children}</motion.div>}</AnimatePresence>
  </div>;
}
