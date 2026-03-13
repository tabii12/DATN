import { FaFacebookF, FaInstagram, FaYoutube } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-[#1a1f2b] text-gray-300 pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">

        {/* COLUMN 1 - BRAND — full width on mobile */}
        <div className="col-span-2 md:col-span-3 lg:col-span-1">
          <h2 className="text-xl font-bold text-white mb-3">
            <span className="text-blue-400">Pick</span>
            <span className="text-orange-400">Your</span>
            <span className="text-blue-400">Way</span>
          </h2>
          <p className="text-sm leading-6 text-gray-400 max-w-xs">
            PickYourWay là nền tảng đặt tour & khách sạn hàng đầu Việt Nam.
            Cam kết giá tốt – thanh toán an toàn – hỗ trợ 24/7.
          </p>
        </div>

        {/* COLUMN 2 - VỀ CHÚNG TÔI */}
        <div>
          <h3 className="text-white font-semibold mb-4 text-sm">Về chúng tôi</h3>
          <ul className="space-y-3 text-sm">
            {["Giới thiệu", "Liên hệ", "Tuyển dụng", "Blog du lịch"].map(l => (
              <li key={l}><a href="#" className="hover:text-white transition-colors">{l}</a></li>
            ))}
          </ul>
        </div>

        {/* COLUMN 3 - ĐIỀU KHOẢN */}
        <div>
          <h3 className="text-white font-semibold mb-4 text-sm">Điều khoản</h3>
          <ul className="space-y-3 text-sm">
            {["Điều khoản sử dụng", "Chính sách bảo mật", "Chính sách hoàn hủy", "Quy chế hoạt động"].map(l => (
              <li key={l}><a href="#" className="hover:text-white transition-colors">{l}</a></li>
            ))}
          </ul>
        </div>

        {/* COLUMN 4 - HỖ TRỢ */}
        <div>
          <h3 className="text-white font-semibold mb-4 text-sm">Hỗ trợ khách hàng</h3>
          <ul className="space-y-3 text-sm">
            {["Trung tâm trợ giúp", "Hướng dẫn đặt tour", "Hướng dẫn thanh toán", "Câu hỏi thường gặp"].map(l => (
              <li key={l}><a href="#" className="hover:text-white transition-colors">{l}</a></li>
            ))}
          </ul>
        </div>

        {/* COLUMN 5 - CONTACT */}
        <div className="col-span-2 md:col-span-1">
          <h3 className="text-white font-semibold mb-4 text-sm">Liên hệ</h3>
          <ul className="space-y-3 text-sm text-gray-400">
            <li>Hotline: <span className="text-white font-medium">1900 1234</span></li>
            <li>support@PickYourWay.vn</li>
            <li>TP. Hồ Chí Minh, Việt Nam</li>
          </ul>

          <div className="flex gap-3 mt-5">
            <a href="#" className="bg-blue-700 hover:bg-white hover:text-black transition-colors w-9 h-9 flex items-center justify-center rounded-full">
              <FaFacebookF size={14} />
            </a>
            <a href="#" className="bg-gradient-to-tr from-pink-600 to-purple-600 hover:bg-white hover:text-black transition-colors w-9 h-9 flex items-center justify-center rounded-full">
              <FaInstagram size={16} />
            </a>
            <a href="#" className="bg-red-600 hover:bg-white hover:text-black transition-colors w-9 h-9 flex items-center justify-center rounded-full">
              <FaYoutube size={16} />
            </a>
          </div>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="border-t border-gray-700 mt-10 pt-6 text-center text-xs text-gray-500">
        © 2026 PickYourWay. All rights reserved.
      </div>
    </footer>
  );
}