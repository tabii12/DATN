"use client";
import { useEffect, useState } from "react";
interface Booking {
  _id: string;
  payment_status: string;
  user?: {
    name: string;
  };
  tour?: {
    name: string;
  };
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    fetch("https://db-datn.onrender.com/api/bookings/admin/all", {
      headers: {
        Authorization: "Bearer TOKEN_ADMIN",
      },
    })
      .then(res => res.json())
      .then(data => setBookings(data.data || []));
  }, []);

  const confirmPayment = async (id: string) => {
    await fetch(
      `https://db-datn.onrender.com/api/bookings/admin/${id}/confirm-payment`,
      {
        method: "PATCH",
        headers: {
          Authorization: "Bearer TOKEN_ADMIN",
          "Content-Type": "application/json",
        },
      }
    );
    alert("Đã xác nhận thanh toán");
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">📄 Quản lý Booking</h1>

      <table className="w-full bg-white rounded shadow">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="p-3">Khách</th>
            <th>Tour</th>
            <th>Trạng thái</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b._id} className="border-t">
              <td className="p-3">{b.user?.name}</td>
              <td>{b.tour?.name}</td>
              <td>{b.payment_status}</td>
              <td>
                {b.payment_status !== "paid" && (
                  <button
                    onClick={() => confirmPayment(b._id)}
                    className="bg-green-600 text-white px-3 py-1 rounded"
                  >
                    Xác nhận
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}