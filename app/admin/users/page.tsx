"use client";

import { useEffect, useState } from "react";

const API = "https://db-datn-six.vercel.app/api";
const ITEMS_PER_PAGE = 10;

interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  status: "active" | "inactive" | "banned";
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

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive" | "banned"
  >("all");
  const [filterRole, setFilterRole] = useState<"all" | "user" | "admin">("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Edit modal
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState<"user" | "admin">("user");
  const [editStatus, setEditStatus] = useState<
    "active" | "inactive" | "banned"
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
    fetch(`${API}/users`, {
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

  async function handleSave() {
    if (!editingUser) return;
    setSaving(true);
    try {
      const res = await fetch(`${API}/users/${editingUser._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          name: editName,
          role: editRole,
          status: editStatus,
        }),
      });
      if (!res.ok) throw new Error();
      setUsers((prev) =>
        prev.map((u) =>
          u._id === editingUser._id
            ? { ...u, name: editName, role: editRole, status: editStatus }
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
      const res = await fetch(`${API}/users/${deletingUser._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!res.ok) throw new Error();
      setUsers((prev) => prev.filter((u) => u._id !== deletingUser._id));
      setDeletingUser(null);
      showToast("Đã xóa người dùng!");
    } catch {
      showToast("Xóa thất bại, thử lại sau", "error");
    } finally {
      setDeleting(false);
    }
  }

  // Stats
  const totalActive = users.filter((u) => u.status === "active").length;
  const totalAdmin = users.filter((u) => u.role === "admin").length;
  const totalBanned = users.filter((u) => u.status === "banned").length;

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
            value: totalBanned,
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
                  className="hover:bg-gray-50/60 transition-colors"
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
                        onClick={() => openEdit(user)}
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition-colors"
                        title="Chỉnh sửa"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => setDeletingUser(user)}
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
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
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
                      e.target.value as "active" | "inactive" | "banned",
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
