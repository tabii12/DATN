"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import HeroBanner from "../HeroBanner";

// ─────────────────────── TYPES ───────────────────────

interface BannerSlide {
  id: number;
  image: string;
}

interface ComboDeal {
  id: number;
  name: string;
  location: string;
  slug: string;
  image: string;
  price: string;
  stars: number;
  tag: "Hot" | "Sale" | "Combo" | null;
  nights: number;
  discount_percent: number;
  amenities: string[];
}

interface TravelStyle {
  id: number;
  title: string;
  subtitle: string;
  count: string;
  href: string;
  image: string;
  color: string;
}

interface Destination {
  id: number;
  name: string;
  slug: string;
  hotel_count: number;
  image: string;
}

// ─────────────────────── FETCH HOOK ───────────────────────

function useHomeData() {
  const [banners, setBanners] = useState<BannerSlide[]>([]);
  const [combos, setCombos] = useState<ComboDeal[]>([]);
  const [styles, setStyles] = useState<TravelStyle[]>([]);
  const [domestic, setDomestic] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchHome() {
      setLoading(true);
      try {
        const res = await fetch("https://db-pickyourway.vercel.app/api/home");
        const json = await res.json();
        if (!json.success) return;
        const data = json.data;

        setBanners(
          data.banners.map((b: any, i: number) => ({
            id: i + 1,
            image: b.image_url,
          })),
        );
        setCombos(
          data.combos.map((c: any, i: number) => ({
            id: i + 1,
            name: c.slug.replaceAll("-", " ").toUpperCase(),
            location: c.location,
            slug: c.slug,
            image: c.image_url,
            price: c.price.toLocaleString("vi-VN"),
            stars: 5,
            tag: c.tag,
            nights: 2,
            discount_percent: c.discount_percent,
            amenities: c.amenities ?? [],
          })),
        );
        setStyles(
          data.styles.map((s: any, i: number) => ({
            id: i + 1,
            title: s.title,
            subtitle: s.subtitle,
            count: s.count,
            href: s.href,
            image: s.image_url,
            color: s.color,
          })),
        );
        const mapped = data.destinations.map((d: any, i: number) => ({
          id: i + 1,
          name: d.name,
          slug: d.slug,
          hotel_count: d.hotel_count,
          image: d.image_url,
        }));
        setDomestic([...mapped].sort(() => 0.5 - Math.random()).slice(0, 5));
      } catch (err) {
        console.error("Fetch home failed:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchHome();
  }, []);

  return { banners, combos, styles, domestic, loading };
}

// ─────────────────────── HELPERS ───────────────────────

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
  const { banners, combos, styles, domestic } = useHomeData();
  const [slideIdx, setSlideIdx] = useState(0);
  const router = useRouter();

  // Auto-advance combo slider
  useEffect(() => {
    if (!combos.length) return;
    const t = setInterval(
      () => setSlideIdx((p) => (p + 1) % combos.length),
      3000,
    );
    return () => clearInterval(t);
  }, [combos.length]);

  const handleRandomTourByCity = async (cityName?: string) => {
    if (!cityName) return;
    try {
      const res = await fetch("https://db-pickyourway.vercel.app/api/tours");
      const json = await res.json();
      if (!json.success) return;

      const removeTones = (str: string) =>
        str
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/đ/g, "d")
          .replace(/Đ/g, "D")
          .toLowerCase()
          .replace(/\s+/g, "");

      const tours = json.data.filter(
        (t: any) =>
          removeTones(t.hotel_id?.city ?? "") === removeTones(cityName),
      );
      if (!tours.length) return;
      router.push(
        `/tours/${tours[Math.floor(Math.random() * tours.length)].slug}`,
      );
    } catch (err) {
      console.error("Random tour error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] font-sans text-gray-800">
      {/* ══════════ HERO BANNER ══════════ */}
      <HeroBanner
        images={banners.map((b) => b.image)}
        title="Trải nghiệm kỳ nghỉ tuyệt vời"
        subtitle="Combo khách sạn · vé máy bay · giá tốt nhất"
      />

      {/* ══════════ COMBO TỐT NHẤT ══════════ */}
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
              href="/tours/search?sale=1"
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
                  setSlideIdx((p) => Math.min(combos.length - 1, p + 1))
                }
                disabled={slideIdx === combos.length - 1}
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

        <div className="relative overflow-hidden rounded-2xl shadow-md cursor-pointer group">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${slideIdx * 100}%)` }}
          >
            {combos.map((deal) => (
              <a
                key={deal.id}
                href="/tours/search?sale=1"
                className="relative w-full shrink-0 h-56 md:h-72 block"
              >
                <img
                  src={deal.image}
                  alt={deal.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-l from-black/80 via-black/40 to-transparent" />
                <div className="absolute inset-0 flex flex-col items-end justify-center pr-8 md:pr-14 text-right gap-1">
                  {deal.discount_percent > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-1">
                      Combo tiết kiệm đến {deal.discount_percent}%
                    </span>
                  )}
                  <p className="text-white/70 text-xs tracking-[0.2em] uppercase">
                    Combo {deal.nights}N{deal.nights - 1}Đ
                  </p>
                  <h3 className="text-white font-black text-2xl md:text-3xl leading-tight uppercase tracking-wide drop-shadow">
                    {deal.name}
                  </h3>
                  <p className="text-white/80 text-sm mt-0.5">
                    {deal.amenities.join(" · ")}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-orange-400 font-black text-2xl md:text-3xl">
                      {deal.price}đ/khách
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        <div className="flex justify-center gap-1.5 mt-3">
          {combos.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlideIdx(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === slideIdx ? "w-6 bg-orange-500" : "w-1.5 bg-gray-300"}`}
            />
          ))}
        </div>
      </section>

      {/* ══════════ PHONG CÁCH DU LỊCH ══════════ */}
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
          {styles.map((style) => (
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

              {/* 1. LỚP PHỦ ĐEN NHẸ Ở DƯỚI: Đảm bảo phủ từ đáy lên */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-100" />

              {/* 2. NỘI DUNG: Cố định bằng bottom-0 và left-0 */}
              <div className="absolute bottom-0 left-0 w-full p-4 z-10">
                <h3 className="text-white font-bold text-base leading-tight">
                  {style.title}
                </h3>
                <p className="text-white/90 text-xs mt-1 line-clamp-2">
                  {style.subtitle}
                </p>
                {style.count && (
                  <span className="inline-block mt-2 bg-white/20 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full">
                    {style.count}
                  </span>
                )}
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ══════════ ĐIỂM ĐẾN TRONG NƯỚC ══════════ */}
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
            href="/tours/search"
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

        <div
          className="grid gap-2"
          style={{
            gridTemplateColumns: "843fr 353fr",
            gridTemplateRows: "352px 352px 704px",
          }}
        >
          <a
            onClick={() =>
              domestic[3] && handleRandomTourByCity(domestic[3].name)
            }
            className="relative rounded-2xl overflow-hidden group cursor-pointer shadow-sm"
          >
            <img
              src={domestic[3]?.image}
              alt={domestic[3]?.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-4">
              <p className="text-white font-bold text-lg">
                {domestic[3]?.name}
              </p>
            </div>
          </a>

          <a
            onClick={() =>
              domestic[2] && handleRandomTourByCity(domestic[2].name)
            }
            className="row-span-2 relative rounded-2xl overflow-hidden group cursor-pointer shadow-sm"
          >
            <img
              src={domestic[2]?.image}
              alt={domestic[2]?.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-4">
              <p className="text-white font-bold text-lg">
                {domestic[2]?.name}
              </p>
            </div>
          </a>

          <a
            onClick={() =>
              domestic[1] && handleRandomTourByCity(domestic[1].name)
            }
            className="relative rounded-2xl overflow-hidden group cursor-pointer shadow-sm"
          >
            <img
              src={domestic[1]?.image}
              alt={domestic[1]?.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-4">
              <p className="text-white font-bold text-lg">
                {domestic[1]?.name}
              </p>
            </div>
          </a>

          <div className="col-span-2 grid grid-cols-2 gap-2">
            <a
              onClick={() =>
                domestic[4] && handleRandomTourByCity(domestic[4].name)
              }
              className="relative rounded-2xl overflow-hidden group cursor-pointer shadow-sm"
            >
              <img
                src={domestic[4]?.image}
                alt={domestic[4]?.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-4">
                <p className="text-white font-bold text-lg">
                  {domestic[4]?.name}
                </p>
              </div>
            </a>
            <a
              onClick={() =>
                domestic[0] && handleRandomTourByCity(domestic[0].name)
              }
              className="relative rounded-2xl overflow-hidden group cursor-pointer shadow-sm"
            >
              <img
                src={domestic[0]?.image}
                alt={domestic[0]?.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-4">
                <p className="text-white font-bold text-lg">
                  {domestic[0]?.name}
                </p>
              </div>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
