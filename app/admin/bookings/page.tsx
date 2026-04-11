"use client";
import { useState, useEffect, useCallback } from "react";

// ─────────────────────────── TYPES ───────────────────────────

interface BookingRaw {
  _id?: string;
  id?: string;
  user_id?: {
    _id?: string;
    name?: string;
    fullName?: string;
    email?: string;
    phone?: string;
    phoneNumber?: string;
    phone_number?: string;
  };
  customerName?: string;
  customer_name?: string;
  name?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  phoneNumber?: string;
  phone_number?: string;
  tourName?: string;
  tour_name?: string;
  tour?: { name?: string };
  trip_id?: {
    start_date?: string;
    end_date?: string;
    price?: number;
    base_price?: number;
  };
  departureDate?: string;
  departure_date?: string;
  date?: string;
  adults?: number;
  numAdults?: number;
  num_adults?: number;
  children?: number;
  numChildren?: number;
  num_children?: number;
  infants?: number;
  price?: number;
  adultPrice?: number;
  adult_price?: number;
  pricePerAdult?: number;
  childPrice?: number;
  child_price?: number;
  childrenPrice?: number;
  pricePerChild?: number;
  totalPrice?: number;
  total_price?: number;
  grandTotal?: number;
  paymentStatus?: string;
  payment_status?: string;
  status?: string;
  completed?: boolean;
  singleRooms?: number;
  single_rooms?: number;
  singleSupplement?: number;
  single_supplement?: number;
  createdAt?: string;
  created_at?: string;
}

interface Booking {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  tourName: string;
  departureDate: string;
  endDate: string;
  adults: number;
  children: number;
  infants: number;
  adultPrice: number;
  childPrice: number;
  totalPrice: number;
  paymentStatus: "paid" | "deposit" | "pending";
  completed: boolean;
  singleRooms: number;
  singleSupplement: number;
  createdAt: string;
}

// ─────────────────────────── NORMALIZE ───────────────────────────

function normalizeBooking(raw: BookingRaw): Booking {
  const user   = raw.user_id;
  const trip   = raw.trip_id;

  const name  = user?.name || user?.fullName
    || raw.customerName || raw.customer_name || raw.name || raw.fullName || "—";
  const email = user?.email || raw.email || "—";
  const phone = user?.phone || user?.phoneNumber || user?.phone_number
    || raw.phone || raw.phoneNumber || raw.phone_number || "—";

  const tourName = raw.tourName || raw.tour_name || raw.tour?.name || "—";

  const departureDate = trip?.start_date
    || raw.departureDate || raw.departure_date || raw.date || "—";
  const endDate = trip?.end_date || "—";

  const adults   = Number(raw.adults   ?? raw.numAdults   ?? raw.num_adults   ?? 1);
  const children = Number(raw.children ?? raw.numChildren ?? raw.num_children ?? 0);
  const infants  = Number(raw.infants  ?? 0);

  const adultPrice = Number(
    raw.pricePerAdult ?? raw.adultPrice ?? raw.adult_price
    ?? trip?.price ?? trip?.base_price ?? raw.price ?? 0
  );
  const childPrice = Number(
    raw.pricePerChild ?? raw.childPrice ?? raw.child_price
    ?? raw.childrenPrice ?? 0
  );
  const totalPrice = Number(
    raw.totalPrice ?? raw.total_price ?? raw.grandTotal
    ?? (adults * adultPrice + children * childPrice)
  );

  const singleRooms      = Number(raw.singleRooms      ?? raw.single_rooms      ?? 0);
  const singleSupplement = Number(raw.singleSupplement ?? raw.single_supplement ?? 0);

  const statusRaw = String(raw.paymentStatus ?? raw.payment_status ?? raw.status ?? "");
  const paymentStatus: Booking["paymentStatus"] =
    statusRaw === "paid" ? "paid"
    : statusRaw === "deposit" ? "deposit"
    : "pending";

  return {
    id: String(raw._id ?? raw.id ?? ""),
    customerName: name,
    email,
    phone,
    tourName,
    departureDate,
    endDate,
    adults,
    children,
    infants,
    adultPrice,
    childPrice,
    totalPrice,
    paymentStatus,
    completed: Boolean(raw.completed),
    singleRooms,
    singleSupplement,
    createdAt: String(raw.createdAt ?? raw.created_at ?? ""),
  };
}

// ─────────────────────────── HELPERS ───────────────────────────

const fmt = (n: number) => n.toLocaleString("vi-VN") + "đ";

