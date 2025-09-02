import React, { useEffect, ReactNode, useCallback, useRef } from 'react';
import { useResponsive } from '../hooks/useResponsive';
import { useResponsiveStore } from '../store/missionControlV2';
import { performanceMonitor } from '../utils/performanceMonitor';

interface ResponsiveProviderProps {
  children: ReactNode;
}

export function ResponsiveProvider({ children }: ResponsiveProviderProps) {
  const responsive = useResponsive();
  const { updateResponsiveState, updatePerformanceMetrics, optimizeForDevice } = useResponsiveStore();

  // Sync responsive state with store
  useEffect(() => {
    updateResponsiveState(
      responsive.screenSize,
      responsive.orientation,
      responsive.capabilities
    );
  }, [
    responsive.screenSize, 
    responsive.orientation, 
    responsive.capabilities, 
    updateResponsiveState
  ]);

  // Add responsive CSS classes to body for global styling
  useEffect(() => {
    const body = document.body;
    
    // Clear existing responsive classes
    body.classList.remove('mobile', 'tablet', 'desktop', 'portrait', 'landscape');
    
    // Add current responsive classes
    body.classList.add(responsive.screenSize);
    body.classList.add(responsive.orientation);
    
    // Add capability classes
    if (responsive.capabilities.touch) body.classList.add('touch');
    if (responsive.capabilities.hover) body.classList.add('hover');
    if (responsive.capabilities.reducedMotion) body.classList.add('reduced-motion');
    if (responsive.capabilities.highDPI) body.classList.add('high-dpi');
    
    return () => {
      // Cleanup on unmount
      body.classList.remove('mobile', 'tablet', 'desktop', 'portrait', 'landscape');
      body.classList.remove('touch', 'hover', 'reduced-motion', 'high-dpi');
    };
  }, [responsive]);

  // Throttled performance metrics callback
  const performanceUpdateRef = useRef<number>(0);
  
  const throttledPerformanceUpdate = useCallback((metrics: any) => {
    const now = Date.now();
    
    // Throttle updates to once per second to prevent infinite loops
    if (now - performanceUpdateRef.current < 1000) {
      return;
    }
    
    performanceUpdateRef.current = now;
    updatePerformanceMetrics(metrics);
    
    // Auto-optimize if performance is critical
    if (performanceMonitor.isPerformanceCritical()) {
      optimizeForDevice();
      
      // Add performance warning class to body
      document.body.classList.add('memory-critical');
    } else {
      document.body.classList.remove('memory-critical');
      
      // Add warning class if performance is low
      if (performanceMonitor.getPerformanceLevel() === 'low') {
        document.body.classList.add('memory-warning');
      } else {
        document.body.classList.remove('memory-warning');
      }
    }
  }, [updatePerformanceMetrics, optimizeForDevice]);

  // Set up performance monitoring
  useEffect(() => {
    const unsubscribe = performanceMonitor.subscribe(throttledPerformanceUpdate);
    return unsubscribe;
  }, [throttledPerformanceUpdate]);

  // Initialize performance monitoring
  useEffect(() => {
    performanceMonitor.startMonitoring();
    
    return () => {
      performanceMonitor.dispose();
    };
  }, []);

  return <>{children}</>;
}