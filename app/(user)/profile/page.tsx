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

export default function ProfilePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const router = useRouter();
  const pathname = usePathname();

  const loadUser = () => {
    const user = localStorage.getItem("user");

    if (user) {
      const parsedUser = JSON.parse(user);
      setName(parsedUser.name || "");
      setEmail(parsedUser.email || "");
    }
  };

  useEffect(() => {
    loadUser();

    const handleChange = () => loadUser();
    window.addEventListener("tokenChanged", handleChange);

    return () => {
      window.removeEventListener("tokenChanged", handleChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("tokenChanged"));
    router.push("/auth/login");
  };

  const handleUpdate = () => {
    const updatedUser = { name, email };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    window.dispatchEvent(new Event("tokenChanged"));
    alert("Cập nhật thành công!");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex gap-6">

      {/* ===== SIDEBAR ===== */}
      <div className="w-72 bg-white rounded-2xl shadow-lg p-5">

        {/* User */}
        <div className="flex items-center gap-3 pb-5 border-b">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white flex items-center justify-center font-bold">
            {name ? name.charAt(0).toUpperCase() : "U"}
          </div>
          <div>
            <p className="font-semibold">{name || "User"}</p>
            <p className="text-sm text-gray-500">{email}</p>
          </div>
        </div>

        {/* Menu */}
        <div className="mt-4 space-y-1">

          <MenuItem
            icon={<User size={18} />}
            label="Thông tin cá nhân"
            href="/profile"
            active={pathname === "/profile"}
          />

          <MenuItem
            icon={<Briefcase size={18} />}
            label="Tour đã đặt"
            href="/bookings"
            active={pathname === "/bookings"}
          />

          <MenuItem
            icon={<Heart size={18} />}
            label="Tour yêu thích"
            href="/favorites"
            active={pathname === "/favorites"}
          />

          <div className="border-t my-3"></div>

          <MenuItem
            icon={<Lock size={18} />}
            label="Đổi mật khẩu"
            href="/change-password"
            active={pathname === "/change-password"}
          />

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition"
          >
            <LogOut size={18} />
            Đăng xuất
          </button>
        </div>
      </div>

      {/* ===== CONTENT ===== */}
      <div className="flex-1 bg-white rounded-2xl shadow-lg p-8">

        <h1 className="text-2xl font-bold mb-6">Thông tin cá nhân</h1>

        {/* Avatar */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-3xl font-bold text-gray-600 relative">
            {name ? name.charAt(0).toUpperCase() : "U"}
            <div className="absolute bottom-0 right-0 bg-blue-500 w-6 h-6 rounded-full border-2 border-white"></div>
          </div>
        </div>

        {/* Form */}
        <div className="grid grid-cols-2 gap-6">

          <div>
            <label className="text-sm text-gray-500">Họ và tên</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="text-sm text-gray-500">Email</label>
            <input
              value={email}
              disabled
              className="w-full mt-1 p-3 border rounded-lg bg-gray-100"
            />
          </div>

        </div>

        <button
          onClick={handleUpdate}
          className="mt-6 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg"
        >
          Lưu thay đổi
        </button>
      </div>
    </div>
  );
}

/* ===== MENU ITEM ===== */
function MenuItem({ icon, label, href, active = false }: any) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
      
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