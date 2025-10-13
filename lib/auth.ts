/**
 * DO NOT MODIFY. BASE INFRASTRUCTURE.
 * NextAuth configuration backed by Prisma. UI iterations must not change this file.
 */
import NextAuth from "next-auth";
import { NextResponse } from "next/server";

export const runtime = 'nodejs';
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { Prisma } from "@prisma/client";

type AppRole = 'OWNER' | 'PARTNER' | 'POINT' | 'USER';

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
      credentials: { 
        login: { label: 'Логин', type: 'text' }, 
        password: { label: 'Пароль', type: 'password' } 
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async authorize(credentials): Promise<any> {
        const login = String(credentials?.login || "").trim();
        const password = String(credentials?.password || "");

        if (!login || !password) {
          throw new Error('INVALID_CREDENTIALS');
        }

        try {
          const user = await prisma.user.findUnique({
            where: { login },
            select: { 
              id: true, 
              login: true,
              email: true, 
              name: true, 
              role: true, 
              passwordHash: true,
            },
          });

          if (!user || !user.passwordHash) {
            throw new Error('INVALID_CREDENTIALS');
          }

          const isValidPassword = await bcrypt.compare(password, user.passwordHash);
          if (!isValidPassword) {
            throw new Error('INVALID_CREDENTIALS');
          }

          return {
            id: user.id,
            login: user.login,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (e) {
          if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P1001') {
            throw new Error('INVALID_CREDENTIALS');
          }
          throw e;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) { 
        token.id = (user as any).id; 
        token.role = (user as any).role; 
        token.sessionVersion = (user as any).sessionVersion ?? 1; 
      }
      return token;
    },
    async session({ session, token }) {
      (session.user as any).id = token.id;
      (session.user as any).role = token.role;
      (session.user as any).sessionVersion = token.sessionVersion ?? 1;
      return session;
    }
  },
});

// Expose route handlers for /api/auth/[...nextauth]
export const GET = handlers.GET;
export const POST = handlers.POST;

// Helper function to get current user ID from session
export async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Response("UNAUTHORIZED", { status: 401 });
  }
  return session.user.id as string;
}

// Helper function to get current user from session
export async function getSessionUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, login: true, role: true },
  });
  return user;
}

// Helper function to require specific role
export async function requireRole(role: "PARTNER") {
  const user = await getSessionUser();
  if (!user || user.role !== role) return null;
  return user;
}



