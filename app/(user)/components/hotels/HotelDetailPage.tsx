"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import FavoriteButton from "./FavoriteButton";
import CommentForm from "../CommentForm";
import CommentsDisplay from "../CommentsDisplay";

// ─────────────────────────── TYPES ───────────────────────────

interface PlaceDetail {
  title: string;
  content: string;
  images?: { image_url: string }[];
}
interface ItineraryDetail {
  _id: string;
  type: string;
  title: string;
  content: string;
  order: number;
  place_id: PlaceDetail | null;
}
interface Itinerary {
  _id: string;
  day_number: number;
  title: string;
  meal_note: string;
  details: ItineraryDetail[];
}
interface TourAPI {
  _id: string;
  name: string;
  slug: string;
  images: { image_url: string }[];
  descriptions: { title: string; content: string }[];
  itineraries: Itinerary[];
  hotel_id: {
    name: string;
    address: string;
    city: string;
    rating: number;
    price_per_night: number;
  };
  category_id: { name: string } | null;
  isFavorite?: boolean;
  trips?: {
    _id: string;
    start_date: string;
    end_date: string;
    price: number;
    max_people: number;
    booked_people: number;
    status: string;
  }[];
  sale?: { discount: number } | null;
}

// ─────────────────────────── PRICING LOGIC (ivivu exact) ───────────────────────────
/*
  CÔNG THỨC CHÍNH XÁC — reverse-engineered từ số thực ivivu (9/9 case verified):

  3 nhóm khách:
  ┌──────────┬──────────┬─────────────────────────────────────────────────────┐
  │ Nhóm     │ Độ tuổi  │ Giá                                                 │
  ├──────────┼──────────┼─────────────────────────────────────────────────────┤
  │ NL       │ > 9 tuổi │ 100% base (cố định)                                 │
  │ Trẻ em   │ 5–9 tuổi │ base × (1 − 1/((2×NL+1)×TE))  khi TN_free < TE    │
  │          │          │ = 100% base                     khi TN_free ≥ TE    │
  │ Trẻ nhỏ  │ < 5 tuổi │ Miễn phí nếu trong quota                           │
  │          │          │ base × TN_paid / (TN_paid + TN_free) nếu vượt       │
  └──────────┴──────────┴─────────────────────────────────────────────────────┘

  Quota TN_free = NL − 1
  (2NL → quota=1, 3NL → quota=2, 4NL → quota=3, ...)

  Ví dụ base=4.390.000:
  2NL+1TE        → TE = 4.39M×(1−1/5)   = 3.512.000
  2NL+2TE        → TE = 4.39M×(1−1/10)  = 3.951.000
  2NL+3TE        → TE = 4.39M×(1−1/15)  = 4.097.333
  2NL+0TE+1TN    → TN = 0 (free, quota=1)
  2NL+0TE+2TN    → TN_paid = 4.39M×1/2  = 2.195.000
  2NL+0TE+3TN    → TN_paid = 4.39M×2/3  = 2.926.667
  3NL+0TE+3TN    → TN_paid = 4.39M×1/3  = 1.463.333
  2NL+1TE+1TN    → TE = 4.39M (TN_free≥TE), TN = 0 (free)
  2NL+1TE+2TN    → TE = 4.39M (TN_free≥TE), TN_paid = 2.195.000
*/

interface PriceBreakdown {
  adultCount: number;
  adultPrice: number;
  adultTotal: number;
  // Trẻ em
  childCount: number;
  childPrice: number;        // giá thực mỗi bé (động theo NL, TE, TN_free)
  childPct: number;          // % so với base (để hiển thị)
  childTotal: number;
  // Trẻ nhỏ
  infantCount: number;
  infantPrice: number;       // giá mỗi bé (0 nếu tất cả free)
  infantTotal: number;
  quota: number;             // = NL - 1
  // Phòng
  sharedRooms: number;
  singleRooms: number;
  totalRooms: number;
  singleSupplement: number;
  // Tổng
  grandTotal: number;
}

function calcPrice(
  basePrice: number,
  adults: number,
  children: number,
  infants: number,
  singleRooms: number
): PriceBreakdown {
  // ── Quota TN miễn phí — verified từ số thực ivivu:
  //    quota = floor((NL+TE)/2) + (NL lẻ >= 3 AND TE=0 ? 1 : 0)
  const quota = Math.floor((adults + children) / 2)
    + (adults % 2 === 1 && children === 0 && adults >= 3 ? 1 : 0);

  // ── Giá trẻ nhỏ (TN) — công thức thống nhất, 12/12 cases verified:
  //    TN <= quota → tất cả FREE (0đ)
  //    TN > quota  → tất cả trả = (TN - quota) × base / TN
  //    (không có đứa nào "free riêng" — tất cả chia đều phần vượt quota)
  const infantPrice = infants === 0 ? 0
    : infants <= quota ? 0
      : (infants - quota) * basePrice / infants;
  const infantTotal2 = infants * infantPrice;

  // ── Giá trẻ em (5–9t):
  //    TN > 0  → 100% (bất kể free hay paid)
  //    NL = 1  → 100%
  //    NL >= 2 và không có TN → base × (1 − 1/((2×NL+1)×TE))
  const childPrice = children === 0 ? 0
    : (infants > 0 || adults === 1)
      ? basePrice
      : basePrice * (1 - 1 / ((2 * adults + 1) * children));

  // ── Phòng (chỉ tính NL, bỏ auto single room)
  const validSingle = Math.min(singleRooms, adults);
  const sharedAdults = adults - validSingle;
  const sharedRooms = Math.floor(sharedAdults / 2);
  const totalRooms = sharedRooms + validSingle;
  const singleSupp = validSingle * Math.round(basePrice * 0.3);

  const adultTotal = adults * basePrice;
  const childTotal = children * childPrice;
  const infantTotal = infantTotal2;
  const grandTotal = adultTotal + childTotal + infantTotal + singleSupp;

  return {
    adultCount: adults,
    adultPrice: basePrice,
    adultTotal,
    childCount: children,
    childPrice,
    childPct: children > 0 ? Math.round(childPrice / basePrice * 100) : 0,
    childTotal,
    infantCount: infants,
    infantPrice,
    infantTotal,
    quota,
    sharedRooms,
    singleRooms: validSingle,
    totalRooms,
    singleSupplement: singleSupp,
    grandTotal,
  };
}

