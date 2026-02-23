"use client";

import { useState } from "react";

// ─────────────────────────── DATA ───────────────────────────

const ALL_IMAGES = [
  { src: "//cdn1.ivivu.com/iVivu/2019/06/17/18/1.webp?o=jpg&w=767", alt: "Quang cảnh chung" },
  { src: "//cdn1.ivivu.com/iVivu/2020/02/14/19/quang-canh-chung-1.webp?o=jpg&w=767", alt: "Tiệc cưới tại bãi biển" },
  { src: "//cdn1.ivivu.com/iVivu/2019/06/17/18/4.webp?o=jpg&w=767", alt: "Hồ bơi chính" },
  { src: "//cdn1.ivivu.com/iVivu/2019/06/17/18/2.webp?o=jpg&w=767", alt: "Hồ bơi trẻ em" },
  { src: "//cdn1.ivivu.com/iVivu/2020/02/14/19/club-swiming-pool.webp?o=jpg&w=767", alt: "Hồ bơi khu Club Intercontinental" },
  { src: "//cdn1.ivivu.com/iVivu/2019/01/15/14/khu-nghi-duong-intercontinental-phu-quoc-long-beach-2.webp?o=jpg&w=767", alt: "Sảnh chính" },
  { src: "https://cdn1.ivivu.com/images/2024/05/31/13/khu-nghi-duong-intercontinental-phu-quoc-long-beach-1_hcog9p_.webp?w=767", alt: "Sảnh chính" },
  { src: "//cdn1.ivivu.com/iVivu/2019/01/15/14/khu-nghi-duong-intercontinental-phu-quoc-long-beach-5.webp?o=jpg&w=767", alt: "Khu vui chơi trẻ em" },
  { src: "//cdn1.ivivu.com/iVivu/2020/02/14/19/tra-chieu.webp?o=jpg&w=767", alt: "Trà chiều" },
  { src: "//cdn1.ivivu.com/iVivu/2020/02/14/19/tra-chieu-3.webp?o=jpg&w=767", alt: "Trà chiều" },
  { src: "//cdn1.ivivu.com/iVivu/2019/01/15/14/khu-nghi-duong-intercontinental-phu-quoc-long-beach-7.webp?o=jpg&w=767", alt: "Phòng hội nghị" },
  { src: "//cdn1.ivivu.com/iVivu/2019/01/15/14/khu-nghi-duong-intercontinental-phu-quoc-long-beach-8.webp?o=jpg&w=767", alt: "Phòng GYM" },
  { src: "//cdn1.ivivu.com/iVivu/2019/01/15/14/khu-nghi-duong-intercontinental-phu-quoc-long-beach-9.webp?o=jpg&w=767", alt: "Khu vực Spa" },
];

