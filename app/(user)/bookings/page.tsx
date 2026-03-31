"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  User,
  Heart,
  CreditCard,
  LogOut,
  Lock,
  Briefcase,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

function formatVND(n: number) {
  return n.toLocaleString("vi-VN") + "đ";
}

export default function BookingsPage() {
  const [data, setData] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  const router = useRouter();
  const pathname = usePathname();

  // ===== LOAD DATA =====
  useEffect(() => {
    const saved = localStorage.getItem("tour_booking");
    if (saved) {
      setData(JSON.parse(saved));
    }

    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("tokenChanged"));
    router.push("/auth/login");
  };

  if (!data) {
    return (
      <div className="text-center py-20 text-red-500 font-semibold">
        Chưa có thông tin tour!
      </div>
    );
  }

  const total =
    Number(data.adults || 1) * Number(data.pricePerAdult || 0) +
    Number(data.children || 0) * Number(data.pricePerChild || 0) +
    500000;

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex gap-6">

      {/* ===== SIDEBAR ===== */}
      <div className="w-72 bg-white rounded-2xl shadow-lg p-5">

        {/* User */}
        <div className="flex items-center gap-3 pb-5 border-b">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white flex items-center justify-center font-bold">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div>
            <p className="font-semibold">{user?.name || "User"}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>

        {/* Menu */}
        <div className="mt-4 space-y-1">
          <MenuItem icon={<User size={18} />} label="Thông tin cá nhân" href="/profile" active={pathname === "/profile"} />
          <MenuItem icon={<Briefcase size={18} />} label="Tour đã đặt" href="/bookings" active={pathname === "/bookings"} />
          <MenuItem icon={<Heart size={18} />} label="Tour yêu thích" href="/favorites" active={pathname === "/favorites"} />
          <MenuItem icon={<CreditCard size={18} />} label="Lịch sử thanh toán" href="/payments" active={pathname === "/payments"} />

          <div className="border-t my-3"></div>

          <MenuItem icon={<Lock size={18} />} label="Đổi mật khẩu" href="/change-password" active={pathname === "/change-password"} />

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-500 hover:bg-red-50"
          >
            <LogOut size={18} /> Đăng xuất
          </button>
        </div>
      </div>

      {/* ===== CONTENT ===== */}
      <div className="flex-1 space-y-6">

        {/* CARD TOUR */}
        <div className="bg-white rounded-2xl shadow-lg p-6">

          <h1 className="text-2xl font-bold mb-4">
            Tour đã đặt
          </h1>

          <div className="flex gap-5">

            {/* Image */}
            {data.thumbnail && (
              <img
                src={data.thumbnail}
                className="w-56 h-40 object-cover rounded-xl"
              />
            )}

            {/* Info */}
            <div className="flex-1 space-y-2">
              <p className="text-lg font-semibold">{data.tourName}</p>

              <p className="text-gray-500">
                {data.hotelName} - {data.city}
              </p>

              <p>
                👨‍👩‍👧 {data.adults} người lớn - {data.children} trẻ em
              </p>

              <p className="text-xl text-indigo-600 font-bold">
                {formatVND(total)}
              </p>
            </div>
          </div>
        </div>

        {/* CONTACT */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="font-bold text-lg mb-3">
            Thông tin liên hệ
          </h2>

          <div className="grid grid-cols-2 gap-4 text-sm">

            <div>
              <p className="text-gray-500">Khách hàng</p>
              <p className="font-medium">{data.contactName}</p>
            </div>

            <div>
              <p className="text-gray-500">Email</p>
              <p className="font-medium">{data.contactEmail}</p>
            </div>

            <div>
              <p className="text-gray-500">Số điện thoại</p>
              <p className="font-medium">{data.contactPhone}</p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

/* ===== MENU ITEM ===== */
function MenuItem({ icon, label, href, active = false }: any) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all
      
      ${
        active
          ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md"
          : "text-gray-700 hover:bg-gray-100"
      }
      `}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </Link>
  );
}