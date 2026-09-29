import LearningIcon from "./LearningIcon.jsx";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { publicAdmissionCardApi } from "../../services/resourceApi.js";
import { API_BASE_URL } from "../../services/api.js";

export default function LearningHomeHero() {
  const reduce = useReducedMotion();
  const [courses, setCourses] = useState([]);
  const [status, setStatus] = useState("loading");
  useEffect(() => {
    let active = true;
    const timeoutId = window.setTimeout(() => {
      if (active) setStatus("error");
    }, 10000);

    publicAdmissionCardApi.list()
      .then((rows) => {
        if (active) {
          setCourses(rows);
          setStatus("ready");
        }
      })
      .catch(() => {
        if (active) setStatus("error");
      })
      .finally(() => window.clearTimeout(timeoutId));

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, []);
  const reveal = {initial:{opacity:0,y:reduce ? 0 : 20},whileInView:{opacity:1,y:0},viewport:{once:true},transition:{duration:0.5}};
  const media = (value) => /^https?:\/\//.test(value) ? value : `${API_BASE_URL.replace(/\/api\/v1$/, "")}${value}`;
  return <>
    <section className="relative isolate overflow-hidden border-b border-emerald-100 bg-[#f4faf7] text-center">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 opacity-40" style={{backgroundImage:"linear-gradient(#d8e8df 1px, transparent 1px),linear-gradient(90deg,#d8e8df 1px,transparent 1px)",backgroundSize:"72px 72px"}}/>
      <div className="mx-auto max-w-7xl px-5 py-16 sm:py-24">
        <motion.div {...reveal}><span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-widest text-emerald-800"><Sparkles size={15}/> Expert Coaching Center · Jashore</span>
          <p className="mt-7 text-lg font-semibold text-emerald-700 sm:text-2xl">A clear plan. The right guidance. Your next chapter.</p>
          <h1 className="mx-auto mt-4 max-w-5xl text-4xl font-black leading-[1.12] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">Build your foundation.<br/><span className="text-emerald-700">Prepare for more.</span></h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">বিষয়ভিত্তিক ক্লাস, সাপ্তাহিক পড়ার পরিকল্পনা এবং অভিজ্ঞ শিক্ষকদের গাইডলাইনে এগিয়ে যাও তোমার লক্ষ্যের দিকে। Learn, practise, and track your progress in one place.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3"><motion.div whileHover={reduce ? {} : {y:-3}} whileTap={{scale:0.98}}><Link className="btn h-13 rounded-xl border-none bg-amber-400 px-7 text-emerald-950 shadow-lg shadow-amber-300/25 hover:bg-amber-300" to="/admission/online">Explore admissions <ArrowRight size={18}/></Link></motion.div><Link className="btn h-13 rounded-xl border-emerald-200 bg-white px-7 text-emerald-800" to="/student/dashboard">My learning</Link></div>
        </motion.div>
        <div className="mx-auto mt-12 grid max-w-4xl gap-4 text-left sm:grid-cols-3">{[["undraw_reading-time_jva3","Learn with a plan","Subjects, weeks and chapters"],["undraw_quiz_zvhe","Practise with purpose","Materials and MCQ tests"],["undraw_teacher_n0ow","Guidance that matters","Teacher feedback and support"]].map(([image,title,copy],i) => <motion.div key={title} {...reveal} transition={{delay:i*0.1,duration:0.4}} className="flex items-center gap-4 rounded-2xl border border-white bg-white/90 p-4 shadow-sm"><LearningIcon name={["study", "student", "teacher"][i]} fallback={`/expertjasshore/${image}.svg`}/><div><h2 className="text-sm font-bold text-slate-900">{title}</h2><p className="mt-1 text-xs leading-5 text-slate-500">{copy}</p></div></motion.div>)}</div>
      </div>
    </section>
    <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20"><div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-widest text-emerald-700">Choose your next step</p><h2 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">A learning journey for you</h2></div><Link className="font-bold text-emerald-700" to="/admission/online">All admissions →</Link></div>
      {status==="loading" && <p role="status" className="py-6 text-slate-500">Loading admission programs…</p>}
      {status==="error" && <p role="alert" className="rounded-xl bg-amber-50 p-4 text-amber-900">Admissions could not be loaded. Please try again from the admissions page.</p>}
      {status==="ready" && !courses.length && <p className="py-6 text-slate-500">New admission programs will be announced here.</p>}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{courses.slice(0,6).map((course) => <motion.article key={course.id} {...reveal} whileHover={reduce ? {} : {y:-5}} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="relative bg-emerald-50 p-5"><img src={course.thumbnail || course.cover_image ? media(course.thumbnail || course.cover_image) : "/expertjasshore/undraw_education_3vwh.svg"} alt={course.title} loading="lazy" className="aspect-[16/9] w-full rounded-lg object-contain"/><span className="absolute left-4 top-4 rounded-full bg-emerald-900 px-3 py-1 text-xs font-bold text-white">{course.course_type === "admission" ? "Admission preparation" : "Academic program"}</span></div><div className="p-5"><h3 className="text-xl font-bold text-slate-950">{course.title}</h3><p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500">{course.short_description || "Follow your subject lessons, practise with teacher-created materials, and prepare for your next assessment."}</p><Link className="btn btn-outline mt-5 w-full rounded-xl border-emerald-200 text-emerald-800 hover:bg-emerald-50" to={`/admission/online/${course.slug || course.id}`}>View program <ArrowRight size={16}/></Link></div></motion.article>)}</div>
    </section>
  </>;
}
