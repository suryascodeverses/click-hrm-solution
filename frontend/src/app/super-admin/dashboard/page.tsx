"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import SuperAdminSidebar from "@/components/SuperAdminSidebar";
import {
  Building2,
  Users,
  CheckCircle,
  TrendingUp,
  Activity,
  DollarSign,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
];

interface Stats {
  totalTenants: number;
  activeTenants: number;
  totalUsers: number;
  totalEmployees: number;
}

interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  status: string;
  createdAt: string;
  _count: {
    users: number;
    organisations: number;
  };
}

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentTenants, setRecentTenants] = useState<Tenant[]>([]);
  const [tenantGrowth, setTenantGrowth] = useState<any[]>([]);
  const [usersByRole, setUsersByRole] = useState<any[]>([]);
  const [tenantsByStatus, setTenantsByStatus] = useState<any[]>([]);
  const [topTenants, setTopTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [dashboardRes, tenantsRes, usersRes] = await Promise.all([
        api.get("/super-admin/dashboard"),
        api.get("/super-admin/tenants"),
        api.get("/super-admin/users"),
      ]);

      setStats(dashboardRes.data.data.stats);
      setRecentTenants(dashboardRes.data.data.recentTenants);

      const tenants = tenantsRes.data.data;
      const users = usersRes.data.data;

      // Calculate tenant growth (last 6 months)
      const growthData = calculateTenantGrowth(tenants);
      setTenantGrowth(growthData);

      // Users by role
      const roleData = calculateUsersByRole(users);
      setUsersByRole(roleData);

      // Tenants by status
      const statusData = calculateTenantsByStatus(tenants);
      setTenantsByStatus(statusData);

      // Top tenants by user count
      const topTenantsData = tenants
        .sort((a: any, b: any) => b._count.users - a._count.users)
        .slice(0, 5)
        .map((t: any) => ({
          name: t.name,
          users: t._count.users,
        }));
      setTopTenants(topTenantsData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTenantGrowth = (tenants: any[]) => {
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      return {
        month: date.toLocaleString("default", { month: "short" }),
        year: date.getFullYear(),
        count: 0,
      };
    });

    tenants.forEach((tenant) => {
      const created = new Date(tenant.createdAt);
      const monthKey = created.toLocaleString("default", { month: "short" });
      const yearKey = created.getFullYear();

      const monthData = last6Months.find(
        (m) => m.month === monthKey && m.year === yearKey,
      );
      if (monthData) {
        monthData.count++;
      }
    });

    return last6Months;
  };

  const calculateUsersByRole = (users: any[]) => {
    const roles = [
      "TENANT_ADMIN",
      "ORG_ADMIN",
      "HR_MANAGER",
      "MANAGER",
      "EMPLOYEE",
    ];
    return roles.map((role) => ({
      name: role.replace("_", " "),
      value: users.filter((u) => u.role === role).length,
    }));
  };

  const calculateTenantsByStatus = (tenants: any[]) => {
    const statuses = ["ACTIVE", "SUSPENDED", "INACTIVE"];
    return statuses.map((status) => ({
      name: status,
      value: tenants.filter((t) => t.status === status).length,
    }));
  };

  if (loading) {
    return (
      <div className="flex h-screen">
        <SuperAdminSidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-lg text-gray-600">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <SuperAdminSidebar />

      <div className="flex-1 ml-64 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Platform Overview
            </h1>
            <p className="text-gray-600 mt-2">
              Monitor platform health and growth
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Tenants</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats?.totalTenants}
                  </p>
                  <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    {tenantGrowth[tenantGrowth.length - 1]?.count || 0} this
                    month
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-primary-600" />
                </div>
              </div>
            </div>

            <div className="card hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active Tenants</p>
                  <p className="text-3xl font-bold text-green-600">
                    {stats?.activeTenants}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {stats?.totalTenants &&
                      (
                        (stats.activeTenants / stats.totalTenants) *
                        100
                      ).toFixed(0)}
                    % active
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="card hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats?.totalUsers}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Avg{" "}
                    {stats?.totalTenants
                      ? Math.round(stats.totalUsers / stats.totalTenants)
                      : 0}{" "}
                    per tenant
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="card hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Employees</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats?.totalEmployees}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Across all tenants
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Tenant Growth Chart */}
            <div className="card">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Tenant Growth (Last 6 Months)
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={tenantGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#3B82F6"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Users by Role */}
            <div className="card">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Users by Role
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={usersByRole}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    dataKey="value"
                  >
                    {usersByRole.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Tenants by Status */}
            <div className="card">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Tenants by Status
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={tenantsByStatus}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Top Tenants */}
            <div className="card">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Top 5 Tenants (by Users)
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={topTenants} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="users" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Tenants */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Recent Tenants
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Company
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Subdomain
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Users
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Orgs
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentTenants.map((tenant) => (
                    <tr
                      key={tenant.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">
                          {tenant.name}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {tenant.subdomain}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            tenant.status === "ACTIVE"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {tenant.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {tenant._count.users}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {tenant._count.organisations}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(tenant.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
