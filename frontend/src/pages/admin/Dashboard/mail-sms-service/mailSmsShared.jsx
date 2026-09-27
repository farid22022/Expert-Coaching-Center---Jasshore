import { Link, useLocation } from "react-router-dom";

export const mailSmsMenuItems = [
  ["Teacher/Employee SMS List", "manage-hr-sms/teacher-employee-sms-list"],
  ["Teacher/Employee Joining SMS Create", "manage-hr-sms/teacher-employee-joining-sms-create"],
  ["Teacher/Employee Attendance SMS Create", "manage-hr-sms/teacher-employee-attendance-sms-create"],
  ["Teacher/Employee Absent SMS Create", "manage-hr-sms/teacher-employee-absent-sms-create"],
  ["Teacher/Employee Salary SMS Create", "manage-hr-sms/teacher-employee-salary-sms-create"],
  ["Contact Category Create", "contact-category/contact-category-create"],
  ["Contact Category List", "contact-category/contact-category-list"],
  ["Contacts Create", "contacts/contacts-create"],
  ["Contacts List", "contacts/contacts-list"],
  ["SMS API Create", "sms-api/sms-api-create"],
  ["SMS API List", "sms-api/sms-api-list"],
  ["SMS Campaign Create", "sms-campaign/sms-campaign-create"],
  ["SMS Report List", "sms-campaign/sms-report-list"],
  ["SMS Report Search", "sms-campaign/sms-report-search"],
  ["SMS Campaign Organization", "sms-campaign/sms-campaign-organization"],
  ["Student SMS List", "manage-student-sms/student-sms-list"],
  ["Student Admission Online", "manage-student-sms/student-admission-online"],
  ["Student Admission Software", "manage-student-sms/student-admission-software"],
  ["Student Attendance SMS Create", "manage-student-sms/student-attendance-sms-create"],
  ["Student Absent SMS Create", "manage-student-sms/student-absent-sms-create"],
  ["Student Fees Collection SMS Create", "manage-student-sms/student-fees-collection-sms-create"],
  ["Student Due Fees SMS Create", "manage-student-sms/student-due-fees-sms-create"],
  ["Subject Wise Result SMS", "manage-student-sms/subject-wise-result-sms"],
  ["Result SMS", "manage-student-sms/result-sms"],
  ["SMS/Mail Setup", "sms-mail-setup"],
  ["SMS/Mail Template", "sms-mail-template"],
];

export const mailSmsMenuGroups = {
  "manage-hr-sms": {
    title: "Manage HR SMS",
    items: mailSmsMenuItems.filter(([, slug]) =>
      slug.startsWith("manage-hr-sms/")
    ),
  },
  "contact-category": {
    title: "Contact Category",
    items: mailSmsMenuItems.filter(([, slug]) =>
      slug.startsWith("contact-category/")
    ),
  },
  contacts: {
    title: "Contacts",
    items: mailSmsMenuItems.filter(([, slug]) =>
      slug.startsWith("contacts/")
    ),
  },
  "sms-api": {
    title: "SMS API",
    items: mailSmsMenuItems.filter(([, slug]) =>
      slug.startsWith("sms-api/")
    ),
  },
  "sms-campaign": {
    title: "SMS Campaign",
    items: mailSmsMenuItems.filter(([, slug]) =>
      slug.startsWith("sms-campaign/")
    ),
  },
  "manage-student-sms": {
    title: "Manage Student SMS",
    items: mailSmsMenuItems.filter(([, slug]) =>
      slug.startsWith("manage-student-sms/")
    ),
  },
};

export function useMailSmsBase() {
  const location = useLocation();
  const prefix = location.pathname.startsWith("/admin/dashboard")
    ? "/admin/dashboard"
    : "/dashboard";
  const segment = location.pathname.includes("/12-mail-sms-service")
    ? "12-mail-sms-service"
    : "mail-sms-service";

  return `${prefix}/${segment}`;
}

export function MailSmsNav() {
  const base = useMailSmsBase();

  return (
    <nav
      className="sticky top-0 z-20 flex min-h-11 flex-wrap items-center gap-x-5 gap-y-2 border border-slate-200 bg-white px-3 py-2 shadow-sm"
      aria-label="Mail SMS Service menu"
    >
      <Link
        to={base}
        className="mr-2 whitespace-nowrap text-sm font-black text-blue-700"
      >
        Mail SMS Service
      </Link>

      {mailSmsMenuItems.map(([label, slug]) => (
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

export function MailSmsPageShell({ title, children }) {
  return (
    <div className="space-y-5">
      <MailSmsNav />

      <section className="overflow-hidden rounded-lg border border-base-300 bg-base-100 shadow-sm">
        <header className="flex min-h-11 items-center bg-[#476db4] px-5 py-2 text-white">
          <h2 className="text-base font-bold sm:text-lg">{title}</h2>
        </header>

        <div className="p-5">
          {children || (
            <div className="rounded-lg border border-dashed border-blue-200 bg-blue-50/70 p-8 text-center">
              <h1 className="text-2xl font-black text-slate-950">{title}</h1>
              <p className="mx-auto mt-2 max-w-2xl text-sm font-semibold text-slate-600">
                Demo mail and SMS page prepared. Replace this with the full
                workflow when you are ready.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export function MailSmsSectionPage({ group }) {
  const base = useMailSmsBase();
  const section = mailSmsMenuGroups[group];

  if (!section) {
    return <MailSmsPageShell title="Mail SMS Service" />;
  }

  return (
    <MailSmsPageShell title={section.title}>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {section.items.map(([label, slug]) => (
          <Link
            key={slug}
            to={`${base}/${slug}`}
            className="group rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-500 hover:shadow-md"
          >
            <p className="text-sm font-black text-slate-950 transition group-hover:text-emerald-700">
              {label}
            </p>
            <p className="mt-2 text-xs font-semibold text-slate-500">
              Open {label} workflow
            </p>
          </Link>
        ))}
      </div>
    </MailSmsPageShell>
  );
}
