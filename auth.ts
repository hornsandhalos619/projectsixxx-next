import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Twitter from "next-auth/providers/twitter";
import type { Role } from "@/config/roles";
import { resolveDemoIdentity } from "@/lib/auth-demo";
import { resolveRole } from "@/lib/house/roles";

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
          email: { label: "Username or email", type: "text" },
          password: { label: "Password", type: "password" },
        },
        authorize: async (creds) => {
          const password = String(creds?.password ?? "");
          if (!password || password !== expected) return null;
          const identity = resolveDemoIdentity(String(creds?.email ?? ""));
          if (!identity) return null;
          return identity;
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
      if (user?.name) token.name = user.name;
      const email =
        user?.email ?? (typeof token.email === "string" ? token.email : null);
      if (email) {
        token.role = await resolveRole(email);
        token.email = email;
      }
      return token;
    },
    async session({ session, token }) {
      const email = session.user.email ?? (typeof token.email === "string" ? token.email : null);
      session.user.role = (await resolveRole(email)) || ((token.role as Role) ?? "member");
      if (typeof token.name === "string" && token.name) {
        session.user.name = token.name;
      }
      return session;
    },
  },
});
