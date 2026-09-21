import { Link } from "react-router-dom";
import {
  FileBarChart,
  UserX,
  Users,
  School,
} from "lucide-react";
import {
  AllReportsNav,
  allReportsMenuItems,
  useAllReportsBase,
} from "./allReportsShared.jsx";

const icons = [
  FileBarChart,
  UserX,
  Users,
  School,
];

export default function AllReportsDashboard() {
  const base = useAllReportsBase();

  return (
    <div className="space-y-5">
      <AllReportsNav />

      <div className="py-2 text-center">
        <h1 className="text-2xl font-black uppercase sm:text-3xl">
          All Reports
        </h1>

        <p className="mt-1 text-sm text-base-content/60">
          Generate student reports, manage inactive students, and review class summaries.
        </p>
      </div>

      <section className="rounded-lg border border-base-300 bg-base-100 p-5 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {allReportsMenuItems.map(([title, slug], index) => {
            const Icon = icons[index] || FileBarChart;

            return (
              <Link
                key={slug}
                to={`${base}/${slug}`}
                className="rounded-xl border border-base-300 bg-base-100 p-5 shadow-sm transition hover:-translate-y-1 hover:border-info/40 hover:shadow-md"
              >
                <Icon size={24} className="text-info" />
                <h3 className="mt-3 font-black">{title}</h3>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
