import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, ClipboardList, CreditCard, GraduationCap, Megaphone, Users } from "lucide-react";
import SEO from "../../components/common/SEO.jsx";
import { admissionTestGroups } from "../../data/admissionTests.js";
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
      ["Teachers", stats.teachers, GraduationCap],
      ["Active Courses", stats.routines || 12, BookOpen],
      ["Active Tests", stats.admissionTests, ClipboardList],
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

      <div className="dashboard-panels">
        <section className="dashboard-panel">
          <h2>Priority Work</h2>
          <div className="dashboard-list-row"><span>Recent enrollments</span><Users size={16} /></div>
          <div className="dashboard-list-row"><span>Recent payments</span><CreditCard size={16} /></div>
          <div className="dashboard-list-row"><span>Upcoming assessments</span><ClipboardList size={16} /></div>
          <div className="dashboard-list-row"><span>System activity</span><Megaphone size={16} /></div>
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
