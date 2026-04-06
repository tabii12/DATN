"use client";
import { useState } from "react";

interface Booking {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  tourName: string;
  departureDate: string;
  adults: number; // người lớn
  children: number; // trẻ em
  price: number; // giá mỗi người lớn
  childPrice: number; // giá trẻ em
  paymentStatus: "paid" | "deposit";
}

const mockData: Booking[] = [
  {
    id: "1",
    customerName: "Phạm Trung Dương",
    email: "duong@gmail.com",
    phone: "0901234567",
    tourName: "Tour Đà Nẵng 3N2Đ",
    departureDate: "2026-05-10",
    adults: 2,
    children: 1,
    price: 3500000,
    childPrice: 2000000,
    paymentStatus: "paid",
  },
  {
    id: "2",
    customerName: "Nguyễn Thị Phương Thảo",
    email: "thithao@gmail.com",
    phone: "0912345678",
    tourName: "Tour Phú Quốc 4N3Đ",
    departureDate: "2026-06-15",
    adults: 3,
    children: 1,
    price: 5200000,
    childPrice: 3000000,
    paymentStatus: "deposit",
  },
];

const formatCurrency = (value: number) =>
  value.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });

export default function BookingPage() {
  const [bookings] = useState<Booking[]>(mockData);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">📄 Danh sách Booking Tour</h1>

      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded-2xl shadow">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Khách hàng</th>
              <th>Email</th>
              <th>SĐT</th>
              <th>Tour</th>
              <th>Ngày đi</th>
              <th>Số người</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
            </tr>
          </thead>

          <tbody>
            {bookings.map((b) => {
              const total = b.adults * b.price + b.children * b.childPrice;
              return (
                <tr key={b.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">{b.customerName}</td>
                  <td>{b.email}</td>
                  <td>{b.phone}</td>
                  <td>{b.tourName}</td>
                  <td>{b.departureDate}</td>

                  {/* số người chi tiết */}
                  <td>
                    <div className="text-sm">
                      <div>👨‍🦰 Người lớn: {b.adults}</div>
                      <div>🧒 Trẻ em: {b.children}</div>
                    </div>
                  </td>

                  <td className="font-semibold">{formatCurrency(total)}</td>

                  <td>
                    {b.paymentStatus === "paid" ? (
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                        Đã thanh toán 100%
                      </span>
                    ) : (
                      <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm">
                        Đã cọc 50%
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}