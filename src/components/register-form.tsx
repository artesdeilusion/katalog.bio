import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { isCustomURLAvailable } from "../utils/validateURL";
import { useAuth } from "../pages/_app";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

// Username validation and formatting function
function validateAndFormatUsername(rawValue: string): string | null {
  const value = rawValue.toLowerCase();
  // Only allow lowercase letters, numbers, dots, and underscores
  const allowedChars = /^[a-z0-9._]*$/.test(value);
  // Disallow consecutive dots (..) but allow single dots
  const noConsecutiveDots = !/\.{2,}/.test(value);
  // Allow up to 3 underscores in a row
  const validUnderscores = !/_{4,}/.test(value);
  // Only check edge rules if the value is longer than 1 character
  const noEdgeDots = value.length <= 1 || !/^[._]$/.test(value);
  if (allowedChars && noConsecutiveDots && validUnderscores && noEdgeDots) {
    return value;
  }
  return null;
}

export function RegisterForm({ className, usernameProp = "" }: { className?: string; usernameProp?: string }) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState(usernameProp);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [usernameReadOnly, setUsernameReadOnly] = useState(!!usernameProp);

  useEffect(() => {
    if (router.query.username) {
      const validated = validateAndFormatUsername(router.query.username as string);
      if (validated !== null) {
        setUsername(validated);
      }
      setUsernameReadOnly(false);
    }
  }, [router.query.username]);


  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username) {
      setError("Username is required.");
      return;
    }
    setSubmitting(true);
    const available = await isCustomURLAvailable(username);
    if (!available) {
      setError("Username is already taken.");
      setSubmitting(false);
      return;
    }
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", cred.user.uid), {
        email,
        customURL: username,
        uid: cred.user.uid,
        displayName: cred.user.displayName || "",
        photoURL: cred.user.photoURL || "",
        createdAt: new Date(),
      });
      router.push("/dashboard");
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message);
    }
    setSubmitting(false);
  };

  const handleGoogleRegister = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Generate a username from email if not provided
      let finalUsername = username;
      if (!finalUsername) {
        finalUsername = user.email?.split('@')[0] || `user${Date.now()}`;
      }
      
      // Check if username is available
      const available = await isCustomURLAvailable(finalUsername);
      if (!available) {
        // Try with a number suffix
        let counter = 1;
        while (!available && counter < 10) {
          const newUsername = `${finalUsername}${counter}`;
          const newAvailable = await isCustomURLAvailable(newUsername);
          if (newAvailable) {
            finalUsername = newUsername;
            break;
          }
          counter++;
        }
      }
      
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        customURL: finalUsername,
        uid: user.uid,
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: new Date(),
      });
      router.push("/dashboard");
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message);
    }
    setGoogleLoading(false);
  };

  if (loading) return <div>Loading...</div>;
  if (user) return null;

  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={handleRegister}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your details below to create your account
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="username">Username</Label>
          <Input id="username" type="text" value={username} onChange={e => {
            const validated = validateAndFormatUsername(e.target.value);
            if (validated !== null) {
              setUsername(validated);
            }
          }} required readOnly={usernameReadOnly} />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        {error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Registering..." : "Register"}
        </Button>
        <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
          <span className="bg-background text-muted-foreground relative z-10 px-2">
            Or continue with
          </span>
        </div>
        <Button 
          variant="outline" 
          className="w-full" 
          type="button" 
          onClick={handleGoogleRegister}
          disabled={googleLoading}
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          {googleLoading ? "Signing up..." : "Sign up with Google"}
        </Button>
      </div>
      <div className="text-center text-sm">
        Already have an account?{" "}
        <Link href="/login" className="underline underline-offset-4">
          Login
        </Link>
      </div>
    </form>
  );
} 