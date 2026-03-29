"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';

interface Blog {
  _id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  images: { image_url: string }[];
  createdAt: string;
}

export default function BlogDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        // Assuming API has /api/blogs/{slug} endpoint
        const response = await fetch(`https://db-datn-six.vercel.app/api/blogs/${slug}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const blogData = data.blog || data.data || data;
        setBlog(blogData);
      } catch (error) {
        console.error('Error fetching blog:', error);
        setError('Không thể tải blog. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchBlog();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-8"></div>
              <div className="h-64 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-sans">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <p className="text-4xl mb-3">❌</p>
            <p className="text-gray-600">{error || 'Blog không tồn tại'}</p>
            <a href="/blogs" className="text-orange-500 hover:text-orange-600 mt-4 inline-block">
              ← Quay lại 
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 pt-4">
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
          <a href="/" className="hover:text-blue-500 no-underline">Trang chủ</a>
          <span>/</span>
          <a href="/blogs" className="hover:text-blue-500 no-underline">Tin tức</a>
          <span>/</span>
          <span className="text-gray-600 font-medium">{blog.title}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <article className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <header className="p-8 pb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
              {blog.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>📅 {new Date(blog.createdAt).toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>
          </header>

          {/* Featured Image */}
          {blog.images && blog.images.length > 0 && (
            <div className="px-8 pb-6">
              <div className="relative h-96 rounded-lg overflow-hidden">
                <Image
                  src={blog.images[0].image_url}
                  alt={blog.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            </div>
          )}

          {/* Content */}
          <div className="px-8 pb-8">
            <div
              className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          </div>

          {/* Footer */}
          <footer className="px-8 py-6 bg-gray-50 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <a
                href="/blogs"
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                ← Quay lại 
              </a>
              <div className="flex gap-2">
                {/* Share buttons can be added here */}
              </div>
            </div>
          </footer>
        </article>
      </div>
    </div>
  );
}