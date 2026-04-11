"use client";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Plane,
  MapPin,
  Users,
  Shield,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Wallet,
  CreditCard,
} from "lucide-react";

function formatVND(n: number) {
  return n.toLocaleString("vi-VN") + "đ";
}

function validate(name: string, value: string): string {
  switch (name) {
    case "name":
      if (!value.trim()) return "Vui lòng nhập họ và tên";
      if (value.trim().length < 3) return "Họ và tên phải có ít nhất 3 ký tự";
      return "";
    case "email":
      if (!value.trim()) return "Vui lòng nhập email";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
        return "Email không hợp lệ";
      return "";
    case "phone": {
      const clean = value.replace(/\s/g, "");
      if (!clean) return "Vui lòng nhập số điện thoại";
      if (!/^0\d{9}$/.test(clean))
        return "SĐT phải 10 số và bắt đầu bằng 0 (VD: 0912345678)";
      return "";
    }
    case "address":
      if (!value.trim()) return "Vui lòng nhập địa chỉ";
      if (value.trim().length < 10)
        return "Địa chỉ quá ngắn (tối thiểu 10 ký tự)";
      return "";
    default:
      return "";
  }
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // ✅ READ LOCALSTORAGE
  const rawBooking = localStorage.getItem("tour_booking");
  const bookingData = rawBooking ? JSON.parse(rawBooking) : {};

  const tourName = bookingData.tourName ?? searchParams.get("tourName") ?? "";
  const hotelName =
    bookingData.hotelName ?? searchParams.get("hotelName") ?? "";
  const city = bookingData.city ?? searchParams.get("city") ?? "";
  const thumbnail =
    bookingData.thumbnail ?? searchParams.get("thumbnail") ?? "";
  const tourSlug = bookingData.tourSlug ?? searchParams.get("tourSlug") ?? "";
  const pricePerAdult = parseInt(
    bookingData.basePrice ?? searchParams.get("pricePerAdult") ?? "0",
  );
  const pricePerChild = parseInt(searchParams.get("pricePerChild") ?? "0");
  const adults = parseInt(
    bookingData.adults ?? searchParams.get("adults") ?? "1",
  );
  const children = parseInt(
    bookingData.children ?? searchParams.get("children") ?? "0",
  );
  const infants = parseInt(bookingData.infants ?? "0");
  const trip_id = bookingData.trip_id ?? "";
  const singleRooms = parseInt(bookingData.singleRooms ?? "0");
  const grandTotal = parseInt(bookingData.grandTotal ?? "0");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Payment option: 50 = đặt cọc 50%, 100 = thanh toán đầy đủ
  const [paymentPct, setPaymentPct] = useState<50 | 100>(50);

  const subtotalAdults = adults * pricePerAdult;
  const subtotalChildren = children * pricePerChild;
  const INSURANCE = 500_000;
  const total = subtotalAdults + subtotalChildren + INSURANCE;
  const payNow = Math.round((total * paymentPct) / 100);
  const remaining = total - payNow;

  const orderItems = [
    {
      label: `Giá tour (${adults} người lớn)`,
      value: formatVND(subtotalAdults),
    },
    ...(children > 0
      ? [
          {
            label: `Giá tour (${children} trẻ em)`,
            value: formatVND(subtotalChildren),
          },
        ]
      : []),
    { label: "Bảo hiểm du lịch", value: formatVND(INSURANCE) },
  ];

  const FIELDS = ["name", "email", "phone", "address"];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (touched[name])
      setErrors((prev) => ({ ...prev, [name]: validate(name, value) }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validate(name, value) }));
  };

  const handleNext = () => {
    const newTouched = Object.fromEntries(FIELDS.map((f) => [f, true]));
    const newErrors = Object.fromEntries(
      FIELDS.map((f) => [f, validate(f, (form as Record<string, string>)[f])]),
    );

    setTouched(newTouched);
    setErrors(newErrors);

    if (Object.values(newErrors).some(Boolean)) return;

    // ✅ FULL BOOKING DATA
    const fullBooking = {
      ...bookingData,
      contactName: form.name,
      contactEmail: form.email,
      contactPhone: form.phone,
      paymentPct,
      payNow,
      remaining,
      total,
    };

    // ✅ LƯU VÀO SESSION STORAGE
    sessionStorage.setItem("bookingData", JSON.stringify(fullBooking));

    // ✅ CHUYỂN TRANG (KHÔNG PARAM)
    router.push("/checkout/payment");
  };

  const inputClass = (name: string) =>
    `w-full border rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 transition ${
      touched[name] && errors[name]
        ? "border-red-300 focus:ring-red-200 focus:border-red-400 bg-red-50"
        : touched[name] && !errors[name]
          ? "border-green-300 focus:ring-green-200 focus:border-green-400 bg-green-50/30"
          : "border-slate-200 focus:ring-indigo-300 focus:border-indigo-400"
    }`;

  const FieldIcon = ({ name }: { name: string }) => {
    if (!touched[name]) return null;
    return errors[name] ? (
      <AlertCircle size={15} className="text-red-400 absolute right-3 top-3" />
    ) : (
      <CheckCircle2
        size={15}
        className="text-green-400 absolute right-3 top-3"
      />
    );
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="ml-auto flex items-center gap-2 text-sm">
            <span className="bg-indigo-600 text-white px-3 py-1 rounded-full font-medium text-xs">
              1 Thông tin
            </span>
            <ChevronRight size={14} className="text-slate-300" />
            <span className="text-slate-400 px-3 py-1 rounded-full text-xs border border-slate-200">
              2 Thanh toán
            </span>
            <ChevronRight size={14} className="text-slate-300" />
            <span className="text-slate-400 px-3 py-1 rounded-full text-xs border border-slate-200">
              3 Xác nhận
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── LEFT ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chi tiết chuyến đi */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center gap-2 mb-5">
              <Plane size={18} className="text-indigo-500" />
              <h2 className="font-semibold text-slate-700 text-lg">
                Chi tiết chuyến đi
              </h2>
            </div>
            <div className="flex gap-5 items-start bg-linear-to-r from-indigo-50 to-blue-50 rounded-xl p-4 border border-indigo-100">
              {thumbnail ? (
                <img
                  src={thumbnail}
                  alt={tourName}
                  className="w-28 h-20 rounded-xl object-cover shadow shrink-0"
                />
              ) : (
                <div className="w-28 h-20 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-300 shrink-0">
                  <Plane size={28} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-800 text-base mb-2 leading-snug">
                  {tourName}
                </h3>
                <div className="space-y-1.5 text-sm text-slate-500">
                  {hotelName && (
                    <div className="flex items-center gap-2">
                      <span>🏨</span>
                      {hotelName}
                    </div>
                  )}
                  {city && (
                    <div className="flex items-center gap-2">
                      <MapPin size={13} className="text-indigo-400" />
                      {city}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Users size={13} className="text-indigo-400" />
                    {adults} người lớn
                    {children > 0 ? ` · ${children} trẻ em` : ""}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Thông tin liên hệ */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="font-semibold text-slate-700 text-lg mb-5">
              Thông tin liên hệ
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">
                  Họ và tên <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Nguyễn Văn A"
                    className={inputClass("name")}
                  />
                  <FieldIcon name="name" />
                </div>
                {touched.name && errors.name && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle size={11} />
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">
                  Email <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="email@example.com"
                    className={inputClass("email")}
                  />
                  <FieldIcon name="email" />
                </div>
                {touched.email && errors.email && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle size={11} />
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">
                  Số điện thoại <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="0912345678"
                    className={inputClass("phone")}
                  />
                  <FieldIcon name="phone" />
                </div>
                {touched.phone && errors.phone ? (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle size={11} />
                    {errors.phone}
                  </p>
                ) : (
                  !touched.phone && (
                    <p className="mt-1 text-xs text-slate-400">
                      Nhập số bắt đầu bằng 0, đủ 10 chữ số
                    </p>
                  )
                )}
              </div>

              {/* <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">
                  Địa chỉ <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="123 Đường ABC, Quận X, TP.HCM"
                    className={inputClass("address")}
                  />
                  <FieldIcon name="address" />
                </div>
                {touched.address && errors.address ? (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle size={11} />
                    {errors.address}
                  </p>
                ) : (
                  !touched.address && (
                    <p className="mt-1 text-xs text-slate-400">
                      Nhập đầy đủ địa chỉ, tối thiểu 10 ký tự
                    </p>
                  )
                )}
              </div> */}
            </div>
          </div>
        </div>

        {/* ── RIGHT – Tổng kết ── */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky top-24">
            <h2 className="font-semibold text-slate-700 text-lg mb-5">
              Tổng kết đơn hàng
            </h2>

            {/* Chi tiết giá */}
            <div className="space-y-3 mb-5">
              {orderItems.map((item) => (
                <div key={item.label} className="flex justify-between text-sm">
                  <span className="text-slate-500">{item.label}</span>
                  <span className="font-medium text-slate-700">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Tổng cộng */}
            <div className="border-t border-slate-100 pt-4 mb-5">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-700">Tổng cộng</span>
                <span className="text-xl font-bold text-indigo-600">
                  {formatVND(total)}
                </span>
              </div>
            </div>

            {/* Hình thức thanh toán */}
            <p className="text-sm font-semibold text-slate-700 mb-3">
              Hình thức thanh toán
            </p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {/* Đặt cọc 50% */}
              <button
                onClick={() => setPaymentPct(50)}
                className={`rounded-xl p-3.5 text-left border-2 transition-all ${
                  paymentPct === 50
                    ? "border-indigo-400 bg-indigo-50"
                    : "border-slate-100 bg-slate-50 hover:border-slate-200"
                }`}
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <Wallet
                    size={13}
                    className={
                      paymentPct === 50 ? "text-indigo-500" : "text-slate-400"
                    }
                  />
                  <span
                    className={`text-xs font-semibold ${
                      paymentPct === 50 ? "text-indigo-600" : "text-slate-500"
                    }`}
                  >
                    Đặt cọc 50%
                  </span>
                </div>
                <p
                  className={`text-sm font-bold mb-1 ${
                    paymentPct === 50 ? "text-indigo-700" : "text-slate-700"
                  }`}
                >
                  {formatVND(total * 0.5)}
                </p>
                <p
                  className={`text-[11px] leading-tight ${
                    paymentPct === 50 ? "text-indigo-400" : "text-slate-400"
                  }`}
                >
                  Còn lại thanh toán trước khởi hành
                </p>
              </button>

              {/* Thanh toán 100% */}
              <button
                onClick={() => setPaymentPct(100)}
                className={`rounded-xl p-3.5 text-left border-2 transition-all ${
                  paymentPct === 100
                    ? "border-indigo-400 bg-indigo-50"
                    : "border-slate-100 bg-slate-50 hover:border-slate-200"
                }`}
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <CreditCard
                    size={13}
                    className={
                      paymentPct === 100 ? "text-indigo-500" : "text-slate-400"
                    }
                  />
                  <span
                    className={`text-xs font-semibold ${
                      paymentPct === 100 ? "text-indigo-600" : "text-slate-500"
                    }`}
                  >
                    Thanh toán 100%
                  </span>
                </div>
                <p
                  className={`text-sm font-bold mb-1 ${
                    paymentPct === 100 ? "text-indigo-700" : "text-slate-700"
                  }`}
                >
                  {formatVND(total)}
                </p>
                <p
                  className={`text-[11px] leading-tight ${
                    paymentPct === 100 ? "text-indigo-400" : "text-slate-400"
                  }`}
                >
                  Thanh toán toàn bộ một lần
                </p>
              </button>
            </div>

            {/* Tóm tắt thanh toán */}
            <div className="bg-slate-50 rounded-xl px-4 py-3 mb-5 border border-slate-100 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Thanh toán ngay</span>
                <span className="text-base font-bold text-indigo-600">
                  {formatVND(payNow)}
                </span>
              </div>
              {paymentPct === 50 && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">
                    Còn lại (trước khởi hành)
                  </span>
                  <span className="text-xs font-medium text-slate-500">
                    {formatVND(remaining)}
                  </span>
                </div>
              )}
            </div>

            {/* Nút tiếp tục */}
            <button
              onClick={handleNext}
              className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-200"
            >
              Tiếp tục
              <ChevronRight size={16} />
            </button>

            {Object.values(errors).some(Boolean) &&
              Object.values(touched).some(Boolean) && (
                <div className="mt-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3 flex items-start gap-2">
                  <AlertCircle
                    size={15}
                    className="text-red-400 mt-0.5 shrink-0"
                  />
                  <p className="text-xs text-red-500">
                    Vui lòng kiểm tra lại thông tin liên hệ.
                  </p>
                </div>
              )}

            <p className="text-center text-xs text-slate-400 mt-3 flex items-center justify-center gap-1">
              <Shield size={12} className="text-green-400" />
              Thanh toán an toàn và bảo mật
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense>
      <SearchContent />
    </Suspense>
  );
}
