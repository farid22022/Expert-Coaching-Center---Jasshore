import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, ClipboardList, GraduationCap, Megaphone, Users } from "lucide-react";
import SEO from "../../components/common/SEO.jsx";
import { admissionTestGroups } from "../../data/admissionTests.js";
import { dashboardMenu } from "./AdminDashboard.jsx";
import {
  applicationApi,
  classRoutineApi,
  employeeApi,
  examApi,
  reportContentApi,
  studentApi,
} from "../../services/resourceApi.js";

export default function DashboardHome() {
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    notices: 0,
    admissionTests: admissionTestGroups.length,
    routines: 0,
    exams: 0,
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function loadDashboard() {
      setLoading(true);
      try {
        const [
          studentCount,
          employeeCount,
          noticeCount,
          routineCount,
          examCount,
          applications,
        ] = await Promise.all([
          studentApi.count(),
          employeeApi.count(),
          reportContentApi.count({ type: "notice" }),
          classRoutineApi.count(),
          examApi.count(),
          applicationApi.listResults({ page_size: 5, ordering: "-created_at" }),
        ]);

        if (!ignore) {
          setStats({
            students: studentCount,
            teachers: employeeCount,
            notices: noticeCount,
            admissionTests: admissionTestGroups.length,
            routines: routineCount,
            exams: examCount,
          });
          setRecentApplications(applications);
        }
      } catch {
        if (!ignore) {
          setRecentApplications([]);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadDashboard();
    return () => {
      ignore = true;
    };
  }, []);

  const statCards = useMemo(
    () => [
      ["Students", stats.students, Users],
      ["Employees / Teachers", stats.teachers, GraduationCap],
      ["Notices", stats.notices, Megaphone],
      ["Admission Tests", stats.admissionTests, BookOpen],
    ],
    [stats]
  );

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
        {statCards.map(([label, value, Icon]) => (
          <article className="dashboard-stat-card" key={label}>
            <Icon />
            <span>{label}</span>
            <strong>{loading ? "..." : value}</strong>
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
          <div className="dashboard-list-row"><span>Class routine entries</span><strong>{loading ? "..." : stats.routines}</strong></div>
          <div className="dashboard-list-row"><span>Exam records</span><strong>{loading ? "..." : stats.exams}</strong></div>
          <div className="dashboard-list-row"><span>Active MCQ groups</span><strong>{stats.admissionTests}</strong></div>
        </section>

        <section className="dashboard-panel">
          <h2>Recent Applications</h2>
          {recentApplications.length ? (
            recentApplications.map((item) => (
              <div className="dashboard-list-row" key={item.id || item.application_no}>
                <span>
                  {item.application_no || item.id} - {item.applicant_name || "Applicant"} - {item.status || "Pending"}
                </span>
                <ClipboardList size={16} />
              </div>
            ))
          ) : (
            <div className="dashboard-list-row"><span>No recent applications found</span><ClipboardList size={16} /></div>
          )}
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
