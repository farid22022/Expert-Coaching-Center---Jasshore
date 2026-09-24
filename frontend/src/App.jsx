import Header from "./components/layout/Header.jsx";
import Footer from "./components/layout/Footer.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";
import { useLocation } from "react-router-dom";

export default function App() {
  const { pathname } = useLocation();
  const isPortalRoute =
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/teacher" ||
    pathname.startsWith("/teacher/") ||
    pathname === "/student" ||
    pathname.startsWith("/student/");

  return (
    <div className="app-shell">
      {!isPortalRoute && <Header />}
      <main>
        <AppRoutes />
      </main>
      {!isPortalRoute && <Footer />}
    </div>
  );
}
