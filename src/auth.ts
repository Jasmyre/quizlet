import { PrismaAdapter } from "@auth/prisma-adapter";
import type { UserRole } from "@prisma/client";
import NextAuth from "next-auth";
import authConfig from "@/auth.config";
import { getUserById } from "@/data/user";
import { db } from "@/server/db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: {
    signIn: "/auth",
    error: "/auth/error",
  },
  events: {
    async linkAccount({ user }) {
      await db.user.update({
        where: { id: user.id },
        data: {
          emailVerified: new Date(),
          username: user.name || user.email?.split("@")[0],
        },
      });
    },
  },
  callbacks: {
    redirect({ baseUrl }) {
      return baseUrl;
    },
    session({ token, session }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }

      if (token.role && session.user) {
        session.user.role = token.role as UserRole;
      }

      session.user.emailVerified = token.emailVerified as Date;

      if (token.username && session.user) {
        session.user.username = token.username as string;
      }

      return session;
    },
    async jwt({ token }) {
      if (!token.sub) {
        return token;
      }

      const existingUser = await getUserById(token.sub);

      if (!existingUser) {
        return token;
      }

      token.role = existingUser?.role;
      token.emailVerified = existingUser?.emailVerified;
      token.username = existingUser?.username;

      return token;
    },
  },
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  ...authConfig,
});
