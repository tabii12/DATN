"use client";

import { useState, useEffect, useMemo } from "react";

// --- Interfaces ---
interface TripService {
  service_id: string | any;
  unit_price: number;
  quantity: number;
  note?: string;
}

export interface Trip {
  _id: string;
  tour_id: string;
  start_date: string;
  end_date: string;
  services: TripService[];
  base_price: number;
  price: number;
  min_people: number;
  max_people: number;
  booked_people: number;
  status: "open" | "closed" | "full" | "deleted";
  createdAt?: string;
  updatedAt?: string;
}

interface Props {
  tourId: string;
  trips: Trip[];
  onRefresh: () => void;
}

interface GlobalService {
  _id: string;
  serviceName: string;
  basePrice: number;
  unit: string;
  type: string;
}

const API = "https://db-pickyourway.vercel.app/api";

const SERVICE_TYPES = [
  { value: "all", label: "Tất cả loại" },
  { value: "hotel", label: "Khách sạn" },
  { value: "transport", label: "Phương tiện" },
  { value: "restaurant", label: "Nhà hàng" },
  { value: "ticket", label: "Vé tham quan" },
  { value: "guide", label: "Hướng dẫn viên" },
  { value: "other", label: "Khác" },
];

export default function TourTrips({ tourId, trips, onRefresh }: Props) {
  // --- States ---
  const [loading, setLoading] = useState(false);
  const [globalServices, setGlobalServices] = useState<GlobalService[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [editingTripId, setEditingTripId] = useState<string | null>(null);

  const [tripForm, setTripForm] = useState({
    start_date: "",
    end_date: "",
    min_people: 1,
    max_people: 10,
    selected_services: [] as {
      service_id: string;
      quantity: number;
      note: string;
    }[],
  });

  // --- Fetch Initial Data ---
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch(`${API}/services/all`);
        const result = await res.json();
        if (result.success) {
          setGlobalServices(result.data);
        }
      } catch (error) {
        console.error("Lỗi lấy danh sách service:", error);
      }
    };
    fetchServices();
  }, []);

  // --- Search & Filter Logic ---
  const filteredServices = useMemo(() => {
    return globalServices.filter((service) => {
      const matchName = service.serviceName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchType = filterType === "all" || service.type === filterType;
      return matchName && matchType;
    });
  }, [globalServices, searchTerm, filterType]);

  // --- Form Handlers ---
  const toggleService = (service: GlobalService) => {
    setTripForm((prev) => {
      const isExisted = prev.selected_services.find(
        (s) => s.service_id === service._id,
      );
      if (isExisted) {
        return {
          ...prev,
          selected_services: prev.selected_services.filter(
            (s) => s.service_id !== service._id,
          ),
        };
      } else {
        return {
          ...prev,
          selected_services: [
            ...prev.selected_services,
            {
              service_id: service._id,
              quantity: 1,
              note: service.serviceName,
            },
          ],
        };
      }
    });
  };

  const updateServiceQty = (serviceId: string, qty: number) => {
    setTripForm((prev) => ({
      ...prev,
      selected_services: prev.selected_services.map((s) =>
        s.service_id === serviceId ? { ...s, quantity: Math.max(1, qty) } : s,
      ),
    }));
  };

  const handleEditClick = (trip: Trip) => {
    setEditingTripId(trip._id);

    // Convert ISO date to YYYY-MM-DD for input fields
    const formatDate = (dateStr: string) => {
      if (!dateStr) return "";
      return new Date(dateStr).toISOString().split("T")[0];
    };

    setTripForm({
      start_date: formatDate(trip.start_date),
      end_date: formatDate(trip.end_date),
      min_people: trip.min_people,
      max_people: trip.max_people,
      selected_services: trip.services.map((s) => ({
        service_id:
          typeof s.service_id === "string" ? s.service_id : s.service_id._id,
        quantity: s.quantity,
        note: s.note || "",
      })),
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setEditingTripId(null);
    setTripForm({
      start_date: "",
      end_date: "",
      min_people: 1,
      max_people: 10,
      selected_services: [],
    });
  };

  const handleSubmitTrip = async () => {
    if (!tripForm.start_date || !tripForm.end_date)
      return alert("Vui lòng chọn ngày");
    if (tripForm.selected_services.length === 0)
      return alert("Vui lòng chọn ít nhất 1 dịch vụ");

    try {
      setLoading(true);
      const isEdit = !!editingTripId;
      const url = isEdit
        ? `${API}/trips/${editingTripId}`
        : `${API}/trips/create`;
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tour_id: tourId,
          start_date: tripForm.start_date,
          end_date: tripForm.end_date,
          min_people: tripForm.min_people,
          max_people: tripForm.max_people,
          services: tripForm.selected_services,
        }),
      });

      if (res.ok) {
        alert(
          isEdit ? "Cập nhật chuyến đi thành công!" : "Thêm chuyến thành công!",
        );
        resetForm();
        onRefresh();
      } else {
        const err = await res.json();
        alert("Lỗi: " + err.message);
      }
    } catch (error) {
      console.error(error);
      alert("Cạn kiệt tài nguyên hoặc lỗi server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* FORM THIẾT LẬP (Dùng cho cả tạo và sửa) */}
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-xl uppercase tracking-tight text-gray-800 font-black">
              {editingTripId ? "Cập nhật chuyến đi" : "Thiết lập chuyến đi mới"}
            </h2>
            <p className="text-xs text-gray-400 font-bold">
              {editingTripId
                ? `Đang chỉnh sửa bản ghi: ${editingTripId}`
                : "Cấu hình thời gian, số lượng khách và dịch vụ"}
            </p>
          </div>
          {editingTripId && (
            <button
              onClick={resetForm}
              className="px-4 py-2 text-[10px] font-black uppercase text-red-500 bg-red-50 rounded-xl hover:bg-red-100 transition"
            >
              Hủy chỉnh sửa
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="space-y-2">
            <label className="text-[10px] text-gray-400 uppercase tracking-wider ml-1">
              Ngày bắt đầu
            </label>
            <input
              type="date"
              className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm text-gray-700 focus:ring-2 focus:ring-[#F26F21] outline-none"
              value={tripForm.start_date}
              onChange={(e) =>
                setTripForm({ ...tripForm, start_date: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] text-gray-400 uppercase tracking-wider ml-1">
              Ngày kết thúc
            </label>
            <input
              type="date"
              className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm text-gray-700 focus:ring-2 focus:ring-[#F26F21] outline-none"
              value={tripForm.end_date}
              onChange={(e) =>
                setTripForm({ ...tripForm, end_date: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] text-gray-400 uppercase tracking-wider ml-1">
              Khách tối thiểu
            </label>
            <input
              type="number"
              className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm text-gray-700 focus:ring-2 focus:ring-[#F26F21] outline-none"
              value={tripForm.min_people}
              onChange={(e) =>
                setTripForm({ ...tripForm, min_people: Number(e.target.value) })
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] text-gray-400 uppercase tracking-wider ml-1">
              Khách tối đa
            </label>
            <input
              type="number"
              className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm text-gray-700 focus:ring-2 focus:ring-[#F26F21] outline-none"
              value={tripForm.max_people}
              onChange={(e) =>
                setTripForm({ ...tripForm, max_people: Number(e.target.value) })
              }
            />
          </div>
        </div>

        {/* CHỌN DỊCH VỤ VỚI TÌM KIẾM */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <label className="text-[10px] text-gray-400 uppercase tracking-[0.15em] ml-1 block">
              Dịch vụ đi kèm ({filteredServices.length})
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Tìm tên dịch vụ..."
                className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#F26F21] w-full md:w-48"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select
                className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#F26F21] text-gray-600"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                {SERVICE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-h-[350px] overflow-y-auto p-1 pr-2 custom-scrollbar">
            {filteredServices.map((service) => {
              const selected = tripForm.selected_services.find(
                (s) => s.service_id === service._id,
              );
              return (
                <div
                  key={service._id}
                  onClick={() => toggleService(service)}
                  className={`p-4 rounded-2xl cursor-pointer transition-all border-2 ${
                    selected
                      ? "border-[#F26F21] bg-orange-50/50"
                      : "border-transparent bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 pr-2">
                      <span className="text-[8px] bg-white border border-gray-200 px-1 rounded text-gray-400 uppercase mb-1 block w-fit">
                        {service.type}
                      </span>
                      <p className="text-[11px] font-bold uppercase tracking-tight text-gray-700 leading-tight">
                        {service.serviceName}
                      </p>
                      <p className="text-[10px] text-[#F26F21] font-bold mt-1">
                        {service.basePrice.toLocaleString()}₫{" "}
                        <span className="text-gray-400 font-normal">
                          / {service.unit}
                        </span>
                      </p>
                    </div>
                    {selected && <CheckedIcon />}
                  </div>
                  {selected && (
                    <div
                      className="mt-3 pt-3 border-t border-[#F26F21]/10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-gray-400 font-bold uppercase">
                          Qty:
                        </span>
                        <input
                          type="number"
                          className="flex-1 p-1.5 bg-white border border-orange-100 rounded-lg text-center text-xs text-[#F26F21] font-black outline-none"
                          value={selected.quantity}
                          onChange={(e) =>
                            updateServiceQty(
                              service._id,
                              Number(e.target.value),
                            )
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <button
          onClick={handleSubmitTrip}
          disabled={loading}
          className="w-full py-4 bg-[#F26F21] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:opacity-90 transition shadow-xl shadow-orange-100 disabled:bg-gray-200"
        >
          {loading
            ? "Đang xử lý..."
            : editingTripId
              ? "Lưu cập nhật chuyến đi"
              : "Xác nhận tạo chuyến đi"}
        </button>
      </div>

      {/* DANH SÁCH CHUYẾN ĐI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trips.map((trip) => (
          <div
            key={trip._id}
            className="bg-white p-6 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-50 relative group transition-all hover:shadow-md hover:border-orange-100"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="bg-orange-50 text-[#F26F21] px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-orange-100 shadow-sm">
                {new Date(trip.start_date).toLocaleDateString("vi-VN")}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                <button
                  onClick={() => handleEditClick(trip)}
                  className="p-2 bg-gray-50 hover:bg-white hover:shadow-sm rounded-xl text-gray-400 hover:text-[#F26F21] transition border border-transparent hover:border-gray-100"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">
                  Giá bán tour
                </p>
                <p className="text-2xl font-black text-gray-800 tracking-tighter">
                  {trip.price?.toLocaleString()}
                  <span className="text-sm ml-1 text-[#F26F21]">₫</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-gray-50 pt-4">
                <div>
                  <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest mb-1">
                    Booked / Max
                  </p>
                  <div className="text-sm text-gray-700 font-bold">
                    <span className="text-[#F26F21]">
                      {trip.booked_people || 0}
                    </span>
                    <span className="text-gray-200 mx-1">/</span>
                    <span>{trip.max_people}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest mb-1">
                    Trạng thái
                  </p>
                  <span
                    className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg border ${
                      trip.status === "open"
                        ? "bg-green-50 text-green-600 border-green-100"
                        : "bg-red-50 text-red-500 border-red-100"
                    }`}
                  >
                    ● {trip.status}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-1.5">
                {trip.services?.length > 0 ? (
                  trip.services.map((s, idx) => (
                    <span
                      key={idx}
                      className="text-[9px] font-bold bg-gray-50 text-gray-400 px-2 py-1 rounded-lg uppercase border border-gray-100"
                    >
                      {s.note || "Dịch vụ"} x{s.quantity}
                    </span>
                  ))
                ) : (
                  <span className="text-[9px] text-gray-300 italic">
                    Không có dịch vụ
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        {trips.length === 0 && (
          <div className="col-span-full text-center py-20 bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-100">
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">
              Chưa có chuyến đi nào
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

const CheckedIcon = () => (
  <div className="w-5 h-5 bg-[#F26F21] rounded-full flex items-center justify-center shrink-0 shadow-md shadow-orange-200">
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="4"
    >
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  </div>
);