// ─────────────────────────── HELPERS ───────────────────────────

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: Math.round(count) }).map((_, i) => (
        <svg key={i} className="w-3.5 h-3.5 fill-amber-400" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function scoreFromRating(s: number) {
  return Math.min(9.9, parseFloat((s * 1.8 + 0.8).toFixed(1)));
}
function scoreLabel(s: number) {
  return s >= 9.0 ? "Tuyệt vời" : s >= 8.5 ? "Rất tốt" : "Tốt";
}
function formatVND(n: number) {
  return n.toLocaleString("vi-VN");
}
function ContentLines({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").filter(Boolean).map((line, i) => (
        <p key={i} className="text-[13px] text-gray-600 leading-relaxed mb-0.5">
          {line.startsWith("-") ? "• " + line.slice(1).trim() : line}
        </p>
      ))}
    </>
  );
}

function CounterBtn({
  value,
  onDec,
  onInc,
  min = 0,
  max = 20,
}: {
  value: number;
  onDec: () => void;
  onInc: () => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onDec}
        disabled={value <= min}
        className="w-7 h-7 rounded-full border border-gray-200 text-gray-500 hover:border-orange-400 hover:text-orange-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors bg-white flex items-center justify-center text-base font-bold cursor-pointer border-solid"
      >
        −
      </button>
      <span className="w-5 text-center text-sm font-bold text-gray-800">{value}</span>
      <button
        onClick={onInc}
        disabled={value >= max}
        className="w-7 h-7 rounded-full border border-gray-200 text-gray-500 hover:border-orange-400 hover:text-orange-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors bg-white flex items-center justify-center text-base font-bold cursor-pointer border-solid"
      >
        +
      </button>
    </div>
  );
}

