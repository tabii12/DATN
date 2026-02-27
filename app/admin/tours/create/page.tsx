"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateTourPage() {
  const router = useRouter();

  const [hotels, setHotels] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    status: "active",
    hotel_id: "",
    category_id: "",
  });

  /* ---------------- FETCH SELECT DATA ---------------- */
  useEffect(() => {
    Promise.all([
      fetch("https://db-datn-six.vercel.app/api/hotels").then(r => r.json()),
      fetch("https://db-datn-six.vercel.app/api/categories").then(r => r.json()),
    ]).then(([hotelRes, cateRes]) => {
      setHotels(hotelRes.data || []);
      setCategories(cateRes.data || []);
    });
  }, []);

  /* ---------------- HANDLERS ---------------- */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setForm(prev => ({
      ...prev,
      [name]: value,
      ...(name === "name" && {
        slug: value
          .toLowerCase()
          .replace(/đ/g, "d")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""),
      }),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("https://db-datn-six.vercel.app/api/tours", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Authorization: "Bearer TOKEN_ADMIN",
      },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      alert("❌ Thêm tour thất bại");
      return;
    }

    alert("✅ Thêm tour thành công");
    router.push("/admin/tours");
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="max-w-3xl bg-white p-6 rounded shadow text-black">
      <h1 className="text-xl font-bold mb-6">➕ Thêm tour mới</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        {/* NAME */}
        <div className="col-span-2">
          <label className="block mb-1 font-medium">Tên tour</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        {/* SLUG */}
        <div className="col-span-2">
          <label className="block mb-1 font-medium">Slug (tự động)</label>
          <input
            name="slug"
            value={form.slug}
            readOnly
            className="w-full border px-3 py-2 rounded bg-gray-100"
          />
        </div>

        {/* HOTEL */}
        <div>
          <label className="block mb-1 font-medium">Khách sạn</label>
          <select
            name="hotel_id"
            value={form.hotel_id}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">-- Chọn khách sạn --</option>
            {hotels.map(h => (
              <option key={h._id} value={h._id}>
                {h.name} ({h.city})
              </option>
            ))}
          </select>
        </div>

        {/* CATEGORY */}
        <div>
          <label className="block mb-1 font-medium">Danh mục</label>
          <select
            name="category_id"
            value={form.category_id}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">-- Chọn danh mục --</option>
            {categories.map(c => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* STATUS */}
        <div className="col-span-2">
          <label className="block mb-1 font-medium">Trạng thái</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* ACTION */}
        <div className="col-span-2 flex gap-3 pt-4">
          <button className="bg-blue-600 text-white px-6 py-2 rounded">
            Lưu tour
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="border px-6 py-2 rounded"
          >
            Huỷ
          </button>
        </div>
      </form>
    </div>
  );
}