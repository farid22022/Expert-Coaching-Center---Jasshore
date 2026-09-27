export const teachers = [
  ["deen-islam", "Deen Islam", "DIRECTOR", "Academic Leadership", "15+ Yrs Experience"],
  ["naimur-rahman", "MD NAIMUR RAHMAN", "TEACHER", "Mathematics", "Senior Mentor"],
  ["ashiq", "MD ASHIQ", "TEACHER", "English", "10+ Yrs Experience"],
  ["uzzal", "UZZAL KUMAR", "TEACHER", "Science", "Senior Mentor"],
  ["masul", "MASUL BILLAH", "TEACHER", "Bangla", "8+ Yrs Experience"],
  ["alamin", "MD ALAMIN", "TEACHER", "ICT", "Subject Expert"],
  ["rasel", "RASEL AHMED", "TEACHER", "General Studies", "9+ Yrs Experience"],
  ["abdullah", "K M ABDULLAH", "TEACHER", "Religion", "Subject Expert"],
  ["rasel-mahmud", "Rasel mahmud", "TEACHER", "Primary", "Early-Years Specialist"],
].map(([id, name, designation, subject, badge], index) => ({
  id,
  name,
  designation,
  subject,
  badge,
  image: `https://placehold.co/240x260/e8f2ee/173d33?text=${encodeURIComponent(name.split(" ")[0])}`,
  bio: "Committed to disciplined coaching, regular assessment, and student-friendly academic support.",
  order: index + 1,
}));

// Placeholder admission outcomes, in the same illustrative spirit as the rest of this
// mock dataset (see `result` below) - not real student records.
export const successStories = [
  { id: "story-1", name: "Ayesha Rahman", outcome: "Admitted to Science Group, Class Nine", quote: "The structured routine and weekly assessments finally gave me a real study system to follow." },
  { id: "story-2", name: "Fahim Hasan", outcome: "Top Scorer, Half Yearly Examination", quote: "My teachers noticed exactly where I was falling behind and helped me fix it early." },
  { id: "story-3", name: "Nusrat Jahan", outcome: "Admitted to Class Eight, Merit List", quote: "Regular mock tests made the real admission test feel completely familiar." },
  { id: "story-4", name: "Samiul Islam", outcome: "GPA 5.00, JSC Examination", quote: "The guardian meetings kept my family involved in my progress every single month." },
  { id: "story-5", name: "Tasnim Akter", outcome: "Admitted to Class Six, Scholarship Batch", quote: "I went from an average student to a confident one within two semesters." },
  { id: "story-6", name: "Rakibul Islam", outcome: "Top 10, Science Group", quote: "Disciplined class timing and mentor support made a real difference in my results." },
];

export const people = {
  founder: { name: "Deen Islam", position: "Founder & Director", message: "Quality coaching, punctual classes, and careful mentoring help students build confidence." },
  chairman: { name: "Committee Chairman", position: "Chairman", message: "The institution works with parents and teachers to maintain a healthy academic environment." },
  principal: { name: "Academic Principal", position: "Principal", message: "Our focus is regular study, transparent evaluation, and respectful discipline." },
};

export const students = Array.from({ length: 28 }, (_, i) => ({
  id: `STU-2026-${String(i + 1).padStart(3, "0")}`,
  name: ["Ayesha Rahman", "Fahim Hasan", "Nusrat Jahan", "Samiul Islam"][i % 4],
  className: ["Six", "Seven", "Eight", "Nine"][i % 4],
  section: ["A", "B"][i % 2],
  roll: i + 1,
  session: "2026",
  shift: i % 2 ? "Day" : "Morning",
  design: i % 2 ? "General" : "Science",
}));

export const routines = [
  ["Sunday", "1st", "08:00", "08:45", "Bangla", "MASUL BILLAH", "Room 201"],
  ["Sunday", "2nd", "08:45", "09:30", "English", "MD ASHIQ", "Room 201"],
  ["Monday", "1st", "08:00", "08:45", "Mathematics", "MD NAIMUR RAHMAN", "Room 202"],
  ["Tuesday", "3rd", "09:30", "10:15", "Science", "UZZAL KUMAR", "Lab"],
].map(([day, period, start, end, subject, teacher, room]) => ({ day, period, start, end, subject, teacher, room, session: "2026", shift: "Morning", className: "Eight", section: "A" }));

