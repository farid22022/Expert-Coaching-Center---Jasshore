import { useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { gsap } from "gsap";
import {
  ArrowRight,
  BookOpen,
  ClipboardList,
  GraduationCap,
  Megaphone,
  Sparkles,
  Users,
} from "lucide-react";
import SEO from "../components/common/SEO.jsx";
import { TeacherCard, InfoCard } from "../components/common/Cards.jsx";

import Reveal from "../components/common/Reveal.jsx";
import { institution, quickLinks, studentCorner } from "../data/site.js";
import { teachers, notices, news, photos } from "../data/mockData.js";
import HeroSlider from "../components/common/HeroSlider.jsx";

const sectionClass = "py-16 sm:py-20";
const containerClass = "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8";
const eyebrowClass = "text-xs font-bold uppercase tracking-[0.14em] text-emerald-700";

// Shared variants for staged, cinematic child reveals within a section.
// Each grid's children enter one after another rather than all at once.
const staggerContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 28, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function Home() {
  const heroRef = useRef(null);

  // Hero parallax: background drifts slower than scroll, foreground content
  // drifts faster + fades, giving the hero depth as the page scrolls away.
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroBgY = useTransform(heroProgress, [0, 1], ["0%", "28%"]);
  const heroContentY = useTransform(heroProgress, [0, 1], ["0%", "55%"]);
  const heroContentOpacity = useTransform(heroProgress, [0, 0.8], [1, 0]);

  // Single orchestrated hero entrance — headline, copy, and CTAs stagger in
  // together once, on load, rather than scattering motion across the page.
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set("[data-hero-el]", { opacity: 0, y: 22 });
      gsap.to("[data-hero-el]", {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.12,
        delay: 0.15,
      });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  const heroSlides = (photos?.length ? photos : []).slice(0, 5).map((p) => ({
    src: p.src,
    alt: p.title || institution.name,
  }));

  return (
    <>
      <SEO
        title="Home"
        description="Public website for Expert Coaching Center, Jashore."
      />

      {/* ---------------------------------------------------------------- */}
      {/* HERO — parallax background + drifting/fading foreground           */}
      {/* ---------------------------------------------------------------- */}
      <section ref={heroRef} className="relative isolate overflow-hidden text-white">
        <motion.div style={{ y: heroBgY }} className="absolute inset-0 -z-10 scale-110">
          {heroSlides.length > 0 && <HeroSlider slides={heroSlides} />}
          {heroSlides.length === 0 && (
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-950" />
          )}
        </motion.div>

        <motion.div
          style={{ y: heroContentY, opacity: heroContentOpacity }}
          className={`${containerClass} relative z-10 grid gap-10 py-20 sm:py-24 lg:grid-cols-[1.2fr_.8fr] lg:items-center lg:py-28`}
        >
          <div className="grid gap-5">
            <p data-hero-el className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-amber-300">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
              Stadium Road, Jashore &middot; Est. {institution.established}
            </p>
            <h1
              data-hero-el
              className="max-w-3xl text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl"
            >
              {institution.name}
            </h1>
            <p data-hero-el className="max-w-xl text-lg font-medium leading-8 text-emerald-50/85">
              Academic coaching, assessment, admission, routine, result, notice,
              and student support &mdash; all in one place for learners and guardians.
            </p>
            <div data-hero-el className="flex flex-wrap gap-3 pt-1">
              <Link
                className="btn border-none bg-amber-500 text-emerald-950 shadow-lg shadow-amber-500/20 transition hover:-translate-y-0.5 hover:bg-amber-400"
                to="/admission/online"
              >
                Online Admission
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                className="btn btn-outline border-white/30 bg-white/5 text-white backdrop-blur transition hover:-translate-y-0.5 hover:border-white hover:bg-white hover:text-emerald-950"
                to="/result/individual"
              >
                Student Result
              </Link>
              <Link className="btn btn-ghost text-white/90 hover:bg-white/10 hover:text-white" to="/notices">
                Notice Board
              </Link>
            </div>
          </div>

          <div data-hero-el className="card border border-white/15 bg-white/10 shadow-2xl backdrop-blur-md">
            <div className="card-body gap-4">
              <h2 className="card-title items-center gap-2 text-white">
                <Megaphone className="h-5 w-5 text-amber-300" />
                Latest Notices
              </h2>
              <div className="grid gap-2">
                {notices.map((n, i) => (
                  <Link
                    key={n.id}
                    className="rounded-lg border border-white/10 bg-white/5 p-3 transition hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/15"
                    to={`/notices/${n.id}`}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-emerald-200">{n.date}</span>
                      {i === 0 && (
                        <span className="rounded-full bg-amber-400/90 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-emerald-950">
                          New
                        </span>
                      )}
                    </span>
                    <span className="mt-1 block font-bold text-white">{n.title}</span>
                  </Link>
                ))}
              </div>
              <Link
                to="/notices"
                className="inline-flex items-center gap-1 text-sm font-bold text-amber-300 transition hover:gap-2 hover:text-amber-200"
              >
                View all notices <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Wave-style divider into the next section */}
        <div className="relative z-10 h-10 bg-gradient-to-b from-transparent to-slate-50 sm:h-14" />
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* REPORT CORNER                                                     */}
      {/* ---------------------------------------------------------------- */}
      <section className={`${sectionClass} bg-slate-50`}>
        <Reveal className={containerClass}>
          <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className={eyebrowClass}>Everything in one place</p>
              <h2 className="mt-1 text-2xl font-black text-emerald-950 sm:text-3xl">Report Corner</h2>
            </div>
          </div>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {quickLinks.map(([label, path]) => (
              <motion.div key={path} variants={staggerItem}>
                <Link
                  className="card block border border-emerald-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-900/5"
                  to={path}
                >
                  <div className="card-body flex-row items-center gap-3 py-5">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-700">
                      <ClipboardList className="h-5 w-5" />
                    </span>
                    <span className="font-black text-slate-800">{label}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </Reveal>
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
            <h2 className="text-3xl font-black text-emerald-950 sm:text-4xl">{institution.name}</h2>
            <p className="max-w-md leading-7 text-slate-600">
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
                Mock public statistics and searchable student list.
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
      {/* FOUNDER'S MESSAGE                                                 */}
      {/* ---------------------------------------------------------------- */}
      <section className={`${sectionClass} bg-slate-50`}>
        <Reveal className={containerClass}>
          <p className={eyebrowClass}>In their words</p>
          <h2 className="mb-6 mt-1 text-2xl font-black text-emerald-950 sm:text-3xl">Founder&apos;s Message</h2>
          <motion.div
            initial={{ opacity: 0, y: 36, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="card overflow-hidden border border-emerald-100 bg-white shadow-sm md:card-side"
          >
            <figure className="relative bg-gradient-to-br from-emerald-100 to-emerald-50 p-8 md:w-64 md:shrink-0">
              <img
                src="https://placehold.co/220x260/e8f2ee/173d33?text=Director"
                alt="Director"
                className="w-full rounded-xl object-cover shadow-md"
              />
            </figure>
            <div className="card-body">
              <Sparkles className="h-5 w-5 text-amber-500" />
              <h3 className="card-title text-emerald-950">Name: {institution.founderBn}</h3>
              <p className="font-bold text-emerald-700">Designation: Director</p>
              <p className="max-w-2xl leading-7 text-slate-600">
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
              <h2 className="mt-1 text-2xl font-black text-emerald-950 sm:text-3xl">Honorable Teachers</h2>
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
            {teachers.slice(0, 6).map((t) => (
              <motion.div key={t.id} variants={staggerItem} whileHover={{ y: -6 }}>
                <TeacherCard teacher={t} />
              </motion.div>
            ))}
          </motion.div>
        </Reveal>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* STUDENTS CORNER + NEWS                                            */}
      {/* ---------------------------------------------------------------- */}
      <section className={`${sectionClass} bg-slate-50`}>
        <Reveal className={`${containerClass} grid gap-10 lg:grid-cols-2`}>
          <div>
            <p className={eyebrowClass}>For learners</p>
            <h2 className="mb-4 mt-1 text-2xl font-black text-emerald-950 sm:text-3xl">Students Corner</h2>
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
                    className="flex items-center justify-between rounded-lg border border-emerald-100 bg-white p-3 font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:text-emerald-700 hover:shadow-md"
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
            <h2 className="mb-4 mt-1 text-2xl font-black text-emerald-950 sm:text-3xl">Latest News</h2>
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
                    className="flex gap-3 rounded-xl border border-emerald-100 bg-white p-3 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md"
                    to={`/news/${item.id}`}
                  >
                    <img src={item.image} alt="" className="h-20 w-24 shrink-0 rounded-lg object-cover" />
                    <span className="grid content-center gap-1">
                      <strong className="text-slate-900">{item.title}</strong>
                      <small className="text-sm leading-5 text-slate-500">{item.summary}</small>
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
              <h2 className="mt-1 text-2xl font-black text-emerald-950 sm:text-3xl">Photo Gallery</h2>
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
    </>
  );
}