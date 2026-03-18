"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

const API = "https://db-datn-six.vercel.app/api";

type Hotel = { _id: string; name: string };
type Category = { _id: string; name: string };
type TourDescription = { _id: string; title: string; content: string };
type ItineraryDetail = {
  _id: string;
  type: string;
  title: string;
  content: string;
  order: number;
  place_id: {
    _id: string;
    title: string;
    content: string;
    images?: { image_url: string }[];
  } | null;
};
type Itinerary = {
  _id: string;
  day_number: number;
  title: string;
  meal_note: string;
  details: ItineraryDetail[];
};
type TourImage = {
  _id: string;
  tour_id: string;
  image_url: string;
  public_id: string;
};
type Tour = {
  _id: string;
  name: string;
  slug: string;
  status: string;
  hotel_id?: Hotel;
  category_id?: Category;
  images: TourImage[];
  descriptions: TourDescription[];
  itineraries: Itinerary[];
};

const TYPE_META: Record<
  string,
  { icon: string; label: string; color: string }
> = {
  move: { icon: "🚌", label: "Di chuyển", color: "bg-blue-50 text-blue-600" },
  rest: {
    icon: "🏨",
    label: "Nghỉ ngơi",
    color: "bg-purple-50 text-purple-600",
  },
  eat: { icon: "🍜", label: "Ăn uống", color: "bg-amber-50 text-amber-600" },
  visit: {
    icon: "📍",
    label: "Tham quan",
    color: "bg-orange-50 text-orange-600",
  },
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
      {children}
    </p>
  );
}

