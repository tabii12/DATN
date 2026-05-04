"use client";
import { useState, useEffect, useCallback } from "react";

interface TripReport {
  tripId: string;
  tripName?: string;
  tourInfo: {
    id: string;
    name: string;
    image: string | null;
    startLocation: string;
  };
  startDate: string;
  capacity: string;
  occupancyRate: string;
  status: string;
  shouldStart: boolean;
  note: string;
}

interface BookingRaw {
  _id?: string;
  id?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  tourName?: string;
  departureDate?: any;
  adults?: number;
  children?: number;
  infants?: number;
  singleRooms?: number;
  total_price?: number;
  payNow?: number;
  paymentPct?: number;
  remaining?: number;
  status?: string;
  createdAt?: any;
  orderId?: string;
  total_members?: number;
  trip_id?: { _id?: string; tour_id?: string } | string;
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
  singleRooms: number;
  totalPrice: number;
  payNow: number;
  paymentPct: number;
  remaining: number;
  status: string;
  createdAt: string;
  orderId: string;
  totalMembers: number;
}

const API = "https://db-pickyourway.vercel.app/api";

// Chỉ đếm booking active (bỏ cancelled/refunded)
const ACTIVE_STATUSES = ["pending", "confirmed", "paid"];

function parseDate(d: any): string {
  return (d?.$date ? d.$date : d) || "";
}

function fmtDate(str: string) {
  if (!str || str === "—") return "—";
  const d = new Date(str);
  return isNaN(d.getTime())
    ? str
    : d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function fmt(n: number) {
  return n.toLocaleString("vi-VN") + "đ";
}

function getTripIdStr(trip_id: BookingRaw["trip_id"]): string {
  if (!trip_id) return "";
  if (typeof trip_id === "string") return trip_id;
  return trip_id._id ?? "";
}

function normalizeBooking(raw: BookingRaw): Booking {
  return {
    id: raw._id || raw.id || "",
    customerName: raw.contactName || "—",
    email: raw.contactEmail || "—",
    phone: raw.contactPhone || "—",
    tourName: raw.tourName || "—",
    departureDate: parseDate(raw.departureDate),
    adults: Number(raw.adults ?? 0),
    children: Number(raw.children ?? 0),
    infants: Number(raw.infants ?? 0),
    singleRooms: Number(raw.singleRooms ?? 0),
    totalPrice: Number(raw.total_price ?? 0),
    payNow: Number(raw.payNow ?? 0),
    paymentPct: Number(raw.paymentPct ?? 0),
    remaining: Number(raw.remaining ?? 0),
    status: raw.status?.toLowerCase() ?? "pending",
    createdAt: parseDate(raw.createdAt),
    orderId: raw.orderId || "—",
    totalMembers: Number(raw.total_members ?? raw.adults ?? 0),
  };
}

// Badge trạng thái thanh toán
function PaymentBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  if (s === "paid")
    return (
      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap">
        ✓ Đã TT 100%
      </span>
    );
  if (s === "confirmed")
    return (
      <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap">
        ◑ Đã TT 50%
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-700 border border-yellow-200 px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap">
      ○ Chờ xác nhận
    </span>
  );
}

