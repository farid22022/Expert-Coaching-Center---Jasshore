import { useEffect, useRef, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, ChevronDown, LogOut, Menu, UserRound } from "lucide-react";

import DashboardSidebar from "./DashboardSidebar.jsx";
import { getStoredUser, isAuthenticated, logout, me } from "../../services/authApi.js";
import ThemeToggle from "../../components/common/ThemeToggle.jsx";
import LanguageSwitcher from "../../components/common/LanguageSwitcher.jsx";
import { useTranslation } from "react-i18next";

function canUseAdminDashboard(user) {
  if (!user) return false;
  if (user.is_superuser || user.is_staff) return true;
  return Array.isArray(user.role_codes) && user.role_codes.includes("institute-admin");
}

export default function DashboardLayout() {
  const { t } = useTranslation("admin");
  const [sidebarOpen, setSidebarOpen] =
    useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [checked, setChecked] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!profileOpen) return undefined;
    const handlePointer = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) setProfileOpen(false);
    };
    const handleKey = (event) => {
      if (event.key === "Escape") setProfileOpen(false);
    };
    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [profileOpen]);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/admin/login", { replace: true });
      return;
    }

    me()
      .then((user) => {
        if (!canUseAdminDashboard(user)) {
          navigate("/profile", { replace: true });
          return;
        }
        setCurrentUser(user);
        setChecked(true);
        setChecked(true);
      })
      .catch(() => navigate("/admin/login", { replace: true }));
  }, [navigate]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  if (!checked) return <p role="status" className="p-8 text-center">Verifying your session...</p>;

  if (!checked) return <p role="status" className="p-8 text-center">Verifying your session...</p>;

  return (
    <div className="dashboard-layout grid h-screen overflow-hidden bg-soft lg:grid-cols-[248px_minmax(0,1fr)]">
      <DashboardSidebar
        mobileOpen={sidebarOpen}
        setMobileOpen={setSidebarOpen}
      />

      <main className="dashboard-main flex h-screen min-w-0 flex-col overflow-hidden">
        <header className="dashboard-top-header z-30 flex h-[70px] shrink-0 items-center gap-3 border-b border-line bg-paper px-4 shadow-sm lg:px-6">
          <button
            type="button"
            className="dashboard-menu-button btn btn-ghost btn-square lg:hidden"
            onClick={() =>
              setSidebarOpen(true)
            }
            aria-label="Open dashboard menu"
          >
            <Menu size={20} />
          </button>

          <h2 className="text-base font-black text-ink lg:text-lg">
            {t("portal")}
          </h2>

          <div className="dashboard-top-actions ml-auto flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitcher />
            <button type="button" className="btn btn-ghost btn-square" aria-label="Notifications">
              <Bell size={19} />
            </button>
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                className="dashboard-admin-chip btn btn-sm bg-soft text-ink"
                onClick={() => setProfileOpen((value) => !value)}
                aria-haspopup="menu"
                aria-expanded={profileOpen}
              >
                <UserRound size={17} />
                <span className="hidden sm:inline">{currentUser?.first_name || currentUser?.username || "Administrator"}</span>
                <ChevronDown size={15} className={`transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    role="menu"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute right-0 mt-2 w-56 rounded-lg border border-line bg-paper p-2 shadow-xl"
                  >
                    <button type="button" role="menuitem" className="block w-full rounded-md px-3 py-2 text-left text-sm font-bold outline-none hover:bg-soft focus-visible:bg-soft" onClick={() => { setProfileOpen(false); navigate("/profile"); }}>{t("myProfile", { ns: "common" })}</button>
                    <button type="button" role="menuitem" className="block w-full rounded-md px-3 py-2 text-left text-sm font-bold text-red-600 outline-none hover:bg-red-50 focus-visible:bg-red-50" onClick={handleLogout}>
                      <LogOut size={16} className="mr-2 inline" />
                      {t("logout", { ns: "common" })}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button
              type="button"
              className="dashboard-logout-button btn btn-sm border-0 bg-brand text-white hover:bg-dark-green sm:hidden"
              onClick={handleLogout}
            >
              <LogOut size={17} />
              Logout
            </button>
          </div>
        </header>

        <section className="dashboard-content flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
