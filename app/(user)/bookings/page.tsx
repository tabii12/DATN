"use client";
import { useEffect, useState } from "react";

function formatVND(n: number) {
  return n.toLocaleString("vi-VN") + "đ";
}

export default function BookingsPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem("tour_booking");
    if (saved) {
      setData(JSON.parse(saved)); // 👈 object
    }
  }, []);

  if (!data) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-red-500">
          Chưa có thông tin tour!
        </h2>
      </div>
    );
  }

  const total =
    Number(data.adults || 1) * Number(data.pricePerAdult || 0) +
    Number(data.children || 0) * Number(data.pricePerChild || 0) +
    500000;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-5">

        {/* TOUR */}
        <div className="bg-white rounded-xl shadow p-5">
          <h1 className="text-xl font-bold mb-2">
            Thông tin tour đã đặt
          </h1>

          {data.thumbnail && (
            <img
              src={data.thumbnail}
              className="w-full h-48 object-cover rounded mb-3"
            />
          )}

          <p className="font-bold">{data.tourName}</p>
          <p className="text-gray-500">
            {data.hotelName} - {data.city}
          </p>

          <p>
            {data.adults} người lớn - {data.children} trẻ em
          </p>

          <p className="text-indigo-600 font-bold">
            {formatVND(total)}
          </p>
        </div>

        {/* CONTACT */}
        <div className="bg-white p-4 rounded-xl shadow text-sm space-y-1">
          <p><b>Khách:</b> {data.contactName}</p>
          <p><b>Email:</b> {data.contactEmail}</p>
          <p><b>SĐT:</b> {data.contactPhone}</p>
        </div>

      </div>
    </div>
  );
}