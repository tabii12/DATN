"use client";

import { useState } from "react";

interface Category {
  _id: string;
  name: string;
}

interface Tour {
  _id: string;
  name: string;
  slug: string;
  category_id: Category | any;
  status: string;
  price_min?: number;
}

interface Props {
  tour: Tour;
  categories: Category[];
  onRefresh: () => void;
}

const API = "https://db-pickyourway.vercel.app/api";

export default function TourInfo({ tour, categories, onRefresh }: Props) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: tour.name,
    slug: tour.slug,
    category_id:
      typeof tour.category_id === "object"
        ? tour.category_id?._id
        : tour.category_id,
    status: tour.status,
    price_min: tour.price_min || 0,
  });

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/tours/update/${tour._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert("Cập nhật thông tin tour thành công!");
        onRefresh();
      } else {
        const err = await res.json();
        alert(err.message || "Lỗi khi cập nhật");
      }
    } catch (error) {
      console.error(error);
      alert("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">
            Thông tin cơ bản
          </h2>
          <p className="text-xs text-gray-400 font-medium">
            Quản lý tên, danh mục và trạng thái hiển thị của Tour
          </p>
        </div>
        <div
          className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
            formData.status === "active"
              ? "bg-emerald-100 text-emerald-600"
              : "bg-red-100 text-red-600"
          }`}
        >
          ● {formData.status}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
        {/* Tên Tour */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
            Tên Tour
          </label>
          <input
            className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-blue-500 transition"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Nhập tên tour..."
          />
        </div>

        {/* Slug (Đường dẫn) */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
            Slug (URL)
          </label>
          <input
            className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-medium text-blue-600 focus:ring-2 focus:ring-blue-500 transition"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            placeholder="ten-tour-du-lich"
          />
        </div>

        {/* Danh mục & Giá khởi điểm */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
              Danh mục
            </label>
            <select
              className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold text-gray-700 appearance-none"
              value={formData.category_id}
              onChange={(e) =>
                setFormData({ ...formData, category_id: e.target.value })
              }
            >
              <option value="">Chọn danh mục</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
              Giá khởi điểm (₫)
            </label>
            <input
              type="number"
              className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold text-emerald-600"
              value={formData.price_min}
              onChange={(e) =>
                setFormData({ ...formData, price_min: Number(e.target.value) })
              }
            />
          </div>
        </div>

        {/* Trạng thái hoạt động */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
            Trạng thái Tour
          </label>
          <div className="flex gap-4">
            {["active", "hidden"].map((status) => (
              <label key={status} className="flex-1 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  className="hidden peer"
                  checked={formData.status === status}
                  onChange={() => setFormData({ ...formData, status })}
                />
                <div className="py-3 text-center rounded-2xl text-xs font-black uppercase tracking-widest border-2 border-transparent bg-gray-50 text-gray-400 peer-checked:bg-blue-600 peer-checked:text-white transition-all">
                  {status === "active" ? "Đang bán" : "Tạm ẩn"}
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-10 pt-6 border-t border-gray-50 flex justify-end">
        <button
          onClick={handleUpdate}
          disabled={loading}
          className="bg-gray-900 text-white px-10 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition shadow-xl shadow-gray-200 disabled:bg-gray-300"
        >
          {loading ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </div>
    </div>
  );
}
