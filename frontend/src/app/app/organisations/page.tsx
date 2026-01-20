"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import Sidebar from "@/components/Sidebar";
import { Plus, Building2, Users, Briefcase } from "lucide-react";
import { toast } from "sonner";

interface Organisation {
  id: string;
  name: string;
  code: string;
  city?: string;
  state?: string;
  status: string;
  _count: {
    employees: number;
    departments: number;
  };
}

export default function OrganisationsPage() {
  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    address: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
    phone: "",
    email: "",
  });

  useEffect(() => {
    fetchOrganisations();
  }, []);

  const fetchOrganisations = async () => {
    try {
      const response = await api.get("/organisations");
      setOrganisations(response.data.data);
    } catch (error) {
      toast.error("Failed to load organisations");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/organisations", formData);
      toast.success("Organisation created successfully");
      setShowAddModal(false);
      setFormData({
        name: "",
        code: "",
        address: "",
        city: "",
        state: "",
        country: "",
        zipCode: "",
        phone: "",
        email: "",
      });
      fetchOrganisations();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to create organisation",
      );
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
                Organisations
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your company branches and offices
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Organisation
            </button>
          </div>

          {/* Organisations Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="text-gray-600">Loading organisations...</div>
            </div>
          ) : organisations.length === 0 ? (
            <div className="card text-center py-12">
              <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No organisations yet</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary"
              >
                Create First Organisation
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {organisations.map((org) => (
                <div
                  key={org.id}
                  className="card hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-primary-600" />
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        org.status === "ACTIVE"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {org.status}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {org.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">Code: {org.code}</p>

                  {org.city && (
                    <p className="text-sm text-gray-600 mb-4">
                      {org.city}, {org.state}
                    </p>
                  )}

                  <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{org._count.employees} employees</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Briefcase className="w-4 h-4" />
                      <span>{org._count.departments} depts</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Organisation Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Add New Organisation
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Organisation Name *
                      </label>
                      <input
                        type="text"
                        required
                        className="input-field"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Code *
                      </label>
                      <input
                        type="text"
                        required
                        className="input-field"
                        placeholder="HQ, BRANCH1"
                        value={formData.code}
                        onChange={(e) =>
                          setFormData({ ...formData, code: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        className="input-field"
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State
                      </label>
                      <input
                        type="text"
                        className="input-field"
                        value={formData.state}
                        onChange={(e) =>
                          setFormData({ ...formData, state: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country
                      </label>
                      <input
                        type="text"
                        className="input-field"
                        value={formData.country}
                        onChange={(e) =>
                          setFormData({ ...formData, country: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Zip Code
                      </label>
                      <input
                        type="text"
                        className="input-field"
                        value={formData.zipCode}
                        onChange={(e) =>
                          setFormData({ ...formData, zipCode: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        className="input-field"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
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
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button type="submit" className="btn-primary flex-1">
                      Create Organisation
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
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
