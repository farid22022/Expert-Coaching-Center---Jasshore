import { NavLink, useLocation } from "react-router-dom";
import { ChevronDown, X } from "lucide-react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { dashboardMenu } from "./AdminDashboard.jsx";

const dashboardPathFor = (path, basePath) =>
  path.replace(/^\/dashboard/, basePath);

// Shared easing so every motion in the sidebar feels like one system.
const EASE = [0.22, 1, 0.36, 1];

function MenuBranch({ item, depth = 0, onNavigate, basePath }) {
  const [open, setOpen] = useState(depth === 0 && item.label.startsWith("1."));
  const hasChildren = Boolean(item.children?.length);
  const indent = {
    paddingLeft: `${10 + depth * 14}px`,
  };

  if (!hasChildren) {
    return (
      <NavLink
        to={dashboardPathFor(item.path, basePath)}
        onClick={onNavigate}
        className={({ isActive }) =>
          `dashboard-sidebar-link group relative flex min-h-9 items-center rounded-lg px-2 py-2 text-left text-[13px] font-semibold transition-colors duration-200 ease-out hover:bg-white/10 hover:text-white ${
            isActive ? "text-white" : "text-white/75"
          }`
        }
        style={indent}
      >
        {({ isActive }) => (
          <>
            {isActive && (
              <motion.span
                layoutId="sidebar-active-pill"
                className="absolute inset-0 -z-10 rounded-lg bg-white/10 ring-1 ring-white/10"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            <span className="relative">{item.label}</span>
          </>
        )}
      </NavLink>
    );
  }

  return (
    <div className="dashboard-sidebar-branch">
      <div
        className="dashboard-sidebar-link dashboard-sidebar-branch-row flex min-h-9 items-center gap-2 rounded-lg pr-1 text-[13px] font-semibold text-white/75 transition-colors duration-200 ease-out hover:bg-white/10 hover:text-white"
        style={indent}
      >
        <NavLink
          to={dashboardPathFor(item.path, basePath)}
          onClick={onNavigate}
          className={({ isActive }) =>
            `dashboard-sidebar-parent-link min-w-0 flex-1 py-2 no-underline transition-colors duration-200 ${
              isActive ? "font-black text-white" : "text-inherit"
            }`
          }
        >
          {item.label}
        </NavLink>

        <motion.button
          type="button"
          className="dashboard-sidebar-toggle grid h-7 w-7 shrink-0 place-items-center rounded-md text-inherit transition-colors duration-200 hover:bg-white/10"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-label={`Toggle ${item.label}`}
          whileTap={{ scale: 0.88 }}
        >
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="grid place-items-center"
          >
            <ChevronDown size={15} />
          </motion.span>
        </motion.button>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="children"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: EASE }}
            className="dashboard-sidebar-children overflow-hidden"
          >
            <div className="grid gap-0.5 pt-0.5">
              {item.children.map((child) => (
                <MenuBranch
                  key={child.path}
                  item={child}
                  depth={depth + 1}
                  onNavigate={onNavigate}
                  basePath={basePath}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function DashboardSidebar({ mobileOpen, setMobileOpen }) {
  const close = () => setMobileOpen(false);
  const location = useLocation();
  const basePath = location.pathname.startsWith("/admin/dashboard")
    ? "/admin/dashboard"
    : "/dashboard";

  return (
    <>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="dashboard-sidebar-backdrop fixed inset-0 z-40 bg-black/45 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: EASE }}
            onClick={close}
          />
        )}
      </AnimatePresence>

      <aside
        className={`dashboard-sidebar fixed inset-y-0 left-0 z-50 w-[min(320px,86vw)] overflow-auto bg-gradient-to-b from-emerald-950 to-emerald-900 p-3 text-white shadow-2xl shadow-black/30 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:w-auto lg:translate-x-0 lg:shadow-none ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="dashboard-sidebar-brand mb-3 flex items-center gap-3 border-b border-white/10 px-1 pb-4">
          <img
            src="/jasshoreExpert.png"
            alt="Expert Coaching Center"
            className="h-12 w-12 rounded-xl bg-white p-1 object-contain shadow-sm"
          />
          <div>
            <strong className="block text-sm font-black tracking-tight">
              EXPERT COACHING
            </strong>
            <span className="block text-xs font-semibold text-white/60">
              Administration Panel
            </span>
          </div>
          <motion.button
            type="button"
            className="dashboard-sidebar-close btn btn-ghost btn-square btn-sm ml-auto text-white lg:hidden"
            onClick={close}
            aria-label="Close dashboard menu"
            whileTap={{ scale: 0.85 }}
          >
            <X size={18} />
          </motion.button>
        </div>

        <nav className="dashboard-sidebar-nav grid gap-1">
          <NavLink
            to={basePath}
            end
            onClick={close}
            className={({ isActive }) =>
              `dashboard-sidebar-link dashboard-home-link relative flex min-h-10 items-center rounded-lg px-3 text-sm font-bold transition-colors duration-200 ease-out hover:bg-white/10 hover:text-white ${
                isActive ? "text-white" : "text-white/85"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="sidebar-active-pill"
                    className="absolute inset-0 -z-10 rounded-lg bg-white/10 ring-1 ring-white/10"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <span className="relative">Dashboard Home</span>
              </>
            )}
          </NavLink>

          {dashboardMenu.map((item) => (
            <MenuBranch
              key={item.path}
              item={item}
              onNavigate={close}
              basePath={basePath}
            />
          ))}
        </nav>
      </aside>
    </>
  );
}