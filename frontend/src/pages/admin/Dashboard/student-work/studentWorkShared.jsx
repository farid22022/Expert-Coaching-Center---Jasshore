import { Link, useLocation } from "react-router-dom";

export const studentWorkMenu = [
  {
    label: "Class Work",
    slug: "class-work",
    children: [
      ["Class Work Create", "create"],
      ["Class Work List", "list"],
    ],
  },
  {
    label: "Assignment",
    slug: "assignment",
    children: [
      ["Assignment Create", "create"],
      ["Assignment List", "list"],
    ],
  },
  {
    label: "Home Work",
    slug: "home-work",
    children: [
      ["Home Work Create", "create"],
      ["Home Work List", "list"],
      ["Home Work At A Glance", "at-a-glance"],
    ],
  },
];

export function useStudentWorkBase() {
  const location = useLocation();

  const prefix = location.pathname.startsWith("/admin/dashboard")
    ? "/admin/dashboard"
    : "/dashboard";

  return `${prefix}/student-work`;
}

export function StudentWorkTopNav() {
  const base = useStudentWorkBase();
  const location = useLocation();

  return (
    <nav
      className="sticky top-[70px] z-20 flex min-h-11 flex-wrap items-center gap-2 border border-slate-200 bg-white px-3 py-2 shadow-sm"
      aria-label="Student Work menu"
    >
      <Link
        to={base}
        className="mr-2 whitespace-nowrap text-sm font-black text-blue-700"
      >
        Student Work
      </Link>

      {studentWorkMenu.map((group) => {
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

export function StudentWorkPageShell({
  title,
  children,
  action,
  className = "",
}) {
  return (
    <div className="space-y-5">
      <StudentWorkTopNav />

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
        "mx-auto grid max-w-6xl grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-[180px_1fr_180px_1fr] md:items-center",
        className,
      ].join(" ")}
    >
      {children}
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

export function EmptyTable({
  columns,
  message = "No data available.",
  minWidth = "900px",
}) {
  return (
    <div className="overflow-x-auto">
      <table
        className="table table-sm border border-base-300"
        style={{ minWidth }}
      >
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

export function CommonAcademicFilters() {
  return (
    <FormGrid>
      <Field label="Session Year:">
        <select className={selectClass} defaultValue="2026">
          <option>2026</option>
          <option>2025</option>
        </select>
      </Field>

      <Field label="School Shift:">
        <select className={selectClass} defaultValue="">
          <option value="">Select Shift</option>
          <option>Morning</option>
          <option>Day</option>
        </select>
      </Field>

      <Field label="Class:">
        <select className={selectClass} defaultValue="">
          <option value="">Select Class</option>
          <option>Class 09</option>
          <option>Class 10</option>
        </select>
      </Field>

      <Field label="Section:">
        <select className={selectClass} defaultValue="">
          <option value="">Select Section</option>
          <option>A</option>
          <option>Day</option>
        </select>
      </Field>

      <Field label="Subject:">
        <select className={selectClass} defaultValue="">
          <option value="">Select Subject</option>
          <option>Bangla</option>
          <option>English</option>
          <option>Mathematics</option>
        </select>
      </Field>

      <Field label="Teacher:">
        <select className={selectClass} defaultValue="">
          <option value="">Select Teacher</option>
        </select>
      </Field>
    </FormGrid>
  );
}
