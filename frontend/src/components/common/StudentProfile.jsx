import { useState } from "react";
import { Link } from "react-router-dom";
import {
  IdCard,
  GraduationCap,
  Users,
  Hash,
  Layers,
  CalendarDays,
  Sun,
  CheckCircle2,
  XCircle,
  Award,
  FileText,
  ClipboardList,
  Edit3,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  User,
} from "lucide-react";

/* -----------------------------------------------------------
   Demo student data.
   Replace this block with a fetch/hook later:

     GET /api/student/profile   -> studentProfile (without admissionTests)
     GET /api/student/tests     -> admissionTests (array; paginate
                                    server-side once the list gets long,
                                    passing ?page=&pageSize= to the API
                                    instead of slicing client-side)

   e.g.
     const [studentProfile, setStudentProfile] = useState(null);
     const [admissionTests, setAdmissionTests] = useState([]);
     useEffect(() => {
       fetch("/api/student/profile").then(r => r.json()).then(setStudentProfile);
       fetch("/api/student/tests").then(r => r.json()).then(setAdmissionTests);
     }, []);

   If auth already exists, swap this for the logged-in student's
   record instead of the hardcoded demo object below.
----------------------------------------------------------- */
const demoStudentProfile = {
  id: "STU-2026-001",
  name: "Fahim Hasan",
  photo: "/student-placeholder.png",
  className: "Nine",
  section: "A",
  roll: "01",
  group: "Science",
  session: "2026",
  shift: "Morning",
  status: "Active",
};

