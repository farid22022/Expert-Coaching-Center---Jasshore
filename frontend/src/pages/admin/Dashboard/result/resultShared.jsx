import { Link, useLocation } from "react-router-dom";

export const resultMenuItems = [
  ["Result Position Setup", "result-position-setup"],
  ["Result Process", "result-process"],
  ["Mark Sheet", "mark-sheet"],
  ["Tabulation Sheet", "tabulation-sheet"],
  ["Grade Sheet Report", "grade-sheet-report"],
  ["Merit List", "merit-list"],
  ["Fail Report", "fail-report"],
  ["Subject Wise Result", "subject-wise-result"],
  ["Subject Wise Fail Report", "subject-wise-fail-report"],
  ["Exam Wise Roll Update", "exam-wise-roll-update"],
  ["Promotion", "promotion"],
  ["Result Publish", "result-publish"],
  ["Exam Result Summary", "exam-result-summary"],
  ["Student Result Summary", "student-result-summary"],
];

export function useResultBase() {
  const location = useLocation();

  const prefix = location.pathname.startsWith("/admin/dashboard")
    ? "/admin/dashboard"
    : "/dashboard";

  const segment = location.pathname.includes("/7-result")
    ? "7-result"
    : "result";

  return `${prefix}/${segment}`;
}

export function ResultNav() {
  const base = useResultBase();
  const location = useLocation();

  return (
    <nav
      className="sticky top-[70px] z-20 flex min-h-11 flex-wrap items-center gap-x-4 gap-y-2 border border-slate-200 bg-white px-3 py-2 shadow-sm"
      aria-label="Result menu"
    >
      <Link
        to={base}
        className="mr-2 whitespace-nowrap text-sm font-black text-blue-700"
      >
        Result
      </Link>

      {resultMenuItems.map(([label, slug]) => {
        const path = `${base}/${slug}`;
        const active = location.pathname === path;

        return (
          <Link
            key={slug}
            to={path}
            className={[
              "inline-flex min-h-9 items-center whitespace-nowrap rounded-md px-2 text-sm font-black transition-colors",
              active
                ? "bg-blue-50 text-blue-700"
                : "text-slate-950 hover:bg-blue-50 hover:text-blue-700",
            ].join(" ")}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function ResultPageShell({
  title,
  children,
  action,
}) {
  return (
    <div className="space-y-5">
      <ResultNav />

      <section className="overflow-hidden rounded-lg border border-base-300 bg-base-100 shadow-sm">
        <header className="flex min-h-11 flex-wrap items-center justify-between gap-3 bg-[#476db4] px-5 py-2 text-white">
          <h2 className="text-base font-bold sm:text-lg">{title}</h2>
          {action}
        </header>

        <div className="p-5">
          {children || (
            <div className="rounded-lg border border-dashed border-blue-200 bg-blue-50/70 p-8 text-center">
              <h1 className="text-2xl font-black text-slate-950">{title}</h1>
              <p className="mx-auto mt-2 max-w-2xl text-sm font-semibold text-slate-600">
                Result module page prepared for your dashboard.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
