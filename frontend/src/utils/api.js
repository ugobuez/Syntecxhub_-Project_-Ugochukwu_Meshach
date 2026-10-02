/**
 * Preconfigured Axios instance for the Expense Tracker API.
 * - Sends/receives cookies (JWT lives in an httpOnly cookie)
 * - Normalises error messages so UI code can simply read `error.message`
 * - Handles 401s globally by redirecting to the login page
 */
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // always send the auth cookie
  headers: { "Content-Type": "application/json" },
});

/* ------------------------- Response interceptor ------------------------- */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.message ||
      error.message ||
      "Something went wrong. Please try again.";

    // Expired/invalid session -> force re-login (ignore calls to auth itself)
    if (status === 401 && !error.config?.url?.includes("/auth/login")) {
      // Avoid an infinite loop if we are already on the login page
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(
      new Error(message, { cause: status ? { status } : undefined })
    );
  }
);

/* ------------------------------ API helpers ------------------------------ */
export const authAPI = {
  register: (formData) => api.post("/auth/register", formData),
  login: (credentials) => api.post("/auth/login", credentials),
  getUser: () => api.get("/auth/getUser"),
  logout: () => api.post("/auth/logout"),
};

export const incomeAPI = {
  add: (data) => api.post("/income/add", data),
  getAll: () => api.get("/income/getAll"),
  delete: (id) => api.delete(`/income/${id}`),
  downloadExcel: () =>
    api.get("/income/download", { responseType: "blob" }),
};

export const expenseAPI = {
  add: (data) => api.post("/expense/add", data),
  getAll: () => api.get("/expense/getAll"),
  delete: (id) => api.delete(`/expense/${id}`),
  downloadExcel: () =>
    api.get("/expense/download", { responseType: "blob" }),
};

export const dashboardAPI = {
  getStats: () => api.get("/dashboard/stats"),
};

export default api;