const demoAdmissionTests = [
  { id: "AT-2026-007", testName: "Science Admission Test", date: "18 Jan 2026", obtainedMarks: 16, totalMarks: 20, percentage: 80, status: "Passed" },
  { id: "AT-2026-006", testName: "Weekly Evaluation Test", date: "09 Jan 2026", obtainedMarks: 14, totalMarks: 20, percentage: 70, status: "Passed" },
  { id: "AT-2025-005", testName: "Final Screening Test", date: "22 Dec 2025", obtainedMarks: 19, totalMarks: 25, percentage: 76, status: "Passed" },
  { id: "AT-2025-004", testName: "Mock Test - Chemistry", date: "05 Dec 2025", obtainedMarks: 11, totalMarks: 20, percentage: 55, status: "Passed" },
  { id: "AT-2025-003", testName: "Mock Test - Physics", date: "21 Nov 2025", obtainedMarks: 8, totalMarks: 20, percentage: 40, status: "Failed" },
  { id: "AT-2025-002", testName: "Mock Test - Math", date: "07 Nov 2025", obtainedMarks: 17, totalMarks: 25, percentage: 68, status: "Passed" },
  { id: "AT-2025-001", testName: "Preliminary Screening Test", date: "24 Oct 2025", obtainedMarks: 9, totalMarks: 20, percentage: 45, status: "Failed" },
  { id: "AT-2025-006", testName: "Advanced Physics Test", date: "12 Dec 2025", obtainedMarks: 22, totalMarks: 30, percentage: 73, status: "Passed" },
  { id: "AT-2025-007", testName: "Organic Chemistry Quiz", date: "15 Dec 2025", obtainedMarks: 13, totalMarks: 20, percentage: 65, status: "Passed" },
  { id: "AT-2025-008", testName: "Calculus Assessment", date: "18 Dec 2025", obtainedMarks: 24, totalMarks: 30, percentage: 80, status: "Passed" },
  { id: "AT-2025-009", testName: "Biology Mid-Term", date: "20 Dec 2025", obtainedMarks: 17, totalMarks: 25, percentage: 68, status: "Passed" },
  { id: "AT-2025-010", testName: "Inorganic Chemistry Test", date: "23 Dec 2025", obtainedMarks: 9, totalMarks: 20, percentage: 45, status: "Failed" },
  { id: "AT-2025-011", testName: "Mechanics Evaluation", date: "26 Dec 2025", obtainedMarks: 21, totalMarks: 25, percentage: 84, status: "Passed" },
  { id: "AT-2025-012", testName: "Algebra Proficiency Test", date: "28 Dec 2025", obtainedMarks: 14, totalMarks: 20, percentage: 70, status: "Passed" },
  { id: "AT-2025-013", testName: "Thermodynamics Quiz", date: "30 Dec 2025", obtainedMarks: 18, totalMarks: 25, percentage: 72, status: "Passed" },
  { id: "AT-2026-001", testName: "New Year Diagnostic Test", date: "02 Jan 2026", obtainedMarks: 25, totalMarks: 30, percentage: 83, status: "Passed" },
  { id: "AT-2026-002", testName: "Physics Comprehensive Test", date: "04 Jan 2026", obtainedMarks: 16, totalMarks: 25, percentage: 64, status: "Passed" },
  { id: "AT-2026-003", testName: "Chemistry Practical Exam", date: "06 Jan 2026", obtainedMarks: 11, totalMarks: 20, percentage: 55, status: "Passed" },
  { id: "AT-2026-004", testName: "Mathematics Speed Test", date: "07 Jan 2026", obtainedMarks: 8, totalMarks: 20, percentage: 40, status: "Failed" },
  { id: "AT-2026-005", testName: "Biology Concept Test", date: "08 Jan 2026", obtainedMarks: 19, totalMarks: 25, percentage: 76, status: "Passed" },
  { id: "AT-2026-008", testName: "Advanced Mathematics Test", date: "20 Jan 2026", obtainedMarks: 27, totalMarks: 30, percentage: 90, status: "Passed" },
  { id: "AT-2026-009", testName: "Physics Problem Solving", date: "22 Jan 2026", obtainedMarks: 13, totalMarks: 20, percentage: 65, status: "Passed" },
  { id: "AT-2026-010", testName: "Chemistry Final Prep Test", date: "24 Jan 2026", obtainedMarks: 22, totalMarks: 25, percentage: 88, status: "Passed" },
  { id: "AT-2026-011", testName: "Biology Advanced Test", date: "26 Jan 2026", obtainedMarks: 12, totalMarks: 20, percentage: 60, status: "Passed" },
  { id: "AT-2026-012", testName: "Math Logic Assessment", date: "28 Jan 2026", obtainedMarks: 9, totalMarks: 25, percentage: 36, status: "Failed" },
  { id: "AT-2026-013", testName: "Physics Lab Evaluation", date: "30 Jan 2026", obtainedMarks: 18, totalMarks: 20, percentage: 90, status: "Passed" },
  { id: "AT-2024-001", testName: "Initial Diagnostic Test", date: "15 Sep 2024", obtainedMarks: 10, totalMarks: 20, percentage: 50, status: "Passed" },
  { id: "AT-2024-002", testName: "Basic Chemistry Test", date: "29 Sep 2024", obtainedMarks: 7, totalMarks: 20, percentage: 35, status: "Failed" },
  { id: "AT-2024-003", testName: "Fundamental Physics Test", date: "13 Oct 2024", obtainedMarks: 15, totalMarks: 25, percentage: 60, status: "Passed" },
  { id: "AT-2024-004", testName: "Elementary Math Test", date: "27 Oct 2024", obtainedMarks: 18, totalMarks: 25, percentage: 72, status: "Passed" },
  { id: "AT-2024-005", testName: "Biology Basics Test", date: "10 Nov 2024", obtainedMarks: 16, totalMarks: 20, percentage: 80, status: "Passed" },
  { id: "AT-2024-006", testName: "Mid-Year Assessment", date: "24 Nov 2024", obtainedMarks: 20, totalMarks: 30, percentage: 67, status: "Passed" },
  { id: "AT-2024-007", testName: "Chemistry Concepts Test", date: "08 Dec 2024", obtainedMarks: 13, totalMarks: 20, percentage: 65, status: "Passed" },
  { id: "AT-2024-008", testName: "Physics Fundamentals Quiz", date: "22 Dec 2024", obtainedMarks: 8, totalMarks: 20, percentage: 40, status: "Failed" },
  { id: "AT-2024-009", testName: "Math Problem Solving Test", date: "05 Jan 2025", obtainedMarks: 21, totalMarks: 25, percentage: 84, status: "Passed" },
  { id: "AT-2024-010", testName: "Biology Practical Exam", date: "19 Jan 2025", obtainedMarks: 17, totalMarks: 25, percentage: 68, status: "Passed" },
  { id: "AT-2025-014", testName: "Chemistry Advanced Quiz", date: "02 Feb 2025", obtainedMarks: 23, totalMarks: 30, percentage: 77, status: "Passed" },
  { id: "AT-2025-015", testName: "Physics Advanced Test", date: "16 Feb 2025", obtainedMarks: 11, totalMarks: 20, percentage: 55, status: "Passed" },
  { id: "AT-2025-016", testName: "Math Advanced Assessment", date: "02 Mar 2025", obtainedMarks: 26, totalMarks: 30, percentage: 87, status: "Passed" },
  { id: "AT-2025-017", testName: "Biology Advanced Quiz", date: "16 Mar 2025", obtainedMarks: 14, totalMarks: 20, percentage: 70, status: "Passed" },
  { id: "AT-2025-018", testName: "Chemistry Practical Test", date: "30 Mar 2025", obtainedMarks: 9, totalMarks: 20, percentage: 45, status: "Failed" },
  { id: "AT-2025-019", testName: "Physics Theory Test", date: "13 Apr 2025", obtainedMarks: 19, totalMarks: 25, percentage: 76, status: "Passed" },
  { id: "AT-2025-020", testName: "Math Theory Assessment", date: "27 Apr 2025", obtainedMarks: 22, totalMarks: 30, percentage: 73, status: "Passed" },
  { id: "AT-2025-021", testName: "Biology Theory Test", date: "11 May 2025", obtainedMarks: 15, totalMarks: 20, percentage: 75, status: "Passed" },
  { id: "AT-2025-022", testName: "Chemistry Revision Test", date: "25 May 2025", obtainedMarks: 12, totalMarks: 20, percentage: 60, status: "Passed" },
  { id: "AT-2025-023", testName: "Physics Revision Quiz", date: "08 Jun 2025", obtainedMarks: 18, totalMarks: 25, percentage: 72, status: "Passed" },
  { id: "AT-2025-024", testName: "Math Revision Test", date: "22 Jun 2025", obtainedMarks: 7, totalMarks: 20, percentage: 35, status: "Failed" },
  { id: "AT-2025-025", testName: "Biology Revision Assessment", date: "06 Jul 2025", obtainedMarks: 20, totalMarks: 25, percentage: 80, status: "Passed" },
  { id: "AT-2025-026", testName: "Chemistry Mid-Term Exam", date: "20 Jul 2025", obtainedMarks: 24, totalMarks: 30, percentage: 80, status: "Passed" },
  { id: "AT-2025-027", testName: "Physics Mid-Term Exam", date: "03 Aug 2025", obtainedMarks: 13, totalMarks: 20, percentage: 65, status: "Passed" },
  { id: "AT-2025-028", testName: "Math Mid-Term Exam", date: "17 Aug 2025", obtainedMarks: 16, totalMarks: 25, percentage: 64, status: "Passed" },
  { id: "AT-2025-035", testName: "Physics Practice Test", date: "23 Nov 2025", obtainedMarks: 17, totalMarks: 25, percentage: 68, status: "Passed" },


];

