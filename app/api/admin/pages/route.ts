import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Временно возвращаем пустые массивы, пока не настроим реальные данные
    return NextResponse.json({ folders: [], pages: [] }, { status: 200 });
  } catch (e: any) {
    console.error("pages GET error", e);
    // Критично: всегда отдаём корректный json-объект, а не 500
    return NextResponse.json({ folders: [], pages: [] }, { status: 200 });
  }
}