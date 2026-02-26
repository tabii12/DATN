"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateAll()) return;

    try {
      const res = await fetch(
        "https://db-datn.onrender.com/api/users/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            password: form.password,
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        return;
      }

      alert(data.message);
    } catch (error) {
      console.error(error);
      alert("Lỗi server");
    }
  };

  const validateField = (name: string, value: string, currentForm = form) => {
    let error = "";

    if (!value.trim()) {
      error = "Trường này không được để trống";
    } else {
      if (name === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          error = "Email không đúng định dạng";
        }
      }

      if (name === "password") {
        if (value.length < 6) {
          error = "Mật khẩu phải ít nhất 6 ký tự";
        }
      }

      if (name === "confirmPassword") {
        if (value !== currentForm.password) {
          error = "Mật khẩu không khớp";
        }
      }
    }

    return error;
  };

  const validateAll = () => {
    const newErrors = {
      name: validateField("name", form.name),
      email: validateField("email", form.email),
      password: validateField("password", form.password),
      confirmPassword: validateField(
        "confirmPassword",
        form.confirmPassword,
        form,
      ),
    };

    setErrors(newErrors);

    return !Object.values(newErrors).some((err) => err !== "");
  };

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const res = await axios.post(
        "https://db-datn.onrender.com/api/users/google-auth",
        { token: tokenResponse.access_token },
      );

      localStorage.setItem("token", res.data.token);
      window.location.href = "/";
    },
  });

  return (
    <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
      <h1 className="text-2xl font-semibold text-center text-blue-700 mb-6">
        Đăng ký
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium text-gray-700">Họ tên</label>
          <input
            type="text"
            name="name"
            placeholder="Ví dụ: Nguyen Van A"
            value={form.name}
            onChange={handleChange}
            onBlur={(e) => {
              const error = validateField(e.target.name, e.target.value);
              setErrors((prev) => ({ ...prev, [e.target.name]: error }));
            }}
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-500"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-700">Email</label>
          <input
            type="text"
            name="email"
            placeholder="email@gmail.com"
            value={form.email}
            onChange={handleChange}
            onBlur={(e) => {
              const error = validateField(e.target.name, e.target.value);
              setErrors((prev) => ({ ...prev, [e.target.name]: error }));
            }}
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-500"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-700">
            Mật khẩu
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              onBlur={(e) => {
                const error = validateField(e.target.name, e.target.value);
                setErrors((prev) => ({ ...prev, [e.target.name]: error }));
              }}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
          )}
        </div>

        <div className="relative">
          <label className="block mb-1 font-medium text-gray-700">
            Nhập lại mật khẩu
          </label>
          <input
            type={showPassword ? "text" : "password"}
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            onBlur={(e) => {
              const error = validateField(e.target.name, e.target.value);
              setErrors((prev) => ({ ...prev, [e.target.name]: error }));
            }}
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-500"
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-md font-semibold transition"
        >
          Đăng ký
        </button>
      </form>

      <div className="flex items-center my-6">
        <div className="flex-1 border-t"></div>
        <span className="px-3 text-gray-500 text-sm">Hoặc</span>
        <div className="flex-1 border-t"></div>
      </div>

      {/* Google Login */}
      <button
        onClick={() => login()}
        className="w-full border rounded-md py-2 flex items-center justify-center gap-2 hover:bg-gray-50 transition text-gray-700"
      >
        <img
          src="https://www.svgrepo.com/show/475656/google-color.svg"
          alt="Google"
          className="w-5 h-5"
        />
        Đăng nhập bằng Google
      </button>

      <p className="text-sm text-center mt-6 text-gray-500">
        Đã có tài khoản?{" "}
        <Link href="/auth/login" className="text-blue-600 hover:underline">
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}
