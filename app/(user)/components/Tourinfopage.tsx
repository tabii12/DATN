"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { JSX } from "react";

interface BlogItem {
  _id: string;
  slug: string;
  title: string;
  excerpt?: string;
  content?: string;
  images?: { image_url: string }[];
  createdAt?: string;
}

const SECTIONS = [
  {
    id: "gioi-thieu",
    icon: "🗺️",
    label: "Giới thiệu",
    sub: null,
  },
  {
    id: "chinh-sach",
    icon: "📋",
    label: "Chính sách",
    sub: [
      { id: "chinh-sach-huy", label: "Chính sách hủy tour" },
      { id: "chinh-sach-thanh-toan", label: "Chính sách thanh toán" },
      { id: "chinh-sach-doi-lich", label: "Đổi lịch & hoàn tiền" },
    ],
  },
  {
    id: "dieu-khoan",
    icon: "📝",
    label: "Điều khoản sử dụng",
    sub: null,
  },
  {
    id: "huong-dan",
    icon: "📖",
    label: "Hướng dẫn đặt tour",
    sub: [
      { id: "huong-dan-dat", label: "Cách đặt tour" },
      { id: "huong-dan-thanh-toan", label: "Hướng dẫn thanh toán" },
      { id: "huong-dan-check-in", label: "Hướng dẫn check-in" },
    ],
  },
  {
    id: "an-toan",
    icon: "🛡️",
    label: "An toàn du lịch",
    sub: null,
  },
  {
    id: "bao-hiem",
    icon: "🏥",
    label: "Bảo hiểm du lịch",
    sub: null,
  },
  {
    id: "ho-tro",
    icon: "💬",
    label: "Hỗ trợ khách hàng",
    sub: [
      { id: "ho-tro-lien-he", label: "Liên hệ hỗ trợ" },
      { id: "ho-tro-faq", label: "Câu hỏi thường gặp" },
    ],
  },
];

