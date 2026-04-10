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
  return n.toLocaleString("vi-VN") + "đ";
}

interface Booking {
  id: string;
  tourId: string;
  tourName: string;
  hotelName: string;
  city: string;
  thumbnail: string;
  adults: number;
  children: number;
  pricePerAdult: number;
  pricePerChild: number;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  departureDate: string;
  paymentStatus: string;
  completed?: boolean;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);

  const router = useRouter();
  const pathname = usePathname();

  // ===== LOAD DATA =====
  useEffect(() => {
    const loadData = async () => {
      const token = localStorage.getItem("token");
      const u = localStorage.getItem("user");
      if (u) setUser(JSON.parse(u));

      if (token) {
        try {
          const res = await fetch("https://db-pickyourway.vercel.app/api/bookings/user", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (res.ok) {
            const data = await res.json();
            // Normalize bookings
            const normalized = (data.bookings || data.data || data || []).map((b: any) => ({
              id: b.id || b._id,
              tourId: b.tourId || b.tour_id || b.tour?.id || "",
              tourName: b.tourName || b.tour_name,
              hotelName: b.hotelName || b.hotel_name,
              city: b.city,
              thumbnail: b.thumbnail,
              adults: b.adults || 1,
              children: b.children || 0,
              pricePerAdult: b.pricePerAdult || b.price_per_adult || b.price,
              pricePerChild: b.pricePerChild || b.price_per_child || b.childPrice,
              contactName: b.contactName || b.contact_name || b.customerName,
              contactEmail: b.contactEmail || b.contact_email || b.email,
              contactPhone: b.contactPhone || b.contact_phone || b.phone,
              departureDate: b.departureDate || b.departure_date,
              paymentStatus: b.paymentStatus || b.payment_status || "pending",
              completed: b.completed || false,
            }));
            setBookings(normalized);
          }
        } catch (error) {
          console.error("Lỗi tải bookings:", error);
        }
      }
      setLoading(false);
    };

    loadData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("tokenChanged"));
    router.push("/auth/login");
  };

  const isTourCompleted = (booking: Booking) => {
    if (booking.completed) return true;
    // Giả sử tour 3 ngày, nếu departureDate + 3 < now thì completed
    const depDate = new Date(booking.departureDate);
    const now = new Date();
    const endDate = new Date(depDate);
    endDate.setDate(endDate.getDate() + 3); // Giả sử 3 ngày
    return endDate < now;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className=" min-h-screen bg-gray-100 p-6 flex gap-6">

      {/* ===== SIDEBAR ===== */}
      <div className="bg-white rounded-2xl shadow-lg p-5">

        {/* User */}
        <div className="flex items-center gap-3 pb-5 border-b">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white flex items-center justify-center font-bold">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div>
            <p className="font-semibold">{user?.name || "User"}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>

        {/* Menu */}
        <div className="mt-4 space-y-1">
          <MenuItem icon={<User size={18} />} label="Thông tin cá nhân" href="/profile" active={pathname === "/profile"} />
          <MenuItem icon={<Briefcase size={18} />} label="Tour đã đặt" href="/bookings" active={pathname === "/bookings"} />
          <MenuItem icon={<Heart size={18} />} label="Tour yêu thích" href="/favorites" active={pathname === "/favorites"} />
          <MenuItem icon={<CreditCard size={18} />} label="Lịch sử thanh toán" href="/payments" active={pathname === "/payments"} />

          <div className="border-t my-3"></div>

          <MenuItem icon={<Lock size={18} />} label="Đổi mật khẩu" href="/change-password" active={pathname === "/change-password"} />

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-500 hover:bg-red-50"
          >
            <LogOut size={18} /> Đăng xuất
          </button>
        </div>
      </div>

      {/* ===== CONTENT ===== */}
      <div className="flex-1 space-y-6">

        <h1 className="text-2xl font-bold">Tour đã đặt</h1>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <p className="text-gray-500">Bạn chưa đặt tour nào.</p>
          </div>
        ) : (
          bookings.map((booking) => {
            const total =
              booking.adults * booking.pricePerAdult +
              booking.children * booking.pricePerChild +
              500000;

            return (
              <div key={booking.id} className="bg-white rounded-2xl shadow-lg p-6">

                <div className="flex gap-5">

                  {/* Image */}
                  {booking.thumbnail && (
                    <img
                      src={booking.thumbnail}
                      className="w-56 h-40 object-cover rounded-xl"
                    />
                  )}

                  {/* Info */}
                  <div className="flex-1 space-y-2">
                    <p className="text-lg font-semibold">{booking.tourName}</p>

                    <p className="text-gray-500">
                      {booking.hotelName} - {booking.city}
                    </p>

                    <p>
                      👨‍👩‍👧 {booking.adults} người lớn - {booking.children} trẻ em
                    </p>

                    <p className="text-xl text-indigo-600 font-bold">
                      {formatVND(total)}
                    </p>

                    <p className="text-sm">
                      Ngày đi: {new Date(booking.departureDate).toLocaleDateString("vi-VN")}
                    </p>

                    <p className="text-sm">
                      Trạng thái: {booking.paymentStatus === "paid" ? "Đã thanh toán" : "Chưa thanh toán"}
                    </p>

                    {isTourCompleted(booking) && (
                      <button 
                        onClick={() => setReviewBooking(booking)}
                        className="mt-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 flex items-center gap-2"
                      >
                        <Star size={16} /> Đánh giá tour
                      </button>
                    )}
                  </div>
                </div>

                {/* CONTACT */}
                <div className="mt-4 pt-4 border-t">
                  <h3 className="font-bold text-lg mb-3">Thông tin liên hệ</h3>

                  <div className="grid grid-cols-2 gap-4 text-sm">

                    <div>
                      <p className="text-gray-500">Khách hàng</p>
                      <p className="font-medium">{booking.contactName}</p>
                    </div>

                    <div>
                      <p className="text-gray-500">Email</p>
                      <p className="font-medium">{booking.contactEmail}</p>
                    </div>

                    <div>
                      <p className="text-gray-500">Số điện thoại</p>
                      <p className="font-medium">{booking.contactPhone}</p>
                    </div>

                  </div>
                </div>
              </div>
            );
          })
        )}

      </div>

      {/* REVIEW MODAL */}
      {reviewBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Đánh giá tour: {reviewBooking.tourName}</h2>
              <button 
                onClick={() => setReviewBooking(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <CommentForm 
              tourId={reviewBooking.tourId} 
              tourName={reviewBooking.tourName}
              onCommentAdded={() => setReviewBooking(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ===== MENU ITEM ===== */
function MenuItem({ icon, label, href, active = false }: any) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all
      
      ${
        active
          ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md"
          : "text-gray-700 hover:bg-gray-100"
      }
      `}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </Link>
  );
}