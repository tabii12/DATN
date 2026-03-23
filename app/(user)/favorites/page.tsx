"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function FavoritePage() {
  const [tours, setTours] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Bạn chưa đăng nhập!");
        return;
      }

      const res = await axios.get(
        "https://db-datn-six.vercel.app/api/favorites/my-favorites",
        {
          headers: {
            Authorization: `Bearer ${token}`, // 🔥 QUAN TRỌNG
          },
        }
      );

      setTours(res.data.data || []);
    } catch (error: any) {
      console.log(error);
      alert(
        error?.response?.data?.message || "Lỗi tải danh sách yêu thích"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleRemoveFavorite = async (tourId: string) => {
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "https://db-datn-six.vercel.app/api/favorites/toggle",
        { tour_id: tourId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // 🔥 reload lại list
      fetchFavorites();
    } catch (error) {
      alert("Xóa yêu thích thất bại");
    }
  };

  if (loading) {
    return <p className="text-center mt-10">Đang tải...</p>;
  }

  if (tours.length === 0) {
    return <p className="text-center mt-10">Chưa có tour yêu thích</p>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Tour yêu thích</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tours.map((tour) => (
          <div
            key={tour._id}
            className="bg-white shadow rounded-lg overflow-hidden"
          >
            <img
              src={tour.image || "/no-image.jpg"}
              alt={tour.name}
              className="w-full h-48 object-cover"
            />

            <div className="p-4 space-y-2">
              <h2 className="text-lg font-semibold">{tour.name}</h2>

              <p className="text-gray-500 text-sm">
                {tour.category_id?.name}
              </p>

              <p className="text-red-500 font-bold">
                {tour.price?.toLocaleString()} đ
              </p>

              <button
                onClick={() => handleRemoveFavorite(tour._id)}
                className="mt-3 w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
              >
                Bỏ yêu thích
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}