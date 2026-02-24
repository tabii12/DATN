"use client";

import { useState, useEffect } from "react";

// ─────────────────────── DATA ───────────────────────

const NAV_LINKS = [
  { label: "Khách sạn", href: "/", active: true },
  { label: "Tours", href: "/du-lich/" },
  { label: "Vé máy bay", href: "/ve-may-bay/" },
  { label: "Vé vui chơi", href: "/ve-vui-choi/" },
  { label: "Vé tàu", href: "/ve-tau/" },
];

const BANNER_SLIDES = [
  "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1400&h=600&fit=crop",
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1400&h=600&fit=crop",
  "https://images.unsplash.com/photo-1559628129-67cf63b72248?w=1400&h=600&fit=crop",
];

const COMBO_DEALS = [
  {
    id: 1,
    name: "Khu nghỉ dưỡng Victoria Cần Thơ",
    location: "Cần Thơ",
    price: "1.250.000",
    stars: 4,
    tag: "Combo",
    image:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=260&fit=crop",
  },
  {
    id: 2,
    name: "Legacy Yên Tử - MGallery",
    location: "Quảng Ninh",
    price: "2.100.000",
    stars: 5,
    tag: "Hot",
    image:
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=260&fit=crop",
  },
  {
    id: 3,
    name: "Avani Quy Nhơn Resort & Spa",
    location: "Quy Nhơn",
    price: "1.890.000",
    stars: 5,
    tag: "Sale",
    image:
      "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=400&h=260&fit=crop",
  },
  {
    id: 4,
    name: "Movenpick Waverly Phú Quốc",
    location: "Phú Quốc",
    price: "3.200.000",
    stars: 5,
    tag: "Combo",
    image:
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=260&fit=crop",
  },
  {
    id: 5,
    name: "Ville De Mont Mountain Sapa",
    location: "Sapa",
    price: "1.650.000",
    stars: 4,
    tag: null,
    image:
      "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&h=260&fit=crop",
  },
  {
    id: 6,
    name: "Movenpick Resort Phan Thiết",
    location: "Phan Thiết",
    price: "2.450.000",
    stars: 5,
    tag: "Hot",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=260&fit=crop",
  },
  {
    id: 7,
    name: "Fusion Suites Vũng Tàu",
    location: "Vũng Tàu",
    price: "980.000",
    stars: 4,
    tag: "Sale",
    image:
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=260&fit=crop",
  },
  {
    id: 8,
    name: "Imperial Vũng Tàu",
    location: "Vũng Tàu",
    price: "1.100.000",
    stars: 5,
    tag: null,
    image:
      "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=400&h=260&fit=crop",
  },
];

const TRAVEL_STYLES = [
  {
    id: 1,
    title: "Tết Âm Lịch",
    subtitle: "Đảm bảo còn phòng",
    count: "34 khách sạn",
    href: "/chu-de/tet-am-lich",
    image:
      "https://images.unsplash.com/photo-1536599018102-9f803c140fc1?w=300&h=200&fit=crop",
    color: "from-red-600/70",
  },
  {
    id: 2,
    title: "Du Xuân Cầu An",
    subtitle: "Gửi trọn ước nguyện, đón nhận bình an!",
    count: "24 khách sạn",
    href: "/chu-de/du-xuan-cau-an",
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop",
    color: "from-amber-700/70",
  },
  {
    id: 3,
    title: "Club",
    subtitle: "Nghỉ dưỡng trọn gói, không còn mệt mỏi",
    count: "18 khách sạn",
    href: "/chu-de/khach-san-tron-goi",
    image:
      "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=300&h=200&fit=crop",
    color: "from-blue-700/70",
  },
  {
    id: 4,
    title: "Gift Voucher",
    subtitle: "Lưu giữ khoảnh khắc, trải nghiệm hành trình",
    count: "",
    href: "/voucher-du-lich",
    image:
      "https://images.unsplash.com/photo-1549294413-26f195200c16?w=300&h=200&fit=crop",
    color: "from-purple-700/70",
  },
];