const THUMBS = [
  "//cdn1.ivivu.com/iVivu/2019/06/17/18/1.webp?o=jpg&h=73&w=73",
  "//cdn1.ivivu.com/iVivu/2020/02/14/19/quang-canh-chung-1.webp?o=jpg&h=73&w=73",
  "//cdn1.ivivu.com/iVivu/2019/06/17/18/4.webp?o=jpg&h=73&w=73",
  "//cdn1.ivivu.com/iVivu/2019/06/17/18/2.webp?o=jpg&h=73&w=73",
  "//cdn1.ivivu.com/iVivu/2020/02/14/19/club-swiming-pool.webp?o=jpg&h=73&w=73",
  "//cdn1.ivivu.com/iVivu/2019/01/15/14/khu-nghi-duong-intercontinental-phu-quoc-long-beach-2.webp?o=jpg&h=73&w=73",
  "https://cdn1.ivivu.com/images/2024/05/31/13/khu-nghi-duong-intercontinental-phu-quoc-long-beach-1_hcog9p_.webp?h=73&w=73",
  "//cdn1.ivivu.com/iVivu/2019/01/15/14/khu-nghi-duong-intercontinental-phu-quoc-long-beach-5.webp?o=jpg&h=73&w=73",
  "https://cdn1.ivivu.com/images/2024/05/31/13/khu-nghi-duong-intercontinental-phu-quoc-long-beach-4_zllyxu_.webp?h=73&w=73",
  "//cdn1.ivivu.com/iVivu/2020/02/14/19/tra-chieu.webp?o=jpg&h=73&w=73",
  "//cdn1.ivivu.com/iVivu/2020/02/14/19/tra-chieu-3.webp?o=jpg&h=73&w=73",
  "https://cdn1.ivivu.com/images/2024/05/31/13/khu-nghi-duong-intercontinental-phu-quoc-long-beach-6_bfxuu2_.webp?h=73&w=73",
  "//cdn1.ivivu.com/iVivu/2019/01/15/14/khu-nghi-duong-intercontinental-phu-quoc-long-beach-7.webp?o=jpg&h=73&w=73",
  "//cdn1.ivivu.com/iVivu/2019/01/15/14/khu-nghi-duong-intercontinental-phu-quoc-long-beach-8.webp?o=jpg&h=73&w=73",
  "//cdn1.ivivu.com/iVivu/2019/01/15/14/khu-nghi-duong-intercontinental-phu-quoc-long-beach-9.webp?o=jpg&h=73&w=73",
  "//cdn1.ivivu.com/iVivu/2019/01/15/14/khu-nghi-duong-intercontinental-phu-quoc-long-beach-11.webp?o=jpg&h=73&w=73",
  "//cdn1.ivivu.com/iVivu/2020/02/14/19/club-intercontinental-lounge-1-cr.webp?o=jpg&h=73&w=73",
];

const REVIEWS = [
  { initials: "TD", name: "Trinh Dương", date: "13-04-2025", text: "Dịch vụ ở Intercon thì mình thấy rất ok, chuyến đi mọi thứ rất tốt, chỉ có ăn sáng hơi đông, nên 1 bữa nhân viên xếp bàn cho khách còn 1 bữa đông quá mình phải tự kiếm bàn. Dịch vụ iVIVU thì rất tốt, chuyến đi ok, từ bạn Sales đến các bạn hỗ trợ VMB đều tốt." },
  { initials: "KD", name: "Khang Đỗ", date: "23-03-2025", text: "Khách sạn phục vụ tốt, iVIVU nhân viên nhiệt tình chu đáo khi hỗ trợ đặt phòng" },
  { initials: "AV", name: "Anh Vũ", date: "20-02-2025", text: "InterContinental Long Beach Phú Quốc dịch vụ tốt, iVIVU thì bạn nhân viên nhiệt tình và đã hỗ trợ cho mình nhiều năm nay rồi" },
  { initials: "DN", name: "Dong Nguyen", date: "08-02-2025", text: "Khu nghỉ dưỡng InterContinental Long Beach Phú Quốc và trang đặt phòng iVIVU dịch vụ rất tốt, chuyến đi hài lòng" },
  { initials: "NL", name: "Ny Lê", date: "09-01-2025", text: "Dịch vụ tốt, trải nghiệm hài lòng trong chuyến đi này" },
  { initials: "VN", name: "Vy Nguyễn", date: "22-12-2024", text: "Khu nghỉ dưỡng InterContinental Long Beach Phú Quốc dịch vụ tốt lắm, chuyến đi tại đây ok, iVIVU nhân viên nhiệt tình hỗ trợ" },
  { initials: "TH", name: "Trường Huỳnh", date: "15-12-2024", text: "Chuyến du lịch rất thú vị không có chỗ chê. Mình sẽ đồng hành bên iVIVU tiếp. Thanks Nhi Merry Christmas." },
  { initials: "AV", name: "Anh Vu", date: "13-12-2024", text: "Chuyến đi ok, nhân viên hỗ trợ từ iVIVU nhiệt tình lắm" },
  { initials: "TV", name: "Toàn Vũ", date: "10-12-2024", text: "Dịch vụ tốt, chuyến đi tốt và hài lòng" },
  { initials: "AV", name: "Anh Vương", date: "04-09-2024", text: "Chất lượng dịch vụ tại Khu nghỉ dưỡng InterContinental Long Beach Phú Quốc mình thấy ok, mọi thứ đều rất tốt." },
];

