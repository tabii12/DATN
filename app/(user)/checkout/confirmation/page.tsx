"use client";
import { Suspense, useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";

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
  const [loading, setLoading] = useState(true);

  // 1. Lấy tất cả params từ VNPay trực tiếp từ URL
  const vnpParams = useMemo(
    () => Object.fromEntries(searchParams.entries()),
    [searchParams],
  );

  const vnpResponseCode = searchParams.get("vnp_ResponseCode");
  const vnpTxnRef = searchParams.get("vnp_TxnRef");
  const vnpAmount = searchParams.get("vnp_Amount");
  const statusParam = searchParams.get("status");

  useEffect(() => {
    const processPayment = async () => {
      // Xác định dữ liệu booking (Ưu tiên searchParams -> localStorage)
      let bookingData = null;
      const bookingDataRaw = searchParams.get("bookingData");

      if (bookingDataRaw) {
        try {
          bookingData = JSON.parse(bookingDataRaw);
        } catch (e) {}
      }

      if (!bookingData) {
        const localRaw = localStorage.getItem("tour_booking");
        if (localRaw) bookingData = JSON.parse(localRaw);
      }

      // Điều kiện thành công: VNPay trả về 00
      const isActuallySuccess = vnpResponseCode === "00";

      if (isActuallySuccess && vnpTxnRef && bookingData) {
        try {
          const paymentAmount = vnpAmount ? parseInt(vnpAmount) / 100 : 0;

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
                orderId: vnpTxnRef,
                payment: {
                  method: "vnpay",
                  amount: paymentAmount,
                  status: "paid",
                  bank_code: vnpParams.vnp_BankCode || "NCB",
                  bank_account_number: "0123456789",
                  bank_account_name: "PICKYOURWAY COMPANY LIMITED",
                  vnpay: vnpParams,
                  transfer_content:
                    vnpParams.vnp_OrderInfo || `BOOKING_${vnpTxnRef}`,
                },
              }),
            },
          );

          if (res.ok) {
            const savedData = await res.json();
            // Xóa rác sau khi lưu thành công
            localStorage.removeItem("tour_booking");
            localStorage.removeItem("vnpay_result");
            setData(
              savedData.data || {
                ...bookingData,
                payment: {
                  method: "vnpay",
                  status: "paid",
                  amount: paymentAmount,
                },
              },
            );
          }
        } catch (error) {
          console.error("Lưu booking thất bại:", error);
        }
      } else if (bookingData) {
        // Trường hợp quay về mà không có param VNPay hoặc thanh toán lỗi
        setData(bookingData);
      }
      setLoading(false);
    };

    processPayment();
  }, [vnpResponseCode, vnpTxnRef, vnpAmount]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-indigo-600 mb-2" size={40} />
        <p>Đang xác nhận thanh toán...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-red-500">
          Chưa có thông tin tour!
        </h2>
        <button
          onClick={() => router.push("/")}
          className="mt-4 text-indigo-600 underline"
        >
          Quay lại trang chủ
        </button>
      </div>
    );
  }

  // Helper để lấy dữ liệu an toàn
  const payment = data.payment || {};
  const total =
    data.adults * (data.pricePerAdult || 0) +
    data.children * (data.pricePerChild || 0) +
    500000;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="bg-white p-6 rounded-xl text-center shadow">
          <CheckCircle2 className="text-green-500 mx-auto mb-2" size={40} />
          <h1 className="font-bold text-xl">Đặt tour thành công!</h1>
          <p className="text-sm text-gray-500">
            Mã đơn: {data.orderId || "Đang xử lý"}
          </p>
        </div>

        <div className="bg-white rounded-xl overflow-hidden shadow">
          {data.thumbnail && (
            <img
              src={data.thumbnail}
              alt="tour"
              className="w-full h-48 object-cover"
            />
          )}
          <div className="p-4 space-y-2">
            <h2 className="font-bold">{data.tourName}</h2>
            <p className="text-sm text-gray-500">
              {data.hotelName} - {data.city}
            </p>
            <p className="text-sm">
              {data.adults} người lớn - {data.children} trẻ em
            </p>
            <p className="font-bold text-indigo-600">{formatVND(total)}</p>

            <div className="pt-2 border-t space-y-1">
              <p className="text-green-600 font-semibold">
                Đã thanh toán: {formatVND(payment.amount || 0)}
              </p>
              <p className="text-sm text-gray-500 capitalize">
                Trạng thái:{" "}
                {payment.status === "paid" ? "Đã thanh toán" : "Chờ xử lý"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow text-sm space-y-1">
          <p className="font-bold border-b pb-1 mb-2">Thông tin liên hệ</p>
          <p>Họ tên: {data.contactName}</p>
          <p>Email: {data.contactEmail}</p>
          <p>SĐT: {data.contactPhone}</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow text-sm">
          <p className="font-medium">Phương thức thanh toán:</p>
          {/* Sửa lỗi hiển thị ở đây: dùng payment.method thay vì cả object payment */}
          <p className="text-indigo-600">
            {PAYMENT_LABELS[payment.method] || "VNPay"}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => router.push("/")}
            className="flex-1 border p-3 rounded-xl hover:bg-gray-50"
          >
            Trang chủ
          </button>
          <button
            onClick={() => router.push("/bookings")}
            className="flex-1 bg-green-600 text-white p-3 rounded-xl hover:bg-green-700"
          >
            Xem tour của tôi
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
}
