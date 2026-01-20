"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  Settings,
  LogOut,
  Shield,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";

const navigation = [
  { name: "Dashboard", href: "/super-admin/dashboard", icon: LayoutDashboard },
  { name: "Tenants", href: "/super-admin/tenants", icon: Building2 },
  { name: "All Users", href: "/super-admin/users", icon: Users },
  { name: "Settings", href: "/super-admin/settings", icon: Settings },
];

export default function SuperAdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    router.push("/super-admin/login");
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white w-64 fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-primary-400" />
          <div>
            <h1 className="text-xl font-bold">Super Admin</h1>
            <p className="text-xs text-gray-400">Platform Control</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {navigation.map((item) => {
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

      {/* User Info */}
      <div className="border-t border-gray-800 p-6">
        <div className="mb-4">
          <p className="text-sm font-medium text-white">{user?.email}</p>
          <p className="text-xs text-primary-400">Super Administrator</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}
