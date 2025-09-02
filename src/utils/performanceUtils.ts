// Performance monitoring and optimization utilities
import React from 'react';

interface PerformanceMetrics {
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  timeToInteractive: number;
}

class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {};
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initializeObservers();
  }

  private initializeObservers() {
    // Observe navigation timing
    if ('performance' in window && 'getEntriesByType' in performance) {
      this.measurePageLoad();
    }

    // Observe paint timing
    if ('PerformanceObserver' in window) {
      this.observePaintTiming();
      this.observeLCP();
      this.observeFID();
      this.observeCLS();
    }
  }

  private measurePageLoad() {
    const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (navigationEntries.length > 0) {
      const navigation = navigationEntries[0];
      this.metrics.pageLoadTime = navigation.loadEventEnd - navigation.fetchStart;
    }
  }

  private observePaintTiming() {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.firstContentfulPaint = entry.startTime;
          }
        }
      });
      
      observer.observe({ entryTypes: ['paint'] });
      this.observers.push(observer);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) { /* empty */ }
  }

  private observeLCP() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries() as PerformanceEntry[];
        const lastEntry = entries[entries.length - 1];
        this.metrics.largestContentfulPaint = lastEntry.startTime;
      });
      
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(observer);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) { /* empty */ }
  }

  private observeFID() {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-input') {
            const fidEntry = entry as any;
            this.metrics.firstInputDelay = fidEntry.processingStart - fidEntry.startTime;
            console.log(`[PERF] First Input Delay: ${this.metrics.firstInputDelay.toFixed(2)}ms`);
          }
        }
      });
      
      observer.observe({ entryTypes: ['first-input'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('[PERF] FID not supported:', error);
    }
  }

  private observeCLS() {
    try {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        this.metrics.cumulativeLayoutShift = clsValue;
      });
      
      observer.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(observer);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error: unknown) { /* empty */ }
  }

  getMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics };
  }

  logPerformanceReport() {
    console.group('[PERF] Performance Report');
    console.table(this.metrics);
    console.groupEnd();
  }

  // Resource loading analysis
  analyzeResourceLoading() {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    const analysis = {
      totalResources: resources.length,
      slowResources: resources.filter(r => r.duration > 1000),
      largeResources: resources.filter(r => r.transferSize > 100000),
      cacheHits: resources.filter(r => r.transferSize === 0),
      resourceTypes: resources.reduce((acc, resource) => {
        const type = this.getResourceType(resource.name);
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };

    console.log('[PERF] Resource Analysis:', analysis);
    return analysis;
  }

  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'script';
    if (url.includes('.css')) return 'stylesheet';
    if (url.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)) return 'image';
    if (url.match(/\.(woff|woff2|ttf|eot)$/)) return 'font';
    return 'other';
  }

  // Memory usage monitoring
  getMemoryUsage() {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        usedPercentage: ((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100).toFixed(2)
      };
    }
    return null;
  }

  disconnect() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Performance optimization utilities
export class PerformanceOptimizer {
  // Image lazy loading with Intersection Observer
  static lazyLoadImages(selector = 'img[data-src]') {
    if (!('IntersectionObserver' in window)) {
      // Fallback for browsers without Intersection Observer
      document.querySelectorAll(selector).forEach((img: any) => {
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
      });
      return;
    }

    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            img.classList.remove('lazy');
            observer.unobserve(img);
          }
        }
      });
    }, {
      rootMargin: '50px'
    });

    document.querySelectorAll(selector).forEach(img => {
      imageObserver.observe(img);
    });
  }

  // Preload critical resources
  static preloadCriticalResources(resources: Array<{ href: string; as: string; type?: string }>) {
    resources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource.href;
      link.as = resource.as;
      if (resource.type) {
        link.type = resource.type;
      }
      document.head.appendChild(link);
    });
  }

  // Debounce utility for expensive operations
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number,
    immediate = false
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;
    
    return function executedFunction(...args: Parameters<T>) {
      const later = () => {
        timeout = null;
        if (!immediate) func(...args);
      };
      
      const callNow = immediate && !timeout;
      
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      
      if (callNow) func(...args);
    };
  }

  // Throttle utility for scroll/resize events
  static throttle<T extends (...args: never[]) => unknown>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    
    return function executedFunction(this: ThisParameterType<T>, ...args: Parameters<T>) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // RequestIdleCallback wrapper with fallback
  static runWhenIdle(callback: () => void, timeout = 5000) {
    if ('requestIdleCallback' in window) {
      (window as typeof window & { 
        requestIdleCallback: (callback: () => void, options?: { timeout: number }) => void 
      }).requestIdleCallback(callback, { timeout });
    } else {
      setTimeout(callback, 16); // Fallback to next frame
    }
  }

  // Web Worker utility for offloading heavy computations
  static createWorker(workerFunction: () => void): Worker {
    const blob = new Blob([`(${workerFunction.toString()})()`], { type: 'application/javascript' });
    return new Worker(URL.createObjectURL(blob));
  }
}

// Critical resource hints
export function addCriticalResourceHints() {
  const criticalResources = [
    { href: '/src/main.tsx', as: 'script', type: 'module' },
    { href: '/src/App.css', as: 'style' }
  ];

  PerformanceOptimizer.preloadCriticalResources(criticalResources);
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Measure component render time
export function measureComponentPerformance(componentName: string) {
  return {
    start: () => performance.mark(`${componentName}-start`),
    end: () => {
      performance.mark(`${componentName}-end`);
      performance.measure(`${componentName}-render`, `${componentName}-start`, `${componentName}-end`);
      
      const measurement = performance.getEntriesByName(`${componentName}-render`)[0];
      console.log(`[PERF] ${componentName} render time: ${measurement.duration.toFixed(2)}ms`);
      
      // Clean up marks and measures
      performance.clearMarks(`${componentName}-start`);
      performance.clearMarks(`${componentName}-end`);
      performance.clearMeasures(`${componentName}-render`);
    }
  };
}

// React performance profiler utility
export function withPerformanceProfiler<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) {
  return function ProfiledComponent(props: P) {
    const perf = measureComponentPerformance(componentName);
    
    React.useEffect(() => {
      perf.start();
      return () => perf.end();
    });

    return React.createElement(Component, props);
  };
}

