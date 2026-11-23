import { displayPlain } from "@/lib/board/text";

export function BoardText({ text }: { text: string }) {
  return <p className="board-body">{displayPlain(text)}</p>;
}
