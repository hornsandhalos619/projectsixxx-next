import type { NextAuthConfig } from "next-auth";
import type { Role } from "@/config/roles";
import { ensureAuthUrl } from "@/lib/auth-env";
import { resolveRole } from "@/lib/house/lookup";

ensureAuthUrl();

export const authConfig = {
  trustHost: true,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "projectsixxx-build-placeholder",
  session: { strategy: "jwt" },
  pages: { signIn: "/signin", error: "/signin" },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.name) token.name = user.name;
      const email =
        user?.email ?? (typeof token.email === "string" ? token.email : null);
      if (email) {
        const normalized = email.trim().toLowerCase();
        token.role = await resolveRole(normalized);
        token.email = normalized;
      }
      return token;
    },
    async session({ session, token }) {
      const email = typeof token.email === "string" ? token.email : session.user.email;
      if (email) session.user.email = email.trim().toLowerCase();
      session.user.role =
        (await resolveRole(session.user.email)) || ((token.role as Role) ?? "member");
      if (typeof token.name === "string" && token.name) {
        session.user.name = token.name;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
