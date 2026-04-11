"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

const API = "https://db-pickyourway.vercel.app/api";

type Hotel = {
  _id: string;
  name: string;
  address?: string;
  city?: string;
  price_per_night?: number;
  rating?: number;
};
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
type Trip = {
  _id: string;
  tour_id: string;
  start_date: string;
  end_date: string;
  base_price: number;
  max_people: number;
  booked_people: number;
  status: "open" | "closed" | "full";
};
type Tour = {
  _id: string;
  name: string;
  slug: string;
  status: string;
  hotel_id?: Hotel;
  category_id?: Category;
  start_location?: string;
  images: TourImage[];
  descriptions: TourDescription[];
  itineraries: Itinerary[];
};

const DEFAULT_HOTEL_FORM = {
  name: "",
  address: "",
  city: "",
  description: "",
  price_per_night: "",
  rating: "3",
  capacity: "2",
};

const TYPE_META: Record<string, { icon: string; label: string; color: string }> = {
  move:  { icon: "🚌", label: "Di chuyển", color: "bg-blue-50 text-blue-600" },
  rest:  { icon: "🏨", label: "Nghỉ ngơi", color: "bg-purple-50 text-purple-600" },
  eat:   { icon: "🍜", label: "Ăn uống",   color: "bg-amber-50 text-amber-600" },
  visit: { icon: "📍", label: "Tham quan", color: "bg-orange-50 text-orange-600" },
};

const STAR_OPTIONS = [1, 2, 3, 4, 5];

const VIETNAM_CITIES = [
  "Hà Nội","Hồ Chí Minh","Đà Nẵng","Hải Phòng","Cần Thơ",
  "Nha Trang","Đà Lạt","Hội An","Huế","Vũng Tàu","Phú Quốc",
  "Quy Nhơn","Phan Thiết","Mũi Né","Sapa","Hạ Long","Ninh Bình",
  "Buôn Ma Thuột","Pleiku","Quảng Bình",
];

const WEEKDAY_LABELS = ["CN","T2","T3","T4","T5","T6","T7"];
const WEEKDAY_NAMES = ["Chủ nhật","Thứ Hai","Thứ Ba","Thứ Tư","Thứ Năm","Thứ Sáu","Thứ Bảy"];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
      {children}
    </p>
  );
}

interface InlineFieldProps {
  label: string;
  value: string;
  onSave: (val: string) => Promise<void> | void;
  type?: "text" | "select" | "status";
  options?: { value: string; label: string }[];
  mono?: boolean;
  icon?: string;
  readOnly?: boolean;
  renderDisplay?: (val: string) => React.ReactNode;
  renderEdit?: (val: string, set: (v: string) => void) => React.ReactNode;
}

