"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import Head from "next/head";

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
  const [relatedBlogs, setRelatedBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 👉 Fetch blog detail
  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await fetch(
          `https://db-pickyourway.vercel.app/api/blogs/${slug}`
        );
        if (!response.ok) throw new Error("Fetch failed");

        const data = await response.json();
        const blogData = data.blog || data.data || data;

        setBlog(blogData);
      } catch (error) {
        console.error(error);
        setError("Không thể tải blog. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchBlog();
  }, [slug]);

  // 👉 Fetch related blogs
  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const res = await fetch(
          `https://db-pickyourway.vercel.app/api/blogs`
        );
        const data = await res.json();
        const list = data.data || data;

        const filtered = list
          .filter((item: Blog) => item.slug !== slug)
          .slice(0, 3);

        setRelatedBlogs(filtered);
      } catch (err) {
        console.error("Error related blogs:", err);
      }
    };

    if (slug) fetchRelated();
  }, [slug]);

  // 👉 Loading
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-10 h-10 border-4 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow text-center">
          <p className="text-3xl mb-3">❌</p>
          <p>{error || "Blog không tồn tại"}</p>
          <a href="/blogs" className="text-orange-500 mt-4 inline-block">
            ← Quay lại
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{blog.title}</title>
        <meta name="description" content={blog.excerpt} />
      </Head>

      <div className="min-h-screen font-sans bg-gray-50">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 pt-4">
          <div className="text-sm text-gray-400">
            <a href="/">Trang chủ</a> /{" "}
            <a href="/blogs">Tin tức</a> /{" "}
            <span className="text-gray-600">{blog.title}</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <article className="bg-white rounded-xl shadow overflow-hidden">

            {/* Header */}
            <div className="p-8">
              <h1 className="text-3xl font-bold mb-4">
                {blog.title}
              </h1>
              <p className="text-sm text-gray-500">
                📅 {new Date(blog.createdAt).toLocaleDateString("vi-VN")}
              </p>
            </div>

            {/* Image */}
            {blog.images?.[0] && (
              <div className="px-8">
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

            {/* ✅ CONTENT FIX CHUẨN */}
            <div className="px-8 py-8 text-gray-700">
              <div
                className="prose max-w-none prose-lg leading-7 whitespace-pre-line"
                dangerouslySetInnerHTML={{
                  __html: blog.content.replace(/\n/g, "<br/>"),
                }}
              />
            </div>

            {/* Footer */}
            <div className="p-6 border-t">
              <a
                href="/blogs"
                className="bg-orange-500 text-white px-4 py-2 rounded"
              >
                ← Quay lại
              </a>
            </div>
          </article>
        </div>

        {/* Related Blogs */}
        {relatedBlogs.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 pb-12">
            <h2 className="text-2xl font-bold mb-6">
              Bài viết liên quan
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              {relatedBlogs.map((item) => (
                <a
                  key={item._id}
                  href={`/blogs/${item.slug}`}
                  className="bg-white rounded-xl shadow hover:shadow-lg transition"
                >
                  {item.images?.[0] && (
                    <div className="relative h-48">
                      <Image
                        src={item.images[0].image_url}
                        alt={item.title}
                        fill
                        className="object-cover rounded-t-xl"
                        unoptimized
                      />
                    </div>
                  )}

                  <div className="p-4">
                    <h3 className="font-semibold line-clamp-2">
                      {item.title}
                    </h3>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}