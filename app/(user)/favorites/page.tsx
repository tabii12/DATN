"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  User,
  Heart,
  CreditCard,
  LogOut,
  Lock,
  Briefcase,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function FavoritePage() {
  const [tours, setTours] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const router = useRouter();

  // ===== LOAD USER =====
  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));
  }, []);

  // ===== FETCH FAVORITES =====
  const fetchFavorites = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Bạn chưa đăng nhập!");
        setLoading(false);
        return;
      }

      const res = await axios.get(
        "https://db-pickyourway.vercel.app/api/favorites/my-favorites",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("TOURS:", res.data.data);

      setTours(res.data.data || []);
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

  // ===== LOGOUT =====
  const handleLogout = () => {
    localStorage.clear();
    window.dispatchEvent(new Event("tokenChanged"));
    router.push("/auth/login");
  };

  // ===== FIX ẢNH CHUẨN (QUAN TRỌNG) =====
  const getImage = (tour: any) => {
    // giống trang tours → ưu tiên cloudinary
    if (tour.images?.length > 0) {
      const img = tour.images[0];

      if (img?.secure_url) return img.secure_url;
      if (img?.image_url) return img.image_url;
      if (img?.url) return img.url;
      if (typeof img === "string") return img;
    }

    if (tour.thumbnail) return tour.thumbnail;
    if (tour.image) return tour.image;

    return "https://via.placeholder.com/400x300?text=No+Image";
  };

  // ===== NAVIGATE =====
  const goToDetail = (tour: any) => {
    if (tour.slug) {
      router.push(`/tours/${tour.slug}`);
    } else {
      router.push(`/tour/${tour._id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex gap-6">

      {/* ===== SIDEBAR ===== */}
      <div className="w-72 bg-white rounded-2xl shadow-lg p-5">
        <div className="flex flex-col items-center border-b pb-5 mb-5">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xl font-bold">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <p className="mt-3 font-semibold">{user?.name || "User"}</p>
          <p className="text-sm text-gray-500">{user?.email}</p>
        </div>

        <div className="space-y-2 text-gray-700">
          <MenuItem icon={<User size={18} />} label="Thông tin cá nhân" onClick={() => router.push("/profile")} />
          <MenuItem icon={<Briefcase size={18} />} label="Tour đã đặt" onClick={() => router.push("/bookings")} />
          <MenuItem icon={<Heart size={18} />} label="Tour yêu thích" active />
          <MenuItem icon={<CreditCard size={18} />} label="Thanh toán" onClick={() => router.push("/payments")} />

          <div className="border-t my-3"></div>

          <MenuItem icon={<Lock size={18} />} label="Đổi mật khẩu" onClick={() => router.push("/change-password")} />

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-red-500 hover:bg-red-50"
          >
            <LogOut size={18} /> Đăng xuất
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
                        "https://via.placeholder.com/400x300?text=No+Image";
                    }}
                    className="w-full h-48 object-cover group-hover:scale-110 transition duration-500"
                  />

                  {/* overlay */}
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition"></div>

                  {/* ❤️ */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // 🔥 fix click
                      handleRemoveFavorite(tour._id);
                    }}
                    className="absolute top-3 right-3 bg-white/90 backdrop-blur p-2 rounded-full shadow hover:bg-red-100"
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

// ===== MENU ITEM =====
function MenuItem({ icon, label, active = false, onClick }: any) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition
      ${
        active
          ? "bg-blue-50 text-blue-600 font-medium"
          : "hover:bg-gray-100"
      }`}
    >
      {icon}
      {label}
    </div>
  );
}