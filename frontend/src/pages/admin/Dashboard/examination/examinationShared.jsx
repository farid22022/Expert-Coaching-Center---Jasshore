import { Link, useLocation } from "react-router-dom";

export const examinationMenuItems = [
  ["Marks Distribution Excel Entry", "marks-configure/marks-distribution-excel-entry"],
  ["Manage Marks Distribution", "marks-configure/manage-marks-distribution"],
  ["Marks Distribution", "marks-configure/marks-distribution"],
  ["Grade", "grade/grade"],
  ["Grade Transfer", "grade/grade-transfer"],
  ["Signature Sheet", "signature-sheet"],
  ["Exam List", "exam-list"],
  ["Exam Routine", "exam-routine"],
  ["Exam Routine Edit", "exam-routine-edit"],
  ["Admit Card Report", "admit-card-report"],
  ["Seat Plan", "seat-plan"],
  ["Seat Plan Report", "seat-plan-report"],
  ["Teacher Exam Subject Assign", "teacher-exam-subject-assign"],
];

export function useExaminationBase() {
  const location = useLocation();
  const prefix = location.pathname.startsWith("/admin/dashboard")
    ? "/admin/dashboard"
    : "/dashboard";
  const segment = location.pathname.includes("/5-examination")
    ? "5-examination"
    : "examination";

  return `${prefix}/${segment}`;
}

export function ExaminationNav() {
  const base = useExaminationBase();

  return (
    <nav
      className="sticky top-[70px] z-20 flex min-h-11 flex-wrap items-center gap-x-5 gap-y-2 border border-slate-200 bg-white px-3 py-2 shadow-sm"
      aria-label="Examination menu"
    >
      <Link
        to={base}
        className="mr-2 whitespace-nowrap text-sm font-black text-blue-700"
      >
        Examination
      </Link>

      {examinationMenuItems.map(([label, slug]) => (
        <Link
          key={slug}
          to={`${base}/${slug}`}
          className="inline-flex min-h-9 items-center whitespace-nowrap rounded-md px-2 text-sm font-black text-slate-950 transition-colors hover:bg-blue-50 hover:text-blue-700"
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}

export function ExaminationPageShell({ title, children }) {
  return (
    <div className="space-y-5">
      <ExaminationNav />

      <section className="overflow-hidden rounded-lg border border-base-300 bg-base-100 shadow-sm">
        <header className="flex min-h-11 items-center bg-[#476db4] px-5 py-2 text-white">
          <h2 className="text-base font-bold sm:text-lg">{title}</h2>
        </header>

        <div className="p-5">
          {children || (
            <div className="rounded-lg border border-dashed border-blue-200 bg-blue-50/70 p-8 text-center">
              <h1 className="text-2xl font-black text-slate-950">{title}</h1>
              <p className="mx-auto mt-2 max-w-2xl text-sm font-semibold text-slate-600">
                Demo examination page prepared. Replace this with the full
                workflow when you are ready.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
