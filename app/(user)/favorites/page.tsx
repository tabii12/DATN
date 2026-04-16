"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  User,
  Heart,
  LogOut,
  Lock,
  Briefcase,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

export default function FavoritePage() {
  const [tours, setTours] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const router = useRouter();
  const pathname = usePathname();

  // ===== LOAD USER =====
  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));
  }, []);

  // ===== FETCH FAVORITES + MAP ẢNH CHUẨN =====
  const fetchFavorites = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/auth/login");
        return;
      }

      // 🔥 gọi 2 API
      const [favRes, tourRes] = await Promise.all([
        axios.get(
          "https://db-pickyourway.vercel.app/api/favorites/my-favorites",
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        axios.get("https://db-pickyourway.vercel.app/api/tours"),
      ]);

      const favorites = favRes.data.data || [];
      const allTours = tourRes.data.data || [];

      // 🔥 GHÉP DATA để có images từ Mongo
      const merged = favorites.map((fav: any) => {
        const fullTour = allTours.find(
          (t: any) => t._id === fav._id
        );
        return fullTour || fav;
      });

      setTours(merged);
    } catch (error: any) {
      console.log(error);
      alert(error?.response?.data?.message || "Lỗi tải danh sách yêu thích");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  // ===== LẤY ẢNH CHUẨN CLOUDINARY =====
  const getImage = (tour: any) => {
    if (tour.images?.length > 0) {
      const img = tour.images[0];

      return (
        img?.secure_url ||
        img?.url ||
        img?.image_url
      );
    }

    return "https://dummyimage.com/400x300/cccccc/000000&text=No+Image";
  };

  // ===== REMOVE =====
  const handleRemoveFavorite = async (tourId: string) => {
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "https://db-pickyourway.vercel.app/api/favorites/toggle",
        { tour_id: tourId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTours((prev) => prev.filter((t) => t._id !== tourId));
    } catch {
      alert("Xóa yêu thích thất bại");
    }
  };

  // ===== NAVIGATE =====
  const goToDetail = (tour: any) => {
    if (tour.slug) {
      router.push(`/tours/${tour.slug}`);
    } else {
      router.push(`/tour/${tour._id}`);
    }
  };

  // ===== LOGOUT =====
  const handleLogout = () => {
    localStorage.clear();
    window.dispatchEvent(new Event("tokenChanged"));
    router.push("/auth/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex gap-6">

      {/* ===== SIDEBAR ===== */}
      <div className="w-72 bg-white rounded-2xl shadow-lg p-5">

        <div className="flex items-center gap-3 pb-5 border-b">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white flex items-center justify-center font-bold">
            {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div>
            <p className="font-semibold">{user?.name || "User"}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>

        <div className="mt-4 space-y-1">

          <MenuItem
            icon={<User size={18} />}
            label="Thông tin cá nhân"
            href="/profile"
            active={pathname === "/profile"}
          />

          <MenuItem
            icon={<Briefcase size={18} />}
            label="Tour đã đặt"
            href="/bookings"
            active={pathname === "/bookings"}
          />

          <MenuItem
            icon={<Heart size={18} />}
            label="Tour yêu thích"
            href="/favorites"
            active={pathname === "/favorites"}
          />

          <div className="border-t my-3"></div>

          <MenuItem
            icon={<Lock size={18} />}
            label="Đổi mật khẩu"
            href="/change-password"
            active={pathname === "/change-password"}
          />

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition"
          >
            <LogOut size={18} />
            Đăng xuất
          </button>
        </div>
      </div>

      {/* ===== CONTENT ===== */}
      <div className="flex-1">
        <h1 className="text-2xl font-bold mb-6">Tour yêu thích</h1>

        {loading ? (
          <p className="text-center mt-10">Đang tải...</p>
        ) : tours.length === 0 ? (
          <div className="text-center mt-20 text-gray-500">
            <p>Chưa có tour yêu thích</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {tours.map((tour) => (
              <div
                key={tour._id}
                onClick={() => goToDetail(tour)}
                className="cursor-pointer bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition group"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={getImage(tour)}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://dummyimage.com/400x300/cccccc/000000&text=No+Image";
                    }}
                    className="w-full h-48 object-cover group-hover:scale-110 transition duration-500"
                  />

                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition"></div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFavorite(tour._id);
                    }}
                    className="absolute top-3 right-3 bg-white/90 p-2 rounded-full shadow hover:bg-red-100"
                  >
                    ❤️
                  </button>
                </div>

                <div className="p-4 space-y-2">
                  <h2 className="font-semibold line-clamp-2">
                    {tour.name}
                  </h2>

                  <p className="text-sm text-gray-500">
                    {tour.category_id?.name}
                  </p>

                  <p className="text-red-500 font-bold text-lg">
                    {tour.price
                      ? tour.price.toLocaleString() + " đ"
                      : "Liên hệ"}
                  </p>
                </div>
              </div>
            ))}

          </div>
        )}
      </div>
    </div>
  );
}

/* ===== MENU ITEM ===== */
function MenuItem({ icon, label, href, active = false }: any) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(href)}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition
      ${
        active
          ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md"
          : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </div>
  );
}