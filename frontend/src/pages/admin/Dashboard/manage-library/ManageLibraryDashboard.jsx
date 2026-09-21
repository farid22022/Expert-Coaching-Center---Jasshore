import { Link } from "react-router-dom";
import { BookOpen, LibraryBig } from "lucide-react";
import {
  ManageLibraryNav,
  manageLibraryMenuItems,
  useManageLibraryBase,
} from "./manageLibraryShared.jsx";

export default function ManageLibraryDashboard() {
  const base = useManageLibraryBase();

  return (
    <div className="space-y-5">
      <ManageLibraryNav />

      <div className="py-2 text-center">
        <h1 className="text-2xl font-black uppercase sm:text-3xl">
          Manage Library Dashboard
        </h1>
        <p className="mt-1 text-sm text-base-content/60">
          Manage publishers, authors, book categories, books, issue, and return workflows.
        </p>
      </div>

      <section className="rounded-lg border border-base-300 bg-base-100 p-5 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {manageLibraryMenuItems.map(([title, slug], index) => {
            const Icon = index < 8 ? BookOpen : LibraryBig;

            return (
              <Link key={slug} to={`${base}/${slug}`}>
                <div className="h-full rounded-xl border border-base-300 bg-base-100 p-5 shadow-sm transition hover:-translate-y-1 hover:border-success/40 hover:shadow-md">
                  <Icon size={24} className="text-success" />
                  <h3 className="mt-3 font-black">{title}</h3>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
