"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/axios";
import { toast } from "sonner";
import { X } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddEmployeeModal({
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [organisations, setOrganisations] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [designations, setDesignations] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    organisationId: "",
    employeeCode: "",
    firstName: "",
    lastName: "",
    middleName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    dateOfJoining: "",
    departmentId: "",
    designationId: "",
    employmentType: "FULL_TIME",
    password: "Welcome@123",
  });

  useEffect(() => {
    if (isOpen) {
      fetchOrganisations();
    }
  }, [isOpen]);

  useEffect(() => {
    if (formData.organisationId) {
      fetchDepartments(formData.organisationId);
    }
  }, [formData.organisationId]);

  useEffect(() => {
    if (formData.departmentId) {
      fetchDesignations(formData.departmentId);
    }
  }, [formData.departmentId]);

  const fetchOrganisations = async () => {
    try {
      const response = await api.get("/organisations");
      setOrganisations(response.data.data);
    } catch (error) {
      toast.error("Failed to load organisations");
    }
  };

  const fetchDepartments = async (orgId: string) => {
    try {
      const response = await api.get(`/departments?organisationId=${orgId}`);
      setDepartments(response.data.data);
    } catch (error) {
      toast.error("Failed to load departments");
    }
  };

  const fetchDesignations = async (deptId: string) => {
    try {
      const response = await api.get(`/designations?departmentId=${deptId}`);
      setDesignations(response.data.data);
    } catch (error) {
      toast.error("Failed to load designations");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/employees", formData);
      toast.success("Employee added successfully!");
      onSuccess();
      onClose();
      resetForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add employee");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      organisationId: "",
      employeeCode: "",
      firstName: "",
      lastName: "",
      middleName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      gender: "",
      dateOfJoining: "",
      departmentId: "",
      designationId: "",
      employmentType: "FULL_TIME",
      password: "Welcome@123",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Add New Employee</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Organisation Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Organisation *
            </label>
            <select
              required
              className="input-field"
              value={formData.organisationId}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  organisationId: e.target.value,
                  departmentId: "",
                  designationId: "",
                })
              }
            >
              <option value="">Select Organisation</option>
              {organisations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name} ({org.code})
                </option>
              ))}
            </select>
          </div>

          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Personal Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee Code *
                </label>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="EMP001"
                  value={formData.employeeCode}
                  onChange={(e) =>
                    setFormData({ ...formData, employeeCode: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  className="input-field"
                  placeholder="john.doe@company.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Middle Name
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.middleName}
                  onChange={(e) =>
                    setFormData({ ...formData, middleName: e.target.value })
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
                  placeholder="+1 234 567 8900"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  className="input-field"
                  value={formData.dateOfBirth}
                  onChange={(e) =>
                    setFormData({ ...formData, dateOfBirth: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <select
                  className="input-field"
                  value={formData.gender}
                  onChange={(e) =>
                    setFormData({ ...formData, gender: e.target.value })
                  }
                >
                  <option value="">Select Gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Employment Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Employment Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Joining *
                </label>
                <input
                  type="date"
                  required
                  className="input-field"
                  value={formData.dateOfJoining}
                  onChange={(e) =>
                    setFormData({ ...formData, dateOfJoining: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employment Type
                </label>
                <select
                  className="input-field"
                  value={formData.employmentType}
                  onChange={(e) =>
                    setFormData({ ...formData, employmentType: e.target.value })
                  }
                >
                  <option value="FULL_TIME">Full Time</option>
                  <option value="PART_TIME">Part Time</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="INTERN">Intern</option>
                  <option value="CONSULTANT">Consultant</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <select
                  className="input-field"
                  value={formData.departmentId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      departmentId: e.target.value,
                      designationId: "",
                    })
                  }
                  disabled={!formData.organisationId}
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Designation
                </label>
                <select
                  className="input-field"
                  value={formData.designationId}
                  onChange={(e) =>
                    setFormData({ ...formData, designationId: e.target.value })
                  }
                  disabled={!formData.departmentId}
                >
                  <option value="">Select Designation</option>
                  {designations.map((desig) => (
                    <option key={desig.id} value={desig.id}>
                      {desig.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Default Password Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Default Password:</strong> Welcome@123
              <br />
              <span className="text-xs">
                Employee will be prompted to change on first login
              </span>
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 py-3 disabled:opacity-50"
            >
              {loading ? "Adding Employee..." : "Add Employee"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1 py-3"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
