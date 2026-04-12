"use client";

import { useEffect, useState } from "react";

const API = "https://db-pickyourway.vercel.app/api";
const ITEMS_PER_PAGE = 8;
const FPT_ORANGE = "#F26F21";

interface PlaceImage {
  _id: string;
  image_url: string;
  public_id: string;
}

interface Place {
  _id: string;
  title: string;
  content: string;
  images: PlaceImage[];
  createdAt: string;
}

export default function AdminPlaces() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<PlaceImage[]>([]);
  const [deleteImageIds, setDeleteImageIds] = useState<string[]>([]);

  useEffect(() => {
    fetchPlaces();
  }, []);

  const fetchPlaces = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/places`);
      const d = await res.json();
      setPlaces(d.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (p?: Place) => {
    if (p) {
      setEditingId(p._id);
      setTitle(p.title);
      setContent(p.content);
      setExistingImages(p.images || []);
    } else {
      setEditingId(null);
      setTitle("");
      setContent("");
      setExistingImages([]);
    }
    setDeleteImageIds([]);
    setSelectedFiles([]);
    setPreviewUrls([]);
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...files]);
      const urls = files.map((file) => URL.createObjectURL(file));
      setPreviewUrls((prev) => [...prev, ...urls]);
    }
  };

  const removeNewFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!title) return alert("Vui lòng nhập tên địa điểm");
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);

      selectedFiles.forEach((file) => {
        formData.append("images", file);
      });

      if (editingId && deleteImageIds.length > 0) {
        formData.append("delete_image_ids", JSON.stringify(deleteImageIds));
      }

      const url = editingId ? `${API}/places/${editingId}` : `${API}/places`;
      const method = editingId ? "PATCH" : "POST";

      const token = localStorage.getItem("token");

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchPlaces();
      } else if (res.status === 401) {
        alert("❌ Phiên đăng nhập hết hạn hoặc bạn không có quyền");
      } else {
        alert("❌ Lưu thất bại");
      }
    } catch (err) {
      alert("❌ Lỗi kết nối");
    } finally {
      setSaving(false);
    }
  };

  const deletePlace = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa địa điểm này không?")) return;
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/places/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) setPlaces((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      alert("❌ Không thể xóa");
    }
  };

  const filtered = places.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()),
  );

  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black text-gray-900 uppercase">
            📍 Quản lý địa điểm
          </h1>
          <p className="text-xs text-gray-400">
            Hệ thống lưu trữ các danh lam thắng cảnh
          </p>
        </div>
        <button
          onClick={() => openModal()}
          style={{ backgroundColor: FPT_ORANGE }}
          className="text-white text-sm font-bold px-5 py-2.5 rounded-xl border-none cursor-pointer hover:opacity-90 shadow-lg shadow-orange-100"
        >
          + Thêm địa điểm
        </button>
      </div>

      <div className="p-6">
        {/* Search */}
        <div className="mb-6 max-w-md">
          <input
            type="text"
            placeholder="Tìm kiếm địa điểm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-orange-400 outline-none text-sm transition-all shadow-sm"
          />
        </div>

        {/* Grid List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-64 bg-white rounded-3xl animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {paginated.map((p) => (
              <div
                key={p._id}
                className="bg-white rounded-4xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all group"
              >
                <div className="h-44 bg-gray-200 relative">
                  {p.images && p.images.length > 0 ? (
                    <img
                      src={p.images[0].image_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button
                      onClick={() => openModal(p)}
                      className="p-2 bg-white/90 rounded-lg text-blue-600 hover:bg-white transition-colors"
                    >
                      <svg
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        viewBox="0 0 24 24"
                      >
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => deletePlace(p._id)}
                      className="p-2 bg-white/90 rounded-lg text-red-600 hover:bg-white transition-colors"
                    >
                      <svg
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        viewBox="0 0 24 24"
                      >
                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-gray-800 line-clamp-1 mb-1">
                    {p.title}
                  </h3>
                  <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                    {p.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {filtered.length > ITEMS_PER_PAGE && (
        <div className="mt-10 flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 w-10 h-10 rounded-xl border border-gray-200 bg-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            <svg
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          {[...Array(Math.ceil(filtered.length / ITEMS_PER_PAGE))].map(
            (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                style={{
                  backgroundColor:
                    currentPage === i + 1 ? FPT_ORANGE : "transparent",
                  color: currentPage === i + 1 ? "white" : "#4B5563",
                  borderColor: currentPage === i + 1 ? FPT_ORANGE : "#E5E7EB",
                }}
                className="w-10 h-10 rounded-xl border font-bold text-sm transition-all"
              >
                {i + 1}
              </button>
            ),
          )}

          <button
            onClick={() =>
              setCurrentPage((prev) =>
                Math.min(prev + 1, Math.ceil(filtered.length / ITEMS_PER_PAGE)),
              )
            }
            disabled={
              currentPage === Math.ceil(filtered.length / ITEMS_PER_PAGE)
            }
            className="p-2 w-10 h-10 rounded-xl border border-gray-200 bg-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            <svg
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <h2 className="text-2xl font-black text-gray-900 mb-6">
                {editingId ? "✏️ Chỉnh sửa địa điểm" : "✨ Thêm địa điểm mới"}
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Tên địa điểm
                  </label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full mt-1 px-5 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-orange-300 transition-all text-sm font-bold"
                    placeholder="Ví dụ: Vịnh Hạ Long"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Mô tả giới thiệu
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={4}
                    className="w-full mt-1 px-5 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-orange-300 transition-all text-sm"
                    placeholder="Nội dung chi tiết về địa danh này..."
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">
                    Hình ảnh (Đã có & Mới)
                  </label>
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                    {/* Ảnh hiện tại trong DB */}
                    {existingImages.map((img) => (
                      <div
                        key={img._id}
                        className={`relative aspect-square rounded-2xl overflow-hidden border-2 ${deleteImageIds.includes(img._id) ? "opacity-30 border-red-500" : "border-gray-100"}`}
                      >
                        <img
                          src={img.image_url}
                          className="w-full h-full object-cover"
                          alt=""
                        />
                        <button
                          onClick={() =>
                            setDeleteImageIds((prev) =>
                              prev.includes(img._id)
                                ? prev.filter((id) => id !== img._id)
                                : [...prev, img._id],
                            )
                          }
                          className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-md"
                        >
                          {deleteImageIds.includes(img._id) ? "Undo" : "X"}
                        </button>
                      </div>
                    ))}

                    {/* Xem trước ảnh mới chọn */}
                    {previewUrls.map((url, i) => (
                      <div
                        key={i}
                        className="relative aspect-square rounded-2xl overflow-hidden border-2 border-orange-200"
                      >
                        <img
                          src={url}
                          className="w-full h-full object-cover"
                          alt=""
                        />
                        <button
                          onClick={() => removeNewFile(i)}
                          className="absolute top-1 right-1 bg-orange-500 text-white p-1 rounded-md text-[8px]"
                        >
                          X
                        </button>
                      </div>
                    ))}

                    <label className="aspect-square border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                      <span className="text-2xl text-gray-300">+</span>
                      <span className="text-[9px] font-bold text-gray-400 uppercase">
                        Tải ảnh
                      </span>
                      <input
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-10">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 text-gray-400 font-bold text-sm bg-transparent border-none cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{ backgroundColor: FPT_ORANGE }}
                  className="flex-2 py-4 text-white rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-xl shadow-orange-100 disabled:opacity-50"
                >
                  {saving
                    ? "Đang xử lý..."
                    : editingId
                      ? "Cập nhật địa điểm"
                      : "Tạo địa điểm"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
