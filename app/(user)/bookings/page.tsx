"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function BookingPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get("/api/bookings/my-bookings", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setBookings(res.data || []);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleCancel = async (id: string) => {
    try {
      const token = localStorage.getItem("token");

      await axios.patch(`/api/bookings/${id}/cancel`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // reload lại list
      setBookings((prev) =>
        prev.map((b) =>
          b._id === id ? { ...b, status: "Đã huỷ" } : b
        )
      );
    } catch (err) {
      alert("Huỷ thất bại!");
    }
  };

  if (loading) {
    return <p className="text-center mt-10">Đang tải...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">

        <h1 className="text-3xl font-bold mb-6">
          Tour đã đặt
        </h1>

        {bookings.length === 0 ? (
          <div className="bg-white p-10 rounded-xl shadow text-center">
            <p className="text-gray-500 mb-4">
              Bạn chưa đặt tour nào.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((item) => (
              <div
                key={item._id}
                className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition flex justify-between items-center"
              >
                {/* Info */}
                <div>
                  <h2 className="text-lg font-semibold">
                    {item.tour?.name || "Tên tour"}
                  </h2>

                  <p className="text-sm text-gray-500">
                    Ngày đi: {item.date || "Chưa có"}
                  </p>

                  <p className="text-blue-500 font-semibold mt-1">
                    {item.totalPrice?.toLocaleString()} đ
                  </p>
                </div>

                {/* Right */}
                <div className="text-right">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      item.status === "confirmed"
                        ? "bg-green-100 text-green-600"
                        : item.status === "cancelled"
                        ? "bg-red-100 text-red-600"
                        : "bg-yellow-100 text-yellow-600"
                    }`}
                  >
                    {item.status}
                  </span>

                  {/* Actions */}
                  <div className="mt-2 space-x-2">
                    {item.status !== "cancelled" && (
                      <button
                        onClick={() => handleCancel(item._id)}
                        className="text-sm text-red-500 hover:underline"
                      >
                        Huỷ tour
                      </button>
                    )}

                    <button className="text-sm text-blue-500 hover:underline">
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}