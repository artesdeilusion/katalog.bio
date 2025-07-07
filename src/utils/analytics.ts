import { doc, increment, updateDoc, getDoc, setDoc, collection, addDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { auth } from '../firebase';
import { db } from '../firebase';
import { isAnalyticsAllowed } from './cookie-manager';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';

// Session management
let sessionId: string | null = null;

const getSessionId = (): string => {
  if (typeof window === 'undefined') return 'server';
  
  if (!sessionId) {
    sessionId = localStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('analytics_session_id', sessionId);
    }
  }
  
  return sessionId;
};

// Anonymous authentication management
let anonymousAuthPromise: Promise<any> | null = null;

const ensureAnonymousAuth = async (): Promise<any> => {
  if (auth.currentUser) {
    return auth.currentUser;
  }

  if (anonymousAuthPromise) {
    return anonymousAuthPromise;
  }

  anonymousAuthPromise = new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      if (user) {
        resolve(user);
      } else {
        // Try to sign in anonymously
        signInAnonymously(auth)
          .then((result) => {
            resolve(result.user);
          })
          .catch((error) => {
            console.error('Anonymous auth error:', error);
            reject(error);
          });
      }
    });
  });

  return anonymousAuthPromise;
};

// Analytics event types
export type AnalyticsEvent = 
  | 'product_view'
  | 'product_click'
  | 'action_button_click'
  | 'order_button_click'
  | 'store_visit'
  | 'category_filter'
  | 'search_query'
  | 'highlighted_product_view'
  | 'highlighted_product_click'
  | 'image_gallery_navigation'
  | 'price_visibility_toggle'
  | 'link_type_click';

// Helper function to clean undefined values from object
const cleanUndefinedValues = (obj: any): any => {
  if (obj === null || obj === undefined) {
    return null;
  }
  
  if (typeof obj === 'object' && !Array.isArray(obj)) {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = cleanUndefinedValues(value);
      }
    }
    return cleaned;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => cleanUndefinedValues(item)).filter(item => item !== undefined);
  }
  
  return obj;
};

// Track analytics event
export const trackEvent = async (
  eventType: AnalyticsEvent,
  userId: string | null, // Allow null for anonymous users
  data?: {
    productId?: string;
    productName?: string;
    productDescription?: string | null;
    productPrice?: number | string | null;
    productCurrency?: string | null;
    productShowPrice?: boolean;
    productHighlighted?: boolean;
    productImageCount?: number;
    categoryId?: string | null;
    categoryName?: string | null;
    mainCategoryId?: string | null;
    mainCategoryName?: string | null;
    subCategory1Id?: string | null;
    subCategory1Name?: string | null;
    subCategory2Id?: string | null;
    subCategory2Name?: string | null;
    searchQuery?: string;
    linkType?: string;
    customLink?: string | null;
    userAgent?: string;
    referrer?: string | null;
    pagePath?: string;
    storeName?: string | null;
    storeCustomURL?: string | null;
    buttonTitle?: string | null;
    buttonColor?: string | null;
    imageIndex?: number;
    totalImages?: number;
    [key: string]: any;
  }
) => {
  // Check if analytics is allowed based on cookie consent
  if (!isAnalyticsAllowed()) {
    return;
  }

  // Log user status for debugging
  const currentUser = auth.currentUser;
  console.log('Analytics tracking:', {
    eventType,
    userId: userId || 'ANONYMOUS',
    isAnonymous: !userId,
    sessionId: getSessionId(),
    hasCookieConsent: isAnalyticsAllowed(),
    firebaseAuthUser: currentUser ? {
      uid: currentUser.uid,
      email: currentUser.email,
      isAnonymous: currentUser.isAnonymous
    } : 'NO_AUTH_USER'
  });

  try {
    // Clean undefined values from data
    const cleanedData = cleanUndefinedValues(data || {});
    
    if (userId) {
      // Authenticated user - use Firebase
      const finalUserId = userId;
      
      // Add event to analytics collection
      await addDoc(collection(db, 'analytics'), {
        userId: finalUserId,
        isAnonymous: false,
        eventType,
        data: cleanedData,
        timestamp: serverTimestamp(),
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
        referrer: typeof window !== 'undefined' ? document.referrer : '',
        pagePath: typeof window !== 'undefined' ? window.location.pathname : '',
        sessionId: getSessionId(),
      });
    } else {
      // Anonymous user - try to authenticate anonymously first
      try {
        const anonymousUser = await ensureAnonymousAuth();
        console.log('Anonymous user authenticated:', anonymousUser.uid);
        
        // Use Firebase with anonymous auth
        await addDoc(collection(db, 'analytics'), {
          userId: anonymousUser.uid,
          isAnonymous: true,
          eventType,
          data: cleanedData,
          timestamp: serverTimestamp(),
          userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
          referrer: typeof window !== 'undefined' ? document.referrer : '',
          pagePath: typeof window !== 'undefined' ? window.location.pathname : '',
          sessionId: getSessionId(),
        });
        
        console.log('Anonymous analytics successfully synced to Firebase with auth');
      } catch (error) {
        console.log('Anonymous auth failed, falling back to localStorage:', error);
        
        // Fallback to localStorage if anonymous auth fails
        const anonymousEvent = {
          userId: `anonymous_${getSessionId()}`,
          isAnonymous: true,
          eventType,
          data: cleanedData,
          timestamp: new Date().toISOString(),
          userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
          referrer: typeof window !== 'undefined' ? document.referrer : '',
          pagePath: typeof window !== 'undefined' ? window.location.pathname : '',
          sessionId: getSessionId(),
        };
        
        // Store in localStorage
        const existingEvents = JSON.parse(localStorage.getItem('anonymous_analytics') || '[]');
        existingEvents.push(anonymousEvent);
        localStorage.setItem('anonymous_analytics', JSON.stringify(existingEvents));
        
        console.log('Anonymous analytics stored locally as fallback');
      }
    }

    // Update user's analytics summary (only for authenticated users)
    if (userId && !userId.startsWith('anonymous_')) {
      const userAnalyticsRef = doc(db, 'userAnalytics', userId);
      const userAnalyticsDoc = await getDoc(userAnalyticsRef);
      
      if (userAnalyticsDoc.exists()) {
        // Update existing analytics
        await updateDoc(userAnalyticsRef, {
          [`${eventType}_count`]: increment(1),
          [`${eventType}_last`]: serverTimestamp(),
          total_events: increment(1),
          last_updated: serverTimestamp(),
        });
      } else {
        // Create new analytics document
        await setDoc(userAnalyticsRef, {
          userId,
          [`${eventType}_count`]: 1,
          [`${eventType}_last`]: serverTimestamp(),
          total_events: 1,
          created_at: serverTimestamp(),
          last_updated: serverTimestamp(),
        });
      }
    }

    // Track product-specific analytics (only for authenticated users)
    if (data?.productId && userId) {
      const productAnalyticsRef = doc(db, 'productAnalytics', data.productId);
      const productAnalyticsDoc = await getDoc(productAnalyticsRef);
      
      if (productAnalyticsDoc.exists()) {
        await updateDoc(productAnalyticsRef, {
          [`${eventType}_count`]: increment(1),
          [`${eventType}_last`]: serverTimestamp(),
          total_events: increment(1),
          last_updated: serverTimestamp(),
        });
      } else {
        // Clean product data before saving
        const productData = cleanUndefinedValues({
          productId: data.productId,
          productName: data.productName || '',
          userId: userId,
          [`${eventType}_count`]: 1,
          [`${eventType}_last`]: serverTimestamp(),
          total_events: 1,
          created_at: serverTimestamp(),
          last_updated: serverTimestamp(),
        });
        
        await setDoc(productAnalyticsRef, productData);
      }
    }

    // Google Analytics tracking (if available)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventType, {
        event_category: 'engagement',
        event_label: data?.productName || data?.categoryId || 'general',
        value: 1,
        custom_parameters: data,
      });
    }

  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
};

