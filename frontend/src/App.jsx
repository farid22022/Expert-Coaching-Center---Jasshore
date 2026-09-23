import Header from "./components/layout/Header.jsx";
import Footer from "./components/layout/Footer.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";
import { useLocation } from "react-router-dom";

export default function App() {
  const { pathname } = useLocation();
  const isDashboardRoute =
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname === "/admin/dashboard" ||
    pathname.startsWith("/admin/dashboard/") ||
    pathname === "/teacher/dashboard" ||
    pathname.startsWith("/teacher/dashboard/") ||
    pathname === "/student/dashboard" ||
    pathname.startsWith("/student/dashboard/");

  return (
    <div className="app-shell">
      {!isDashboardRoute && <Header />}
      <main>
        <AppRoutes />
      </main>
      {!isDashboardRoute && <Footer />}
    </div>
  );
}
