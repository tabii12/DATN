"use client";
import { useState } from "react";
import { BookingTab } from "./BookingTab";
import { TripReportTab } from "./TripReportTab";

export default function AdminBookingPage() {
  const [activeTab, setActiveTab] = useState<"bookings" | "trips">("bookings");

  return (
    <div className="min-h-screen bg-gray-50 font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header chung */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            QUẢN LÝ ĐIỀU HÀNH
          </h1>

          {/* Nút chuyển Tab */}
          <div className="flex bg-gray-200/50 p-1 rounded-2xl w-fit">
            <button
              onClick={() => setActiveTab("bookings")}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === "bookings"
                  ? "bg-white text-orange-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              🎟️ Đơn hàng (Booking)
            </button>
            <button
              onClick={() => setActiveTab("trips")}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === "trips"
                  ? "bg-white text-orange-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              🚌 Chuyến đi (Trip)
            </button>
          </div>
        </div>

        <hr className="border-gray-200" />

        {/* Nội dung thay đổi theo Tab */}
        {activeTab === "bookings" ? <BookingTab /> : <TripReportTab />}
      </div>
    </div>
  );
}
