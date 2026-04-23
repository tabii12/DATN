"use client";

import { useState, useEffect, useMemo } from "react";

const API = "https://db-pickyourway.vercel.app/api";

interface TripService { service_id: string | any; unit_price: number; quantity: number; note?: string }
export interface Trip {
  _id: string; tour_id: string; start_date: string; end_date: string;
  services: TripService[]; base_price: number; price: number;
  min_people: number; max_people: number; booked_people: number;
  status: "open" | "closed" | "full" | "deleted";
}
interface GlobalService { _id: string; serviceName: string; basePrice: number; unit: string; type: string }
interface Props { tourId: string; trips: Trip[]; duration: number; onRefresh: () => void }
const SERVICE_TYPES = [
  { value: "all", label: "Tất cả loại" },
  { value: "hotel", label: "Khách sạn" },
  { value: "transport", label: "Phương tiện" },
  { value: "restaurant", label: "Nhà hàng" },
  { value: "ticket", label: "Vé tham quan" },
  { value: "guide", label: "Hướng dẫn viên" },
  { value: "other", label: "Khác" },
];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">{children}</p>;
}

const CheckedIcon = () => (
  <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center shrink-0 shadow-md shadow-orange-200">
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><polyline points="20 6 9 17 4 12" /></svg>
  </div>
);

