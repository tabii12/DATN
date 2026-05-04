"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";

interface CommentFormProps {
  trip_id: string;
  tour_id?: string;
  onCommentAdded?: () => void;
}

export default function CommentForm({
  trip_id,
  tour_id,
  onCommentAdded,
}: CommentFormProps) {
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [hasBooked, setHasBooked] = useState(false);
  const [checkingBooking, setCheckingBooking] = useState(true);

  useEffect(() => {
    const checkUserBooking = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          `https://db-pickyourway.vercel.app/api/bookings/check-booked/${tourId}`,
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
  }, [trip_id]); // ✅ sửa lại dependency

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!content.trim()) {
      setError("Nội dung bình luận không được để trống");
      return;
    }

    if (content.length < 10) {
      setError("Nội dung phải có ít nhất 10 ký tự");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Bạn cần đăng nhập để bình luận");
        setLoading(false);
        return;
      }

      const response = await fetch(
        "https://db-pickyourway.vercel.app/api/comments/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // ✅ thêm cái này
          },
          body: JSON.stringify({
            tour_id: tour_id,
            content,
            rating,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || "Lỗi khi gửi bình luận");
        return;
      }

      setSuccess(true);
      setContent("");
      setRating(5);

      onCommentAdded?.();

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
          ⚠️ Bạn cần đặt tour trước khi bình luận
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
      <h3 className="text-xl font-bold text-gray-900 mb-4">
        💬 Đánh giá của bạn
      </h3>

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          ✅ Gửi bình luận thành công!
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
          <label className="block text-sm font-semibold mb-2">
            {rating} ⭐
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={
                  star <= rating ? "text-orange-400" : "text-gray-300"
                }
              >
                <Star size={28} fill="currentColor" />
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Chia sẻ trải nghiệm của bạn..."
          rows={4}
          className="w-full p-2 border rounded-lg"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 text-white py-2 rounded-lg"
        >
          {loading ? "Đang gửi..." : "Gửi bình luận"}
        </button>
      </form>
    </div>
  );
}