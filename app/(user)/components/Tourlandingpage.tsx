"use client";

import { useState, useEffect } from "react";
import HeroBanner from "./HeroBanner";

interface TourAPI {
  _id: string;
  name: string;
  slug: string;
  hotel_id: {
    name: string;
    address: string;
    city: string;
    price_per_night: number;
    rating: number;
  };
  category_id: { name: string; slug: string } | null;
  images: { image_url: string }[];
  descriptions: { title: string; content: string }[];
}

const HOLIDAYS = [
  { label: "Tết Nguyên Đán", emoji: "🧧", date: "29 tháng 1" },
  { label: "30/4 – 1/5", emoji: "🎉", date: "30 Tháng 4" },
  { label: "Quốc Khánh 2/9", emoji: "🇻🇳", date: "2 Tháng 9" },
  { label: "Giáng Sinh", emoji: "🎄", date: "25 Tháng 12" },
];

const REGIONS = [
  { label: "Miền Bắc", cities: ["Hà Nội", "Hạ Long", "Sapa", "Ninh Bình"], img: "https://images.unsplash.com/photo-1509030450996-dd1a26dda07a?w=600&q=80" },
  { label: "Miền Trung", cities: ["Đà Nẵng", "Hội An", "Huế", "Quảng Bình"], img: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600&q=80" },
  { label: "Miền Nam", cities: ["TP. HCM", "Vũng Tàu", "Cần Thơ", "Phú Quốc"], img: "https://images.unsplash.com/photo-1528127269322-539801943592?w=600&q=80" },
  { label: "Tây Nguyên", cities: ["Đà Lạt", "Buôn Ma Thuột", "Pleiku"], img: "https://images.unsplash.com/photo-1600298881974-6be191ceeda1?w=600&q=80" },
];

function scoreFromRating(r: number) {
  return Math.min(9.9, parseFloat((r * 1.8 + 0.8).toFixed(1)));
}

function TourCard({ tour, badge }: { tour: TourAPI; badge?: string }) {
  const score = scoreFromRating(tour.hotel_id.rating);
  const img = tour.images?.[0]?.image_url;
  const price = tour.hotel_id.price_per_night;

  return (
    <a href={`/tours/${tour.slug}`} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col no-underline border border-gray-100">
      <div className="relative overflow-hidden aspect-video">
        {img ? (
          <img src={img} alt={tour.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center">
            <span className="text-4xl">🏖️</span>
          </div>
        )}
        {badge && (
          <div className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
            {badge}
          </div>
        )}
        <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2 py-0.5 rounded-full">
          {score.toFixed(1)} ⭐
        </div>
      </div>
      <div className="p-3.5 flex flex-col gap-1.5 flex-1">
        {tour.category_id && (
          <span className="text-[10px] font-semibold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full w-fit">
            {tour.category_id.name}
          </span>
        )}
        <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-orange-500 transition-colors">
          {tour.name}
        </h3>
        <p className="text-[11px] text-gray-400 flex items-center gap-1">
          <span>📍</span>{tour.hotel_id.city}
        </p>
        <div className="mt-auto pt-2 flex items-center justify-between border-t border-gray-50">
          <div>
            <p className="text-[10px] text-gray-400">Giá từ</p>
            <p className="text-sm font-black text-orange-500">
              {price.toLocaleString("vi-VN")}
              <span className="text-[10px] font-normal text-gray-400">/đêm</span>
            </p>
          </div>
          <span className="text-[11px] bg-orange-500 text-white font-semibold px-3 py-1 rounded-full">
            Đặt ngay
          </span>
        </div>
      </div>
    </a>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
      <div className="aspect-video bg-gray-200" />
      <div className="p-3.5 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2 mt-2" />
      </div>
    </div>
  );
}

export default function ToursLandingPage() {
  const [tours, setTours] = useState<TourAPI[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://db-datn-six.vercel.app/api/tours")
      .then(r => r.json())
      .then(res => { if (res.success) setTours(res.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);


  // Nhóm tour
  const dealTours    = tours.slice(0, 4);
  const popularTours = tours.slice(0, 8);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">

      {/* ── HERO ── */}
      <HeroBanner
        title="Hành trình đáng nhớ bắt đầu từ đây"
        subtitle="Hơn 500 tour du lịch trong nước, giá tốt nhất, dịch vụ chuyên nghiệp"
        searchPlaceholder="Tìm điểm đến, tên tour..."
        searchRoute="/tours/search"
      />

      <div className="max-w-7xl mx-auto px-4 py-10 space-y-12">

        {/* ── TOUR ƯU ĐÃI TỐT NHẤT HÔM NAY ── */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-1 h-7 bg-orange-500 rounded-full" />
              <div>
                <h2 className="text-xl font-black text-gray-900">🔥 Tour Ưu Đãi Tốt Nhất Hôm Nay</h2>
                <p className="text-xs text-gray-400 mt-0.5">Giá đặc biệt, số lượng có hạn</p>
              </div>
            </div>
            <a href="/tours/search?q=" className="text-sm text-orange-500 font-semibold hover:underline no-underline">Xem tất cả →</a>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {dealTours.map((t, i) => (
                <TourCard key={t._id} tour={t} badge={i === 0 ? "🔥 Hot Deal" : i === 1 ? "⚡ Flash Sale" : undefined} />
              ))}
            </div>
          )}
        </section>

        {/* ── TOUR DỊP LỄ ── */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-1 h-7 bg-orange-500 rounded-full" />
            <div>
              <h2 className="text-xl font-black text-gray-900">🎊 Tour Dịp Lễ</h2>
              <p className="text-xs text-gray-400 mt-0.5">Kế hoạch sớm, giá tốt hơn</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {HOLIDAYS.map(h => (
              <a key={h.label} href={`/tours/search?q=${encodeURIComponent(h.label)}`}
                className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 p-5 text-center hover:shadow-lg hover:border-orange-200 transition-all duration-300 no-underline">
                <div className="text-4xl mb-3">{h.emoji}</div>
                <p className="text-sm font-bold text-gray-900 group-hover:text-orange-500 transition-colors">{h.label}</p>
                <p className="text-[11px] text-gray-400 mt-1">{h.date}</p>
                <div className="mt-3 text-[11px] font-semibold text-orange-500 bg-orange-50 rounded-full px-3 py-1">
                  Xem tour →
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* ── TOUR PHỔ BIẾN ── */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-1 h-7 bg-orange-500 rounded-full" />
              <div>
                <h2 className="text-xl font-black text-gray-900">⭐ Tour Du Lịch Phổ Biến</h2>
                <p className="text-xs text-gray-400 mt-0.5">Được khách hàng yêu thích nhất</p>
              </div>
            </div>
            <a href="/tours/search?q=" className="text-sm text-orange-500 font-semibold hover:underline no-underline">Xem tất cả →</a>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {popularTours.map(t => <TourCard key={t._id} tour={t} />)}
            </div>
          )}
        </section>

        {/* ── KHÁM PHÁ THEO VÙNG ── */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-1 h-7 bg-orange-500 rounded-full" />
            <div>
              <h2 className="text-xl font-black text-gray-900">🗺️ Khám Phá Theo Vùng</h2>
              <p className="text-xs text-gray-400 mt-0.5">Chọn điểm đến theo miền</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {REGIONS.map(r => (
              <a key={r.label} href={`/tours/search?q=${encodeURIComponent(r.label)}`}
                className="group relative rounded-2xl overflow-hidden h-40 no-underline shadow-sm hover:shadow-lg transition-all duration-300">
                <img src={r.img} alt={r.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white font-black text-sm">{r.label}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {r.cities.slice(0, 3).map(c => (
                      <span key={c} className="text-[9px] text-white/80 bg-white/20 px-1.5 py-0.5 rounded-full">{c}</span>
                    ))}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* ── WHY US ── */}
        <section className="bg-white rounded-2xl border border-gray-100 p-8">
          <h2 className="text-xl font-black text-gray-900 text-center mb-6">Tại sao chọn Pick Your Way?</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              ["🛡️", "An toàn tuyệt đối", "Bảo hiểm toàn hành trình"],
              ["💰", "Giá tốt nhất", "Cam kết hoàn tiền nếu rẻ hơn"],
              ["⭐", "Hướng dẫn viên 5 sao", "Đào tạo chuyên nghiệp"],
              ["📞", "Hỗ trợ 24/7", "Hotline 1900 1870"],
            ].map(([icon, title, sub]) => (
              <div key={title as string}>
                <div className="text-3xl mb-2">{icon}</div>
                <p className="text-sm font-bold text-gray-900">{title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}