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
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// A rotating refresh token must only be exchanged once per browser tab.
let refreshPromise = null;

function clearSession() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("current_user");
  window.dispatchEvent(new Event("authchange"));
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    if (response.config?.method !== "get" && /\/sms\/notifications\//.test(response.config?.url || "")) {
      window.dispatchEvent(new Event("notificationschange"));
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !/\/auth\/(login|register|refresh)\//.test(originalRequest.url || "") &&
      !originalRequest?._retry &&
      localStorage.getItem("refresh_token")
    ) {
      originalRequest._retry = true;
      const refresh = localStorage.getItem("refresh_token");
      try {
        if (!refreshPromise) {
          refreshPromise = axios.post(`${API_BASE_URL}/auth/refresh/`, { refresh }, { timeout: 30000 })
            .then(({ data }) => {
              // Do not restore a session that was logged out or replaced in flight.
              if (localStorage.getItem("refresh_token") !== refresh) throw new Error("Session changed");
              localStorage.setItem("access_token", data.access);
              if (data.refresh) localStorage.setItem("refresh_token", data.refresh);
              return data.access;
            })
            .finally(() => { refreshPromise = null; });
        }
        const access = await refreshPromise;
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Both tokens are dead (expired/invalid) - clear them so later requests (including
        // on fully public pages) go out anonymous instead of permanently attaching a stale
        // Authorization header that made every request 401 until the user manually logged out.
        if ([400, 401].includes(refreshError.response?.status) && localStorage.getItem("refresh_token") === refresh) {
          clearSession();
        }
        return Promise.reject(refreshError);
      }
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
  if (error?.response?.status >= 500) return "The server could not complete this request. Please try again.";
  if (error?.response?.status === 429) return "Too many requests. Please wait a moment and try again.";
  const data = error?.response?.data;
  if (typeof data?.message === "string") return data.message;
  if (typeof data?.detail === "string") return data.detail;
  if (data?.errors && typeof data.errors === "object") {
    const first = Object.values(data.errors).flat?.()[0];
    if (first) return String(first);
  }
  if (data && typeof data === "object") {
    const first = Object.entries(data)
      .filter(([key]) => !["success", "message", "data"].includes(key))
      .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : value}`)
      .find(Boolean);
    if (first) return first;
  }
  return fallback;
}

function admissionValue(payload, ...keys) {
  const normalize = (value) => String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const normalizedKeys = keys.map(normalize);
  const entry = Object.entries(payload).find(([key]) => normalizedKeys.includes(normalize(key)));
  return entry?.[1] ?? "";
}

export const admissionService = {
  async submit(payload) {
    const files = Object.entries(payload).filter(([, value]) => value instanceof File && value.size > 0);
    const formData = Object.fromEntries(
      Object.entries(payload).filter(([, value]) => !(value instanceof File))
    );
    const mapped = {
      course: payload.course || payload.programId,
      applicant_name: admissionValue(payload, "full name", "applicant name", "name"),
      applicant_name_bn: admissionValue(payload, "bengali name", "name bn"),
      applicant_phone: admissionValue(payload, "mobile", "phone", "applicant phone"),
      applicant_email: admissionValue(payload, "email"),
      date_of_birth: admissionValue(payload, "date of birth", "dob") || null,
      blood_group: admissionValue(payload, "blood group"),
      birth_certificate_no: admissionValue(payload, "birth certificate number", "birth certificate no"),
      student_uid: admissionValue(payload, "student uid", "student id"),
      guardian_name: admissionValue(payload, "guardian name", "father name"),
      guardian_phone: admissionValue(payload, "guardian mobile", "father mobile", "guardian phone"),
      guardian_relation: admissionValue(payload, "relationship", "guardian relation"),
      father_name: admissionValue(payload, "father name"),
      father_name_bn: admissionValue(payload, "father bengali name"),
      father_phone: admissionValue(payload, "father mobile", "father phone"),
      father_nid: admissionValue(payload, "father nid"),
      mother_name: admissionValue(payload, "mother name"),
      mother_name_bn: admissionValue(payload, "mother bengali name"),
      mother_phone: admissionValue(payload, "mother mobile", "mother phone"),
      mother_nid: admissionValue(payload, "mother nid"),
      previous_institute: admissionValue(payload, "previous school name", "previous institution"),
      payment_reference: admissionValue(payload, "transaction number", "payment reference"),
      form_data: formData,
    };
    const requestPayload = files.length
      ? (() => {
          const multipart = new FormData();
          Object.entries(mapped).forEach(([key, value]) => multipart.append(key, typeof value === "object" ? JSON.stringify(value) : value ?? ""));
          multipart.append("document_labels", JSON.stringify(files.map(([name]) => name)));
          files.forEach(([, file]) => multipart.append("documents", file));
          return multipart;
        })()
      : mapped;
    const { data } = await api.post("/admissions/", requestPayload, files.length ? { headers: { "Content-Type": "multipart/form-data" } } : undefined);
    const record = data.data || data;
    return { applicationId: record.application_no || record.id, ...record };
  },

  async status(params = {}) {
    const { data } = await api.get("/applications/", { params: { search: params.application_no } });
    const result = unwrapResults(data).find((item) =>
      item.application_no === params.application_no &&
      item.applicant_phone === params.applicant_phone &&
      item.applicant_name?.trim().toLowerCase() === params.applicant_name?.trim().toLowerCase()
    );
    return result ? { name: result.applicant_name, applicationId: result.application_no, status: result.status } : null;
  },
};

export default api;
