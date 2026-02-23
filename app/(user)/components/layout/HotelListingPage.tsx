"use client";

import { useState } from "react";

// ─────────────────────────── DATA ───────────────────────────

const HOTELS = [
    {
        id: 1,
        slug: "the-ocean-resort-by-fusion-quy-nhon",
        name: "The Ocean Resort by Fusion Quy Nhơn",
        image: "https://cdn1.ivivu.com/images/2024/03/01/16/n6b02n_27xzb0_oecr1i_-374x280.webp",
        combo: "3N2Đ VMB + Bữa sáng | 3tr399",
        rating: 9.2,
        ratingLabel: "Tuyệt vời",
        reviewCount: 25,
        address: "Khu kinh tế Nhơn Hội, phường Cát Tiên",
        tags: ["Villa", "cánh đồng quạt gió", "hồ bơi cao cấp"],
        stars: 5,
        featured: true,
    },
    {
        id: 2,
        slug: "maia-resort-quy-nhon",
        name: "Khu nghỉ dưỡng Maia Quy Nhơn",
        image: "https://cdn1.ivivu.com/images/2025/02/11/18/ava_hpa_-374x280.webp",
        combo: "3N2Đ VMB + Bữa ăn | 4tr699",
        rating: 9.7,
        ratingLabel: "Tuyệt vời",
        reviewCount: 133,
        address: "Khu kinh tế Nhơn Hội, phường Cát Tiên",
        tags: ["Gần Linh Phong Thiền Tự", "Bên cánh đồng quạt gió", "Villa riêng cao cấp"],
        stars: 5,
        featured: true,
    },
    {
        id: 3,
        slug: "khach-san-grand-hyams-quy-nhon",
        name: "Khách sạn Grand Hyams Quy Nhơn",
        image: "https://cdn1.ivivu.com/images/2024/06/25/09/a1_wc4ofz_-374x280.webp",
        combo: "3N2Đ + VMB + Bữa sáng | 2tr999",
        rating: 9.6,
        ratingLabel: "Tuyệt vời",
        reviewCount: 72,
        address: "28 Nguyễn Huệ, Phường Lê Lợi",
        tags: ["Gần bãi biển Quy Nhơn", "Khách sạn trung tâm", "Thiết kế sang trọng"],
        stars: 4,
        featured: true,
    },
    {
        id: 4,
        slug: "flc-city-hotel-beach-quy-nhon",
        name: "FLC City Hotel Beach Quy Nhơn",
        image: "//cdn1.ivivu.com/iVivu/2021/08/09/15/daidien2-374x280.webp?o=jpg",
        combo: "3N2Đ Ăn sáng | 1tr099",
        rating: 9.5,
        ratingLabel: "Tuyệt vời",
        reviewCount: 85,
        address: "11 An Dương Vương, Nguyễn Văn Cừ",
        tags: ["Gần bãi biển Quy Nhơn", "Tổ hợp thương mại", "Căn hộ"],
        stars: 4,
        featured: false,
    },
    {
        id: 5,
        slug: "khach-san-flc-grand-quy-nhon",
        name: "Khách sạn FLC Grand Quy Nhơn",
        image: "//cdn1.ivivu.com/iVivu/2021/01/21/19/hinhdaidien-374x280.webp?o=jpg",
        combo: "3N2Đ VMB + Bữa sáng | 2tr799",
        rating: 9.1,
        ratingLabel: "Tuyệt vời",
        reviewCount: 55,
        address: "Khu 4, Nhơn Lý - bãi biển Cát Tiến, xã Nhơn Lý",
        tags: ["Gần Kỳ Co - Eo Gió", "Hồ bơi vô cực lớn nhất Việt Nam", "Sân Golf 36 hố"],
        stars: 5,
        featured: false,
    },
    {
        id: 6,
        slug: "khach-san-flc-luxury-quy-nhon",
        name: "Khách sạn FLC Luxury Quy Nhơn",
        image: "//cdn1.ivivu.com/iVivu/2018/09/05/17/khach-san-flc-luxury-quy-nhon-374x280.webp?o=jpg",
        combo: "3N2Đ VMB + Ăn sáng | 2tr799",
        rating: 9.2,
        ratingLabel: "Tuyệt vời",
        reviewCount: 975,
        address: "Khu 4, Nhơn Lý - bãi biển Cát Tiến, xã Nhơn Lý",
        tags: ["Gần Kỳ Co - Eo Gió", "Bãi biển riêng", "Tất cả phòng hướng biển"],
        stars: 5,
        featured: false,
    },
    {
        id: 7,
        slug: "anantara-villas-quy-nhon",
        name: "Anantara Quy Nhơn Villas",
        image: "//cdn1.ivivu.com/iVivu/2020/02/13/20/anantara-quy-nhon-villas-desktop-banner-1920x1080-1-cr-374x280.webp?o=jpg",
        combo: "2N1Đ Villa + 5tr | 12tr699",
        rating: 9.6,
        ratingLabel: "Tuyệt vời",
        reviewCount: 97,
        address: "Cầu Bãi Dại, Ghềnh Ráng",
        tags: ["Gần Ghềnh Ráng Tiên Sa", "Villa hồ bơi cao cấp", "Bãi biển riêng"],
        stars: 5,
        featured: false,
    },
    {
        id: 8,
        slug: "avani-quy-nhon-resort-spa",
        name: "Avani Quy Nhơn Resort & Spa",
        image: "//cdn1.ivivu.com/iVivu/2023/01/19/18/avani22-374x280.webp?o=jpg",
        combo: "3N2Đ VMB + 04 Bữa ăn | 4tr599",
        rating: 9.1,
        ratingLabel: "Tuyệt vời",
        reviewCount: 94,
        address: "Bãi Dài, Ghềnh Ráng",
        tags: ["Gần Ghềnh Ráng Tiên Sa", "Bãi biển riêng", "Phòng trang trí pastel"],
        stars: 4,
        featured: false,
    },
    {
        id: 9,
        slug: "khach-san-anya-premier-quy-nhon",
        name: "Khách sạn ANYA Premier Quy Nhơn",
        image: "//cdn1.ivivu.com/iVivu/2021/02/05/15/hinhdaidien-374x280.webp?o=jpg",
        combo: "3N2Đ VMB + Bữa sáng | 2tr699",
        rating: 9.5,
        ratingLabel: "Tuyệt vời",
        reviewCount: 93,
        address: "44 An Dương Vương",
        tags: ["Gần bãi biển Quy Nhơn", "Trung tâm thành phố"],
        stars: 4,
        featured: false,
    },
    {
        id: 10,
        slug: "khu-nghi-duong-flc-luxury-quy-nhon",
        name: "Khu nghỉ dưỡng FLC Luxury Quy Nhơn",
        image: "//cdn1.ivivu.com/iVivu/2018/10/23/14/flc-luxury-resort-quy-nhon-374x280.webp?o=jpg",
        combo: "3N2Đ VMB + Villa | 3tr499",
        rating: 9.0,
        ratingLabel: "Tuyệt vời",
        reviewCount: 74,
        address: "Lô 4 Nhơn Lý, Cát Tiến",
        tags: ["Gần Kỳ Co - Eo Gió", "Bãi biển riêng", "Villa bể bơi riêng"],
        stars: 5,
        featured: false,
    },
    {
        id: 11,
        slug: "khu-nghi-duong-crown-retreat-quy-nhon",
        name: "Khu nghỉ dưỡng Crown Retreat Quy Nhơn",
        image: "https://cdn1.ivivu.com/images/2024/01/16/19/ddks_yabj8u_-374x280.webp",
        combo: "3N2Đ VMB + Bungalow | 3tr399",
        rating: 9.3,
        ratingLabel: "Tuyệt vời",
        reviewCount: 269,
        address: "Thôn Trung Lương, Xã Cát Tiến",
        tags: ["Gần Linh Phong Thiền Tự", "Bãi biển riêng", "Hồ bơi ngoài trời"],
        stars: 4,
        featured: false,
    },
    {
        id: 12,
        slug: "khach-san-fleur-de-lys-quy-nhon",
        name: "Khách sạn Fleur De Lys Quy Nhơn",
        image: "//cdn1.ivivu.com/iVivu/2022/08/26/16/ava-374x280.webp?o=png",
        combo: null,
        rating: 9.5,
        ratingLabel: "Tuyệt vời",
        reviewCount: 90,
        address: "16 Đường Nguyễn Huệ, Phường Lê Lợi",
        tags: ["Gần bãi biển Quy Nhơn", "Trung tâm thành phố", "Hồ bơi ngoài trời"],
        stars: 4,
        featured: false,
    },
    {
        id: 13,
        slug: "khu-nghi-duong-casa-marina-quy-nhon",
        name: "Khu nghỉ dưỡng Casa Marina Quy Nhơn",
        image: "//cdn1.ivivu.com/iVivu/2021/01/26/17/hinh-374x280.webp?o=jpg",
        combo: null,
        rating: 9.4,
        ratingLabel: "Tuyệt vời",
        reviewCount: 71,
        address: "QL1D, khu vực I",
        tags: ["Gần Ghềnh Ráng Tiên Sa", "Bên bãi biển", "Hồ bơi ngoài trời"],
        stars: 4,
        featured: false,
    },
    {
        id: 14,
        slug: "khach-san-anya-quy-nhon",
        name: "Khách sạn ANYA Quy Nhơn",
        image: "//cdn1.ivivu.com/iVivu/2020/02/14/14/anya-hotel-2-cr-374x280.webp?o=jpg",
        combo: null,
        rating: 9.2,
        ratingLabel: "Tuyệt vời",
        reviewCount: 84,
        address: "3 Nguyễn Trung Tín, Nguyễn Văn Cừ",
        tags: ["Gần bãi biển Quy Nhơn", "Ngay trung tâm thành phố", "5 phút đến biển"],
        stars: 3,
        featured: false,
    },
    {
        id: 15,
        slug: "khach-san-seagull-quy-nhon",
        name: "Khách sạn Seagull Quy Nhơn",
        image: "//cdn1.ivivu.com/iVivu/2019/03/15/10/khach-san-seagull-quy-nhon-374x280.webp?o=jpg",
        combo: null,
        rating: 9.5,
        ratingLabel: "Tuyệt vời",
        reviewCount: 65,
        address: "489 An Dương Vương, Quy Nhơn",
        tags: ["Giáp bãi biển"],
        stars: 3,
        featured: false,
    }, {
        id: 16,
        slug: "khach-san-seagull-quy-nhon",
        name: "Khách sạn Seagull Quy Nhơn",
        image: "//cdn1.ivivu.com/iVivu/2019/03/15/10/khach-san-seagull-quy-nhon-374x280.webp?o=jpg",
        combo: null,
        rating: 9.5,
        ratingLabel: "Tuyệt vời",
        reviewCount: 65,
        address: "489 An Dương Vương, Quy Nhơn",
        tags: ["Giáp bãi biển"],
        stars: 3,
        featured: false,
    },
    {
        id: 17,
        slug: "khach-san-seagull-quy-nhon",
        name: "Khách sạn Seagull Quy Nhơn",
        image: "//cdn1.ivivu.com/iVivu/2019/03/15/10/khach-san-seagull-quy-nhon-374x280.webp?o=jpg",
        combo: null,
        rating: 9.5,
        ratingLabel: "Tuyệt vời",
        reviewCount: 65,
        address: "489 An Dương Vương, Quy Nhơn",
        tags: ["Giáp bãi biển"],
        stars: 3,
        featured: false,
    },
];

