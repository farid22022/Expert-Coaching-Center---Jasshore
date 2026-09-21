import { Link } from "react-router-dom";
import { BookOpen, ClipboardList, GraduationCap, Megaphone, Users } from "lucide-react";
import SEO from "../../components/common/SEO.jsx";
import { students, teachers, notices, routines, examRoutine } from "../../data/mockData.js";
import { admissionTestGroups } from "../../data/admissionTests.js";
import { dashboardMenu } from "./AdminDashboard.jsx";

const stats = [
  ["Students", students.length, Users],
  ["Teachers", teachers.length, GraduationCap],
  ["Notices", notices.length, Megaphone],
  ["Admission Tests", admissionTestGroups.length, BookOpen],
];

export default function DashboardHome() {
  return (
    <div className="dashboard-home">
      <SEO title="Admin Dashboard" />
      <div className="dashboard-page-head">
        <div>
          <p>Administrative management portal</p>
          <h1>Dashboard Overview</h1>
        </div>
        <Link className="dashboard-primary-action" to="/">View Website</Link>
      </div>

      <div className="dashboard-stat-grid">
        {stats.map(([label, value, Icon]) => (
          <article className="dashboard-stat-card" key={label}>
            <Icon />
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </div>

      <section className="dashboard-panel dashboard-module-panel">
        <div className="dashboard-module-head">
          <div>
            <p>Overall dashboard</p>
            <h2>All Management Modules</h2>
          </div>
          <span>{dashboardMenu.length} modules</span>
        </div>
        <div className="dashboard-module-grid">
          {dashboardMenu.map((module, index) => (
            <Link className="dashboard-module-card" to={module.path} key={module.path}>
              <span className="dashboard-module-index">{String(index + 1).padStart(2, "0")}</span>
              <strong>{module.label.replace(/^\d+\.\s*/, "")}</strong>
              <small>{module.children?.length ? `${module.children.length} sections` : "Single section"}</small>
            </Link>
          ))}
        </div>
      </section>

      <div className="dashboard-panels">
        <section className="dashboard-panel">
          <h2>Academic Snapshot</h2>
          <div className="dashboard-list-row"><span>Class routine entries</span><strong>{routines.length}</strong></div>
          <div className="dashboard-list-row"><span>Exam routine entries</span><strong>{examRoutine.length}</strong></div>
          <div className="dashboard-list-row"><span>Active MCQ groups</span><strong>{admissionTestGroups.length}</strong></div>
        </section>

        <section className="dashboard-panel">
          <h2>Recent Applications</h2>
          {["ECC-260145 - Science - Selected", "ECC-260188 - Commerce - Under Review", "ECC-260207 - Arts - Pending"].map((item) => (
            <div className="dashboard-list-row" key={item}><span>{item}</span><ClipboardList size={16} /></div>
          ))}
        </section>
      </div>
    </div>
  );
}

export function DashboardPlaceholder() {
  return (
    <div className="dashboard-home">
      <SEO title="Dashboard Section" />
      <div className="dashboard-page-head">
        <div>
          <p>Administration module</p>
          <h1>Dashboard Section</h1>
        </div>
      </div>
      <section className="dashboard-panel">
        <h2>Coming Soon</h2>
        <p>This module is ready for future management tools and connected backend data.</p>
      </section>
    </div>
  );
}
