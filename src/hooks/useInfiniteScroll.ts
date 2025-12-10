/**
 * useInfiniteScroll Hook
 * Detects when user scrolls near the bottom of a container to trigger loading more data
 */

import { useEffect, useRef, useCallback } from 'react';

export interface UseInfiniteScrollOptions {
  /**
   * Callback function to load more data
   */
  onLoadMore: () => void;

  /**
   * Whether there are more items to load
   */
  hasMore: boolean;

  /**
   * Whether data is currently being loaded
   */
  isLoading: boolean;

  /**
   * Distance from bottom (in pixels) to trigger loading
   * @default 200
   */
  threshold?: number;

  /**
   * Root element for intersection observer (null = viewport)
   */
  root?: Element | null;
}

/**
 * Hook for implementing infinite scroll
 * Returns a ref to attach to the trigger element (typically last row or loading indicator)
 */
export function useInfiniteScroll({
  onLoadMore,
  hasMore,
  isLoading,
  threshold = 200,
  root = null,
}: UseInfiniteScrollOptions) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;

      // If trigger element is visible and we can load more
      if (entry.isIntersecting && hasMore && !isLoading) {
        onLoadMore();
      }
    },
    [onLoadMore, hasMore, isLoading]
  );

  useEffect(() => {
    // Create intersection observer
    const options: IntersectionObserverInit = {
      root,
      rootMargin: `0px 0px ${threshold}px 0px`, // Trigger before reaching exact bottom
      threshold: 0.1,
    };

    observerRef.current = new IntersectionObserver(handleIntersection, options);

    // Observe the trigger element
    if (triggerRef.current) {
      observerRef.current.observe(triggerRef.current);
    }

    // Cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleIntersection, root, threshold]);

  // Update observation when trigger element changes
  const setTriggerRef = useCallback((element: HTMLElement | null) => {
    // Disconnect previous observation
    if (observerRef.current && triggerRef.current) {
      observerRef.current.unobserve(triggerRef.current);
    }

    // Store new element
    triggerRef.current = element;

    // Observe new element
    if (observerRef.current && element) {
      observerRef.current.observe(element);
    }
  }, []);

  return setTriggerRef;
}
