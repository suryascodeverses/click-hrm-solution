"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import SuperAdminSidebar from "@/components/SuperAdminSidebar";
import { Building2, Users, CheckCircle, TrendingUp } from "lucide-react";

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get("/super-admin/dashboard");
      setStats(response.data.data.stats);
      setRecentTenants(response.data.data.recentTenants);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen">
        <SuperAdminSidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-lg text-gray-600">Loading...</div>
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
            <p className="text-gray-600 mt-2">Monitor and manage all tenants</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Tenants</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats?.totalTenants}
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-primary-600" />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active Tenants</p>
                  <p className="text-3xl font-bold text-green-600">
                    {stats?.activeTenants}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats?.totalUsers}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Employees</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats?.totalEmployees}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
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
