"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import SuperAdminSidebar from "@/components/SuperAdminSidebar";
import {
  DollarSign,
  CreditCard,
  FileText,
  TrendingUp,
  CheckCircle,
  XCircle,
  Search,
  Download,
} from "lucide-react";
import { toast } from "sonner";

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    trial: 0,
    cancelled: 0,
    totalRevenue: 0,
  });

  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, subsRes, invoicesRes, paymentsRes, plansRes] =
        await Promise.all([
          api.get("/super-admin/billing/subscriptions/stats"),
          api.get("/super-admin/billing/subscriptions"),
          api.get("/super-admin/billing/invoices"),
          api.get("/super-admin/billing/payments"),
          api.get("/super-admin/billing/plans"),
        ]);

      setStats(statsRes.data.data.stats);
      setSubscriptions(subsRes.data.data);
      setInvoices(invoicesRes.data.data);
      setPayments(paymentsRes.data.data);
      setPlans(plansRes.data.data);
    } catch (error) {
      toast.error("Failed to load billing data");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPaid = async (invoiceId: string) => {
    const transactionId = prompt("Enter transaction ID (optional):");
    try {
      await api.post(`/super-admin/billing/invoices/${invoiceId}/mark-paid`, {
        paymentMethod: "MANUAL",
        transactionId,
      });
      toast.success("Invoice marked as paid");
      fetchData();
    } catch (error) {
      toast.error("Failed to mark invoice as paid");
    }
  };

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const matchesSearch = sub.tenant.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || sub.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch = inv.subscription.tenant.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || inv.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex h-screen bg-gray-50">
      <SuperAdminSidebar />

      <div className="flex-1 ml-64 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Billing & Subscriptions
            </h1>
            <p className="text-gray-600 mt-1">
              Manage subscriptions, invoices, and payments
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="card">
              <p className="text-sm text-gray-600 mb-1">Total Subscriptions</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-600 mb-1">Active</p>
              <p className="text-3xl font-bold text-green-600">
                {stats.active}
              </p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-600 mb-1">Trial</p>
              <p className="text-3xl font-bold text-blue-600">{stats.trial}</p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-600 mb-1">Cancelled</p>
              <p className="text-3xl font-bold text-red-600">
                {stats.cancelled}
              </p>
            </div>
            <div className="card">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary-600" />
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold text-primary-600">
                    ${Number(stats.totalRevenue).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="card mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex gap-8">
                {[
                  "overview",
                  "subscriptions",
                  "invoices",
                  "payments",
                  "plans",
                ].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-4 px-1 border-b-2 font-medium capitalize ${
                      activeTab === tab
                        ? "border-primary-600 text-primary-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </nav>
            </div>

            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  {payments.slice(0, 5).map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {payment.subscription.tenant.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(payment.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          ${Number(payment.amount).toFixed(2)}
                        </p>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            payment.status === "SUCCEEDED"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {payment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Subscriptions Tab */}
            {activeTab === "subscriptions" && (
              <div className="p-6">
                <div className="flex gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search tenants..."
                      className="input-field pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <select
                    className="input-field"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="">All Status</option>
                    <option value="TRIAL">Trial</option>
                    <option value="ACTIVE">Active</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          Tenant
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          Plan
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          Billing Cycle
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          Next Billing
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredSubscriptions.map((sub) => (
                        <tr key={sub.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <p className="font-medium text-gray-900">
                              {sub.tenant.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {sub.tenant.subdomain}
                            </p>
                          </td>
                          <td className="py-3 px-4 font-medium">
                            {sub.plan.displayName}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                sub.status === "ACTIVE"
                                  ? "bg-green-100 text-green-800"
                                  : sub.status === "TRIAL"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {sub.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 capitalize">
                            {sub.billingCycle.toLowerCase()}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {new Date(
                              sub.currentPeriodEnd
                            ).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Invoices Tab */}
            {activeTab === "invoices" && (
              <div className="p-6">
                <div className="flex gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search invoices..."
                      className="input-field pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <select
                    className="input-field"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="">All Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="PAID">Paid</option>
                    <option value="OVERDUE">Overdue</option>
                  </select>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          Invoice #
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          Tenant
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          Amount
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          Due Date
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredInvoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4 font-mono text-sm">
                            {inv.invoiceNumber}
                          </td>
                          <td className="py-3 px-4">
                            {inv.subscription.tenant.name}
                          </td>
                          <td className="py-3 px-4 font-bold">
                            ${Number(inv.total).toFixed(2)}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                inv.status === "PAID"
                                  ? "bg-green-100 text-green-800"
                                  : inv.status === "OVERDUE"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {inv.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {new Date(inv.dueDate).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            {inv.status === "PENDING" && (
                              <button
                                onClick={() => handleMarkPaid(inv.id)}
                                className="text-sm text-primary-600 hover:text-primary-800 font-medium"
                              >
                                Mark Paid
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Payments Tab */}
            {activeTab === "payments" && (
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          Date
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          Tenant
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          Amount
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          Method
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          Transaction ID
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {payments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm">
                            {new Date(payment.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            {payment.subscription.tenant.name}
                          </td>
                          <td className="py-3 px-4 font-bold">
                            ${Number(payment.amount).toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {payment.paymentMethod}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                payment.status === "SUCCEEDED"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {payment.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm font-mono">
                            {payment.transactionId || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Plans Tab */}
            {activeTab === "plans" && (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {plans.map((plan) => (
                    <div
                      key={plan.id}
                      className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
                    >
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {plan.displayName}
                      </h3>
                      <div className="mb-4">
                        <span className="text-4xl font-bold text-primary-600">
                          ${Number(plan.price).toFixed(0)}
                        </span>
                        <span className="text-gray-600">/month</span>
                      </div>
                      <div className="space-y-2 mb-6">
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>{plan.maxEmployees} Employees</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>{plan.maxOrganisations} Organisations</span>
                        </div>
                      </div>
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                          plan.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {plan.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
