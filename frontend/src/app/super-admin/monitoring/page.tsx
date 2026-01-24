"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import SuperAdminSidebar from "@/components/SuperAdminSidebar";
import {
  Activity,
  Cpu,
  HardDrive,
  Database,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Server,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function MonitoringPage() {
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState<any>(null);
  const [dbStats, setDbStats] = useState<any>(null);
  const [apiUsage, setApiUsage] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [metricsHistory, setMetricsHistory] = useState<any>({});

  useEffect(() => {
    fetchAllData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchAllData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [healthRes, dbRes, apiRes, alertsRes, metricsRes] =
        await Promise.all([
          api.get("/super-admin/monitoring/health"),
          api.get("/super-admin/monitoring/database"),
          api.get("/super-admin/monitoring/api-usage"),
          api.get("/super-admin/monitoring/alerts?isResolved=false"),
          api.get("/super-admin/monitoring/metrics?hours=24"),
        ]);

      setHealth(healthRes.data.data);
      setDbStats(dbRes.data.data);
      setApiUsage(apiRes.data.data);
      setAlerts(alertsRes.data.data.alerts);
      setMetricsHistory(metricsRes.data.data);
    } catch (error) {
      toast.error("Failed to load monitoring data");
    } finally {
      setLoading(false);
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      await api.post(`/super-admin/monitoring/alerts/${alertId}/resolve`);
      toast.success("Alert resolved");
      fetchAllData();
    } catch (error) {
      toast.error("Failed to resolve alert");
    }
  };

  const getStatusColor = (value: number, type: string) => {
    if (type === "cpu" || type === "memory") {
      if (value < 50) return "text-green-600";
      if (value < 80) return "text-yellow-600";
      return "text-red-600";
    }
    return "text-gray-900";
  };

  const cpuData =
    metricsHistory.CPU_USAGE?.map((m: any) => ({
      time: new Date(m.timestamp).toLocaleTimeString(),
      value: m.value,
    })) || [];

  const memoryData =
    metricsHistory.MEMORY_USAGE?.map((m: any) => ({
      time: new Date(m.timestamp).toLocaleTimeString(),
      value: m.value,
    })) || [];

  if (loading) {
    return (
      <div className="flex h-screen">
        <SuperAdminSidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-lg text-gray-600">
            Loading monitoring data...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <SuperAdminSidebar />

      <div className="flex-1 ml-64 overflow-auto">
        <div className="p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                System Monitoring
              </h1>
              <p className="text-gray-600 mt-1">
                Real-time system health and performance
              </p>
            </div>
            <button onClick={fetchAllData} className="btn-secondary">
              <RefreshCw className="w-5 h-5 mr-2" />
              Refresh
            </button>
          </div>

          {/* System Health Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="card">
              <div className="flex items-center gap-3 mb-2">
                <Cpu className="w-6 h-6 text-primary-600" />
                <p className="text-sm text-gray-600">CPU Usage</p>
              </div>
              <p
                className={`text-3xl font-bold ${getStatusColor(
                  parseFloat(health?.cpu.usage),
                  "cpu"
                )}`}
              >
                {health?.cpu.usage}%
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {health?.cpu.cores} cores
              </p>
            </div>

            <div className="card">
              <div className="flex items-center gap-3 mb-2">
                <HardDrive className="w-6 h-6 text-blue-600" />
                <p className="text-sm text-gray-600">Memory Usage</p>
              </div>
              <p
                className={`text-3xl font-bold ${getStatusColor(
                  parseFloat(health?.memory.usagePercent),
                  "memory"
                )}`}
              >
                {health?.memory.usagePercent}%
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {health?.memory.used}GB / {health?.memory.total}GB
              </p>
            </div>

            <div className="card">
              <div className="flex items-center gap-3 mb-2">
                <Database className="w-6 h-6 text-green-600" />
                <p className="text-sm text-gray-600">Database Size</p>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {health?.database.size}MB
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {health?.database.connections} connections
              </p>
            </div>

            <div className="card">
              <div className="flex items-center gap-3 mb-2">
                <Server className="w-6 h-6 text-purple-600" />
                <p className="text-sm text-gray-600">System Uptime</p>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {Math.floor((health?.uptime || 0) / 86400)}d
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {health?.platform} {health?.nodeVersion}
              </p>
            </div>
          </div>

          {/* Active Alerts */}
          {alerts.length > 0 && (
            <div className="card mb-6 border-l-4 border-red-500">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <h2 className="text-xl font-bold text-gray-900">
                  Active Alerts ({alerts.length})
                </h2>
              </div>

              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-lg border-l-4 ${
                      alert.severity === "CRITICAL"
                        ? "bg-red-50 border-red-500"
                        : alert.severity === "HIGH"
                        ? "bg-orange-50 border-orange-500"
                        : "bg-yellow-50 border-yellow-500"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              alert.severity === "CRITICAL"
                                ? "bg-red-100 text-red-800"
                                : alert.severity === "HIGH"
                                ? "bg-orange-100 text-orange-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {alert.severity}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(alert.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="font-semibold text-gray-900">
                          {alert.title}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {alert.message}
                        </p>
                      </div>
                      <button
                        onClick={() => handleResolveAlert(alert.id)}
                        className="text-sm text-green-600 hover:text-green-800 font-medium"
                      >
                        Resolve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Performance Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="card">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                CPU Usage (24h)
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={cpuData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#3B82F6"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Memory Usage (24h)
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={memoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#10B981"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Database Statistics */}
          <div className="card mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Database Statistics
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              {Object.entries(dbStats?.recordCounts || {}).map(
                ([key, value]) => (
                  <div
                    key={key}
                    className="text-center p-4 bg-gray-50 rounded-lg"
                  >
                    <p className="text-2xl font-bold text-primary-600">
                      {value as number}
                    </p>
                    <p className="text-sm text-gray-600 mt-1 capitalize">
                      {key}
                    </p>
                  </div>
                )
              )}
            </div>

            <h3 className="font-semibold text-gray-900 mb-3">Largest Tables</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-2 px-4 text-sm font-semibold text-gray-700">
                      Table
                    </th>
                    <th className="text-left py-2 px-4 text-sm font-semibold text-gray-700">
                      Size
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {dbStats?.tableSizes
                    ?.slice(0, 5)
                    .map((table: any, index: number) => (
                      <tr key={index}>
                        <td className="py-2 px-4 font-mono text-sm">
                          {table.tablename}
                        </td>
                        <td className="py-2 px-4 text-sm">{table.size}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* API Usage */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              API Usage (24h)
            </h2>
            <div className="mb-4">
              <p className="text-sm text-gray-600">Total API Calls:</p>
              <p className="text-3xl font-bold text-primary-600">
                {apiUsage?.total24h?.toLocaleString()}
              </p>
            </div>

            <h3 className="font-semibold text-gray-900 mb-3">Top Endpoints</h3>
            <div className="space-y-2">
              {apiUsage?.topEndpoints
                ?.slice(0, 10)
                .map((endpoint: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="text-sm font-medium text-gray-900">
                      {endpoint.action.replace(/_/g, " ")}
                    </span>
                    <span className="text-sm font-bold text-primary-600">
                      {endpoint._count.action.toLocaleString()} calls
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
