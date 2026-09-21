const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/['’"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function isValidSlug(value: string): boolean {
  return SLUG_PATTERN.test(value) && value.length <= 80;
}

export function todayStamp(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function isDateStamp(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}
