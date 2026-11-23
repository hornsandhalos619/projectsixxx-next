import { isBoardCategory, type BoardCategory } from "@/lib/board/categories";
import { boardCopy, REPLY_BODY_MAX, THREAD_BODY_MAX, TITLE_MAX, TITLE_MIN } from "@/lib/board/copy";

const CONTROL =
  /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type TextResult = { ok: true; value: string } | { ok: false; error: string };

export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

/** Drop control and bidi characters. Keep newlines and tabs for bodies. */
export function cleanPlain(raw: string): string {
  return String(raw ?? "").replace(/\r\n?/g, "\n").replace(CONTROL, "");
}

export function hasMarkup(value: string): boolean {
  return value.includes("<") || value.includes(">");
}

/** Last line of defense before text is placed in the page. React also escapes. */
export function displayPlain(value: string): string {
  return cleanPlain(value).replace(/[<>]/g, "");
}

export function validateTitle(raw: string): TextResult {
  const cleaned = cleanPlain(raw).replace(/\s+/g, " ").trim();
  if (hasMarkup(cleaned)) return { ok: false, error: boardCopy.markup };
  if (cleaned.length < TITLE_MIN || cleaned.length > TITLE_MAX) {
    return { ok: false, error: boardCopy.titleLength };
  }
  return { ok: true, value: cleaned };
}

export function validateBody(raw: string, max: number): TextResult {
  const cleaned = cleanPlain(raw).replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  if (hasMarkup(cleaned)) return { ok: false, error: boardCopy.markup };
  if (cleaned.length < 1 || cleaned.length > max) {
    const error = max === REPLY_BODY_MAX ? boardCopy.replyBodyLength : boardCopy.threadBodyLength;
    return { ok: false, error };
  }
  return { ok: true, value: cleaned };
}

export function validateThreadBody(raw: string): TextResult {
  return validateBody(raw, THREAD_BODY_MAX);
}

export function validateReplyBody(raw: string): TextResult {
  return validateBody(raw, REPLY_BODY_MAX);
}

export function validateCategory(raw: string): { ok: true; value: BoardCategory } | { ok: false; error: string } {
  const slug = String(raw ?? "").trim();
  if (!isBoardCategory(slug)) return { ok: false, error: boardCopy.category };
  return { ok: true, value: slug };
}
