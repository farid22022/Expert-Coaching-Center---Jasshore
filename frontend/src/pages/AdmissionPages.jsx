import { Link, useParams, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import DOMPurify from "dompurify";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, ChevronDown, Lock, PlayCircle } from "lucide-react";
import PageHeader from "../components/common/PageHeader.jsx";
import SEO from "../components/common/SEO.jsx";
import Reveal from "../components/common/Reveal.jsx";
import { staggerContainer, staggerItem } from "../components/common/motionVariants.js";
import { getAdmissionPrograms } from "../data/admissionPrograms.js";
import { API_BASE_URL, admissionService, getApiErrorMessage } from "../services/api.js";
import { publicAdmissionCardApi } from "../services/resourceApi.js";

const containerClass = "mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8";
const fieldClass = "grid gap-1 text-sm font-bold text-muted";
const inputClass = "input input-bordered w-full";
const primaryButton = "btn bg-emerald-700 text-white hover:bg-emerald-800";

function stripHtml(html) {
  if (!html) return "";
  const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return text;
}

function SafeHtml({ html, className }) {
  if (!html) return null;
  const clean = DOMPurify.sanitize(html, { ALLOWED_TAGS: ["p", "br", "strong", "em", "u", "s", "ul", "ol", "li", "a", "span", "h1", "h2", "h3"], ALLOWED_ATTR: ["href", "target", "rel", "style", "class"] });
  return <div className={`rich-text-content ${className || ""}`} dangerouslySetInnerHTML={{ __html: clean }} />;
}

