import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Modal from "../common/Modal.jsx";
import { navGroups } from "../../data/site.js";
export default function SearchPalette({ onClose }){
  const [query,setQuery]=useState("");const navigate=useNavigate();
  const links=useMemo(()=>navGroups.flatMap(group=>group.items?group.items.map(([title,to])=>({title,to})):group.path?[{title:group.label,to:group.path}]:[]),[]);
  const visible=links.filter(item=>item.title.toLocaleLowerCase().includes(query.toLocaleLowerCase())).slice(0,8);
  return <Modal open title="Search Expert" onClose={onClose} size="md"><div className="p-6"><form onSubmit={event=>{event.preventDefault();navigate(`/search?q=${encodeURIComponent(query)}`);onClose();}}><label className="grid gap-2 font-bold text-sm">Find a page or program<input autoFocus aria-label="Search Expert pages" className="input input-bordered w-full" value={query} onChange={event=>setQuery(event.target.value)} placeholder="Courses, admissions, results…"/></label></form><ul className="mt-4 grid gap-1">{visible.map(item=><li key={item.to}><Link className="flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold hover:bg-soft" to={item.to} onClick={onClose}>{item.title}<span className="ml-auto text-muted">↗</span></Link></li>)}</ul>{!visible.length&&<p className="my-5 text-sm text-muted">No matching pages. Press Enter to open the full search.</p>}<p className="mt-4 border-t border-line pt-4 text-xs text-muted">Tab to choose a page · Enter to open · Esc to close</p></div></Modal>;
}
