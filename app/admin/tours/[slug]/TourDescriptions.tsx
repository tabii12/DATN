"use client";
import { useState } from "react";
import { formatTextLines } from "@/app/lib/textFormatter";

const API = "https://db-pickyourway.vercel.app/api";
type TourDescription = { _id: string; title: string; content: string };

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">{children}</p>;
}

// Component để hiển thị nội dung phân đoạn
function FormattedContent({ content }: { content: string }) {
  const lines = formatTextLines(content);
  return (
    <div className="space-y-2">
      {lines.map((line, i) => (
        <p key={i} className="text-xs text-gray-600 leading-relaxed">
          {line.startsWith("-") ? "• " + line.slice(1).trim() : line}
        </p>
      ))}
    </div>
  );
}

interface Props { tourId: string; descriptions: TourDescription[]; onRefresh: () => void; }

export default function TourDescriptions({ tourId, descriptions, onRefresh }: Props) {
  const [descTitle, setDescTitle]     = useState("");
  const [descContent, setDescContent] = useState("");
  const [editingId, setEditingId]     = useState<string|null>(null);
  const [editTitle, setEditTitle]     = useState("");
  const [editContent, setEditContent] = useState("");
  const [loading, setLoading]         = useState(false);

  const addDescription = async () => {
    if (!descTitle||!descContent) return;
    setLoading(true);
    await fetch(`${API}/descriptions/create`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ title:descTitle, content:descContent, tour_id:tourId }) });
    setDescTitle(""); setDescContent("");
    setLoading(false); onRefresh();
  };

  const updateDescription = async (id: string) => {
    await fetch(`${API}/descriptions/${id}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ title:editTitle, content:editContent }) });
    setEditingId(null); onRefresh();
  };

  const deleteDescription = async (id: string) => {
    if (!confirm("Xoá mô tả này?")) return;
    await fetch(`${API}/descriptions/${id}`, { method:"DELETE" });
    onRefresh();
  };

  return (
    <div className="space-y-4">
      {/* Form thêm mới */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <SectionTitle>Thêm mô tả mới</SectionTitle>
        <div className="space-y-3">
          <input placeholder="Tiêu đề (VD: Giá tour bao gồm)" value={descTitle} onChange={e=>setDescTitle(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-400 transition-all"/>
          <textarea placeholder="Nội dung chi tiết..." value={descContent} onChange={e=>setDescContent(e.target.value)} rows={5}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-400 transition-all resize-none"/>
          <button onClick={addDescription} disabled={loading||!descTitle||!descContent}
            className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold border-none cursor-pointer transition-colors disabled:opacity-60">
            {loading?"Đang thêm...":"+ Thêm mô tả"}
          </button>
        </div>
      </div>

      {/* Danh sách */}
      {descriptions.length===0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 py-12 text-center text-gray-400">
          <p className="text-4xl mb-3">📝</p>
          <p className="font-semibold text-sm">Chưa có mô tả nào</p>
        </div>
      ) : (
        <div className="space-y-3">
          {descriptions.map((d,i)=>(
            <div key={d._id} className="bg-white rounded-2xl border border-gray-100 p-5 group">
              {editingId===d._id ? (
                <div className="space-y-3">
                  <input value={editTitle} onChange={e=>setEditTitle(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400"/>
                  <textarea value={editContent} onChange={e=>setEditContent(e.target.value)} rows={4}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 resize-none"/>
                  <div className="flex gap-2">
                    <button onClick={()=>updateDescription(d._id)} className="bg-orange-500 text-white text-xs font-bold px-4 py-2 rounded-lg border-none cursor-pointer">Lưu</button>
                    <button onClick={()=>setEditingId(null)} className="text-gray-500 text-xs px-4 py-2 rounded-lg border border-gray-200 cursor-pointer bg-white">Huỷ</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-3 flex-1 min-w-0">
                    <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-500 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">{i+1}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-800 mb-1">{d.title}</p>
                      <FormattedContent content={d.content} />
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button onClick={()=>{setEditingId(d._id);setEditTitle(d.title);setEditContent(d.content);}}
                      className="text-xs text-blue-500 hover:bg-blue-50 px-2.5 py-1.5 rounded-lg border-none cursor-pointer bg-transparent font-semibold">Sửa</button>
                    <button onClick={()=>deleteDescription(d._id)}
                      className="text-xs text-red-400 hover:bg-red-50 px-2.5 py-1.5 rounded-lg border-none cursor-pointer bg-transparent font-semibold">Xoá</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}