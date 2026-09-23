import { Link } from "react-router-dom";
import { Bell, BookOpen, ClipboardList, CreditCard, Settings, UserPlus, Users } from "lucide-react";

const tabs = {
  academic: [
    ["Courses", "courses"],
    ["Sections", "courses/sections"],
    ["Subjects", "courses/subjects"],
    ["Teacher Assignments", "teacher-assignments"],
  ],
  users: [
    ["Students", "user-management/student"],
    ["Teachers", "user-management/teacher"],
    ["Employees", "user-management/employee"],
    ["Management", "user-management/management"],
  ],
  assessments: [
    ["All", "examination"],
    ["MCQ", "online-application/admission-exam"],
    ["Assignments", "student-work/assignment"],
    ["Exams", "examination/exam-list"],
  ],
  payments: [
    ["Fees Collection", "manage-accounts/fees-collection"],
    ["Fees Category", "manage-accounts/fees-category"],
    ["Expense", "manage-accounts/expense"],
    ["Income", "manage-accounts/income"],
  ],
  settings: [
    ["System Setup", "system-setup"],
    ["Admin Panel", "admin-panel"],
    ["Dynamic Website", "dynamic-website"],
    ["SMS/Mail", "mail-sms-service"],
  ],
};

function rootFromLocation() {
  return window.location.pathname.startsWith("/admin/dashboard") ? "/admin/dashboard" : "/dashboard";
}

function CompactPage({ title, eyebrow, icon: Icon, description, tabKey, actionLabel, actionTo, cards = [], quickActions = [] }) {
  const root = rootFromLocation();
  const localTabs = tabs[tabKey] || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-black uppercase text-emerald-700">{eyebrow}</p>
          <h1 className="text-3xl font-black text-slate-950">{title}</h1>
          <p className="mt-1 max-w-3xl text-sm font-semibold text-slate-500">{description}</p>
        </div>
        {actionLabel && (
          <Link to={`${root}/${actionTo || ""}`} className="btn btn-success btn-sm text-white">
            {actionLabel}
          </Link>
        )}
      </div>

      {localTabs.length > 0 && (
        <nav className="flex flex-wrap gap-2 rounded-md border border-slate-200 bg-white p-2 shadow-sm">
          {localTabs.map(([label, path]) => (
            <Link key={label} to={`${root}/${path}`} className="rounded-md px-3 py-2 text-sm font-black text-slate-800 hover:bg-emerald-50 hover:text-emerald-700">
              {label}
            </Link>
          ))}
        </nav>
      )}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value]) => (
          <article key={label} className="rounded-md border border-emerald-100 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-emerald-50 text-emerald-700"><Icon size={20} /></span>
              <div>
                <p className="text-2xl font-black text-slate-950">{value}</p>
                <p className="text-sm font-bold text-slate-500">{label}</p>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-md border border-base-300 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-black text-slate-950">Overview</h2>
        <p className="mt-2 text-sm font-semibold text-slate-500">
          Use the tabs above to manage the related tools. The sidebar stays compact, while each section keeps its detailed workflow inside this parent destination.
        </p>
        {quickActions.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {quickActions.map(([label, path]) => (
              <Link key={label} to={`${root}/${path}`} className="btn btn-sm border-emerald-100 bg-emerald-50 text-emerald-800 hover:bg-emerald-100">
                {label}
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export function AdminAcademicPage() {
  return <CompactPage title="Academic Management" eyebrow="Admin" icon={BookOpen} description="Create admission/course cards, manage sections and subjects, then assign teachers to courses, admissions, sections, and subjects." tabKey="academic" actionLabel="+ Create Admission / Course" actionTo="courses" cards={[["Active Courses", 12], ["Sections", 18], ["Subjects", 42], ["Teachers", 32]]} quickActions={[["+ Assign Teacher", "teacher-assignments"], ["Manage Sections", "courses/sections"], ["Manage Subjects", "courses/subjects"]]} />;
}

export function AdminUsersPage() {
  return <CompactPage title="Users" eyebrow="Admin" icon={Users} description="Manage students, teachers, employees, and management accounts." tabKey="users" actionLabel="+ Add User" cards={[["Students", 1250], ["Teachers", 32], ["Employees", 14], ["Management", 4]]} />;
}

export function AdminAssessmentsPage() {
  return <CompactPage title="Assessments" eyebrow="Admin" icon={ClipboardList} description="Inspect MCQs, assignments, live tests, and exams with contextual filters." tabKey="assessments" actionLabel="+ Create Assessment" cards={[["All", 64], ["Live", 2], ["Scheduled", 8], ["Completed", 54]]} />;
}

export function AdminEnrollmentsPage() {
  return <CompactPage title="Enrollments" eyebrow="Admin" icon={UserPlus} description="Review admissions, course enrollments, pending requests, and status changes." tabKey="academic" actionLabel="+ New Enrollment" actionTo="course-foundation/enrollments" cards={[["Active", 980], ["Pending", 28], ["This Month", 74], ["Waitlisted", 6]]} quickActions={[["Create Admission Card", "courses"], ["Assign Teacher", "teacher-assignments"]]} />;
}

export function AdminPaymentsPage() {
  return <CompactPage title="Payments" eyebrow="Admin" icon={CreditCard} description="Manage collections, fee categories, expenses, income, and account reports." tabKey="payments" actionLabel="+ Record Payment" actionTo="manage-accounts/fees-collection/fees-collection-create" cards={[["Collected", "৳0"], ["Due", "৳0"], ["Expenses", "৳0"], ["Reports", 4]]} />;
}

export function AdminNotificationsPage() {
  return <CompactPage title="Notifications" eyebrow="Admin" icon={Bell} description="Send and monitor notices, SMS, mail, and platform notifications." tabKey="settings" actionLabel="+ Send Notice" cards={[["Unread", 0], ["Campaigns", 0], ["Templates", 0], ["Contacts", 0]]} />;
}

export function AdminSettingsPage() {
  return <CompactPage title="Settings" eyebrow="Admin" icon={Settings} description="Configure system setup, roles, website settings, and communication options." tabKey="settings" actionLabel="+ Configure" cards={[["Roles", 0], ["Setup Lists", 12], ["Website", 1], ["Security", "On"]]} />;
}
