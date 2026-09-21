import { Link, useLocation, useNavigate } from "react-router-dom";
import { FolderKanban } from "lucide-react";
import { useMemo } from "react";
import { dashboardMenu } from "../../AdminDashboard.jsx";

const stripNumber = (label) => label.replace(/^\d+\.\s*/, "");

const dashboardRootFromPath = (pathname) =>
  pathname.startsWith("/admin/dashboard") ? "/admin/dashboard" : "/dashboard";

const toActiveRoot = (path, root) => path.replace(/^\/dashboard/, root);

const normalizeDashboardPath = (pathname, root) => {
  const relativePath = pathname
    .replace(root, "")
    .replace(/^\/+/, "");

  if (!relativePath) return pathname;

  const segments = relativePath.split("/");
  const requestedFirst = segments[0];
  const requestedBare = requestedFirst.replace(/^\d+-/, "");

  // The sidebar stores canonical, numbered module paths such as
  // /dashboard/20-system-setup, while a few older internal links still use
  // /dashboard/system-setup. Canonicalise both forms to the sidebar path
  // instead of stripping the number from an already-correct URL.
  const matchedModule = dashboardMenu.find((item) => {
    const moduleFirst = toActiveRoot(item.path, root)
      .replace(root, "")
      .replace(/^\/+/, "")
      .split("/")[0];

    return (
      moduleFirst === requestedFirst ||
      moduleFirst.replace(/^\d+-/, "") === requestedBare
    );
  });

  if (!matchedModule) return pathname;

  const canonicalFirst = toActiveRoot(matchedModule.path, root)
    .replace(root, "")
    .replace(/^\/+/, "")
    .split("/")[0];

  return `${root}/${[canonicalFirst, ...segments.slice(1)].join("/")}`;
};

const flattenItems = (items) =>
  items.flatMap((item) => [
    item,
    ...(item.children ? flattenItems(item.children) : []),
  ]);

const findCurrentItem = (items, pathname, root) => {
  const normalizedItems = flattenItems(items).map((item) => ({
    ...item,
    activePath: toActiveRoot(item.path, root),
  }));

  return [...normalizedItems]
    .sort((a, b) => b.activePath.length - a.activePath.length)
    .find(
      (item) =>
        pathname === item.activePath || pathname.startsWith(`${item.activePath}/`)
    );
};

const findTopModule = (items, currentItem) => {
  if (!currentItem) return null;

  return items.find(
    (item) =>
      currentItem.path === item.path || currentItem.path.startsWith(`${item.path}/`)
  );
};

const navItemsFor = (items) =>
  items.flatMap((item) =>
    item.children?.length ? navItemsFor(item.children) : [item]
  );

function AdminModuleNav({ module, root }) {
  if (!module?.children?.length) return null;

  const navItems = navItemsFor(module.children);

  return (
    <nav
      className="sticky top-[70px] z-20 flex min-h-11 flex-wrap items-center gap-x-5 gap-y-2 border border-slate-200 bg-white px-3 py-2 shadow-sm"
      aria-label={`${stripNumber(module.label)} menu`}
    >
      <Link
        to={toActiveRoot(module.path, root)}
        className="mr-2 whitespace-nowrap text-sm font-black text-blue-700"
      >
        {stripNumber(module.label)}
      </Link>

      {navItems.map((item) => (
        <Link
          key={item.path}
          to={toActiveRoot(item.path, root)}
          className="inline-flex min-h-9 items-center whitespace-nowrap rounded-md px-2 text-sm font-black text-slate-950 transition-colors hover:bg-blue-50 hover:text-blue-700"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

function TaskGrid({ item, root }) {
  const navigate = useNavigate();
  const children = item?.children || [];

  if (!children.length) return null;

  return (
    <section className="overflow-hidden rounded-lg border border-base-300 bg-base-100 shadow-sm">
      <div className="bg-emerald-700 px-5 py-2.5 text-center text-base font-black text-white">
        Select a Task
      </div>

      <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-2 xl:grid-cols-4">
        {children.map((task) => (
          <button
            key={task.path}
            type="button"
            className="overflow-hidden rounded-lg border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            onClick={() => navigate(toActiveRoot(task.path, root))}
          >
            <div className="flex min-h-20 items-center justify-center gap-3 bg-emerald-600 px-5 text-white">
              <FolderKanban size={25} />
              <strong className="text-3xl font-black">
                {task.children?.length || 1}
              </strong>
            </div>

            <div className="bg-emerald-900 px-4 py-3 text-center text-sm font-black text-white">
              {task.label}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

function DemoPanel({ title }) {
  return (
    <section className="overflow-hidden rounded-lg border border-base-300 bg-base-100 shadow-sm">
      <div className="bg-emerald-700 px-5 py-2.5 text-base font-black text-white">
        {title}
      </div>

      <div className="p-6">
        <div className="rounded-lg border border-dashed border-emerald-200 bg-emerald-50/70 p-8 text-center">
          <h2 className="text-2xl font-black text-emerald-950">{title}</h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm font-semibold text-slate-600">
            Demo admin page prepared for this module. You can replace this file
            later with a full CRUD page like the User Management sections.
          </p>
        </div>
      </div>
    </section>
  );
}

export default function AdminModulePage() {
  const location = useLocation();
  const root = dashboardRootFromPath(location.pathname);
  const normalizedPath = normalizeDashboardPath(location.pathname, root);

  const { module, currentItem } = useMemo(() => {
    const current = findCurrentItem(dashboardMenu, normalizedPath, root);

    return {
      currentItem: current,
      module: findTopModule(dashboardMenu, current),
    };
  }, [normalizedPath, root]);

  c