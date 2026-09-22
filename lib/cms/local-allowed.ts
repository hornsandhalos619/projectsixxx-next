export function localAllowed(): boolean {
  return process.env.VERCEL !== "1";
}
