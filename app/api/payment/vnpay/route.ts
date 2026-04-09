import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// ══════════════════════════════════════════════
//  ⚠️  THAY 2 GIÁ TRỊ NÀY KHI CÓ EMAIL VNPAY
// ══════════════════════════════════════════════
const VNP_TMN_CODE = "PTTWTZZC";
const VNP_HASH_SECRET = "MT2SFAQ1GR8B26P4F0RKNFAC1UOHY9PO";
// ══════════════════════════════════════════════

const VNP_URL = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
const VNP_RETURN_URL = process.env.NEXT_PUBLIC_BASE_URL + "/checkout/vnpay-return";

function sortObject(obj: Record<string, string>) {
  return Object.keys(obj)
    .sort()
    .reduce((acc, key) => {
      acc[key] = obj[key];
      return acc;
    }, {} as Record<string, string>);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, orderInfo, txnRef } = body;

    // Lấy IP của client
    const ipAddr =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const now = new Date();
    // Format: YYYYMMDDHHmmss theo giờ VN (UTC+7)
    const vnTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    const createDate = vnTime.toISOString().replace(/[-:T]/g, "").slice(0, 14);

    const params: Record<string, string> = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: VNP_TMN_CODE,
      vnp_Amount: String(Number(amount) * 100), // VNPay nhân 100
      vnp_CurrCode: "VND",
      vnp_TxnRef: txnRef,           // Mã đơn hàng (unique)
      vnp_OrderInfo: orderInfo,     // Mô tả đơn hàng
      vnp_OrderType: "other",
      vnp_Locale: "vn",
      vnp_ReturnUrl: VNP_RETURN_URL,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate,
    };

    // Sắp xếp params theo alphabet rồi ký HMAC-SHA512
    const sorted = sortObject(params);
    const signData = new URLSearchParams(sorted).toString();
    const signature = crypto
      .createHmac("sha512", VNP_HASH_SECRET)
      .update(signData)
      .digest("hex");

    sorted["vnp_SecureHash"] = signature;

    const paymentUrl =
      VNP_URL + "?" + new URLSearchParams(sorted).toString();

    return NextResponse.json({ paymentUrl });
  } catch (err) {
    console.error("VNPay error:", err);
    return NextResponse.json({ error: "Lỗi tạo URL thanh toán" }, { status: 500 });
  }
}