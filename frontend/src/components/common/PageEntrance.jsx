import {useEffect} from "react";
import {useLocation} from "react-router-dom";
import {motion,useAnimationControls,useReducedMotion} from "framer-motion";
import {fadeIn,fadeUp} from "./motionVariants.js";
export default function PageEntrance({children}) {
  const {pathname}=useLocation();
  const controls=useAnimationControls();
  const reduce=useReducedMotion();
  useEffect(() => { controls.set("hidden"); controls.start("show"); },[pathname,controls,reduce]);
  return <motion.div className="min-w-0" variants={reduce ? fadeIn : fadeUp} animate={controls}>{children}</motion.div>;
}
