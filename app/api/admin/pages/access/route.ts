export const runtime = 'nodejs'

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const UpdateAccessSchema = z.object({
  roleId: z.string(),
  pageId: z.string(),
  canAccess: z.boolean(),
});

// GET: получить все страницы с доступами по ролям
export async function GET() {
  try {
    const pages = await prisma.accessPage.findMany({
      include: {
        accesses: {
          include: {
            role: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    const roles = await prisma.accessRole.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      pages,
      roles,
    });
  } catch (error: any) {
    console.error("Error fetching page access:", error);
    return NextResponse.json(
      { error: "FAILED_TO_FETCH_ACCESS", details: error.message },
      { status: 500 }
    );
  }
}

// POST: обновить доступ (поддержка массовых обновлений)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("=== API ACCESS UPDATE START ===");
    console.log("Received body:", JSON.stringify(body, null, 2));
    
    // Поддержка как одиночных, так и массовых обновлений
    if (body.updates && Array.isArray(body.updates)) {
      // Массовое обновление
      const updates = body.updates;
      console.log("Processing bulk updates:", updates.length);
      
      for (const update of updates) {
        if (!update.roleId || !update.pageId) {
          console.log("Skipping invalid update:", update);
          continue;
        }

        console.log(`Updating access: roleId=${update.roleId}, pageId=${update.pageId}, canAccess=${update.canAccess}`);
        
        const result = await prisma.accessRolePageAccess.upsert({
          where: {
            roleId_pageId: {
              roleId: update.roleId,
              pageId: update.pageId,
            },
          },
          update: { canAccess: update.canAccess },
          create: {
            roleId: update.roleId,
            pageId: update.pageId,
            canAccess: update.canAccess,
          },
        });
        
        console.log("Upsert result:", result);
      }

      console.log("=== API ACCESS UPDATE END ===");
      return NextResponse.json({ success: true });
    } else {
      // Одиночное обновление (обратная совместимость)
      const { roleId, pageId, canAccess } = UpdateAccessSchema.parse(body);

      const access = await prisma.accessRolePageAccess.upsert({
        where: {
          roleId_pageId: {
            roleId,
            pageId,
          },
        },
        update: {
          canAccess,
        },
        create: {
          roleId,
          pageId,
          canAccess,
        },
        include: {
          role: true,
          page: true,
        },
      });

      return NextResponse.json(access);
    }
  } catch (error: any) {
    console.error("Error updating page access:", error);
    return NextResponse.json(
      { error: "FAILED_TO_UPDATE_ACCESS", details: error.message },
      { status: 500 }
    );
  }
}
