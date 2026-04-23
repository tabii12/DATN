"use client";

import { useEffect, useState } from "react";

const API = "https://db-pickyourway.vercel.app/api/users";
const BOOKINGS_API = "https://db-pickyourway.vercel.app/api/bookings";
const ITEMS_PER_PAGE = 10;

interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  status: "active" | "inactive" | "blocked";
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(-2)
    .join("")
    .toUpperCase();
  const colors = [
    "bg-blue-100 text-blue-600",
    "bg-orange-100 text-orange-600",
    "bg-purple-100 text-purple-600",
    "bg-green-100 text-green-600",
    "bg-pink-100 text-pink-600",
  ];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div
      className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${color}`}
    >
      {initials}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: "bg-emerald-50 text-emerald-600",
    inactive: "bg-gray-100 text-gray-400",
    banned: "bg-red-50 text-red-500",
  };
  const dot: Record<string, string> = {
    active: "bg-emerald-500",
    inactive: "bg-gray-300",
    banned: "bg-red-400",
  };
  const label: Record<string, string> = {
    active: "Hoạt động",
    inactive: "Không hoạt động",
    banned: "Bị khóa",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full ${map[status] ?? map.inactive}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full inline-block ${dot[status] ?? dot.inactive}`}
      />
      {label[status] ?? status}
    </span>
  );
}

