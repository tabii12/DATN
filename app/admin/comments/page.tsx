"use client";

import { useState, useEffect } from "react";
import { 
  Trash2, CheckCircle, XCircle, Eye, Download, Edit2, MessageSquare,
  TrendingUp, RefreshCw, Filter, X
} from "lucide-react";

interface Comment {
  _id: string;
  tour_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  rating: number;
  title: string;
  content: string;
  likes: number;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
}

interface Tour {
  _id: string;
  name: string;
}

const testComments: Comment[] = [
  {
    _id: "test-comment-1",
    tour_id: "tour-demo",
    user_id: "user-test-1",
    user_name: "Nguyễn Văn A",
    user_email: "nguyenvana@example.com",
    rating: 4,
    title: "Tour rất thú vị",
    content: "Tôi rất hài lòng với dịch vụ và hướng dẫn viên nhiệt tình. Khung cảnh đẹp và lịch trình phù hợp.",
    likes: 12,
    status: "pending",
    createdAt: "2026-04-04T10:30:00.000Z",
    updatedAt: "2026-04-04T10:30:00.000Z",
  },
];

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className="text-yellow-400">★</span>
      ))}
      {Array.from({ length: 5 - count }).map((_, i) => (
        <span key={i} className="text-gray-300">★</span>
      ))}
    </div>
  );
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatCard({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: string | number;
  color: string;
  icon?: string;
}) {
  return (
    <div className={`${color} text-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold opacity-90">{label}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
        {icon && <span className="text-4xl opacity-20">{icon}</span>}
      </div>
    </div>
  );
}

export default function AdminComments() {
  const [comments, setComments] = useState<Comment[]>(testComments);
  const [tours, setTours] = useState<Map<string, string>>(new Map([[
    "tour-demo",
    "Tour thử nghiệm",
  ]]));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchComments();
  }, [filterStatus]);

  const fetchComments = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      // Lấy tất cả comments
      const response = await fetch(
        `https://db-pickyourway.vercel.app/api/comments/admin/all?status=${filterStatus === "all" ? "" : filterStatus}`,
        {
          headers: {
            Authorization: `Bearer ${token || "TOKEN_ADMIN"}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Lỗi khi tải đánh giá");
      }

      const data = await response.json();
      setComments(data.data && data.data.length > 0 ? data.data : testComments);

      // Tải thông tin tour
      const tourMap = new Map<string, string>([["tour-demo", "Tour thử nghiệm"]]);
      for (const comment of data.data || []) {
        if (!tourMap.has(comment.tour_id)) {
          try {
            const tourRes = await fetch(
              `https://db-pickyourway.vercel.app/api/tours/${comment.tour_id}`,
              {
                headers: {
                  Authorization: `Bearer ${token || "TOKEN_ADMIN"}`,
                },
              }
            );
            if (tourRes.ok) {
              const tourData = await tourRes.json();
              tourMap.set(comment.tour_id, tourData.data?.name || "N/A");
            }
          } catch (e) {
            console.error("Lỗi khi tải tour:", e);
            tourMap.set(comment.tour_id, "N/A");
          }
        }
      }
      setTours(tourMap);
    } catch (err) {
      console.error("Lỗi:", err);
      setError("Không thể tải đánh giá");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `https://db-pickyourway.vercel.app/api/comments/admin/${id}/approve`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token || "TOKEN_ADMIN"}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Lỗi khi phê duyệt");
      }

      // Cập nhật UI
      setComments(
        comments.map((c) =>
          c._id === id ? { ...c, status: "approved" } : c
        )
      );

      alert("✅ đánh giá đã được phê duyệt");
    } catch (err) {
      console.error("Lỗi:", err);
      alert("❌ Lỗi khi phê duyệt đánh giá");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setProcessingId(id);
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `https://db-pickyourway.vercel.app/api/comments/admin/${id}/reject`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token || "TOKEN_ADMIN"}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Lỗi khi từ chối");
      }

      setComments(
        comments.map((c) =>
          c._id === id ? { ...c, status: "rejected" } : c
        )
      );

      alert("✅ đánh giá đã bị từ chối");
    } catch (err) {
      console.error("Lỗi:", err);
      alert("❌ Lỗi khi từ chối đánh giá");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa đánh giá này?")) return;

    setProcessingId(id);
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `https://db-pickyourway.vercel.app/api/comments/admin/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token || "TOKEN_ADMIN"}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Lỗi khi xóa");
      }

      setComments(comments.filter((c) => c._id !== id));
      alert("✅ đánh giá đã bị xóa");
    } catch (err) {
      console.error("Lỗi:", err);
      alert("❌ Lỗi khi xóa đánh giá");
    } finally {
      setProcessingId(null);
    }
  };

  // Lọc và tìm kiếm
  let filteredComments = comments.filter((c) => {
    if (filterRating && c.rating !== filterRating) return false;
    if (
      searchTerm &&
      !c.user_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !c.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !c.content.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const stats = {
    total: comments.length,
    pending: comments.filter((c) => c.status === "pending").length,
    approved: comments.filter((c) => c.status === "approved").length,
    rejected: comments.filter((c) => c.status === "rejected").length,
    avgRating:
      comments.length > 0
        ? (comments.reduce((sum, c) => sum + c.rating, 0) / comments.length).toFixed(1)
        : 0,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
          <p className="text-gray-600 mt-2">Đang tải đánh giá...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            💬 Quản lý đánh giá tour
          </h1>
          <p className="text-gray-600">
            Duyệt, phê duyệt và quản lý tất cả đánh giá từ khách hàng
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <StatCard label="Tổng cộng" value={stats.total} color="bg-blue-500" />
          <StatCard label="Chờ duyệt" value={stats.pending} color="bg-yellow-500" />
          <StatCard label="Đã duyệt" value={stats.approved} color="bg-green-500" />
          <StatCard label="Từ chối" value={stats.rejected} color="bg-red-500" />
          <StatCard label="Đánh giá TB" value={stats.avgRating} color="bg-orange-500" />
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            ❌ {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Trạng thái
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">Tất cả</option>
                <option value="pending">Chờ duyệt</option>
                <option value="approved">Đã duyệt</option>
                <option value="rejected">Từ chối</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Đánh giá
              </label>
              <select
                value={filterRating || ""}
                onChange={(e) =>
                  setFilterRating(e.target.value ? parseInt(e.target.value) : null)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Tất cả sao</option>
                <option value="5">⭐⭐⭐⭐⭐ 5 sao</option>
                <option value="4">⭐⭐⭐⭐ 4 sao</option>
                <option value="3">⭐⭐⭐ 3 sao</option>
                <option value="2">⭐⭐ 2 sao</option>
                <option value="1">⭐ 1 sao</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tìm kiếm
              </label>
              <input
                type="text"
                placeholder="Tìm theo tên, tiêu đề hoặc nội dung..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Comments Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredComments.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>Không tìm thấy đánh giá nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Khách
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Tour
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Tiêu đề
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Đánh giá
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Trạng thái
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Ngày
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredComments.map((comment) => (
                    <tr key={comment._id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">
                        <div>
                          <p className="font-medium text-gray-900">
                            {comment.user_name}
                          </p>
                          <p className="text-gray-500 text-xs">
                            {comment.user_email}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {tours.get(comment.tour_id) || "Đang tải..."}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <p className="font-medium truncate max-w-xs">
                          {comment.title}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <StarRating count={comment.rating} />
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            comment.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : comment.status === "approved"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {comment.status === "pending"
                            ? "⏳ Chờ duyệt"
                            : comment.status === "approved"
                            ? "✅ Đã duyệt"
                            : "❌ Từ chối"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {formatDate(comment.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedComment(comment);
                              setShowModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-800"
                            disabled={processingId === comment._id}
                            title="Xem chi tiết"
                          >
                            <Eye size={16} />
                          </button>

                          {comment.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleApprove(comment._id)}
                                className="text-green-600 hover:text-green-800"
                                disabled={processingId === comment._id}
                                title="Phê duyệt"
                              >
                                <CheckCircle size={16} />
                              </button>
                              <button
                                onClick={() => handleReject(comment._id)}
                                className="text-red-600 hover:text-red-800"
                                disabled={processingId === comment._id}
                                title="Từ chối"
                              >
                                <XCircle size={16} />
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => handleDelete(comment._id)}
                            className="text-red-600 hover:text-red-800"
                            disabled={processingId === comment._id}
                            title="Xóa"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Chi tiết */}
      {showModal && selectedComment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedComment.title}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 mb-4 text-sm text-gray-600">
                <p>
                  <span className="font-semibold">Khách:</span>{" "}
                  {selectedComment.user_name}{" "}
                  <span className="text-gray-400">({selectedComment.user_email})</span>
                </p>
                <p>
                  <span className="font-semibold">Tour:</span>{" "}
                  {tours.get(selectedComment.tour_id) || "N/A"}
                </p>
                <p>
                  <span className="font-semibold">Đánh giá:</span>
                  <span className="ml-2">
                    <StarRating count={selectedComment.rating} />
                  </span>
                </p>
                <p>
                  <span className="font-semibold">Ngày dánh giá:</span>{" "}
                  {formatDate(selectedComment.createdAt)}
                </p>
                <p>
                  <span className="font-semibold">Trạng thái:</span>
                  <span
                    className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${
                      selectedComment.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : selectedComment.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {selectedComment.status === "pending"
                      ? "⏳ Chờ duyệt"
                      : selectedComment.status === "approved"
                      ? "✅ Đã duyệt"
                      : "❌ Từ chối"}
                  </span>
                </p>
              </div>

              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {selectedComment.content}
                </p>
              </div>

              <div className="flex gap-2">
                {selectedComment.status === "pending" && (
                  <>
                    <button
                      onClick={() => {
                        handleApprove(selectedComment._id);
                        setShowModal(false);
                      }}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg"
                    >
                      ✅ Phê duyệt
                    </button>
                    <button
                      onClick={() => {
                        handleReject(selectedComment._id);
                        setShowModal(false);
                      }}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg"
                    >
                      ❌ Từ chối
                    </button>
                  </>
                )}
                <button
                  onClick={() => {
                    handleDelete(selectedComment._id);
                    setShowModal(false);
                  }}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg"
                >
                  🗑️ Xóa
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}