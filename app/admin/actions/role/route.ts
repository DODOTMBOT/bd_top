import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const form = await req.formData();
  const name = String(form.get('name'));

  if (!name) {
    return NextResponse.redirect(new URL('/admin/roles?error=Требуется название роли', req.url));
  }

  try {
    await prisma.rbacRole.create({
      data: { name, description: `Роль: ${name}` },
    });
  } catch (error) {
    return NextResponse.redirect(new URL('/admin/roles?error=Роль уже существует', req.url));
  }

  return NextResponse.redirect(new URL('/admin/roles', req.url));
}
