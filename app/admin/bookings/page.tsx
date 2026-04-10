"use client";
import { useState, useEffect, useCallback } from "react";

interface Booking {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  tourName: string;
  departureDate: string;
  adults: number;
  children: number;
  price: number;
  childPrice: number;
  paymentStatus: "paid" | "deposit";
  completed?: boolean;
}

const API_URL = "https://db-pickyourway.vercel.app/api/bookings";

const mockData: Booking[] = [
  {
    id: "1",
    customerName: "Phạm Trung Dương",
    email: "duong@gmail.com",
    phone: "0901234567",
    tourName: "Tour Đà Nẵng 3N2Đ",
    departureDate: "2026-05-10",
    adults: 2,
    children: 1,
    price: 3500000,
    childPrice: 2000000,
    paymentStatus: "paid",
  },
  {
    id: "2",
    customerName: "Chu Kha",
    email: "kha@gmail.com",
    phone: "0912345678",
    tourName: "Tour Phú Quốc 4N3Đ",
    departureDate: "2026-06-15",
    adults: 3,
    children: 1,
    price: 5200000,
    childPrice: 3000000,
    paymentStatus: "deposit",
  },
];

// Normalize để tương thích nhiều cấu trúc JSON khác nhau từ API
function normalizeBooking(raw: Record<string, unknown>): Booking {
  return {
    id: String(raw.id || raw._id || ""),
    customerName: String(raw.customerName || raw.customer_name || raw.name || raw.fullName || "—"),
    email: String(raw.email || "—"),
    phone: String(raw.phone || raw.phoneNumber || raw.phone_number || "—"),
    tourName: String(raw.tourName || raw.tour_name || (raw.tour as Record<string, unknown>)?.name || "—"),
    departureDate: String(raw.departureDate || raw.departure_date || raw.date || "—"),
    adults: parseInt(String(raw.adults || raw.numAdults || raw.num_adults || 1)),
    children: parseInt(String(raw.children || raw.numChildren || raw.num_children || 0)),
    price: parseFloat(String(raw.price || raw.adultPrice || raw.adult_price || 0)),
    childPrice: parseFloat(String(raw.childPrice || raw.child_price || raw.childrenPrice || 0)),
    paymentStatus: (raw.paymentStatus || raw.payment_status || raw.status) === "paid" ? "paid" : "deposit",
    completed: Boolean(raw.completed || false),
  };
}

const formatCurrency = (value: number) =>
  value.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

export default function BookingPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiveData, setIsLiveData] = useState(false);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      // Hỗ trợ nhiều cấu trúc: array thẳng, hoặc { data: [], bookings: [], results: [] }
      const raw: Record<string, unknown>[] = Array.isArray(json)
        ? json
        : (json.data || json.bookings || json.results || []);
        setBookings(raw.map(normalizeBooking));
      setIsLiveData(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Lỗi không xác định";
      setError(`Không thể tải từ API (${msg}). Hiển thị dữ liệu mẫu.`);
      setBookings(mockData);
      setIsLiveData(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const markCompleted = async (id: string) => {
    // Giả định API PUT để update completed
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: true }),
      });
      if (res.ok) {
        setBookings(prev => prev.map(b => b.id === id ? { ...b, completed: true } : b));
      }
    } catch (error) {
      console.error("Lỗi cập nhật:", error);
      // Fallback: update local
      setBookings(prev => prev.map(b => b.id === id ? { ...b, completed: true } : b));
    }
  };

  const totalRevenue = bookings.reduce(
    (sum, b) => sum + b.adults * b.price + b.children * b.childPrice,
    0
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">📄 Danh sách Booking Tour</h1>
          <p className="text-sm text-gray-500 mt-1">
            {isLiveData ? "🟢 Dữ liệu thật từ API" : "🟡 Dữ liệu mẫu"}
          </p>
        </div>
        <button
          onClick={fetchBookings}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
        >
          {loading ? "Đang tải..." : "↻ Làm mới"}
        </button>
      </div>

      {/* Thống kê nhanh */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="text-xs text-gray-500">Tổng booking</div>
          <div className="text-xl font-bold">{bookings.length}</div>
        </div>
        <div className="bg-green-50 rounded-xl p-4">
          <div className="text-xs text-gray-500">Đã thanh toán</div>
          <div className="text-xl font-bold text-green-700">
            {bookings.filter((b) => b.paymentStatus === "paid").length}
          </div>
        </div>
        <div className="bg-yellow-50 rounded-xl p-4">
          <div className="text-xs text-gray-500">Đã cọc</div>
          <div className="text-xl font-bold text-yellow-700">
            {bookings.filter((b) => b.paymentStatus === "deposit").length}
          </div>
        </div>
        <div className="bg-blue-50 rounded-xl p-4">
          <div className="text-xs text-gray-500">Doanh thu</div>
          <div className="text-lg font-bold text-blue-700">
            {formatCurrency(totalRevenue)}
          </div>
        </div>
      </div>

      {/* Thông báo lỗi */}
      {error && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Bảng */}
      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded-2xl shadow">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Khách hàng</th>
              <th className="p-3">Email</th>
              <th className="p-3">SĐT</th>
              <th className="p-3">Tour</th>
              <th className="p-3">Ngày đi</th>
              <th className="p-3">Số người</th>
              <th className="p-3">Tổng tiền</th>
              <th className="p-3">Trạng thái</th>
              <th className="p-3">Hoàn thành</th>
            </tr>
          </thead>
          <tbody>
            {loading && bookings.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-8 text-center text-gray-400">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : bookings.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-8 text-center text-gray-400">
                  Không có booking nào.
                </td>
              </tr>
            ) : (
              bookings.map((b) => {
                const total = b.adults * b.price + b.children * b.childPrice;
                return (
                  <tr key={b.id} className="border-t hover:bg-gray-50">
                    <td className="p-3 font-medium">{b.customerName}</td>
                    <td className="p-3 text-sm text-gray-600">{b.email}</td>
                    <td className="p-3">{b.phone}</td>
                    <td className="p-3">{b.tourName}</td>
                    <td className="p-3">
                      {b.departureDate !== "—"
                        ? new Date(b.departureDate).toLocaleDateString("vi-VN")
                        : "—"}
                    </td>
                    <td className="p-3">
                      <div className="text-sm">
                        <div>👨‍🦰 NL: {b.adults} ({formatCurrency(b.price)}/ng)</div>
                        {b.children > 0 && (
                          <div>🧒 TE: {b.children} ({formatCurrency(b.childPrice)}/ng)</div>
                        )}
                      </div>
                    </td>
                    <td className="p-3 font-semibold">{formatCurrency(total)}</td>
                    <td className="p-3">
                      {b.paymentStatus === "paid" ? (
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                          Đã TT 100%
                        </span>
                      ) : (
                        <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm">
                          Đã cọc 50%
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      {b.completed ? (
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                          ✅ Hoàn thành
                        </span>
                      ) : (
                        <button
                          onClick={() => markCompleted(b.id)}
                          className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                        >
                          Đánh dấu HT
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}