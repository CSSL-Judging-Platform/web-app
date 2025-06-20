"use client"

import LoginForm from "@/components/auth/login-form"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export default function LoginPage() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>

        {/* Decorative elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/5 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-yellow-300/10 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-10 w-20 h-20 bg-purple-300/10 rounded-full blur-lg animate-bounce"></div>

        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12 w-full">
          <div className="max-w-md text-center space-y-8">
            {/* Logo */}
            <div className="w-28 h-28 mx-auto bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
              <div className="text-center">
                <div className="text-2xl font-bold">CSSL</div>
                <div className="text-xs opacity-80">PORTAL</div>
              </div>
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-4xl font-bold leading-tight">
                Welcome to
                <br />
                <span className="text-yellow-300">CSSL Judging Portal</span>
              </h1>
              <p className="text-lg text-blue-100 leading-relaxed">
                Streamline your competition judging process with our comprehensive platform. Manage events, evaluate
                contestants, and track results seamlessly.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-300">500+</div>
                <div className="text-sm text-blue-200">Events</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-300">1000+</div>
                <div className="text-sm text-blue-200">Judges</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-300">5000+</div>
                <div className="text-sm text-blue-200">Contestants</div>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3 pt-4">
              <div className="flex items-center justify-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Real-time Judging & Scoring</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Comprehensive Analytics & Reports</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Multi-role Access Management</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-8 bg-background relative">
        {/* Theme Toggle */}
        <div className="absolute top-4 right-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="h-9 w-9"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>

        <div className="w-full max-w-md space-y-6">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center space-y-4">
            <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <div className="text-center">
                <div className="text-lg font-bold text-primary">CSSL</div>
                <div className="text-xs text-muted-foreground">PORTAL</div>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold">Welcome Back</h2>
              <p className="text-muted-foreground">Sign in to your CSSL account</p>
            </div>
          </div>

          <LoginForm />

          {/* Additional Info */}
          <div className="text-center space-y-4">
            <div className="text-sm text-muted-foreground">Computer Society of Sri Lanka</div>
            <div className="flex justify-center space-x-4 text-xs text-muted-foreground">
              <a href="/support" className="hover:text-primary transition-colors">
                Need Help?
              </a>
              <span>•</span>
              <a href="/privacy" className="hover:text-primary transition-colors">
                Privacy
              </a>
              <span>•</span>
              <a href="/terms" className="hover:text-primary transition-colors">
                Terms
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