const POLICIES = [
  {
    label: "Di chuyển",
    html: `<p>1. Máy bay là phương tiện đến Phú Quốc phổ biến nhất, hiện đang có 3 hãng hàng không khai thác gồm Vietnam Airlines, Sun Air và VietJetAir. Thời gian bay khoảng: 2 giờ 10 phút khởi hành từ Hà Nội, 60 phút từ TP.HCM, 65 phút từ Cần Thơ.<br/>Từ sân bay đến InterContinental Phú Quốc Long Beach mất khoảng 15 phút di chuyển bằng taxi.</p><p class="mt-2">2. Tàu hoặc Phà:<br/>- Tuyến Rạch Giá – Phú Quốc hiện có 4 hãng khai thác gồm tàu Superdong 2-3-4 và tàu Savana Express, thời gian đi khoảng 2 giờ 30 phút.<br/>- Tuyến Hà Tiên – Phú Quốc có tàu Superdong 1 và tàu cao tốc Hồng Tâm, thời gian đi khoảng 60 phút.</p>`,
  },
  {
    label: "Lịch trình Shuttle Bus",
    html: `<p>Miễn phí đón tiễn sân bay cho khách lẻ dưới 5 phòng, áp dụng cho booking đăng ký trước 5 ngày, được resort xác nhận tại thời điểm đặt phòng.</p><p class="mt-2">Trường hợp ít hơn 5 ngày sẽ hỗ trợ tùy thuộc vào tình trạng chỗ trống</p>`,
  },
  {
    label: "Hướng dẫn nhận phòng",
    html: `<p>- Quý khách phải xuất trình bản gốc giấy tờ tùy thân (Giấy chứng minh nhân dân; Căn cước công dân; Hộ chiếu kèm thị thực xuất nhập cảnh còn hiệu lực) của tất cả các khách lưu trú tại quầy Lễ tân khi làm thủ tục đăng ký nhận phòng.</p><p class="mt-2">- Khách sạn sẽ yêu cầu khoản tiền đặt cọc tại thời điểm nhận phòng, khuyến khích sử dụng tiền mặt hoặc thẻ tín dụng (Credit card)</p>`,
  },
  {
    label: "Hoạt động giải trí",
    html: `<p>- Từ InterContinental Phú Quốc Long Beach, quý khách có thể đến Vinpearland/Safari bằng taxi với thời gian khoảng 70 phút.</p><p class="mt-2">- Mới đây nhất, Tập đoàn Sun Group đã khai trương tuyến cáp treo Hòn Thơm và quần thể giải trí biển Sun World Hon Thom Nature Park, với các trò chơi kéo dù, phao chuối, lặn ngắm san hô, đi bộ dưới đáy biển, kayak…</p>`,
  },
  {
    label: "Chính sách phụ thu",
    html: `<p><strong>Giai đoạn từ nay - 31.12.2026:</strong></p><p class="mt-1">- Trẻ em từ 0-11 tuổi: Miễn phí tối đa 2 trẻ sử dụng chung giường cùng bố mẹ</p><p>- Trẻ em từ 12 tuổi trở lên (tính như người lớn), thanh toán phụ thu:</p><p>+ Junior Suite King: Phụ thu 1.560.000VNĐ/khách/đêm gồm ăn sáng & giường phụ.</p>`,
  },
  {
    label: "(*) Quyền lợi Club InterContinental",
    html: `<p>Quyền lợi Club InterContinental chỉ bao gồm trong các hạng phòng có từ khóa "Club Lounge":</p><p class="mt-1">- Khu vực làm thủ tục nhận – trả phòng riêng tại Club Lounge</p><p>- Thức uống chào mừng</p><p>- Quyền sử dụng Club Lounge trong suốt thời gian lưu trú</p><p>- Hai lựa chọn địa điểm dùng bữa sáng</p><p>- Trà chiều tinh tế</p><p>- Cocktail & canapé buổi xế</p><p>- Sử dụng 4 hồ bơi, bao gồm hồ bơi dành riêng cho Club Lounge</p>`,
  },
];

// ─────────────────────────── COMPONENT ───────────────────────────

