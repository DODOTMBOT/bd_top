import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    // Временно возвращаем успех
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e: any) {
    console.error("page unhide error", e);
    return NextResponse.json({ error: "Ошибка показа страницы" }, { status: 500 });
  }
}