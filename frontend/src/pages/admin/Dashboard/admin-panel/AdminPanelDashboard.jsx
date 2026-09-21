import { Link } from "react-router-dom";
import {
  CreditCard,
  CalendarDays,
  Users,
  KeyRound,
  ShieldCheck,
  History,
  UserX,
  RotateCcw,
} from "lucide-react";
import {
  AdminPanelTopNav,
  adminPanelMenuItems,
  useAdminPanelBase,
} from "./adminPanelShared.jsx";

const icons = [
  CreditCard,
  CalendarDays,
  Users,
  KeyRound,
  ShieldCheck,
  History,
  UserX,
  RotateCcw,
];

export default function AdminPanelDashboard() {
  const base = useAdminPanelBase();

  return (
    <div className="space-y-5">
      <AdminPanelTopNav />

      <div className="py-2 text-center">
        <h1 className="text-2xl font-black uppercase sm:text-3xl">
          Admin Panel
        </h1>
        <p className="mt-1 text-sm text-base-content/60">
          Administrative billing, academic-year setup, admins, roles, access, and login history.
        </p>
      </div>

      <section className="rounded-lg border border-base-300 bg-base-100 p-5 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {adminPanelMenuItems.map(([title, slug], index) => {
            const Icon = icons[index] || ShieldCheck;

            return (
              <Link
                key={slug}
                to={`${base}/${slug}`}
                className="rounded-xl border border-base-300 bg-base-100 p-5 shadow-sm transition hover:-translate-y-1 hover:border-info/40 hover:shadow-md"
              >
                <Icon size={25} className="text-info" />
                <h3 className="mt-3 font-black">{title}</h3>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
