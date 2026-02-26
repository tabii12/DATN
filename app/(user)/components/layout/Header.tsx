import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* LOGO */}
          <Link href="/" className="flex items-center gap-1">
            <span className="text-blue-500 font-bold text-2xl">Pick</span>
            <span className="text-orange-400 font-bold text-2xl">Your</span>
            <span className="text-blue-500 font-bold text-2xl">Way</span>
          </Link>

          {/* MENU */}
          <nav className="hidden md:flex items-center gap-6 text-2xl font-medium text-gray-700">
            <Link href="#" className="hover:text-blue-500">
              Trang Chủ
            </Link>
            <Link href="#" className="hover:text-blue-500">
              Tours
            </Link>
            <Link href="#" className="hover:text-blue-500">
              Blog
            </Link>
            <Link href="#" className="hover:text-blue-500">
              Tin tức
            </Link>
            <Link href="#" className="hover:text-blue-500">
              Vé tàu
            </Link>
          </nav>

          {/* ACCOUNT */}
          <Link
            href="#"
            className="text-2xl font-medium text-gray-700 hover:text-blue-500"
          >
            Tài khoản
          </Link>
        </div>
      </div>
    </header>
  );
}
