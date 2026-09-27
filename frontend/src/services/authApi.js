import api from "./api";

const USER_STORAGE_KEY = "current_user";

function notifyAuthChange() {
  window.dispatchEvent(new Event("authchange"));
}

export async function login(email, password) {
  const { data } = await api.post("/auth/login/", { email, password });
  if (data.access) localStorage.setItem("access_token", data.access);
  if (data.refresh) localStorage.setItem("refresh_token", data.refresh);
  if (data.user) localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
  notifyAuthChange();
  return data;
}

export async function register(payload) {
  const { data } = await api.post("/auth/register/", payload);
  return data.data || data;
}

export async function logout() {
  const refresh = localStorage.getItem("refresh_token");
  try {
    if (refresh) await api.post("/auth/logout/", { refresh });
  } catch {
    // Local sign-out must still complete when the server is unavailable.
  } finally {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem("demoAdminSession");
    notifyAuthChange();
  }
}

export async function me() {
  const { data } = await api.get("/auth/me/");
  const user = data.data || data.user || data;
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  notifyAuthChange();
  return user;
}

export function getStoredUser() {
  try {
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  return Boolean(localStorage.getItem("access_token"));
}

export function hasRole(user, roleCode) {
  return Array.isArray(user?.role_codes) && user.role_codes.includes(roleCode);
}

export function getDashboardPathForUser(user) {
  if (!user) return "/login";
  if (user.is_superuser || user.is_staff || hasRole(user, "institute-admin")) {
    return "/admin/dashboard";
  }
  if (hasRole(user, "teacher")) return "/teacher/dashboard";
  if (hasRole(user, "student")) return "/student/dashboard";
  return "/profile";
}
