"use client";

import { useEffect, useState } from "react";

const API_TOURS = "https://db-pickyourway.vercel.app/api/tours";
const API_SALES = "https://db-pickyourway.vercel.app/api/sales";

type Tour = {
  _id: string; name: string; slug: string; status: string;
  images?: { image_url: string }[];
  hotel_id?: { city: string };
  category_id?: { name: string };
};
type Sale = { _id: string; tour_id: string; discount: number; createdAt: string; updatedAt: string };

export default function AdminSales() {
  const [tours, setTours]           = useState<Tour[]>([]);
  const [sales, setSales]           = useState<Sale[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [modal, setModal]           = useState<null | "create" | "edit">(null);
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [editingSale, setEditingSale]   = useState<Sale | null>(null);
  const [discount, setDiscount]     = useState("");
  const [saving, setSaving]         = useState(false);

  // ── Pagination ──
  const SALE_PAGE_SIZE    = 5;
  const NOSALE_PAGE_SIZE  = 10;
  const [saleLimit, setSaleLimit]     = useState(SALE_PAGE_SIZE);
  const [nosaleLimit, setNosaleLimit] = useState(NOSALE_PAGE_SIZE);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [tRes, sRes] = await Promise.all([
        fetch(API_TOURS).then(r => r.json()),
        fetch(`${API_SALES}/`).then(r => r.json()),
      ]);
      setTours(tRes.data || []);
      setSales(sRes.data || []);
    } catch { setTours([]); setSales([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  // Reset limit khi search thay đổi
  useEffect(() => { setSaleLimit(SALE_PAGE_SIZE); setNosaleLimit(NOSALE_PAGE_SIZE); }, [search]);

  const getSale = (tourId: string) => sales.find(s => s.tour_id === tourId);

  const openCreate = (tour: Tour) => { setSelectedTour(tour); setDiscount(""); setEditingSale(null); setModal("create"); };
  const openEdit   = (tour: Tour, sale: Sale) => { setSelectedTour(tour); setEditingSale(sale); setDiscount(String(sale.discount)); setModal("edit"); };
  const closeModal = () => { setModal(null); setSelectedTour(null); setEditingSale(null); setDiscount(""); };

  const handleSave = async () => {
    if (!selectedTour || !discount) return;
    const pct = Number(discount);
    if (isNaN(pct) || pct <= 0 || pct >= 100) { alert("Discount phải từ 1 đến 99%"); return; }
    setSaving(true);
    try {
      if (modal === "create") {
        const res  = await fetch(`${API_SALES}/create`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tour_id: selectedTour._id, discount: pct }) });
        const data = await res.json();
        if (!res.ok) { alert(data.message || "Tạo thất bại"); return; }
      } else if (modal === "edit" && editingSale) {
        const res  = await fetch(`${API_SALES}/${editingSale._id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ discount: pct }) });
        const data = await res.json();
        if (!res.ok) { alert(data.message || "Cập nhật thất bại"); return; }
      }
      await fetchAll(); closeModal();
    } finally { setSaving(false); }
  };

  const handleDelete = async (sale: Sale, tourName: string) => {
    if (!confirm(`Xoá sale của "${tourName}"?`)) return;
    await fetch(`${API_SALES}/${sale._id}`, { method: "DELETE" });
    await fetchAll();
  };

  const filtered         = tours.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || (t.hotel_id?.city || "").toLowerCase().includes(search.toLowerCase()));
  const toursWithSale    = filtered.filter(t => getSale(t._id));
  const toursWithoutSale = filtered.filter(t => !getSale(t._id));

  // Sliced lists
  const visibleSale    = toursWithSale.slice(0, saleLimit);
  const visibleNosale  = toursWithoutSale.slice(0, nosaleLimit);
  const moreSale       = toursWithSale.length - saleLimit;
  const moreNosale     = toursWithoutSale.length - nosaleLimit;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h1 className="text-base font-black text-gray-900">🏷️ Quản lý Sale</h1>
          <p className="text-[11px] text-gray-400 mt-0.5">{sales.length} tour đang giảm giá / {tours.length} tour</p>
        </div>
      </div>

      <div className="mx-auto px-4 py-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {([
            ["Tổng tour",  tours.length,               "text-gray-800"],
            ["Đang sale",  sales.length,               "text-orange-500"],
            ["Chưa sale",  tours.length - sales.length, "text-gray-400"],
          ] as const).map(([label, count, color]) => (
            <div key={label} className="bg-white rounded-xl border border-gray-100 px-4 py-3 text-center">
              <p className={`text-2xl font-black ${color}`}>{count}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl border border-gray-100 px-4 py-2.5 flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm tên tour, thành phố..."
            className="text-sm bg-transparent border-none outline-none text-gray-700 placeholder-gray-400 w-full"/>
        </div>

        {loading ? (
          <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse h-20"/>)}</div>
        ) : (
          <>
            {/* Tours đang sale */}
            {toursWithSale.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">
                  🔥 Đang giảm giá ({toursWithSale.length})
                </p>
                {visibleSale.map(tour => {
                  const sale = getSale(tour._id)!;
                  return (
                    <div key={tour._id} className="bg-white rounded-xl border border-orange-100 p-4 flex items-center gap-4">
                      <div className="w-14 h-10 rounded-lg overflow-hidden bg-orange-50 shrink-0">
                        {tour.images?.[0]?.image_url
                          ? <img src={tour.images[0].image_url} alt={tour.name} className="w-full h-full object-cover"/>
                          : <div className="w-full h-full flex items-center justify-center text-xl">🏖️</div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{tour.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {tour.hotel_id?.city && <span className="text-[11px] text-gray-400">{tour.hotel_id.city}</span>}
                          {tour.category_id?.name && <span className="text-[11px] bg-orange-50 text-orange-400 px-2 py-0.5 rounded-full font-semibold">{tour.category_id.name}</span>}
                        </div>
                      </div>
                      <div className="shrink-0 flex items-center gap-2">
                        <div className="bg-orange-500 text-white text-sm font-black px-4 py-2 rounded-xl">-{sale.discount}%</div>
                        <button onClick={() => openEdit(tour, sale)} className="text-xs font-semibold text-blue-500 hover:bg-blue-50 px-2.5 py-2 rounded-lg border-none cursor-pointer bg-transparent transition-colors">Sửa</button>
                        <button onClick={() => handleDelete(sale, tour.name)} className="text-xs font-semibold text-red-400 hover:bg-red-50 px-2.5 py-2 rounded-lg border-none cursor-pointer bg-transparent transition-colors">Xoá</button>
                      </div>
                    </div>
                  );
                })}

                {/* Show more / less — sale */}
                {(moreSale > 0 || saleLimit > SALE_PAGE_SIZE) && (
                  <div className="flex items-center justify-center gap-3 pt-1">
                    {moreSale > 0 && (
                      <button onClick={() => setSaleLimit(l => l + SALE_PAGE_SIZE)}
                        className="text-xs font-bold text-orange-500 border border-orange-200 bg-white hover:bg-orange-50 px-4 py-2 rounded-xl cursor-pointer transition-colors">
                        Xem thêm {Math.min(moreSale, SALE_PAGE_SIZE)} / còn {moreSale} tour 🔽
                      </button>
                    )}
                    {saleLimit > SALE_PAGE_SIZE && (
                      <button onClick={() => setSaleLimit(SALE_PAGE_SIZE)}
                        className="text-xs font-semibold text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer transition-colors">
                        Thu gọn 🔼
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Tours chưa sale */}
            {toursWithoutSale.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">
                  Chưa có sale ({toursWithoutSale.length})
                </p>
                {visibleNosale.map(tour => (
                  <div key={tour._id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4">
                    <div className="w-14 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      {tour.images?.[0]?.image_url
                        ? <img src={tour.images[0].image_url} alt={tour.name} className="w-full h-full object-cover"/>
                        : <div className="w-full h-full flex items-center justify-center text-xl">🏖️</div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-800 truncate">{tour.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {tour.hotel_id?.city && <span className="text-[11px] text-gray-400">{tour.hotel_id.city}</span>}
                        {tour.category_id?.name && <span className="text-[11px] bg-gray-50 text-gray-400 px-2 py-0.5 rounded-full font-semibold">{tour.category_id.name}</span>}
                      </div>
                    </div>
                    <button onClick={() => openCreate(tour)}
                      className="shrink-0 text-xs font-bold text-orange-500 hover:bg-orange-50 border border-orange-200 px-3 py-2 rounded-xl cursor-pointer bg-white transition-colors">
                      + Tạo sale
                    </button>
                  </div>
                ))}

                {/* Show more / less — no sale */}
                {(moreNosale > 0 || nosaleLimit > NOSALE_PAGE_SIZE) && (
                  <div className="flex items-center justify-center gap-3 pt-1">
                    {moreNosale > 0 && (
                      <button onClick={() => setNosaleLimit(l => l + NOSALE_PAGE_SIZE)}
                        className="text-xs font-bold text-gray-500 border border-gray-200 bg-white hover:bg-gray-50 px-4 py-2 rounded-xl cursor-pointer transition-colors">
                        Xem thêm 🔽
                      </button>
                    )}
                    {nosaleLimit > NOSALE_PAGE_SIZE && (
                      <button onClick={() => setNosaleLimit(NOSALE_PAGE_SIZE)}
                        className="text-xs font-semibold text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer transition-colors">
                        Thu gọn 🔼
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {filtered.length === 0 && (
              <div className="bg-white rounded-xl border border-gray-100 py-16 text-center text-gray-400">
                <p className="text-4xl mb-3">🔍</p>
                <p className="font-semibold text-sm">Không tìm thấy tour nào</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {modal && selectedTour && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-black text-gray-900">{modal === "create" ? "🏷️ Tạo sale" : "✏️ Sửa sale"}</h2>
              <p className="text-xs text-gray-400 truncate mt-0.5">{selectedTour.name}</p>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                <div className="w-12 h-9 rounded-lg overflow-hidden bg-gray-200 shrink-0">
                  {selectedTour.images?.[0]?.image_url
                    ? <img src={selectedTour.images[0].image_url} alt="" className="w-full h-full object-cover"/>
                    : <div className="w-full h-full flex items-center justify-center text-lg">🏖️</div>}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-700 truncate">{selectedTour.name}</p>
                  {selectedTour.hotel_id?.city && <p className="text-[11px] text-gray-400">{selectedTour.hotel_id.city}</p>}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1.5">Phần trăm giảm giá <span className="text-red-400">*</span></label>
                <div className="relative">
                  <input type="number" min={1} max={99} value={discount} onChange={e => setDiscount(e.target.value)} placeholder="VD: 20"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all pr-10 font-bold text-lg"/>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">%</span>
                </div>
                {discount && Number(discount) > 0 && Number(discount) < 100 && (
                  <div className="mt-2 bg-orange-50 rounded-xl px-3 py-2 flex items-center gap-2">
                    <span className="text-orange-500 font-black text-lg">-{discount}%</span>
                    <span className="text-xs text-orange-600 font-semibold">sẽ được áp dụng cho tour này</span>
                  </div>
                )}
              </div>
              <div>
                <p className="text-[11px] text-gray-400 mb-2">Chọn nhanh</p>
                <div className="flex gap-2 flex-wrap">
                  {[5,10,15,20,25,30,50].map(v => (
                    <button key={v} type="button" onClick={() => setDiscount(String(v))}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border-2 cursor-pointer transition-all ${discount === String(v) ? "border-orange-400 bg-orange-50 text-orange-600" : "border-gray-100 bg-gray-50 text-gray-500 hover:border-orange-200"}`}>
                      {v}%
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button onClick={closeModal} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 font-semibold bg-white cursor-pointer hover:bg-gray-50 transition-colors">Huỷ</button>
              <button onClick={handleSave} disabled={saving || !discount}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-none cursor-pointer transition-colors text-white ${saving || !discount ? "bg-orange-300 cursor-not-allowed" : "bg-orange-500 hover:bg-orange-600"}`}>
                {saving
                  ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Đang lưu...</span>
                  : modal === "create" ? "🏷️ Tạo sale" : "💾 Lưu thay đổi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}