"use client";

import Link from "next/link";
import React, { useEffect } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
//   const router = useRouter();

//   useEffect(() => {
//     const user = localStorage.getItem("user");

//     if (!user) {
//       router.replace("/login");
//       return;
//     }

//     const parsedUser = JSON.parse(user);

//     if (parsedUser.role !== "admin") {
//       router.replace("/");
//     }
//   }, [router]);

//   const handleLogout = () => {
//     localStorage.clear();
//     router.replace("/login");
//   };

  return (
    <html lang="vi">
      <head>
        <Script
          src="https://cdn.tailwindcss.com"
          strategy="beforeInteractive"
        />
      </head>
      <body className="flex h-screen bg-gray-100">
        {/* SIDEBAR ADMIN */}
        <section className="bg-amber-200 w-[250px] flex flex-col text-center">
          <h1 className="text-3xl font-bold text-[#0099FF] py-6">
            <Link href="/category">TechLaptop</Link>
          </h1>

          <nav className="font-medium flex flex-col gap-6 text-xl">
            <Link href="/category">Danh mục</Link>
            <Link href="/product">Sản phẩm</Link>
            <Link href="/order">Đơn hàng</Link>
            <Link href="/user">Người dùng</Link>
          </nav>

          <button
            // onClick={handleLogout}
            className="mt-auto mb-6 px-4 py-2 bg-red-500 text-white rounded"
          >
            Đăng xuất
          </button>
        </section>

        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </body>
    </html>
  );
}
