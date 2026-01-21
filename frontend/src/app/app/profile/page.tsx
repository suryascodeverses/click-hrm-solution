"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import Sidebar from "@/components/Sidebar";
import { useAuthStore } from "@/store/authStore";
import {
  User,
  Briefcase,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Edit,
  Save,
  X,
} from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const { employee } = useAuthStore();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    phone: "",
    currentAddress: "",
    permanentAddress: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
  });

  useEffect(() => {
    if (employee) {
      fetchProfile();
    }
  }, [employee]);

  const fetchProfile = async () => {
    try {
      const response = await api.get(`/employees/${employee!.id}`);
      setProfileData(response.data.data);
      setFormData({
        phone: response.data.data.phone || "",
        currentAddress: response.data.data.currentAddress || "",
        permanentAddress: response.data.data.permanentAddress || "",
        city: response.data.data.city || "",
        state: response.data.data.state || "",
        country: response.data.data.country || "",
        zipCode: response.data.data.zipCode || "",
      });
    } catch (error) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      await api.put(`/employees/${employee!.id}`, formData);
      toast.success("Profile updated successfully");
      setEditing(false);
      fetchProfile();
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  if (loading || !profileData) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-gray-600">Loading profile...</div>
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
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
              <p className="text-gray-600 mt-1">
                View and manage your personal information
              </p>
            </div>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="btn-primary flex items-center gap-2"
              >
                <Edit className="w-5 h-5" />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleUpdate}
                  className="btn-primary flex items-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    fetchProfile();
                  }}
                  className="btn-secondary flex items-center gap-2"
                >
                  <X className="w-5 h-5" />
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Summary Card */}
            <div className="lg:col-span-1">
              <div className="card text-center">
                <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-12 h-12 text-primary-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {profileData.firstName} {profileData.lastName}
                </h2>
                <p className="text-gray-600 mt-1">
                  {profileData.designation?.name || "N/A"}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {profileData.employeeCode}
                </p>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="space-y-3 text-left">
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{profileData.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        {profileData.phone || "Not provided"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Briefcase className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        {profileData.department?.name || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        Joined{" "}
                        {new Date(
                          profileData.dateOfJoining,
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <span
                    className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                      profileData.status === "ACTIVE"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {profileData.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <div className="card">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Personal Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">First Name</label>
                    <p className="font-medium text-gray-900">
                      {profileData.firstName}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Last Name</label>
                    <p className="font-medium text-gray-900">
                      {profileData.lastName}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">
                      Date of Birth
                    </label>
                    <p className="font-medium text-gray-900">
                      {profileData.dateOfBirth
                        ? new Date(profileData.dateOfBirth).toLocaleDateString()
                        : "Not provided"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Gender</label>
                    <p className="font-medium text-gray-900">
                      {profileData.gender || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Blood Group</label>
                    <p className="font-medium text-gray-900">
                      {profileData.bloodGroup || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">
                      Marital Status
                    </label>
                    <p className="font-medium text-gray-900">
                      {profileData.maritalStatus || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="card">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Contact Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">
                      Phone
                    </label>
                    {editing ? (
                      <input
                        type="tel"
                        className="input-field"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                      />
                    ) : (
                      <p className="font-medium text-gray-900">
                        {profileData.phone || "Not provided"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-2">
                      Current Address
                    </label>
                    {editing ? (
                      <textarea
                        className="input-field"
                        rows={2}
                        value={formData.currentAddress}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            currentAddress: e.target.value,
                          })
                        }
                      />
                    ) : (
                      <p className="font-medium text-gray-900">
                        {profileData.currentAddress || "Not provided"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-2">
                      Permanent Address
                    </label>
                    {editing ? (
                      <textarea
                        className="input-field"
                        rows={2}
                        value={formData.permanentAddress}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            permanentAddress: e.target.value,
                          })
                        }
                      />
                    ) : (
                      <p className="font-medium text-gray-900">
                        {profileData.permanentAddress || "Not provided"}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">
                        City
                      </label>
                      {editing ? (
                        <input
                          type="text"
                          className="input-field"
                          value={formData.city}
                          onChange={(e) =>
                            setFormData({ ...formData, city: e.target.value })
                          }
                        />
                      ) : (
                        <p className="font-medium text-gray-900">
                          {profileData.city || "Not provided"}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm text-gray-600 mb-2">
                        State
                      </label>
                      {editing ? (
                        <input
                          type="text"
                          className="input-field"
                          value={formData.state}
                          onChange={(e) =>
                            setFormData({ ...formData, state: e.target.value })
                          }
                        />
                      ) : (
                        <p className="font-medium text-gray-900">
                          {profileData.state || "Not provided"}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm text-gray-600 mb-2">
                        Country
                      </label>
                      {editing ? (
                        <input
                          type="text"
                          className="input-field"
                          value={formData.country}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              country: e.target.value,
                            })
                          }
                        />
                      ) : (
                        <p className="font-medium text-gray-900">
                          {profileData.country || "Not provided"}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm text-gray-600 mb-2">
                        Zip Code
                      </label>
                      {editing ? (
                        <input
                          type="text"
                          className="input-field"
                          value={formData.zipCode}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              zipCode: e.target.value,
                            })
                          }
                        />
                      ) : (
                        <p className="font-medium text-gray-900">
                          {profileData.zipCode || "Not provided"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Employment Information */}
              <div className="card">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Employment Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">
                      Employee Code
                    </label>
                    <p className="font-medium text-gray-900">
                      {profileData.employeeCode}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">
                      Date of Joining
                    </label>
                    <p className="font-medium text-gray-900">
                      {new Date(profileData.dateOfJoining).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">
                      Organisation
                    </label>
                    <p className="font-medium text-gray-900">
                      {profileData.organisation.name}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Department</label>
                    <p className="font-medium text-gray-900">
                      {profileData.department?.name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Designation</label>
                    <p className="font-medium text-gray-900">
                      {profileData.designation?.name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">
                      Employment Type
                    </label>
                    <p className="font-medium text-gray-900">
                      {profileData.employmentType}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
