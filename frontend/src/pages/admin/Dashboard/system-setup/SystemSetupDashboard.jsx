import { Link } from "react-router-dom";
import {
  CalendarClock,
  CalendarDays,
  CalendarRange,
  Droplets,
  BadgeCheck,
  Church,
  VenusAndMars,
  GraduationCap,
  BriefcaseBusiness,
  MapPinned,
  Map,
  MapPin,
} from "lucide-react";
import {
  SystemSetupTopNav,
  systemSetupMenu,
  useSystemSetupBase,
} from "./systemSetupShared.jsx";

const icons = [
  CalendarClock,
  CalendarDays,
  CalendarRange,
  Droplets,
  BadgeCheck,
  Church,
  VenusAndMars,
  GraduationCap,
  BriefcaseBusiness,
  MapPinned,
  Map,
  MapPin,
];

export default function SystemSetupDashboard() {
  const base = useSystemSetupBase();

  return (
    <div className="space-y-5">
      <SystemSetupTopNav />

      <div className="py-2 text-center">
        <h1 className="text-2xl font-black uppercase sm:text-3xl">
          System Setup
        </h1>
        <p className="mt-1 text-sm text-base-content/60">
          Configure reusable categories, personal data options, and address hierarchy.
        </p>
      </div>

      <section className="rounded-lg border border-base-300 bg-base-100 p-5 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {systemSetupMenu.map((group, index) => {
            const Icon = icons[index] || BadgeCheck;

            return (
              <Link
                key={group.slug}
                to={`${base}/${group.slug}/list`}
                className="rounded-xl border border-base-300 bg-base-100 p-5 shadow-sm transition hover:-translate-y-1 hover:border-success/40 hover:shadow-md"
              >
                <Icon size={25} className="text-success" />
                <h3 className="mt-3 font-black">{group.label}</h3>
                <p className="mt-1 text-sm text-base-content/60">
                  Create and manage {group.label.toLowerCase()}.
                </p>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
