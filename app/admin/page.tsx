"use client";

import { useState, useEffect, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

import TourIsCommingSoon from "./dashboard/tourIsCommingSoon/page";

const API = "https://db-pickyourway.vercel.app/api";

// ================= TYPES =================
interface TourAPI {
  _id: string;
  name: string;
  status: string;
}

interface BookingRaw {
  _id: string;
  tour_id: any;
  user_id?: any;
  total_price?: number;
  createdAt: string;
  vnpay?: { amount?: number };
}

interface User {
  _id: string;
  name?: string;
  email?: string;
  status: string;
}

// ================= CARD =================
function StatCard({ icon, label, value, color }: any) {
  return (
    <div className="relative bg-white rounded-2xl p-5 border shadow-sm hover:shadow-md transition">
      <div className={`absolute top-0 left-0 right-0 h-1 ${color}`} />
      <p className="text-xs text-gray-400 font-bold uppercase">{label}</p>
      <p className="text-2xl font-black text-gray-900 mt-1">{value}</p>
      <div className="absolute right-4 top-4 text-2xl opacity-70">
        {icon}
      </div>
    </div>
  );
}

// ================= AI =================
function predictNext7Days(bookings: BookingRaw[]) {
  if (!bookings.length) return [];

  const map: Record<string, number> = {};

  bookings.forEach((b) => {
    const key = new Date(b.createdAt).toISOString().slice(0, 10);
    const price = b.vnpay?.amount ?? b.total_price ?? 0;
    map[key] = (map[key] || 0) + price;
  });

  const values = Object.values(map);
  const avg = values.reduce((a, b) => a + b, 0) / (values.length || 1);

  return Array.from({ length: 7 }).map((_, i) => ({
    day: `D+${i + 1}`,
    predicted: Math.round(avg * (1 + i * 0.1)),
  }));
}

// ================= MAIN =================
export default function AdminDashboard() {
  const [tours, setTours] = useState<TourAPI[]>([]);
  const [bookings, setBookings] = useState<BookingRaw[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [topTours, setTopTours] = useState<any[]>([]);
  const [topUsers, setTopUsers] = useState<any[]>([]);
  const [aiData, setAiData] = useState<any[]>([]);
  const [visitorData, setVisitorData] = useState<any[]>([]);

  // ================= VISITOR (FIXED SAFE) =================
  useEffect(() => {
    const fetchVisitors = async () => {
      try {
        const res = await fetch(`${API}/visitors/stats`);
        const json = await res.json();

        const data = json?.data || json || [];

        setVisitorData(
          data.map((item: any) => ({
            name: item._id,
            visitors: item.visitors,
          }))
        );
      } catch (err) {
        console.log("Visitor API error:", err);
        setVisitorData([]);
      }
    };

    fetchVisitors();
  }, []);

  // ================= FETCH =================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        const [t, b, u] = await Promise.all([
          fetch(`${API}/tours`).then((r) => r.json()),
          fetch(`${API}/bookings/admin/all`, {
            headers: { Authorization: `Bearer ${token}` },
          }).then((r) => r.json()),
          fetch(`${API}/users`, {
            headers: { Authorization: `Bearer ${token}` },
          }).then((r) => r.json()),
        ]);

        setTours(t?.data || []);
        setBookings(b?.data || []);
        setUsers(u?.data || []);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ================= REVENUE =================
  useEffect(() => {
    const map: Record<string, number> = {};

    bookings.forEach((b) => {
      const key = new Date(b.createdAt).toLocaleDateString("vi-VN");
      const price = b.vnpay?.amount ?? b.total_price ?? 0;

      map[key] = (map[key] || 0) + price;
    });

    setRevenueData(
      Object.entries(map).map(([name, revenue]) => ({
        name,
        revenue,
      }))
    );
  }, [bookings]);

  // ================= TOP TOUR =================
  useEffect(() => {
    const map: any = {};

    bookings.forEach((b) => {
      const id = b.tour_id?._id || "unknown";
      const name = b.tour_id?.name || "Unknown";
      const price = b.vnpay?.amount ?? b.total_price ?? 0;

      if (!map[id]) {
        map[id] = { name, revenue: 0 };
      }

      map[id].revenue += price;
    });

    setTopTours(
      Object.values(map)
        .sort((a: any, b: any) => b.revenue - a.revenue)
        .slice(0, 6)
    );
  }, [bookings]);

  // ================= TOP USERS =================
  useEffect(() => {
    const map: any = {};

    bookings.forEach((b) => {
      const uid = b.user_id?._id || "unknown";
      const name = b.user_id?.name || "User";
      const price = b.vnpay?.amount ?? b.total_price ?? 0;

      if (!map[uid]) {
        map[uid] = { name, total: 0, count: 0 };
      }

      map[uid].total += price;
      map[uid].count += 1;
    });

    setTopUsers(
      Object.values(map)
        .sort((a: any, b: any) => b.total - a.total)
        .slice(0, 6)
    );
  }, [bookings]);

  // ================= AI =================
  useEffect(() => {
    setAiData(predictNext7Days(bookings));
  }, [bookings]);

  // ================= STATS =================
  const stats = useMemo(() => {
    const revenue = bookings.reduce(
      (s, b) => s + (b.vnpay?.amount ?? b.total_price ?? 0),
      0
    );

    return {
      tours: tours.length,
      users: users.length,
      bookings: bookings.length,
      revenue,
    };
  }, [tours, users, bookings]);

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4">
        <h1 className="font-black text-lg">📊 Dashboard PRO</h1>
      </div>

      <div className="p-6 space-y-6">

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon="🗺️" label="Tours" value={stats.tours} color="bg-orange-500" />
          <StatCard icon="👤" label="Users" value={stats.users} color="bg-blue-500" />
          <StatCard icon="📦" label="Bookings" value={stats.bookings} color="bg-purple-500" />
          <StatCard icon="💰" label="Revenue" value={stats.revenue.toLocaleString()} color="bg-green-500" />
        </div>

        {/* CHARTS */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* REVENUE */}
          <div className="bg-white p-4 rounded-2xl border h-[320px]">
            <h2 className="font-bold mb-3">💰 Doanh thu</h2>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line dataKey="revenue" stroke="#22c55e" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* TOP TOUR */}
          <div className="bg-white p-4 rounded-2xl border h-[320px]">
            <h2 className="font-bold mb-3">🔥 Top Tour</h2>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topTours}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#f97316" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* TOP USERS */}
        <div className="bg-white p-5 rounded-2xl border">
          <h2 className="font-bold mb-4">👑 Top Users chi tiêu nhiều nhất</h2>

          <div className="grid md:grid-cols-3 gap-4">
            {topUsers.map((u: any, i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-xl border">
                <p className="font-bold">{u.name}</p>
                <p className="text-sm text-gray-500">{u.count} đơn</p>
                <p className="text-orange-600 font-black">
                  {u.total.toLocaleString()}đ
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* VISITOR */}
        <div className="bg-white p-4 rounded-2xl border h-[280px]">
          <h2 className="font-bold mb-3">👁 Visitors (REAL DATA)</h2>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={visitorData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line dataKey="visitors" stroke="#3b82f6" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* AI */}
        <div className="bg-white p-4 rounded-2xl border h-[280px]">
          <h2 className="font-bold mb-3">🤖 AI Dự đoán</h2>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={aiData}>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line dataKey="predicted" stroke="#a855f7" strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <TourIsCommingSoon />
      </div>
    </div>
  );
}