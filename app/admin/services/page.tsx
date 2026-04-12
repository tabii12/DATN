"use client";

import { useEffect, useState } from "react";

const API = "https://db-pickyourway.vercel.app/api";
const ITEMS_PER_PAGE = 10;
const FPT_ORANGE = "#F26F21"; // Màu cam FPT

interface Service {
  _id: string;
  serviceName: string;
  type: "hotel" | "transport" | "restaurant" | "ticket" | "guide" | "other";
  basePrice: number;
  unit: "per_person" | "per_room" | "per_meal" | "per_day" | "per_tour";
  description?: string;
  status: "active" | "inactive";
}

const TYPE_LABELS: Record<string, string> = {
  hotel: "🏨 Khách sạn",
  transport: "🚌 Phương tiện",
  restaurant: "🍽️ Nhà hàng",
  ticket: "🎟️ Vé tham quan",
  guide: "🚩 Hướng dẫn viên",
  other: "📦 Khác",
};

const UNIT_LABELS: Record<string, string> = {
  per_person: "Người",
  per_room: "Phòng",
  per_meal: "Bữa ăn",
  per_day: "Ngày",
  per_tour: "Tour",
};

export default function AdminServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    serviceName: "",
    type: "hotel",
    basePrice: 0,
    unit: "per_person",
    description: "",
    status: "active",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/services/all`);
      const d = await res.json();
      setServices(d.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = services.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch = !q || s.serviceName.toLowerCase().includes(q);
    const matchType = filterType === "all" || s.type === filterType;
    return matchSearch && matchType;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const openModal = (s?: Service) => {
    if (s) {
      setEditingId(s._id);
      setFormData({
        serviceName: s.serviceName,
        type: s.type,
        basePrice: s.basePrice,
        unit: s.unit,
        description: s.description || "",
        status: s.status,
      });
    } else {
      setEditingId(null);
      setFormData({
        serviceName: "",
        type: "hotel",
        basePrice: 0,
        unit: "per_person",
        description: "",
        status: "active",
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.serviceName || formData.basePrice < 0)
      return alert("Vui lòng điền đủ thông tin");
    setSaving(true);
    try {
      const url = editingId
        ? `${API}/services/update/${editingId}`
        : `${API}/services/create`;
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchServices();
      } else {
        alert("❌ Thao tác thất bại");
      }
    } catch (err) {
      alert("❌ Lỗi kết nối");
    } finally {
      setSaving(false);
    }
  };

  const deleteService = async (id: string) => {
    if (!confirm("Xóa dịch vụ này khỏi kho?")) return;
    try {
      const res = await fetch(`${API}/services/${id}`, { method: "DELETE" });
      if (res.ok) setServices((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      alert("❌ Không thể xóa");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black text-gray-900">📦 Kho Dịch Vụ</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {services.length} loại dịch vụ sẵn có
          </p>
        </div>
        <button
          onClick={() => openModal()}
          style={{ backgroundColor: FPT_ORANGE }}
          className="flex items-center gap-2 text-white text-sm font-bold px-4 py-2.5 rounded-xl border-none cursor-pointer transition-colors hover:opacity-90 shadow-lg shadow-orange-100"
        >
          <span className="text-lg leading-none">+</span> Thêm dịch vụ
        </button>
      </div>

      <div className="max-w-full mx-auto px-4 py-6">
        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 flex flex-wrap items-center gap-3 shadow-sm">
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5 flex-1 min-w-62.5 border border-gray-100 focus-within:border-orange-300 transition-all">
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm tên dịch vụ..."
              className="flex-1 text-sm bg-transparent outline-none text-gray-700 placeholder-gray-400 border-none"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2.5 bg-gray-50 border-none rounded-xl text-sm font-semibold text-gray-600 outline-none cursor-pointer hover:bg-gray-100"
          >
            <option value="all">Tất cả loại</option>
            {Object.entries(TYPE_LABELS).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>

          <span className="text-xs text-gray-400 ml-auto">
            {filtered.length} kết quả
          </span>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-14 bg-gray-50 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : paginated.length === 0 ? (
            <div className="py-20 text-center text-gray-400">
              <p className="text-5xl mb-3">📦</p>
              <p className="font-semibold">Chưa có dịch vụ nào</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-5 py-4">
                    Tên dịch vụ
                  </th>
                  <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-4">
                    Loại
                  </th>
                  <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-4">
                    Giá gốc
                  </th>
                  <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-4">
                    Đơn vị
                  </th>
                  <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-4">
                    Trạng thái
                  </th>
                  <th className="px-5 py-4" />
                </tr>
              </thead>
              <tbody>
                {paginated.map((s) => (
                  <tr
                    key={s._id}
                    className="border-b border-gray-50 hover:bg-orange-50/30 transition-colors group"
                  >
                    <td className="px-5 py-4">
                      <p className="text-sm font-bold text-gray-800">
                        {s.serviceName}
                      </p>
                      <p className="text-[10px] text-gray-400 line-clamp-1">
                        {s.description || "Không có mô tả"}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {TYPE_LABELS[s.type]}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className="text-sm font-black"
                        style={{ color: FPT_ORANGE }}
                      >
                        {s.basePrice.toLocaleString()}₫
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs font-medium text-gray-500">
                      {UNIT_LABELS[s.unit]}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                          s.status === "active"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        ● {s.status === "active" ? "Hoạt động" : "Tạm dừng"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openModal(s)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg border-none bg-transparent cursor-pointer transition-colors"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                          >
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => deleteService(s._id)}
                          className="p-2 text-red-400 hover:bg-red-50 rounded-lg border-none bg-transparent cursor-pointer transition-colors"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                          >
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100">
            <div className="px-8 py-6 border-b border-gray-50 bg-gray-50/50">
              <h2 className="text-xl font-black text-gray-800">
                {editingId ? "✏️ Sửa dịch vụ" : "✨ Thêm dịch vụ mới"}
              </h2>
              <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mt-1">
                Thông số dịch vụ trong kho
              </p>
            </div>

            <div className="p-8 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Tên dịch vụ
                </label>
                <input
                  value={formData.serviceName}
                  onChange={(e) =>
                    setFormData({ ...formData, serviceName: e.target.value })
                  }
                  className="w-full border-2 border-gray-100 bg-gray-50 rounded-2xl px-4 py-3 text-sm focus:border-orange-200 focus:bg-white outline-none transition-all"
                  placeholder="Ví dụ: Buffet sáng, Xe 16 chỗ..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Loại hình
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value as any })
                    }
                    className="w-full border-2 border-gray-100 bg-gray-50 rounded-2xl px-4 py-3 text-sm outline-none focus:border-orange-200 transition-all cursor-pointer"
                  >
                    {Object.entries(TYPE_LABELS).map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Đơn vị tính
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) =>
                      setFormData({ ...formData, unit: e.target.value as any })
                    }
                    className="w-full border-2 border-gray-100 bg-gray-50 rounded-2xl px-4 py-3 text-sm outline-none focus:border-orange-200 transition-all cursor-pointer"
                  >
                    {Object.entries(UNIT_LABELS).map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Giá gốc (VND)
                </label>
                <input
                  type="number"
                  value={formData.basePrice}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      basePrice: Number(e.target.value),
                    })
                  }
                  style={{ color: FPT_ORANGE }}
                  className="w-full border-2 border-gray-100 bg-gray-50 rounded-2xl px-4 py-3 text-sm font-black focus:border-orange-200 outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Mô tả chi tiết
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full border-2 border-gray-100 bg-gray-50 rounded-2xl px-4 py-3 text-sm focus:border-orange-200 focus:bg-white outline-none transition-all resize-none"
                  placeholder="Nhập mô tả cho dịch vụ này..."
                  rows={3}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Trạng thái
                </label>
                <div className="flex gap-2">
                  {["active", "inactive"].map((s) => (
                    <button
                      key={s}
                      onClick={() =>
                        setFormData({ ...formData, status: s as any })
                      }
                      style={
                        formData.status === s
                          ? { backgroundColor: FPT_ORANGE }
                          : {}
                      }
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
                        formData.status === s
                          ? "text-white shadow-lg shadow-orange-100"
                          : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                      }`}
                    >
                      {s === "active" ? "Hoạt động" : "Tạm ẩn"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-8 py-6 bg-gray-50 flex gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3 text-gray-500 font-bold text-sm bg-transparent border-none cursor-pointer hover:text-gray-700 transition-colors"
              >
                Đóng
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{ backgroundColor: FPT_ORANGE }}
                className="flex-2 py-3 text-white rounded-2xl text-sm font-black uppercase tracking-widest border-none cursor-pointer transition-all shadow-xl shadow-orange-100 disabled:opacity-50"
              >
                {saving
                  ? "Đang lưu..."
                  : editingId
                    ? "Cập nhật"
                    : "Tạo dịch vụ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
