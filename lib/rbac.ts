import { auth } from "@/lib/auth";
import { UserRoleType } from "@prisma/client";

export async function requireRole(roles: UserRoleType[]) {
  const session = await auth();
  
  if (!session?.user) {
    console.warn("[RBAC] forbid", { reason: "UNAUTHENTICATED" });
    throw new Error("UNAUTHENTICATED");
  }

  if (!roles.includes(session.user.role as UserRoleType)) {
    console.warn("[RBAC] forbid", { 
      path: "/partner/points", 
      user: session.user,
      requiredRoles: roles,
      userRole: session.user.role
    });
    throw new Error("FORBIDDEN");
  }

  return session;
}

export async function checkAccess(path: string, action: "read" | "write" | "manage") {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return { allowed: false, reason: "UNAUTHENTICATED" };
    }

    // Простая проверка ролей для /partner/*
    if (path.startsWith("/partner")) {
      if (session.user.role !== "PARTNER") {
        console.warn("[RBAC] forbid", { 
          path, 
          action, 
          user: session.user,
          reason: "INSUFFICIENT_ROLE"
        });
        return { allowed: false, reason: "INSUFFICIENT_ROLE" };
      }
    }

    return { allowed: true, session };
  } catch (error) {
    console.error("[RBAC] error", { path, action, error });
    return { allowed: false, reason: "DB_UNAVAILABLE" };
  }
}