function InlineField({
  label, value, onSave, type = "text",
  options, mono, icon, readOnly,
  renderDisplay, renderEdit,
}: InlineFieldProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState(value);
  const [saving, setSaving]   = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setDraft(value); }, [value]);
  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  const handleSave = async () => {
    if (draft === value) { setEditing(false); return; }
    setSaving(true);
    await onSave(draft);
    setSaving(false);
    setEditing(false);
  };

  const handleCancel = () => { setDraft(value); setEditing(false); };

  const displayVal = renderDisplay
    ? renderDisplay(value)
    : value
      ? <span className={mono ? "font-mono text-gray-400 text-xs" : "text-sm text-gray-800"}>{value}</span>
      : <span className="text-sm text-gray-300 italic">Chưa có</span>;

  return (
    <div className="group py-3 border-b border-gray-50 last:border-0">
      {!editing ? (
        <div className="flex items-center gap-3">
          {icon && <span className="text-base shrink-0">{icon}</span>}
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-gray-400 mb-0.5">{label}</p>
            <div className="truncate">{displayVal}</div>
          </div>
          {!readOnly && (
            <button
              onClick={() => setEditing(true)}
              className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-lg bg-gray-100 hover:bg-orange-100 flex items-center justify-center border-none cursor-pointer"
              title="Chỉnh sửa"
            >
              <svg className="w-3.5 h-3.5 text-gray-400 hover:text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          <p className="text-[11px] font-semibold text-orange-500">{label}</p>
          {renderEdit ? (
            renderEdit(draft, setDraft)
          ) : type === "select" && options ? (
            <select
              value={draft}
              onChange={e => setDraft(e.target.value)}
              className="w-full border border-orange-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-100 bg-white cursor-pointer"
            >
              <option value="">-- Chọn --</option>
              {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          ) : (
            <input
              ref={inputRef}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") handleCancel(); }}
              className="w-full border border-orange-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-100 transition-all"
            />
          )}
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-lg border-none cursor-pointer transition-colors disabled:opacity-60"
            >
              {saving
                ? <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Đang lưu...</>
                : "Lưu"}
            </button>
            <button
              onClick={handleCancel}
              className="text-xs font-semibold text-gray-500 px-4 py-2 rounded-lg border border-gray-200 cursor-pointer bg-white hover:bg-gray-50 transition-colors"
            >
              Huỷ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EditTourPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = params?.slug as string | undefined;

  const [tour, setTour]             = useState<Tour | null>(null);
  const [hotels, setHotels]         = useState<Hotel[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tab, setTab]               = useState("info");
  const [savingInfo, setSavingInfo] = useState(false);

  // Hotel modal
  const [showHotelModal, setShowHotelModal] = useState(false);
  const [hotelForm, setHotelForm]           = useState(DEFAULT_HOTEL_FORM);
  const [savingHotel, setSavingHotel]       = useState(false);

  // Descriptions
  const [descTitle, setDescTitle]     = useState("");
  const [descContent, setDescContent] = useState("");

  // Itineraries
  const [editingDay, setEditingDay]         = useState<string | null>(null);
  const [editingDayTitle, setEditingDayTitle] = useState("");
  const [editingDayMeal, setEditingDayMeal]   = useState("");
  const [editingDetail, setEditingDetail]     = useState<string | null>(null);
  const [editDetailTitle, setEditDetailTitle]     = useState("");
  const [editDetailContent, setEditDetailContent] = useState("");
  const [editDetailType, setEditDetailType]       = useState("visit");

  // Trips
  const [trips, setTrips]           = useState<Trip[]>([]);
  const [tripForm, setTripForm]     = useState({ start_date: "", end_date: "", base_price: "", max_people: "" });
  const [editingTrip, setEditingTrip]   = useState<string | null>(null);
  const [editTripForm, setEditTripForm] = useState({ start_date: "", end_date: "", base_price: "", max_people: "" });

  const fetchTour = async () => {
    if (!slug) return;
    const res  = await fetch(`${API}/tours/detail/${slug}`);
    const data = await res.json();
    setTour(data.data);
  };

  const fetchTrips = async () => {
    if (!slug) return;
    const res  = await fetch(`${API}/trips/tour/${slug}`);
    const data = await res.json();
    setTrips(data.data || []);
  };

  const fetchHotels = async () => {
    const res = await fetch(`${API}/hotels`);
    const d   = await res.json();
    setHotels(d.data || []);
  };

  // ── Save individual info field ──────────────────────────────────────────
  const saveField = async (patch: Partial<{ name: string; status: string; hotel_id: string; category_id: string; start_location: string }>) => {
    if (!tour) return;
    const merged = {
      name:           tour.name,
      status:         tour.status,
      hotel_id:       tour.hotel_id?._id,
      category_id:    tour.category_id?._id,
      start_location: tour.start_location,
      ...patch,
    };
    const res  = await fetch(`${API}/tours/update/${slug}`, {
      method:  "PUT",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(merged),
    });
    const data = await res.json();
    if (data.success) {
      await fetchTour();
      if (data.data.slug !== slug) router.push(`/admin/tours/${data.data.slug}`);
    } else {
      alert(data.message || "Cập nhật thất bại");
    }
  };

  const createHotel = async () => {
    if (!hotelForm.name || !hotelForm.city || !hotelForm.price_per_night) {
      alert("Vui lòng điền đầy đủ: Tên, Thành phố, Giá/đêm");
      return;
    }
    setSavingHotel(true);
    try {
      const res  = await fetch(`${API}/hotels/create`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          name:           hotelForm.name,
          address:        hotelForm.address,
          city:           hotelForm.city,
          description:    hotelForm.description,
          price_per_night: Number(hotelForm.price_per_night),
          rating:         Number(hotelForm.rating),
          capacity:       Number(hotelForm.capacity),
          status:         "active",
        }),
      });
      const data = await res.json();
      if (!res.ok) { alert(`Lỗi: ${data.message || "Không thể tạo khách sạn"}`); return; }
      await fetchHotels();
      const newHotel: Hotel = data.data;
      if (newHotel && tour) setTour({ ...tour, hotel_id: newHotel });
      setHotelForm(DEFAULT_HOTEL_FORM);
      setShowHotelModal(false);
    } catch { alert("Có lỗi xảy ra khi tạo khách sạn"); }
    finally  { setSavingHotel(false); }
  };

  const addTrip = async () => {
    const today = new Date().toISOString().split("T")[0];
    if (!tripForm.start_date || !tripForm.end_date || !tripForm.base_price) return;
    if (tripForm.start_date < today) {
      alert("Ngày khởi hành không được chọn ngày đã qua.");
      return;
    }
    const res  = await fetch(`${API}/trips/create`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        tour_id:    tour?._id,
        start_date: tripForm.start_date,
        end_date:   tripForm.end_date,
        base_price: Number(tripForm.base_price),
        max_people: Number(tripForm.max_people),
        status:     "open",
      }),
    });
    const data = await res.json();
    if (!res.ok) { alert(`Lỗi ${res.status}: ${data.message || "Không rõ"}`); return; }
    setTripForm({ start_date: "", end_date: "", base_price: "", max_people: "" });
    await fetchTrips();
  };

  const updateTrip = async (id: string) => {
    await fetch(`${API}/trips/${id}`, {
      method:  "PUT",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ tour_id: tour?._id, start_date: editTripForm.start_date, end_date: editTripForm.end_date, base_price: Number(editTripForm.base_price), max_people: Number(editTripForm.max_people) }),
    });
    setEditingTrip(null);
    await fetchTrips();
  };

  const deleteTrip = async (id: string) => {
    if (!confirm("Xoá chuyến đi này?")) return;
    await fetch(`${API}/trips/${id}`, { method: "DELETE" });
    await fetchTrips();
  };

  const toggleTripStatus = async (trip: Trip) => {
    if (trip.status === "full") return;
    const newStatus = trip.status === "open" ? "closed" : "open";
    await fetch(`${API}/trips/${trip._id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: newStatus }) });
    await fetchTrips();
  };

  useEffect(() => {
    if (!slug) return;
    fetchTour();
    fetchHotels();
    fetch(`${API}/categories`).then(r => r.json()).then(d => setCategories(d.data || []));
  }, [slug]);

  useEffect(() => {
    const tabParam = searchParams?.get("tab");
    if (tabParam === "trips" || tabParam === "images" || tabParam === "descriptions" || tabParam === "itineraries" || tabParam === "info") {
      setTab(tabParam);
    }
  }, [searchParams]);

  useEffect(() => { if (slug) fetchTrips(); }, [slug]);

  const formatDate = (date: Date) => date.toISOString().split("T")[0];
  const addDays = (date: Date, days: number) => {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
  };

  if (!slug || !tour) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center text-gray-400">
        <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"/>
        <p className="text-sm font-semibold">Đang tải tour...</p>
      </div>
    </div>
  );

  const uploadImage = async (file: File) => {
    const fd = new FormData();
    fd.append("images", file);
    const res = await fetch(`${API}/tours/upload-images/${slug}`, { method: "POST", body: fd });
    if (!res.ok) { alert("Upload lỗi 😭"); return; }
    await fetchTour();
  };

  const deleteImage = async (imageId: string) => {
    if (!confirm("Xoá ảnh này?")) return;
    await fetch(`${API}/tours/image/${imageId}`, { method: "DELETE" });
    fetchTour();
  };

  const addDescription = async () => {
    if (!descTitle || !descContent) return;
    await fetch(`${API}/descriptions/create`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: descTitle, content: descContent, tour_id: tour._id }) });
    setDescTitle(""); setDescContent("");
    await fetchTour();
  };

  const deleteDescription = async (id: string) => {
    await fetch(`${API}/descriptions/${id}`, { method: "DELETE" });
    await fetchTour();
  };

  const addDay = async () => {
    const nextDay = tour.itineraries.length + 1;
    await fetch(`${API}/itineraries/create`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tour_id: tour._id, day_number: nextDay, title: `Ngày ${nextDay}`, meal_note: "" }) });
    await fetchTour();
  };

  const updateDay = async (id: string) => {
    await fetch(`${API}/itineraries/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: editingDayTitle, meal_note: editingDayMeal }) });
    setEditingDay(null);
    await fetchTour();
  };

  const deleteDay = async (id: string) => {
    if (!confirm("Xoá ngày này và tất cả hoạt động?")) return;
    await fetch(`${API}/itineraries/${id}`, { method: "DELETE" });
    await fetchTour();
  };

  const addDetail = async (itineraryId: string) => {
    await fetch(`${API}/itinerary-details/create`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ itinerary_id: itineraryId, type: "visit", title: "Hoạt động mới", content: "", order: 99 }) });
    await fetchTour();
  };

  const updateDetail = async (id: string) => {
    await fetch(`${API}/itinerary-details/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: editDetailTitle, content: editDetailContent, type: editDetailType }) });
    setEditingDetail(null);
    await fetchTour();
  };

  const deleteDetail = async (id: string) => {
    if (!confirm("Xoá hoạt động này?")) return;
    await fetch(`${API}/itinerary-details/${id}`, { method: "DELETE" });
    await fetchTour();
  };

  const selectedHotel: Hotel | undefined = hotels.find(h => h._id === tour.hotel_id?._id) ?? tour.hotel_id;

  const TABS = [
    { key: "info",        icon: "📋", label: "Thông tin" },
    { key: "images",      icon: "🖼️", label: `Ảnh (${tour.images.length})` },
    { key: "descriptions",icon: "📝", label: `Mô tả (${tour.descriptions.length})` },
    { key: "itineraries", icon: "🗓️", label: `Lịch trình (${tour.itineraries.length}N)` },
    { key: "trips",       icon: "🚀", label: `Chuyến đi (${trips.length})` },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* ── HOTEL MODAL ── */}
      {showHotelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowHotelModal(false)}/>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-base font-black text-gray-900">🏨 Thêm khách sạn mới</h2>
                <p className="text-[11px] text-gray-400 mt-0.5">Khách sạn sẽ tự động được chọn vào tour</p>
              </div>
              <button onClick={() => setShowHotelModal(false)} className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 bg-white cursor-pointer text-lg">✕</button>
            </div>
            <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1.5">Tên khách sạn <span className="text-red-400">*</span></label>
                <input placeholder="VD: Vinpearl Resort & Spa Nha Trang" value={hotelForm.name} onChange={e => setHotelForm(f => ({ ...f, name: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 transition-all"/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1.5">Thành phố <span className="text-red-400">*</span></label>
                  <select value={hotelForm.city} onChange={e => setHotelForm(f => ({ ...f, city: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400 bg-white cursor-pointer">
                    <option value="">-- Chọn --</option>
                    {VIETNAM_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1.5">Địa chỉ</label>
                  <input placeholder="VD: 123 Trần Phú" value={hotelForm.address} onChange={e => setHotelForm(f => ({ ...f, address: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400 transition-all"/>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1.5">Giá / đêm (đ) <span className="text-red-400">*</span></label>
                  <input type="number" placeholder="VD: 1500000" value={hotelForm.price_per_night} onChange={e => setHotelForm(f => ({ ...f, price_per_night: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400 transition-all"/>
                  {hotelForm.price_per_night && <p className="text-[11px] text-orange-500 font-semibold mt-1">= {Number(hotelForm.price_per_night).toLocaleString("vi-VN")}đ/đêm</p>}
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1.5">Sức chứa (khách/phòng)</label>
                  <input type="number" min={1} max={10} value={hotelForm.capacity} onChange={e => setHotelForm(f => ({ ...f, capacity: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400 transition-all"/>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-2">Hạng sao</label>
                <div className="flex gap-2">
                  {STAR_OPTIONS.map(s => (
                    <button key={s} type="button" onClick={() => setHotelForm(f => ({ ...f, rating: String(s) }))}
                      className={`flex-1 py-2 rounded-xl border-2 text-sm font-bold cursor-pointer transition-all ${Number(hotelForm.rating) === s ? "border-amber-400 bg-amber-50 text-amber-600" : "border-gray-100 bg-gray-50 text-gray-300 hover:border-gray-200"}`}>
                      {"★".repeat(s)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1.5">Mô tả ngắn</label>
                <textarea placeholder="Mô tả về khách sạn..." value={hotelForm.description} onChange={e => setHotelForm(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 transition-all resize-none"/>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button onClick={() => setShowHotelModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-50 cursor-pointer bg-white transition-colors">Huỷ</button>
              <button onClick={createHotel} disabled={savingHotel} className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold border-none cursor-pointer transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {savingHotel ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Đang tạo...</> : "✅ Tạo khách sạn"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── HEADER ── */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3 sticky top-0 z-20">
        <button onClick={() => router.push("/admin/tours")} className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 bg-white cursor-pointer transition-colors text-lg">‹</button>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-black text-gray-900 truncate">✏️ {tour.name}</h1>
          <p className="text-[11px] text-gray-400 font-mono">{tour.slug}</p>
        </div>
        <a href={`/tours/${tour.slug}`} target="_blank" className="text-xs font-semibold text-blue-500 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl no-underline transition-colors">Xem trang →</a>
      </div>

      <div className="max-w-full mx-auto px-4 py-6 space-y-4">
        {/* TABS */}
        <div className="bg-white rounded-2xl border border-gray-100 p-1.5 flex gap-1 overflow-x-auto">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all border-none cursor-pointer flex-1 justify-center ${tab === t.key ? "bg-orange-500 text-white shadow-sm" : "text-gray-500 bg-transparent hover:bg-gray-50"}`}>
              <span>{t.icon}</span>
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {/* ════════════════════════════════════════
            TAB: INFO — Facebook-style inline edit
        ════════════════════════════════════════ */}
        {tab === "info" && (
          <div className="space-y-4">

            {/* Thông tin cơ bản */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <SectionTitle>Thông tin tour</SectionTitle>

              <InlineField
                label="Tên tour"
                value={tour.name}
                icon="📌"
                onSave={val => saveField({ name: val })}
              />

              <InlineField
                label="Slug (URL)"
                value={tour.slug}
                icon="🔗"
                mono
                readOnly
                renderDisplay={val => (
                  <span className="font-mono text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-lg">/tours/{val}</span>
                )}
                onSave={() => {}}
              />

              <InlineField
                label="Vị trí khởi hành"
                value={tour.start_location || ""}
                icon="📍"
                onSave={val => saveField({ start_location: val })}
              />

              <InlineField
                label="Trạng thái"
                value={tour.status}
                icon="⚡"
                onSave={val => saveField({ status: val })}
                renderDisplay={val => (
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${val === "active" ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-400"}`}>
                    {val === "active" ? "✅ Hoạt động" : "🚫 Tạm ẩn"}
                  </span>
                )}
                renderEdit={(val, set) => (
                  <div className="grid grid-cols-2 gap-3">
                    {([["active","✅","Hoạt động","Hiển thị công khai"],["inactive","🚫","Tạm ẩn","Không hiển thị"]] as const).map(([v, icon, l, sub]) => (
                      <button key={v} type="button" onClick={() => set(v)}
                        className={`p-3 rounded-xl border-2 text-left cursor-pointer transition-all ${val === v ? "border-orange-400 bg-orange-50" : "border-gray-100 bg-gray-50 hover:border-gray-200"}`}>
                        <span className="text-xl">{icon}</span>
                        <p className={`text-xs font-bold mt-1.5 ${val === v ? "text-orange-700" : "text-gray-700"}`}>{l}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>
                      </button>
                    ))}
                  </div>
                )}
              />
            </div>

            {/* Khách sạn */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-1">
                <SectionTitle>Khách sạn</SectionTitle>
                <button onClick={() => setShowHotelModal(true)} className="flex items-center gap-1.5 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 px-3 py-1.5 rounded-xl border-none cursor-pointer transition-colors">
                  + Thêm mới
                </button>
              </div>

              <InlineField
                label="Khách sạn hiện tại"
                value={tour.hotel_id?._id || ""}
                icon="🏨"
                onSave={val => saveField({ hotel_id: val })}
                renderDisplay={() => selectedHotel ? (
                  <div className="flex items-center gap-3 mt-1 bg-orange-50 border border-orange-100 rounded-xl px-3 py-2.5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-amber-400 text-sm">{"★".repeat(selectedHotel.rating ?? 0)}</span>
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-full">{selectedHotel.rating ?? 0} sao</span>
                      </div>
                      <p className="text-sm font-bold text-gray-800">{selectedHotel.name}</p>
                      {(selectedHotel.address || selectedHotel.city) && (
                        <p className="text-[11px] text-gray-500 mt-0.5">📍 {[selectedHotel.address, selectedHotel.city].filter(Boolean).join(", ")}</p>
                      )}
                    </div>
                    {selectedHotel.price_per_night !== undefined && (
                      <div className="text-right shrink-0">
                        <p className="text-[10px] text-gray-400 font-semibold">Giá/đêm</p>
                        <p className="text-base font-black text-orange-500">{selectedHotel.price_per_night.toLocaleString("vi-VN")}đ</p>
                      </div>
                    )}
                  </div>
                ) : <span className="text-sm text-gray-300 italic">Chưa chọn</span>}
                renderEdit={(val, set) => (
                  <select value={val} onChange={e => set(e.target.value)} className="w-full border border-orange-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-100 bg-white cursor-pointer">
                    <option value="">-- Chọn khách sạn --</option>
                    {hotels.map(h => <option key={h._id} value={h._id}>{h.name} {h.city ? `(${h.city})` : ""}</option>)}
                  </select>
                )}
              />
            </div>

            {/* Danh mục */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <SectionTitle>Danh mục</SectionTitle>
              <InlineField
                label="Danh mục tour"
                value={tour.category_id?._id || ""}
                icon="🏷️"
                onSave={val => saveField({ category_id: val })}
                renderDisplay={() => tour.category_id
                  ? <span className="text-sm font-semibold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg">{tour.category_id.name}</span>
                  : <span className="text-sm text-gray-300 italic">Chưa chọn</span>
                }
                renderEdit={(val, set) => (
                  <select value={val} onChange={e => set(e.target.value)} className="w-full border border-orange-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-100 bg-white cursor-pointer">
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                )}
              />
            </div>

          </div>
        )}

        {/* ── TAB: IMAGES ── */}
        {tab === "images" && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <SectionTitle>Hình ảnh tour</SectionTitle>
              <label className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer transition-colors">
                + Thêm ảnh
                <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && uploadImage(e.target.files[0])}/>
              </label>
            </div>
            {tour.images.length === 0 ? (
              <div className="py-16 text-center border-2 border-dashed border-gray-200 rounded-2xl">
                <p className="text-4xl mb-3">🖼️</p>
                <p className="text-sm text-gray-400 font-semibold">Chưa có ảnh nào</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {tour.images.map((img, i) => (
                  <div key={img._id} className="group relative rounded-xl overflow-hidden bg-gray-100 aspect-video">
                    <img src={img.image_url} className="w-full h-full object-cover"/>
                    {i === 0 && <div className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Ảnh bìa</div>}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <button onClick={() => deleteImage(img._id)} className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg border-none cursor-pointer">Xoá</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB: DESCRIPTIONS ── */}
        {tab === "descriptions" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <SectionTitle>Thêm mô tả mới</SectionTitle>
              <div className="space-y-3">
                <input placeholder="Tiêu đề (VD: Giá tour bao gồm)" value={descTitle} onChange={e => setDescTitle(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-400 transition-all"/>
                <textarea placeholder="Nội dung chi tiết..." value={descContent} onChange={e => setDescContent(e.target.value)} rows={5} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-400 transition-all resize-none"/>
                <button onClick={addDescription} className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold border-none cursor-pointer transition-colors">+ Thêm mô tả</button>
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
                  <div key={d._id} className="bg-white rounded-2xl border border-gray-100 p-5 group">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex gap-3 flex-1 min-w-0">
                        <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-500 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">{i + 1}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-800 mb-1">{d.title}</p>
                          <pre className="text-xs text-gray-500 whitespace-pre-wrap font-sans leading-relaxed">{d.content}</pre>
                        </div>
                      </div>
                      <button onClick={() => deleteDescription(d._id)} className="text-xs text-red-400 hover:text-red-600 border-none cursor-pointer bg-transparent opacity-0 group-hover:opacity-100 transition-opacity shrink-0">Xoá</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB: ITINERARIES ── */}
        {tab === "itineraries" && (
          <div className="space-y-3">
            <div className="flex justify-end">
              <button onClick={addDay} className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold border-none cursor-pointer transition-colors">+ Thêm ngày</button>
            </div>
            {tour.itineraries.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center text-gray-400">
                <p className="text-4xl mb-3">🗓️</p>
                <p className="font-semibold text-sm">Chưa có ngày nào</p>
              </div>
            )}
            {tour.itineraries.sort((a, b) => a.day_number - b.day_number).map(day => (
              <div key={day._id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-5 py-3.5 flex items-center justify-between gap-2 border-b border-gray-100 bg-gray-50/60">
                  {editingDay === day._id ? (
                    <div className="flex-1 flex flex-col gap-2">
                      <input value={editingDayTitle} onChange={e => setEditingDayTitle(e.target.value)} placeholder="Tiêu đề ngày" className="border border-gray-200 rounded-xl px-3 py-2 text-sm w-full outline-none focus:border-orange-400"/>
                      <input value={editingDayMeal} onChange={e => setEditingDayMeal(e.target.value)} placeholder="Ghi chú bữa ăn" className="border border-gray-200 rounded-xl px-3 py-2 text-sm w-full outline-none focus:border-orange-400"/>
                      <div className="flex gap-2">
                        <button onClick={() => updateDay(day._id)} className="bg-orange-500 text-white text-xs font-bold px-4 py-2 rounded-lg border-none cursor-pointer">Lưu</button>
                        <button onClick={() => setEditingDay(null)} className="text-gray-500 text-xs px-4 py-2 rounded-lg border border-gray-200 cursor-pointer bg-white">Huỷ</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 flex items-center gap-3">
                        <span className="bg-orange-500 text-white text-xs font-black px-3 py-1.5 rounded-xl shrink-0">Ngày {day.day_number}</span>
                        <div>
                          <p className="text-sm font-bold text-gray-800">{day.title}</p>
                          {day.meal_note && <p className="text-[11px] text-amber-600 mt-0.5">🍽️ {day.meal_note}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-[11px] text-gray-400 mr-2">{day.details.length} hoạt động</span>
                        <button onClick={() => { setEditingDay(day._id); setEditingDayTitle(day.title); setEditingDayMeal(day.meal_note); }} className="text-xs font-semibold text-blue-500 hover:bg-blue-50 px-2.5 py-1.5 rounded-lg border-none cursor-pointer bg-transparent">Sửa</button>
                        <button onClick={() => deleteDay(day._id)} className="text-xs font-semibold text-red-400 hover:bg-red-50 px-2.5 py-1.5 rounded-lg border-none cursor-pointer bg-transparent">Xoá</button>
                      </div>
                    </>
                  )}
                </div>
                <div className="p-4 space-y-2">
                  {day.details.sort((a, b) => a.order - b.order).map(dt => {
                    const meta = TYPE_META[dt.type] ?? TYPE_META.visit;
                    const displayTitle   = dt.place_id?.title   ?? dt.title;
                    const displayContent = dt.place_id?.content ?? dt.content;
                    const images = dt.place_id?.images ?? [];
                    return (
                      <div key={dt._id} className="border border-gray-100 rounded-xl overflow-hidden group/detail">
                        {editingDetail === dt._id ? (
                          <div className="p-4 space-y-3 bg-orange-50/30">
                            <div className="flex gap-2 flex-wrap">
                              {Object.entries(TYPE_META).map(([v, m]) => (
                                <button key={v} type="button" onClick={() => setEditDetailType(v)}
                                  className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl border-2 cursor-pointer transition-all ${editDetailType === v ? "border-orange-400 bg-orange-50 text-orange-600" : "border-gray-100 bg-white text-gray-500"}`}>
                                  {m.icon} {m.label}
                                </button>
                              ))}
                            </div>
                            <input value={editDetailTitle} onChange={e => setEditDetailTitle(e.target.value)} placeholder="Tiêu đề hoạt động" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400"/>
                            <textarea value={editDetailContent} onChange={e => setEditDetailContent(e.target.value)} rows={3} placeholder="Mô tả chi tiết..." className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 resize-none"/>
                            <div className="flex gap-2">
                              <button onClick={() => updateDetail(dt._id)} className="bg-orange-500 text-white text-xs font-bold px-4 py-2 rounded-lg border-none cursor-pointer">Lưu</button>
                              <button onClick={() => setEditingDetail(null)} className="text-gray-500 text-xs px-4 py-2 rounded-lg border border-gray-200 cursor-pointer bg-white">Huỷ</button>
                            </div>
                          </div>
                        ) : (
                          <div className="p-3.5 flex items-start gap-3">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0 ${meta.color}`}>{meta.icon}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${meta.color}`}>{meta.label}</span>
                                {dt.place_id && <span className="text-[10px] font-semibold bg-blue-50 text-blue-500 px-2 py-0.5 rounded-full">Có địa điểm</span>}
                              </div>
                              <p className="text-sm font-semibold text-gray-800">{displayTitle}</p>
                              {displayContent && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">{displayContent}</p>}
                              {images.length > 0 && (
                                <div className="flex gap-1.5 mt-2">
                                  {images.slice(0, 3).map((img, k) => <img key={k} src={img.image_url} className="h-12 w-16 object-cover rounded-lg"/>)}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-1 shrink-0 opacity-0 group-hover/detail:opacity-100 transition-opacity">
                              <button onClick={() => { setEditingDetail(dt._id); setEditDetailTitle(displayTitle); setEditDetailContent(displayContent); setEditDetailType(dt.type); }} className="text-xs text-blue-500 hover:bg-blue-50 px-2.5 py-1.5 rounded-lg border-none cursor-pointer bg-transparent font-semibold">Sửa</button>
                              <button onClick={() => deleteDetail(dt._id)} className="text-xs text-red-400 hover:bg-red-50 px-2.5 py-1.5 rounded-lg border-none cursor-pointer bg-transparent font-semibold">Xoá</button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <button onClick={() => addDetail(day._id)} className="w-full py-2.5 border-2 border-dashed border-gray-200 hover:border-orange-300 hover:bg-orange-50/40 text-gray-400 hover:text-orange-500 text-xs font-semibold rounded-xl bg-transparent cursor-pointer transition-all">+ Thêm hoạt động</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── TAB: TRIPS ── */}
        {tab === "trips" && (() => {
          const today = new Date().toISOString().split("T")[0];
          return (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <SectionTitle>Thêm chuyến đi</SectionTitle>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Ngày đi</label>
                  <input type="date" value={tripForm.start_date} min={today} onChange={e => setTripForm(f => ({ ...f, start_date: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400"/>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Ngày về</label>
                  <div className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 flex items-center">
                    {tripForm.end_date 
                      ? new Date(tripForm.end_date).toLocaleDateString("vi-VN")
                      : <span className="text-gray-300">--</span>
                    }
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Số ngày</label>
                  <input type="number" min={1} max={30} value={tripForm.end_date && tripForm.start_date ? Math.max(1, Math.round((new Date(tripForm.end_date).getTime() - new Date(tripForm.start_date).getTime()) / (24 * 60 * 60 * 1000)) + 1) : ""} onChange={e => {
                    if (tripForm.start_date && e.target.value) {
                      const days = Math.max(1, Number(e.target.value));
                      const endDate = new Date(tripForm.start_date);
                      endDate.setDate(endDate.getDate() + days - 1);
                      setTripForm(f => ({ ...f, end_date: endDate.toISOString().split("T")[0] }));
                    }
                  }} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400"/>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Giá (đ/người)</label>
                  <input type="number" value={tripForm.base_price} onChange={e => setTripForm(f => ({ ...f, base_price: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400"/>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Tối đa (người)</label>
                  <input type="number" value={tripForm.max_people} onChange={e => setTripForm(f => ({ ...f, max_people: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400"/>
                </div>
              </div>
              <button onClick={addTrip} disabled={!tripForm.start_date || !tripForm.base_price || !tripForm.end_date}
                className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold border-none cursor-pointer transition-colors disabled:opacity-60">
                + Thêm chuyến
              </button>
            </div>

            {trips.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center text-gray-400">
                <p className="text-4xl mb-3">🚀</p>
                <p className="font-semibold text-sm">Chưa có chuyến đi nào</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{trips.length} chuyến đi</span>
                  <span className="text-xs text-gray-400">{trips.filter(t => t.status === "open").length} đang mở · {trips.filter(t => new Date(t.end_date) < new Date()).length} đã qua</span>
                </div>
                <div className="divide-y divide-gray-50">
                  {[...trips].sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()).map(trip => {
                    const start      = new Date(trip.start_date);
                    const end        = new Date(trip.end_date);
                    const slotsLeft  = trip.max_people - trip.booked_people;
                    const isPast     = end < new Date();
                    const nights     = Math.ceil((end.getTime() - start.getTime()) / 86400000);
                    const dayLabels  = ["CN","T2","T3","T4","T5","T6","T7"];
                    return (
                      <div key={trip._id} className={`px-5 py-3.5 ${isPast ? "opacity-40" : ""}`}>
                        {editingTrip === trip._id ? (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div><label className="text-[10px] font-semibold text-gray-400 block mb-1">Ngày đi</label><input type="date" value={editTripForm.start_date} onChange={e => setEditTripForm(f => ({ ...f, start_date: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400"/></div>
                            <div><label className="text-[10px] font-semibold text-gray-400 block mb-1">Ngày về</label><input type="date" value={editTripForm.end_date} onChange={e => setEditTripForm(f => ({ ...f, end_date: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400"/></div>
                            <div><label className="text-[10px] font-semibold text-gray-400 block mb-1">Giá</label><input type="number" value={editTripForm.base_price} onChange={e => setEditTripForm(f => ({ ...f, base_price: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400"/></div>
                            <div><label className="text-[10px] font-semibold text-gray-400 block mb-1">Tối đa</label><input type="number" value={editTripForm.max_people} onChange={e => setEditTripForm(f => ({ ...f, max_people: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400"/></div>
                            <div className="col-span-2 md:col-span-4 flex gap-2">
                              <button onClick={() => updateTrip(trip._id)} className="bg-orange-500 text-white text-xs font-bold px-4 py-2 rounded-lg border-none cursor-pointer">Lưu</button>
                              <button onClick={() => setEditingTrip(null)} className="text-gray-500 text-xs px-4 py-2 rounded-lg border border-gray-200 cursor-pointer bg-white">Huỷ</button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-4">
                            <div className="shrink-0 text-center bg-orange-50 rounded-xl px-3 py-2 min-w-[60px]">
                              <p className="text-[10px] font-bold text-orange-400">{dayLabels[start.getDay()]}</p>
                              <p className="text-lg font-black text-orange-600 leading-none">{String(start.getDate()).padStart(2, "0")}</p>
                              <p className="text-[10px] text-orange-400 font-semibold">T{start.getMonth() + 1}</p>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-bold text-gray-800">{start.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}</span>
                                <span className="text-gray-400 text-xs">→</span>
                                <span className="text-sm font-bold text-gray-800">{end.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}</span>
                                <span className="text-[11px] text-gray-400">({nights + 1} ngày {nights} đêm)</span>
                              </div>
                              <div className="flex items-center gap-3 mt-1 flex-wrap">
                                <span className="text-[11px] font-bold text-orange-500">{trip.base_price.toLocaleString("vi-VN")}đ</span>
                                <span className="text-[11px] text-gray-400">{trip.booked_people}/{trip.max_people} · còn <span className={slotsLeft <= 3 ? "text-red-500 font-bold" : "text-emerald-600 font-semibold"}>{slotsLeft} chỗ</span></span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <button onClick={() => toggleTripStatus(trip)} disabled={trip.status === "full"}
                                className={`text-[11px] font-bold px-2.5 py-1 rounded-full border cursor-pointer transition-colors disabled:cursor-not-allowed ${trip.status === "open" ? "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100" : trip.status === "full" ? "bg-red-50 text-red-400 border-red-200" : "bg-gray-100 text-gray-400 border-gray-200 hover:bg-gray-200"}`}>
                                {trip.status === "open" ? "Mở" : trip.status === "full" ? "Đầy" : "Đóng"}
                              </button>
                              <button onClick={() => { setEditingTrip(trip._id); setEditTripForm({ start_date: trip.start_date.split("T")[0], end_date: trip.end_date.split("T")[0], base_price: String(trip.base_price), max_people: String(trip.max_people) }); }} className="text-xs text-blue-500 hover:bg-blue-50 px-2.5 py-1.5 rounded-lg border-none cursor-pointer bg-transparent font-semibold">Sửa</button>
                              <button onClick={() => deleteTrip(trip._id)} className="text-xs text-red-400 hover:bg-red-50 px-2.5 py-1.5 rounded-lg border-none cursor-pointer bg-transparent font-semibold">Xoá</button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
        })()}
      </div>
    </div>
  );
}