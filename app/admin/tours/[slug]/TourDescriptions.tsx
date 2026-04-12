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
      const res = await fetch(`${API}/descriptions/create`, {
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
      const res = await fetch(`${API}/descriptions/${id}`, {
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
    await fetch(`${API}/descriptions/${id}`, { method: "DELETE" });
    onRefresh();
  };

  return (
    <div className="space-y-8">
      {/* Form thêm mới */}
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl uppercase tracking-tight text-gray-800 font-black">
            Thêm mục mô tả mới
          </h2>
          <p className="text-xs text-gray-400">
            Tạo các khối nội dung như: Lưu ý, Bao gồm, Lịch trình tóm tắt...
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] text-gray-400 uppercase tracking-wider ml-1">
              Tiêu đề mục
            </label>
            <input
              type="text"
              placeholder="VD: Giá tour bao gồm..."
              className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm text-gray-700 focus:ring-2 focus:ring-[#F26F21] transition"
              value={newDesc.title}
              onChange={(e) =>
                setNewDesc({ ...newDesc, title: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-gray-400 uppercase tracking-wider ml-1">
              Nội dung chi tiết
            </label>
            <textarea
              placeholder="Nhập nội dung hiển thị..."
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm text-gray-700 focus:ring-2 focus:ring-[#F26F21] transition"
              value={newDesc.content}
              onChange={(e) =>
                setNewDesc({ ...newDesc, content: e.target.value })
              }
            />
          </div>

          <button
            onClick={handleAddDescription}
            disabled={loading}
            className="w-full bg-[#F26F21] text-white py-4 rounded-2xl text-xs uppercase tracking-widest hover:opacity-90 transition shadow-lg shadow-orange-100 disabled:bg-gray-300"
          >
            {loading ? "Đang xử lý..." : "Xác nhận thêm mục"}
          </button>
        </div>
      </div>

      {/* Danh sách các mục đã có */}
      <div className="space-y-4">
        <h3 className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold ml-2">
          Danh sách mô tả ({descriptions.length})
        </h3>

        {descriptions.map((item) => (
          <div
            key={item._id}
            className="bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] relative group transition-all hover:shadow-md"
          >
            {editingId === item._id ? (
              <div className="space-y-4">
                <input
                  className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#F26F21]"
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm({ ...editForm, title: e.target.value })
                  }
                />
                <textarea
                  className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#F26F21]"
                  rows={5}
                  value={editForm.content}
                  onChange={(e) =>
                    setEditForm({ ...editForm, content: e.target.value })
                  }
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdate(item._id)}
                    className="bg-[#F26F21] text-white px-6 py-2 rounded-xl text-xs uppercase tracking-widest"
                  >
                    Lưu
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="bg-gray-100 text-gray-500 px-6 py-2 rounded-xl text-xs uppercase tracking-widest"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-sm uppercase tracking-tight text-[#F26F21] bg-orange-50 px-3 py-1 rounded-lg">
                    {item.title}
                  </h4>
                  <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setEditingId(item._id);
                        setEditForm({
                          title: item.title,
                          content: item.content,
                        });
                      }}
                      className="text-gray-400 hover:text-[#F26F21] transition-colors"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
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
