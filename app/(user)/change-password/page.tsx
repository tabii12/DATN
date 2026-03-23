"use client";

import { useState } from "react";
import axios from "axios";

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    try {
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

      // ✅ SỬA Ở ĐÂY: post -> put
      const res = await axios.put(
        "https://db-datn-six.vercel.app/api/users/change-password",
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

      alert("Đổi mật khẩu thành công!");
      console.log(res.data);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.log(error);
      alert(
        error?.response?.data?.message || "Đổi mật khẩu thất bại!"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Đổi mật khẩu</h1>

      <div className="bg-white shadow rounded-lg p-6 space-y-4">
        <input
          type="password"
          placeholder="Mật khẩu cũ"
          className="w-full border p-2 rounded"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="Mật khẩu mới"
          className="w-full border p-2 rounded"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="Xác nhận mật khẩu"
          className="w-full border p-2 rounded"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button
          onClick={handleChangePassword}
          disabled={loading}
          className="bg-blue-500 text-white px-6 py-2 rounded w-full disabled:opacity-50"
        >
          {loading ? "Đang xử lý..." : "Cập nhật"}
        </button>
      </div>
    </div>
  );
}