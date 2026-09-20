import { auth } from "@/auth";
import { type ViewerRole } from "@/config/roles";

export async function getViewer(): Promise<{
  email: string | null;
  role: ViewerRole;
}> {
  try {
    const session = await auth();
    if (!session?.user) return { email: null, role: "anon" };
    return {
      email: session.user.email ?? null,
      role: session.user.role ?? "member",
    };
  } catch {
    return { email: null, role: "anon" };
  }
}