const DOMESTIC_DESTINATIONS = [
  {
    name: "Phú Quốc",
    count: "921",
    image:
      "https://images.unsplash.com/photo-1559628233-100c798642d0?w=400&h=300&fit=crop",
    href: "/khach-san-phu-quoc",
    colSpan: 2,
    rowSpan: 2,
    height: "h-full",
  },
  {
    name: "Vũng Tàu",
    count: "705",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&h=200&fit=crop",
    href: "/khach-san-vung-tau",
  },
  {
    name: "Đà Lạt",
    count: "1178",
    image:
      "https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=300&h=200&fit=crop",
    href: "/khach-san-da-lat",
  },
  {
    name: "Quy Nhơn",
    count: "333",
    image:
      "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=300&h=200&fit=crop",
    href: "/khach-san-quy-nhon",
  },
  {
    name: "Nha Trang",
    count: "1024",
    image:
      "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=300&h=200&fit=crop",
    href: "/khach-san-nha-trang",
  },
  {
    name: "Cần thơ",
    count: "1359",
    image:
      "https://images.unsplash.com/photo-1559628129-67cf63b72248?w=300&h=200&fit=crop",
    href: "/khach-san-da-nang",
    colSpan: 2,
    height: "h-40",
  },
  {
    name: "Phan Thiết",
    count: "498",
    image:
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=300&h=200&fit=crop",
    href: "/khach-san-phan-thiet",
  },
];

const INTERNATIONAL_DESTINATIONS = [
  {
    name: "Singapore",
    count: "718",
    image:
      "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=400&h=280&fit=crop",
    href: "/khach-san-singapore",
  },
  {
    name: "Bangkok",
    count: "4211",
    image:
      "https://images.unsplash.com/photo-1563492065-9083d0abb967?w=400&h=280&fit=crop",
    href: "/khach-san-bangkok",
  },
  {
    name: "Seoul",
    count: "2490",
    image:
      "https://images.unsplash.com/photo-1538485399081-7191377e8241?w=400&h=280&fit=crop",
    href: "/khach-san-seoul",
  },
  {
    name: "Tokyo",
    count: "3869",
    image:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=280&fit=crop",
    href: "/khach-san-tokyo",
  },
  {
    name: "Thượng Hải",
    count: "3548",
    image:
      "https://images.unsplash.com/photo-1548919973-5cef591cdbc9?w=400&h=280&fit=crop",
    href: "/khach-san-shanghai",
  },
  {
    name: "Maldives",
    count: "849",
    image:
      "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=400&h=280&fit=crop",
    href: "/khach-san-maldives",
  },
];

// ─────────────────────── HELPERS ───────────────────────

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <svg
          key={i}
          className="w-3 h-3 fill-amber-400 text-amber-400"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function TagBadge({ tag }: { tag: string }) {
  const colors: Record<string, string> = {
    Hot: "bg-red-500",
    Sale: "bg-orange-500",
    Combo: "bg-blue-500",
  };
  return (
    <span
      className={`${colors[tag] ?? "bg-gray-500"} text-white text-[10px] font-bold px-2 py-0.5 rounded-full`}
    >
      {tag}
    </span>
  );
}

// ─────────────────────── MAIN ───────────────────────

