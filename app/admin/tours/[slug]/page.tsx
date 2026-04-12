"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";

import TourInfo from "./TourInfo";
import TourImages from "./TourImages";
import TourDescriptions from "./TourDescriptions";
import TourItineraries from "./TourItineraries";
import TourTrips from "./TourTrips";

const API = "https://db-pickyourway.vercel.app/api";

// Định nghĩa các Tab
const TABS = [
  { id: "info", label: "Thông tin cơ bản" },
  { id: "images", label: "Hình ảnh" },
  { id: "desc", label: "Mô tả & Chính sách" },
  { id: "itinerary", label: "Lịch trình" },
  { id: "trips", label: "Chuyến đi & Giá" },
];

export default function TourDetailPage() {
  const { slug } = useParams();
  const [tour, setTour] = useState<any>(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("info");

  const fetchTourData = useCallback(async () => {
    try {
      const tourRes = await fetch(`${API}/tours/detail/${slug}`);
      const tourData = await tourRes.json();

      const catRes = await fetch(`${API}/categories`);
      const catData = await catRes.json();

      if (tourData.success) setTour(tourData.data);
      if (catData.success) setCategories(catData.data);
    } catch (error) {
      console.error("Lỗi fetch dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchTourData();
  }, [fetchTourData]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcfcfc]">
        <div className="text-[#F26F21] text-xs uppercase tracking-[0.2em] animate-pulse font-bold">
          Đang tải dữ liệu Tour...
        </div>
      </div>
    );

  if (!tour)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcfcfc]">
        <div className="text-gray-400 text-xs uppercase tracking-widest">
          Không tìm thấy thông tin Tour.
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#fcfcfc] p-4 md:p-8 lg:p-12">
      <div className="mx-auto space-y-8">
        {/* Header: Title & Meta */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl text-gray-900 tracking-tighter uppercase leading-none">
              Quản lý Tour chi tiết
            </h1>
            <div className="flex items-center gap-3 mt-3">
              <span className="bg-gray-900 text-white text-[10px] px-3 py-1 rounded-full uppercase tracking-widest font-bold">
                ID: {tour._id}
              </span>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                Cập nhật lần cuối:{" "}
                {new Date(tour.updatedAt).toLocaleDateString("vi-VN")}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => window.open(`/tours/${tour.slug}`, "_blank")}
              className="px-6 py-3 bg-white border border-gray-100 text-gray-600 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-gray-50 transition shadow-sm font-bold"
            >
              Xem thực tế
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white p-2 rounded-4xl shadow-sm border border-gray-50 flex flex-wrap gap-1 overflow-x-auto no-scrollbar">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-8 py-4 rounded-3xl text-[12px] uppercase tracking-[0.15em] font-bold transition-all duration-300 whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-[#F26F21] text-white shadow-lg shadow-orange-100"
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Rendering */}
        <div className="mt-8 transition-all duration-500 animate-in fade-in slide-in-from-bottom-2">
          {activeTab === "info" && (
            <TourInfo
              tour={tour}
              categories={categories}
              onRefresh={fetchTourData}
            />
          )}

          {activeTab === "images" && (
            <TourImages
              slug={tour.slug}
              images={tour.images || []}
              onRefresh={fetchTourData}
            />
          )}

          {activeTab === "desc" && (
            <TourDescriptions
              tourId={tour._id}
              descriptions={tour.descriptions || []}
              onRefresh={fetchTourData}
            />
          )}

          {activeTab === "itinerary" && (
            <TourItineraries
              tourId={tour._id}
              itineraries={tour.itineraries || []}
              onRefresh={fetchTourData}
            />
          )}

          {activeTab === "trips" && (
            <TourTrips
              tourId={tour._id}
              trips={tour.trips || []}
              onRefresh={fetchTourData}
            />
          )}
        </div>
      </div>
    </div>
  );
}
