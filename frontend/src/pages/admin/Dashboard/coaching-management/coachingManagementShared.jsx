import { Link, useLocation } from "react-router-dom";

export const coachingManagementMenu = [
  {
    label: "Coaching Student",
    slug: "coaching-student",
    children: [
      ["Coaching Student Auto Enroll", "auto-enroll"],
      ["Coaching Student Create", "create"],
      ["Coaching Student List", "list"],
    ],
  },
  {
    label: "Coaching Fee",
    slug: "coaching-fee",
    children: [
      ["Coaching Fee Create", "create"],
      ["Coaching Fee List", "list"],
      ["Coaching Fee Dues", "dues"],
      ["Fees Collection Summary", "fees-collection-summary"],
      ["Income Statement", "income-statement"],
      ["Payment History", "payment-history"],
      ["Fee Setup", "fee-setup"],
    ],
  },
  {
    label: "CMS Expense",
    slug: "cms-expense",
    children: [
      ["CMS Expense Create", "create"],
      ["CMS Expense List", "list"],
      ["CMS Expense Report", "report"],
    ],
  },
  {
    label: "CMS Expense Category",
    slug: "cms-expense-category",
    children: [
      ["CMS Expense Category Create", "create"],
      ["CMS Expense Category List", "list"],
    ],
  },
  {
    label: "Cms Income Category",
    slug: "cms-income-category",
    children: [
      ["Cms Income Category Create", "create"],
      ["Cms Income Category List", "list"],
    ],
  },
  {
    label: "Cms Income",
    slug: "cms-income",
    children: [
      ["Cms Income Create", "create"],
      ["Cms Income List", "list"],
    ],
  },
];

export function useCoachingManagementBase() {
  const location = useLocation();
  const prefix = location.pathname.startsWith("/admin/dashboard")
    ? "/admin/dashboard"
    : "/dashboard";

  const section = location.pathname.includes("/17-coaching-management")
    ? "17-coaching-management"
    : "coaching-management";

  return `${prefix}/${section}`;
}

export function CoachingManagementTopNav() {
  const base = useCoachingManagementBase();
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-20 flex min-h-11 flex-wrap items-center gap-2 border border-slate-200 bg-white px-3 py-2 shadow-sm">
      <Link to={base} className="mr-2 text-sm font-black text-blue-700">
        Coaching Management
      </Link>

      {coachingManagementMenu.map((group) => {
        const active = location.pathname.includes(`/${group.slug}`);
        return (
          <div key={group.slug} className="dropdown dropdown-hover">
            <div
              tabIndex={0}
              role="button"
              className={[
                "btn btn-ghost btn-sm rounded-md px-2",
                active ? "bg-blue-50 text-blue-700" : "",
              ].join(" ")}
            >
              {group.label}
              <span className="ml-1 text-[10px]">▼</span>
            </div>

            <ul
              tabIndex={0}
              className="menu dropdown-content z-[60] mt-1 w-72 rounded-box border border-base-300 bg-base-100 p-2 shadow-xl"
            >
              {group.children.map(([label, slug]) => {
                const path = `${base}/${group.slug}/${slug}`;
                return (
                  <li key={slug}>
                    <Link
                      to={path}
                      className={location.pathname === path ? "active" : ""}
                    >
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}

export function CoachingPageShell({
  title,
  children,
  action,
  className = "",
}) {
  return (
    <div className="space-y-5">
      <CoachingManagementTopNav />

      <section
        className={[
          "overflow-hidden rounded-lg border border-base-300 bg-base-100 shadow-sm",
          className,
        ].join(" ")}
      >
        <header className="flex min-h-11 flex-wrap items-center justify-between gap-3 bg-[#476db4] px-5 py-2 text-white">
          <h2 className="text-base font-bold sm:text-lg">{title}</h2>
          {action}
        </header>

        <div className="p-5">{children}</div>
      </section>
    </div>
  );
}

export function CoachingSectionPage({ groupSlug }) {
  const base = useCoachingManagementBase();
  const group = coachingManagementMenu.find((item) => item.slug === groupSlug);

  if (!group) {
    return (
      <CoachingPageShell title="Coaching Management">
        <p className="text-sm font-semibold text-slate-600">
          Select a coaching management section from the menu.
        </p>
      </CoachingPageShell>
    );
  }

  return (
    <CoachingPageShell title={group.label}>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {group.children.map(([label, slug]) => (
          <Link
            key={slug}
            to={`${base}/${group.slug}/${slug}`}
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-500 hover:shadow-md"
          >
            <p className="text-sm font-black text-slate-950">{label}</p>
            <p className="mt-2 text-xs font-semibold text-slate-500">
              Open {label} workflow
            </p>
          </Link>
        ))}
      </div>
    </CoachingPageShell>
  );
}

export const inputClass =
  "input input-bordered input-sm h-9 min-h-9 w-full rounded border-slate-300 bg-white text-sm";
export const selectClass =
  "select select-bordered select-sm h-9 min-h-9 w-full rounded border-slate-300 bg-white text-sm";
export const textareaClass =
  "textarea textarea-bordered min-h-24 w-full rounded border-slate-300 bg-white text-sm";
export const labelClass = "text-sm font-bold text-slate-900";

export function RequiredNotice() {
  return (
    <div className="rounded border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-bold text-red-500">
      (*) field required
    </div>
  );
}

export function Field({ label, required = false, children }) {
  return (
    <>
      <label className={labelClass}>
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <div>{children}</div>
    </>
  );
}

export function FormGrid({ children, className = "" }) {
  return (
    <div
      className={[
        "mx-auto grid max-w-6xl grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-[180px_1fr_180px_1fr] md:items-center",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

export function EmptyTable({ columns, message = "No data available." }) {
  return (
    <div className="overflow-x-auto">
      <table className="table table-sm min-w-[900px] border border-base-300">
        <thead className="bg-base-200 text-slate-950">
          <tr>
            {columns.map((col) => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={columns.length} className="py-8 text-center text-sm text-slate-500">
              {message}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export function ButtonRow({ children, className = "" }) {
  return (
    <div className={["flex flex-wrap gap-2", className].join(" ")}>
      {children}
    </div>
  );
}
