"use client";
import { useState, useEffect } from "react";

// 1. Cập nhật Interface để nhận thêm tourInfo
interface TripReport {
  tripId: string;
  tripName: string; // Đổi từ name thành tripName cho rõ ràng theo BE mới
  tourInfo: {
    _id: string;
    name: string;
    image?: string;
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
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <p className="text-center py-10 text-gray-400">
            Đang tính toán dữ liệu...
          </p>
        ) : (
          reports.map((trip) => (
            <div
              key={trip.tripId}
              className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              {/* 2. Hiển thị thông tin Tour và Trip */}
              <div className="flex gap-4 items-center">
                {/* Ảnh đại diện tour (nếu có) */}
                <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center shrink-0 overflow-hidden">
                  {trip.tourInfo?.image ? (
                    <img
                      src={trip.tourInfo.image}
                      alt="tour"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xl">🚌</span>
                  )}
                </div>

                <div className="space-y-0.5">
                  <p className="text-[10px] font-black text-orange-500 uppercase tracking-wider">
                    Tour: {trip.tourInfo?.name || "N/A"}
                  </p>
                  <h3 className="font-bold text-gray-900 text-base">
                    {trip.tripName}
                  </h3>
                  <div className="flex items-center gap-3">
                    <p className="text-xs text-gray-500 font-medium">
                      📅 {new Date(trip.startDate).toLocaleDateString("vi-VN")}
                    </p>
                    <div
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        trip.shouldStart
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      {trip.note}
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Phần chỉ số (giữ nguyên logic cũ nhưng tinh chỉnh UI) */}
              <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0">
                <div className="text-center">
                  <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">
                    Tỉ lệ lấp đầy
                  </p>
                  <p className="text-lg font-black text-slate-800">
                    {trip.occupancyRate}
                  </p>
                  <div className="w-20 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden mx-auto">
                    <div
                      className="h-full bg-orange-500"
                      style={{ width: trip.occupancyRate }}
                    />
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">
                    Số khách
                  </p>
                  <p className="text-lg font-black text-gray-700">
                    {trip.capacity}
                  </p>
                  <p className="text-[9px] text-gray-400 font-medium italic">
                    người đã đặt
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
