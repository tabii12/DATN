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

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await fetch('https://db-datn-six.vercel.app/api/blogs/');
        const data = await response.json();
        setBlogs(data);
      } catch (error) {
        console.error('Error fetching blogs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <h1 className="text-4xl font-bold text-center mb-12 text-gray-800">Blog Du Lịch</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogs.map((blog) => (
          <div key={blog._id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
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
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-3 text-gray-800 line-clamp-2">{blog.title}</h2>
              <p className="text-gray-600 mb-4 line-clamp-3">{blog.excerpt || blog.content.substring(0, 150) + '...'}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {new Date(blog.createdAt).toLocaleDateString('vi-VN')}
                </span>
                <a
                  href={`/blogs/${blog.slug}`}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  Đọc thêm
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}