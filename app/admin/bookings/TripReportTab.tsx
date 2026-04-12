"use client";
import { useState, useEffect } from "react";

interface TripReport {
  tripId: string;
  tripName?: string;
  tourInfo: {
    id: string;
    name: string;
    image: string | null;
    startLocation: string;
  };
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
        "https://db-pickyourway.vercel.app/api/bookings/admin/status-report",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const json = await res.json();
      if (json.success) setReports(json.data);
    } catch (err) {
      console.error("Lỗi tải báo cáo:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* Header tóm tắt nhanh */}
      {!loading && (
        <div className="flex justify-between items-center px-2">
          <p className="text-sm text-gray-500 font-medium">
            Phân tích{" "}
            <span className="text-slate-900 font-bold">{reports.length}</span>{" "}
            chuyến đi đang vận hành
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400 text-sm font-medium">
              Đang tính toán hiệu suất...
            </p>
          </div>
        ) : (
          reports.map((trip) => (
            <div
              key={trip.tripId}
              className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
            >
              {/* Thông tin Tour & Trip */}
              <div className="flex gap-4 items-start md:items-center w-full md:w-auto">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 overflow-hidden border border-gray-50">
                  {trip.tourInfo.image ? (
                    <img
                      src={trip.tourInfo.image}
                      alt="tour"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center opacity-40">
                      <span className="text-2xl">🌏</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-black bg-orange-100 text-orange-600 px-2 py-0.5 rounded-md uppercase tracking-wider">
                      {trip.tourInfo.startLocation}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400">
                      ID: {trip.tripId.slice(-6).toUpperCase()}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-gray-900 text-base md:text-lg leading-tight max-w-md">
                    {trip.tourInfo.name}
                  </h3>

                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-xs text-slate-500 font-bold flex items-center gap-1">
                      📅{" "}
                      {new Date(trip.startDate).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </p>
                    <div
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        trip.shouldStart
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                          : "bg-rose-50 text-rose-600 border border-rose-100"
                      }`}
                    >
                      {trip.note}
                    </div>
                  </div>
                </div>
              </div>

              {/* Chỉ số Performance */}
              <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end border-t border-dashed md:border-t-0 pt-4 md:pt-0">
                {/* Progress Circle-like UI */}
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-tighter">
                      Lấp đầy
                    </p>
                    <p
                      className={`text-xl font-black ${parseFloat(trip.occupancyRate) >= 80 ? "text-emerald-600" : "text-slate-800"}`}
                    >
                      {trip.occupancyRate}
                    </p>
                  </div>
                  <div className="w-1.5 h-10 bg-gray-100 rounded-full overflow-hidden relative">
                    <div
                      className={`absolute bottom-0 left-0 w-full transition-all duration-1000 ${
                        trip.shouldStart ? "bg-orange-500" : "bg-rose-400"
                      }`}
                      style={{ height: trip.occupancyRate }}
                    />
                  </div>
                </div>

                <div className="text-right min-w-[70px]">
                  <p className="text-[10px] text-gray-400 uppercase font-black tracking-tighter">
                    Số khách
                  </p>
                  <p className="text-xl font-black text-slate-800">
                    {trip.capacity}
                  </p>
                  <p className="text-[10px] text-gray-400 font-bold">
                    vé đã bán
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
