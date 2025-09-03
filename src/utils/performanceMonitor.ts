import { debugLog } from './debugLogger';
import React from 'react';

interface PerformanceMetrics {
  frameRate: number;
  memoryUsage: number;
  lastRenderTime: number;
  animationLoad: number;
}

interface PerformanceConfig {
  enableMonitoring: boolean;
  frameRateTarget: number;
  memoryWarningThreshold: number;
  memoryCriticalThreshold: number;
  sampleInterval: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    frameRate: 60,
    memoryUsage: 0,
    lastRenderTime: 0,
    animationLoad: 0
  };

  private config: PerformanceConfig = {
    enableMonitoring: true,
    frameRateTarget: 60,
    memoryWarningThreshold: 100, // MB
    memoryCriticalThreshold: 200, // MB
    sampleInterval: 1000 // ms
  };

  private frameCount = 0;
  private lastFrameTime = performance.now();
  private monitoringInterval: number | null = null;
  private observers: ((metrics: PerformanceMetrics) => void)[] = [];

  constructor(config?: Partial<PerformanceConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }

    if (this.config.enableMonitoring) {
      this.startMonitoring();
    }
  }

  public startMonitoring() {
    if (this.monitoringInterval) return;

    // Monitor frame rate
    this.monitorFrameRate();

    // Monitor memory usage (if available)
    if ('memory' in performance) {
      this.monitoringInterval = window.setInterval(() => {
        this.updateMemoryMetrics();
        this.notifyObservers();
      }, this.config.sampleInterval);
    }

    debugLog.log('[PerformanceMonitor] Started monitoring');
  }

  public stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    debugLog.log('[PerformanceMonitor] Stopped monitoring');
  }

  private monitorFrameRate() {
    const measureFrame = () => {
      const now = performance.now();
      const delta = now - this.lastFrameTime;
      
      if (delta >= 1000) {
        this.metrics.frameRate = (this.frameCount * 1000) / delta;
        this.frameCount = 0;
        this.lastFrameTime = now;
        this.notifyObservers();
      }
      
      this.frameCount++;
      requestAnimationFrame(measureFrame);
    };
    
    requestAnimationFrame(measureFrame);
  }

  private updateMemoryMetrics() {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.metrics.memoryUsage = memory.usedJSHeapSize / (1024 * 1024); // Convert to MB
    }
  }

  private notifyObservers() {
    this.observers.forEach(observer => observer(this.metrics));
  }

  public subscribe(callback: (metrics: PerformanceMetrics) => void): () => void {
    this.observers.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.observers.indexOf(callback);
      if (index > -1) {
        this.observers.splice(index, 1);
      }
    };
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public updateAnimationLoad(load: number) {
    this.metrics.animationLoad = load;
    this.metrics.lastRenderTime = Date.now();
  }

  public isPerformanceCritical(): boolean {
    return (
      this.metrics.frameRate < this.config.frameRateTarget * 0.5 ||
      this.metrics.memoryUsage > this.config.memoryCriticalThreshold
    );
  }

  public getPerformanceLevel(): 'high' | 'medium' | 'low' | 'critical' {
    if (this.isPerformanceCritical()) return 'critical';
    
    if (
      this.metrics.frameRate < this.config.frameRateTarget * 0.75 ||
      this.metrics.memoryUsage > this.config.memoryWarningThreshold
    ) {
      return 'low';
    }
    
    if (this.metrics.frameRate < this.config.frameRateTarget * 0.9) {
      return 'medium';
    }
    
    return 'high';
  }

  public getOptimizationRecommendations(): string[] {
    const recommendations: string[] = [];
    
    if (this.metrics.frameRate < 30) {
      recommendations.push('Reduce animation complexity');
      recommendations.push('Enable reduced motion mode');
    }
    
    if (this.metrics.frameRate < 20) {
      recommendations.push('Disable background animations');
      recommendations.push('Reduce visual effects');
    }
    
    if (this.metrics.memoryUsage > this.config.memoryWarningThreshold) {
      recommendations.push('Clear unused cached data');
      recommendations.push('Optimize component rendering');
    }
    
    if (this.metrics.memoryUsage > this.config.memoryCriticalThreshold) {
      recommendations.push('Enable aggressive memory management');
      recommendations.push('Restart application');
    }
    
    return recommendations;
  }

  public markRenderStart(componentName: string): () => void {
    const startTime = performance.now();
    performance.mark(`${componentName}-render-start`);
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      performance.mark(`${componentName}-render-end`);
      performance.measure(
        `${componentName}-render`,
        `${componentName}-render-start`,
        `${componentName}-render-end`
      );
      
      if (renderTime > 16.67) { // More than one frame at 60fps
        debugLog.warn(`[Performance] Slow render: ${componentName} took ${renderTime.toFixed(2)}ms`);
      }
      
      return renderTime;
    };
  }

  public dispose() {
    this.stopMonitoring();
    this.observers = [];
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor({
  enableMonitoring: process.env.NODE_ENV === 'development'
});

// React hook for performance metrics
export function usePerformanceMetrics() {
  const [metrics, setMetrics] = React.useState<PerformanceMetrics>(
    performanceMonitor.getMetrics()
  );

  React.useEffect(() => {
    const unsubscribe = performanceMonitor.subscribe(setMetrics);
    return unsubscribe;
  }, []);

  return {
    metrics,
    performanceLevel: performanceMonitor.getPerformanceLevel(),
    isPerformanceCritical: performanceMonitor.isPerformanceCritical(),
    recommendations: performanceMonitor.getOptimizationRecommendations(),
    markRenderStart: performanceMonitor.markRenderStart.bind(performanceMonitor)
  };
}

// Performance measurement decorator for components
export function withPerformanceTracking<T extends React.ComponentType<any>>(
  Component: T,
  componentName?: string
): T {
  const WrappedComponent = React.forwardRef((props: React.ComponentProps<T>, ref: any) => {
    const name = componentName || Component.displayName || Component.name;
    
    React.useEffect(() => {
      const endMeasure = performanceMonitor.markRenderStart(name);
      return endMeasure;
    });
    
    return React.createElement(Component, { ...props, ref });
  });
  
  WrappedComponent.displayName = `withPerformanceTracking(${componentName || Component.displayName || Component.name})`;
  
  return WrappedComponent as T;
}