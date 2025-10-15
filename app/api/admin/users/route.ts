export const runtime = 'nodejs'

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";

const CreateUserSchema = z.object({
  login: z.string().min(3),
  email: z.string().email().optional().or(z.literal("")),
  name: z.string().optional(),
  password: z.string().min(6),
  role: z.string().min(1),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "0", 10);
    
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        take: 10, // ограничиваем до 10 пользователей
        skip: page * 10, // смещение для пагинации
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          name: true,
          login: true,
          email: true,
          role: true,
          createdAt: true,
        },
      }),
      prisma.user.count(), // общее количество пользователей
    ]);
    
    const totalPages = Math.ceil(totalCount / 10);
    
    return NextResponse.json({
      users,
      pagination: {
        page,
        totalPages,
        totalCount,
        hasNext: page < totalPages - 1,
        hasPrev: page > 0,
      },
    }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: "USERS_LIST_FAILED", details: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const dto = CreateUserSchema.parse(body);

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await prisma.user.create({
      data: {
        login: dto.login,
        email: dto.email && dto.email.trim() !== "" ? dto.email : null,
        name: dto.name,
        passwordHash,
        role: dto.role,
      },
      select: {
        id: true,
        name: true,
        login: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(user, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: "CREATE_USER_FAILED", details: e.message }, { status: 400 });
  }
}