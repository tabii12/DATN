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

  // State Form giữ nguyên các field cũ, chỉ bỏ base_price, thêm selected_services
  const [tripForm, setTripForm] = useState({
    start_date: "",
    end_date: "",
    min_people: 1,
    max_people: 10,
    selected_services: [] as { service_id: string; quantity: number }[],
  });

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

  const updateServiceQty = (serviceId: string, qty: number) => {
    setTripForm((prev) => ({
      ...prev,
      selected_services: prev.selected_services.map((s) =>
        s.service_id === serviceId ? { ...s, quantity: Math.max(1, qty) } : s,
      ),
    }));
  };

  const handleAddTrip = async () => {
    if (!tripForm.start_date || !tripForm.end_date)
      return alert("Vui lòng chọn ngày");
    if (tripForm.selected_services.length === 0)
      return alert("Vui lòng chọn ít nhất 1 dịch vụ");

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

      if (res.ok) {
        alert("Thêm chuyến thành công!");
        setTripForm({
          start_date: "",
          end_date: "",
          min_people: 1,
          max_people: 10,
          selected_services: [],
        });
        onRefresh();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-bold mb-4 text-gray-800">
        Thêm chuyến đi mới
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">
            Ngày bắt đầu
          </label>
          <input
            type="date"
            className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
            value={tripForm.start_date}
            onChange={(e) =>
              setTripForm({ ...tripForm, start_date: e.target.value })
            }
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">
            Ngày kết thúc
          </label>
          <input
            type="date"
            className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
            value={tripForm.end_date}
            onChange={(e) =>
              setTripForm({ ...tripForm, end_date: e.target.value })
            }
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">
            Min People
          </label>
          <input
            type="number"
            className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
            value={tripForm.min_people}
            onChange={(e) =>
              setTripForm({ ...tripForm, min_people: Number(e.target.value) })
            }
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">
            Max People
          </label>
          <input
            type="number"
            className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
            value={tripForm.max_people}
            onChange={(e) =>
              setTripForm({ ...tripForm, max_people: Number(e.target.value) })
            }
          />
        </div>
      </div>

      {/* Phần chọn dịch vụ thay thế cho ô nhập giá */}
      <div className="mb-6">
        <label className="block text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">
          Chọn dịch vụ bao gồm (Hệ thống sẽ tự động tính giá)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {globalServices.map((service) => {
            const isSelected = tripForm.selected_services.find(
              (s) => s.service_id === service._id,
            );
            return (
              <div
                key={service._id}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? "border-blue-500 bg-blue-50/50"
                    : "border-gray-100 bg-gray-50 hover:border-gray-200"
                }`}
                onClick={() => toggleService(service._id)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center ${isSelected ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-gray-300"}`}
                  >
                    {isSelected && (
                      <svg
                        width="12"
                        height="12"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        viewBox="0 0 24 24"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-700">
                      {service.serviceName}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {service.basePrice.toLocaleString()}₫/{service.unit}
                    </p>
                  </div>
                </div>
                {isSelected && (
                  <div onClick={(e) => e.stopPropagation()}>
                    <input
                      type="number"
                      className="w-10 p-1 text-center bg-white border border-gray-200 rounded text-xs font-bold"
                      value={isSelected.quantity}
                      onChange={(e) =>
                        updateServiceQty(service._id, Number(e.target.value))
                      }
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={handleAddTrip}
        disabled={loading}
        className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition disabled:bg-gray-300 shadow-md shadow-blue-100"
      >
        {loading ? "Đang xử lý..." : "Xác nhận thêm chuyến khởi hành"}
      </button>

      <div className="mt-10 pt-8 border-t border-gray-50">
        <h3 className="text-lg font-bold mb-6 text-gray-800">
          Danh sách chuyến hiện có
        </h3>
        {/* Phần bảng danh sách bên dưới giữ nguyên code table của bạn */}
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-wider">
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
              {trips.map((trip) => (
                <tr key={trip._id} className="hover:bg-gray-50/50 transition">
                  {/* ... (Các thẻ td giữ nguyên nội dung hiển thị cũ của bạn) ... */}
                  <td className="p-4 font-bold text-xs text-gray-700">
                    {new Date(trip.start_date).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-xs font-bold text-blue-600">
                      {trip.booked_people}
                    </span>
                    <span className="text-gray-300 mx-1">/</span>
                    <span className="text-xs text-gray-600">
                      {trip.max_people}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-emerald-600">
                      {trip.price?.toLocaleString()}₫
                    </div>
                    <div className="text-[9px] text-gray-400">
                      Gốc: {trip.base_price?.toLocaleString()}₫
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {trip.services?.map((s, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-[4px] text-[9px] font-bold"
                        >
                          {s.note || "Dịch vụ"}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded text-[9px] font-black uppercase ${trip.status === "open" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
