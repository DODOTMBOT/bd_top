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

type AppRole = 'OWNER' | 'PARTNER' | 'POINT' | 'USER';

console.log("[AUTH DEBUG]", { 
  url: process.env.NEXTAUTH_URL, 
  secret: process.env.NEXTAUTH_SECRET ? "SET" : "MISSING" 
});

if (!process.env.NEXTAUTH_SECRET && !process.env.AUTH_SECRET) {
  console.error("[AUTH] Missing NEXTAUTH_SECRET in .env.local");
  throw new Error("NEXTAUTH_SECRET is missing");
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        login: { label: "Login", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          console.log("DEBUG AUTH INPUT:", credentials);

          if (!credentials?.login || !credentials?.password) {
            throw new Error("Missing credentials");
          }

          const user = await prisma.user.findUnique({
            where: { login: credentials.login },
          });

          console.log("FOUND USER:", user);

          if (!user) {
            throw new Error("User not found");
          }

          // Проверяем пароль с помощью bcrypt
          const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
          if (!isValid) {
            throw new Error("Invalid password");
          }

          return {
            id: user.id,
            login: user.login,
            role: user.role,
          };
        } catch (error) {
          console.error("AUTHORIZE ERROR:", error);
          return null;
        }
      },
    }),
  ],

  pages: {
    signIn: "/login",
  },

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.login = user.login;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id,
          role: token.role,
          login: token.login,
        };
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
});

// Expose route handlers for /api/auth/[...nextauth]
export const GET = handlers.GET;
export const POST = handlers.POST;

// Helper function to get current user ID from session
export async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session.user.id;
}

// Helper function to get current user from session
export async function getSessionUser() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session.user;
}

// Helper function to require specific role
export async function requireRole(role: AppRole) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  if (session.user.role !== role) {
    throw new Error("Forbidden");
  }
  return session.user;
}



