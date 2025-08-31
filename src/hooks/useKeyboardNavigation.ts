import { useEffect, useRef, useState } from 'react';

export interface KeyboardNavigationOptions {
  enabled?: boolean;
  preventDefault?: boolean;
  stopPropagation?: boolean;
  selector?: string;
  loop?: boolean;
  orientation?: 'horizontal' | 'vertical' | 'both';
}

export function useKeyboardNavigation(options: KeyboardNavigationOptions = {}) {
  const {
    enabled = true,
    preventDefault = true,
    stopPropagation = true,
    selector = '[tabindex]:not([tabindex="-1"]), [role="button"], button, input, select, textarea, a[href]',
    loop = true,
    orientation = 'both'
  } = options;

  const containerRef = useRef<HTMLElement>(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [elements, setElements] = useState<HTMLElement[]>([]);

  // Update focusable elements when container changes
  useEffect(() => {
    if (!containerRef.current || !enabled) return;

    const updateElements = () => {
      const focusableElements = Array.from(
        containerRef.current!.querySelectorAll(selector)
      ) as HTMLElement[];
      
      // Filter out disabled and hidden elements
      const visibleElements = focusableElements.filter(el => {
        return !el.hasAttribute('disabled') && 
               !el.hasAttribute('aria-hidden') &&
               el.offsetParent !== null;
      });

      setElements(visibleElements);
    };

    updateElements();

    // Update on mutations
    const observer = new MutationObserver(updateElements);
    observer.observe(containerRef.current, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['disabled', 'aria-hidden', 'tabindex', 'style']
    });

    return () => observer.disconnect();
  }, [enabled, selector]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!elements.length) return;

      const currentIndex = elements.findIndex(el => el === document.activeElement);
      let newIndex = currentIndex;

      switch (event.key) {
        case 'ArrowUp':
          if (orientation === 'vertical' || orientation === 'both') {
            newIndex = currentIndex > 0 ? currentIndex - 1 : loop ? elements.length - 1 : currentIndex;
          }
          break;

        case 'ArrowDown':
          if (orientation === 'vertical' || orientation === 'both') {
            newIndex = currentIndex < elements.length - 1 ? currentIndex + 1 : loop ? 0 : currentIndex;
          }
          break;

        case 'ArrowLeft':
          if (orientation === 'horizontal' || orientation === 'both') {
            newIndex = currentIndex > 0 ? currentIndex - 1 : loop ? elements.length - 1 : currentIndex;
          }
          break;

        case 'ArrowRight':
          if (orientation === 'horizontal' || orientation === 'both') {
            newIndex = currentIndex < elements.length - 1 ? currentIndex + 1 : loop ? 0 : currentIndex;
          }
          break;

        case 'Home':
          newIndex = 0;
          break;

        case 'End':
          newIndex = elements.length - 1;
          break;

        case 'Enter':
        case ' ':
          if (document.activeElement && elements.includes(document.activeElement as HTMLElement)) {
            const activeElement = document.activeElement as HTMLElement;
            if (activeElement.click) {
              activeElement.click();
            } else if (activeElement.dispatchEvent) {
              activeElement.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            }
          }
          break;

        default:
          return;
      }

      if (newIndex !== currentIndex && elements[newIndex]) {
        if (preventDefault) event.preventDefault();
        if (stopPropagation) event.stopPropagation();
        
        elements[newIndex].focus();
        setFocusedIndex(newIndex);
      }
    };

    containerRef.current.addEventListener('keydown', handleKeyDown);
    return () => containerRef.current?.removeEventListener('keydown', handleKeyDown);
  }, [enabled, elements, loop, orientation, preventDefault, stopPropagation]);

  const focusFirst = () => {
    if (elements.length > 0) {
      elements[0].focus();
      setFocusedIndex(0);
    }
  };

  const focusLast = () => {
    if (elements.length > 0) {
      const lastIndex = elements.length - 1;
      elements[lastIndex].focus();
      setFocusedIndex(lastIndex);
    }
  };

  const focusElement = (index: number) => {
    if (elements[index]) {
      elements[index].focus();
      setFocusedIndex(index);
    }
  };

  return {
    ref: containerRef,
    focusedIndex,
    elements,
    focusFirst,
    focusLast,
    focusElement
  };
}

// Hook for managing focus trap (useful for modals)
export function useFocusTrap(enabled = true) {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const container = containerRef.current;
    const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    
    const getFocusableElements = () => {
      return Array.from(container.querySelectorAll(focusableSelector)) as HTMLElement[];
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstFocusable = focusableElements[0];
      const lastFocusable = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstFocusable) {
          event.preventDefault();
          lastFocusable.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastFocusable) {
          event.preventDefault();
          firstFocusable.focus();
        }
      }
    };

    // Set initial focus
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [enabled]);

  return containerRef;
}

// Hook for skip navigation
export function useSkipNavigation() {
  const skipLinkRef = useRef<HTMLAnchorElement>(null);
  const targetRef = useRef<HTMLElement>(null);

  const skip = () => {
    if (targetRef.current) {
      targetRef.current.focus();
      targetRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return {
    skipLinkRef,
    targetRef,
    skip
  };
}