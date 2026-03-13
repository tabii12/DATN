"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

import {
  User,
  Heart,
  CreditCard,
  LogOut,
  Lock,
  Briefcase,
  ChevronDown
} from "lucide-react";

interface TokenPayload {
  id: string;
  exp: number;
}

interface UserType {
  name: string;
  email: string;
}

export default function UserDropdown() {

  const [open, setOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserType | null>(null);

  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {

    const fetchUser = async () => {

      const storedToken = localStorage.getItem("token");
      if (!storedToken) return;

      try {

        const decoded: TokenPayload = jwtDecode(storedToken);

        const now = Date.now() / 1000;

        // kiểm tra token hết hạn
        if (decoded.exp < now) {
          localStorage.removeItem("token");
          return;
        }

        setToken(storedToken);

        const res = await fetch(
          `https://db-datn-six.vercel.app/api/users/${decoded.id}`
        );

        if (!res.ok) {
          throw new Error("Không lấy được user");
        }

        const data = await res.json();

        console.log("USER DATA:", data);

        // nếu API trả thẳng user
        if (data.name) {
          setUser(data);
        }
        // nếu API trả dạng { data: {...} }
        else if (data.data) {
          setUser(data.data);
        }

      } catch (error) {
        console.error("Lỗi lấy user:", error);
      }

    };

    fetchUser();

  }, []);

  // click ngoài dropdown
  useEffect(() => {

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };

  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    router.push("/auth/login");
  };

  // chưa đăng nhập
  if (!token) {
    return (
      <Link
        href="/auth/login"
        className="flex items-center gap-2 hover:text-blue-500"
      >
        <User size={22}/>
        Đăng nhập
      </Link>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>

      <button
        onClick={() => setOpen(!open)}
        className="text-black flex items-center gap-1 hover:text-orange-500"
      >
        <User size={22}/>
        <ChevronDown size={16}/>
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-64 bg-white shadow-xl rounded-xl border">

          <div className="p-4 border-b">
            <p className="font-semibold">
              {user ? user.name : "Loading..."}
            </p>
            <p className="text-sm text-gray-500">
              {user ? user.email : ""}
            </p>
          </div>

          <div className="py-2">

            <Link
              href="/profile"
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
            >
              <User size={18}/> Thông tin cá nhân
            </Link>

            <Link
              href="/bookings"
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
            >
              <Briefcase size={18}/> Tour đã đặt
            </Link>

            <Link
              href="/favorites"
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
            >
              <Heart size={18}/> Tour yêu thích
            </Link>

            <Link
              href="/payments"
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
            >
              <CreditCard size={18}/> Lịch sử thanh toán
            </Link>

          </div>

          <div className="border-t py-2">

            <Link
              href="/change-password"
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
            >
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