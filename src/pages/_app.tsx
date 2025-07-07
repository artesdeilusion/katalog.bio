import "@/styles/globals.css";
import type { AppProps } from "next/app";
import "../firebase";
import { useEffect, useState, createContext, useContext, ReactNode } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import CookieConsent from "../components/cookie-consent";
import CookieSettingsDialog from "../components/cookie-settings-dialog";
import { initializeAnalytics, getCookieConsent } from "../utils/cookie-manager";
import { syncAnonymousAnalytics } from "../utils/analytics";

// Auth context and provider
interface UserData {
  uid: string;
  email: string;
  customURL?: string;
  displayName?: string;
  photoURL?: string;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, userData: null, loading: true });

export function useAuth() {
  return useContext(AuthContext);
}

function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        try {
          // Sync anonymous analytics when user logs in
          await syncAnonymousAnalytics(user.uid);
          
          // Fetch user data from Firestore
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUserData({
              uid: user.uid,
              email: user.email || "",
              ...userDoc.data()
            });
          } else {
            // Create user data if it doesn't exist
            setUserData({
              uid: user.uid,
              email: user.email || "",
              displayName: user.displayName || "",
              photoURL: user.photoURL || "",
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUserData({
            uid: user.uid,
            email: user.email || "",
            displayName: user.displayName || "",
            photoURL: user.photoURL || "",
          });
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, userData, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export default function App({ Component, pageProps }: AppProps) {
  const [showCookieSettings, setShowCookieSettings] = useState(false);

  useEffect(() => {
    // Initialize analytics based on cookie consent
    const consent = getCookieConsent();
    if (consent === 'accepted') {
      initializeAnalytics();
    }
  }, []);

  const handleCookieAccept = () => {
    initializeAnalytics();
  };

  const handleCookieDecline = () => {
    // Analytics will not be initialized
  };

  const handleCookieSettingsSave = () => {
    // Re-initialize analytics based on new settings
    initializeAnalytics();
  };

  return (
    <AuthProvider>
      <Component {...pageProps} />
      <CookieConsent 
        onAccept={handleCookieAccept}
        onDecline={handleCookieDecline}
      />
      <CookieSettingsDialog
        open={showCookieSettings}
        onClose={() => setShowCookieSettings(false)}
        onSave={handleCookieSettingsSave}
      />
    </AuthProvider>
  );
}
