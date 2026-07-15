interface ServerCacheItem {
  data: any;
  expiry: number;
}

// NOTE: this only helps within a single warm serverless instance — Vercel
// may spin up multiple instances or cold-start a fresh one at any time, so
// this is a best-effort speed-up, not a guaranteed cache. For real caching
// across requests, use Vercel KV/Redis instead.
const serverCache = new Map<string, ServerCacheItem>();

export function getCachedData(key: string): any | null {
  const item = serverCache.get(key);
  if (item && item.expiry > Date.now()) {
    return item.data;
  }
  if (item) {
    serverCache.delete(key);
  }
  return null;
}

export function setCachedData(key: string, data: any, ttlSeconds: number) {
  serverCache.set(key, {
    data,
    expiry: Date.now() + ttlSeconds * 1000,
  });
}
