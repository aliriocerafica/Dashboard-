// Simple performance monitoring utilities
export class PerformanceMonitor {
  private static timers = new Map<string, number>();

  static startTimer(name: string): void {
    this.timers.set(name, performance.now());
  }

  static endTimer(name: string): number {
    const startTime = this.timers.get(name);
    if (!startTime) {
      console.warn(`Timer "${name}" was not started`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.timers.delete(name);

    // Log slow operations
    if (duration > 100) {
      console.warn(`Slow operation "${name}": ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  static measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    this.startTimer(name);
    return fn().finally(() => {
      this.endTimer(name);
    });
  }

  static measureSync<T>(name: string, fn: () => T): T {
    this.startTimer(name);
    const result = fn();
    this.endTimer(name);
    return result;
  }
}

// Preload critical resources
export function preloadCriticalResources(): void {
  if (typeof window === "undefined") return;

  // Preload fonts
  const fontPreloads = [
    "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
  ];

  fontPreloads.forEach((href) => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "style";
    link.href = href;
    document.head.appendChild(link);
  });
}

// Optimize images
export function optimizeImageLoading(): void {
  if (typeof window === "undefined") return;

  // Add loading="lazy" to images that are not in viewport
  const images = document.querySelectorAll("img:not([loading])");
  images.forEach((img) => {
    const imageElement = img as HTMLImageElement;
    if (!imageElement.hasAttribute("loading")) {
      imageElement.loading = "lazy";
    }
  });
}
