"use client";

import Link from "next/link";
import { ReactNode } from "react";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* SIDEBAR */}
      <aside className="w-64 bg-orange-800 text-white">
        <div className="px-6 py-4 text-lg font-bold border-b border-orange-800">
          Booking Tour Admin
        </div>

        <nav className="px-4 py-4 space-y-1 text-sm">
          <Link
            href="/admin"
            className="block px-3 py-2 rounded hover:bg-blue-700"
          >
            📊 Dashboard
          </Link>
          <Link
            href="/admin/tours"
            className="block px-3 py-2 rounded hover:bg-blue-700"
          >
            🧳 Tours
          </Link>
          <Link
            href="/admin/sale"
            className="block px-3 py-2 rounded hover:bg-blue-700"
          >
            🧳 Sale
          </Link>
          <Link
            href="/admin/bookings"
            className="block px-3 py-2 rounded hover:bg-blue-700"
          >
            📄 Bookings
          </Link>
          <Link
            href="/admin/contacts"
            className="block px-3 py-2 rounded hover:bg-blue-700"
          >
            📧 Liên hệ
          </Link>
          <Link
            href="/admin/blogs"
            className="block px-3 py-2 rounded hover:bg-blue-700"
          >
            📝 Tin tức
          </Link>
          <Link
            href="/admin/categories"
            className="block px-3 py-2 rounded hover:bg-blue-700"
          >
            🛎 Danh Mục
          </Link>
          <Link
            href="/admin/users"
            className="block px-3 py-2 rounded hover:bg-blue-700"
          >
            � Tài khoản
          </Link>
          <Link
            href="/admin/comments"
            className="block px-3 py-2 rounded hover:bg-blue-700"
          >
            💬 Đánh Giá
          </Link>
        </nav>
      </aside>

      {/* MAIN */}
      <main className="flex-1">
        <header className="h-14 bg-white border-b px-6 flex items-center justify-between">
          <span className="font-semibold text-gray-800">Quản Lý Tour Du Lịch</span>
          <span className="text-sm text-gray-500">Admin</span>
        </header>

        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
