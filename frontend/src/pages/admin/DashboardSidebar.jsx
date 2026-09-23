import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Bell, BookOpen, ClipboardList, CreditCard, LayoutDashboard, LogOut, Settings, UserRound, Users, X } from "lucide-react";
import { motion } from "framer-motion";
import { logout } from "../../services/authApi.js";

const dashboardPathFor = (path, basePath) => `${basePath}${path}`;

const navItems = [
  { label: "Dashboard", path: "", icon: LayoutDashboard, end: true },
  { label: "Academic", path: "/academic", icon: BookOpen },
  { label: "Users", path: "/users", icon: Users },
  { label: "Assessments", path: "/assessments", icon: ClipboardList },
  { label: "Enrollments", path: "/enrollments", icon: UserRound },
  { label: "Payments", path: "/payments", icon: CreditCard },
  { label: "Notifications", path: "/notifications", icon: Bell },
  { label: "Settings", path: "/settings", icon: Settings },
];

export default function DashboardSidebar({ mobileOpen, setMobileOpen }) {
  const close = () => setMobileOpen(false);
  const location = useLocation();
  const navigate = useNavigate();
  const basePath = location.pathname.startsWith("/admin/dashboard")
    ? "/admin/dashboard"
    : "/dashboard";
  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <>
      {mobileOpen && (
        <div className="dashboard-sidebar-backdrop fixed inset-0 z-40 bg-black/45 lg:hidden" onClick={close} />
      )}

      <aside
        className={`dashboard-sidebar fixed inset-y-0 left-0 z-50 w-[min(300px,86vw)] overflow-auto bg-emerald-950 p-4 text-white shadow-2xl shadow-black/30 transition-transform duration-300 ease-out lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:w-auto lg:translate-x-0 lg:shadow-none ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="dashboard-sidebar-brand mb-4 flex items-center gap-3 border-b border-white/10 pb-4">
          <img
            src="/jasshoreExpert.png"
            alt="Expert Coaching Center"
            className="h-12 w-12 rounded-xl bg-white p-1 object-contain shadow-sm"
          />
          <div className="min-w-0">
            <strong className="block truncate text-sm font-black tracking-tight">EXPERT COACHING</strong>
            <span className="block text-xs font-semibold text-white/60">Administration Panel</span>
          </div>
          <button type="button" className="btn btn-ghost btn-square btn-sm ml-auto text-white lg:hidden" onClick={close} aria-label="Close dashboard menu">
            <X size={18} />
          </button>
        </div>

        <nav className="dashboard-sidebar-nav grid gap-1">
          {navItems.map(({ label, path, icon: Icon, end }) => (
            <NavLink
              key={label}
              to={dashboardPathFor(path, basePath)}
              end={end}
              onClick={close}
              className={({ isActive }) =>
                `relative flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-bold transition-colors duration-200 hover:bg-white/10 hover:text-white ${
                  isActive ? "text-white" : "text-white/75"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="sidebar-active-pill"
                      className="absolute inset-0 -z-10 rounded-lg bg-white/12 ring-1 ring-white/10"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                  <Icon size={18} />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-5 border-t border-white/10 pt-4">
          <button type="button" onClick={handleLogout} className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-bold text-white/75 hover:bg-white/10 hover:text-white">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
