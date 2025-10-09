import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const form = await req.formData();
  const name = String(form.get('name'));

  if (!name) {
    return NextResponse.redirect(new URL('/admin/roles?error=Name required', req.url));
  }

  try {
    await prisma.rbacRole.create({
      data: { name, description: `Role: ${name}` },
    });
  } catch (error) {
    return NextResponse.redirect(new URL('/admin/roles?error=Role already exists', req.url));
  }

  return NextResponse.redirect(new URL('/admin/roles', req.url));
}
