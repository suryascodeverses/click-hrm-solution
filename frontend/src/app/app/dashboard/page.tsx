"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import Sidebar from "@/components/Sidebar";
import { useAuthStore } from "@/store/authStore";
import {
  Users,
  Building2,
  Briefcase,
  UserCheck,
  Calendar,
  TrendingUp,
} from "lucide-react";

export default function AppDashboard() {
  const { user, tenant, employee } = useAuthStore();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalOrganisations: 0,
    totalDepartments: 0,
    activeEmployees: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [employeesRes, orgsRes, deptsRes] = await Promise.all([
        api.get("/employees"),
        api.get("/organisations"),
        api.get("/departments"),
      ]);

      const employees = employeesRes.data.data;
      const activeCount = employees.filter(
        (e: any) => e.status === "ACTIVE",
      ).length;

      setStats({
        totalEmployees: employees.length,
        totalOrganisations: orgsRes.data.data.length,
        totalDepartments: deptsRes.data.data.length,
        activeEmployees: activeCount,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const canViewStats = ["TENANT_ADMIN", "ORG_ADMIN", "HR_MANAGER"].includes(
    user?.role || "",
  );

  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 ml-64 overflow-auto">
        <div className="p-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {employee?.firstName || user?.email}!
            </h1>
            <p className="text-gray-600 mt-2">
              {tenant?.name} -{" "}
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          {/* Stats Grid - Only for admins/managers */}
          {canViewStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="card hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Total Employees
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {stats.totalEmployees}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {stats.activeEmployees} active
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="card hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Organisations</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {stats.totalOrganisations}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-primary-600" />
                  </div>
                </div>
              </div>

              <div className="card hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Departments</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {stats.totalDepartments}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="card hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Attendance Rate
                    </p>
                    <p className="text-3xl font-bold text-green-600">94%</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <UserCheck className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Quick Actions
              </h2>
              <div className="space-y-3">
                {canViewStats && (
                  <>
                    <button className="w-full text-left px-4 py-3 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors">
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-primary-600" />
                        <div>
                          <p className="font-medium text-gray-900">
                            Add New Employee
                          </p>
                          <p className="text-sm text-gray-600">
                            Onboard a new team member
                          </p>
                        </div>
                      </div>
                    </button>
                    <button className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                      <div className="flex items-center gap-3">
                        <Briefcase className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-gray-900">
                            Create Department
                          </p>
                          <p className="text-sm text-gray-600">
                            Add a new department
                          </p>
                        </div>
                      </div>
                    </button>
                  </>
                )}
                <button className="w-full text-left px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">
                        Mark Attendance
                      </p>
                      <p className="text-sm text-gray-600">
                        Record your attendance
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Recent Activity
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      New employee onboarded
                    </p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Department created
                    </p>
                    <p className="text-xs text-gray-500">Yesterday</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Payroll processed
                    </p>
                    <p className="text-xs text-gray-500">2 days ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Employee Info Card - For regular employees */}
          {employee && user?.role === "EMPLOYEE" && (
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Your Information
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Employee ID</p>
                  <p className="font-medium text-gray-900">
                    {employee.employeeCode}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Department</p>
                  <p className="font-medium text-gray-900">
                    {employee.department?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Designation</p>
                  <p className="font-medium text-gray-900">
                    {employee.designation?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Organisation</p>
                  <p className="font-medium text-gray-900">
                    {employee.organisation?.name}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
