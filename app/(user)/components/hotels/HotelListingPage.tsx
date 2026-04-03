"use client";

import { useState, useEffect, Suspense, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";

// ─────────────────────────── TYPES ───────────────────────────

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
    category_id: { name: string } | null;
    images: { image_url: string }[];
    descriptions: { title: string; content: string }[];
    itineraries?: { day_number: number }[];
}

interface TripAPI {
    _id: string;
    tour_id: string;
    start_date: string;
    end_date: string;
    price: number;
    max_people: number;
    booked_people: number;
    status: string;
}

interface Hotel {
    id: string;
    slug: string;
    name: string;
    image: string;
    combo: string | null;
    rating: number;
    ratingLabel: string;
    reviewCount: number;
    address: string;
    city: string;
    tags: string[];
    stars: number;
    days: number;
    route: string;
    trips: TripAPI[];
}

function mapTourToHotel(tour: TourAPI, allTrips: TripAPI[]): Hotel {
    const hotel = tour.hotel_id;
    const score = parseFloat(Math.min(9.9, hotel.rating * 1.8 + 0.8).toFixed(1));
    const label = score >= 9.0 ? "Tuyệt vời" : "Rất tốt";
    const comboDesc = tour.descriptions?.find((d) => d.title === "Giá tour bao gồm");
    const comboText = comboDesc?.content?.split("\n")?.[0]?.replace("- ", "") ?? null;
    let days = tour.itineraries?.length ?? 0;
    if (!days) {
        const m = tour.name.match(/(\d+)\s*ngày/i);
        if (m) days = parseInt(m[1]);
    }
    const routeMatch = tour.name.match(/từ\s+([A-ZÀ-Ỹa-zà-ỹ\s.]+?)(?:\s*[-–]|$)/i);
    const route = routeMatch ? routeMatch[1].trim() : "TP.HCM";
    const trips = allTrips.filter((t) => t.tour_id === tour._id);

    return {
        id: tour._id,
        slug: tour.slug,
        name: tour.name,
        image: tour.images?.[0]?.image_url ?? "",
        combo: comboText,
        rating: score,
        ratingLabel: label,
        reviewCount: Math.floor(hotel.rating * 23 + 40),
        address: `${hotel.address}, ${hotel.city}`,
        city: hotel.city,
        tags: [hotel.city, tour.category_id?.name ?? "Tour du lịch", `${hotel.rating} sao`],
        stars: Math.round(hotel.rating),
        days,
        route,
        trips,
    };
}

// ─────────────────────────── CONSTANTS ───────────────────────────

const ROUTES = ["Tất cả", "TP.HCM", "Hà Nội", "Đà Nẵng", "Huế", "Cần Thơ"];

const DAY_OPTIONS = [
    { label: "Tất cả", value: 0 },
    { label: "1–2 ngày", value: 1, min: 1, max: 2 },
    { label: "3–4 ngày", value: 2, min: 3, max: 4 },
    { label: "5–7 ngày", value: 3, min: 5, max: 7 },
    { label: "Trên 7 ngày", value: 4, min: 8, max: 999 },
];

const REGION_MAP: Record<string, string[]> = {
    "Miền Bắc": ["Hà Nội", "Hạ Long", "Sapa", "Ninh Bình", "Hải Phòng"],
    "Miền Trung": ["Đà Nẵng", "Hội An", "Huế", "Quảng Bình", "Thanh Hóa"],
    "Miền Nam": [
        "TP. HCM", "Vũng Tàu", "Cần Thơ", "Phú Quốc", "Hồ Chí Minh",
        "Lagi", "Hồ Tràm", "Phan Thiết", "Mũi Né",
    ],
    "Tây Nguyên": ["Đà Lạt", "Buôn Ma Thuột", "Pleiku"],
};

