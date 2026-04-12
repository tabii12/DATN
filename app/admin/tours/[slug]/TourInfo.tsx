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
  });

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/tours/update/${tour.slug}`, {
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
          <h2 className="text-xl uppercase tracking-tight text-gray-800 font-black">
            Thông tin cơ bản
          </h2>
          <p className="text-xs text-gray-400">
            Quản lý tên, danh mục và trạng thái hiển thị của Tour
          </p>
        </div>
        <div
          className={`px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest ${
            formData.status === "active"
              ? "bg-[#F26F21]/10 text-[#F26F21]"
              : "bg-red-50 text-red-500"
          }`}
        >
          ● {formData.status === "active" ? "Đang bán" : "Tạm ẩn"}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
        {/* Tên Tour */}
        <div className="space-y-2">
          <label className="text-[10px] text-gray-400 uppercase tracking-wider">
            Tên Tour
          </label>
          <input
            className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm text-gray-700 focus:ring-2 focus:ring-[#F26F21] transition"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Nhập tên tour..."
          />
        </div>

        {/* Slug (Chỉ hiển thị) */}
        <div className="space-y-2">
          <label className="text-[10px] text-gray-400 uppercase tracking-wider">
            Slug (Đường dẫn cố định)
          </label>
          <input
            className="w-full px-4 py-3 bg-gray-100 border-none rounded-2xl text-sm text-gray-400 cursor-not-allowed opacity-70"
            value={formData.slug}
            readOnly
          />
        </div>

        {/* Danh mục */}
        <div className="space-y-2">
          <label className="text-[10px] text-gray-400 uppercase tracking-wider">
            Danh mục
          </label>
          <select
            className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm text-gray-700 appearance-none focus:ring-2 focus:ring-[#F26F21]"
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

        {/* Trạng thái hoạt động */}
        <div className="space-y-2">
          <label className="text-[10px] text-gray-400 uppercase tracking-wider">
            Trạng thái Tour
          </label>
          <div className="flex gap-4">
            {/* Nút Đang bán - Cam FPT */}
            <label className="flex-1 cursor-pointer">
              <input
                type="radio"
                name="status"
                className="hidden peer"
                checked={formData.status === "active"}
                onChange={() => setFormData({ ...formData, status: "active" })}
              />
              <div className="py-3 text-center rounded-2xl text-xs uppercase tracking-widest border-2 border-transparent bg-gray-50 text-gray-400 peer-checked:bg-[#F26F21] peer-checked:text-white transition-all">
                Đang bán
              </div>
            </label>

            {/* Nút Tạm ẩn - Đỏ */}
            <label className="flex-1 cursor-pointer">
              <input
                type="radio"
                name="status"
                className="hidden peer"
                checked={formData.status === "hidden"}
                onChange={() => setFormData({ ...formData, status: "hidden" })}
              />
              <div className="py-3 text-center rounded-2xl text-xs uppercase tracking-widest border-2 border-transparent bg-gray-50 text-gray-400 peer-checked:bg-red-500 peer-checked:text-white transition-all">
                Tạm ẩn
              </div>
            </label>
          </div>
        </div>
      </div>

      <div className="mt-10 pt-6 border-t border-gray-50 flex justify-end">
        <button
          onClick={handleUpdate}
          disabled={loading}
          className="bg-[#F26F21] text-white px-10 py-3.5 rounded-2xl text-xs uppercase tracking-widest hover:opacity-90 transition shadow-xl shadow-orange-100 disabled:bg-gray-300"
        >
          {loading ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </div>
    </div>
  );
}
