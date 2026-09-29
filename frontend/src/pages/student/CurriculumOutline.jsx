import { useState } from "react";
import AnimatedDisclosure from "../../components/common/AnimatedDisclosure.jsx";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, ChevronDown, Clock, FileText, LockKeyhole, PlayCircle, ClipboardList, Search, X } from "lucide-react";

export default function CurriculumOutline({groups, weeks = [], selected, onSelect, onClose}) {
  const [search, setSearch] = useState("");
  const reduceMotion = useReducedMotion();
  const query = search.trim().toLowerCase();
  const done = (item) => item.viewed || item.is_done;
  const items = groups.flatMap((g) => g.items);
  const percent = items.length ? Math.round(items.filter(done).length / items.length * 100) : 0;
  function rows(units) {
    return units.map((item) => {
      const Icon = item.unit_type === "video" ? PlayCircle : ["mcq", "exam", "assignment"].includes(item.unit_type) ? ClipboardList : FileText;
      const active = selected?.id === item.id && selected?.unit_type === item.unit_type;
      return <button key={`${item.unit_type}-${item.id}`} onClick={() => onSelect(item)} aria-current={active ? "step" : undefined} className={`flex w-full items-start gap-2 border-l-4 px-3 py-3 text-left text-sm transition-colors ${active ? "border-emerald-600 bg-emerald-50 text-emerald-900" : "border-transparent hover:bg-slate-50"}`}><Icon size={17} className="mt-0.5 shrink-0" /><span className="min-w-0 flex-1"><span className="block font-semibold">{item.title}</span><span className="mt-1 block text-xs capitalize text-slate-500">{item.unit_type} {item.duration_minutes ? `· ${item.duration_minutes} min` : ""}</span></span>{done(item) && <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />}</button>;
    });
  }
  function chapterRows(units) {
    const chapters = Map.groupBy ? Map.groupBy(units, (i) => i.chapter || "Lessons & practice") : units.reduce((map, item) => { const key = item.chapter || "Lessons & practice"; map.set(key, [...(map.get(key) || []), item]); return map; }, new Map());
    return [...chapters].map(([title, children]) => <AnimatedDisclosure key={title} defaultOpen forceOpen={Boolean(query)} className="border-t border-slate-100" buttonClassName="px-3 py-3 text-sm font-bold" title={<>{title}<span className="ml-2 text-xs font-normal text-slate-400">{children.length} units</span></>}>{rows(children)}</AnimatedDisclosure>);
  }
  return <aside className="h-full overflow-auto bg-white p-4 lg:rounded-2xl lg:border lg:border-slate-200">
    <div className="flex items-center justify-between"><h2 className="text-lg font-bold">Course content</h2><button aria-label="Close course content" className="btn btn-ghost btn-sm lg:hidden" onClick={onClose}><X size={18}/></button></div>
    <div className="mt-3 flex items-center gap-3"><progress aria-label="Released content completed" className="progress progress-success flex-1" value={percent} max="100"/><span className="text-xs font-semibold text-emerald-700">{percent}%</span></div>
    <label className="mt-4 flex items-center gap-2 rounded-lg border border-slate-200 px-3"><Search size={16} className="text-slate-400"/><input aria-label="Search lessons" className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none" placeholder="Search lessons" value={search} onChange={(e) => setSearch(e.target.value)}/></label>
    <AnimatePresence initial={false}>{groups.map((group) => {
      const subjectMatch = group.title.toLowerCase().includes(query);
      const match = (item) => !query || subjectMatch || `${item.title} ${item.chapter} ${item.topic}`.toLowerCase().includes(query);
      const visible = group.items.filter(match);
      const subjectWeeks = weeks.filter((w) => String(w.subject) === group.subjectId && (!query || subjectMatch || w.title.toLowerCase().includes(query) || visible.some((i) => w.chapters.some((c) => c.id === i.curriculum_chapter))));
      if (query && !visible.length && !subjectWeeks.length && !subjectMatch) return null;
      return <motion.section key={group.key} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:reduceMotion ? 0 : 0.2}} className="mt-5"><h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-emerald-700">{group.title}</h3>
        {subjectWeeks.map((week) => {
          const units = visible.filter((i) => week.chapters.some((c) => c.id === i.curriculum_chapter));
          return <AnimatedDisclosure key={week.id} forceOpen={Boolean(query)} className="mb-3 overflow-hidden rounded-xl border border-slate-200" buttonClassName="bg-slate-50 p-3" title={<><span className="block text-sm font-bold">{week.locked && <LockKeyhole className="mr-1 inline" size={14}/>}Week {week.number}: {week.title}</span><span className="mt-1 block text-xs text-slate-500">{week.locked ? `Opens ${new Date(week.release_at).toLocaleString()}` : `${week.chapters.length} chapters · ${units.length} units`}</span></>}>
            {week.locked ? <p className="p-4 text-sm text-slate-500">Your teacher has scheduled this week. Content unlocks on the release date.</p> : week.chapters.map((chapter) => {const chapterUnits=units.filter((i) => i.curriculum_chapter===chapter.id);return <AnimatedDisclosure key={chapter.id} defaultOpen forceOpen={Boolean(query)} className="border-t border-slate-100" buttonClassName="p-3 text-sm font-bold" title={<>{chapter.title}<span className="ml-2 text-xs font-normal text-slate-400">{chapterUnits.length} units</span></>}>{chapterUnits.length ? rows(chapterUnits) : <p className="px-4 pb-3 text-xs text-slate-500">Your teacher is preparing this chapter.</p>}</AnimatedDisclosure>;})}
          </AnimatedDisclosure>;
        })}
        {chapterRows(visible.filter((i) => !i.curriculum_chapter))}
        {!visible.length && !subjectWeeks.length && <p className="flex items-center gap-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-500"><Clock size={16}/>Lessons will appear here when published.</p>}
      </motion.section>;
    })}</AnimatePresence>
    {query && !groups.some((g) => g.title.toLowerCase().includes(query) || g.items.some((i) => `${i.title} ${i.chapter} ${i.topic}`.toLowerCase().includes(query))) && !weeks.some((w) => w.title.toLowerCase().includes(query)) && <p className="py-6 text-center text-sm text-slate-500">No matching lessons.</p>}
  </aside>;
}
