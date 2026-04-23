"use client";
import { useState, useEffect, useCallback } from "react";

interface BookingRaw {
  _id: string;
  tourName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  departureDate: any;
  adults: number;
  children: number;
  infants: number;
  total: number;
  singleRooms: number;
  status: string;
  createdAt: any;
  orderId: string;
  vnpay?: {
    amount?: number;
    status?: string;
    bank_code?: string;
    txnRef?: string;
    transactionNo?: string;
  };
}

interface Booking {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  tourName: string;
  departureDate: string;
  adults: number;
  children: number;
  infants: number;
  totalPrice: number;
  status: string;
  singleRooms: number;
  createdAt: string;
}

function normalizeStatus(raw: string): string {
  const map: Record<string, string> = {
    confirmed: "paid_100",
    paid_100: "paid_100",
    paid_50: "paid_50",
    pending: "pending",
    cancelled: "cancelled",
    canceled: "cancelled",
    refunded: "refunded",
  };
  return map[raw?.toLowerCase()] ?? raw ?? "pending";
}

function normalizeBooking(raw: any): Booking {
  const parseDate = (d: any) => (d?.$date ? d.$date : d) || "";
  const resolvedPrice = Number(raw.payNow ?? raw.total_price ?? raw.vnpay?.amount ?? 0);
  const resolvedStatus = (() => {
    const s = normalizeStatus(raw.status);
    if (s === "refunded" || s === "cancelled") return s;
    if (raw.paymentPct === 100) return "paid_100";
    if (raw.paymentPct === 50) return "paid_50";
    return s;
  })();
  return {
    id: raw._id || raw.id,
    customerName: raw.contactName || "—",
    email: raw.contactEmail || "—",
    phone: raw.contactPhone || "—",
    tourName: raw.tourName || "—",
    departureDate: parseDate(raw.departureDate),
    adults: Number(raw.adults ?? 0),
    children: Number(raw.children ?? 0),
    infants: Number(raw.infants ?? 0),
    totalPrice: resolvedPrice,
    status: resolvedStatus,
    singleRooms: Number(raw.singleRooms ?? 0),
    createdAt: parseDate(raw.createdAt),
  };
}

const fmt = (n: number) => n.toLocaleString("vi-VN") + "đ";

function fmtDate(str: string) {
  if (!str || str === "—") return "—";
  const d = new Date(str);
  return isNaN(d.getTime())
    ? str
    : d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  if (s === "paid_100")
    return (
      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full text-[10px] font-bold">
        ✓ Đã TT 100%
      </span>
    );
  if (s === "paid_50")
    return (
      <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full text-[10px] font-bold">
        ◑ Đã TT 50%
      </span>
    );
  if (s === "cancelled")
    return (
      <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded-full text-[10px] font-bold">
        ✕ Đã hủy
      </span>
    );
  if (s === "refunded")
    return (
      <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-400 border border-gray-200 px-2.5 py-1 rounded-full text-[10px] font-bold">
        ↩ Đã hoàn
      </span>
    );
  if (s === "pending")
    return (
      <span className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-700 border border-yellow-200 px-2.5 py-1 rounded-full text-[10px] font-bold">
        ○ Chưa xác nhận
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-500 border border-gray-200 px-2.5 py-1 rounded-full text-[10px] font-bold">
      ○ {status}
    </span>
  );
}

