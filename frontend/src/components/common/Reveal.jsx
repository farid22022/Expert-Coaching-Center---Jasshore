import { motion, useReducedMotion } from "framer-motion";
import { fadeIn, fadeUp } from "./motionVariants.js";
const tags = {div:motion.div,section:motion.section,article:motion.article,header:motion.header,footer:motion.footer};
// One observer per meaningful section, not per descendant.
export default function Reveal({as="div",children,className=""}) {
  const reduce = useReducedMotion();
  const Tag = tags[as] || motion.div;
  return <Tag variants={reduce ? fadeIn : fadeUp} initial="hidden" whileInView="show" viewport={{once:true,amount:0.15}} className={className}>{children}</Tag>;
}
