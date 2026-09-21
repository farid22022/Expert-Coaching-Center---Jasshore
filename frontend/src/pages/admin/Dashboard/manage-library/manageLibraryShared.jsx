import { Link, useLocation } from "react-router-dom";

export const manageLibraryMenuItems = [
  ["Publisher Create", "publisher/publisher-create"],
  ["Publisher List", "publisher/publisher-list"],
  ["Author Create", "author/author-create"],
  ["Author List", "author/author-list"],
  ["Book Category Create", "book-category/book-category-create"],
  ["Book Category List", "book-category/book-category-list"],
  ["Book Create", "book/book-create"],
  ["Book List", "book/book-list"],
  ["Book Issue Create", "book-issue/book-issue-create"],
  ["Book Issue List", "book-issue/book-issue-list"],
  ["Book Return", "book-return"],
  ["Book Returned List", "book-returned-list"],
];

export function useManageLibraryBase() {
  const location = useLocation();
  const prefix = location.pathname.startsWith("/admin/dashboard")
    ? "/admin/dashboard"
    : "/dashboard";
  const segment = location.pathname.includes("/13-manage-library")
    ? "13-manage-library"
    : "manage-library";

  return `${prefix}/${segment}`;
}

export function ManageLibraryNav() {
  const base = useManageLibraryBase();

  return (
    <nav
      className="sticky top-[70px] z-20 flex min-h-11 flex-wrap items-center gap-x-5 gap-y-2 border border-slate-200 bg-white px-3 py-2 shadow-sm"
      aria-label="Manage Library menu"
    >
      <Link
        to={base}
        className="mr-2 whitespace-nowrap text-sm font-black text-blue-700"
      >
        Manage Library
      </Link>

      {manageLibraryMenuItems.map(([label, slug]) => (
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

export function ManageLibraryPageShell({ title, children }) {
  return (
    <div className="space-y-5">
      <ManageLibraryNav />

      <section className="overflow-hidden rounded-lg border border-base-300 bg-base-100 shadow-sm">
        <header className="flex min-h-11 items-center bg-[#476db4] px-5 py-2 text-white">
          <h2 className="text-base font-bold sm:text-lg">{title}</h2>
        </header>

        <div className="p-5">
          {children || (
            <div className="rounded-lg border border-dashed border-blue-200 bg-blue-50/70 p-8 text-center">
              <h1 className="text-2xl font-black text-slate-950">{title}</h1>
              <p className="mx-auto mt-2 max-w-2xl text-sm font-semibold text-slate-600">
                Demo library management page prepared. Replace this with the full
                workflow when you are ready.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