function StatusSelect({
  booking,
  onUpdate,
}: {
  booking: Booking;
  onUpdate: (id: string, newStatus: string) => void;
}) {
  const s = booking.status;

  // Đã hoàn - khóa hoàn toàn
  if (s === "refunded") {
    return (
      <span className="text-[11px] px-2 py-1.5 border border-gray-200 rounded-lg bg-gray-100 text-gray-400 font-medium cursor-not-allowed select-none">
        ↩ Đã hoàn
      </span>
    );
  }

 // Đã hủy - chỉ được chuyển sang Đã hoàn
  if (s === "cancelled") {
    return (
      <select
        defaultValue=""
        onChange={(e) => {
          if (e.target.value) onUpdate(booking.id, e.target.value);
        }}
        className="text-[11px] p-1.5 border border-gray-200 rounded-lg bg-white font-medium outline-none focus:border-orange-500 cursor-pointer"
      >
        <option value="" disabled>Cập nhật...</option>
        <option value="refunded">↩ Đã hoàn</option>
      </select>
    );
  }

  // Đã TT 100% - chỉ được hủy hoặc hoàn
  if (s === "paid_100") {
    return (
      <select
        defaultValue=""
        onChange={(e) => {
          if (e.target.value) onUpdate(booking.id, e.target.value);
        }}
        className="text-[11px] p-1.5 border border-gray-200 rounded-lg bg-white font-medium outline-none focus:border-orange-500 cursor-pointer"
      >
        <option value="" disabled>Cập nhật...</option>
        <option value="cancelled">✕ Đã hủy</option>
        <option value="refunded">↩ Đã hoàn</option>
      </select>
    );
  }

  // paid_50 / pending - được lên 100%, hủy, hoàn
  return (
    <select
      defaultValue=""
      onChange={(e) => {
        if (e.target.value) onUpdate(booking.id, e.target.value);
      }}
      className="text-[11px] p-1.5 border border-gray-200 rounded-lg bg-white font-medium outline-none focus:border-orange-500 cursor-pointer"
    >
      <option value="" disabled>Cập nhật...</option>
      <option value="paid_100">✓ Đã TT 100%</option>
      <option value="cancelled">✕ Đã hủy</option>
      <option value="refunded">↩ Đã hoàn</option>
    </select>
  );
}

const API = "https://db-pickyourway.vercel.app/api";

const FILTER_OPTIONS = [
  { value: "all", label: "Tất cả" },
  { value: "pending", label: "Chưa xác nhận" },
  { value: "paid_50", label: "Đã TT 50%" },
  { value: "paid_100", label: "Đã TT 100%" },
  { value: "cancelled", label: "Đã hủy" },
  { value: "refunded", label: "Đã hoàn" },
];

