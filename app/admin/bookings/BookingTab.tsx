"use client";
import { useState, useEffect, useCallback } from "react";

// --- Interfaces ---
interface BookingRaw {
  _id: { $oid: string } | string;
  tourName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  departureDate: { $date: string } | string;
  adults: number;
  children: number;
  infants: number;
  total_members: number;
  total_price: number;
  payNow: number;
  remaining: number;
  paymentPct: number;
  singleRooms: number;
  status: string; // Trực tiếp từ API: pending, confirmed, paid, cancelled, refunded
  createdAt: { $date: string } | string;
  thumbnail: string;
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
  totalMembers: number;
  totalPrice: number;
  payNow: number;
  remaining: number;
  paymentPct: number;
  status: string;
  singleRooms: number;
  createdAt: string;
  thumbnail: string;
}

// --- Logic xử lý dữ liệu ---
function normalizeBooking(raw: any): Booking {
  const resolveId = (id: any) => (id?.$oid ? id.$oid : id) || "";
  const resolveDate = (d: any) => (d?.$date ? d.$date : d) || "";

  return {
    id: resolveId(raw._id),
    customerName: raw.contactName || "—",
    email: raw.contactEmail || "—",
    phone: raw.contactPhone || "—",
    tourName: raw.tourName || "—",
    departureDate: resolveDate(raw.departureDate),
    adults: Number(raw.adults ?? 0),
    children: Number(raw.children ?? 0),
    infants: Number(raw.infants ?? 0),
    totalMembers: Number(raw.total_members ?? 0),
    totalPrice: Number(raw.total_price ?? 0),
    payNow: Number(raw.payNow ?? 0),
    remaining: Number(raw.remaining ?? 0),
    paymentPct: Number(raw.paymentPct ?? 0),
    status: raw.status || "pending", // Dùng trực tiếp giá trị từ API
    singleRooms: Number(raw.singleRooms ?? 0),
    createdAt: resolveDate(raw.createdAt),
    thumbnail: raw.thumbnail || "",
  };
}

const fmt = (n: number) => n.toLocaleString("vi-VN") + "đ";

function fmtDate(str: string) {
  if (!str || str === "—") return "—";
  const d = new Date(str);
  return isNaN(d.getTime())
    ? str
    : d.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
}

// --- Giao diện hiển thị Badge theo Status API ---
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

  return (
    <span className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-700 border border-yellow-200 px-2.5 py-1 rounded-full text-[10px] font-bold">
      ○ Chờ xác nhận
    </span>
  );
}

// --- Menu cập nhật trạng thái ---
function StatusSelect({
  booking,
  onUpdate,
}: {
  booking: Booking;
  onUpdate: (id: string, newStatus: string) => void;
}) {
  const s = booking.status;

  // Nếu đã hoàn tiền thì thường là quy trình cuối cùng, có thể khóa hoặc để mở tùy bạn.
  // Ở đây mình để mở luôn để Admin tối quyền.
  
  return (
    <select
      value={s} // Dùng value={s} để nó luôn hiển thị đúng trạng thái hiện tại của đơn
      onChange={(e) => {
        if (e.target.value && e.target.value !== s) {
          onUpdate(booking.id, e.target.value);
        }
      }}
      className="text-[11px] p-1.5 border border-gray-200 rounded-lg bg-white font-medium outline-none focus:border-orange-500 cursor-pointer shadow-sm"
    >
      <option value="pending">○ Chờ xác nhận</option>
      <option value="confirmed">◑ Đã xác nhận (50%)</option>
      <option value="paid">✓ Đã thanh toán (100%)</option>
      <option value="cancelled">✕ Đã hủy đơn</option>
    </select>
  );
}

const API = "https://db-pickyourway.vercel.app/api";

