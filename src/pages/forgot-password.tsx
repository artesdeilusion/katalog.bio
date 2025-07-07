import { useState } from "react"
import { GalleryVerticalEnd, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { fetchSignInMethodsForEmail, sendPasswordResetEmail } from "firebase/auth"
import { auth } from "../firebase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import Head from "next/head"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    
    try {
      // Check if email exists in Firebase Auth
      const signInMethods = await fetchSignInMethodsForEmail(auth, email)
      
      if (signInMethods.length === 0) {
        // Email doesn't exist
        setError("No account found with this email address.")
        setIsLoading(false)
        return
      }
      
      // Email exists, send password reset
      await sendPasswordResetEmail(auth, email)
      setIsSent(true)
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.")
    }
    
    setIsLoading(false)
  }

  if (isSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
        <Head>
          <title>Şifremi Unuttum - katalog.bio</title>
          <meta name="description" content="Şifrenizi sıfırlamak için e-posta adresinizi girin" />
        </Head>
        <div className="w-full max-w-md">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-2">
              <a
                href="#"
                className="flex flex-col items-center gap-2 font-medium"
              >
                <div className="flex size-8 items-center justify-center rounded-md">
                  <GalleryVerticalEnd className="size-6" />
                </div>
                <span className="sr-only">Katalog.bio</span>
              </a>
              <h1 className="text-xl font-bold">Check your email</h1>
              <div className="text-center text-sm">
                We've sent a password reset link to {email}
              </div>
            </div>
            <div className="flex flex-col gap-6">
              <div className="text-center text-sm text-gray-600">
                Didn't receive the email? Check your spam folder or try again.
              </div>
              <Button 
                onClick={() => setIsSent(false)}
                className="w-full"
                variant="outline"
              >
                Try again
              </Button>
            </div>
            <div className="text-center">
              <Link href="/login" className="text-sm text-gray-600 hover:text-blue-600 flex items-center justify-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
      <Head>
        <title>Şifremi Unuttum - katalog.bio</title>
        <meta name="description" content="Şifrenizi sıfırlamak için e-posta adresinizi girin" />
      </Head>
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center gap-2">
                <a
                  href="#"
                  className="flex flex-col items-center gap-2 font-medium"
                >
                  <div className="flex size-8 items-center justify-center rounded-md">
                    <GalleryVerticalEnd className="size-6" />
                  </div>
                  <span className="sr-only">Katalog.bio</span>
                </a>
                <h1 className="text-xl font-bold">Forgot your password?</h1>
                <div className="text-center text-sm">
                  Enter your email address and we'll send you a link to reset your password.
                </div>
              </div>
              <div className="flex flex-col gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                {error && <div className="text-red-500 text-sm text-center">{error}</div>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Sending..." : "Send reset link"}
                </Button>
              </div>
            </div>
          </form>
          <div className="text-center">
            <Link href="/login" className="text-sm text-gray-600 hover:text-blue-600 flex items-center justify-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </Link>
          </div>
          
        </div>
      </div>
    </div>
  )
} 