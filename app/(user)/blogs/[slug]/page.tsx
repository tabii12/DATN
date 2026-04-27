"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";

interface Blog {
  _id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  images: { image_url: string }[];
  createdAt: string;
}

interface RelatedTour {
  _id: string;
  name: string;
  slug: string;
  images: { image_url: string }[];
  start_location?: string;
  trips?: { price: number; status: string; start_date: string }[];
}

const CITIES = [
  "Hà Nội", "Hồ Chí Minh", "TP.HCM", "TP. HCM", "Đà Nẵng", "Hội An", "Huế",
  "Nha Trang", "Đà Lạt", "Phú Quốc", "Hạ Long", "Sapa", "Ninh Bình",
  "Vũng Tàu", "Cần Thơ", "Phan Thiết", "Mũi Né", "Quy Nhơn", "Lagi", "Hồ Tràm",
  "Phú Yên", "Bình Định", "Quảng Nam", "Quảng Ngãi", "Quảng Bình", "Quảng Trị",
  "Hà Tĩnh", "Nghệ An", "Thanh Hóa", "Hải Phòng", "Quảng Ninh", "Lào Cai",
  "Kon Tum", "Gia Lai", "Đắk Lắk", "Đắk Nông", "Điện Biên", "Lai Châu",
];

function removeAccents(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

function extractCity(title: string): string | null {
  const normalized = removeAccents(title).toLowerCase();
  return CITIES.find(c => normalized.includes(removeAccents(c).toLowerCase())) ?? null;
}

export default function BlogDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [blog, setBlog] = useState<Blog | null>(null);
  const [relatedBlogs, setRelatedBlogs] = useState<Blog[]>([]);
  const [relatedTours, setRelatedTours] = useState<RelatedTour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reset khi slug thay đổi
  useEffect(() => {
    setBlog(null);
    setRelatedTours([]);
    setLoading(true);
    setError(null);
  }, [slug]);

  useEffect(() => {
    if (!slug) return;
    const fetchBlog = async () => {
      try {
        const res = await fetch(`https://db-pickyourway.vercel.app/api/blogs/${slug}`);
        if (!res.ok) throw new Error("Fetch failed");
        const data = await res.json();
        setBlog(data.blog || data.data || data);
      } catch (err) {
        console.error(err);
        setError("Không thể tải blog. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [slug]);

  useEffect(() => {
    if (!slug) return;
    const fetchRelatedBlogs = async () => {
      try {
        const res = await fetch("https://db-pickyourway.vercel.app/api/blogs");
        const data = await res.json();
        const list: Blog[] = data.data || data;
        const filtered = list.filter(b => b.slug !== slug);
        setRelatedBlogs(filtered.sort(() => Math.random() - 0.5).slice(0, 3));
      } catch (err) {
        console.error("Error fetching related blogs:", err);
      }
    };
    fetchRelatedBlogs();
  }, [slug]);

  useEffect(() => {
    if (!blog?.title) return;
    const city = extractCity(blog.title);
    if (!city) {
      setRelatedTours([]);
      return;
    }
    const cityNorm = removeAccents(city).toLowerCase();

    const fetchTours = async () => {
      try {
        const res = await fetch("https://db-pickyourway.vercel.app/api/tours");
        const data = await res.json();
        const list: RelatedTour[] = data.data || [];

        const filtered = list.filter(t =>
          removeAccents(t.name ?? "").toLowerCase().includes(cityNorm)
        );

        setRelatedTours(filtered.slice(0, 3));
      } catch (err) {
        console.error("Error fetching related tours:", err);
        setRelatedTours([]);
      }
    };
    fetchTours();
  }, [blog?.title]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-10 h-10 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow text-center">
          <p className="text-3xl mb-3">❌</p>
          <p>{error || "Blog không tồn tại"}</p>
          <a href="/blogs" className="text-orange-500 mt-4 inline-block">← Quay lại</a>
        </div>
      </div>
    );
  }

  const city = extractCity(blog.title);

  return (
    <div className="min-h-screen font-sans bg-gray-50">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 pt-4">
        <div className="text-sm text-gray-400">
          <a href="/">Trang chủ</a> / <a href="/blogs">Tin tức</a> /{" "}
          <span className="text-gray-600">{blog.title}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <article className="bg-white rounded-xl shadow overflow-hidden">
          {/* Header */}
          <div className="p-8">
            <h1 className="text-3xl font-bold mb-4">{blog.title}</h1>
            <p className="text-sm text-gray-500">
              📅 {new Date(blog.createdAt).toLocaleDateString("vi-VN")}
            </p>
          </div>

          {/* Image */}
          {blog.images?.[0] && (
            <div className="px-8">
              <div className="relative h-96 rounded-lg overflow-hidden">
                <Image src={blog.images[0].image_url} alt={blog.title} fill className="object-cover" unoptimized />
              </div>
            </div>
          )}

          {/* Content */}
          <div className="px-8 py-8 text-gray-700">
            <style>{`
              .blog-content p { margin-bottom: 1rem; line-height: 1.75; }
              .blog-content img { width: 400px; height: 260px; object-fit: cover; border-radius: 8px; margin: 12px 0; }
            `}</style>
            <div
              className="blog-content text-base"
              dangerouslySetInnerHTML={{
                __html: blog.content
                  .replace(/\r\n/g, "\n")
                  .replace(/\n{3,}/g, "\n\n")
                  .replace(/<img([^>]*)>/g, '<div style="display:flex;justify-content:center;margin:12px 0"><img$1 style="width:400px;height:260px;object-fit:cover;border-radius:8px"></div>')
                  .split("\n\n")
                  .map(p => p.trim().startsWith("<") ? p : `<p>${p.replace(/\n/g, "<br/>")}</p>`)
                  .join("")
              }}
            />
          </div>

          {/* Footer */}
          <div className="p-6 border-t">
            <a href="/blogs" className="bg-orange-500 text-white px-4 py-2 rounded">← Quay lại</a>
          </div>
        </article>
      </div>

      {/* Tour liên quan - chỉ hiện khi có city VÀ có tour khớp */}
      {city && relatedTours.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 pb-12">
          <h2 className="text-2xl font-bold mb-2">🗺️ Tour liên quan</h2>
          <p className="text-sm text-gray-400 mb-6">Các tour tại <span className="text-orange-500 font-semibold">{city}</span></p>
          <div className="grid md:grid-cols-3 gap-6">
            {relatedTours.map(tour => {
              const openTrips = tour.trips?.filter(t => t.status === "open" && new Date(t.start_date) >= new Date()) ?? [];
              const minPrice = openTrips.length > 0 ? Math.min(...openTrips.map(t => t.price)) : 0;
              const nextTrip = [...openTrips].sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())[0];
              return (
                <a key={tour._id} href={`/tours/${tour.slug}`} className="bg-white rounded-xl shadow hover:shadow-lg transition group overflow-hidden">
                  {tour.images?.[0] && (
                    <div className="relative h-48 overflow-hidden">
                      <Image src={tour.images[0].image_url} alt={tour.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
                    </div>
                  )}
                  <div className="p-4">
                    <p className="text-xs text-orange-500 font-semibold mb-1">📍 {city}</p>
                    <h3 className="font-semibold line-clamp-2 group-hover:text-orange-500 transition-colors mb-2">{tour.name}</h3>
                    {nextTrip && <p className="text-xs text-gray-400 mb-1">🗓 {new Date(nextTrip.start_date).toLocaleDateString("vi-VN")}</p>}
                    {minPrice > 0 && <p className="text-sm font-bold text-orange-500">Từ {minPrice.toLocaleString("vi-VN")}đ<span className="text-xs font-normal text-gray-400">/người</span></p>}
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* Bài viết liên quan */}
      {relatedBlogs.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 pb-8">
          <h2 className="text-2xl font-bold mb-6">📰 Bài viết liên quan</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {relatedBlogs.map(item => (
              <a
                key={item._id}
                href={`/blogs/${item.slug}`}
                className="bg-white rounded-xl shadow hover:shadow-lg transition group overflow-hidden"
              >
                {item.images?.[0] && (
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={item.images[0].image_url}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />
                  </div>
                )}
                <div className="p-4">
                  <p className="text-xs text-gray-400 mb-1">
                    📅 {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                  </p>
                  <h3 className="font-semibold line-clamp-2 group-hover:text-orange-500 transition-colors">
                    {item.title}
                  </h3>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
