"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

function formatVND(n: number) {
  return n.toLocaleString("vi-VN") + "đ";
}

const PAYMENT_LABELS: Record<string, string> = {
  vnpay: "Thanh toán VNPay",
  bank_transfer: "Chuyển khoản ngân hàng",
};

function SearchContent() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);

  // ✅ Lấy dữ liệu từ localStorage
  useEffect(() => {
    try {
      const bookingRaw = localStorage.getItem("bookingData");
      const vnpayRaw = localStorage.getItem("vnpay_result");

      if (!bookingRaw || !vnpayRaw) {
        router.push("/");
        return;
      }

      const booking = JSON.parse(bookingRaw);
      const vnpay = JSON.parse(vnpayRaw);

      setData({ ...booking, vnpay });
    } catch (err) {
      console.error("Load localStorage failed", err);
      router.push("/");
    }
  }, [router]);

  // ✅ Lưu DB
  useEffect(() => {
    if (!data) return;

    const isSuccess = data.vnpay?.vnp_ResponseCode === "00";

    const paymentAmount = data.vnpay?.vnp_Amount
      ? parseInt(data.vnpay.vnp_Amount) / 100
      : 0;

    const saveBooking = async () => {
      try {
        const res = await fetch(
          "https://db-pickyourway.vercel.app/api/bookings",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              ...data,
              orderId: data.vnpay?.vnp_TxnRef,
              vnpay: {
                method: "vnpay",
                amount: paymentAmount,
                status: isSuccess ? "paid" : "failed",
                ...data.vnpay,
              },
            }),
          },
        );

        if (res.ok) {
          localStorage.removeItem("bookingData");
          localStorage.removeItem("vnpay_result");
        }
      } catch (error) {
        console.error("Lưu booking failed:", error);
      }
    };

    saveBooking();
  }, [data]);

  // ❌ chưa load xong
  if (!data) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-gray-500">Đang tải dữ liệu...</h2>
      </div>
    );
  }

  // ✅ LẤY DATA
  const {
    tourName = "",
    hotelName = "",
    city = "",
    thumbnail = "",
    adults = 1,
    children = 0,
    contactName = "",
    contactEmail = "",
    contactPhone = "",
    basePrice = 0,
    pricePerChild = 0,
    paymentPct = 100,
    remaining = 0,
    vnpay = {},
  } = data;

  // ✅ TÍNH TIỀN
  const subtotalAdults = adults * basePrice;
  const subtotalChildren = children * pricePerChild;

  const INSURANCE = 500000;
  const total = subtotalAdults + subtotalChildren + INSURANCE;

  const paymentAmountReal = vnpay?.vnp_Amount
    ? parseInt(vnpay.vnp_Amount) / 100
    : 0;

  const paymentStatus =
    vnpay?.vnp_ResponseCode === "00" ? "Thành công" : "Thất bại";

  const paymentMethod = "vnpay";

  const orderId = vnpay?.vnp_TxnRef || "N/A";

  // ❗ nếu fail thì không nên ghi "thành công"
  const isSuccess = vnpay?.vnp_ResponseCode === "00";

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-5">
        {/* STATUS */}
        <div className="bg-white p-6 rounded-xl text-center shadow">
          <CheckCircle2
            className={`mx-auto mb-2 ${isSuccess ? "text-green-500" : "text-red-500"}`}
            size={40}
          />
          <h1 className="font-bold text-xl">
            {isSuccess ? "Đặt tour thành công!" : "Thanh toán thất bại"}
          </h1>
          <p className="text-sm text-gray-500">Mã đơn: {orderId}</p>
        </div>

        {/* TOUR */}
        <div className="bg-white rounded-xl overflow-hidden shadow">
          {thumbnail && (
            <img src={thumbnail} className="w-full h-48 object-cover" />
          )}
          <div className="p-4 space-y-2">
            <h2 className="font-bold">{tourName}</h2>
            <p className="text-sm text-gray-500">
              {hotelName} - {city}
            </p>

            <p className="text-sm">
              {adults} người lớn - {children} trẻ em
            </p>

            <p className="font-bold text-indigo-600">{formatVND(total)}</p>

            <div className="space-y-1">
              <p className="text-green-600 font-semibold">
                Đã thanh toán: {formatVND(paymentAmountReal)}
              </p>
              <p className="text-sm text-gray-500">
                Trạng thái: {paymentStatus}
              </p>

              {paymentPct === 50 && remaining > 0 && (
                <p className="text-sm text-gray-500">
                  Còn lại: {formatVND(remaining)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* CONTACT */}
        <div className="bg-white p-4 rounded-xl shadow text-sm space-y-1">
          <p>{contactName}</p>
          <p>{contactEmail}</p>
          <p>{contactPhone}</p>
        </div>

        {/* PAYMENT */}
        <div className="bg-white p-4 rounded-xl shadow text-sm">
          <p className="font-medium">Phương thức thanh toán:</p>
          <p className="text-indigo-600">{PAYMENT_LABELS[paymentMethod]}</p>
        </div>

        {/* BUTTON */}
        <div className="flex gap-3">
          <button
            onClick={() => router.push("/")}
            className="flex-1 border p-3 rounded-xl"
          >
            Trang chủ
          </button>

          <button
            onClick={() => router.push("/bookings")}
            className="flex-1 bg-green-600 text-white p-3 rounded-xl"
          >
            Xem thông tin tour
          </button>
        </div>

        <p className="text-center text-xs text-gray-400">
          Bảo mật bởi TourViet
        </p>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <SearchContent />
    </Suspense>
  );
}
