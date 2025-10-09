import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const form = await req.formData();
  const id = String(form.get('id'));

  try {
    await prisma.rbacRole.delete({
      where: { id },
    });
  } catch (error) {
    return NextResponse.redirect(new URL('/admin/roles?error=Не удалось удалить роль', req.url));
  }

  return NextResponse.redirect(new URL('/admin/roles', req.url));
}
