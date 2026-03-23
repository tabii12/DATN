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
    id: "ve-chung-toi",
    icon: "🏢",
    label: "Về chúng tôi",
    sub: null,
  },
  {
    id: "tin-moi-nhat",
    icon: "📝",
    label: "Tin mới nhất",
    sub: null,
  },
];

function LatestNewsSection() {
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadBlogs() {
      setLoading(true);
      try {
        const res = await fetch("https://db-datn-six.vercel.app/api/blogs/");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const items = Array.isArray(data)
          ? data
          : data.data || data.blogs || [];
        // Sort by createdAt descending to get latest
        const sortedBlogs = items.sort(
          (a: BlogItem, b: BlogItem) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime(),
        );
        setBlogs(sortedBlogs);
      } catch (err) {
        setError("Không tải được tin tức. Vui lòng thử lại sau.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadBlogs();
  }, []);

  if (loading) {
    return (
      <div className="text-center text-gray-500 py-10">Đang tải tin tức...</div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 py-10">{error}</div>;
  }

  if (!blogs.length) {
    return (
      <div className="text-center text-gray-500 py-10">
        Chưa có bài viết nào.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">📝</span>
        <h2 className="text-2xl font-bold text-gray-900">Tin mới nhất</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {blogs.slice(0, 4).map((blog) => (
          <div
            key={blog._id}
            className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
          >
            {blog.images?.[0]?.image_url && (
              <div className="relative h-40 w-full">
                <img
                  src={blog.images[0].image_url}
                  alt={blog.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-4">
              <h3 className="font-bold text-lg text-gray-800 line-clamp-2">
                {blog.title}
              </h3>
              <p className="text-gray-600 text-sm mt-2 line-clamp-3">
                {blog.excerpt ??
                  (blog.content
                    ? `${blog.content.replace(/<[^>]*>/g, "").slice(0, 60)}...`
                    : "")}
              </p>
              <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                <span>
                  {blog.createdAt
                    ? new Date(blog.createdAt).toLocaleDateString("vi-VN")
                    : ""}
                </span>
                <a
                  href={`/blogs/${blog.slug}`}
                  className="text-orange-500 hover:text-orange-600 font-medium"
                >
                  Xem tiếp →
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="text-right">
        <a
          href="/blogs"
          className="text-sm font-semibold text-orange-500 hover:text-orange-600"
        >
          Xem tất cả tin tức
        </a>
      </div>
    </div>
  );
}

function BlogSection() {
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadBlogs() {
      setLoading(true);
      try {
        const res = await fetch("https://db-datn-six.vercel.app/api/blogs/");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const items = Array.isArray(data)
          ? data
          : data.data || data.blogs || [];
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
    return (
      <div className="text-center text-gray-500 py-10">Đang tải blog...</div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 py-10">{error}</div>;
  }

  if (!blogs.length) {
    return (
      <div className="text-center text-gray-500 py-10">
        Chưa có bài viết nào.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">📝</span>
        <h2 className="text-2xl font-bold text-gray-900">Blog du lịch</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {blogs.slice(0, 6).map((blog) => (
          <div
            key={blog._id}
            className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
          >
            {blog.images?.[0]?.image_url && (
              <div className="relative h-40 w-full">
                <img
                  src={blog.images[0].image_url}
                  alt={blog.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-4">
              <h3 className="font-bold text-lg text-gray-800 line-clamp-2">
                {blog.title}
              </h3>
              <p className="text-gray-600 text-sm mt-2 line-clamp-3">
                {blog.excerpt ??
                  (blog.content
                    ? `${blog.content.replace(/<[^>]*>/g, "").slice(0, 120)}...`
                    : "")}
              </p>
              <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                <span>
                  {blog.createdAt
                    ? new Date(blog.createdAt).toLocaleDateString("vi-VN")
                    : ""}
                </span>
                <a
                  href={`/blogs/${blog.slug}`}
                  className="text-orange-500 hover:text-orange-600 font-medium"
                >
                  Xem tiếp →
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="text-right">
        <a
          href="/blogs"
          className="text-sm font-semibold text-orange-500 hover:text-orange-600"
        >
          Xem tất cả tin tức
        </a>
      </div>
    </div>
  );
}

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
  "tin-moi-nhat": <LatestNewsSection />,
  blog: <BlogSection />,
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

export default function TourInfoPage() {
  return (
    <Suspense>
      <TourInfoContent />
    </Suspense>
  );
}
