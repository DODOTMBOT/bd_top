export const runtime = 'nodejs'

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const items = await prisma.subscriptionPlan.findMany({ 
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] 
    });
    return NextResponse.json({ 
      count: items.length, 
      slugs: items.map(x => x.slug),
      items: items.map(x => ({
        id: x.id,
        slug: x.slug,
        name: x.name,
        priceMonthlyCents: x.priceMonthlyCents,
        isActive: x.isActive
      }))
    });
  } catch (e: any) {
    return NextResponse.json({ 
      error: e?.message ?? 'DB error',
      stack: e?.stack 
    }, { status: 500 });
  }
}
