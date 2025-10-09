import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const form = await req.formData();
  const kind = String(form.get('kind'));
  const pattern = String(form.get('pattern'));

  if (!pattern) {
    return NextResponse.redirect(new URL('/admin/resources?error=Требуется паттерн ресурса', req.url));
  }

  try {
    await prisma.resource.create({
      data: { 
        kind, 
        pattern, 
        name: `${kind}: ${pattern}`,
        description: `Паттерн ресурса: ${pattern}`,
      },
    });
  } catch (error) {
    return NextResponse.redirect(new URL('/admin/resources?error=Ресурс уже существует', req.url));
  }

  return NextResponse.redirect(new URL('/admin/resources', req.url));
}
