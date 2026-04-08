import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

interface ContactItem {
  _id: string;
  name: string;
  email: string;
  phone: string;
  tour: string;
  tourName: string;
  message: string;
  createdAt: string;
}

const CONTACTS: ContactItem[] = [];

export async function GET() {
  return NextResponse.json({ success: true, data: CONTACTS });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, tour, tourName, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: "Vui lòng cung cấp tên, email và nội dung yêu cầu." },
        { status: 400 }
      );
    }

    const contact: ContactItem = {
      _id: randomUUID(),
      name: String(name).trim(),
      email: String(email).trim(),
      phone: String(phone || "").trim(),
      tour: String(tour || "").trim(),
      tourName: String(tourName || "Chưa chọn tour cụ thể").trim(),
      message: String(message).trim(),
      createdAt: new Date().toISOString(),
    };

    CONTACTS.unshift(contact);
    return NextResponse.json({ success: true, data: contact });
  } catch (err) {
    console.error("Lỗi API liên hệ:", err);
    return NextResponse.json(
      { success: false, error: "Lỗi nội bộ máy chủ." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { success: false, error: "Thiếu id cần xoá." },
      { status: 400 }
    );
  }

  const index = CONTACTS.findIndex((item) => item._id === id);
  if (index === -1) {
    return NextResponse.json(
      { success: false, error: "Không tìm thấy liên hệ." },
      { status: 404 }
    );
  }

  CONTACTS.splice(index, 1);
  return NextResponse.json({ success: true });
}
