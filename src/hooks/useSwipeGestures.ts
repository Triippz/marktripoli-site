import { useRef, useEffect } from 'react';

export interface SwipeHandlers {
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

export interface SwipeOptions {
  threshold?: number; // Minimum distance for a swipe (default: 50)
  preventDefaultTouchMove?: boolean; // Prevent default touch move (default: false)
  trackMouse?: boolean; // Also track mouse events (default: false)
}

export function useSwipeGestures<T extends HTMLElement>(
  handlers: SwipeHandlers,
  options: SwipeOptions = {}
) {
  const elementRef = useRef<T>(null);
  const startPoint = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const currentPoint = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isSwiping = useRef<boolean>(false);

  const {
    threshold = 50,
    preventDefaultTouchMove = false,
    trackMouse = false
  } = options;

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Touch event handlers
    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      startPoint.current = { x: touch.clientX, y: touch.clientY };
      currentPoint.current = { x: touch.clientX, y: touch.clientY };
      isSwiping.current = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isSwiping.current) return;

      const touch = e.touches[0];
      currentPoint.current = { x: touch.clientX, y: touch.clientY };

      const deltaX = Math.abs(currentPoint.current.x - startPoint.current.x);
      const deltaY = Math.abs(currentPoint.current.y - startPoint.current.y);

      // If we're swiping and the threshold is exceeded, prevent default
      if (preventDefaultTouchMove && (deltaX > 10 || deltaY > 10)) {
        e.preventDefault();
      }
    };

    const handleTouchEnd = () => {
      if (!isSwiping.current) return;

      const deltaX = currentPoint.current.x - startPoint.current.x;
      const deltaY = currentPoint.current.y - startPoint.current.y;

      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      // Determine swipe direction
      if (Math.max(absX, absY) >= threshold) {
        if (absX > absY) {
          // Horizontal swipe
          if (deltaX > 0 && handlers.onSwipeRight) {
            handlers.onSwipeRight();
          } else if (deltaX < 0 && handlers.onSwipeLeft) {
            handlers.onSwipeLeft();
          }
        } else {
          // Vertical swipe
          if (deltaY > 0 && handlers.onSwipeDown) {
            handlers.onSwipeDown();
          } else if (deltaY < 0 && handlers.onSwipeUp) {
            handlers.onSwipeUp();
          }
        }
      }

      isSwiping.current = false;
    };

    // Mouse event handlers (optional)
    const handleMouseDown = (e: MouseEvent) => {
      if (!trackMouse) return;
      startPoint.current = { x: e.clientX, y: e.clientY };
      currentPoint.current = { x: e.clientX, y: e.clientY };
      isSwiping.current = true;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!trackMouse || !isSwiping.current) return;
      currentPoint.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      if (!trackMouse || !isSwiping.current) return;
      handleTouchEnd(); // Reuse touch end logic
    };

    // Add event listeners
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { 
      passive: !preventDefaultTouchMove 
    });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    if (trackMouse) {
      element.addEventListener('mousedown', handleMouseDown);
      element.addEventListener('mousemove', handleMouseMove);
      element.addEventListener('mouseup', handleMouseUp);
      element.addEventListener('mouseleave', handleMouseUp); // Cancel on mouse leave
    }

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);

      if (trackMouse) {
        element.removeEventListener('mousedown', handleMouseDown);
        element.removeEventListener('mousemove', handleMouseMove);
        element.removeEventListener('mouseup', handleMouseUp);
        element.removeEventListener('mouseleave', handleMouseUp);
      }
    };
  }, [handlers, threshold, preventDefaultTouchMove, trackMouse]);

  return elementRef;
}