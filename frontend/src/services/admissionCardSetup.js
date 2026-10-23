// Computes, client-side, how "complete" an admission card (Course of
// course_type="admission") is, from the fields the admin course payload already
// exposes (admission_form_schema, landing_page, hero_*, images, and the computed
// teacher_names / subject_names / public_syllabus). No network, no backend change.

const stripHtml = (value) =>
  String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

const hasFormFields = (schema) =>
  Array.isArray(schema) &&
  schema.some((section) => Array.isArray(section?.fields) && section.fields.length > 0);

const hasLandingContent = (course) => {
  const lp = course?.landing_page && typeof course.landing_page === "object" ? course.landing_page : {};
  const features = Array.isArray(lp.features) ? lp.features : [];
  const highlights = Array.isArray(lp.highlights) ? lp.highlights : [];
  const aboutDescription = stripHtml(lp.about?.description);
  return features.length > 0 || highlights.length > 0 || Boolean(aboutDescription);
};

const hasImage = (course) =>
  Boolean(course?.hero_image || course?.cover_image || course?.thumbnail);

// Each item maps to the editor tab that fixes it. `tab` must match a landingTabs key
// in AdminPortalPages.jsx: overview | landing | teachers | subjects | form.
export function admissionCardSetup(course) {
  const c = course || {};
  const items = [
    {
      key: "basics",
      label: "Basic details",
      tab: "overview",
      hint: "Fee, seats, application dates and a description.",
      done:
        Boolean(c.title) &&
        c.admission_fee !== null &&
        c.admission_fee !== undefined &&
        Boolean(c.enrollment_start) &&
        Boolean(c.enrollment_end) &&
        c.capacity !== null &&
        c.capacity !== undefined &&
        c.capacity !== "" &&
        Boolean(stripHtml(c.description)),
    },
    {
      key: "landing",
      label: "Landing page",
      tab: "landing",
      hint: "Hero text, an image and at least one landing section.",
      done: Boolean(c.hero_title || c.title) && hasImage(c) && hasLandingContent(c),
    },
    {
      key: "teachers",
      label: "Teachers",
      tab: "teachers",
      hint: "Assign at least one teacher to this admission.",
      done: Array.isArray(c.teacher_names) && c.teacher_names.length > 0,
    },
    {
      key: "subjects",
      label: "Subjects",
      tab: "subjects",
      hint: "Add the subjects covered by this program.",
      done: Array.isArray(c.subject_names) && c.subject_names.length > 0,
    },
    {
      key: "outline",
      label: "Course outline",
      tab: "subjects",
      hint: "Build the syllabus / course outline items.",
      done: Array.isArray(c.public_syllabus) && c.public_syllabus.length > 0,
    },
    {
      key: "form",
      label: "Application form",
      tab: "form",
      hint: "Add the applicant fields collected on apply.",
      done: hasFormFields(c.admission_form_schema),
    },
  ];

  const total = items.length;
  const doneCount = items.filter((item) => item.done).length;
  const percent = total ? Math.round((doneCount / total) * 100) : 0;
  return { items, doneCount, total, percent, complete: doneCount === total };
}

const EDITOR_PATH = "/admin/dashboard/admission-form-builder";

export function buildCardEditorLink(cardId, tab) {
  const params = new URLSearchParams();
  if (cardId !== undefined && cardId !== null) params.set("card", String(cardId));
  if (tab) params.set("tab", tab);
  const query = params.toString();
  return query ? `${EDITOR_PATH}?${query}` : EDITOR_PATH;
}

export const ADMISSION_SETUP_TABS = ["overview", "landing", "teachers", "subjects", "form"];
