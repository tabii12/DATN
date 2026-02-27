import { FaFacebookF, FaInstagram, FaYoutube } from "react-icons/fa"
const page = () => {
    return <footer className="bg-[#1a1f2b] text-gray-300 pt-12 pb-6">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">

            {/* COLUMN 1 - BRAND */}
            <div>
                <h2 className="text-2xl font-bold text-white mb-4">PickYourWay</h2>
                <p className="text-sm leading-6 text-gray-400">
                    PickYourWay là nền tảng đặt tour & khách sạn hàng đầu Việt Nam.
                    Cam kết giá tốt – thanh toán an toàn – hỗ trợ 24/7.
                </p>
            </div>

            {/* COLUMN 2 - VỀ CHÚNG TÔI */}
            <div>
                <h3 className="text-white font-semibold mb-4">Về chúng tôi</h3>
                <ul className="space-y-3 text-sm">
                    <li><a href="#" className="hover:text-white transition">Giới thiệu</a></li>
                    <li><a href="#" className="hover:text-white transition">Liên hệ</a></li>
                    <li><a href="#" className="hover:text-white transition">Tuyển dụng</a></li>
                    <li><a href="#" className="hover:text-white transition">Blog du lịch</a></li>
                </ul>
            </div>

            {/* COLUMN 3 - ĐIỀU KHOẢN */}
            <div>
                <h3 className="text-white font-semibold mb-4">Điều khoản</h3>
                <ul className="space-y-3 text-sm">
                    <li><a href="#" className="hover:text-white transition">Điều khoản sử dụng</a></li>
                    <li><a href="#" className="hover:text-white transition">Chính sách bảo mật</a></li>
                    <li><a href="#" className="hover:text-white transition">Chính sách hoàn hủy</a></li>
                    <li><a href="#" className="hover:text-white transition">Quy chế hoạt động</a></li>
                </ul>
            </div>

            {/* COLUMN 4 - HỖ TRỢ */}
            <div>
                <h3 className="text-white font-semibold mb-4">Hỗ trợ khách hàng</h3>
                <ul className="space-y-3 text-sm">
                    <li><a href="#" className="hover:text-white transition">Trung tâm trợ giúp</a></li>
                    <li><a href="#" className="hover:text-white transition">Hướng dẫn đặt tour</a></li>
                    <li><a href="#" className="hover:text-white transition">Hướng dẫn thanh toán</a></li>
                    <li><a href="#" className="hover:text-white transition">Câu hỏi thường gặp</a></li>
                </ul>
            </div>

            {/* COLUMN 5 - CONTACT */}
            <div>
                <h3 className="text-white font-semibold mb-4">Liên hệ</h3>
                <ul className="space-y-3 text-sm text-gray-400">
                    <li>Hotline: <span className="text-white font-medium">1900 1234</span></li>
                    <li>Email: support@PickYourWay.vn</li>
                    <li>TP. Hồ Chí Minh, Việt Nam</li>
                </ul>

                <div className="flex gap-4 mt-5">
                    <a
                        href="#"
                        className="bg-blue-700 hover:bg-white hover:text-black transition w-9 h-9 flex items-center justify-center rounded-full"
                    >
                        <FaFacebookF size={14} />
                    </a>

                    <a
                        href="#"
                        className="bg-pink-700 hover:bg-white hover:text-black transition w-9 h-9 flex items-center justify-center rounded-full"
                    >
                        <FaInstagram size={16} />
                    </a>

                    <a
                        href="#"
                        className="bg-red-700 hover:bg-white hover:text-black transition w-9 h-9 flex items-center justify-center rounded-full"
                    >
                        <FaYoutube size={16} />
                    </a>
                </div>
            </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="border-t border-gray-700 mt-10 pt-6 text-center text-sm text-gray-500">
            © 2026 PickYourWay. All rights reserved.
        </div>
    </footer>
}

export default page;