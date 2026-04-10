"use client";

import { useState, useEffect } from "react";
import { Heart, MessageCircle } from "lucide-react";

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

interface CommentsDisplayProps {
  tourId: string;
  tourName?: string;
  refreshTrigger?: number;
}

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
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "vừa đây";
  if (minutes < 60) return `${minutes} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  if (days < 7) return `${days} ngày trước`;

  return date.toLocaleDateString("vi-VN");
}

export default function CommentsDisplay({
  tourId,
  tourName,
  refreshTrigger,
}: CommentsDisplayProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "highest" | "lowest">("newest");
  const [filterRating, setFilterRating] = useState<number | null>(null);

  useEffect(() => {
    fetchComments();
  }, [tourId, refreshTrigger]);

  const fetchComments = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `https://db-pickyourway.vercel.app/api/comments?tour_id=${tourId}&status=approved`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Lỗi khi tải bình luận");
      }

      const data = await response.json();
      setComments(data.data || []);
    } catch (err) {
      console.error("Lỗi:", err);
      setError("Không thể tải bình luận");
    } finally {
      setLoading(false);
    }
  };

  // Lọc và sắp xếp
  let filteredComments = [...comments];

  if (filterRating) {
    filteredComments = filteredComments.filter(
      (c) => c.rating === filterRating
    );
  }

  switch (sortBy) {
    case "newest":
      filteredComments.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      break;
    case "oldest":
      filteredComments.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      break;
    case "highest":
      filteredComments.sort((a, b) => b.rating - a.rating);
      break;
    case "lowest":
      filteredComments.sort((a, b) => a.rating - b.rating);
      break;
  }

  const avgRating =
    comments.length > 0
      ? (comments.reduce((sum, c) => sum + c.rating, 0) / comments.length).toFixed(1)
      : 0;

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <div className="inline-block w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
        <p className="text-gray-600 mt-2">Đang tải bình luận...</p>
      </div>
    );
  }

  return (
    <div className="max-w-300 mx-auto bg-white rounded-lg shadow p-6 border border-gray-100">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          ⭐ Đánh giá từ khách hàng ({comments.length})
        </h3>

        {comments.length > 0 && (
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-orange-500">
                {avgRating}
              </span>
              <div>
                <StarRating count={Math.round(parseFloat(avgRating as string))} />
                <p className="text-xs text-gray-500">
                  Dựa trên {comments.length} đánh giá
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          ❌ {error}
        </div>
      )}

      {comments.length === 0 ? (
        <div className="text-center py-8">
          <MessageCircle size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">
            Chưa có bình luận nào. Hãy trở thành người đầu tiên chia sẻ!
          </p>
        </div>
      ) : (
        <>
          {/* Filters & Sort */}
          <div className="mb-6 flex gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold text-gray-700">
                Sắp xếp:
              </label>
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as "newest" | "oldest" | "highest" | "lowest")
                }
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="highest">Đánh giá cao</option>
                <option value="lowest">Đánh giá thấp</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold text-gray-700">
                Lọc:
              </label>
              <select
                value={filterRating || ""}
                onChange={(e) =>
                  setFilterRating(e.target.value ? parseInt(e.target.value) : null)
                }
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Tất cả sao</option>
                <option value="5">⭐⭐⭐⭐⭐ 5 sao</option>
                <option value="4">⭐⭐⭐⭐ 4 sao</option>
                <option value="3">⭐⭐⭐ 3 sao</option>
                <option value="2">⭐⭐ 2 sao</option>
                <option value="1">⭐ 1 sao</option>
              </select>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-4">
            {filteredComments.map((comment) => (
              <div
                key={comment._id}
                className="border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                {/* User Info */}
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {comment.user_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(comment.createdAt)}
                    </p>
                  </div>
                  <StarRating count={comment.rating} />
                </div>

                {/* Comment Title */}
                <h4 className="font-semibold text-gray-800 mb-2">
                  {comment.title}
                </h4>

                {/* Comment Content */}
                <p className="text-gray-700 text-sm leading-relaxed mb-3 whitespace-pre-wrap">
                  {comment.content}
                </p>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <button className="flex items-center gap-1 hover:text-red-500 transition-colors">
                    <Heart size={16} />
                    <span>Hữu ích ({comment.likes})</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredComments.length === 0 && (
            <div className="text-center py-6 text-gray-500">
              Không tìm thấy bình luận phù hợp với bộ lọc
            </div>
          )}
        </>
      )}
    </div>
  );
}
