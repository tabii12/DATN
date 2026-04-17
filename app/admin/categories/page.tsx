"use client";

import { useEffect, useState } from "react";

const API = "https://db-pickyourway.vercel.app/api";

interface Category {
  _id: string;
  name: string;
  slug: string;
  status: "active" | "inactive";
  image_url?: string;
  createdAt: string;
  updatedAt: string;
}

function StatusBadge({ status }: { status: string }) {
  return status === "active" ? (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
      Hoạt động
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-gray-100 text-gray-400 px-2.5 py-1 rounded-full">
      <span className="w-1.5 h-1.5 rounded-full bg-gray-300 inline-block" />
      Tạm ẩn
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

const CATEGORY_ICONS: Record<string, string> = {
  "tour-nghi-duong": "🌴",
  "tour-bien": "🏖️",
  "tour-am-thuc": "🍜",
  "tour-thien-nhien-and-kham-pha": "🏔️",
  "tour-trai-nghiem-and-giai-tri": "🎡",
  "tour-du-thuyen": "🛥️",
  "tour-gia-dinh": "👨‍👩‍👧",
  "tour-check-in-and-tham-quan": "📸",
};

interface TourInCategory {
  _id: string;
  name: string;
  slug: string;
  status: string;
  images?: { image_url: string }[];
  hotel_id?: { name: string; city: string; price_per_night: number };
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  // Category tours modal
  const [viewingCat, setViewingCat] = useState<Category | null>(null);
  const [catTours, setCatTours] = useState<TourInCategory[]>([]);
  const [catToursLoading, setCatToursLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive"
  >("all");

  // Add modal
  const [showAdd, setShowAdd] = useState(false);
  const [addName, setAddName] = useState("");
  const [addStatus, setAddStatus] = useState<"active" | "inactive">("active");
  const [adding, setAdding] = useState(false);

  // Edit modal
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [editName, setEditName] = useState("");
  const [editStatus, setEditStatus] = useState<"active" | "inactive">("active");
  const [saving, setSaving] = useState(false);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string>("");
  const [addImageFile, setAddImageFile] = useState<File | null>(null);
  const [addImagePreview, setAddImagePreview] = useState<string>("");
  // Delete confirm
  const [deletingCat, setDeletingCat] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Toast
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function openCatTours(cat: Category) {
    setViewingCat(cat);
    setCatTours([]);
    setCatToursLoading(true);
    try {
      const res = await fetch(`${API}/tours`);
      const data = await res.json();
      const tours: TourInCategory[] = (data.data ?? []).filter(
        (t: { category_id?: { slug?: string } | null }) =>
          t.category_id?.slug === cat.slug,
      );
      setCatTours(tours);
    } catch {
      setCatTours([]);
    } finally {
      setCatToursLoading(false);
    }
  }

  useEffect(() => {
    fetch(`${API}/categories`)
      .then((r) => r.json())
      .then((d) => setCategories(d.data || []))
      .catch(() => showToast("Không tải được danh mục", "error"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = categories.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q || c.name.toLowerCase().includes(q) || c.slug.includes(q);
    const matchStatus = filterStatus === "all" || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  function openEdit(cat: Category) {
    setEditingCat(cat);
    setEditName(cat.name);
    setEditStatus(cat.status);
    setEditImageFile(null);
    setEditImagePreview(cat.image_url || "");
  }
  function openAdd() {
    setAddName("");
    setAddStatus("active");
    setAddImageFile(null);
    setAddImagePreview("");
    setShowAdd(true);
  }

  async function handleAdd() {
    if (!addName.trim()) return;
    setAdding(true);
    try {
      const res = await fetch(`${API}/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: addName.trim(), status: addStatus }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      let newCat = data.data;
      // Upload ảnh nếu có
      if (addImageFile && newCat?.slug) {
        const fd = new FormData();
        fd.append("image", addImageFile);
        const upRes = await fetch(`${API}/categories/${newCat.slug}/upload`, { method: "POST", body: fd });
        if (upRes.ok) {
          const upData = await upRes.json();
          newCat = { ...newCat, image_url: upData.data?.image_url || upData.image_url };
        }
      }
      setCategories((prev) => [newCat, ...prev]);
      setShowAdd(false);
      showToast("Thêm danh mục thành công!");
    } catch {
      showToast("Thêm thất bại, thử lại sau", "error");
    } finally {
      setAdding(false);
    }
  }
  async function handleSave() {
    if (!editingCat) return;
    setSaving(true);
    try {
      let image_url = editingCat.image_url;
      // Upload ảnh mới nếu có
      if (editImageFile) {
        const fd = new FormData();
        fd.append("image", editImageFile);
        const upRes = await fetch(`${API}/categories/${editingCat.slug}/upload`, { method: "POST", body: fd });
        if (upRes.ok) {
          const upData = await upRes.json();
          image_url = upData.data?.image_url || upData.image_url || image_url;
        }
      }
      const res = await fetch(`${API}/categories/${editingCat.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, status: editStatus, image_url }),
      });
      if (!res.ok) throw new Error();

      const data = await res.json();

      setCategories((prev) =>
        prev.map((c) => (c._id === data.data._id ? data.data : c)),
      );
      setEditingCat(null);
      showToast("Cập nhật thành công!");
    } catch {
      showToast("Lưu thất bại, thử lại sau", "error");
    } finally {
      setSaving(false);
    }
  }

  // async function handleDelete() {
  //   if (!deletingCat) return;
  //   setDeleting(true);
  //   try {
  //     const res = await fetch(`${API}/categories/${deletingCat._id}`, {
  //       method: "DELETE",
  //     });
  //     if (!res.ok) throw new Error();
  //     setCategories((prev) => prev.filter((c) => c._id !== deletingCat._id));
  //     setDeletingCat(null);
  //     showToast("Đã xóa danh mục!");
  //   } catch {
  //     showToast("Xóa thất bại, thử lại sau", "error");
  //   } finally {
  //     setDeleting(false);
  //   }
  // }

  async function toggleStatus(cat: Category) {
    const newStatus = cat.status === "active" ? "inactive" : "active";
    try {
      const res = await fetch(`${API}/categories/${cat.slug}/toggle`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      setCategories((prev) =>
        prev.map((c) =>
          c.slug === cat.slug ? { ...c, status: newStatus } : c,
        ),
      );
      showToast(newStatus === "active" ? "Đã bật danh mục" : "Đã tắt danh mục");
    } catch {
      showToast("Cập nhật thất bại", "error");
    }
  }

  const totalActive = categories.filter((c) => c.status === "active").length;

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold text-white transition-all ${toast.type === "success" ? "bg-emerald-500" : "bg-red-500"}`}
        >
          {toast.type === "success" ? "✓ " : "✕ "}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý danh mục</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Tổng {categories.length} danh mục
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
        >
          <span className="text-base leading-none">+</span> Thêm danh mục
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {[
          {
            label: "Tổng danh mục",
            value: categories.length,
            icon: "🗂️",
            color: "text-blue-600 bg-blue-50",
          },
          {
            label: "Đang hoạt động",
            value: totalActive,
            icon: "✅",
            color: "text-emerald-600 bg-emerald-50",
          },
          {
            label: "Tạm ẩn",
            value: categories.length - totalActive,
            icon: "🔒",
            color: "text-gray-500 bg-gray-100",
          },
        ].map(({ label, value, icon, color }) => (
          <div
            key={label}
            className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3 shadow-sm"
          >
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl ${color}`}
            >
              {icon}
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900">{value}</p>
              <p className="text-xs text-gray-400">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4 flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Tìm tên danh mục..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2 text-sm w-60 focus:outline-none focus:ring-2 focus:ring-orange-300"
        />
        <select
          value={filterStatus}
          onChange={(e) =>
            setFilterStatus(e.target.value as typeof filterStatus)
          }
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Hoạt động</option>
          <option value="inactive">Tạm ẩn</option>
        </select>
        {(search || filterStatus !== "all") && (
          <button
            onClick={() => {
              setSearch("");
              setFilterStatus("all");
            }}
            className="text-xs text-gray-400 hover:text-gray-600 underline"
          >
            Xóa bộ lọc
          </button>
        )}
        <span className="ml-auto text-xs text-gray-400">
          {filtered.length} kết quả
        </span>
      </div>

      {/* Grid cards */}
      {loading ? (
        <div className="flex items-center justify-center py-24 text-gray-400 gap-3">
          <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            />
          </svg>
          Đang tải...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400 bg-white rounded-2xl border border-gray-100">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-sm">Không tìm thấy danh mục nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((cat) => (
            <div
              key={cat._id}
              className={`bg-white rounded-2xl border shadow-sm p-5 flex flex-col gap-3 transition-all hover:shadow-md ${cat.status === "inactive" ? "opacity-60 border-gray-100" : "border-gray-100"}`}
            >
              {/* Icon + name — click để xem tours */}
              <div className="flex items-start justify-between gap-2 cursor-pointer"
                onClick={() => openCatTours(cat)}>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden">
                    {cat.image_url
                      ? <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
                      : CATEGORY_ICONS[cat.slug] ?? "🏷️"}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm leading-tight hover:text-orange-500 transition-colors">
                      {cat.name}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5 font-mono">
                      {cat.slug}
                    </p>
                  </div>
                </div>
                <span className="text-gray-300 text-sm">›</span>
              </div>

              {/* Status + date */}
              <div className="flex items-center justify-between">
                <StatusBadge status={cat.status} />
                <span className="text-[11px] text-gray-400">
                  {formatDate(cat.createdAt)}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1 border-t border-gray-50">
                {/* Toggle status */}
                <button
                  onClick={() => toggleStatus(cat)}
                  title={
                    cat.status === "active" ? "Tắt danh mục" : "Bật danh mục"
                  }
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${cat.status === "active"
                    ? "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                    }`}
                >
                  {cat.status === "active" ? "Tắt" : "Bật"}
                </button>
                <button
                  onClick={() => openEdit(cat)}
                  className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-500 hover:bg-blue-100 transition-colors"
                >
                  ✏️ Sửa
                </button>
                <button
                  onClick={() => setDeletingCat(cat)}
                  className="py-1.5 px-3 rounded-lg text-xs font-semibold bg-red-50 text-red-400 hover:bg-red-100 transition-colors"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── ADD MODAL ── */}
      {showAdd && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">
                Thêm danh mục mới
              </h2>
              <button
                onClick={() => setShowAdd(false)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                  Tên danh mục <span className="text-red-400">*</span>
                </label>
                <input
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  placeholder="VD: Tour Mạo Hiểm"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                  Trạng thái
                </label>
                <select
                  value={addStatus}
                  onChange={(e) => setAddStatus(e.target.value as "active" | "inactive")}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                >
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Tạm ẩn</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Ảnh danh mục</label>
                <label className="flex items-center gap-3 cursor-pointer border-2 border-dashed border-gray-200 hover:border-orange-400 rounded-xl p-3 transition-colors group">
                  {addImagePreview
                    ? <img src={addImagePreview} className="w-14 h-14 object-cover rounded-lg shrink-0" />
                    : <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center text-2xl shrink-0 group-hover:bg-orange-50">🖼️</div>}
                  <div>
                    <p className="text-sm font-semibold text-gray-600 group-hover:text-orange-500">{addImagePreview ? "Đổi ảnh" : "Chọn ảnh"}</p>
                    <p className="text-xs text-gray-400">JPG, PNG · tối đa 5MB</p>
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={e => {
                    const f = e.target.files?.[0]; if (!f) return;
                    setAddImageFile(f);
                    setAddImagePreview(URL.createObjectURL(f));
                  }} />
                </label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAdd(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleAdd}
                disabled={adding || !addName.trim()}
                className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold disabled:opacity-60 transition-colors"
              >
                {adding ? "Đang thêm..." : "Thêm danh mục"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT MODAL ── */}
      {editingCat && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">
                Chỉnh sửa danh mục
              </h2>
              <button
                onClick={() => setEditingCat(null)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-5">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-xl">
                {CATEGORY_ICONS[editingCat.slug] ?? "🏷️"}
              </div>
              <div>
                <p className="text-xs text-gray-400">Slug (tự động)</p>
                <p className="text-sm font-mono text-gray-600">
                  {editingCat.slug}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                  Tên danh mục
                </label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                  Trạng thái
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as "active" | "inactive")}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                >
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Tạm ẩn</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Ảnh danh mục</label>
                <label className="flex items-center gap-3 cursor-pointer border-2 border-dashed border-gray-200 hover:border-orange-400 rounded-xl p-3 transition-colors group">
                  {editImagePreview
                    ? <img src={editImagePreview} className="w-14 h-14 object-cover rounded-lg shrink-0" />
                    : <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center text-2xl shrink-0 group-hover:bg-orange-50">🖼️</div>}
                  <div>
                    <p className="text-sm font-semibold text-gray-600 group-hover:text-orange-500">{editImagePreview ? "Đổi ảnh" : "Chọn ảnh"}</p>
                    <p className="text-xs text-gray-400">JPG, PNG · tối đa 5MB</p>
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={e => {
                    const f = e.target.files?.[0]; if (!f) return;
                    setEditImageFile(f);
                    setEditImagePreview(URL.createObjectURL(f));
                  }} />
                </label>
                {editImagePreview && (
                  <button onClick={() => { setEditImageFile(null); setEditImagePreview(""); }}
                    className="mt-1.5 text-xs text-red-400 hover:text-red-600 bg-transparent border-none cursor-pointer">
                    ✕ Xoá ảnh
                  </button>
                )}
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingCat(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold disabled:opacity-60 transition-colors"
              >
                {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CAT TOURS MODAL ── */}
      {viewingCat && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-xl">
                  {CATEGORY_ICONS[viewingCat.slug] ?? "🏷️"}
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">
                    {viewingCat.name}
                  </h2>
                  <p className="text-xs text-gray-400">
                    Danh sách tour thuộc danh mục này
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingCat(null)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none bg-transparent border-none cursor-pointer"
              >
                ×
              </button>
            </div>
            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5">
              {catToursLoading ? (
                <div className="flex items-center justify-center py-12 text-gray-400 gap-3">
                  <svg
                    className="animate-spin w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Đang tải...
                </div>
              ) : catTours.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-4xl mb-3">📭</p>
                  <p className="text-sm">Chưa có tour nào trong danh mục này</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <p className="text-xs text-gray-400 mb-1">
                    {catTours.length} tour
                  </p>
                  {catTours.map((tour) => (
                    <div
                      key={tour._id}
                      className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      {/* Thumbnail */}
                      <div className="w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                        {tour.images?.[0]?.image_url ? (
                          <img
                            src={tour.images[0].image_url}
                            alt={tour.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                            No img
                          </div>
                        )}
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {tour.name}
                        </p>
                        <p className="text-[11px] text-gray-400 truncate">
                          {tour.hotel_id?.name} · {tour.hotel_id?.city}
                          {tour.hotel_id?.price_per_night
                            ? ` · ${tour.hotel_id.price_per_night.toLocaleString("vi-VN")}đ`
                            : ""}
                        </p>
                      </div>
                      {/* Status */}
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0 ${tour.status === "active"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-gray-100 text-gray-400"
                          }`}
                      >
                        {tour.status === "active" ? "Hoạt động" : "Tạm ẩn"}
                      </span>
                      {/* Link */}
                      <a
                        href={`/admin/tours/${tour.slug}`}
                        className="text-xs text-blue-500 hover:underline shrink-0 no-underline"
                      >
                        Chi tiết →
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Footer */}
            <div className="p-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setViewingCat(null)}
                className="px-5 py-2 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE MODAL ── */}
      {deletingCat && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="text-5xl mb-3">🗑️</div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              Xóa danh mục?
            </h2>
            <p className="text-sm text-gray-500 mb-1">
              Bạn có chắc muốn xóa danh mục
            </p>
            <p className="font-semibold text-gray-800 mb-2">
              "{deletingCat.name}"?
            </p>
            <p className="text-xs text-red-400 mb-6">
              Các tour thuộc danh mục này có thể bị ảnh hưởng.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingCat(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50"
              >
                Hủy
              </button>
              {/* <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold disabled:opacity-60"
              >
                {deleting ? "Đang xóa..." : "Xóa"}
              </button> */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