const FILTER_OPTIONS = [
  { value: "all", label: "Tất cả" },
  { value: "pending", label: "Chờ xác nhận" },
  { value: "confirmed", label: "Đã TT 50%" },
  { value: "paid", label: "Đã TT 100%" },
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
      const res = await fetch(`${API}/bookings/detail/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newStatus }),
      });
      if (res.ok) {
        const result = await res.json();
        setBookings((prev) =>
          prev.map((b) => (b.id === id ? normalizeBooking(result.data) : b)),
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
    .reduce((s, b) => s + b.payNow, 0); // Doanh thu tính trên số tiền thực thu

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="mx-auto px-4 py-6 space-y-5">
        {/* Header & Stats Giữ nguyên UI cũ của bạn */}
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
            className="px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-xl disabled:opacity-60"
          >
            {loading ? "Đang tải..." : "↻ Làm mới"}
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-[11px] text-gray-500 font-semibold mb-1">
              Tổng đơn
            </p>
            <p className="text-2xl font-black text-gray-900">
              {bookings.length}
            </p>
          </div>
          <div className="bg-yellow-50 rounded-xl border border-yellow-100 p-4">
            <p className="text-[11px] text-yellow-600 font-semibold mb-1">
              Chờ xác nhận
            </p>
            <p className="text-2xl font-black text-yellow-700">
              {bookings.filter((b) => b.status === "pending").length}
            </p>
          </div>
          <div className="bg-blue-50 rounded-xl border border-blue-100 p-4">
            <p className="text-[11px] text-blue-600 font-semibold mb-1">
              Đã TT 50%
            </p>
            <p className="text-2xl font-black text-blue-700">
              {bookings.filter((b) => b.status === "confirmed").length}
            </p>
          </div>
          <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-4">
            <p className="text-[11px] text-emerald-600 font-semibold mb-1">
              Đã TT 100%
            </p>
            <p className="text-2xl font-black text-emerald-700">
              {bookings.filter((b) => b.status === "paid").length}
            </p>
          </div>
          <div className="bg-orange-500 rounded-xl p-4 text-white shadow-lg col-span-2 md:col-span-1">
            <p className="text-[11px] text-white/80 font-semibold mb-1">
              Thực thu (payNow)
            </p>
            <p className="text-xl font-black">{fmt(revenue)}</p>
          </div>
        </div>

        {/* Filters & List Giữ nguyên giao diện */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên, email, SĐT, tour..."
            className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none bg-white shadow-sm"
          />
          <div className="flex gap-1.5 bg-white border border-gray-200 rounded-xl p-1 shadow-sm overflow-x-auto">
            {FILTER_OPTIONS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filterStatus === f.value
                    ? "bg-orange-500 text-white"
                    : "text-gray-500"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="divide-y divide-gray-50">
            {filtered.map((b) => {
              const isExpanded = expandedId === b.id;
              const isTerminal =
                b.status === "refunded" || b.status === "cancelled";

              return (
                <div
                  key={b.id}
                  className={`${isTerminal ? "opacity-60 bg-gray-50" : isExpanded ? "bg-orange-50/30" : "hover:bg-gray-50/60"}`}
                >
                  <div
                    className="px-5 py-4 flex items-center gap-4 cursor-pointer"
                    onClick={() => setExpanded(isExpanded ? null : b.id)}
                  >
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0 bg-gradient-to-br from-orange-400 to-amber-400">
                      {b.customerName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">
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
                      <p className="text-[10px] text-gray-400 uppercase">
                        Khởi hành
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-black text-orange-600">
                        {fmt(b.totalPrice)}
                      </p>
                      <StatusBadge status={b.status} />
                    </div>
                    <div
                      className="shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <StatusSelect booking={b} onUpdate={handleUpdateStatus} />
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-5 pb-5">
                      <div className="bg-white rounded-xl border border-gray-100 p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs shadow-inner">
                        <div>
                          <p className="text-gray-400 font-bold uppercase text-[9px] mb-1 text-orange-500">
                            Thanh toán
                          </p>
                          <p className="font-medium">
                            Đã thu: {fmt(b.payNow)} ({b.paymentPct}%)
                          </p>
                          <p className="font-medium text-red-500">
                            Còn lại: {fmt(b.remaining)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 font-bold uppercase text-[9px] mb-1">
                            Khách đi
                          </p>
                          <p>
                            {b.totalMembers} khách ({b.adults}L, {b.children}T,{" "}
                            {b.infants}EB)
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 font-bold uppercase text-[9px] mb-1">
                            Liên hệ
                          </p>
                          <p>{b.phone}</p>
                          <p className="truncate">{b.email}</p>
                        </div>
                        <div className="flex flex-col justify-center">
                          <p className="text-gray-400 font-bold uppercase text-[9px]">
                            Mã đơn
                          </p>
                          <code className="text-[10px] bg-gray-100 p-1 rounded break-all">
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
