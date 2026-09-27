import LearningHomeHero from "../components/common/LearningHomeHero.jsx";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, MotionConfig } from "framer-motion";
import {
  Award,
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Megaphone,
  Quote,
  Rocket,
  Sparkles,
  Users,
} from "lucide-react";
import SEO from "../components/common/SEO.jsx";
import { TeacherCard, InfoCard } from "../components/common/Cards.jsx";
import AnimatedCounter from "../components/common/AnimatedCounter.jsx";

import Reveal from "../components/common/Reveal.jsx";
import { staggerContainer, staggerItem } from "../components/common/motionVariants.js";
import { institution, studentCorner } from "../data/site.js";
import { news, photos } from "../data/mockData.js";
import { publicBannerApi, publicNoticeApi, publicRenownedTeacherApi, publicSiteInfoApi, publicSuccessStoryApi } from "../services/resourceApi.js";
import HeroSlider from "../components/common/HeroSlider.jsx";
import { API_BASE_URL } from "../services/api.js";

function resolveMediaUrl(value) {
  if (!value) return "";
  if (/^https?:\/\//.test(value)) return value;
  return `${API_BASE_URL.replace(/\/api\/v1$/, "")}${value}`;
}

const sectionClass = "py-16 sm:py-20";
const containerClass = "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8";
const eyebrowClass = "text-xs font-bold uppercase tracking-[0.14em] text-emerald-700";

const admissionJourney = [
  { icon: FileText, title: "Apply Online", description: "Submit the admission form with your academic details." },
  { icon: ClipboardCheck, title: "Admission Assessment", description: "Sit for a short subject-wise evaluation." },
  { icon: Award, title: "Get Admitted", description: "Receive confirmation and complete enrollment." },
  { icon: Rocket, title: "Start Classes", description: "Join your batch and begin structured coaching." },
];

export default function Home() {
  const [notices, setNotices] = useState([]);
  const [siteInfo, setSiteInfo] = useState(null);
  const [renownedTeachers, setRenownedTeachers] = useState([]);
  const [stories, setStories] = useState([]);
  const [studentsGuided, setStudentsGuided] = useState(0);
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    publicNoticeApi.list().then((rows) => setNotices(rows.slice(0, 4))).catch(() => {});
    publicSiteInfoApi.get().then(setSiteInfo).catch(() => {});
    publicSiteInfoApi.stats().then((data) => setStudentsGuided(data?.students_guided || 0)).catch(() => {});
    publicRenownedTeacherApi.list().then(setRenownedTeachers).catch(() => {});
    publicSuccessStoryApi.list().then(setStories).catch(() => {});
    publicBannerApi.list().then(setBanners).catch(() => {});
  }, []);

  const stats = [
    { value: new Date().getFullYear() - Number(siteInfo?.established_year || institution.established), suffix: "+", label: "Years of Excellence" },
    { value: renownedTeachers.length, suffix: "+", label: "Expert Mentors" },
    { value: studentsGuided, suffix: "+", label: "Students Guided" },
  ];

  const heroSlides = banners.length
    ? banners.filter((b) => b.image).slice(0, 5).map((b) => ({
        src: resolveMediaUrl(b.image),
        alt: b.title || institution.name,
      }))
    : (photos?.length ? photos : []).slice(0, 5).map((p) => ({
        src: p.src,
        alt: p.title || institution.name,
      }));

  return (
    <MotionConfig reducedMotion="user">
      <SEO
        title="Home"
        description="Public website for Expert Coaching Center, Jashore."
      />

      {/* ---------------------------------------------------------------- */}
      {/* HERO — parallax background + drifting/fading foreground           */}
      {/* ---------------------------------------------------------------- */}
      <LearningHomeHero />
      {heroSlides.length > 0 && <section className={`${containerClass} pb-12`}><div className="relative aspect-[16/7] overflow-hidden rounded-2xl bg-emerald-950"><HeroSlider slides={heroSlides}/></div></section>}
      {notices.length > 0 && <section className={`${containerClass} pb-12`}><div className="rounded-2xl border border-emerald-100 bg-white p-5"><div className="flex items-center justify-between gap-3"><h2 className="flex items-center gap-2 font-bold text-slate-900"><Megaphone size={19} className="text-emerald-700"/>Latest notices</h2><Link to="/notices" className="text-sm font-bold text-emerald-700">View all →</Link></div><div className="mt-4 grid gap-3 sm:grid-cols-2">{notices.map((n) => <Link key={n.id} to={`/notices/${n.id}`} className="rounded-lg bg-slate-50 p-3 text-sm font-semibold text-slate-700">{n.title}</Link>)}</div></div></section>}

      {/* ---------------------------------------------------------------- */}
      {/* STATS STRIP — animated count-up, once in view                    */}
      {/* ---------------------------------------------------------------- */}
      <section className="bg-soft pb-2">
        <div className={containerClass}>
          <div className="grid grid-cols-1 gap-4 rounded-2xl bg-emerald-950 px-6 py-8 shadow-xl shadow-emerald-950/10 sm:grid-cols-3 sm:px-10">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center sm:border-r sm:border-white/10 sm:last:border-r-0">
                <AnimatedCounter
                  value={stat.value}
                  suffix={stat.suffix}
                  className="text-3xl font-black text-amber-300 sm:text-4xl"
                />
                <p className="mt-1 text-sm font-bold text-white/70">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* INSTITUTION INTRODUCTION                                          */}
      {/* ---------------------------------------------------------------- */}
      <section className={sectionClass}>
        <Reveal className={`${containerClass} grid gap-10 lg:grid-cols-[.9fr_1.1fr] lg:items-center`}>
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="grid gap-4"
          >
            <p className={eyebrowClass}>Institution Introduction</p>
            <h2 className="text-3xl font-black text-ink sm:text-4xl">{institution.name}</h2>
            <p className="max-w-md leading-7 text-muted">
              Founded in {institution.established}, Expert Coaching Center supports
              students in Jashore with structured classes, regular evaluation,
              guardian communication, and disciplined academic preparation.
            </p>
            <Link
              className="btn w-fit border-none bg-emerald-700 text-white shadow-md shadow-emerald-900/10 transition hover:-translate-y-0.5 hover:bg-emerald-800"
              to="/about/history"
            >
              Read More
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
            className="grid gap-4 sm:grid-cols-3"
          >
            <motion.div variants={staggerItem}>
              <InfoCard title="Students" icon={<GraduationCap />}>
                Structured learning, practice, and progress in one place.
              </InfoCard>
            </motion.div>
            <motion.div variants={staggerItem}>
              <InfoCard title="Teachers" icon={<Users />}>
                Experienced subject teachers and academic mentors.
              </InfoCard>
            </motion.div>
            <motion.div variants={staggerItem}>
              <InfoCard title="Academic" icon={<BookOpen />}>
                Routine, exam, rules, holidays, and results.
              </InfoCard>
            </motion.div>
          </motion.div>
        </Reveal>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* ADMISSION JOURNEY — step roadmap with connecting-line reveal      */}
      {/* ---------------------------------------------------------------- */}
      <section className={`${sectionClass} bg-soft`}>
        <Reveal className={containerClass}>
          <div className="mb-10 text-center">
            <p className={`${eyebrowClass} justify-center`}>How it works</p>
            <h2 className="mt-1 text-2xl font-black text-ink sm:text-3xl">Your Admission Journey</h2>
          </div>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            className="relative grid gap-8 sm:grid-cols-4"
          >
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              style={{ transformOrigin: "left" }}
              className="absolute left-0 right-0 top-8 hidden h-0.5 bg-emerald-200 sm:block"
            />
            {admissionJourney.map((step, index) => (
              <motion.div key={step.title} variants={staggerItem} className="relative grid justify-items-center gap-3 text-center">
                <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full border-4 border-slate-50 bg-emerald-700 text-white shadow-md">
                  <step.icon className="h-6 w-6" />
                </span>
                <h3 className="font-black text-ink">{index + 1}. {step.title}</h3>
                <p className="max-w-[220px] text-sm leading-6 text-muted">{step.description}</p>
              </motion.div>
            ))}
          </motion.div>
          <div className="mt-10 text-center">
            <Link
              className="btn border-none bg-amber-500 text-emerald-950 shadow-lg shadow-amber-500/20 transition hover:-translate-y-0.5 hover:bg-amber-400"
              to="/admission/online"
            >
              Start Your Application
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* FOUNDER'S MESSAGE                                                 */}
      {/* ---------------------------------------------------------------- */}
      <section className={`${sectionClass} bg-soft`}>
        <Reveal className={containerClass}>
          <p className={eyebrowClass}>In their words</p>
          <h2 className="mb-6 mt-1 text-2xl font-black text-ink sm:text-3xl">Founder&apos;s Message</h2>
          <motion.div
            initial={{ opacity: 0, y: 36, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="card overflow-hidden border border-emerald-100 bg-paper shadow-sm md:card-side"
          >
            <figure className="relative bg-gradient-to-br from-emerald-100 to-emerald-50 p-8 md:w-64 md:shrink-0">
              <img
                src="/expertjasshore/undraw_educator_6dgp.svg"
                alt="Education and mentorship illustration"
                className="w-full rounded-xl object-cover shadow-md"
              />
            </figure>
            <div className="card-body">
              <Sparkles className="h-5 w-5 text-amber-500" />
              <h3 className="card-title text-ink">Name: {institution.founderBn}</h3>
              <p className="font-bold text-emerald-700">Designation: Director</p>
              <p className="max-w-2xl leading-7 text-muted">
                We aim to create a careful, student-first coaching environment
                with regular feedback and transparent academic support.
              </p>
            </div>
          </motion.div>
        </Reveal>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* TEACHERS                                                          */}
      {/* ---------------------------------------------------------------- */}
      <section className={sectionClass}>
        <Reveal className={containerClass}>
          <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className={eyebrowClass}>Meet the faculty</p>
              <h2 className="mt-1 text-2xl font-black text-ink sm:text-3xl">Honorable Teachers</h2>
            </div>
            <Link
              className="inline-flex items-center gap-1 font-black text-emerald-700 transition hover:gap-2 hover:text-emerald-900"
              to="/about/teachers"
            >
              View all teachers <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {renownedTeachers.slice(0, 6).map((t) => (
              <motion.div key={t.id} variants={staggerItem} whileHover={{ y: -6 }}>
                <TeacherCard teacher={t} />
              </motion.div>
            ))}
          </motion.div>
        </Reveal>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* ADMISSION SUCCESS STORIES — auto-scrolling highlight row          */}
      {/* ---------------------------------------------------------------- */}
      <section className={`${sectionClass} overflow-hidden bg-emerald-950`}>
        <Reveal className={`${containerClass} !px-0 sm:!px-0 lg:!px-0`}>
          <div className={`${containerClass} mb-8 flex flex-wrap items-end justify-between gap-3`}>
            <div>
              <p className={`${eyebrowClass} text-amber-300`}>Real outcomes</p>
              <h2 className="mt-1 text-2xl font-black text-white sm:text-3xl">Admission Success Stories</h2>
            </div>
          </div>
          {/* Extra wrapper so Reveal's one-time GSAP entrance (which animates its direct
              children's transform) never fights with the marquee's own continuous CSS
              transform animation underneath. */}
          <div>
            <div className="marquee-track">
              {[...stories, ...stories].map((story, index) => (
                <article
                  key={`${story.id}-${index}`}
                  className="mx-3 grid w-[300px] shrink-0 gap-3 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur"
                >
                  <Quote className="h-6 w-6 text-amber-300" />
                  <p className="leading-6 text-white/85">&ldquo;{story.quote}&rdquo;</p>
                  <div className="mt-2 border-t border-white/10 pt-3">
                    <p className="font-black text-white">{story.name}</p>
                    <p className="text-sm font-bold text-amber-300">{story.outcome}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* STUDENTS CORNER + NEWS                                            */}
      {/* ---------------------------------------------------------------- */}
      <section className={`${sectionClass} bg-soft`}>
        <Reveal className={`${containerClass} grid gap-10 lg:grid-cols-2`}>
          <div>
            <p className={eyebrowClass}>For learners</p>
            <h2 className="mb-4 mt-1 text-2xl font-black text-ink sm:text-3xl">Students Corner</h2>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              className="grid gap-2"
            >
              {studentCorner.map(([label, path]) => (
                <motion.div key={path} variants={staggerItem}>
                  <Link
                    className="flex items-center justify-between rounded-lg border border-emerald-100 bg-paper p-3 font-bold text-muted shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:text-emerald-700 hover:shadow-md"
                    to={path}
                  >
                    {label}
                    <ArrowRight className="h-4 w-4 opacity-0 transition group-hover:opacity-100" />
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>

          <div>
            <p className={eyebrowClass}>Stay informed</p>
            <h2 className="mb-4 mt-1 text-2xl font-black text-ink sm:text-3xl">Latest News</h2>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              className="grid gap-3"
            >
              {news.map((item) => (
                <motion.div key={item.id} variants={staggerItem}>
                  <Link
                    className="flex gap-3 rounded-xl border border-emerald-100 bg-paper p-3 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md"
                    to={`/news/${item.id}`}
                  >
                    <img src={item.image} alt="" className="h-20 w-24 shrink-0 rounded-lg object-cover" />
                    <span className="grid content-center gap-1">
                      <strong className="text-ink">{item.title}</strong>
                      <small className="text-sm leading-5 text-muted">{item.summary}</small>
                    </span>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </Reveal>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* PHOTO GALLERY — alternating depth on scroll-in                    */}
      {/* ---------------------------------------------------------------- */}
      <section className={sectionClass}>
        <Reveal className={containerClass}>
          <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className={eyebrowClass}>Campus life</p>
              <h2 className="mt-1 text-2xl font-black text-ink sm:text-3xl">Photo Gallery</h2>
            </div>
            <Link
              className="inline-flex items-center gap-1 font-black text-emerald-700 transition hover:gap-2 hover:text-emerald-900"
              to="/gallery"
            >
              View full gallery <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {photos.slice(0, 4).map((p, i) => (
              <motion.img
                key={p.id}
                src={p.src}
                alt={p.title}
                initial={{ opacity: 0, y: i % 2 === 0 ? 48 : 68, scale: 1.06 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.8, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ scale: 1.04 }}
                className="aspect-[4/3] w-full rounded-xl object-cover shadow-sm"
              />
            ))}
          </div>
        </Reveal>
      </section>
    </MotionConfig>
  );
}