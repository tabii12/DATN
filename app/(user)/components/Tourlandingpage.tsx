"use client";

import { useState, useEffect } from "react";
import HeroBanner from "./HeroBanner";

interface TourAPI {
  _id: string;
  name: string;
  slug: string;
  category_id: { name: string; slug: string } | null;
  images: { image_url: string }[];
  descriptions: { title: string; content: string }[];
}
type TripMin = {
  tour_id: string; price: number; base_price: number;
  start_date: string; status: string; booked_people: number; max_people: number;
};

const REGIONS = [
  { label: "Miền Bắc",   cities: ["Hà Nội", "Hạ Long", "Sapa", "Ninh Bình"],       img: "https://images.unsplash.com/photo-1509030450996-dd1a26dda07a?w=600&q=80" },
  { label: "Miền Trung", cities: ["Đà Nẵng", "Hội An", "Huế", "Quảng Bình"],        img: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600&q=80" },
  { label: "Miền Nam",   cities: ["TP. HCM", "Vũng Tàu", "Cần Thơ", "Phú Quốc"],   img: "https://images.unsplash.com/photo-1528127269322-539801943592?w=600&q=80" },
  { label: "Tây Nguyên", cities: ["Đà Lạt", "Buôn Ma Thuột", "Pleiku"],             img: "https://images.unsplash.com/photo-1600298881974-6be191ceeda1?w=600&q=80" },
];


function SectionHeader({ emoji, title, sub, href, linkLabel = "Xem tất cả →" }: { emoji?: string; title: string; sub?: string; href?: string; linkLabel?: string }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        <div className="w-1 h-7 bg-orange-500 rounded-full shrink-0"/>
        <div>
          <h2 className="text-xl font-black text-gray-900">{emoji} {title}</h2>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
      </div>
      {href && <a href={href} className="text-sm text-orange-500 font-semibold hover:underline no-underline shrink-0">{linkLabel}</a>}
    </div>
  );
}

