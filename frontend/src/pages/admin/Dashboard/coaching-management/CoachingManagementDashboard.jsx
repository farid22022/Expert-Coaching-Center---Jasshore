import { Link } from "react-router-dom";
import {
  GraduationCap,
  WalletCards,
  ReceiptText,
  Tags,
  BadgeDollarSign,
  HandCoins,
} from "lucide-react";
import {
  CoachingManagementTopNav,
  coachingManagementMenu,
  useCoachingManagementBase,
} from "./coachingManagementShared.jsx";

const icons = [
  GraduationCap,
  WalletCards,
  ReceiptText,
  Tags,
  BadgeDollarSign,
  HandCoins,
];

export default function CoachingManagementDashboard() {
  const base = useCoachingManagementBase();

  return (
    <div className="space-y-5">
      <CoachingManagementTopNav />

      <div className="py-2 text-center">
        <h1 className="text-2xl font-black uppercase sm:text-3xl">
          Coaching Management
        </h1>
        <p className="mt-1 text-sm text-base-content/60">
          Manage coaching students, fees, expenses, and income.
        </p>
      </div>

      <section className="rounded-lg border border-base-300 bg-base-100 p-5 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {coachingManagementMenu.map((group, index) => {
            const Icon = icons[index] || GraduationCap;
            const first = group.children[0]?.[1] || "";

            return (
              <Link
                key={group.slug}
                to={`${base}/${group.slug}/${first}`}
                className="rounded-xl border border-base-300 bg-base-100 p-5 shadow-sm transition hover:-translate-y-1 hover:border-info/40 hover:shadow-md"
              >
                <Icon size={25} className="text-info" />
                <h3 className="mt-3 font-black">{group.label}</h3>
                <p className="mt-1 text-sm text-base-content/60">
                  {group.children.length} menu item{group.children.length > 1 ? "s" : ""}
                </p>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
