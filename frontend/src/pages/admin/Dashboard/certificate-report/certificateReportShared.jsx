import { Link, useLocation } from "react-router-dom";

export const certificateReportMenuItems = [
  ["Give Certificate", "give-certificate"],
  ["Certificate Report", "certificate-report"],
  ["Certificate Settings", "certificate-settings"],
];

export function useCertificateReportBase() {
  const location = useLocation();

  const prefix = location.pathname.startsWith("/admin/dashboard")
    ? "/admin/dashboard"
    : "/dashboard";

  const segment = location.pathname.includes("/14-certificate-report")
    ? "14-certificate-report"
    : "certificate-report";

  return `${prefix}/${segment}`;
}

export function CertificateReportNav() {
  const base = useCertificateReportBase();
  const location = useLocation();

  return (
    <nav
      className="sticky top-[70px] z-20 flex min-h-11 flex-wrap items-center gap-x-5 gap-y-2 border border-slate-200 bg-white px-3 py-2 shadow-sm"
      aria-label="Certificate Report menu"
    >
      <Link
        to={base}
        className="mr-2 whitespace-nowrap text-sm font-black text-blue-700"
      >
        Certificate Report
      </Link>

      {certificateReportMenuItems.map(([label, slug]) => {
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

export function CertificateReportPageShell({
  title,
  children,
  action,
}) {
  return (
    <div className="space-y-5">
      <CertificateReportNav />

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
                Certificate report page is ready for the full workflow.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
