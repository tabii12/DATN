"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  User,
  Heart,
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
  infants: number;

  basePrice: number;
  total: number;

  singleRooms: number;
  insuranceFee: number;

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

      if (u) setUser(JSON.parse(u));

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
          // ✅ ƯU TIÊN TOTAL TỪ BE
          let total = Number(b.total_price || 0);

          // fix VNPay x100
          if (total > 100000000) total = total / 100;

          const basePrice = Number(
            b.basePrice ||
            b.trip_id?.price ||
            0
          );

          const adults = Number(b.adults || 0);
          const children = Number(b.children || 0);
          const infants = Number(b.infants || 0);
          const singleRooms = Number(b.singleRooms || 0);

          const insuranceFee = 500000;

          // 🔥 FIX QUAN TRỌNG:
          // Nếu BE có total nhưng chưa có bảo hiểm → cộng thêm
          if (total && total < 500000) {
            total += insuranceFee;
          }

          // 👉 fallback nếu BE chưa lưu total
          if (!total) {
            const adultTotal = adults * basePrice;
            const childTotal = children * basePrice;
            const singleRoomFee = singleRooms * 656775;

            total =
              adultTotal +
              childTotal +
              singleRoomFee +
              insuranceFee;
          }

          return {
            id: b._id,
            tourId: b.trip_id?._id || "",
            tourName: b.tourName || b.trip_id?.title || "Không có tên",
            thumbnail:
              b.thumbnail ||
              b.trip_id?.thumbnail ||
              "https://via.placeholder.com/400x300",

            adults,
            children,
            infants,

            basePrice,
            total,

            singleRooms,
            insuranceFee,

            departureDate: b.departureDate,

            status: (b.status || "").toLowerCase(),

            contactName: b.contactName,
            contactEmail: b.contactEmail,
            contactPhone: b.contactPhone,
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
      {/* SIDEBAR */}
      <div className="w-72 bg-white rounded-2xl shadow-lg p-5">
        <div className="flex items-center gap-3 pb-5 border-b">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white flex items-center justify-center font-bold">
            {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div>
            <p className="font-semibold">{user?.name}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>

        <div className="mt-4 space-y-1">
          <MenuItem icon={<User size={18} />} label="Thông tin cá nhân" href="/profile" active={pathname === "/profile"} />
          <MenuItem icon={<Briefcase size={18} />} label="Tour đã đặt" href="/bookings" active />
          <MenuItem icon={<Heart size={18} />} label="Tour yêu thích" href="/favorites" active={pathname === "/favorites"} />

          <div className="border-t my-3"></div>

          <MenuItem icon={<Lock size={18} />} label="Đổi mật khẩu" href="/change-password" />

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-500 hover:bg-red-50"
          >
            <LogOut size={18} />
            Đăng xuất
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 space-y-6">
        <h1 className="text-2xl font-bold">Tour đã đặt</h1>

        {bookings.map((b) => (
          <div key={b.id} className="bg-white p-5 rounded-xl shadow space-y-4">
            <div className="flex gap-5">
              <img
                src={b.thumbnail}
                className="w-56 h-40 object-cover rounded-xl"
              />

              <div className="flex-1 space-y-2">
                <p className="font-bold text-lg">{b.tourName}</p>

                <p>
                  👨‍👩‍👧 {b.adults} NL - {b.children} TE -{" "}
                  {b.infants > 0 ? b.infants + " TN" : "0 TN"}
                </p>

                {/* 🔥 GIÁ CHUẨN */}
                <p className="text-xl font-bold text-indigo-600">
                  {formatVND(b.total)}
                </p>

                <p>
                  Ngày đi:{" "}
                  {new Date(b.departureDate).toLocaleDateString("vi-VN")}
                </p>

                <p>
                  Trạng thái:{" "}
                  <span className="font-semibold">
                    {b.status === "paid"
                      ? "Đã thanh toán"
                      : "Chờ thanh toán"}
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
        ))}
      </div>

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

function MenuItem({ icon, label, href, active = false }: any) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl ${
        active
          ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
          : "hover:bg-gray-100"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}