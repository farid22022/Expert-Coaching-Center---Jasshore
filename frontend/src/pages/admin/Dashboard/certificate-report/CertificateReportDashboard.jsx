import { Link } from "react-router-dom";
import { Award, FileText, Settings2 } from "lucide-react";
import {
  CertificateReportNav,
  certificateReportMenuItems,
  useCertificateReportBase,
} from "./certificateReportShared.jsx";

const icons = [Award, FileText, Settings2];

export default function CertificateReportDashboard() {
  const base = useCertificateReportBase();

  return (
    <div className="space-y-5">
      <CertificateReportNav />

      <div className="py-2 text-center">
        <h1 className="text-2xl font-black uppercase sm:text-3xl">
          Certificate Report
        </h1>
        <p className="mt-1 text-sm text-base-content/60">
          Create certificates, review certificate reports, and manage certificate settings.
        </p>
      </div>

      <section className="rounded-lg border border-base-300 bg-base-100 p-5 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {certificateReportMenuItems.map(([title, slug], index) => {
            const Icon = icons[index] || FileText;

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
