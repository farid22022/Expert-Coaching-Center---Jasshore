import api from "./api";

export async function login(email, password) {
  const { data } = await api.post("/auth/login/", { email, password });
  if (data.access) localStorage.setItem("access_token", data.access);
  if (data.refresh) localStorage.setItem("refresh_token", data.refresh);
  return data;
}

export async function logout() {
  const refresh = localStorage.getItem("refresh_token");
  try {
    if (refresh) await api.post("/auth/logout/", { refresh });
  } finally {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  }
}

export async function me() {
  const { data } = await api.get("/auth/me/");
  return data;
}

