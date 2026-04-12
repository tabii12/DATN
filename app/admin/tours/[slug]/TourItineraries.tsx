"use client";

import { useState } from "react";

interface ItineraryDetail {
  _id: string;
  type: string;
  title: string;
  content: string;
  order: number;
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

  // 1. Thêm ngày mới
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-gray-800">
            Lịch trình chi tiết
          </h3>
          <p className="text-sm text-gray-500">
            Quản lý các hoạt động theo từng ngày của Tour
          </p>
        </div>
        <button
          onClick={handleAddDay}
          disabled={loading}
          className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-700 transition shadow-sm"
        >
          {loading ? "Đang xử lý..." : "+ Thêm ngày mới"}
        </button>
      </div>

      <div className="space-y-4">
        {itineraries
          .sort((a, b) => a.day_number - b.day_number)
          .map((day) => (
            <DayItem key={day._id} day={day} onRefresh={onRefresh} />
          ))}

        {itineraries.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-100">
            <p className="text-gray-400">Chưa có lịch trình cho tour này</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Component con quản lý từng Ngày
function DayItem({
  day,
  onRefresh,
}: {
  day: Itinerary;
  onRefresh: () => void;
}) {
  const [isEditingDay, setIsEditingDay] = useState(false);
  const [dayForm, setDayForm] = useState({
    title: day.title,
    meal_note: day.meal_note,
  });

  const handleUpdateDay = async () => {
    const res = await fetch(`${API}/itineraries/update/${day._id}`, {
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
    if (
      !confirm(
        `Xóa Ngày ${day.day_number}? Thao tác này sẽ xóa tất cả hoạt động bên trong.`,
      )
    )
      return;
    await fetch(`${API}/itineraries/delete/${day._id}`, { method: "DELETE" });
    onRefresh();
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header Ngày */}
      <div className="bg-gray-50/50 p-4 border-b border-gray-100 flex justify-between items-center">
        {isEditingDay ? (
          <div className="flex flex-1 gap-2 mr-4">
            <input
              className="flex-2 p-2 border rounded-lg text-sm"
              value={dayForm.title}
              onChange={(e) =>
                setDayForm({ ...dayForm, title: e.target.value })
              }
            />
            <input
              className="flex-1 p-2 border rounded-lg text-sm"
              placeholder="Bữa ăn (VD: Sáng/Trưa/Tối)"
              value={dayForm.meal_note}
              onChange={(e) =>
                setDayForm({ ...dayForm, meal_note: e.target.value })
              }
            />
            <button
              onClick={handleUpdateDay}
              className="bg-blue-600 text-white px-3 rounded-lg text-xs font-bold"
            >
              Lưu
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 text-emerald-700 font-black px-3 py-1 rounded-lg text-xs">
              NGÀY {day.day_number}
            </div>
            <h4 className="font-bold text-gray-800">{day.title}</h4>
            {day.meal_note && (
              <span className="text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-bold uppercase">
                🍴 {day.meal_note}
              </span>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => setIsEditingDay(!isEditingDay)}
            className="p-2 hover:bg-white rounded-lg transition text-blue-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
            </svg>
          </button>
          <button
            onClick={handleDeleteDay}
            className="p-2 hover:bg-white rounded-lg transition text-red-400"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Danh sách hoạt động (Details) */}
      <div className="p-4 space-y-3">
        {day.details
          ?.sort((a, b) => a.order - b.order)
          .map((detail) => (
            <div
              key={detail._id}
              className="flex gap-4 p-4 bg-gray-50/50 rounded-xl border border-gray-100 group relative"
            >
              <div className="w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-gray-400">
                {detail.order}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    {detail.type}
                  </span>
                  <h5 className="font-bold text-gray-800 text-sm">
                    {detail.title}
                  </h5>
                </div>
                <p className="text-gray-500 text-xs leading-relaxed">
                  {detail.content}
                </p>
              </div>
            </div>
          ))}

        <button className="w-full py-3 border-2 border-dashed border-gray-100 rounded-xl text-gray-400 text-xs font-bold hover:bg-gray-50 hover:border-gray-200 transition">
          + THÊM HOẠT ĐỘNG CHI TIẾT
        </button>
      </div>
    </div>
  );
}
