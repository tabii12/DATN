// app/admin/tours/page.tsx
"use client";
import { useEffect, useState } from "react";
import TourList from "./TourList";

export default function TourIsCommingSoon() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const res = await fetch("https://db-pickyourway.vercel.app/api/tours");
        const json = await res.json();
        if (json.success) setTours(json.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchTours();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Quản lý Tour</h1>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          + Thêm Tour mới
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">Đang tải dữ liệu...</div>
      ) : (
        <TourList tours={tours} />
      )}
    </div>
  );
}
