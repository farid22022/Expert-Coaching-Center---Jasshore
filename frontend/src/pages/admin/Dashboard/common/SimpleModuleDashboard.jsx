import { Link, useLocation } from "react-router-dom";
import { FolderKanban } from "lucide-react";
import { dashboardMenu } from "../../AdminDashboard.jsx";

const stripNumber = (label) => label.replace(/^\d+\.\s*/, "");

const flattenLeaves = (items) =>
  items.flatMap((item) =>
    item.children?.length ? flattenLeaves(item.children) : [item]
  );

const rootFromPath = (pathname) =>
  pathname.startsWith("/admin/dashboard") ? "/admin/dashboard" : "/dashboard";

const toRootPath = (path, root) => path.replace(/^\/dashboard/, root);

const findModule = (moduleLabel) =>
  dashboardMenu.find((item) => stripNumber(item.label) === moduleLabel);

export default function SimpleModuleDashboard({
  moduleLabel,
  description,
}) {
  const location = useLocation();
  const root = rootFromPath(location.pathname);
  const module = findModule(moduleLabel);
  const leaves = flattenLeaves(module?.children || []);

  return (
    <div className="space-y-5">
      <nav
        className="sticky top-0 z-20 flex min-h-11 flex-wrap items-center gap-x-5 gap-y-2 border border-slate-200 bg-white px-3 py-2 shadow-sm"
        aria-label={`${moduleLabel} menu`}
      >
        <Link
          to={module ? toRootPath(module.path, root) : "#"}
          className="mr-2 whitespace-nowrap text-sm font-black text-blue-700"
        >
          {moduleLabel}
        </Link>

        {leaves.map((item) => (
          <Link
            key={item.path}
            to={toRootPath(item.path, root)}
            className="inline-flex min-h-9 items-center whitespace-nowrap rounded-md px-2 text-sm font-black text-slate-950 transition-colors hover:bg-blue-50 hover:text-blue-700"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="py-2 text-center">
        <h1 className="text-2xl font-black uppercase sm:text-3xl">
          {moduleLabel} Dashboard
        </h1>
        <p className="mt-1 text-sm text-base-content/60">
          {description}
        </p>
      </div>

      <section className="rounded-lg border border-base-300 bg-base-100 p-5 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {leaves.map((item) => (
            <Link key={item.path} to={toRootPath(item.path, root)}>
              <div className="h-full rounded-xl border border-base-300 bg-base-100 p-5 shadow-sm transition hover:-translate-y-1 hover:border-success/40 hover:shadow-md">
                <FolderKanban size={24} className="text-success" />
                <h3 className="mt-3 font-black">{item.label}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
