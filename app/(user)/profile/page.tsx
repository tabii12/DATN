"use client";

import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const loadUser = () => {
    const user = localStorage.getItem("user");

    if (user) {
      const parsedUser = JSON.parse(user);
      setName(parsedUser.name || "");
      setEmail(parsedUser.email || "");
    } else {
      setName("");
      setEmail("");
    }
  };

  useEffect(() => {
    // load lần đầu
    loadUser();

    // 🔥 lắng nghe khi login/logout
    const handleChange = () => {
      loadUser();
    };

    window.addEventListener("tokenChanged", handleChange);

    return () => {
      window.removeEventListener("tokenChanged", handleChange);
    };
  }, []);

  const handleUpdate = () => {
    const updatedUser = { name, email };

    localStorage.setItem("user", JSON.stringify(updatedUser));

    // 🔥 cập nhật lại UI
    window.dispatchEvent(new Event("tokenChanged"));

    alert("Cập nhật thành công!");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-8">

        <h1 className="text-2xl font-bold text-center mb-6">
          Thông tin cá nhân
        </h1>

        {/* Avatar */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">
            {name ? name.charAt(0).toUpperCase() : "U"}
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label className="text-sm text-gray-600">Họ tên</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Email</label>
            <input
              value={email}
              disabled
              className="w-full mt-1 p-3 border rounded-lg bg-gray-100"
            />
          </div>

          <button
            onClick={handleUpdate}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold"
          >
            Cập nhật
          </button>
        </div>
      </div>
    </div>
  );
}