import { useEffect, useRef } from "react";
import { useInView, useReducedMotion } from "framer-motion";

export default function LearningIcon({name, fallback, className="h-16 w-16"}) {
  const ref = useRef(null);
  const visible = useInView(ref, {once:true});
  const reduced = useReducedMotion();
  useEffect(() => {
    if (visible && !reduced) ref.current?.play()?.catch(() => {});
  }, [visible, reduced]);
  if (reduced) return <img src={fallback} alt="" className={`${className} object-contain`} width="64" height="64"/>;
  return <video ref={ref} aria-hidden="true" muted playsInline preload="none" poster={fallback} className={`${className} shrink-0 rounded-lg object-contain`}><source src={`/icons/${name}.mp4`} type="video/mp4"/></video>;
}
