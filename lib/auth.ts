/**
 * DO NOT MODIFY. BASE INFRASTRUCTURE.
 * NextAuth configuration backed by Prisma. UI iterations must not change this file.
 */
import NextAuth from "next-auth";

export const runtime = 'nodejs';
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { isP1001 } from "@/lib/prisma";

if (!process.env.NEXTAUTH_SECRET && !process.env.AUTH_SECRET) {
  console.error("[AUTH] Missing NEXTAUTH_SECRET in .env.local");
  throw new Error("NEXTAUTH_SECRET is missing");
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adapter: PrismaAdapter(prisma) as any,

  providers: [
    Credentials({
      name: "credentials",
      credentials: { identifier: {}, password: {} },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async authorize(credentials): Promise<any> {
        const identifier = String(credentials?.identifier || "").trim().toLowerCase();
        const password = String(credentials?.password || "");

        if (!identifier || !password) return null;

        try {
          const user = await prisma.user.findFirst({
            where: { OR: [{ email: identifier }, { login: identifier }] },
            select: { 
              id: true, 
              email: true, 
              login: true, 
              name: true, 
              role: true, 
              passwordHash: true, 
              mustChangePassword: true,
              partnerId: true,
              pointId: true
            },
          });

          if (!user || !user.passwordHash) return null;

          const ok = await bcrypt.compare(password, user.passwordHash);
          if (!ok) return null;

          console.log("[AUTH] user=", {
            id: user.id, 
            role: user.role, 
            partnerId: user.partnerId,
            pointId: user.pointId
          });

          return {
            id: user.id,
            email: user.email ?? null,
            name: user.name ?? null,
            login: user.login ?? null,
            role: user.role,
            partnerId: user.partnerId,
            pointId: user.pointId,
            mustChangePassword: !!user.mustChangePassword,
          } as { id: string; email: string; name: string | null; role: string; partnerId: string | null; pointId: string | null; mustChangePassword: boolean };
        } catch (e) {
          if (isP1001(e)) {
            // Fail-safe: treat as invalid credentials rather than crashing
            return null;
          }
          throw e;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        (token as { id?: string }).id = (user as { id: string }).id;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (token as any).role = (user as { role: string }).role;
        (token as { partnerId?: string | null }).partnerId = (user as { partnerId: string | null }).partnerId;
        (token as { pointId?: string | null }).pointId = (user as { pointId: string | null }).pointId;
        (token as { login?: string | null }).login = (user as { login: string | null }).login ?? null;
        (token as { mustChangePassword?: boolean }).mustChangePassword = (user as { mustChangePassword: boolean | null }).mustChangePassword ?? false;
      }
      return token;
    },
    async session({ session, token }) {
      (session.user as { id?: string }).id = (token as { id?: string }).id as string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (session.user as { role?: string }).role = (token as any).role as string;
      (session.user as { partnerId?: string | null }).partnerId = (token as { partnerId?: string | null }).partnerId;
      (session.user as { pointId?: string | null }).pointId = (token as { pointId?: string | null }).pointId;
      (session.user as { login?: string | null }).login = ((token as { login?: string | null }).login as string) ?? null;
      (session.user as { mustChangePassword?: boolean }).mustChangePassword = ((token as { mustChangePassword?: boolean }).mustChangePassword as boolean) ?? false;
      return session;
    },
  },
});

// Expose route handlers for /api/auth/[...nextauth]
export const GET = handlers.GET;
export const POST = handlers.POST;



