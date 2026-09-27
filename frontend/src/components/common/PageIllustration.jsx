const illustrations = {
  education: "undraw_education_3vwh.svg",
  teacher: "undraw_teacher_n0ow.svg",
  quiz: "undraw_quiz_zvhe.svg",
  reading: "undraw_reading-time_jva3.svg",
  graduation: "undraw_graduation_u7uc.svg",
  support: "undraw_instant-support_oav0.svg",
  login: "undraw_login_weas.svg",
  join: "undraw_join_niai.svg",
  organizer: "undraw_online-organizer_1kdy.svg",
  calendar: "undraw_date-picker_8qys.svg",
  writing: "undraw_typewriter_d4km.svg",
};

export function illustrationForPage(title = "") {
  if (/admission|applicant|register/i.test(title)) return "join";
  if (/result|graduat|achievement/i.test(title)) return "graduation";
  if (/quiz|test|assessment|question bank|practice/i.test(title)) return "quiz";
  if (/assignment/i.test(title)) return "writing";
  if (/material|reading|library|book/i.test(title)) return "reading";
  if (/teacher|faculty/i.test(title)) return "teacher";
  if (/contact|feedback|support/i.test(title)) return "support";
  if (/routine|calendar|schedule|holiday/i.test(title)) return "calendar";
  if (/progress|action required|plan/i.test(title)) return "organizer";
  if (/course|academic|education|history/i.test(title)) return "education";
  return null;
}

export default function PageIllustration({ kind, className = "" }) {
  const file = illustrations[kind];
  if (!file) return null;
  return <img src={`/expertjasshore/${file}`} alt="" aria-hidden="true" width="240" height="160" loading="lazy" decoding="async" className={`pointer-events-none h-24 w-36 shrink-0 object-contain ${className}`} />;
}
