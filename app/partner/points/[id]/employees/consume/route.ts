import { NextRequest, NextResponse } from 'next/server';

export function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const flash = req.cookies.get('flash.empCreated')?.value ?? '';
  const url = new URL(`/partner/points/${params.id}/employees${flash ? `?t=${flash}` : ''}`, req.url);
  const res = NextResponse.redirect(url);
  if (flash) res.cookies.delete('flash.empCreated');
  return res;
}



