import type { ReactNode } from "react";
import "./board.css";

export const dynamic = "force-dynamic";

export default function BoardLayout({ children }: { children: ReactNode }) {
  return children;
}
