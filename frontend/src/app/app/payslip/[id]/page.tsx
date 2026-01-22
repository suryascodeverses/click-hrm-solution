"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import Sidebar from "@/components/Sidebar";
import { Download, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function PayslipDetailPage() {
  const params = useParams();
  const [payslip, setPayslip] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayslip();
  }, []);

  const fetchPayslip = async () => {
    try {
      const response = await api.get(`/payroll/payslip/${params.id}`);
      setPayslip(response.data.data);
    } catch (error) {
      toast.error("Failed to load payslip");
    } finally {
      setLoading(false);
    }
  };

  const getMonthName = (month: number) => {
    return new Date(2024, month - 1).toLocaleString("default", {
      month: "long",
    });
  };

  if (loading || !payslip) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-gray-600">Loading payslip...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 ml-64 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link
                href="/app/payroll"
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Payslip</h1>
                <p className="text-gray-600 mt-1">
                  {getMonthName(payslip.month)} {payslip.year}
                </p>
              </div>
            </div>
            <button className="btn-primary flex items-center gap-2">
              <Download className="w-5 h-5" />
              Download PDF
            </button>
          </div>

          {/* Payslip Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-4xl mx-auto">
            {/* Company Header */}
            <div className="text-center border-b border-gray-200 pb-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {payslip.employee.organisation.name}
              </h2>
              <p className="text-gray-600 mt-1">
                Payslip for {getMonthName(payslip.month)} {payslip.year}
              </p>
            </div>

            {/* Employee Details */}
            <div className="grid grid-cols-2 gap-6 mb-6 pb-6 border-b border-gray-200">
              <div>
                <p className="text-sm text-gray-600">Employee Name</p>
                <p className="font-semibold text-gray-900">
                  {payslip.employee.firstName} {payslip.employee.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Employee Code</p>
                <p className="font-semibold text-gray-900">
                  {payslip.employee.employeeCode}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Department</p>
                <p className="font-semibold text-gray-900">
                  {payslip.employee.department?.name || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Designation</p>
                <p className="font-semibold text-gray-900">
                  {payslip.employee.designation?.name || "N/A"}
                </p>
              </div>
            </div>

            {/* Attendance Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">
                Attendance Summary
              </h3>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Working Days</p>
                  <p className="text-lg font-bold text-gray-900">
                    {payslip.workingDays}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Present</p>
                  <p className="text-lg font-bold text-green-600">
                    {payslip.presentDays}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Leave</p>
                  <p className="text-lg font-bold text-blue-600">
                    {payslip.leaveDays}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Absent</p>
                  <p className="text-lg font-bold text-red-600">
                    {payslip.absentDays}
                  </p>
                </div>
              </div>
            </div>

            {/* Earnings & Deductions */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* Earnings */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  Earnings
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Basic Salary</span>
                    <span className="font-medium text-gray-900">
                      ₹{parseFloat(payslip.basicPay).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">HRA</span>
                    <span className="font-medium text-gray-900">
                      ₹{parseFloat(payslip.hra).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Conveyance</span>
                    <span className="font-medium text-gray-900">
                      ₹{parseFloat(payslip.conveyance).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Medical</span>
                    <span className="font-medium text-gray-900">
                      ₹{parseFloat(payslip.medical).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Special Allowance</span>
                    <span className="font-medium text-gray-900">
                      ₹{parseFloat(payslip.specialAllowance).toLocaleString()}
                    </span>
                  </div>
                  {parseFloat(payslip.bonus) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bonus</span>
                      <span className="font-medium text-gray-900">
                        ₹{parseFloat(payslip.bonus).toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="font-semibold text-gray-900">
                      Total Earnings
                    </span>
                    <span className="font-bold text-green-600">
                      ₹{parseFloat(payslip.totalEarnings).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  Deductions
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Provident Fund</span>
                    <span className="font-medium text-gray-900">
                      ₹{parseFloat(payslip.providentFund).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Professional Tax</span>
                    <span className="font-medium text-gray-900">
                      ₹{parseFloat(payslip.professionalTax).toLocaleString()}
                    </span>
                  </div>
                  {parseFloat(payslip.incomeTax) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Income Tax</span>
                      <span className="font-medium text-gray-900">
                        ₹{parseFloat(payslip.incomeTax).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {parseFloat(payslip.otherDeductions) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Other Deductions</span>
                      <span className="font-medium text-gray-900">
                        ₹{parseFloat(payslip.otherDeductions).toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="font-semibold text-gray-900">
                      Total Deductions
                    </span>
                    <span className="font-bold text-red-600">
                      ₹{parseFloat(payslip.totalDeductions).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Net Pay */}
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 text-center">
              <p className="text-sm text-gray-600 mb-1">Net Pay</p>
              <p className="text-4xl font-bold text-primary-600">
                ₹{parseFloat(payslip.netPay).toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {payslip.status === "PAID" && payslip.paidOn && (
                  <>Paid on {new Date(payslip.paidOn).toLocaleDateString()}</>
                )}
              </p>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
              <p>
                This is a system-generated payslip and does not require a
                signature.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
