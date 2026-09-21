import { Link, useLocation } from "react-router-dom";

export const systemSetupMenu = [
  {
    label: "Leave Category",
    slug: "leave-category",
    children: [
      ["Leave Category Create", "create"],
      ["Leave Category List", "list"],
    ],
  },
  {
    label: "Holiday Category",
    slug: "holiday-category",
    children: [
      ["Holiday Category Create", "create"],
      ["Holiday Category List", "list"],
    ],
  },
  {
    label: "Yearly Holiday",
    slug: "yearly-holiday",
    children: [
      ["Yearly Holiday Create", "create"],
      ["Yearly Holiday List", "list"],
    ],
  },
  {
    label: "Blood Group",
    slug: "blood-group",
    children: [
      ["Blood Group Create", "create"],
      ["Blood Group List", "list"],
    ],
  },
  {
    label: "Designation",
    slug: "designation",
    children: [
      ["Designation Create", "create"],
      ["Designation List", "list"],
    ],
  },
  {
    label: "Religion",
    slug: "religion",
    children: [
      ["Religion Create", "create"],
      ["Religion List", "list"],
    ],
  },
  {
    label: "Gender",
    slug: "gender",
    children: [
      ["Gender Create", "create"],
      ["Gender List", "list"],
    ],
  },
  {
    label: "Education",
    slug: "education",
    children: [
      ["Education Create", "create"],
      ["Education List", "list"],
    ],
  },
  {
    label: "Profession",
    slug: "profession",
    children: [
      ["Profession Create", "create"],
      ["Profession List", "list"],
    ],
  },
  {
    label: "Divisions",
    slug: "divisions",
    children: [
      ["Divisions Create", "create"],
      ["Divisions List", "list"],
    ],
  },
  {
    label: "Districts",
    slug: "districts",
    children: [
      ["Districts Create", "create"],
      ["Districts List", "list"],
    ],
  },
  {
    label: "Upazilas",
    slug: "upazilas",
    children: [
      ["Upazilas Create", "create"],
      ["Upazilas List", "list"],
    ],
  },
];

export function useSystemSetupBase() {
  const location = useLocation();

  const prefix = location.pathname.startsWith("/admin/dashboard")
    ? "/admin/dashboard"
    : "/dashboard";

  const section = location.pathname.includes("/20-system-setup")
    ? "20-system-setup"
    : "system-setup";

  return `${prefix}/${section}`;
}

export function SystemSetupTopNav() {
  const base = useSystemSetupBase();
  const location = useLocation();

  return (
    <nav
      className="sticky top-[70px] z-20 flex min-h-11 flex-wrap items-center gap-2 border border-slate-200 bg-white px-3 py-2 shadow-sm"
      aria-label="System Setup menu"
    >
      <Link to={base} className="mr-2 whitespace-nowrap text-sm font-black text-green-700">
        System Setup
      </Link>

      {systemSetupMenu.map((group) => {
        const active = location.pathname.includes(`/${group.slug}`);

        return (
          <div key={group.slug} className="dropdown dropdown-hover">
            <div
              tabIndex={0}
              role="button"
              className={[
                "btn btn-ghost btn-sm rounded-md px-2",
                active ? "bg-green-50 text-green-700" : "",
              ].join(" ")}
            >
              {group.label}
              <span className="ml-1 text-[10px]">▼</span>
            </div>

            <ul
              tabIndex={0}
              className="menu dropdown-content z-[60] mt-1 w-64 rounded-box border border-base-300 bg-base-100 p-2 shadow-xl"
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

export function SystemSetupPageShell({
  title,
  children,
  action,
  className = "",
}) {
  return (
    <div className="space-y-5">
      <SystemSetupTopNav />

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
        "mx-auto grid max-w-5xl grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-[200px_1fr] md:items-center",
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
      <table className="table table-sm min-w-[850px] border border-base-300">
        <thead className="bg-base-200 text-slate-950">
          <tr>
            {columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          <tr>
            <td
              colSpan={columns.length}
              className="py-8 text-center text-sm text-slate-500"
            >
              {message}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
