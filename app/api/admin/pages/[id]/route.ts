import { NextResponse } from "next/server";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    // Временно возвращаем успех
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e: any) {
    console.error("page DELETE error", e);
    return NextResponse.json({ error: "Ошибка удаления страницы" }, { status: 500 });
  }
}