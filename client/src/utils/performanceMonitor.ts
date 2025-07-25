// Performance monitoring utilities for page builder
import React from 'react';
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();
  
  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }
  
  // Mark start of an operation
  markStart(operation: string): void {
    this.metrics.set(`${operation}_start`, performance.now());
  }
  
  // Mark end of an operation and log duration
  markEnd(operation: string): number {
    const startTime = this.metrics.get(`${operation}_start`);
    if (!startTime) {
      console.warn(`No start time found for operation: ${operation}`);
      return 0;
    }
    
    const duration = performance.now() - startTime;
    this.metrics.set(`${operation}_duration`, duration);
    
    console.log(`⚡ ${operation}: ${duration.toFixed(2)}ms`);
    return duration;
  }
  
  // Get memory usage info
  getMemoryUsage(): any {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: Math.round(memory.usedJSHeapSize / 1024 / 1024 * 100) / 100,
        total: Math.round(memory.totalJSHeapSize / 1024 / 1024 * 100) / 100,
        limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024 * 100) / 100
      };
    }
    return null;
  }
  
  // Log current performance metrics
  logMetrics(): void {
    const memory = this.getMemoryUsage();
    
    console.group('📊 Performance Metrics');
    
    if (memory) {
      console.log(`Memory Usage: ${memory.used}MB / ${memory.total}MB (Limit: ${memory.limit}MB)`);
    }
    
    const durations = Array.from(this.metrics.entries())
      .filter(([key]) => key.endsWith('_duration'))
      .map(([key, value]) => [key.replace('_duration', ''), value]);
    
    if (durations.length > 0) {
      console.log('Recent Operations:');
      durations.forEach(([operation, duration]) => {
        console.log(`  ${operation}: ${(duration as number).toFixed(2)}ms`);
      });
    }
    
    console.groupEnd();
  }
  
  // Performance-aware React component wrapper
  static withPerformanceTracking<T extends Record<string, any>>(
    Component: React.ComponentType<T>,
    componentName: string
  ) {
    return React.memo((props: T) => {
      const monitor = PerformanceMonitor.getInstance();
      
      React.useEffect(() => {
        monitor.markStart(`${componentName}_mount`);
        return () => {
          monitor.markEnd(`${componentName}_mount`);
        };
      }, []);
      
      return React.createElement(Component, props);
    });
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();

// React hook for performance monitoring
export function usePerformanceTracking(operationName: string) {
  const monitor = PerformanceMonitor.getInstance();
  
  const trackOperation = React.useCallback(async (operation: () => Promise<any> | any) => {
    monitor.markStart(operationName);
    try {
      const result = await operation();
      return result;
    } finally {
      monitor.markEnd(operationName);
    }
  }, [operationName, monitor]);
  
  return trackOperation;
}