export function OnlineAdmissionPage() {
  const [programs, setPrograms] = useState(() => getAdmissionPrograms());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicAdmissionCardApi
      .list()
      .then((rows) => {
        if (rows.length) setPrograms(rows.map(courseToProgram));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <SEO title="Online Admission" />
      <PageHeader title="Online Admission" eyebrow="Admission" description="Choose an admission program, review fees, teachers, dates, subjects, and submit the form." />
      <section>
        <div className={containerClass}>
          {loading && <div className="alert mb-6 border-emerald-100 bg-emerald-50 text-emerald-900">Loading admission cards...</div>}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
          >
            {programs.map((program) => (
              <motion.article key={program.id} variants={staggerItem} whileHover={{ y: -6 }} className="overflow-hidden rounded-2xl border border-emerald-100 bg-paper shadow-sm transition-shadow hover:shadow-xl">
                <img src={program.image} alt={program.title} className="h-48 w-full object-cover" />
                <div className="grid gap-4 p-5">
                  <div>
                    <div className="flex flex-wrap gap-2"><span className="badge badge-success badge-outline font-black">{program.className}</span>{program.isEnrolled && <span className="badge badge-success font-black text-white">Already enrolled</span>}{program.pricing?.discount_percent > 0 && <span className="badge font-black text-white" style={{ background: "var(--accent)" }}>{program.pricing.discount_percent}% OFF</span>}</div>
                    <h2 className="mt-3 text-2xl font-black text-ink">{program.title}</h2>
                    <p className="mt-2 text-sm font-semibold leading-6 text-muted">{program.shortDescription || stripHtml(program.description)}</p>
                  </div>
                  <dl className="grid gap-3 text-sm">
                    <Info label="Admission Date" value={`${program.startDate} to ${program.endDate}`} />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Info label="Fee" value={program.pricing?.offer != null ? <><span className="line-through opacity-60">BDT {program.pricing.regular}</span> <span className="font-black" style={{ color: "var(--brand)" }}>BDT {program.pricing.offer}</span></> : `BDT ${program.admissionFee}`} />
                      <Info label="Seats" value={program.seats} />
                    </div>
                    <PlainInfo label="Teachers" value={formatList(program.teachers)} />
                    <PlainInfo label="Subjects Covered" value={formatList(program.subjects)} />
                    <PlainInfo label="Schedule" value={program.schedule} />
                  </dl>
                  <Link to={program.isEnrolled ? "/student/dashboard" : `/admission/online/${program.slug || program.id}`} className={`${primaryButton} w-full`}>
                    {program.isEnrolled ? "Go to enrolled course" : "View Details & Apply"}
                  </Link>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>
    </>
  );
}

export function AdmissionCardDetailPage() {
  const { identifier } = useParams();
  const [searchParams] = useSearchParams();
  const preview = searchParams.get("preview") === "1";
  const [program, setProgram] = useState(null);
  const [loadState, setLoadState] = useState("loading");
  const [submitted, setSubmitted] = useState(null);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoadState("loading");
    publicAdmissionCardApi
      .get(identifier, preview ? { preview: 1 } : undefined)
      .then((course) => {
        setProgram(courseToProgram(course));
        setLoadState("ready");
      })
      .catch((error) => {
        const fallback = getAdmissionPrograms().find((item) => String(item.id) === String(identifier));
        if (fallback) {
          setProgram(mockToProgram(fallback));
          setLoadState("ready");
          return;
        }
        setLoadState(error?.response?.status === 404 ? "not-found" : "error");
      });
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [identifier]);

  async function submit(e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    setSubmitError("");
    setSubmitting(true);
    try {
      setSubmitted(await admissionService.submit({ ...data, programId: program?.id, course: program?.id }));
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, "Your application could not be submitted. Please check the form and try again."));
    } finally {
      setSubmitting(false);
    }
  }

  if (loadState === "loading") return <LandingSkeleton />;
  if (loadState === "not-found") {
    return <LandingMessage title="Admission Not Found" body="This admission program does not exist or is no longer available." />;
  }
  if (loadState === "error") {
    return <LandingMessage title="Something went wrong" body="We couldn't load this admission page." action={<button className={primaryButton} onClick={load}>Try Again</button>} />;
  }
  if (!program) return null;

  const appStatus = program.application?.status || "OPEN";
  const cta = admissionCta(program);
  const navSections = [
    program.features.length > 0 && { id: "features", label: "Features" },
    program.subjectCards.length > 0 && { id: "subjects", label: "Subjects" },
    program.curriculum.length > 0 && { id: "curriculum", label: "Curriculum" },
    program.teacherCards.length > 0 && { id: "teachers", label: "Teachers" },
    program.faqs.length > 0 && { id: "faq", label: "FAQ" },
  ].filter(Boolean);

  return (
    <>
      <SEO title={program.metaTitle || program.title} description={program.metaDescription || program.shortDescription || stripHtml(program.description)} image={program.coverImage} />

      {preview && (
        <div className="bg-amber-400 py-2 text-center text-sm font-black text-emerald-950">
          Preview mode — this admission may not be published yet.
        </div>
      )}

      <Hero program={program} cta={cta} />
      {program.nav?.enabled !== false && navSections.length > 0 && <StickyNav sections={navSections} cta={cta} />}

      <section className="py-10 sm:py-14">
        <div className={containerClass}>
          <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:gap-10">
            <Reveal as="div" className="space-y-8" y={22} stagger={0.1}>
              {program.highlights.length > 0 && <HighlightsGrid items={program.highlights} />}
              {(program.about?.title || program.about?.description) && <AboutSection about={program.about} />}
              {program.audience.length > 0 && <AudienceSection items={program.audience} />}
              {program.features.length > 0 && <div id="features"><FeatureBlocks title="What You'll Get" items={program.features} /></div>}
              {program.subjectCards.length > 0 && <div id="subjects"><SubjectsSection subjects={program.subjectCards} /></div>}
              {program.curriculum.length > 0 && <div id="curriculum"><CurriculumSection groups={program.curriculum} /></div>}
              {program.teacherCards.length > 0 && <div id="teachers"><TeachersSection teachers={program.teacherCards} /></div>}

              {program.customContent.length > 0 && (
                <div className="rounded-2xl border border-emerald-100 bg-paper p-6 shadow-sm sm:p-8">
                  <h2 className="text-2xl font-black text-ink">Additional Details</h2>
                  <div className="mt-4 grid gap-4">
                    {program.customContent.map((item, index) => <CustomContent item={item} key={`${item.label}-${index}`} />)}
                  </div>
                </div>
              )}

              <AdmissionInfoTable program={program} />
              {program.requirements.length > 0 && <RequirementsSection items={program.requirements} />}
              <HowToEnroll />
              {program.faqs.length > 0 && <div id="faq"><FaqSection items={program.faqs} /></div>}
            </Reveal>

            <div id="apply" className="rounded-2xl border border-emerald-100 bg-paper p-5 shadow-sm lg:sticky lg:top-24 lg:self-start">
              {/* mode="wait" here previously stalled forever after a successful submit: it
                  waits for the outgoing keyed child's exit animation before mounting the
                  incoming one, and that handoff never resolved for this always-rendered,
                  key-swapped child - the success view never appeared even though the
                  application was saved. A plain crossfade (default mode) doesn't need that
                  handoff and shows the success state immediately. */}
              <AnimatePresence>
                <ApplyPanel key={submitted ? "submitted" : "form"} program={program} appStatus={appStatus} submit={submit} submitting={submitting} submitError={submitError} submitted={submitted} />
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      <FinalCta program={program} cta={cta} />
      <MobileStickyCta program={program} cta={cta} />
    </>
  );
}

function courseToProgram(course) {
  return {
    id: course.id,
    slug: course.slug,
    title: course.title,
    className: course.code || course.course_type?.replaceAll("_", " ") || "Admission",
    description: course.description || "Admission is open for this program.",
    image: resolveMediaUrl(course.cover_image || course.thumbnail) || "/images/admission-class-9.jpg",
    startDate: course.enrollment_start || course.start_date || "Announced soon",
    endDate: course.enrollment_end || course.end_date || "Announced soon",
    admissionFee: course.admission_fee ?? course.pricing?.regular ?? 0,
    courseFee: course.course_fee || 0,
    seats: course.capacity || "Limited",
    teachers: course.teacher_names?.length ? course.teacher_names : ["Assigned teachers will be announced by admin."],
    subjects: course.subject_names?.length ? course.subject_names : ["Subjects will be covered according to the selected course plan."],
    schedule: course.start_date ? `Starts ${course.start_date}` : "Schedule will be announced.",
    customContent: Array.isArray(course.custom_content) ? course.custom_content : [],
    syllabus: Array.isArray(course.public_syllabus) ? course.public_syllabus : [],
    formSchema: normalizeFormSchema(course.admission_form_schema),

    // Landing page fields
    shortDescription: course.short_description || "",
    heroBadge: course.hero_badge || "",
    heroTitle: course.hero_title || course.title,
    heroSubtitle: course.hero_subtitle || course.short_description || "",
    heroImage: resolveMediaUrl(course.hero_image) || resolveMediaUrl(course.cover_image) || resolveMediaUrl(course.thumbnail),
    coverImage: resolveMediaUrl(course.cover_image) || resolveMediaUrl(course.thumbnail),
    promoVideoUrl: course.promo_video_url || "",
    metaTitle: course.meta_title || "",
    metaDescription: course.meta_description || "",
    pricing: course.pricing || { regular: course.admission_fee || 0, offer: null, discount_percent: null },
    highlights: Array.isArray(course.highlights) ? course.highlights : [],
    about: course.about || { title: "", description: "", image: "" },
    audience: Array.isArray(course.audience) ? course.audience : [],
    features: Array.isArray(course.features) ? course.features : [],
    requirements: Array.isArray(course.requirements) ? course.requirements : [],
    faqs: Array.isArray(course.faqs) ? course.faqs : [],
    cta: course.cta || { title: "", subtitle: "" },
    nav: course.nav || { enabled: true },
    subjectCards: Array.isArray(course.subjects) ? course.subjects : [],
    curriculum: Array.isArray(course.curriculum) ? course.curriculum : [],
    teacherCards: Array.isArray(course.teachers) ? course.teachers : [],
    application: course.application || { status: "OPEN", deadline: null, can_apply: true, my_application: null },
    isEnrolled: Boolean(course.is_enrolled),
  };
}

function mockToProgram(mock) {
  const asList = (value) => (typeof value === "string" ? value.split(",").map((v) => v.trim()).filter(Boolean) : Array.isArray(value) ? value : []);
  return {
    id: mock.id,
    slug: mock.id,
    title: mock.title,
    className: mock.className || "Admission",
    description: mock.description || "",
    image: mock.image || "/images/admission-class-9.jpg",
    startDate: mock.startDate || "Announced soon",
    endDate: mock.endDate || "Announced soon",
    admissionFee: Number(mock.admissionFee) || 0,
    courseFee: 0,
    seats: mock.seats || "Limited",
    teachers: asList(mock.teachers),
    subjects: asList(mock.subjects),
    schedule: mock.schedule || "Schedule will be announced.",
    customContent: [],
    syllabus: [],
    formSchema: normalizeFormSchema((mock.formFields || []).length ? [{ title: "Application", fields: mock.formFields.map((label) => ({ label, type: "text" })) }] : []),

    shortDescription: mock.description || "",
    heroBadge: "Admission Open",
    heroTitle: mock.title,
    heroSubtitle: mock.eligibility || "",
    heroImage: mock.image,
    coverImage: mock.image,
    promoVideoUrl: "",
    metaTitle: "",
    metaDescription: "",
    pricing: { regular: Number(mock.admissionFee) || 0, offer: null, discount_percent: null },
    highlights: [],
    about: { title: "", description: mock.description || "", image: "" },
    audience: [],
    features: [],
    requirements: [],
    faqs: [],
    cta: { title: "", subtitle: "" },
    nav: { enabled: true },
    subjectCards: [],
    curriculum: [],
    teacherCards: [],
    application: { status: "OPEN", deadline: mock.endDate || null, can_apply: true, my_application: null },
  };
}

function scrollToId(id) {
  return (event) => {
    event.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
}

function admissionCta(program) {
  const myApp = program.application?.my_application;
  if (myApp?.status === "approved") return { label: "Go to Course", href: "/student/dashboard", mode: "link" };
  if (myApp && ["pending", "under_review"].includes(myApp.status)) return { label: "Application Pending", href: "#apply", mode: "scroll" };
  if (myApp?.status === "rejected") return { label: "View Application", href: "/admission/applicant", mode: "link" };
  if (program.application?.status && program.application.status !== "OPEN") {
    return { label: program.application.status === "UPCOMING" ? "Opening Soon" : "Admissions Closed", href: "#apply", mode: "scroll", disabled: true };
  }
  return { label: "Apply Now", href: "#apply", mode: "scroll" };
}

function CtaButton({ cta, className }) {
  if (cta.mode === "link") return <Link to={cta.href} className={className}>{cta.label}</Link>;
  return (
    <a href={cta.href} onClick={scrollToId(cta.href.replace("#", ""))} className={`${className} ${cta.disabled ? "pointer-events-none opacity-60" : ""}`}>
      {cta.label}
    </a>
  );
}

function LandingSkeleton() {
  return (
    <div className={containerClass}>
      <div className="h-72 w-full animate-pulse rounded-2xl bg-emerald-100" />
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-100" />)}
      </div>
      <div className="mt-6 h-40 animate-pulse rounded-2xl bg-slate-100" />
    </div>
  );
}

function LandingMessage({ title, body, action }) {
  return (
    <>
      <SEO title={title} />
      <PageHeader title={title} eyebrow="Admission" />
      <div className={containerClass}>
        <div className="alert border-emerald-100 bg-paper text-muted">
          <div>
            <p>{body}</p>
            {action && <div className="mt-3">{action}</div>}
          </div>
        </div>
      </div>
    </>
  );
}

function Hero({ program, cta }) {
  return (
    <section className="relative overflow-hidden text-white" style={{ background: "linear-gradient(135deg, #063b2d 0%, #075a43 55%, #0f7a55 100%)" }}>
      <div className={`${containerClass} relative grid gap-10 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-20`}>
        <div>
          {program.heroBadge && (
            <span className="inline-flex items-center rounded-full bg-[var(--accent)] px-4 py-1.5 text-xs font-black uppercase tracking-wide text-emerald-950">
              {program.heroBadge}
            </span>
          )}
          <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">{program.heroTitle}</h1>
          {program.heroSubtitle && <p className="mt-4 max-w-xl text-base font-semibold text-emerald-50 sm:text-lg">{program.heroSubtitle}</p>}

          {program.highlights.length > 0 && (
            <ul className="mt-6 grid gap-2 sm:grid-cols-2">
              {program.highlights.slice(0, 6).map((h) => (
                <li key={h.id} className="flex items-center gap-2 text-sm font-bold text-emerald-50">
                  <CheckCircle2 size={16} className="shrink-0 text-amber-300" />
                  {h.label || h.value}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-7 flex flex-wrap items-baseline gap-2">
            {program.pricing.offer != null ? (
              <>
                <span className="text-lg font-bold text-emerald-200 line-through">BDT {program.pricing.regular}</span>
                <span className="text-3xl font-black text-white">BDT {program.pricing.offer}</span>
                {program.pricing.discount_percent > 0 && (
                  <span className="rounded-full bg-[var(--accent)] px-2 py-0.5 text-xs font-black text-emerald-950">{program.pricing.discount_percent}% OFF</span>
                )}
              </>
            ) : (
              <span className="text-3xl font-black text-white">BDT {program.pricing.regular}</span>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <CtaButton cta={cta} className="btn border-0 bg-white text-emerald-900 hover:bg-emerald-50" />
            {(program.subjectCards.length > 0 || program.curriculum.length > 0) && (
              <a
                href={program.subjectCards.length ? "#subjects" : "#curriculum"}
                onClick={scrollToId(program.subjectCards.length ? "subjects" : "curriculum")}
                className="btn btn-outline border-white/40 text-white hover:bg-white/10"
              >
                View Course Details
              </a>
            )}
          </div>
        </div>

        <div>
          {program.promoVideoUrl ? (
            <div className="overflow-hidden rounded-2xl shadow-2xl">
              <iframe className="aspect-video w-full" src={program.promoVideoUrl} title={program.title} allowFullScreen />
            </div>
          ) : (
            <img src={program.heroImage || program.image} alt={program.title} className="aspect-[4/3] w-full rounded-2xl object-cover shadow-2xl" />
          )}
        </div>
      </div>
    </section>
  );
}

function StickyNav({ sections, cta }) {
  return (
    <div className="sticky top-0 z-30 hidden border-b border-emerald-100 bg-paper/95 backdrop-blur lg:block">
      <div className={`${containerClass} flex items-center justify-between gap-6`}>
        <nav className="flex gap-6">
          {sections.map((s) => (
            <a key={s.id} href={`#${s.id}`} onClick={scrollToId(s.id)} className="py-4 text-sm font-bold text-muted hover:text-emerald-700">
              {s.label}
            </a>
          ))}
        </nav>
        <CtaButton cta={cta} className="btn btn-sm border-0 bg-[var(--brand)] text-white hover:opacity-90" />
      </div>
    </div>
  );
}

function HighlightsGrid({ items }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => (
        <div key={item.id} className="rounded-2xl border border-emerald-100 bg-paper p-4 text-center shadow-sm">
          <p className="text-2xl font-black text-[var(--brand)] sm:text-3xl">{item.value}</p>
          <p className="mt-1 text-xs font-bold text-muted sm:text-sm">{item.label}</p>
        </div>
      ))}
    </div>
  );
}

function AboutSection({ about }) {
  return (
    <div className="rounded-2xl border border-emerald-100 bg-paper p-6 shadow-sm sm:p-8">
      <h2 className="text-2xl font-black text-ink">{about.title || "About This Program"}</h2>
      <div className="mt-4 grid gap-6">
        {about.image && <img src={resolveMediaUrl(about.image)} alt={about.title || "About"} className="max-h-80 w-full rounded-xl object-cover" />}
        <div className="text-sm font-medium leading-7 text-muted sm:text-base">
          <SafeHtml html={about.description} />
        </div>
      </div>
    </div>
  );
}

function AudienceSection({ items }) {
  return (
    <div className="rounded-2xl border border-emerald-100 p-6 shadow-sm sm:p-8" style={{ background: "var(--warm)" }}>
      <h2 className="text-2xl font-black text-ink">Who Is This For?</h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item.id} className="flex items-start gap-2 text-sm font-bold text-muted">
            <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[var(--brand)]" />
            {item.text}
          </li>
        ))}
      </ul>
    </div>
  );
}

function FeatureBlocks({ title, items }) {
  return (
    <div className="rounded-2xl border border-emerald-100 bg-paper p-6 shadow-sm sm:p-8">
      <h2 className="text-2xl font-black text-ink">{title}</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-xl border border-slate-100 bg-soft p-4">
            <p className="text-sm font-black text-emerald-900">{item.title}</p>
            {item.description && <p className="mt-1 text-sm font-medium text-muted">{item.description}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

function SubjectsSection({ subjects }) {
  return (
    <div className="rounded-2xl border border-emerald-100 bg-paper p-6 shadow-sm sm:p-8">
      <h2 className="text-2xl font-black text-ink">Subjects Covered</h2>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {subjects.map((subject) => (
          <div key={subject.id} className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4">
            <p className="font-black text-ink">{subject.name}</p>
            {subject.code && <p className="mt-0.5 text-xs font-bold text-muted">{subject.code}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

function CurriculumSection({ groups }) {
  const [open, setOpen] = useState(groups[0] ? `${groups[0].section}::${groups[0].subject}` : "");

  return (
    <section className="overflow-hidden rounded-2xl border border-emerald-100 bg-paper shadow-sm">
      <div className="bg-emerald-950 p-6 text-white">
        <p className="text-sm font-black uppercase text-emerald-200">Course outline</p>
        <h2 className="mt-1 text-2xl font-black sm:text-3xl">Curriculum</h2>
        <p className="mt-2 max-w-2xl font-semibold text-emerald-50">Explore the subject-wise modules before submitting your admission form. Locked items unlock after enrollment.</p>
      </div>
      <div className="grid gap-4 p-5">
        {groups.map((group, index) => {
          const key = `${group.section}::${group.subject}`;
          return (
            <article key={key} className="overflow-hidden rounded-xl border border-emerald-100">
              <button type="button" onClick={() => setOpen(open === key ? "" : key)} className="flex w-full items-center justify-between gap-4 bg-emerald-50 p-4 text-left transition hover:bg-emerald-100">
                <span>
                  <span className="text-xs font-black uppercase text-emerald-700">Module {String(index + 1).padStart(2, "0")} · {group.section}</span>
                  <span className="block text-xl font-black text-ink">{group.subject}</span>
                </span>
                <span className="rounded-full bg-white px-3 py-1 text-sm font-black text-emerald-800">{group.items.length} topics</span>
              </button>
              <div className={`grid transition-all duration-300 ${open === key ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                <div className="overflow-hidden">
                  <div className="grid gap-3 p-4">
                    {group.items.map((item) => <CurriculumTopic item={item} key={item.id} />)}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function CurriculumTopic({ item }) {
  if (item.locked) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-soft p-4">
        <div>
          <h3 className="font-black text-muted">{item.title}</h3>
          {item.summary && <p className="mt-1 text-sm font-semibold text-muted">{item.summary}</p>}
        </div>
        <span className="flex shrink-0 items-center gap-1 text-xs font-black uppercase text-slate-400"><Lock size={14} /> Enroll to access</span>
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-slate-100 bg-paper p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-black text-slate-950">{item.title}</h3>
          {item.summary && <p className="mt-1 font-semibold text-muted">{item.summary}</p>}
        </div>
        <span className="badge badge-success badge-outline font-black">Preview</span>
      </div>
      {item.content && <p className="mt-3 whitespace-pre-wrap text-sm font-medium leading-6 text-muted">{item.content}</p>}
      {item.content_type === "image" && item.file && <img src={resolveMediaUrl(item.file)} alt={item.title} className="mt-3 max-h-80 w-full rounded-xl object-cover" />}
      {item.content_type === "video" && item.url && <iframe className="mt-3 aspect-video w-full rounded-xl" src={item.url} title={item.title} allowFullScreen />}
      {["link", "file"].includes(item.content_type) && (item.url || item.file) && <a className="btn btn-outline btn-success btn-sm mt-3" href={resolveMediaUrl(item.url || item.file)} target="_blank" rel="noreferrer">Open resource</a>}
    </div>
  );
}

function TeachersSection({ teachers }) {
  return (
    <div className="rounded-2xl border border-emerald-100 bg-paper p-6 shadow-sm sm:p-8">
      <h2 className="text-2xl font-black text-ink">Meet Your Instructors</h2>
      <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {teachers.map((teacher) => (
          <div key={teacher.id} className="rounded-xl border border-slate-100 bg-soft p-4 text-center">
            {teacher.photo ? (
              <img src={resolveMediaUrl(teacher.photo)} alt={teacher.name} className="mx-auto h-20 w-20 rounded-full object-cover" />
            ) : (
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-2xl font-black text-emerald-700">{teacher.name?.[0] || "T"}</div>
            )}
            <p className="mt-3 font-black text-ink">{teacher.name}</p>
            {(teacher.subject || teacher.designation) && <p className="text-xs font-bold text-muted">{[teacher.subject, teacher.designation].filter(Boolean).join(" · ")}</p>}
            {teacher.qualification && <p className="mt-1 text-xs font-semibold text-muted">{teacher.qualification}</p>}
            {teacher.bio && <p className="mt-2 text-xs font-medium leading-5 text-muted">{teacher.bio}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

function AdmissionInfoTable({ program }) {
  const statusLabel = program.application.status === "OPEN" ? "Admission Open" : program.application.status === "UPCOMING" ? "Opening Soon" : "Admission Closed";
  return (
    <div className="rounded-2xl border border-emerald-100 bg-paper p-6 shadow-sm sm:p-8">
      <h2 className="text-2xl font-black text-ink">Admission Information</h2>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        <Info label="Course" value={program.title} />
        <Info label="Code" value={program.className} />
        <Info label="Admission Opens" value={program.startDate} />
        <Info label="Application Deadline" value={program.endDate} />
        <Info label="Regular Fee" value={`BDT ${program.pricing.regular}`} />
        {program.pricing.offer != null && <Info label="Offer Fee" value={`BDT ${program.pricing.offer}`} />}
        <Info label="Seats" value={program.seats} />
        <Info label="Status" value={statusLabel} />
      </dl>
    </div>
  );
}

function RequirementsSection({ items }) {
  return (
    <div className="rounded-2xl border border-emerald-100 bg-paper p-6 shadow-sm sm:p-8">
      <h2 className="text-2xl font-black text-ink">Admission Requirements</h2>
      <ul className="mt-4 grid gap-2">
        {items.map((item) => (
          <li key={item.id} className="flex items-start gap-2 text-sm font-semibold text-muted">
            <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[var(--brand)]" />
            {item.text}
          </li>
        ))}
      </ul>
    </div>
  );
}

const enrollSteps = [
  "Create an account or log in",
  "Open this admission page and click Apply Now",
  "Complete the online admission form",
  "Submit required information and documents",
  "Complete payment if required",
  "Admin reviews your application",
  "Once approved, the course appears in your Student Dashboard",
];

function HowToEnroll() {
  return (
    <div className="rounded-2xl border border-emerald-100 p-6 shadow-sm sm:p-8" style={{ background: "var(--soft)" }}>
      <h2 className="text-2xl font-black text-ink">How to Enroll</h2>
      <ol className="mt-4 grid gap-3">
        {enrollSteps.map((step, index) => (
          <li key={step} className="flex items-start gap-3 text-sm font-bold text-muted">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--brand)] text-xs font-black text-white">{index + 1}</span>
            {step}
          </li>
        ))}
      </ol>
    </div>
  );
}

function FaqSection({ items }) {
  const [open, setOpen] = useState(items[0]?.id || "");
  const sorted = useMemo(() => [...items].sort((a, b) => (a.order || 0) - (b.order || 0)), [items]);
  return (
    <div className="rounded-2xl border border-emerald-100 bg-paper p-6 shadow-sm sm:p-8">
      <h2 className="text-2xl font-black text-ink">Frequently Asked Questions</h2>
      <div className="mt-4 grid gap-2">
        {sorted.map((item) => (
          <div key={item.id} className="overflow-hidden rounded-xl border border-slate-100">
            <button type="button" onClick={() => setOpen(open === item.id ? "" : item.id)} className="flex w-full items-center justify-between gap-3 p-4 text-left font-bold text-ink hover:bg-soft">
              {item.question}
              <ChevronDown size={18} className={`shrink-0 transition-transform ${open === item.id ? "rotate-180" : ""}`} />
            </button>
            {open === item.id && <div className="border-t border-slate-100 p-4 text-sm font-medium leading-6 text-muted">{item.answer}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

function ApplyPanel({ program, appStatus, submit, submitting, submitError, submitted }) {
  const myApp = program.application?.my_application;

  if (myApp?.status === "approved") {
    return (
      <div className="text-center">
        <CheckCircle2 size={40} className="mx-auto text-[var(--brand)]" />
        <h2 className="mt-3 text-xl font-black text-ink">You&apos;re Enrolled!</h2>
        <p className="mt-2 text-sm font-semibold text-muted">Your application has been approved.</p>
        <Link to="/student/dashboard" className={`${primaryButton} mt-5 w-full`}>Go to Course</Link>
      </div>
    );
  }

  if (myApp && ["pending", "under_review"].includes(myApp.status)) {
    return (
      <div className="text-center">
        <h2 className="text-xl font-black text-ink">Application Pending</h2>
        <p className="mt-2 text-sm font-semibold text-muted">Your application is under review. You&apos;ll be notified once it&apos;s processed.</p>
        <Link to="/admission/applicant" className="btn btn-outline mt-5 w-full">View Application</Link>
      </div>
    );
  }

  if (appStatus !== "OPEN") {
    return (
      <div className="text-center">
        <h2 className="text-xl font-black text-ink">{appStatus === "UPCOMING" ? "Admissions Opening Soon" : "Admissions Closed"}</h2>
        <p className="mt-2 text-sm font-semibold text-muted">{appStatus === "UPCOMING" ? "Applications are not open yet for this program." : "This admission window has ended."}</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="alert alert-success flex-col items-start"
      >
        <h3 className="font-black">Application Submitted Successfully</h3>
        <p>Application ID: <strong>{submitted.applicationId}</strong></p>
        <p>Status: <strong>Pending Review</strong></p>
        <p>Your application has been sent to the administration. You will be notified after review.</p>
        <div className="flex flex-wrap gap-2">
          <Link className="btn btn-sm" to="/admission/applicant">View Application</Link>
          <Link className="btn btn-sm btn-success text-white" to="/student/dashboard">Go to Dashboard</Link>
        </div>
      </motion.div>
    );
  }

  if (!program.formSchema.length) {
    return (
      <div className="text-center">
        <h2 className="text-xl font-black text-ink">Application Form Not Ready Yet</h2>
        <p className="mt-2 text-sm font-semibold text-muted">The admission office hasn&apos;t configured an application form for this program yet. Please check back soon.</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
      <h2 className="text-2xl font-black text-ink">Admission Form</h2>
      <p className="mt-1 text-sm font-semibold text-muted">Submit your information for this admission card.</p>
      <form className="mt-5 grid gap-4" onSubmit={submit}>
        <label className={fieldClass}>Program<input className={inputClass} name="Program" value={program.title} readOnly /></label>
        {program.formSchema.map((section) => (
          <fieldset className="rounded-xl border border-emerald-100 p-4" key={section.title}>
            <legend className="px-2 text-sm font-black text-emerald-900">{section.title}</legend>
            <div className="grid gap-3 pt-2">
              {(section.fields || []).map((field) => <AdmissionFormField field={field} program={program} key={field.name || field.label} />)}
            </div>
          </fieldset>
        ))}
        {submitError && <div className="alert border-red-100 bg-red-50 text-red-700">{submitError}</div>}
        <button disabled={submitting} className={primaryButton}>{submitting ? "Submitting..." : "Submit Application"}</button>
      </form>
    </motion.div>
  );
}

function FinalCta({ program, cta }) {
  return (
    <section className="pb-28 pt-14 text-white lg:pb-14" style={{ background: "linear-gradient(135deg, #063b2d 0%, #0f7a55 100%)" }}>
      <div className={`${containerClass} grid gap-4 text-center`}>
        <h2 className="text-2xl font-black sm:text-3xl">Ready to Start Your Preparation?</h2>
        <p className="font-semibold text-emerald-50">{program.title} — {program.cta?.subtitle || "Start your structured preparation today."}</p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-4">
          {program.pricing.offer != null && <span className="text-2xl font-black">BDT {program.pricing.offer}</span>}
          <CtaButton cta={cta} className="btn border-0 bg-white text-emerald-900 hover:bg-emerald-50" />
        </div>
      </div>
    </section>
  );
}

function MobileStickyCta({ program, cta }) {
  const statusLabel = program.application.status === "OPEN" ? "Admission Open" : program.application.status === "UPCOMING" ? "Opening Soon" : "Admission Closed";
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-emerald-100 bg-paper p-3 shadow-2xl lg:hidden"
      style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
    >
      <div>
        <p className="text-lg font-black text-[var(--brand)]">BDT {program.pricing.offer != null ? program.pricing.offer : program.pricing.regular}</p>
        <p className="text-xs font-bold text-muted">{statusLabel}</p>
      </div>
      <CtaButton cta={cta} className="btn border-0 bg-[var(--brand)] text-white" />
    </div>
  );
}

function normalizeFormSchema(schema) {
  const source = Array.isArray(schema) ? schema : [];
  return source
    .map((section) => ({
      title: section.title || "Information",
      fields: Array.isArray(section.fields) ? section.fields.filter((field) => field?.label) : [],
    }))
    .filter((section) => section.fields.length);
}

function AdmissionFormField({ field, program }) {
  const name = field.name || field.label;
  const commonProps = {
    className: inputClass,
    name,
    required: Boolean(field.required),
    defaultValue: field.label === "Class" ? program.className : "",
    placeholder: field.placeholder || "",
  };

  return (
    <label className={fieldClass}>
      {field.label}
      {field.type === "textarea" ? (
        <textarea {...commonProps} className="textarea textarea-bordered w-full" />
      ) : field.type === "select" ? (
        <select {...commonProps} defaultValue="">
          <option value="">{field.placeholder || `Select ${field.label}`}</option>
          {(field.options || []).map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      ) : field.type === "file" ? (
        <input name={name} required={Boolean(field.required)} type="file" className="file-input file-input-bordered w-full" />
      ) : (
        <input {...commonProps} type={field.type || "text"} />
      )}
    </label>
  );
}

function formatList(value) {
  if (Array.isArray(value)) return value.filter(Boolean).join(", ");
  return value || "-";
}

function Info({ label, value, wide }) {
  return (
    <div className={`rounded-xl bg-emerald-50 p-3 ${wide ? "md:col-span-2" : ""}`}>
      <dt className="font-black text-emerald-800">{label}</dt>
      <dd className="mt-1 font-semibold text-muted">{value}</dd>
    </div>
  );
}

function PlainInfo({ label, value }) {
  return (
    <div>
      <dt className="font-black text-slate-950">{label}</dt>
      <dd className="mt-1 font-semibold text-muted">{value}</dd>
    </div>
  );
}

function CustomContent({ item }) {
  const type = item.type || "text";
  if (type === "image" && item.url) {
    return (
      <figure>
        <img src={resolveMediaUrl(item.url)} alt={item.label || "Admission detail"} className="max-h-80 w-full rounded-xl object-cover" />
        <figcaption className="mt-2 font-bold text-muted">{item.label}</figcaption>
      </figure>
    );
  }
  if (type === "video" && item.url) {
    return (
      <div>
        <h3 className="font-black text-emerald-900">{item.label}</h3>
        <iframe className="mt-2 aspect-video w-full rounded-xl" src={item.url} title={item.label || "Admission video"} allowFullScreen />
      </div>
    );
  }
  if (["link", "file"].includes(type) && item.url) {
    return <a className="link link-success font-black" href={resolveMediaUrl(item.url)} target="_blank" rel="noreferrer">{item.label || item.url}</a>;
  }
  return (
    <div className="rounded-xl bg-soft p-4">
      <h3 className="font-black text-emerald-900">{item.label || "Detail"}</h3>
      <p className="mt-1 font-semibold text-muted">{item.value || item.url}</p>
    </div>
  );
}

function resolveMediaUrl(value) {
  if (!value) return "";
  if (/^https?:\/\//.test(value)) return value;
  return `${API_BASE_URL.replace(/\/api\/v1$/, "")}${value}`;
}

export function AdmissionResultPage() {
  return <SearchStatus title="Admission Result" fields={["Application ID", "Mobile Number"]} />;
}

export function ApplicantPage() {
  return <SearchStatus title="Applicant's Form" fields={["Application ID", "Mobile", "Name"]} />;
}

function SearchStatus({ title, fields }) {
  const [status, setStatus] = useState(null);
  const [values, setValues] = useState({});
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const search = async (event) => {
    event.preventDefault();
    if (searching) return;
    setSearching(true);
    setStatus(null);
    setSearchError("");
    try {
      const result = await admissionService.status({ application_no: values["Application ID"]?.trim(), applicant_phone: values.Mobile?.trim(), applicant_name: values.Name?.trim() });
      setStatus(result);
      if (!result) setSearchError("No matching application was found.");
    } catch (error) {
      setSearchError(error.response?.status === 401 || error.response?.status === 403
        ? "Application lookup requires authorized access. Please contact the admissions office for your status."
        : "Application status could not be loaded. Please try again.");
    } finally { setSearching(false); }
  };

  return (
    <>
      <SEO title={title} />
      <PageHeader title={title} eyebrow="Admission" />
      <section>
        <div className={containerClass}>
          <form onSubmit={search} className="grid gap-4 rounded-2xl border border-emerald-100 bg-paper p-5 shadow-sm md:grid-cols-2 lg:grid-cols-4">
            {fields.map((f) => (
              <label className={fieldClass} key={f}>
                {f}
                <input className={inputClass} required value={values[f] || ""} onChange={(event) => setValues((current) => ({ ...current, [f]: event.target.value }))} />
              </label>
            ))}
            <button type="submit" disabled={searching} className={`${primaryButton} self-end`}>{searching ? "Searching..." : "Search"}</button>
          </form>
          {searchError && <p role="alert" className="mt-4 text-red-700">{searchError}</p>}

          {status && (
            <div className="card mt-6 border border-emerald-100 bg-base-100 shadow-sm">
              <div className="card-body">
                <h2 className="card-title text-ink">{status.name}</h2>
                <p>Application: {status.applicationId}</p>
                <p className="badge badge-success badge-outline font-bold">{status.status}</p>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export function BlankFormPage() {
  return (
    <PrintableDoc
      title="Blank Admission Form"
      lines={["Student information", "Parent information", "Academic information", "Guardian information", "Photograph area", "Applicant and guardian signatures"]}
    />
  );
}

export function AdmitCardPage() {
  return (
    <PrintableDoc
      title="Admit Card"
      search
      lines={["Institution logo and name", "Student photo and name", "Roll, class, exam, venue", "Subject-wise exam dates", "Authorized signature"]}
    />
  );
}

function PrintableDoc({ title, lines, search }) {
  return (
    <>
      <SEO title={title} />
      <PageHeader title={title} eyebrow="Admission" />
      <section className="printable">
        <div className={containerClass}>
          {search && (
            <div className="no-print mb-5 grid gap-4 rounded-2xl border border-emerald-100 bg-paper p-5 shadow-sm md:grid-cols-4">
              {["Student ID", "Roll", "Application ID"].map((field) => (
                <label className={fieldClass} key={field}>
                  {field}
                  <input className={inputClass} />
                </label>
              ))}
              <button className={`${primaryButton} self-end`}>Search</button>
            </div>
          )}

          <div className="rounded-2xl border border-emerald-100 bg-paper p-8 shadow-sm">
            <h2 className="mb-5 text-2xl font-black text-ink">{title}</h2>
            <div className="grid gap-3">
              {lines.map((l) => (
                <p className="rounded-lg border border-slate-100 bg-soft p-3 text-muted" key={l}>{l}</p>
              ))}
            </div>
            <div className="mt-10 grid gap-6 text-center text-sm font-bold text-muted sm:grid-cols-3">
              <span className="border-t border-slate-300 pt-2">Applicant Signature</span>
              <span className="border-t border-slate-300 pt-2">Guardian Signature</span>
              <span className="border-t border-slate-300 pt-2">Authority</span>
            </div>
          </div>

          <button className="btn no-print mt-5" onClick={() => window.print()}>Print</button>
        </div>
      </section>
    </>
  );
}
