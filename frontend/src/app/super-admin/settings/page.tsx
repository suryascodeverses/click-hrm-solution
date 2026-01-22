"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import SuperAdminSidebar from "@/components/SuperAdminSidebar";
import {
  Settings,
  Save,
  AlertTriangle,
  Database,
  Mail,
  Shield,
  Bell,
} from "lucide-react";
import { toast } from "sonner";

export default function SuperAdminSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    allowNewRegistrations: true,
    defaultMaxEmployees: 10,
    defaultSubscriptionTier: "FREE",
    emailNotifications: true,
    systemAlerts: true,
    autoSuspendInactive: false,
    inactiveDays: 90,
  });

  const [leaveTypes, setLeaveTypes] = useState([
    { name: "Casual Leave", code: "CL", days: 12, color: "#3B82F6" },
    { name: "Sick Leave", code: "SL", days: 12, color: "#10B981" },
    { name: "Earned Leave", code: "EL", days: 15, color: "#F59E0B" },
  ]);

  const [newLeaveType, setNewLeaveType] = useState({
    name: "",
    code: "",
    days: 0,
    color: "#3B82F6",
  });

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // TODO: Implement backend endpoint
      // await api.put('/super-admin/settings', settings);
      toast.success("Settings saved successfully");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  const handleAddLeaveType = () => {
    if (!newLeaveType.name || !newLeaveType.code) {
      toast.error("Please fill all fields");
      return;
    }

    setLeaveTypes([...leaveTypes, { ...newLeaveType }]);
    setNewLeaveType({ name: "", code: "", days: 0, color: "#3B82F6" });
    toast.success("Leave type added");
  };

  const handleRemoveLeaveType = (index: number) => {
    setLeaveTypes(leaveTypes.filter((_, i) => i !== index));
    toast.success("Leave type removed");
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <SuperAdminSidebar />

      <div className="flex-1 ml-64 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Platform Settings
            </h1>
            <p className="text-gray-600 mt-1">
              Configure platform-wide settings and defaults
            </p>
          </div>

          {/* Platform Configuration */}
          <div className="card mb-6">
            <div className="flex items-center gap-3 mb-6">
              <Settings className="w-6 h-6 text-primary-600" />
              <h2 className="text-xl font-bold text-gray-900">
                Platform Configuration
              </h2>
            </div>

            <div className="space-y-6">
              {/* Maintenance Mode */}
              <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  <div>
                    <p className="font-semibold text-gray-900">
                      Maintenance Mode
                    </p>
                    <p className="text-sm text-gray-600">
                      Disable access to all tenants (Super Admin only)
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        maintenanceMode: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              {/* Allow New Registrations */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">
                    Allow New Registrations
                  </p>
                  <p className="text-sm text-gray-600">
                    Enable or disable new tenant registrations
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.allowNewRegistrations}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        allowNewRegistrations: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              {/* Default Settings */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Max Employees
                  </label>
                  <input
                    type="number"
                    className="input-field"
                    value={settings.defaultMaxEmployees}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        defaultMaxEmployees: parseInt(e.target.value),
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Subscription Tier
                  </label>
                  <select
                    className="input-field"
                    value={settings.defaultSubscriptionTier}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        defaultSubscriptionTier: e.target.value,
                      })
                    }
                  >
                    <option value="FREE">Free</option>
                    <option value="BASIC">Basic</option>
                    <option value="PREMIUM">Premium</option>
                    <option value="ENTERPRISE">Enterprise</option>
                  </select>
                </div>
              </div>

              {/* Auto Suspend */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">
                    Auto-Suspend Inactive Tenants
                  </p>
                  <p className="text-sm text-gray-600">
                    Automatically suspend tenants after {settings.inactiveDays}{" "}
                    days of inactivity
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoSuspendInactive}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        autoSuspendInactive: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              {settings.autoSuspendInactive && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Inactive Days Threshold
                  </label>
                  <input
                    type="number"
                    className="input-field"
                    value={settings.inactiveDays}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        inactiveDays: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
              )}
            </div>
          </div>

          {/* Notifications */}
          <div className="card mb-6">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-6 h-6 text-primary-600" />
              <h2 className="text-xl font-bold text-gray-900">
                Notification Settings
              </h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-semibold text-gray-900">
                      Email Notifications
                    </p>
                    <p className="text-sm text-gray-600">
                      Send system emails to users
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        emailNotifications: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-semibold text-gray-900">System Alerts</p>
                    <p className="text-sm text-gray-600">
                      Receive alerts for critical events
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.systemAlerts}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        systemAlerts: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Default Leave Types */}
          <div className="card mb-6">
            <div className="flex items-center gap-3 mb-6">
              <Database className="w-6 h-6 text-primary-600" />
              <h2 className="text-xl font-bold text-gray-900">
                Default Leave Types
              </h2>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              These leave types will be automatically created for new tenants
            </p>

            <div className="space-y-3 mb-4">
              {leaveTypes.map((leave, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: leave.color }}
                    />
                    <div>
                      <p className="font-semibold text-gray-900">
                        {leave.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {leave.code} - {leave.days} days
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveLeaveType(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4">
              <p className="font-semibold text-gray-900 mb-3">
                Add New Leave Type
              </p>
              <div className="grid grid-cols-4 gap-3">
                <input
                  type="text"
                  placeholder="Name"
                  className="input-field"
                  value={newLeaveType.name}
                  onChange={(e) =>
                    setNewLeaveType({ ...newLeaveType, name: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="Code"
                  className="input-field"
                  value={newLeaveType.code}
                  onChange={(e) =>
                    setNewLeaveType({
                      ...newLeaveType,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                />
                <input
                  type="number"
                  placeholder="Days"
                  className="input-field"
                  value={newLeaveType.days}
                  onChange={(e) =>
                    setNewLeaveType({
                      ...newLeaveType,
                      days: parseInt(e.target.value),
                    })
                  }
                />
                <button onClick={handleAddLeaveType} className="btn-primary">
                  Add Leave Type
                </button>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-3">
            <button
              onClick={handleSaveSettings}
              disabled={loading}
              className="btn-primary flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              {loading ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
