import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    console.log("[ACCESS SYNC] incoming", data);

    for (const item of data) {
      // Находим роль по имени
      const role = await prisma.accessRole.findUnique({
        where: { name: item.roleName }
      });
      
      if (!role) {
        console.log(`[ACCESS SYNC] Role not found: ${item.roleName}`);
        continue;
      }

      // Находим страницу по пути
      const page = await prisma.accessPage.findUnique({
        where: { path: item.pagePath }
      });
      
      if (!page) {
        console.log(`[ACCESS SYNC] Page not found: ${item.pagePath}`);
        continue;
      }

      console.log(`[ACCESS SYNC] Updating: ${item.roleName} -> ${item.pagePath} = ${item.allowed}`);

      await prisma.accessRolePageAccess.upsert({
        where: {
          roleId_pageId: {
            roleId: role.id,
            pageId: page.id,
          },
        },
        update: { canAccess: item.allowed },
        create: {
          roleId: role.id,
          pageId: page.id,
          canAccess: item.allowed,
        },
      });
    }

    console.log("[ACCESS SYNC] completed successfully");
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("[ACCESS SYNC] error:", error);
    return NextResponse.json(
      { error: "FAILED_TO_UPDATE_ACCESS", details: error.message },
      { status: 500 }
    );
  }
}