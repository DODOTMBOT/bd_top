import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    cookies().delete('impersonatePartnerId');
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? 'Ошибка очистки impersonation' },
      { status: 500 }
    );
  }
}
