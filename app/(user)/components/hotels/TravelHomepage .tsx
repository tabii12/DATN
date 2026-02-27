"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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

// ─────────────────────── FALLBACK DATA ───────────────────────
// Dùng khi API chưa có / lỗi


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
        const res = await fetch("https://db-datn-six.vercel.app/api/home");
        const json = await res.json();

        if (!json.success) return;

        const data = json.data;

        // MAP BANNERS
        setBanners(
          data.banners.map((b: any, i: number) => ({
            id: i + 1,
            image: b.image_url,
          }))
        );

        // MAP COMBOS
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
          }))
        );

        // MAP STYLES
        setStyles(
          data.styles.map((s: any, i: number) => ({
            id: i + 1,
            title: s.title,
            subtitle: s.subtitle,
            count: s.count,
            href: s.href,
            image: s.image_url,
            color: s.color,
          }))
        );

        // MAP DESTINATIONS
        const mapped = data.destinations.map((d: any, i: number) => ({
          id: i + 1,
          name: d.name,
          slug: d.slug,
          hotel_count: d.hotel_count,
          image: d.image_url,
        }));

        // random 5 cái
        const shuffled = [...mapped].sort(() => 0.5 - Math.random());

        setDomestic(shuffled.slice(0, 5));

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

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} className="w-3 h-3 fill-amber-400" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function TagBadge({ tag }: { tag: string }) {
  const colors: Record<string, string> = {
    Hot: "bg-red-500", Sale: "bg-orange-500", Combo: "bg-blue-500",
  };
  return (
    <span className={`${colors[tag] ?? "bg-gray-500"} text-white text-[10px] font-bold px-2 py-0.5 rounded-full`}>
      {tag}
    </span>
  );
}

// ─────────────────────── MAIN ───────────────────────

