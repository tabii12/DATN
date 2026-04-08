"use client";

import { useEffect, useState } from "react";

interface ContactRecord {
  _id: string;
  name: string;
  email: string;
  phone: string;
  tour: string;
  tourName: string;
  message: string;
  createdAt: string;
}

export default function AdminContacts() {
  const [contacts, setContacts] = useState<ContactRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadContacts() {
      try {
        const res = await fetch("/api/contact");
        const data = await res.json();
        if (data?.success && Array.isArray(data.data)) {
          setContacts(data.data);
        } else {
          setError("Không tải được dữ liệu liên hệ.");
        }
      } catch (err) {
        console.error(err);
        setError("Không tải được dữ liệu liên hệ.");
      } finally {
        setLoading(false);
      }
    }

    loadContacts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-lg font-black text-gray-900">📧 Quản lý liên hệ</h1>
        <p className="text-sm text-gray-500">Danh sách yêu cầu khách hàng gửi liên hệ về tour.</p>
      </div>

      <div className="max-w-full mx-auto px-4 py-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-500">Tổng yêu cầu: <span className="font-semibold text-gray-900">{contacts.length}</span></p>
          </div>
        </div>

        <div className="overflow-x-auto bg-white rounded-3xl border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.2em] text-slate-500">
              <tr>
                <th className="px-4 py-4">Khách hàng</th>
                <th className="px-4 py-4">Tour</th>
                <th className="px-4 py-4">Email / Phone</th>
                <th className="px-4 py-4">Nội dung</th>
                <th className="px-4 py-4">Ngày gửi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-400">
                    Đang tải dữ liệu liên hệ...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-red-600">
                    {error}
                  </td>
                </tr>
              ) : contacts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">
                    Chưa có yêu cầu liên hệ nào.
                  </td>
                </tr>
              ) : (
                contacts.map((contact) => (
                  <tr key={contact._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4 align-top">
                      <p className="font-semibold text-slate-900">{contact.name}</p>
                      <p className="text-xs text-slate-500">{contact.email}</p>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <p className="font-medium text-slate-800">{contact.tourName || "Không chọn tour"}</p>
                      {contact.tour && <p className="text-xs text-slate-500">ID: {contact.tour}</p>}
                    </td>
                    <td className="px-4 py-4 align-top">
                      <p>{contact.phone || "Chưa có"}</p>
                    </td>
                    <td className="px-4 py-4 align-top text-slate-600">
                      <p className="line-clamp-3 max-w-[320px]">{contact.message}</p>
                    </td>
                    <td className="px-4 py-4 align-top text-slate-500 text-xs">
                      {new Date(contact.createdAt).toLocaleString("vi-VN")}
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
