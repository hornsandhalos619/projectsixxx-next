import fs from "node:fs";
import path from "node:path";
import { localAllowed } from "@/lib/cms/local-allowed";

function fileFor(name: string): string {
  return path.join(process.cwd(), "data", `${name}.json`);
}

export function localJsonRead<T>(name: string): T[] {
  if (!localAllowed()) return [];
  const file = fileFor(name);
  if (!fs.existsSync(file)) return [];
  try {
    const parsed = JSON.parse(fs.readFileSync(file, "utf8")) as unknown;
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

export function localJsonWrite<T>(name: string, items: T[]): void {
  if (!localAllowed()) {
    throw new Error("Local CMS files are disabled on Vercel.");
  }
  const file = fileFor(name);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(items, null, 2)}\n`, "utf8");
}

export function localJsonReadObject<T>(name: string, fallback: T): T {
  if (!localAllowed()) return fallback;
  const file = fileFor(name);
  if (!fs.existsSync(file)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(file, "utf8")) as T;
  } catch {
    return fallback;
  }
}

export function localJsonWriteObject<T>(name: string, value: T): void {
  if (!localAllowed()) {
    throw new Error("Local CMS files are disabled on Vercel.");
  }
  const file = fileFor(name);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}
