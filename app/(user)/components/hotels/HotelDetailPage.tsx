"use client";

import { useState, useEffect, useRef } from "react";

interface PlaceDetail {
  title: string;
  content: string;
  images?: { image_url: string }[];
}
interface ItineraryDetail {
  place_id: PlaceDetail;
}
interface Itinerary {
  day_number: number;
  title: string;
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
}

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
      {text
        .split("\n")
        .filter(Boolean)
        .map((line, i) => (
          <p
            key={i}
            className="text-[13px] text-gray-600 leading-relaxed mb-0.5"
          >
            {line.startsWith("-") ? "• " + line.slice(1).trim() : line}
          </p>
        ))}
    </>
  );
}

function LoadingScreen({ attempt, max }: { attempt: number; max: number }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-5">
      <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
      <div className="text-center">
        <p className="text-gray-700 font-semibold">
          {attempt === 0
            ? "Đang kết nối server..."
            : "Server đang khởi động, vui lòng chờ..."}
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
              className={
                "w-2 h-2 rounded-full " +
                (i < attempt ? "bg-orange-500" : "bg-gray-200")
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

const BASE_URL = "https://db-datn-six.vercel.app";
const MAX_RETRY = 8;
const RETRY_DELAY = 8000;

export default function HotelDetailPage({ slug }: { slug: string }) {
  const [tour, setTour] = useState<TourAPI | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<"notfound" | "network" | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [activeImg, setActiveImg] = useState(0);
  const [openDay, setOpenDay] = useState<number | null>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function startFetch(n: number) {
    setAttempt(n);
    Promise.all([
      fetch(BASE_URL + "/api/tours").then((r) => {
        if (!r.ok) throw new Error("bad");
        return r.json();
      }),
      fetch(BASE_URL + "/api/tours/detail/" + slug).then((r) => {
        if (!r.ok) throw new Error("bad");
        return r.json();
      }),
    ])
      .then(([listRes, detailRes]) => {
        if (!listRes.success) throw new Error("bad");
        const found: TourAPI | null = Array.isArray(listRes.data)
          ? (listRes.data.find((t: TourAPI) => t.slug === slug) ?? null)
          : null;
        if (!found) {
          setError("notfound");
          setLoading(false);
          return;
        }
        const detailData = detailRes?.success ? detailRes.data : null;
        const itineraries = detailData?.itineraries ?? [];
        setTour({ ...found, itineraries });
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
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [slug]);

  if (loading) return <LoadingScreen attempt={attempt} max={MAX_RETRY} />;

  if (error === "network")
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4">📡</p>
          <p className="font-semibold text-lg text-gray-700 mb-1">
            Không thể kết nối server
          </p>
          <p className="text-sm text-gray-400">
            Đã thử {MAX_RETRY} lần không thành công
          </p>
          <button
            onClick={() => {
              setLoading(true);
              setError(null);
              startFetch(0);
            }}
            className="mt-4 px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-full border-none cursor-pointer transition-colors"
          >
            Thử lại
          </button>
          <a
            href="/tour"
            className="block mt-3 text-sm text-orange-500 underline"
          >
            ← Quay lại danh sách
          </a>
        </div>
      </div>
    );

  if (error === "notfound" || !tour)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-gray-400">
          <p className="text-5xl mb-4">😕</p>
          <p className="font-semibold text-lg">Không tìm thấy tour</p>
          <p className="text-xs mt-1">
            Slug:{" "}
            <code className="bg-gray-100 px-1 rounded text-gray-500">
              {slug}
            </code>
          </p>
          <a
            href="/tour"
            className="mt-3 inline-block text-sm text-orange-500 underline"
          >
            ← Quay lại danh sách
          </a>
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
  // Pad images với fake nếu thiếu
  const allImgs = [...images];
  while (allImgs.length < 7)
    allImgs.push({ image_url: FAKE_IMGS[allImgs.length % FAKE_IMGS.length] });

  const mainImgs = allImgs.slice(0, 3);
  const subImgs = allImgs.slice(3, 7);
  const thumbs = allImgs.slice(0, 10);

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <div className="bg-white">
        <div className="max-w-300 mx-auto px-4">
          <div className="flex justify-between items-start py-4 gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1">
                <h1 className="text-xl font-black text-gray-900 leading-snug">
                  {hotel.name}
                </h1>
                <StarRating count={hotel.rating} />
                {tour.category_id && (
                  <span className="text-[11px] bg-orange-100 text-orange-600 font-semibold px-2 py-0.5 rounded-full">
                    {tour.category_id.name}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-700 font-medium mb-0.5">
                {tour.name}
              </p>
              <div className="flex items-center gap-1">
                <span className="text-orange-500">📍</span>
                <span className="text-[13px] text-gray-500">
                  {hotel.address}, {hotel.city}
                </span>
              </div>
            </div>
            {/* <div className="hidden lg:flex items-center gap-4 flex-shrink-0">
              <div className="text-right">
                <p className="text-[11px] text-gray-400">Giá từ</p>
                <p className="text-2xl font-black text-orange-500">{formatVND(hotel.price_per_night)}<span className="text-xs font-normal text-gray-400">/đêm</span></p>
              </div>
              <div className="flex items-center gap-2">
                <span className={"text-xl font-black text-white " + scoreColor + " px-2 py-0.5 rounded-md"}>{score.toFixed(1)}</span>
                <span className="text-sm font-bold text-green-600">{label}</span>
              </div>
              <button className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-5 py-2 rounded-full transition-colors border-none cursor-pointer">Đặt ngay</button>
            </div>
            <div className="flex-shrink-0 lg:hidden text-right">
              <div className="flex items-center gap-1.5 justify-end mb-1">
                <span className={"text-sm font-black text-white " + scoreColor + " px-1.5 py-0.5 rounded"}>{score.toFixed(1)}</span>
                <span className="text-xs font-bold text-green-600">{label}</span>
              </div>
              <p className="text-lg font-black text-orange-500">{formatVND(hotel.price_per_night)}<span className="text-[10px] font-normal text-gray-400">/đêm</span></p>
            </div> */}
          </div>
        </div>

        {/* ── Desktop: ảnh trái + bản đồ/review phải ── */}
        {images.length > 0 && (
          <div className="hidden lg:block">
            <div className="max-w-300 mx-auto px-4 pb-4">
              {/* Badge combo */}
              {/* <div className="inline-flex items-center bg-[#1a1a2e] hover:bg-[#2d2d5e] text-white text-xs font-semibold px-3 py-1.5 rounded-md mb-2 cursor-pointer transition-colors">
                3N2Đ VMB + Đón tiền | 7.699 triệu/ khách
              </div> */}

              <div className="flex gap-3">
                {/* LEFT: ảnh */}
                <div className="flex-1 min-w-0">
                  {/* Hàng trên: 3 ảnh, cột đầu 2x */}
                  <div
                    className="grid gap-1 h-80"
                    style={{ gridTemplateColumns: "2fr 1fr 1fr" }}
                  >
                    {mainImgs.map((img, i) => (
                      <div
                        key={i}
                        onClick={() => setActiveImg(i)}
                        className="overflow-hidden rounded cursor-pointer group"
                      >
                        <img
                          src={img.image_url}
                          alt={hotel.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                  {/* Hàng dưới: sub images */}
                  {subImgs.length > 0 && (
                    <div
                      className="grid gap-1 mt-1 h-27.5"
                      style={{
                        gridTemplateColumns:
                          "repeat(" + subImgs.length + ", 1fr)",
                      }}
                    >
                      {subImgs.map((img, i) => (
                        <div
                          key={i}
                          onClick={() => setActiveImg(i + 3)}
                          className="relative overflow-hidden rounded cursor-pointer group"
                        >
                          <img
                            src={img.image_url}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {i === subImgs.length - 1 && images.length > 7 && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <span className="text-white text-sm font-bold">
                                +{images.length - 7} hình
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* RIGHT: Bản đồ + Review */}
                <div className="w-72.5 shrink-0 flex flex-col gap-2">
                  {/* Map */}
                  <div className="h-50 rounded-lg overflow-hidden border border-gray-200 relative">
                    <iframe
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      scrolling="no"
                      src={
                        "https://maps.google.com/maps?q=" +
                        encodeURIComponent(hotel.address + ", " + hotel.city) +
                        "&hl=vi&z=14&ie=UTF8&iwloc=&output=embed"
                      }
                    />
                    <a
                      href={
                        "https://maps.google.com/maps?q=" +
                        encodeURIComponent(hotel.address + ", " + hotel.city)
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="absolute top-2 right-2 bg-white text-xs text-blue-600 font-semibold px-2 py-1 rounded shadow no-underline hover:bg-blue-50 transition-colors"
                    >
                      Xem bản đồ lớn hơn
                    </a>
                  </div>

                  {/* Review card */}
                  <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden bg-white flex flex-col">
                    <div className="flex items-center gap-2.5 px-3 py-2.5">
                      <span
                        className={
                          "text-xl font-black text-white " +
                          scoreColor +
                          " px-2 py-0.5 rounded-md leading-tight"
                        }
                      >
                        {score.toFixed(1)}
                      </span>
                      <span className="text-sm font-bold text-green-600">
                        {label}
                      </span>
                      <span className="text-xs text-gray-400 ml-auto">
                        575 đánh giá
                      </span>
                    </div>
                    <div className="h-px bg-gray-100" />
                    <div className="flex-1 p-3 flex flex-col justify-between">
                      <p className="text-xs text-gray-600 leading-relaxed line-clamp-5">
                        Dịch vụ tại {hotel.name} thì mình thấy rất ok, chuyến đi
                        mọi thứ rất tốt. Hướng dẫn viên nhiệt tình, chu đáo
                        trong suốt hành trình.
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-orange-50 flex items-center justify-center text-[10px] font-bold text-orange-500 shrink-0">
                            TD
                          </div>
                          <span className="text-xs font-semibold text-gray-700">
                            Chu Kha
                          </span>
                        </div>
                        <span className="text-[11px] text-gray-400">
                          28-2-2026
                        </span>
                      </div>
                    </div>
                    <div className="h-px bg-gray-100" />
                    <button className="py-2 text-xs font-semibold text-orange-500 hover:bg-orange-50 transition-colors w-full bg-transparent border-none cursor-pointer">
                      Xem tất cả đánh giá
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Mobile carousel ── */}
        {images.length > 0 && (
          <div className="lg:hidden">
            <div className="relative overflow-hidden">
              <div
                className="flex transition-transform duration-300"
                style={{
                  transform: "translate3d(-" + activeImg * 100 + "vw,0,0)",
                }}
              >
                {images.map((img, i) => (
                  <div
                    key={i}
                    className="relative shrink-0 h-65"
                    style={{ minWidth: "100vw" }}
                  >
                    <img
                      src={img.image_url}
                      alt={hotel.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <button
                className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 rounded-full flex items-center justify-center text-white text-2xl border-none cursor-pointer"
                onClick={() => setActiveImg((p) => Math.max(0, p - 1))}
              >
                ‹
              </button>
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 rounded-full flex items-center justify-center text-white text-2xl border-none cursor-pointer"
                onClick={() =>
                  setActiveImg((p) => Math.min(images.length - 1, p + 1))
                }
              >
                ›
              </button>
              <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
                {activeImg + 1}/{images.length}
              </div>
            </div>
            {thumbs.length > 1 && (
              <div className="bg-white px-4 py-2 flex gap-1 overflow-x-auto">
                {thumbs.map((img, i) => (
                  <div
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={
                      "shrink-0 rounded cursor-pointer border-2 overflow-hidden transition-colors " +
                      (activeImg === i
                        ? "border-orange-500"
                        : "border-transparent")
                    }
                    style={{ width: 64, height: 48 }}
                  >
                    <img
                      src={img.image_url}
                      alt=""
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-white mt-2">
        <div className="max-w-300 mx-auto px-4 py-5 flex flex-col lg:flex-row gap-8">
          <div className="flex-1 min-w-0 flex flex-col gap-4">
            <h2 className="text-base font-extrabold text-gray-900">
              {tour.name}
            </h2>
            {tour.descriptions.map((d, i) => (
              <div key={i}>
                <p className="text-[13px] font-semibold text-gray-700 mb-1">
                  {d.title}
                </p>
                <ContentLines text={d.content} />
              </div>
            ))}
          </div>
          <div className="w-full lg:w-70 shrink-0">
            <div className="border border-gray-200 rounded-xl overflow-hidden sticky top-20">
              <div className="p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Hạng sao</span>
                  <StarRating count={hotel.rating} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Đánh giá</span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={
                        "text-xs font-black text-white " +
                        scoreColor +
                        " px-1.5 py-0.5 rounded"
                      }
                    >
                      {score.toFixed(1)}
                    </span>
                    <span className="text-xs font-semibold text-green-600">
                      {label}
                    </span>
                  </div>
                </div>
                <div className="h-px bg-gray-100" />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Giá từ</span>
                  <span className="text-xl font-black text-orange-500">
                    {formatVND(hotel.price_per_night)}
                    <span className="text-xs font-normal text-gray-400">
                      /đêm
                    </span>
                  </span>
                </div>
                <div className="text-[11px] text-gray-400">
                  {hotel.address}, {hotel.city}
                </div>
              </div>
              <div className="border-t border-gray-100 bg-gray-50 p-4 flex flex-col gap-2">
                <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg text-sm transition-colors border-none cursor-pointer">
                  Yêu cầu đặt
                </button>
                <p className="text-center text-xs text-gray-400">
                  Cần hỗ trợ? Gọi ngay
                </p>
                <a
                  href="tel:123456"
                  className="flex items-center justify-center gap-1 no-underline"
                >
                  <span>📞</span>
                  <span className="font-bold text-orange-500 text-sm">
                    123456
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {tour.itineraries?.length > 0 && (
        <div className="bg-white mt-2">
          <div className="max-w-300 mx-auto px-4 py-5">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="text-xl">🗓️</span>
              <span className="text-base font-extrabold text-gray-900">
                Lịch trình chi tiết
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {tour.itineraries.map((day, i) => (
                <div
                  key={i}
                  className="border border-gray-100 rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => setOpenDay(openDay === i ? null : i)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-orange-50 transition-colors border-none cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="bg-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap">
                        Ngày {day.day_number}
                      </span>
                      <span className="text-sm font-semibold text-gray-800">
                        {day.title}
                      </span>
                    </div>
                    <span
                      className={
                        "text-gray-400 text-xl transition-transform duration-200 " +
                        (openDay === i ? "rotate-90" : "")
                      }
                    >
                      ›
                    </span>
                  </button>
                  {openDay === i && day.details?.length > 0 && (
                    <div className="px-4 py-4 flex flex-col gap-4 border-t border-gray-50">
                      {day.details.map((detail, j) => {
                        const place = detail.place_id;
                        if (!place) return null;
                        return (
                          <div key={j} className="flex gap-3">
                            <div className="flex flex-col items-center shrink-0">
                              <div className="w-2.5 h-2.5 rounded-full bg-orange-400 mt-1" />
                              {j < day.details.length - 1 && (
                                <div className="w-px flex-1 bg-orange-100 mt-1" />
                              )}
                            </div>
                            <div className="flex-1 pb-2">
                              <p className="text-sm font-semibold text-gray-800 mb-1">
                                {place.title}
                              </p>
                              {place.content && (
                                <p className="text-[13px] text-gray-500 leading-relaxed">
                                  {place.content}
                                </p>
                              )}
                              {place.images && place.images.length > 0 && (
                                <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                                  {place.images.slice(0, 4).map((img, k) => (
                                    <img
                                      key={k}
                                      src={img.image_url}
                                      alt={place.title}
                                      className="h-24 w-36 object-cover rounded-lg shrink-0"
                                      loading="lazy"
                                    />
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

      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 flex items-center justify-between z-40">
        <div>
          <p className="text-[11px] text-gray-400">Giá từ</p>
          <p className="text-lg font-black text-orange-500">
            {formatVND(hotel.price_per_night)}
            <span className="text-[10px] font-normal text-gray-400">/đêm</span>
          </p>
        </div>
        <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-full text-sm border-none cursor-pointer transition-colors">
          Đặt ngay
        </button>
      </div>
      <div className="lg:hidden h-16" />
    </div>
  );
}
