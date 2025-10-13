import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { requireUserId } from '@/lib/auth';

const UpdateProfileSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional().nullable(),
});

export async function GET() {
  try {
    const userId = await requireUserId();
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        name: true, 
        email: true, 
        login: true,
        role: true
      },
    });
    return NextResponse.json(user ?? {});
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }
    console.error('Get profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const userId = await requireUserId();
    const data = UpdateProfileSchema.parse(await request.json());
    const updated = await prisma.user.update({
      where: { id: userId },
      data,
      select: { 
        name: true, 
        email: true, 
        login: true,
        role: true
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
