"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface Blog {
  _id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  images: { image_url: string }[];
  createdAt: string;
}

const SECTIONS = [
  {
    id: "tat-ca",
    icon: "📰",
    label: "Tất cả tin tức",
    sub: null,
  },
  {
    id: "tin-moi",
    icon: "🔥",
    label: "Tin tức mới nhất",
    sub: null,
  },
  {
    id: "khuyen-mai",
    icon: "💰",
    label: "Khuyến mãi",
    sub: null,
  },
  {
    id: "huong-dan",
    icon: "📖",
    label: "Hướng dẫn",
    sub: null,
  },
];

export default function NewsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState("tat-ca");

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await fetch('https://db-datn-six.vercel.app/api/blogs/');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const blogsArray = Array.isArray(data) ? data : data.blogs || data.data || [];
        setBlogs(blogsArray);
      } catch (error) {
        console.error('Error fetching blogs:', error);
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  function getFilteredBlogs() {
    if (activeId === "tat-ca") return blogs;
    // For now, all sections show all blogs since API doesn't have categories
    // You can extend this based on blog content or add category field to API
    return blogs;
  }

  function getContent() {
    const filteredBlogs = getFilteredBlogs();

    if (loading) {
      return (
        <div className="text-center text-gray-400 py-20">
          <p className="text-4xl mb-3">⏳</p>
          <p>Đang tải tin tức...</p>
        </div>
      );
    }

    if (filteredBlogs.length === 0) {
      return (
        <div className="text-center text-gray-400 py-20">
          <p className="text-4xl mb-3">📭</p>
          <p>Không có tin tức nào</p>
        </div>
      );
    }

    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">{SECTIONS.find(s => s.id === activeId)?.icon}</span>
          <h2 className="text-2xl font-bold text-gray-900">{SECTIONS.find(s => s.id === activeId)?.label}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlogs.map((blog) => (
            <div key={blog._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              {blog.images && blog.images.length > 0 && (
                <div className="relative h-48">
                  <Image
                    src={blog.images[0].image_url}
                    alt={blog.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2 text-gray-800 overflow-hidden text-ellipsis whitespace-nowrap">{blog.title}</h3>
                <p className="text-sm text-gray-600 mb-3 overflow-hidden text-ellipsis" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                  {blog.excerpt || blog.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...'}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    {new Date(blog.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                  <a
                    href={`/news/${blog.slug}`}
                    className="text-orange-500 hover:text-orange-600 text-sm font-medium"
                  >
                    Đọc thêm →
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 pt-4">
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
          <a href="/" className="hover:text-orange-500 no-underline">Trang chủ</a>
          <span>/</span>
          <span className="text-gray-600 font-medium">Tin tức</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 flex gap-6 items-start">
        {/* SIDEBAR */}
        <aside className="w-[240px] flex-shrink-0 sticky top-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Danh mục</p>
            </div>
            <nav className="py-2">
              {SECTIONS.map(section => (
                <button
                  key={section.id}
                  onClick={() => setActiveId(section.id)}
                  className={"w-full flex items-center gap-2.5 px-4 py-2.5 text-left border-none cursor-pointer transition-colors " + (activeId === section.id ? "bg-orange-50 text-orange-600" : "text-gray-700 hover:bg-gray-50 bg-transparent")}
                >
                  <span className="text-base">{section.icon}</span>
                  <span className={"text-sm " + (activeId === section.id ? "font-bold" : "font-medium")}>{section.label}</span>
                </button>
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