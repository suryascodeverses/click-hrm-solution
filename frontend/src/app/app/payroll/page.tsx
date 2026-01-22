"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import Sidebar from "@/components/Sidebar";
import { useAuthStore } from "@/store/authStore";
import { DollarSign, Download, Eye, CheckCircle, Calendar } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function PayrollPage() {
  const { user, employee } = useAuthStore();
  const [payslips, setPayslips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [generating, setGenerating] = useState(false);

  const isAdmin = ["TENANT_ADMIN", "ORG_ADMIN", "HR_MANAGER"].includes(
    user?.role || "",
  );

  useEffect(() => {
    fetchPayslips();
  }, [selectedMonth, selectedYear]);

  const fetchPayslips = async () => {
    try {
      if (isAdmin) {
        const response = await api.get("/payroll/payslips", {
          params: { month: selectedMonth, year: selectedYear },
        });
        setPayslips(response.data.data);
      } else {
        const response = await api.get(`/payroll/payslips/${employee!.id}`);
        setPayslips(response.data.data);
      }
    } catch (error) {
      toast.error("Failed to load payslips");
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePayslips = async () => {
    setGenerating(true);
    try {
      await api.post(`/payroll/generate/${selectedMonth}/${selectedYear}`);
      toast.success("Payslips generated successfully!");
      fetchPayslips();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to generate payslips",
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleMarkAsPaid = async (payslipId: string) => {
    try {
      await api.put(`/payroll/payslip/${payslipId}/status`, { status: "PAID" });
      toast.success("Marked as paid");
      fetchPayslips();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const getMonthName = (month: number) => {
    return new Date(2024, month - 1).toLocaleString("default", {
      month: "long",
    });
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
                Payroll Management
              </h1>
              <p className="text-gray-600 mt-1">
                {isAdmin
                  ? "Manage employee payroll and salary"
                  : "View your payslips"}
              </p>
            </div>
          </div>

          {/* Filters & Actions */}
          {isAdmin && (
            <div className="card mb-6">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Month
                  </label>
                  <select
                    className="input-field"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(
                      (month) => (
                        <option key={month} value={month}>
                          {getMonthName(month)}
                        </option>
                      ),
                    )}
                  </select>
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Year
                  </label>
                  <select
                    className="input-field"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  >
                    {Array.from(
                      { length: 5 },
                      (_, i) => new Date().getFullYear() - i,
                    ).map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex-1 self-end">
                  <button
                    onClick={handleGeneratePayslips}
                    disabled={generating}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-5 h-5" />
                    {generating ? "Generating..." : "Generate Payslips"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Stats for Admin */}
          {isAdmin && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="card">
                <p className="text-sm text-gray-600 mb-1">Total Payslips</p>
                <p className="text-2xl font-bold text-gray-900">
                  {payslips.length}
                </p>
              </div>
              <div className="card">
                <p className="text-sm text-gray-600 mb-1">Draft</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {payslips.filter((p) => p.status === "DRAFT").length}
                </p>
              </div>
              <div className="card">
                <p className="text-sm text-gray-600 mb-1">Processed</p>
                <p className="text-2xl font-bold text-blue-600">
                  {payslips.filter((p) => p.status === "PROCESSED").length}
                </p>
              </div>
              <div className="card">
                <p className="text-sm text-gray-600 mb-1">Paid</p>
                <p className="text-2xl font-bold text-green-600">
                  {payslips.filter((p) => p.status === "PAID").length}
                </p>
              </div>
            </div>
          )}

          {/* Payslips Table */}
          <div className="card">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {isAdmin ? "All Payslips" : "My Payslips"}
            </h3>

            {loading ? (
              <div className="text-center py-12 text-gray-600">Loading...</div>
            ) : payslips.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No payslips found</p>
                {isAdmin && (
                  <button
                    onClick={handleGeneratePayslips}
                    className="btn-primary mt-4"
                  >
                    Generate Payslips
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {isAdmin && (
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          Employee
                        </th>
                      )}
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Period
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Days
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Earnings
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Deductions
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Net Pay
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {payslips.map((payslip) => (
                      <tr key={payslip.id} className="hover:bg-gray-50">
                        {isAdmin && (
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium text-gray-900">
                                {payslip.employee.firstName}{" "}
                                {payslip.employee.lastName}
                              </p>
                              <p className="text-sm text-gray-500">
                                {payslip.employee.employeeCode}
                              </p>
                            </div>
                          </td>
                        )}
                        <td className="py-3 px-4 text-sm text-gray-900">
                          {getMonthName(payslip.month)} {payslip.year}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {payslip.presentDays}/{payslip.workingDays}
                        </td>
                        <td className="py-3 px-4 text-sm font-medium text-green-600">
                          ₹{parseFloat(payslip.totalEarnings).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-sm font-medium text-red-600">
                          ₹
                          {parseFloat(payslip.totalDeductions).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-sm font-bold text-gray-900">
                          ₹{parseFloat(payslip.netPay).toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              payslip.status === "PAID"
                                ? "bg-green-100 text-green-800"
                                : payslip.status === "PROCESSED"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {payslip.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/app/payslip/${payslip.id}`}
                              className="p-1 hover:bg-gray-100 rounded"
                              title="View"
                            >
                              <Eye className="w-4 h-4 text-blue-600" />
                            </Link>
                            {isAdmin && payslip.status !== "PAID" && (
                              <button
                                onClick={() => handleMarkAsPaid(payslip.id)}
                                className="p-1 hover:bg-gray-100 rounded"
                                title="Mark as Paid"
                              >
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
