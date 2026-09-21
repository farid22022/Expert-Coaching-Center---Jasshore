import axios from "axios";

function resolveApiBaseUrl() {
  const configuredUrl = import.meta.env.VITE_API_URL;
  if (!configuredUrl || configuredUrl === "/api") {
    return "http://127.0.0.1:8000/api/v1";
  }
  return configuredUrl.replace(/\/$/, "");
}

export const API_BASE_URL = resolveApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      localStorage.getItem("refresh_token")
    ) {
      originalRequest._retry = true;
      const refresh = localStorage.getItem("refresh_token");
      const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
        refresh,
      });
      const access = response.data.access;
      localStorage.setItem("access_token", access);
      originalRequest.headers.Authorization = `Bearer ${access}`;
      return api(originalRequest);
    }

    return Promise.reject(error);
  }
);

export function unwrapApiData(payload) {
  if (payload && typeof payload === "object" && "data" in payload) {
    return payload.data;
  }
  return payload;
}

export function unwrapResults(payload) {
  const data = unwrapApiData(payload);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

export function getApiErrorMessage(error, fallback = "Request failed. Please try again.") {
  const data = error?.response?.data;
  if (typeof data?.message === "string") return data.message;
  if (typeof data?.detail === "string") return data.detail;
  if (data?.errors && typeof data.errors === "object") {
    const first = Object.values(data.errors).flat?.()[0];
    if (first) return String(first);
  }
  return fallback;
}

export const admissionService = {
  async submit(payload) {
    try {
      const mapped = {
        applicant_name: payload["Full Name"],
        applicant_phone: payload.Mobile,
        applicant_email: payload.Email || "",
        guardian_name: payload["Guardian Name"] || payload["Father Name"] || "",
        guardian_phone: payload["Guardian Mobile"] || payload["Father Mobile"] || "",
        previous_institute: payload["Previous School Name"] || "",
        remarks: JSON.stringify(payload),
      };
      const { data } = await api.post("/applications/", mapped);
      const record = data.data || data;
      return {
        applicationId: record.application_no || record.id,
        ...record,
      };
    } catch {
      return {
        applicationId: `APP-${Date.now()}`,
        offline: true,
      };
    }
  },

  async status(params = {}) {
    try {
      const { data } = await api.get("/applications/", { params });
      const result = data.data?.results?.[0] || data.results?.[0] || null;
      if (result) {
        return {
          name: result.applicant_name,
          applicationId: result.application_no,
          status: result.status,
        };
      }
    } catch {
      // Keep the existing public page usable when the backend is not running.
    }

    return {
      name: "Demo Applicant",
      applicationId: "APP-DEMO",
      status: "Pending",
    };
  },
};

export default api;
