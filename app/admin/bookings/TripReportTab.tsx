"use client";
import { useState, useEffect } from "react";

interface TripReport {
  tripId: string;
  name: string;
  startDate: string;
  capacity: string;
  occupancyRate: string;
  status: string;
  shouldStart: boolean;
  note: string;
}

export function TripReportTab() {
  const [reports, setReports] = useState<TripReport[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        "https://db-pickyourway.vercel.app/api/trips/admin/status-report",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const json = await res.json();
      if (json.success) setReports(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <p className="text-center py-10 text-gray-400">
            Đang tính toán dữ liệu...
          </p>
        ) : (
          reports.map((trip) => (
            <div
              key={trip.tripId}
              className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between gap-4"
            >
              <div className="space-y-1">
                <h3 className="font-bold text-gray-900">{trip.name}</h3>
                <p className="text-xs text-orange-500 font-bold">
                  📅 Khởi hành:{" "}
                  {new Date(trip.startDate).toLocaleDateString("vi-VN")}
                </p>
                <div
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${trip.shouldStart ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}
                >
                  {trip.note}
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-[10px] text-gray-400 uppercase font-bold">
                    Tỉ lệ lấp đầy
                  </p>
                  <p className="text-xl font-black text-slate-800">
                    {trip.occupancyRate}
                  </p>
                  <div className="w-24 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                    <div
                      className="h-full bg-orange-500"
                      style={{ width: trip.occupancyRate }}
                    />
                  </div>
                </div>
                <div className="text-right min-w-[80px]">
                  <p className="text-[10px] text-gray-400 uppercase font-bold">
                    Số khách
                  </p>
                  <p className="text-lg font-bold text-gray-700">
                    {trip.capacity}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
