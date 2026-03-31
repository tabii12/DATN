"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface HeroBannerProps {
  // Nội dung
  title?: string;
  subtitle?: string;
  // Ảnh nền — truyền mảng để có slideshow, hoặc 1 ảnh tĩnh
  images?: string[];
  // Search
  showSearch?: boolean;
  searchPlaceholder?: string;
  searchDestination?: string;       // controlled từ ngoài (optional)
  onSearch?: (q: string) => void;   // override hành vi search
  searchRoute?: string;             // mặc định "/tours/search"
  // Chiều cao
  height?: string; // vd: "h-[400px] md:h-[520px]"
  // Quick tags bên dưới search
  quickTags?: string[];
  quickTagsRoute?: string; // mặc định searchRoute
  // Gradient overlay tùy chỉnh (thay thế ảnh nền)
  gradientBg?: string;
  // Slot tùy chỉnh bên dưới title (vd: tabs, badge...)
  children?: React.ReactNode;
}

export default function HeroBanner({
  title = "Trải nghiệm kỳ nghỉ tuyệt vời",
  subtitle = "Combo khách sạn · vé máy bay · giá tốt nhất",
  images = [],
  showSearch = true,
  searchPlaceholder = "Bạn muốn đi đâu?",
  searchDestination,
  onSearch,
  searchRoute = "/tours/search",
  height = "h-[520px] md:h-[620px]",
  quickTags,
  quickTagsRoute,
  gradientBg,
  children,
}: HeroBannerProps) {
  const router = useRouter();
  const [bannerIdx, setBannerIdx] = useState(0);
  const [checkIn, setCheckIn] = useState("");
  const [origin, setOrigin] = useState("TP.HCM");
  const [destination, setDestination] = useState(searchDestination ?? "");

  // Sync nếu controlled từ ngoài
  useEffect(() => {
    if (searchDestination !== undefined) setDestination(searchDestination);
  }, [searchDestination]);

  // Auto-advance slideshow
  useEffect(() => {
    if (images.length <= 1) return;
    const t = setInterval(() => setBannerIdx(p => (p + 1) % images.length), 4000);
    return () => clearInterval(t);
  }, [images.length]);

  function handleSearch() {
    const q = destination.trim();
    if (!q) return;
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (checkIn) params.set("date", checkIn);
    if (origin) params.set("from", origin);
    if (onSearch) {
      onSearch(q);
    } else {
      router.push(`${searchRoute}?${params.toString()}`);
    }
  }

  const isAutoHeight = height === "h-auto";

  return (
    <section className={`relative ${isAutoHeight ? "" : height} overflow-hidden`}>
      {/* ── Ảnh nền ── */}
      {images.length > 0 ? (
        images.map((src, i) => (
          <img key={i} src={src} alt="banner"
            className={`${isAutoHeight ? "hidden" : "absolute"} inset-0 w-full h-full object-cover transition-opacity duration-700 ${i === bannerIdx ? "opacity-100" : "opacity-0"}`}
          />
        ))
      ) : (
        // Fallback gradient nếu không có ảnh
        <div className={`${isAutoHeight ? "absolute" : "absolute"} inset-0 ${gradientBg ?? "bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-400"}`} />
      )}

      {!isAutoHeight && <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/65" />}

      {/* ── Content ── */}
      <div className={isAutoHeight
        ? "relative flex flex-col items-center justify-center px-4 py-14 gap-5"
        : "absolute inset-0 flex flex-col items-center justify-center px-4 gap-5"
      }>
        {/* Title */}
        <div className="text-center">
          <h1 className="text-white text-3xl md:text-5xl font-black drop-shadow-lg leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-white/80 mt-2 text-sm md:text-base">{subtitle}</p>
          )}
        </div>

        {/* Search box — 2 hàng */}
        {showSearch && (
          <div className="w-full max-w-4xl">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-4 flex flex-col gap-3">
                {/* Hàng 1: Địa điểm */}
                <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 focus-within:border-orange-400 transition-colors">
                  <svg className="w-5 h-5 text-orange-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  <input
                    className="flex-1 text-sm outline-none placeholder-gray-400 bg-transparent"
                    placeholder={searchPlaceholder}
                    value={destination}
                    onChange={e => setDestination(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSearch()}
                  />
                  {destination && (
                    <button onClick={() => setDestination("")} className="text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer p-0 leading-none text-lg">✕</button>
                  )}
                </div>
                {/* Hàng 2: Ngày khởi hành + Khởi hành từ + Nút tìm */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Ngày khởi hành */}
                  <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-orange-400 transition-colors">
                    <svg className="w-4 h-4 text-orange-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-[10px] text-gray-400 leading-none">Ngày khởi hành</p>
                      <input
                        type="date"
                        min={new Date().toISOString().split("T")[0]}
                        className="text-sm font-medium outline-none bg-transparent w-full"
                        value={checkIn}
                        onChange={e => setCheckIn(e.target.value)}
                      />
                    </div>
                  </div>
                  {/* Khởi hành từ */}
                  <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-orange-400 transition-colors">
                    <svg className="w-4 h-4 text-orange-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-[10px] text-gray-400 leading-none">Khởi hành từ</p>
                      <select
                        value={origin}
                        onChange={e => setOrigin(e.target.value)}
                        className="text-sm font-medium outline-none bg-transparent w-full cursor-pointer text-gray-700"
                      >
                        {["TP.HCM", "Hà Nội", "Đà Nẵng", "Huế", "Cần Thơ"].map(c => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {/* Nút tìm kiếm */}
                  <button onClick={handleSearch} className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-1.5 border-none cursor-pointer">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Tìm kiếm
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Slot tuỳ chỉnh */}
        {children}

        {/* Quick tags */}
        {quickTags && quickTags.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            {quickTags.map(tag => (
              <a key={tag}
                href={`${quickTagsRoute ?? searchRoute}?q=${encodeURIComponent(tag)}`}
                className="text-xs bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-full no-underline transition-colors backdrop-blur-sm">
                {tag}
              </a>
            ))}
          </div>
        )}

        {/* Slideshow dots */}
        {images.length > 1 && (
          <div className="flex gap-2">
            {images.map((_, i) => (
              <button key={i} onClick={() => setBannerIdx(i)}
                className={`h-1.5 rounded-full transition-all border-none cursor-pointer p-0 ${i === bannerIdx ? "w-6 bg-white" : "w-1.5 bg-white/50"}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}