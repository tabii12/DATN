// components/admin/TourList.tsx
import React from "react";
import TourRow from "./TourRow";

interface TourListProps {
  tours: any[];
}

const TourList = ({ tours }: TourListProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                Tour
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                Địa điểm & Thời gian
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                Danh sách Trip
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                Trạng thái
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tours.map((tour) => (
              <TourRow key={tour._id} tour={tour} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TourList;
