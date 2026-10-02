import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Bell, BookOpen, ClipboardCheck, CreditCard, FilePenLine, GraduationCap, Image, LayoutDashboard, LayoutTemplate, LogOut, Palette, PlugZap, Sparkles, UserCheck, Users, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { logout } from "../../services/authApi.js";

const dashboardPathFor = (path, basePath) => `${basePath}${path}`;

const navItems = [
  { labelKey: "nav.dashboard", path: "", icon: LayoutDashboard, end: true },
  { labelKey: "nav.teachers", path: "/teachers", icon: GraduationCap },
  { labelKey: "nav.admissions", path: "/admissions", icon: BookOpen },
  { labelKey: "nav.admissionFormBuilder", path: "/admission-form-builder", icon: FilePenLine },
  { labelKey: "nav.teacherAssignments", path: "/teacher-assignments", icon: Users },
  { labelKey: "nav.admissionApplications", path: "/admission-applications", icon: ClipboardCheck },
  { labelKey: "nav.payments", path: "/payments", icon: CreditCard },
  { labelKey: "nav.notices", path: "/notices", icon: Bell },
  { labelKey: "nav.gallery", path: "/gallery", icon: Image },
  { labelKey: "nav.banners", path: "/website/banners", icon: LayoutTemplate },
  { labelKey: "nav.successStories", path: "/website/success-stories", icon: Sparkles },
  { labelKey: "nav.renownedTeachers", path: "/website/renowned-teachers", icon: UserCheck },
  { labelKey: "nav.websiteSettings", path: "/website/settings", icon: Palette },
  { labelKey: "nav.integrations", path: "/integrations", icon: PlugZap },
];

export default function DashboardSidebar({ mobileOpen, setMobileOpen }) {
  const { t } = useTranslation(["admin", "common"]);
  const close = () => setMobileOpen(false);
  const location = useLocation();
  const navigate = useNavigate();
  const basePath = location.pathname.startsWith("/admin/dashboard")
    ? "/admin/dashboard"
    : location.pathname.startsWith("/admin/")
      ? "/admin"
      : "/dashboard";
  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <>
      <AnimatePresence>{mobileOpen && (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.2}} className="dashboard-sidebar-backdrop fixed inset-0 z-40 bg-black/45 lg:hidden" onClick={close} />
      )}</AnimatePresence>

      <aside
        className={`dashboard-sidebar fixed inset-y-0 left-0 z-50 w-[min(300px,86vw)] overflow-y-auto bg-deep-green p-4 text-white shadow-2xl shadow-black/30 transition-transform duration-300 ease-out lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:w-[248px] lg:translate-x-0 lg:shadow-none ${
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
            <span className="block text-xs font-semibold text-white/60">{t("portal")}</span>
          </div>
          <button type="button" className="btn btn-ghost btn-square btn-sm ml-auto text-white lg:hidden" onClick={close} aria-label="Close dashboard menu">
            <X size={18} />
          </button>
        </div>

        <nav className="dashboard-sidebar-nav grid gap-1">
          {navItems.map(({ labelKey, path, icon: Icon, end }) => (
            <NavLink
              key={labelKey}
              to={dashboardPathFor(path, basePath)}
              end={end}
              onClick={close}
              className={({ isActive }) =>
                `relative isolate flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-bold outline-none transition-colors duration-200 hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white/60 ${
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
                  <span>{t(labelKey)}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-5 border-t border-white/10 pt-4">
          <button type="button" onClick={handleLogout} className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-bold text-white/75 outline-none transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white/60">
            <LogOut size={18} />
            {t("logout", { ns: "common" })}
          </button>
        </div>
      </aside>
    </>
  );
}
