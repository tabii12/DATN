"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  User,
  Heart,
  CreditCard,
  LogOut,
  Lock,
  Briefcase,
  Star,
} from "lucide-react";
import CommentForm from "../components/CommentForm";

function formatVND(n: number) {
  return (n || 0).toLocaleString("vi-VN") + "đ";
}

interface Booking {
  id: string;
  tourId: string;
  tourName: string;
  thumbnail: string;
  adults: number;
  children: number;
  total: number;
  departureDate: string;
  status: string;

  contactName: string;
  contactEmail: string;
  contactPhone: string;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const loadData = async () => {
      const token = localStorage.getItem("token");
      const u = localStorage.getItem("user");

      let userData = null;
      if (u) {
        userData = JSON.parse(u);
        setUser(userData);
      }

      if (!token) {
        router.push("/auth/login");
        return;
      }

      try {
        const res = await fetch(
          "https://db-pickyourway.vercel.app/api/bookings/my-bookings",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const json = await res.json();
        const raw = json.data || [];

        const normalized: Booking[] = raw.map((b: any) => {
          let total = b.total_price || 0;
          if (total > 100000000) total = total / 100;

          return {
            id: b._id,
            tourId: b.trip_id?._id || "",
            tourName: b.tourName || "Không có tên",
            thumbnail:
              b.thumbnail ||
              "https://via.placeholder.com/400x300?text=No+Image",
            adults: Number(b.adults || 0),
            children: Number(b.children || 0),
            
            total: Number(total),
            departureDate: b.departureDate,
            status: b.status,

            contactName: b.contactName || userData?.name || "Không có",
            contactEmail: b.contactEmail || userData?.email || "Không có",
            contactPhone: b.contactPhone || userData?.phone || "Không có",
          };
        });

        setBookings(normalized);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/auth/login");
  };

  const isTourCompleted = (b: Booking) => {
    const dep = new Date(b.departureDate);
    const end = new Date(dep);
    end.setDate(end.getDate() + 3);
    return end < new Date();
  };

  if (loading) return <p className="p-6">Đang tải...</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex gap-6">

      {/* ===== SIDEBAR GIỐNG PROFILE ===== */}
      <div className="w-72 bg-white rounded-2xl shadow-lg p-5">

        {/* User */}
        <div className="flex items-center gap-3 pb-5 border-b">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white flex items-center justify-center font-bold">
            {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div>
            <p className="font-semibold">{user?.name || "User"}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>

        {/* Menu */}
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

          {/* Logout */}
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
      <div className="flex-1 space-y-6">
        <h1 className="text-2xl font-bold">Tour đã đặt</h1>

        {bookings.length === 0 ? (
          <p>Chưa có đơn</p>
        ) : (
          bookings.map((b) => (
            <div key={b.id} className="bg-white p-5 rounded-xl shadow space-y-4">

              <div className="flex gap-5">
                <img
                  src={b.thumbnail}
                  className="w-56 h-40 object-cover rounded-xl"
                />

                <div className="flex-1 space-y-1">
                  <p className="font-bold text-lg">{b.tourName}</p>

                  <p>
                    👨‍👩‍👧 {b.adults} NL - {b.children} TE
                  </p>

                  <p className="text-indigo-600 font-bold text-xl">
                    {formatVND(b.total)}
                  </p>

                  <p>
                    Ngày đi:{" "}
                    {new Date(b.departureDate).toLocaleDateString("vi-VN")}
                  </p>

                  <p>
                    Trạng thái:{" "}
                    <span className="font-semibold">
                      {b.status === "confirmed"
                        ? "Đã thanh toán"
                        : b.status === "pending"
                        ? "Chờ thanh toán"
                        : "Đã hủy"}
                    </span>
                  </p>

                  {isTourCompleted(b) && (
                    <button
                      onClick={() => setReviewBooking(b)}
                      className="mt-2 bg-yellow-500 text-white px-3 py-1 rounded flex items-center gap-2"
                    >
                      <Star size={14} /> Đánh giá
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL */}
      {reviewBooking && (
        <CommentForm
          tourId={reviewBooking.tourId}
          tourName={reviewBooking.tourName}
          onCommentAdded={() => setReviewBooking(null)}
        />
      )}
    </div>
  );
}

/* ===== MENU ITEM ===== */
function MenuItem({ icon, label, href, active = false }: any) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
      ${
        active
          ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md"
          : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </Link>
  );
}