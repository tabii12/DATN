"use client";

import { useState, useEffect } from "react";

const API = "https://db-pickyourway.vercel.app/api";

interface Place { _id: string; title: string; content?: string; images?: { image_url: string }[] }
interface ItineraryDetail {
  _id: string; type: string; title: string; content: string; order: number;
  place_id: { _id: string; title: string; content: string; images?: { image_url: string }[] } | null;
}
interface Itinerary { _id: string; day_number: number; title: string; meal_note: string; details: ItineraryDetail[] }
interface Props { tourId: string; itineraries: Itinerary[]; onRefresh: () => void }

const TYPE_META: Record<string, { icon: string; label: string; color: string }> = {
  move:  { icon: "🚌", label: "Di chuyển", color: "bg-blue-50 text-blue-600" },
  rest:  { icon: "🏨", label: "Nghỉ ngơi", color: "bg-purple-50 text-purple-600" },
  eat:   { icon: "🍜", label: "Ăn uống",   color: "bg-amber-50 text-amber-600" },
  visit: { icon: "📍", label: "Tham quan", color: "bg-orange-50 text-orange-600" },
};

export default function TourItineraries({ tourId, itineraries, onRefresh }: Props) {
  const [allPlaces, setAllPlaces]               = useState<Place[]>([]);
  const [editingDay, setEditingDay]             = useState<string | null>(null);
  const [editingDayTitle, setEditingDayTitle]   = useState("");
  const [editingDayMeal, setEditingDayMeal]     = useState("");
  const [editingDetail, setEditingDetail]       = useState<string | null>(null);
  const [editDetailTitle, setEditDetailTitle]   = useState("");
  const [editDetailContent, setEditDetailContent] = useState("");
  const [editDetailType, setEditDetailType]     = useState("visit");
  const [editDetailPlaceId, setEditDetailPlaceId] = useState("");
  const [uploadingDetailId, setUploadingDetailId] = useState<string | null>(null);

  // Fetch danh sách địa điểm để gắn vào hoạt động
  useEffect(() => {
    fetch(`${API}/places`).then(r => r.json()).then(res => {
      if (res.success) setAllPlaces(res.data);
    }).catch(console.error);
  }, []);

  // ── Day handlers ──
  const addDay = async () => {
    const nextDay = itineraries.length + 1;
    await fetch(`${API}/itineraries/create`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tour_id: tourId, day_number: nextDay, title: `Ngày ${nextDay}`, meal_note: "" }),
    });
    onRefresh();
  };

  const updateDay = async (id: string) => {
    await fetch(`${API}/itineraries/${id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editingDayTitle, meal_note: editingDayMeal }),
    });
    setEditingDay(null); onRefresh();
  };

  const deleteDay = async (id: string) => {
    if (!confirm("Xoá ngày này và tất cả hoạt động?")) return;
    await fetch(`${API}/itineraries/${id}`, { method: "DELETE" });
    onRefresh();
  };

  // ── Detail handlers ──
  const addDetail = async (itineraryId: string) => {
    const currentItinerary = itineraries.find(i => i._id === itineraryId);
    const details = currentItinerary?.details ?? [];
    const nextOrder = details.length > 0 ? Math.max(...details.map(d => d.order || 0)) + 1 : 1;
    await fetch(`${API}/itinerary-details/create`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itinerary_id: itineraryId, type: "visit", title: "Hoạt động mới", content: "", order: nextOrder }),
    });
    onRefresh();
  };

  const updateDetail = async (id: string) => {
    const body: any = { title: editDetailTitle, content: editDetailContent, type: editDetailType };
    // Gắn địa điểm nếu type=visit và có chọn
    if (editDetailType === "visit" && editDetailPlaceId) body.place_id = editDetailPlaceId;
    else body.place_id = null;
    await fetch(`${API}/itinerary-details/${id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    });
    setEditingDetail(null); onRefresh();
  };

  const deleteDetail = async (id: string) => {
    if (!confirm("Xoá hoạt động này?")) return;
    await fetch(`${API}/itinerary-details/${id}`, { method: "DELETE" });
    onRefresh();
  };

  // ── Upload ảnh cho detail ──
  const uploadDetailImage = async (detailId: string, file: File) => {
    setUploadingDetailId(detailId);
    try {
      const fd = new FormData(); fd.append("images", file);
      const res = await fetch(`${API}/itinerary-details/upload-images/${detailId}`, { method: "POST", body: fd });
      if (!res.ok) { alert("Upload ảnh thất bại"); return; }
      onRefresh();
    } catch { alert("Lỗi upload ảnh"); }
    finally { setUploadingDetailId(null); }
  };

  // Mở form sửa detail
  const openEditDetail = (dt: ItineraryDetail) => {
    setEditingDetail(dt._id);
    setEditDetailTitle(dt.place_id?.title ?? dt.title);
    setEditDetailContent(dt.place_id?.content ?? dt.content);
    setEditDetailType(dt.type);
    setEditDetailPlaceId(dt.place_id?._id ?? "");
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button onClick={addDay} className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold border-none cursor-pointer transition-colors">+ Thêm ngày</button>
      </div>

      {itineraries.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center text-gray-400">
          <p className="text-4xl mb-3">🗓️</p><p className="font-semibold text-sm">Chưa có ngày nào</p>
        </div>
      )}

      {[...itineraries].sort((a, b) => a.day_number - b.day_number).map(day => (
        <div key={day._id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">

          {/* ── Day header ── */}
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

          {/* ── Details ── */}
          <div className="p-4 space-y-2">
            {[...day.details].sort((a, b) => a.order - b.order).map(dt => {
              const meta         = TYPE_META[dt.type] ?? TYPE_META.visit;
              const displayTitle   = dt.place_id?.title   ?? dt.title;
              const displayContent = dt.place_id?.content ?? dt.content;
              const detailImages   = dt.place_id?.images  ?? [];

              return (
                <div key={dt._id} className="border border-gray-100 rounded-xl overflow-hidden group/detail">
                  {editingDetail === dt._id ? (
                    /* ── Edit form ── */
                    <div className="p-4 space-y-3 bg-orange-50/30">

                      {/* Type selector */}
                      <div className="flex gap-2 flex-wrap">
                        {Object.entries(TYPE_META).map(([v, m]) => (
                          <button key={v} type="button" onClick={() => { setEditDetailType(v); if (v !== "visit") setEditDetailPlaceId(""); }}
                            className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl border-2 cursor-pointer transition-all ${editDetailType === v ? "border-orange-400 bg-orange-50 text-orange-600" : "border-gray-100 bg-white text-gray-500"}`}>
                            {m.icon} {m.label}
                          </button>
                        ))}
                      </div>

                      {/* Gắn địa điểm — chỉ khi type = visit */}
                      {editDetailType === "visit" && (
                        <div>
                          <label className="text-xs font-semibold text-gray-500 block mb-1">Gắn địa điểm (tuỳ chọn)</label>
                          <select value={editDetailPlaceId}
                            onChange={e => {
                              const selectedPlace = allPlaces.find(p => p._id === e.target.value);
                              setEditDetailPlaceId(e.target.value);
                              // Tự điền title từ địa điểm
                              if (selectedPlace) setEditDetailTitle(selectedPlace.title);
                            }}
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 bg-white cursor-pointer">
                            <option value="">-- Gắn địa điểm --</option>
                            {allPlaces.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
                          </select>
                          {editDetailPlaceId && (
                            <p className="text-[11px] text-blue-500 mt-1">✓ Đã gắn địa điểm — tiêu đề & ảnh sẽ lấy từ địa điểm</p>
                          )}
                        </div>
                      )}

                      <input value={editDetailTitle} onChange={e => setEditDetailTitle(e.target.value)} placeholder="Tiêu đề hoạt động" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400"/>
                      <textarea value={editDetailContent} onChange={e => setEditDetailContent(e.target.value)} rows={3} placeholder="Mô tả chi tiết..." className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 resize-none"/>

                      {/* Upload ảnh (chỉ khi không gắn địa điểm) */}
                      {/* {!editDetailPlaceId && (
                        <div>
                          <p className="text-xs font-semibold text-gray-600 mb-2">Hình ảnh hoạt động</p>
                          <div className="flex flex-wrap gap-2">
                            {detailImages.map((img, k) => (
                              <div key={k} className="relative w-20 h-16 rounded-lg overflow-hidden bg-gray-100">
                                <img src={img.image_url} className="w-full h-full object-cover"/>
                              </div>
                            ))}
                            <label className={`w-20 h-16 rounded-lg border-2 border-dashed border-gray-200 hover:border-orange-400 flex flex-col items-center justify-center cursor-pointer transition-colors hover:bg-orange-50/30 ${uploadingDetailId === dt._id ? "opacity-50 pointer-events-none" : ""}`}>
                              {uploadingDetailId === dt._id
                                ? <span className="w-4 h-4 border-2 border-orange-300 border-t-orange-500 rounded-full animate-spin"/>
                                : <><span className="text-lg text-gray-300">📷</span><span className="text-[10px] text-gray-400 mt-0.5">Thêm ảnh</span></>}
                              <input type="file" accept="image/*" className="hidden" onChange={e => { const file = e.target.files?.[0]; if (file) uploadDetailImage(dt._id, file); e.target.value = ""; }}/>
                            </label>
                          </div>
                        </div>
                      )} */}

                      <div className="flex gap-2">
                        <button onClick={() => updateDetail(dt._id)} className="bg-orange-500 text-white text-xs font-bold px-4 py-2 rounded-lg border-none cursor-pointer">Lưu</button>
                        <button onClick={() => setEditingDetail(null)} className="text-gray-500 text-xs px-4 py-2 rounded-lg border border-gray-200 cursor-pointer bg-white">Huỷ</button>
                      </div>
                    </div>
                  ) : (
                    /* ── Display ── */
                    <div className="p-3.5 flex items-start gap-3">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0 ${meta.color}`}>{meta.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${meta.color}`}>{meta.label}</span>
                          {dt.place_id && <span className="text-[10px] font-semibold bg-blue-50 text-blue-500 px-2 py-0.5 rounded-full">📍 {dt.place_id.title}</span>}
                          {detailImages.length > 0 && <span className="text-[10px] font-semibold bg-gray-50 text-gray-400 px-2 py-0.5 rounded-full">{detailImages.length} ảnh</span>}
                        </div>
                        <p className="text-sm font-semibold text-gray-800">{displayTitle}</p>
                        {displayContent && <p className="text-xs text-gray-500 mt-0.5 leading-relaxed whitespace-pre-line">{displayContent}</p>}
                        {detailImages.length > 0 && (
                          <div className="flex gap-1.5 mt-2">
                            {detailImages.slice(0, 3).map((img, k) => <img key={k} src={img.image_url} className="h-12 w-16 object-cover rounded-lg"/>)}
                            {detailImages.length > 3 && <div className="h-12 w-16 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-400 font-semibold">+{detailImages.length - 3}</div>}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1 shrink-0 opacity-0 group-hover/detail:opacity-100 transition-opacity">
                        <button onClick={() => openEditDetail(dt)} className="text-xs text-blue-500 hover:bg-blue-50 px-2.5 py-1.5 rounded-lg border-none cursor-pointer bg-transparent font-semibold">Sửa</button>
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
  );
}