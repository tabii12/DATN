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

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("vi-VN");
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const saved = localStorage.getItem("tour_booking");
    if (saved) {
      const data = JSON.parse(saved);

      const total =
        Number(data.adults || 1) * Number(data.pricePerAdult || 0) +
        Number(data.children || 0) * Number(data.pricePerChild || 0) +
        500000;

      // tạo dữ liệu thanh toán giả
      setPayments([
        {
          id: "PAY123456",
          tourName: data.tourName,
          amount: total,
          date: new Date().toISOString(),
          status: "success",
        },
      ]);
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

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex gap-6">

      {/* ===== SIDEBAR ===== */}
      <div className="bg-white rounded-2xl shadow-lg p-5 w-64">

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
      <div className="flex-1">

        <div className="bg-white rounded-2xl shadow-lg p-6">

          <h1 className="text-2xl font-bold mb-6">
            Lịch sử thanh toán
          </h1>

          {payments.length === 0 ? (
            <p className="text-gray-500 text-center py-10">
              Chưa có giao dịch nào
            </p>
          ) : (
            <div className="space-y-4">
              {payments.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between border rounded-xl p-4 hover:shadow-md transition"
                >
                  {/* Left */}
                  <div>
                    <p className="font-semibold text-gray-800">
                      {item.tourName}
                    </p>
                    <p className="text-sm text-gray-500">
                      Mã đơn: {item.id}
                    </p>
                    <p className="text-sm text-gray-500">
                      Ngày: {formatDate(item.date)}
                    </p>
                  </div>

                  {/* Right */}
                  <div className="text-right">
                    <p className="text-lg font-bold text-indigo-600">
                      {formatVND(item.amount)}
                    </p>

                    <span
                      className={`text-xs px-3 py-1 rounded-full font-medium
                        ${
                          item.status === "success"
                            ? "bg-green-100 text-green-600"
                            : item.status === "pending"
                            ? "bg-yellow-100 text-yellow-600"
                            : "bg-red-100 text-red-600"
                        }
                      `}
                    >
                      {item.status === "success"
                        ? "Đã thanh toán"
                        : item.status === "pending"
                        ? "Đang xử lý"
                        : "Thất bại"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
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