const TESTS_PER_PAGE = 3;

export default function StudentProfile() {
  // Swap these two lines for real auth/API data when ready — the
  // rest of the component reads only from `student` and `tests`,
  // so nothing else needs to change.
  const [student] = useState(demoStudentProfile);
  const [tests] = useState(demoAdmissionTests);
  const [photoFailed, setPhotoFailed] = useState(false);
  const [page, setPage] = useState(1);

  const totalTests = tests.length;
  const totalPages = Math.max(1, Math.ceil(totalTests / TESTS_PER_PAGE));
  const startIdx = (page - 1) * TESTS_PER_PAGE;
  const visibleTests = tests.slice(startIdx, startIdx + TESTS_PER_PAGE);

  const goToPage = (p) => setPage(Math.min(totalPages, Math.max(1, p)));

  const infoRows = [
    [User, "Full Name", student.name],
    [IdCard, "Student ID", student.id],
    [GraduationCap, "Class", student.className],
    [Layers, "Section", student.section],
    [Hash, "Roll", student.roll],
    [Users, "Group", student.group],
    [CalendarDays, "Session", student.session],
    [Sun, "Shift", student.shift],
  ];

  return (
    <main className="min-h-screen bg-emerald-50/70">
      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-2">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-sm font-black text-emerald-800">
            <User size={13} />
            Dashboard
          </span>
          <h1 className="text-3xl font-black text-emerald-950">Student Profile</h1>
        </div>

        <section className="card border border-emerald-100 bg-base-100 shadow-sm">
          <div className="card-body flex-col gap-5 md:flex-row md:items-center">
            <div className="relative w-fit">
              {!photoFailed ? (
                <img
                  src={student.photo}
                  alt={student.name}
                  className="h-28 w-28 rounded-2xl border border-emerald-100 object-cover shadow-sm"
                  onError={() => setPhotoFailed(true)}
                />
              ) : (
                <div className="grid h-28 w-28 place-items-center rounded-2xl bg-emerald-700 text-4xl font-black text-white shadow-sm">
                  {student.name.charAt(0)}
                </div>
              )}
              <span className="absolute -bottom-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 text-xs font-black text-white shadow">
                <CheckCircle2 size={11} />
                {student.status}
              </span>
            </div>

            <div className="grid gap-3 pt-3 md:pt-0">
              <h2 className="text-3xl font-black text-emerald-950">{student.name}</h2>
              <span className="inline-flex w-fit items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700">
                <IdCard size={15} />
                Student ID: {student.id}
              </span>
              <div className="flex flex-wrap gap-2">
                <span className="badge badge-success badge-outline gap-1 font-bold">
                  <GraduationCap size={13} />
                  Class: {student.className}
                </span>
                <span className="badge badge-warning badge-outline gap-1 font-bold">
                  <Layers size={13} />
                  Group: {student.group}
                </span>
                <span className="badge badge-success badge-outline gap-1 font-bold">
                  <CalendarDays size={13} />
                  Session: {student.session}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="card border border-emerald-100 bg-base-100 shadow-sm">
          <div className="card-body">
            <div className="mb-2 flex items-center gap-2">
              <User size={17} className="text-emerald-700" />
              <h2 className="text-xl font-black text-emerald-950">Personal Information</h2>
            </div>

            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {infoRows.map(([Icon, label, value]) => (
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4" key={label}>
                  <span className="mb-2 inline-flex items-center gap-2 text-sm font-black text-emerald-800">
                    <Icon size={15} />
                    {label}
                  </span>
                  <p className="font-bold text-slate-700">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="card border border-emerald-100 bg-base-100 shadow-sm">
          <div className="card-body">
            <div className="mb-2 flex items-center gap-2">
              <Award size={17} className="text-emerald-700" />
              <h2 className="text-xl font-black text-emerald-950">Admission Tests</h2>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-emerald-100">
              <table className="table table-zebra">
                <thead>
                  <tr className="bg-emerald-950 text-white">
                    <th className="text-white">Test</th>
                    <th className="text-white">Date</th>
                    <th className="text-white">Score</th>
                    <th className="text-white">Percentage</th>
                    <th className="text-white">Status</th>
                    <th aria-label="Action" />
                  </tr>
                </thead>
                <tbody>
                  {visibleTests.map((t) => {
                    const passed = t.status.toLowerCase() === "passed";
                    return (
                      <tr key={t.id}>
                        <td className="font-black text-slate-800">{t.testName}</td>
                        <td>
                          <span className="inline-flex items-center gap-1 font-semibold text-slate-600">
                            <CalendarDays size={13} />
                            {t.date}
                          </span>
                        </td>
                        <td className="font-semibold">
                          {t.obtainedMarks} / {t.totalMarks}
                        </td>
                        <td>
                          <div className="flex min-w-40 items-center gap-2">
                            <progress
                              className={`progress ${passed ? "progress-success" : "progress-error"} w-28`}
                              value={t.percentage}
                              max="100"
                            />
                            <span className="font-bold">{t.percentage}%</span>
                          </div>
                        </td>
                        <td>
                          <span className={`badge gap-1 font-bold ${passed ? "badge-success" : "badge-error"}`}>
                            {passed ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                            {t.status}
                          </span>
                        </td>
                        <td>
                          <Link to="/admission/result" className="btn btn-ghost btn-xs text-emerald-700">
                            View
                            <ArrowRight size={13} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm font-bold text-slate-500">
                Showing {startIdx + 1}-{Math.min(startIdx + TESTS_PER_PAGE, totalTests)} of {totalTests}
              </span>

              <div className="join">
                <button
                  type="button"
                  className="btn join-item btn-sm"
                  onClick={() => goToPage(page - 1)}
                  disabled={page === 1}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={`btn join-item btn-sm ${p === page ? "btn-success" : ""}`}
                    onClick={() => goToPage(p)}
                    aria-current={p === page}
                  >
                    {p}
                  </button>
                ))}

                <button
                  type="button"
                  className="btn join-item btn-sm"
                  onClick={() => goToPage(page + 1)}
                  disabled={page === totalPages}
                  aria-label="Next page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="card border border-emerald-100 bg-base-100 shadow-sm">
          <div className="card-body">
            <div className="mb-2 flex items-center gap-2">
              <ClipboardList size={17} className="text-emerald-700" />
              <h2 className="text-xl font-black text-emerald-950">Quick Actions</h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <Link to="/admission/online" className="btn min-h-16 justify-start bg-emerald-700 text-white hover:bg-emerald-800">
                <FileText size={22} />
                Admission Test
              </Link>
              <Link to="/result/individual" className="btn min-h-16 justify-start bg-emerald-700 text-white hover:bg-emerald-800">
                <Award size={22} />
                My Results
              </Link>
              <Link to="/student-profile/edit" className="btn min-h-16 justify-start bg-amber-500 text-white hover:bg-amber-600">
                <Edit3 size={22} />
                Edit Profile
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );

  return (
    <main className="sp-page">
      <div className="sp-container">
        <div className="sp-page-title">
          <span className="sp-eyebrow">
            <User size={13} />
            Dashboard
          </span>
          <h1>Student Profile</h1>
        </div>

        {/* ---------- Profile Header ---------- */}
        <div className="sp-card sp-header-card">
          <div className="sp-card-body">
            <div className="sp-photo-wrap">
              {!photoFailed ? (
                <img
                  src={student.photo}
                  alt={student.name}
                  className="sp-photo"
                  onError={() => setPhotoFailed(true)}
                />
              ) : (
                <div className="sp-photo-fallback">
                  {student.name.charAt(0)}
                </div>
              )}
              <span className="sp-status-dot">
                <CheckCircle2 size={11} />
                {student.status}
              </span>
            </div>

            <div className="sp-header-info">
              <h2>{student.name}</h2>
              <span className="sp-header-id">
                <IdCard size={15} />
                Student ID: {student.id}
              </span>
              <div className="sp-header-tags">
                <span className="sp-tag">
                  <GraduationCap size={13} />
                  Class: {student.className}
                </span>
                <span className="sp-tag sp-tag--gold">
                  <Layers size={13} />
                  Group: {student.group}
                </span>
                <span className="sp-tag">
                  <CalendarDays size={13} />
                  Session: {student.session}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ---------- Personal / Academic Information ---------- */}
        <div className="sp-card">
          <div className="sp-card-body">
            <div className="sp-card-heading">
              <User size={17} />
              <h2>Personal Information</h2>
            </div>

            <div className="sp-info-grid">
              <div className="sp-info-row">
                <span className="sp-info-label">
                  <User size={15} />
                  Full Name
                </span>
                <span className="sp-info-value">{student.name}</span>
              </div>

              <div className="sp-info-row">
                <span className="sp-info-label">
                  <IdCard size={15} />
                  Student ID
                </span>
                <span className="sp-info-value">{student.id}</span>
              </div>

              <div className="sp-info-row">
                <span className="sp-info-label">
                  <GraduationCap size={15} />
                  Class
                </span>
                <span className="sp-info-value">{student.className}</span>
              </div>

              <div className="sp-info-row">
                <span className="sp-info-label">
                  <Layers size={15} />
                  Section
                </span>
                <span className="sp-info-value">{student.section}</span>
              </div>

              <div className="sp-info-row">
                <span className="sp-info-label">
                  <Hash size={15} />
                  Roll
                </span>
                <span className="sp-info-value">{student.roll}</span>
              </div>

              <div className="sp-info-row">
                <span className="sp-info-label">
                  <Users size={15} />
                  Group
                </span>
                <span className="sp-info-value">{student.group}</span>
              </div>

              <div className="sp-info-row">
                <span className="sp-info-label">
                  <CalendarDays size={15} />
                  Session
                </span>
                <span className="sp-info-value">{student.session}</span>
              </div>

              <div className="sp-info-row">
                <span className="sp-info-label">
                  <Sun size={15} />
                  Shift
                </span>
                <span className="sp-info-value">{student.shift}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ---------- Admission Tests (table + pagination) ---------- */}
        <div className="sp-card">
          <div className="sp-card-body">
            <div className="sp-card-heading">
              <Award size={17} />
              <h2>Admission Tests</h2>
            </div>

            <div className="sp-table-wrap">
              <table className="sp-table">
                <thead>
                  <tr>
                    <th>Test</th>
                    <th>Date</th>
                    <th>Score</th>
                    <th>Percentage</th>
                    <th>Status</th>
                    <th aria-label="Action" />
                  </tr>
                </thead>
                <tbody>
                  {visibleTests.map((t) => {
                    const passed = t.status.toLowerCase() === "passed";
                    return (
                      <tr key={t.id}>
                        <td className="sp-table-test-name">{t.testName}</td>

                        <td>
                          <span className="sp-table-date">
                            <CalendarDays size={13} />
                            {t.date}
                          </span>
                        </td>

                        <td>
                          {t.obtainedMarks} / {t.totalMarks}
                        </td>

                        <td>
                          <div className="sp-table-pct">
                            <div className="sp-table-pct-track">
                              <div
                                className="sp-table-pct-fill"
                                style={{ width: `${t.percentage}%` }}
                              />
                            </div>
                            <span>{t.percentage}%</span>
                          </div>
                        </td>

                        <td>
                          <span
                            className={`sp-status-badge ${
                              passed ? "sp-status-badge--pass" : "sp-status-badge--fail"
                            }`}
                          >
                            {passed ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                            {t.status}
                          </span>
                        </td>

                        <td>
                          <Link to="/admission/result" className="sp-table-view-link">
                            View
                            <ArrowRight size={13} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="sp-table-footer">
              <span className="sp-table-range">
                Showing {startIdx + 1}–{Math.min(startIdx + TESTS_PER_PAGE, totalTests)} of{" "}
                {totalTests}
              </span>

              <div className="sp-table-pagination">
                <button
                  type="button"
                  className="sp-page-nav-btn"
                  onClick={() => goToPage(page - 1)}
                  disabled={page === 1}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={`sp-page-num ${p === page ? "active" : ""}`}
                    onClick={() => goToPage(p)}
                    aria-current={p === page}
                  >
                    {p}
                  </button>
                ))}

                <button
                  type="button"
                  className="sp-page-nav-btn"
                  onClick={() => goToPage(page + 1)}
                  disabled={page === totalPages}
                  aria-label="Next page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ---------- Quick Actions ---------- */}
        <div className="sp-card">
          <div className="sp-card-body">
            <div className="sp-card-heading">
              <ClipboardList size={17} />
              <h2>Quick Actions</h2>
            </div>

            <div className="sp-actions-grid">
              <Link to="/admission/online" className="sp-action-btn">
                <FileText size={22} />
                Admission Test
              </Link>

              <Link to="/result/individual" className="sp-action-btn">
                <Award size={22} />
                My Results
              </Link>

              <Link to="/student-profile/edit" className="sp-action-btn sp-action-btn--gold">
                <Edit3 size={22} />
                Edit Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
