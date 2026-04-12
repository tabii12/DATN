"use client";

import { useState } from "react";

interface TourImage {
  _id: string;
  tour_id: string;
  image_url: string;
  public_id: string;
}

interface Props {
  tourId: string;
  images: TourImage[];
  onRefresh: () => void;
}

const API = "https://db-pickyourway.vercel.app/api";

export default function TourImages({ tourId, images, onRefresh }: Props) {
  const [uploading, setUploading] = useState(false);

  // 1. Xử lý Upload ảnh
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    formData.append("tour_id", tourId);
    for (let i = 0; i < files.length; i++) {
      formData.append("images", files[i]);
    }

    try {
      setUploading(true);
      const res = await fetch(`${API}/tour-images/upload`, {
        method: "POST",
        body: formData, // Không để Content-Type khi gửi FormData
      });

      if (res.ok) {
        onRefresh();
      } else {
        alert("Lỗi khi upload ảnh");
      }
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  // 2. Xử lý Xóa ảnh
  const handleDelete = async (imageId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa ảnh này?")) return;

    try {
      const res = await fetch(`${API}/tour-images/delete/${imageId}`, {
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
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Thư viện hình ảnh</h3>
          <p className="text-sm text-gray-500">
            Quản lý các hình ảnh hiển thị trong gallery của tour
          </p>
        </div>

        <label
          className={`cursor-pointer px-4 py-2 rounded-lg text-sm font-bold transition ${
            uploading
              ? "bg-gray-100 text-gray-400"
              : "bg-blue-600 text-white hover:bg-blue-700"
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
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {images.length === 0 && !uploading && (
          <div className="col-span-full py-10 text-center border-2 border-dashed border-gray-100 rounded-xl">
            <p className="text-gray-400 text-sm">
              Tour này chưa có hình ảnh nào
            </p>
          </div>
        )}

        {images.map((img) => (
          <div
            key={img._id}
            className="group relative aspect-square bg-gray-100 rounded-xl overflow-hidden border border-gray-100"
          >
            <img
              src={img.image_url}
              alt="Tour image"
              className="w-full h-full object-cover transition group-hover:scale-110"
            />

            {/* Lớp overlay khi hover */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
              <button
                onClick={() => handleDelete(img._id)}
                className="bg-white/20 hover:bg-red-500 text-white p-2 rounded-full backdrop-blur-md transition"
                title="Xóa ảnh"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
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

        {/* Loading placeholders */}
        {uploading && (
          <div className="aspect-square bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center animate-pulse">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    </div>
  );
}
