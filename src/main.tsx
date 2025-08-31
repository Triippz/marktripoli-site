import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { performanceMonitor, addCriticalResourceHints } from './utils/performanceUtils'

// Add critical resource hints for better performance
addCriticalResourceHints();

// Initialize performance monitoring
if (process.env.NODE_ENV === 'production') {
  // Report performance metrics after page load
  window.addEventListener('load', () => {
    setTimeout(() => {
      performanceMonitor.logPerformanceReport();
      performanceMonitor.analyzeResourceLoading();
      
      const memoryUsage = performanceMonitor.getMemoryUsage();
      if (memoryUsage) {
        console.log('[PERF] Memory Usage:', memoryUsage);
      }
    }, 2000);
  });

  // Report on page unload
  window.addEventListener('beforeunload', () => {
    performanceMonitor.logPerformanceReport();
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