// Get user analytics summary
export const getUserAnalytics = async (userId: string) => {
  try {
    const userAnalyticsRef = doc(db, 'userAnalytics', userId);
    const userAnalyticsDoc = await getDoc(userAnalyticsRef);
    
    if (userAnalyticsDoc.exists()) {
      return userAnalyticsDoc.data();
    }
    return null;
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    return null;
  }
};

// Get product analytics
export const getProductAnalytics = async (productId: string) => {
  try {
    const productAnalyticsRef = doc(db, 'productAnalytics', productId);
    const productAnalyticsDoc = await getDoc(productAnalyticsRef);
    
    if (productAnalyticsDoc.exists()) {
      return productAnalyticsDoc.data();
    }
    return null;
  } catch (error) {
    console.error('Error fetching product analytics:', error);
    return null;
  }
};

// Track page view
export const trackPageView = async (userId: string, pagePath: string) => {
  await trackEvent('store_visit', userId, {
    pagePath,
    timestamp: new Date().toISOString(),
  });
};

// Sync anonymous analytics to Firebase (called when user logs in)
export const syncAnonymousAnalytics = async (userId: string): Promise<void> => {
  if (typeof window === 'undefined') return;
  
  try {
    const anonymousEvents = JSON.parse(localStorage.getItem('anonymous_analytics') || '[]');
    
    if (anonymousEvents.length > 0) {
      // Convert anonymous events to authenticated events
      const authenticatedEvents = anonymousEvents.map((event: any) => ({
        ...event,
        userId: userId,
        isAnonymous: false,
        timestamp: serverTimestamp(),
      }));
      
      // Batch write to Firebase
      const batch = writeBatch(db);
      authenticatedEvents.forEach((event: any) => {
        const docRef = doc(collection(db, 'analytics'));
        batch.set(docRef, event);
      });
      
      await batch.commit();
      
      // Clear localStorage
      localStorage.removeItem('anonymous_analytics');
      
      console.log(`Synced ${authenticatedEvents.length} anonymous events to Firebase`);
    }
  } catch (error) {
    console.error('Error syncing anonymous analytics:', error);
  }
};

// Get anonymous analytics from localStorage
export const getAnonymousAnalytics = (): any[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    return JSON.parse(localStorage.getItem('anonymous_analytics') || '[]');
  } catch (error) {
    console.error('Error getting anonymous analytics:', error);
    return [];
  }
}; 