export default function HotelDetailPage() {
  const [activeImg, setActiveImg] = useState(0);
  const [thumbOffset, setThumbOffset] = useState(0);
  const [reviewIdx, setReviewIdx] = useState(0);
  const THUMB_VISIBLE = 8;

  const mainGrid = [ALL_IMAGES[0], ALL_IMAGES[1], ALL_IMAGES[2]];

  return (
    <div className="min-h-screen bg-gray-100 font-sans">



      {/* ══════════ HOTEL OVERVIEW ══════════ */}
      <div className="bg-white">
        <div className="max-w-[1200px] mx-auto px-4">

          {/* Title row */}
          <div className="flex justify-between items-start py-4 gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <h1 className="text-xl font-black text-gray-900 leading-snug">Khu nghỉ dưỡng InterContinental Phu Quoc Long Beach</h1>
                <div className="flex gap-0.5 flex-shrink-0">
                  {[1,2,3,4,5].map(i => (
                    <svg key={i} className="w-3.5 h-3.5 fill-amber-400" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  ))}
                </div>
              </div>
              <div className="hidden lg:flex items-center gap-1 mt-1">
                <span className="text-orange-500 text-sm">📍</span>
                <span className="text-[13px] text-gray-500">Bãi Trường, Dương Tơ, Phú Quốc, Tỉnh Kiên Giang </span>
              </div>
            </div>
            {/* Desktop actions */}
            <div className="hidden lg:flex items-center gap-4 flex-shrink-0">
              <span className="text-2xl text-gray-300 cursor-pointer hover:text-red-400 transition-colors leading-none">♡</span>
              <span className="text-xl text-gray-300 cursor-pointer hover:text-orange-400 transition-colors leading-none">⎋</span>
              <button className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-5 py-2 rounded-full transition-colors">Đặt ngay</button>
            </div>
            {/* Mobile: rating */}
            <div className="flex-1 lg:hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black text-white bg-green-600 px-2 py-0.5 rounded-md leading-none">9.7</span>
                  <span className="text-sm font-bold text-green-600">Tuyệt vời</span>
                </div>
                <div className="flex items-center gap-1 cursor-pointer">
                  <span className="text-xs text-gray-400">575 đánh giá</span>
                  <span className="text-gray-400 text-lg leading-none">›</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ── Desktop image layout ── */}
        <div className="hidden lg:block">
          <div className="max-w-[1200px] mx-auto px-4">
            <div className="flex gap-3">

              {/* LEFT: images */}
              <div className="flex-1 min-w-0">
                {/* Combo badge */}
                <div className="inline-flex items-center bg-[#1a1a2e] hover:bg-[#2d2d5e] text-white text-xs font-semibold px-3 py-1.5 rounded-md mb-2 cursor-pointer transition-colors">
                  3N2Đ VMB + Đón tiễn | 7.699 triệu/ khách
                </div>

                {/* Main 3-col grid — first column is 2x wide */}
                <div className="grid gap-1 h-[320px]" style={{gridTemplateColumns: "2fr 1fr 1fr"}}>
                  {mainGrid.map((img, i) => (
                    <div key={i} className="overflow-hidden rounded cursor-pointer group">
                      <img src={img.src} alt={img.alt} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"/>
                    </div>
                  ))}
                </div>

                {/* Sub 5-col strip */}
                <div className="grid grid-cols-5 gap-1 mt-1 h-[110px]">
                  {/* Video */}
                  <div className="relative overflow-hidden rounded cursor-pointer group">
                    <img src="//img.youtube.com/vi/S9--XaH5huo/default.jpg" alt="Video" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"/>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center">
                        <span className="text-gray-800 text-xs ml-0.5">▶</span>
                      </div>
                    </div>
                  </div>
                  {/* 3 regular */}
                  {[ALL_IMAGES[3], ALL_IMAGES[4], ALL_IMAGES[5]].map((img, i) => (
                    <div key={i} className="overflow-hidden rounded cursor-pointer group">
                      <img src={img.src} alt={img.alt} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"/>
                    </div>
                  ))}
                  {/* Last with +count overlay */}
                  <div className="relative overflow-hidden rounded cursor-pointer group">
                    <img src={ALL_IMAGES[6].src} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"/>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <span className="text-white text-sm font-bold">+45 hình</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT: Map + Reviews */}
              <div className="w-[290px] flex-shrink-0 flex flex-col gap-2">
                {/* Map */}
                <div className="h-[195px] rounded-lg overflow-hidden border border-gray-200">
                  <iframe
                    width="100%" height="100%" frameBorder="0" scrolling="no"
                    src="https://maps.google.com/maps?q=10.11295818,103.98370721&hl=vi&z=14&ie=UTF8&iwloc=&output=embed"
                  />
                </div>

                {/* Review card */}
                <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden bg-white flex flex-col">
                  {/* Header */}
                  <div className="flex items-center gap-2.5 px-3 py-2.5">
                    <span className="text-xl font-black text-white bg-green-600 px-2 py-0.5 rounded-md leading-tight">9.7</span>
                    <span className="text-sm font-bold text-green-600">Tuyệt vời</span>
                    <span className="text-xs text-gray-400 ml-auto">575 đánh giá</span>
                  </div>
                  <div className="h-px bg-gray-100"/>

                  {/* Slide body */}
                  <div className="flex-1 relative overflow-hidden min-h-0">
                    <button
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-10 text-2xl text-gray-300 hover:text-orange-500 transition-colors leading-none bg-transparent border-none cursor-pointer"
                      onClick={() => setReviewIdx(p => Math.min(REVIEWS.length - 1, p + 1))}
                    >›</button>
                    <div
                      className="flex h-full transition-transform duration-300 ease-in-out"
                      style={{transform: `translateX(-${reviewIdx * 100}%)`}}
                    >
                      {REVIEWS.map((r, i) => (
                        <div key={i} className="min-w-full flex flex-col justify-between p-3 box-border">
                          <p className="text-xs text-gray-600 leading-relaxed line-clamp-5">{r.text}</p>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-orange-50 flex items-center justify-center text-[10px] font-bold text-orange-500 flex-shrink-0">{r.initials}</div>
                              <span className="text-xs font-semibold text-gray-700">{r.name}</span>
                            </div>
                            <span className="text-[11px] text-gray-400">{r.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="h-px bg-gray-100"/>
                  <button className="py-2 text-xs font-semibold text-orange-500 hover:bg-orange-50 transition-colors w-full bg-transparent border-none cursor-pointer">
                    Xem tất cả đánh giá
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ── Mobile image carousel ── */}
        <div className="lg:hidden">
          <div className="relative overflow-hidden">
            <div
              className="flex transition-transform duration-300 ease-in-out"
              style={{transform: `translate3d(-${activeImg * 100}vw, 0, 0)`}}
            >
              {ALL_IMAGES.map((img, i) => (
                <div key={i} className="relative flex-shrink-0 h-[260px]" style={{minWidth: "100vw"}}>
                  <img src={img.src} alt={img.alt} className="w-full h-full object-cover"/>
                  <span className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white text-xs drop-shadow whitespace-nowrap">{img.alt}</span>
                </div>
              ))}
            </div>
            <button className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 rounded-full flex items-center justify-center text-white text-2xl leading-none border-none cursor-pointer" onClick={() => setActiveImg(p => Math.max(0, p - 1))}>‹</button>
            <button className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 rounded-full flex items-center justify-center text-white text-2xl leading-none border-none cursor-pointer" onClick={() => setActiveImg(p => Math.min(ALL_IMAGES.length - 1, p + 1))}>›</button>
            <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">{activeImg + 1}/{ALL_IMAGES.length}</div>
          </div>

          {/* Mobile thumb strip */}
          <div className="bg-white px-4 py-2">
            <p className="text-xs text-gray-500 text-center mb-1.5">{ALL_IMAGES[activeImg]?.alt}</p>
            <div className="flex gap-1 overflow-hidden">
              {THUMBS.slice(0, 10).map((src, i) => (
                <div
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`flex-shrink-0 overflow-hidden rounded cursor-pointer border-2 transition-colors ${activeImg === i ? "border-orange-500" : "border-transparent"}`}
                  style={{width: 73, height: 55}}
                >
                  <img src={src} alt="" className="w-full h-full object-cover" loading="lazy"/>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile address + mini map */}
          <div className="bg-white px-4 pb-3">
            <div className="h-px bg-gray-100 mb-2.5"/>
            <div className="flex items-center gap-1 mb-2">
              <span className="text-orange-500">📍</span>
              <span className="text-[13px] text-gray-500">Bãi Trường, Dương Tơ, Phú Quốc, Tỉnh Kiên Giang</span>
            </div>
            <div className="h-[100px]">
              <iframe width="100%" height="100%" frameBorder="0" scrolling="no"
                src="https://maps.google.com/maps?q=10.11295818,103.98370721&hl=vi&z=14&ie=UTF8&iwloc=&output=embed"/>
            </div>
          </div>
        </div>

      </div>

      {/* ══════════ MOBILE: room select bar ══════════ */}
      <div className="lg:hidden bg-white border-b border-gray-100">
        <div className="grid grid-cols-4">
          {[
            {label: "Nhận phòng", value: "25-02-2026"},
            {label: "Trả phòng", value: "26-02-2026"},
            {label: "Khách", value: "2"},
            {label: "Phòng", value: "1"},
          ].map((f, i) => (
            <button key={f.label} className={`flex flex-col items-center py-2 px-1 bg-transparent border-none cursor-pointer ${i < 3 ? "border-r border-gray-100" : ""}`}>
              <span className="text-[10px] text-gray-400">{f.label}</span>
              <span className="text-[13px] font-bold text-gray-800 mt-0.5">{f.value}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ══════════ COMBO SECTION ══════════ */}
      <div className="bg-white mt-2">
        <div className="max-w-[1200px] mx-auto px-4 py-5 flex flex-col lg:flex-row gap-8">

          {/* LEFT: combo details */}
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-extrabold text-gray-900 mb-3">Combo 3N2Đ Vé máy bay + Đón tiễn + Bữa sáng</h2>
            <div className="flex flex-col gap-2">
              <span className="text-[13px] font-semibold text-gray-500">Combo bao gồm</span>
              <div className="flex flex-col gap-0.5">
                {[
                  "Vé máy bay khứ hồi",
                  "Đưa đón sân bay theo lịch trình khách hàng",
                  "02 đêm nghỉ dưỡng tại hạng phòng Classic King Room với không gian sang trọng và tiện nghi",
                  "Ăn sáng tự chọn tiêu chuẩn quốc tế",
                  "Miễn phí tiền phòng cho 02 trẻ em dưới 12 tuổi",
                  "Dịch vụ chỉnh trang phòng vào buổi tối",
                  `Trải nghiệm chương trình "Planet Trekkers" độc đáo của tập đoàn InterContinental cho trẻ em`,
                  "Bãi biển riêng và hồ bơi vô cực ngắm hoàng hôn đẹp nhất Phú Quốc",
                  "Rạp chiếu phim nội khu",
                  "Phòng giải trí được trang bị máy tính điện tử, bàn đá banh và nhiều trò chơi thú vị khác",
                ].map((item, i) => (
                  <p key={i} className="text-[13px] text-gray-600 leading-relaxed">-&nbsp;{item}</p>
                ))}
              </div>
              <div className="flex flex-col gap-0.5 mt-1">
                <span className="text-[13px] font-semibold text-gray-500">Điều kiện áp dụng</span>
                {[
                  "Đặt tối thiểu 2 khách/phòng",
                  "Áp dụng cho khách quốc tịch Việt Nam",
                  "Hạn lưu trú đến 28.02.2026. Cuối tuần và các ngày cao điểm, Lễ Tết có phụ thu",
                  "* Đặt trước 30 ngày để có giá tốt hơn",
                ].map((item, i) => (
                  <p key={i} className="text-[13px] text-gray-500 leading-relaxed">{item}</p>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: booking box */}
          <div className="w-full lg:w-[280px] flex-shrink-0">
            <div className="border border-gray-200 rounded-xl overflow-hidden">

              {/* Prices */}
              <div className="p-4 flex flex-col gap-3">
                {/* HCM */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] text-gray-400">Khởi hành từ</span>
                    <span className="text-[13px] font-bold text-gray-800">Hồ Chí Minh</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="text-orange-500 text-sm">📅</span>
                      <span className="text-xs text-gray-500">11/01 → 28/02</span>
                    </div>
                    <span className="text-sm font-black text-orange-500">7.699.000</span>
                  </div>
                </div>

                <div className="h-px bg-gray-100 -mx-4"/>

                {/* HN */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] text-gray-400">Khởi hành từ</span>
                    <span className="text-[13px] font-bold text-gray-800">Hà Nội</span>
                  </div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1">
                      <span className="text-orange-500 text-sm">📅</span>
                      <span className="text-xs text-gray-500">05/01 → 28/02</span>
                    </div>
                    <span className="text-sm font-black text-orange-500">9.799.000</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs">⚡</span>
                    <span className="text-[11px] text-orange-500 font-medium">Giảm -268k nếu khởi hành vào ngày 25/02</span>
                  </div>
                  <button className="text-[11px] text-orange-500 underline mt-1 block bg-transparent border-none cursor-pointer p-0">Xem lịch khởi hành</button>
                </div>
              </div>

              {/* CTA */}
              <div className="border-t border-gray-100 bg-gray-50 p-4 flex flex-col gap-1">
                <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg text-sm transition-colors border-none cursor-pointer">
                  Yêu cầu đặt
                </button>
                <p className="text-center text-xs text-gray-400 mt-1.5">Cần hỗ trợ? Gọi ngay tổng đài</p>
                <a href="tel:19001870" className="flex items-center justify-center gap-1.5 no-underline mt-0.5">
                  <span className="text-sm">📞</span>
                  <span className="font-bold text-orange-500 text-sm">1900 1870</span>
                </a>
                <div className="flex items-center justify-center gap-1.5 mt-0.5">
                  <span className="text-xs">🔸</span>
                  <span className="text-xs text-gray-500">Nhận đến 63 điểm khi đặt combo</span>
                </div>
              </div>
            </div>
            <span className="text-[11px] text-gray-400 block text-right mt-1">*Giá combo cho 1 khách</span>
          </div>

        </div>
      </div>

      {/* ══════════ SEARCH BOX (Desktop) ══════════ */}
      <div className="bg-white mt-2 hidden lg:block">
        <div className="max-w-[1200px] mx-auto px-4 py-3">
          <div className="flex items-stretch border border-gray-200 rounded-xl overflow-hidden">

            {/* Hotel name */}
            <div className="flex-[2] flex items-center gap-2 px-3 py-2.5 border-r border-gray-100">
              <span className="text-gray-300 flex-shrink-0 text-sm">🔍</span>
              <span className="text-[13px] font-semibold text-gray-700 line-clamp-2">Khu nghỉ dưỡng InterContinental Phu Quoc Long Beach</span>
            </div>

            {/* Date select */}
            <div className="flex-[3] flex border-r border-gray-100">
              <button className="flex-1 flex items-center gap-2 px-3 py-2.5 bg-transparent border-none cursor-pointer">
                <span className="text-orange-500 flex-shrink-0 text-sm">📅</span>
                <div className="text-left">
                  <span className="text-[10px] text-orange-500 font-semibold block">Thứ tư</span>
                  <span className="text-sm font-bold text-gray-800">25-02-2026</span>
                </div>
              </button>
              <div className="flex items-center justify-center px-2">
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-xs font-bold text-gray-400">1</span>
                  <span className="text-gray-300 text-xs">🌙</span>
                </div>
              </div>
              <button className="flex-1 flex items-center gap-2 px-3 py-2.5 bg-transparent border-none cursor-pointer">
                <span className="text-orange-500 flex-shrink-0 text-sm">📅</span>
                <div className="text-left">
                  <span className="text-[10px] text-orange-500 font-semibold block">Thứ năm</span>
                  <span className="text-sm font-bold text-gray-800">26-02-2026</span>
                </div>
              </button>
            </div>

            {/* Room / guest */}
            <div className="flex-1 flex items-center gap-2 px-3 py-2.5 border-r border-gray-100 cursor-pointer">
              <span className="text-gray-300 flex-shrink-0 text-sm">👤</span>
              <div>
                <span className="text-sm font-bold text-gray-800 block">1 Phòng</span>
                <span className="text-[11px] text-gray-400">2 người lớn, 0 trẻ em</span>
              </div>
            </div>

            {/* Submit */}
            <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm px-5 border-none cursor-pointer transition-colors whitespace-nowrap">
              Cập nhật
            </button>

          </div>
        </div>
      </div>

      {/* ══════════ HOTEL UTILITIES ══════════ */}
      <div className="bg-white mt-2">
        <div className="max-w-[1200px] mx-auto px-4">

          {/* Thông tin khách sạn */}
          <div className="py-5 border-b border-gray-100" id="hd-info">
            <div className="flex items-center gap-2.5 mb-3.5">
              <span className="text-[18px]">🏨</span>
              <span className="text-base font-extrabold text-gray-900">Thông tin khách sạn</span>
            </div>
            <div className="space-y-2">
              <p className="text-[13px] text-gray-600 leading-relaxed">
                <strong className="text-gray-800">Khu nghỉ dưỡng Intercontinental Long Beach Phú Quốc</strong>&nbsp;tọa lạc tại bãi Trường, Dương Tơ huyện Phú Quốc.&nbsp;Với&nbsp;459 phòng được thiết kế sang trọng, độc đáo của văn hóa Việt Nam; pha trộn phong cách truyền thống và hiện đại, tạo sự mới lạ nhưng vẫn mang lại cảm giác thân thuộc cho du khách khi lưu trú nghỉ dưỡng tại đây.
              </p>
              <p className="text-[13px] text-gray-600 leading-relaxed">
                Khi đến với&nbsp;<strong className="text-gray-800">Intercontinental Long Beach Phú Quốc</strong>, quý khách có thể dùng hải sản trên bãi biển xinh đẹp, vừa thưởng thức cocktail&nbsp;vừa ngắm cảnh hoàng hôn, thư giãn với liệu pháp trị liệu tại HARNN Heritage Spa hoặc thưởng ngoạn cảnh hoàng hôn tuyệt đẹp tại sky bar cao nhất đảo ngọc.
              </p>
            </div>
          </div>

          {/* Quy định của chỗ nghỉ */}
          <div className="py-5">
            <div className="flex items-center gap-2.5 mb-3.5">
              <span className="text-[18px]">📋</span>
              <span className="text-base font-extrabold text-gray-900">Quy định của chỗ nghỉ</span>
            </div>
            <div className="flex flex-col">

              {/* Check-in / out times */}
              {[
                {label: "Thời gian nhận phòng:", value: "Từ 15:00"},
                {label: "Thời gian trả phòng:", value: "Trước 12:00"},
              ].map(item => (
                <div key={item.label} className="flex items-center gap-6 py-3 border-b border-gray-50">
                  <div className="flex items-center gap-2 min-w-[200px]">
                    <span className="text-gray-400 text-sm">🕐</span>
                    <span className="text-[13px] text-gray-500">{item.label}</span>
                  </div>
                  <span className="text-[13px] font-bold text-gray-800">{item.value}</span>
                </div>
              ))}

              <div className="hidden lg:block h-px bg-gray-50 my-0"/>

              {/* Policy rows */}
              {POLICIES.map((p, i) => (
                <div key={i} className={`flex flex-col lg:flex-row gap-2 lg:gap-6 py-3 ${i < POLICIES.length - 1 ? "border-b border-gray-50" : ""}`}>
                  <div className="flex items-start gap-2 lg:min-w-[200px] lg:flex-shrink-0">
                    <span className="text-gray-400 font-bold text-sm mt-0.5">✓</span>
                    <span className="text-[13px] text-gray-500">{p.label}</span>
                  </div>
                  <div
                    className="flex-1 text-[13px] text-gray-600 leading-relaxed"
                    dangerouslySetInnerHTML={{__html: p.html}}
                  />
                </div>
              ))}

            </div>
          </div>

        </div>
      </div>

      {/* Mobile spacer */}
      <div className="lg:hidden h-16"/>

    </div>
  );
}