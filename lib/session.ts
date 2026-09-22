import { auth } from "@/auth";
import { applyGrantedRole, isGrantableRole, type ViewerRole } from "@/config/roles";
import { localAllowed } from "@/lib/cms/local-allowed";
import { localJsonRead } from "@/lib/cms/local-json";

export async function getViewer(): Promise<{
  email: string | null;
  name: string | null;
  role: ViewerRole;
}> {
  try {
    const session = await auth();
    if (!session?.user) return { email: null, name: null, role: "anon" };
    const email = session.user.email ?? null;
    let role: ViewerRole = session.user.role ?? "member";
    if (email && role === "member" && localAllowed()) {
      const granted = localJsonRead<{ email: string; role: string }>("house-roles").find(
        (row) => row.email === email.toLowerCase(),
      );
      if (granted && isGrantableRole(granted.role)) {
        role = applyGrantedRole(email, granted.role);
      }
    }
    return {
      email,
      name: session.user.name ?? null,
      role,
    };
  } catch {
    return { email: null, name: null, role: "anon" };
  }
}
