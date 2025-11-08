import type { CacheEntry, CacheManager } from '~/types'

/**
 * Simple in-memory cache with TTL support
 */
export const useCache = (): CacheManager => {
  const cache = new Map<string, CacheEntry<any>>()

  const get = <T>(key: string): T | null => {
    const entry = cache.get(key)

    if (!entry) {
      return null
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      cache.delete(key)
      return null
    }

    return entry.data as T
  }

  const set = <T>(key: string, data: T, ttl: number = 1000 * 60 * 30): void => {
    cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  const invalidate = (key: string): void => {
    cache.delete(key)
  }

  const clear = (): void => {
    cache.clear()
  }

  return {
    get,
    set,
    invalidate,
    clear,
  }
}
