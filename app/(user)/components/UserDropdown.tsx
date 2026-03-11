"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Heart, CreditCard, LogOut, Lock, Briefcase, ChevronDown } from "lucide-react";

export default function UserDropdown() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const user = {
    name: "Nguyễn Văn A",
    email: "user@gmail.com",
  };

  const handleLogout = () => {
    localStorage.removeItem("token"); // xoá token đăng nhập
    router.push("/login"); // quay về trang login
  };

  return (
    <div className="relative">

      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1"
      >
        <User size={22} />
        <ChevronDown size={16} />
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-64 bg-white shadow-lg rounded-lg border">

          <div className="p-4 border-b">
            <p className="font-semibold">{user.name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>

          <div className="py-2">

            <Link href="/profile" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100">
              <User size={18}/> Thông tin cá nhân
            </Link>

            <Link href="/bookings" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100">
              <Briefcase size={18}/> Tour đã đặt
            </Link>

            <Link href="/favorites" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100">
              <Heart size={18}/> Tour yêu thích
            </Link>

            <Link href="/payments" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100">
              <CreditCard size={18}/> Lịch sử thanh toán
            </Link>

          </div>

          <div className="border-t py-2">

            <Link href="/change-password" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100">
              <Lock size={18}/> Đổi mật khẩu
            </Link>

            <button
              onClick={handleLogout}
              className="w-full text-left flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-gray-100"
            >
              <LogOut size={18}/> Đăng xuất
            </button>

          </div>

        </div>
      )}
    </div>
  );
}