export default function TourTrips({ tourId, trips, duration, onRefresh }: Props) {
  const today = new Date().toISOString().split("T")[0];

  // ── Services ──
  const [globalServices, setGlobalServices] = useState<GlobalService[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  // ── Form (dùng cho cả tạo và sửa) ──
  const [editingTripId, setEditingTripId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [tripForm, setTripForm] = useState({
    start_date: "", end_date: "", min_people: 1, max_people: 10,
    selected_services: [] as { service_id: string; quantity: number; note: string }[],
  });

  // Local state for trips to allow immediate updates
  const [localTrips, setLocalTrips] = useState(trips);
  useEffect(() => setLocalTrips(trips), [trips]);

  useEffect(() => {
    fetch(`${API}/services/all`).then(r => r.json()).then(res => {
      if (res.success) setGlobalServices(res.data);
    }).catch(console.error);
  }, []);

  const filteredServices = useMemo(() =>
    globalServices.filter(s => {
      const matchName = s.serviceName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = filterType === "all" || s.type === filterType;
      return matchName && matchType;
    }),
    [globalServices, searchTerm, filterType]);

  // ── Service handlers ──
  const toggleService = (service: GlobalService) => {
    setTripForm(prev => {
      const exists = prev.selected_services.find(s => s.service_id === service._id);
      return exists
        ? { ...prev, selected_services: prev.selected_services.filter(s => s.service_id !== service._id) }
        : { ...prev, selected_services: [...prev.selected_services, { service_id: service._id, quantity: 1, note: service.serviceName }] };
    });
  };

  const updateServiceQty = (serviceId: string, qty: number) => {
    setTripForm(prev => ({
      ...prev,
      selected_services: prev.selected_services.map(s =>
        s.service_id === serviceId ? { ...s, quantity: Math.max(1, qty) } : s
      ),
    }));
  };

  // ── Edit trip ──
  const handleEditClick = (trip: Trip) => {
    setEditingTripId(trip._id);
    const fmtDate = (d: string) => d ? new Date(d).toISOString().split("T")[0] : "";

    // ✅ Thêm || [] để tránh crash khi services undefined
    const services = trip.services || [];

    setTripForm({
      start_date: fmtDate(trip.start_date),
      end_date: fmtDate(trip.end_date),
      min_people: trip.min_people,
      max_people: trip.max_people,
      selected_services: services
        .map(s => {
          const serviceId = typeof s.service_id === "string"
            ? s.service_id
            : (s.service_id as any)?._id ?? "";
          return { service_id: serviceId, quantity: s.quantity, note: s.note || "" };
        })
        .filter(s => globalServices.some(g => g._id === s.service_id)),
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setEditingTripId(null);
    setTripForm({ start_date: "", end_date: "", min_people: 1, max_people: 10, selected_services: [] });
  };

  // ── Submit (tạo hoặc sửa) ──
  const handleSubmitTrip = async () => {
    if (!tripForm.start_date || !tripForm.end_date) return alert("Vui lòng chọn ngày");
    if (tripForm.selected_services.length === 0) return alert("Vui lòng chọn ít nhất 1 dịch vụ");
    setLoading(true);
    try {
      const isEdit = !!editingTripId;
      const res = await fetch(isEdit ? `${API}/trips/${editingTripId}` : `${API}/trips/create`, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tour_id: tourId,
          start_date: tripForm.start_date, end_date: tripForm.end_date,
          min_people: tripForm.min_people, max_people: tripForm.max_people,
          services: tripForm.selected_services,
        }),
      });
      if (res.ok) { alert(isEdit ? "Cập nhật thành công!" : "Thêm chuyến thành công!"); resetForm(); onRefresh(); }
      else { const err = await res.json(); alert("Lỗi: " + err.message); }
    } catch { alert("Lỗi server"); }
    finally { setLoading(false); }
  };

  const toggleStatus = async (trip: Trip) => {
    if (trip.status === "full") return;
    const newStatus = trip.status === "open" ? "closed" : "open";
    await fetch(`${API}/trips/${trip._id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: newStatus }) });
    onRefresh();
  };

  const deleteTrip = async (id: string) => {
    if (!confirm("Xoá chuyến đi này?")) return;
    try {
      const res = await fetch(`${API}/trips/${id}`, { method: "DELETE" });
      console.log("Delete response:", res.status, res.statusText);
      const data = await res.json();
      console.log("Delete data:", data);
      if (res.ok) {
        alert("Đã xoá chuyến đi!");
        setLocalTrips(prev => prev.filter(t => t._id !== id));
        // onRefresh(); // Không cần vì đã cập nhật local
      } else {
        alert("Lỗi xoá: " + (data.message || "Không thể xoá"));
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Lỗi server khi xoá chuyến đi");
    }
  };

  return (
    <div className="space-y-4">

      {/* ── Form tạo/sửa ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <SectionTitle>{editingTripId ? "Cập nhật chuyến đi" : "Thêm chuyến đi"}</SectionTitle>
            {editingTripId && <p className="text-[11px] text-orange-500 -mt-2 mb-2 font-semibold">Đang chỉnh sửa: {editingTripId}</p>}
          </div>
          <div className="flex gap-2">
            {editingTripId && (
              <button onClick={resetForm} className="text-xs font-bold px-3 py-1.5 rounded-xl border border-red-200 bg-red-50 text-red-500 cursor-pointer hover:bg-red-100 transition-colors">✕ Huỷ sửa</button>
            )}
          </div>
        </div>

        {/* Ngày & số người */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">Ngày khởi hành</label>
            <input type="date" value={tripForm.start_date} min={!editingTripId ? today : undefined}
              onChange={e => {
                const start = e.target.value;
                let end = "";
                if (start && duration) {
                  const d = new Date(start);
                  d.setDate(d.getDate() + duration - 1);
                  end = d.toISOString().split("T")[0];
                }
                setTripForm(f => ({ ...f, start_date: start, end_date: end }));
              }}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">Ngày kết thúc</label>
            <input type="date" value={tripForm.end_date} disabled
              className="w-full border border-gray-100 rounded-xl px-3 py-2.5 text-sm bg-gray-50 text-gray-400 cursor-not-allowed" />
            {tripForm.end_date && (
              <p className="text-[10px] text-orange-500 mt-1 font-semibold">Tự tính từ {duration} ngày tour</p>
            )}
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">Tối thiểu (người)</label>
            <input type="number" min={1} value={tripForm.min_people}
              onChange={e => setTripForm(f => ({ ...f, min_people: Number(e.target.value) }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">Tối đa (người)</label>
            <input type="number" min={1} value={tripForm.max_people}
              onChange={e => setTripForm(f => ({ ...f, max_people: Number(e.target.value) }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400" />
          </div>
        </div>

        {/* Info tối thiểu */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 text-xs text-blue-700 mb-4 flex items-start gap-2">
          <span className="shrink-0">ℹ️</span>
          <span>Tour vẫn khởi hành kể cả khi chưa đủ tối đa, miễn là đạt số tối thiểu. Nếu chưa đủ tối thiểu có thể huỷ hoặc dời chuyến.</span>
        </div>

        {/* ── Chọn dịch vụ ── */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Dịch vụ đi kèm ({filteredServices.length})</p>
            <div className="flex gap-2">
              <input type="text" placeholder="Tìm dịch vụ..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-orange-400 w-40" />
              <select value={filterType} onChange={e => setFilterType(e.target.value)} className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-orange-400 cursor-pointer">
                {SERVICE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>

          {globalServices.length === 0 ? (
            <div className="py-8 text-center border-2 border-dashed border-gray-100 rounded-xl">
              <p className="text-xs text-gray-400">Không tìm thấy dịch vụ nào. Kiểm tra API <code>/services/all</code></p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-h-72 overflow-y-auto pr-1">
              {filteredServices.map(service => {
                const selected = tripForm.selected_services.find(s => s.service_id === service._id);
                return (
                  <div key={service._id} onClick={() => toggleService(service)}
                    className={`p-4 rounded-xl cursor-pointer transition-all border-2 ${selected ? "border-orange-400 bg-orange-50/50" : "border-transparent bg-gray-50 hover:bg-gray-100"}`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1 pr-2">
                        <span className="text-[9px] bg-white border border-gray-200 px-1.5 rounded text-gray-400 uppercase mb-1 block w-fit">{service.type}</span>
                        <p className="text-xs font-bold text-gray-700 leading-tight">{service.serviceName}</p>
                        <p className="text-[10px] text-orange-500 font-bold mt-1">{service.basePrice.toLocaleString()}₫ <span className="text-gray-400 font-normal">/ {service.unit}</span></p>
                      </div>
                      {selected && <CheckedIcon />}
                    </div>
                    {selected && (
                      <div className="mt-2 pt-2 border-t border-orange-100" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] text-gray-400 font-bold uppercase">Qty:</span>
                          <input type="number" className="flex-1 p-1.5 bg-white border border-orange-100 rounded-lg text-center text-xs text-orange-500 font-black outline-none"
                            value={selected.quantity} onChange={e => updateServiceQty(service._id, Number(e.target.value))} />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Selected services summary */}
          {tripForm.selected_services.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {tripForm.selected_services.map(s => {
                const svc = globalServices.find(g => g._id === s.service_id);
                return svc ? (
                  <span key={s.service_id} className="text-[10px] bg-orange-100 text-orange-700 font-semibold px-2 py-0.5 rounded-full">
                    {svc.serviceName} ×{s.quantity}
                  </span>
                ) : null;
              })}
            </div>
          )}
        </div>

        {/* Submit button */}
        <button
          onClick={handleSubmitTrip}
          disabled={loading}
          className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold border-none cursor-pointer transition-colors disabled:opacity-60">
          {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Đang xử lý...</span>
            : editingTripId ? "💾 Lưu cập nhật"
              : "+ Thêm chuyến"}
        </button>
      </div>

      {/* ── Danh sách chuyến ── */}
      {localTrips.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center text-gray-400">
          <p className="text-4xl mb-3">🚀</p><p className="font-semibold text-sm">Chưa có chuyến đi nào</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{localTrips.filter(t => t.status !== "deleted").length} chuyến đi</span>
            <span className="text-xs text-gray-400">{localTrips.filter(t => t.status === "open").length} đang mở · {localTrips.filter(t => new Date(t.end_date) < new Date() && t.status !== "deleted").length} đã qua</span>
          </div>
          <div className="divide-y divide-gray-50">
            {[...localTrips.filter(t => t.status !== "deleted")].sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()).map(trip => {
              const start = new Date(trip.start_date);
              const end = new Date(trip.end_date);
              const slotsLeft = trip.max_people - trip.booked_people;
              const isPast = end < new Date();
              const nights = Math.ceil((end.getTime() - start.getTime()) / 86400000);
              const dayLabels = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
              const minPeople = trip.min_people ?? 1;
              const reachedMin = trip.booked_people >= minPeople;
              return (
                <div key={trip._id} className={`px-5 py-4 ${isPast ? "opacity-40" : ""}`}>
                  <div className="flex items-start gap-4">
                    {/* Date badge */}
                    <div className="shrink-0 text-center bg-orange-50 rounded-xl px-3 py-2 min-w-[60px]">
                      <p className="text-[10px] font-bold text-orange-400">{dayLabels[start.getDay()]}</p>
                      <p className="text-lg font-black text-orange-600 leading-none">{String(start.getDate()).padStart(2, "0")}</p>
                      <p className="text-[10px] text-orange-400 font-semibold">T{start.getMonth() + 1}</p>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-bold text-gray-800">{start.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}</span>
                        <span className="text-gray-400 text-xs">→</span>
                        <span className="text-sm font-bold text-gray-800">{end.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}</span>
                        <span className="text-[11px] text-gray-400">({nights + 1} ngày {nights} đêm)</span>
                      </div>
                      <div className="flex items-center gap-3 flex-wrap mb-2">
                        <span className="text-[11px] font-black text-orange-500">{(trip.price || trip.base_price || 0).toLocaleString("vi-VN")}đ</span>
                        <span className="text-[11px] text-gray-400">{trip.booked_people}/{trip.max_people} · còn <span className={slotsLeft <= 3 ? "text-red-500 font-bold" : "text-emerald-600 font-semibold"}>{slotsLeft} chỗ</span></span>
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${reachedMin ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                          {reachedMin ? "✓" : "⚠"} Tối thiểu {minPeople} {reachedMin ? "(đạt)" : `(cần thêm ${minPeople - trip.booked_people})`}
                        </span>
                      </div>
                      {/* Services */}
                      {trip.services?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {trip.services.map((s, idx) => (
                            <span key={idx} className="text-[9px] font-bold bg-gray-50 text-gray-400 px-2 py-0.5 rounded-lg border border-gray-100">
                              {s.note || "Dịch vụ"} ×{s.quantity}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => toggleStatus(trip)} disabled={trip.status === "full"}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full border cursor-pointer transition-colors disabled:cursor-not-allowed ${trip.status === "open" ? "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100" : trip.status === "full" ? "bg-red-50 text-red-400 border-red-200" : "bg-gray-100 text-gray-400 border-gray-200 hover:bg-gray-200"}`}>
                        {trip.status === "open" ? "Mở" : trip.status === "full" ? "Đầy" : "Đóng"}
                      </button>
                      <button onClick={() => handleEditClick(trip)} className="text-xs text-blue-500 hover:bg-blue-50 px-2.5 py-1.5 rounded-lg border-none cursor-pointer bg-transparent font-semibold">Sửa</button>
                      <button onClick={() => deleteTrip(trip._id)} className="text-xs text-red-400 hover:bg-red-50 px-2.5 py-1.5 rounded-lg border-none cursor-pointer bg-transparent font-semibold">Xoá</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}