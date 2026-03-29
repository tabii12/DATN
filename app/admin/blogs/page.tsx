"use client";

import { useState, useEffect } from "react";

const API = "https://db-datn-six.vercel.app/api/blogs";

type Blog = {
    _id: string;
    slug: string;
    title: string;
    content: string;
    status: "draft" | "published";
    createdAt: string;
    images?: { image_url: string }[];
};

type View = "list" | "create" | "edit";

function StatusBadge({ status }: { status: string }) {
    return (
        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${status === "published"
            ? "bg-emerald-50 text-emerald-600"
            : "bg-gray-100 text-gray-400"
            }`}>
            {status === "published" ? "Đã đăng" : "Nháp"}
        </span>
    );
}

export default function AdminBlogs() {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<View>("list");
    const [editing, setEditing] = useState<Blog | null>(null);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState("");

    // form state
    const [formTitle, setFormTitle] = useState("");
    const [formContent, setFormContent] = useState("");
    const [formStatus, setFormStatus] = useState<"draft" | "published">("draft");
    const [formImageUrl, setFormImageUrl] = useState("");
    const fetchBlogs = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API}/`);
            const data = await res.json();
            setBlogs(Array.isArray(data) ? data : data.data || []);
        } catch { setBlogs([]); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchBlogs(); }, []);

    const openCreate = () => {
        setEditing(null);
        setFormTitle("");
        setFormContent("");
        setFormStatus("draft");
        setFormImageUrl("");
        setView("create");
    };

    const openEdit = (blog: Blog) => {
        setEditing(blog);
        setFormTitle(blog.title);
        setFormContent(blog.content);
        setFormStatus(blog.status);
        setFormImageUrl(blog.images?.[0]?.image_url ?? "");
        setView("edit");
    };

    const handleCreate = async () => {
        if (!formTitle.trim() || !formContent.trim()) return;
        setSaving(true);
        try {
            const res = await fetch(`${API}/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: formTitle, content: formContent, status: formStatus, image_url: formImageUrl || undefined }),
            });
            const data = await res.json();
            if (!res.ok) { alert(data.message || "Tạo thất bại"); return; }
            await fetchBlogs();
            setView("list");
        } finally { setSaving(false); }
    };

    const handleUpdateContent = async () => {
        if (!editing || !formContent.trim()) return;
        setSaving(true);
        try {
            const res = await fetch(`${API}/${editing.slug}/content`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: formTitle, content: formContent, image_url: formImageUrl || undefined }),
            });
            const data = await res.json();
            if (!res.ok) { alert(data.message || "Cập nhật thất bại"); return; }

            // update status nếu thay đổi
            if (formStatus !== editing.status) {
                await fetch(`${API}/${editing.slug}/status`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: formStatus }),
                });
            }
            await fetchBlogs();
            setView("list");
        } finally { setSaving(false); }
    };

    const handleToggleStatus = async (blog: Blog) => {
        const newStatus = blog.status === "published" ? "draft" : "published";
        await fetch(`${API}/${blog.slug}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus }),
        });
        await fetchBlogs();
    };

    const handleDelete = async (blog: Blog) => {
        if (!confirm(`Xoá bài "${blog.title}"?`)) return;
        await fetch(`${API}/${blog.slug}`, { method: "DELETE" });
        await fetchBlogs();
    };

    const filtered = blogs.filter(b =>
        b.title.toLowerCase().includes(search.toLowerCase())
    );

    const PAGE_SIZE = 10;
    const [page, setPage] = useState(1);
    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    // ── LIST VIEW ──
    if (view === "list") return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                <div>
                    <h1 className="text-base font-black text-gray-900">📝 Quản lý Blog</h1>
                    <p className="text-[11px] text-gray-400 mt-0.5">{blogs.length} bài viết</p>
                </div>
                <button onClick={openCreate}
                    className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-4 py-2 rounded-xl border-none cursor-pointer transition-colors">
                    + Tạo bài viết
                </button>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
                {/* Search */}
                <div className="bg-white rounded-xl border border-gray-100 px-4 py-2.5 flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Tìm bài viết..."
                        className="text-sm bg-transparent border-none outline-none text-gray-700 placeholder-gray-400 w-full" />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                    {[
                        ["Tổng bài", blogs.length, "text-gray-800"],
                        ["Đã đăng", blogs.filter(b => b.status === "published").length, "text-emerald-600"],
                        ["Nháp", blogs.filter(b => b.status === "draft").length, "text-gray-400"],
                    ].map(([label, count, color]) => (
                        <div key={label as string} className="bg-white rounded-xl border border-gray-100 px-4 py-3 text-center">
                            <p className={`text-2xl font-black ${color}`}>{count}</p>
                            <p className="text-[11px] text-gray-400 mt-0.5">{label}</p>
                        </div>
                    ))}
                </div>

                {/* Blog list */}
                {loading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
                                <div className="flex gap-4">
                                    <div className="w-20 h-14 bg-gray-200 rounded-lg shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-gray-200 rounded w-2/3" />
                                        <div className="h-3 bg-gray-200 rounded w-full" />
                                        <div className="h-3 bg-gray-200 rounded w-1/3" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-100 py-16 text-center text-gray-400">
                        <p className="text-4xl mb-3">📭</p>
                        <p className="font-semibold text-sm">Không có bài viết nào</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {paginated.map(blog => (
                            <div key={blog._id} className="bg-white rounded-xl border border-gray-100 p-4 group hover:shadow-sm transition-shadow">
                                <div className="flex gap-4 items-start">
                                    {/* Thumbnail */}
                                    <div className="w-20 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                                        {blog.images?.[0]?.image_url ? (
                                            <img src={blog.images[0].image_url} alt={blog.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-2xl">📝</div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-gray-900 line-clamp-1">{blog.title}</p>
                                                <p className="text-[11px] text-gray-400 font-mono mt-0.5">{blog.slug}</p>
                                                <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                                                    {blog.content?.replace(/<[^>]*>/g, "").slice(0, 120)}...
                                                </p>
                                            </div>
                                            <StatusBadge status={blog.status} />
                                        </div>

                                        <div className="flex items-center justify-between mt-2.5">
                                            <span className="text-[11px] text-gray-400">
                                                {new Date(blog.createdAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}
                                            </span>
                                            <div className="flex items-center gap-1">
                                                <a href={`/blogs/${blog.slug}`} target="_blank"
                                                    className="text-xs text-blue-400 hover:bg-blue-50 px-2.5 py-1.5 rounded-lg no-underline font-semibold transition-colors">
                                                    Xem
                                                </a>
                                                <button onClick={() => handleToggleStatus(blog)}
                                                    className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border-none cursor-pointer transition-colors ${blog.status === "published"
                                                        ? "text-amber-500 hover:bg-amber-50"
                                                        : "text-emerald-500 hover:bg-emerald-50"
                                                        } bg-transparent`}>
                                                    {blog.status === "published" ? "Ẩn" : "Đăng"}
                                                </button>
                                                <button onClick={() => openEdit(blog)}
                                                    className="text-xs text-blue-500 hover:bg-blue-50 px-2.5 py-1.5 rounded-lg border-none cursor-pointer bg-transparent font-semibold transition-colors">
                                                    Sửa
                                                </button>
                                                <button onClick={() => handleDelete(blog)}
                                                    className="text-xs text-red-400 hover:bg-red-50 px-2.5 py-1.5 rounded-lg border-none cursor-pointer bg-transparent font-semibold transition-colors">
                                                    Xoá
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between bg-white rounded-xl border border-gray-100 px-4 py-3">
                        <p className="text-xs text-gray-400">
                            Trang <span className="font-bold text-gray-700">{page}</span> / {totalPages} ·{" "}
                            <span className="font-bold text-gray-700">{filtered.length}</span> bài viết
                        </p>
                        <div className="flex items-center gap-1">
                            <button onClick={() => setPage(1)} disabled={page === 1}
                                className="w-8 h-8 rounded-lg border border-gray-200 text-xs text-gray-500 hover:border-orange-400 hover:text-orange-500 disabled:opacity-30 bg-white cursor-pointer transition-colors">
                                «
                            </button>
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                className="w-8 h-8 rounded-lg border border-gray-200 text-xs text-gray-500 hover:border-orange-400 hover:text-orange-500 disabled:opacity-30 bg-white cursor-pointer transition-colors">
                                ‹
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                                .reduce<(number | "...")[]>((acc, p, i, arr) => {
                                    if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
                                    acc.push(p);
                                    return acc;
                                }, [])
                                .map((p, i) =>
                                    p === "..." ? (
                                        <span key={`dot-${i}`} className="w-8 h-8 flex items-center justify-center text-xs text-gray-400">…</span>
                                    ) : (
                                        <button key={p} onClick={() => setPage(p as number)}
                                            className={`w-8 h-8 rounded-lg text-xs font-bold border cursor-pointer transition-colors ${page === p
                                                ? "bg-orange-500 text-white border-orange-500"
                                                : "bg-white text-gray-600 border-gray-200 hover:border-orange-400 hover:text-orange-500"
                                                }`}>
                                            {p}
                                        </button>
                                    )
                                )}
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                                className="w-8 h-8 rounded-lg border border-gray-200 text-xs text-gray-500 hover:border-orange-400 hover:text-orange-500 disabled:opacity-30 bg-white cursor-pointer transition-colors">
                                ›
                            </button>
                            <button onClick={() => setPage(totalPages)} disabled={page === totalPages}
                                className="w-8 h-8 rounded-lg border border-gray-200 text-xs text-gray-500 hover:border-orange-400 hover:text-orange-500 disabled:opacity-30 bg-white cursor-pointer transition-colors">
                                »
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    // ── CREATE / EDIT VIEW ──
    const isEdit = view === "edit";
    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3 sticky top-0 z-10">
                <button onClick={() => setView("list")}
                    className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 bg-white cursor-pointer transition-colors text-lg">
                    ‹
                </button>
                <div className="flex-1">
                    <h1 className="text-base font-black text-gray-900">
                        {isEdit ? `✏️ ${editing?.title}` : "✍️ Tạo bài viết mới"}
                    </h1>
                    {isEdit && <p className="text-[11px] text-gray-400 font-mono">{editing?.slug}</p>}
                </div>
                {isEdit && (
                    <a href={`/blogs/${editing?.slug}`} target="_blank"
                        className="text-xs font-semibold text-blue-500 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl no-underline transition-colors">
                        Xem trang →
                    </a>
                )}
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">

                {/* Title */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-3">Tiêu đề</label>
                    <input value={formTitle} onChange={e => setFormTitle(e.target.value)}
                        placeholder="Nhập tiêu đề bài viết..."
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all font-semibold" />
                </div>

                {/* Content */}
                {/* Image URL */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-3">Ảnh bìa</label>
                    <div className="flex gap-3">
                        <input value={formImageUrl} onChange={e => setFormImageUrl(e.target.value)}
                            placeholder="Nhập URL ảnh (https://res.cloudinary.com/...)"
                            className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all" />
                        {formImageUrl && (
                            <button onClick={() => setFormImageUrl("")}
                                className="px-3 py-2 border border-gray-200 rounded-xl text-xs text-gray-400 hover:text-red-400 hover:border-red-200 bg-white cursor-pointer transition-colors shrink-0">
                                Xoá
                            </button>
                        )}
                    </div>
                    {formImageUrl && (
                        <div className="mt-3 relative h-40 rounded-xl overflow-hidden border border-gray-100">
                            <img src={formImageUrl} alt="preview"
                                className="w-full h-full object-cover"
                                onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        </div>
                    )}
                    {!formImageUrl && (
                        <p className="text-[11px] text-gray-400 mt-2">Để trống nếu không có ảnh bìa</p>
                    )}
                </div>

                {/* Content */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                    <div className="flex items-center justify-between mb-3">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nội dung</label>
                        <span className="text-[11px] text-gray-400">{formContent.length} ký tự</span>
                    </div>
                    <textarea value={formContent} onChange={e => setFormContent(e.target.value)}
                        placeholder="Nhập nội dung bài viết... (hỗ trợ HTML)"
                        rows={16}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all resize-y font-mono leading-relaxed" />
                    <p className="text-[11px] text-gray-400 mt-2">Hỗ trợ HTML. VD: &lt;b&gt;in đậm&lt;/b&gt;, &lt;i&gt;in nghiêng&lt;/i&gt;, &lt;br&gt;</p>
                </div>

                {/* Status */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-3">Trạng thái</label>
                    <div className="grid grid-cols-2 gap-3">
                        {([["draft", "📝", "Nháp", "Chưa hiển thị công khai"], ["published", "✅", "Đã đăng", "Hiển thị trên trang blog"]] as const).map(([v, icon, l, sub]) => (
                            <button key={v} type="button" onClick={() => setFormStatus(v)}
                                className={`p-4 rounded-xl border-2 text-left cursor-pointer transition-all ${formStatus === v ? "border-orange-400 bg-orange-50" : "border-gray-100 bg-gray-50 hover:border-gray-200"
                                    }`}>
                                <span className="text-2xl">{icon}</span>
                                <p className={`text-sm font-bold mt-1.5 ${formStatus === v ? "text-orange-700" : "text-gray-700"}`}>{l}</p>
                                <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button onClick={() => setView("list")}
                        className="px-5 py-3 border border-gray-200 rounded-xl text-sm text-gray-600 font-semibold bg-white cursor-pointer hover:bg-gray-50 transition-colors">
                        Huỷ
                    </button>
                    <button onClick={isEdit ? handleUpdateContent : handleCreate} disabled={saving || !formTitle.trim() || !formContent.trim()}
                        className={`flex-1 py-3 rounded-xl text-sm font-bold border-none cursor-pointer transition-colors flex items-center justify-center gap-2 text-white ${saving || !formTitle.trim() || !formContent.trim()
                            ? "bg-orange-300 cursor-not-allowed"
                            : "bg-orange-500 hover:bg-orange-600"
                            }`}>
                        {saving ? (
                            <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Đang lưu...</>
                        ) : (
                            isEdit ? "💾 Lưu thay đổi" : "🚀 Đăng bài viết"
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
}