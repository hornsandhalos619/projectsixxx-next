/**
 * Founder name / handle tokens rendered in house crimson.
 * Whole-string credits: "6", "Matthew Feldman", "Sixxx" / "SiXXX".
 * Inline tokens: Matthew Feldman and Sixxx (any casing), never a bare "6"
 * (avoids Line 6, 14.6, Cipher Grid 6, etc.).
 */
export const FOUNDER_CRIMSON = "#E8203F";

/** WCAG contrast vs pure black (#000). #E8203F is 4.71:1 (clears AA 4.5:1 at body size). */
export const FOUNDER_CRIMSON_CONTRAST = 4.71;

const WHOLE = /^(6|matthew feldman|sixxx)$/i;
const INLINE = /\bMatthew Feldman\b|\bSixxx\b/gi;

export function isFounderCredit(value: string): boolean {
  return WHOLE.test(value.trim());
}

export type FounderNamePiece = { founder: boolean; value: string };

export function splitFounderNames(text: string): FounderNamePiece[] {
  if (isFounderCredit(text)) {
    return [{ founder: true, value: text }];
  }

  const pieces: FounderNamePiece[] = [];
  const re = new RegExp(INLINE.source, INLINE.flags);
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    if (match.index > last) {
      pieces.push({ founder: false, value: text.slice(last, match.index) });
    }
    pieces.push({ founder: true, value: match[0] });
    last = match.index + match[0].length;
  }
  if (last < text.length) {
    pieces.push({ founder: false, value: text.slice(last) });
  }
  if (pieces.length === 0 && text) {
    pieces.push({ founder: false, value: text });
  }
  return pieces;
}
