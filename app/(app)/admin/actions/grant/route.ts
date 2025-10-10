import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const form = await req.formData();
  const roleId = String(form.get('roleId'));
  const resourceId = String(form.get('resourceId'));
  const access = String(form.get('access'));

  if (access === 'none') {
    await prisma.roleGrant.deleteMany({ where: { roleId, resourceId } });
  } else {
    await prisma.roleGrant.upsert({
      where: { roleId_resourceId: { roleId, resourceId } },
      update: { access },
      create: { roleId, resourceId, access },
    });
  }
  return NextResponse.redirect(new URL('/admin', req.url));
}
