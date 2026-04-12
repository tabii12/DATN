"use client";

import { useState, useEffect } from "react";

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
  tour_name?: string;
  tour_thumb?: string;
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

export default function TourTrips({ tourId, trips, onRefresh }: Props) {
  const [loading, setLoading] = useState(false);
  const [globalServices, setGlobalServices] = useState<GlobalService[]>([]);

  // State cho Form tạo mới
  const [tripForm, setTripForm] = useState({
    start_date: "",
    end_date: "",
    min_people: 1,
    max_people: 10,
    selected_services: [] as { service_id: string; quantity: number }[],
  });

  // 1. Lấy danh sách service từ kho khi component mount
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch(`${API}/services`);
        const result = await res.json();
        if (result.success) setGlobalServices(result.data);
      } catch (error) {
        console.error("Lỗi lấy danh sách service:", error);
      }
    };
    fetchServices();
  }, []);

  // 2. Logic chọn/bỏ chọn service
  const toggleService = (serviceId: string) => {
    setTripForm((prev) => {
      const isExisted = prev.selected_services.find(
        (s) => s.service_id === serviceId,
      );
      if (isExisted) {
        return {
          ...prev,
          selected_services: prev.selected_services.filter(
            (s) => s.service_id !== serviceId,
          ),
        };
      } else {
        return {
          ...prev,
          selected_services: [
            ...prev.selected_services,
            { service_id: serviceId, quantity: 1 },
          ],
        };
      }
    });
  };

  // 3. Thay đổi số lượng cho service đã chọn
  const updateServiceQty = (serviceId: string, qty: number) => {
    setTripForm((prev) => ({
      ...prev,
      selected_services: prev.selected_services.map((s) =>
        s.service_id === serviceId ? { ...s, quantity: Math.max(1, qty) } : s,
      ),
    }));
  };

  // 4. Gửi dữ liệu lên Backend để tạo Trip
  const handleAddTrip = async () => {
    if (!tripForm.start_date || !tripForm.end_date)
      return alert("Vui lòng chọn ngày");
    if (tripForm.selected_services.length === 0)
      return alert("Vui lòng chọn ít nhất 1 dịch vụ để tính giá");

    try {
      setLoading(true);
      const res = await fetch(`${API}/trips/create`, {
        method: "POST",
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

      const result = await res.json();
      if (res.ok) {
        alert("Tạo chuyến đi thành công!");
        setTripForm({
          start_date: "",
          end_date: "",
          min_people: 1,
          max_people: 10,
          selected_services: [],
        });
        onRefresh();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* --- PHẦN 1: FORM THIẾT LẬP CHUYẾN ĐI MỚI --- */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <h3 className="text-sm font-black uppercase text-gray-400 mb-5">
          Cài đặt chuyến khởi hành mới
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cột 1: Thời gian & Số lượng khách */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500">
                  NGÀY BẮT ĐẦU
                </label>
                <input
                  type="date"
                  className="w-full p-2.5 border rounded-xl text-sm"
                  value={tripForm.start_date}
                  onChange={(e) =>
                    setTripForm({ ...tripForm, start_date: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500">
                  NGÀY KẾT THÚC
                </label>
                <input
                  type="date"
                  className="w-full p-2.5 border rounded-xl text-sm"
                  value={tripForm.end_date}
                  onChange={(e) =>
                    setTripForm({ ...tripForm, end_date: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500">
                  MIN PEOPLE
                </label>
                <input
                  type="number"
                  className="w-full p-2.5 border rounded-xl text-sm"
                  value={tripForm.min_people}
                  onChange={(e) =>
                    setTripForm({
                      ...tripForm,
                      min_people: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500">
                  MAX PEOPLE
                </label>
                <input
                  type="number"
                  className="w-full p-2.5 border rounded-xl text-sm"
                  value={tripForm.max_people}
                  onChange={(e) =>
                    setTripForm({
                      ...tripForm,
                      max_people: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* Cột 2 & 3: Chọn Service từ kho (Logic tính giá tự động) */}
          <div className="lg:col-span-2">
            <label className="text-[10px] font-bold text-gray-500 mb-2 block uppercase">
              Chọn dịch vụ đi kèm (BE tự động tính giá)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-55 overflow-y-auto p-1 border-l pl-4 border-gray-100">
              {globalServices.map((service) => {
                const selected = tripForm.selected_services.find(
                  (s) => s.service_id === service._id,
                );
                return (
                  <div
                    key={service._id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      selected
                        ? "border-blue-500 bg-blue-50/50"
                        : "border-gray-100 bg-gray-50 hover:border-gray-200"
                    }`}
                  >
                    <div
                      className="flex items-center gap-3 cursor-pointer flex-1"
                      onClick={() => toggleService(service._id)}
                    >
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center ${selected ? "bg-blue-500 border-blue-500 text-white" : "bg-white border-gray-300"}`}
                      >
                        {selected && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="10"
                            height="10"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="4"
                          >
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-gray-700 leading-tight">
                          {service.serviceName}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {service.basePrice.toLocaleString()}₫/{service.unit}
                        </p>
                      </div>
                    </div>
                    {selected && (
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[8px] font-bold text-blue-600 uppercase">
                          Số lượng
                        </span>
                        <input
                          type="number"
                          className="w-10 p-1 border rounded bg-white text-[11px] text-center font-bold"
                          value={selected.quantity}
                          onChange={(e) =>
                            updateServiceQty(
                              service._id,
                              Number(e.target.value),
                            )
                          }
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-100 flex justify-end">
          <button
            onClick={handleAddTrip}
            disabled={loading}
            className="bg-gray-900 text-white px-10 py-3 rounded-xl font-bold text-sm hover:bg-black transition shadow-lg disabled:bg-gray-300"
          >
            {loading ? "ĐANG XỬ LÝ..." : "TẠO CHUYẾN ĐI & TÍNH GIÁ"}
          </button>
        </div>
      </div>

      {/* --- PHẦN 2: DANH SÁCH CÁC CHUYẾN ĐI ĐÃ TẠO --- */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-sm font-black uppercase text-gray-500">
            Danh sách chuyến khởi hành
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-[10px] text-gray-400 font-black uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="p-4">Ngày khởi hành</th>
                <th className="p-4 text-center">Tình trạng chỗ</th>
                <th className="p-4">Giá bán (₫)</th>
                <th className="p-4">Dịch vụ bao gồm</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {trips.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="p-10 text-center text-gray-400 italic"
                  >
                    Chưa có chuyến đi nào được thiết lập.
                  </td>
                </tr>
              ) : (
                trips.map((trip) => (
                  <tr key={trip._id} className="hover:bg-gray-50/50 transition">
                    <td className="p-4">
                      <div className="font-bold text-gray-800 uppercase text-xs">
                        {new Date(trip.start_date).toLocaleDateString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </div>
                      <div className="text-[10px] text-gray-400 font-medium">
                        Kết thúc:{" "}
                        {new Date(trip.end_date).toLocaleDateString("vi-VN")}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col items-center">
                        <div className="text-[11px] font-bold mb-1">
                          <span className="text-blue-600">
                            {trip.booked_people || 0}
                          </span>
                          <span className="text-gray-300 mx-1">/</span>
                          <span className="text-gray-600">
                            {trip.max_people}
                          </span>
                        </div>
                        <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 transition-all duration-500"
                            style={{
                              width: `${((trip.booked_people || 0) / trip.max_people) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-black text-emerald-600 text-sm">
                        {trip.price?.toLocaleString()}₫
                      </div>
                      <div className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">
                        Giá gốc đầu người: {trip.base_price?.toLocaleString()}₫
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1 max-w-50">
                        {trip.services?.map((s, idx) => (
                          <span
                            key={idx}
                            className="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-[9px] font-bold whitespace-nowrap"
                            title={s.note}
                          >
                            {s.note || "Dịch vụ"}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${
                          trip.status === "open"
                            ? "bg-green-100 text-green-600"
                            : trip.status === "full"
                              ? "bg-orange-100 text-orange-600"
                              : "bg-red-100 text-red-600"
                        }`}
                      >
                        {trip.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button className="text-blue-500 hover:underline text-xs font-bold">
                        Sửa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
