/**
 * Tiny in-memory fixed-window limiter for the public tracking endpoint.
 * 30 requests / minute / IP. (Per process; use a shared store if you run several instances.)
 */
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 30;
const MAX_TRACKED_IPS = 10_000;

const hits = new Map<string, { count: number; resetAt: number }>();

export default () => async (ctx: any, next: () => Promise<void>) => {
  const now = Date.now();
  const ip = ctx.request.ip || ctx.ip || 'unknown';

  if (hits.size > MAX_TRACKED_IPS) {
    for (const [key, value] of hits) {
      if (value.resetAt <= now) hits.delete(key);
    }
    if (hits.size > MAX_TRACKED_IPS) hits.clear();
  }

  let entry = hits.get(ip);
  if (!entry || entry.resetAt <= now) {
    entry = { count: 0, resetAt: now + WINDOW_MS };
    hits.set(ip, entry);
  }
  entry.count += 1;

  if (entry.count > MAX_REQUESTS) {
    ctx.set('Retry-After', String(Math.ceil((entry.resetAt - now) / 1000)));
    ctx.status = 429;
    ctx.body = {
      data: null,
      error: { status: 429, name: 'TooManyRequests', message: 'Too many requests, slow down.' },
    };
    return;
  }

  await next();
};
