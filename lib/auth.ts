/**
 * DO NOT MODIFY. BASE INFRASTRUCTURE.
 * NextAuth configuration backed by Prisma. UI iterations must not change this file.
 */
import NextAuth from "next-auth";
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
  adapter: PrismaAdapter(prisma) as any,

  providers: [
    Credentials({
      name: "credentials",
      credentials: { identifier: {}, password: {} },
      async authorize(credentials) {
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
          } as any;
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
        (token as any).id = (user as any).id;
        token.role = (user as any).role as any;
        (token as any).partnerId = (user as any).partnerId;
        (token as any).pointId = (user as any).pointId;
        (token as any).login = (user as any).login ?? null;
        (token as any).mustChangePassword = (user as any).mustChangePassword ?? false;
      }
      return token;
    },
    async session({ session, token }) {
      (session.user as any).id = (token as any).id as string;
      (session.user as any).role = token.role as any;
      (session.user as any).partnerId = (token as any).partnerId;
      (session.user as any).pointId = (token as any).pointId;
      (session.user as any).login = ((token as any).login as string) ?? null;
      (session.user as any).mustChangePassword = ((token as any).mustChangePassword as boolean) ?? false;
      return session;
    },
  },
});

// Expose route handlers for /api/auth/[...nextauth]
export const GET = handlers.GET;
export const POST = handlers.POST;



