import 'server-only';

// In-memory sliding window, per server process. Good enough for M1; use a shared store (Redis) if scaled out.
const WINDOW_MS = 10 * 60 * 1000;
const MAX = 5;
const MAX_UNKNOWN = 60; // requests without a usable client address share one bucket: keep it loose
const MAX_KEYS = 10_000;
const hits = new Map<string, number[]>();

/** Records an attempt and returns false when the limit for this key is exceeded. */
export function allow(key: string, now = Date.now()): boolean {
  if (hits.size > MAX_KEYS) {
    for (const [k, v] of hits) if (v.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
    // still full of live keys: drop the oldest entries instead of resetting every counter
    for (const k of hits.keys()) {
      if (hits.size <= MAX_KEYS) break;
      hits.delete(k);
    }
  }
  const limit = key === 'unknown' ? MAX_UNKNOWN : MAX;
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  return true;
}

export function resetRateLimit() {
  hits.clear();
}
