"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

function VNPayReturnContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "fail">("loading");

  useEffect(() => {
    const responseCode = searchParams.get("vnp_ResponseCode");
    if (responseCode === "00") {
      setStatus("success");
      // Chuyển sang trang xác nhận sau 2 giây
      setTimeout(() => {
        const params = new URLSearchParams();
        params.set("payment", "vnpay");
        params.set("txnRef", searchParams.get("vnp_TxnRef") ?? "");
        router.push(`/checkout/confirmation?${params.toString()}`);
      }, 2000);
    } else {
      setStatus("fail");
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-10 flex flex-col items-center gap-4 max-w-sm w-full mx-4">
        {status === "loading" && (
          <>
            <Loader2 className="text-indigo-500 animate-spin" size={48} />
            <p className="text-slate-600 font-medium">Đang xử lý kết quả...</p>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle className="text-green-500" size={48} />
            <p className="text-slate-800 font-semibold text-lg">Thanh toán thành công!</p>
            <p className="text-slate-400 text-sm text-center">Đang chuyển đến trang xác nhận...</p>
          </>
        )}
        {status === "fail" && (
          <>
            <XCircle className="text-red-500" size={48} />
            <p className="text-slate-800 font-semibold text-lg">Thanh toán thất bại</p>
            <p className="text-slate-400 text-sm text-center">
              Mã lỗi: {searchParams.get("vnp_ResponseCode")}
            </p>
            <button
              onClick={() => router.back()}
              className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-6 rounded-xl transition"
            >
              Thử lại
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function VNPayReturnPage() {
  return (
    <Suspense>
      <VNPayReturnContent />
    </Suspense>
  );
}