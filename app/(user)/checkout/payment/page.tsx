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

  const [selected, setSelected] = useState("momo");
  const [card, setCard] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
  });
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});

  const subtotalAdults = adults * pricePerAdult;
  const subtotalChildren = children * pricePerChild;
  const INSURANCE = 500_000;
  const total = subtotalAdults + subtotalChildren + INSURANCE;

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

  const validateCard = () => {
    const errs: Record<string, string> = {};
    if (
      !card.number.replace(/\s/g, "") ||
      card.number.replace(/\s/g, "").length < 16
    )
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
      payment: selected,
    });
    router.push(`/checkout/confirmation?${params.toString()}`);
  };

  const formatCardNumber = (v: string) =>
    v
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(.{4})/g, "$1 ")
      .trim();

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

      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">
          {/* Back */}
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
                    <p
                      className={`font-semibold text-sm ${selected === m.id ? "text-indigo-700" : "text-slate-700"}`}
                    >
                      {m.label}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{m.desc}</p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      selected === m.id
                        ? "border-indigo-500"
                        : "border-slate-300"
                    }`}
                  >
                    {selected === m.id && (
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                    )}
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
                <img
                  src={MOMO_QR}
                  alt="MoMo QR"
                  className="w-full h-auto object-contain rounded-xl"
                />
              </div>
              <p className="text-sm text-slate-500">
                Số tiền:{" "}
                <span className="font-bold text-pink-600">
                  {formatVND(total)}
                </span>
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
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">
                    Số thẻ
                  </label>
                  <input
                    value={card.number}
                    onChange={(e) =>
                      setCard((p) => ({
                        ...p,
                        number: formatCardNumber(e.target.value),
                      }))
                    }
                    placeholder="1234 5678 9012 3456"
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm placeholder-slate-300 focus:outline-none focus:ring-2 transition ${cardErrors.number ? "border-red-300 focus:ring-red-200" : "border-slate-200 focus:ring-indigo-300"}`}
                  />
                  {cardErrors.number && (
                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle size={11} />
                      {cardErrors.number}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">
                      Ngày hết hạn
                    </label>
                    <input
                      value={card.expiry}
                      onChange={(e) =>
                        setCard((p) => ({
                          ...p,
                          expiry: formatExpiry(e.target.value),
                        }))
                      }
                      placeholder="MM/YY"
                      className={`w-full border rounded-xl px-4 py-2.5 text-sm placeholder-slate-300 focus:outline-none focus:ring-2 transition ${cardErrors.expiry ? "border-red-300 focus:ring-red-200" : "border-slate-200 focus:ring-indigo-300"}`}
                    />
                    {cardErrors.expiry && (
                      <p className="mt-1 text-xs text-red-500">
                        <AlertCircle size={11} className="inline mr-1" />
                        {cardErrors.expiry}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">
                      CVV
                    </label>
                    <input
                      value={card.cvv}
                      onChange={(e) =>
                        setCard((p) => ({
                          ...p,
                          cvv: e.target.value.replace(/\D/g, "").slice(0, 4),
                        }))
                      }
                      placeholder="123"
                      className={`w-full border rounded-xl px-4 py-2.5 text-sm placeholder-slate-300 focus:outline-none focus:ring-2 transition ${cardErrors.cvv ? "border-red-300 focus:ring-red-200" : "border-slate-200 focus:ring-indigo-300"}`}
                    />
                    {cardErrors.cvv && (
                      <p className="mt-1 text-xs text-red-500">
                        <AlertCircle size={11} className="inline mr-1" />
                        {cardErrors.cvv}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">
                    Tên trên thẻ
                  </label>
                  <input
                    value={card.name}
                    onChange={(e) =>
                      setCard((p) => ({
                        ...p,
                        name: e.target.value.toUpperCase(),
                      }))
                    }
                    placeholder="NGUYEN VAN A"
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm placeholder-slate-300 focus:outline-none focus:ring-2 transition ${cardErrors.name ? "border-red-300 focus:ring-red-200" : "border-slate-200 focus:ring-indigo-300"}`}
                  />
                  {cardErrors.name && (
                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle size={11} />
                      {cardErrors.name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {selected === "transfer" && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="font-semibold text-slate-700 mb-4">
                Thông tin chuyển khoản
              </h3>
              <div className="bg-slate-50 rounded-xl p-4 space-y-3 border border-slate-200 text-sm">
                {[
                  { label: "Ngân hàng", value: "Vietcombank" },
                  { label: "Số tài khoản", value: "1234567890" },
                  { label: "Chủ tài khoản", value: "TOURVIET JSC" },
                  { label: "Số tiền", value: formatVND(total) },
                  { label: "Nội dung CK", value: tourSlug || "TOURVIET" },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between">
                    <span className="text-slate-400">{row.label}</span>
                    <span className="font-semibold text-slate-700">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-3">
                Sau khi chuyển khoản, vui lòng chụp màn hình xác nhận và liên hệ
                hỗ trợ.
              </p>
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky top-24 space-y-5">
            <h2 className="font-semibold text-slate-700 text-lg">
              Tổng kết đơn hàng
            </h2>

            {/* Tour thumb */}
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

            <div className="border-t border-slate-100 pt-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-700">Tổng cộng</span>
                <span className="text-2xl font-bold text-indigo-600">
                  {formatVND(total)}
                </span>
              </div>
            </div>

            {/* Thông tin liên hệ tóm tắt */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs text-slate-500 space-y-1">
              <p className="font-medium text-slate-600 mb-1">
                Thông tin liên hệ
              </p>
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
