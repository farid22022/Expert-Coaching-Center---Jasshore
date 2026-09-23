import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Bell, ChevronDown, LogOut, Menu, UserRound, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { getStoredUser, logout } from "../../services/authApi.js";

const EASE = [0.22, 1, 0.36, 1];

function labelFor(user, fallback) {
  return user?.first_name || user?.username || user?.email || fallback;
}

export default function RoleDashboardShell({
  roleLabel,
  title,
  items,
  children,
  brandText = "EXPERT",
  homePath = "/",
}) {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const user = getStoredUser();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate(homePath);
  };

  const sidebar = (
    <aside className="flex h-full flex-col bg-emerald-950 p-4 text-white">
      <div className="mb-5 flex items-center gap-3 border-b border-white/10 pb-4">
        <img src="/jasshoreExpert.png" alt="Expert Coaching Center" className="h-11 w-11 rounded-xl bg-white p-1 object-contain" />
        <div className="min-w-0">
          <strong className="block truncate text-sm font-black">{brandText}</strong>
          <span className="block text-xs font-semibold text-white/60">{roleLabel}</span>
        </div>
        <button type="button" className="btn btn-ghost btn-square btn-sm ml-auto text-white lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu">
          <X size={18} />
        </button>
      </div>

      <nav className="grid gap-1">
        {items.map(({ label, icon: Icon, to, end }) => (
          <NavLink
            key={label}
            to={to}
            end={end}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-bold transition ${
                isActive ? "bg-white/12 text-white ring-1 ring-white/10" : "text-white/75 hover:bg-white/10 hover:text-white"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto border-t border-white/10 pt-4">
        <div className="mb-3 text-sm font-bold text-white">{labelFor(user, roleLabel)}</div>
        <button type="button" className="btn btn-sm w-full border-0 bg-white/10 text-white hover:bg-white/15" onClick={handleLogout}>
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-[#f4f8f6] lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-40 bg-black/45 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
        )}
      </AnimatePresence>

      <div
        className={`fixed inset-y-0 left-0 z-50 w-[min(300px,86vw)] transition-transform duration-300 ease-out lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:w-auto lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-full">{sidebar}</div>
      </div>

      <main className="min-w-0">
        <header className="sticky top-0 z-30 flex h-[68px] items-center gap-3 border-b border-emerald-100 bg-white px-4 shadow-sm lg:px-6">
          <button type="button" className="btn btn-ghost btn-square lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu size={20} />
          </button>
          <h1 className="text-base font-black text-emerald-950 sm:text-lg">{title}</h1>

          <div className="ml-auto flex items-center gap-2">
            <button type="button" className="btn btn-ghost btn-square" aria-label="Notifications">
              <Bell size={19} />
            </button>
            <div className="relative">
              <button type="button" className="btn btn-sm bg-emerald-50 text-emerald-950" onClick={() => setProfileOpen((value) => !value)}>
                <UserRound size={17} />
                <span className="hidden sm:inline">{labelFor(user, roleLabel)}</span>
                <ChevronDown size={15} />
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-lg border border-slate-200 bg-white p-2 shadow-xl">
                  <NavLink to="/profile" className="block rounded-md px-3 py-2 text-sm font-bold hover:bg-emerald-50">My Profile</NavLink>
                  <button type="button" className="block w-full rounded-md px-3 py-2 text-left text-sm font-bold hover:bg-emerald-50" onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
          </div>
        </header>

        <section className="p-4 lg:p-6">{children}</section>
      </main>
    </div>
  );
}
