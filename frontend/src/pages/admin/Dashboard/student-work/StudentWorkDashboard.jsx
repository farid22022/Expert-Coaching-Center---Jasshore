import { Link } from "react-router-dom";
import {
  NotebookTabs,
  ClipboardList,
  House,
} from "lucide-react";
import {
  StudentWorkTopNav,
  studentWorkMenu,
  useStudentWorkBase,
} from "./studentWorkShared.jsx";

const icons = [NotebookTabs, ClipboardList, House];

export default function StudentWorkDashboard() {
  const base = useStudentWorkBase();

  return (
    <div className="space-y-5">
      <StudentWorkTopNav />

      <div className="py-2 text-center">
        <h1 className="text-2xl font-black uppercase sm:text-3xl">
          Student Work
        </h1>
        <p className="mt-1 text-sm text-base-content/60">
          Manage class work, assignments, and home work.
        </p>
      </div>

      <section className="rounded-lg border border-base-300 bg-base-100 p-5 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {studentWorkMenu.map((group, index) => {
            const Icon = icons[index] || NotebookTabs;

            return (
              <Link
                key={group.slug}
                to={`${base}/${group.slug}/${group.children[0][1]}`}
                className="rounded-xl border border-base-300 bg-base-100 p-5 shadow-sm transition hover:-translate-y-1 hover:border-info/40 hover:shadow-md"
              >
                <Icon size={26} className="text-info" />
                <h3 className="mt-3 font-black">{group.label}</h3>
                <p className="mt-1 text-sm text-base-content/60">
                  {group.children.length} page{group.children.length > 1 ? "s" : ""}
                </p>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
