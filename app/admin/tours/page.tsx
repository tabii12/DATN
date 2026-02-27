"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";


export default function AdminTours() {
    const router = useRouter();
    const [tours, setTours] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const ITEMS_PER_PAGE = 10;

    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(tours.length / ITEMS_PER_PAGE);

    const paginatedTours = tours.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );
    const [editingTour, setEditingTour] = useState<any | null>(null);
    const [editName, setEditName] = useState("");
    const [editStatus, setEditStatus] = useState("active");
    useEffect(() => {
        fetch("https://db-datn-six.vercel.app/api/tours")
            .then(res => res.json())
            .then(data => {
                setTours(data.data || []);
                setLoading(false);
            });
    }, []);

    const deleteTour = async (id: string) => {
        if (!confirm("Xoá tour này?")) return;

        try {
            const res = await fetch(
                `https://db-datn-six.vercel.app/api/tours/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: "Bearer TOKEN_ADMIN",
                    },
                }
            );

            if (!res.ok) throw new Error("Xoá thất bại");

            setTours(prev => prev.filter(t => t._id !== id));
            alert("✅ Đã xoá tour");
        } catch (err) {
            alert("❌ Không xoá được tour");
        }
    };
    if (loading) return <div>Đang tải...</div>;

    return (
        <div>
            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-bold text-black">🧳 Quản lý Tour</h1>
                <button
                    onClick={() => router.push("/admin/tours/create")}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                    + Thêm tour
                </button>
            </div>

            {/* TABLE */}
            <div className="bg-white rounded shadow overflow-x-auto text-black">
                <table className="w-full text-sm border-collapse">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-3 text-left font-semibold">Tour</th>
                            <th className="px-4 py-3 text-left font-semibold">Khách sạn</th>
                            <th className="px-4 py-3 text-left font-semibold">Danh mục</th>
                            <th className="px-4 py-3 text-left font-semibold">Thành phố</th>
                            <th className="px-4 py-3 text-left font-semibold">Trạng thái</th>
                            <th className="px-4 py-3 text-right font-semibold">Thao tác</th>
                        </tr>
                    </thead>

                    <tbody>
                        {tours.map((t) => (
                            <tr key={t._id} className="border-t hover:bg-gray-50 align-middle">
                                {/* TOUR INFO */}
                                <td className="px-4 py-3 align-middle">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={t.images?.[0]?.image_url || "/no-image.png"}
                                            alt={t.name}
                                            className="w-12 h-12 rounded object-cover border shrink-0"
                                        />
                                        <div className="leading-tight">
                                            <div className="font-medium">{t.name}</div>
                                            <div className="text-xs text-gray-500 truncate max-w-[260px]">
                                                {t.slug}
                                            </div>
                                        </div>
                                    </div>
                                </td>

                                {/* HOTEL */}
                                <td>
                                    {t.hotel_id ? (
                                        <div>
                                            <div className="font-medium">{t.hotel_id.name}</div>
                                            <div className="text-xs text-gray-500">
                                                ⭐ {t.hotel_id.rating}
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="text-gray-400">—</span>
                                    )}
                                </td>

                                {/* CATEGORY */}
                                <td>
                                    {t.category_id?.name || (
                                        <span className="text-gray-400">Chưa phân loại</span>
                                    )}
                                </td>

                                {/* CITY */}
                                <td>{t.hotel_id?.city || "—"}</td>

                                {/* STATUS */}
                                <td>
                                    <span
                                        className={`px-2 py-1 rounded text-xs ${t.status === "active"
                                            ? "bg-green-100 text-green-700"
                                            : "bg-gray-200 text-gray-600"
                                            }`}
                                    >
                                        {t.status}
                                    </span>
                                </td>

                                {/* ACTION */}
                                <td className="text-right pr-4 space-x-2">
                                    <button
                                        onClick={() => router.push(`/admin/tours/${t.slug}`)}
                                        className="text-blue-600 hover:underline"
                                    >
                                        Sửa
                                    </button>

                                    <button
                                        onClick={() => deleteTour(t._id)}
                                        className="text-red-600 hover:underline"
                                    >
                                        Xoá
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-6">
                        {Array.from({ length: totalPages }).map((_, i) => {
                            const page = i + 1;
                            return (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`px-3 py-1 rounded border text-sm ${currentPage === page
                                        ? "bg-blue-600 text-white border-blue-600"
                                        : "bg-white text-gray-700 hover:bg-gray-100"
                                        }`}
                                >
                                    {page}
                                </button>
                            );
                        })}
                    </div>
                )}
                {tours.length === 0 && (
                    <div className="p-6 text-center text-gray-500">
                        Chưa có tour nào
                    </div>
                )}
                {editingTour && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                        <div className="bg-white w-[400px] rounded shadow p-6">
                            <h2 className="text-lg font-bold mb-4">✏️ Sửa tour</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium">Tên tour</label>
                                    <input
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="w-full border px-3 py-2 rounded mt-1"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium">Trạng thái</label>
                                    <select
                                        value={editStatus}
                                        onChange={(e) => setEditStatus(e.target.value)}
                                        className="w-full border px-3 py-2 rounded mt-1"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={() => setEditingTour(null)}
                                    className="px-4 py-2 border rounded"
                                >
                                    Huỷ
                                </button>
                                <button
                                    onClick={async () => {
                                        try {
                                            const res = await fetch(
                                                `https://db-datn-six.vercel.app/api/tours/${editingTour._id}`,
                                                {
                                                    method: "PUT",
                                                    headers: {
                                                        "Content-Type": "application/json",
                                                        Authorization: "Bearer TOKEN_ADMIN",
                                                    },
                                                    body: JSON.stringify({
                                                        name: editName,
                                                        status: editStatus,
                                                    }),
                                                }
                                            );

                                            if (!res.ok) throw new Error();

                                            setTours(prev =>
                                                prev.map(t =>
                                                    t._id === editingTour._id
                                                        ? { ...t, name: editName, status: editStatus }
                                                        : t
                                                )
                                            );

                                            setEditingTour(null);
                                            alert("✅ Cập nhật thành công");
                                        } catch {
                                            alert("❌ Cập nhật thất bại");
                                        }
                                    }}
                                    className="px-4 py-2 bg-blue-600 text-white rounded"
                                >
                                    Lưu
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}