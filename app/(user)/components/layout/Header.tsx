"use client";

import Link from "next/link";
import { useState } from "react";
import UserDropdown from "../UserDropdown";

const NAV_LINKS = [
  { href: "/", label: "Trang Chủ" },
  { href: "/tours", label: "Tours" },
  { href: "/info", label: "Giới thiệu" },
  { href: "/blogs", label: "Tin tức" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="w-full bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* LOGO */}
          <Link href="/" className="flex items-center gap-0.5 shrink-0">
            <span className="text-blue-500 font-bold text-xl">Pick</span>
            <span className="text-orange-400 font-bold text-xl">Your</span>
            <span className="text-blue-500 font-bold text-xl">Way</span>
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden md:flex items-center gap-5 text-2xl font-medium text-gray-700">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={label}
                href={href}
                className="hover:text-orange-500 transition-colors relative group no-underline"
              >
                {label}
                <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-orange-400 rounded-full group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </nav>

          {/* RIGHT: account + hamburger */}
          <div className="flex items-center gap-3">
            <UserDropdown />

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setOpen((o) => !o)}
              className="md:hidden flex flex-col gap-1.5 p-1.5 rounded-lg hover:bg-gray-100 transition-colors bg-transparent border-none cursor-pointer"
              aria-label="Toggle menu"
            >
              <span
                className={`block h-0.5 w-5 bg-gray-700 rounded transition-all duration-300 origin-center ${open ? "rotate-45 translate-y-2" : ""}`}
              />
              <span
                className={`block h-0.5 w-5 bg-gray-700 rounded transition-all duration-300 ${open ? "opacity-0 scale-x-0" : ""}`}
              />
              <span
                className={`block h-0.5 w-5 bg-gray-700 rounded transition-all duration-300 origin-center ${open ? "-rotate-45 -translate-y-2" : ""}`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${open ? "max-h-80 border-t border-gray-100" : "max-h-0"}`}
      >
        <nav className="flex flex-col px-4 py-3 gap-1 bg-white">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={label}
              href={href}
              onClick={() => setOpen(false)}
              className="text-sm font-medium text-gray-700 hover:text-orange-500 hover:bg-orange-50 px-3 py-2.5 rounded-xl transition-colors no-underline"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
