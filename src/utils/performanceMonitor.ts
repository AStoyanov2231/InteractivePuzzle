import React from 'react';

/**
 * Performance monitoring utilities
 */

interface PerformanceMetrics {
  loadTime: number;
  interactionTime: number;
  renderTime: number;
  bundleSize: number;
}

class PerformanceMonitor {
  public metrics: Map<string, number> = new Map();
  private startTimes: Map<string, number> = new Map();

  /**
   * Start measuring a performance metric
   */
  startMeasure(name: string) {
    this.startTimes.set(name, performance.now());
  }

  /**
   * End measuring and record the result
   */
  endMeasure(name: string): number {
    const startTime = this.startTimes.get(name);
    if (!startTime) {
      console.warn(`No start time found for measure: ${name}`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.metrics.set(name, duration);
    this.startTimes.delete(name);

    if (process.env.NODE_ENV === 'development') {
      console.log(`⚡ ${name}: ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  /**
   * Get a specific metric
   */
  getMetric(name: string): number | undefined {
    return this.metrics.get(name);
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }

  /**
   * Clear all metrics
   */
  clearMetrics() {
    this.metrics.clear();
    this.startTimes.clear();
  }

  /**
   * Monitor component render time
   */
  measureComponentRender<T extends React.ComponentType<any>>(
    Component: T,
    name: string
  ): T {
    const WrappedComponent = (props: any) => {
      React.useEffect(() => {
        this.startMeasure(`${name}-render`);
        const timeoutId = setTimeout(() => {
          this.endMeasure(`${name}-render`);
        }, 0);

        return () => clearTimeout(timeoutId);
      });

      return React.createElement(Component, props);
    };

    WrappedComponent.displayName = `Measured(${Component.displayName || Component.name})`;
    return WrappedComponent as T;
  }

  /**
   * Measure navigation performance
   */
  measureNavigation() {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      const metrics = {
        'DNS Lookup': navigation.domainLookupEnd - navigation.domainLookupStart,
        'TCP Connection': navigation.connectEnd - navigation.connectStart,
        'TLS Setup': navigation.connectEnd - navigation.secureConnectionStart,
        'Response Time': navigation.responseEnd - navigation.requestStart,
        'DOM Processing': navigation.domComplete - navigation.responseEnd,
        'Load Complete': navigation.loadEventEnd - navigation.loadEventStart,
        'Total Load Time': navigation.loadEventEnd - navigation.fetchStart,
      };

      Object.entries(metrics).forEach(([name, value]) => {
        this.metrics.set(name, value);
      });

      if (process.env.NODE_ENV === 'development') {
        console.table(metrics);
      }

      return metrics;
    }
    return {};
  }

  /**
   * Monitor bundle sizes
   */
  measureBundleSize() {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      const bundles = resources.filter(resource => 
        resource.name.includes('.js') || resource.name.includes('.css')
      );

      let totalSize = 0;
      bundles.forEach(bundle => {
        if (bundle.transferSize) {
          totalSize += bundle.transferSize;
        }
      });

      this.metrics.set('Total Bundle Size', totalSize);

      if (process.env.NODE_ENV === 'development') {
        console.log(`📦 Total Bundle Size: ${(totalSize / 1024).toFixed(2)} KB`);
      }

      return totalSize;
    }
    return 0;
  }

  /**
   * Monitor memory usage
   */
  measureMemoryUsage() {
    if (typeof window !== 'undefined' && 'performance' in window && 'memory' in performance) {
      const memory = (performance as any).memory;
      const metrics = {
        'Used JS Heap Size': memory.usedJSHeapSize,
        'Total JS Heap Size': memory.totalJSHeapSize,
        'JS Heap Size Limit': memory.jsHeapSizeLimit,
      };

      Object.entries(metrics).forEach(([name, value]) => {
        this.metrics.set(name, value);
      });

      if (process.env.NODE_ENV === 'development') {
        console.log(`🧠 Memory Usage: ${(memory.usedJSHeapSize / 1048576).toFixed(2)} MB`);
      }

      return metrics;
    }
    return {};
  }

  /**
   * Generate performance report
   */
  generateReport(): string {
    const allMetrics = this.getAllMetrics();
    const navigation = this.measureNavigation();
    const memory = this.measureMemoryUsage();
    
    const report = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      metrics: allMetrics,
      navigation,
      memory,
    };

    return JSON.stringify(report, null, 2);
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for performance monitoring
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = React.useState<Record<string, number>>({});

  React.useEffect(() => {
    // Initial measurements
    performanceMonitor.measureNavigation();
    performanceMonitor.measureBundleSize();
    performanceMonitor.measureMemoryUsage();

    // Update metrics
    setMetrics(performanceMonitor.getAllMetrics());

    // Measure FCP, LCP if available
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          performanceMonitor.metrics.set(entry.name, entry.startTime);
        });
        setMetrics(performanceMonitor.getAllMetrics());
      });

      observer.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });

      return () => observer.disconnect();
    }
  }, []);

  return {
    metrics,
    startMeasure: performanceMonitor.startMeasure.bind(performanceMonitor),
    endMeasure: performanceMonitor.endMeasure.bind(performanceMonitor),
    generateReport: performanceMonitor.generateReport.bind(performanceMonitor),
  };
}; 