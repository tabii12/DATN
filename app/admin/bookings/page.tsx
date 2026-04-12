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
  status: string;
  completed: boolean;
  singleRooms: number;
  singleSupplement: number;
  createdAt: string;
}

// ─────────────────────────── NORMALIZE ───────────────────────────

function normalizeBooking(raw: BookingRaw): Booking {
  const user = raw.user_id;
  const trip = raw.trip_id;

  const name =
    user?.name ||
    user?.fullName ||
    raw.customerName ||
    raw.customer_name ||
    raw.name ||
    raw.fullName ||
    "—";
  const email = user?.email || raw.email || "—";
  const phone =
    user?.phone ||
    user?.phoneNumber ||
    user?.phone_number ||
    raw.phone ||
    raw.phoneNumber ||
    raw.phone_number ||
    "—";
  const tourName = raw.tourName || raw.tour_name || raw.tour?.name || "—";

  const departureDate =
    trip?.start_date ||
    raw.departureDate ||
    raw.departure_date ||
    raw.date ||
    "—";
  const endDate = trip?.end_date || "—";

  const adults = Number(raw.adults ?? raw.numAdults ?? raw.num_adults ?? 1);
  const children = Number(
    raw.children ?? raw.numChildren ?? raw.num_children ?? 0,
  );
  const infants = Number(raw.infants ?? 0);

  const adultPrice = Number(
    raw.pricePerAdult ??
      raw.adultPrice ??
      raw.adult_price ??
      trip?.price ??
      trip?.base_price ??
      raw.price ??
      0,
  );
  const childPrice = Number(
    raw.pricePerChild ??
      raw.childPrice ??
      raw.child_price ??
      raw.childrenPrice ??
      0,
  );
  const totalPrice = Number(
    raw.totalPrice ??
      raw.total_price ??
      raw.grandTotal ??
      adults * adultPrice + children * childPrice,
  );

  const singleRooms = Number(raw.singleRooms ?? raw.single_rooms ?? 0);
  const singleSupplement = Number(
    raw.singleSupplement ?? raw.single_supplement ?? 0,
  );

  const statusRaw = String(
    raw.status ?? raw.paymentStatus ?? raw.payment_status ?? "pending",
  );

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
    paymentStatus:
      statusRaw === "paid"
        ? "paid"
        : statusRaw === "deposit"
          ? "deposit"
          : "pending",
    status: statusRaw,
    completed: Boolean(raw.completed || statusRaw === "paid"),
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
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  if (s === "paid")
    return (
      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full text-[10px] font-bold">
        ✓ Đã TT 100%
      </span>
    );
  if (s === "confirmed")
    return (
      <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full text-[10px] font-bold">
        ● Đã xác nhận
      </span>
    );
  if (s === "cancelled")
    return (
      <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded-full text-[10px] font-bold">
        ✕ Đã hủy
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-500 border border-gray-200 px-2.5 py-1 rounded-full text-[10px] font-bold">
      ○ Chờ TT
    </span>
  );
}

// ─────────────────────────── MAIN ───────────────────────────

const API = "https://db-pickyourway.vercel.app/api";

