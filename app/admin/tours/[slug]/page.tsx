"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

import TourInfo from "./TourInfo";
import TourImages from "./TourImages";
import TourDescriptions from "./TourDescriptions";
import TourItineraries from "./TourItineraries";
import TourTrips from "./TourTrips";

const API = "https://db-pickyourway.vercel.app/api";

const TABS = [
  { id: "info",        icon: "📋", label: "Thông tin" },
  { id: "images",      icon: "🖼️", label: "Hình ảnh" },
  { id: "desc",        icon: "📝", label: "Mô tả" },
  { id: "itinerary",   icon: "🗓️", label: "Lịch trình" },
  { id: "trips",       icon: "🚀", label: "Chuyến đi" },
];

export default function TourDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug   = params?.slug as string | undefined;

  const [tour, setTour]             = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [activeTab, setActiveTab]   = useState("info");

  const fetchTourData = useCallback(async () => {
    if (!slug) return;
    try {
      const [tourRes, catRes] = await Promise.all([
        fetch(`${API}/tours/detail/${slug}`),
        fetch(`${API}/categories`),
      ]);
      const tourData = await tourRes.json();
      const catData  = await catRes.json();
      if (tourData.success) setTour(tourData.data);
      if (catData.success)  setCategories(catData.data);
    } catch (err) {
      console.error("Lỗi fetch dữ liệu:", err);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => { fetchTourData(); }, [fetchTourData]);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center text-gray-400">
        <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"/>
        <p className="text-sm font-semibold">Đang tải tour...</p>
      </div>
    </div>
  );

  if (!tour) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center text-gray-400">
        <p className="text-5xl mb-3">😕</p>
        <p className="font-semibold text-sm">Không tìm thấy tour</p>
        <a href="/admin/tours" className="mt-2 inline-block text-xs text-orange-500 underline">← Quay lại</a>
      </div>
    </div>
  );

  // Tabs hiển thị số lượng
  const tabsWithCount = [
    { id: "info",      icon: "📋", label: "Thông tin" },
    { id: "images",    icon: "🖼️", label: `Ảnh (${tour.images?.length ?? 0})` },
    { id: "desc",      icon: "📝", label: `Mô tả (${tour.descriptions?.length ?? 0})` },
    { id: "itinerary", icon: "🗓️", label: `Lịch trình (${tour.itineraries?.length ?? 0}N)` },
    { id: "trips",     icon: "🚀", label: `Chuyến đi (${tour.trips?.length ?? 0})` },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3 sticky top-0 z-20">
        <button onClick={() => router.push("/admin/tours")} className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 bg-white cursor-pointer transition-colors text-lg">‹</button>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-black text-gray-900 truncate">✏️ {tour.name}</h1>
          <p className="text-[11px] text-gray-400 font-mono">{tour.slug}</p>
        </div>
        <a href={`/tours/${tour.slug}`} target="_blank" className="text-xs font-semibold text-blue-500 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl no-underline transition-colors">Xem trang →</a>
      </div>

      <div className="max-w-full mx-auto px-4 py-6 space-y-4">
        {/* Tabs */}
        <div className="bg-white rounded-2xl border border-gray-100 p-1.5 flex gap-1 overflow-x-auto">
          {tabsWithCount.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all border-none cursor-pointer flex-1 justify-center ${activeTab === t.id ? "bg-orange-500 text-white shadow-sm" : "text-gray-500 bg-transparent hover:bg-gray-50"}`}>
              <span>{t.icon}</span>
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "info" && (
          <TourInfo tour={tour} categories={categories} onRefresh={fetchTourData}/>
        )}
        {activeTab === "images" && (
          <TourImages slug={tour.slug} images={tour.images || []} onRefresh={fetchTourData}/>
        )}
        {activeTab === "desc" && (
          <TourDescriptions tourId={tour._id} descriptions={tour.descriptions || []} onRefresh={fetchTourData}/>
        )}
        {activeTab === "itinerary" && (
          <TourItineraries tourId={tour._id} itineraries={tour.itineraries || []} onRefresh={fetchTourData}/>
        )}
        {activeTab === "trips" && (
          <TourTrips tourId={tour._id} trips={tour.trips || []} onRefresh={fetchTourData}/>
        )}
      </div>
    </div>
  );
}