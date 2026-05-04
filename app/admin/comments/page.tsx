"use client";

import { useState, useEffect } from "react";
import { 
  Trash2, CheckCircle, XCircle, Eye, Star
} from "lucide-react";

// --- Interfaces ---
interface Comment {
  _id: string;
  tour_id: string;
  user_name: string;
  user_email: string;
  rating: number;
  title: string;
  content: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

// --- Helper Components ---
function StarRating({ count }: { count: number }) {
  return (
    <span className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star 
          key={i} 
          size={14} 
          className={i < count ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} 
        />
      ))}
    </span>
  );
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className={`${color} text-white rounded-lg p-4 shadow-sm`}>
      <p className="text-xs font-semibold opacity-80 uppercase">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}

export default function AdminComments() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [tours, setTours] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token || ""}` };

      // 1. Fetch Comments
      const res = await fetch(`https://db-pickyourway.vercel.app/api/comments`, { headers });
      const data = await res.json();
      const commentList = data.data || [];
      setComments(commentList);

      // 2. Fetch Tour Names (Unique IDs)
      const uniqueTourIds = Array.from(new Set(commentList.map((c: any) => c.tour_id))) as string[];
      const tourMap = new Map<string, string>();

      await Promise.all(
        uniqueTourIds.map(async (id) => {
          try {
            const tRes = await fetch(`https://db-pickyourway.vercel.app/api/tours/detailid/${id}`, { headers });
            const tData = await tRes.json();
            tourMap.set(id, tData.data?.name || tData.data?.title || "Tour không tên");
          } catch {
            tourMap.set(id, "Lỗi tải tên tour");
          }
        })
      );
      setTours(tourMap);
    } catch (err) {
      setError("Không thể kết nối đến máy chủ");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa đánh giá này?")) return;
    setProcessingId(id);
    try {
      const res = await fetch(`https://db-pickyourway.vercel.app/api/comments/admin/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.ok) {
        setComments(comments.filter(c => c._id !== id));
        alert("Đã xóa thành công");
      }
    } catch (err) {
      alert("Lỗi khi xóa");
    } finally {
      setProcessingId(null);
    }
  };

  // --- Logic Lọc ---
  const filteredComments = comments.filter((c) => {
    const matchesRating = filterRating ? c.rating === filterRating : true;
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === "" || 
      c.user_name?.toLowerCase().includes(searchLower) || 
      c.content?.toLowerCase().includes(searchLower);
    
    return matchesRating && matchesSearch;
  });

  const avgRating = comments.length > 0 
    ? (comments.reduce((sum, c) => sum + c.rating, 0) / comments.length).toFixed(1) 
    : 0;

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-orange-500"></div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Quản lý Đánh giá</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Tổng đánh giá" value={comments.length} color="bg-blue-600" />
        <StatCard label="Điểm trung bình" value={`${avgRating} / 5`} color="bg-orange-500" />
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex flex-col md:flex-row gap-4">
        <input 
          className="flex-1 border p-2 rounded-lg"
          placeholder="Tìm theo tên khách hoặc nội dung..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select 
          className="border p-2 rounded-lg"
          onChange={(e) => setFilterRating(e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">Tất cả số sao</option>
          {[5, 4, 3, 2, 1].map(s => <option key={s} value={s}>{s} sao</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-semibold text-sm">Khách hàng</th>
              <th className="p-4 font-semibold text-sm">Tour</th>
              <th className="p-4 font-semibold text-sm">Đánh giá</th>
              <th className="p-4 font-semibold text-sm">Nội dung</th>
              <th className="p-4 font-semibold text-sm text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredComments.map((c) => (
              <tr key={c._id} className="border-b hover:bg-gray-50 transition-colors">
                <td className="p-4 text-sm">
                  <p className="font-bold">{c.user_name}</p>
                  <p className="text-gray-500 text-xs">{c.user_email}</p>
                </td>
                <td className="p-4 text-sm font-medium text-blue-600">
                  {tours.get(c.tour_id) || "N/A"}
                </td>
                <td className="p-4"><StarRating count={c.rating} /></td>
                <td className="p-4 text-sm text-gray-600 italic">
                  "{c.content.substring(0, 50)}{c.content.length > 50 ? "..." : ""}"
                </td>
                <td className="p-4 text-right flex justify-end gap-2">
                  <button 
                    onClick={() => { setSelectedComment(c); setShowModal(true); }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Eye size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(c._id)}
                    disabled={processingId === c._id}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal chi tiết */}
      {showModal && selectedComment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Chi tiết đánh giá</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Tour</p>
                <p className="font-medium text-blue-700">{tours.get(selectedComment.tour_id)}</p>
              </div>
              <div className="flex justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold">Người đăng</p>
                  <p className="font-medium">{selectedComment.user_name}</p>
                </div>
                <StarRating count={selectedComment.rating} />
              </div>
              <div className="bg-gray-50 p-4 rounded-lg italic text-gray-700">
                "{selectedComment.content}"
              </div>
              <p className="text-xs text-gray-400">Ngày đăng: {new Date(selectedComment.createdAt).toLocaleString('vi-VN')}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}