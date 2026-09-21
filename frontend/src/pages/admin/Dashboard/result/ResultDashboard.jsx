import { Link } from "react-router-dom";
import {
  Settings2,
  Calculator,
  FileText,
  Table2,
  GraduationCap,
  Trophy,
  CircleX,
  ListChecks,
  ListX,
  RefreshCcw,
  ArrowUpCircle,
  Send,
  BarChart3,
  UserRoundCheck,
} from "lucide-react";
import {
  ResultNav,
  resultMenuItems,
  useResultBase,
} from "./resultShared.jsx";

const icons = [
  Settings2,
  Calculator,
  FileText,
  Table2,
  GraduationCap,
  Trophy,
  CircleX,
  ListChecks,
  ListX,
  RefreshCcw,
  ArrowUpCircle,
  Send,
  BarChart3,
  UserRoundCheck,
];

export default function ResultDashboard() {
  const base = useResultBase();

  return (
    <div className="space-y-5">
      <ResultNav />

      <div className="py-2 text-center">
        <h1 className="text-2xl font-black uppercase sm:text-3xl">
          Result
        </h1>

        <p className="mt-1 text-sm text-base-content/60">
          Process results, generate reports, publish outcomes, and manage promotions.
        </p>
      </div>

      <section className="rounded-lg border border-base-300 bg-base-100 p-5 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {resultMenuItems.map(([title, slug], index) => {
            const Icon = icons[index] || FileText;

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
