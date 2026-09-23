import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Award,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Edit3,
  FileText,
  GraduationCap,
  Hash,
  IdCard,
  Layers,
  Mail,
  Phone,
  Sun,
  User,
  Users,
} from "lucide-react";

import { getStoredUser, isAuthenticated, me } from "../../services/authApi.js";
import { getDashboardPathForUser, hasRole } from "../../services/authApi.js";

export default function StudentProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getStoredUser);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login", { replace: true });
      return;
    }

    me()
      .then(setUser)
      .catch(() => navigate("/login", { replace: true }));
  }, [navigate]);

  const profile = {
    id: user?.id ? `USER-${user.id}` : "USER",
    name:
      [user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
      user?.username ||
      user?.email ||
      "Student",
    email: user?.email || "Not set",
    phone: user?.phone || "Not set",
    className: "Not assigned",
    section: "Not assigned",
    roll: "Not assigned",
    group: "Not assigned",
    session: "Not assigned",
    shift: "Not assigned",
    status: user?.is_active ? "Active" : "Inactive",
  };
  const isTeacher = hasRole(user, "teacher");
  const isStudent = hasRole(user, "student");
  const dashboardPath = getDashboardPathForUser(user);
  const roleTitle = isTeacher ? "Teacher Profile" : isStudent ? "Student Profile" : "Profile";

  const infoRows = [
    [User, "Full Name", profile.name],
    [IdCard, "Account ID", profile.id],
    [Mail, "Email", profile.email],
    [Phone, "Phone", profile.phone],
    [GraduationCap, "Class", profile.className],
    [Layers, "Section", profile.section],
    [Hash, "Roll", profile.roll],
    [Users, "Group", profile.group],
    [CalendarDays, "Session", profile.session],
    [Sun, "Shift", profile.shift],
  ];

  return (
    <main className="min-h-screen bg-emerald-50/70">
      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-2">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-sm font-black text-emerald-800">
            <User size={13} />
            Dashboard
          </span>
          <h1 className="text-3xl font-black text-emerald-950">{roleTitle}</h1>
        </div>

        <section className="card border border-emerald-100 bg-base-100 shadow-sm">
          <div className="card-body flex-col gap-5 md:flex-row md:items-center">
            <div className="relative w-fit">
              <div className="grid h-28 w-28 place-items-center rounded-2xl bg-emerald-700 text-4xl font-black text-white shadow-sm">
                {profile.name.charAt(0).toUpperCase()}
              </div>
              <span className="absolute -bottom-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 text-xs font-black text-white shadow">
                <CheckCircle2 size={11} />
                {profile.status}
              </span>
            </div>

            <div className="grid gap-3 pt-3 md:pt-0">
              <h2 className="text-3xl font-black text-emerald-950">{profile.name}</h2>
              <span className="inline-flex w-fit items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700">
                <IdCard size={15} />
                Account ID: {profile.id}
              </span>
              <div className="flex flex-wrap gap-2">
                <span className="badge badge-success badge-outline gap-1 font-bold">
                  <Mail size={13} />
                  {profile.email}
                </span>
                <span className="badge badge-warning badge-outline gap-1 font-bold">
                  <Phone size={13} />
                  {profile.phone}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="card border border-emerald-100 bg-base-100 shadow-sm">
          <div className="card-body">
            <div className="mb-2 flex items-center gap-2">
              <User size={17} className="text-emerald-700" />
              <h2 className="text-xl font-black text-emerald-950">{isTeacher ? "Teacher Account Information" : "Backend Account Information"}</h2>
            </div>

            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {infoRows.map(([Icon, label, value]) => (
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4" key={label}>
                  <span className="mb-2 inline-flex items-center gap-2 text-sm font-black text-emerald-800">
                    <Icon size={15} />
                    {label}
                  </span>
                  <p className="font-bold text-slate-700">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {!isTeacher && (
        <section className="card border border-emerald-100 bg-base-100 shadow-sm">
          <div className="card-body">
            <div className="mb-2 flex items-center gap-2">
              <Award size={17} className="text-emerald-700" />
              <h2 className="text-xl font-black text-emerald-950">Admission Tests</h2>
            </div>

            <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/50 p-8 text-center">
              <p className="font-semibold text-slate-600">
                No admission test records are connected to this backend account yet.
              </p>
            </div>
          </div>
        </section>
        )}

        <section className="card border border-emerald-100 bg-base-100 shadow-sm">
          <div className="card-body">
            <div className="mb-2 flex items-center gap-2">
              <ClipboardList size={17} className="text-emerald-700" />
              <h2 className="text-xl font-black text-emerald-950">Quick Actions</h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <Link to={dashboardPath} className="btn min-h-16 justify-start bg-emerald-700 text-white hover:bg-emerald-800">
                <ClipboardList size={22} />
                {isTeacher ? "Teacher Dashboard" : "My Dashboard"}
              </Link>
              {isTeacher ? (
                <>
                  <Link to="/teacher/dashboard#assessments" className="btn min-h-16 justify-start bg-emerald-700 text-white hover:bg-emerald-800">
                    <FileText size={22} />
                    Assessments
                  </Link>
                  <Link to="/teacher/dashboard#question-bank" className="btn min-h-16 justify-start bg-emerald-700 text-white hover:bg-emerald-800">
                    <Award size={22} />
                    Question Bank
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/admission/online" className="btn min-h-16 justify-start bg-emerald-700 text-white hover:bg-emerald-800">
                    <FileText size={22} />
                    Admission Test
                  </Link>
                  <Link to="/result/individual" className="btn min-h-16 justify-start bg-emerald-700 text-white hover:bg-emerald-800">
                    <Award size={22} />
                    My Results
                  </Link>
                </>
              )}
              <Link to="/profile" className="btn min-h-16 justify-start bg-amber-500 text-white hover:bg-amber-600">
                <Edit3 size={22} />
                Edit Profile
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
