import { Link, useLocation } from "react-router-dom";

export const adminPanelMenuItems = [
  ["Pay Bill", "pay-bill"],
  ["Academic Year", "academic-year"],
  ["Admin List", "admin-list"],
  ["Reset Password", "reset-password"],
  ["Role", "role"],
  ["User Login History", "user-login-history"],
  ["Admin Disable", "admin-disable"],
  ["Admin Restore", "admin-restore"],
];

export function useAdminPanelBase() {
  const location = useLocation();

  const prefix = location.pathname.startsWith("/admin/dashboard")
    ? "/admin/dashboard"
    : "/dashboard";

  const section = location.pathname.includes("/18-admin-panel")
    ? "18-admin-panel"
    : "admin-panel";

  return `${prefix}/${section}`;
}

export function AdminPanelTopNav() {
  const base = useAdminPanelBase();
  const location = useLocation();

  return (
    <nav
      className="sticky top-[70px] z-20 flex min-h-11 flex-wrap items-center gap-x-3 gap-y-2 border border-slate-200 bg-white px-3 py-2 shadow-sm"
      aria-label="Admin Panel menu"
    >
      <Link
        to={base}
        className="mr-2 whitespace-nowrap text-sm font-black text-blue-700"
      >
        Admin Panel
      </Link>

      {adminPanelMenuItems.map(([label, slug]) => {
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

export function AdminPanelPageShell({
  title,
  children,
  action,
  className = "",
}) {
  return (
    <div className="space-y-5">
      <AdminPanelTopNav />

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

export function EmptyTable({ columns, message = "No data available." }) {
  return (
    <div className="overflow-x-auto">
      <table className="table table-sm min-w-[900px] border border-base-300">
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

export function ButtonRow({ children, className = "" }) {
  return (
    <div className={["flex flex-wrap gap-2", className].join(" ")}>
      {children}
    </div>
  );
}
