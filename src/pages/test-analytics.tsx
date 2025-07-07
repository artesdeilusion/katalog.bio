import { useEffect, useState } from "react";
import { trackEvent, getAnonymousAnalytics, syncAnonymousAnalytics } from "../utils/analytics";
import { auth } from "../firebase";
import { onAuthStateChanged, User, signInAnonymously } from "firebase/auth";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import Head from "next/head";

export default function TestAnalytics() {
  const [anonymousEvents, setAnonymousEvents] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      console.log('Auth state changed:', user ? {
        uid: user.uid,
        email: user.email,
        isAnonymous: user.isAnonymous
      } : 'No user');
    });
    
    // Load anonymous events
    const events = getAnonymousAnalytics();
    setAnonymousEvents(events);
    
    return () => unsubscribe();
  }, []);

  const testAnonymousTracking = async () => {
    console.log('Testing anonymous analytics tracking...');
    
    // Test different event types
    await trackEvent('store_visit', null, {
      pagePath: '/test-analytics',
      storeName: 'Test Store',
      storeCustomURL: 'test-store'
    });

    await trackEvent('product_view', null, {
      productId: 'test-product-1',
      productName: 'Test Product',
      productPrice: 99.99,
      productCurrency: '₺',
      storeName: 'Test Store'
    });

    await trackEvent('product_click', null, {
      productId: 'test-product-2',
      productName: 'Another Test Product',
      storeName: 'Test Store'
    });

    // Reload anonymous events
    const events = getAnonymousAnalytics();
    setAnonymousEvents(events);
    
    console.log('Anonymous tracking test completed');
  };

  const syncToFirebase = async () => {
    if (!currentUser) {
      alert('Please log in first to sync anonymous analytics');
      return;
    }

    try {
      await syncAnonymousAnalytics(currentUser.uid);
      alert('Anonymous analytics synced to Firebase!');
      
      // Reload anonymous events
      const events = getAnonymousAnalytics();
      setAnonymousEvents(events);
    } catch (error) {
      console.error('Sync error:', error);
      alert('Error syncing analytics: ' + error);
    }
  };

  const clearAnonymousEvents = () => {
    localStorage.removeItem('anonymous_analytics');
    setAnonymousEvents([]);
    alert('Anonymous events cleared from localStorage');
  };

  const handleSignInAnonymously = async () => {
    try {
      const result = await signInAnonymously(auth);
      console.log('Anonymous sign-in successful:', result.user.uid);
      alert('Anonymous sign-in successful!');
    } catch (error) {
      console.error('Anonymous sign-in error:', error);
      alert('Anonymous sign-in failed: ' + error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Test Analitik - katalog.bio</title>
        <meta name="description" content="Analitik test sayfası" />
      </Head>
      <div className="max-w-6xl mx-auto mt-10 p-4">
        <h1 className="text-3xl font-bold mb-6">Analytics Test Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Current User Status</CardTitle>
            </CardHeader>
            <CardContent>
              {currentUser ? (
                <div className="space-y-2">
                  <p><strong>UID:</strong> {currentUser.uid}</p>
                  <p><strong>Email:</strong> {currentUser.email}</p>
                  <p><strong>Anonymous:</strong> {currentUser.isAnonymous ? 'Yes' : 'No'}</p>
                </div>
              ) : (
                <p className="text-muted-foreground">No authenticated user</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Anonymous Events Count</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{anonymousEvents.length}</p>
              <p className="text-sm text-muted-foreground">events in localStorage</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4 mb-8">
          <Button onClick={testAnonymousTracking} className="w-full">
            Test Anonymous Analytics Tracking
          </Button>
          
          <Button onClick={syncToFirebase} variant="secondary" className="w-full" disabled={!currentUser}>
            Sync Anonymous Analytics to Firebase
          </Button>
          
          <Button onClick={clearAnonymousEvents} variant="outline" className="w-full">
            Clear Anonymous Events
          </Button>
          
          <Button onClick={handleSignInAnonymously} variant="outline" className="w-full">
            Sign In Anonymously
          </Button>
        </div>

        {anonymousEvents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Anonymous Events in localStorage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {anonymousEvents.map((event, index) => (
                  <div key={index} className="p-4 border rounded-lg bg-muted/50">
                    <div className="flex justify-between items-start mb-2">
                      <strong className="text-sm">{event.eventType}</strong>
                      <span className="text-xs text-muted-foreground">
                        {new Date(event.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-xs space-y-1">
                      <p><strong>User ID:</strong> {event.userId}</p>
                      <p><strong>Session ID:</strong> {event.sessionId}</p>
                      <p><strong>Page:</strong> {event.pagePath}</p>
                      {event.data && Object.keys(event.data).length > 0 && (
                        <div>
                          <strong>Data:</strong>
                          <pre className="text-xs mt-1 bg-background p-2 rounded overflow-x-auto">
                            {JSON.stringify(event.data, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 