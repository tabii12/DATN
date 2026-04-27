"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Heart, LogOut, Lock, Briefcase, Star } from "lucide-react";
import CommentForm from "../components/CommentForm";

function formatVND(n: number) {
  return (n || 0).toLocaleString("vi-VN") + "đ";
}

function formatDate(d: string) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("vi-VN");
}

function getCountdown(createdAt?: string, now?: number) {
  if (!createdAt || !now) return null;

  const deadline = new Date(createdAt).getTime() + 48 * 60 * 60 * 1000;
  const diff = deadline - now;

  if (diff <= 0) return { expired: true };

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { hours, minutes, seconds, expired: false };
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
  createdAt?: string;

  contactName: string;
  contactEmail: string;
  contactPhone: string;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const [now, setNow] = useState(Date.now());

  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

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
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        const json = await res.json();
        const raw = json.data || [];

        const normalized: Booking[] = raw.map((b: any) => {
          const adults = Number(b.adults || 0);
          const children = Number(b.children || 0);
          const infants = Number(b.infants || 0);
          const basePrice = Number(b.trip_id?.price || 0);
          const singleRooms = Number(b.singleRooms || 0);
          const insuranceFee = 500000;

          let total = Number(b.total_price || 0);

          if (!total) {
            total =
              adults * basePrice +
              children * basePrice +
              singleRooms * 656775 +
              insuranceFee;
          }

          return {
            id: b._id,
            tourId: b.tour_id?._id || b.tour_id || "",
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
            status: b.status,
            createdAt: b.createdAt,

            contactName: b.contactName,
            contactEmail: b.contactEmail,
            contactPhone: b.contactPhone,
          };
        });

        setBookings(normalized);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/auth/login");
  };

  const isTourCompleted = (b: Booking) => {
    if (b.status !== "paid_100") return false;
    const dep = new Date(b.departureDate);
    return dep < new Date();
  };

  const renderProgress = (b: Booking) => {
    const isConfirmed = b.status === "confirmed";
    const isPaid = b.status === "paid";
    const done = isTourCompleted(b);

    const time = getCountdown(b.createdAt, now);

    const hour = new Date(now).getHours();
    const isNight = hour >= 22 || hour < 6;

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-4 text-xs">
          <Step active={isConfirmed || isPaid} label="Đã xác nhận" />
          <Line active={isPaid || done} />
          <Step active={isPaid} label="Đã thanh toán" />
          <Line active={done} />
          <Step active={done} label="Hoàn thành" />
        </div>

        {/* COUNTDOWN: chỉ khi đã confirmed nhưng chưa paid */}
        {isConfirmed && !isPaid && time && (
          <>
            {time.expired ? (
              <div className="bg-red-50 border border-red-300 text-red-700 text-sm p-3 rounded-xl">
                ❌ Đã quá hạn thanh toán
              </div>
            ) : (
              <div
                className={`text-sm p-3 rounded-xl border ${
                  (time?.hours ?? 0) < 6
                    ? "bg-red-50 border-red-300 text-red-700"
                    : "bg-yellow-50 border-yellow-300 text-yellow-700"
                }`}
              >
                ⚠️ Còn{" "}
                <b>
                  {time?.hours ?? 0}h {time?.minutes ?? 0}m {time?.seconds ?? 0}
                  s
                </b>{" "}
                để hoàn tất thanh toán
              </div>
            )}

            {isNight && (
              <div className="bg-indigo-50 border border-indigo-300 text-indigo-700 text-sm p-3 rounded-xl">
                🌙 Ban đêm: Hệ thống sẽ gửi email nhắc thanh toán cho bạn
              </div>
            )}
          </>
        )}

        <CancelInfoToggle />
      </div>
    );
  };

  if (loading) return <p className="p-6">Đang tải...</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex gap-6">
      <div className="w-72 bg-white rounded-2xl shadow-lg p-5">
        <div className="flex items-center gap-3 pb-5 border-b">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white flex items-center justify-center font-bold">
            {user?.name?.charAt(0) || "U"}
          </div>
          <div>
            <p className="font-semibold">{user?.name}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>

        <div className="mt-4 space-y-1">
          <MenuItem
            icon={<User size={18} />}
            label="Thông tin cá nhân"
            href="/profile"
          />
          <MenuItem
            icon={<Briefcase size={18} />}
            label="Tour đã đặt"
            href="/bookings"
            active
          />
          <MenuItem
            icon={<Heart size={18} />}
            label="Tour yêu thích"
            href="/favorites"
          />

          <div className="border-t my-3"></div>

          <MenuItem
            icon={<Lock size={18} />}
            label="Đổi mật khẩu"
            href="/change-password"
          />

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-500 hover:bg-red-50"
          >
            <LogOut size={18} />
            Đăng xuất
          </button>
        </div>
      </div>

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
                  👨‍👩‍👧 {b.adults} NL - {b.children} TE - {b.infants} TN
                </p>

                <p className="text-xl font-bold text-indigo-600">
                  {formatVND(b.total)}
                </p>

                <p>Ngày đi: {formatDate(b.departureDate)}</p>

                {renderProgress(b)}

                {isTourCompleted(b) && (
                  <button
                    onClick={() => setReviewBooking(reviewBooking?.id === b.id ? null : b)}
                    className="mt-2 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded flex items-center gap-2"
                  >
                    <Star size={14} /> {reviewBooking?.id === b.id ? "Đóng đánh giá" : "Đánh giá tour"}
                  </button>
                )}

                {reviewBooking?.id === b.id && (
                  <div className="mt-4">
                    <CommentForm
                      tourId={b.tourId}
                      tourName={b.tourName}
                      onCommentAdded={() => setReviewBooking(null)}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>


    </div>
  );
}

/* ---------- COMPONENT PHỤ ---------- */

function CancelInfoToggle() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen(!open)}
        className="text-sm text-red-600 hover:underline"
      >
        {open ? "▲ Ẩn thông tin huỷ tour" : "▼ Muốn huỷ tour?"}
      </button>

      {open && (
        <div className="mt-2 bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-xl space-y-1">
          <p>
            📞 Hotline: <b>0336 323 498</b>
          </p>
          <p>
            📧 Email: <b>support@pickyourway.vn</b>
          </p>
          <p>
            👉 Gửi yêu cầu tại{" "}
            <Link href="/contact" className="underline font-semibold">
              trang liên hệ
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}

function Step({ active, label }: any) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] ${
          active ? "bg-indigo-600" : "bg-gray-300"
        }`}
      >
        ✓
      </div>
      <span className="mt-1">{label}</span>
    </div>
  );
}

function Line({ active }: any) {
  return (
    <div
      className={`h-1 w-10 ${active ? "bg-indigo-600" : "bg-gray-300"}`}
    ></div>
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