const DATE_FILTER_OPTIONS = [
    { value: "all", label: "Tất cả" },
    { value: "weekend", label: "Cuối tuần" },
    { value: "end-month", label: "Cuối tháng" },
    { value: "next-month", label: "Tháng sau" },
];

const CATEGORY_NAMES = [
    "tour nghỉ dưỡng", "tour biển", "tour ẩm thực",
    "tour thiên nhiên & khám phá", "tour trải nghiệm & giải trí",
    "tour du thuyền", "tour gia đình", "tour check-in & tham quan",
];

// ─────────────────────────── HELPERS ───────────────────────────

function tripMatchesDateFilter(trips: TripAPI[], filter: string): boolean {
    if (!filter || filter === "all") return true;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return trips.some((t) => {
        const start = new Date(t.start_date);
        start.setHours(0, 0, 0, 0);
        if (start < now) return false;
        if (filter === "weekend") {
            const day = start.getDay();
            return day === 6 || day === 0;
        }
        if (filter === "end-month") {
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            endOfMonth.setHours(23, 59, 59, 999);
            return start >= now && start <= endOfMonth;
        }
        if (filter === "next-month") {
            const startNext = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            const endNext = new Date(now.getFullYear(), now.getMonth() + 2, 0);
            return start >= startNext && start <= endNext;
        }
        return true;
    });
}

// ✅ So khớp chính xác ngày khởi hành từ URL param ?date=YYYY-MM-DD
function tripMatchesExactDate(trips: TripAPI[], dateStr: string): boolean {
    if (!dateStr) return true;
    // Parse theo local time (tránh lệch múi giờ)
    const [y, m, d] = dateStr.split("-").map(Number);
    const target = new Date(y, m - 1, d);
    target.setHours(0, 0, 0, 0);

    return trips.some((t) => {
        // API trả về ISO string (UTC). Convert sang local date để so sánh đúng
        const utcDate = new Date(t.start_date);
        const local = new Date(utcDate.getFullYear(), utcDate.getMonth(), utcDate.getDate());
        local.setHours(0, 0, 0, 0);
        return local.getTime() === target.getTime();
    });
}

// ─────────────────────────── SUB COMPONENTS ───────────────────────────

function StarRating({ count }: { count: number }) {
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
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
        <span className={`${color} text-white text-xs font-black px-1.5 py-0.5 rounded`}>
            {rating.toFixed(1)}
        </span>
    );
}

function SkeletonCard() {
    return (
        <div className="bg-white rounded-xl overflow-hidden shadow-sm animate-pulse">
            <div className="bg-gray-200 h-44" />
            <div className="p-3 flex flex-col gap-2">
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
            </div>
        </div>
    );
}

