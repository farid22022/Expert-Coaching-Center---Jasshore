import { lazy, Suspense, useEffect, useState } from "react";
const Renderer = lazy(() => import("./WaveMesh.jsx"));
/** @param {{variant?:'hero'|'section'|'dashboard',intensity?:'low'|'medium',compact?:boolean,className?:string}} props */
export default function LiveWaveBackground({ variant = "hero", intensity = "low", compact, className = "" }) {
  const [ready,setReady]=useState(false);
  useEffect(()=>{if(matchMedia("(max-width:767px)").matches)return;let idle;const start=()=>setReady(true);if(typeof requestIdleCallback==="function")idle=requestIdleCallback(start,{timeout:2000});else idle=setTimeout(start,400);return()=>{if(typeof cancelIdleCallback==="function")cancelIdleCallback(idle);else clearTimeout(idle);};},[]);
  const poster=<div className={`wave-mesh ${className}`} aria-hidden="true"><img src="/images/campus/wave-poster.svg" alt="" width="900" height="300" style={{width:"100%",height:"100%",objectFit:"fill",opacity:.35}}/></div>;
  return ready ? <Suspense fallback={poster}><Renderer className={className} compact={compact ?? variant==="dashboard"} intensity={intensity}/></Suspense> : poster;
}
