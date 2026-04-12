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
  status?: string; // Trạng thái enum từ Backend
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
  status: string; // Thêm vào để đồng bộ với Backend enum
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
    raw.paymentStatus ?? raw.payment_status ?? raw.status ?? "pending",
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
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Hàm cập nhật trạng thái dùng chung cho cả nút bấm và select
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return alert("Vui lòng đăng nhập!");

    try {
      const res = await fetch(`${API}/bookings/${id}`, {
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
                  paymentStatus: newStatus as any,
                  completed: newStatus === "paid",
                }
              : b,
          ),
        );
      } else {
        alert(data.message || "Không thể cập nhật trạng thái");
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
        b.tourName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header & Stats */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-black text-gray-900">
              📋 Quản lý Booking
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              {isLive ? "● Dữ liệu trực tuyến" : "○ Đang ngoại tuyến"}
            </p>
          </div>
          <button
            onClick={fetchBookings}
            className="px-4 py-2 bg-orange-500 text-white rounded-xl text-sm font-bold border-none cursor-pointer"
          >
            ↻ Làm mới
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            className="md:col-span-2 p-3 rounded-xl border border-gray-200 outline-none focus:border-orange-500 text-sm"
            placeholder="Tìm kiếm khách hàng, tour..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="p-3 rounded-xl border border-gray-200 outline-none text-sm"
            value={filterStatus}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ thanh toán</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="paid">Đã thanh toán</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>

        {/* Booking List */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-gray-400 animate-pulse">
              Đang tải dữ liệu...
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filtered.map((b) => (
                <div
                  key={b.id}
                  className="p-4 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-wrap md:flex-nowrap">
                    {/* User Mini Info */}
                    <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs shrink-0">
                      {b.customerName.charAt(0)}
                    </div>

                    <div className="flex-1 min-w-[200px]">
                      <h3 className="text-sm font-bold text-gray-900">
                        {b.customerName}
                      </h3>
                      <p className="text-[11px] text-gray-500">{b.tourName}</p>
                    </div>

                    <div className="hidden md:block text-right min-w-[120px]">
                      <p className="text-xs font-bold text-gray-700">
                        {fmtDate(b.departureDate)}
                      </p>
                      <p className="text-[10px] text-gray-400">Khởi hành</p>
                    </div>

                    <div className="text-right min-w-[100px]">
                      <p className="text-sm font-black text-orange-600">
                        {fmt(b.totalPrice)}
                      </p>
                      <StatusBadge status={b.status} />
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Select Option cho Admin cập nhật nhanh */}
                      <select
                        value={b.status}
                        onChange={(e) =>
                          handleUpdateStatus(b.id, e.target.value)
                        }
                        className="text-[11px] p-1.5 border rounded-lg bg-white font-medium outline-none focus:border-orange-500"
                      >
                        <option value="pending">Chờ TT</option>
                        <option value="confirmed">Xác nhận</option>
                        <option value="paid">Đã thanh toán</option>
                        <option value="cancelled">Hủy đơn</option>
                      </select>

                      <button
                        onClick={() =>
                          setExpanded(expandedId === b.id ? null : b.id)
                        }
                        className="p-2 hover:bg-gray-200 rounded-lg border-none bg-transparent cursor-pointer"
                      >
                        {expandedId === b.id ? "▲" : "▼"}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Detail */}
                  {expandedId === b.id && (
                    <div className="mt-4 pt-4 border-t border-dashed border-gray-200 grid grid-cols-2 md:grid-cols-4 gap-4 text-[12px]">
                      <div>
                        <p className="text-gray-400 uppercase font-bold text-[9px]">
                          Liên hệ
                        </p>
                        <p className="font-medium">{b.email}</p>
                        <p className="font-medium">{b.phone}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 uppercase font-bold text-[9px]">
                          Số lượng
                        </p>
                        <p>
                          {b.adults} Người lớn, {b.children} Trẻ em
                        </p>
                        {b.singleRooms > 0 && <p>+{b.singleRooms} Phòng đơn</p>}
                      </div>
                      <div>
                        <p className="text-gray-400 uppercase font-bold text-[9px]">
                          Ngày đặt
                        </p>
                        <p>{fmtDate(b.createdAt)}</p>
                      </div>
                      <div className="flex items-center justify-end">
                        {b.status !== "paid" && (
                          <button
                            onClick={() => handleUpdateStatus(b.id, "paid")}
                            className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg font-bold border-none cursor-pointer text-[10px]"
                          >
                            ✓ Xác nhận đã xong
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
