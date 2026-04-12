"use client";

import Link from "next/link";
import { ReactNode, useState, useEffect } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [adminName, setAdminName] = useState<string | null>("Administrator");

  useEffect(() => {
    const name = localStorage.getItem("user.name");
    if (name) {
      setAdminName(name);
    }
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* SIDEBAR - Màu nền Cam FPT */}
      <aside className="w-64 bg-[#F26F21] text-white shadow-xl">
        <div className="px-6 py-5 text-lg font-black uppercase tracking-widest border-b border-white/10">
          Pick Your Way
        </div>

        <nav className="px-3 py-4 space-y-1 text-sm font-medium">
          {[
            { href: "/admin", icon: "📊", label: "Dashboard" },
            { href: "/admin/tours", icon: "🧳", label: "Tours" },
            { href: "/admin/places", icon: "📍", label: "Địa điểm" },
            { href: "/admin/services", icon: "🛠️", label: "Dịch vụ" },
            { href: "/admin/sale", icon: "🔥", label: "Sale" },
            { href: "/admin/bookings", icon: "📄", label: "Bookings" },
            { href: "/admin/contacts", icon: "📧", label: "Liên hệ" },
            { href: "/admin/blogs", icon: "📝", label: "Tin tức" },
            { href: "/admin/categories", icon: "🛎", label: "Danh Mục" },
            { href: "/admin/users", icon: "👤", label: "Tài khoản" },
            { href: "/admin/comments", icon: "💬", label: "Đánh Giá" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-[#D95F1A] hover:pl-6 group"
            >
              <span className="text-lg">{item.icon}</span>
              <span className="group-hover:font-bold">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b px-8 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 bg-[#F26F21] rounded-full"></div>
            <span className="font-bold text-gray-700 uppercase tracking-wider text-sm">
              Hệ thống quản trị
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs font-bold text-gray-900">
                {adminName || "Administrator"}
              </p>
            </div>
          </div>
        </header>

        <div className="p-8 overflow-y-auto">{children}</div>
      </main>
    </div>
  );
}
