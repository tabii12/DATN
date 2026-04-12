"use client";

import { useState, useEffect } from "react";

// --- INTERFACES ---
interface Place {
  _id: string;
  title: string;
  image?: string; // Đã thêm trường image
}

interface ItineraryDetail {
  _id: string;
  type: string;
  title: string;
  content: string;
  order: number;
  place_id?: Place | string | null;
}

interface Itinerary {
  _id: string;
  day_number: number;
  title: string;
  meal_note: string;
  details: ItineraryDetail[];
}

interface Props {
  tourId: string;
  itineraries: Itinerary[];
  onRefresh: () => void;
}

const API = "https://db-pickyourway.vercel.app/api";

export default function TourItineraries({
  tourId,
  itineraries,
  onRefresh,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [allPlaces, setAllPlaces] = useState<Place[]>([]);

  useEffect(() => {
    fetch(`${API}/places`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success) setAllPlaces(res.data);
      })
      .catch((err) => console.error("Lỗi fetch places:", err));
  }, []);

  const handleAddDay = async () => {
    try {
      setLoading(true);
      const nextDay = itineraries.length + 1;
      const res = await fetch(`${API}/itineraries/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tour_id: tourId,
          day_number: nextDay,
          title: `Ngày ${nextDay}: Tiêu đề mặc định`,
        }),
      });
      if (res.ok) onRefresh();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl uppercase tracking-tight text-gray-800 font-black">
            Lịch trình chi tiết
          </h2>
          <p className="text-xs text-gray-400 font-bold">
            Quản lý các hoạt động theo từng ngày của Tour
          </p>
        </div>
        <button
          onClick={handleAddDay}
          disabled={loading}
          className="bg-[#F26F21] text-white px-6 py-3 rounded-2xl text-[10px] uppercase tracking-widest hover:opacity-90 transition shadow-lg shadow-orange-100 disabled:bg-gray-300"
        >
          {loading ? "Đang xử lý..." : "+ Thêm ngày mới"}
        </button>
      </div>

      <div className="space-y-6">
        {itineraries
          .sort((a, b) => a.day_number - b.day_number)
          .map((day) => (
            <DayItem
              key={day._id}
              day={day}
              onRefresh={onRefresh}
              allPlaces={allPlaces}
            />
          ))}

        {itineraries.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-gray-100">
            <p className="text-gray-400 text-[10px] uppercase tracking-widest">
              Chưa có lịch trình
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// --- COMPONENT: DAY ITEM ---
function DayItem({
  day,
  onRefresh,
  allPlaces,
}: {
  day: Itinerary;
  onRefresh: () => void;
  allPlaces: Place[];
}) {
  const [isEditingDay, setIsEditingDay] = useState(false);
  const [dayForm, setDayForm] = useState({
    title: day.title,
    meal_note: day.meal_note || "",
  });

  const handleUpdateDay = async () => {
    const res = await fetch(`${API}/itineraries/${day._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dayForm),
    });
    if (res.ok) {
      setIsEditingDay(false);
      onRefresh();
    }
  };

  const handleDeleteDay = async () => {
    if (!confirm(`Xóa Ngày ${day.day_number}?`)) return;
    await fetch(`${API}/itineraries/${day._id}`, { method: "DELETE" });
    onRefresh();
  };

  const handleAddDetail = async () => {
    const res = await fetch(`${API}/itinerary-details/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        itinerary_id: day._id,
        place_id: null,
        type: "visit",
        title: "Hoạt động mới",
        content: "Mô tả nội dung hoạt động...",
        order: (day.details?.length || 0) + 1,
      }),
    });
    if (res.ok) onRefresh();
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
      <div className="bg-gray-50/50 p-6 border-b border-gray-50 flex justify-between items-center">
        {isEditingDay ? (
          <div className="flex flex-1 gap-3 mr-4">
            <input
              className="flex-2 px-4 py-2 bg-white border border-gray-100 rounded-xl text-sm"
              value={dayForm.title}
              onChange={(e) =>
                setDayForm({ ...dayForm, title: e.target.value })
              }
            />
            <input
              className="flex-1 px-4 py-2 bg-white border border-gray-100 rounded-xl text-sm"
              placeholder="Bữa ăn..."
              value={dayForm.meal_note}
              onChange={(e) =>
                setDayForm({ ...dayForm, meal_note: e.target.value })
              }
            />
            <button
              onClick={handleUpdateDay}
              className="bg-[#F26F21] text-white px-6 rounded-xl text-[10px] uppercase"
            >
              Lưu
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="bg-[#F26F21] text-white px-4 py-1.5 rounded-xl text-[10px] uppercase tracking-widest">
              NGÀY {day.day_number}
            </div>
            <h4 className="text-gray-900 text-sm uppercase tracking-tight">
              {day.title}
            </h4>
            {day.meal_note && (
              <span className="text-[10px] font-bold bg-white text-[#F26F21] px-3 py-1 rounded-full border border-orange-100">
                🍴 {day.meal_note}
              </span>
            )}
          </div>
        )}
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditingDay(!isEditingDay)}
            className="p-2 bg-white rounded-xl shadow-sm text-gray-400 hover:text-[#F26F21]"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button
            onClick={handleDeleteDay}
            className="p-2 bg-white rounded-xl shadow-sm text-gray-400 hover:text-red-500"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            >
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>

      <div className="p-6 space-y-4 bg-white">
        {day.details
          ?.sort((a, b) => a.order - b.order)
          .map((detail) => (
            <DetailItem
              key={detail._id}
              detail={detail}
              onRefresh={onRefresh}
              allPlaces={allPlaces}
            />
          ))}
        <button
          onClick={handleAddDetail}
          className="w-full py-4 border-2 border-dashed border-gray-100 rounded-3xl text-gray-400 text-[10px] uppercase tracking-[0.2em] hover:bg-gray-50 hover:text-[#F26F21] transition-all"
        >
          + Thêm hoạt động chi tiết
        </button>
      </div>
    </div>
  );
}

// --- COMPONENT: DETAIL ITEM ---
function DetailItem({
  detail,
  onRefresh,
  allPlaces,
}: {
  detail: ItineraryDetail;
  onRefresh: () => void;
  allPlaces: Place[];
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    type: detail.type,
    title: detail.title,
    content: detail.content,
    place_id: (detail.place_id as any)?._id || detail.place_id || "",
  });

  const handleUpdate = async () => {
    const res = await fetch(`${API}/itinerary-details/${detail._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setIsEditing(false);
      onRefresh();
    }
  };

  const handleDelete = async () => {
    if (!confirm("Xóa hoạt động này?")) return;
    await fetch(`${API}/itinerary-details/${detail._id}`, { method: "DELETE" });
    onRefresh();
  };

  const typeMap: Record<string, string> = {
    visit: "Tham quan",
    eat: "Ăn uống",
    move: "Di chuyển",
    rest: "Nghỉ ngơi",
    other: "Khác",
  };

  // Lấy thông tin địa điểm (đã được populate)
  const placeData =
    typeof detail.place_id === "object" ? (detail.place_id as Place) : null;

  if (isEditing) {
    return (
      <div className="p-5 bg-orange-50/30 rounded-3xl border-2 border-[#F26F21]/20 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <select
            className="px-3 py-2 bg-white border border-gray-100 rounded-xl text-[10px] uppercase"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <option value="visit">Tham quan</option>
            <option value="eat">Ăn uống</option>
            <option value="move">Di chuyển</option>
            <option value="rest">Nghỉ ngơi</option>
            <option value="other">Khác</option>
          </select>
          {form.type === "visit" && (
            <select
              className="px-3 py-2 bg-white border border-gray-100 rounded-xl text-[10px] uppercase"
              value={form.place_id as string}
              onChange={(e) => {
                const selected = allPlaces.find(
                  (p) => p._id === e.target.value,
                );
                setForm({
                  ...form,
                  place_id: e.target.value,
                  title: selected ? selected.title : form.title,
                });
              }}
            >
              <option value="">-- Gắn địa điểm --</option>
              {allPlaces.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.title}
                </option>
              ))}
            </select>
          )}
        </div>
        <input
          className="w-full px-4 py-2 bg-white border border-gray-100 rounded-xl text-sm"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <textarea
          className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl text-sm"
          rows={3}
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
        />
        <div className="flex gap-2">
          <button
            onClick={handleUpdate}
            className="flex-1 bg-[#F26F21] text-white py-2 rounded-xl text-[10px] uppercase"
          >
            Lưu
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="px-4 bg-white border border-gray-200 text-gray-400 py-2 rounded-xl text-[10px] uppercase"
          >
            Hủy
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-5 p-5 bg-gray-50/50 rounded-3xl border border-gray-50 group relative hover:border-orange-100 transition-all">
      {/* KHỐI HÌNH ẢNH HOẶC SỐ THỨ TỰ */}
      <div className="relative shrink-0">
        {placeData?.image ? (
          <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white shadow-sm">
            <img
              src={placeData.image}
              alt={placeData.title}
              className="w-full h-full object-cover"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          </div>
        ) : (
          <div className="w-8 h-8 bg-[#F26F21] text-white rounded-full flex items-center justify-center text-[10px] shadow-md shadow-orange-100">
            {detail.order}
          </div>
        )}

        {/* Badge số thứ tự nhỏ hiển thị đè lên ảnh nếu có ảnh */}
        {placeData?.image && (
          <div className="absolute -top-2 -left-2 w-6 h-6 bg-[#F26F21] text-white rounded-full flex items-center justify-center text-[8px] border-2 border-white font-bold">
            {detail.order}
          </div>
        )}
      </div>

      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[9px] text-[#F26F21] uppercase tracking-widest font-bold">
              {typeMap[detail.type] || detail.type}
            </span>

            {placeData && (
              <span className="text-[9px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                📍 {placeData.title}
              </span>
            )}

            <h5 className="text-gray-900 text-sm uppercase tracking-tight font-bold">
              {detail.title}
            </h5>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 text-gray-400 hover:text-[#F26F21]"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 text-gray-400 hover:text-red-500"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              >
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
        <p className="text-gray-500 text-xs leading-relaxed font-medium whitespace-pre-wrap">
          {detail.content}
        </p>
      </div>
    </div>
  );
}
