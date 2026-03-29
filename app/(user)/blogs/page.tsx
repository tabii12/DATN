"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { JSX } from "react";
import Image from "next/image";

interface BlogItem {
  _id: string;
  slug: string;
  title: string;
  excerpt?: string;
  content?: string;
  images?: { image_url: string }[];
  createdAt?: string;
}

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadBlogs() {
      setLoading(true);
      try {
        const response = await fetch('https://db-datn-six.vercel.app/api/blogs/');
        const data = await response.json();

        console.log("API DATA:", data);

        // ✅ đảm bảo luôn là array
        setBlogs(Array.isArray(data) ? data : data.data || []);

      } catch (error) {
        console.error('Error fetching blogs:', error);
      } finally {
        setLoading(false);
      }
    }
    loadBlogs();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Đang tải...</div>
      </div>
    );
  }

  return (
    <>
      {/* Hero Banner */}
        <div className="container mx-auto px-4">
         
        </div>
    

      <div className="container mx-auto px-4 pb-12">
        {/* Featured Article */}
        {blogs.length > 0 && (
          <div className="mb-16">
            <div className="relative overflow-hidden rounded-2xl shadow-2xl group cursor-pointer">
              {blogs[0].images && blogs[0].images.length > 0 && (
                <div className="relative h-96 w-full overflow-hidden">
                  <Image
                    src={blogs[0].images[0].image_url}
                    alt={blogs[0].title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                <div className="inline-block bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-semibold mb-4">
                  ⭐ Bài viết nổi bật
                </div>
                <h2 className="text-4xl font-bold mb-3 line-clamp-2">
                  {blogs[0].title}
                </h2>
                <p className="text-gray-100 mb-4 line-clamp-2">
                  {blogs[0].excerpt
                    ? blogs[0].excerpt
                    : blogs[0].content?.substring(0, 120) + '...'}
                </p>
                <div className="space-y-2 mb-4 text-sm text-gray-200 border-t border-white/20 pt-4">
                  <p className="leading-relaxed">
                    <strong>Khám phá những kinh nghiệm du lịch tuyệt vời</strong>
                  </p>
                  <p className="leading-relaxed">
                    Chia sẻ tips, địa điểm hot và những câu chuyện thú vị từ khắp nơi
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-200 flex items-center gap-2">
                    📅{' '}
                    {blogs[0].createdAt
                      ? new Date(blogs[0].createdAt).toLocaleDateString('vi-VN')
                      : ''}
                  </span>
                  <a
                    href={`/blogs/${blogs[0].slug}`}
                    className="bg-white text-orange-600 hover:bg-orange-50 px-6 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Đọc tiếp →
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Articles Grid */}
        <div>
          <h3 className="text-3xl font-bold mb-8 text-gray-800 flex items-center gap-3">
            <span>📰</span> Những bài viết khác
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.slice(1).map((blog, index) => (
              <a
                key={blog._id}
                href={`/blogs/${blog.slug}`}
                className="group overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white flex flex-col h-full"
              >
                {/* Image Container */}
                {blog.images && blog.images.length > 0 && (
                  <div className="relative h-56 w-full overflow-hidden bg-gray-100">
                    <Image
                      src={blog.images[0].image_url}
                      alt={blog.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      unoptimized
                    />
                    <div className="absolute top-3 right-3 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      #{index + 2}
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="p-6 flex flex-col flex-grow">
                  <h2 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2 group-hover:text-orange-600 transition-colors">
                    {blog.title}
                  </h2>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">
                    {blog.excerpt
                      ? blog.excerpt
                      : blog.content?.substring(0, 150) + '...'}
                  </p>

                  {/* Footer */}
                  <div className="border-t border-gray-100 pt-4 mt-auto">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>📅</span>
                        {blog.createdAt
                          ? new Date(blog.createdAt).toLocaleDateString('vi-VN')
                          : 'Không xác định'}
                      </div>
                      <span className="text-orange-500 font-semibold group-hover:translate-x-1 transition-transform">
                        →
                      </span>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Empty State */}
        {blogs.length === 0 && (
          <div className="text-center py-16">
            <p className="text-2xl text-gray-400">📭 Chưa có bài viết nào</p>
          </div>
        )}
      </div>
    </>
  );
}

// ✅ Components cho CONTENT
function LatestNewsSection() {
  const [activeTab, setActiveTab] = useState<"about" | "news">("about");

  return (
    <div>
      {/* Tab Navigation */}
      <div className="flex gap-3 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("about")}
          className={`px-4 py-3 font-semibold transition-colors ${
            activeTab === "about"
              ? "text-orange-500 border-b-2 border-orange-500"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <span className="mr-2">🏢</span>Về chúng tôi
        </button>
        <button
          onClick={() => setActiveTab("news")}
          className={`px-4 py-3 font-semibold transition-colors ${
            activeTab === "news"
              ? "text-orange-500 border-b-2 border-orange-500"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <span className="mr-2">📰</span>Tin mới nhất
        </button>
      </div>

      {/* Content */}
      {activeTab === "about" ? (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">🏢</span>
            <h2 className="text-2xl font-bold text-gray-900">Về chúng tôi</h2>
          </div>
          <div className="space-y-4 text-[15px] text-gray-700 leading-relaxed">
            <p>
              <strong>Công ty TNHH Du lịch Pick Your Way</strong> được thành lập
              năm 2015, trụ sở tại TP. Hồ Chí Minh, chuyên cung cấp dịch vụ
              tour du lịch nội địa cao cấp trên toàn Việt Nam.
            </p>
            <div className="space-y-2 text-sm">
              {[
                ["Tên công ty", "Công ty TNHH Du lịch Pick Your Way"],
                ["Mã số thuế", "0312 345 678"],
                ["Địa chỉ", "123 Nguyễn Huệ, Quận 1, TP. HCM"],
                ["Giấy phép LHQT", "01-1234/2015/TCDL-GP LHQT"],
              ].map(([label, value]) => (
                <div
                  key={label as string}
                  className="flex gap-4 border-b border-gray-100 pb-2 last:border-0"
                >
                  <span className="w-36 text-gray-400 flex-shrink-0">
                    {label}
                  </span>
                  <span className="text-gray-700 font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">📰</span>
            <h2 className="text-2xl font-bold text-gray-900">Tin mới nhất</h2>
          </div>
          <div className="space-y-4 text-[15px] text-gray-700 leading-relaxed">
            <p>
              Cập nhật những tin tức mới nhất về du lịch, các địa điểm hot nhất,
              tips du lịch hay và những khuyến mãi đặc biệt cho khách hàng.
            </p>
            <div className="space-y-3 mt-4">
              {[
                ["🌟", "Loạt điểm đến mới tại Việt Nam năm 2026"],
                ["✈️", "Ưu đãi đặc biệt cho tour hè này"],
                ["🎉", "Chương trình khách hàng thân thiết"],
                ["🏆", "Tour du lịch được đánh giá tốt nhất tháng 3"],
              ].map(([icon, title], idx) => (
                <div
                  key={idx}
                  className="p-3 bg-gradient-to-r from-orange-50 to-transparent rounded-lg border border-orange-100 hover:bg-orange-50 transition-colors cursor-pointer"
                >
                  <p className="font-medium text-gray-800">
                    <span className="mr-2">{icon}</span>
                    {title}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BlogSection() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">📝</span>
        <h2 className="text-2xl font-bold text-gray-900">Blog Du Lịch</h2>
      </div>
      <div className="space-y-4 text-gray-700">
        <p>Các bài blog du lịch hay nhất đang được cập nhật...</p>
      </div>
    </div>
  );
}

// ✅ Sections configuration
const SECTIONS: Array<{
  id: string;
  label: string;
  icon: string;
  sub?: boolean;
}> = [
  { id: "ve-chung-toi", label: "Về chúng tôi", icon: "🏢", sub: false },
  { id: "tin-moi-nhat", label: "Tin mới nhất", icon: "📰", sub: false },
];

const CONTENT: Record<string, JSX.Element> = {
  "ve-chung-toi": (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">🏢</span>
        <h2 className="text-2xl font-bold text-gray-900">Về chúng tôi</h2>
      </div>
      <div className="space-y-4 text-[15px] text-gray-700 leading-relaxed">
        <p>
          <strong>Công ty TNHH Du lịch Pick Your Way</strong> được thành lập năm
          2015, trụ sở tại TP. Hồ Chí Minh, chuyên cung cấp dịch vụ tour du lịch
          nội địa cao cấp trên toàn Việt Nam.
        </p>
        <div className="space-y-2 text-sm">
          {[
            ["Tên công ty", "Công ty TNHH Du lịch Pick Your Way"],
            ["Mã số thuế", "0312 345 678"],
            ["Địa chỉ", "123 Nguyễn Huệ, Quận 1, TP. HCM"],
            ["Giấy phép LHQT", "01-1234/2015/TCDL-GP LHQT"],
          ].map(([label, value]) => (
            <div
              key={label as string}
              className="flex gap-4 border-b border-gray-100 pb-2 last:border-0"
            >
              <span className="w-36 text-gray-400 flex-shrink-0">{label}</span>
              <span className="text-gray-700 font-medium">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
  "tin-moi-nhat": (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">📰</span>
        <h2 className="text-2xl font-bold text-gray-900">Tin mới nhất</h2>
      </div>
      <div className="space-y-4 text-[15px] text-gray-700 leading-relaxed">
        <p>
          Cập nhật những tin tức mới nhất về du lịch, các địa điểm hot nhất,
          tips du lịch hay và những khuyến mãi đặc biệt cho khách hàng.
        </p>
        <div className="space-y-3 mt-4">
          {[
            ["🌟", "Loạt điểm đến mới tại Việt Nam năm 2026"],
            ["✈️", "Ưu đãi đặc biệt cho tour hè này"],
            ["🎉", "Chương trình khách hàng thân thiết"],
            ["🏆", "Tour du lịch được đánh giá tốt nhất tháng 3"],
          ].map(([icon, title], idx) => (
            <div
              key={idx}
              className="p-3 bg-gradient-to-r from-orange-50 to-transparent rounded-lg border border-orange-100 hover:bg-orange-50 transition-colors cursor-pointer"
            >
              <p className="font-medium text-gray-800">
                <span className="mr-2">{icon}</span>
                {title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
};

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden bg-white">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left bg-transparent border-none cursor-pointer"
      >
        <span className="text-sm font-semibold text-gray-800">{q}</span>
        <span
          className={
            "text-gray-400 text-lg transition-transform duration-200 " +
            (open ? "rotate-90" : "")
          }
        >
          ›
        </span>
      </button>
      {open && (
        <div className="px-4 pb-4 text-sm text-gray-500 leading-relaxed border-t border-gray-50 pt-3">
          {a}
        </div>
      )}
    </div>
  );
}

function TourInfoContent() {
  const searchParams = useSearchParams();
  const [activeId, setActiveId] = useState("gioi-thieu");
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    "chinh-sach": true,
    "huong-dan": true,
    "ho-tro": true,
  });

  function toggleGroup(id: string) {
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function getContent() {
    return (
      CONTENT[activeId] ?? (
        <div className="text-center text-gray-400 py-20">
          <p className="text-4xl mb-3">🚧</p>
          <p>Nội dung đang được cập nhật...</p>
        </div>
      )
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Breadcrumb */}
      <div className="max-w-[1280] mx-auto px-4 pt-4">
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
          <a href="/" className="hover:text-orange-500 no-underline">
            Trang chủ
          </a>
          <span>/</span>
          <span className="text-gray-600 font-medium">Thông tin & Hỗ trợ</span>
        </div>
      </div>

      <div className="max-w-[1280] mx-auto px-4 py-8 flex gap-6 items-start">
        {/* SIDEBAR */}
        <aside className="w-[240px] flex-shrink-0 sticky top-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Danh mục
              </p>
            </div>
            <nav className="py-2">
              {SECTIONS.map((section) => (
                <div key={section.id}>
                  {section.sub ? (
                    <>
                      <button
                        onClick={() => toggleGroup(section.id)}
                        className={
                          "w-full flex items-center justify-between px-4 py-2.5 text-left bg-transparent border-none cursor-pointer transition-colors " +
                          (openGroups[section.id]
                            ? "text-orange-500"
                            : "text-gray-700 hover:bg-gray-50")
                        }
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-base">{section.icon}</span>
                          <span className="text-sm font-semibold">
                            {section.label}
                          </span>
                        </div>
                        <span
                          className={
                            "text-xs text-gray-400 transition-transform duration-200 " +
                            (openGroups[section.id] ? "rotate-90" : "")
                          }
                        >
                          ›
                        </span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setActiveId(section.id)}
                      className={
                        "w-full flex items-center gap-2.5 px-4 py-2.5 text-left border-none cursor-pointer transition-colors " +
                        (activeId === section.id
                          ? "bg-orange-50 text-orange-600"
                          : "text-gray-700 hover:bg-gray-50 bg-transparent")
                      }
                    >
                      <span className="text-base">{section.icon}</span>
                      <span
                        className={
                          "text-sm " +
                          (activeId === section.id
                            ? "font-bold"
                            : "font-medium")
                        }
                      >
                        {section.label}
                      </span>
                    </button>
                  )}
                </div>
              ))}
            </nav>

            {/* Hotline */}
            <div className="mx-3 mb-3 bg-orange-500 rounded-xl p-3 text-white text-center">
              <p className="text-[11px] opacity-80">Cần hỗ trợ ngay?</p>
              <a
                href="tel:19001870"
                className="text-base font-black no-underline text-white"
              >
                📞 1900 1870
              </a>
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