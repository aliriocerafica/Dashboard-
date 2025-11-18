/**
 * Simple in-memory cache with TTL (Time To Live)
 */
class DataCache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Set data in cache
   * @param key - Cache key
   * @param data - Data to cache
   * @param ttl - Time to live in milliseconds (optional)
   */
  set(key: string, data: any, ttl?: number) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Get data from cache if not expired
   * @param key - Cache key
   * @param ttl - Time to live in milliseconds (optional)
   * @returns Cached data or null if expired/not found
   */
  get(key: string, ttl?: number): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const maxAge = ttl || this.defaultTTL;
    const age = Date.now() - cached.timestamp;

    if (age < maxAge) {
      return cached.data;
    }

    // Expired, remove from cache
    this.cache.delete(key);
    return null;
  }

  /**
   * Clear specific cache entry
   * @param key - Cache key
   */
  clear(key: string) {
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clearAll() {
    this.cache.clear();
  }

  /**
   * Check if cache has key
   * @param key - Cache key
   * @returns boolean
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }
}

// Export singleton instance
export const dataCache = new DataCache();

/**
 * Fetch with cache wrapper
 * @param url - URL to fetch
 * @param options - Fetch options
 * @param cacheKey - Custom cache key (optional)
 * @param ttl - Cache TTL in milliseconds (optional)
 * @returns Fetched data
 */
export async function fetchWithCache<T>(
  url: string,
  options?: RequestInit,
  cacheKey?: string,
  ttl?: number
): Promise<T> {
  const key = cacheKey || url;

  // Check cache first
  const cached = dataCache.get(key, ttl);
  if (cached) {
    console.log(`[Cache] Hit: ${key}`);
    return cached;
  }

  console.log(`[Cache] Miss: ${key}`);

  // Fetch data
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  // Store in cache
  dataCache.set(key, data, ttl);

  return data;
}
