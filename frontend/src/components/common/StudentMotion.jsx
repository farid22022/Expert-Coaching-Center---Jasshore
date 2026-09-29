import { motion, useReducedMotion } from "framer-motion";

export const studentStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.045, delayChildren: 0.025 } },
  exit: { opacity: 0, transition: { duration: 0.12 } },
};

export function StudentMotion({ as = "div", children, index = 0, className = "", ...props }) {
  const reduce = useReducedMotion();
  const Tag = { div: motion.div, section: motion.section, article: motion.article, header: motion.header, aside: motion.aside }[as] || motion.div;
  return <Tag initial="hidden" animate="show" exit="exit" variants={{
    hidden: { opacity: 0, y: reduce ? 0 : 14 },
    show: { opacity: 1, y: 0, transition: { duration: reduce ? 0.08 : 0.32, delay: reduce ? 0 : Math.min(index * 0.045, 0.15), ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, y: reduce ? 0 : -6, transition: { duration: reduce ? 0.05 : 0.12 } },
  }} className={className} {...props}>{children}</Tag>;
}
