"use client";

import { useState } from "react";

interface TourImage {
  _id: string;
  tour_id: string;
  image_url: string;
  public_id: string;
}

interface Props {
  slug: string;
  images: TourImage[];
  onRefresh: () => void;
}

const API = "https://db-pickyourway.vercel.app/api";

export default function TourImages({ slug, images, onRefresh }: Props) {
  const [uploading, setUploading] = useState(false);

  // 1. Xử lý Upload ảnh
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    // Không nhất thiết phải append tour_id vào body nếu Backend đã lấy từ URL Params

    for (let i = 0; i < files.length; i++) {
      formData.append("images", files[i]);
    }

    try {
      setUploading(true);

      // SỬA TẠI ĐÂY: Thêm slug vào cuối URL để khớp với Route Backend: /upload/:slug
      const res = await fetch(`${API}/tours/upload-images/${slug}`, {
        method: "POST",
        body: formData, // FormData chứa danh sách file
      });

      if (res.ok) {
        alert("Upload ảnh thành công!");
        onRefresh();
      } else {
        const errorData = await res.json();
        alert(`Lỗi: ${errorData.message || "Không thể upload ảnh"}`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Đã có lỗi xảy ra trong quá trình upload");
    } finally {
      setUploading(false);
      // Reset input file để có thể chọn lại cùng 1 file nếu cần
      e.target.value = "";
    }
  };

  // 2. Xử lý Xóa ảnh
  const handleDelete = async (imageId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa ảnh này?")) return;

    try {
      const res = await fetch(`${API}/tours/image/${imageId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        onRefresh();
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  return (
    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-xl uppercase tracking-tight text-gray-800 font-black">
            Thư viện hình ảnh
          </h2>
          <p className="text-xs text-gray-400">
            Quản lý các hình ảnh hiển thị trong gallery của tour
          </p>
        </div>

        <label
          className={`cursor-pointer px-6 py-3 rounded-2xl text-xs uppercase tracking-widest transition shadow-lg ${
            uploading
              ? "bg-gray-100 text-gray-400"
              : "bg-[#F26F21] text-white hover:opacity-90 shadow-orange-100"
          }`}
        >
          {uploading ? "Đang tải lên..." : "+ Tải ảnh lên"}
          <input
            type="file"
            multiple
            hidden
            accept="image/*"
            disabled={uploading}
            onChange={handleUpload}
          />
        </label>
      </div>

      {/* Danh sách ảnh */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {images.length === 0 && !uploading && (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-gray-50 rounded-3xl">
            <p className="text-gray-400 text-xs uppercase tracking-widest">
              Chưa có hình ảnh nào được tải lên
            </p>
          </div>
        )}

        {images.map((img) => (
          <div
            key={img._id}
            className="group relative aspect-square bg-gray-50 rounded-2xl overflow-hidden transition-all hover:shadow-xl"
          >
            <img
              src={img.image_url}
              alt="Tour gallery"
              className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
            />

            {/* Lớp overlay khi hover */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
              <button
                onClick={() => handleDelete(img._id)}
                className="bg-white hover:bg-red-500 hover:text-white text-red-500 p-3 rounded-2xl transition-all shadow-xl transform translate-y-4 group-hover:translate-y-0"
                title="Xóa ảnh"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </div>
        ))}

        {/* Loading placeholder */}
        {uploading && (
          <div className="aspect-square bg-gray-50 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-[#F26F21]/20 animate-pulse">
            <div className="w-6 h-6 border-2 border-[#F26F21] border-t-transparent rounded-full animate-spin mb-2"></div>
            <span className="text-[10px] text-[#F26F21] uppercase tracking-tighter">
              Đang tải
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
