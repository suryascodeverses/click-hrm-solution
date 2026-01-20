import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
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
  },
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
          // Super admin refresh
          const refreshToken = localStorage.getItem("superAdminRefreshToken");
          const response = await api.post("/super-admin/auth/refresh", {
            refreshToken,
          });
          const { accessToken } = response.data.data;

          localStorage.setItem("superAdminAccessToken", accessToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        } else {
          // Regular user refresh
          const refreshToken = localStorage.getItem("refreshToken");
          // TODO: Implement refresh token logic for regular users
        }

        return api(originalRequest);
      } catch (refreshError) {
        // Redirect to appropriate login
        if (typeof window !== "undefined") {
          const isSuperAdmin =
            window.location.pathname.includes("/super-admin");

          if (isSuperAdmin) {
            localStorage.removeItem("superAdminAccessToken");
            localStorage.removeItem("superAdminRefreshToken");
            window.location.href = "/super-admin/login";
          } else {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            window.location.href = "/login";
          }
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
