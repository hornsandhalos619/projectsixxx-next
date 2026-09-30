import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/auth.config";
import { verifyHouseCredentials } from "@/lib/house/accounts";
import { ensureSeededHouseAccount } from "@/lib/house/seed";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      id: "credentials",
      name: "House key",
      credentials: {
        email: { label: "Username or email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (creds) => {
        await ensureSeededHouseAccount();
        const identity = await verifyHouseCredentials(
          String(creds?.email ?? ""),
          String(creds?.password ?? ""),
        );
        return identity;
      },
    }),
  ],
});
