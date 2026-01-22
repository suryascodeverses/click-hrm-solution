"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import SuperAdminSidebar from "@/components/SuperAdminSidebar";
import {
  Users,
  Search,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Shield,
} from "lucide-react";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  tenant: {
    id: string;
    name: string;
    subdomain: string;
  };
  employee?: {
    firstName: string;
    lastName: string;
    employeeCode: string;
  };
}

export default function SuperAdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTenant, setFilterTenant] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    role: "",
    isActive: true,
  });

  useEffect(() => {
    fetchUsers();
    fetchTenants();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get("/super-admin/users");
      setUsers(response.data.data);
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const fetchTenants = async () => {
    try {
      const response = await api.get("/super-admin/tenants");
      setTenants(response.data.data);
    } catch (error) {
      console.error("Failed to load tenants");
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setEditFormData({
      role: user.role,
      isActive: user.isActive,
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put(`/super-admin/users/${selectedUser!.id}`, editFormData);
      toast.success("User updated successfully");
      setShowEditModal(false);
      fetchUsers();
    } catch (error) {
      toast.error("Failed to update user");
    }
  };

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    try {
      await api.put(`/super-admin/users/${userId}`, {
        isActive: !currentStatus,
      });
      toast.success(
        `User ${!currentStatus ? "activated" : "deactivated"} successfully`,
      );
      fetchUsers();
    } catch (error) {
      toast.error("Failed to update user status");
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (
      !confirm(
        `⚠️ DELETE USER "${userEmail}"?\n\nThis will permanently delete the user account.\n\nType "DELETE" to confirm`,
      )
    ) {
      return;
    }

    try {
      await api.delete(`/super-admin/users/${userId}`);
      toast.success("User deleted successfully");
      fetchUsers();
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.employee?.firstName + " " + user.employee?.lastName)
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      user.tenant.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTenant = !filterTenant || user.tenant.id === filterTenant;
    const matchesRole = !filterRole || user.role === filterRole;

    return matchesSearch && matchesTenant && matchesRole;
  });

  const stats = {
    total: users.length,
    active: users.filter((u) => u.isActive).length,
    inactive: users.filter((u) => !u.isActive).length,
    byRole: {
      tenant_admin: users.filter((u) => u.role === "TENANT_ADMIN").length,
      org_admin: users.filter((u) => u.role === "ORG_ADMIN").length,
      hr_manager: users.filter((u) => u.role === "HR_MANAGER").length,
      manager: users.filter((u) => u.role === "MANAGER").length,
      employee: users.filter((u) => u.role === "EMPLOYEE").length,
    },
  };

  const roles = [
    "TENANT_ADMIN",
    "ORG_ADMIN",
    "HR_MANAGER",
    "MANAGER",
    "EMPLOYEE",
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <SuperAdminSidebar />

      <div className="flex-1 ml-64 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">All Users</h1>
            <p className="text-gray-600 mt-1">
              Manage users across all tenants
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="card">
              <p className="text-sm text-gray-600 mb-1">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-600 mb-1">Active Users</p>
              <p className="text-3xl font-bold text-green-600">
                {stats.active}
              </p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-600 mb-1">Inactive Users</p>
              <p className="text-3xl font-bold text-red-600">
                {stats.inactive}
              </p>
            </div>
          </div>

          {/* Role Distribution */}
          <div className="card mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Users by Role</h3>
            <div className="grid grid-cols-5 gap-4">
              {Object.entries(stats.byRole).map(([role, count]) => (
                <div key={role} className="text-center">
                  <p className="text-2xl font-bold text-primary-600">{count}</p>
                  <p className="text-xs text-gray-600 mt-1 capitalize">
                    {role.replace("_", " ")}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="card mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  className="input-field pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div>
                <select
                  className="input-field"
                  value={filterTenant}
                  onChange={(e) => setFilterTenant(e.target.value)}
                >
                  <option value="">All Tenants</option>
                  {tenants.map((tenant) => (
                    <option key={tenant.id} value={tenant.id}>
                      {tenant.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  className="input-field"
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                >
                  <option value="">All Roles</option>
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="card">
            {loading ? (
              <div className="text-center py-12 text-gray-600">
                Loading users...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12 text-gray-600">
                No users found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        User
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Tenant
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Role
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Last Login
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
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {user.employee
                                ? `${user.employee.firstName} ${user.employee.lastName}`
                                : user.email.split("@")[0]}
                            </p>
                            <p className="text-sm text-gray-500">
                              {user.email}
                            </p>
                            {user.employee && (
                              <p className="text-xs text-gray-400">
                                {user.employee.employeeCode}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-gray-900">
                              {user.tenant.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {user.tenant.subdomain}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${
                              user.role === "TENANT_ADMIN"
                                ? "bg-purple-100 text-purple-800"
                                : user.role === "ORG_ADMIN"
                                  ? "bg-blue-100 text-blue-800"
                                  : user.role === "HR_MANAGER"
                                    ? "bg-green-100 text-green-800"
                                    : user.role === "MANAGER"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {user.role === "TENANT_ADMIN" && (
                              <Shield className="w-3 h-3" />
                            )}
                            {user.role.replace("_", " ")}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {user.lastLogin
                            ? new Date(user.lastLogin).toLocaleString()
                            : "Never"}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {user.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(user)}
                              className="p-1 hover:bg-gray-100 rounded"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4 text-gray-600" />
                            </button>
                            <button
                              onClick={() =>
                                handleToggleActive(user.id, user.isActive)
                              }
                              className="p-1 hover:bg-gray-100 rounded"
                              title={user.isActive ? "Deactivate" : "Activate"}
                            >
                              {user.isActive ? (
                                <XCircle className="w-4 h-4 text-red-600" />
                              ) : (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              )}
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteUser(user.id, user.email)
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

          {/* Edit Modal */}
          {showEditModal && selectedUser && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl w-full max-w-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Edit User
                </h2>

                <form onSubmit={handleUpdateUser} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email (Read-only)
                    </label>
                    <input
                      type="email"
                      className="input-field bg-gray-50"
                      value={selectedUser.email}
                      disabled
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role
                    </label>
                    <select
                      className="input-field"
                      value={editFormData.role}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          role: e.target.value,
                        })
                      }
                    >
                      {roles.map((role) => (
                        <option key={role} value={role}>
                          {role.replace("_", " ")}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editFormData.isActive}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            isActive: e.target.checked,
                          })
                        }
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Active User
                      </span>
                    </label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button type="submit" className="btn-primary flex-1">
                      Update User
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
