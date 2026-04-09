"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

function formatVND(n: number) {
  return n.toLocaleString("vi-VN") + "đ";
}

const PAYMENT_LABELS: Record<string, string> = {
  credit: "Thẻ tín dụng",
  momo: "MoMo",
  transfer: "Chuyển khoản ngân hàng",
};

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);

  // Parse tất cả VNPay params từ callback
  const vnpParams = Object.fromEntries(searchParams.entries());
  const vnpResponseCode = searchParams.get("vnp_ResponseCode");
  const vnpTxnRef = searchParams.get("vnp_TxnRef");
  const vnpAmount = searchParams.get("vnp_Amount");
  const vnpTransactionNo = searchParams.get("vnp_TransactionNo");
  const vnpBankCode = searchParams.get("vnp_BankCode");
  const status = searchParams.get("status") || "unknown";

  useEffect(() => {
    // Lưu VNPay info vào localStorage để dùng ngay
    if (vnpTxnRef) {
      localStorage.setItem("vnpay_result", JSON.stringify(vnpParams));
    }
  }, [searchParams]);

  // ✅ PRIORITY: bookingData từ searchParams (checkout pass full data)
  let bookingDataRaw = searchParams.get("bookingData");
  let bookingData = null;

  if (bookingDataRaw) {
    try {
      bookingData = JSON.parse(bookingDataRaw);
    } catch (e) {
      console.error("Parse bookingData failed:", e);
    }
  }

  // Fallback 1: localStorage (old flow)
  if (!bookingData) {
    const localRaw = localStorage.getItem("tour_booking");
    if (localRaw) bookingData = JSON.parse(localRaw);
  }

  // Fallback 2: VNPay orderInfo
  if (!bookingData) {
    const orderInfo = searchParams.get("vnp_OrderInfo");
    if (orderInfo) {
      try {
        bookingData = JSON.parse(decodeURIComponent(orderInfo));
      } catch {}
    }
  }

  // Xác định trạng thái thanh toán
  const isSuccess = vnpResponseCode === "00" && status === "success";
  const paymentAmount = vnpAmount ? parseInt(vnpAmount) / 100 : 0; // VNPay chia 100

  useEffect(() => {
    if (isSuccess && bookingData && vnpTxnRef) {
      // Lưu booking vào DB với VNPay info
      const saveBooking = async () => {
        try {
          // ✅ Lấy vnpay_result từ localStorage
          const vnpayResultRaw = localStorage.getItem("vnpay_result");
          let vnpayResult = null;
          if (vnpayResultRaw) {
            try {
              vnpayResult = JSON.parse(vnpayResultRaw);
            } catch (e) {
              console.error("Parse vnpay_result failed");
            }
          }

          const res = await fetch(
            "https://db-pickyourway.vercel.app/api/bookings",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
              body: JSON.stringify({
                ...bookingData,
                vnpay: {
                  ...vnpayResult, // ✅ FULL vnpay_result từ LS
                  responseCode: vnpResponseCode,
                  txnRef: vnpTxnRef,
                  transactionNo: vnpTransactionNo,
                  bankCode: vnpBankCode,
                  amount: paymentAmount,
                  params: vnpParams,
                },
                orderId: vnpTxnRef,
              }),
            },
          );

          if (res.ok) {
            localStorage.removeItem("tour_booking"); // Clear temp data
            setData({ ...bookingData, vnpay: vnpParams });
          }
        } catch (error) {
          console.error("Lưu booking failed:", error);
        }
      };
      saveBooking();
    }
  }, [isSuccess, bookingData, vnpTxnRef]);

  if (!data) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-red-500">
          Chưa có thông tin tour!
        </h2>
      </div>
    );
  }

  const tourName = data.tourName ?? "";
  const hotelName = data.hotelName ?? "";
  const city = data.city ?? "";
  const thumbnail = data.thumbnail ?? "";
  const pricePerAdult = parseInt(data.pricePerAdult ?? "0");
  const pricePerChild = parseInt(data.pricePerChild ?? "0");
  const adults = parseInt(data.adults ?? "1");
  const children = parseInt(data.children ?? "0");
  const contactName = data.contactName ?? "";
  const contactEmail = data.contactEmail ?? "";
  const contactPhone = data.contactPhone ?? "";
  const payment = data.payment ?? "credit";

  const subtotalAdults = adults * pricePerAdult;
  const subtotalChildren = children * pricePerChild;
  const INSURANCE = 500000;
  const total = subtotalAdults + subtotalChildren + INSURANCE;

  const paymentPct = parseInt(data.paymentPct ?? "100");
  const payNow = parseInt(data.payNow ?? "0");
  const remaining = parseInt(data.remaining ?? "0");

  const orderId = "TV" + Date.now().toString().slice(-8);

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-5">
        {/* SUCCESS */}
        <div className="bg-white p-6 rounded-xl text-center shadow">
          <CheckCircle2 className="text-green-500 mx-auto mb-2" size={40} />
          <h1 className="font-bold text-xl">Đặt tour thành công!</h1>
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

            {/* ===== CODE CŨ ===== */}
            <p className="font-bold text-indigo-600">{formatVND(total)}</p>

            {/* ===== ✅ PHẦN THÊM (LIÊN KẾT 2 FILE) ===== */}
            <div className="space-y-1">
              <p className="text-green-600 font-semibold">
                Đã thanh toán: {formatVND(payNow)}
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

        {/* ===== ✅ THÊM PHƯƠNG THỨC THANH TOÁN ===== */}
        <div className="bg-white p-4 rounded-xl shadow text-sm">
          <p className="font-medium">Phương thức thanh toán:</p>
          <p className="text-indigo-600">{PAYMENT_LABELS[payment]}</p>
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
