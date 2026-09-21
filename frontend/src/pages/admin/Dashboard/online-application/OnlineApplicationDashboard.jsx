import { Link } from "react-router-dom";
import {
  ClipboardList,
  FileCheck2,
  GraduationCap,
  FileBarChart,
} from "lucide-react";
import {
  OnlineApplicationNav,
  onlineApplicationMenuItems,
  useOnlineApplicationBase,
} from "./onlineApplicationShared.jsx";

export default function OnlineApplicationDashboard() {
  const base = useOnlineApplicationBase();

  const getIcon = (index) => {
    if (index <= 2) return ClipboardList;
    if (index <= 7) return FileCheck2;
    if (index <= 11) return GraduationCap;
    return FileBarChart;
  };

  return (
    <div className="space-y-5">
      <OnlineApplicationNav />

      <div className="py-2 text-center">
        <h1 className="text-2xl font-black uppercase sm:text-3xl">
          Online Application Dashboard
        </h1>

        <p className="mt-1 text-sm text-base-content/60">
          Manage applications, admission exams, admission results, and
          application reports.
        </p>
      </div>

      <section className="rounded-lg border border-base-300 bg-base-100 p-5 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {onlineApplicationMenuItems.map(([title, slug], index) => {
            const Icon = getIcon(index);

            return (
              <Link key={slug} to={`${base}/${slug}`}>
                <div className="h-full rounded-xl border border-base-300 bg-base-100 p-5 shadow-sm transition hover:-translate-y-1 hover:border-info/40 hover:shadow-md">
                  <Icon size={24} className="text-info" />

                  <h3 className="mt-3 font-black">
                    {title}
                  </h3>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
