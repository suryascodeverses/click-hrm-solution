"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import Sidebar from "@/components/Sidebar";
import { useAuthStore } from "@/store/authStore";
import { Plus, Calendar, CheckCircle, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";

export default function LeavesPage() {
  const { employee, user } = useAuthStore();
  const [leaves, setLeaves] = useState<any[]>([]);
  const [balances, setBalances] = useState<any[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
  const [pendingLeaves, setPendingLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [formData, setFormData] = useState({
    leaveTypeId: "",
    startDate: "",
    endDate: "",
    days: 1,
    reason: "",
  });

  const canApprove = [
    "MANAGER",
    "HR_MANAGER",
    "ORG_ADMIN",
    "TENANT_ADMIN",
  ].includes(user?.role || "");

  useEffect(() => {
    if (employee) {
      fetchMyLeaves();
      fetchMyBalance();
      fetchLeaveTypes();
      if (canApprove) {
        fetchPendingLeaves();
      }
    }
  }, [employee]);

  const fetchMyLeaves = async () => {
    try {
      const response = await api.get(`/leaves/my-leaves/${employee!.id}`);
      setLeaves(response.data.data);
    } catch (error) {
      toast.error("Failed to load leaves");
    } finally {
      setLoading(false);
    }
  };

  const fetchMyBalance = async () => {
    try {
      const response = await api.get(`/leaves/my-balance/${employee!.id}`);
      setBalances(response.data.data);
    } catch (error) {
      console.error("Failed to load balance");
    }
  };

  const fetchLeaveTypes = async () => {
    try {
      const response = await api.get("/leaves/types");
      setLeaveTypes(response.data.data);
    } catch (error) {
      console.error("Failed to load leave types");
    }
  };

  const fetchPendingLeaves = async () => {
    try {
      const response = await api.get("/leaves/pending");
      setPendingLeaves(response.data.data);
    } catch (error) {
      console.error("Failed to load pending leaves");
    }
  };

  const calculateDays = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const days =
        Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) +
        1;
      setFormData({ ...formData, days: days > 0 ? days : 1 });
    }
  };

  useEffect(() => {
    calculateDays();
  }, [formData.startDate, formData.endDate]);

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/leaves/apply", {
        ...formData,
        employeeId: employee!.id,
      });
      toast.success("Leave application submitted!");
      setShowApplyModal(false);
      setFormData({
        leaveTypeId: "",
        startDate: "",
        endDate: "",
        days: 1,
        reason: "",
      });
      fetchMyLeaves();
      fetchMyBalance();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to apply leave");
    }
  };

  const handleApprove = async (leaveId: string) => {
    try {
      await api.put(`/leaves/${leaveId}/approve`);
      toast.success("Leave approved");
      fetchPendingLeaves();
    } catch (error) {
      toast.error("Failed to approve leave");
    }
  };

  const handleReject = async (leaveId: string) => {
    const reason = prompt("Reason for rejection:");
    if (!reason) return;

    try {
      await api.put(`/leaves/${leaveId}/reject`, { rejectedReason: reason });
      toast.success("Leave rejected");
      fetchPendingLeaves();
    } catch (error) {
      toast.error("Failed to reject leave");
    }
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
                Leave Management
              </h1>
              <p className="text-gray-600 mt-1">Apply and manage your leaves</p>
            </div>
            <button
              onClick={() => setShowApplyModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Apply Leave
            </button>
          </div>

          {/* Leave Balance */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {balances.map((balance) => (
              <div
                key={balance.id}
                className="card"
                style={{
                  borderLeft: `4px solid ${balance.leaveType.color || "#3B82F6"}`,
                }}
              >
                <p className="text-sm text-gray-600 mb-1">
                  {balance.leaveType.name}
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {balance.availableDays}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Total: {balance.totalDays} | Used: {balance.usedDays} |
                  Pending: {balance.pendingDays}
                </p>
              </div>
            ))}
          </div>

          {/* Pending Approvals (For Managers) */}
          {canApprove && pendingLeaves.length > 0 && (
            <div className="card mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Pending Approvals
              </h3>
              <div className="space-y-3">
                {pendingLeaves.map((leave) => (
                  <div
                    key={leave.id}
                    className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <p className="font-semibold text-gray-900">
                          {leave.employee.firstName} {leave.employee.lastName}
                        </p>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {leave.employee.employeeCode}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {leave.leaveType.name} |{" "}
                        {new Date(leave.startDate).toLocaleDateString()} -{" "}
                        {new Date(leave.endDate).toLocaleDateString()} (
                        {leave.days} days)
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {leave.reason}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(leave.id)}
                        className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleReject(leave.id)}
                        className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* My Leaves */}
          <div className="card">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              My Leave History
            </h3>

            {loading ? (
              <div className="text-center py-8 text-gray-600">Loading...</div>
            ) : leaves.length === 0 ? (
              <div className="text-center py-8 text-gray-600">
                No leaves applied yet
              </div>
            ) : (
              <div className="space-y-3">
                {leaves.map((leave) => (
                  <div
                    key={leave.id}
                    className={`p-4 rounded-lg border ${
                      leave.status === "APPROVED"
                        ? "bg-green-50 border-green-200"
                        : leave.status === "REJECTED"
                          ? "bg-red-50 border-red-200"
                          : "bg-yellow-50 border-yellow-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="font-semibold text-gray-900">
                            {leave.leaveType.name}
                          </p>
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              leave.status === "APPROVED"
                                ? "bg-green-100 text-green-800"
                                : leave.status === "REJECTED"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {leave.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {new Date(leave.startDate).toLocaleDateString()} -{" "}
                          {new Date(leave.endDate).toLocaleDateString()} (
                          {leave.days} days)
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {leave.reason}
                        </p>
                        {leave.rejectedReason && (
                          <p className="text-sm text-red-600 mt-2">
                            Rejection Reason: {leave.rejectedReason}
                          </p>
                        )}
                        {leave.approver && (
                          <p className="text-xs text-gray-500 mt-2">
                            {leave.status === "APPROVED"
                              ? "Approved"
                              : "Rejected"}{" "}
                            by {leave.approver.firstName}{" "}
                            {leave.approver.lastName}
                          </p>
                        )}
                      </div>
                      <Calendar className="w-12 h-12 text-gray-300" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Apply Leave Modal */}
          {showApplyModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl w-full max-w-2xl p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Apply for Leave
                </h2>

                <form onSubmit={handleApplyLeave} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Leave Type *
                    </label>
                    <select
                      required
                      className="input-field"
                      value={formData.leaveTypeId}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          leaveTypeId: e.target.value,
                        })
                      }
                    >
                      <option value="">Select Leave Type</option>
                      {leaveTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name} ({type.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        required
                        className="input-field"
                        value={formData.startDate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            startDate: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Date *
                      </label>
                      <input
                        type="date"
                        required
                        className="input-field"
                        value={formData.endDate}
                        onChange={(e) =>
                          setFormData({ ...formData, endDate: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Days
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      className="input-field bg-gray-50"
                      value={formData.days}
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason *
                    </label>
                    <textarea
                      required
                      className="input-field"
                      rows={3}
                      placeholder="Reason for leave..."
                      value={formData.reason}
                      onChange={(e) =>
                        setFormData({ ...formData, reason: e.target.value })
                      }
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button type="submit" className="btn-primary flex-1">
                      Submit Application
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowApplyModal(false)}
                      className="btn-secondary flex-1"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
