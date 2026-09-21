import { Link } from "react-router-dom";
import {
  BookOpen,
  CalendarDays,
  Building2,
  GraduationCap,
} from "lucide-react";
import {
  AcademicNav,
  academicMenuItems,
  useAcademicBase,
} from "./academicShared.jsx";

export default function AcademicDashboard() {
  const base = useAcademicBase();

  return (
    <div className="space-y-5">
      <AcademicNav />

      <div className="py-2 text-center">
        <h1 className="text-2xl font-black uppercase sm:text-3xl">
          Academic Dashboard
        </h1>

        <p className="mt-1 text-sm text-base-content/60">
          Manage subjects, class routines, buildings, classes, sections,
          groups, categories, syllabus, shifts, and academic setup.
        </p>
      </div>

      <section className="rounded-lg border border-base-300 bg-base-100 p-5 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {academicMenuItems.map(([title, slug], index) => {
            let Icon = GraduationCap;

            if (index <= 2) Icon = BookOpen;
            else if (index <= 6) Icon = CalendarDays;
            else if (index <= 10) Icon = Building2;

            return (
              <Link key={slug} to={`${base}/${slug}`}>
                <div className="h-full rounded-xl border border-base-300 bg-base-100 p-5 shadow-sm transition hover:-translate-y-1 hover:border-info/40 hover:shadow-md">
                  <Icon size={24} className="text-info" />

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