// Danh sách khách của một chuyến
function BookingList({ bookings }: { bookings: Booking[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (bookings.length === 0)
    return (
      <div className="py-8 text-center text-sm text-gray-400">
        Chưa có booking nào cho chuyến này.
      </div>
    );

  // Tổng hợp nhanh
  const total50 = bookings.filter((b) => b.status === "confirmed").length;
  const total100 = bookings.filter((b) => b.status === "paid").length;
  const totalPax = bookings.reduce((s, b) => s + b.totalMembers, 0);
  const totalCollected = bookings.reduce((s, b) => s + b.payNow, 0);
  const totalRemaining = bookings.reduce((s, b) => s + b.remaining, 0);

  return (
    <div className="mt-3 space-y-3">
      {/* Tổng hợp nhanh */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
        <div className="bg-white rounded-xl border border-gray-100 px-3 py-2">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Tổng khách</p>
          <p className="text-lg font-black text-gray-800">{totalPax} người</p>
        </div>
        <div className="bg-blue-50 rounded-xl border border-blue-100 px-3 py-2">
          <p className="text-[10px] text-blue-500 font-bold uppercase">Đã TT 50%</p>
          <p className="text-lg font-black text-blue-700">{total50} đơn</p>
        </div>
        <div className="bg-emerald-50 rounded-xl border border-emerald-100 px-3 py-2">
          <p className="text-[10px] text-emerald-500 font-bold uppercase">Đã TT 100%</p>
          <p className="text-lg font-black text-emerald-700">{total100} đơn</p>
        </div>
        <div className="bg-orange-50 rounded-xl border border-orange-100 px-3 py-2">
          <p className="text-[10px] text-orange-500 font-bold uppercase">Đã thu</p>
          <p className="text-base font-black text-orange-600">{fmt(totalCollected)}</p>
          {totalRemaining > 0 && (
            <p className="text-[10px] text-red-400 font-semibold">Còn: {fmt(totalRemaining)}</p>
          )}
        </div>
      </div>

      {/* Danh sách từng booking */}
      {bookings.map((b) => {
        const isExpanded = expandedId === b.id;
        return (
          <div
            key={b.id}
            className={`rounded-2xl border transition-all ${
              isExpanded
                ? "bg-orange-50/40 border-orange-100"
                : "bg-white border-gray-100 hover:border-orange-100"
            }`}
          >
            <div
              className="px-4 py-3 flex items-center gap-3 cursor-pointer"
              onClick={() => setExpandedId(isExpanded ? null : b.id)}
            >
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0 bg-gradient-to-br from-orange-400 to-amber-400">
                {b.customerName.charAt(0).toUpperCase()}
              </div>

              {/* Tên + SĐT */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate text-gray-900">{b.customerName}</p>
                <p className="text-[10px] text-gray-400 truncate">{b.phone}</p>
              </div>

              {/* Số khách */}
              <div className="hidden md:block shrink-0 text-right">
                <p className="text-xs font-semibold text-gray-700">
                  {b.adults}NL
                  {b.children > 0 ? ` · ${b.children}TE` : ""}
                  {b.infants > 0 ? ` · ${b.infants}EB` : ""}
                </p>
                <p className="text-[10px] text-gray-400">{b.totalMembers} khách</p>
              </div>

              {/* Thanh toán + Badge */}
              <div className="shrink-0 text-right space-y-1">
                <p className="text-sm font-black text-orange-600">{fmt(b.payNow)}</p>
                <PaymentBadge status={b.status} />
              </div>

              <div className="shrink-0 text-gray-400 text-xs ml-1">
                {isExpanded ? "▲" : "▼"}
              </div>
            </div>

            {/* Chi tiết mở rộng */}
            {isExpanded && (
              <div className="px-4 pb-4">
                <div className="bg-white rounded-xl border border-gray-100 p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs shadow-inner">
                  <div>
                    <p className="text-gray-400 font-bold uppercase text-[9px] mb-1">Liên hệ</p>
                    <p className="font-medium text-slate-700 break-all">{b.email}</p>
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
                    <p className="text-gray-400 font-bold uppercase text-[9px] mb-1">Thanh toán</p>
                    <p className="text-slate-700">
                      Đã TT: <span className="font-bold text-emerald-600">{fmt(b.payNow)}</span>
                    </p>
                    {b.remaining > 0 && (
                      <p className="text-slate-700">
                        Còn lại: <span className="font-bold text-orange-500">{fmt(b.remaining)}</span>
                      </p>
                    )}
                    <p className="text-slate-500">{b.paymentPct}% tổng đơn</p>
                  </div>
                  <div>
                    <p className="text-gray-400 font-bold uppercase text-[9px] mb-1">Mã đơn</p>
                    <code className="text-[10px] bg-gray-100 p-1 rounded text-gray-600 break-all block">
                      {b.orderId}
                    </code>
                    <p className="text-gray-400 mt-2 text-[9px] font-bold uppercase">Ngày đặt</p>
                    <p className="text-slate-700">{fmtDate(b.createdAt)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function TripReportTab() {
  const [reports, setReports] = useState<TripReport[]>([]);
  const [allBookings, setAllBookings] = useState<BookingRaw[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTripId, setExpandedTripId] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const [reportRes, bookingRes] = await Promise.all([
        fetch(`${API}/bookings/admin/status-report`, { headers }),
        fetch(`${API}/bookings/admin/all`, { headers }),
      ]);
      const reportJson = await reportRes.json();
      const bookingJson = await bookingRes.json();
      if (reportJson.success) setReports(reportJson.data);
      const raw: BookingRaw[] = Array.isArray(bookingJson)
        ? bookingJson
        : bookingJson.data ?? [];
      setAllBookings(raw);
      setLastRefresh(new Date());
    } catch (err) {
      console.error("Lỗi tải dữ liệu:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Tính capacity + lọc booking active theo trip
  function calcCapacity(tripId: string, totalCapStr: string) {
    const maxPax = parseInt(totalCapStr.split("/")[1] ?? "0");

    const activeBookings = allBookings.filter((b) => {
      const tid = getTripIdStr(b.trip_id);
      const isTrip = tid === tripId;
      const isActive = ACTIVE_STATUSES.includes(b.status?.toLowerCase() ?? "");
      return isTrip && isActive;
    });

    const bookedPax = activeBookings.reduce(
      (sum, b) => sum + Number(b.total_members ?? b.adults ?? 0),
      0
    );

    const occupancy = maxPax > 0 ? Math.round((bookedPax / maxPax) * 100) : 0;
    const isFull = bookedPax >= maxPax && maxPax > 0;
    // Đủ điều kiện khởi hành khi >= 80% sức chứa
    const canDepart = maxPax > 0 && occupancy >= 80;

    return {
      capacityStr: `${bookedPax}/${maxPax}`,
      occupancyStr: `${occupancy}%`,
      occupancyNum: occupancy,
      isFull,
      canDepart,
      activeBookings: activeBookings.map(normalizeBooking),
    };
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {!loading && (
        <div className="flex justify-between items-center px-2">
          <p className="text-sm text-gray-500 font-medium">
            Phân tích{" "}
            <span className="text-slate-900 font-bold">{reports.length}</span>{" "}
            chuyến đi đang vận hành
          </p>
          <div className="flex items-center gap-3">
            <p className="text-[11px] text-gray-400">
              Cập nhật lúc {lastRefresh.toLocaleTimeString("vi-VN")}
            </p>
            <button
              onClick={fetchAll}
              className="text-[11px] px-3 py-1.5 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors"
            >
              ↻ Làm mới
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400 text-sm font-medium">Đang tải dữ liệu chuyến đi...</p>
          </div>
        ) : (
          reports.map((trip) => {
            const isExpanded = expandedTripId === trip.tripId;
            const { capacityStr, occupancyStr, occupancyNum, isFull, canDepart, activeBookings } =
              calcCapacity(trip.tripId, trip.capacity);

            return (
              <div
                key={trip.tripId}
                className={`rounded-3xl border shadow-sm transition-all duration-200 ${
                  isFull
                    ? "bg-gray-100 border-gray-200 opacity-70"
                    : isExpanded
                    ? "bg-orange-50/30 border-orange-100 shadow-md"
                    : "bg-white border-gray-100 hover:shadow-md"
                }`}
              >
                <div
                  className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 cursor-pointer"
                  onClick={() => setExpandedTripId(isExpanded ? null : trip.tripId)}
                >
                  {/* Tour info */}
                  <div className="flex gap-4 items-start md:items-center w-full md:w-auto">
                    <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 overflow-hidden border border-gray-100 relative">
                      {trip.tourInfo.image ? (
                        <img
                          src={trip.tourInfo.image}
                          alt="tour"
                          className={`w-full h-full object-cover ${isFull ? "grayscale" : ""}`}
                        />
                      ) : (
                        <span className="text-2xl opacity-40">🌏</span>
                      )}
                      {isFull && (
                        <div className="absolute inset-0 bg-gray-400/30 flex items-center justify-center rounded-2xl">
                          <span className="text-[9px] font-black text-white bg-gray-600/70 px-1.5 py-0.5 rounded-md">FULL</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${isFull ? "bg-gray-200 text-gray-500" : "bg-orange-100 text-orange-600"}`}>
                          {trip.tourInfo.startLocation}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400">
                          ID: {trip.tripId.slice(-6).toUpperCase()}
                        </span>
                        {isFull && (
                          <span className="text-[10px] font-black bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full border border-gray-300">
                            ⛔ Đã đủ số lượng
                          </span>
                        )}
                      </div>

                      <h3 className={`font-extrabold text-base md:text-lg leading-tight max-w-md ${isFull ? "text-gray-400" : "text-gray-900"}`}>
                        {trip.tourInfo.name}
                      </h3>

                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-xs text-slate-500 font-bold flex items-center gap-1">
                          📅{" "}
                          {new Date(trip.startDate).toLocaleDateString("vi-VN", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </p>
                        <div className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          isFull
                            ? "bg-gray-200 text-gray-400 border border-gray-300"
                            : canDepart
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                            : "bg-rose-50 text-rose-600 border border-rose-100"
                        }`}>
                          {isFull
                            ? "✅ Đã đủ chỗ"
                            : canDepart
                            ? "✅ Đủ điều kiện khởi hành"
                            : "⚠️ Cân nhắc gộp tour"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t border-dashed md:border-t-0 pt-4 md:pt-0">
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-[10px] text-gray-400 uppercase font-black tracking-tighter">Lấp đầy</p>
                        <p className={`text-xl font-black ${isFull ? "text-gray-400" : canDepart ? "text-emerald-600" : occupancyNum >= 50 ? "text-orange-500" : "text-rose-500"}`}>
                          {occupancyStr}
                        </p>
                      </div>
                      {/* Thanh progress với mốc 80% */}
                      <div className="flex flex-col gap-1 min-w-[80px]">
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden relative">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              isFull ? "bg-gray-400" : canDepart ? "bg-emerald-500" : occupancyNum >= 50 ? "bg-orange-400" : "bg-rose-400"
                            }`}
                            style={{ width: `${Math.min(occupancyNum, 100)}%` }}
                          />
                          {/* Mốc 80% */}
                          <div className="absolute top-0 bottom-0 w-px bg-gray-400/60" style={{ left: "80%" }} />
                        </div>
                        <p className="text-[9px] text-gray-400 font-semibold text-right">mốc 80%</p>
                      </div>
                    </div>

                    <div className="text-right min-w-[70px]">
                      <p className="text-[10px] text-gray-400 uppercase font-black tracking-tighter">Số khách</p>
                      <p className={`text-xl font-black ${isFull ? "text-gray-400" : "text-slate-800"}`}>
                        {capacityStr}
                      </p>
                      <p className="text-[10px] text-gray-400 font-bold">vé đã bán</p>
                    </div>

                    {/* Mini badge 50%/100% */}
                    <div className="hidden md:flex flex-col gap-1 text-right">
                      <span className="text-[10px] bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full font-bold">
                        ◑ {activeBookings.filter((b) => b.status === "confirmed").length} đơn 50%
                      </span>
                      <span className="text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-full font-bold">
                        ✓ {activeBookings.filter((b) => b.status === "paid").length} đơn 100%
                      </span>
                    </div>

                    <div className="shrink-0 flex flex-col items-center gap-1">
                      <span className={`text-xs font-bold ${isExpanded ? "text-orange-500" : "text-gray-400"}`}>
                        {isExpanded ? "▲" : "▼"}
                      </span>
                      <span className="text-[9px] text-gray-400 font-semibold whitespace-nowrap">
                        {isExpanded ? "Ẩn" : "Chi tiết"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Expanded: danh sách khách */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-dashed border-gray-100 pt-4">
                    <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-1">
                      📋 Danh sách khách đã đặt ({activeBookings.length} đơn)
                    </p>
                    <BookingList bookings={activeBookings} />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}