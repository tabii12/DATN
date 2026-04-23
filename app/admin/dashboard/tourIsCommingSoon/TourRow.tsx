"use client";
import React, { useState } from "react";

const TourRow = ({ tour }: { tour: any }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <tr
        className={`hover:bg-orange-50/30 transition-colors cursor-pointer ${isOpen ? "bg-orange-50/40" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {/* Tour */}
        <td className="px-5 py-3.5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 bg-orange-50 border border-gray-100">
              {tour.images?.[0]?.image_url ? (
                <img src={tour.images[0].image_url} alt="" className="w-full h-full object-cover"/>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xl">🏖️</div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-800 truncate max-w-48">{tour.name}</p>
              <p className="text-[11px] text-orange-500 font-semibold bg-orange-50 px-2 py-0.5 rounded-full w-fit mt-0.5">
                {tour.category_info?.name || "Chưa phân loại"}
              </p>
            </div>
          </div>
        </td>

        {/* Địa điểm */}
        <td className="px-4 py-3.5 hidden md:table-cell">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-600 flex items-center gap-1">
              📍 {tour.start_location || "—"}
            </span>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              📅 {tour.earliestTripDate
                ? new Date(tour.earliestTripDate).toLocaleDateString("vi-VN")
                : "Chưa có lịch"}
            </span>
          </div>
        </td>

        {/* Trips */}
        <td className="px-4 py-3.5">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
            🚀 {tour.trips?.length || 0} chuyến
            <span className="text-blue-400">{isOpen ? "▲" : "▼"}</span>
          </span>
        </td>

        {/* Trạng thái */}
        <td className="px-4 py-3.5">
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
            tour.status === "active"
              ? "bg-emerald-50 text-emerald-600"
              : "bg-gray-100 text-gray-400"
          }`}>
            {tour.status === "active" ? "✅ Hoạt động" : "🚫 Tạm ẩn"}
          </span>
        </td>
      </tr>

      {/* Expand: danh sách trips */}
      {isOpen && (
        <tr className="bg-gray-50/60">
          <td colSpan={4} className="px-6 py-4 border-b border-gray-100">
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
              {tour.trips?.length > 0 ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/60">
                      <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-2.5">Ngày đi</th>
                      <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-2.5">Ngày về</th>
                      <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-2.5">Giá</th>
                      <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-2.5">Số chỗ</th>
                      <th className="text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-2.5">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {tour.trips.map((trip: any) => {
                      const slotsLeft = trip.max_people - trip.booked_people;
                      return (
                        <tr key={trip._id} className="hover:bg-orange-50/20 transition-colors">
                          <td className="px-4 py-3 text-sm font-semibold text-gray-700">
                            {new Date(trip.start_date).toLocaleDateString("vi-VN")}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {new Date(trip.end_date).toLocaleDateString("vi-VN")}
                          </td>
                          <td className="px-4 py-3 text-sm font-black text-orange-500">
                            {(trip.price || trip.base_price || 0).toLocaleString("vi-VN")}đ
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs text-gray-600">
                              {trip.booked_people}/{trip.max_people} · còn{" "}
                              <span className={slotsLeft <= 3 ? "text-red-500 font-bold" : "text-emerald-600 font-semibold"}>
                                {slotsLeft} chỗ
                              </span>
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              trip.status === "open"
                                ? "bg-emerald-50 text-emerald-600"
                                : trip.status === "full"
                                ? "bg-red-50 text-red-400"
                                : "bg-gray-100 text-gray-400"
                            }`}>
                              {trip.status === "open" ? "Mở" : trip.status === "full" ? "Đầy" : "Đóng"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="py-10 text-center text-gray-400">
                  <p className="text-3xl mb-2">🚀</p>
                  <p className="text-sm font-semibold">Chưa có chuyến đi nào</p>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default TourRow;