export default function HomePage() {
  const [bannerIdx, setBannerIdx] = useState(0);
  const [searchTab, setSearchTab] = useState<"hotel" | "combo">("combo");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2 người lớn, 0 trẻ em, 1 phòng");
  const [destination, setDestination] = useState("");
  const [slideIdx, setSlideIdx] = useState(0);
  const CARDS_PER_VIEW = 4;
  const MAX_SLIDE = COMBO_DEALS.length - 1;

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIdx((prev) => (prev >= COMBO_DEALS.length - 1 ? 0 : prev + 1));
    }, 3000);
    return () => clearInterval(timer);
  }, [MAX_SLIDE]);

  return (
    <div className="min-h-screen bg-[#f5f5f5] font-sans text-gray-800">
      {/* ══════════════════ HERO BANNER + SEARCH ══════════════════ */}
      <section className="relative h-130 md:h-155 overflow-hidden">
        {/* Banner images */}
        {BANNER_SLIDES.map((src, i) => (
          <img
            key={i}
            src={src}
            alt="banner"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${i === bannerIdx ? "opacity-100" : "opacity-0"}`}
          />
        ))}
        <div className="absolute inset-0 bg-linear-to-b from-black/40 via-black/30 to-black/65" />

        {/* Centered overlay content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 gap-5">
          {/* Title */}
          <div className="text-center">
            <h1 className="text-white text-3xl md:text-5xl font-black drop-shadow-lg leading-tight">
              Trải nghiệm kỳ nghỉ tuyệt vời
            </h1>
            <p className="text-white/80 mt-2 text-sm md:text-base">
              Combo khách sạn · vé máy bay · giá tốt nhất
            </p>
          </div>

          {/* Search box */}
          <div className="w-full max-w-4xl">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Fields */}
              <div className="p-4 flex flex-col gap-3">
                {/* Row 1: Destination full width */}
                <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 focus-within:border-orange-400 transition-colors">
                  <svg
                    className="w-5 h-5 text-orange-500 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                  </svg>
                  <input
                    className="flex-1 text-sm outline-none placeholder-gray-400 bg-transparent"
                    placeholder="Bạn muốn đi đâu?"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  />
                </div>
                {/* Row 2: Check-in | Check-out | Guests | Tìm */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {/* Check-in */}
                  <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-orange-400 transition-colors">
                    <svg
                      className="w-4 h-4 text-orange-500 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <div className="flex-1">
                      <p className="text-[10px] text-gray-400 leading-none">
                        Nhận phòng
                      </p>
                      <input
                        type="date"
                        className="text-sm font-medium outline-none bg-transparent w-full"
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                      />
                    </div>
                  </div>
                  {/* Check-out */}
                  <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-orange-400 transition-colors">
                    <svg
                      className="w-4 h-4 text-orange-500 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <div className="flex-1">
                      <p className="text-[10px] text-gray-400 leading-none">
                        Trả phòng
                      </p>
                      <input
                        type="date"
                        className="text-sm font-medium outline-none bg-transparent w-full"
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                      />
                    </div>
                  </div>
                  {/* Guests */}
                  <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5">
                    <svg
                      className="w-4 h-4 text-orange-500 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <p className="text-xs text-gray-600 truncate">
                      2 người lớn, 1 phòng
                    </p>
                  </div>
                  {/* Search button */}
                  <button className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-1.5">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    Tìm kiếm
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Slide dots */}
          <div className="flex gap-2">
            {BANNER_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setBannerIdx(i)}
                className={`h-1.5 rounded-full transition-all ${i === bannerIdx ? "w-6 bg-white" : "w-1.5 bg-white/50"}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ COMBO TỐT NHẤT ══════════════════ */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Combo tốt nhất hôm nay
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Nhanh tay đặt ngay. Để mai sẽ lỡ
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/combo"
              className="text-sm font-semibold text-orange-500 flex items-center gap-1 hover:underline"
            >
              Xem tất cả
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </a>
            <div className="flex gap-2">
              <button
                onClick={() => setSlideIdx((p) => Math.max(0, p - 1))}
                disabled={slideIdx === 0}
                className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-orange-400 hover:text-orange-500 disabled:opacity-30 transition-all"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                onClick={() =>
                  setSlideIdx((p) => Math.min(COMBO_DEALS.length - 1, p + 1))
                }
                disabled={slideIdx === COMBO_DEALS.length - 1}
                className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-orange-400 hover:text-orange-500 disabled:opacity-30 transition-all"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Banner slider — full width, text overlay bên phải */}
        <div className="relative overflow-hidden rounded-2xl shadow-md cursor-pointer group">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${slideIdx * 100}%)` }}
          >
            {COMBO_DEALS.map((deal) => (
              <div
                key={deal.id}
                className="relative w-full shrink-0 h-55 md:h-70"
              >
                {/* Ảnh nền */}
                <img
                  src={deal.image}
                  alt={deal.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                {/* Gradient overlay từ phải sang */}
                <div className="absolute inset-0 bg-linear-to-l from-black/80 via-black/40 to-transparent" />

                {/* Content bên phải */}
                <div className="absolute inset-0 flex flex-col items-end justify-center pr-8 md:pr-14 text-right gap-1">
                  {/* Tag */}
                  {deal.tag && (
                    <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-1">
                      Combo tiết kiệm đến 34%
                    </span>
                  )}
                  {/* Sub label */}
                  <p className="text-white/70 text-xs tracking-[0.2em] uppercase">
                    Combo 2N1Đ
                  </p>
                  {/* Hotel name */}
                  <h3 className="text-white font-black text-2xl md:text-3xl leading-tight uppercase tracking-wide drop-shadow">
                    {deal.name}
                  </h3>
                  {/* Amenities */}
                  <p className="text-white/80 text-sm mt-0.5">
                    Limousine giường nằm · Villa riêng · Ăn sáng · Trà chiều
                  </p>
                  {/* Price + arrow */}
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-orange-400 font-black text-2xl md:text-3xl">
                      {deal.price}đ/khách
                    </span>
                    <div className="w-8 h-8 rounded-full border-2 border-white/60 flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-1.5 mt-3">
          {COMBO_DEALS.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlideIdx(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === slideIdx ? "w-6 bg-orange-500" : "w-1.5 bg-gray-300"}`}
            />
          ))}
        </div>
      </section>

      {/* ══════════════════ PHONG CÁCH DU LỊCH ══════════════════ */}
      <section className="max-w-7xl mx-auto px-4 py-4 pb-10">
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Phong cách du lịch
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Đặc quyền chọn lọc, dịch vụ tận tâm cho kỳ nghỉ nhẹ nhàng tinh tế.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {TRAVEL_STYLES.map((style) => (
            <a
              key={style.id}
              href={style.href}
              className="group relative rounded-2xl overflow-hidden h-48 block cursor-pointer shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
            >
              <img
                src={style.image}
                alt={style.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div
                className={`absolute inset-0 bg-linear-to-t ${style.color} to-transparent`}
              />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-bold text-base leading-tight">
                  {style.title}
                </h3>
                <p className="text-white/80 text-xs mt-0.5 line-clamp-2">
                  {style.subtitle}
                </p>
                {style.count && (
                  <span className="inline-block mt-1.5 bg-white/20 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full">
                    -{style.count}
                  </span>
                )}
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ══════════════════ ĐIỂM ĐẾN TRONG NƯỚC ══════════════════ */}
      <section className="max-w-7xl mx-auto px-4 py-4 pb-10">
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Điểm đến yêu thích trong nước
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Lên rừng xuống biển. Trọn vẹn Việt Nam
            </p>
          </div>
          <a
            href="/khach-san"
            className="text-sm font-semibold text-orange-500 flex items-center gap-1 hover:underline"
          >
            Xem tất cả
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </a>
        </div>

        {/* Mosaic grid — y như ảnh mẫu */}
        <div
          className="grid gap-2"
          style={{
            gridTemplateColumns: "843fr 353fr",
            gridTemplateRows: "352px 352px 704px",
          }}
        >
          {/* Quy Nhơn — hàng 1, cột trái (843px wide) */}
          <a
            href="/khach-san/quy-nhon"
            className="relative rounded-2xl overflow-hidden group cursor-pointer shadow-sm"
          >
            <img
              src={DOMESTIC_DESTINATIONS[3].image}
              alt="Quy Nhơn"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-4">
              <p className="text-white font-bold text-lg">Quy Nhơn</p>
              <p className="text-white/70 text-xs">333 khách sạn</p>
            </div>
          </a>

          {/* Đà Lạt — cột phải, row-span-2 (353px wide × 791px tall) */}
          <a
            href="/khach-san/da-lat"
            className="row-span-2 relative rounded-2xl overflow-hidden group cursor-pointer shadow-sm"
          >
            <img
              src={DOMESTIC_DESTINATIONS[2].image}
              alt="Đà Lạt"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-4">
              <p className="text-white font-bold text-lg">Đà Lạt</p>
              <p className="text-white/70 text-xs">1178 khách sạn</p>
            </div>
          </a>

          {/* Vũng Tàu — hàng 2, cột trái (843px wide) */}
          <a
            href="/khach-san/vung-tau"
            className="relative rounded-2xl overflow-hidden group cursor-pointer shadow-sm"
          >
            <img
              src={DOMESTIC_DESTINATIONS[1].image}
              alt="Vũng Tàu"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-4">
              <p className="text-white font-bold text-lg">Vũng Tàu</p>
              <p className="text-white/70 text-xs">705 khách sạn</p>
            </div>
          </a>

          {/* Hàng 3: Nha Trang + Cần Thơ — fullwidth col-span-2 */}
          <div className="col-span-2 grid grid-cols-2 gap-2">
            <a
              href="/khach-san/nha-trang"
              className="relative rounded-2xl overflow-hidden group cursor-pointer shadow-sm"
            >
              <img
                src={DOMESTIC_DESTINATIONS[4].image}
                alt="Nha Trang"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-4">
                <p className="text-white font-bold text-lg">Nha Trang</p>
                <p className="text-white/70 text-xs">1024 khách sạn</p>
              </div>
            </a>

            <a
              href="/khach-san/can-tho"
              className="relative rounded-2xl overflow-hidden group cursor-pointer shadow-sm"
            >
              <img
                src={
                  DOMESTIC_DESTINATIONS[5]?.image ??
                  DOMESTIC_DESTINATIONS[0].image
                }
                alt="Cần Thơ"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-4">
                <p className="text-white font-bold text-lg">Cần Thơ</p>
                <p className="text-white/70 text-xs">210 khách sạn</p>
              </div>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
