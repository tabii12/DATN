"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

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
    tags: string[];
    stars: number;
}

function mapTourToHotel(tour: TourAPI): Hotel {
    const hotel = tour.hotel_id;
    const score = parseFloat(Math.min(9.9, hotel.rating * 1.8 + 0.8).toFixed(1));
    const label = score >= 9.5 ? "Tuyệt vời" : score >= 9.0 ? "Tuyệt vời" : "Rất tốt";

    const comboDesc = tour.descriptions?.find(d => d.title === "Giá tour bao gồm");
    const comboText = comboDesc?.content?.split("\n")?.[0]?.replace("- ", "") ?? null;

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
        tags: [
            hotel.city,
            tour.category_id?.name ?? "Tour du lịch",
            `Khách sạn ${hotel.rating} sao`,
        ],
        stars: Math.round(hotel.rating),
    };
}

// ─────────────────────────── DATA TĨNH ───────────────────────────

const LOCATIONS = [
    { id: 0, label: "Tất cả" },
    { id: 85418, label: "Quy Nhơn" },
    { id: 85419, label: "Vũng Tàu" },
    { id: 85420, label: "Nha Trang" },
    { id: 85421, label: "Cần Thơ" },
    { id: 85481, label: "Hạ Long" },
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
    return <span className={`${color} text-white text-xs font-black px-1.5 py-0.5 rounded`}>{rating.toFixed(1)}</span>;
}