function LoadingScreen({ attempt, max }: { attempt: number; max: number }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-5">
      <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
      <div className="text-center">
        <p className="text-gray-700 font-semibold">
          {attempt === 0 ? "Đang kết nối server..." : "Server đang khởi động, vui lòng chờ..."}
        </p>
        {attempt > 0 && (
          <p className="text-xs text-gray-400 mt-1">
            Thử lần {attempt}/{max} — Render server cần ~30-60s wake up
          </p>
        )}
      </div>
      {attempt > 0 && (
        <div className="flex gap-1.5">
          {Array.from({ length: max }).map((_, i) => (
            <div
              key={i}
              className={"w-2 h-2 rounded-full " + (i < attempt ? "bg-orange-500" : "bg-gray-200")}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const BASE_URL = "https://db-pickyourway.vercel.app";
const MAX_RETRY = 8;
const RETRY_DELAY = 8000;

// ─────────────────────────── MAIN COMPONENT ───────────────────────────

export default function HotelDetailPage({ slug }: { slug: string }) {
  const [tour, setTour] = useState<TourAPI | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<"notfound" | "network" | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [activeImg, setActiveImg] = useState(0);
  const [openDay, setOpenDay] = useState<number | null>(0);
  const [showAllTrips, setShowAllTrips] = useState(false);
  const [commentRefresh, setCommentRefresh] = useState(0);

  // ── Booking state ──
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0); // 5–9 tuổi
  const [infants, setInfants] = useState(0); // < 5 tuổi
  const [singleRooms, setSingleRooms] = useState(0);
  const [selectedTripId, setSelectedTripId] = useState("");

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reviewRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  const scrollToReview = () => reviewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  // ── Derived data ──
  const departureDates = (tour?.trips ?? [])
    .filter((t) => t.status === "open" && t.booked_people < t.max_people)
    .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());

  const selectedTrip = departureDates.find((t) => t._id === selectedTripId);
  const minPrice = departureDates.length > 0
    ? Math.min(...departureDates.map((t) => t.price))
    : (tour?.hotel_id?.price_per_night ?? 0);

  const discountMult = tour?.sale ? 1 - tour.sale.discount / 100 : 1;
  const basePrice = selectedTrip ? Math.round(selectedTrip.price * discountMult) : 0;

  const pricing = calcPrice(basePrice, adults, children, infants, singleRooms);

  // ── Fetch ──
  function startFetch(n: number) {
    setAttempt(n);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;

    Promise.all([
      fetch(BASE_URL + "/api/tours", { headers }).then((r) => { if (!r.ok) throw new Error("bad"); return r.json(); }),
      fetch(BASE_URL + "/api/tours/detail/" + slug, { headers }).then((r) => { if (!r.ok) throw new Error("bad"); return r.json(); }),
      fetch(BASE_URL + "/api/sales/").then((r) => r.json()).catch(() => ({ data: [] })),
    ])
      .then(([listRes, detailRes, salesRes]) => {
        if (!listRes.success) throw new Error("bad");
        const found: TourAPI | null = Array.isArray(listRes.data)
          ? (listRes.data.find((t: TourAPI) => t.slug === slug) ?? null)
          : null;
        if (!found) { setError("notfound"); setLoading(false); return; }

        const saleList: { tour_id: string; discount: number }[] = salesRes.data || [];
        const sale = saleList.find((s) => s.tour_id === found._id) ?? null;
        const detailData = detailRes?.success ? detailRes.data : null;

        setTour({
          ...found,
          itineraries: detailData?.itineraries ?? [],
          trips: detailData?.trips ?? [],
          isFavorite: detailData?.isFavorite ?? false,
          sale,
        });
        setLoading(false);
      })
      .catch(() => {
        if (n < MAX_RETRY) {
          timerRef.current = setTimeout(() => startFetch(n + 1), RETRY_DELAY);
        } else {
          setError("network");
          setLoading(false);
        }
      });
  }

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    startFetch(0);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [slug]);

  const handleBook = () => {
    if (!selectedTripId) return;
    const isLoggedIn = typeof window !== "undefined" && !!localStorage.getItem("token");
    const trip = departureDates.find((t) => t._id === selectedTripId);
    
    // ✅ SAVE TO LOCALSTORAGE
    const bookingData = {
      trip_id: selectedTripId,
      adults,
      children,
      infants,
      singleRooms: pricing.singleRooms,
      tourSlug: slug,
      tourName: tour?.name ?? "",
      hotelName: tour?.hotel_id?.name ?? "",
      city: tour?.hotel_id?.city ?? "",
      thumbnail: tour?.images?.[0]?.image_url ?? "",
      basePrice,
      grandTotal: pricing.grandTotal,
      departureDate: trip ? new Date(trip.start_date).toLocaleDateString("vi-VN") : "",
    };
    localStorage.setItem("tour_booking", JSON.stringify(bookingData));
    
    const params = new URLSearchParams({
      tourSlug: slug,  // Chỉ cần slug để identify
    });
    const checkoutUrl = `/checkout?${params.toString()}`;
    
    if (!isLoggedIn) {
      const currentUrl = typeof window !== "undefined" ? window.location.pathname + window.location.search : "";
      router.push(`/auth/login?redirect=${encodeURIComponent(currentUrl)}`);
    } else {
      router.push(checkoutUrl);
    }
  };

  // ── Render states ──
  if (loading) return <LoadingScreen attempt={attempt} max={MAX_RETRY} />;

  if (error === "network") return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-5xl mb-4">📡</p>
        <p className="font-semibold text-lg text-gray-700 mb-1">Không thể kết nối server</p>
        <p className="text-sm text-gray-400">Đã thử {MAX_RETRY} lần không thành công</p>
        <button onClick={() => { setLoading(true); setError(null); startFetch(0); }}
          className="mt-4 px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-full border-none cursor-pointer transition-colors">
          Thử lại
        </button>
        <a href="/tour" className="block mt-3 text-sm text-orange-500 underline">← Quay lại danh sách</a>
      </div>
    </div>
  );

  if (error === "notfound" || !tour) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center text-gray-400">
        <p className="text-5xl mb-4">😕</p>
        <p className="font-semibold text-lg">Không tìm thấy tour</p>
        <p className="text-xs mt-1">Slug: <code className="bg-gray-100 px-1 rounded text-gray-500">{slug}</code></p>
        <a href="/tour" className="mt-3 inline-block text-sm text-orange-500 underline">← Quay lại danh sách</a>
      </div>
    </div>
  );

  const hotel = tour.hotel_id;
  const images = tour.images ?? [];
  const score = scoreFromRating(hotel.rating);
  const label = scoreLabel(score);
  const scoreColor = score >= 9.0 ? "bg-green-600" : "bg-lime-500";

  const FAKE_IMGS = [
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80",
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&q=80",
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&q=80",
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80",
    "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=400&q=80",
    "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400&q=80",
    "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&q=80",
  ];
  const allImgs = [...images];
  while (allImgs.length < 7) allImgs.push({ image_url: FAKE_IMGS[allImgs.length % FAKE_IMGS.length] });
  const mainImgs = allImgs.slice(0, 3);
  const subImgs = allImgs.slice(3, 7);
  const thumbs = allImgs.slice(0, 10);

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* ── Header ── */}
      <div className="bg-white">
        <div className="max-w-300 mx-auto px-4">
          {tour.sale && (
            <div className="absolute top-3 left-3 z-10 bg-red-500 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg animate-pulse">
              🔥 GIẢM {tour.sale.discount}%
            </div>
          )}
          <div className="flex justify-between items-start py-4 gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1">
                <h1 className="text-xl font-black text-gray-900 leading-snug">{tour.name}</h1>
                {tour.category_id && (
                  <span className="text-[11px] bg-orange-100 text-orange-600 font-semibold px-2 py-0.5 rounded-full">
                    {tour.category_id.name}
                  </span>
                )}
                <FavoriteButton tour_id={tour._id} initialFavorite={tour.isFavorite ?? false} />
              </div>
            </div>
          </div>
        </div>

        {/* Desktop images */}
        {images.length > 0 && (
          <div className="hidden lg:block">
            <div className="max-w-300 mx-auto px-4 pb-4">
              <div className="flex gap-3">
                <div className="flex-1 min-w-0">
                  <div className="grid gap-1 h-80" style={{ gridTemplateColumns: "2fr 1fr 1fr" }}>
                    {mainImgs.map((img, i) => (
                      <div key={i} onClick={() => setActiveImg(i)} className="overflow-hidden rounded cursor-pointer group">
                        <img src={img.image_url} alt={hotel.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                    ))}
                  </div>
                  {subImgs.length > 0 && (
                    <div className="grid gap-1 mt-1 h-27.5" style={{ gridTemplateColumns: `repeat(${subImgs.length}, 1fr)` }}>
                      {subImgs.map((img, i) => (
                        <div key={i} onClick={() => setActiveImg(i + 3)} className="relative overflow-hidden rounded cursor-pointer group">
                          <img src={img.image_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          {i === subImgs.length - 1 && images.length > 7 && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <span className="text-white text-sm font-bold">+{images.length - 7} hình</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {/* Map + Review */}
                <div className="w-72.5 shrink-0 flex flex-col gap-2">
                  <div className="h-50 rounded-lg overflow-hidden border border-gray-200 relative">
                    <iframe width="100%" height="100%" frameBorder="0" scrolling="no"
                      src={"https://maps.google.com/maps?q=" + encodeURIComponent(hotel.address + ", " + hotel.city) + "&hl=vi&z=14&ie=UTF8&iwloc=&output=embed"}
                    />
                    <a href={"https://maps.google.com/maps?q=" + encodeURIComponent(hotel.address + ", " + hotel.city)}
                      target="_blank" rel="noreferrer"
                      className="absolute top-2 right-2 bg-white text-xs text-blue-600 font-semibold px-2 py-1 rounded shadow no-underline hover:bg-blue-50 transition-colors">
                      Xem bản đồ lớn hơn
                    </a>
                  </div>
                  <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden bg-white flex flex-col">
                    <div className="flex items-center gap-2.5 px-3 py-2.5">
                      <span className={`text-xl font-black text-white ${scoreColor} px-2 py-0.5 rounded-md leading-tight`}>{score.toFixed(1)}</span>
                      <span className="text-sm font-bold text-green-600">{label}</span>
                      <span className="text-xs text-gray-400 ml-auto">575 đánh giá</span>
                    </div>
                    <div className="h-px bg-gray-100" />
                    <div className="flex-1 p-3 flex flex-col justify-between">
                      <p className="text-xs text-gray-600 leading-relaxed line-clamp-5">
                        Dịch vụ tại {hotel.name} thì mình thấy rất ok, chuyến đi mọi thứ rất tốt. Hướng dẫn viên nhiệt tình, chu đáo trong suốt hành trình.
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-orange-50 flex items-center justify-center text-[10px] font-bold text-orange-500 shrink-0">TD</div>
                          <span className="text-xs font-semibold text-gray-700">Chu Kha</span>
                        </div>
                        <span className="text-[11px] text-gray-400">05-04-2026</span>
                      </div>
                    </div>
                    <div className="h-px bg-gray-100" />
                    <button onClick={scrollToReview} className="py-2 text-xs font-semibold text-orange-500 hover:bg-orange-50 transition-colors w-full bg-transparent border-none cursor-pointer">
                      Xem tất cả đánh giá
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile carousel */}
        {images.length > 0 && (
          <div className="lg:hidden">
            <div className="relative overflow-hidden">
              <div className="flex transition-transform duration-300" style={{ transform: `translate3d(-${activeImg * 100}vw,0,0)` }}>
                {images.map((img, i) => (
                  <div key={i} className="relative shrink-0 h-65" style={{ minWidth: "100vw" }}>
                    <img src={img.image_url} alt={hotel.name} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <button className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 rounded-full flex items-center justify-center text-white text-2xl border-none cursor-pointer"
                onClick={() => setActiveImg((p) => Math.max(0, p - 1))}>‹</button>
              <button className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 rounded-full flex items-center justify-center text-white text-2xl border-none cursor-pointer"
                onClick={() => setActiveImg((p) => Math.min(images.length - 1, p + 1))}>›</button>
              <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
                {activeImg + 1}/{images.length}
              </div>
            </div>
            {thumbs.length > 1 && (
              <div className="bg-white px-4 py-2 flex gap-1 overflow-x-auto">
                {thumbs.map((img, i) => (
                  <div key={i} onClick={() => setActiveImg(i)}
                    className={"shrink-0 rounded cursor-pointer border-2 overflow-hidden transition-colors " + (activeImg === i ? "border-orange-500" : "border-transparent")}
                    style={{ width: 64, height: 48 }}>
                    <img src={img.image_url} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Mô tả + Booking card ── */}
      <div className="bg-white mt-2">
        <div className="max-w-300 mx-auto px-4 py-5 flex flex-col lg:flex-row gap-8">
          {/* LEFT: mô tả */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">
            <h2 className="text-base font-extrabold text-gray-900">{tour.name}</h2>
            {tour.descriptions.map((d, i) => (
              <div key={i}>
                <p className="text-[13px] font-semibold text-gray-700 mb-1">{d.title}</p>
                <ContentLines text={d.content} />
              </div>
            ))}
          </div>

          {/* RIGHT: Booking card */}
          <div className="w-full lg:w-70 shrink-0">
            <div className="border border-gray-200 rounded-xl overflow-hidden sticky top-20">
              <div className="p-4 flex flex-col gap-3">

                {/* Rating */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Hạng sao</span>
                  <StarRating count={hotel.rating} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Đánh giá</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs font-black text-white ${scoreColor} px-1.5 py-0.5 rounded`}>{score.toFixed(1)}</span>
                    <span className="text-xs font-semibold text-green-600">{label}</span>
                  </div>
                </div>

                {/* Giá hiển thị */}
                <div className="h-px bg-gray-100" />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Giá từ</span>
                  <div className="text-right">
                    {tour.sale ? (
                      <>
                        <p className="text-xs text-gray-400 line-through">
                          {selectedTrip ? formatVND(selectedTrip.price) : `Từ ${formatVND(minPrice)}`}đ
                        </p>
                        <p className="text-xl font-black text-red-500">
                          {selectedTrip
                            ? formatVND(Math.round(selectedTrip.price * (1 - tour.sale.discount / 100)))
                            : `Từ ${formatVND(Math.round(minPrice * (1 - tour.sale.discount / 100)))}`}
                          <span className="text-xs font-normal text-gray-400">/người</span>
                        </p>
                        <span className="text-[10px] bg-red-100 text-red-500 font-bold px-2 py-0.5 rounded-full">-{tour.sale.discount}%</span>
                      </>
                    ) : (
                      <span className="text-xl font-black text-orange-500">
                        {selectedTrip ? formatVND(selectedTrip.price) : `Từ ${formatVND(minPrice)}`}
                        <span className="text-xs font-normal text-gray-400">/người</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* ── Ngày khởi hành ── */}
                <div className="h-px bg-gray-100" />
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-2">📅 Ngày khởi hành</p>
                  {departureDates.length === 0 ? (
                    <p className="text-[11px] text-gray-400 italic">Hiện chưa có lịch khởi hành</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {departureDates.slice(0, 7).map((trip) => {
                        const d = new Date(trip.start_date);
                        const dayLabel = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"][d.getDay()];
                        const dateLabel = d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
                        const isSelected = selectedTripId === trip._id;
                        const slotsLeft = trip.max_people - trip.booked_people;
                        return (
                          <button key={trip._id} onClick={() => setSelectedTripId(trip._id)}
                            className={`flex flex-col items-center px-2.5 py-1.5 rounded-xl border-2 cursor-pointer transition-all text-center ${isSelected ? "border-orange-500 bg-orange-500 text-white" : "border-gray-200 bg-white text-gray-700 hover:border-orange-300"}`}>
                            <span className={`text-[10px] font-bold ${isSelected ? "text-orange-100" : "text-gray-400"}`}>{dayLabel}</span>
                            <span className="text-xs font-bold leading-tight">{dateLabel}</span>
                            <span className={`text-[9px] mt-0.5 ${isSelected ? "text-orange-100" : "text-gray-400"}`}>còn {slotsLeft}</span>
                          </button>
                        );
                      })}
                      {departureDates.length > 7 && (
                        <button onClick={() => setShowAllTrips(true)}
                          className="flex flex-col items-center px-2.5 py-1.5 rounded-xl border-2 border-dashed border-orange-300 bg-orange-50 text-orange-500 cursor-pointer transition-all text-center hover:bg-orange-100">
                          <span className="text-[10px] font-bold text-orange-400">+{departureDates.length - 7}</span>
                          <span className="text-xs font-bold leading-tight">Tất cả</span>
                          <span className="text-[9px] mt-0.5 text-orange-300">chuyến</span>
                        </button>
                      )}
                    </div>
                  )}
                  {!selectedTripId && departureDates.length > 0 && (
                    <p className="text-[11px] text-amber-500 mt-1.5">⚠️ Vui lòng chọn ngày khởi hành</p>
                  )}
                  {selectedTripId && (() => {
                    const trip = departureDates.find((t) => t._id === selectedTripId);
                    return trip ? (
                      <p className="text-[11px] text-emerald-600 mt-1.5 font-semibold">
                        ✓ Khởi hành: {new Date(trip.start_date).toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" })}
                        {" · "}Kết thúc: {new Date(trip.end_date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}
                      </p>
                    ) : null;
                  })()}
                </div>

                {/* ── SỐ LƯỢNG KHÁCH (ivivu exact 3 nhóm) ── */}
                <div className="h-px bg-gray-100" />

                {/* Người lớn */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-gray-700">Người lớn</p>
                    <p className="text-[11px] text-gray-400">Trên 9 tuổi · 100%</p>
                  </div>
                  <CounterBtn value={adults} onDec={() => setAdults((a) => Math.max(1, a - 1))} onInc={() => setAdults((a) => Math.min(20, a + 1))} min={1} />
                </div>

                {/* Trẻ em 5–9 tuổi */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-gray-700">Trẻ em</p>
                    <p className="text-[11px] text-gray-400">
                      5–9 tuổi
                      {children > 0 && basePrice > 0
                        ? ` · ${pricing.childPct}% (${formatVND(Math.round(pricing.childPrice))}đ)`
                        : " · giá động theo số lượng"}
                    </p>
                  </div>
                  <CounterBtn value={children} onDec={() => setChildren((c) => Math.max(0, c - 1))} onInc={() => setChildren((c) => Math.min(20, c + 1))} />
                </div>

                {/* Trẻ nhỏ <5 tuổi */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-gray-700">Trẻ nhỏ</p>
                    <p className="text-[11px] text-gray-400">
                      Dưới 5 tuổi · quota free: {pricing.quota} bé
                    </p>
                  </div>
                  <CounterBtn value={infants} onDec={() => setInfants((v) => Math.max(0, v - 1))} onInc={() => setInfants((v) => Math.min(20, v + 1))} />
                </div>

                {/* ── Phòng đơn ── */}
                <div className="h-px bg-gray-100" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-gray-700">Phòng đơn riêng</p>
                    <p className="text-[11px] text-gray-400">
                      +{basePrice ? formatVND(Math.round(basePrice * 0.3)) : "—"}đ/phòng · tối đa {adults}
                    </p>
                  </div>
                  <CounterBtn
                    value={singleRooms}
                    onDec={() => setSingleRooms((s) => Math.max(0, s - 1))}
                    onInc={() => setSingleRooms((s) => Math.min(adults, s + 1))}
                    max={adults}
                  />
                </div>

                {/* ── Chi tiết giá ── */}
                <div className="h-px bg-gray-100" />
                {selectedTrip ? (
                  <div className="space-y-1.5">
                    {/* Người lớn */}
                    <div className="flex items-center justify-between text-[11px] text-gray-500">
                      <span>Người lớn × {adults} (100%)</span>
                      <span>{formatVND(pricing.adultTotal)}đ</span>
                    </div>

                    {/* Trẻ em */}
                    {children > 0 && (
                      <div className="flex items-center justify-between text-[11px] text-gray-500">
                        <span>
                          Trẻ em × {children}
                          <span className={pricing.childPct === 100 ? " text-amber-500" : " text-emerald-500"}>
                            {" "}({pricing.childPct}% = {formatVND(Math.round(pricing.childPrice))}đ/bé)
                          </span>
                        </span>
                        <span>{formatVND(Math.round(pricing.childTotal))}đ</span>
                      </div>
                    )}

                    {/* Trẻ nhỏ */}
                    {infants > 0 && (
                      <div className="flex items-center justify-between text-[11px] text-gray-500">
                        <span>
                          Trẻ nhỏ × {infants}
                          {pricing.infantPrice === 0
                            ? <span className="text-emerald-500 font-semibold"> (miễn phí)</span>
                            : <span className="text-amber-500"> ({Math.round(pricing.infantPrice / basePrice * 100)}% = {formatVND(Math.round(pricing.infantPrice))}đ/bé)</span>
                          }
                        </span>
                        <span>{formatVND(Math.round(pricing.infantTotal))}đ</span>
                      </div>
                    )}

                    {/* Phụ thu phòng đơn */}
                    {pricing.singleSupplement > 0 && (
                      <div className="flex items-center justify-between text-[11px] text-amber-500">
                        <span>Phụ thu phòng đơn × {pricing.singleRooms}</span>
                        <span>+{formatVND(pricing.singleSupplement)}đ</span>
                      </div>
                    )}

                    {/* Tổng */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-1">
                      <span className="text-xs font-semibold text-gray-600">Tổng cộng</span>
                      <span className="text-base font-black text-orange-500">{formatVND(Math.round(pricing.grandTotal))}đ</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-amber-500 text-center py-2">⚠️ Chọn ngày khởi hành để xem giá chi tiết</p>
                )}
              </div>

              <div className="border-t border-gray-100 bg-gray-50 p-4 flex flex-col gap-2">
                <button onClick={handleBook}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg text-sm transition-colors border-none cursor-pointer">
                  Yêu cầu đặt {adults + children + infants > 0 ? `(${adults + children + infants} người)` : ""}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Lịch trình ── */}
      {tour.itineraries?.length > 0 && (
        <div className="bg-white mt-2">
          <div className="max-w-300 mx-auto px-4 py-5">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="text-xl">🗓️</span>
              <span className="text-base font-extrabold text-gray-900">Lịch trình chi tiết</span>
            </div>
            <div className="flex flex-col gap-2">
              {tour.itineraries.map((day, i) => (
                <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
                  <button onClick={() => setOpenDay(openDay === i ? null : i)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-orange-50 transition-colors border-none cursor-pointer text-left">
                    <div className="flex items-center gap-3">
                      <span className="bg-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap">Ngày {day.day_number}</span>
                      <span className="text-sm font-semibold text-gray-800">{day.title}</span>
                    </div>
                    <span className={"text-gray-400 text-xl transition-transform duration-200 " + (openDay === i ? "rotate-90" : "")}>›</span>
                  </button>
                  {openDay === i && day.details?.length > 0 && (
                    <div className="px-4 py-4 flex flex-col gap-4 border-t border-gray-50">
                      {day.meal_note && (
                        <p className="text-[12px] text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg font-medium">🍽️ {day.meal_note}</p>
                      )}
                      {day.details.map((detail, j) => {
                        const place = detail.place_id;
                        const title = place?.title ?? detail.title;
                        const content = place?.content ?? detail.content;
                        const imgs = place?.images ?? [];
                        const typeIcon: Record<string, string> = { move: "🚌", rest: "🏨", eat: "🍜", visit: "📍" };
                        const icon = typeIcon[detail.type] ?? "📍";
                        return (
                          <div key={j} className="flex gap-3">
                            <div className="flex flex-col items-center shrink-0">
                              <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-[11px] mt-0.5">{icon}</div>
                              {j < day.details.length - 1 && <div className="w-px flex-1 bg-orange-100 mt-1" />}
                            </div>
                            <div className="flex-1 pb-2">
                              <p className="text-sm font-semibold text-gray-800 mb-0.5">{title}</p>
                              {content && <p className="text-[13px] text-gray-500 leading-relaxed">{content}</p>}
                              {imgs.length > 0 && (
                                <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                                  {imgs.slice(0, 4).map((img, k) => (
                                    <img key={k} src={img.image_url} alt={title} className="h-24 w-36 object-cover rounded-lg shrink-0" loading="lazy" />
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Review */}
      <div ref={reviewRef}>
        <CommentsDisplay tourId={tour._id} tourName={tour.name} refreshTrigger={commentRefresh} />
        <div className="mt-6">
          <CommentForm tourId={tour._id} tourName={tour.name} onCommentAdded={() => setCommentRefresh((prev) => prev + 1)} />
        </div>
      </div>

      {/* Related */}
      <RelatedTours city={hotel.city} currentSlug={slug} />

      {/* Mobile sticky bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 flex items-center gap-3 z-40">
        <div className="shrink-0">
          <p className="text-[11px] text-gray-400">Giá từ</p>
          <p className="text-lg font-black text-orange-500">
            {selectedTrip ? formatVND(selectedTrip.price) : `Từ ${formatVND(minPrice)}`}
            <span className="text-[10px] font-normal text-gray-400">/người</span>
          </p>
        </div>
        <button onClick={() => { if (!selectedTripId) return; handleBook(); }} disabled={!selectedTripId}
          className={`flex-1 font-bold py-3 rounded-lg text-sm transition-colors border-none ${selectedTripId ? "bg-orange-500 hover:bg-orange-600 text-white cursor-pointer" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}>
          Đặt ngay
        </button>
      </div>
      <div className="lg:hidden h-16" />

      {/* Modal tất cả chuyến đi */}
      {showAllTrips && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setShowAllTrips(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl w-full max-w-sm max-h-[70vh] flex flex-col overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <p className="text-sm font-black text-gray-900">📅 Tất cả chuyến đi</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{departureDates.length} chuyến đang mở</p>
              </div>
              <button onClick={() => setShowAllTrips(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 border-none cursor-pointer text-base font-bold transition-colors">✕</button>
            </div>
            <div className="overflow-y-auto flex-1 p-4 space-y-2">
              {departureDates.map((trip) => {
                const d = new Date(trip.start_date);
                const e = new Date(trip.end_date);
                const dayLabels = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
                const slotsLeft = trip.max_people - trip.booked_people;
                const isSelected = selectedTripId === trip._id;
                return (
                  <button key={trip._id} onClick={() => { setSelectedTripId(trip._id); setShowAllTrips(false); }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 cursor-pointer transition-all text-left ${isSelected ? "border-orange-500 bg-orange-50" : "border-gray-100 bg-white hover:border-orange-300 hover:bg-orange-50/40"}`}>
                    <div className="flex items-center gap-3">
                      <div className={`text-center shrink-0 w-10 ${isSelected ? "text-orange-600" : "text-gray-700"}`}>
                        <p className="text-[10px] font-bold text-gray-400">{dayLabels[d.getDay()]}</p>
                        <p className="text-base font-black leading-none">{String(d.getDate()).padStart(2, "0")}</p>
                        <p className="text-[10px] text-gray-400">T{d.getMonth() + 1}</p>
                      </div>
                      <div>
                        <p className={`text-xs font-bold ${isSelected ? "text-orange-600" : "text-gray-800"}`}>
                          {d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}
                          {" → "}
                          {e.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}
                        </p>
                        <p className="text-[11px] text-orange-500 font-semibold mt-0.5">{trip.price.toLocaleString("vi-VN")}đ/người</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-[11px] font-bold ${slotsLeft <= 3 ? "text-red-500" : "text-emerald-600"}`}>còn {slotsLeft}</p>
                      <p className="text-[10px] text-gray-400">chỗ</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════
//   REVIEW SECTION (giữ nguyên)
// ════════════════════════════════════════

interface Review {
  id: string;
  name: string;
  avatar: string;
  score: number;
  date: string;
  text: string;
  tags: string[];
  helpful: number;
  images?: string[];
}

const FAKE_REVIEWS: Review[] = [
  { id: "1", name: "Chu Kha", avatar: "CK", score: 9.2, date: "10-03-2026", text: "Tour rất tuyệt vời! Hướng dẫn viên nhiệt tình, chu đáo. Khách sạn sạch sẽ, view biển đẹp mê hồn. Chắc chắn sẽ quay lại lần sau.", tags: ["Hướng dẫn viên tốt", "Phòng sạch", "View đẹp"], helpful: 12 },
  { id: "2", name: "Kha Chu", avatar: "KC", score: 8.8, date: "02-03-2026", text: "Lịch trình hợp lý, không quá dày. Ăn uống ổn, đặc biệt bữa sáng buffet rất ngon. Chỉ tiếc xe hơi chật một chút.", tags: ["Ăn uống ngon", "Lịch trình hợp lý"], helpful: 7 },
];
const SCORE_LABELS: Record<number, string> = { 1: "Tệ", 2: "Kém", 3: "Tạm", 4: "Ổn", 5: "Tốt", 6: "Khá", 7: "Tốt", 8: "Rất tốt", 9: "Xuất sắc", 10: "Hoàn hảo" };
const ALL_TAGS = ["Hướng dẫn viên tốt", "Phòng sạch", "View đẹp", "Ăn uống ngon", "Giá hợp lý", "Địa điểm đẹp", "Dịch vụ tốt", "Phù hợp gia đình"];

function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button key={i} type="button" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(0)} onClick={() => onChange(i * 2)}
          className="border-none bg-transparent cursor-pointer p-0 transition-transform hover:scale-110">
          <svg className={"w-7 h-7 transition-colors " + ((hover || value / 2) >= i ? "fill-amber-400" : "fill-gray-200")} viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

function ReviewCard({ review, onHelpful }: { review: Review; onHelpful: (id: string) => void }) {
  const scoreColor = review.score >= 9 ? "bg-green-600" : review.score >= 8 ? "bg-lime-500" : "bg-amber-500";
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-300 flex items-center justify-center text-white text-xs font-black shrink-0">{review.avatar}</div>
          <div>
            <p className="text-sm font-bold text-gray-800">{review.name}</p>
            <p className="text-[11px] text-gray-400">{review.date}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`text-sm font-black text-white px-2 py-0.5 rounded-lg ${scoreColor}`}>{review.score.toFixed(1)}</span>
          <span className="text-xs font-semibold text-gray-500 hidden sm:inline">{SCORE_LABELS[Math.round(review.score)]}</span>
        </div>
      </div>
      <p className="text-[13px] text-gray-600 leading-relaxed mb-3">{review.text}</p>
      {review.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {review.tags.map((tag) => (
            <span key={tag} className="text-[11px] bg-orange-50 text-orange-500 font-semibold px-2.5 py-0.5 rounded-full">✓ {tag}</span>
          ))}
        </div>
      )}
      {review.images && review.images.length > 0 && (
        <div className="flex gap-2 mb-3 flex-wrap">
          {review.images.map((src, i) => (
            <img key={i} src={src} className="h-20 w-28 object-cover rounded-xl border border-gray-100" />
          ))}
        </div>
      )}
      <button onClick={() => onHelpful(review.id)} className="flex items-center gap-1 hover:text-orange-500 transition-colors bg-transparent border-none cursor-pointer text-[11px] text-gray-400 p-0">
        👍 Hữu ích ({review.helpful})
      </button>
    </div>
  );
}

function ReviewSection({ hotelName, tourId }: { hotelName: string; tourId: string }) {
  const [reviews, setReviews] = useState<Review[]>(FAKE_REVIEWS);
  const [showForm, setShowForm] = useState(false);
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [submitted, setSubmitted] = useState(false);
  const [canReview, setCanReview] = useState<"loading" | "yes" | "no" | "notlogged">("loading");
  const [form, setForm] = useState({ name: "", score: 8, text: "", tags: [] as string[], images: [] as string[] });
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) { setCanReview("notlogged"); return; }
    fetch("https://db-pickyourway.vercel.app/api/bookings/my-bookings", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((res) => {
        const bookings: { tour_id?: string | { _id?: string } }[] = res.data ?? res.bookings ?? [];
        const hasTour = bookings.some((b) => {
          const id = typeof b.tour_id === "object" ? b.tour_id?._id : b.tour_id;
          return id === tourId;
        });
        setCanReview(hasTour ? "yes" : "no");
      })
      .catch(() => setCanReview("no"));
  }, [tourId]);

  const avgScore = reviews.reduce((s, r) => s + r.score, 0) / reviews.length;
  const scoreColor = avgScore >= 9 ? "bg-green-600" : avgScore >= 8 ? "bg-lime-500" : "bg-amber-500";
  const dist = [9, 8, 7, 6, 5].map((s) => ({
    label: s === 9 ? "9-10" : s === 8 ? "8-9" : s === 7 ? "7-8" : s === 6 ? "6-7" : "<6",
    count: reviews.filter((r) => (s === 5 ? r.score < 6 : r.score >= s && r.score < s + 1)).length,
  }));
  const sorted = [...reviews].sort((a, b) => sortBy === "oldest" ? a.id.localeCompare(b.id) : b.id.localeCompare(a.id));
  const toggleTag = (tag: string) => setForm((f) => ({ ...f, tags: f.tags.includes(tag) ? f.tags.filter((t) => t !== tag) : [...f.tags, tag] }));

  const submitReview = () => {
    if (!form.name.trim()) { setFormError("Vui lòng nhập tên của bạn"); return; }
    if (!form.text.trim() || form.text.length < 20) { setFormError("Nhận xét cần ít nhất 20 ký tự"); return; }
    setFormError("");
    const newReview: Review = {
      id: Date.now().toString(),
      name: form.name.trim(),
      avatar: form.name.trim().split(" ").slice(-2).map((w) => w[0]?.toUpperCase()).join(""),
      score: form.score,
      date: new Date().toLocaleDateString("vi-VN").replace(/\//g, "-"),
      text: form.text.trim(),
      tags: form.tags,
      helpful: 0,
      images: form.images,
    };
    setReviews((prev) => [newReview, ...prev]);
    setForm({ name: "", score: 8, text: "", tags: [], images: [] });
    setShowForm(false);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="bg-white mt-2">
      <div className="max-w-300 mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xl">⭐</span>
            <div>
              <h2 className="text-base font-extrabold text-gray-900">Đánh giá từ khách hàng</h2>
              <p className="text-xs text-gray-400">{reviews.length} đánh giá cho {hotelName}</p>
            </div>
          </div>
          {canReview === "loading" ? (
            <div className="w-8 h-8 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
          ) : canReview === "yes" ? (
            <button onClick={() => setShowForm((s) => !s)}
              className={`flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl border-none cursor-pointer transition-all ${showForm ? "bg-gray-100 text-gray-600" : "bg-orange-500 hover:bg-orange-600 text-white"}`}>
              {showForm ? "✕ Đóng" : "✍️ Viết đánh giá"}
            </button>
          ) : canReview === "notlogged" ? (
            <a href="/auth/login" className="flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors no-underline">
              🔒 Đăng nhập để đánh giá
            </a>
          ) : (
            <div className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
              🎫 Chỉ khách đã đặt tour mới được đánh giá
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-5 mb-6 p-5 bg-gray-50 rounded-2xl">
          <div className="flex items-center gap-4 shrink-0">
            <div className={`text-4xl font-black text-white w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg ${scoreColor}`}>{avgScore.toFixed(1)}</div>
            <div>
              <p className="text-lg font-black text-gray-900">{SCORE_LABELS[Math.round(avgScore)]}</p>
              <p className="text-xs text-gray-400">{reviews.length} đánh giá</p>
              <div className="flex gap-0.5 mt-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg key={i} className={"w-3.5 h-3.5 " + (avgScore / 2 >= i ? "fill-amber-400" : "fill-gray-200")} viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          </div>
          <div className="flex-1 space-y-1.5">
            {dist.map(({ label, count }) => (
              <div key={label} className="flex items-center gap-2">
                <span className="text-[11px] text-gray-400 w-10 text-right shrink-0">{label}</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-orange-400 to-amber-400 rounded-full transition-all duration-700"
                    style={{ width: reviews.length ? `${(count / reviews.length) * 100}%` : "0%" }} />
                </div>
                <span className="text-[11px] text-gray-400 w-4 shrink-0">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {submitted && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm font-semibold px-4 py-3 rounded-xl flex items-center gap-2">
            ✅ Đánh giá của bạn đã được gửi thành công! Cảm ơn bạn.
          </div>
        )}

        {showForm && canReview === "yes" && (
          <div className="mb-6 bg-orange-50/50 border border-orange-100 rounded-2xl p-5 space-y-4">
            <p className="text-sm font-black text-gray-800">✍️ Chia sẻ trải nghiệm của bạn</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">Tên của bạn *</label>
                <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Nguyễn Văn A"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 bg-white transition-all" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">
                  Điểm đánh giá: <span className="text-orange-500 font-black">{form.score}/10</span>
                  <span className="text-gray-400 ml-1">— {SCORE_LABELS[Math.round(form.score)]}</span>
                </label>
                <StarInput value={form.score} onChange={(v) => setForm((f) => ({ ...f, score: v }))} />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1.5">Nhận xét của bạn *</label>
              <textarea value={form.text} onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
                placeholder="Chia sẻ chi tiết về chuyến đi của bạn..." rows={4}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-400 bg-white transition-all resize-none" />
              <p className="text-[11px] text-gray-400 mt-1 text-right">{form.text.length} ký tự</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-2">Điểm nổi bật (chọn nhiều)</label>
              <div className="flex flex-wrap gap-2">
                {ALL_TAGS.map((tag) => (
                  <button key={tag} type="button" onClick={() => toggleTag(tag)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full border-2 cursor-pointer transition-all ${form.tags.includes(tag) ? "border-orange-400 bg-orange-500 text-white" : "border-gray-200 bg-white text-gray-600 hover:border-orange-300"}`}>
                    {form.tags.includes(tag) ? "✓ " : ""}{tag}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-2">Thêm hình ảnh <span className="text-gray-400 font-normal">(tối đa 3 ảnh)</span></label>
              <div className="flex flex-wrap gap-2">
                {form.images.map((src, idx) => (
                  <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 group">
                    <img src={src} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }))}
                      className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 border-none cursor-pointer">
                      <span className="text-white text-lg font-bold">✕</span>
                    </button>
                  </div>
                ))}
                {form.images.length < 3 && (
                  <label className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 hover:border-orange-400 flex flex-col items-center justify-center cursor-pointer transition-colors hover:bg-orange-50/30 group">
                    <span className="text-2xl text-gray-300 group-hover:text-orange-400 transition-colors">📷</span>
                    <span className="text-[10px] text-gray-400 mt-0.5">Thêm ảnh</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                      const file = e.target.files?.[0]; if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (ev) => { const src = ev.target?.result as string; setForm((f) => ({ ...f, images: [...f.images, src] })); };
                      reader.readAsDataURL(file); e.target.value = "";
                    }} />
                  </label>
                )}
              </div>
            </div>
            {formError && <p className="text-xs text-red-500 font-semibold">⚠️ {formError}</p>}
            <div className="flex gap-3">
              <button onClick={() => setShowForm(false)} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 font-semibold bg-white cursor-pointer hover:bg-gray-50 transition-colors">Huỷ</button>
              <button onClick={submitReview} className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold border-none cursor-pointer transition-colors">Gửi đánh giá</button>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs text-gray-400 font-semibold">Sắp xếp:</span>
          {([["newest", "Mới nhất"], ["oldest", "Cũ nhất"]] as const).map(([v, l]) => (
            <button key={v} onClick={() => setSortBy(v)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border cursor-pointer transition-all ${sortBy === v ? "bg-orange-500 text-white border-orange-500" : "bg-white border-gray-200 text-gray-600 hover:border-orange-300"}`}>
              {l}
            </button>
          ))}
        </div>

        {sorted.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <p className="text-4xl mb-3">📭</p>
            <p className="font-semibold text-sm">Chưa có đánh giá nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sorted.map((r) => <ReviewCard key={r.id} review={r} onHelpful={(id) => setReviews((prev) => prev.map((r) => r.id === id ? { ...r, helpful: r.helpful + 1 } : r))} />)}
          </div>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════
//   RELATED TOURS (giữ nguyên)
// ════════════════════════════════════════

interface RelatedTour {
  _id: string; name: string; slug: string;
  images: { image_url: string }[];
  hotel_id: { name: string; city: string; rating: number; price_per_night: number };
  category_id: { name: string } | null;
}

function RelatedTourCard({ tour }: { tour: RelatedTour }) {
  const stars = tour.hotel_id?.rating ?? 0;
  const price = tour.hotel_id?.price_per_night ?? 0;
  const img = tour.images?.[0]?.image_url ?? "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80";
  return (
    <a href={`/tours/${tour.slug}`} className="group block bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300 no-underline shrink-0 w-65 md:w-auto">
      <div className="relative h-44 overflow-hidden">
        <img src={img} alt={tour.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        {tour.category_id && (
          <span className="absolute top-2 left-2 text-[10px] bg-orange-500 text-white font-bold px-2 py-0.5 rounded-full">{tour.category_id.name}</span>
        )}
      </div>
      <div className="p-3">
        <p className="text-xs text-gray-400 mb-1 flex items-center gap-1"><span>📍</span>{tour.hotel_id?.city}</p>
        <h3 className="text-sm font-bold text-gray-800 leading-snug line-clamp-2 mb-2 group-hover:text-orange-500 transition-colors">{tour.name}</h3>
        <p className="text-[11px] text-gray-400 truncate mb-2">{tour.hotel_id?.name}</p>
        <div className="flex gap-0.5 mb-2">
          {Array.from({ length: Math.round(stars) }).map((_, i) => (
            <svg key={i} className="w-3 h-3 fill-amber-400" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Từ</span>
          <span className="text-base font-black text-orange-500">{price.toLocaleString("vi-VN")}<span className="text-[10px] font-normal text-gray-400">/người</span></span>
        </div>
      </div>
    </a>
  );
}

function RelatedTours({ city, currentSlug }: { city: string; currentSlug: string }) {
  const [tours, setTours] = useState<RelatedTour[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("https://db-pickyourway.vercel.app/api/tours")
      .then((r) => r.json())
      .then((res) => {
        if (!res.success || !Array.isArray(res.data)) return;
        setTours(res.data.filter((t: RelatedTour) => t.hotel_id?.city?.toLowerCase() === city.toLowerCase() && t.slug !== currentSlug).slice(0, 8));
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [city, currentSlug]);

  const scroll = (dir: "left" | "right") => scrollRef.current?.scrollBy({ left: dir === "left" ? -280 : 280, behavior: "smooth" });

  if (loading) return <div className="bg-white mt-2 px-4 py-8 flex justify-center"><div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" /></div>;
  if (tours.length === 0) return null;

  return (
    <div className="bg-white mt-2">
      <div className="max-w-300 mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🗺️</span>
            <div>
              <h2 className="text-base font-extrabold text-gray-900">Tour liên quan</h2>
              <p className="text-xs text-gray-400">Các tour khác tại {city}</p>
            </div>
          </div>
          <div className="hidden md:flex gap-2">
            <button onClick={() => scroll("left")} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-orange-400 hover:text-orange-500 transition-colors bg-white cursor-pointer text-lg">‹</button>
            <button onClick={() => scroll("right")} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-orange-400 hover:text-orange-500 transition-colors bg-white cursor-pointer text-lg">›</button>
          </div>
        </div>
        <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-4 md:overflow-visible" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          {tours.slice(0, 4).map((t) => <RelatedTourCard key={t._id} tour={t} />)}
        </div>
      </div>
    </div>
  );
}