function TourCard({ tour, badge, trip }: { tour: TourAPI; badge?: string; trip?: TripMin }) {
  const img   = tour.images?.[0]?.image_url;
  const price = trip ? (trip.price || trip.base_price || 0) : null;
  const startDate = trip?.start_date
    ? new Date(trip.start_date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })
    : null;

  return (
    <a href={`/tours/${tour.slug}`} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col no-underline border border-gray-100">
      <div className="relative overflow-hidden aspect-video">
        {img
          ? <img src={img} alt={tour.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy"/>
          : <div className="w-full h-full bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center"><span className="text-4xl">🏖️</span></div>}
        {badge && <div className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">{badge}</div>}
        {startDate && <div className="absolute bottom-2 left-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">🗓 {startDate}</div>}
      </div>
      <div className="p-3.5 flex flex-col gap-1.5 flex-1">
        {tour.category_id && (
          <span className="text-[10px] font-semibold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full w-fit">{tour.category_id.name}</span>
        )}
        <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-orange-500 transition-colors">{tour.name}</h3>
        <div className="mt-auto pt-2 flex items-center justify-between border-t border-gray-50">
          <div>
            <p className="text-[10px] text-gray-400 leading-none mb-0.5">{startDate ? `Khởi hành ${startDate}` : "Giá từ"}</p>
            {price
              ? <p className="text-sm font-black text-orange-500 leading-tight">{price.toLocaleString("vi-VN")}<span className="text-[10px] font-normal text-gray-400">đ/người</span></p>
              : <p className="text-xs text-gray-400 italic">Chưa có lịch khởi hành</p>}
          </div>
          <span className="text-[11px] bg-orange-500 text-white font-semibold px-3 py-1 rounded-full shrink-0">Đặt ngay</span>
        </div>
      </div>
    </a>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
      <div className="aspect-video bg-gray-200"/>
      <div className="p-3.5 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-1/3"/>
        <div className="h-4 bg-gray-200 rounded w-full"/>
        <div className="h-4 bg-gray-200 rounded w-3/4"/>
        <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"/>
      </div>
    </div>
  );
}

export default function ToursLandingPage() {
  const [tours, setTours]           = useState<TourAPI[]>([]);
  const [loading, setLoading]       = useState(true);
  const [tripMap, setTripMap]       = useState<Record<string, TripMin>>({});
  const [saleIds, setSaleIds]       = useState<Set<string>>(new Set());
  const [bannerImages, setBannerImages] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("https://db-pickyourway.vercel.app/api/tours").then(r => r.json()),
      fetch("https://db-pickyourway.vercel.app/api/sales").then(r => r.json()).catch(() => ({ data: [] })),
      fetch("https://db-pickyourway.vercel.app/api/home").then(r => r.json()).catch(() => null),
    ])
      .then(async ([res, salesRes, homeRes]) => {
        if (!res.success) return;
        const tourList: TourAPI[] = res.data;
        const ids = new Set<string>((salesRes.data ?? []).map((s: any) => s.tour_id as string));
        setSaleIds(ids);
        setTours(tourList);
        if (homeRes?.success && homeRes.data?.banners) {
          setBannerImages(homeRes.data.banners.map((b: any) => b.image_url).filter(Boolean));
        } else {
          setBannerImages(tourList.slice(0, 5).map(t => t.images?.[0]?.image_url).filter(Boolean) as string[]);
        }
        setLoading(false);

        try {
          const results = await Promise.allSettled(
            tourList.map(t =>
              fetch(`https://db-pickyourway.vercel.app/api/trips/tour/${t.slug}`)
                .then(r => r.json()).then(d => ({ tourId: t._id, trips: d.data || [] }))
            )
          );
          const map: Record<string, TripMin> = {};
          const now = new Date(); now.setHours(0, 0, 0, 0);
          results.forEach(r => {
            if (r.status !== "fulfilled") return;
            const { tourId, trips } = r.value;
            const upcoming = (trips as any[])
              .filter(t => {
                if (t.status !== "open" || t.booked_people >= t.max_people) return false;
                const s = new Date(t.start_date); s.setHours(0, 0, 0, 0);
                return s >= now;
              })
              .sort((a: any, b: any) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
            if (upcoming.length > 0) map[tourId] = upcoming[0];
          });
          setTripMap(map);
        } catch {}
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const saleTours    = tours.filter(t => saleIds.has(t._id));
  const dealTours    = saleTours.length > 0 ? saleTours.slice(0, 8) : tours.slice(0, 8);
  const popularTours = tours.slice(0, 8);

  // Tours khởi hành sớm nhất (có trip gần nhất)
  const soonTours = [...tours]
    .filter(t => tripMap[t._id])
    .sort((a, b) => new Date(tripMap[a._id].start_date).getTime() - new Date(tripMap[b._id].start_date).getTime())
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">

      <HeroBanner
        title="Hành trình đáng nhớ bắt đầu từ đây"
        subtitle="Hơn 100 tour du lịch trong nước, giá tốt nhất, dịch vụ chuyên nghiệp"
        searchPlaceholder="Tìm điểm đến, tên tour..."
        searchRoute="/tours/search"
        images={bannerImages}
      />

      <div className="max-w-7xl mx-auto px-4 py-10 space-y-14">

        {/* ── KHỞI HÀNH SẮP TỚI ── */}
        <section>
          <SectionHeader emoji="⏰" title="Khởi Hành Sắp Tới" sub="Đặt ngay trước khi hết chỗ" href="/tours/search"/>
          {loading
            ? <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i}/>)}</div>
            : soonTours.length > 0
              ? <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {soonTours.map(t => <TourCard key={t._id} tour={t} trip={tripMap[t._id]}/>)}
                </div>
              : null}
        </section>

        {/* ── TOUR ƯU ĐÃI ── */}
        <section>
          <SectionHeader emoji="🔥" title="Tour Ưu Đãi Tốt Nhất" sub="Giá đặc biệt, số lượng có hạn" href="/tours/search?sale=1"/>
          {loading
            ? <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i}/>)}</div>
            : <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {dealTours.map((t, i) => <TourCard key={t._id} tour={t} trip={tripMap[t._id]} badge={i === 0 ? "🔥 Hot Deal" : i === 1 ? "⚡ Flash Sale" : undefined}/>)}
              </div>}
        </section>


        {/* ── TOUR PHỔ BIẾN ── */}
        <section>
          <SectionHeader emoji="⭐" title="Tour Du Lịch Phổ Biến" sub="Được khách hàng yêu thích nhất" href="/tours/search?q="/>
          {loading
            ? <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i}/>)}</div>
            : <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {popularTours.map(t => <TourCard key={t._id} tour={t} trip={tripMap[t._id]}/>)}
              </div>}
        </section>

        {/* ── KHÁM PHÁ THEO VÙNG ── */}
        <section>
          <SectionHeader emoji="🗺️" title="Khám Phá Theo Vùng" sub="Chọn điểm đến theo miền"/>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {REGIONS.map(r => (
              <a key={r.label} href={`/tours/search?region=${encodeURIComponent(r.label)}`}
                className="group relative rounded-2xl overflow-hidden h-40 no-underline shadow-sm hover:shadow-lg transition-all duration-300">
                <img src={r.img} alt={r.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"/>
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white font-black text-sm">{r.label}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {r.cities.slice(0, 3).map(c => <span key={c} className="text-[9px] text-white/80 bg-white/20 px-1.5 py-0.5 rounded-full">{c}</span>)}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>

      

      </div>
    </div>
  );
}