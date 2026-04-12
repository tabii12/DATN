"use client";

import { useState } from "react";

interface TourDescription {
  _id: string;
  title: string;
  content: string;
}

interface Props {
  tourId: string;
  descriptions: TourDescription[];
  onRefresh: () => void;
}

const API = "https://db-pickyourway.vercel.app/api";

export default function TourDescriptions({
  tourId,
  descriptions,
  onRefresh,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [newDesc, setNewDesc] = useState({ title: "", content: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: "", content: "" });

  // 1. Thêm mô tả mới
  const handleAddDescription = async () => {
    if (!newDesc.title || !newDesc.content)
      return alert("Vui lòng nhập đủ tiêu đề và nội dung");

    try {
      setLoading(true);
      const res = await fetch(`${API}/tour-descriptions/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tour_id: tourId, ...newDesc }),
      });
      if (res.ok) {
        setNewDesc({ title: "", content: "" });
        onRefresh();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Cập nhật mô tả
  const handleUpdate = async (id: string) => {
    try {
      const res = await fetch(`${API}/tour-descriptions/update/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        setEditingId(null);
        onRefresh();
      }
    } catch (error) {
      console.error(error);
    }
  };

  // 3. Xóa mô tả
  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa mục mô tả này?")) return;
    await fetch(`${API}/tour-descriptions/delete/${id}`, { method: "DELETE" });
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Form thêm mới */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          Thêm mục mô tả mới
        </h3>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Tiêu đề (VD: Lưu ý, Bao gồm, Không bao gồm...)"
            className="w-full p-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 transition"
            value={newDesc.title}
            onChange={(e) => setNewDesc({ ...newDesc, title: e.target.value })}
          />
          <textarea
            placeholder="Nội dung chi tiết..."
            rows={4}
            className="w-full p-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 transition"
            value={newDesc.content}
            onChange={(e) =>
              setNewDesc({ ...newDesc, content: e.target.value })
            }
          />
          <button
            onClick={handleAddDescription}
            disabled={loading}
            className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-black transition disabled:bg-gray-300"
          >
            {loading ? "Đang xử lý..." : "Thêm vào tour"}
          </button>
        </div>
      </div>

      {/* Danh sách các mục đã có */}
      <div className="space-y-4">
        {descriptions.map((item) => (
          <div
            key={item._id}
            className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative group"
          >
            {editingId === item._id ? (
              <div className="space-y-3">
                <input
                  className="w-full p-2 border rounded-lg font-bold"
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm({ ...editForm, title: e.target.value })
                  }
                />
                <textarea
                  className="w-full p-2 border rounded-lg text-sm"
                  rows={5}
                  value={editForm.content}
                  onChange={(e) =>
                    setEditForm({ ...editForm, content: e.target.value })
                  }
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdate(item._id)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold"
                  >
                    Lưu thay đổi
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-xs"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-black text-gray-800 uppercase tracking-tight text-sm">
                    {item.title}
                  </h4>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => {
                        setEditingId(item._id);
                        setEditForm({
                          title: item.title,
                          content: item.content,
                        });
                      }}
                      className="text-blue-500 text-xs font-semibold hover:underline"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="text-red-400 text-xs font-semibold hover:underline"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                  {item.content}
                </p>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