function fmtDate(str: string) {
  if (!str || str === "—") return "—";
  const d = new Date(str);
  if (isNaN(d.getTime())) return str;
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function StatusBadge({ status }: { status: Booking["paymentStatus"] }) {
  if (status === "paid")
    return <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full text-xs font-semibold">✓ Đã TT 100%</span>;
  if (status === "deposit")
    return <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full text-xs font-semibold">◑ Đã cọc</span>;
  return <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-500 border border-gray-200 px-2.5 py-1 rounded-full text-xs font-semibold">○ Chờ TT</span>;
}

// ─────────────────────────── MAIN ───────────────────────────

const API = "https://db-pickyourway.vercel.app/api";

export default function BookingPage() {
  const [bookings, setBookings]   = useState<Booking[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [isLive, setIsLive]       = useState(false);
  const [search, setSearch]       = useState("");
  const [filterStatus, setFilter] = useState<"all" | "paid" | "deposit" | "pending">("all");
  const [expandedId, setExpanded] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // ── FIX: thêm Authorization token ──
      const token = typeof window !== "undefined"
        ? localStorage.getItem("token") : null;

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API}/bookings/admin/all`, { headers });

      if (res.status === 401 || res.status === 403) {
        throw new Error("Không có quyền truy cập. Vui lòng đăng nhập lại.");
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();
      const raw: BookingRaw[] = Array.isArray(json)
        ? json
        : (json.data ?? json.bookings ?? json.results ?? []);

      setBookings(raw.map(normalizeBooking));
      setIsLive(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Lỗi không xác định";
      setError(msg);
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const markCompleted = async (id: string) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    try {
      await fetch(`${API}/bookings/${id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ completed: true }),
      });
    } catch {}
    setBookings(prev => prev.map(b => b.id === id ? { ...b, completed: true } : b));
  };

  // ── Derived ──
  const filtered = bookings.filter(b => {
    const matchStatus = filterStatus === "all" || b.paymentStatus === filterStatus;
    const q = search.toLowerCase();
    const matchSearch = !q
      || b.customerName.toLowerCase().includes(q)
      || b.email.toLowerCase().includes(q)
      || b.phone.includes(q)
      || b.tourName.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const totalRevenue = bookings.reduce((s, b) => s + b.totalPrice, 0);
  const paidCount    = bookings.filter(b => b.paymentStatus === "paid").length;
  const depositCount = bookings.filter(b => b.paymentStatus === "deposit").length;
  const doneCount    = bookings.filter(b => b.completed).length;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className=" mx-auto px-4 py-6 space-y-5">

        {/* ── Header ── */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-black text-gray-900">📋 Quản lý Booking</h1>
            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isLive ? "bg-emerald-500" : "bg-amber-400"}`}/>
              {isLive ? "Dữ liệu thật từ API" : "Chưa tải được dữ liệu"}
            </p>
          </div>
          <button onClick={fetchBookings} disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl border-none cursor-pointer transition-colors disabled:opacity-60">
            {loading
              ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Đang tải...</>
              : "↻ Làm mới"}
          </button>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm flex items-start gap-2">
            <span className="shrink-0 mt-0.5">⚠️</span>
            <div>
              <p className="font-semibold">Lỗi tải dữ liệu</p>
              <p className="text-xs mt-0.5 text-red-500">{error}</p>
            </div>
          </div>
        )}

        {/* ── Stats cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Tổng booking",    value: bookings.length,         color: "bg-white",         text: "text-gray-900" },
            { label: "Đã thanh toán",   value: paidCount,               color: "bg-emerald-50",    text: "text-emerald-700" },
            { label: "Đã cọc",          value: depositCount,            color: "bg-amber-50",      text: "text-amber-700" },
            { label: "Hoàn thành",      value: doneCount,               color: "bg-blue-50",       text: "text-blue-700" },
          ].map(s => (
            <div key={s.label} className={`${s.color} rounded-xl border border-gray-100 p-4`}>
              <p className="text-[11px] text-gray-500 font-semibold mb-1">{s.label}</p>
              <p className={`text-2xl font-black ${s.text}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Doanh thu */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-white/80 text-xs font-semibold">Tổng doanh thu</p>
            <p className="text-white text-2xl font-black mt-0.5">{fmt(totalRevenue)}</p>
          </div>
          <div className="text-4xl opacity-30">💰</div>
        </div>

        {/* ── Filters ── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm theo tên, email, SĐT, tour..."
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-orange-400 bg-white"
            />
          </div>
          <div className="flex gap-1.5 bg-white border border-gray-200 rounded-xl p-1">
            {(["all","paid","deposit","pending"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border-none transition-colors ${filterStatus === f ? "bg-orange-500 text-white" : "text-gray-500 bg-transparent hover:bg-gray-50"}`}>
                {f === "all" ? "Tất cả" : f === "paid" ? "Đã TT" : f === "deposit" ? "Đã cọc" : "Chờ TT"}
              </button>
            ))}
          </div>
        </div>

        {/* ── Table ── */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {/* Count */}
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              {filtered.length} booking{search || filterStatus !== "all" ? " (đã lọc)" : ""}
            </span>
          </div>

          {/* Loading skeleton */}
          {loading && bookings.length === 0 && (
            <div className="divide-y divide-gray-50">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="px-5 py-4 flex items-center gap-4 animate-pulse">
                  <div className="w-8 h-8 bg-gray-200 rounded-full shrink-0"/>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-1/3"/>
                    <div className="h-3 bg-gray-100 rounded w-1/2"/>
                  </div>
                  <div className="h-6 bg-gray-200 rounded-full w-20"/>
                </div>
              ))}
            </div>
          )}

          {/* Empty */}
          {!loading && filtered.length === 0 && (
            <div className="py-16 text-center text-gray-400">
              <p className="text-4xl mb-3">📭</p>
              <p className="font-semibold text-sm">Không có booking nào</p>
              {(search || filterStatus !== "all") && (
                <button onClick={() => { setSearch(""); setFilter("all"); }}
                  className="mt-2 text-xs text-orange-500 underline cursor-pointer bg-transparent border-none">
                  Xoá bộ lọc
                </button>
              )}
            </div>
          )}

          {/* Rows */}
          <div className="divide-y divide-gray-50">
            {filtered.map(b => {
              const isExpanded = expandedId === b.id;
              const initials = b.customerName.split(" ").slice(-2).map(w => w[0]?.toUpperCase()).join("") || "?";
              return (
                <div key={b.id} className={`transition-colors ${isExpanded ? "bg-orange-50/30" : "hover:bg-gray-50/60"}`}>
                  {/* Main row */}
                  <div className="px-5 py-4 flex items-center gap-4 cursor-pointer" onClick={() => setExpanded(isExpanded ? null : b.id)}>
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center text-white text-xs font-black shrink-0">
                      {initials}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-gray-900">{b.customerName}</span>
                        {b.completed && <span className="text-[10px] bg-blue-100 text-blue-600 font-bold px-1.5 py-0.5 rounded-full">✓ HT</span>}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                        <span className="text-xs text-gray-400">{b.email}</span>
                        {b.phone !== "—" && <span className="text-xs text-gray-400">📞 {b.phone}</span>}
                      </div>
                    </div>

                    {/* Tour */}
                    <div className="hidden md:block flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-700 truncate">{b.tourName}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {fmtDate(b.departureDate)}
                        {b.endDate !== "—" ? ` → ${fmtDate(b.endDate)}` : ""}
                      </p>
                    </div>

                    {/* Khách */}
                    <div className="hidden lg:block text-right shrink-0">
                      <p className="text-xs text-gray-500">
                        {b.adults} NL{b.children > 0 ? ` · ${b.children} TE` : ""}{b.infants > 0 ? ` · ${b.infants} TN` : ""}
                      </p>
                    </div>

                    {/* Tổng tiền */}
                    <div className="text-right shrink-0">
                      <p className="text-sm font-black text-orange-500">{fmt(b.totalPrice)}</p>
                    </div>

                    {/* Status */}
                    <div className="shrink-0">
                      <StatusBadge status={b.paymentStatus}/>
                    </div>

                    {/* Expand arrow */}
                    <svg className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                    </svg>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="px-5 pb-5">
                      <div className="bg-white rounded-xl border border-gray-100 p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">

                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Khách hàng</p>
                          <p className="text-sm font-semibold text-gray-800">{b.customerName}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{b.email}</p>
                          <p className="text-xs text-gray-500">{b.phone}</p>
                        </div>

                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Tour</p>
                          <p className="text-sm font-semibold text-gray-800">{b.tourName}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {fmtDate(b.departureDate)}
                            {b.endDate !== "—" ? ` → ${fmtDate(b.endDate)}` : ""}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Số khách</p>
                          <div className="space-y-0.5 text-sm text-gray-700">
                            <p>👨 Người lớn: <strong>{b.adults}</strong> × {fmt(b.adultPrice)}</p>
                            {b.children > 0 && <p>🧒 Trẻ em: <strong>{b.children}</strong> × {fmt(b.childPrice)}</p>}
                            {b.infants  > 0 && <p>👶 Trẻ nhỏ: <strong>{b.infants}</strong></p>}
                            {b.singleRooms > 0 && <p>🛏 Phòng đơn: <strong>{b.singleRooms}</strong> (+{fmt(b.singleSupplement)})</p>}
                          </div>
                        </div>

                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Thanh toán</p>
                          <p className="text-xl font-black text-orange-500">{fmt(b.totalPrice)}</p>
                          <div className="mt-1"><StatusBadge status={b.paymentStatus}/></div>
                          {b.createdAt && (
                            <p className="text-[10px] text-gray-400 mt-2">Đặt lúc: {fmtDate(b.createdAt)}</p>
                          )}
                        </div>

                        {/* Hành động */}
                        <div className="col-span-2 md:col-span-3 lg:col-span-4 pt-3 border-t border-gray-100 flex gap-2">
                          {!b.completed ? (
                            <button onClick={() => markCompleted(b.id)}
                              className="flex items-center gap-1.5 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded-lg border-none cursor-pointer transition-colors">
                              ✓ Đánh dấu hoàn thành
                            </button>
                          ) : (
                            <span className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg">
                              ✅ Đã hoàn thành
                            </span>
                          )}
                          <span className="text-[10px] text-gray-400 self-center">ID: {b.id}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}