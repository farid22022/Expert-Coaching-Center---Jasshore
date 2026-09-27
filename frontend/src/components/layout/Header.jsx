import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import {
  Menu,
  Search,
  X,
  ChevronDown,
  UserRound,
  LogIn,
  UserPlus,
  ShieldCheck,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { institution, navGroups } from "../../data/site.js";
import { getDashboardPathForUser, getStoredUser, logout } from "../../services/authApi.js";
import { useTranslation } from "react-i18next";
import ThemeToggle from "../common/ThemeToggle.jsx";
import LanguageSwitcher from "../common/LanguageSwitcher.jsx";
import { useTheme } from "../../theme/ThemeProvider.jsx";

const navLinkClass = ({ isActive }) =>
  `inline-flex min-h-9 sm:min-h-10 items-center rounded-md px-2.5 sm:px-3 text-xs sm:text-sm font-bold whitespace-nowrap [overflow-wrap:normal] transition-colors hover:bg-emerald-50 hover:text-emerald-700 ${
    isActive ? "bg-emerald-50 text-emerald-700" : "text-ink"
  }`;

const menuItemClass =
  "flex min-h-9 items-center gap-2 rounded-md px-3 text-sm font-semibold text-muted whitespace-nowrap [overflow-wrap:normal] transition-colors hover:bg-emerald-50 hover:text-emerald-700";

const dropdownMotion = {
  initial: { opacity: 0, y: -6, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -6, scale: 0.98 },
  transition: { duration: 0.16, ease: "easeOut" },
};

export default function Header() {
  const [mobile, setMobile] = useState(false);
  const [open, setOpen] = useState("");
  const [authOpen, setAuthOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(() => getStoredUser());
  const navigate = useNavigate();
  const { siteInfo } = useTheme();
  const { t } = useTranslation("public");

  const navLabelKeys = {
    Admission: "nav.admission",
    Others: "nav.others",
    Stories: "nav.stories",
    "Contact Us": "nav.contact",
  };
  const navLabel = (label) => (navLabelKeys[label] ? t(navLabelKeys[label]) : label);

  const headerRef = useRef(null);
  const logoRef = useRef(null);

  const closeMenus = () => {
    setOpen("");
    setMobile(false);
    setAuthOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    closeMenus();
    navigate("/");
  };

  useEffect(() => {
    const refreshUser = () => setUser(getStoredUser());
    window.addEventListener("focus", refreshUser);
    window.addEventListener("storage", refreshUser);
    window.addEventListener("authchange", refreshUser);
    return () => {
      window.removeEventListener("focus", refreshUser);
      window.removeEventListener("storage", refreshUser);
      window.removeEventListener("authchange", refreshUser);
    };
  }, []);

  // ✦ GSAP: logo entrance on mount
  useEffect(() => {
    if (!logoRef.current) return;
    gsap.fromTo(
      logoRef.current,
      { opacity: 0, scale: 0.6, rotate: -8 },
      { opacity: 1, scale: 1, rotate: 0, duration: 0.6, ease: "back.out(1.7)" }
    );
  }, []);

  // ✦ GSAP: shrink header on scroll (desktop/tablet)
  useEffect(() => {
    const onScroll = () => {
      const isScrolled = window.scrollY > 12;
      setScrolled(isScrolled);
      if (headerRef.current) {
        gsap.to(headerRef.current, {
          paddingTop: isScrolled ? 4 : 10,
          paddingBottom: isScrolled ? 4 : 10,
          duration: 0.25,
          ease: "power2.out",
        });
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const nav = (
    <nav
      className="flex flex-col gap-1 lg:flex-row lg:items-center lg:gap-0.5 xl:gap-1"
      aria-label="Main navigation"
    >
      {navGroups.map((group) =>
        group.items ? (
          <div className="relative" key={group.label}>
            <button
              type="button"
              className="inline-flex min-h-9 sm:min-h-10 w-full items-center justify-between gap-1 rounded-md px-2.5 sm:px-3 text-xs sm:text-sm font-bold text-ink whitespace-nowrap [overflow-wrap:normal] transition-colors hover:bg-emerald-50 hover:text-emerald-700 lg:w-auto"
              onClick={() => setOpen(open === group.label ? "" : group.label)}
              aria-expanded={open === group.label}
            >
              <span className="whitespace-nowrap [overflow-wrap:normal]">{navLabel(group.label)}</span>
              <ChevronDown
                size={15}
                className={`shrink-0 transition-transform ${
                  open === group.label ? "rotate-180" : ""
                }`}
              />
            </button>

            <AnimatePresence>
              {open === group.label && (
                <motion.div
                  {...dropdownMotion}
                  className="z-40 mt-1 grid w-full min-w-full gap-1 rounded-lg border border-line bg-paper p-2 shadow-xl origin-top lg:absolute lg:left-0 lg:top-full lg:min-w-56 lg:w-max"
                >
                  {group.items.map(([label, path]) => (
                    <NavLink
                      key={path}
                      to={path}
                      onClick={closeMenus}
                      className={menuItemClass}
                    >
                      <span>{label}</span>
                    </NavLink>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <NavLink
            key={group.path}
            to={group.path}
            onClick={closeMenus}
            className={navLinkClass}
          >
            <span>{navLabel(group.label)}</span>
          </NavLink>
        )
      )}
    </nav>
  );

  return (
    <header
      ref={headerRef}
      className={`sticky top-0 z-50 border-b border-emerald-100 bg-paper/95 shadow-sm backdrop-blur transition-shadow ${
        scrolled ? "shadow-md" : "shadow-sm"
      }`}
    >
      <div className="mx-auto flex min-h-14 sm:min-h-16 lg:min-h-20 w-full max-w-7xl items-center gap-2 sm:gap-4 px-3 sm:px-6 lg:px-8">
        <Link
          className="flex min-w-0 items-center gap-2 sm:gap-3 text-ink"
          to="/"
          onClick={closeMenus}
        >
          <span
            ref={logoRef}
            className="grid h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 shrink-0 place-items-center rounded-xl border border-emerald-100 bg-paper shadow-sm"
          >
            <img
              src={siteInfo?.logo || "/jasshoreExpert.png"}
              alt={`${institution.name} logo`}
              className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 object-contain"
            />
          </span>

            <span className="min-w-0">
            <strong className="block truncate text-sm sm:text-base font-black leading-tight text-ink whitespace-nowrap [overflow-wrap:normal]">
              {institution.name}
            </strong>

            <small className="hidden text-[11px] sm:text-xs font-semibold leading-snug text-muted md:block [overflow-wrap:normal]">
              <span className="line-clamp-1">{institution.address}</span>
              <span>ESTD : {institution.established}</span>
            </small>
          </span>
        </Link>

        <div className="ml-auto hidden items-center gap-1 xl:gap-2 lg:flex">
          {nav}

          <Link
            className="btn btn-ghost btn-sm btn-square text-ink"
            to="/search"
            aria-label="Search"
          >
            <Search size={18} />
          </Link>

          <ThemeToggle className="btn-sm text-ink" />
          <LanguageSwitcher className="text-ink" />

          <div className="relative">
            <button
              type="button"
              className="btn btn-outline btn-sm border-emerald-200 text-emerald-800 hover:border-emerald-700 hover:bg-emerald-700 hover:text-white"
              onClick={() => setAuthOpen((v) => !v)}
              aria-expanded={authOpen}
              aria-haspopup="menu"
            >
              <UserRound size={16} />
              <span className="hidden max-w-28 truncate xl:inline whitespace-nowrap [overflow-wrap:normal]">{user?.first_name || user?.username || "Account"}</span>
              <ChevronDown
                size={15}
                className={`transition-transform ${authOpen ? "rotate-180" : ""}`}
              />
            </button>

            <AnimatePresence>
              {authOpen && (
                <motion.div
                  {...dropdownMotion}
                  className="absolute right-0 top-full z-40 mt-2 grid min-w-48 gap-1 rounded-lg border border-line bg-paper p-2 shadow-xl origin-top-right"
                >
                  {user ? <>
                    <div className="rounded-md bg-emerald-50 px-3 py-2"><p className="truncate text-sm font-black text-emerald-950">{user.first_name || user.username || user.email}</p><p className="truncate text-xs font-semibold text-slate-500">{user.email}</p></div>
                    <Link to={getDashboardPathForUser(user)} onClick={closeMenus} className={menuItemClass}><LayoutDashboard size={16} /><span>Dashboard</span></Link>
                    <Link to="/profile" onClick={closeMenus} className={menuItemClass}><UserRound size={16} /><span>My Profile</span></Link>
                    <button type="button" onClick={handleLogout} className="flex min-h-9 items-center gap-2 rounded-md px-3 text-sm font-bold text-red-700 transition-colors hover:bg-red-50"><LogOut size={16} /><span>Logout</span></button>
                  </> : <>
                    <Link to="/login" onClick={closeMenus} className={menuItemClass}><LogIn size={16} /><span>Login</span></Link>
                    <Link to="/register" onClick={closeMenus} className={menuItemClass}><UserPlus size={16} /><span>Register</span></Link>
                    <Link to="/Admin/login" onClick={closeMenus} className="flex min-h-9 items-center gap-2 rounded-md px-3 text-sm font-bold text-emerald-700 transition-colors hover:bg-emerald-50"><ShieldCheck size={16} /><span>Admin Login</span></Link>
                  </>}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <Link
          className="btn btn-ghost btn-sm btn-square ml-auto lg:hidden text-ink"
          to="/search"
          aria-label="Search"
        >
          <Search size={18} />
        </Link>

        <ThemeToggle className="btn-sm lg:hidden text-ink" />

        <button
          type="button"
          className="btn btn-ghost btn-square lg:hidden"
          onClick={() => setMobile((v) => !v)}
          aria-label={mobile ? "Close menu" : "Open menu"}
          aria-expanded={mobile}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={mobile ? "close" : "open"}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="grid place-items-center"
            >
              {mobile ? <X /> : <Menu />}
            </motion.span>
          </AnimatePresence>
        </button>
      </div>

      <AnimatePresence>
        {mobile && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden border-t border-emerald-100 bg-paper lg:hidden"
          >
            <div className="mx-auto grid max-w-7xl gap-3 px-3 sm:px-6 py-4">
              {nav}

              <div className="grid gap-2">
                <button
                  type="button"
                  className="btn btn-ghost justify-between"
                  onClick={() => setAuthOpen((v) => !v)}
                  aria-expanded={authOpen}
                >
                  <span className="inline-flex items-center gap-2">
                    <UserRound size={17} />
                    <span>{user?.first_name || user?.username || "Account"}</span>
                  </span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${authOpen ? "rotate-180" : ""}`}
                  />
                </button>

                <AnimatePresence>
                  {authOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="grid gap-1 overflow-hidden pl-2"
                    >
                      {user ? <>
                        <div className="rounded-md bg-emerald-50 px-3 py-2"><p className="truncate font-black text-emerald-950">{user.first_name || user.username || user.email}</p><p className="truncate text-xs font-semibold text-slate-500">{user.email}</p></div>
                        <Link className={menuItemClass} to={getDashboardPathForUser(user)} onClick={closeMenus}><LayoutDashboard size={17} /><span>Dashboard</span></Link>
                        <Link className={menuItemClass} to="/profile" onClick={closeMenus}><UserRound size={17} /><span>My Profile</span></Link>
                        <button type="button" onClick={handleLogout} className="flex min-h-9 items-center gap-2 rounded-md px-3 text-sm font-bold text-red-700 transition-colors hover:bg-red-50"><LogOut size={17} /><span>Logout</span></button>
                      </> : <>
                        <Link className={menuItemClass} to="/login" onClick={closeMenus}><LogIn size={17} /><span>Login</span></Link>
                        <Link className={menuItemClass} to="/register" onClick={closeMenus}><UserPlus size={17} /><span>Register</span></Link>
                        <Link className="flex min-h-9 items-center gap-2 rounded-md px-3 text-sm font-bold text-emerald-700 transition-colors hover:bg-emerald-50" to="/Admin/login" onClick={closeMenus}><ShieldCheck size={17} /><span>Admin Login</span></Link>
                      </>}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
