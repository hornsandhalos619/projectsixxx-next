import { RATE_LIMIT, RATE_WINDOW_MS } from "@/lib/board/copy";

export type RateGate = {
  allow(accountId: string, now: number): boolean;
  release(accountId: string): void;
};

export function createRateGate(limit = RATE_LIMIT, windowMs = RATE_WINDOW_MS): RateGate {
  const bursts = new Map<string, number[]>();
  return {
    allow(accountId, now) {
      const windowStart = now - windowMs;
      const stamps = (bursts.get(accountId) ?? []).filter((stamp) => stamp > windowStart);
      if (stamps.length >= limit) {
        bursts.set(accountId, stamps);
        return false;
      }
      stamps.push(now);
      bursts.set(accountId, stamps);
      return true;
    },
    release(accountId) {
      const stamps = bursts.get(accountId);
      if (!stamps?.length) return;
      stamps.pop();
    },
  };
}

/** Process-local burst guard. The store count is the cross-instance check. */
export const boardRateGate = createRateGate();
