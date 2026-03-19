"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/";

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateField = (name: string, value: string) => {
    if (!value.trim()) return "Trường này không được để trống";
    if (name === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
      return "Email không đúng định dạng";
    if (name === "password" && value.length < 6)
      return "Mật khẩu phải ít nhất 6 ký tự";
    return "";
  };

  const validateAll = () => {
    const newErrors = {
      email: validateField("email", form.email),
      password: validateField("password", form.password),
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAll()) return;

    try {
      const res = await fetch("https://db-datn-six.vercel.app/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });

      const data = await res.json();
      if (!res.ok) { alert(data.message); return; }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("tokenChanged"));
      router.push(redirectTo);
    } catch {
      alert("Lỗi server");
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
      <h1 className="text-2xl font-semibold text-center text-blue-700 mb-6">
        Đăng nhập
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium text-gray-700">Email</label>
          <input
            type="text" name="email"
            placeholder="email@gmail.com"
            value={form.email} onChange={handleChange}
            onBlur={e => setErrors(prev => ({ ...prev, [e.target.name]: validateField(e.target.name, e.target.value) }))}
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-500"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-700">Mật khẩu</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"} name="password"
              value={form.password} onChange={handleChange}
              onBlur={e => setErrors(prev => ({ ...prev, [e.target.name]: validateField(e.target.name, e.target.value) }))}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-500"
            />
            <button type="button" onClick={() => setShowPassword(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
        </div>

        <button type="submit"
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-md font-semibold transition">
          Đăng nhập
        </button>
      </form>

      <div className="flex items-center my-6">
        <div className="flex-1 border-t" />
        <span className="px-3 text-gray-500 text-sm">Hoặc</span>
        <div className="flex-1 border-t" />
      </div>

      <div className="w-full flex justify-center">
        <GoogleLogin
          onSuccess={async credentialResponse => {
            const res = await axios.post(
              "https://db-datn-six.vercel.app/api/users/google-auth",
              { token: credentialResponse.credential },
            );
            localStorage.setItem("token", res.data.token);
            window.dispatchEvent(new Event("tokenChanged"));
            router.push(redirectTo);
          }}
          onError={() => console.log("Login Failed")}
          useOneTap={false} theme="outline" size="large"
          text="continue_with" shape="rectangular" width="100%"
        />
      </div>

      <p className="text-sm text-center mt-6 text-gray-500">
        Chưa có tài khoản?{" "}
        <Link href="/auth/register" className="text-blue-600 hover:underline">Đăng ký</Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}