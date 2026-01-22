"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import SuperAdminSidebar from "@/components/SuperAdminSidebar";
import {
  Building2,
  Users,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Eye,
  Search,
} from "lucide-react";
import { toast } from "sonner";

interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  email: string;
  phone?: string;
  status: string;
  subscriptionTier: string;
  maxEmployees: number;
  createdAt: string;
  _count: {
    users: number;
    organisations: number;
  };
}

export default function SuperAdminTenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subscriptionTier: "",
    maxEmployees: 10,
    status: "",
  });

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      const response = await api.get("/super-admin/tenants");
      setTenants(response.data.data);
    } catch (error) {
      toast.error("Failed to load tenants");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setShowDetailsModal(true);
  };

  const handleEdit = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setEditFormData({
      name: tenant.name,
      email: tenant.email,
      phone: tenant.phone || "",
      subscriptionTier: tenant.subscriptionTier,
      maxEmployees: tenant.maxEmployees,
      status: tenant.status,
    });
    setShowEditModal(true);
  };

  const handleUpdateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put(`/super-admin/tenants/${selectedTenant!.id}`, editFormData);
      toast.success("Tenant updated successfully");
      setShowEditModal(false);
      fetchTenants();
    } catch (error) {
      toast.error("Failed to update tenant");
    }
  };

  const handleToggleStatus = async (
    tenantId: string,
    currentStatus: string,
  ) => {
    const newStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";

    if (
      !confirm(
        `Are you sure you want to ${newStatus === "SUSPENDED" ? "suspend" : "activate"} this tenant?`,
      )
    ) {
      return;
    }

    try {
      await api.put(`/super-admin/tenants/${tenantId}/status`, {
        status: newStatus,
      });
      toast.success(
        `Tenant ${newStatus === "SUSPENDED" ? "suspended" : "activated"} successfully`,
      );
      fetchTenants();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleDeleteTenant = async (tenantId: string, tenantName: string) => {
    if (
      !confirm(
        `⚠️ DELETE TENANT "${tenantName}"?\n\nThis will permanently delete:\n- All organisations\n- All employees\n- All data\n\nType "DELETE" to confirm`,
      )
    ) {
      return;
    }

    const confirmation = prompt(`Type "${tenantName}" to confirm deletion:`);
    if (confirmation !== tenantName) {
      toast.error("Deletion cancelled - name did not match");
      return;
    }

    try {
      await api.delete(`/super-admin/tenants/${tenantId}`);
      toast.success("Tenant deleted successfully");
      fetchTenants();
    } catch (error) {
      toast.error("Failed to delete tenant");
    }
  };

  const filteredTenants = tenants.filter(
    (tenant) =>
      tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.subdomain.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const stats = {
    total: tenants.length,
    active: tenants.filter((t) => t.status === "ACTIVE").length,
    suspended: tenants.filter((t) => t.status === "SUSPENDED").length,
    inactive: tenants.filter((t) => t.status === "INACTIVE").length,
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <SuperAdminSidebar />

      <div className="flex-1 ml-64 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Tenants Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage all platform tenants and subscriptions
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="card">
              <p className="text-sm text-gray-600 mb-1">Total Tenants</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-600 mb-1">Active</p>
              <p className="text-3xl font-bold text-green-600">
                {stats.active}
              </p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-600 mb-1">Suspended</p>
              <p className="text-3xl font-bold text-red-600">
                {stats.suspended}
              </p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-600 mb-1">Inactive</p>
              <p className="text-3xl font-bold text-gray-600">
                {stats.inactive}
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="card mb-6">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search tenants by name, subdomain, or email..."
                className="input-field pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Tenants Table */}
          <div className="card">
            {loading ? (
              <div className="text-center py-12 text-gray-600">
                Loading tenants...
              </div>
            ) : filteredTenants.length === 0 ? (
              <div className="text-center py-12 text-gray-600">
                No tenants found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Company
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Subdomain
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Contact
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Plan
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Users/Orgs
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
                    {filteredTenants.map((tenant) => (
                      <tr key={tenant.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {tenant.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              Joined{" "}
                              {new Date(tenant.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                            {tenant.subdomain}
                          </code>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm">
                            <p className="text-gray-900">{tenant.email}</p>
                            {tenant.phone && (
                              <p className="text-gray-500">{tenant.phone}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              tenant.subscriptionTier === "ENTERPRISE"
                                ? "bg-purple-100 text-purple-800"
                                : tenant.subscriptionTier === "PREMIUM"
                                  ? "bg-blue-100 text-blue-800"
                                  : tenant.subscriptionTier === "BASIC"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {tenant.subscriptionTier}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            Max: {tenant.maxEmployees} employees
                          </p>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {tenant._count.users}
                            </span>
                            <span className="flex items-center gap-1">
                              <Building2 className="w-4 h-4" />
                              {tenant._count.organisations}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              tenant.status === "ACTIVE"
                                ? "bg-green-100 text-green-800"
                                : tenant.status === "SUSPENDED"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {tenant.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewDetails(tenant)}
                              className="p-1 hover:bg-gray-100 rounded"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4 text-blue-600" />
                            </button>
                            <button
                              onClick={() => handleEdit(tenant)}
                              className="p-1 hover:bg-gray-100 rounded"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4 text-gray-600" />
                            </button>
                            <button
                              onClick={() =>
                                handleToggleStatus(tenant.id, tenant.status)
                              }
                              className="p-1 hover:bg-gray-100 rounded"
                              title={
                                tenant.status === "ACTIVE"
                                  ? "Suspend"
                                  : "Activate"
                              }
                            >
                              {tenant.status === "ACTIVE" ? (
                                <XCircle className="w-4 h-4 text-red-600" />
                              ) : (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              )}
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteTenant(tenant.id, tenant.name)
                              }
                              className="p-1 hover:bg-gray-100 rounded"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Details Modal */}
          {showDetailsModal && selectedTenant && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl w-full max-w-2xl p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Tenant Details
                </h2>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600">
                        Company Name
                      </label>
                      <p className="font-semibold text-gray-900">
                        {selectedTenant.name}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Subdomain</label>
                      <p className="font-semibold text-gray-900">
                        {selectedTenant.subdomain}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Email</label>
                      <p className="font-semibold text-gray-900">
                        {selectedTenant.email}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Phone</label>
                      <p className="font-semibold text-gray-900">
                        {selectedTenant.phone || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Status</label>
                      <p className="font-semibold text-gray-900">
                        {selectedTenant.status}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">
                        Subscription Tier
                      </label>
                      <p className="font-semibold text-gray-900">
                        {selectedTenant.subscriptionTier}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">
                        Max Employees
                      </label>
                      <p className="font-semibold text-gray-900">
                        {selectedTenant.maxEmployees}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Created</label>
                      <p className="font-semibold text-gray-900">
                        {new Date(
                          selectedTenant.createdAt,
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">
                        Total Users
                      </label>
                      <p className="font-semibold text-gray-900">
                        {selectedTenant._count.users}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">
                        Organisations
                      </label>
                      <p className="font-semibold text-gray-900">
                        {selectedTenant._count.organisations}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="btn-secondary"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Edit Modal */}
          {showEditModal && selectedTenant && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl w-full max-w-2xl p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Edit Tenant
                </h2>

                <form onSubmit={handleUpdateTenant} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company Name
                      </label>
                      <input
                        type="text"
                        className="input-field"
                        value={editFormData.name}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        className="input-field"
                        value={editFormData.email}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            email: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        className="input-field"
                        value={editFormData.phone}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            phone: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        className="input-field"
                        value={editFormData.status}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            status: e.target.value,
                          })
                        }
                      >
                        <option value="ACTIVE">Active</option>
                        <option value="SUSPENDED">Suspended</option>
                        <option value="INACTIVE">Inactive</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subscription Tier
                      </label>
                      <select
                        className="input-field"
                        value={editFormData.subscriptionTier}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            subscriptionTier: e.target.value,
                          })
                        }
                      >
                        <option value="FREE">Free</option>
                        <option value="BASIC">Basic</option>
                        <option value="PREMIUM">Premium</option>
                        <option value="ENTERPRISE">Enterprise</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Employees
                      </label>
                      <input
                        type="number"
                        className="input-field"
                        value={editFormData.maxEmployees}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            maxEmployees: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button type="submit" className="btn-primary flex-1">
                      Update Tenant
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
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
