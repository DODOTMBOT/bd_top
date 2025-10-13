import { NextResponse } from 'next/server';
import { impersonatePartner } from '../_actions';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const result = await impersonatePartner(formData);
    
    if (result.ok) {
      return NextResponse.json({ ok: true });
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? 'Ошибка impersonation' },
      { status: 500 }
    );
  }
}
