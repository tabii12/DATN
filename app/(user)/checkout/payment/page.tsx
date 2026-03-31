"use client";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Plane,
  MapPin,
  Users,
  Shield,
  ChevronRight,
  ArrowLeft,
  CreditCard,
  Lock,
  AlertCircle,
  Wallet,
} from "lucide-react";

const MOMO_QR =
  "data:image/png;base64,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";

function formatVND(n: number) {
  return n.toLocaleString("vi-VN") + "đ";
}

const paymentMethods = [
  {
    id: "momo",
    label: "MoMo",
    desc: "Quét mã QR để thanh toán nhanh",
    icon: (
      <div className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold text-lg">
        M
      </div>
    ),
  },
  {
    id: "credit",
    label: "Thẻ tín dụng / ghi nợ",
    desc: "Visa, Mastercard, JCB",
    icon: (
      <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white">
        <CreditCard size={20} />
      </div>
    ),
  },
  {
    id: "transfer",
    label: "Chuyển khoản ngân hàng",
    desc: "Vietcombank, Techcombank...",
    icon: (
      <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-bold text-sm">
        CK
      </div>
    ),
  },
];

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tourName = searchParams.get("tourName") ?? "";
  const hotelName = searchParams.get("hotelName") ?? "";
  const city = searchParams.get("city") ?? "";
  const thumbnail = searchParams.get("thumbnail") ?? "";
  const tourSlug = searchParams.get("tourSlug") ?? "";
  const pricePerAdult = parseInt(searchParams.get("pricePerAdult") ?? "0");
  const pricePerChild = parseInt(searchParams.get("pricePerChild") ?? "0");
  const adults = parseInt(searchParams.get("adults") ?? "1");
  const children = parseInt(searchParams.get("children") ?? "0");
  const contactName = searchParams.get("contactName") ?? "";
  const contactEmail = searchParams.get("contactEmail") ?? "";
  const contactPhone = searchParams.get("contactPhone") ?? "";

  // ── ĐỌC CÁC PARAMS TỪ TRANG 1 ──
  const paymentPct = parseInt(searchParams.get("paymentPct") ?? "100") as 50 | 100;
  const INSURANCE = 500_000;
  const subtotalAdults = adults * pricePerAdult;
  const subtotalChildren = children * pricePerChild;
  const total = subtotalAdults + subtotalChildren + INSURANCE;
  // Dùng giá trị từ params nếu có, fallback tự tính
  const payNow = parseInt(searchParams.get("payNow") ?? String(Math.round(total * paymentPct / 100)));
  const remaining = parseInt(searchParams.get("remaining") ?? String(total - payNow));

  const [selected, setSelected] = useState("momo");
  const [card, setCard] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
  });
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});

  const orderItems = [
    {
      label: `Giá tour (${adults} người lớn)`,
      value: formatVND(subtotalAdults),
    },
    ...(children > 0
      ? [{ label: `Giá tour (${children} trẻ em)`, value: formatVND(subtotalChildren) }]
      : []),
    { label: "Bảo hiểm du lịch", value: formatVND(INSURANCE) },
  ];

  const validateCard = () => {
    const errs: Record<string, string> = {};
    if (!card.number.replace(/\s/g, "") || card.number.replace(/\s/g, "").length < 16)
      errs.number = "Số thẻ không hợp lệ";
    if (!card.expiry || !/^\d{2}\/\d{2}$/.test(card.expiry))
      errs.expiry = "Định dạng MM/YY";
    if (!card.cvv || card.cvv.length < 3) errs.cvv = "CVV không hợp lệ";
    if (!card.name.trim()) errs.name = "Vui lòng nhập tên trên thẻ";
    return errs;
  };

  const handleConfirm = () => {
    if (selected === "credit") {
      const errs = validateCard();
      if (Object.keys(errs).length) {
        setCardErrors(errs);
        return;
      }
    }
    const params = new URLSearchParams({
      tourName,
      hotelName,
      city,
      thumbnail,
      tourSlug,
      pricePerAdult: String(pricePerAdult),
      pricePerChild: String(pricePerChild),
      adults: String(adults),
      children: String(children),
      contactName,
      contactEmail,
      contactPhone,
      paymentPct: String(paymentPct),
      payNow: String(payNow),
      remaining: String(remaining),
      payment: selected,
    });
    router.push(`/checkout/confirmation?${params.toString()}`);
  };

  const formatCardNumber = (v: string) =>
    v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();

  const formatExpiry = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 4);
    return d.length > 2 ? d.slice(0, 2) + "/" + d.slice(2) : d;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="bg-indigo-600 text-white p-2 rounded-xl">
            <Plane size={20} />
          </div>
          <span className="font-bold text-xl text-slate-800 tracking-tight">TourViet</span>
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

      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 transition"
          >
            <ArrowLeft size={15} /> Quay lại thông tin
          </button>

          {/* Chọn phương thức */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="font-semibold text-slate-700 text-lg mb-5 flex items-center gap-2">
              <CreditCard size={18} className="text-indigo-500" />
              Phương thức thanh toán
            </h2>
            <div className="space-y-3">
              {paymentMethods.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelected(m.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                    selected === m.id
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  {m.icon}
                  <div className="flex-1">
                    <p className={`font-semibold text-sm ${selected === m.id ? "text-indigo-700" : "text-slate-700"}`}>
                      {m.label}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{m.desc}</p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      selected === m.id ? "border-indigo-500" : "border-slate-300"
                    }`}
                  >
                    {selected === m.id && <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Detail area */}
          {selected === "momo" && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col items-center gap-4">
              <p className="text-sm text-slate-500 self-start">
                Mở app MoMo → Quét mã bên dưới để thanh toán
              </p>
              <div className="border-2 border-pink-200 rounded-2xl p-2 bg-white shadow-sm w-full max-w-xs">
                <img src={MOMO_QR} alt="MoMo QR" className="w-full h-auto object-contain rounded-xl" />
              </div>
              <p className="text-sm text-slate-500">
                Số tiền cần thanh toán ngay:{" "}
                <span className="font-bold text-pink-600">{formatVND(payNow)}</span>
              </p>
            </div>
          )}

          {selected === "credit" && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
                <Lock size={15} className="text-green-500" /> Thông tin thẻ
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Số thẻ</label>
                  <input
                    value={card.number}
                    onChange={(e) => setCard((p) => ({ ...p, number: formatCardNumber(e.target.value) }))}
                    placeholder="1234 5678 9012 3456"
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm placeholder-slate-300 focus:outline-none focus:ring-2 transition ${
                      cardErrors.number ? "border-red-300 focus:ring-red-200" : "border-slate-200 focus:ring-indigo-300"
                    }`}
                  />
                  {cardErrors.number && (
                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle size={11} />{cardErrors.number}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">Ngày hết hạn</label>
                    <input
                      value={card.expiry}
                      onChange={(e) => setCard((p) => ({ ...p, expiry: formatExpiry(e.target.value) }))}
                      placeholder="MM/YY"
                      className={`w-full border rounded-xl px-4 py-2.5 text-sm placeholder-slate-300 focus:outline-none focus:ring-2 transition ${
                        cardErrors.expiry ? "border-red-300 focus:ring-red-200" : "border-slate-200 focus:ring-indigo-300"
                      }`}
                    />
                    {cardErrors.expiry && (
                      <p className="mt-1 text-xs text-red-500">
                        <AlertCircle size={11} className="inline mr-1" />{cardErrors.expiry}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">CVV</label>
                    <input
                      value={card.cvv}
                      onChange={(e) => setCard((p) => ({ ...p, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                      placeholder="123"
                      className={`w-full border rounded-xl px-4 py-2.5 text-sm placeholder-slate-300 focus:outline-none focus:ring-2 transition ${
                        cardErrors.cvv ? "border-red-300 focus:ring-red-200" : "border-slate-200 focus:ring-indigo-300"
                      }`}
                    />
                    {cardErrors.cvv && (
                      <p className="mt-1 text-xs text-red-500">
                        <AlertCircle size={11} className="inline mr-1" />{cardErrors.cvv}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Tên trên thẻ</label>
                  <input
                    value={card.name}
                    onChange={(e) => setCard((p) => ({ ...p, name: e.target.value.toUpperCase() }))}
                    placeholder="NGUYEN VAN A"
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm placeholder-slate-300 focus:outline-none focus:ring-2 transition ${
                      cardErrors.name ? "border-red-300 focus:ring-red-200" : "border-slate-200 focus:ring-indigo-300"
                    }`}
                  />
                  {cardErrors.name && (
                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle size={11} />{cardErrors.name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {selected === "transfer" && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="font-semibold text-slate-700 mb-4">Thông tin chuyển khoản</h3>
              <div className="bg-slate-50 rounded-xl p-4 space-y-3 border border-slate-200 text-sm">
                {[
                  { label: "Ngân hàng", value: "Vietcombank" },
                  { label: "Số tài khoản", value: "1234567890" },
                  { label: "Chủ tài khoản", value: "TOURVIET JSC" },
                  { label: "Số tiền cần CK", value: formatVND(payNow) },
                  { label: "Nội dung CK", value: tourSlug || "TOURVIET" },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between">
                    <span className="text-slate-400">{row.label}</span>
                    <span className="font-semibold text-slate-700">{row.value}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-3">
                Sau khi chuyển khoản, vui lòng chụp màn hình xác nhận và liên hệ hỗ trợ.
              </p>
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky top-24 space-y-5">
            <h2 className="font-semibold text-slate-700 text-lg">Tổng kết đơn hàng</h2>

            {thumbnail && (
              <div className="flex gap-3 items-center bg-slate-50 rounded-xl p-3 border border-slate-100">
                <img src={thumbnail} alt={tourName} className="w-16 h-12 rounded-lg object-cover shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-700 truncate">{tourName}</p>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin size={10} />{city}
                  </p>
                </div>
              </div>
            )}

            {/* Chi tiết giá */}
            <div className="space-y-3">
              {orderItems.map((item) => (
                <div key={item.label} className="flex justify-between text-sm">
                  <span className="text-slate-500">{item.label}</span>
                  <span className="font-medium text-slate-700">{item.value}</span>
                </div>
              ))}
            </div>

            {/* Tổng cộng */}
            <div className="border-t border-slate-100 pt-3">
              <div className="flex justify-between text-sm mb-3">
                <span className="text-slate-500">Tổng cộng</span>
                <span className="font-semibold text-slate-700">{formatVND(total)}</span>
              </div>

              {/* ── PHẦN FIX CHÍNH: hiển thị payNow / remaining ── */}
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 space-y-2">
                <div className="flex items-center gap-1.5 mb-1">
                  <Wallet size={13} className="text-indigo-500" />
                  <span className="text-xs font-semibold text-indigo-600">
                    {paymentPct === 50 ? "Đặt cọc 50%" : "Thanh toán 100%"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Thanh toán ngay</span>
                  <span className="text-xl font-bold text-indigo-600">{formatVND(payNow)}</span>
                </div>
                {paymentPct === 50 && remaining > 0 && (
                  <div className="flex justify-between items-center border-t border-indigo-100 pt-2">
                    <span className="text-xs text-slate-400">Còn lại (trước khởi hành)</span>
                    <span className="text-xs font-medium text-slate-500">{formatVND(remaining)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Thông tin liên hệ tóm tắt */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs text-slate-500 space-y-1">
              <p className="font-medium text-slate-600 mb-1">Thông tin liên hệ</p>
              <p>{contactName}</p>
              <p>{contactEmail}</p>
              <p>{contactPhone}</p>
            </div>

            <button
              onClick={handleConfirm}
              className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-200"
            >
              Xác nhận thanh toán
              <ChevronRight size={16} />
            </button>

            <p className="text-center text-xs text-slate-400 flex items-center justify-center gap-1">
              <Shield size={12} className="text-green-400" />
              Thanh toán an toàn và bảo mật
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense>
      <SearchContent />
    </Suspense>
  );
}