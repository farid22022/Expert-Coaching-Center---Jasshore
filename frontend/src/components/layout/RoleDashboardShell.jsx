import PageEntrance from "../common/PageEntrance.jsx";
import "../../styles/student-portal.css";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate, useOutlet } from "react-router-dom";
import { Bell, CheckCheck, ChevronDown, LogOut, Menu, UserRound, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";

import api from "../../services/api.js";
import { getDashboardPathForUser, getStoredUser, logout } from "../../services/authApi.js";
import ThemeToggle from "../common/ThemeToggle.jsx";
import LanguageSwitcher from "../common/LanguageSwitcher.jsx";

const EASE = [0.22, 1, 0.36, 1];
const DashboardShellContext = createContext(false);

function NotificationBell() {
  const { t } = useTranslation("common");
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    let active = true;
    const refresh = () => {
      if (document.visibilityState === "hidden") return;
      api.get("/sms/notifications/unread_count/").then((response) => {
        if (active) setUnread((response.data?.data || response.data)?.unread || 0);
      }).catch(() => {});
    };
    const changed = () => { setLoaded(false); refresh(); };
    refresh();
    window.addEventListener("focus", changed);
    window.addEventListener("notificationschange", changed);
    document.addEventListener("visibilitychange", changed);
    const timer = window.setInterval(changed, 60000);
    return () => {
      active = false;
      clearInterval(timer);
      window.removeEventListener("focus", changed);
      window.removeEventListener("notificationschange", changed);
      document.removeEventListener("visibilitychange", changed);
    };
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onOutside = (event) => { if (ref.current && !ref.current.contains(event.target)) setOpen(false); };
    const onEscape = (event) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onOutside);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  const toggle = () => {
    setOpen((value) => !value);
    if (!open) {
      api.get("/sms/notifications/?page_size=6").then((response) => {
        const data = response.data?.data || response.data;
        setItems(Array.isArray(data) ? data : data?.results || []);
        setLoaded(true);
      }).catch(() => {});
    }
  };

  const markRead = async (notification) => {
    if (notification.is_read) return;
    try {
      await api.post(`/sms/notifications/${notification.id}/read/`);
      setItems((current) => current.map((item) => (item.id === notification.id ? { ...item, is_read: true } : item)));
      setUnread((value) => Math.max(0, value - 1));
    } catch {
      // Non-critical - leave state as-is if the mark-as-read call fails.
    }
  };

  const markAllRead = async () => {
    try {
      await api.post("/sms/notifications/read_all/");
      setItems((current) => current.map((item) => ({ ...item, is_read: true })));
      setUnread(0);
    } catch {
      // Non-critical - leave state as-is if the mark-all call fails.
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button type="button" className="btn btn-ghost btn-square relative" aria-label="Notifications" aria-haspopup="menu" aria-expanded={open} onClick={toggle}>
        <Bell size={19} />
        {unread > 0 && <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-red-600 px-1 text-[10px] font-black text-white">{unread > 9 ? "9+" : unread}</span>}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15, ease: EASE }}
            className="absolute right-0 z-40 mt-2 w-80 max-w-[90vw] rounded-lg border border-slate-200 bg-paper p-2 shadow-xl"
          >
            <div className="flex items-center justify-between px-2 py-1">
              <p className="text-sm font-black text-slate-950">{t("notifications")}</p>
              {unread > 0 && (
                <button type="button" className="flex items-center gap-1 text-xs font-bold text-emerald-700 hover:underline" onClick={markAllRead}>
                  <CheckCheck size={14} /> {t("markAllRead")}
                </button>
              )}
            </div>
            <div className="mt-1 max-h-80 overflow-y-auto">
              {items.length ? items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => markRead(item)}
                  className={`block w-full rounded-md px-2 py-2 text-left text-sm outline-none hover:bg-soft focus-visible:bg-soft ${item.is_read ? "" : "bg-soft/70"}`}
                >
                  <p className="font-bold text-slate-900">{item.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-xs font-medium text-slate-500">{item.body}</p>
                </button>
              )) : (
                <p className="px-2 py-4 text-center text-sm font-semibold text-slate-400">{t("noNotificationsYet")}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

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
  const { t } = useTranslation("common");
  const insideDashboardShell = useContext(DashboardShellContext);
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({ "Online Tests": true });
  const user = getStoredUser();
  const navigate = useNavigate();
  const profileRef = useRef(null);
  const location = useLocation();
  const outlet = useOutlet();
  const studentPortal = roleLabel === "Student Portal";
  const contentRef = useRef(null);
  const normalizedPath = location.pathname.replace("/student/dashboard/", "/student/");
  const currentTitle = studentPortal ? (normalizedPath.startsWith("/student/courses/") ? "Course Learning" : items.find((item) => item.to?.replace("/student/dashboard/", "/student/") === normalizedPath)?.label || title) : title;

  useEffect(() => {
    setOpen(false);
    setProfileOpen(false);
    if (contentRef.current) contentRef.current.scrollTop = 0;
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  useEffect(() => {
    if (!profileOpen) return undefined;
    const onOutside = (event) => { if (profileRef.current && !profileRef.current.contains(event.target)) setProfileOpen(false); };
    const onEscape = (event) => { if (event.key === "Escape") setProfileOpen(false); };
    document.addEventListener("mousedown", onOutside);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, [profileOpen]);

  if (insideDashboardShell) {
    return children || <Outlet />;
  }

  const handleLogout = async () => {
    await logout();
    navigate(homePath);
  };

  const sidebar = (
    <aside className="flex h-full min-h-0 flex-col overflow-y-auto overscroll-contain bg-deep-green p-3 text-white sm:p-4">
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

      <nav className="grid gap-1 pb-4">
        {items.map(({ label, icon: Icon, to, end, children: itemChildren }) => itemChildren ? (
          <div key={label}>
            <button type="button" onClick={() => setExpandedGroups((current) => ({ ...current, [label]: !current[label] }))} aria-expanded={Boolean(expandedGroups[label])} className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-bold text-white/75 outline-none transition hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white/60">
              <Icon size={18} /><span>{label}</span><ChevronDown size={16} className={`ml-auto transition-transform ${expandedGroups[label] ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence initial={false}>{expandedGroups[label] && <motion.div initial={{opacity:0, y:-6}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-6}} transition={{duration:0.16}} className="ml-4 grid gap-1 border-l border-white/15 pl-2">{itemChildren.map(({ label: childLabel, to: childTo }) => <NavLink key={childLabel} to={childTo} onClick={() => setOpen(false)} className={({ isActive }) => `rounded-md px-3 py-2 text-xs font-bold outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${isActive ? "bg-white/12 text-white" : "text-white/65 hover:bg-white/10 hover:text-white"}`}>{childLabel}</NavLink>)}</motion.div>}</AnimatePresence>
          </div>
        ) : (
          <NavLink key={label} to={to} end={end} onClick={() => setOpen(false)} className={({ isActive }) => `flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-bold outline-none transition focus-visible:ring-2 focus-visible:ring-white/60 ${isActive ? "bg-white/12 text-white ring-1 ring-white/10" : "text-white/75 hover:bg-white/10 hover:text-white"}`}><Icon size={18} />{label}</NavLink>
        ))}
      </nav>

      <div className="mt-auto border-t border-white/10 pt-4">
        <div className="mb-3 text-sm font-bold text-white">{labelFor(user, roleLabel)}</div>
        <button type="button" className="btn btn-sm w-full border-0 bg-white/10 text-white hover:bg-white/15" onClick={handleLogout}>
          <LogOut size={16} />
          {t("logout")}
        </button>
      </div>
    </aside>
  );

  return (
    <div className={`${studentPortal ? "student-portal" : "min-h-screen bg-soft"} lg:grid lg:grid-cols-[248px_minmax(0,1fr)]`}>
      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-40 bg-black/45 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
        )}
      </AnimatePresence>

      <div
        className={`portal-sidebar fixed inset-y-0 left-0 z-50 w-[min(300px,86vw)] transition-transform duration-300 ease-out lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:w-[248px] lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-full">{sidebar}</div>
      </div>

      <main className="portal-main min-w-0">
        <header className="portal-header sticky top-0 z-30 flex h-[68px] items-center gap-2 border-b border-line bg-paper px-3 shadow-sm sm:gap-3 sm:px-4 lg:px-6">
          <button type="button" className="btn btn-ghost btn-square lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu size={20} />
          </button>
          <h1 className="min-w-0 flex-1 truncate text-base font-black text-ink sm:text-lg">{currentTitle}</h1>

          <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
            <ThemeToggle />
            <LanguageSwitcher />
            <NotificationBell />
            <div className="relative" ref={profileRef}>
              <button type="button" className="btn btn-sm bg-soft text-ink" onClick={() => setProfileOpen((value) => !value)} aria-haspopup="menu" aria-expanded={profileOpen}>
                <UserRound size={17} />
                <span className="hidden sm:inline">{labelFor(user, roleLabel)}</span>
                <ChevronDown size={15} className={`transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    role="menu"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15, ease: EASE }}
                    className="absolute right-0 z-40 mt-2 w-56 rounded-lg border border-line bg-paper p-2 shadow-xl"
                  >
                    <NavLink to="/profile" role="menuitem" onClick={() => setProfileOpen(false)} className="block rounded-md px-3 py-2 text-sm font-bold outline-none hover:bg-soft focus-visible:bg-soft">{t("myProfile")}</NavLink>
                    <NavLink to={getDashboardPathForUser(user)} role="menuitem" onClick={() => setProfileOpen(false)} className="block rounded-md px-3 py-2 text-sm font-bold outline-none hover:bg-soft focus-visible:bg-soft">{t("dashboard")}</NavLink>
                    <button type="button" role="menuitem" className="block w-full rounded-md px-3 py-2 text-left text-sm font-bold outline-none hover:bg-soft focus-visible:bg-soft" onClick={handleLogout}>{t("logout")}</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <DashboardShellContext.Provider value>
          <section ref={contentRef} className="portal-content p-3 sm:p-5 lg:p-7">
            {studentPortal ? <AnimatePresence mode="wait" initial={false}><motion.div key={location.pathname} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.12}}>{children || outlet}</motion.div></AnimatePresence> : <PageEntrance>{children || outlet}</PageEntrance>}
          </section>
        </DashboardShellContext.Provider>
      </main>
    </div>
  );
}