function HotelCard({ hotel }: { hotel: Hotel }) {
    const nextTrip = hotel.trips
        .filter((t) => t.status === "open" && new Date(t.start_date) >= new Date())
        .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())[0];

    return (
        <a
            href={`/tours/${hotel.slug}`}
            className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col no-underline"
        >
            <div className="relative overflow-hidden h-44 shrink-0">
                {hotel.image ? (
                    <img
                        src={hotel.image}
                        alt={hotel.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-300 text-xs">Chưa có ảnh</span>
                    </div>
                )}
                {nextTrip && (
                    <span className="absolute bottom-2 left-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        🗓{" "}
                        {new Date(nextTrip.start_date).toLocaleDateString("vi-VN", {
                            day: "2-digit",
                            month: "2-digit",
                        })}
                    </span>
                )}
            </div>
            <div className="p-3 flex flex-col gap-1.5 flex-1">
                <StarRating count={hotel.stars} />
                <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-orange-500 transition-colors">
                    {hotel.name}
                </h3>
                <div className="flex items-center gap-1.5">
                    <RatingBadge rating={hotel.rating} />
                    <span className="text-xs font-semibold text-green-600">{hotel.ratingLabel}</span>
                    <span className="text-xs text-gray-400">({hotel.reviewCount})</span>
                </div>
                <div className="flex items-start gap-1">
                    <span className="text-orange-400 text-xs shrink-0 mt-0.5">📍</span>
                    <span className="text-[11px] text-gray-500 line-clamp-1">{hotel.address}</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-auto pt-1">
                    {hotel.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-[10px] text-gray-500 bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded-full">
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
        </a>
    );
}

// ─────────────────────────── SIDEBAR ───────────────────────────

function Sidebar({
    searchName, setSearchName,
    selectedStars, toggleStar,
    selectedDate, setSelectedDate,
    selectedDays, setSelectedDays,
    selectedRoute, setSelectedRoute,
    onReset, hasFilter,
}: {
    searchName: string; setSearchName: (v: string) => void;
    selectedStars: number[]; toggleStar: (s: number) => void;
    selectedDate: string; setSelectedDate: (v: string) => void;
    selectedDays: number; setSelectedDays: (v: number) => void;
    selectedRoute: string; setSelectedRoute: (v: string) => void;
    onReset: () => void; hasFilter: boolean;
}) {
    return (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden text-sm">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <span className="font-bold text-gray-800 text-sm">Bộ lọc</span>
                {hasFilter && (
                    <button onClick={onReset} className="text-xs text-orange-500 hover:underline bg-transparent border-none cursor-pointer">
                        Xóa tất cả
                    </button>
                )}
            </div>

            {/* Ngày khởi hành */}
            <div className="px-4 py-3 border-b border-gray-50">
                <p className="text-xs font-bold text-gray-700 mb-2">📅 Ngày khởi hành</p>
                <div className="flex flex-col gap-1">
                    {DATE_FILTER_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => setSelectedDate(opt.value === "all" ? "" : opt.value)}
                            className={`text-left text-xs px-3 py-1.5 rounded-lg border cursor-pointer transition-colors ${
                                (opt.value === "all" && !selectedDate) || selectedDate === opt.value
                                    ? "bg-orange-500 text-white border-orange-500 font-semibold"
                                    : "bg-white text-gray-600 border-gray-200 hover:border-orange-300"
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Số ngày tour */}
            <div className="px-4 py-3 border-b border-gray-50">
                <p className="text-xs font-bold text-gray-700 mb-2">🗓️ Số ngày tour</p>
                <div className="flex flex-col gap-1">
                    {DAY_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => setSelectedDays(opt.value)}
                            className={`text-left text-xs px-3 py-1.5 rounded-lg border cursor-pointer transition-colors ${
                                selectedDays === opt.value
                                    ? "bg-orange-500 text-white border-orange-500 font-semibold"
                                    : "bg-white text-gray-600 border-gray-200 hover:border-orange-300"
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tuyến tour */}
            <div className="px-4 py-3 border-b border-gray-50">
                <p className="text-xs font-bold text-gray-700 mb-2">🚌 Tuyến tour</p>
                <div className="flex flex-col gap-1">
                    {ROUTES.map((route) => (
                        <button
                            key={route}
                            onClick={() => setSelectedRoute(route)}
                            className={`text-left text-xs px-3 py-1.5 rounded-lg border cursor-pointer transition-colors ${
                                selectedRoute === route
                                    ? "bg-orange-500 text-white border-orange-500 font-semibold"
                                    : "bg-white text-gray-600 border-gray-200 hover:border-orange-300"
                            }`}
                        >
                            {route === "Tất cả" ? "Tất cả tuyến" : `Từ ${route}`}
                        </button>
                    ))}
                </div>
            </div>

            {/* Hạng sao */}
            <div className="px-4 py-3">
                <p className="text-xs font-bold text-gray-700 mb-2">⭐ Hạng sao khách sạn</p>
                <div className="flex flex-col gap-1.5">
                    {[5, 4, 3, 2, 1].map((s) => (
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
        </div>
    );
}

// ─────────────────────────── MAIN ───────────────────────────

function HotelListingContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [hotels, setHotels] = useState<Hotel[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [selectedStars, setSelectedStars] = useState<number[]>([]);
    const [searchName, setSearchName] = useState(searchParams.get("q") ?? "");
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedDays, setSelectedDays] = useState(0);
    const [selectedRoute, setSelectedRoute] = useState("Tất cả");
    const [showAll, setShowAll] = useState(false);
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
    const [searchInput, setSearchInput] = useState(searchParams.get("q") ?? "");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

    const inputWrapRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // ✅ Đọc ?date và ?from từ URL params
    const regionParam = searchParams.get("region") ?? "";
    const dateParam = searchParams.get("date") ?? "";
    const fromParam = searchParams.get("from") ?? "";

    // ✅ State cho search bar (searchDate, searchFrom) — sync với URL
    const [searchDate, setSearchDate] = useState(dateParam);
    const [searchFrom, setSearchFrom] = useState(fromParam || "TP.HCM");

    // Sync khi URL params thay đổi
    useEffect(() => {
        setSearchDate(searchParams.get("date") ?? "");
        setSearchFrom(searchParams.get("from") ?? "TP.HCM");
        setSearchName(searchParams.get("q") ?? "");
        setSearchInput(searchParams.get("q") ?? "");
    }, [searchParams]);

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

    // Fetch tours + trips
    useEffect(() => {
        Promise.all([
            fetch("https://db-datn-six.vercel.app/api/tours").then((r) => r.json()),
            fetch("https://db-datn-six.vercel.app/api/trips/").then((r) => r.json()),
        ])
            .then(([toursRes, tripsRes]) => {
                if (toursRes.success && Array.isArray(toursRes.data)) {
                    const allTrips: TripAPI[] = Array.isArray(tripsRes.data) ? tripsRes.data : [];
                    setHotels(toursRes.data.map((t: TourAPI) => mapTourToHotel(t, allTrips)));
                } else setError(true);
            })
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            const target = e.target as Node;
            if (inputWrapRef.current?.contains(target) || dropdownRef.current?.contains(target)) return;
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

    const toggleStar = (s: number) =>
        setSelectedStars((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);

    const hasFilter =
        selectedStars.length > 0 ||
        !!searchName ||
        (!!selectedDate && selectedDate !== "all") ||
        selectedDays !== 0 ||
        selectedRoute !== "Tất cả";

    const resetAll = () => {
        setSelectedStars([]);
        setSearchName("");
        setSearchInput("");
        setSelectedDate("");
        setSelectedDays(0);
        setSelectedRoute("Tất cả");
    };

    const suggestions =
        searchInput.trim().length >= 1
            ? hotels
                .filter(
                    (h) =>
                        h.name.toLowerCase().includes(searchInput.toLowerCase()) ||
                        h.city.toLowerCase().includes(searchInput.toLowerCase())
                )
                .slice(0, 8)
            : [];

    // ─── FILTER LOGIC ───
    const filtered = hotels.filter((h) => {
        if (selectedStars.length > 0 && !selectedStars.includes(h.stars)) return false;

        if (searchName) {
            const q = searchName.toLowerCase();
            const regionCitiesForQ =
                Object.entries(REGION_MAP).find(([key]) => key.toLowerCase() === q)?.[1] ?? [];
            const isCategoryQuery = CATEGORY_NAMES.some((c) => c === q);
            if (regionCitiesForQ.length > 0) {
                if (!regionCitiesForQ.some((c) => h.city.toLowerCase().includes(c.toLowerCase()))) return false;
            } else if (isCategoryQuery) {
                if (!h.tags.some((t) => t.toLowerCase().includes(q))) return false;
            } else {
                if (!h.name.toLowerCase().includes(q) && !h.city.toLowerCase().includes(q)) return false;
            }
        }

        // Sidebar date filter (weekend / end-month / next-month)
        if (selectedDate && selectedDate !== "all") {
            if (!tripMatchesDateFilter(h.trips, selectedDate)) return false;
        }

        // ✅ URL ?date param — lọc chính xác theo ngày khởi hành từ trips.start_date
        if (dateParam) {
            if (!tripMatchesExactDate(h.trips, dateParam)) return false;
        }

        if (selectedDays !== 0) {
            const opt = DAY_OPTIONS.find((o) => o.value === selectedDays);
            if (opt && opt.min !== undefined) {
                if (h.days < opt.min || h.days > opt.max!) return false;
            }
        }

        if (selectedRoute !== "Tất cả" && !h.route.toLowerCase().includes(selectedRoute.toLowerCase())) return false;

        if (fromParam && fromParam !== "Tất cả" && !h.route.toLowerCase().includes(fromParam.toLowerCase())) return false;

        if (regionParam) {
            const cities = REGION_MAP[regionParam] ?? [];
            if (cities.length > 0 && !cities.some((c) => h.city.toLowerCase().includes(c.toLowerCase()))) return false;
        }

        return true;
    });

    const displayed = showAll ? filtered : filtered.slice(0, 16);

    // ✅ handleSearch giữ nguyên searchDate & searchFrom khi submit
    const handleSearch = () => {
        const q = searchInput.trim();
        setSearchName(q);
        setShowSuggestions(false);
        const params = new URLSearchParams(searchParams.toString());
        if (q) params.set("q", q);
        else params.delete("q");
        // ✅ Cập nhật date và from từ state local của search bar
        if (searchDate) params.set("date", searchDate);
        else params.delete("date");
        if (searchFrom && searchFrom !== "Tất cả") params.set("from", searchFrom);
        else params.delete("from");
        router.push(`/tours/search?${params.toString()}`);
    };

    const sidebarProps = {
        searchName, setSearchName,
        selectedStars, toggleStar,
        selectedDate, setSelectedDate,
        selectedDays, setSelectedDays,
        selectedRoute, setSelectedRoute,
        onReset: resetAll,
        hasFilter,
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">

            {/* ── SEARCH BAR ── */}
            <div className="bg-white border-b border-gray-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-1.5 flex items-center gap-1">

                        {/* Input địa điểm */}
                        <div
                            ref={inputWrapRef}
                            className="flex items-center gap-2 flex-1 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors min-w-0"
                        >
                            <svg className="w-4 h-4 text-orange-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Tìm điểm đến, tên tour..."
                                value={searchInput}
                                onChange={(e) => { setSearchInput(e.target.value); setShowSuggestions(true); recalcDropdown(); }}
                                onFocus={() => { setShowSuggestions(true); recalcDropdown(); }}
                                onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
                                className="text-sm bg-transparent border-none outline-none text-gray-700 placeholder-gray-400 w-full"
                            />
                            {searchInput && (
                                <button
                                    onClick={() => { setSearchInput(""); setSearchName(""); setShowSuggestions(false); }}
                                    className="text-gray-300 hover:text-gray-500 bg-transparent border-none cursor-pointer p-0 leading-none shrink-0"
                                >
                                    ✕
                                </button>
                            )}
                        </div>

                        <div className="w-px h-8 bg-gray-200 shrink-0" />

                        {/* ✅ Ngày khởi hành — controlled bằng searchDate state */}
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors shrink-0">
                            <svg className="w-4 h-4 text-orange-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <div>
                                <p className="text-[10px] text-gray-400 leading-none mb-0.5">Ngày khởi hành</p>
                                <input
                                    type="date"
                                    min={new Date().toISOString().split("T")[0]}
                                    value={searchDate}
                                    className="text-sm font-medium outline-none bg-transparent text-gray-700 cursor-pointer w-28"
                                    // ✅ Cập nhật state searchDate trực tiếp, không push router ngay
                                    // Chỉ apply khi nhấn "Tìm kiếm"
                                    onChange={(e) => setSearchDate(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="w-px h-8 bg-gray-200 shrink-0" />

                        {/* ✅ Khởi hành từ — controlled bằng searchFrom state */}
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors shrink-0">
                            <svg className="w-4 h-4 text-orange-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            <div>
                                <p className="text-[10px] text-gray-400 leading-none mb-0.5">Khởi hành từ</p>
                                <select
                                    value={searchFrom}
                                    onChange={(e) => setSearchFrom(e.target.value)}
                                    className="text-sm font-medium outline-none bg-transparent text-gray-700 cursor-pointer"
                                >
                                    {ROUTES.filter((r) => r !== "Tất cả").map((r) => (
                                        <option key={r}>{r}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Nút tìm */}
                        <button
                            onClick={handleSearch}
                            className="ml-1 shrink-0 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-5 py-3 rounded-xl border-none cursor-pointer transition-colors flex items-center gap-1.5"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            Tìm kiếm
                        </button>
                    </div>
                </div>
            </div>

            {/* Dropdown suggestions */}
            {showSuggestions && suggestions.length > 0 && (
                <div
                    ref={dropdownRef}
                    style={dropdownStyle}
                    className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden max-h-[400px] overflow-y-auto"
                >
                    <div className="px-4 py-2 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                        <span className="text-[11px] text-gray-400 font-semibold">
                            {hotels.filter((h) =>
                                h.name.toLowerCase().includes(searchInput.toLowerCase()) ||
                                h.city.toLowerCase().includes(searchInput.toLowerCase())
                            ).length}{" "}
                            kết quả · hiển thị {suggestions.length}
                        </span>
                    </div>
                    {suggestions.map((s) => (
                        <button
                            key={s.id}
                            onClick={() => { setSearchInput(s.name); setSearchName(s.name); setShowSuggestions(false); }}
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
                </div>
            )}

            {/* ── CONTENT ── */}
            <div className="max-w-7xl mx-auto px-4 py-4">
                {/* Breadcrumb */}
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
                    <a href="/" className="hover:text-orange-500 no-underline">Trang chủ</a>
                    <span>/</span>
                    <span className="text-gray-600 font-medium">Tour du lịch</span>
                    {searchName && (<><span>/</span><span className="text-gray-600 font-medium">"{searchName}"</span></>)}
                    {regionParam && !searchName && (<><span>/</span><span className="text-gray-600 font-medium">{regionParam}</span></>)}
                </div>

                {/* Toolbar */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm text-gray-500">
                            {loading ? "Đang tải..." : (
                                <>
                                    <span className="font-bold text-gray-800">{filtered.length}</span>{" "}
                                    tour
                                    {regionParam && !searchName ? ` tại ${regionParam}` : searchName ? ` cho "${searchName}"` : ""}
                                </>
                            )}
                        </p>
                        {/* ✅ Hiện badge ngày đang lọc */}
                        {dateParam && (
                            <span className="text-xs bg-orange-50 text-orange-500 font-semibold px-2.5 py-1 rounded-full">
                                📅{" "}
                                {(() => {
                                    const [y, m, d] = dateParam.split("-").map(Number);
                                    return new Date(y, m - 1, d).toLocaleDateString("vi-VN", {
                                        day: "2-digit", month: "2-digit", year: "numeric",
                                    });
                                })()}
                                <button
                                    onClick={() => {
                                        const params = new URLSearchParams(searchParams.toString());
                                        params.delete("date");
                                        router.push(`/tours/search?${params.toString()}`);
                                    }}
                                    className="ml-1.5 text-orange-400 hover:text-orange-600 bg-transparent border-none cursor-pointer p-0 leading-none font-bold"
                                >
                                    ✕
                                </button>
                            </span>
                        )}
                        {fromParam && (
                            <span className="text-xs bg-blue-50 text-blue-500 font-semibold px-2.5 py-1 rounded-full">
                                📍 Từ {fromParam}
                                <button
                                    onClick={() => {
                                        const params = new URLSearchParams(searchParams.toString());
                                        params.delete("from");
                                        router.push(`/tours/search?${params.toString()}`);
                                    }}
                                    className="ml-1.5 text-blue-400 hover:text-blue-600 bg-transparent border-none cursor-pointer p-0 leading-none font-bold"
                                >
                                    ✕
                                </button>
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {hasFilter && (
                            <button onClick={resetAll} className="text-xs text-orange-500 hover:underline bg-transparent border-none cursor-pointer">
                                Xóa bộ lọc
                            </button>
                        )}
                        <button
                            onClick={() => setMobileFilterOpen(true)}
                            className="lg:hidden flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 bg-white cursor-pointer transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                            </svg>
                            Lọc {hasFilter && <span className="w-1.5 h-1.5 bg-orange-500 rounded-full" />}
                        </button>
                    </div>
                </div>

                {/* Main layout */}
                <div className="flex gap-5 items-start">
                    <aside className="hidden lg:block w-56 shrink-0 sticky top-4">
                        <Sidebar {...sidebarProps} />
                    </aside>

                    <div className="flex-1 min-w-0">
                        {loading && (
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                                {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
                            </div>
                        )}
                        {error && (
                            <div className="text-center py-16 text-gray-400">
                                <p className="text-4xl mb-3">⚠️</p>
                                <p className="text-sm font-semibold">Không thể tải dữ liệu</p>
                            </div>
                        )}
                        {!loading && !error && (
                            <>
                                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                                    {displayed.map((hotel) => <HotelCard key={hotel.id} hotel={hotel} />)}
                                </div>
                                {filtered.length === 0 && (
                                    <div className="text-center py-16 text-gray-400">
                                        <p className="text-4xl mb-3">🔍</p>
                                        <p className="font-semibold">Không tìm thấy kết quả</p>
                                        {dateParam && (
                                            <p className="text-xs mt-1 text-gray-400">
                                                Không có tour khởi hành vào{" "}
                                                {(() => {
                                                    const [y, m, d] = dateParam.split("-").map(Number);
                                                    return new Date(y, m - 1, d).toLocaleDateString("vi-VN");
                                                })()}
                                            </p>
                                        )}
                                        <button
                                            onClick={resetAll}
                                            className="mt-3 text-sm text-orange-500 underline cursor-pointer bg-transparent border-none"
                                        >
                                            Xóa bộ lọc
                                        </button>
                                    </div>
                                )}
                                {!showAll && filtered.length > 16 && (
                                    <div className="mt-6 text-center">
                                        <button
                                            onClick={() => setShowAll(true)}
                                            className="bg-white border border-orange-300 text-orange-500 hover:bg-orange-50 text-sm font-semibold px-6 py-2.5 rounded-full transition-colors cursor-pointer"
                                        >
                                            Xem thêm {filtered.length - 16} tour
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Filter Drawer */}
            {mobileFilterOpen && (
                <div className="fixed inset-0 z-50 flex">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFilterOpen(false)} />
                    <div className="relative ml-auto w-72 h-full bg-white overflow-y-auto">
                        <div className="flex items-center justify-between p-4 border-b border-gray-100">
                            <span className="font-bold text-gray-900">Bộ lọc</span>
                            <button onClick={() => setMobileFilterOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none bg-transparent border-none cursor-pointer">✕</button>
                        </div>
                        <div className="p-4"><Sidebar {...sidebarProps} /></div>
                        <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4">
                            <button
                                onClick={() => setMobileFilterOpen(false)}
                                className="w-full bg-orange-500 text-white font-bold py-3 rounded-xl border-none cursor-pointer hover:bg-orange-600 transition-colors"
                            >
                                Xem {filtered.length} kết quả
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function HotelListingPage() {
    return (
        <Suspense>
            <HotelListingContent />
        </Suspense>
    );
}