export default function BookingPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilter] = useState<string>("all");
  const [expandedId, setExpanded] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API}/bookings/admin/all`, { headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();
      const raw: BookingRaw[] = Array.isArray(json)
        ? json
        : (json.data ?? json.bookings ?? []);

      setBookings(raw.map(normalizeBooking));
      setIsLive(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi kết nối");
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
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

      const data = await res.json();
      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) =>
            b.id === id
              ? {
                  ...b,
                  status: newStatus,
                  paymentStatus:
                    newStatus === "paid" ? "paid" : (b.paymentStatus as any),
                  completed: newStatus === "paid",
                }
              : b,
          ),
        );
        alert("Cập nhật trạng thái thành công!");
      } else {
        alert(data.message || "Lỗi khi cập nhật");
      }
    } catch (err) {
      alert("Lỗi kết nối server");
    }
  };

  const filtered = bookings.filter((b) => {
    const matchStatus = filterStatus === "all" || b.status === filterStatus;
    const q = search.toLowerCase();
    return (
      matchStatus &&
      (!q ||
        b.customerName.toLowerCase().includes(q) ||
        b.email.toLowerCase().includes(q) ||
        b.phone.includes(q) ||
        b.tourName.toLowerCase().includes(q))
    );
  });

  const totalRevenue = bookings.reduce((s, b) => s + b.totalPrice, 0);
  const paidCount = bookings.filter((b) => b.status === "paid").length;
  const confirmedCount = bookings.filter(
    (b) => b.status === "confirmed",
  ).length;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="mx-auto px-4 py-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-black text-gray-900">
              📋 Quản lý Booking
            </h1>
            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${isLive ? "bg-emerald-500" : "bg-amber-400"}`}
              />
              {isLive ? "Dữ liệu thật từ API" : "Chưa tải được dữ liệu"}
            </p>
          </div>
          <button
            onClick={fetchBookings}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl border-none cursor-pointer transition-colors disabled:opacity-60"
          >
            {loading ? "Đang tải..." : "↻ Làm mới"}
          </button>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-[11px] text-gray-500 font-semibold mb-1">
              Tổng booking
            </p>
            <p className="text-2xl font-black text-gray-900">
              {bookings.length}
            </p>
          </div>
          <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-4">
            <p className="text-[11px] text-emerald-600 font-semibold mb-1">
              Đã thanh toán
            </p>
            <p className="text-2xl font-black text-emerald-700">{paidCount}</p>
          </div>
          <div className="bg-blue-50 rounded-xl border border-blue-100 p-4">
            <p className="text-[11px] text-blue-600 font-semibold mb-1">
              Đã xác nhận
            </p>
            <p className="text-2xl font-black text-blue-700">
              {confirmedCount}
            </p>
          </div>
          <div className="bg-orange-500 rounded-xl p-4 text-white">
            <p className="text-[11px] text-white/80 font-semibold mb-1">
              Doanh thu
            </p>
            <p className="text-xl font-black">{fmt(totalRevenue)}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên, email, SĐT, tour..."
            className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-orange-400 bg-white"
          />
          <div className="flex gap-1.5 bg-white border border-gray-200 rounded-xl p-1">
            {["all", "pending", "confirmed", "paid", "cancelled"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border-none transition-colors ${filterStatus === f ? "bg-orange-500 text-white" : "text-gray-500 bg-transparent hover:bg-gray-50"}`}
              >
                {f === "all"
                  ? "Tất cả"
                  : f === "paid"
                    ? "Đã TT"
                    : f === "confirmed"
                      ? "Xác nhận"
                      : f === "cancelled"
                        ? "Đã hủy"
                        : "Chờ TT"}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="divide-y divide-gray-50">
            {filtered.map((b) => {
              const isExpanded = expandedId === b.id;
              return (
                <div
                  key={b.id}
                  className={`transition-colors ${isExpanded ? "bg-orange-50/30" : "hover:bg-gray-50/60"}`}
                >
                  <div
                    className="px-5 py-4 flex items-center gap-4 cursor-pointer"
                    onClick={() => setExpanded(isExpanded ? null : b.id)}
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center text-white text-xs font-black shrink-0">
                      {b.customerName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900">
                        {b.customerName}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {b.tourName}
                      </p>
                    </div>
                    <div className="hidden md:block shrink-0 text-right">
                      <p className="text-xs font-semibold text-gray-700">
                        {fmtDate(b.departureDate)}
                      </p>
                      <p className="text-[10px] text-gray-400">Khởi hành</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-black text-orange-500">
                        {fmt(b.totalPrice)}
                      </p>
                      <StatusBadge status={b.status} />
                    </div>
                    <div
                      className="shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <select
                        value={b.status}
                        onChange={(e) =>
                          handleUpdateStatus(b.id, e.target.value)
                        }
                        className="text-[11px] p-1.5 border rounded-lg bg-white font-medium outline-none focus:border-orange-500 cursor-pointer"
                      >
                        <option value="pending">Chờ TT</option>
                        <option value="confirmed">Xác nhận</option>
                        <option value="paid">Đã thanh toán</option>
                        <option value="cancelled">Hủy đơn</option>
                      </select>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-5 pb-5 animate-in fade-in duration-200">
                      <div className="bg-white rounded-xl border border-gray-100 p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                        <div>
                          <p className="text-gray-400 font-bold uppercase text-[9px] mb-1">
                            Liên hệ
                          </p>
                          <p className="font-medium">{b.email}</p>
                          <p className="font-medium">{b.phone}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 font-bold uppercase text-[9px] mb-1">
                            Số lượng khách
                          </p>
                          <p>{b.adults} Người lớn</p>
                          {b.children > 0 && <p>{b.children} Trẻ em</p>}
                          {b.singleRooms > 0 && (
                            <p>+{b.singleRooms} Phòng đơn</p>
                          )}
                        </div>
                        <div>
                          <p className="text-gray-400 font-bold uppercase text-[9px] mb-1">
                            Ngày đặt
                          </p>
                          <p>{fmtDate(b.createdAt)}</p>
                        </div>
                        <div className="flex flex-col justify-center gap-2">
                          <p className="text-gray-400 font-bold uppercase text-[9px]">
                            ID: {b.id}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {!loading && filtered.length === 0 && (
              <div className="py-20 text-center text-gray-400 text-sm">
                Không tìm thấy booking phù hợp
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
