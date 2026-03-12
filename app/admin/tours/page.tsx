"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API = "https://db-datn-six.vercel.app/api";
const ITEMS_PER_PAGE = 10;

interface Tour {
  _id: string;
  name: string;
  slug: string;
  status: string;
  hotel_id?: { name: string; city: string; rating: number; price_per_night: number };
  category_id?: { name: string } | null;
  images?: { image_url: string }[];
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

export default function AdminTours() {
  const router = useRouter();
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Quick-edit modal
  const [editingTour, setEditingTour] = useState<Tour | null>(null);
  const [editName, setEditName] = useState("");
  const [editStatus, setEditStatus] = useState("active");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`${API}/tours`)
      .then(r => r.json())
      .then(d => setTours(d.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = tours.filter(t => {
    const q = search.toLowerCase();
    const matchSearch = !q || t.name.toLowerCase().includes(q) || t.hotel_id?.city?.toLowerCase().includes(q);
    const matchStatus = filterStatus === "all" || (filterStatus === "active" ? t.status === "active" : t.status !== "active");
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const deleteTour = async (id: string) => {
    if (!confirm("Xoá tour này?")) return;
    const res = await fetch(`${API}/tours/${id}`, { method: "DELETE" });
    if (res.ok) setTours(prev => prev.filter(t => t._id !== id));
    else alert("❌ Không xoá được tour");
  };

  const openEdit = (t: Tour) => {
    setEditingTour(t);
    setEditName(t.name);
    setEditStatus(t.status);
  };

  const saveEdit = async () => {
    if (!editingTour) return;
    setSaving(true);
    try {
      const res = await fetch(`${API}/tours/${editingTour._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, status: editStatus }),
      });
      if (!res.ok) throw new Error();
      setTours(prev => prev.map(t => t._id === editingTour._id ? { ...t, name: editName, status: editStatus } : t));
      setEditingTour(null);
    } catch {
      alert("❌ Cập nhật thất bại");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Page header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black text-gray-900">🧳 Quản lý Tour</h1>
          <p className="text-xs text-gray-400 mt-0.5">{tours.length} tour trong hệ thống</p>
        </div>
        <button
          onClick={() => router.push("/admin/tours/create")}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-4 py-2.5 rounded-xl border-none cursor-pointer transition-colors"
        >
          <span className="text-lg leading-none">+</span> Thêm tour
        </button>
      </div>

      <div className="max-w-full mx-auto px-4 py-6">
        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5 flex-1 min-w-[220px]">
            <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text" value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder="Tìm tên tour, thành phố..."
              className="flex-1 text-sm bg-transparent outline-none text-gray-700 placeholder-gray-400 border-none"
            />
          </div>

          {/* Status filter pills */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
            {([["all", "Tất cả"], ["active", "Hoạt động"], ["inactive", "Tạm ẩn"]] as const).map(([v, l]) => (
              <button key={v} onClick={() => { setFilterStatus(v); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border-none cursor-pointer ${
                  filterStatus === v ? "bg-white shadow text-gray-800" : "text-gray-500 bg-transparent hover:text-gray-700"
                }`}>
                {l}
              </button>
            ))}
          </div>

          <span className="text-xs text-gray-400 ml-auto">{filtered.length} kết quả</span>
        </div>

        {/* Table card */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : paginated.length === 0 ? (
            <div className="py-20 text-center text-gray-400">
              <p className="text-5xl mb-3">🔍</p>
              <p className="font-semibold">Không tìm thấy tour nào</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-5 py-3">Tour</th>
                  <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Khách sạn</th>
                  <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Danh mục</th>
                  <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Thành phố</th>
                  <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-3">Trạng thái</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {paginated.map((t, i) => (
                  <tr key={t._id}
                    className="border-b border-gray-50 hover:bg-orange-50/30 transition-colors group"
                    style={{ animationDelay: i * 30 + "ms" }}>
                    {/* Tour name + thumb */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 bg-orange-50">
                          {t.images?.[0]?.image_url
                            ? <img src={t.images[0].image_url} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-xl">🏖️</div>
                          }
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate max-w-[200px]">{t.name}</p>
                          <p className="text-[11px] text-gray-400 font-mono truncate max-w-[200px]">{t.slug}</p>
                        </div>
                      </div>
                    </td>

                    {/* Hotel */}
                    <td className="px-4 py-3 hidden md:table-cell">
                      {t.hotel_id ? (
                        <div>
                          <p className="text-sm font-medium text-gray-700 truncate max-w-[160px]">{t.hotel_id.name}</p>
                          <p className="text-[11px] text-amber-500">{"⭐".repeat(Math.round(t.hotel_id.rating))}</p>
                        </div>
                      ) : <span className="text-gray-300 text-sm">—</span>}
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {t.category_id?.name
                        ? <span className="text-[11px] bg-orange-50 text-orange-500 font-semibold px-2.5 py-1 rounded-full">{t.category_id.name}</span>
                        : <span className="text-gray-300 text-sm">—</span>
                      }
                    </td>

                    {/* City */}
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-sm text-gray-600">{t.hotel_id?.city || "—"}</span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <StatusBadge status={t.status} />
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => router.push(`/admin/tours/${t.slug}`)}
                          className="text-xs font-semibold text-blue-600 hover:bg-blue-50 px-2.5 py-1.5 rounded-lg border-none cursor-pointer bg-transparent transition-colors"
                        >Sửa chi tiết</button>
                        <button
                          onClick={() => openEdit(t)}
                          className="text-xs font-semibold text-gray-500 hover:bg-gray-100 px-2.5 py-1.5 rounded-lg border-none cursor-pointer bg-transparent transition-colors"
                        >Nhanh</button>
                        <button
                          onClick={() => deleteTour(t._id)}
                          className="text-xs font-semibold text-red-500 hover:bg-red-50 px-2.5 py-1.5 rounded-lg border-none cursor-pointer bg-transparent transition-colors"
                        >Xoá</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-400">
                Trang {currentPage}/{totalPages} · {filtered.length} tour
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-30 bg-white cursor-pointer transition-colors"
                >‹</button>
                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  return (
                    <button key={page} onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-lg text-sm font-semibold border cursor-pointer transition-colors ${
                        currentPage === page
                          ? "bg-orange-500 text-white border-orange-500"
                          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}>
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-30 bg-white cursor-pointer transition-colors"
                >›</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick-edit modal */}
      {editingTour && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-black text-gray-900">✏️ Sửa nhanh</h2>
              <p className="text-xs text-gray-400 truncate mt-0.5">{editingTour.name}</p>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1.5">Tên tour</label>
                <input value={editName} onChange={e => setEditName(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1.5">Trạng thái</label>
                <div className="grid grid-cols-2 gap-2">
                  {[["active", "✅ Hoạt động"], ["inactive", "🚫 Tạm ẩn"]].map(([v, l]) => (
                    <button key={v} onClick={() => setEditStatus(v)}
                      className={`py-2.5 rounded-xl text-sm font-semibold border-2 cursor-pointer transition-all ${
                        editStatus === v
                          ? "border-orange-400 bg-orange-50 text-orange-600"
                          : "border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200"
                      }`}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button onClick={() => setEditingTour(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 font-semibold bg-white cursor-pointer hover:bg-gray-50 transition-colors">
                Huỷ
              </button>
              <button onClick={saveEdit} disabled={saving}
                className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold border-none cursor-pointer transition-colors disabled:opacity-60">
                {saving ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}