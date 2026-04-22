"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

interface HeroBannerProps {
  title?: string;
  subtitle?: string;
  images?: string[];
  showSearch?: boolean;
  searchPlaceholder?: string;
  searchDestination?: string;
  onSearch?: (q: string) => void;
  searchRoute?: string;
  height?: string;
  quickTags?: string[];
  quickTagsRoute?: string;
  gradientBg?: string;
  children?: React.ReactNode;
}

const CITIES = [
  "Hà Nội", "Hạ Long", "Sapa", "Ninh Bình", "Hải Phòng",
  "Đà Nẵng", "Hội An", "Huế", "Quảng Bình", "Nha Trang",
  "TP. HCM", "TP.HCM", "Vũng Tàu", "Cần Thơ", "Phú Quốc",
  "Đà Lạt", "Buôn Ma Thuột", "Quy Nhơn", "Phan Thiết", "Mũi Né",
];

export default function HeroBanner({
  title = "Trải nghiệm kỳ nghỉ tuyệt vời",
  subtitle = "Combo khách sạn · các dịch vụ ưu đãi · giá tốt nhất",
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
  // ✅ checkIn lưu ngày khởi hành dạng "YYYY-MM-DD"
  const [checkIn, setCheckIn] = useState("");
  const [origin, setOrigin] = useState("TP.HCM");
  const [destination, setDestination] = useState(searchDestination ?? "");
  const [allTours, setAllTours] = useState<
    { id: string; slug: string; name: string; city: string; image: string }[]
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<
    { id: string; slug: string; name: string; city: string; image: string }[]
  >([]);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  const inputWrapRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchDestination !== undefined) setDestination(searchDestination);
  }, [searchDestination]);

  useEffect(() => {
    if (images.length <= 1) return;
    const t = setInterval(() => setBannerIdx((p) => (p + 1) % images.length), 4000);
    return () => clearInterval(t);
  }, [images.length]);

  useEffect(() => {
    fetch("https://db-pickyourway.vercel.app/api/tours")
      .then((r) => r.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setAllTours(
            res.data.map((t: any) => ({
              id: t._id,
              slug: t.slug,
              name: t.name,
              city: t.hotel_id?.city ?? "",
              image: t.images?.[0]?.image_url ?? "",
            }))
          );
        }
      })
      .catch(() => { });
  }, []);

  const recalcDropdown = useCallback(() => {
    if (!inputWrapRef.current) return;
    const rect = inputWrapRef.current.getBoundingClientRect();
    setDropdownStyle({
      position: "fixed",
      top: rect.bottom + 6,
      left: rect.left,
      width: rect.width,
      zIndex: 99999,
    });
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        inputWrapRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      )
        return;
      setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!showSuggestions) return;
    const handler = () => recalcDropdown();
    window.addEventListener("scroll", handler, true);
    window.addEventListener("resize", handler);
    return () => {
      window.removeEventListener("scroll", handler, true);
      window.removeEventListener("resize", handler);
    };
  }, [showSuggestions, recalcDropdown]);

  useEffect(() => {
    const q = destination.trim().toLowerCase();
    if (!q) {
      setSuggestions([]);
      return;
    }
    setSuggestions(
      allTours
        .filter(
          (t) =>
            t.name.toLowerCase().includes(q) ||
            t.city.toLowerCase().includes(q)
        )
        .slice(0, 8)
    );
  }, [destination, allTours]);

  const cityMatch =
    destination.trim().length >= 2
      ? CITIES.find((c) =>
        c.toLowerCase().includes(destination.trim().toLowerCase())
      ) ?? null
      : null;

  const normalize = (str: string) =>
    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d").replace(/Đ/g, "D")
      .toLowerCase().replace(/[\s.]/g, "");
  // const cityTourCount = cityMatch
  //   ? allTours.filter((t) => normalize(t.city) === normalize(cityMatch)).length
  //   : 0;

  const hasDropdown = showSuggestions && (suggestions.length > 0 || !!cityMatch);

  // ✅ Build URL với cả q, date, from
  function handleSearch() {
    const q = destination.trim();
    setShowSuggestions(false);

    if (onSearch && q) {
      onSearch(q);
      return;
    }

    const params = new URLSearchParams();
    if (q) params.set("q", q);
    // ✅ Thêm date nếu người dùng đã chọn
    if (checkIn) params.set("date", checkIn);
    // ✅ Thêm from nếu khác mặc định
    if (origin) params.set("from", origin);

    router.push(`${searchRoute}?${params.toString()}`);
  }

  const isAutoHeight = height === "h-auto";

  return (
    <section
      className={`relative ${isAutoHeight ? "" : height}`}
      style={{ isolation: "isolate" }}
    >
      {images.length > 0 ? (
        images.map((src, i) => (
          <img
            key={i}
            src={src}
            alt="banner"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${i === bannerIdx ? "opacity-100" : "opacity-0"
              }`}
          />
        ))
      ) : (
        <div
          className={`absolute inset-0 ${gradientBg ??
            "bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-400"
            }`}
        />
      )}

      {!isAutoHeight && (
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/65" />
      )}

      <div
        className={
          isAutoHeight
            ? "relative flex flex-col items-center justify-center px-4 py-14 gap-5"
            : "absolute inset-0 flex flex-col items-center justify-center px-4 gap-5"
        }
      >
        <div className="text-center">
          <h1 className="text-white text-3xl md:text-5xl font-black drop-shadow-lg leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-white/80 mt-2 text-sm md:text-base">{subtitle}</p>
          )}
        </div>

        {showSearch && (
          <div className="w-full max-w-4xl">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-4 flex flex-col gap-3">
                {/* Hàng 1: Địa điểm */}
                <div
                  ref={inputWrapRef}
                  className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 focus-within:border-orange-400 transition-colors"
                >
                  <svg className="w-5 h-5 text-orange-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  <input
                    className="flex-1 text-sm outline-none placeholder-gray-400 bg-transparent"
                    placeholder={searchPlaceholder}
                    value={destination}
                    onChange={(e) => {
                      setDestination(e.target.value);
                      setShowSuggestions(true);
                      recalcDropdown();
                    }}
                    onFocus={() => {
                      setShowSuggestions(true);
                      recalcDropdown();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSearch();
                    }}
                  />
                  {destination && (
                    <button
                      onClick={() => { setDestination(""); setShowSuggestions(false); }}
                      className="text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer p-0 leading-none text-lg"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Hàng 2 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* ✅ Ngày khởi hành — giờ cập nhật state checkIn */}
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
                        // ✅ Dùng onChange (không phải defaultValue) để lưu vào state
                        onChange={(e) => setCheckIn(e.target.value)}
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
                        onChange={(e) => setOrigin(e.target.value)}
                        className="text-sm font-medium outline-none bg-transparent w-full cursor-pointer text-gray-700"
                      >
                        {["TP.HCM", "Hà Nội", "Đà Nẵng", "Huế", "Cần Thơ"].map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Nút tìm kiếm */}
                  <button
                    onClick={handleSearch}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-1.5 border-none cursor-pointer"
                  >
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

        {children}

        {quickTags && quickTags.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            {quickTags.map((tag) => (
              <a
                key={tag}
                href={`${quickTagsRoute ?? searchRoute}?q=${encodeURIComponent(tag)}`}
                className="text-xs bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-full no-underline transition-colors backdrop-blur-sm"
              >
                {tag}
              </a>
            ))}
          </div>
        )}

        {images.length > 1 && (
          <div className="flex gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setBannerIdx(i)}
                className={`h-1.5 rounded-full transition-all border-none cursor-pointer p-0 ${i === bannerIdx ? "w-6 bg-white" : "w-1.5 bg-white/50"
                  }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Dropdown suggestions */}
      {hasDropdown && (
        <div
          ref={dropdownRef}
          style={dropdownStyle}
          className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-h-[420px] overflow-y-auto"
        >
          {cityMatch && (
            <button
              onClick={() => {
                setDestination(cityMatch);
                setShowSuggestions(false);
                const params = new URLSearchParams();
                params.set("q", cityMatch);
                if (checkIn) params.set("date", checkIn);
                if (origin) params.set("from", origin);
                router.push(`${searchRoute}?${params.toString()}`);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50 transition-colors text-left border-none bg-orange-500/5 cursor-pointer border-b border-orange-100"
            >
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center text-xl shrink-0">📍</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-orange-600">{cityMatch}</p>
                {/* <p className="text-[11px] text-gray-400">{cityTourCount} tour tại đây</p> */}
              </div>
              <span className="text-[11px] text-orange-500 font-bold shrink-0">Xem tất cả →</span>
            </button>
          )}

          {suggestions.length > 0 && (
            <>
              <div className="px-4 py-2 border-b border-gray-50 bg-gray-50/50">
                <span className="text-[11px] text-gray-400 font-semibold">
                  {suggestions.length > 0
                    ? `${suggestions.length} kết quả`
                    : "Không tìm thấy"}
                </span>
              </div>
              {suggestions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setDestination(s.name);
                    setShowSuggestions(false);
                    router.push(`/tours/${s.slug}`);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-orange-50 transition-colors text-left border-none bg-transparent cursor-pointer border-b border-gray-50 last:border-0"
                >
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                    {s.image ? (
                      <img src={s.image} alt={s.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-lg">🏖️</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 line-clamp-1">{s.name}</p>
                    <p className="text-[11px] text-gray-400 flex items-center gap-1"><span>📍</span>{s.city}</p>
                  </div>
                  <span className="text-[11px] text-orange-500 font-bold shrink-0">→</span>
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </section>
  );
}