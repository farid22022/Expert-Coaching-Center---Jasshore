import { MotionConfig } from "framer-motion";
import ErrorBoundary from "./components/common/ErrorBoundary.jsx";
import Header from "./components/layout/Header.jsx";
import Footer from "./components/layout/Footer.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";
import { useLocation } from "react-router-dom";
import { ThemeProvider } from "./theme/ThemeProvider.jsx";

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
    <ThemeProvider>
      <MotionConfig reducedMotion="user" transition={{duration:0.35}}>
      <div className="app-shell">
        {!isPortalRoute && <Header />}
        <main>
          <ErrorBoundary resetKey={pathname}><AppRoutes /></ErrorBoundary>
        </main>
        {!isPortalRoute && <Footer />}
      </div>
    </MotionConfig>
    </ThemeProvider>
  );
}
