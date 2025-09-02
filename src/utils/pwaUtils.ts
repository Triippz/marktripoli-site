// PWA utility functions for Mission Control

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

class PWAManager {
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private isInstallable = false;
  private isInstalled = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e: Event) => {
      console.log('[PWA] Install prompt available');
      e.preventDefault();
      this.deferredPrompt = e as BeforeInstallPromptEvent;
      this.isInstallable = true;
      this.dispatchInstallableEvent();
    });

    // Listen for appinstalled event
    window.addEventListener('appinstalled', () => {
      console.log('[PWA] App installed successfully');
      this.isInstalled = true;
      this.deferredPrompt = null;
      this.isInstallable = false;
      this.dispatchInstalledEvent();
    });

    // Check if already installed
    this.checkIfInstalled();
  }

  private checkIfInstalled() {
    // Check if running as PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as any).standalone ||
                        document.referrer.includes('android-app://');
    
    if (isStandalone) {
      this.isInstalled = true;
      console.log('[PWA] Running as installed app');
    }
  }

  private dispatchInstallableEvent() {
    window.dispatchEvent(new CustomEvent('pwa-installable'));
  }

  private dispatchInstalledEvent() {
    window.dispatchEvent(new CustomEvent('pwa-installed'));
  }

  async promptInstall(): Promise<boolean> {
    if (!this.deferredPrompt) {
      console.warn('[PWA] Install prompt not available');
      return false;
    }

    try {
      await this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      
      console.log(`[PWA] Install prompt result: ${outcome}`);
      
      if (outcome === 'accepted') {
        this.deferredPrompt = null;
        this.isInstallable = false;
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('[PWA] Error prompting install:', error);
      return false;
    }
  }

  getInstallable(): boolean {
    return this.isInstallable;
  }

  getInstalled(): boolean {
    return this.isInstalled;
  }

  // Check if service worker is supported and active
  getServiceWorkerStatus(): 'supported' | 'unsupported' | 'active' | 'inactive' {
    if (!('serviceWorker' in navigator)) {
      return 'unsupported';
    }

    if (navigator.serviceWorker.controller) {
      return 'active';
    }

    return 'inactive';
  }

  // Request persistent storage
  async requestPersistentStorage(): Promise<boolean> {
    if ('storage' in navigator && 'persist' in navigator.storage) {
      try {
        const granted = await navigator.storage.persist();
        console.log(`[PWA] Persistent storage ${granted ? 'granted' : 'denied'}`);
        return granted;
      } catch (error) {
        console.error('[PWA] Error requesting persistent storage:', error);
        return false;
      }
    }
    return false;
  }

  // Get storage estimate
  async getStorageEstimate(): Promise<StorageEstimate | null> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        console.log('[PWA] Storage estimate:', estimate);
        return estimate;
      } catch (error) {
        console.error('[PWA] Error getting storage estimate:', error);
        return null;
      }
    }
    return null;
  }

  // Share API support
  async shareContent(data: ShareData): Promise<boolean> {
    if ('share' in navigator && typeof navigator.share === 'function') {
      try {
        await navigator.share(data);
        console.log('[PWA] Content shared successfully');
        return true;
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('[PWA] Error sharing content:', error);
        }
        // Fall through to clipboard fallback
      }
    }
    
    // Fallback to clipboard
    if ('clipboard' in navigator && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      try {
        const text = `${data.title || ''}\n${data.text || ''}\n${data.url || ''}`.trim();
        await navigator.clipboard.writeText(text);
        console.log('[PWA] Content copied to clipboard as fallback');
        return true;
      } catch (error) {
        console.error('[PWA] Error copying to clipboard:', error);
      }
    }
    
    console.warn('[PWA] No sharing or clipboard support available');
    return false;
  }

  // Check connectivity status
  getConnectivityStatus(): {
    online: boolean;
    effectiveType?: string;
    downlink?: number;
    saveData?: boolean;
  } {
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;

    return {
      online: navigator.onLine,
      effectiveType: connection?.effectiveType,
      downlink: connection?.downlink,
      saveData: connection?.saveData
    };
  }
}

// Export singleton instance
export const pwaManager = new PWAManager();

// Utility function to generate cache version
export function generateCacheVersion(): string {
  return `mission-control-${Date.now()}`;
}

// Utility to check if device supports PWA features
export function getPWACapabilities() {
  return {
    serviceWorker: 'serviceWorker' in navigator,
    pushNotifications: 'PushManager' in window,
    backgroundSync: 'ServiceWorkerRegistration' in window && 'sync' in window.ServiceWorkerRegistration.prototype,
    persistentStorage: 'storage' in navigator && 'persist' in navigator.storage,
    share: 'share' in navigator,
    clipboard: 'clipboard' in navigator,
    fullscreen: 'requestFullscreen' in document.documentElement,
    wakelock: 'wakeLock' in navigator
  };
}

// Export types
export type { BeforeInstallPromptEvent };