"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  User,
  Heart,
  CreditCard,
  LogOut,
  Lock,
  Briefcase,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  const router = useRouter();

  // ===== LOAD USER =====
  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));
  }, []);

  // ✅ FIX CHUẨN Ở ĐÂY (CHỈ SỬA DÒNG NÀY)
  const isGoogleUser = user?.isGoogleLogin === true;

  // ===== CHANGE PASSWORD =====
  const handleChangePassword = async () => {
    try {
      // ✅ CHẶN GOOGLE USER
      if (isGoogleUser) {
        alert("Tài khoản Google không thể đổi mật khẩu!");
        return;
      }

      if (!currentPassword || !newPassword || !confirmPassword) {
        alert("Vui lòng nhập đầy đủ thông tin!");
        return;
      }

      if (newPassword.length < 6) {
        alert("Mật khẩu mới phải ít nhất 6 ký tự!");
        return;
      }

      if (newPassword !== confirmPassword) {
        alert("Mật khẩu xác nhận không khớp!");
        return;
      }

      const token = localStorage.getItem("token");

      if (!token) {
        alert("Bạn chưa đăng nhập!");
        return;
      }

      setLoading(true);

      await axios.put(
        "https://db-pickyourway.vercel.app/api/users/change-password",
        {
          currentPassword,
          newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // ✅ LOGOUT SAU KHI ĐỔI MẬT KHẨU
      alert("🎉 Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");

      localStorage.clear();
      window.dispatchEvent(new Event("tokenChanged"));
      router.push("/auth/login");

    } catch (error: any) {
      alert(
        error?.response?.data?.message || "Đổi mật khẩu thất bại!"
      );
    } finally {
      setLoading(false);
    }
  };

  // ===== LOGOUT =====
  const handleLogout = () => {
    localStorage.clear();
    window.dispatchEvent(new Event("tokenChanged"));
    router.push("/auth/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex gap-6">

      {/* ===== SIDEBAR ===== */}
      <div className="w-72 bg-white rounded-2xl shadow-lg p-5">

        {/* Avatar */}
        <div className="flex flex-col items-center border-b pb-5 mb-5">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xl font-bold">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <p className="mt-3 font-semibold">{user?.name || "User"}</p>
          <p className="text-sm text-gray-500">{user?.email}</p>
        </div>

        {/* Menu */}
        <div className="space-y-2 text-gray-700">
          <MenuItem icon={<User size={18} />} label="Thông tin cá nhân" onClick={() => router.push("/profile")} />
          <MenuItem icon={<Briefcase size={18} />} label="Tour đã đặt" onClick={() => router.push("/bookings")} />
          <MenuItem icon={<Heart size={18} />} label="Tour yêu thích" onClick={() => router.push("/favorites")} />

          <div className="border-t my-3"></div>

          <MenuItem icon={<Lock size={18} />} label="Đổi mật khẩu" active />

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-red-500 hover:bg-red-50"
          >
            <LogOut size={18} /> Đăng xuất
          </button>
        </div>
      </div>

      {/* ===== CONTENT ===== */}
      <div className="flex-1 flex justify-center items-start">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-8">

          <h1 className="text-2xl font-bold text-center mb-6">
            🔒 Đổi mật khẩu
          </h1>

          {/* ✅ THÔNG BÁO GOOGLE */}
          {isGoogleUser && (
            <div className="mb-4 p-3 bg-yellow-100 text-yellow-700 rounded-lg text-sm text-center">
              Bạn đang đăng nhập bằng Google nên không thể đổi mật khẩu.
            </div>
          )}

          <div className="space-y-5">

            <div>
              <label className="text-sm text-gray-500">
                Mật khẩu hiện tại
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={isGoogleUser}
                className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="text-sm text-gray-500">
                Mật khẩu mới
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isGoogleUser}
                className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="text-sm text-gray-500">
                Xác nhận mật khẩu
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isGoogleUser}
                className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none disabled:bg-gray-100"
              />
            </div>

            <button
              onClick={handleChangePassword}
              disabled={loading || isGoogleUser}
              className={`w-full py-3 rounded-lg font-semibold transition
                ${
                  isGoogleUser
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
            >
              {isGoogleUser
                ? "Tài khoản Google không đổi được mật khẩu"
                : loading
                ? "Đang xử lý..."
                : "Cập nhật mật khẩu"}
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}

// ===== MENU ITEM =====
function MenuItem({ icon, label, active = false, onClick }: any) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition
      ${
        active
          ? "bg-blue-50 text-blue-600 font-medium"
          : "hover:bg-gray-100"
      }`}
    >
      {icon}
      {label}
    </div>
  );
}