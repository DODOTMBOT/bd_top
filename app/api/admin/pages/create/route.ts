import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // Временно возвращаем успех
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e: any) {
    console.error("page create error", e);
    return NextResponse.json({ error: "Ошибка создания страницы" }, { status: 500 });
  }
}