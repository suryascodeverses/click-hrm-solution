"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import SuperAdminSidebar from "@/components/SuperAdminSidebar";
import {
  Mail,
  Plus,
  Edit,
  Trash2,
  Send,
  Eye,
  CheckCircle,
  XCircle,
  Activity,
} from "lucide-react";
import { toast } from "sonner";

export default function EmailTemplatesPage() {
  const [activeTab, setActiveTab] = useState("templates");
  const [templates, setTemplates] = useState<any[]>([]);
  const [emailLogs, setEmailLogs] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalSent: 0,
    sent: 0,
    failed: 0,
    pending: 0,
    last24Hours: 0,
    successRate: 0,
  });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: "",
    displayName: "",
    category: "NOTIFICATIONS",
    subject: "",
    htmlContent: "",
    textContent: "",
    variables: [],
  });

  useEffect(() => {
    fetchTemplates();
    fetchEmailLogs();
    fetchStats();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await api.get("/super-admin/email-templates/templates");
      setTemplates(response.data.data);
    } catch (error) {
      toast.error("Failed to load templates");
    }
  };

  const fetchEmailLogs = async () => {
    try {
      const response = await api.get("/super-admin/email-templates/logs");
      setEmailLogs(response.data.data.logs);
    } catch (error) {
      console.error("Failed to load email logs");
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get("/super-admin/email-templates/stats");
      setStats(response.data.data.stats);
    } catch (error) {
      console.error("Failed to load stats");
    }
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/super-admin/email-templates/templates", formData);
      toast.success("Template created successfully");
      setShowCreateModal(false);
      resetForm();
      fetchTemplates();
    } catch (error) {
      toast.error("Failed to create template");
    }
  };

  const handleUpdateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put(
        `/super-admin/email-templates/templates/${selectedTemplate.id}`,
        formData
      );
      toast.success("Template updated successfully");
      setShowEditModal(false);
      resetForm();
      fetchTemplates();
    } catch (error) {
      toast.error("Failed to update template");
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    try {
      await api.delete(`/super-admin/email-templates/templates/${templateId}`);
      toast.success("Template deleted successfully");
      fetchTemplates();
    } catch (error) {
      toast.error("Failed to delete template");
    }
  };

  const handleSendTest = async (templateId: string) => {
    const recipient = prompt("Enter test email address:");
    if (!recipient) return;

    try {
      await api.post("/super-admin/email-templates/send-test", {
        templateId,
        recipient,
        variables: { name: "Test User", company: "Test Company" },
      });
      toast.success("Test email sent successfully");
    } catch (error) {
      toast.error("Failed to send test email");
    }
  };

  const handleEdit = (template: any) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      displayName: template.displayName,
      category: template.category,
      subject: template.subject,
      htmlContent: template.htmlContent,
      textContent: template.textContent || "",
      variables: template.variables,
    });
    setShowEditModal(true);
  };

  const handlePreview = (template: any) => {
    setSelectedTemplate(template);
    setShowPreviewModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      displayName: "",
      category: "NOTIFICATIONS",
      subject: "",
      htmlContent: "",
      textContent: "",
      variables: [],
    });
    setSelectedTemplate(null);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <SuperAdminSidebar />

      <div className="flex-1 ml-64 overflow-auto">
        <div className="p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Email Templates
              </h1>
              <p className="text-gray-600 mt-1">
                Manage email templates and logs
              </p>
            </div>
            {activeTab === "templates" && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Template
              </button>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="card">
              <p className="text-sm text-gray-600 mb-1">Total Emails</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.totalSent}
              </p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-600 mb-1">Sent</p>
              <p className="text-3xl font-bold text-green-600">{stats.sent}</p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-600 mb-1">Failed</p>
              <p className="text-3xl font-bold text-red-600">{stats.failed}</p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-600 mb-1">Last 24h</p>
              <p className="text-3xl font-bold text-blue-600">
                {stats.last24Hours}
              </p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-600 mb-1">Success Rate</p>
              <p className="text-3xl font-bold text-primary-600">
                {stats.successRate}%
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="card">
            <div className="border-b border-gray-200">
              <nav className="flex gap-8">
                {["templates", "logs"].map((tab) => (
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

            {/* Templates Tab */}
            {activeTab === "templates" && (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-gray-900">
                            {template.displayName}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {template.category}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            template.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {template.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-1">Subject:</p>
                        <p className="text-sm font-medium text-gray-900">
                          {template.subject}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handlePreview(template)}
                          className="flex-1 btn-secondary text-sm py-2"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Preview
                        </button>
                        <button
                          onClick={() => handleEdit(template)}
                          className="p-2 hover:bg-gray-100 rounded"
                        >
                          <Edit className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleSendTest(template.id)}
                          className="p-2 hover:bg-gray-100 rounded"
                        >
                          <Send className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleDeleteTemplate(template.id)}
                          className="p-2 hover:bg-gray-100 rounded"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Logs Tab */}
            {activeTab === "logs" && (
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          Timestamp
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          Template
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          Recipient
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          Subject
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {emailLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm">
                            {new Date(log.createdAt).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {log.template?.displayName || "N/A"}
                          </td>
                          <td className="py-3 px-4 text-sm font-mono">
                            {log.recipient}
                          </td>
                          <td className="py-3 px-4 text-sm">{log.subject}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${
                                log.status === "SENT"
                                  ? "bg-green-100 text-green-800"
                                  : log.status === "FAILED"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {log.status === "SENT" && (
                                <CheckCircle className="w-3 h-3" />
                              )}
                              {log.status === "FAILED" && (
                                <XCircle className="w-3 h-3" />
                              )}
                              {log.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Create/Edit Modal */}
          {(showCreateModal || showEditModal) && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {showCreateModal
                    ? "Create Email Template"
                    : "Edit Email Template"}
                </h2>

                <form
                  onSubmit={
                    showCreateModal
                      ? handleCreateTemplate
                      : handleUpdateTemplate
                  }
                >
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Template Name (Unique ID)
                      </label>
                      <input
                        type="text"
                        className="input-field"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="welcome_email"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Display Name
                      </label>
                      <input
                        type="text"
                        className="input-field"
                        value={formData.displayName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            displayName: e.target.value,
                          })
                        }
                        placeholder="Welcome Email"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <select
                        className="input-field"
                        value={formData.category}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value })
                        }
                        required
                      >
                        <option value="AUTHENTICATION">Authentication</option>
                        <option value="BILLING">Billing</option>
                        <option value="NOTIFICATIONS">Notifications</option>
                        <option value="SYSTEM">System</option>
                        <option value="MARKETING">Marketing</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subject
                      </label>
                      <input
                        type="text"
                        className="input-field"
                        value={formData.subject}
                        onChange={(e) =>
                          setFormData({ ...formData, subject: e.target.value })
                        }
                        placeholder="Welcome to {{company}}"
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      HTML Content
                    </label>
                    <textarea
                      className="input-field font-mono text-sm"
                      rows={10}
                      value={formData.htmlContent}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          htmlContent: e.target.value,
                        })
                      }
                      placeholder="<p>Hello {{name}},</p>"
                      required
                    />
                  </div>

                  <div className="flex gap-3">
                    <button type="submit" className="btn-primary flex-1">
                      {showCreateModal ? "Create Template" : "Update Template"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateModal(false);
                        setShowEditModal(false);
                        resetForm();
                      }}
                      className="btn-secondary flex-1"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Preview Modal */}
          {showPreviewModal && selectedTemplate && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Template Preview: {selectedTemplate.displayName}
                </h2>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-1">Subject:</p>
                  <p className="font-semibold">{selectedTemplate.subject}</p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: selectedTemplate.htmlContent,
                    }}
                  />
                </div>

                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="btn-secondary w-full mt-4"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
