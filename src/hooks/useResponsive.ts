import { useState, useEffect } from 'react';

export type ScreenSize = 'mobile' | 'tablet' | 'desktop' | 'ultrawide';
export type Orientation = 'portrait' | 'landscape';

export interface DeviceCapabilities {
  touch: boolean;
  hover: boolean;
  reducedMotion: boolean;
  highDPI: boolean;
}

export interface ResponsiveState {
  screenSize: ScreenSize;
  orientation: Orientation;
  capabilities: DeviceCapabilities;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

function getScreenSize(width: number): ScreenSize {
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  if (width < 1920) return 'desktop';
  return 'ultrawide';
}

function getOrientation(width: number, height: number): Orientation {
  return height > width ? 'portrait' : 'landscape';
}

function getDeviceCapabilities(): DeviceCapabilities {
  return {
    touch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    hover: window.matchMedia('(hover: hover)').matches,
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    highDPI: window.devicePixelRatio > 1.5
  };
}

export function useResponsive(): ResponsiveState {
  const [state, setState] = useState<ResponsiveState>(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const screenSize = getScreenSize(width);
    
    return {
      screenSize,
      orientation: getOrientation(width, height),
      capabilities: getDeviceCapabilities(),
      isMobile: screenSize === 'mobile',
      isTablet: screenSize === 'tablet',
      isDesktop: screenSize === 'desktop' || screenSize === 'ultrawide'
    };
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const screenSize = getScreenSize(width);
      
      setState({
        screenSize,
        orientation: getOrientation(width, height),
        capabilities: getDeviceCapabilities(),
        isMobile: screenSize === 'mobile',
        isTablet: screenSize === 'tablet',
        isDesktop: screenSize === 'desktop' || screenSize === 'ultrawide'
      });
    };

    const handleOrientationChange = () => {
      // Delay to allow viewport to update
      setTimeout(handleResize, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return state;
}