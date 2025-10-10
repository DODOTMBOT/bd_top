import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const form = await req.formData();
  const id = String(form.get('id'));

  try {
    await prisma.resource.delete({
      where: { id },
    });
  } catch (error) {
    return NextResponse.redirect(new URL('/admin/resources?error=Не удалось удалить ресурс', req.url));
  }

  return NextResponse.redirect(new URL('/admin/resources', req.url));
}