function SkeletonCard() {
    return (
        <div className="bg-white rounded-xl overflow-hidden shadow-sm animate-pulse">
            <div className="bg-gray-200 aspect-374/280" />
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
    return (
        <a href={`/tours/${hotel.slug}`} className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col no-underline">
            <div className="relative overflow-hidden aspect-374/280 shrink-0">
                {hotel.image ? (
                    <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
                ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-300 text-xs">Chưa có ảnh</span>
                    </div>
                )}
                {hotel.combo && (
                    <div className="absolute top-0 left-0 right-0 bg-linear-to-b from-black/60 to-transparent px-3 pt-2.5 pb-4">
                        <span className="text-white text-[11px] font-semibold drop-shadow line-clamp-1">{hotel.combo}</span>
                    </div>
                )}
            </div>
            <div className="p-3 flex flex-col gap-1.5 flex-1">
                <StarRating count={hotel.stars} />
                <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-orange-500 transition-colors">{hotel.name}</h3>
                <div className="flex items-center gap-1.5">
                    <RatingBadge rating={hotel.rating} />
                    <span className="text-xs font-semibold text-green-600">{hotel.ratingLabel}</span>
                    <span className="text-xs text-gray-400">({hotel.reviewCount})</span>
                </div>
                <div className="flex items-start gap-1">
                    <span className="text-orange-400 text-xs shrink-0 mt-0.5">📍</span>
                    <span className="text-[11px] text-gray-500 line-clamp-1">{hotel.address}</span>
                    <button className="text-[11px] text-orange-500 hover:underline shrink-0 ml-auto bg-transparent border-none cursor-pointer p-0 whitespace-nowrap">Xem bản đồ</button>
                </div>
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
    const searchParams = useSearchParams();
    const [hotels, setHotels]           = useState<Hotel[]>([]);
    const [loading, setLoading]         = useState(true);
    const [error, setError]             = useState(false);
    const [selectedStars, setSelectedStars]     = useState<number[]>([]);
    const [selectedLocation, setSelectedLocation] = useState(0);
    const [searchName, setSearchName]   = useState(searchParams.get("q") ?? "");
    const [showAll, setShowAll]         = useState(false);
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

    // ── FETCH ──
    useEffect(() => {
        fetch("https://db-datn-six.vercel.app/api/tours")
            .then(r => r.json())
            .then(res => {
                if (res.success && Array.isArray(res.data)) {
                    setHotels(res.data.map(mapTourToHotel));
                } else {
                    setError(true);
                }
            })
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    }, []);

    const toggleStar = (s: number) =>
        setSelectedStars(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

    const filtered = hotels.filter(h => {
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

            {/* SEARCH BAR */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-300 mx-auto px-4 py-2.5">
                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 max-w-sm focus-within:border-orange-400 transition-colors">
                        <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Tìm theo tên tour..."
                            value={searchName}
                            onChange={e => setSearchName(e.target.value)}
                            className="text-[13px] bg-transparent border-none outline-none text-gray-700 placeholder-gray-400 w-full"
                        />
                        {searchName && (
                            <button onClick={() => setSearchName("")} className="text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer p-0 shrink-0 leading-none">✕</button>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-300 mx-auto px-4 py-4">

                {/* BREADCRUMB */}
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
                    <a href="/" className="hover:text-orange-500 no-underline">Trang chủ</a>
                    <span>/</span>
                    <a href="/tour" className="hover:text-orange-500 no-underline">Tours</a>
                    <span>/</span>
                    <span className="text-gray-600 font-medium">...</span>
                </div>

                {/* TITLE */}
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900">Tour du lịch</h1>
                        <p className="text-xs text-gray-400 mt-0.5">
                            {loading ? "Đang tải..." : `${filtered.length} tour`}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <a href="/tour/ban-do" className="flex items-center gap-1.5 text-sm text-orange-500 border border-orange-200 rounded-lg px-3 py-1.5 hover:bg-orange-50 transition-colors no-underline">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                            <span className="hidden sm:inline font-medium">Bản đồ</span>
                        </a>
                        <button onClick={() => setMobileFilterOpen(true)} className="lg:hidden flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 bg-white cursor-pointer transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" /></svg>
                            Lọc
                        </button>
                    </div>
                </div>

                {/* LOCATION TABS */}
                <div className="flex gap-2 overflow-x-auto pb-1 mb-4 scrollbar-none">
                    {LOCATIONS.map(loc => (
                        <button key={loc.id} onClick={() => setSelectedLocation(loc.id)}
                            className={`shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${selectedLocation === loc.id ? "bg-orange-500 text-white border-orange-500 font-semibold" : "bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-500"}`}>
                            {loc.label}
                        </button>
                    ))}
                </div>

                {/* MAIN LAYOUT */}
                <div className="flex gap-5 items-start">

                    {/* SIDEBAR */}
                    <aside className="hidden lg:block w-55 shrink-0 sticky top-17">
                        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                            <div className="p-3 border-b border-gray-50">
                                <p className="text-xs font-bold text-gray-700 mb-2">Tìm theo tên</p>
                                <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5">
                                    <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                    <input type="text" placeholder="Nhập tên tour..." value={searchName} onChange={e => setSearchName(e.target.value)}
                                        className="text-xs bg-transparent border-none outline-none text-gray-700 placeholder-gray-400 w-full" />
                                </div>
                            </div>
                            <div className="p-3">
                                <p className="text-xs font-bold text-gray-700 mb-2">Hạng sao</p>
                                <div className="flex flex-col gap-1.5">
                                    {[5, 4, 3, 2, 1].map(s => (
                                        <label key={s} className="flex items-center gap-2 cursor-pointer group">
                                            <input type="checkbox" checked={selectedStars.includes(s)} onChange={() => toggleStar(s)} className="w-3.5 h-3.5 accent-orange-500 cursor-pointer" />
                                            <div className="flex items-center gap-1">
                                                <StarRating count={s} />
                                                <span className="text-[11px] text-gray-500 group-hover:text-orange-500 transition-colors">{s} sao</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="px-3 pb-3">
                                <div className="h-px bg-gray-100 mb-2.5" />
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" className="w-3.5 h-3.5 accent-orange-500" />
                                    <span className="text-[11px] text-gray-600 font-medium">Đề xuất</span>
                                </label>
                            </div>
                            <div className="bg-gray-50 px-3 py-2.5 border-t border-gray-100">
                                <p className="text-[11px] font-bold text-gray-600 mb-1">Thông tin nhanh</p>
                                <p className="text-[11px] text-orange-500 font-semibold">{loading ? "Đang tải..." : `${hotels.length} tour`}</p>
                                <div className="mt-2">
                                    <p className="text-[10px] text-gray-400 mb-1.5">Gọi ngay hotline để được tư vấn miễn phí</p>
                                    <a href="tel:19001870" className="block text-center bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold py-1.5 rounded-lg no-underline transition-colors">Liên hệ ngay</a>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* GRID */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <span className="text-orange-500">⭐</span>
                                <span className="text-sm font-bold text-gray-700">đề xuất</span>
                                {!loading && <span className="text-xs text-gray-400">({filtered.length} tour)</span>}
                            </div>
                            {selectedStars.length > 0 && (
                                <button onClick={() => setSelectedStars([])} className="text-xs text-orange-500 hover:underline cursor-pointer bg-transparent border-none">Xóa bộ lọc</button>
                            )}
                        </div>

                        {loading && (
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                                {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
                            </div>
                        )}

                        {error && (
                            <div className="text-center py-16 text-gray-400">
                                <p className="text-4xl mb-3">⚠️</p>
                                <p className="text-sm font-semibold">Không thể tải dữ liệu</p>
                                <p className="text-xs mt-1">Vui lòng thử lại sau</p>
                            </div>
                        )}

                        {!loading && !error && (
                            <>
                                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                                    {displayed.map(hotel => <HotelCard key={hotel.id} hotel={hotel} />)}
                                </div>

                                {filtered.length === 0 && (
                                    <div className="text-center py-16 text-gray-400">
                                        <p className="text-4xl mb-3">🔍</p>
                                        <p className="font-semibold">Không tìm thấy kết quả</p>
                                        <button onClick={() => { setSelectedStars([]); setSearchName(""); }} className="mt-3 text-sm text-orange-500 underline cursor-pointer bg-transparent border-none">Xóa bộ lọc</button>
                                    </div>
                                )}

                                {!showAll && filtered.length > 16 && (
                                    <div className="mt-6 text-center">
                                        <button onClick={() => setShowAll(true)} className="bg-white border border-orange-300 text-orange-500 hover:bg-orange-50 text-sm font-semibold px-6 py-2.5 rounded-full transition-colors cursor-pointer">
                                            Xem thêm {filtered.length - 16} tour
                                        </button>
                                    </div>
                                )}
                            </>
                        )}

                        {/* SEO sections — giữ nguyên từ code cũ */}
                        <div className="mt-8 bg-white rounded-xl p-5 border border-gray-100">
                            <h2 className="text-base font-extrabold text-gray-900 mb-3">Tour du lịch</h2>
                            <p className="text-[13px] text-gray-600 leading-relaxed mb-2">
                                 từng được mệnh danh là "thiên đường biển đảo bị lãng quên" của Việt Nam trước kia vì được thiên nhiên ưu ái cho bờ biển dài, đẹp nhưng lại ít được du khách biết tới. Thế nhưng những năm gần đây  đang từng bước trở thành điểm đến yêu thích của nhiều du khách nhờ vẻ hoang sơ và mới lạ.
                            </p>
                            <p className="text-[13px] text-gray-600 leading-relaxed">
                                Nếu thích nghỉ dưỡng thì các <strong className="text-gray-800">khách sạn </strong> ở khu vực Nhơn Lý, Eo Gió là lý tưởng nhất, còn muốn ngắm phố phường sôi động thì bạn có thể chọn các khách sạn ở khu vực trung tâm thành phố.
                            </p>
                        </div>

                        <div className="mt-4 bg-white rounded-xl p-5 border border-gray-100">
                            <h2 className="text-base font-extrabold text-gray-900 mb-3">Kinh nghiệm du lịch </h2>
                            <p className="text-[13px] text-gray-600 leading-relaxed mb-3">
                                Kỳ Co, Eo Gió, Hòn Khô, Cù Lao Xanh… là những nơi bạn phải ghé khi đến . Bên cạnh đó đừng quên thưởng thức các món đặc sản như bánh xèo tôm nhảy, bánh hỏi lòng heo, bún cá, bánh mì lagu...
                            </p>
                            <a href="#" className="text-xs text-orange-500 font-semibold hover:underline no-underline">Xem thêm →</a>
                        </div>

                        <div className="mt-4 bg-white rounded-xl p-5 border border-gray-100">
                            <p className="text-sm font-bold text-gray-700 mb-3">Tour du lịch tại các địa điểm phổ biến</p>
                            <div className="flex flex-wrap gap-2">
                                {LOCATIONS.map(loc => (
                                    <a key={loc.id} href={`/tour?location=${loc.id}`} className="text-xs text-orange-500 border border-orange-200 px-3 py-1 rounded-full hover:bg-orange-50 transition-colors no-underline">{loc.label}</a>
                                ))}
                            </div>
                        </div>

                        <div className="mt-4 bg-white rounded-xl p-5 border border-gray-100">
                            <p className="text-sm font-bold text-gray-700 mb-3">Tour tại các điểm đến nổi tiếng</p>
                            <div className="flex flex-wrap gap-x-3 gap-y-1.5">
                                {OTHER_DESTINATIONS.map(dest => (
                                    <a key={dest} href={`/tour/${dest.toLowerCase().replace(/\s+/g, "-")}`} className="text-xs text-gray-500 hover:text-orange-500 transition-colors no-underline">{`Tour ${dest}`}</a>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* MOBILE FILTER DRAWER */}
            {mobileFilterOpen && (
                <div className="fixed inset-0 z-50 flex">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFilterOpen(false)} />
                    <div className="relative ml-auto w-70 h-full bg-white overflow-y-auto">
                        <div className="flex items-center justify-between p-4 border-b border-gray-100">
                            <span className="font-bold text-gray-900">Bộ lọc</span>
                            <button onClick={() => setMobileFilterOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none bg-transparent border-none cursor-pointer">✕</button>
                        </div>
                        <div className="p-4 flex flex-col gap-4">
                            <div>
                                <p className="text-xs font-bold text-gray-700 mb-2">Tìm theo tên</p>
                                <input type="text" placeholder="Nhập tên tour..." value={searchName} onChange={e => setSearchName(e.target.value)}
                                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-orange-400" />
                            </div>
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
                            <button onClick={() => setMobileFilterOpen(false)}
                                className="w-full bg-orange-500 text-white font-bold py-3 rounded-xl border-none cursor-pointer hover:bg-orange-600 transition-colors">
                                Áp dụng ({filtered.length} kết quả)
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}