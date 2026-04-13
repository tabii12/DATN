"use client";
import { useState } from "react";

const API = "https://db-pickyourway.vercel.app/api";
type TourImage = { _id: string; tour_id: string; image_url: string; public_id: string };

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">{children}</p>;
}

interface Props { slug: string; images: TourImage[]; onRefresh: () => void; }

export default function TourImages({ slug, images, onRefresh }: Props) {
  const [uploading, setUploading] = useState(false);

  const uploadImage = async (file: File) => {
    setUploading(true);
    const fd = new FormData();
    fd.append("images", file);
    const res = await fetch(`${API}/tours/upload-images/${slug}`, { method:"POST", body:fd });
    if (!res.ok) alert("Upload lỗi 😭");
    else onRefresh();
    setUploading(false);
  };

  const deleteImage = async (imageId: string) => {
    if (!confirm("Xoá ảnh này?")) return;
    await fetch(`${API}/tours/image/${imageId}`, { method:"DELETE" });
    onRefresh();
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <SectionTitle>Hình ảnh tour</SectionTitle>
        <label className={`flex items-center gap-1.5 text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer transition-colors ${uploading?"bg-gray-300":"bg-orange-500 hover:bg-orange-600"}`}>
          {uploading ? "Đang tải..." : "+ Thêm ảnh"}
          <input type="file" accept="image/*" className="hidden" disabled={uploading}
            onChange={e => e.target.files?.[0] && uploadImage(e.target.files[0])}/>
        </label>
      </div>
      {images.length===0 ? (
        <div className="py-16 text-center border-2 border-dashed border-gray-200 rounded-2xl">
          <p className="text-4xl mb-3">🖼️</p>
          <p className="text-sm text-gray-400 font-semibold">Chưa có ảnh nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((img,i)=>(
            <div key={img._id} className="group relative rounded-xl overflow-hidden bg-gray-100 aspect-video">
              <img src={img.image_url} className="w-full h-full object-cover"/>
              {i===0&&<div className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Ảnh bìa</div>}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <button onClick={()=>deleteImage(img._id)} className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg border-none cursor-pointer">Xoá</button>
              </div>
            </div>
          ))}
          {uploading&&(
            <div className="aspect-video bg-gray-50 rounded-xl flex items-center justify-center border-2 border-dashed border-orange-200 animate-pulse">
              <span className="w-5 h-5 border-2 border-orange-300 border-t-orange-500 rounded-full animate-spin"/>
            </div>
          )}
        </div>
      )}
    </div>
  );
}