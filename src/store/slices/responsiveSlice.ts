import { StateCreator } from 'zustand';
import type { ScreenSize, Orientation, DeviceCapabilities } from '../../hooks/useResponsive';

// Types for responsive state
export interface ResponsiveFeatures {
  animations: boolean;
  complexEffects: boolean;
  autoplay: boolean;
  backgroundProcessing: boolean;
  highFidelityRendering: boolean;
}

export interface MobileState {
  bottomSheetOpen: boolean;
  swipeGesturesEnabled: boolean;
  simplifiedUI: boolean;
  keyboardVisible: boolean;
}

export interface PerformanceMetrics {
  frameRate: number;
  memoryUsage: number;
  lastRenderTime: number;
  animationLoad: number;
}

export interface ResponsiveSlice {
  // State
  screenSize: ScreenSize;
  orientation: Orientation;
  capabilities: DeviceCapabilities;
  features: ResponsiveFeatures;
  mobileState: MobileState;
  performanceMetrics: PerformanceMetrics | null;
  
  // Computed properties
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  shouldReduceMotion: boolean;
  
  // Actions
  updateResponsiveState: (screenSize: ScreenSize, orientation: Orientation, capabilities: DeviceCapabilities) => void;
  toggleMobileBottomSheet: (open?: boolean) => void;
  setKeyboardVisible: (visible: boolean) => void;
  updatePerformanceMetrics: (metrics: Partial<PerformanceMetrics>) => void;
  toggleFeature: (feature: keyof ResponsiveFeatures) => void;
  optimizeForDevice: () => void;
  
  // Selectors
  getOptimalBreakpoint: () => string;
  shouldUseComponent: (component: string) => boolean;
  getAnimationSettings: () => { duration: number; easing: string; reduce: boolean };
}

// Feature configuration based on device type
const getOptimalFeatures = (
  screenSize: ScreenSize, 
  capabilities: DeviceCapabilities,
  performanceMetrics?: PerformanceMetrics
): ResponsiveFeatures => {
  const isLowPerformance = performanceMetrics ? 
    (performanceMetrics.frameRate < 30 || performanceMetrics.memoryUsage > 100) : false;
  
  switch (screenSize) {
    case 'mobile':
      return {
        animations: !capabilities.reducedMotion && !isLowPerformance,
        complexEffects: false,
        autoplay: false,
        backgroundProcessing: false,
        highFidelityRendering: false
      };
    case 'tablet':
      return {
        animations: !capabilities.reducedMotion,
        complexEffects: !isLowPerformance,
        autoplay: !capabilities.reducedMotion,
        backgroundProcessing: !isLowPerformance,
        highFidelityRendering: capabilities.highDPI
      };
    case 'desktop':
    case 'ultrawide':
    default:
      return {
        animations: !capabilities.reducedMotion,
        complexEffects: true,
        autoplay: !capabilities.reducedMotion,
        backgroundProcessing: true,
        highFidelityRendering: capabilities.highDPI
      };
  }
};

