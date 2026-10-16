import React, {
  Children,
  cloneElement,
  Fragment,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import { isFounderCredit, splitFounderNames } from "@/lib/founder-name";

export function FounderName({ children }: { children: ReactNode }) {
  return <span className="founder-name">{children}</span>;
}

export function wrapFounderNames(text: string): ReactNode {
  const parts = splitFounderNames(text);
  if (parts.length === 1 && !parts[0].founder) return text;
  return parts.map((part, index) =>
    part.founder ? (
      <FounderName key={`fn-${index}`}>{part.value}</FounderName>
    ) : (
      part.value
    ),
  );
}

function isFounderNameElement(node: ReactElement): boolean {
  if (node.type === FounderName) return true;
  const className = (node.props as { className?: string }).className;
  return typeof className === "string" && className.split(" ").includes("founder-name");
}

export function withFounderNames(node: ReactNode): ReactNode {
  if (node == null || typeof node === "boolean") return node;
  if (typeof node === "string" || typeof node === "number") {
    return wrapFounderNames(String(node));
  }
  if (Array.isArray(node)) {
    return Children.map(node, withFounderNames);
  }
  if (isValidElement(node)) {
    if (isFounderNameElement(node)) return node;
    const type = node.type;
    if (type === "code" || type === "pre" || type === "kbd" || type === "samp") {
      return node;
    }
    const props = node.props as { children?: ReactNode };
    if (!("children" in props) || props.children == null) return node;
    return cloneElement(node, undefined, withFounderNames(props.children));
  }
  return node;
}

export function FounderCredit({ children }: { children: ReactNode }) {
  if (typeof children === "string" && isFounderCredit(children)) {
    return <FounderName>{children}</FounderName>;
  }
  return <Fragment>{withFounderNames(children)}</Fragment>;
}