export default function EditTourPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string | undefined;

  const [tour, setTour] = useState<Tour | null>(null);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tab, setTab] = useState("info");
  const [savingInfo, setSavingInfo] = useState(false);

  const [descTitle, setDescTitle] = useState("");
  const [descContent, setDescContent] = useState("");

  const [editingDay, setEditingDay] = useState<string | null>(null);
  const [editingDayTitle, setEditingDayTitle] = useState("");
  const [editingDayMeal, setEditingDayMeal] = useState("");

  const [editingDetail, setEditingDetail] = useState<string | null>(null);
  const [editDetailTitle, setEditDetailTitle] = useState("");
  const [editDetailContent, setEditDetailContent] = useState("");
  const [editDetailType, setEditDetailType] = useState("visit");

  const fetchTour = async () => {
    if (!slug) return;
    const res = await fetch(`${API}/tours/detail/${slug}`);
    const data = await res.json();
    setTour(data.data);
  };

  useEffect(() => {
    if (!slug) return;
    fetchTour();
    fetch(`${API}/hotels`)
      .then((r) => r.json())
      .then((d) => setHotels(d.data || []));
    fetch(`${API}/categories`)
      .then((r) => r.json())
      .then((d) => setCategories(d.data || []));
  }, [slug]);

  if (!slug || !tour)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-semibold">Đang tải tour...</p>
        </div>
      </div>
    );

  const updateInfo = async () => {
    setSavingInfo(true);
    await fetch(`${API}/tours/update/${slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: tour.name,
        status: tour.status,
        hotel_id: tour.hotel_id?._id,
        category_id: tour.category_id?._id,
      }),
    });
    setSavingInfo(false);
    fetchTour();
  };

  const uploadImage = async (file: File) => {
    const fd = new FormData();
    fd.append("images", file);

    try {
      console.log("🚀 uploading...", file);

      const res = await fetch(`${API}/tours/upload-images/${slug}`, {
        method: "POST",
        body: fd,
      });

      const data = await res.json();

      console.log("📦 response:", data);

      if (!res.ok) {
        alert("Upload lỗi 😭");
        return;
      }

      await fetchTour();
    } catch (err) {
      console.error("❌ upload error:", err);
    }
  };

  const deleteImage = async (imageId: string) => {
    if (!confirm("Xoá ảnh này?")) return;
    await fetch(`${API}/tours/image/${imageId}`, { method: "DELETE" });
    fetchTour();
  };

  const addDescription = async () => {
    if (!descTitle || !descContent) return;

    const res = await fetch(`${API}/descriptions/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: descTitle,
        content: descContent,
        tour_id: tour._id,
      }),
    });

    const data = await res.json();
    console.log(data);

    setDescTitle("");
    setDescContent("");

    await fetchTour();
  };

  const deleteDescription = async (id: string) => {
    await fetch(`${API}/descriptions/${id}`, {
      method: "DELETE",
    });

    await fetchTour();
  };

  const addDay = async () => {
    const nextDay = tour.itineraries.length + 1;
    
    await fetch(`${API}/itineraries/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tour_id: tour._id,
        day_number: nextDay,
        title: `Ngày ${nextDay}`,
        meal_note: "",
      }),
    });

    await fetchTour();
  };

  const updateDay = async (id: string) => {
    await fetch(`${API}/itineraries/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editingDayTitle,
        meal_note: editingDayMeal,
      }),
    });
    setEditingDay(null);
    await fetchTour();
  };

  const deleteDay = async (id: string) => {
    if (!confirm("Xoá ngày này và tất cả hoạt động?")) return;
    await fetch(`${API}/itineraries/${id}`, { method: "DELETE" });
    await fetchTour();
  };

  const addDetail = async (itineraryId: string) => {
    await fetch(`${API}/itinerary-details/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        itinerary_id: itineraryId, // 🔥 QUAN TRỌNG
        type: "visit",
        title: "Hoạt động mới",
        content: "",
        order: 99,
      }),
    });

    await fetchTour();
  };

  const updateDetail = async (id: string) => {
    await fetch(`${API}/itinerary-details/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editDetailTitle,
        content: editDetailContent,
        type: editDetailType,
      }),
    });
    setEditingDetail(null);
    await fetchTour();
  };

  const deleteDetail = async (id: string) => {
    if (!confirm("Xoá hoạt động này?")) return;
    await fetch(`${API}/itinerary-details/${id}`, {
      method: "DELETE",
    });
    await fetchTour();
  };

  const TABS = [
    { key: "info", icon: "📋", label: "Thông tin" },
    { key: "images", icon: "🖼️", label: `Ảnh (${tour.images.length})` },
    {
      key: "descriptions",
      icon: "📝",
      label: `Mô tả (${tour.descriptions.length})`,
    },
    {
      key: "itineraries",
      icon: "🗓️",
      label: `Lịch trình (${tour.itineraries.length}N)`,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3 sticky top-0 z-20">
        <button
          onClick={() => router.push("/admin/tours")}
          className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 bg-white cursor-pointer transition-colors text-lg"
        >
          ‹
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-black text-gray-900 truncate">
            ✏️ {tour.name}
          </h1>
          <p className="text-[11px] text-gray-400 font-mono">{tour.slug}</p>
        </div>
        <a
          href={`/tours/${tour.slug}`}
          target="_blank"
          className="text-xs font-semibold text-blue-500 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl no-underline transition-colors"
        >
          Xem trang →
        </a>
      </div>

      <div className="max-w--full mx-auto px-4 py-6 space-y-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-1.5 flex gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all border-none cursor-pointer flex-1 justify-center ${
                tab === t.key
                  ? "bg-orange-500 text-white shadow-sm"
                  : "text-gray-500 bg-transparent hover:bg-gray-50"
              }`}
            >
              <span>{t.icon}</span>
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {/* INFO */}
        {tab === "info" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <SectionTitle>Thông tin tour</SectionTitle>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                    Tên tour
                  </label>
                  <input
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                    value={tour.name}
                    onChange={(e) => setTour({ ...tour, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                    Slug
                  </label>
                  <div className="flex items-center border border-gray-100 rounded-xl bg-gray-50 px-4 py-3">
                    <span className="text-gray-300 text-sm">/tours/</span>
                    <span className="text-sm text-gray-400 font-mono ml-1">
                      {tour.slug}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <SectionTitle>Liên kết</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                    Khách sạn
                  </label>
                  <select
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-400 bg-white cursor-pointer"
                    value={tour.hotel_id?._id || ""}
                    onChange={(e) =>
                      setTour({
                        ...tour,
                        hotel_id: hotels.find((h) => h._id === e.target.value),
                      })
                    }
                  >
                    <option value="">-- Chọn --</option>
                    {hotels.map((h) => (
                      <option key={h._id} value={h._id}>
                        {h.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                    Danh mục
                  </label>
                  <select
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-400 bg-white cursor-pointer"
                    value={tour.category_id?._id || ""}
                    onChange={(e) =>
                      setTour({
                        ...tour,
                        category_id: categories.find(
                          (c) => c._id === e.target.value,
                        ),
                      })
                    }
                  >
                    <option value="">-- Chọn --</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <SectionTitle>Trạng thái</SectionTitle>
              <div className="grid grid-cols-2 gap-3">
                {(
                  [
                    ["active", "✅", "Hoạt động", "Hiển thị công khai"],
                    ["inactive", "🚫", "Tạm ẩn", "Không hiển thị"],
                  ] as const
                ).map(([v, icon, l, sub]) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setTour({ ...tour, status: v })}
                    className={`p-4 rounded-xl border-2 text-left cursor-pointer transition-all ${
                      tour.status === v
                        ? "border-orange-400 bg-orange-50"
                        : "border-gray-100 bg-gray-50 hover:border-gray-200"
                    }`}
                  >
                    <span className="text-2xl">{icon}</span>
                    <p
                      className={`text-sm font-bold mt-1.5 ${tour.status === v ? "text-orange-700" : "text-gray-700"}`}
                    >
                      {l}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={updateInfo}
              disabled={savingInfo}
              className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl text-sm font-bold border-none cursor-pointer transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {savingInfo ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang lưu...
                </>
              ) : (
                "💾 Lưu thay đổi"
              )}
            </button>
          </div>
        )}

        {/* IMAGES */}
        {tab === "images" && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <SectionTitle>Hình ảnh tour</SectionTitle>
              <label className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer transition-colors">
                + Thêm ảnh
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    e.target.files?.[0] && uploadImage(e.target.files[0])
                  }
                />
              </label>
            </div>
            {tour.images.length === 0 ? (
              <div className="py-16 text-center border-2 border-dashed border-gray-200 rounded-2xl">
                <p className="text-4xl mb-3">🖼️</p>
                <p className="text-sm text-gray-400 font-semibold">
                  Chưa có ảnh nào
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {tour.images.map((img, i) => (
                  <div
                    key={img._id}
                    className="group relative rounded-xl overflow-hidden bg-gray-100 aspect-video"
                  >
                    <img
                      src={img.image_url}
                      className="w-full h-full object-cover"
                    />
                    {i === 0 && (
                      <div className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Ảnh bìa
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <button
                        onClick={() => deleteImage(img._id)}
                        className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg border-none cursor-pointer"
                      >
                        Xoá
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* DESCRIPTIONS */}
        {tab === "descriptions" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <SectionTitle>Thêm mô tả mới</SectionTitle>
              <div className="space-y-3">
                <input
                  placeholder="Tiêu đề (VD: Giá tour bao gồm)"
                  value={descTitle}
                  onChange={(e) => setDescTitle(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                />
                <textarea
                  placeholder="Nội dung chi tiết..."
                  value={descContent}
                  onChange={(e) => setDescContent(e.target.value)}
                  rows={5}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all resize-none"
                />
                <button
                  onClick={addDescription}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold border-none cursor-pointer transition-colors"
                >
                  + Thêm mô tả
                </button>
              </div>
            </div>
            {tour.descriptions.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 py-12 text-center text-gray-400">
                <p className="text-4xl mb-3">📝</p>
                <p className="font-semibold text-sm">Chưa có mô tả nào</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tour.descriptions.map((d, i) => (
                  <div
                    key={d._id}
                    className="bg-white rounded-2xl border border-gray-100 p-5 group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex gap-3 flex-1 min-w-0">
                        <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-500 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-800 mb-1">
                            {d.title}
                          </p>
                          <pre className="text-xs text-gray-500 whitespace-pre-wrap font-sans leading-relaxed">
                            {d.content}
                          </pre>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteDescription(d._id)}
                        className="text-xs text-red-400 hover:text-red-600 border-none cursor-pointer bg-transparent opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      >
                        Xoá
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ITINERARIES */}
        {tab === "itineraries" && (
          <div className="space-y-3">
            <div className="flex justify-end">
              <button
                onClick={addDay}
                className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold border-none cursor-pointer transition-colors"
              >
                + Thêm ngày
              </button>
            </div>
            {tour.itineraries.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center text-gray-400">
                <p className="text-4xl mb-3">🗓️</p>
                <p className="font-semibold text-sm">Chưa có ngày nào</p>
              </div>
            )}
            {tour.itineraries
              .sort((a, b) => a.day_number - b.day_number)
              .map((day) => (
                <div
                  key={day._id}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
                >
                  <div className="px-5 py-3.5 flex items-center justify-between gap-2 border-b border-gray-100 bg-gray-50/60">
                    {editingDay === day._id ? (
                      <div className="flex-1 flex flex-col gap-2">
                        <input
                          value={editingDayTitle}
                          onChange={(e) => setEditingDayTitle(e.target.value)}
                          placeholder="Tiêu đề ngày"
                          className="border border-gray-200 rounded-xl px-3 py-2 text-sm w-full outline-none focus:border-orange-400"
                        />
                        <input
                          value={editingDayMeal}
                          onChange={(e) => setEditingDayMeal(e.target.value)}
                          placeholder="Ghi chú bữa ăn"
                          className="border border-gray-200 rounded-xl px-3 py-2 text-sm w-full outline-none focus:border-orange-400"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateDay(day._id)}
                            className="bg-orange-500 text-white text-xs font-bold px-4 py-2 rounded-lg border-none cursor-pointer"
                          >
                            Lưu
                          </button>
                          <button
                            onClick={() => setEditingDay(null)}
                            className="text-gray-500 text-xs px-4 py-2 rounded-lg border border-gray-200 cursor-pointer bg-white"
                          >
                            Huỷ
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex-1 flex items-center gap-3">
                          <span className="bg-orange-500 text-white text-xs font-black px-3 py-1.5 rounded-xl shrink-0">
                            Ngày {day.day_number}
                          </span>
                          <div>
                            <p className="text-sm font-bold text-gray-800">
                              {day.title}
                            </p>
                            {day.meal_note && (
                              <p className="text-[11px] text-amber-600 mt-0.5">
                                🍽️ {day.meal_note}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-[11px] text-gray-400 mr-2">
                            {day.details.length} hoạt động
                          </span>
                          <button
                            onClick={() => {
                              setEditingDay(day._id);
                              setEditingDayTitle(day.title);
                              setEditingDayMeal(day.meal_note);
                            }}
                            className="text-xs font-semibold text-blue-500 hover:bg-blue-50 px-2.5 py-1.5 rounded-lg border-none cursor-pointer bg-transparent"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => deleteDay(day._id)}
                            className="text-xs font-semibold text-red-400 hover:bg-red-50 px-2.5 py-1.5 rounded-lg border-none cursor-pointer bg-transparent"
                          >
                            Xoá
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="p-4 space-y-2">
                    {day.details
                      .sort((a, b) => a.order - b.order)
                      .map((dt) => {
                        const meta = TYPE_META[dt.type] ?? TYPE_META.visit;
                        const displayTitle = dt.place_id?.title ?? dt.title;
                        const displayContent =
                          dt.place_id?.content ?? dt.content;
                        const images = dt.place_id?.images ?? [];
                        return (
                          <div
                            key={dt._id}
                            className="border border-gray-100 rounded-xl overflow-hidden group/detail"
                          >
                            {editingDetail === dt._id ? (
                              <div className="p-4 space-y-3 bg-orange-50/30">
                                <div className="flex gap-2 flex-wrap">
                                  {Object.entries(TYPE_META).map(([v, m]) => (
                                    <button
                                      key={v}
                                      type="button"
                                      onClick={() => setEditDetailType(v)}
                                      className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl border-2 cursor-pointer transition-all ${
                                        editDetailType === v
                                          ? "border-orange-400 bg-orange-50 text-orange-600"
                                          : "border-gray-100 bg-white text-gray-500"
                                      }`}
                                    >
                                      {m.icon} {m.label}
                                    </button>
                                  ))}
                                </div>
                                <input
                                  value={editDetailTitle}
                                  onChange={(e) =>
                                    setEditDetailTitle(e.target.value)
                                  }
                                  placeholder="Tiêu đề hoạt động"
                                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400"
                                />
                                <textarea
                                  value={editDetailContent}
                                  onChange={(e) =>
                                    setEditDetailContent(e.target.value)
                                  }
                                  rows={3}
                                  placeholder="Mô tả chi tiết..."
                                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 resize-none"
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => updateDetail(dt._id)}
                                    className="bg-orange-500 text-white text-xs font-bold px-4 py-2 rounded-lg border-none cursor-pointer"
                                  >
                                    Lưu
                                  </button>
                                  <button
                                    onClick={() => setEditingDetail(null)}
                                    className="text-gray-500 text-xs px-4 py-2 rounded-lg border border-gray-200 cursor-pointer bg-white"
                                  >
                                    Huỷ
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="p-3.5 flex items-start gap-3">
                                <div
                                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0 ${meta.color}`}
                                >
                                  {meta.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 mb-0.5">
                                    <span
                                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${meta.color}`}
                                    >
                                      {meta.label}
                                    </span>
                                    {dt.place_id && (
                                      <span className="text-[10px] font-semibold bg-blue-50 text-blue-500 px-2 py-0.5 rounded-full">
                                        Có địa điểm
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm font-semibold text-gray-800">
                                    {displayTitle}
                                  </p>
                                  {displayContent && (
                                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                                      {displayContent}
                                    </p>
                                  )}
                                  {images.length > 0 && (
                                    <div className="flex gap-1.5 mt-2">
                                      {images.slice(0, 3).map((img, k) => (
                                        <img
                                          key={k}
                                          src={img.image_url}
                                          className="h-12 w-16 object-cover rounded-lg"
                                        />
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <div className="flex gap-1 shrink-0 opacity-0 group-hover/detail:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => {
                                      setEditingDetail(dt._id);
                                      setEditDetailTitle(displayTitle);
                                      setEditDetailContent(displayContent);
                                      setEditDetailType(dt.type);
                                    }}
                                    className="text-xs text-blue-500 hover:bg-blue-50 px-2.5 py-1.5 rounded-lg border-none cursor-pointer bg-transparent font-semibold"
                                  >
                                    Sửa
                                  </button>
                                  <button
                                    onClick={() => deleteDetail(dt._id)}
                                    className="text-xs text-red-400 hover:bg-red-50 px-2.5 py-1.5 rounded-lg border-none cursor-pointer bg-transparent font-semibold"
                                  >
                                    Xoá
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    <button
                      onClick={() => addDetail(day._id)}
                      className="w-full py-2.5 border-2 border-dashed border-gray-200 hover:border-orange-300 hover:bg-orange-50/40 text-gray-400 hover:text-orange-500 text-xs font-semibold rounded-xl bg-transparent cursor-pointer transition-all"
                    >
                      + Thêm hoạt động
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
