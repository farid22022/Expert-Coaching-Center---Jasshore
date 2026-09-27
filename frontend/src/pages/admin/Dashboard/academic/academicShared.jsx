import { Link, useLocation } from "react-router-dom";

export const academicMenuItems = [
  ["Subject Transfer", "subject/subject-transfer"],
  ["Subject Excel Entry", "subject/subject-excel-entry"],
  ["Subject", "subject/subject"],

  ["Class Routine Create", "class-routine/class-routine-create"],
  ["Class Routine", "class-routine/class-routine"],
  ["Class Routine Quick Edit", "class-routine/class-routine-quick-edit"],
  ["Class Routine At A Glance", "class-routine/class-routine-at-a-glance"],

  ["Building List", "building-list"],
  ["Floor List", "floor-list"],
  ["Class Room List", "class-room-list"],
  ["Class Teacher Assign List", "class-teacher-assign-list"],
  ["Subject Combine Create", "subject-combine-create"],
  ["Class", "class"],
  ["Section", "section"],
  ["Syllabus", "syllabus"],
  ["Shift", "shift"],
  ["Student Group", "student-group"],
  ["Student Category", "student-category"],
  ["Academic Setup", "academic-setup"],
];

export const academicMenuGroups = {
  subject: {
    title: "Subject",
    items: academicMenuItems.filter(([, slug]) => slug.startsWith("subject/")),
  },
  "class-routine": {
    title: "Class Routine",
    items: academicMenuItems.filter(([, slug]) =>
      slug.startsWith("class-routine/")
    ),
  },
};

export function useAcademicBase() {
  const location = useLocation();

  const prefix = location.pathname.startsWith("/admin/dashboard")
    ? "/admin/dashboard"
    : "/dashboard";

  const segment = location.pathname.includes("/3-academic")
    ? "3-academic"
    : "academic";

  return `${prefix}/${segment}`;
}

export function AcademicNav() {
  const base = useAcademicBase();

  return (
    <nav
      className="sticky top-0 z-20 flex min-h-11 flex-wrap items-center gap-x-5 gap-y-2 border border-slate-200 bg-white px-3 py-2 shadow-sm"
      aria-label="Academic menu"
    >
      <Link
        to={base}
        className="mr-2 whitespace-nowrap text-sm font-black text-blue-700"
      >
        Academic
      </Link>

      {academicMenuItems.map(([label, slug]) => (
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

export function AcademicPageShell({ title, children }) {
  return (
    <div className="space-y-5">
      <AcademicNav />

      <section className="overflow-hidden rounded-lg border border-base-300 bg-base-100 shadow-sm">
        <header className="flex min-h-11 items-center bg-[#476db4] px-5 py-2 text-white">
          <h2 className="text-base font-bold sm:text-lg">{title}</h2>
        </header>

        <div className="p-5">
          {children || (
            <div className="rounded-lg border border-dashed border-blue-200 bg-blue-50/70 p-8 text-center">
              <h1 className="text-2xl font-black text-slate-950">{title}</h1>

              <p className="mx-auto mt-2 max-w-2xl text-sm font-semibold text-slate-600">
                Academic page prepared. Replace this placeholder with the full
                workflow when you are ready.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export function AcademicSectionPage({ group }) {
  const base = useAcademicBase();
  const section = academicMenuGroups[group];

  if (!section) {
    return <AcademicPageShell title="Academic" />;
  }

  return (
    <AcademicPageShell title={section.title}>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {section.items.map(([label, slug]) => (
          <Link
            key={slug}
            to={`${base}/${slug}`}
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-500 hover:shadow-md"
          >
            <p className="text-sm font-black text-slate-950">{label}</p>
            <p className="mt-2 text-xs font-semibold text-slate-500">
              Open {label} workflow
            </p>
          </Link>
        ))}
      </div>
    </AcademicPageShell>
  );
}
