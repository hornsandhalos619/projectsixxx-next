import React, { type ReactNode } from "react";
import { isFounderCredit } from "@/lib/founder-name";
import { FounderName, withFounderNames } from "@/components/FounderName";

type MdxElProps = Record<string, unknown> & { children?: ReactNode };

function textBlock(Tag: "p" | "li" | "em" | "blockquote" | "h2" | "h3" | "h4" | "td" | "th" | "a") {
  return function Block({ children, ...props }: MdxElProps) {
    return <Tag {...props}>{withFounderNames(children)}</Tag>;
  };
}

function Strong({ children, ...props }: MdxElProps) {
  const text = typeof children === "string" ? children.trim() : "";
  if (text && isFounderCredit(text)) {
    return (
      <strong {...props}>
        <FounderName>{children}</FounderName>
      </strong>
    );
  }
  return <strong {...props}>{withFounderNames(children)}</strong>;
}

export const mdxComponents = {
  p: textBlock("p"),
  li: textBlock("li"),
  em: textBlock("em"),
  blockquote: textBlock("blockquote"),
  h2: textBlock("h2"),
  h3: textBlock("h3"),
  h4: textBlock("h4"),
  td: textBlock("td"),
  th: textBlock("th"),
  a: textBlock("a"),
  strong: Strong,
};
