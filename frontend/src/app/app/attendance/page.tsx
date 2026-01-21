"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import Sidebar from "@/components/Sidebar";
import { useAuthStore } from "@/store/authStore";
import {
  Clock,
  LogIn,
  LogOut,
  Calendar as CalendarIcon,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { formatDate, formatDateTime } from "@keka-clone/shared";

export default function AttendancePage() {
  const { employee } = useAuthStore();
  const [todayAttendance, setTodayAttendance] = useState<any>(null);
  const [monthlyAttendance, setMonthlyAttendance] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);

  useEffect(() => {
    if (employee) {
      fetchTodayAttendance();
      fetchMonthlyAttendance();
    }
  }, [employee]);

  const fetchTodayAttendance = async () => {
    try {
      const response = await api.get(`/attendance/today/${employee!.id}`);
      setTodayAttendance(response.data.data);
    } catch (error) {
      console.error("Failed to fetch today attendance");
    }
  };

  const fetchMonthlyAttendance = async () => {
    try {
      const response = await api.get(`/attendance/my-attendance`, {
        params: { employeeId: employee!.id },
      });
      setMonthlyAttendance(response.data.data.attendances);
      setStats(response.data.data.stats);
    } catch (error) {
      toast.error("Failed to load attendance data");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    setCheckingIn(true);
    try {
      await api.post("/attendance/check-in", { employeeId: employee!.id });
      toast.success("Checked in successfully!");
      fetchTodayAttendance();
      fetchMonthlyAttendance();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Check-in failed");
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    setCheckingIn(true);
    try {
      await api.post("/attendance/check-out", { employeeId: employee!.id });
      toast.success("Checked out successfully!");
      fetchTodayAttendance();
      fetchMonthlyAttendance();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Check-out failed");
    } finally {
      setCheckingIn(false);
    }
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const [currentTime, setCurrentTime] = useState(getCurrentTime());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getCurrentTime());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 ml-64 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
            <p className="text-gray-600 mt-1">Track your work hours</p>
          </div>

          {/* Current Time & Check In/Out */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Current Time */}
            <div className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-8 h-8" />
                  <div>
                    <p className="text-sm opacity-90">Current Time</p>
                    <p className="text-3xl font-bold">{currentTime}</p>
                  </div>
                </div>
                <CalendarIcon className="w-16 h-16 opacity-20" />
              </div>
              <p className="text-sm opacity-90">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            {/* Check In/Out Card */}
            <div className="card">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Today's Attendance
              </h3>

              {todayAttendance?.checkIn ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <LogIn className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-600">Check In</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(todayAttendance.checkIn).toLocaleTimeString(
                            "en-US",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </p>
                      </div>
                    </div>
                    {todayAttendance.lateBy > 0 && (
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                        Late by {todayAttendance.lateBy} min
                      </span>
                    )}
                  </div>

                  {todayAttendance.checkOut ? (
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <LogOut className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="text-sm text-gray-600">Check Out</p>
                          <p className="font-semibold text-gray-900">
                            {new Date(
                              todayAttendance.checkOut,
                            ).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        {todayAttendance.workHours?.toFixed(1)}h
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={handleCheckOut}
                      disabled={checkingIn}
                      className="w-full btn-secondary flex items-center justify-center gap-2 py-3"
                    >
                      <LogOut className="w-5 h-5" />
                      Check Out
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleCheckIn}
                  disabled={checkingIn}
                  className="w-full btn-primary flex items-center justify-center gap-2 py-3"
                >
                  <LogIn className="w-5 h-5" />
                  {checkingIn ? "Checking In..." : "Check In"}
                </button>
              )}
            </div>
          </div>

          {/* Monthly Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              <div className="card">
                <p className="text-sm text-gray-600 mb-1">Present</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.present}
                </p>
              </div>
              <div className="card">
                <p className="text-sm text-gray-600 mb-1">Absent</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.absent}
                </p>
              </div>
              <div className="card">
                <p className="text-sm text-gray-600 mb-1">Late</p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats.late}
                </p>
              </div>
              <div className="card">
                <p className="text-sm text-gray-600 mb-1">Half Day</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.halfDay}
                </p>
              </div>
              <div className="card">
                <p className="text-sm text-gray-600 mb-1">Total Hours</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalWorkHours.toFixed(1)}h
                </p>
              </div>
            </div>
          )}

          {/* Attendance History */}
          <div className="card">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              This Month's Attendance
            </h3>

            {loading ? (
              <div className="text-center py-8 text-gray-600">Loading...</div>
            ) : monthlyAttendance.length === 0 ? (
              <div className="text-center py-8 text-gray-600">
                No attendance records
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Date
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Check In
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Check Out
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Work Hours
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {monthlyAttendance.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-900">
                          {new Date(record.date).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {record.checkIn
                            ? new Date(record.checkIn).toLocaleTimeString(
                                "en-US",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )
                            : "-"}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {record.checkOut
                            ? new Date(record.checkOut).toLocaleTimeString(
                                "en-US",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )
                            : "-"}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {record.workHours
                            ? `${record.workHours.toFixed(1)}h`
                            : "-"}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              record.status === "PRESENT"
                                ? "bg-green-100 text-green-800"
                                : record.status === "LATE"
                                  ? "bg-orange-100 text-orange-800"
                                  : record.status === "HALF_DAY"
                                    ? "bg-blue-100 text-blue-800"
                                    : record.status === "ABSENT"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {record.status.replace("_", " ")}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
