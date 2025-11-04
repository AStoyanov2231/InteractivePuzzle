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
  // Check user agent for mobile devices
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i;
  const hasMobileUserAgent = mobileRegex.test(userAgent);
  
  // Check for touch capability
  const hasTouchScreen = 'ontouchstart' in window || 
                         navigator.maxTouchPoints > 0 || 
                         (navigator as any).msMaxTouchPoints > 0;
  
  // Check for mobile-like screen characteristics (smaller screen OR high pixel density with touch)
  const hasSmallScreen = window.innerWidth < 1024 || window.screen.width < 1024;
  
  // Consider it mobile if:
  // 1. User agent indicates mobile, OR
  // 2. Has touch capability AND small screen (to catch tablets in portrait)
  return hasMobileUserAgent || (hasTouchScreen && hasSmallScreen);
};

/**
 * Checks if app is running as PWA on mobile
 * @returns {boolean} True if mobile PWA, false otherwise
 */
export const isMobilePWA = (): boolean => {
  return isPWAMode() && isMobileDevice();
};
