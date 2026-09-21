import { Link, useLocation } from "react-router-dom";

export const onlineApplicationMenuItems = [
  ["Application List", "application/application-list"],
  ["Pending List", "application/pending-list"],
  ["Form Setting", "application/form-setting"],

  ["Mark Configure", "admission-exam/mark-configure"],
  ["Add Mark", "admission-exam/add-mark"],
  ["Delete Marks", "admission-exam/delete-marks"],
  ["Update Mark", "admission-exam/update-mark"],
  ["Seat Plan", "admission-exam/seat-plan"],

  ["Result Process", "admission-result/result-process"],
  ["Tabulation Sheet", "admission-result/tabulation-sheet"],
  ["Promoted List", "admission-result/promoted-list"],
  ["Subject Wise Result", "admission-result/subject-wise-result"],

  ["Fees Report", "application-report/fees-report"],
  ["Application Report", "application-report/application-report"],
  ["Amount Collected", "application-report/amount-collected"],
];

export function useOnlineApplicationBase() {
  const location = useLocation();

  const prefix = location.pathname.startsWith("/admin/dashboard")
    ? "/admin/dashboard"
    : "/dashboard";

  const segment = location.pathname.includes("/2-online-application")
    ? "2-online-application"
    : "online-application";

  return `${prefix}/${segment}`;
}

export function OnlineApplicationNav() {
  const base = useOnlineApplicationBase();

  return (
    <nav
      className="sticky top-[70px] z-20 flex min-h-11 flex-wrap items-center gap-x-5 gap-y-2 border border-slate-200 bg-white px-3 py-2 shadow-sm"
      aria-label="Online Application menu"
    >
      <Link
        to={base}
        className="mr-2 whitespace-nowrap text-sm font-black text-blue-700"
      >
        Online Application
      </Link>

      {onlineApplicationMenuItems.map(([label, slug]) => (
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

export function OnlineApplicationPageShell({ title, children }) {
  return (
    <div className="space-y-5">
      <OnlineApplicationNav />

      <section className="overflow-hidden rounded-lg border border-base-300 bg-base-100 shadow-sm">
        <header className="flex min-h-11 items-center bg-[#476db4] px-5 py-2 text-white">
          <h2 className="text-base font-bold sm:text-lg">{title}</h2>
        </header>

        <div className="p-5">
          {children || (
            <div className="rounded-lg border border-dashed border-blue-200 bg-blue-50/70 p-8 text-center">
              <h1 className="text-2xl font-black text-slate-950">{title}</h1>

              <p className="mx-auto mt-2 max-w-2xl text-sm font-semibold text-slate-600">
                Demo online application page prepared. Replace this with the
                full workflow when you are ready.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
