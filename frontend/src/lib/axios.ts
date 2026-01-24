import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

const refreshApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Check if super admin route
    const isSuperAdminRoute = config.url?.includes("/super-admin");

    const token = isSuperAdminRoute
      ? localStorage.getItem("superAdminAccessToken")
      : localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If token expired, try to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const isSuperAdminRoute = originalRequest.url?.includes("/super-admin");

        if (isSuperAdminRoute) {
          const response = await refreshApi.post("/super-admin/auth/refresh");

          const { accessToken } = response.data.data;

          localStorage.setItem("superAdminAccessToken", accessToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("superAdminAccessToken");
        window.location.href = "/super-admin/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