export function BookingTab() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilter] = useState<string>("all");
  const [expandedId, setExpanded] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/bookings/admin/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const json = await res.json();
      const raw: BookingRaw[] = Array.isArray(json) ? json : (json.data ?? []);
      setBookings(raw.map(normalizeBooking));
      setIsLive(true);
    } catch {
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Vui lòng đăng nhập!");
    try {
      const res = await fetch(`${API}/bookings/admin/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newStatus }),
      });
      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
        );
        alert("Cập nhật thành công!");
      }
    } catch {
      alert("Lỗi kết nối!");
    }
  };

  const filtered = bookings.filter((b) => {
    const matchStatus = filterStatus === "all" || b.status === filterStatus;
    const q = search.toLowerCase();
    return (
      matchStatus &&
      (b.customerName.toLowerCase().includes(q) ||
        b.tourName.toLowerCase().includes(q) ||
        b.phone.includes(q) ||
        b.email.toLowerCase().includes(q))
    );
  });

  const revenue = bookings
    .filter((b) => b.status !== "cancelled" && b.status !== "refunded")
    .reduce((s, b) => s + b.totalPrice, 0);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="mx-auto px-4 py-6 space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-black text-gray-900">📋 Quản lý Booking</h1>
            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isLive ? "bg-emerald-500" : "bg-amber-400"}`} />
              {isLive ? "Dữ liệu thật từ API" : "Chưa tải được dữ liệu"}
            </p>
          </div>
          <button
            onClick={fetchBookings}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60"
          >
            {loading ? "Đang tải..." : "↻ Làm mới"}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-[11px] text-gray-500 font-semibold mb-1">Tổng đơn</p>
            <p className="text-2xl font-black text-gray-900">{bookings.length}</p>
          </div>
          <div className="bg-yellow-50 rounded-xl border border-yellow-100 p-4">
            <p className="text-[11px] text-yellow-600 font-semibold mb-1">Chưa xác nhận</p>
            <p className="text-2xl font-black text-yellow-700">
              {bookings.filter((b) => b.status === "pending").length}
            </p>
          </div>
          <div className="bg-blue-50 rounded-xl border border-blue-100 p-4">
            <p className="text-[11px] text-blue-600 font-semibold mb-1">Đã TT 50%</p>
            <p className="text-2xl font-black text-blue-700">
              {bookings.filter((b) => b.status === "paid_50").length}
            </p>
          </div>
          <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-4">
            <p className="text-[11px] text-emerald-600 font-semibold mb-1">Đã TT 100%</p>
            <p className="text-2xl font-black text-emerald-700">
              {bookings.filter((b) => b.status === "paid_100").length}
            </p>
          </div>
          <div className="bg-orange-500 rounded-xl p-4 text-white shadow-lg shadow-orange-200 col-span-2 md:col-span-1">
            <p className="text-[11px] text-white/80 font-semibold mb-1">Doanh thu</p>
            <p className="text-xl font-black">{fmt(revenue)}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên, email, SĐT, tour..."
            className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-orange-400 bg-white shadow-sm"
          />
          <div className="flex gap-1.5 bg-white border border-gray-200 rounded-xl p-1 shadow-sm overflow-x-auto">
            {FILTER_OPTIONS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  filterStatus === f.value
                    ? "bg-orange-500 text-white"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="divide-y divide-gray-50">
            {filtered.length === 0 && (
              <div className="py-16 text-center text-sm text-gray-400">
                Không tìm thấy booking nào.
              </div>
            )}
            {filtered.map((b) => {
              const isExpanded = expandedId === b.id;
              const isTerminal = b.status === "refunded";

              return (
                <div
                  key={b.id}
                  className={`transition-colors ${
                    isTerminal
                      ? "opacity-50 bg-gray-50"
                      : isExpanded
                      ? "bg-orange-50/30"
                      : "hover:bg-gray-50/60"
                  }`}
                >
                  <div
                    className="px-5 py-4 flex items-center gap-4 cursor-pointer"
                    onClick={() => setExpanded(isExpanded ? null : b.id)}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0 ${
                        isTerminal
                          ? "bg-gray-300"
                          : "bg-gradient-to-br from-orange-400 to-amber-400"
                      }`}
                    >
                      {b.customerName.charAt(0).toUpperCase()}
                    </div>

                    {/* Name + Tour */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold ${isTerminal ? "text-gray-400" : "text-gray-900"}`}>
                        {b.customerName}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{b.tourName}</p>
                    </div>

                    {/* Departure */}
                    <div className="hidden md:block shrink-0 text-right">
                      <p className="text-xs font-semibold text-gray-700">{fmtDate(b.departureDate)}</p>
                      <p className="text-[10px] text-gray-400 uppercase">Khởi hành</p>
                    </div>

                    {/* Price + Badge */}
                    <div className="shrink-0 text-right">
                      <p className={`text-sm font-black ${isTerminal ? "text-gray-400" : "text-orange-600"}`}>
                        {fmt(b.totalPrice)}
                      </p>
                      <StatusBadge status={b.status} />
                    </div>

                    {/* Status select */}
                    <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                      <StatusSelect booking={b} onUpdate={handleUpdateStatus} />
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="px-5 pb-5 animate-in fade-in slide-in-from-top-1 duration-200">
                      <div className="bg-white rounded-xl border border-gray-100 p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs shadow-inner">
                        <div>
                          <p className="text-gray-400 font-bold uppercase text-[9px] mb-1">Liên hệ</p>
                          <p className="font-medium text-slate-700">{b.email}</p>
                          <p className="font-medium text-slate-700">{b.phone}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 font-bold uppercase text-[9px] mb-1">Số lượng khách</p>
                          <p className="text-slate-700">{b.adults} Người lớn</p>
                          {b.children > 0 && <p className="text-slate-700">{b.children} Trẻ em</p>}
                          {b.infants > 0 && <p className="text-slate-700">{b.infants} Em bé</p>}
                          {b.singleRooms > 0 && <p className="text-slate-700">+{b.singleRooms} Phòng đơn</p>}
                        </div>
                        <div>
                          <p className="text-gray-400 font-bold uppercase text-[9px] mb-1">Ngày đặt đơn</p>
                          <p className="text-slate-700">{fmtDate(b.createdAt)}</p>
                        </div>
                        <div className="flex flex-col justify-center gap-1">
                          <p className="text-gray-400 font-bold uppercase text-[9px]">Mã đơn hàng</p>
                          <code className="text-[10px] bg-gray-100 p-1 rounded text-gray-600 break-all">
                            {b.id}
                          </code>
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