"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LoginLogo } from "@/components/ui/login-logo"
import { useAuth } from "@/lib/auth"
import { Eye, EyeOff, User, Lock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  const { signIn } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const { data, error } = await signIn(email, password)

      if (error) {
        setError(error.message)
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive",
        })
      } else if (data?.user) {
        toast({
          title: "Login Successful",
          description: "Welcome back! Redirecting to dashboard...",
        })
        // Force a page refresh to ensure the auth state is updated
        window.location.href = "/dashboard"
      } else {
        setError("Login failed. Please try again.")
        toast({
          title: "Login Failed",
          description: "Login failed. Please try again.",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Login error:", err)
      setError("An unexpected error occurred. Please try again.")
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail)
    setPassword(demoPassword)
    toast({
      title: "Demo Account Selected",
      description: `Filled in ${demoEmail.split("@")[0]} credentials`,
    })
  }

  return (
    <div className="w-full space-y-6">
      <div className="text-center space-y-2 lg:block hidden">
        <LoginLogo size="md" />
        {/* <h1 className="text-2xl font-bold text-foreground">Welcome Back</h1>
        <p className="text-muted-foreground">Sign in to access your CSSL judging portal</p> */}
      </div>

      <Card className="border-0">
        {/* <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-xl text-center">Sign In</CardTitle>
          <CardDescription className="text-center">Enter your credentials to continue</CardDescription>
        </CardHeader> */}
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Demo Accounts</span>
            </div>
          </div>

          <div className="grid gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDemoLogin("admin@judgingportal.com", "admin123")}
              className="justify-between text-xs h-12"
            >
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                  <span className="text-red-600 dark:text-red-400 font-semibold text-xs">A</span>
                </div>
                <div className="text-left">
                  <div className="font-medium">Admin Demo</div>
                  <div className="text-muted-foreground">Full system access</div>
                </div>
              </div>
              <span className="text-muted-foreground text-xs">admin123</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDemoLogin("judge@judgingportal.com", "judge123")}
              className="justify-between text-xs h-12"
            >
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 font-semibold text-xs">J</span>
                </div>
                <div className="text-left">
                  <div className="font-medium">Judge Demo</div>
                  <div className="text-muted-foreground">Evaluate contestants</div>
                </div>
              </div>
              <span className="text-muted-foreground text-xs">judge123</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDemoLogin("contestant@judgingportal.com", "contestant123")}
              className="justify-between text-xs h-12"
            >
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <span className="text-green-600 dark:text-green-400 font-semibold text-xs">C</span>
                </div>
                <div className="text-left">
                  <div className="font-medium">Contestant Demo</div>
                  <div className="text-muted-foreground">View your results</div>
                </div>
              </div>
              <span className="text-muted-foreground text-xs">contestant123</span>
            </Button>
          </div>

          <div className="text-center text-xs text-muted-foreground">
            <p>Click any demo button to auto-fill and test the system</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
