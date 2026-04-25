"use client";
import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const VNP_HASH_SECRET = "MT2SFAQ1GR8B26P4F0RKNFAC1UOHY9PO";

function VnpayReturnPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const handleReturn = async () => {
      const params = Object.fromEntries(searchParams.entries());

      const receivedHash = params.vnp_SecureHash;
      delete params.vnp_SecureHash;

      const sortedParams = Object.keys(params)
        .sort()
        .reduce((acc, key) => {
          acc[key] = params[key];
          return acc;
        }, {} as Record<string, string>);

      const signData = new URLSearchParams(sortedParams).toString();

      const calculatedHash = require("crypto")
        .createHmac("sha512", VNP_HASH_SECRET)
        .update(signData)
        .digest("hex");

      const isValid = receivedHash === calculatedHash;

      const txnRef = params.vnp_TxnRef;
      const amount = Number(params.vnp_Amount) / 100; // 👈 đã gồm 500k

      if (isValid && params.vnp_ResponseCode === "00") {
        try {
          // 🔥 FIX QUAN TRỌNG: UPDATE BOOKING
          await fetch("https://db-pickyourway.vercel.app/api/bookings/update-payment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              txnRef,
              status: "paid",
              total_price: amount, // 👈 giữ nguyên tiền từ VNPay
            }),
          });
        } catch (err) {
          console.error("Update booking error:", err);
        }

        const query = new URLSearchParams(params).toString();
        router.replace(`/checkout/confirmation?${query}&status=success`);
      } else {
        const errorParams = new URLSearchParams({
          vnp_ResponseCode: params.vnp_ResponseCode || "99",
          vnp_TxnRef: params.vnp_TxnRef || "",
          status: "failed",
          message: params.vnp_ResponseDescription || "Xác thực thất bại",
        }).toString();

        router.replace(`/checkout/confirmation?${errorParams}`);
      }
    };

    handleReturn();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
              VNP
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Đang xử lý...
          </h2>
          <p className="text-gray-500">Xác thực thanh toán VNPay</p>
        </div>
      </div>
    </div>
  );
}

export default VnpayReturnPage;