/**
 * Neuraliso AI - High-Performance Intelligent Caching & Diagnostics Engine
 * Manages dual-tier memory + LocalStorage client-side storage, tracks cache hits/misses,
 * calculates system latency savings, and enables transparent system-wide caching.
 */

export interface CacheMetrics {
  hits: number;
  misses: number;
  totalRequests: number;
  latencySavingsMs: number; // accumulated simulated or measured time saved by bypassing servers
  storageBytes: number;     // approximate localStorage byte size
}

export interface CacheItem<T> {
  value: T;
  expiry: number; // timestamp
  latencyMs: number; // original fetch latency to calculate relative savings
}

class CacheEngine {
  private inMemoryCache = new Map<string, CacheItem<any>>();
  private metrics: CacheMetrics = {
    hits: 0,
    misses: 0,
    totalRequests: 0,
    latencySavingsMs: 0,
    storageBytes: 0,
  };

  constructor() {
    this.loadMetrics();
    this.recalculateStorageBytes();
  }

  private loadMetrics() {
    const saved = localStorage.getItem("neuraliso_cache_metrics");
    if (saved) {
      try {
        this.metrics = { ...this.metrics, ...JSON.parse(saved) };
      } catch (e) {
        // Safe reset
      }
    }
  }

  private saveMetrics() {
    localStorage.setItem("neuraliso_cache_metrics", JSON.stringify(this.metrics));
  }

  private recalculateStorageBytes() {
    let bytes = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const val = localStorage.getItem(key);
        bytes += key.length + (val ? val.length : 0);
      }
    }
    this.metrics.storageBytes = bytes;
    this.saveMetrics();
  }

  /**
   * Retrieves an item from the cache.
   * Calculates hits/misses and records latency savings on hits.
   * @param key Unique key identifier
   */
  public get<T>(key: string): T | null {
    this.metrics.totalRequests += 1;
    const now = Date.now();

    // 1. Check in-memory
    let item = this.inMemoryCache.get(key);

    // 2. Fallback to LocalStorage
    if (!item) {
      const saved = localStorage.getItem(`neuraliso_cache_item_${key}`);
      if (saved) {
        try {
          item = JSON.parse(saved);
          if (item) {
            // Restore back to in-memory
            this.inMemoryCache.set(key, item);
          }
        } catch (e) {
          // Bad payload
        }
      }
    }

    // 3. Evaluate item validity
    if (item) {
      if (item.expiry > now) {
        this.metrics.hits += 1;
        // Assume default server latency round-trip of 650ms bypassed on hit, or use actual
        const savedTime = item.latencyMs || 650;
        this.metrics.latencySavingsMs += savedTime;
        this.saveMetrics();
        return item.value as T;
      } else {
        // Expired
        this.delete(key);
      }
    }

    this.metrics.misses += 1;
    this.saveMetrics();
    return null;
  }

  /**
   * Stores a value in the cache with specific TTL.
   * @param key Unique key
   * @param value The object to cache
   * @param ttlSeconds Seconds until expiry (default 5 minutes)
   * @param latencyMs Original API request latency in ms
   */
  public set<T>(key: string, value: T, ttlSeconds: number = 300, latencyMs: number = 650) {
    const now = Date.now();
    const item: CacheItem<T> = {
      value,
      expiry: now + (ttlSeconds * 1000),
      latencyMs,
    };

    // Store in-memory
    this.inMemoryCache.set(key, item);

    // Store in local storage for persistence
    try {
      localStorage.setItem(`neuraliso_cache_item_${key}`, JSON.stringify(item));
    } catch (e) {
      console.warn("Storage quota full, clearing older caches:", e);
      this.flushExpired();
    }

    this.recalculateStorageBytes();
  }

  /**
   * Deletes a cache item.
   */
  public delete(key: string) {
    this.inMemoryCache.delete(key);
    localStorage.removeItem(`neuraliso_cache_item_${key}`);
    this.recalculateStorageBytes();
  }

  /**
   * Flushes all expired keys.
   */
  public flushExpired() {
    const now = Date.now();
    
    // Clear memory
    for (const [key, item] of this.inMemoryCache.entries()) {
      if (item.expiry <= now) {
        this.inMemoryCache.delete(key);
      }
    }

    // Clear localStorage
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("neuraliso_cache_item_")) {
        const val = localStorage.getItem(key);
        if (val) {
          try {
            const item: CacheItem<any> = JSON.parse(val);
            if (item.expiry <= now) {
              keysToRemove.push(key);
            }
          } catch (e) {
            keysToRemove.push(key);
          }
        }
      }
    }

    keysToRemove.forEach((k) => localStorage.removeItem(k));
    this.recalculateStorageBytes();
  }

  /**
   * Wipes the entire cache and metrics.
   */
  public clearAll() {
    this.inMemoryCache.clear();
    
    // Remove cache items
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith("neuraliso_cache_item_") || key === "neuraliso_cache_metrics")) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));

    this.metrics = {
      hits: 0,
      misses: 0,
      totalRequests: 0,
      latencySavingsMs: 0,
      storageBytes: 0,
    };
    this.saveMetrics();
    this.recalculateStorageBytes();
  }

  /**
   * Retrieves the current live diagnostic metrics.
   */
  public getMetrics(): CacheMetrics {
    return this.metrics;
  }
}

export const cache = new CacheEngine();
export default cache;
