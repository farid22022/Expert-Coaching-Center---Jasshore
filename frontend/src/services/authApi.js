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

// /auth/me/ is used as an identity guard by several layouts mounted together. Share one
// in-flight request and reuse the result briefly. Keyed on the access token, so login, logout
// and token refresh always miss the cache; pass { force: true } after editing the profile.
const ME_TTL_MS = 30_000;
let meCache = null;

export function me({ force = false } = {}) {
  const token = localStorage.getItem("access_token");
  if (!force && meCache && meCache.token === token && Date.now() - meCache.at < ME_TTL_MS) return meCache.promise;
  const promise = api.get("/auth/me/").then(({ data }) => {
    const user = data.data || data.user || data;
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    notifyAuthChange();
    return user;
  });
  meCache = { token, at: Date.now(), promise };
  promise.catch(() => { if (meCache?.promise === promise) meCache = null; });
  return promise;
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
