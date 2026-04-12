"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";

import TourInfo from "./TourInfo";
import TourImages from "./TourImages";
import TourDescriptions from "./TourDescriptions";
import TourItineraries from "./TourItineraries";
import TourTrips from "./TourTrips";

const API = "https://db-pickyourway.vercel.app/api";

export default function TourDetailPage() {
  const { slug } = useParams();
  const [tour, setTour] = useState<any>(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Hàm Refresh dữ liệu dùng chung cho tất cả các component con
  const fetchTourData = useCallback(async () => {
    try {
      // 1. Fetch chi tiết tour
      const tourRes = await fetch(`${API}/tours/detail/${slug}`);
      const tourData = await tourRes.json();

      // 2. Fetch danh mục (cần cho TourInfo)
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
      <div className="p-10 text-center font-bold">Đang tải dữ liệu Tour...</div>
    );
  if (!tour)
    return (
      <div className="p-10 text-center">Không tìm thấy thông tin Tour.</div>
    );

  return (
    <div className="min-h-screen bg-[#fcfcfc] p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Tiêu đề trang & ID */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter">
              QUẢN LÝ TOUR CHI TIẾT
            </h1>
            <p className="text-gray-400 text-xs font-bold uppercase mt-1">
              ID: {tour._id}
            </p>
          </div>
        </div>

        {/* 1. THÔNG TIN CƠ BẢN (Tên, Slug, Category, Status) */}
        <TourInfo
          tour={tour}
          categories={categories}
          onRefresh={fetchTourData}
        />

        {/* 2. QUẢN LÝ HÌNH ẢNH */}
        <TourImages
          tourId={tour._id}
          images={tour.images || []}
          onRefresh={fetchTourData}
        />

        {/* 3. QUẢN LÝ CHUYẾN ĐI & DỊCH VỤ (Phần vừa refactor BE) */}
        <TourTrips
          tourId={tour._id}
          trips={tour.trips || []}
          onRefresh={fetchTourData}
        />

        {/* 4. MÔ TẢ (Tổng quan, Chính sách, Lưu ý) */}
        <TourDescriptions
          tourId={tour._id}
          descriptions={tour.descriptions || []}
          onRefresh={fetchTourData}
        />

        {/* 5. LỊCH TRÌNH CHI TIẾT (Itinerary) */}
        <TourItineraries
          tourId={tour._id}
          itineraries={tour.itineraries || []}
          onRefresh={fetchTourData}
        />
      </div>
    </div>
  );
}
