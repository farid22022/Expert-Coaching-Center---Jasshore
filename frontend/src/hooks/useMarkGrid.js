import { useEffect, useRef } from "react";
import { parseMarkPaste } from "../services/markGrid.js";

/** Native table controls keep their semantics; keyboard/paste enhance offline number cells only. */
export default function useMarkGrid({ rows, components, draft, setDraft, frozen, onError }) {
  const ref=useRef(null);
  const dirty=Object.keys(draft).length;
  useEffect(()=>{if(!dirty)return;const warn=event=>{event.preventDefault();event.returnValue="";};window.addEventListener("beforeunload",warn);return()=>window.removeEventListener("beforeunload",warn);},[dirty]);
  const cells=()=>Array.from(ref.current?.querySelectorAll('tbody input[type="number"]')||[]);
  const keyDown=event=>{
    if(event.target.type!=="number")return;const inputs=cells(),index=inputs.indexOf(event.target);let next=index;
    if(event.key==="Enter"||event.key==="ArrowDown")next+=components.length*(event.shiftKey?-1:1);
    else if(event.key==="ArrowUp")next-=components.length;
    else if(event.key==="ArrowLeft")next--;else if(event.key==="ArrowRight"||event.key==="Tab")next+=event.shiftKey?-1:1;else return;
    if(inputs[next]&&!inputs[next].disabled){event.preventDefault();inputs[next].focus();inputs[next].select();}
  };
  const paste=event=>{
    if(event.target.type!=="number"||frozen)return;const text=event.clipboardData.getData("text");if(!/[\t\n]/.test(text))return;
    event.preventDefault();const index=cells().indexOf(event.target);
    try{const changes=parseMarkPaste(text,rows,components,Math.floor(index/components.length),index%components.length);setDraft(previous=>{const next={...previous};for(const item of changes){const key=`${item.row.enrollment}:${item.component.id}`;next[key]={...item.row.marks[item.component.id],...next[key],enrollment:item.row.enrollment,component:item.component.id,state:item.state,obtained:item.obtained,attendance:item.attendance};}return next;});onError("");}
    catch(error){onError(error.message);}
  };
  return {ref,onKeyDown:keyDown,onPaste:paste};
}
