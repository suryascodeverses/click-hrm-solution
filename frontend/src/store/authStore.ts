import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  email: string;
  role: string;
  tenantId?: string;
}

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  employeeCode: string;
  organisation: any;
  department: any;
  designation: any;
}

interface AuthState {
  user: User | null;
  employee: Employee | null;
  tenant: any | null;
  isAuthenticated: boolean;
  setAuth: (user: User, tenant: any, employee?: Employee) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      employee: null,
      tenant: null,
      isAuthenticated: false,

      setAuth: (user, tenant, employee) =>
        set({
          user,
          tenant,
          employee: employee || null,
          isAuthenticated: true,
        }),

      logout: () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        set({
          user: null,
          tenant: null,
          employee: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: "auth-storage", // localStorage key
      partialize: (state) => ({
        user: state.user,
        employee: state.employee,
        tenant: state.tenant,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
