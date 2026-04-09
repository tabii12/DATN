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
  const [selectedContact, setSelectedContact] = useState<ContactRecord | null>(null);
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
                <th className="px-4 py-4">Email</th>
                <th className="px-4 py-4">Phone</th>
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
                    </td>
                    <td className="px-4 py-4 align-top">
                      <p className="font-medium text-slate-800">{contact.tourName || "Không chọn tour"}</p>
                    </td>
                    <td className="px-4 py-4 align-top text-slate-600 break-words">
                      <p>{contact.email}</p>
                    </td>
                    <td className="px-4 py-4 align-top text-slate-600 break-words">
                      <p>{contact.phone || "Chưa có"}</p>
                    </td>
                    <td className="px-4 py-4 align-top text-slate-600 max-w-[320px]">
                      <p className="line-clamp-3 overflow-hidden">{contact.message}</p>
                      <button
                        type="button"
                        onClick={() => setSelectedContact(contact)}
                        className="mt-2 inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-600 hover:bg-slate-100"
                      >
                        Xem thêm
                      </button>
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

      {selectedContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Nội dung liên hệ</h2>
                <p className="text-sm text-slate-500">{selectedContact.name} · {selectedContact.email}</p>
              </div>
              <button
                onClick={() => setSelectedContact(null)}
                className="rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
              >
                Đóng
              </button>
            </div>
            <div className="mt-5 space-y-4 text-sm text-slate-700">
              <div>
                <p className="font-semibold text-slate-800">Tour</p>
                <p>{selectedContact.tourName || "Không chọn tour"}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-800">Nội dung</p>
                <p className="whitespace-pre-line break-words text-slate-700">{selectedContact.message}</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="font-semibold text-slate-800">Email</p>
                  <p>{selectedContact.email}</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-800">Phone</p>
                  <p>{selectedContact.phone || "Chưa có"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
