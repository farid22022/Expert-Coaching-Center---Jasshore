import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import RoleDashboardShell from "../../../components/layout/RoleDashboardShell.jsx";
import { getDashboardPathForUser, getStoredUser, hasRole, isAuthenticated, me } from "../../../services/authApi.js";
import { teacherNav } from "../TeacherModulePages.jsx";

function canUseTeacherPortal(user) {
  if (!user) return false;
  if (user.is_superuser || user.is_staff) return true;
  return hasRole(user, "teacher");
}

export default function TeacherDashboardLayout() {
  const [checked, setChecked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login", { replace: true });
      return;
    }


    me()
      .then((user) => {
        if (!canUseTeacherPortal(user)) {
          navigate(getDashboardPathForUser(user), { replace: true });
          return;
        }
        setChecked(true);
      })
      .catch(() => navigate("/login", { replace: true }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  if (!checked) return <p role="status" className="p-8 text-center">Verifying your session...</p>;
  return <RoleDashboardShell roleLabel="Teacher Portal" title="Teacher Dashboard" items={teacherNav} />;
}