const LOCATIONS = [
    { id: 0, label: "Tất cả" },
    { id: 85418, label: "Gần Kỳ Co - Eo Gió" },
    { id: 85419, label: "Gần Ghềnh Ráng Tiên Sa" },
    { id: 85420, label: "Gần bãi biển Quy Nhơn" },
    { id: 85421, label: "Gần Linh Phong Thiền Tự" },
    { id: 85481, label: "Gần Ga Quy Nhơn" },
];

const OTHER_DESTINATIONS = [
    "Phú Quốc", "Đà Nẵng", "Phan Thiết", "Nha Trang", "Hà Nội", "Huế", "Hồ Chí Minh",
    "Mũi Né", "Hội An", "Vịnh Hạ Long", "Hồ Tràm", "Vũng Tàu", "Hải Phòng", "Ninh Bình",
    "Sapa", "Côn Đảo", "Đà Lạt", "Quảng Bình", "Thanh Hóa", "Lagi",
];

// ─────────────────────────── SUB COMPONENTS ───────────────────────────

function StarRating({ count }: { count: number }) {
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map(i => (
                <svg key={i} className={`w-3 h-3 ${i <= count ? "fill-amber-400" : "fill-gray-200"}`} viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
        </div>
    );
}

function RatingBadge({ rating }: { rating: number }) {
    const color = rating >= 9.5 ? "bg-green-600" : rating >= 9.0 ? "bg-green-500" : "bg-lime-500";
    return (
        <span className={`${color} text-white text-xs font-black px-1.5 py-0.5 rounded`}>{rating.toFixed(1)}</span>
    );
}

function HotelCard({ hotel }: { hotel: typeof HOTELS[0] }) {
    return (
        <a href={`/khach-san-quy-nhon/${hotel.slug}`} className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col no-underline">
            {/* Image */}
            <div className="relative overflow-hidden aspect-[374/280] flex-shrink-0">
                <img
                    src={hotel.image}
                    alt={hotel.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                />
                {hotel.combo && (
                    <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent px-3 pt-2.5 pb-4">
                        <span className="text-white text-[11px] font-semibold drop-shadow">{hotel.combo}</span>
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="p-3 flex flex-col gap-1.5 flex-1">
                {/* Stars */}
                <StarRating count={hotel.stars} />

                {/* Name */}
                <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-orange-500 transition-colors">{hotel.name}</h3>

                {/* Rating row */}
                <div className="flex items-center gap-1.5">
                    <RatingBadge rating={hotel.rating} />
                    <span className="text-xs font-semibold text-green-600">{hotel.ratingLabel}</span>
                    <span className="text-xs text-gray-400">({hotel.reviewCount})</span>
                </div>

                {/* Address */}
                <div className="flex items-start gap-1">
                    <span className="text-orange-400 text-xs flex-shrink-0 mt-0.5">📍</span>
                    <span className="text-[11px] text-gray-500 line-clamp-1">{hotel.address}</span>
                    <button className="text-[11px] text-orange-500 hover:underline flex-shrink-0 ml-auto bg-transparent border-none cursor-pointer p-0 whitespace-nowrap">Xem bản đồ</button>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mt-auto pt-1">
                    {hotel.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-[10px] text-gray-500 bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded-full">{tag}</span>
                    ))}
                </div>
            </div>
        </a>
    );
}

// ─────────────────────────── MAIN PAGE ───────────────────────────

export default function HotelListingPage() {
    const [selectedStars, setSelectedStars] = useState<number[]>([]);
    const [selectedLocation, setSelectedLocation] = useState(0);
    const [searchName, setSearchName] = useState("");
    const [showAll, setShowAll] = useState(false);
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

    const toggleStar = (s: number) =>
        setSelectedStars(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

    const filtered = HOTELS.filter(h => {
        if (selectedStars.length > 0 && !selectedStars.includes(h.stars)) return false;
        if (searchName && !h.name.toLowerCase().includes(searchName.toLowerCase())) return false;
        if (selectedLocation !== 0 && !h.tags.some(t => {
            const loc = LOCATIONS.find(l => l.id === selectedLocation);
            return loc && t.includes(loc.label.replace("Gần ", ""));
        })) return false;
        return true;
    });

    const displayed = showAll ? filtered : filtered.slice(0, 16);

    return (
        <div className="min-h-screen bg-gray-50 font-sans">


            {/* ══════════ SEARCH BAR ══════════ */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-[1200px] mx-auto px-4 py-2.5">
                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 max-w-sm">
                        <span className="text-gray-400 text-sm">🔍</span>
                        <span className="text-[13px] text-gray-400">Tìm kiếm</span>
                    </div>
                </div>
            </div>

            <div className="max-w-[1200px] mx-auto px-4 py-4">

                {/* ══════════ BREADCRUMB ══════════ */}
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
                    <a href="/" className="hover:text-orange-500 no-underline">Trang chủ</a>
                    <span>/</span>
                    <a href="/khach-san-viet-nam" className="hover:text-orange-500 no-underline">Việt Nam</a>
                    <span>/</span>
                    <span className="text-gray-600 font-medium">Quy Nhơn</span>
                </div>

                {/* ══════════ PAGE TITLE + MAP LINK ══════════ */}
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900">Khách sạn Quy Nhơn</h1>
                        <p className="text-xs text-gray-400 mt-0.5">giá rẻ từ <span className="text-orange-500 font-semibold">210.000 VND</span></p>
                    </div>
                    <div className="flex items-center gap-2">
                        <a href="/khach-san-quy-nhon/ban-do" className="flex items-center gap-1.5 text-sm text-orange-500 border border-orange-200 rounded-lg px-3 py-1.5 hover:bg-orange-50 transition-colors no-underline">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                            <span className="hidden sm:inline font-medium">Bản đồ</span>
                        </a>
                        {/* Mobile filter btn */}
                        <button
                            onClick={() => setMobileFilterOpen(true)}
                            className="lg:hidden flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" /></svg>
                            Lọc
                        </button>
                    </div>
                </div>

                {/* ══════════ LOCATION TABS ══════════ */}
                <div className="flex gap-2 overflow-x-auto pb-1 mb-4 scrollbar-none">
                    {LOCATIONS.map(loc => (
                        <button
                            key={loc.id}
                            onClick={() => setSelectedLocation(loc.id)}
                            className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${selectedLocation === loc.id
                                ? "bg-orange-500 text-white border-orange-500 font-semibold"
                                : "bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-500"
                                }`}
                        >
                            {loc.label}
                        </button>
                    ))}
                </div>

                {/* ══════════ MAIN LAYOUT: SIDEBAR + GRID ══════════ */}
                <div className="flex gap-5 items-start">

                    {/* ── SIDEBAR FILTER (Desktop) ── */}
                    <aside className="hidden lg:block w-[220px] flex-shrink-0 sticky top-[68px]">
                        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">

                            {/* Support box */}
                            {/* <div className="bg-orange-50 p-3 border-b border-orange-100">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gray-200">
                    <img src="//cdn1.ivivu.com/iVivu/2018/12/04/09/undefined.png" alt="" className="w-full h-full object-cover"/>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-500">Cần hỗ trợ?</p>
                    <a href="tel:19001870" className="text-sm font-bold text-orange-500 no-underline">1900 1870</a>
                  </div>
                </div>
                <p className="text-[10px] text-gray-400">Tư vấn miễn phí</p>
              </div> */}

                            {/* Search by name */}
                            <div className="p-3 border-b border-gray-50">
                                <p className="text-xs font-bold text-gray-700 mb-2">Tìm theo tên</p>
                                <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5">
                                    <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                    <input
                                        type="text"
                                        placeholder="Nhập tên khách sạn..."
                                        value={searchName}
                                        onChange={e => setSearchName(e.target.value)}
                                        className="text-xs bg-transparent border-none outline-none text-gray-700 placeholder-gray-400 w-full"
                                    />
                                </div>
                            </div>

                            {/* Star filter */}
                            <div className="p-3">
                                <p className="text-xs font-bold text-gray-700 mb-2">Hạng sao</p>
                                <div className="flex flex-col gap-1.5">
                                    {[5, 4, 3, 2, 1].map(s => (
                                        <label key={s} className="flex items-center gap-2 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={selectedStars.includes(s)}
                                                onChange={() => toggleStar(s)}
                                                className="w-3.5 h-3.5 accent-orange-500 cursor-pointer"
                                            />
                                            <div className="flex items-center gap-1">
                                                <StarRating count={s} />
                                                <span className="text-[11px] text-gray-500 group-hover:text-orange-500 transition-colors">{s} sao</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* iVIVU recommended */}
                            <div className="px-3 pb-3">
                                <div className="h-px bg-gray-100 mb-2.5" />
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" className="w-3.5 h-3.5 accent-orange-500" />
                                    <span className="text-[11px] text-gray-600 font-medium">Đề xuất</span>
                                </label>
                            </div>

                            {/* Quick info */}
                            <div className="bg-gray-50 px-3 py-2.5 border-t border-gray-100">
                                <p className="text-[11px] font-bold text-gray-600 mb-1">Thông tin nhanh</p>
                                <p className="text-[11px] text-orange-500 font-semibold">333+ khách sạn</p>
                                <div className="mt-2">
                                    <p className="text-[10px] text-gray-400 mb-1">Cần hỗ trợ?</p>
                                    <p className="text-[10px] text-gray-400 mb-1.5">Gọi ngay hotline để được tư vấn miễn phí</p>
                                    <a href="tel:19001870" className="block text-center bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold py-1.5 rounded-lg no-underline transition-colors">
                                        Liên hệ ngay
                                    </a>
                                </div>
                            </div>

                        </div>
                    </aside>

                    {/* ── HOTEL GRID ── */}
                    <div className="flex-1 min-w-0">

                        {/* iVIVU đề xuất label */}
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <span className="text-orange-500">⭐</span>
                                <span className="text-sm font-bold text-gray-700">đề xuất</span>
                                <span className="text-xs text-gray-400">({filtered.length} khách sạn)</span>
                            </div>
                            {selectedStars.length > 0 && (
                                <button onClick={() => setSelectedStars([])} className="text-xs text-orange-500 hover:underline cursor-pointer bg-transparent border-none">Xóa bộ lọc</button>
                            )}
                        </div>

                        {/* Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                            {displayed.map(hotel => (
                                <HotelCard key={hotel.id} hotel={hotel} />
                            ))}
                        </div>

                        {/* Show more */}
                        {!showAll && filtered.length > 15 && (
                            <div className="mt-6 text-center">
                                <button
                                    onClick={() => setShowAll(true)}
                                    className="bg-white border border-orange-300 text-orange-500 hover:bg-orange-50 text-sm font-semibold px-6 py-2.5 rounded-full transition-colors cursor-pointer"
                                >
                                    Xem thêm {filtered.length - 15} khách sạn
                                </button>
                            </div>
                        )}

                        {/* ── SEO Description ── */}
                        <div className="mt-8 bg-white rounded-xl p-5 border border-gray-100">
                            <h2 className="text-base font-extrabold text-gray-900 mb-3">Khách sạn Quy Nhơn</h2>
                            <div className="flex items-center gap-1 mb-3">
                                <div className="flex gap-0.5">{[1, 2, 3].map(i => <svg key={i} className="w-3 h-3 fill-amber-400" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}</div>
                                <span className="text-xs text-gray-400">2.7/5 trên 541 đánh giá</span>
                            </div>
                            <p className="text-[13px] text-gray-600 leading-relaxed mb-2">
                                Quy Nhơn từng được mệnh danh là "thiên đường biển đảo bị lãng quên" của Việt Nam trước kia vì được thiên nhiên ưu ái cho bờ biển dài, đẹp nhưng lại ít được du khách biết tới. Thế nhưng những năm gần đây Quy Nhơn đang từng bước trở thành điểm đến yêu thích của nhiều du khách nhờ vẻ hoang sơ và mới lạ.
                            </p>
                            <p className="text-[13px] text-gray-600 leading-relaxed mb-2">
                                Nếu thích nghỉ dưỡng thì các <strong className="text-gray-800">khách sạn Quy Nhơn</strong> ở khu vực Nhơn Lý, Eo Gió là lý tưởng nhất, còn muốn ngắm phố phường sôi động thì bạn có thể chọn các khách sạn ở khu vực trung tâm thành phố. Để tiết kiệm chi phí hơn, các bạn hãy tham khảo combo trọn gói bao gồm phòng khách sạn và cả vé máy bay khứ hồi.
                            </p>
                        </div>

                        {/* ── Kinh nghiệm du lịch ── */}
                        <div className="mt-4 bg-white rounded-xl p-5 border border-gray-100">
                            <h2 className="text-base font-extrabold text-gray-900 mb-3">Kinh nghiệm du lịch Quy Nhơn</h2>
                            <p className="text-[13px] text-gray-600 leading-relaxed mb-2">
                                Quy Nhơn là thành phố trung tâm của tỉnh Bình Định, với đường bờ biển dài hình bán nguyệt bao quanh tuyệt đẹp, nước trong xanh và rất hoang sơ. Nhiều du khách khi tới tham quan các bãi biển nơi đây đã phải trầm trồ, bởi hiếm có nơi đâu biển lại hùng vĩ và ấn tượng đến thế.
                            </p>
                            <p className="text-[13px] text-gray-600 leading-relaxed mb-3">
                                Kỳ Co, Eo Gió, Hòn Khô, Cù Lao Xanh… là những nơi bạn phải ghé khi đến Quy Nhơn. Bên cạnh đó đừng quên thưởng thức các món đặc sản như bánh xèo tôm nhảy, bánh hỏi lòng heo, bún cá, bánh mì lagu...
                            </p>
                            <a href="//www.ivivu.com/blog/2016/07/du-lich-quy-nhon-cam-nang-tu-a-den-z/" className="text-xs text-orange-500 font-semibold hover:underline no-underline">Xem thêm →</a>
                        </div>

                        {/* ── Location quick links ── */}
                        <div className="mt-4 bg-white rounded-xl p-5 border border-gray-100">
                            <p className="text-sm font-bold text-gray-700 mb-3">Khách sạn Quy Nhơn tại các địa điểm phổ biến</p>
                            <div className="flex flex-wrap gap-2">
                                {LOCATIONS.map(loc => (
                                    <a key={loc.id} href={`/khach-san-quy-nhon?location=${loc.id}`} className="text-xs text-orange-500 border border-orange-200 px-3 py-1 rounded-full hover:bg-orange-50 transition-colors no-underline">{loc.label}</a>
                                ))}
                            </div>
                        </div>

                        {/* ── Other destinations ── */}
                        <div className="mt-4 bg-white rounded-xl p-5 border border-gray-100">
                            <p className="text-sm font-bold text-gray-700 mb-3">Khách sạn tại các địa điểm du lịch nổi tiếng khác</p>
                            <div className="flex flex-wrap gap-x-3 gap-y-1.5">
                                {OTHER_DESTINATIONS.map(dest => (
                                    <a key={dest} href={`/khach-san-${dest.toLowerCase().replace(/\s+/g, "-")}`} className="text-xs text-gray-500 hover:text-orange-500 transition-colors no-underline">{`Khách sạn ${dest}`}</a>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* ══════════ MOBILE FILTER DRAWER ══════════ */}
            {mobileFilterOpen && (
                <div className="fixed inset-0 z-50 flex">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFilterOpen(false)} />
                    <div className="relative ml-auto w-[280px] h-full bg-white overflow-y-auto">
                        <div className="flex items-center justify-between p-4 border-b border-gray-100">
                            <span className="font-bold text-gray-900">Bộ lọc</span>
                            <button onClick={() => setMobileFilterOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none bg-transparent border-none cursor-pointer">✕</button>
                        </div>
                        <div className="p-4 flex flex-col gap-4">
                            {/* Name search */}
                            <div>
                                <p className="text-xs font-bold text-gray-700 mb-2">Tìm theo tên</p>
                                <input
                                    type="text" placeholder="Nhập tên khách sạn..."
                                    value={searchName} onChange={e => setSearchName(e.target.value)}
                                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-orange-400"
                                />
                            </div>
                            {/* Star filter */}
                            <div>
                                <p className="text-xs font-bold text-gray-700 mb-2">Hạng sao</p>
                                <div className="flex flex-col gap-2">
                                    {[5, 4, 3, 2, 1].map(s => (
                                        <label key={s} className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" checked={selectedStars.includes(s)} onChange={() => toggleStar(s)} className="w-4 h-4 accent-orange-500" />
                                            <StarRating count={s} />
                                            <span className="text-sm text-gray-500">{s} sao</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <button
                                onClick={() => setMobileFilterOpen(false)}
                                className="w-full bg-orange-500 text-white font-bold py-3 rounded-xl border-none cursor-pointer hover:bg-orange-600 transition-colors"
                            >
                                Áp dụng ({filtered.length} kết quả)
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}