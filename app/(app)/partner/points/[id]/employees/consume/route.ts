import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const flash = req.cookies.get('flash.empCreated')?.value ?? '';
  const resolvedParams = await params;
  const url = new URL(`/partner/points/${resolvedParams.id}/employees${flash ? `?t=${flash}` : ''}`, req.url);
  const res = NextResponse.redirect(url);
  if (flash) res.cookies.delete('flash.empCreated');
  return res;
}



