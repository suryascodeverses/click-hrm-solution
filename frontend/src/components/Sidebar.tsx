"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  Calendar,
  DollarSign,
  BarChart3,
  Settings,
  LogOut,
  User,
  ChevronUp,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";

interface NavItem {
  name: string;
  href: string;
  icon: any;
  roles?: string[];
}

const navigation: NavItem[] = [
  { name: "Dashboard", href: "/app/dashboard", icon: LayoutDashboard },
  {
    name: "Employees",
    href: "/app/employees",
    icon: Users,
    roles: ["TENANT_ADMIN", "ORG_ADMIN", "HR_MANAGER"],
  },
  {
    name: "Organisations",
    href: "/app/organisations",
    icon: Building2,
    roles: ["TENANT_ADMIN"],
  },
  {
    name: "Departments",
    href: "/app/departments",
    icon: Briefcase,
    roles: ["TENANT_ADMIN", "ORG_ADMIN"],
  },
  { name: "Attendance", href: "/app/attendance", icon: Calendar },
  {
    name: "Payroll",
    href: "/app/payroll",
    icon: DollarSign,
    roles: ["TENANT_ADMIN", "ORG_ADMIN", "HR_MANAGER"],
  },
  {
    name: "Reports",
    href: "/app/reports",
    icon: BarChart3,
    roles: ["TENANT_ADMIN", "ORG_ADMIN", "HR_MANAGER"],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, tenant, employee, logout } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    router.push("/login");
  };

  const canAccessRoute = (item: NavItem) => {
    if (!item.roles) return true;
    return item.roles.includes(user?.role || "");
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white w-64 fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold text-white">HRMS</h1>
        <p className="text-sm text-gray-400 mt-1">{tenant?.name}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {navigation.map((item) => {
          if (!canAccessRoute(item)) return null;

          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-6 py-3 transition-colors ${
                isActive
                  ? "bg-primary-600 text-white border-r-4 border-primary-400"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Info with Dropdown */}
      <div className="border-t border-gray-800 p-4 relative">
        {/* Dropdown Menu */}
        {showUserMenu && (
          <div className="absolute bottom-full left-4 right-4 mb-2 bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden">
            <Link
              href="/app/profile"
              onClick={() => setShowUserMenu(false)}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-700 transition-colors"
            >
              <User className="w-4 h-4" />
              <span className="text-sm font-medium">My Profile</span>
            </Link>
            <Link
              href="/app/settings"
              onClick={() => setShowUserMenu(false)}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-700 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span className="text-sm font-medium">Settings</span>
            </Link>
            <button
              onClick={() => {
                setShowUserMenu(false);
                handleLogout();
              }}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-700 transition-colors w-full text-left text-red-400"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        )}

        {/* User Info Button */}
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="w-full flex items-center justify-between p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-white truncate max-w-[120px]">
                {employee?.firstName || user?.email?.split("@")[0]}
              </p>
              <p className="text-xs text-gray-400 capitalize">
                {user?.role.toLowerCase().replace("_", " ")}
              </p>
            </div>
          </div>
          <ChevronUp
            className={`w-5 h-5 text-gray-400 transition-transform ${
              showUserMenu ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>
    </div>
  );
}
