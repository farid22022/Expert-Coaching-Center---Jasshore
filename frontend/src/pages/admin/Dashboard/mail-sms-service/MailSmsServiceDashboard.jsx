import { Link } from "react-router-dom";
import { Mail, MessageSquareText } from "lucide-react";
import {
  MailSmsNav,
  mailSmsMenuItems,
  useMailSmsBase,
} from "./mailSmsShared.jsx";

export default function MailSmsServiceDashboard() {
  const base = useMailSmsBase();

  return (
    <div className="space-y-5">
      <MailSmsNav />

      <div className="py-2 text-center">
        <h1 className="text-2xl font-black uppercase sm:text-3xl">
          Mail SMS Service Dashboard
        </h1>
        <p className="mt-1 text-sm text-base-content/60">
          Manage HR SMS, student SMS, contacts, APIs, campaigns, and templates.
        </p>
      </div>

      <section className="rounded-lg border border-base-300 bg-base-100 p-5 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {mailSmsMenuItems.map(([title, slug], index) => {
            const Icon = index < 15 ? MessageSquareText : Mail;

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
