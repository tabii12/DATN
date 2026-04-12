"use client";
import { useState, useEffect, useCallback } from "react";

// ─────────────────────────── TYPES (SÁT VỚI BE) ───────────────────────────

interface BookingRaw {
  _id: string;
  tourName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  departureDate: any; // Xử lý được cả string lẫn {$date: string}
  adults: number;
  children: number;
  infants: number;
  total_members: number;
  basePrice: number;
  total: number;
  singleRooms: number;
  status: "pending" | "confirmed" | "paid" | "cancelled";
  orderId: string;
  createdAt: any;
  updatedAt: any;
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

// ─────────────────────────── NORMALIZE (TỐI GIẢN) ───────────────────────────

function normalizeBooking(raw: BookingRaw): Booking {
  const parseDate = (d: any) => (d?.$date ? d.$date : d) || "";

  return {
    id: raw._id,
    customerName: raw.contactName || "Khách vãng lai",
    email: raw.contactEmail || "—",
    phone: raw.contactPhone || "—",
    tourName: raw.tourName || "Chưa xác định",
    departureDate: parseDate(raw.departureDate),
    adults: raw.adults || 0,
    children: raw.children || 0,
    infants: raw.infants || 0,
    totalPrice: raw.total || 0,
    status: raw.status || "pending",
    singleRooms: raw.singleRooms || 0,
    createdAt: parseDate(raw.createdAt),
  };
}

// ─────────────────────────── HELPERS ───────────────────────────

const fmt = (n: number) => n.toLocaleString("vi-VN") + "₫";

function fmtDate(str: string) {
  if (!str || str === "—") return "—";
  const d = new Date(str);
  return isNaN(d.getTime()) ? str : d.toLocaleDateString("vi-VN");
}

function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, { label: string; style: string }> = {
    paid: {
      label: "✓ Đã thanh toán",
      style: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    confirmed: {
      label: "● Đã xác nhận",
      style: "bg-blue-50 text-blue-700 border-blue-200",
    },
    cancelled: {
      label: "✕ Đã hủy",
      style: "bg-red-50 text-red-700 border-red-200",
    },
    pending: {
      label: "○ Chờ thanh toán",
      style: "bg-amber-50 text-amber-600 border-amber-200",
    },
  };
  const config = configs[status] || configs.pending;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${config.style}`}
    >
      {config.label}
    </span>
  );
}

// ─────────────────────────── MAIN COMPONENT ───────────────────────────

const API = "https://db-pickyourway.vercel.app/api";

export default function BookingPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilter] = useState("all");
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
      const data = Array.isArray(json) ? json : json.data || [];
      setBookings(data.map(normalizeBooking));
      setIsLive(true);
    } catch (err) {
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
          prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b)),
        );
      }
    } catch (err) {
      alert("Lỗi cập nhật!");
    }
  };

  const filtered = bookings.filter((b) => {
    const matchStatus = filterStatus === "all" || b.status === filterStatus;
    const q = search.toLowerCase();
    return (
      matchStatus &&
      (b.customerName.toLowerCase().includes(q) ||
        b.tourName.toLowerCase().includes(q) ||
        b.phone.includes(q))
    );
  });

  const stats = {
    total: bookings.length,
    revenue: bookings.reduce((s, b) => s + b.totalPrice, 0),
    paid: bookings.filter((b) => b.status === "paid").length,
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-800">
              DANH SÁCH ĐẶT TOUR
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`w-2 h-2 rounded-full ${isLive ? "bg-green-500 animate-pulse" : "bg-slate-300"}`}
              />
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                {isLive ? "Hệ thống trực tuyến" : "Mất kết nối server"}
              </span>
            </div>
          </div>
          <button
            onClick={fetchBookings}
            className="bg-white hover:bg-slate-50 text-slate-700 font-bold py-2 px-4 rounded-xl border border-slate-200 shadow-sm transition-all active:scale-95 flex items-center gap-2 text-sm"
          >
            {loading ? "..." : "↻ Làm mới dữ liệu"}
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              Tổng đơn hàng
            </p>
            <p className="text-3xl font-black text-slate-800">{stats.total}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">
              Đã hoàn tất
            </p>
            <p className="text-3xl font-black text-emerald-600">{stats.paid}</p>
          </div>
          <div className="bg-slate-900 p-5 rounded-2xl shadow-lg shadow-slate-200">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              Tổng doanh thu
            </p>
            <p className="text-2xl font-black text-white">
              {fmt(stats.revenue)}
            </p>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Tìm kiếm khách hàng, tour..."
            className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex bg-slate-50 p-1 rounded-xl">
            {["all", "pending", "confirmed", "paid"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filterStatus === f ? "bg-white text-orange-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
              >
                {f === "all"
                  ? "Tất cả"
                  : f === "paid"
                    ? "Đã TT"
                    : f === "confirmed"
                      ? "Xác nhận"
                      : "Chờ"}
              </button>
            ))}
          </div>
        </div>

        {/* Table Body */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="px-6 py-4">Khách hàng</th>
                  <th className="px-6 py-4">Chi tiết Tour</th>
                  <th className="px-6 py-4">Tổng tiền</th>
                  <th className="px-6 py-4 text-center">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((b) => (
                  <tr
                    key={b.id}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-800">
                        {b.customerName}
                      </p>
                      <p className="text-[11px] text-slate-400">{b.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-700 line-clamp-1">
                        {b.tourName}
                      </p>
                      <p className="text-[11px] text-orange-500 font-bold">
                        📅 {fmtDate(b.departureDate)}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm font-black text-slate-800">
                      {fmt(b.totalPrice)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <select
                        value={b.status}
                        onChange={(e) =>
                          handleUpdateStatus(b.id, e.target.value)
                        }
                        className="bg-white border border-slate-200 rounded-lg text-[11px] font-bold p-1.5 outline-none focus:ring-2 focus:ring-orange-500/20"
                      >
                        <option value="pending">Chờ TT</option>
                        <option value="confirmed">Xác nhận</option>
                        <option value="paid">Đã thanh toán</option>
                        <option value="cancelled">Hủy đơn</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && !loading && (
            <div className="py-20 text-center">
              <p className="text-slate-400 text-sm font-medium">
                Không tìm thấy dữ liệu nào phù hợp.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
