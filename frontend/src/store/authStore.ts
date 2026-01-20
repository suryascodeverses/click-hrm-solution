import { create } from "zustand";

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

export const useAuthStore = create<AuthState>((set) => ({
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
}));
