"use client";
import React from "react";
import TourRow from "./TourRow";

const MAX_TOURS = 10;

interface TourListProps {
  tours: any[];
}

const TourList = ({ tours }: TourListProps) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // 1. Chỉ giữ tour có ít nhất 1 trip sắp tới (start_date >= hôm nay)
  const upcoming = tours
    .map(tour => {
      const futureTrips = (tour.trips ?? []).filter((t: any) => {
        const start = new Date(t.start_date);
        start.setHours(0, 0, 0, 0);
        return start >= now;
      });
      // Tìm ngày khởi hành gần nhất trong các trips tương lai
      const nearest = futureTrips.sort((a: any, b: any) =>
        new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
      )[0];
      return { ...tour, _nearestDate: nearest?.start_date ?? null };
    })
    .filter(tour => tour._nearestDate !== null); // bỏ tour không còn trip nào

  // 2. Sort theo ngày khởi hành gần nhất
  upcoming.sort((a, b) =>
    new Date(a._nearestDate).getTime() - new Date(b._nearestDate).getTime()
  );

  // 3. Lấy tối đa 10
  const displayed = upcoming.slice(0, MAX_TOURS);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          {displayed.length} tour sắp diễn ra gần nhất
        </span>
        {upcoming.length > MAX_TOURS && (
          <span className="text-xs text-gray-400">
            Hiển thị {MAX_TOURS}/{upcoming.length} tour
          </span>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-5 py-3">Tour</th>
              <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Địa điểm & Thời gian</th>
              <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-3">Chuyến đi</th>
              <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-3">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {displayed.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-16 text-center text-gray-400">
                  <p className="text-4xl mb-3">🗓️</p>
                  <p className="text-sm font-semibold">Không có tour sắp diễn ra</p>
                </td>
              </tr>
            ) : (
              displayed.map(tour => <TourRow key={tour._id} tour={tour} />)
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TourList;