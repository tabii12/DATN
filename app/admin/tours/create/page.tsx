"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API = "https://db-datn-six.vercel.app/api";

interface Hotel { _id: string; name: string; city: string; rating: number; }
interface Category { _id: string; name: string; }

function slugify(str: string) {
  return str.toLowerCase()
    .replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a")
    .replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e")
    .replace(/ì|í|ị|ỉ|ĩ/g, "i")
    .replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o")
    .replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u")
    .replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function CreateTourPage() {
  const router = useRouter();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", status: "active", hotel_id: "", category_id: "" });

  useEffect(() => {
    Promise.all([
      fetch(`${API}/hotels`).then(r => r.json()),
      fetch(`${API}/categories`).then(r => r.json()),
    ]).then(([h, c]) => { setHotels(h.data || []); setCategories(c.data || []); });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value,
      ...(name === "name" && { slug: slugify(value) }),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/tours`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      router.push("/admin/tours");
    } catch {
      alert("❌ Thêm tour thất bại");
      setSubmitting(false);
    }
  };

  const selectedHotel = hotels.find(h => h._id === form.hotel_id);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3">
        <button onClick={() => router.back()}
          className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 bg-white cursor-pointer transition-colors text-lg">
          ‹
        </button>
        <div>
          <h1 className="text-lg font-black text-gray-900">➕ Tạo tour mới</h1>
          <p className="text-xs text-gray-400">Điền thông tin để thêm tour vào hệ thống</p>
        </div>
      </div>

      <div className="max-w-full mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Name */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-3">Thông tin cơ bản</label>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Tên tour <span className="text-red-400">*</span></label>
                <input
                  name="name" value={form.name} onChange={handleChange} required
                  placeholder="VD: Tour Đà Nẵng 3 Ngày 2 Đêm – Khám Phá Bà Nà Hills"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Slug (tự tạo từ tên)</label>
                <div className="flex items-center border border-gray-100 rounded-xl bg-gray-50 px-4 py-3 gap-2">
                  <span className="text-gray-300 text-sm">/tours/</span>
                  <span className="text-sm text-gray-500 font-mono flex-1 truncate">{form.slug || "ten-tour-cua-ban"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hotel select */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-3">Liên kết</label>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Khách sạn <span className="text-red-400">*</span></label>
                <select name="hotel_id" value={form.hotel_id} onChange={handleChange} required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all bg-white cursor-pointer">
                  <option value="">-- Chọn khách sạn --</option>
                  {hotels.map(h => (
                    <option key={h._id} value={h._id}>{h.name} · {h.city}</option>
                  ))}
                </select>
                {selectedHotel && (
                  <div className="mt-2 flex items-center gap-2 bg-orange-50 rounded-xl px-3 py-2">
                    <span className="text-orange-500 text-sm">🏨</span>
                    <span className="text-xs text-orange-700 font-semibold">{selectedHotel.name}</span>
                    <span className="text-xs text-orange-400">· {selectedHotel.city} · {"⭐".repeat(Math.round(selectedHotel.rating))}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Danh mục <span className="text-red-400">*</span></label>
                <select name="category_id" value={form.category_id} onChange={handleChange} required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all bg-white cursor-pointer">
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-3">Trạng thái đăng</label>
            <div className="grid grid-cols-2 gap-3">
              {([
                ["active", "✅", "Hoạt động", "Tour sẽ hiển thị công khai"],
                ["inactive", "🚫", "Tạm ẩn", "Tour chưa hiển thị với khách"],
              ] as const).map(([v, icon, label, sub]) => (
                <button key={v} type="button" onClick={() => setForm(f => ({ ...f, status: v }))}
                  className={`p-4 rounded-xl border-2 text-left cursor-pointer transition-all ${
                    form.status === v
                      ? "border-orange-400 bg-orange-50"
                      : "border-gray-100 bg-gray-50 hover:border-gray-200"
                  }`}>
                  <div className="text-xl mb-1">{icon}</div>
                  <p className={`text-sm font-bold ${form.status === v ? "text-orange-700" : "text-gray-700"}`}>{label}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button type="button" onClick={() => router.back()}
              className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 bg-white hover:bg-gray-50 cursor-pointer transition-colors">
              Huỷ
            </button>
            <button type="submit" disabled={submitting}
              className="flex-[2] py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold border-none cursor-pointer transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {submitting ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Đang tạo...</>
              ) : "✅ Tạo tour"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}