export const createResponsiveSlice: StateCreator<ResponsiveSlice> = (set, get) => ({
  // Initial state
  screenSize: 'desktop',
  orientation: 'landscape',
  capabilities: {
    touch: false,
    hover: true,
    reducedMotion: false,
    highDPI: false
  },
  features: {
    animations: true,
    complexEffects: true,
    autoplay: true,
    backgroundProcessing: true,
    highFidelityRendering: false
  },
  mobileState: {
    bottomSheetOpen: false,
    swipeGesturesEnabled: true,
    simplifiedUI: false,
    keyboardVisible: false
  },
  performanceMetrics: null,
  
  // Computed properties (removed getters that cause issues)
  isMobile: false, // Will be updated by actions
  isTablet: false,
  isDesktop: true, // Default to desktop
  shouldReduceMotion: false,
  
  // Actions
  updateResponsiveState: (screenSize, orientation, capabilities) => {
    const currentState = get();
    const newFeatures = getOptimalFeatures(screenSize, capabilities, currentState.performanceMetrics || undefined);
    
    // Calculate computed properties
    const isMobile = screenSize === 'mobile';
    const isTablet = screenSize === 'tablet';
    const isDesktop = screenSize === 'desktop' || screenSize === 'ultrawide';
    const shouldReduceMotion = capabilities.reducedMotion || !newFeatures.animations;
    
    set({
      screenSize,
      orientation,
      capabilities,
      features: newFeatures,
      isMobile,
      isTablet,
      isDesktop,
      shouldReduceMotion,
      // Reset mobile state if switching away from mobile
      mobileState: screenSize !== 'mobile' ? {
        bottomSheetOpen: false,
        swipeGesturesEnabled: false,
        simplifiedUI: false,
        keyboardVisible: false
      } : currentState.mobileState
    });
  },
  
  toggleMobileBottomSheet: (open) => {
    set(state => ({
      mobileState: {
        ...state.mobileState,
        bottomSheetOpen: open !== undefined ? open : !state.mobileState.bottomSheetOpen
      }
    }));
  },
  
  setKeyboardVisible: (visible) => {
    set(state => ({
      mobileState: {
        ...state.mobileState,
        keyboardVisible: visible
      }
    }));
  },
  
  updatePerformanceMetrics: (metrics) => {
    const currentMetrics = get().performanceMetrics;
    const newMetrics = currentMetrics ? { ...currentMetrics, ...metrics } : {
      frameRate: 60,
      memoryUsage: 0,
      lastRenderTime: Date.now(),
      animationLoad: 0,
      ...metrics
    };
    
    set({ performanceMetrics: newMetrics });
    
    // Auto-optimize if performance is poor
    if (newMetrics.frameRate < 20 || newMetrics.memoryUsage > 200) {
      get().optimizeForDevice();
    }
  },
  
  toggleFeature: (feature) => {
    set(state => ({
      features: {
        ...state.features,
        [feature]: !state.features[feature]
      }
    }));
  },
  
  optimizeForDevice: () => {
    const state = get();
    const optimizedFeatures = getOptimalFeatures(
      state.screenSize,
      state.capabilities,
      state.performanceMetrics || undefined
    );
    
    // Further reduce features if performance is critical
    if (state.performanceMetrics && state.performanceMetrics.frameRate < 15) {
      optimizedFeatures.animations = false;
      optimizedFeatures.complexEffects = false;
      optimizedFeatures.backgroundProcessing = false;
    }
    
    const shouldReduceMotion = state.capabilities.reducedMotion || !optimizedFeatures.animations;
    
    set({ 
      features: optimizedFeatures,
      shouldReduceMotion,
      mobileState: state.screenSize === 'mobile' ? {
        ...state.mobileState,
        simplifiedUI: true
      } : state.mobileState
    });
  },
  
  // Selectors
  getOptimalBreakpoint: () => {
    const { screenSize } = get();
    switch (screenSize) {
      case 'mobile': return 'sm';
      case 'tablet': return 'md';
      case 'desktop': return 'lg';
      case 'ultrawide': return 'xl';
      default: return 'lg';
    }
  },
  
  shouldUseComponent: (component) => {
    const state = get();
    const componentConfig: Record<string, (state: ResponsiveSlice) => boolean> = {
      'MapboxEffects': state => state.features.complexEffects && state.isDesktop,
      'AnimationLibrary': state => state.features.animations,
      'BackgroundProcessing': state => state.features.backgroundProcessing,
      'MobileTerminalOverlay': state => state.isMobile,
      'DesktopHUD': state => state.isDesktop,
      'TabletSplitView': state => state.isTablet,
      'TouchGestures': state => state.capabilities.touch,
      'ComplexAnimations': state => state.features.complexEffects && !state.shouldReduceMotion,
      'AudioSystem': state => state.features.autoplay && !state.isMobile,
    };
    
    const predicate = componentConfig[component];
    return predicate ? predicate(state) : true;
  },
  
  getAnimationSettings: () => {
    const state = get();
    
    if (state.shouldReduceMotion) {
      return { duration: 0, easing: 'linear', reduce: true };
    }
    
    switch (state.screenSize) {
      case 'mobile':
        return { duration: 200, easing: 'easeOut', reduce: false };
      case 'tablet':
        return { duration: 300, easing: 'easeInOut', reduce: false };
      case 'desktop':
      case 'ultrawide':
      default:
        return { duration: 400, easing: 'easeOut', reduce: false };
    }
  }
});