function RoleBadge({ role }: { role: string }) {
  return role === "admin" ? (
    <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full">
      👑 Admin
    </span>
  ) : (
    <span className="inline-flex items-center text-[11px] font-semibold bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">
      User
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function parseApiDate(d: any): string {
  return (d && typeof d === "object" && "$date" in d ? d.$date : d) || "";
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive" | "banned"
  >("all");
  const [filterRole, setFilterRole] = useState<"all" | "user" | "admin">("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Details modal
  const [detailUserId, setDetailUserId] = useState<string | null>(null);
  const [detailUser, setDetailUser] = useState<User | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailBookingCount, setDetailBookingCount] = useState<number | null>(
    null,
  );
  const [detailCustomerType, setDetailCustomerType] = useState<
    "new" | "returning" | "none" | null
  >(null);
  const [detailFirstBookingAt, setDetailFirstBookingAt] = useState<string | null>(
    null,
  );
  const [detailLastBookingAt, setDetailLastBookingAt] = useState<string | null>(
    null,
  );

  // Edit modal
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState<"user" | "admin">("user");
  const [editStatus, setEditStatus] = useState<
    "active" | "inactive" | "blocked"
  >("active");
  const [saving, setSaving] = useState(false);

  // Delete confirm
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Toast
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  useEffect(() => {
    fetch(`${API}/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((r) => r.json())
      .then((d) => setUsers(d.data || []))
      .catch(() => showToast("Không tải được danh sách người dùng", "error"))
      .finally(() => setLoading(false));
  }, []);

  // Filter + search
  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q);
    const matchStatus = filterStatus === "all" || u.status === filterStatus;
    const matchRole = filterRole === "all" || u.role === filterRole;
    return matchSearch && matchStatus && matchRole;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  function openEdit(user: User) {
    setEditingUser(user);
    setEditName(user.name);
    setEditRole(user.role);
    setEditStatus(user.status);
  }

  async function openDetails(user: User) {
    setDetailUserId(user._id);
    setDetailUser(null);
    setDetailLoading(true);
    setDetailBookingCount(null);
    setDetailCustomerType(null);
    setDetailFirstBookingAt(null);
    setDetailLastBookingAt(null);
    try {
      const token = localStorage.getItem("token");
      const [resUser, resBookings] = await Promise.all([
        fetch(`${API}/${user._id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(`${BOOKINGS_API}/admin/all`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      const dUser = await resUser.json().catch(() => null);
      if (!resUser.ok) throw new Error();
      setDetailUser((dUser?.data as User) || user);

      const dBookings = await resBookings.json().catch(() => null);
      const rawBookings: any[] = Array.isArray(dBookings)
        ? dBookings
        : (dBookings?.data ?? []);
      const userBookings = rawBookings.filter(
        (b) => b?.user_id?._id === user._id,
      );

      const dates = userBookings
        .map((b) => parseApiDate(b?.createdAt))
        .filter(Boolean)
        .map((s) => new Date(s))
        .filter((dt) => !isNaN(dt.getTime()))
        .sort((a, b) => a.getTime() - b.getTime());

      const count = userBookings.length;
      setDetailBookingCount(count);
      if (dates.length > 0) {
        setDetailFirstBookingAt(dates[0].toISOString());
        setDetailLastBookingAt(dates[dates.length - 1].toISOString());
      }

      if (count === 0) {
        setDetailCustomerType("none");
      } else {
        // Heuristic: nếu chỉ có 1 booking và booking đầu trong 30 ngày => khách mới
        const first = dates[0];
        const within30Days =
          first &&
          Date.now() - first.getTime() <= 30 * 24 * 60 * 60 * 1000;
        const isNew = count === 1 && within30Days;
        setDetailCustomerType(isNew ? "new" : "returning");
      }
    } catch {
      showToast("Không tải được chi tiết người dùng", "error");
      setDetailUser(user);
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleSave() {
    if (!editingUser) return;
    setSaving(true);
    try {
      const resRole = await fetch(`${API}/role/${editingUser._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ role: editRole }),
      });
      if (!resRole.ok) throw new Error();

      const resStatus = await fetch(`${API}/status/${editingUser._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          status: editStatus,
        }),
      });
      if (!resStatus.ok) throw new Error();

      setUsers((prev) =>
        prev.map((u) =>
          u._id === editingUser._id
            ? { ...u, role: editRole, status: editStatus }
            : u,
        ),
      );
      setEditingUser(null);
      showToast("Cập nhật thành công!");
    } catch {
      showToast("Lưu thất bại, thử lại sau", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deletingUser) return;
    setDeleting(true);
    try {
      showToast(
        "API hiện tại không có endpoint xóa user (chỉ có status/role).",
        "error",
      );
    } catch {
      showToast("Xóa thất bại, thử lại sau", "error");
    } finally {
      setDeleting(false);
    }
  }

  // Stats
  const totalActive = users.filter((u) => u.status === "active").length;
  const totalAdmin = users.filter((u) => u.role === "admin").length;
  const totalBlocked = users.filter((u) => u.status === "blocked").length;

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold text-white transition-all ${toast.type === "success" ? "bg-emerald-500" : "bg-red-500"}`}
        >
          {toast.type === "success" ? "✓ " : "✕ "}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Quản lý người dùng
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Tổng {users.length} tài khoản
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Tổng tài khoản",
            value: users.length,
            icon: "👥",
            color: "text-blue-600 bg-blue-50",
          },
          {
            label: "Đang hoạt động",
            value: totalActive,
            icon: "✅",
            color: "text-emerald-600 bg-emerald-50",
          },
          {
            label: "Quản trị viên",
            value: totalAdmin,
            icon: "👑",
            color: "text-indigo-600 bg-indigo-50",
          },
          {
            label: "Bị khóa",
            value: totalBlocked,
            icon: "🚫",
            color: "text-red-600 bg-red-50",
          },
        ].map(({ label, value, icon, color }) => (
          <div
            key={label}
            className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3 shadow-sm"
          >
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl ${color}`}
            >
              {icon}
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900">{value}</p>
              <p className="text-xs text-gray-400">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4 flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Tìm tên, email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="border border-gray-200 rounded-xl px-4 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-orange-300"
        />
        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value as typeof filterStatus);
            setCurrentPage(1);
          }}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Hoạt động</option>
          <option value="inactive">Không hoạt động</option>
          <option value="banned">Bị khóa</option>
        </select>
        <select
          value={filterRole}
          onChange={(e) => {
            setFilterRole(e.target.value as typeof filterRole);
            setCurrentPage(1);
          }}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
        >
          <option value="all">Tất cả vai trò</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        {(search || filterStatus !== "all" || filterRole !== "all") && (
          <button
            onClick={() => {
              setSearch("");
              setFilterStatus("all");
              setFilterRole("all");
              setCurrentPage(1);
            }}
            className="text-xs text-gray-400 hover:text-gray-600 underline"
          >
            Xóa bộ lọc
          </button>
        )}
        <span className="ml-auto text-xs text-gray-400">
          {filtered.length} kết quả
        </span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-24 text-gray-400 gap-3">
            <svg
              className="animate-spin w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              />
            </svg>
            Đang tải...
          </div>
        ) : paginated.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-sm">Không tìm thấy người dùng nào</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-400 uppercase tracking-wider">
                <th className="text-left px-5 py-3 font-semibold">
                  Người dùng
                </th>
                <th className="text-left px-4 py-3 font-semibold">Email</th>
                <th className="text-left px-4 py-3 font-semibold">Vai trò</th>
                <th className="text-left px-4 py-3 font-semibold">
                  Trạng thái
                </th>
                <th className="text-left px-4 py-3 font-semibold">Xác thực</th>
                <th className="text-left px-4 py-3 font-semibold">Ngày tạo</th>
                <th className="text-right px-5 py-3 font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.map((user) => (
                <tr
                  key={user._id}
                  onClick={() => openDetails(user)}
                  className="hover:bg-gray-50/60 transition-colors cursor-pointer"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar name={user.name} />
                      <div>
                        <p className="font-semibold text-gray-900 text-sm leading-tight">
                          {user.name}
                        </p>
                        <p className="text-[11px] text-gray-400 font-mono">
                          {user._id.slice(-8)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-gray-500">{user.email}</td>
                  <td className="px-4 py-3.5">
                    <RoleBadge role={user.role} />
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={user.status} />
                  </td>
                  <td className="px-4 py-3.5">
                    {user.isVerified ? (
                      <span
                        className="text-emerald-500 text-base"
                        title="Đã xác thực"
                      >
                        ✔
                      </span>
                    ) : (
                      <span
                        className="text-gray-300 text-base"
                        title="Chưa xác thực"
                      >
                        ✖
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-gray-400 text-xs">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEdit(user);
                        }}
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition-colors"
                        title="Chỉnh sửa"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingUser(user);
                        }}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                        title="Xóa"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm">
          <span className="text-gray-400 text-xs">
            Trang {currentPage} / {totalPages} — {filtered.length} người dùng
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => Math.abs(p - currentPage) <= 2)
              .map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${p === currentPage ? "bg-orange-500 text-white border-orange-500" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}
                >
                  {p}
                </button>
              ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ›
            </button>
          </div>
        </div>
      )}

      {/* ── EDIT MODAL ── */}
      {editingUser && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">
                Chỉnh sửa người dùng
              </h2>
              <button
                onClick={() => setEditingUser(null)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="flex items-center gap-3 mb-5 p-3 bg-gray-50 rounded-xl">
              <Avatar name={editingUser.name} />
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  {editingUser.email}
                </p>
                <p className="text-xs text-gray-400">
                  ID: {editingUser._id.slice(-10)}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                  Tên hiển thị
                </label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                  Vai trò
                </label>
                <select
                  value={editRole}
                  onChange={(e) =>
                    setEditRole(e.target.value as "user" | "admin")
                  }
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                >
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                  Trạng thái
                </label>
                <select
                  value={editStatus}
                  onChange={(e) =>
                    setEditStatus(
                      e.target.value as "active" | "inactive" | "blocked",
                    )
                  }
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                >
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Không hoạt động</option>
                  <option value="banned">Khóa tài khoản</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingUser(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition-colors disabled:opacity-60"
              >
                {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DETAILS MODAL ── */}
      {detailUserId && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">
                Chi tiết người dùng
              </h2>
              <button
                onClick={() => {
                  setDetailUserId(null);
                  setDetailUser(null);
                  setDetailBookingCount(null);
                  setDetailCustomerType(null);
                  setDetailFirstBookingAt(null);
                  setDetailLastBookingAt(null);
                }}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="flex items-center gap-3 mb-5 p-3 bg-gray-50 rounded-xl">
              <Avatar name={detailUser?.name || "User"} />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {detailUser?.name || "Đang tải..."}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {detailUser?.email || ""}
                </p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                {detailUser?.role && <RoleBadge role={detailUser.role} />}
                {detailUser?.status && <StatusBadge status={detailUser.status} />}
              </div>
            </div>

            {detailLoading ? (
              <div className="flex items-center justify-center py-10 text-gray-400 gap-3">
                <svg
                  className="animate-spin w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
                Đang tải chi tiết...
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="border border-gray-100 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">User ID</p>
                  <p className="font-mono text-gray-700 break-all">
                    {detailUser?._id || ""}
                  </p>
                </div>
                  <div className="border border-gray-100 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-1">Số tour đã đặt</p>
                    <p className="text-gray-700 font-semibold">
                      {detailBookingCount === null ? "—" : detailBookingCount}
                    </p>
                  </div>
                  <div className="border border-gray-100 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-1">Loại khách</p>
                    <p className="text-gray-700 font-semibold">
                      {detailCustomerType === null
                        ? "—"
                        : detailCustomerType === "none"
                          ? "Chưa đặt tour"
                          : detailCustomerType === "new"
                            ? "Khách hàng mới"
                            : "Khách hàng cũ"}
                    </p>
                  </div>
                <div className="border border-gray-100 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">Xác thực</p>
                  <p className="text-gray-700 font-semibold">
                    {detailUser?.isVerified ? "Đã xác thực" : "Chưa xác thực"}
                  </p>
                </div>
                <div className="border border-gray-100 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">Ngày tạo</p>
                  <p className="text-gray-700 font-semibold">
                    {detailUser?.createdAt ? formatDate(detailUser.createdAt) : ""}
                  </p>
                </div>
                <div className="border border-gray-100 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">Cập nhật</p>
                  <p className="text-gray-700 font-semibold">
                    {detailUser?.updatedAt ? formatDate(detailUser.updatedAt) : ""}
                  </p>
                </div>
                  <div className="border border-gray-100 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-1">Lần đặt đầu</p>
                    <p className="text-gray-700 font-semibold">
                      {detailFirstBookingAt ? formatDate(detailFirstBookingAt) : "—"}
                    </p>
                  </div>
                  <div className="border border-gray-100 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-1">Lần đặt gần nhất</p>
                    <p className="text-gray-700 font-semibold">
                      {detailLastBookingAt ? formatDate(detailLastBookingAt) : "—"}
                    </p>
                  </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setDetailUserId(null);
                  setDetailUser(null);
                  setDetailBookingCount(null);
                  setDetailCustomerType(null);
                  setDetailFirstBookingAt(null);
                  setDetailLastBookingAt(null);
                }}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM MODAL ── */}
      {deletingUser && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="text-5xl mb-3">🗑️</div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              Xóa người dùng?
            </h2>
            <p className="text-sm text-gray-500 mb-1">
              Bạn có chắc muốn xóa tài khoản
            </p>
            <p className="font-semibold text-gray-800 mb-5">
              "{deletingUser.name}"?
            </p>
            <p className="text-xs text-red-400 mb-6">
              Hành động này không thể hoàn tác.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingUser(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold disabled:opacity-60"
              >
                {deleting ? "Đang xóa..." : "Xóa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
