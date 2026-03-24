"use client";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Plane, MapPin, Users, Shield, ChevronRight, ArrowLeft, CreditCard, Lock, AlertCircle } from "lucide-react";

function formatVND(n: number) {
  return n.toLocaleString("vi-VN") + "đ";
}

const paymentMethods = [
  {
    id: "momo",
    label: "MoMo",
    desc: "Quét mã QR để thanh toán nhanh",
    icon: (
      <div className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold text-lg">M</div>
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
      <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-bold text-sm">CK</div>
    ),
  },
];

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tourName      = searchParams.get("tourName")      ?? "";
  const hotelName     = searchParams.get("hotelName")     ?? "";
  const city          = searchParams.get("city")          ?? "";
  const thumbnail     = searchParams.get("thumbnail")     ?? "";
  const tourSlug      = searchParams.get("tourSlug")      ?? "";
  const pricePerAdult = parseInt(searchParams.get("pricePerAdult") ?? "0");
  const pricePerChild = parseInt(searchParams.get("pricePerChild") ?? "0");
  const adults        = parseInt(searchParams.get("adults")        ?? "1");
  const children      = parseInt(searchParams.get("children")      ?? "0");
  const contactName   = searchParams.get("contactName")   ?? "";
  const contactEmail  = searchParams.get("contactEmail")  ?? "";
  const contactPhone  = searchParams.get("contactPhone")  ?? "";

  const [selected, setSelected] = useState("momo");
  const [card, setCard] = useState({ number: "", expiry: "", cvv: "", name: "" });
  const [cardErrors, setCardErrors] = useState<Record<string,string>>({});
  const [payPercent, setPayPercent] = useState<50 | 100>(100);

  const subtotalAdults   = adults * pricePerAdult;
  const subtotalChildren = children * pricePerChild;
  const INSURANCE        = 500_000;
  const total            = subtotalAdults + subtotalChildren + INSURANCE;
  const payNow           = payPercent === 50 ? Math.round(total * 0.5) : total;
  const payLater         = total - payNow;

  const orderItems = [
    { label: `Giá tour (${adults} người lớn)`, value: formatVND(subtotalAdults) },
    ...(children > 0 ? [{ label: `Giá tour (${children} trẻ em)`, value: formatVND(subtotalChildren) }] : []),
    { label: "Bảo hiểm du lịch", value: formatVND(INSURANCE) },
  ];

  const validateCard = () => {
    const errs: Record<string,string> = {};
    if (!card.number.replace(/\s/g,"") || card.number.replace(/\s/g,"").length < 16) errs.number = "Số thẻ không hợp lệ";
    if (!card.expiry || !/^\d{2}\/\d{2}$/.test(card.expiry)) errs.expiry = "Định dạng MM/YY";
    if (!card.cvv || card.cvv.length < 3) errs.cvv = "CVV không hợp lệ";
    if (!card.name.trim()) errs.name = "Vui lòng nhập tên trên thẻ";
    return errs;
  };

  const handleConfirm = () => {
    if (selected === "credit") {
      const errs = validateCard();
      if (Object.keys(errs).length) { setCardErrors(errs); return; }
    }
    const params = new URLSearchParams({
      tourName, hotelName, city, thumbnail, tourSlug,
      pricePerAdult: String(pricePerAdult),
      pricePerChild: String(pricePerChild),
      adults:        String(adults),
      children:      String(children),
      contactName, contactEmail, contactPhone,
      payment: selected,
    });
    router.push(`/checkout/confirmation?${params.toString()}`);
  };

  const formatCardNumber = (v: string) =>
    v.replace(/\D/g,"").slice(0,16).replace(/(.{4})/g,"$1 ").trim();

  const formatExpiry = (v: string) => {
    const d = v.replace(/\D/g,"").slice(0,4);
    return d.length > 2 ? d.slice(0,2) + "/" + d.slice(2) : d;
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
            <span className="text-slate-400 px-3 py-1 rounded-full text-xs border border-slate-200 line-through">1 Thông tin</span>
            <ChevronRight size={14} className="text-slate-300" />
            <span className="bg-indigo-600 text-white px-3 py-1 rounded-full font-medium text-xs">2 Thanh toán</span>
            <ChevronRight size={14} className="text-slate-300" />
            <span className="text-slate-400 px-3 py-1 rounded-full text-xs border border-slate-200">3 Xác nhận</span>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">

          {/* Back */}
          <button onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 transition">
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
                    <p className={`font-semibold text-sm ${selected === m.id ? "text-indigo-700" : "text-slate-700"}`}>{m.label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{m.desc}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    selected === m.id ? "border-indigo-500" : "border-slate-300"
                  }`}>
                    {selected === m.id && <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Detail area - MoMo: không hiển thị gì thêm */}

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
                    onChange={(e) => setCard(p => ({ ...p, number: formatCardNumber(e.target.value) }))}
                    placeholder="1234 5678 9012 3456"
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm placeholder-slate-300 focus:outline-none focus:ring-2 transition ${cardErrors.number ? "border-red-300 focus:ring-red-200" : "border-slate-200 focus:ring-indigo-300"}`}
                  />
                  {cardErrors.number && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={11}/>{cardErrors.number}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">Ngày hết hạn</label>
                    <input
                      value={card.expiry}
                      onChange={(e) => setCard(p => ({ ...p, expiry: formatExpiry(e.target.value) }))}
                      placeholder="MM/YY"
                      className={`w-full border rounded-xl px-4 py-2.5 text-sm placeholder-slate-300 focus:outline-none focus:ring-2 transition ${cardErrors.expiry ? "border-red-300 focus:ring-red-200" : "border-slate-200 focus:ring-indigo-300"}`}
                    />
                    {cardErrors.expiry && <p className="mt-1 text-xs text-red-500"><AlertCircle size={11} className="inline mr-1"/>{cardErrors.expiry}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">CVV</label>
                    <input
                      value={card.cvv}
                      onChange={(e) => setCard(p => ({ ...p, cvv: e.target.value.replace(/\D/g,"").slice(0,4) }))}
                      placeholder="123"
                      className={`w-full border rounded-xl px-4 py-2.5 text-sm placeholder-slate-300 focus:outline-none focus:ring-2 transition ${cardErrors.cvv ? "border-red-300 focus:ring-red-200" : "border-slate-200 focus:ring-indigo-300"}`}
                    />
                    {cardErrors.cvv && <p className="mt-1 text-xs text-red-500"><AlertCircle size={11} className="inline mr-1"/>{cardErrors.cvv}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Tên trên thẻ</label>
                  <input
                    value={card.name}
                    onChange={(e) => setCard(p => ({ ...p, name: e.target.value.toUpperCase() }))}
                    placeholder="NGUYEN VAN A"
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm placeholder-slate-300 focus:outline-none focus:ring-2 transition ${cardErrors.name ? "border-red-300 focus:ring-red-200" : "border-slate-200 focus:ring-indigo-300"}`}
                  />
                  {cardErrors.name && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={11}/>{cardErrors.name}</p>}
                </div>
              </div>
            </div>
          )}

          {selected === "transfer" && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="font-semibold text-slate-700 mb-4">Thông tin chuyển khoản</h3>
              <div className="bg-slate-50 rounded-xl p-4 space-y-3 border border-slate-200 text-sm">
                {[
                  { label: "Ngân hàng",     value: "Vietcombank" },
                  { label: "Số tài khoản",  value: "1234567890" },
                  { label: "Chủ tài khoản", value: "TOURVIET JSC" },
                  { label: "Số tiền",       value: formatVND(total) },
                  { label: "Nội dung CK",   value: tourSlug || "TOURVIET" },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between">
                    <span className="text-slate-400">{row.label}</span>
                    <span className="font-semibold text-slate-700">{row.value}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-3">Sau khi chuyển khoản, vui lòng chụp màn hình xác nhận và liên hệ hỗ trợ.</p>
            </div>
          )}

        </div>

        {/* RIGHT */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky top-24 space-y-5">
            <h2 className="font-semibold text-slate-700 text-lg">Tổng kết đơn hàng</h2>

            {/* Tour thumb */}
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

            <div className="space-y-3">
              {orderItems.map((item) => (
                <div key={item.label} className="flex justify-between text-sm">
                  <span className="text-slate-500">{item.label}</span>
                  <span className="font-medium text-slate-700">{item.value}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Tổng giá trị</span>
                <span className="font-semibold text-slate-700">{formatVND(total)}</span>
              </div>

              {/* Toggle 100% / 50% */}
              <div>
                <p className="text-xs font-medium text-slate-500 mb-2">Hình thức thanh toán</p>
                <div className="grid grid-cols-2 gap-2">
                  {([100, 50] as const).map((pct) => (
                    <button
                      key={pct}
                      onClick={() => setPayPercent(pct)}
                      className={`py-2 px-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                        payPercent === pct
                          ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                          : "border-slate-200 text-slate-500 hover:border-slate-300"
                      }`}
                    >
                      {pct === 100 ? "Toàn bộ 100%" : "Đặt cọc 50%"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-indigo-50 rounded-xl px-4 py-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-indigo-700">Thanh toán ngay</span>
                  <span className="text-xl font-bold text-indigo-600">{formatVND(payNow)}</span>
                </div>
                {payPercent === 50 && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Còn lại khi khởi hành</span>
                    <span className="text-xs font-semibold text-slate-500">{formatVND(payLater)}</span>
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