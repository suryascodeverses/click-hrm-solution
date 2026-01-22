"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import Sidebar from "@/components/Sidebar";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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
import { Download, Calendar, Users, TrendingUp } from "lucide-react";
import { toast } from "sonner";

const COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
];

export default function ReportsPage() {
  const [reportType, setReportType] = useState("attendance");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetchReport();
  }, [reportType, month, year]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      let response;
      switch (reportType) {
        case "attendance":
          response = await api.get("/reports/attendance", {
            params: { month, year },
          });
          break;
        case "leave":
          response = await api.get("/reports/leave", { params: { year } });
          break;
        case "headcount":
          response = await api.get("/reports/employee-headcount");
          break;
        case "payroll":
          response = await api.get("/reports/payroll", {
            params: { month, year },
          });
          break;
      }
      setData(response?.data.data);
    } catch (error) {
      toast.error("Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!data) return;

    let csvContent = "";
    let filename = "";

    switch (reportType) {
      case "attendance":
        filename = `attendance-report-${month}-${year}.csv`;
        csvContent =
          "Employee Code,Name,Present,Absent,Late,On Leave,Total Hours\n";
        data.forEach((row: any) => {
          csvContent += `${row.employee.employeeCode},${row.employee.firstName} ${row.employee.lastName},${row.present},${row.absent},${row.late},${row.onLeave},${row.totalHours.toFixed(1)}\n`;
        });
        break;
      // Add other export cases
    }

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    toast.success("Report exported successfully");
  };

  const getMonthName = (m: number) => {
    return new Date(2024, m - 1).toLocaleString("default", { month: "long" });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 ml-64 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Reports & Analytics
              </h1>
              <p className="text-gray-600 mt-1">
                View insights and download reports
              </p>
            </div>
            <button
              onClick={exportToCSV}
              className="btn-primary flex items-center gap-2"
              disabled={!data}
            >
              <Download className="w-5 h-5" />
              Export CSV
            </button>
          </div>

          {/* Filters */}
          <div className="card mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Type
                </label>
                <select
                  className="input-field"
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                >
                  <option value="attendance">Attendance Report</option>
                  <option value="leave">Leave Report</option>
                  <option value="headcount">Employee Headcount</option>
                  <option value="payroll">Payroll Report</option>
                </select>
              </div>

              {(reportType === "attendance" || reportType === "payroll") && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Month
                    </label>
                    <select
                      className="input-field"
                      value={month}
                      onChange={(e) => setMonth(parseInt(e.target.value))}
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                        <option key={m} value={m}>
                          {getMonthName(m)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Year
                    </label>
                    <select
                      className="input-field"
                      value={year}
                      onChange={(e) => setYear(parseInt(e.target.value))}
                    >
                      {Array.from(
                        { length: 5 },
                        (_, i) => new Date().getFullYear() - i,
                      ).map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Charts & Data */}
          {loading ? (
            <div className="text-center py-12 text-gray-600">
              Loading report...
            </div>
          ) : !data ? (
            <div className="text-center py-12 text-gray-600">
              No data available
            </div>
          ) : (
            <>
              {/* Attendance Report */}
              {reportType === "attendance" && (
                <div className="space-y-6">
                  <div className="card">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Attendance Overview
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                              Employee
                            </th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                              Department
                            </th>
                            <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                              Present
                            </th>
                            <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                              Absent
                            </th>
                            <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                              Late
                            </th>
                            <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                              On Leave
                            </th>
                            <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                              Total Hours
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {data.map((row: any) => (
                            <tr
                              key={row.employee.id}
                              className="hover:bg-gray-50"
                            >
                              <td className="py-3 px-4">
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {row.employee.firstName}{" "}
                                    {row.employee.lastName}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {row.employee.employeeCode}
                                  </p>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-600">
                                {row.employee.department?.name || "N/A"}
                              </td>
                              <td className="py-3 px-4 text-center">
                                <span className="text-green-600 font-semibold">
                                  {row.present}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <span className="text-red-600 font-semibold">
                                  {row.absent}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <span className="text-orange-600 font-semibold">
                                  {row.late}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <span className="text-blue-600 font-semibold">
                                  {row.onLeave}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-center font-semibold text-gray-900">
                                {row.totalHours.toFixed(1)}h
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Headcount Report */}
              {reportType === "headcount" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="card">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Department-wise Distribution
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={data.byDepartment}
                          dataKey="employees"
                          nameKey="department"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label
                        >
                          {data.byDepartment.map(
                            (entry: any, index: number) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ),
                          )}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="card">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Employment Type
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={data.byEmploymentType}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="employmentType" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="_count" fill="#3B82F6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Payroll Report */}
              {reportType === "payroll" && data.totals && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="card">
                      <p className="text-sm text-gray-600 mb-1">
                        Total Earnings
                      </p>
                      <p className="text-2xl font-bold text-green-600">
                        ₹{data.totals.totalEarnings.toLocaleString()}
                      </p>
                    </div>
                    <div className="card">
                      <p className="text-sm text-gray-600 mb-1">
                        Total Deductions
                      </p>
                      <p className="text-2xl font-bold text-red-600">
                        ₹{data.totals.totalDeductions.toLocaleString()}
                      </p>
                    </div>
                    <div className="card">
                      <p className="text-sm text-gray-600 mb-1">Net Payroll</p>
                      <p className="text-2xl font-bold text-primary-600">
                        ₹{data.totals.netPay.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="card">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Department-wise Salary Cost
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={data.byDepartment}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="department" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar
                          dataKey="totalCost"
                          fill="#10B981"
                          name="Total Cost (₹)"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
