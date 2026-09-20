import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Twitter from "next-auth/providers/twitter";
import { roleForEmail, type Role } from "@/config/roles";

function providers(): Provider[] {
  const list: Provider[] = [];

  if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
    list.push(
      Google({
        clientId: process.env.AUTH_GOOGLE_ID,
        clientSecret: process.env.AUTH_GOOGLE_SECRET,
      }),
    );
  }

  if (process.env.AUTH_TWITTER_ID && process.env.AUTH_TWITTER_SECRET) {
    list.push(
      Twitter({
        clientId: process.env.AUTH_TWITTER_ID,
        clientSecret: process.env.AUTH_TWITTER_SECRET,
      }),
    );
  }

  // Email (Nodemailer) is declared in .env.example and the sign-in UI.
  // It is not imported here so empty placeholders cannot pull Node SMTP into the bundle.

  if (process.env.AUTH_DEMO === "1" && process.env.AUTH_DEMO_PASSWORD) {
    const expected = process.env.AUTH_DEMO_PASSWORD;
    list.push(
      Credentials({
        id: "demo",
        name: "Email",
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" },
        },
        authorize: async (creds) => {
          const email = String(creds?.email ?? "")
            .trim()
            .toLowerCase();
          const password = String(creds?.password ?? "");
          if (!email || !password || password !== expected) return null;
          return { id: email, email, name: email };
        },
      }),
    );
  }

  return list;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET || "projectsixxx-build-placeholder",
  pages: { signIn: "/signin" },
  providers: providers(),
  callbacks: {
    async jwt({ token, user }) {
      const email =
        user?.email ?? (typeof token.email === "string" ? token.email : null);
      if (email) {
        token.role = roleForEmail(email);
        token.email = email;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.role = (token.role as Role) || roleForEmail(session.user.email);
      return session;
    },
  },
});
