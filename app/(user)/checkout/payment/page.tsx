"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plane,
  MapPin,
  Shield,
  ChevronRight,
  ArrowLeft,
  CreditCard,
  Wallet,
  Loader2,
} from "lucide-react";

function formatVND(n: number) {
  return n.toLocaleString("vi-VN") + "đ";
}

function generateTxnRef() {
  return (
    Date.now() + "_" + Math.random().toString(36).slice(2, 7).toUpperCase()
  );
}

export default function PaymentPage() {
  const router = useRouter();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 1. Lấy dữ liệu từ localStorage khi component mount
  useEffect(() => {
    const savedData = localStorage.getItem("booking_data");
    if (!savedData) {
      // Nếu không có dữ liệu, quay lại trang trước hoặc trang chủ
      router.replace("/");
      return;
    }

    try {
      const parsedData = JSON.parse(savedData);
      setBooking(parsedData);
    } catch (err) {
      console.error("Lỗi parse dữ liệu booking:", err);
      router.replace("/");
    }
  }, [router]);

  // Nếu chưa load xong dữ liệu từ localStorage thì hiện loading nhẹ
  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  // 2. Trích xuất các biến từ object booking
  const {
    tourName = "",
    city = "",
    thumbnail = "",
    pricePerAdult = 0,
    pricePerChild = 0,
    adults = 1,
    children = 0,
    infants = 0,
    contactName = "",
    contactEmail = "",
    contactPhone = "",
    paymentPct = 100,
    payNow = 0,
    remaining = 0,
    total = 0,
  } = booking;

  const INSURANCE = 500_000;
  const subtotalAdults = adults * pricePerAdult;
  const subtotalChildren = children * pricePerChild;

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

  const handleVNPayPayment = async () => {
    setLoading(true);
    setError("");
    try {
      const txnRef = generateTxnRef();
      const res = await fetch("/api/payment/vnpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: payNow,
          orderInfo: `Thanh toan tour ${tourName}`,
          txnRef,
        }),
      });

      const data = await res.json();
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        setError("Không thể tạo URL thanh toán. Vui lòng thử lại.");
      }
    } catch {
      setError("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 font-sans pb-10">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="bg-indigo-600 text-white p-2 rounded-xl">
            <Plane size={20} />
          </div>
          <span className="font-bold text-xl text-slate-800 tracking-tight">
            TourViet
          </span>
          <div className="ml-auto flex items-center gap-2 text-sm">
            <span className="text-slate-400 px-3 py-1 rounded-full text-xs border border-slate-200 line-through">
              1 Thông tin
            </span>
            <ChevronRight size={14} className="text-slate-300" />
            <span className="bg-indigo-600 text-white px-3 py-1 rounded-full font-medium text-xs">
              2 Thanh toán
            </span>
            <ChevronRight size={14} className="text-slate-300" />
            <span className="text-slate-400 px-3 py-1 rounded-full text-xs border border-slate-200">
              3 Xác nhận
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 transition"
          >
            <ArrowLeft size={15} /> Quay lại thông tin
          </button>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="font-semibold text-slate-700 text-lg mb-5 flex items-center gap-2">
              <CreditCard size={18} className="text-indigo-500" />
              Thanh toán qua VNPay
            </h2>

            <div className="flex items-center gap-4 p-4 rounded-xl border-2 border-indigo-500 bg-indigo-50 mb-6">
              <div className="w-14 h-10 bg-blue-700 rounded-lg flex items-center justify-center shrink-0">
                <span className="text-white font-extrabold text-sm tracking-tight">
                  VNPay
                </span>
              </div>
              <div>
                <p className="font-semibold text-sm text-indigo-700">
                  Cổng thanh toán VNPay
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  ATM nội địa · Visa/Mastercard · QR Code · Ví điện tử
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { step: "1", text: 'Nhấn "Xác nhận thanh toán" bên dưới' },
                { step: "2", text: "Bạn sẽ được chuyển sang trang VNPay" },
                { step: "3", text: "Chọn phương thức và hoàn tất thanh toán" },
                {
                  step: "4",
                  text: "Hệ thống tự động xác nhận và gửi vé cho bạn",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="flex items-center gap-3 text-sm text-slate-600"
                >
                  <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 font-bold text-xs flex items-center justify-center shrink-0">
                    {item.step}
                  </div>
                  {item.text}
                </div>
              ))}
            </div>

            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-5">
            <h2 className="font-semibold text-slate-700 text-lg">
              Tổng kết đơn hàng
            </h2>

            {thumbnail && (
              <div className="flex gap-3 items-center bg-slate-50 rounded-xl p-3 border border-slate-100">
                <img
                  src={thumbnail}
                  alt={tourName}
                  className="w-16 h-12 rounded-lg object-cover shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-700 truncate">
                    {tourName}
                  </p>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin size={10} />
                    {city}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {orderItems.map((item) => (
                <div key={item.label} className="flex justify-between text-sm">
                  <span className="text-slate-500">{item.label}</span>
                  <span className="font-medium text-slate-700">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-3">
              <div className="flex justify-between text-sm mb-3">
                <span className="text-slate-500">Tổng cộng</span>
                <span className="font-semibold text-slate-700">
                  {formatVND(total)}
                </span>
              </div>

              <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 space-y-2">
                <div className="flex items-center gap-1.5 mb-1">
                  <Wallet size={13} className="text-indigo-500" />
                  <span className="text-xs font-semibold text-indigo-600">
                    {paymentPct === 50 ? "Đặt cọc 50%" : "Thanh toán 100%"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">
                    Thanh toán ngay
                  </span>
                  <span className="text-xl font-bold text-indigo-600">
                    {formatVND(payNow)}
                  </span>
                </div>
                {paymentPct === 50 && remaining > 0 && (
                  <div className="flex justify-between items-center border-t border-indigo-100 pt-2">
                    <span className="text-xs text-slate-400">
                      Còn lại (trước khởi hành)
                    </span>
                    <span className="text-xs font-medium text-slate-500">
                      {formatVND(remaining)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs text-slate-500 space-y-1">
              <p className="font-medium text-slate-600 mb-1">
                Thông tin liên hệ
              </p>
              <p>{contactName}</p>
              <p>{contactEmail}</p>
              <p>{contactPhone}</p>
            </div>

            <button
              onClick={handleVNPayPayment}
              disabled={loading}
              className="w-full bg-blue-700 hover:bg-blue-900 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-base py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  Xác nhận thanh toán
                  <ChevronRight size={18} />
                </>
              )}
            </button>

            <p className="text-center text-xs text-slate-400 flex items-center justify-center gap-1">
              <Shield size={12} className="text-green-400" />
              Thanh toán an toàn qua VNPay
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
