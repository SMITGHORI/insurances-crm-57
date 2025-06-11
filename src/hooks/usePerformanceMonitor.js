
import { useEffect, useRef, useState } from 'react';

export const usePerformanceMonitor = (componentName) => {
  const renderStartTime = useRef(Date.now());
  const [renderTime, setRenderTime] = useState(0);
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current += 1;
    const endTime = Date.now();
    const duration = endTime - renderStartTime.current;
    setRenderTime(duration);

    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} - Render #${renderCount.current}: ${duration}ms`);
    }

    renderStartTime.current = Date.now();
  });

  return {
    renderTime,
    renderCount: renderCount.current
  };
};

export const useMemoryMonitor = () => {
  const [memoryInfo, setMemoryInfo] = useState(null);

  useEffect(() => {
    if ('memory' in performance) {
      const updateMemory = () => {
        setMemoryInfo({
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
        });
      };

      updateMemory();
      const interval = setInterval(updateMemory, 5000);
      return () => clearInterval(interval);
    }
  }, []);

  return memoryInfo;
};
