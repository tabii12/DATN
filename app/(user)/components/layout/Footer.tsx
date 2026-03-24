import Link from "next/link";
import { FaFacebookF, FaInstagram, FaYoutube } from "react-icons/fa";

const VE_CHUNG_TOI = [
  { label: "Giới thiệu",   id: "gioi-thieu"  },
  { label: "Liên hệ",      id: "ho-tro-lien-he" },
  { label: "Về chúng tôi", id: "ve-chung-toi" },
  { label: "Blog du lịch", id: null },          // chưa có trang riêng
];

const DIEU_KHOAN = [
  { label: "Điều khoản sử dụng",   id: "dieu-khoan"           },
  { label: "Chính sách hoàn hủy",  id: "chinh-sach-huy"       },
  { label: "Chính sách thanh toán",id: "chinh-sach-thanh-toan" },
  { label: "Đổi lịch & hoàn tiền", id: "chinh-sach-doi-lich"  },
];

const HO_TRO = [
  { label: "Trung tâm trợ giúp",     id: "ho-tro-lien-he"      },
  { label: "Hướng dẫn đặt tour",     id: "huong-dan-dat"       },
  { label: "Hướng dẫn thanh toán",   id: "huong-dan-thanh-toan"},
  { label: "Câu hỏi thường gặp",     id: "ho-tro-faq"          },
];

function InfoLink({ label, id }: { label: string; id: string | null }) {
  if (!id) return <span className="text-gray-500 cursor-not-allowed">{label}</span>;
  return (
    <Link
      href={`/info?section=${id}`}
      className="hover:text-white transition-colors no-underline"
    >
      {label}
    </Link>
  );
}

export default function Footer() {
  return (
    <footer className="bg-[#1a1f2b] text-gray-300 pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">

        {/* COLUMN 1 - BRAND */}
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
            {VE_CHUNG_TOI.map(({ label, id }) => (
              <li key={label}><InfoLink label={label} id={id} /></li>
            ))}
          </ul>
        </div>

        {/* COLUMN 3 - ĐIỀU KHOẢN */}
        <div>
          <h3 className="text-white font-semibold mb-4 text-sm">Điều khoản</h3>
          <ul className="space-y-3 text-sm">
            {DIEU_KHOAN.map(({ label, id }) => (
              <li key={label}><InfoLink label={label} id={id} /></li>
            ))}
          </ul>
        </div>

        {/* COLUMN 4 - HỖ TRỢ */}
        <div>
          <h3 className="text-white font-semibold mb-4 text-sm">Hỗ trợ khách hàng</h3>
          <ul className="space-y-3 text-sm">
            {HO_TRO.map(({ label, id }) => (
              <li key={label}><InfoLink label={label} id={id} /></li>
            ))}
          </ul>
        </div>

        {/* COLUMN 5 - CONTACT */}
        <div className="col-span-2 md:col-span-1">
          <h3 className="text-white font-semibold mb-4 text-sm">Liên hệ</h3>
          <ul className="space-y-3 text-sm text-gray-400">
            <li>Hotline: <span className="text-white font-medium">0336323498</span></li>
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
    </footer>
  );
}