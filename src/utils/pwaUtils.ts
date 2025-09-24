/**
 * Utility functions for PWA detection and handling
 */

/**
 * Detects if the app is running in PWA (standalone) mode
 * @returns {boolean} True if running as PWA, false otherwise
 */
export const isPWAMode = (): boolean => {
  // Check if running in standalone mode (added to homescreen)
  return window.matchMedia('(display-mode: standalone)').matches ||
         // Fallback for older browsers
         (window.navigator as any).standalone === true ||
         // Additional check for Android PWA
         document.referrer.includes('android-app://');
};

/**
 * Detects if the device is mobile
 * @returns {boolean} True if mobile device, false otherwise
 */
export const isMobileDevice = (): boolean => {
  return window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

/**
 * Checks if app is running as PWA on mobile
 * @returns {boolean} True if mobile PWA, false otherwise
 */
export const isMobilePWA = (): boolean => {
  return isPWAMode() && isMobileDevice();
};

/**
 * Checks if app is running as PWA in landscape mode on mobile
 * @returns {boolean} True if mobile PWA in landscape, false otherwise
 */
export const isMobilePWALandscape = (): boolean => {
  return isPWAMode() && 
         isMobileDevice() &&
         window.matchMedia('(orientation: landscape)').matches;
};

/**
 * Gets the viewport height accounting for PWA status bar and safe areas
 * @returns {number} Available viewport height in pixels
 */
export const getAvailableViewportHeight = (): number => {
  if (isMobilePWA()) {
    // Account for PWA chrome and safe areas
    return window.innerHeight - (window.screen.height - window.innerHeight);
  }
  return window.innerHeight;
};