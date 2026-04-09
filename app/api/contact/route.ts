import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

interface ContactItem {
  _id: string;
  userId?: string;
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
    const { userId, name, email, phone, tour, tourName, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: "Vui lòng cung cấp tên, email và nội dung yêu cầu." },
        { status: 400 }
      );
    }

    const contact: ContactItem = {
      _id: randomUUID(),
      userId: userId || undefined,
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
      { success: false, error: "Lỗi máy chủ." },
      { status: 500 }
    );
  }
}
