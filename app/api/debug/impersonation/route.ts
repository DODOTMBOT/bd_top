import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const impersonatedPartnerId = cookieStore.get('impersonatePartnerId')?.value ?? null;
    
    return NextResponse.json({ 
      impersonatedPartnerId,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? 'Ошибка получения cookie' },
      { status: 500 }
    );
  }
}
