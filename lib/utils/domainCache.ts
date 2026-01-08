/**
 * Simple in-memory cache for domain/subdomain lookups
 * Reduces database queries in middleware
 */

interface CachedDomain {
  slug: string
  expires: number
}

class DomainCache {
  private cache = new Map<string, CachedDomain>()
  private readonly TTL = 5 * 60 * 1000 // 5 minutes

  /**
   * Get cached domain mapping
   */
  get(hostname: string): string | null {
    const key = hostname.toLowerCase()
    const cached = this.cache.get(key)
    
    if (cached && cached.expires > Date.now()) {
      return cached.slug
    }
    
    // Remove expired entry
    if (cached) {
      this.cache.delete(key)
    }
    
    return null
  }

  /**
   * Set cached domain mapping
   */
  set(hostname: string, slug: string): void {
    const key = hostname.toLowerCase()
    this.cache.set(key, {
      slug,
      expires: Date.now() + this.TTL
    })
  }

  /**
   * Clear cache (useful for testing or when domains change)
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Remove specific entry from cache
   */
  delete(hostname: string): void {
    this.cache.delete(hostname.toLowerCase())
  }

  /**
   * Clean up expired entries (call periodically)
   */
  cleanup(): void {
    const now = Date.now()
    for (const [key, value] of this.cache.entries()) {
      if (value.expires <= now) {
        this.cache.delete(key)
      }
    }
  }
}

// Singleton instance
export const domainCache = new DomainCache()

// Cleanup expired entries every 10 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    domainCache.cleanup()
  }, 10 * 60 * 1000)
}

