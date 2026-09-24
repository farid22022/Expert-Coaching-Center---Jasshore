import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Bell, ChevronDown, LogOut, Menu, UserRound } from "lucide-react";

import DashboardSidebar from "./DashboardSidebar.jsx";
import { getStoredUser, isAuthenticated, logout, me } from "../../services/authApi.js";

import "../../styles/dashboardSidebar.css";

function canUseAdminDashboard(user) {
  if (!user) return false;
  if (user.is_superuser || user.is_staff) return true;
  return Array.isArray(user.role_codes) && user.role_codes.includes("institute-admin");
}

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] =
    useState(false);
  const [currentUser, setCurrentUser] = useState(getStoredUser);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

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
      })
      .catch(() => navigate("/admin/login", { replace: true }));
  }, [navigate]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="dashboard-layout grid min-h-screen bg-emerald-50/60 lg:grid-cols-[300px_minmax(0,1fr)]">
      <DashboardSidebar
        mobileOpen={sidebarOpen}
        setMobileOpen={setSidebarOpen}
      />

      <main className="dashboard-main min-w-0">
        <header className="dashboard-top-header sticky top-0 z-30 flex h-[70px] items-center gap-3 border-b border-emerald-100 bg-white px-4 shadow-sm lg:px-6">
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

          <h2 className="text-base font-black text-emerald-950 lg:text-lg">
            Admin Portal
          </h2>

          <div className="dashboard-top-actions ml-auto flex items-center gap-2">
            <button type="button" className="btn btn-ghost btn-square" aria-label="Notifications">
              <Bell size={19} />
            </button>
            <div className="relative">
              <button type="button" className="dashboard-admin-chip btn btn-sm bg-emerald-50 text-emerald-950" onClick={() => setProfileOpen((value) => !value)}>
                <UserRound size={17} />
                <span className="hidden sm:inline">{currentUser?.first_name || currentUser?.username || "Administrator"}</span>
                <ChevronDown size={15} />
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-lg border border-slate-200 bg-white p-2 shadow-xl">
                  <button type="button" className="block w-full rounded-md px-3 py-2 text-left text-sm font-bold hover:bg-emerald-50" onClick={() => navigate("/profile")}>My Profile</button>
                  <button type="button" className="block w-full rounded-md px-3 py-2 text-left text-sm font-bold text-red-600 hover:bg-red-50" onClick={handleLogout}>
                    <LogOut size={16} className="mr-2 inline" />
                    Logout
                  </button>
                </div>
              )}
            </div>
            <button
              type="button"
              className="dashboard-logout-button btn btn-sm border-0 bg-emerald-700 text-white hover:bg-emerald-800 sm:hidden"
              onClick={handleLogout}
            >
              <LogOut size={17} />
              Logout
            </button>
          </div>
        </header>

        <section className="dashboard-content p-4 lg:p-6">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