export const examRoutine = [
  ["Half Yearly", "Eight", "Bangla", "2026-06-10", "10:00", "12:00", "Hall A"],
  ["Half Yearly", "Eight", "English", "2026-06-12", "10:00", "12:00", "Hall A"],
  ["Half Yearly", "Eight", "Mathematics", "2026-06-15", "10:00", "12:30", "Hall B"],
].map(([exam, className, subject, date, start, end, room]) => ({ session: "2026", exam, className, section: "A", subject, date, start, end, room }));

export const holidays = [
  ["2026-02-21", "Saturday", "International Mother Language Day", "National holiday"],
  ["2026-03-26", "Thursday", "Independence Day", "National holiday"],
  ["2026-12-16", "Wednesday", "Victory Day", "National holiday"],
].map(([date, day, title, description]) => ({ date, day, title, description, year: "2026" }));

export const notices = [
  { id: "admission-open-2026", title: "Admission Open for 2026 Session", category: "Admission", date: "2026-01-05", summary: "Online admission form is available for new students.", body: "Students and guardians may complete the online admission application with accurate personal, guardian, academic, and payment information." },
  { id: "exam-routine-published", title: "Half Yearly Exam Routine Published", category: "Exam", date: "2026-05-20", summary: "Class-wise exam schedule has been published.", body: "Students should review the exam routine and bring admit cards to the examination hall." },
  { id: "holiday-notice", title: "Holiday Notice", category: "Academic", date: "2026-03-24", summary: "Classes will remain closed for national observance.", body: "Regular classes will resume according to the published class routine." },
];

export const news = [
  { id: "annual-awards", title: "Annual Merit Award Ceremony", date: "2026-02-18", summary: "Meritorious students were recognized for strong academic performance.", body: "The ceremony encouraged students to continue disciplined preparation and regular attendance.", image: "https://placehold.co/640x360/e8f2ee/173d33?text=Award+Ceremony" },
  { id: "parent-meeting", title: "Guardian Meeting Held", date: "2026-03-12", summary: "Teachers and guardians discussed progress and study plans.", body: "The meeting focused on attendance, home study routines, and assessment reports.", image: "https://placehold.co/640x360/f4efe3/173d33?text=Guardian+Meeting" },
];

export const events = [
  { id: "science-fair", title: "Student Science Fair", date: "2026-04-05", location: "Campus Hall", description: "Students presented science projects and practical demonstrations.", image: "https://placehold.co/640x360/e9eef8/173d33?text=Science+Fair" },
  { id: "sports-day", title: "Annual Sports Day", date: "2026-01-28", location: "Jashore Stadium", description: "A day of friendly competitions and student activities.", image: "https://placehold.co/640x360/e8f2ee/173d33?text=Sports+Day" },
];

export const photos = Array.from({ length: 8 }, (_, i) => ({ id: i + 1, title: `Campus Gallery ${i + 1}`, album: i % 2 ? "Events" : "Campus", src: `https://placehold.co/800x540/${i % 2 ? "f4efe3" : "e8f2ee"}/173d33?text=Expert+Gallery+${i + 1}` }));
export const videos = [{ id: 1, title: "Academic Guidance Session", date: "2026-02-01", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", description: "Sample embedded video placeholder for public gallery." }];

export const result = {
  student: "Fahim Shahariya Labib",
  father: "Khondokar Abdus Sobhan",
  mother: "Kana Khatun",
  studentId: "2019-02-387",
  className: "TWO",
  roll: "1",
  session: "2019",
  exam: "2ND SEMESTER",
  subjects: [
    ["Bangla", 50, 50, "A+", "5.00"],
    ["English", 25, 25, "A+", "5.00"],
    ["Mathematics", 100, 96, "A+", "5.00"],
  ],
  total: 489,
  gpa: "5.00",
  grade: "A+",
  status: "Passed",
};
