import { useEffect, useRef, useState } from "react";

/** Optional procedural WebGL scene. Poster remains visible on low-power devices or context failure. */
export default function HeroScene() {
  const host=useRef(null);const [ready,setReady]=useState(false);
  useEffect(()=>{
    const node=host.current;const motion=matchMedia("(prefers-reduced-motion:reduce)");
    if(motion.matches||document.documentElement.dataset.motion==="reduce"||matchMedia("(max-width:767px)").matches||navigator.hardwareConcurrency<=4||navigator.deviceMemory<=4||navigator.connection?.saveData)return;
    let disposed=false,renderer,observer,resize,frame=0,visible=false,previous=0,phase=0,group,camera,scene;const materials=[],geometries=[];let pointerX=0,pointerY=0;
    const stop=()=>{cancelAnimationFrame(frame);frame=0;};
    const reduced=()=>motion.matches||document.documentElement.dataset.motion==="reduce";
    const render=time=>{if(disposed||!visible||document.hidden||reduced()){stop();return;}if(time-previous>32){phase+=.012;group.rotation.y=-.25+Math.sin(phase*.5)*.06+pointerX*.1;group.rotation.x=.1+pointerY*.06;group.position.y=Math.sin(phase)*.09;renderer.render(scene,camera);previous=time;}frame=requestAnimationFrame(render);};
    const sync=()=>{stop();if(renderer){renderer.render(scene,camera);if(visible&&!document.hidden&&!reduced())frame=requestAnimationFrame(render);}};
    const move=event=>{const rect=node.getBoundingClientRect();pointerX=(event.clientX-rect.left)/rect.width-.5;pointerY=(event.clientY-rect.top)/rect.height-.5;};
    async function start(){
      try {
        const T=await import("three128");if(disposed)return;
        const canvas=node.querySelector("canvas");renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:"low-power"});renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.outputEncoding=T.sRGBEncoding;
        scene=new T.Scene();camera=new T.PerspectiveCamera(33,1,.1,50);camera.position.set(0,.1,8.5);group=new T.Group();scene.add(group);
        scene.add(new T.AmbientLight(0xd8e8ff,1));const light=new T.DirectionalLight(0xc9f3ff,1.6);light.position.set(-3,5,6);scene.add(light);const rim=new T.PointLight(0x9e8bff,1.7);rim.position.set(4,1,2);scene.add(rim);
        const material=(color,extra={})=>{const m=new T.MeshPhysicalMaterial({color,roughness:.28,metalness:.08,clearcoat:1,...extra});materials.push(m);return m;};
        const blue=material(0x7b83ec),glass=material(0xb7e9ff,{transparent:true,opacity:.76}),paper=material(0xecf3ff),violet=material(0x806de9),gold=material(0xa5f3fc);
        const box=(w,h,d,mat,x,y,z,rz=0)=>{const geo=new T.BoxGeometry(w,h,d);geometries.push(geo);const mesh=new T.Mesh(geo,mat);mesh.position.set(x,y,z);mesh.rotation.z=rz;group.add(mesh);return mesh;};
        box(2.1,2.75,.36,blue,.15,-.1,0,-.14);box(1.93,2.58,.25,paper,.16,-.1,.24,-.14);box(2.1,2.75,.08,glass,.15,-.1,.42,-.14);
        for(let i=0;i<3;i++)box(1.1-i*.15,.055,.03,blue,.12,.42-i*.19,.49,-.14);
        const cap=new T.Group();const capTop=new T.Mesh(new T.BoxGeometry(1.25,.09,1.25),violet);geometries.push(capTop.geometry);capTop.rotation.y=.65;cap.add(capTop);const dome=new T.Mesh(new T.CylinderGeometry(.37,.43,.3,24),blue);geometries.push(dome.geometry);dome.position.y=-.2;cap.add(dome);cap.position.set(.2,1.65,.2);cap.rotation.z=-.14;group.add(cap);
        for(let i=0;i<3;i++){const geo=new T.TorusGeometry(.34,.012,6,60);geometries.push(geo);const ring=new T.Mesh(geo,gold);ring.position.set(-1.6, .3, .4);ring.rotation.set(i*Math.PI/3,i*.7,.5);group.add(ring);}
        box(1.2,.64,.11,glass,1.45,-1.3,.6,.12);box(.77,.055,.03,blue,1.45,-1.25,.68,.12);box(.5,.04,.03,blue,1.32,-1.43,.68,.12);
        box(.95,.66,.11,glass,-1.45,-1.1,.5,-.08);box(.53,.055,.03,violet,-1.45,-1.02,.58,-.08);
        const geo=new T.IcosahedronGeometry(.23,1);geometries.push(geo);const orb=new T.Mesh(geo,gold);orb.position.set(1.65,1.05,.2);group.add(orb);
        resize=new ResizeObserver(()=>{const {width,height}=node.getBoundingClientRect();renderer.setSize(width,height,false);camera.aspect=width/Math.max(1,height);camera.updateProjectionMatrix();sync();});resize.observe(node);
        observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();});observer.observe(node);node.addEventListener("pointermove",move,{passive:true});document.addEventListener("visibilitychange",sync);motion.addEventListener("change",sync);window.addEventListener("campus-preferences",sync);renderer.render(scene,camera);setReady(true);
      }catch{/* Static poster is the complete fallback, including unavailable WebGL. */}
    }
    const idle=typeof requestIdleCallback==="function"?requestIdleCallback(start,{timeout:3500}):setTimeout(start,800);
    return()=>{disposed=true;stop();if(typeof cancelIdleCallback==="function")cancelIdleCallback(idle);else clearTimeout(idle);observer?.disconnect();resize?.disconnect();node.removeEventListener("pointermove",move);document.removeEventListener("visibilitychange",sync);motion.removeEventListener("change",sync);window.removeEventListener("campus-preferences",sync);geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());renderer?.dispose();};
  },[]);
  return <div ref={host} className="campus-hero-scene" data-ready={ready} aria-hidden="true"><img src="/images/campus/hero-poster.svg" alt="" width="600" height="520" fetchPriority="high"/><canvas onContextLost={()=>setReady(false)}/></div>;
}
