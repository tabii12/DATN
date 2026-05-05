"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { JSX } from "react";

const SECTIONS = [
  { id: "gioi-thieu", icon: "🗺️", label: "Giới thiệu", sub: null },
  {
    id: "chinh-sach", icon: "📋", label: "Chính sách",
    sub: [
      { id: "chinh-sach-huy",        label: "Chính sách hủy tour" },
      { id: "chinh-sach-thanh-toan", label: "Chính sách thanh toán" },
      { id: "chinh-sach-doi-lich",   label: "Đổi lịch & hoàn tiền" },
    ],
  },
  { id: "dieu-khoan", icon: "📝", label: "Điều khoản sử dụng", sub: null },
  {
    id: "huong-dan", icon: "📖", label: "Hướng dẫn đặt tour",
    sub: [
      { id: "huong-dan-dat",        label: "Cách đặt tour" },
      { id: "huong-dan-thanh-toan", label: "Hướng dẫn thanh toán" },
      { id: "huong-dan-check-in",   label: "Hướng dẫn check-in" },
    ],
  },
  { id: "an-toan",  icon: "🛡️", label: "An toàn du lịch",  sub: null },
  { id: "bao-hiem", icon: "🏥", label: "Bảo hiểm du lịch", sub: null },
  {
    id: "ho-tro", icon: "💬", label: "Hỗ trợ khách hàng",
    sub: [
      { id: "ho-tro-lien-he", label: "Liên hệ hỗ trợ" },
      { id: "ho-tro-faq",     label: "Câu hỏi thường gặp" },
    ],
  },
];

// ─── CONTENT MAP ────────────────────────────────────────────

