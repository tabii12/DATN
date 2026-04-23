"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Home, Calendar } from "lucide-react";

function formatVND(n: number) {
  return n.toLocaleString("vi-VN") + "đ";
}

const PAYMENT_LABELS: Record<string, string> = {
  vnpay: "Thanh toán VNPay",
  bank_transfer: "Chuyển khoản ngân hàng",
};

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  // Parse tất cả VNPay params từ callback URL
  const vnpResponseCode = searchParams.get("vnp_ResponseCode");
  const vnpTxnRef = searchParams.get("vnp_TxnRef");
  const vnpAmount = searchParams.get("vnp_Amount");
  const vnpBankCode = searchParams.get("vnp_BankCode");
  const vnpTransactionNo = searchParams.get("vnp_TransactionNo");
  const status = searchParams.get("status") || "unknown";

  useEffect(() => {
    const saveBookingToDB = async () => {
      // ✅ 1. Lấy dữ liệu duy nhất từ key booking_data
      const bookingDataRaw = localStorage.getItem("booking_data");
      if (!bookingDataRaw) {
        setIsProcessing(false);
        return;
      }

      try {
        const bookingData = JSON.parse(bookingDataRaw);
        const isSuccess = vnpResponseCode === "00" && status === "success";
        const paymentAmount = vnpAmount ? parseInt(vnpAmount) / 100 : 0;

        // ✅ 2. Nếu thanh toán thành công, gọi API lưu vào database
        if (isSuccess && vnpTxnRef) {
  const vnpParams = Object.fromEntries(searchParams.entries());
  const bookingStatus = bookingData.paymentPct === 50 ? "paid_50" : "paid_100"; // ← THÊM

  const res = await fetch("https://db-pickyourway.vercel.app/api/bookings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({
      ...bookingData,
      orderId: vnpTxnRef,
      status: bookingStatus,     // ← THÊM
      vnpay: {
        ...vnpParams,
        method: "vnpay",
        amount: paymentAmount,
        status: bookingStatus,   // ← ĐỔI từ "paid"
        bank_code: vnpBankCode || "NCB",
        txnRef: vnpTxnRef,
        transactionNo: vnpTransactionNo,
      },
    }),
  });
          if (res.ok) {
            // Cập nhật state để hiển thị UI
            setData(bookingData);
            // ✅ 3. XÓA SẠCH DỮ LIỆU TẠM TRONG LOCALSTORAGE
            localStorage.removeItem("booking_data");
            localStorage.removeItem("vnpay_result"); 
          }
        } else {
          // Nếu không thành công, vẫn set data để hiển thị thông tin tour đã chọn
          setData(bookingData);
        }
      } catch (error) {
        console.error("Lưu booking failed:", error);
      } finally {
        setIsProcessing(false);
      }
    };

    saveBookingToDB();
  }, [vnpResponseCode, status, vnpTxnRef, searchParams]);

  if (isProcessing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
        <p className="text-slate-500">Đang hoàn tất giao dịch...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-red-500">Chưa có thông tin đơn hàng!</h2>
        <button onClick={() => router.push("/")} className="mt-4 text-indigo-600 underline">Quay lại trang chủ</button>
      </div>
    );
  }

  // Trích xuất dữ liệu hiển thị (Sử dụng destructuring với giá trị mặc định)
 const {
  tourName = "",
  hotelName = "",
  city = "",
  thumbnail = "",
  adults = 1,
  children = 0,
  infants = 0,
  pricePerAdult = 0,
  pricePerChild = 0,
  infantPrice = 0,
  infantTotal = 0,
  singleSupplement = 0,
  singleRooms = 0,
  contactName = "",
  contactEmail = "",
  contactPhone = "",
  total = 0,
  payNow = 0,
  remaining = 0,
  paymentPct = 100
} = data;

  const isSuccess = vnpResponseCode === "00";

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-5">
        {/* SUCCESS/FAIL CARD */}
        <div className="bg-white p-8 rounded-2xl text-center shadow-sm border border-slate-100">
          {isSuccess ? (
            <>
              <CheckCircle2 className="text-green-500 mx-auto mb-4" size={50} />
              <h1 className="font-bold text-2xl text-slate-800">Đặt tour thành công!</h1>
              <p className="text-sm text-slate-500 mt-2">Mã đơn: {vnpTxnRef}</p>
            </>
          ) : (
            <>
              <CheckCircle2 className="text-red-500 mx-auto mb-4 rotate-180" size={50} />
              <h1 className="font-bold text-2xl text-slate-800">Thanh toán không thành công</h1>
              <p className="text-sm text-slate-500 mt-2">Vui lòng thử lại hoặc liên hệ hỗ trợ.</p>
            </>
          )}
        </div>

        {/* TOUR INFO */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
          {thumbnail && <img src={thumbnail} className="w-full h-52 object-cover" alt="tour" />}
          <div className="p-6 space-y-4">
            <div>
              <h2 className="font-bold text-xl text-slate-800">{tourName}</h2>
              <p className="text-sm text-slate-500">{hotelName} - {city}</p>
            </div>

            <div className="flex justify-between text-sm py-3 border-y border-slate-50">
              <span className="text-slate-600">
  {adults} người lớn
  {children > 0 ? ` · ${children} trẻ em` : ""}
  {infants > 0 ? ` · ${infants} trẻ nhỏ` : ""}
</span>
              <span className="font-bold text-indigo-600 text-lg">{formatVND(total)}</span>
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">Đã thanh toán (VNPay):</span>
                <span className="text-green-600 font-bold">{formatVND(payNow)}</span>
              </div>
              {paymentPct === 50 && remaining > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 italic">Số tiền còn lại cần thanh toán:</span>
                  <span className="text-slate-600 font-semibold">{formatVND(remaining)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CONTACT INFO */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-1 text-sm text-slate-600">
          <p className="font-semibold text-slate-800 mb-2">Thông tin liên hệ</p>
          <p>{contactName}</p>
          <p>{contactEmail}</p>
          <p>{contactPhone}</p>
        </div>

        {/* NAVIGATION BUTTONS */}
        <div className="flex gap-4 pt-4">
          <button
            onClick={() => router.push("/")}
            className="flex-1 bg-white border border-slate-200 p-4 rounded-xl font-semibold text-slate-700 hover:bg-slate-50 transition flex items-center justify-center gap-2"
          >
            <Home size={18} /> Trang chủ
          </button>
          <button
            onClick={() => router.push("/bookings")}
            className="flex-1 bg-indigo-600 text-white p-4 rounded-xl font-semibold hover:bg-indigo-700 shadow-lg transition flex items-center justify-center gap-2"
          >
            <Calendar size={18} /> Đơn hàng của tôi
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>}>
      <SearchContent />
    </Suspense>
  );
}