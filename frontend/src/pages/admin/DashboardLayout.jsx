import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { LogOut, Menu, UserRound } from "lucide-react";

import DashboardSidebar from "./DashboardSidebar.jsx";

import "../../styles/dashboardSidebar.css";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] =
    useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("demoAdminSession");
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
            Expert Coaching Center
          </h2>

          <div className="dashboard-top-actions ml-auto flex items-center gap-2">
            <div className="dashboard-admin-chip hidden min-h-10 items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3 text-sm font-black text-emerald-950 sm:inline-flex">
              <UserRound size={17} />
              <span>Administrator</span>
            </div>
            <button
              type="button"
              className="dashboard-logout-button btn btn-sm border-0 bg-emerald-700 text-white hover:bg-emerald-800"
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
