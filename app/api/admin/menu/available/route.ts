import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Временно возвращаем пустой массив
    return NextResponse.json({ items: [] });
  } catch (error) {
    console.error('Error fetching available pages:', error);
    return NextResponse.json(
      { error: 'Ошибка загрузки доступных страниц' },
      { status: 500 }
    );
  }
}
