// Cache monitoring utility for debugging and performance tracking
import { cacheService } from '@/services/cache-service'

export const cacheMonitor = {
  // Log cache statistics
  logStats(): void {
    const stats = cacheService.getCacheStats()
    if (stats) {
      console.group('📊 Cache Statistics')
      console.log(`Size: ${stats.size} prompts`)
      console.log(`Age: ${stats.age}s`)
      console.log(`Status: ${stats.fresh ? '✅ Fresh' : '❌ Stale'}`)
      console.groupEnd()
    } else {
      console.log('📊 Cache: Empty')
    }
  },

  // Monitor cache hit/miss rates
  trackCacheUsage(): void {
    let hits = 0
    let misses = 0

    // Override getPrompts to track usage
    const originalGetPrompts = cacheService.getPrompts
    cacheService.getPrompts = function(authState: string) {
      const result = originalGetPrompts.call(this, authState)
      if (result) {
        hits++
        console.log(`🎯 Cache HIT (${hits}/${hits + misses})`)
      } else {
        misses++
        console.log(`❌ Cache MISS (${hits}/${hits + misses})`)
      }
      return result
    }

    // Log summary every 10 operations
    const logInterval = setInterval(() => {
      if (hits + misses > 0) {
        const hitRate = ((hits / (hits + misses)) * 100).toFixed(1)
        console.log(`📈 Cache Hit Rate: ${hitRate}% (${hits}/${hits + misses})`)
      }
    }, 30000) // Every 30 seconds

    // Return cleanup function
    return () => {
      clearInterval(logInterval)
      cacheService.getPrompts = originalGetPrompts
    }
  },

  // Performance comparison: with vs without cache
  async benchmarkCache(): Promise<void> {
    console.group('🏃‍♂️ Cache Performance Benchmark')
    
    // Clear cache and measure cold load
    cacheService.clearPrompts()
    const coldStart = performance.now()
    
    // Simulate a fetch (you'd replace this with actual fetch)
    await new Promise(resolve => setTimeout(resolve, 100))
    const coldEnd = performance.now()
    
    // Measure warm load (from cache)
    const warmStart = performance.now()
    cacheService.getPrompts(cacheService.getAuthState())
    const warmEnd = performance.now()
    
    console.log(`Cold load: ${(coldEnd - coldStart).toFixed(2)}ms`)
    console.log(`Warm load: ${(warmEnd - warmStart).toFixed(2)}ms`)
    console.log(`Speedup: ${((coldEnd - coldStart) / (warmEnd - warmStart)).toFixed(1)}x`)
    console.groupEnd()
  }
}

// Development helper - auto-enable in dev mode
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Add to window for easy access in dev tools
  ;(window as any).cacheMonitor = cacheMonitor
  
  // Auto-log cache stats when cache is accessed
  console.log('🔧 Cache monitoring enabled. Use cacheMonitor.logStats() in console.')
}
