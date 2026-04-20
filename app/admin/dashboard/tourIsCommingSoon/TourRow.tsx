// components/admin/TourRow.tsx
"use client";
import React, { useState } from "react";
import {
  MapPin,
  Calendar,
  Image as ImageIcon,
  Eye,
  ChevronDown,
  ChevronUp,
  Users,
} from "lucide-react";

const TourRow = ({ tour }: { tour: any }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Dòng chính: Thông tin Tour */}
      <tr
        className={`hover:bg-slate-50 transition-colors cursor-pointer ${isOpen ? "bg-slate-50/80" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <td className="px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
              {tour.images?.[0]?.image_url ? (
                <img
                  src={tour.images[0].image_url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <ImageIcon className="w-full h-full p-3 text-slate-400" />
              )}
            </div>
            <div>
              <div className="font-medium text-slate-900 line-clamp-1">
                {tour.name}
              </div>
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">
                {tour.category_info?.name || "Chưa phân loại"}
              </div>
            </div>
          </div>
        </td>

        <td className="px-6 py-4">
          <div className="flex flex-col gap-1 text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <MapPin size={12} className="text-blue-500" />{" "}
              {tour.start_location}
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar size={12} className="text-emerald-500" />{" "}
              {tour.earliestTripDate
                ? new Date(tour.earliestTripDate).toLocaleDateString("vi-VN")
                : "N/A"}
            </div>
          </div>
        </td>

        <td className="px-6 py-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 bg-blue-50 w-fit px-2 py-1 rounded-md">
            {tour.trips?.length || 0} Trips
            {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
        </td>

        <td className="px-6 py-4 text-sm">
          <span
            className={`px-2 py-1 rounded-full text-[11px] font-bold uppercase ${tour.status === "active" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}
          >
            {tour.status}
          </span>
        </td>

        <td
          className="px-6 py-4 text-right"
          onClick={(e) => e.stopPropagation()}
        >
          <button className="p-2 hover:bg-white rounded-full shadow-sm border border-transparent hover:border-slate-200 transition-all">
            <Eye size={16} className="text-slate-500" />
          </button>
        </td>
      </tr>

      {/* Dòng phụ: Danh sách Trips xổ xuống */}
      {isOpen && (
        <tr className="bg-slate-50/50">
          <td colSpan={5} className="px-8 py-4 border-b border-slate-200">
            <div className="bg-white rounded-lg border border-slate-200 shadow-inner overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-100/50 text-[11px] uppercase text-slate-500 font-bold">
                  <tr>
                    <th className="px-4 py-2">Ngày khởi hành</th>
                    <th className="px-4 py-2">Ngày kết thúc</th>
                    <th className="px-4 py-2">Giá (VNĐ)</th>
                    <th className="px-4 py-2">Số lượng</th>
                    <th className="px-4 py-2 text-right">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tour.trips && tour.trips.length > 0 ? (
                    tour.trips.map((trip: any) => (
                      <tr
                        key={trip._id}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium text-slate-700">
                          {new Date(trip.start_date).toLocaleDateString(
                            "vi-VN",
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {new Date(trip.end_date).toLocaleDateString("vi-VN")}
                        </td>
                        <td className="px-4 py-3 font-mono text-orange-600 font-semibold">
                          {trip.price.toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <Users size={14} />
                            <span>
                              {trip.booked_people}/{trip.max_people}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${trip.status === "open" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}
                          >
                            {trip.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-8 text-center text-slate-400 italic"
                      >
                        Chưa có chuyến đi nào được tạo cho tour này.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default TourRow;
