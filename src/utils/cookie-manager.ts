// Cookie consent types
export type CookieConsent = 'accepted' | 'declined' | null;

// Cookie categories
export type CookieCategory = 'necessary' | 'analytics' | 'functional' | 'preferences';

// Cookie settings interface
export interface CookieSettings {
  necessary: boolean;
  analytics: boolean;
  functional: boolean;
  preferences: boolean;
}

// Default cookie settings
export const DEFAULT_COOKIE_SETTINGS: CookieSettings = {
  necessary: true, // Always true - required for site functionality
  analytics: false,
  functional: false,
  preferences: false,
};

// Get cookie consent from localStorage
export const getCookieConsent = (): CookieConsent => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('cookieConsent') as CookieConsent;
};

// Get cookie settings from localStorage
export const getCookieSettings = (): CookieSettings => {
  if (typeof window === 'undefined') return DEFAULT_COOKIE_SETTINGS;
  
  const settings = localStorage.getItem('cookieSettings');
  if (settings) {
    try {
      return { ...DEFAULT_COOKIE_SETTINGS, ...JSON.parse(settings) };
    } catch {
      return DEFAULT_COOKIE_SETTINGS;
    }
  }
  
  return DEFAULT_COOKIE_SETTINGS;
};

// Save cookie settings
export const saveCookieSettings = (settings: CookieSettings): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('cookieSettings', JSON.stringify(settings));
};

// Check if analytics cookies are allowed
export const isAnalyticsAllowed = (): boolean => {
  const consent = getCookieConsent();
  const settings = getCookieSettings();
  
  if (consent === 'accepted') return true;
  if (consent === 'declined') return false;
  
  return settings.analytics;
};

// Check if functional cookies are allowed
export const isFunctionalAllowed = (): boolean => {
  const consent = getCookieConsent();
  const settings = getCookieSettings();
  
  if (consent === 'accepted') return true;
  if (consent === 'declined') return false;
  
  return settings.functional;
};

// Check if preference cookies are allowed
export const isPreferencesAllowed = (): boolean => {
  const consent = getCookieConsent();
  const settings = getCookieSettings();
  
  if (consent === 'accepted') return true;
  if (consent === 'declined') return false;
  
  return settings.preferences;
};

// Initialize Google Analytics based on consent
export const initializeAnalytics = (): void => {
  if (typeof window === 'undefined') return;
  
  if (isAnalyticsAllowed()) {
    // Load Google Analytics
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX';
    document.head.appendChild(script);
    
    // Initialize gtag
    (window as any).dataLayer = (window as any).dataLayer || [];
    function gtag(...args: any[]) {
      (window as any).dataLayer.push(args);
    }
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXXXXX');
    
    // Make gtag available globally
    (window as any).gtag = gtag;
  }
};

// Track event only if analytics is allowed
export const trackEventWithConsent = (
  eventType: string,
  userId: string,
  data?: any
): void => {
  if (!isAnalyticsAllowed()) return;
  
  // Import and call the original trackEvent function
  import('./analytics').then(({ trackEvent }) => {
    trackEvent(eventType as any, userId, data);
  });
};

// Clear all cookies and localStorage
export const clearAllCookies = (): void => {
  if (typeof window === 'undefined') return;
  
  // Clear localStorage
  localStorage.removeItem('cookieConsent');
  localStorage.removeItem('cookieSettings');
  
  // Clear all cookies
  document.cookie.split(';').forEach(cookie => {
    const [name] = cookie.split('=');
    document.cookie = `${name.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  });
};

// Reset cookie consent
export const resetCookieConsent = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('cookieConsent');
  localStorage.removeItem('cookieSettings');
}; 