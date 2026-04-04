"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";

interface CommentFormProps {
  tourId: string;
  tourName: string;
  onCommentAdded?: () => void;
}

export default function CommentForm({
  tourId,
  tourName,
  onCommentAdded,
}: CommentFormProps) {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [hasBooked, setHasBooked] = useState(false);
  const [checkingBooking, setCheckingBooking] = useState(true);

  useEffect(() => {
    // Kiểm tra xem user đã book tour này chưa
    const checkUserBooking = async () => {
      try {
        const token = localStorage.getItem("token");
        const user = localStorage.getItem("user");

        if (!token || !user) {
          setHasBooked(false);
          setCheckingBooking(false);
          return;
        }

        const userObj = JSON.parse(user);

        // Gọi API để kiểm tra booking
        const response = await fetch(
          `https://db-datn-six.vercel.app/api/bookings/user/check?tour_id=${tourId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setHasBooked(data.hasBooked || false);
        }
      } catch (err) {
        console.error("Lỗi kiểm tra booking:", err);
        setHasBooked(false);
      } finally {
        setCheckingBooking(false);
      }
    };

    checkUserBooking();
  }, [tourId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!title.trim()) {
      setError("Tiêu đề không được để trống");
      return;
    }

    if (!content.trim()) {
      setError("Nội dung bình luận không được để trống");
      return;
    }

    if (title.length < 5) {
      setError("Tiêu đề phải có ít nhất 5 ký tự");
      return;
    }

    if (content.length < 10) {
      setError("Nội dung phải có ít nhất 10 ký tự");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");

      if (!token || !user) {
        setError("Bạn cần đăng nhập để bình luận");
        setLoading(false);
        return;
      }

      const userObj = JSON.parse(user);

      const response = await fetch(
        "https://db-datn-six.vercel.app/api/comments",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            tour_id: tourId,
            rating,
            title,
            content,
            user_id: userObj._id,
            user_name: userObj.name,
            user_email: userObj.email,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || "Lỗi khi gửi bình luận");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTitle("");
      setContent("");
      setRating(5);

      // Gửi signal để refresh comments
      onCommentAdded?.();

      // Ẩn success message sau 3 giây
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Lỗi:", err);
      setError("Lỗi server, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  if (checkingBooking) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500 text-center">Đang kiểm tra...</p>
      </div>
    );
  }

  if (!hasBooked) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <p className="text-blue-900 font-semibold">
          ⚠️ Bạn cần phải đặt tour này trước khi có thể bình luận
        </p>
        <p className="text-blue-700 text-sm mt-2">
          Chỉ những khách hàng đã hoàn thành chuyến đi mới có thể chia sẻ đánh giá
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
      <h3 className="text-xl font-bold text-gray-900 mb-4">
        💬 Chia sẻ trải nghiệm của bạn
      </h3>

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          ✅ Bình luận đã được gửi thành công! Cảm ơn bạn đã chia sẻ.
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          ❌ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Đánh giá: <span className="text-orange-500">{rating} ⭐</span>
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`transition-all ${
                  star <= rating
                    ? "text-orange-400 scale-110"
                    : "text-gray-300 scale-100"
                }`}
              >
                <Star size={32} fill="currentColor" />
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Tiêu đề <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ví dụ: Tour tuyệt vời, hướng dẫn viên rất thân thiện"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            maxLength={100}
          />
          <p className="text-xs text-gray-400 mt-1">
            {title.length}/100 ký tự
          </p>
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Nội dung bình luận <span className="text-red-500">*</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Hãy chia sẻ chi tiết về trải nghiệm của bạn (điểm tốt, điểm cần cải thiện, khuyến nghị)..."
            rows={5}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            maxLength={1000}
          />
          <p className="text-xs text-gray-400 mt-1">
            {content.length}/1000 ký tự
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-all"
        >
          {loading ? "⏳ Đang gửi..." : "📤 Gửi bình luận"}
        </button>
      </form>
    </div>
  );
}
