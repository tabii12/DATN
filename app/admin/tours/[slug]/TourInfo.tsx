"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const API = "https://db-pickyourway.vercel.app/api";

type Hotel = { _id: string; serviceName: string; address?: string; city?: string; basePrice?: number; rating?: number; type: string };
type Category = { _id: string; name: string };

interface Tour {
  _id: string; name: string; slug: string; status: string;
  hotel_id?: Hotel; category_id?: Category; start_location?: string;
}

const DEFAULT_HOTEL_FORM = { name: "", address: "", city: "", description: "", price_per_night: "", rating: "3", capacity: "2" };
const STAR_OPTIONS = [1, 2, 3, 4, 5];
const VIETNAM_CITIES = ["Hà Nội","Hồ Chí Minh","Đà Nẵng","Hải Phòng","Cần Thơ","Nha Trang","Đà Lạt","Hội An","Huế","Vũng Tàu","Phú Quốc","Quy Nhơn","Phan Thiết","Mũi Né","Sapa","Hạ Long","Ninh Bình","Buôn Ma Thuột","Pleiku","Quảng Bình"];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">{children}</p>;
}

interface InlineFieldProps {
  label: string; value: string; onSave: (val: string) => Promise<void> | void;
  mono?: boolean; icon?: string; readOnly?: boolean;
  renderDisplay?: (val: string) => React.ReactNode;
  renderEdit?: (val: string, set: (v: string) => void) => React.ReactNode;
}