const CONTENT: Record<string, JSX.Element> = {
  "gioi-thieu": (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">🗺️</span>
        <h2 className="text-2xl font-bold text-gray-900">Giới thiệu Pick Your Way</h2>
      </div>
      <div className="relative rounded-2xl overflow-hidden mb-6 h-52">
        <img src="https://images.unsplash.com/photo-1528127269322-539801943592?w=900&q=80" alt="Vietnam" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-5">
          <p className="text-white font-semibold text-lg">Khám phá vẻ đẹp Việt Nam cùng chúng tôi</p>
        </div>
      </div>
      <div className="prose prose-gray max-w-none text-[15px] text-gray-700 leading-relaxed space-y-4">
        <p><strong>Pick Your Way</strong> là nền tảng du lịch trực tuyến chuyên cung cấp các tour du lịch trong nước chất lượng cao tại Việt Nam. Chúng tôi kết nối du khách với những trải nghiệm du lịch đáng nhớ từ Bắc vào Nam.</p>
        <p>Với đội ngũ hướng dẫn viên chuyên nghiệp và hơn <strong>500+ tour</strong> đa dạng, chúng tôi cam kết mang đến hành trình an toàn, thú vị và đáng giá cho từng khách hàng.</p>
        <div className="grid grid-cols-3 gap-4 my-6">
          {[["500+", "Tour đa dạng"], ["50k+", "Khách hài lòng"], ["10+", "Năm kinh nghiệm"]].map(([num, label]) => (
            <div key={label} className="bg-orange-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-black text-orange-500">{num}</p>
              <p className="text-xs text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),

  "chinh-sach-huy": (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">❌</span>
        <h2 className="text-2xl font-bold text-gray-900">Chính sách hủy tour</h2>
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-800">
        ⚠️ Chính sách hủy tour được áp dụng kể từ thời điểm xác nhận đặt tour thành công.
      </div>
      <div className="space-y-3">
        {[
          { time: "Trước 15 ngày", refund: "Hoàn 100%", color: "green" },
          { time: "Trước 7 ngày", refund: "Hoàn 80%", color: "blue" },
          { time: "Trước 3 ngày", refund: "Hoàn 50%", color: "yellow" },
          { time: "Trước 24 giờ", refund: "Hoàn 20%", color: "orange" },
          { time: "Trong vòng 24 giờ", refund: "Không hoàn tiền", color: "red" },
        ].map(({ time, refund, color }) => (
          <div key={time} className="flex items-center justify-between border border-gray-100 rounded-xl px-4 py-3 bg-white">
            <div className="flex items-center gap-3">
              <div className={`w-2.5 h-2.5 rounded-full bg-${color}-400`} />
              <span className="text-sm text-gray-700 font-medium">{time}</span>
            </div>
            <span className={`text-sm font-bold text-${color}-600`}>{refund}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400 mt-4">* Phí hủy được tính trên tổng giá trị đơn hàng, không bao gồm phí dịch vụ.</p>
    </div>
  ),

  "chinh-sach-thanh-toan": (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">💳</span>
        <h2 className="text-2xl font-bold text-gray-900">Chính sách thanh toán</h2>
      </div>
      <div className="space-y-4 text-[15px] text-gray-700 leading-relaxed">
        <p>Chúng tôi hỗ trợ nhiều hình thức thanh toán linh hoạt, an toàn và tiện lợi cho khách hàng:</p>
        <div className="grid grid-cols-2 gap-3">
          {[["🏦", "Chuyển khoản ngân hàng"], ["💳", "Thẻ tín dụng / ghi nợ"], ["📱", "Ví điện tử (MoMo, ZaloPay)"], ["💵", "Thanh toán tiền mặt"]].map(([icon, method]) => (
            <div key={method} className="flex items-center gap-3 border border-gray-100 rounded-xl p-3 bg-white">
              <span className="text-xl">{icon}</span>
              <span className="text-sm font-medium text-gray-700">{method}</span>
            </div>
          ))}
        </div>
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 text-sm text-blue-800">
          <p className="font-semibold mb-1">📌 Lưu ý thanh toán</p>
          <ul className="space-y-1 list-disc list-inside text-blue-700">
            <li>Đặt cọc tối thiểu 30% giá trị tour khi đặt</li>
            <li>Thanh toán đủ 100% trước ngày khởi hành 3 ngày</li>
            <li>Giá tour đã bao gồm VAT theo quy định</li>
          </ul>
        </div>
      </div>
    </div>
  ),

  "chinh-sach-doi-lich": (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">🔄</span>
        <h2 className="text-2xl font-bold text-gray-900">Đổi lịch & hoàn tiền</h2>
      </div>
      <div className="space-y-4 text-[15px] text-gray-700 leading-relaxed">
        <p>Khách hàng có thể yêu cầu đổi lịch khởi hành <strong>tối đa 1 lần</strong> cho mỗi đơn đặt tour, với điều kiện:</p>
        <ul className="space-y-2">
          {["Yêu cầu đổi lịch trước ngày khởi hành ít nhất 5 ngày", "Tour thay thế phải có cùng điểm đến hoặc tương đương", "Chênh lệch giá (nếu có) sẽ được hoàn hoặc thu thêm", "Không áp dụng đổi lịch cho tour đã đặt dịp lễ Tết"].map(c => (
            <li key={c} className="flex items-start gap-2">
              <span className="text-orange-400 mt-0.5">✓</span>
              <span>{c}</span>
            </li>
          ))}
        </ul>
        <div className="bg-green-50 rounded-xl p-4 border border-green-100 text-sm text-green-800">
          <p className="font-semibold mb-1">💚 Hoàn tiền</p>
          <p>Thời gian hoàn tiền từ <strong>3–7 ngày làm việc</strong> kể từ khi xác nhận hủy thành công. Hoàn về đúng phương thức thanh toán ban đầu.</p>
        </div>
      </div>
    </div>
  ),

  "dieu-khoan": (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">📝</span>
        <h2 className="text-2xl font-bold text-gray-900">Điều khoản sử dụng</h2>
      </div>
      <div className="space-y-5 text-[15px] text-gray-700 leading-relaxed">
        {[
          ["1. Điều kiện tham gia", "Khách hàng phải từ 18 tuổi trở lên hoặc có người giám hộ hợp pháp. Trẻ em dưới 12 tuổi được giảm 30% giá tour khi đi cùng người lớn."],
          ["2. Trách nhiệm của khách hàng", "Cung cấp thông tin cá nhân chính xác khi đặt tour. Có mặt đúng giờ tại điểm tập trung. Tuân thủ nội quy điểm tham quan và hướng dẫn của trưởng đoàn."],
          ["3. Trách nhiệm của chúng tôi", "Thực hiện đúng lịch trình và dịch vụ đã cam kết. Cung cấp hướng dẫn viên có chứng chỉ hành nghề. Hỗ trợ xử lý các tình huống phát sinh trong hành trình."],
          ["4. Bất khả kháng", "Trong trường hợp thiên tai, dịch bệnh, chiến tranh hoặc lệnh cấm của cơ quan nhà nước, hai bên cùng thống nhất phương án xử lý phù hợp mà không phát sinh phí phạt."],
        ].map(([title, content]) => (
          <div key={title as string}>
            <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600">{content}</p>
          </div>
        ))}
      </div>
    </div>
  ),

  "huong-dan-dat": (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">🖱️</span>
        <h2 className="text-2xl font-bold text-gray-900">Cách đặt tour</h2>
      </div>
      <div className="space-y-4">
        {[
          ["Bước 1", "Chọn tour", "Tìm kiếm và chọn tour phù hợp từ danh sách. Đọc kỹ thông tin lịch trình, giá cả và những gì bao gồm.", "🔍"],
          ["Bước 2", "Điền thông tin", "Nhập thông tin cá nhân, số lượng khách, ngày khởi hành mong muốn và yêu cầu đặc biệt (nếu có).", "📋"],
          ["Bước 3", "Xác nhận & thanh toán", "Kiểm tra lại thông tin đơn hàng và tiến hành thanh toán đặt cọc hoặc toàn bộ.", "💳"],
          ["Bước 4", "Nhận xác nhận", "Chúng tôi sẽ gửi email xác nhận và phiếu tour trong vòng 30 phút sau khi nhận thanh toán.", "✅"],
        ].map(([step, title, desc, icon]) => (
          <div key={step as string} className="flex gap-4 p-4 bg-white border border-gray-100 rounded-xl">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-lg">{icon}</div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">{step}</span>
                <span className="text-sm font-bold text-gray-900">{title}</span>
              </div>
              <p className="text-[13px] text-gray-500 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  ),

  "huong-dan-thanh-toan": (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">💰</span>
        <h2 className="text-2xl font-bold text-gray-900">Hướng dẫn thanh toán</h2>
      </div>
      <div className="space-y-4 text-[15px] text-gray-700 leading-relaxed">
        <p>Sau khi chọn hình thức thanh toán, làm theo hướng dẫn sau:</p>
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <p className="font-semibold text-gray-800 mb-2">🏦 Chuyển khoản ngân hàng</p>
          <ul className="text-sm space-y-1 text-gray-600">
            <li>Ngân hàng: <strong>Vietcombank</strong></li>
            <li>Số tài khoản: <strong>1234 5678 9012</strong></li>
            <li>Chủ tài khoản: <strong>CÔNG TY DU LỊCH PICK YOUR WAY</strong></li>
            <li>Nội dung: <strong>[Mã đơn hàng] - [Họ tên]</strong></li>
          </ul>
        </div>
        <p className="text-sm text-gray-500">Sau khi chuyển khoản, vui lòng chụp ảnh biên lai và gửi về email <strong className="text-orange-500">support@pickyourway.vn</strong> để xác nhận.</p>
      </div>
    </div>
  ),

  "huong-dan-check-in": (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">🎫</span>
        <h2 className="text-2xl font-bold text-gray-900">Hướng dẫn check-in</h2>
      </div>
      <div className="space-y-4 text-[15px] text-gray-700 leading-relaxed">
        <p>Để check-in tham gia tour, quý khách cần chuẩn bị:</p>
        <div className="grid grid-cols-1 gap-3">
          {[["🪪", "CMND/CCCD hoặc Hộ chiếu còn hạn"], ["📧", "Email xác nhận đặt tour (in hoặc trên điện thoại)"], ["📸", "Ảnh chân dung rõ mặt (nếu tour yêu cầu)"], ["⏰", "Có mặt trước giờ khởi hành 15 phút"]].map(([icon, text]) => (
            <div key={text as string} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl">
              <span className="text-xl">{icon}</span>
              <span className="text-sm text-gray-700">{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),

  "an-toan": (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">🛡️</span>
        <h2 className="text-2xl font-bold text-gray-900">An toàn du lịch</h2>
      </div>
      <div className="space-y-5 text-[15px] text-gray-700 leading-relaxed">
        <p>An toàn của khách hàng là ưu tiên hàng đầu của chúng tôi. Mỗi tour đều được thiết kế với các biện pháp an toàn nghiêm ngặt.</p>
        <div className="grid grid-cols-2 gap-3">
          {[["🚌", "Xe đạt tiêu chuẩn an toàn"], ["👷", "Hướng dẫn viên được đào tạo sơ cứu"], ["📞", "Đường dây khẩn cấp 24/7"], ["🏥", "Bảo hiểm tai nạn toàn hành trình"]].map(([icon, text]) => (
            <div key={text as string} className="flex items-center gap-2 p-3 bg-white border border-gray-100 rounded-xl">
              <span className="text-xl">{icon}</span>
              <span className="text-xs font-medium text-gray-700">{text}</span>
            </div>
          ))}
        </div>
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-700">
          <p className="font-semibold mb-1">🆘 Khẩn cấp trong hành trình</p>
          <p>Liên hệ ngay hướng dẫn viên hoặc gọi <strong>Hotline: 1900 1870</strong> (24/7) để được hỗ trợ kịp thời.</p>
        </div>
      </div>
    </div>
  ),

  "bao-hiem": (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">🏥</span>
        <h2 className="text-2xl font-bold text-gray-900">Bảo hiểm du lịch</h2>
      </div>
      <div className="space-y-4 text-[15px] text-gray-700 leading-relaxed">
        <p>Tất cả tour của Pick Your Way đều bao gồm <strong>bảo hiểm du lịch</strong> trong suốt hành trình, được cung cấp bởi <strong>Bảo Việt</strong>.</p>
        <div className="space-y-2">
          {[["Tai nạn thân thể", "200.000.000 đ"], ["Chi phí y tế", "100.000.000 đ"], ["Hủy chuyến bất khả kháng", "20.000.000 đ"], ["Mất hành lý", "5.000.000 đ"]].map(([coverage, limit]) => (
            <div key={coverage as string} className="flex justify-between items-center border-b border-gray-100 py-2.5 last:border-0">
              <span className="text-sm text-gray-600">{coverage}</span>
              <span className="text-sm font-bold text-green-600">{limit}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400">* Quyền lợi bảo hiểm áp dụng theo điều khoản hợp đồng với Bảo Việt. Liên hệ chúng tôi để biết thêm chi tiết.</p>
      </div>
    </div>
  ),

  "ho-tro-lien-he": (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">📞</span>
        <h2 className="text-2xl font-bold text-gray-900">Liên hệ hỗ trợ</h2>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        {[["📞", "Hotline", "1900 1870", "Thứ 2 – CN, 7:00–22:00"], ["📧", "Email", "support@pickyourway.vn", "Phản hồi trong 2 giờ"], ["💬", "Live chat", "Trên website", "Thứ 2 – CN, 8:00–20:00"], ["📘", "Facebook", "Pick Your Way", "Phản hồi trong 30 phút"]].map(([icon, channel, contact, note]) => (
          <div key={channel as string} className="p-4 bg-white border border-gray-100 rounded-xl">
            <span className="text-2xl">{icon}</span>
            <p className="text-xs text-gray-400 mt-2">{channel}</p>
            <p className="text-sm font-bold text-gray-800">{contact}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{note}</p>
          </div>
        ))}
      </div>
      <div className="bg-orange-50 rounded-xl p-4 border border-orange-100 text-sm text-orange-800">
        <p className="font-semibold">🎯 Hỗ trợ nhanh nhất</p>
        <p className="mt-1 text-orange-700">Gọi thẳng hotline <strong>1900 1870</strong> để được kết nối với nhân viên tư vấn ngay lập tức.</p>
      </div>
    </div>
  ),

  "ho-tro-faq": (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">❓</span>
        <h2 className="text-2xl font-bold text-gray-900">Câu hỏi thường gặp</h2>
      </div>
      <div className="space-y-3">
        {[
          ["Tôi có thể đặt tour cho nhóm không?", "Có, chúng tôi hỗ trợ đặt tour theo nhóm từ 10 người trở lên với mức giá ưu đãi đặc biệt. Liên hệ hotline 1900 1870 để được tư vấn."],
          ["Tour có xuất phát từ nhiều điểm không?", "Tuỳ tour, chúng tôi có thể bố trí điểm đón tại nhà hoặc tại các điểm tập trung cố định trong thành phố."],
          ["Trẻ em có được giảm giá không?", "Trẻ em dưới 5 tuổi miễn phí (không tính suất ăn và ghế ngồi riêng). Từ 5–11 tuổi giảm 30% giá người lớn."],
          ["Tôi cần chuẩn bị gì trước khi đi tour?", "CMND/CCCD, trang phục phù hợp với điểm đến, thuốc cá nhân nếu cần, và xác nhận đặt tour từ email."],
          ["Nếu tour bị hủy do thời tiết thì sao?", "Chúng tôi sẽ chủ động thông báo và hỗ trợ đổi ngày hoặc hoàn tiền 100% trong trường hợp hủy vì lý do bất khả kháng."],
        ].map(([q, a]) => (
          <FaqItem key={q as string} q={q as string} a={a as string} />
        ))}
      </div>
    </div>
  ),

  "ve-chung-toi": (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">🏢</span>
        <h2 className="text-2xl font-bold text-gray-900">Về chúng tôi</h2>
      </div>
      <div className="space-y-4 text-[15px] text-gray-700 leading-relaxed">
        <p><strong>Công ty TNHH Du lịch Pick Your Way</strong> được thành lập năm 2015, trụ sở tại TP. Hồ Chí Minh, chuyên cung cấp dịch vụ tour du lịch nội địa cao cấp trên toàn Việt Nam.</p>
        <div className="space-y-2 text-sm">
          {[["Tên công ty", "Công ty TNHH Du lịch Pick Your Way"], ["Mã số thuế", "0312 345 678"], ["Địa chỉ", "123 Nguyễn Huệ, Quận 1, TP. HCM"], ["Giấy phép LHQT", "01-1234/2015/TCDL-GP LHQT"]].map(([label, value]) => (
            <div key={label as string} className="flex gap-4 border-b border-gray-100 pb-2 last:border-0">
              <span className="w-36 text-gray-400 flex-shrink-0">{label}</span>
              <span className="text-gray-700 font-medium">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),  "blog": <BlogSection />,};

function BlogSection() {
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadBlogs() {
      setLoading(true);
      try {
        const res = await fetch("https://db-pickyourway.vercel.app/api/blogs/");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const items = Array.isArray(data) ? data : data.data || data.blogs || [];
        setBlogs(items);
      } catch (err) {
        setError("Không tải được blog. Vui lòng thử lại sau.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadBlogs();
  }, []);

  if (loading) {
    return <div className="text-center text-gray-500 py-10">Đang tải blog...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 py-10">{error}</div>;
  }

  if (!blogs.length) {
    return <div className="text-center text-gray-500 py-10">Chưa có bài viết nào.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">📝</span>
        <h2 className="text-2xl font-bold text-gray-900">Blog du lịch</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {blogs.slice(0, 6).map((blog) => (
          <div key={blog._id} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            {blog.images?.[0]?.image_url && (
              <div className="relative h-40 w-full">
                <img src={blog.images[0].image_url} alt={blog.title} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-4">
              <h3 className="font-bold text-lg text-gray-800 line-clamp-2">{blog.title}</h3>
              <p className="text-gray-600 text-sm mt-2 line-clamp-3">{blog.excerpt ?? (blog.content ? `${blog.content.replace(/<[^>]*>/g, "").slice(0, 120)}...` : "")}</p>
              <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                <span>{blog.createdAt ? new Date(blog.createdAt).toLocaleDateString('vi-VN') : ''}</span>
                <a href={`/news/${blog.slug}`} className="text-orange-500 hover:text-orange-600 font-medium">Xem tiếp →</a>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="text-right">
        <a href="/news" className="text-sm font-semibold text-orange-500 hover:text-orange-600">Xem tất cả tin tức</a>
      </div>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden bg-white">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between px-4 py-3 text-left bg-transparent border-none cursor-pointer">
        <span className="text-sm font-semibold text-gray-800">{q}</span>
        <span className={"text-gray-400 text-lg transition-transform duration-200 " + (open ? "rotate-90" : "")}>›</span>
      </button>
      {open && <div className="px-4 pb-4 text-sm text-gray-500 leading-relaxed border-t border-gray-50 pt-3">{a}</div>}
    </div>
  );
}

function TourInfoContent() {
  const searchParams = useSearchParams();
  const [activeId, setActiveId] = useState("gioi-thieu");
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({ "chinh-sach": true, "huong-dan": true, "ho-tro": true });

  useEffect(() => {
    const section = searchParams.get("section");
    if (!section) return;
    setActiveId(section);
    const parentMap: Record<string, string> = {
      "chinh-sach-huy": "chinh-sach",
      "chinh-sach-thanh-toan": "chinh-sach",
      "chinh-sach-doi-lich": "chinh-sach",
      "huong-dan-dat": "huong-dan",
      "huong-dan-thanh-toan": "huong-dan",
      "huong-dan-check-in": "huong-dan",
      "ho-tro-lien-he": "ho-tro",
      "ho-tro-faq": "ho-tro",
    };
    const parent = parentMap[section];
    if (parent) setOpenGroups(prev => ({ ...prev, [parent]: true }));
  }, [searchParams]);

  function toggleGroup(id: string) {
    setOpenGroups(prev => ({ ...prev, [id]: !prev[id] }));
  }

  function getContent() {
    return CONTENT[activeId] ?? (
      <div className="text-center text-gray-400 py-20">
        <p className="text-4xl mb-3">🚧</p>
        <p>Nội dung đang được cập nhật...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Breadcrumb */}
      <div className="max-w-[1280] mx-auto px-4 pt-4">
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
          <a href="/" className="hover:text-orange-500 no-underline">Trang chủ</a>
          <span>/</span>
          <span className="text-gray-600 font-medium">Thông tin & Hỗ trợ</span>
        </div>
      </div>

      <div className="max-w-[1280] mx-auto px-4 py-8 flex gap-6 items-start">
        {/* SIDEBAR */}
        <aside className="w-[240px] flex-shrink-0 sticky top-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Danh mục</p>
            </div>
            <nav className="py-2">
              {SECTIONS.map(section => (
                <div key={section.id}>
                  {section.sub ? (
                    <>
                      <button
                        onClick={() => toggleGroup(section.id)}
                        className={"w-full flex items-center justify-between px-4 py-2.5 text-left bg-transparent border-none cursor-pointer transition-colors " + (openGroups[section.id] ? "text-orange-500" : "text-gray-700 hover:bg-gray-50")}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-base">{section.icon}</span>
                          <span className="text-sm font-semibold">{section.label}</span>
                        </div>
                        <span className={"text-xs text-gray-400 transition-transform duration-200 " + (openGroups[section.id] ? "rotate-90" : "")}>›</span>
                      </button>
                      {openGroups[section.id] && (
                        <div className="pl-10 pb-1">
                          {section.sub.map(sub => (
                            <button
                              key={sub.id}
                              onClick={() => setActiveId(sub.id)}
                              className={"w-full text-left px-3 py-2 text-[13px] rounded-lg cursor-pointer border-none transition-colors " + (activeId === sub.id ? "bg-orange-50 text-orange-600 font-semibold" : "text-gray-500 hover:text-gray-800 hover:bg-gray-50 bg-transparent")}
                            >
                              {sub.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <button
                      onClick={() => setActiveId(section.id)}
                      className={"w-full flex items-center gap-2.5 px-4 py-2.5 text-left border-none cursor-pointer transition-colors " + (activeId === section.id ? "bg-orange-50 text-orange-600" : "text-gray-700 hover:bg-gray-50 bg-transparent")}
                    >
                      <span className="text-base">{section.icon}</span>
                      <span className={"text-sm " + (activeId === section.id ? "font-bold" : "font-medium")}>{section.label}</span>
                    </button>
                  )}
                </div>
              ))}
            </nav>

            {/* Hotline */}
            <div className="mx-3 mb-3 bg-orange-500 rounded-xl p-3 text-white text-center">
              <p className="text-[11px] opacity-80">Cần hỗ trợ ngay?</p>
              <a href="tel:19001870" className="text-base font-black no-underline text-white">📞 1900 1870</a>
            </div>
          </div>
        </aside>

        {/* CONTENT */}
        <main className="flex-1 min-w-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7 min-h-[500px]">
            {getContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function TourInfoPage() {
  return (
    <Suspense>
      <TourInfoContent />
    </Suspense>
  );
}