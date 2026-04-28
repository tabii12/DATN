"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API = "https://db-pickyourway.vercel.app/api";

interface Category { _id: string; name: string }

export default function CreateTourPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "", status: "active", category_id: "", start_location: "", duration: 1, nights: 0,
  });

  useEffect(() => {
    fetch(`${API}/categories`).then(r => r.json()).then(c => setCategories(c.data || []));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/tours/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, nights: form.nights }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result?.message || "Error");
      router.push("/admin/tours");
    } catch (err: any) {
      alert("❌ Thêm tour thất bại: " + err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3 sticky top-0 z-10">
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

          {/* Thông tin cơ bản */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Thông tin cơ bản</p>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                  Tên tour <span className="text-red-400">*</span>
                </label>
                <input name="name" value={form.name} onChange={handleChange} required
                  placeholder="VD: Tour Nha Trang 3N2Đ - Vịnh San Hô - Tháp Bà"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all" />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                  Vị trí khởi hành <span className="text-red-400">*</span>
                </label>
                <input name="start_location" value={form.start_location} onChange={handleChange} required
                  placeholder="VD: TP. Hồ Chí Minh"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all" />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                  Số ngày tour <span className="text-red-400">*</span>
                </label>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 block mb-1.5">Số ngày</label>
                      <input type="number" min={1} max={30} value={form.duration}
                        onChange={e => setForm(f => ({ ...f, duration: Math.max(1, Number(e.target.value)) }))}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all text-center font-bold" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 block mb-1.5">Số đêm</label>
                      <input type="number" min={0} max={30} value={form.nights}
                        onChange={e => setForm(f => ({ ...f, nights: Math.max(0, Number(e.target.value)) }))}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all text-center font-bold" />
                    </div>
                  </div>
                  {form.duration > 0 && (
                    <p className="text-sm text-orange-500 font-semibold">
                      → {form.duration} ngày {form.nights} đêm
                    </p>
                  )}
                  <div className="flex gap-1.5 flex-wrap">
                    {[{ d: 2, n: 1 }, { d: 2, n: 2 }, { d: 3, n: 2 }, { d: 3, n: 3 }, { d: 4, n: 3 }, { d: 5, n: 4 }, { d: 7, n: 6 }].map(({ d, n }) => (
                      <button key={`${d}N${n}`} type="button"
                        onClick={() => setForm(f => ({ ...f, duration: d, nights: n }))}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer transition-colors ${form.duration === d && form.nights === n ? "bg-orange-500 text-white border-orange-500" : "bg-gray-50 text-gray-500 border-gray-200 hover:border-orange-300"}`}>
                        {d}N{n}Đ
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Danh mục */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Danh mục</p>
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">
              Danh mục <span className="text-red-400">*</span>
            </label>
            <select name="category_id" value={form.category_id} onChange={handleChange} required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all bg-white cursor-pointer">
              <option value="">-- Chọn danh mục --</option>
              {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>

          {/* Trạng thái */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Trạng thái đăng</p>
            <div className="grid grid-cols-2 gap-3">
              {([
                ["active", "✅", "Hoạt động", "Tour hiển thị công khai"],
                ["inactive", "🚫", "Tạm ẩn", "Chưa hiển thị với khách"],
              ] as const).map(([v, icon, label, sub]) => (
                <button key={v} type="button" onClick={() => setForm(f => ({ ...f, status: v }))}
                  className={`p-4 rounded-xl border-2 text-left cursor-pointer transition-all ${form.status === v ? "border-orange-400 bg-orange-50" : "border-gray-100 bg-gray-50 hover:border-gray-200"}`}>
                  <div className="text-xl mb-1">{icon}</div>
                  <p className={`text-sm font-bold ${form.status === v ? "text-orange-700" : "text-gray-700"}`}>{label}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pb-8">
            <button type="button" onClick={() => router.back()}
              className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 bg-white hover:bg-gray-50 cursor-pointer transition-colors">
              Huỷ
            </button>
            <button type="submit" disabled={submitting}
              className="flex-[2] py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold border-none cursor-pointer transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {submitting
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Đang tạo...</>
                : "✅ Tạo tour"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}