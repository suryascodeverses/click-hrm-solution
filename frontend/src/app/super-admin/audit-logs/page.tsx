"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import SuperAdminSidebar from "@/components/SuperAdminSidebar";
import {
  Shield,
  Search,
  Download,
  Filter,
  Calendar,
  User,
  Activity,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

interface AuditLog {
  id: string;
  tenantId?: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  action: string;
  entity?: string;
  entityId?: string;
  description?: string;
  changes?: any;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

interface Tenant {
  id: string;
  name: string;
  subdomain: string;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalLogs: 0,
    last24Hours: 0,
    loginAttempts: 0,
    failedLogins: 0,
  });

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTenant, setFilterTenant] = useState("");
  const [filterAction, setFilterAction] = useState("");
  const [filterEntity, setFilterEntity] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 50;

  // Available filters
  const [availableActions, setAvailableActions] = useState<string[]>([]);
  const [availableEntities, setAvailableEntities] = useState<string[]>([]);

  useEffect(() => {
    fetchTenants();
    fetchStats();
    fetchAvailableFilters();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [page, filterTenant, filterAction, filterEntity, startDate, endDate]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        limit,
      };

      if (filterTenant) params.tenantId = filterTenant;
      if (filterAction) params.action = filterAction;
      if (filterEntity) params.entity = filterEntity;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (searchTerm) params.search = searchTerm;

      const response = await api.get("/super-admin/audit-logs", { params });
      setLogs(response.data.data.logs);
      setTotal(response.data.data.pagination.total);
      setTotalPages(response.data.data.pagination.totalPages);
    } catch (error) {
      toast.error("Failed to load audit logs");
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

  const fetchStats = async () => {
    try {
      const response = await api.get("/super-admin/audit-logs/stats");
      setStats(response.data.data.stats);
    } catch (error) {
      console.error("Failed to load stats");
    }
  };

  const fetchAvailableFilters = async () => {
    try {
      const response = await api.get("/super-admin/audit-logs/filters");
      setAvailableActions(response.data.data.actions);
      setAvailableEntities(response.data.data.entities);
    } catch (error) {
      console.error("Failed to load filters");
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchLogs();
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setFilterTenant("");
    setFilterAction("");
    setFilterEntity("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const handleExportCSV = () => {
    const csvHeaders = [
      "Timestamp",
      "User",
      "Action",
      "Entity",
      "Description",
      "IP Address",
    ];

    const csvRows = logs.map((log) => [
      new Date(log.createdAt).toLocaleString(),
      log.userEmail || log.userName || "System",
      log.action,
      log.entity || "-",
      log.description || "-",
      log.ipAddress || "-",
    ]);

    const csvContent = [
      csvHeaders.join(","),
      ...csvRows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    toast.success("Audit logs exported");
  };

  const getActionColor = (action: string) => {
    if (action.includes("CREATE")) return "bg-green-100 text-green-800";
    if (action.includes("UPDATE")) return "bg-blue-100 text-blue-800";
    if (action.includes("DELETE")) return "bg-red-100 text-red-800";
    if (action.includes("LOGIN")) return "bg-purple-100 text-purple-800";
    if (action.includes("FAILED")) return "bg-red-100 text-red-800";
    if (action.includes("APPROVE")) return "bg-green-100 text-green-800";
    if (action.includes("REJECT")) return "bg-orange-100 text-orange-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <SuperAdminSidebar />

      <div className="flex-1 ml-64 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
            <p className="text-gray-600 mt-1">
              Track all system activities and changes
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="card">
              <div className="flex items-center gap-3">
                <Activity className="w-8 h-8 text-primary-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Events</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalLogs.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center gap-3">
                <Calendar className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Last 24 Hours</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.last24Hours.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center gap-3">
                <User className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Login Attempts</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.loginAttempts.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8 text-red-600" />
                <div>
                  <p className="text-sm text-gray-600">Failed Logins</p>
                  <p className="text-2xl font-bold text-red-600">
                    {stats.failedLogins.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="card mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Filter className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-bold text-gray-900">Filters</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by user, description..."
                  className="input-field pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
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
                  value={filterAction}
                  onChange={(e) => setFilterAction(e.target.value)}
                >
                  <option value="">All Actions</option>
                  {availableActions.map((action) => (
                    <option key={action} value={action}>
                      {action.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  className="input-field"
                  value={filterEntity}
                  onChange={(e) => setFilterEntity(e.target.value)}
                >
                  <option value="">All Entities</option>
                  {availableEntities.map((entity) => (
                    <option key={entity} value={entity}>
                      {entity}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <input
                  type="date"
                  className="input-field"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  placeholder="Start Date"
                />
              </div>

              <div>
                <input
                  type="date"
                  className="input-field"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  placeholder="End Date"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={handleSearch} className="btn-primary">
                <Search className="w-4 h-4 mr-2" />
                Search
              </button>
              <button onClick={handleClearFilters} className="btn-secondary">
                <RefreshCw className="w-4 h-4 mr-2" />
                Clear Filters
              </button>
              <button
                onClick={handleExportCSV}
                className="btn-secondary ml-auto"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Logs Table */}
          <div className="card">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {logs.length} of {total.toLocaleString()} entries
              </p>
            </div>

            {loading ? (
              <div className="text-center py-12 text-gray-600">
                Loading audit logs...
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-12 text-gray-600">
                No audit logs found
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          Timestamp
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          User
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          Action
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          Entity
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          Description
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          IP Address
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {logs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm">
                            <div>
                              <p className="font-medium text-gray-900">
                                {new Date(log.createdAt).toLocaleDateString()}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(log.createdAt).toLocaleTimeString()}
                              </p>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm">
                            <div>
                              <p className="font-medium text-gray-900">
                                {log.userName || log.userEmail || "System"}
                              </p>
                              {log.userEmail && log.userName && (
                                <p className="text-xs text-gray-500">
                                  {log.userEmail}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(
                                log.action
                              )}`}
                            >
                              {log.action.replace(/_/g, " ")}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm">
                            <div>
                              <p className="font-medium text-gray-900">
                                {log.entity || "-"}
                              </p>
                              {log.entityId && (
                                <p className="text-xs text-gray-500 font-mono">
                                  {log.entityId.substring(0, 8)}...
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {log.description || "-"}
                          </td>
                          <td className="py-3 px-4 text-sm font-mono text-gray-600">
                            {log.ipAddress || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
                  <div className="text-sm text-gray-600">
                    Page {page} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page === totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
