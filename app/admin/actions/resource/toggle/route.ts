import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const form = await req.formData();
  const id = String(form.get('id'));
  const op = String(form.get('op'));

  try {
    const isActive = op === 'activate';
    await prisma.resource.update({
      where: { id },
      data: { isActive },
    });
  } catch (error) {
    return NextResponse.redirect(new URL('/admin/resources?error=Could not toggle resource', req.url));
  }

  return NextResponse.redirect(new URL('/admin/resources', req.url));
}