const CONTENT: Record<string, JSX.Element> = {

  // ── GIỚI THIỆU ──────────────────────────────────────────
  "gioi-thieu": (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">🗺️</span>
        <h2 className="text-2xl font-bold text-gray-900">Giới thiệu Pick Your Way</h2>
      </div>

      {/* Hero ảnh */}
      <div className="relative rounded-2xl overflow-hidden mb-7 h-56">
        <img src="https://res.cloudinary.com/dmv7ymjxf/image/upload/v1775203365/logo-removebg-preview_iyvg9e.png" alt="Pick Your Way" className="w-full h-full object-contain bg-orange-50 p-6"/>
      </div>

      {/* Mô tả */}
      <div className="text-[15px] text-gray-700 leading-relaxed space-y-4 mb-7">
        <p>
          <strong>Pick Your Way</strong> là nền tảng đặt tour du lịch trực tuyến tập trung vào các tour
          trong nước tại Việt Nam, trụ sở tại <strong>TP. Hồ Chí Minh</strong>. Chúng tôi kết nối du khách
          với những hành trình đáng nhớ — từ biển đảo miền Nam, phố cổ miền Trung, đến núi rừng
          miền Bắc và cao nguyên Tây Nguyên.
        </p>
        <p>
          Với hơn <strong>49 tour đa dạng</strong> và đội ngũ hướng dẫn viên chuyên nghiệp, Pick Your Way
          cam kết mang đến trải nghiệm du lịch an toàn, chất lượng và đáng giá — dù bạn đi một mình,
cùng gia đình hay theo nhóm bạn.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-7">
        {[
          ["49",      "Tour đa dạng",           "🏖️"],
          ["Toàn quốc", "Điểm đến khắp Việt Nam", "📍"],
          ["24/7",      "Hỗ trợ khách hàng",      "📞"],
        ].map(([num, label, icon]) => (
          <div key={label} className="bg-orange-50 rounded-xl p-4 text-center border border-orange-100">
            <div className="text-xl mb-1">{icon}</div>
            <p className="text-xl font-black text-orange-500">{num}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Điểm mạnh */}
      <div className="grid grid-cols-2 gap-3 mb-7">
        {[
          ["🚌", "Nhiều lịch khởi hành",      "Linh hoạt cuối tuần, cuối tháng và theo yêu cầu"],
          ["💰", "Giá minh bạch",              "Không phí ẩn, thanh toán đặt cọc hoặc toàn bộ"],
          ["🛡️", "An toàn & bảo hiểm",        "Bảo hiểm toàn hành trình, hướng dẫn viên có chứng chỉ"],
          ["⭐", "Dịch vụ chuyên nghiệp",     "Khách sạn, phương tiện, ăn uống đều được chọn lọc kỹ"],
        ].map(([icon, title, sub]) => (
          <div key={title} className="flex items-start gap-3 bg-white border border-gray-100 rounded-xl p-4">
            <span className="text-2xl shrink-0">{icon}</span>
            <div>
              <p className="text-sm font-bold text-gray-800">{title}</p>
              <p className="text-[12px] text-gray-400 mt-0.5 leading-relaxed">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Liên hệ */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-400 rounded-2xl p-5 text-white">
        <p className="font-bold text-base mb-3">📬 Liên hệ Pick Your Way</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            ["📞", "Hotline",   "0336 323 498"],
            ["📧", "Email",     "support@pickyourway.vn"],
            ["📍", "Trụ sở",    "TP. Hồ Chí Minh"],
          ].map(([icon, label, value]) => (
            <div key={label} className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3">
              <p className="text-[11px] text-white/70 font-semibold">{icon} {label}</p>
              <p className="text-sm font-bold mt-0.5">{value}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 text-center">
          <a href="/contact" className="inline-block bg-white text-orange-500 font-bold text-sm px-5 py-2 rounded-full hover:bg-orange-50 transition no-underline">
            Gửi yêu cầu hỗ trợ →
          </a>
        </div>
</div>
    </div>
  ),

  // ── CHÍNH SÁCH HỦY ──────────────────────────────────────
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
          { time: "Trước 15 ngày",       refund: "Hoàn 100%",        color: "green" },
          { time: "Trước 7 ngày",        refund: "Hoàn 80%",         color: "blue" },
          { time: "Trước 3 ngày",        refund: "Hoàn 50%",         color: "yellow" },
          { time: "Trước 24 giờ",        refund: "Hoàn 20%",         color: "orange" },
          { time: "Trong vòng 24 giờ",   refund: "Không hoàn tiền",  color: "red" },
        ].map(({ time, refund, color }) => (
          <div key={time} className="flex items-center justify-between border border-gray-100 rounded-xl px-4 py-3 bg-white">
            <div className="flex items-center gap-3">
              <div className={`w-2.5 h-2.5 rounded-full bg-${color}-400`}/>
              <span className="text-sm text-gray-700 font-medium">{time}</span>
            </div>
            <span className={`text-sm font-bold text-${color}-600`}>{refund}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400 mt-4">* Phí hủy được tính trên tổng giá trị đơn hàng, không bao gồm phí dịch vụ.</p>
    </div>
  ),

  // ── THANH TOÁN ──────────────────────────────────────────
  "chinh-sach-thanh-toan": (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">💳</span>
        <h2 className="text-2xl font-bold text-gray-900">Chính sách thanh toán</h2>
      </div>
      <div className="space-y-4 text-[15px] text-gray-700 leading-relaxed">
        <p>Chúng tôi hỗ trợ nhiều hình thức thanh toán linh hoạt, an toàn và tiện lợi:</p>
        <div className="grid grid-cols-2 gap-3">
          {[["🏦","Chuyển khoản ngân hàng"],["💳","Thẻ tín dụng / ghi nợ"],["📱","Ví điện tử (MoMo, ZaloPay)"],["💵","Thanh toán tiền mặt"]].map(([icon,method]) => (
            <div key={method as string} className="flex items-center gap-3 border border-gray-100 rounded-xl p-3 bg-white">
              <span className="text-xl">{icon}</span>
              <span className="text-sm font-medium text-gray-700">{method}</span>
            </div>
          ))}
        </div>
<div className="bg-blue-50 rounded-xl p-4 border border-blue-100 text-sm text-blue-800">
          <p className="font-semibold mb-1">📌 Lưu ý</p>
          <ul className="space-y-1 list-disc list-inside text-blue-700">
            <li>Đặt cọc tối thiểu 50% giá trị tour khi đặt</li>
            <li>Thanh toán đủ 100% trước ngày khởi hành 3 ngày</li>
            <li>Giá tour đã bao gồm VAT theo quy định</li>
          </ul>
        </div>
      </div>
    </div>
  ),

  // ── ĐỔI LỊCH ────────────────────────────────────────────
  "chinh-sach-doi-lich": (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">🔄</span>
        <h2 className="text-2xl font-bold text-gray-900">Đổi lịch & hoàn tiền</h2>
      </div>
      <div className="space-y-4 text-[15px] text-gray-700 leading-relaxed">
        <p>Khách hàng có thể yêu cầu đổi lịch <strong>tối đa 1 lần</strong> cho mỗi đơn đặt tour, với điều kiện:</p>
        <ul className="space-y-2">
          {["Yêu cầu trước ngày khởi hành ít nhất 5 ngày","Tour thay thế phải có cùng điểm đến hoặc tương đương","Chênh lệch giá (nếu có) sẽ được hoàn hoặc thu thêm","Không áp dụng đổi lịch cho tour đặt dịp lễ Tết"].map(c => (
            <li key={c} className="flex items-start gap-2">
              <span className="text-orange-400 mt-0.5">✓</span><span>{c}</span>
            </li>
          ))}
        </ul>
        <div className="bg-green-50 rounded-xl p-4 border border-green-100 text-sm text-green-800">
          <p className="font-semibold mb-1">💚 Hoàn tiền</p>
          <p>Thời gian hoàn tiền <strong>3–7 ngày làm việc</strong> kể từ khi xác nhận hủy. Hoàn về đúng phương thức thanh toán ban đầu.</p>
        </div>
      </div>
    </div>
  ),

  // ── ĐIỀU KHOẢN ──────────────────────────────────────────
  "dieu-khoan": (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">📝</span>
        <h2 className="text-2xl font-bold text-gray-900">Điều khoản sử dụng</h2>
      </div>
      <div className="space-y-5 text-[15px] text-gray-700 leading-relaxed">
        {[
          ["1. Điều kiện tham gia","Khách hàng phải từ 18 tuổi trở lên hoặc có người giám hộ hợp pháp. Trẻ em dưới 12 tuổi được giảm 30% giá tour khi đi cùng người lớn."],
          ["2. Trách nhiệm của khách hàng","Cung cấp thông tin cá nhân chính xác khi đặt tour. Có mặt đúng giờ tại điểm tập trung. Tuân thủ nội quy điểm tham quan và hướng dẫn của trưởng đoàn."],
["3. Trách nhiệm của chúng tôi","Thực hiện đúng lịch trình và dịch vụ đã cam kết. Cung cấp hướng dẫn viên có chứng chỉ hành nghề. Hỗ trợ xử lý các tình huống phát sinh trong hành trình."],
          ["4. Bất khả kháng","Trong trường hợp thiên tai, dịch bệnh hoặc lệnh cấm của cơ quan nhà nước, hai bên cùng thống nhất phương án xử lý mà không phát sinh phí phạt."],
        ].map(([title, content]) => (
          <div key={title as string}>
            <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600">{content}</p>
          </div>
        ))}
      </div>
    </div>
  ),

  // ── HƯỚNG DẪN ĐẶT ───────────────────────────────────────
  "huong-dan-dat": (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">🖱️</span>
        <h2 className="text-2xl font-bold text-gray-900">Cách đặt tour</h2>
      </div>
      <div className="space-y-4">
        {[
          ["Bước 1","Chọn tour","Tìm kiếm và chọn tour phù hợp. Đọc kỹ lịch trình, giá cả và những gì bao gồm.","🔍"],
          ["Bước 2","Điền thông tin","Nhập thông tin cá nhân, số lượng khách, ngày khởi hành và yêu cầu đặc biệt (nếu có).","📋"],
          ["Bước 3","Xác nhận & thanh toán","Kiểm tra lại đơn hàng và thanh toán đặt cọc hoặc toàn bộ.","💳"],
          ["Bước 4","Nhận xác nhận","Chúng tôi gửi email xác nhận và phiếu tour trong vòng 30 phút sau khi nhận thanh toán.","✅"],
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

  // ── HƯỚNG DẪN THANH TOÁN ────────────────────────────────
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
            <li>Chủ tài khoản: <strong>PICK YOUR WAY</strong></li>
            <li>Nội dung: <strong>[Mã đơn hàng] - [Họ tên]</strong></li>
          </ul>
        </div>
        <p className="text-sm text-gray-500">Sau khi chuyển khoản, vui lòng gửi ảnh biên lai về email <strong className="text-orange-500">support@pickyourway.vn</strong> để xác nhận.</p>
      </div>
    </div>
  ),

  // ── CHECK-IN ─────────────────────────────────────────────
  "huong-dan-check-in": (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">🎫</span>
        <h2 className="text-2xl font-bold text-gray-900">Hướng dẫn check-in</h2>
      </div>
      <div className="space-y-4 text-[15px] text-gray-700 leading-relaxed">
        <p>Để check-in tham gia tour, quý khách cần chuẩn bị:</p>
        <div className="grid grid-cols-1 gap-3">
          {[["🪪","CMND/CCCD hoặc Hộ chiếu còn hạn"],["📧","Email xác nhận đặt tour (in hoặc trên điện thoại)"],["📸","Ảnh chân dung rõ mặt (nếu tour yêu cầu)"],["⏰","Có mặt trước giờ khởi hành 15 phút"]].map(([icon,text]) => (
            <div key={text as string} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl">
              <span className="text-xl">{icon}</span>
              <span className="text-sm text-gray-700">{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),

  // ── AN TOÀN ──────────────────────────────────────────────
  "an-toan": (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">🛡️</span>
        <h2 className="text-2xl font-bold text-gray-900">An toàn du lịch</h2>
      </div>
      <div className="space-y-5 text-[15px] text-gray-700 leading-relaxed">
        <p>An toàn của khách hàng là ưu tiên hàng đầu. Mỗi tour đều được thiết kế với các biện pháp an toàn nghiêm ngặt.</p>
        <div className="grid grid-cols-2 gap-3">
          {[["🚌","Xe đạt tiêu chuẩn an toàn"],["👷","Hướng dẫn viên được đào tạo sơ cứu"],["📞","Đường dây khẩn cấp 24/7"],["🏥","Bảo hiểm tai nạn toàn hành trình"]].map(([icon,text]) => (
            <div key={text as string} className="flex items-center gap-2 p-3 bg-white border border-gray-100 rounded-xl">
              <span className="text-xl">{icon}</span>
<span className="text-xs font-medium text-gray-700">{text}</span>
            </div>
          ))}
        </div>
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-700">
          <p className="font-semibold mb-1">🆘 Khẩn cấp trong hành trình</p>
          <p>Liên hệ ngay hướng dẫn viên hoặc gọi <strong>Hotline: 0336 323 498</strong> (24/7) để được hỗ trợ kịp thời.</p>
        </div>
      </div>
    </div>
  ),

  // ── BẢO HIỂM ─────────────────────────────────────────────
  "bao-hiem": (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">🏥</span>
        <h2 className="text-2xl font-bold text-gray-900">Bảo hiểm du lịch</h2>
      </div>
      <div className="space-y-4 text-[15px] text-gray-700 leading-relaxed">
        <p>Tất cả tour của Pick Your Way đều bao gồm <strong>bảo hiểm du lịch</strong> trong suốt hành trình.</p>
        <div className="space-y-2">
          {[["Tai nạn thân thể","200.000.000 đ"],["Chi phí y tế","100.000.000 đ"],["Hủy chuyến bất khả kháng","20.000.000 đ"],["Mất hành lý","5.000.000 đ"]].map(([coverage,limit]) => (
            <div key={coverage as string} className="flex justify-between items-center border-b border-gray-100 py-2.5 last:border-0">
              <span className="text-sm text-gray-600">{coverage}</span>
              <span className="text-sm font-bold text-green-600">{limit}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400">* Liên hệ chúng tôi để biết thêm chi tiết về quyền lợi bảo hiểm.</p>
      </div>
    </div>
  ),

  // ── LIÊN HỆ ──────────────────────────────────────────────
  "ho-tro-lien-he": (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">📞</span>
        <h2 className="text-2xl font-bold text-gray-900">Liên hệ hỗ trợ</h2>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        {[["📞","Hotline","0336 323 498","Tất cả các ngày, 7:00–22:00"],["📧","Email","support@pickyourway.vn","Phản hồi trong 2 giờ"],["💬","Live chat","Trên website","Thứ 2 – CN, 8:00–20:00"],["📘","Facebook","Pick Your Way","Phản hồi trong 30 phút"]].map(([icon,channel,contact,note]) => (
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
        <p className="mt-1 text-orange-700">Gọi thẳng hotline <strong>0336 323 498</strong> để được kết nối với nhân viên tư vấn ngay lập tức.</p>
      </div>
    </div>
  ),

  // ── FAQ ───────────────────────────────────────────────────
  "ho-tro-faq": (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">❓</span>
        <h2 className="text-2xl font-bold text-gray-900">Câu hỏi thường gặp</h2>
      </div>
      <div className="space-y-3">
        {[
          ["Tôi có thể đặt tour cho nhóm không?","Có, chúng tôi hỗ trợ đặt tour theo nhóm từ 10 người trở lên với mức giá ưu đãi đặc biệt. Liên hệ hotline 0336 323 498 để được tư vấn."],
          ["Tour có xuất phát từ nhiều điểm không?","Tuỳ tour, chúng tôi có thể bố trí điểm đón tại nhà hoặc tại các điểm tập trung cố định trong thành phố."],
          ["Trẻ em có được giảm giá không?","Trẻ em dưới 5 tuổi miễn phí (không tính suất ăn và ghế ngồi riêng). Từ 5–11 tuổi giảm 30% giá người lớn."],
          ["Tôi cần chuẩn bị gì trước khi đi tour?","CMND/CCCD, trang phục phù hợp với điểm đến, thuốc cá nhân nếu cần, và email xác nhận đặt tour."],
          ["Nếu tour bị hủy do thời tiết thì sao?","Chúng tôi sẽ chủ động thông báo và hỗ trợ đổi ngày hoặc hoàn tiền 100% trong trường hợp hủy vì lý do bất khả kháng."],
        ].map(([q, a]) => (
          <FaqItem key={q as string} q={q as string} a={a as string}/>
        ))}
      </div>
    </div>
  ),

};

// ─── FAQ ITEM ────────────────────────────────────────────────

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden bg-white">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between px-4 py-3 text-left bg-transparent border-none cursor-pointer">
        <span className="text-sm font-semibold text-gray-800">{q}</span>
        <span className={`text-gray-400 text-lg transition-transform duration-200 ${open ? "rotate-90" : ""}`}>›</span>
      </button>
      {open && <div className="px-4 pb-4 text-sm text-gray-500 leading-relaxed border-t border-gray-50 pt-3">{a}</div>}
    </div>
  );
}

// ─── MAIN ────────────────────────────────────────────────────

function TourInfoContent() {
  const searchParams = useSearchParams();
  const [activeId, setActiveId] = useState("gioi-thieu");
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    "chinh-sach": true, "huong-dan": true, "ho-tro": true,
  });

  useEffect(() => {
const section = searchParams.get("section");
    if (!section) return;
    setActiveId(section);
    const parentMap: Record<string, string> = {
      "chinh-sach-huy": "chinh-sach", "chinh-sach-thanh-toan": "chinh-sach", "chinh-sach-doi-lich": "chinh-sach",
      "huong-dan-dat": "huong-dan",   "huong-dan-thanh-toan": "huong-dan",   "huong-dan-check-in": "huong-dan",
      "ho-tro-lien-he": "ho-tro",    "ho-tro-faq": "ho-tro",
    };
    const parent = parentMap[section];
    if (parent) setOpenGroups(prev => ({ ...prev, [parent]: true }));
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 pt-4">
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
          <a href="/" className="hover:text-orange-500 no-underline">Trang chủ</a>
          <span>/</span>
          <span className="text-gray-600 font-medium">Thông tin & Hỗ trợ</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6 items-start">
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
                        onClick={() => setOpenGroups(prev => ({ ...prev, [section.id]: !prev[section.id] }))}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-left bg-transparent border-none cursor-pointer transition-colors ${openGroups[section.id] ? "text-orange-500 bg-orange-50" : "text-gray-700 hover:bg-gray-50"}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-base">{section.icon}</span>
                          <span className="text-sm font-semibold">{section.label}</span>
                        </div>
                        <span className={`text-xs text-gray-400 transition-transform duration-200 ${openGroups[section.id] ? "rotate-90" : ""}`}>›</span>
                      </button>
                      {openGroups[section.id] && (
                        <div className="pl-4 pb-1 border-l-2 border-orange-100 ml-4">
                          {section.sub.map(sub => (
                            <button key={sub.id} onClick={() => setActiveId(sub.id)}
className={`w-full text-left px-3 py-2 text-[13px] rounded-lg cursor-pointer border-none transition-colors ${activeId === sub.id ? "bg-orange-50 text-orange-600 font-semibold" : "text-gray-500 hover:text-gray-800 hover:bg-gray-50 bg-transparent"}`}>
                              {sub.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <button onClick={() => setActiveId(section.id)}
                      className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-left border-none cursor-pointer transition-colors ${activeId === section.id ? "bg-orange-50 text-orange-600" : "text-gray-700 hover:bg-gray-50 bg-transparent"}`}>
                      <span className="text-base">{section.icon}</span>
                      <span className={`text-sm ${activeId === section.id ? "font-bold" : "font-medium"}`}>{section.label}</span>
                    </button>
                  )}
                </div>
              ))}
            </nav>

            {/* Hotline box */}
            <div className="mx-3 mb-3 bg-orange-500 rounded-xl p-3 text-white text-center">
              <p className="text-[11px] opacity-80">Cần hỗ trợ ngay?</p>
              <a href="tel:0336323498" className="text-base font-black no-underline text-white">📞 0336 323 498</a>
            </div>
          </div>
        </aside>

        {/* CONTENT */}
        <main className="flex-1 min-w-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7 min-h-[500px]">
            {CONTENT[activeId] ?? (
              <div className="text-center text-gray-400 py-20">
                <p className="text-4xl mb-3">🚧</p>
                <p>Nội dung đang được cập nhật...</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function TourInfoPage() {
  return (
    <Suspense>
      <TourInfoContent/>
    </Suspense>
  );
}