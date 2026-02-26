"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const API = "https://db-datn.onrender.com/api";

export default function EditTourPage() {
  const params = useParams();
  const slug = params?.slug as string | undefined;

  const [tour, setTour] = useState<any>(null);
  const [hotels, setHotels] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [tab, setTab] = useState("info");

  const [descTitle, setDescTitle] = useState("");
  const [descContent, setDescContent] = useState("");

  /* ================= FETCH TOUR ================= */
  const fetchTour = async () => {
    if (!slug) return;
    const res = await fetch(`${API}/tours/detail/${slug}`);
    const data = await res.json();
    setTour(data.data);
  };

  /* ================= INIT ================= */
  useEffect(() => {
    if (!slug) return;

    fetchTour();

    fetch(`${API}/hotels`)
      .then(r => r.json())
      .then(d => setHotels(d.data || []));

    fetch(`${API}/categories`)
      .then(r => r.json())
      .then(d => setCategories(d.data || []));
  }, [slug]);

  if (!slug || !tour) {
    return <div className="p-6">Đang tải tour...</div>;
  }

  /* ================= INFO ================= */
  const updateInfo = async () => {
    await fetch(`${API}/tours/detail/${slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: tour.name,
        status: tour.status,
        hotel_id: tour.hotel_id?._id,
        category_id: tour.category_id?._id,
      }),
    });
    alert("Đã cập nhật tour");
    fetchTour();
  };

  /* ================= IMAGE ================= */
  const uploadImage = async (file: File) => {
    const fd = new FormData();
    fd.append("image", file);
    await fetch(`${API}/tours/detail/${slug}/images`, { method: "POST", body: fd });
    fetchTour();
  };

  const deleteImage = async (imageId: string) => {
    await fetch(`${API}/images/${imageId}`, { method: "DELETE" });
    fetchTour();
  };

  /* ================= DESCRIPTION ================= */
  const addDescription = async () => {
    if (!descTitle || !descContent) return;

    await fetch(`${API}/tours/detail/${slug}/descriptions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: descTitle, content: descContent }),
    });

    setDescTitle("");
    setDescContent("");
    fetchTour();
  };

  const deleteDescription = async (descId: string) => {
    await fetch(`${API}/descriptions/${descId}`, { method: "DELETE" });
    fetchTour();
  };

  /* ================= ITINERARY ================= */
  const addDay = async () => {
    const nextDay = tour.itineraries.length + 1;
    await fetch(`${API}/tours/${slug}/itineraries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        day_number: nextDay,
        title: `Ngày ${nextDay}`,
        meal_note: "",
      }),
    });
    fetchTour();
  };

  const addDetail = async (itineraryId: string) => {
    await fetch(`${API}/itineraries/${itineraryId}/details`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "visit",
        title: "Hoạt động mới",
        content: "",
        order: 1,
      }),
    });
    fetchTour();
  };

  /* ================= UI ================= */
  return (
    <div className="bg-white p-6 rounded shadow text-black">
      <h1 className="text-xl font-bold mb-4">
        ✏️ Edit Tour: {tour.name}
      </h1>

      {/* TAB */}
      <div className="flex gap-3 border-b mb-6">
        {["info", "images", "descriptions", "itineraries"].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 border-b-2 ${
              tab === t ? "border-blue-600 text-blue-600" : "border-transparent"
            }`}
          >
            {t === "info" && "Thông tin"}
            {t === "images" && "Hình ảnh"}
            {t === "descriptions" && "Mô tả"}
            {t === "itineraries" && "Lịch trình"}
          </button>
        ))}
      </div>

      {/* INFO */}
      {tab === "info" && (
        <div className="space-y-4 max-w-xl">
          <input
            className="w-full border p-2 rounded"
            value={tour.name}
            onChange={e => setTour({ ...tour, name: e.target.value })}
          />

          <input
            className="w-full border p-2 rounded bg-gray-100"
            value={tour.slug}
            readOnly
          />

          <select
            className="w-full border p-2 rounded"
            value={tour.hotel_id?._id || ""}
            onChange={e =>
              setTour({
                ...tour,
                hotel_id: hotels.find(h => h._id === e.target.value),
              })
            }
          >
            <option value="">-- Chọn khách sạn --</option>
            {hotels.map(h => (
              <option key={h._id} value={h._id}>
                {h.name}
              </option>
            ))}
          </select>

          <select
            className="w-full border p-2 rounded"
            value={tour.category_id?._id || ""}
            onChange={e =>
              setTour({
                ...tour,
                category_id: categories.find(c => c._id === e.target.value),
              })
            }
          >
            <option value="">-- Chọn danh mục --</option>
            {categories.map(c => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          <button
            onClick={updateInfo}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Lưu
          </button>
        </div>
      )}

      {/* IMAGE */}
      {tab === "images" && (
        <>
          <input type="file" onChange={e => uploadImage(e.target.files![0])} />
          <div className="grid grid-cols-4 gap-4 mt-4">
            {tour.images.map(img => (
              <div key={img._id} className="relative">
                <img
                  src={img.image_url}
                  className="h-32 w-full object-cover rounded"
                />
                <button
                  onClick={() => deleteImage(img._id)}
                  className="absolute top-1 right-1 bg-black/60 text-white px-2 rounded"
                >
                  X
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* DESCRIPTION */}
      {tab === "descriptions" && (
        <>
          <input
            placeholder="Tiêu đề"
            value={descTitle}
            onChange={e => setDescTitle(e.target.value)}
            className="w-full border p-2 mb-2"
          />
          <textarea
            placeholder="Nội dung"
            value={descContent}
            onChange={e => setDescContent(e.target.value)}
            className="w-full border p-2 mb-2"
          />
          <button
            onClick={addDescription}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Thêm
          </button>

          {tour.descriptions.map(d => (
            <div key={d._id} className="border p-3 mt-3">
              <div className="font-medium">{d.title}</div>
              <pre className="text-sm whitespace-pre-wrap">{d.content}</pre>
              <button
                onClick={() => deleteDescription(d._id)}
                className="text-red-600 text-sm"
              >
                Xoá
              </button>
            </div>
          ))}
        </>
      )}

      {/* ITINERARY */}
      {tab === "itineraries" && (
        <>
          <button
            onClick={addDay}
            className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
          >
            + Thêm ngày
          </button>

          {tour.itineraries.map(day => (
            <div key={day._id} className="border p-4 mb-4">
              <div className="font-bold mb-2">
                Ngày {day.day_number}: {day.title}
              </div>

              {day.details.map(dt => (
                <div key={dt._id} className="text-sm border-l pl-3 mb-2">
                  • {dt.title}
                </div>
              ))}

              <button
                onClick={() => addDetail(day._id)}
                className="text-blue-600 text-sm"
              >
                + Thêm hoạt động
              </button>
            </div>
          ))}
        </>
      )}
    </div>
  );
}