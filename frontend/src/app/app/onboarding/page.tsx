"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axios";
import { toast } from "sonner";
import { Building2, CheckCircle } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [orgData, setOrgData] = useState({
    name: "",
    code: "HQ",
    address: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
    phone: "",
    email: "",
  });

  const handleCreateOrganisation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/organisations", orgData);
      toast.success("Organisation created successfully!");
      setStep(2);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to create organisation",
      );
    }
  };

  const handleComplete = () => {
    router.push("/app/dashboard");
  };

  if (step === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">All Set!</h1>
          <p className="text-gray-600 mb-8">
            Your organisation has been created successfully. You can now start
            adding employees and managing your workforce.
          </p>
          <button onClick={handleComplete} className="btn-primary w-full py-3">
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create Your First Organisation
          </h1>
          <p className="text-gray-600">
            Set up your company's primary organisation to get started
          </p>
        </div>

        <form onSubmit={handleCreateOrganisation} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Organisation Name *
              </label>
              <input
                type="text"
                required
                className="input-field"
                placeholder="Headquarters"
                value={orgData.name}
                onChange={(e) =>
                  setOrgData({ ...orgData, name: e.target.value })
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
                placeholder="HQ"
                value={orgData.code}
                onChange={(e) =>
                  setOrgData({ ...orgData, code: e.target.value })
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
              placeholder="123 Business Street"
              value={orgData.address}
              onChange={(e) =>
                setOrgData({ ...orgData, address: e.target.value })
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
                placeholder="New York"
                value={orgData.city}
                onChange={(e) =>
                  setOrgData({ ...orgData, city: e.target.value })
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
                placeholder="NY"
                value={orgData.state}
                onChange={(e) =>
                  setOrgData({ ...orgData, state: e.target.value })
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
                placeholder="United States"
                value={orgData.country}
                onChange={(e) =>
                  setOrgData({ ...orgData, country: e.target.value })
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
                placeholder="10001"
                value={orgData.zipCode}
                onChange={(e) =>
                  setOrgData({ ...orgData, zipCode: e.target.value })
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
                placeholder="+1 (555) 123-4567"
                value={orgData.phone}
                onChange={(e) =>
                  setOrgData({ ...orgData, phone: e.target.value })
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
                placeholder="contact@company.com"
                value={orgData.email}
                onChange={(e) =>
                  setOrgData({ ...orgData, email: e.target.value })
                }
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full btn-primary py-3 text-lg mt-6"
          >
            Create Organisation
          </button>
        </form>
      </div>
    </div>
  );
}
