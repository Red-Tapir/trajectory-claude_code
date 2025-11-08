/**
 * Performance optimization utilities
 */

/**
 * Debounce function for search inputs and other high-frequency events
 * @param func Function to debounce
 * @param wait Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle function for scroll events and other continuous events
 * @param func Function to throttle
 * @param limit Limit time in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

/**
 * Format large numbers for display (1000 -> 1k, 1000000 -> 1M)
 * @param num Number to format
 * @returns Formatted string
 */
export function formatLargeNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`
  }
  return num.toString()
}

/**
 * Lazy load component with suspense
 * Usage: const LazyComponent = lazyLoad(() => import('./Component'))
 */
export function lazyLoad<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
) {
  const LazyComponent = React.lazy(importFunc)
  return LazyComponent
}

import React from 'react'

/**
 * Check if the device is a mobile device
 * @returns True if mobile, false otherwise
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
}

/**
 * Preload critical resources
 * @param urls Array of resource URLs to preload
 * @param type Type of resource (image, script, style, font)
 */
export function preloadResources(urls: string[], type: 'image' | 'script' | 'style' | 'font') {
  if (typeof window === 'undefined') return

  urls.forEach(url => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = url
    link.as = type
    if (type === 'font') {
      link.crossOrigin = 'anonymous'
    }
    document.head.appendChild(link)
  })
}

/**
 * Measure component render time (development only)
 * @param componentName Name of the component
 * @param renderFn Render function to measure
 */
export function measureRenderTime<T>(
  componentName: string,
  renderFn: () => T
): T {
  if (process.env.NODE_ENV !== 'production') {
    const startTime = performance.now()
    const result = renderFn()
    const endTime = performance.now()
    console.log(`${componentName} rendered in ${endTime - startTime}ms`)
    return result
  }
  return renderFn()
}

/**
 * Chunk array into smaller arrays
 * Useful for rendering large lists in batches
 * @param array Array to chunk
 * @param size Chunk size
 * @returns Array of chunks
 */
export function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}
