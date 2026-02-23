export default function HeroBanner() {
  return (
    <section className="relative w-full max-h-[590px] overflow-hidden">
      {/* BACKGROUND IMAGE */}
      <img
        src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e"
        alt="Banner"
        className="w-full h-[590px] object-cover"
      />

      {/* OVERLAY */}
      <div className="absolute inset-0 bg-black/30" />

      {/* CONTENT */}
      <div className="absolute inset-0 flex items-center">
        <div className="max-w-7xl mx-auto px-6 text-white">
          <h1 className="text-3xl md:text-4xl font-bold leading-tight">
            Trải nghiệm kì nghỉ tuyệt vời
          </h1>

          <p className="mt-2 text-lg md:text-xl">
            Combo khách sạn - vé máy bay - đưa đón sân bay giá tốt nhất
          </p>

          <div className="mt-6 max-w-md bg-white/10 backdrop-blur rounded-xl p-4">
            <p className="text-sm uppercase tracking-wide text-gray-200">
              Combo 2N1Đ
            </p>

            <h3 className="mt-1 text-xl font-semibold">
              ANANTARA QUY NHƠN
            </h3>

            <p className="text-sm text-gray-200 mt-1">
              Beachfront Pool Villa · Ăn sáng
            </p>

            <p className="text-sm text-gray-200 mt-1">
              Happy Hour · Ưu đãi đặc biệt
            </p>

            <p className="mt-3 text-orange-400 font-bold text-2xl">
              15.699.000đ <span className="text-sm text-gray-200">/ khách</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