export default function HomePage() {
  const { banners, combos, styles, domestic } = useHomeData();

  const [bannerIdx, setBannerIdx] = useState(0);
  const [slideIdx, setSlideIdx] = useState(0);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [destination, setDestination] = useState("");

  const router = useRouter();
  function handleSearch() {
    const q = destination.trim();
    router.push(q ? `/tours?q=${encodeURIComponent(q)}` : "/tours");
  }
  const handleRandomTourByCity = async (cityName?: string) => {
    if (!cityName) return;

    try {
      const res = await fetch("https://db-datn-six.vercel.app/api/tours");
      const json = await res.json();

      if (!json.success) return;

      const tours = json.data;

      const removeVietnameseTones = (str: string) => {
        return str
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/đ/g, "d")
          .replace(/Đ/g, "D")
          .toLowerCase()
          .replace(/\s+/g, "");
      };

      const normalizedCity = removeVietnameseTones(cityName);

      const toursByCity = tours.filter((tour: any) => {
        const city = tour.hotel_id?.city || "";
        return removeVietnameseTones(city) === normalizedCity;
      });

      if (!toursByCity.length) {
        console.log("Không có tour tỉnh này:", cityName);
        return;
      }

      const randomTour =
        toursByCity[Math.floor(Math.random() * toursByCity.length)];

      router.push(`/tours/${randomTour.slug}`);

    } catch (error) {
      console.error("Random tour error:", error);
    }
  };
  // Auto-advance banner
  useEffect(() => {
    if (!banners.length) return;
    const t = setInterval(() => setBannerIdx(p => (p + 1) % banners.length), 4000);
    return () => clearInterval(t);
  }, [banners.length]);

  // Auto-advance combo slider
  useEffect(() => {
    if (!combos.length) return;
    const t = setInterval(() => setSlideIdx(p => (p + 1) % combos.length), 3000);
    return () => clearInterval(t);
  }, [combos.length]);

  return (
    <div className="min-h-screen bg-[#f5f5f5] font-sans text-gray-800">

      {/* ══════════ HERO BANNER + SEARCH ══════════ */}
      <section className="relative h-[520px] md:h-[620px] overflow-hidden">
        {banners.map((slide, i) => (
          <img key={slide.id} src={slide.image} alt="banner"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${i === bannerIdx ? "opacity-100" : "opacity-0"}`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/65" />

        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 gap-5">
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
              <div className="p-4 flex flex-col gap-3">
                <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 focus-within:border-orange-400 transition-colors">
                  <svg className="w-5 h-5 text-orange-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                  <input className="flex-1 text-sm outline-none placeholder-gray-400 bg-transparent" placeholder="Bạn muốn đi đâu?" value={destination} onChange={e => setDestination(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSearch()} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-orange-400 transition-colors">
                    <svg className="w-4 h-4 text-orange-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <div className="flex-1">
                      <p className="text-[10px] text-gray-400 leading-none">Nhận phòng</p>
                      <input type="date" className="text-sm font-medium outline-none bg-transparent w-full" value={checkIn} onChange={e => setCheckIn(e.target.value)} />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-orange-400 transition-colors">
                    <svg className="w-4 h-4 text-orange-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <div className="flex-1">
                      <p className="text-[10px] text-gray-400 leading-none">Trả phòng</p>
                      <input type="date" className="text-sm font-medium outline-none bg-transparent w-full" value={checkOut} onChange={e => setCheckOut(e.target.value)} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5">
                    <svg className="w-4 h-4 text-orange-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    <p className="text-xs text-gray-600 truncate">2 người lớn, 1 phòng</p>
                  </div>
                  <button onClick={handleSearch} className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    Tìm kiếm
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {banners.map((_, i) => (
              <button key={i} onClick={() => setBannerIdx(i)} className={`h-1.5 rounded-full transition-all ${i === bannerIdx ? "w-6 bg-white" : "w-1.5 bg-white/50"}`} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ COMBO TỐT NHẤT ══════════ */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Combo tốt nhất hôm nay</h2>
            <p className="text-sm text-gray-500 mt-0.5">Nhanh tay đặt ngay. Để mai sẽ lỡ</p>
          </div>
          <div className="flex items-center gap-3">
            <a href="/combo" className="text-sm font-semibold text-orange-500 flex items-center gap-1 hover:underline">
              Xem tất cả
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
            </a>
            <div className="flex gap-2">
              <button onClick={() => setSlideIdx(p => Math.max(0, p - 1))} disabled={slideIdx === 0} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-orange-400 hover:text-orange-500 disabled:opacity-30 transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button onClick={() => setSlideIdx(p => Math.min(combos.length - 1, p + 1))} disabled={slideIdx === combos.length - 1} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-orange-400 hover:text-orange-500 disabled:opacity-30 transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl shadow-md cursor-pointer group">
          <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${slideIdx * 100}%)` }}>
            {combos.map(deal => (
              <a key={deal.id} href={`/khach-san/${deal.slug}`} className="relative w-full shrink-0 h-56 md:h-72 block">
                <img src={deal.image} alt={deal.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-l from-black/80 via-black/40 to-transparent" />
                <div className="absolute inset-0 flex flex-col items-end justify-center pr-8 md:pr-14 text-right gap-1">
                  {deal.discount_percent > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-1">
                      Combo tiết kiệm đến {deal.discount_percent}%
                    </span>
                  )}
                  <p className="text-white/70 text-xs tracking-[0.2em] uppercase">Combo {deal.nights}N{deal.nights - 1}Đ</p>
                  <h3 className="text-white font-black text-2xl md:text-3xl leading-tight uppercase tracking-wide drop-shadow">{deal.name}</h3>
                  <p className="text-white/80 text-sm mt-0.5">{deal.amenities.join(" · ")}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-orange-400 font-black text-2xl md:text-3xl">{deal.price}đ/khách</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        <div className="flex justify-center gap-1.5 mt-3">
          {combos.map((_, i) => (
            <button key={i} onClick={() => setSlideIdx(i)} className={`h-1.5 rounded-full transition-all duration-300 ${i === slideIdx ? "w-6 bg-orange-500" : "w-1.5 bg-gray-300"}`} />
          ))}
        </div>
      </section>

      {/* ══════════ PHONG CÁCH DU LỊCH ══════════ */}
      <section className="max-w-7xl mx-auto px-4 py-4 pb-10">
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Phong cách du lịch</h2>
            <p className="text-sm text-gray-500 mt-0.5">Đặc quyền chọn lọc, dịch vụ tận tâm cho kỳ nghỉ nhẹ nhàng tinh tế.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {styles.map(style => (
            <a key={style.id} href={style.href} className="group relative rounded-2xl overflow-hidden h-48 block cursor-pointer shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
              <img src={style.image} alt={style.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className={`absolute inset-0 bg-gradient-to-t ${style.color} to-transparent`} />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-bold text-base leading-tight">{style.title}</h3>
                <p className="text-white/80 text-xs mt-0.5 line-clamp-2">{style.subtitle}</p>
                {style.count && (
                  <span className="inline-block mt-1.5 bg-white/20 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full">{style.count}</span>
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
            <h2 className="text-xl font-bold text-gray-900">Điểm đến yêu thích trong nước</h2>
            <p className="text-sm text-gray-500 mt-0.5">Lên rừng xuống biển. Trọn vẹn Việt Nam</p>
          </div>
          <a href="/khach-san" className="text-sm font-semibold text-orange-500 flex items-center gap-1 hover:underline">
            Xem tất cả
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
          </a>
        </div>

        <div className="grid gap-2" style={{ gridTemplateColumns: "843fr 353fr", gridTemplateRows: "352px 352px 704px" }}>

          {/* [3] Quy Nhơn — hàng 1 trái */}
          <a onClick={() => domestic[3] && handleRandomTourByCity(domestic[3].name)} className="relative rounded-2xl overflow-hidden group cursor-pointer shadow-sm">
            <img src={domestic[3]?.image} alt={domestic[3]?.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-4">
              <p className="text-white font-bold text-lg">{domestic[3]?.name}</p>
              <p className="text-white/70 text-xs">{domestic[3]?.hotel_count} khách sạn</p>
            </div>
          </a>

          {/* [2] Đà Lạt — phải row-span-2 */}
          <a onClick={() => domestic[2] && handleRandomTourByCity(domestic[2].name)} className="row-span-2 relative rounded-2xl overflow-hidden group cursor-pointer shadow-sm">
            <img src={domestic[2]?.image} alt={domestic[2]?.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-4">
              <p className="text-white font-bold text-lg">{domestic[2]?.name}</p>
              <p className="text-white/70 text-xs">{domestic[2]?.hotel_count} khách sạn</p>
            </div>
          </a>

          {/* [1] Vũng Tàu — hàng 2 trái */}
          <a onClick={() => domestic[1] && handleRandomTourByCity(domestic[1].name)} className="relative rounded-2xl overflow-hidden group cursor-pointer shadow-sm">
            <img src={domestic[1]?.image} alt={domestic[1]?.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-4">
              <p className="text-white font-bold text-lg">{domestic[1]?.name}</p>
              <p className="text-white/70 text-xs">{domestic[1]?.hotel_count} khách sạn</p>
            </div>
          </a>

          {/* [4]+[5] Nha Trang + Cần Thơ — hàng 3 full */}
          <div className="col-span-2 grid grid-cols-2 gap-2">
            <a onClick={() => domestic[4] && handleRandomTourByCity(domestic[4].name)} className="relative rounded-2xl overflow-hidden group cursor-pointer shadow-sm">
              <img src={domestic[4]?.image} alt={domestic[4]?.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-4">
                <p className="text-white font-bold text-lg">{domestic[4]?.name}</p>
                <p className="text-white/70 text-xs">{domestic[4]?.hotel_count} khách sạn</p>
              </div>
            </a>
            <a onClick={() => domestic[0] && handleRandomTourByCity(domestic[0].name)} className="relative rounded-2xl overflow-hidden group cursor-pointer shadow-sm">
              <img src={domestic[0]?.image} alt={domestic[0]?.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-4">
                <p className="text-white font-bold text-lg">{domestic[0]?.name}</p>
                <p className="text-white/70 text-xs">{domestic[0]?.hotel_count} khách sạn</p>
              </div>
            </a>
          </div>

        </div>
      </section>

    </div>
  );
}