function InlineField({ label, value, onSave, mono, icon, readOnly, renderDisplay, renderEdit }: InlineFieldProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState(value);
  const [saving, setSaving]   = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { setDraft(value); }, [value]);
  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);
  const handleSave = async () => { if (draft === value) { setEditing(false); return; } setSaving(true); await onSave(draft); setSaving(false); setEditing(false); };
  const handleCancel = () => { setDraft(value); setEditing(false); };
  const displayVal = renderDisplay ? renderDisplay(value) : value ? <span className={mono ? "font-mono text-gray-400 text-xs" : "text-sm text-gray-800"}>{value}</span> : <span className="text-sm text-gray-300 italic">Chưa có</span>;
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
            <button onClick={() => setEditing(true)} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-lg bg-gray-100 hover:bg-orange-100 flex items-center justify-center border-none cursor-pointer" title="Chỉnh sửa">
              <svg className="w-3.5 h-3.5 text-gray-400 hover:text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          <p className="text-[11px] font-semibold text-orange-500">{label}</p>
          {renderEdit ? renderEdit(draft, setDraft) : (
            <input ref={inputRef} value={draft} onChange={e => setDraft(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") handleCancel(); }}
              className="w-full border border-orange-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-100 transition-all"/>
          )}
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-lg border-none cursor-pointer transition-colors disabled:opacity-60">
              {saving ? <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Đang lưu...</> : "Lưu"}
            </button>
            <button onClick={handleCancel} className="text-xs font-semibold text-gray-500 px-4 py-2 rounded-lg border border-gray-200 cursor-pointer bg-white hover:bg-gray-50 transition-colors">Huỷ</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TourInfo({ tour, categories, onRefresh }: { tour: Tour; categories: Category[]; onRefresh: () => void }) {
  const router = useRouter();
  const [hotels, setHotels]             = useState<Hotel[]>([]);
  const [showHotelModal, setShowHotelModal] = useState(false);
  const [hotelForm, setHotelForm]           = useState(DEFAULT_HOTEL_FORM);
  const [savingHotel, setSavingHotel]       = useState(false);
  const selectedHotel: Hotel | undefined = hotels.find(h => h._id === tour.hotel_id?._id) ?? tour.hotel_id;

  useEffect(() => { fetch(`${API}/services/all`).then(r => r.json()).then(d => setHotels(d.data?.filter((s: any) => s.type === "hotel") || [])); }, []);

  const saveField = async (patch: Partial<{ name: string; status: string; hotel_id: string; category_id: string; start_location: string }>) => {
    const merged = { name: tour.name, status: tour.status, hotel_id: tour.hotel_id?._id, category_id: tour.category_id?._id, start_location: tour.start_location, ...patch };
    const res  = await fetch(`${API}/tours/update/${tour.slug}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(merged) });
    const data = await res.json();
    if (data.success) { onRefresh(); if (data.data.slug !== tour.slug) router.push(`/admin/tours/${data.data.slug}`); }
    else alert(data.message || "Cập nhật thất bại");
  };

  const createHotel = async () => {
    if (!hotelForm.name || !hotelForm.city || !hotelForm.price_per_night) { alert("Vui lòng điền đầy đủ: Tên, Thành phố, Giá/đêm"); return; }
    setSavingHotel(true);
    try {
      const res  = await fetch(`${API}/services/create`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ serviceName: hotelForm.name, address: hotelForm.address, city: hotelForm.city, description: hotelForm.description, basePrice: Number(hotelForm.price_per_night), rating: Number(hotelForm.rating), capacity: Number(hotelForm.capacity), type: "hotel", unit: "đêm", status: "active" }) });
      const data = await res.json();
      if (!res.ok) { alert(`Lỗi: ${data.message}`); return; }
      const newHotels = await fetch(`${API}/services/all`).then(r => r.json()).then(d => d.data?.filter((s: any) => s.type === "hotel") || []);
      setHotels(newHotels);
      await saveField({ hotel_id: data.data._id });
      setHotelForm(DEFAULT_HOTEL_FORM);
      setShowHotelModal(false);
    } catch { alert("Có lỗi xảy ra khi tạo khách sạn"); }
    finally { setSavingHotel(false); }
  };

  return (
    <div className="space-y-4">
      {showHotelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowHotelModal(false)}/>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div><h2 className="text-base font-black text-gray-900">🏨 Thêm khách sạn mới</h2><p className="text-[11px] text-gray-400 mt-0.5">Khách sạn sẽ tự động được chọn vào tour</p></div>
              <button onClick={() => setShowHotelModal(false)} className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 bg-white cursor-pointer text-lg">✕</button>
            </div>
            <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
              <div><label className="text-xs font-bold text-gray-600 block mb-1.5">Tên khách sạn <span className="text-red-400">*</span></label><input placeholder="VD: Vinpearl Resort & Spa Nha Trang" value={hotelForm.name} onChange={e => setHotelForm(f => ({ ...f, name: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 transition-all"/></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-bold text-gray-600 block mb-1.5">Thành phố <span className="text-red-400">*</span></label><select value={hotelForm.city} onChange={e => setHotelForm(f => ({ ...f, city: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400 bg-white cursor-pointer"><option value="">-- Chọn --</option>{VIETNAM_CITIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                <div><label className="text-xs font-bold text-gray-600 block mb-1.5">Địa chỉ</label><input placeholder="VD: 123 Trần Phú" value={hotelForm.address} onChange={e => setHotelForm(f => ({ ...f, address: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400 transition-all"/></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-bold text-gray-600 block mb-1.5">Giá / đêm (đ) <span className="text-red-400">*</span></label><input type="number" placeholder="VD: 1500000" value={hotelForm.price_per_night} onChange={e => setHotelForm(f => ({ ...f, price_per_night: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400 transition-all"/>{hotelForm.price_per_night && <p className="text-[11px] text-orange-500 font-semibold mt-1">= {Number(hotelForm.price_per_night).toLocaleString("vi-VN")}đ/đêm</p>}</div>
                <div><label className="text-xs font-bold text-gray-600 block mb-1.5">Sức chứa (khách/phòng)</label><input type="number" min={1} max={10} value={hotelForm.capacity} onChange={e => setHotelForm(f => ({ ...f, capacity: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400 transition-all"/></div>
              </div>
              <div><label className="text-xs font-bold text-gray-600 block mb-2">Hạng sao</label><div className="flex gap-2">{STAR_OPTIONS.map(s => (<button key={s} type="button" onClick={() => setHotelForm(f => ({ ...f, rating: String(s) }))} className={`flex-1 py-2 rounded-xl border-2 text-sm font-bold cursor-pointer transition-all ${Number(hotelForm.rating) === s ? "border-amber-400 bg-amber-50 text-amber-600" : "border-gray-100 bg-gray-50 text-gray-300 hover:border-gray-200"}`}>{"★".repeat(s)}</button>))}</div></div>
              <div><label className="text-xs font-bold text-gray-600 block mb-1.5">Mô tả ngắn</label><textarea placeholder="Mô tả về khách sạn..." value={hotelForm.description} onChange={e => setHotelForm(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 transition-all resize-none"/></div>
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

      {/* Thông tin cơ bản */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <SectionTitle>Thông tin tour</SectionTitle>
        <InlineField label="Tên tour" value={tour.name} icon="📌" onSave={val => saveField({ name: val })}/>
        <InlineField label="Slug (URL)" value={tour.slug} icon="🔗" mono readOnly renderDisplay={val => <span className="font-mono text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-lg">/tours/{val}</span>} onSave={() => {}}/>
        <InlineField label="Vị trí khởi hành" value={tour.start_location || ""} icon="📍" onSave={val => saveField({ start_location: val })}/>
        <InlineField label="Trạng thái" value={tour.status} icon="⚡" onSave={val => saveField({ status: val })}
          renderDisplay={val => <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${val === "active" ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-400"}`}>{val === "active" ? "✅ Hoạt động" : "🚫 Tạm ẩn"}</span>}
          renderEdit={(val, set) => (
            <div className="grid grid-cols-2 gap-3">
              {([["active","✅","Hoạt động","Hiển thị công khai"],["inactive","🚫","Tạm ẩn","Không hiển thị"]] as const).map(([v,icon,l,sub]) => (
                <button key={v} type="button" onClick={() => set(v)} className={`p-3 rounded-xl border-2 text-left cursor-pointer transition-all ${val === v ? "border-orange-400 bg-orange-50" : "border-gray-100 bg-gray-50 hover:border-gray-200"}`}>
                  <span className="text-xl">{icon}</span>
                  <p className={`text-xs font-bold mt-1.5 ${val === v ? "text-orange-700" : "text-gray-700"}`}>{l}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>
                </button>
              ))}
            </div>
          )}/>
      </div>

      {/* Khách sạn */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-1">
          <SectionTitle>Khách sạn</SectionTitle>
          <button onClick={() => setShowHotelModal(true)} className="flex items-center gap-1.5 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 px-3 py-1.5 rounded-xl border-none cursor-pointer transition-colors">+ Thêm mới</button>
        </div>
        <InlineField label="Khách sạn hiện tại" value={tour.hotel_id?._id || ""} icon="🏨" onSave={val => saveField({ hotel_id: val })}
          renderDisplay={() => selectedHotel ? (
            <div className="flex items-center gap-3 mt-1 bg-orange-50 border border-orange-100 rounded-xl px-3 py-2.5">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5"><span className="text-amber-400 text-sm">{"★".repeat(selectedHotel.rating ?? 0)}</span><span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-full">{selectedHotel.rating ?? 0} sao</span></div>
                <p className="text-sm font-bold text-gray-800">{selectedHotel.serviceName}</p>
                {(selectedHotel.address || selectedHotel.city) && <p className="text-[11px] text-gray-500 mt-0.5">📍 {[selectedHotel.address, selectedHotel.city].filter(Boolean).join(", ")}</p>}
              </div>
              {selectedHotel.basePrice !== undefined && <div className="text-right shrink-0"><p className="text-[10px] text-gray-400 font-semibold">Giá/đêm</p><p className="text-base font-black text-orange-500">{selectedHotel.basePrice.toLocaleString("vi-VN")}đ</p></div>}
            </div>
          ) : <span className="text-sm text-gray-300 italic">Chưa chọn</span>}
          renderEdit={(val, set) => (
            <select value={val} onChange={e => set(e.target.value)} className="w-full border border-orange-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-100 bg-white cursor-pointer">
              <option value="">-- Chọn khách sạn --</option>
              {hotels.map(h => <option key={h._id} value={h._id}>{h.serviceName} {h.city ? `(${h.city})` : ""}</option>)}
            </select>
          )}/>
      </div>

      {/* Danh mục */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <SectionTitle>Danh mục</SectionTitle>
        <InlineField label="Danh mục tour" value={tour.category_id?._id || ""} icon="🏷️" onSave={val => saveField({ category_id: val })}
          renderDisplay={() => tour.category_id ? <span className="text-sm font-semibold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg">{tour.category_id!.name}</span> : <span className="text-sm text-gray-300 italic">Chưa chọn</span>}
          renderEdit={(val, set) => (
            <select value={val} onChange={e => set(e.target.value)} className="w-full border border-orange-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-100 bg-white cursor-pointer">
              <option value="">-- Chọn danh mục --</option>
              {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          )}/>
      </div>
    </div>
  );
}