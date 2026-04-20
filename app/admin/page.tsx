"use client";

import { useState, useEffect } from "react";
import TourIsCommingSoon from "./dashboard/tourIsCommingSoon/page";

const API = "https://db-pickyourway.vercel.app/api";

interface TourAPI {
  _id: string;
  name: string;
  slug: string;
  status: string;
  hotel_id: { name: string; city: string; price_per_night: number; rating: number };
  category_id: { name: string } | null;
  images: { image_url: string }[];
  createdAt: string;
}

interface Stats {
  total: number;
  active: number;
  inactive: number;
  cities: number;
  avgPrice: number;
  topCity: string;
}

function formatVND(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "tr";
  return n.toLocaleString("vi-VN");
}

function StatCard({
  icon, label, value, sub, color, delay,
}: {
  icon: string; label: string; value: string | number;
  sub?: string; color: string; delay: number;
}) {
  const [displayed, setDisplayed] = useState(0);
  const target = typeof value === "number" ? value : 0;

  useEffect(() => {
    if (typeof value !== "number") return;
    let start = 0;
    const step = Math.ceil(target / 30);
    const t = setInterval(() => {
      start += step;
      if (start >= target) { setDisplayed(target); clearInterval(t); }
      else setDisplayed(start);
    }, 30);
    return () => clearInterval(t);
  }, [target]);

  return (
    <div
      className="relative bg-white rounded-2xl p-5 overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300 group"
      style={{ animationDelay: delay + "ms" }}
    >
      {/* Accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${color}`} />
      {/* Decorative circle */}
      <div className={`absolute -right-4 -bottom-4 w-20 h-20 rounded-full opacity-10 ${color}`} />

      <div className="flex items-start justify-between mb-3">
        <div className={`text-2xl w-10 h-10 rounded-xl flex items-center justify-center bg-opacity-10`}>
          {icon}
        </div>
      </div>
      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-3xl font-black text-gray-900 leading-none">
        {typeof value === "number" ? displayed.toLocaleString("vi-VN") : value}
      </p>
      {sub && <p className="text-[11px] text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

function TourRow({ tour, i }: { tour: TourAPI; i: number }) {
  const img = tour.images?.[0]?.image_url;
  const isActive = tour.status === "active";

  return (
    <tr className="border-b border-gray-50 hover:bg-orange-50/40 transition-colors group">
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-gray-100">
            {img
              ? <img src={img} alt={tour.name} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-lg">🏖️</div>
            }
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate max-w-55">{tour.name}</p>
            <p className="text-[11px] text-gray-400">{tour.hotel_id?.city}</p>
          </div>
        </div>
      </td>
      <td className="py-3 px-4">
        {tour.category_id
          ? <span className="text-[11px] bg-orange-50 text-orange-500 font-semibold px-2 py-0.5 rounded-full">{tour.category_id.name}</span>
          : <span className="text-[11px] text-gray-300">—</span>
        }
      </td>
      <td className="py-3 px-4">
        <span className="text-sm font-bold text-gray-700">
          {tour.hotel_id?.price_per_night ? formatVND(tour.hotel_id.price_per_night) + "đ" : "—"}
        </span>
      </td>
      <td className="py-3 px-4">
        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${isActive ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"
          }`}>
          {isActive ? "● Hoạt động" : "○ Tạm ẩn"}
        </span>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <a href={`/tours/${tour.slug}`} target="_blank"
            className="text-[11px] text-blue-500 hover:underline no-underline">Xem</a>
          <span className="text-gray-200">|</span>
          <a href={`/admin/tours/${tour.slug}`}
            className="text-[11px] text-orange-500 hover:underline no-underline">Sửa</a>
        </div>
      </td>
    </tr>
  );
}

export default function AdminDashboard() {
  const [tours, setTours] = useState<TourAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [tab, setTab] = useState<"overview" | "tours">("overview");

  useEffect(() => {
    fetch(`${API}/tours/admin?page=1&limit=1000`)
      .then(r => r.json())
      .then(res => { if (res.success) setTours(res.data || []); })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  // Tính stats
  const stats: Stats = {
    total: tours.length,
    active: tours.filter(t => t.status === "active").length,
    inactive: tours.filter(t => t.status !== "active").length,
    cities: new Set(tours.map(t => t.hotel_id?.city).filter(Boolean)).size,
    avgPrice: tours.length
      ? Math.round(tours.reduce((s, t) => s + (t.hotel_id?.price_per_night || 0), 0) / tours.length)
      : 0,
    topCity: (() => {
      const freq: Record<string, number> = {};
      tours.forEach(t => { const c = t.hotel_id?.city; if (c) freq[c] = (freq[c] || 0) + 1; });
      return Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
    })(),
  };

  // Filter tours
  const filtered = tours.filter(t => {
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.hotel_id?.city?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || (filterStatus === "active" ? t.status === "active" : t.status !== "active");
    return matchSearch && matchStatus;
  });

  // Top cities
  const cityMap: Record<string, number> = {};
  tours.forEach(t => { const c = t.hotel_id?.city; if (c) cityMap[c] = (cityMap[c] || 0) + 1; });
  const topCities = Object.entries(cityMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxCity = topCities[0]?.[1] || 1;

  // Categories
  const catMap: Record<string, number> = {};
  tours.forEach(t => { const c = t.category_id?.name; if (c) catMap[c] = (catMap[c] || 0) + 1; });
  const topCats = Object.entries(catMap).sort((a, b) => b[1] - a[1]).slice(0, 4);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h1 className="text-lg font-black text-gray-900">📊 Dashboard</h1>
          <p className="text-xs text-gray-400">Pick Your Way — Tổng quan hệ thống</p>
        </div>
      </div>

      <div className="max-w-full mx-auto px-4 py-6 space-y-6">

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          {([["overview", "Tổng quan"], ["tours", "Danh sách tour"]] as const).map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all border-none cursor-pointer ${tab === key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 bg-transparent hover:text-gray-700"
                }`}>
              {label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {tab === "overview" && (
          <>
            {/* Stat cards */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl h-28 animate-pulse border border-gray-100" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon="🗺️" label="Tổng số tours" value={stats.total} sub="Toàn bộ danh mục" color="bg-orange-500" delay={0} />
                <StatCard icon="✅" label="Đang hoạt động" value={stats.active} sub={`${stats.inactive} tạm ẩn`} color="bg-green-500" delay={60} />
                <StatCard icon="📍" label="Điểm đến" value={stats.cities} sub={"Phổ biến: " + stats.topCity} color="bg-blue-500" delay={120} />
                <StatCard icon="🚫" label="Không hoạt động" value={stats.inactive} sub={`${stats.total > 0 ? Math.round(stats.inactive / stats.total * 100) : 0}% tổng số`} color="bg-red-400" delay={180} />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Top cities bar chart */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="text-sm font-black text-gray-800 mb-4">📍 Tour theo điểm đến</h3>
                {loading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-6 bg-gray-100 rounded animate-pulse" />)}
                  </div>
                ) : topCities.length === 0 ? (
                  <p className="text-sm text-gray-400">Chưa có dữ liệu</p>
                ) : (
                  <div className="space-y-3">
                    {topCities.map(([city, count]) => (
                      <div key={city}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-gray-600">{city}</span>
                          <span className="text-xs text-gray-400">{count} tour</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-linear-to-r from-orange-400 to-orange-500 rounded-full transition-all duration-700"
                            style={{ width: `${(count / maxCity) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Category breakdown */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="text-sm font-black text-gray-800 mb-4">🏷️ Phân loại tour</h3>
                {loading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}
                  </div>
                ) : topCats.length === 0 ? (
                  <p className="text-sm text-gray-400">Chưa có dữ liệu</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {topCats.map(([cat, count], i) => {
                      const colors = ["bg-orange-50 text-orange-600", "bg-blue-50 text-blue-600", "bg-green-50 text-green-600", "bg-purple-50 text-purple-600"];
                      return (
                        <div key={cat} className={`rounded-xl p-3 ${colors[i % colors.length].split(" ")[0]}`}>
                          <p className={`text-lg font-black ${colors[i % colors.length].split(" ")[1]}`}>{count}</p>
                          <p className="text-[11px] text-gray-500 font-medium leading-tight mt-0.5">{cat}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Quick recent tours */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black text-gray-800">🕐 Tour mới nhất</h3>
                <button onClick={() => setTab("tours")} className="text-xs text-orange-500 font-semibold bg-transparent border-none cursor-pointer">Xem tất cả →</button>
              </div>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />)}
                </div>
              ) : (
                <div className="space-y-2">
                  {tours.slice(0, 5).map((t, i) => (
                    <div key={t._id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors">
                      <span className="text-[11px] text-gray-300 w-4 text-center font-bold">{i + 1}</span>
                      <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                        {t.images?.[0]?.image_url
                          ? <img src={t.images[0].image_url} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-sm">🏖️</div>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-700 truncate">{t.name}</p>
                        <p className="text-[11px] text-gray-400">{t.hotel_id?.city} · {t.category_id?.name ?? "Chưa phân loại"}</p>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${t.status === "active" ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"
                        }`}>
                        {t.status === "active" ? "Hoạt động" : "Ẩn"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* ── TOURS TAB ── */}
        {tab === "tours" && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 flex-wrap">
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 flex-1 min-w-50">
                <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text" placeholder="Tìm tên tour, điểm đến..." value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="flex-1 text-sm bg-transparent outline-none text-gray-700 placeholder-gray-400 border-none"
                />
              </div>
              <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
                {([["all", "Tất cả"], ["active", "Hoạt động"], ["inactive", "Tạm ẩn"]] as const).map(([v, l]) => (
                  <button key={v} onClick={() => setFilterStatus(v)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all border-none cursor-pointer ${filterStatus === v ? "bg-white shadow-sm text-gray-800" : "bg-transparent text-gray-500"
                      }`}>
                    {l}
                  </button>
                ))}
              </div>
              <span className="text-xs text-gray-400">{filtered.length} kết quả</span>
            </div>

            {/* Table */}
            {loading ? (
              <div className="p-5 space-y-3">
                {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center text-gray-400">
                <p className="text-4xl mb-3">🔍</p>
                <p className="font-semibold">Không tìm thấy tour nào</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-3">Tour</th>
                      <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-3">Danh mục</th>
                      <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-3">Giá/đêm</th>
                      <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-3">Trạng thái</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((t, i) => <TourRow key={t._id} tour={t} i={i} />)}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        <TourIsCommingSoon />
      </div>
    </div>
  );
}