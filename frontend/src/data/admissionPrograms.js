export const ADMISSION_PROGRAMS_STORAGE_KEY = "expertAdmissionPrograms";

export const defaultAdmissionPrograms = [
  {
    id: "class-9-foundation",
    title: "Class 9 Foundation Admission",
    className: "Class 9",
    image: "/slide1.jpeg",
    startDate: "2026-01-10",
    endDate: "2026-01-31",
    admissionFee: "1500",
    seats: "60",
    teachers: "Md. Farid Hossen, Science Team, English Team",
    subjects: "Bangla, English, Mathematics, General Science, ICT",
    schedule: "Morning and Day batches",
    eligibility: "Students promoted to Class 9",
    description: "Foundation batch focused on school syllabus, chapter tests, and weekly progress review.",
    formFields: ["Student Name", "Guardian Phone", "School Name", "Preferred Shift"],
  },
  {
    id: "class-10-board",
    title: "Class 10 Board Preparation",
    className: "Class 10",
    image: "/slide2.jpeg",
    startDate: "2026-01-12",
    endDate: "2026-02-05",
    admissionFee: "1800",
    seats: "50",
    teachers: "Board Preparation Faculty, Math Team, English Team",
    subjects: "Bangla, English, Mathematics, Science, Bangladesh Studies",
    schedule: "Evening batch with weekly model tests",
    eligibility: "Class 10 students preparing for board exam",
    description: "Exam-oriented batch with model tests, answer-script review, and guardian reporting.",
    formFields: ["Student Name", "Board Roll", "Guardian Phone", "Previous Result"],
  },
  {
    id: "ssc-special",
    title: "SSC Special Admission",
    className: "SSC",
    image: "/slide3.jpeg",
    startDate: "2026-01-15",
    endDate: "2026-02-15",
    admissionFee: "2200",
    seats: "80",
    teachers: "SSC Specialist Panel",
    subjects: "All compulsory subjects, group subjects, practical guidance",
    schedule: "Intensive classes plus exam lab",
    eligibility: "SSC candidates from Science, Humanities, or Business Studies",
    description: "Compact SSC program for final revision, weakness recovery, and high-frequency question practice.",
    formFields: ["Student Name", "Group", "Guardian Phone", "Target GPA"],
  },
  {
    id: "hsc-academic",
    title: "HSC Academic Admission",
    className: "HSC",
    image: "/slide1.jpeg",
    startDate: "2026-02-01",
    endDate: "2026-02-28",
    admissionFee: "2500",
    seats: "70",
    teachers: "HSC Academic Faculty",
    subjects: "Bangla, English, ICT, group-wise core subjects",
    schedule: "Separate first-year and second-year batches",
    eligibility: "HSC first-year and second-year students",
    description: "Structured HSC coaching with subject-wise plans, assessment, and result tracking.",
    formFields: ["Student Name", "College Name", "Group", "Guardian Phone"],
  },
  {
    id: "admission-test",
    title: "Admission Test Program",
    className: "Admission",
    image: "/slide2.jpeg",
    startDate: "2026-03-01",
    endDate: "2026-03-25",
    admissionFee: "3000",
    seats: "100",
    teachers: "Admission Test Faculty, MCQ Test Panel",
    subjects: "Bangla, English, Mathematics, General Knowledge, ICT",
    schedule: "Live MCQ tests, review classes, merit tracking",
    eligibility: "Students preparing for competitive admission tests",
    description: "Admission-focused program with timed MCQ exams, ranking, review, and performance analytics.",
    formFields: ["Student Name", "Target Program", "Guardian Phone", "Previous Institution"],
  },
];

export function getAdmissionPrograms() {
  if (typeof window === "undefined") {
    return defaultAdmissionPrograms;
  }

  try {
    const saved = window.localStorage.getItem(ADMISSION_PROGRAMS_STORAGE_KEY);
    if (!saved) return defaultAdmissionPrograms;
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) && parsed.length ? parsed : defaultAdmissionPrograms;
  } catch {
    return defaultAdmissionPrograms;
  }
}

export function saveAdmissionPrograms(programs) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ADMISSION_PROGRAMS_STORAGE_KEY, JSON.stringify(programs));
}
