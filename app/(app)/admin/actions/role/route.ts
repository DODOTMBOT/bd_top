import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const form = await req.formData();
  const name = String(form.get('name'));
  const description = String(form.get('description') || '');

  if (!name) {
    return NextResponse.redirect(new URL('/admin/roles?error=Требуется название роли', req.url));
  }

  // Генерируем key из name
  const key = name.toUpperCase().replace(/\s+/g, "_");

  try {
    await prisma.role.create({
      data: { 
        key,
        name, 
        description: description || `Роль: ${name}` 
      },
    });
  } catch (error) {
    return NextResponse.redirect(new URL('/admin/roles?error=Роль уже существует', req.url));
  }

  return NextResponse.redirect(new URL('/admin/roles', req.url));
}
