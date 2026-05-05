"use client";

import { useEffect, useState } from "react";

interface TourOption {
  _id: string;
  name: string;
}

interface ContactForm {
  userId?: string;
  name: string;
  email: string;
  phone: string;
  tour: string;
  message: string;
}

const DEFAULT_FORM: ContactForm = {
  name: "",
  email: "",
  phone: "",
  tour: "",
  message: "",
};

function formatPhone(value: string) {
  return value.replace(/[^0-9]/g, "");
}

export default function ContactPage() {
  const [tours, setTours] = useState<TourOption[]>([]);
  const [loadingTours, setLoadingTours] = useState(true);
  const [form, setForm] = useState<ContactForm>(DEFAULT_FORM);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  // 🔥 NEW CODE ADD
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredTours = tours.filter((tour) =>
    tour.name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    async function loadTours() {
      try {
        const res = await fetch("https://db-pickyourway.vercel.app/api/tours");
        const data = await res.json();
        if (data?.success && Array.isArray(data.data)) {
          setTours(
            data.data
              .filter((tour: any) => tour?._id && tour?.name)
              .map((tour: any) => ({ _id: tour._id, name: tour.name }))
          );
        }
      } catch (err) {
        console.error("Không tải được danh sách tour:", err);
      } finally {
        setLoadingTours(false);
      }
    }

    loadTours();
  }, []);

  useEffect(() => {
    const loadUser = () => {
      const userString = localStorage.getItem("user");
      if (!userString) return;

      try {
        const storedUser = JSON.parse(userString);
        setForm((prev) => ({
          ...prev,
          userId: storedUser._id || storedUser.id || storedUser.userId || prev.userId,
          name: storedUser.name || prev.name,
          email: storedUser.email || prev.email,
          phone: storedUser.phone || storedUser.phoneNumber || prev.phone,
        }));
      } catch (err) {
        console.error("Không thể đọc user từ localStorage:", err);
      }
    };

    loadUser();
    window.addEventListener("tokenChanged", loadUser);
    window.addEventListener("storage", loadUser);

    return () => {
      window.removeEventListener("tokenChanged", loadUser);
      window.removeEventListener("storage", loadUser);
    };
  }, []);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "phone" ? formatPhone(value) : value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("sending");
    setError("");

    if (!form.name || !form.email || !form.message) {
      setError("Vui lòng điền đủ tên, email và nội dung yêu cầu.");
      setStatus("error");
      return;
    }

    try {
      const selectedTour = tours.find((tour) => tour._id === form.tour);
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          tourName: selectedTour?.name || "Chưa chọn tour cụ thể",
        }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        setStatus("error");
        setError(data?.error || "Không thể gửi yêu cầu lúc này.");
        return;
      }

      setStatus("success");
      setForm((prev) => ({
        ...prev,
        tour: "",
        message: "",
      }));
      setSearch("");
    } catch (err) {
      console.error(err);
      setStatus("error");
      setError("Lỗi máy chủ. Vui lòng thử lại sau.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-6xl mx-auto grid gap-8 lg:grid-cols-[1.4fr,0.9fr]">
        <section className="rounded-[2rem] bg-white px-6 py-8 shadow-sm border border-slate-200">
          <form onSubmit={handleSubmit} className="mt-10 space-y-6">

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-700">
                Tên của bạn
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3"
                />
              </label>

              <label className="space-y-2 text-sm text-slate-700">
                Email
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3"
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-700">
                Số điện thoại
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Hãy để lại số điện thoại nếu bạn muốn được gọi lại tư vấn"
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-300"
                />
              </label>

              {/* ✅ SEARCH TOUR - FIXED */}
              <label className="space-y-2 text-sm text-slate-700 relative">
                Tìm tour

                <input
                  type="text"
                  placeholder="Tìm tour du lịch..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onFocus={() => setShowDropdown(true)}   // 🔥 NEW
                  onBlur={() => setTimeout(() => setShowDropdown(false), 200)} // 🔥 NEW
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3"
                />

                {/* 🔥 DROPDOWN WRAP */}
                {showDropdown && (
                  <div className="absolute z-10 w-full max-h-40 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow">
                    {loadingTours ? (
                      <p className="p-3 text-sm text-gray-500">Đang tải...</p>
                    ) : filteredTours.length > 0 ? (
                      filteredTours.map((tour) => (
                        <div
                          key={tour._id}
                          onClick={() => {
                            setForm((prev) => ({ ...prev, tour: tour._id }));
                            setSearch(tour.name);
                            setShowDropdown(false);
                          }}
                          className={`px-4 py-2 text-sm cursor-pointer hover:bg-orange-50 ${
                            form.tour === tour._id ? "bg-orange-100 text-orange-600" : ""
                          }`}
                        >
                          {tour.name}
                        </div>
                      ))
                    ) : (
                      <p className="p-3 text-sm text-gray-500">Không tìm thấy</p>
                    )}
                  </div>
                )}
              </label>
            </div>

            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              rows={6}
                  placeholder="Nhập nội dung yêu cầu của bạn..."
              className="w-full rounded-xl border p-4"
            />
            {error && ( <div className="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"> {error} 

            </div> )} {status === "success" && ( <div className="rounded-3xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"> 
              Yêu cầu của bạn đã được gửi. Chúng tôi sẽ liên hệ sớm nhất trong vòng 24 giờ tới qua số hotline 0336 323 498. 
              </div> )}

            <button
              type="submit" disabled={status === "sending"} 
              className="inline-flex items-center justify-center rounded-3xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70" >
              {status === "sending" ? "Đang gửi..." : "Gửi yêu cầu"}
            </button>
          </form>
        </section>
        <aside className="space-y-6"> 
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"> 
            <h2 className="text-xl font-bold text-slate-900">Hỗ trợ nhanh</h2> 
            <p className="mt-3 text-sm leading-6 text-slate-600"> 
              Nếu bạn cần tư vấn ngay, gọi hotline hoặc gửi email để được hỗ trợ 24/7. 
            </p> 
          <div className="mt-6 space-y-4 text-sm text-slate-700"> 
            <div className="rounded-3xl bg-slate-50 p-4"> 
              <p className="font-semibold">Hotline</p> 
              <p className="text-orange-600">0336 323 498</p> 
            </div> 
            <div className="rounded-3xl bg-slate-50 p-4"> 
              <p className="font-semibold">Email hỗ trợ</p> 
              <p className="text-slate-700">support@pickyourway.vn</p> 
            </div> 
              <div className="rounded-3xl bg-slate-50 p-4"> 
                <p className="font-semibold">Địa chỉ văn phòng</p> 
                <p>TP. Hồ Chí Minh, Việt Nam</p> 
              </div> 
            </div> 
            </div> 
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"> 
              <h2 className="text-xl font-bold text-slate-900">Lợi ích</h2> 
              <ul className="mt-5 space-y-3 text-sm text-slate-600"> 
                <li className="flex gap-3">
                  <span className="text-orange-500">•</span> Tư vấn chọn tour phù hợp</li> 
                  <li className="flex gap-3">
                    <span className="text-orange-500">•</span> Hỗ trợ đặt tour nhanh chóng</li>
                     <li className="flex gap-3">
                      <span className="text-orange-500">•</span> Giải đáp thắc mắc bảo hiểm & thanh toán</li> 
                      <li className="flex gap-3">
                        <span className="text-orange-500">•</span> Cam kết phản hồi trong 24 giờ</li>
                </ul> </div> </aside>
      </div>
    </div>
  );
}