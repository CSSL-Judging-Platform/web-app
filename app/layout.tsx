import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/ui/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/lib/auth'
import { Toaster as SonnerToaster } from "sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CSSL Judging Portal",
  description: "Computer Society of Sri Lanka - Competition Judging Platform",
  keywords: "CSSL, judging, competition, Sri Lanka, computer society",
  authors: [{ name: "Code Idol", url: "https://codeidol.lk" }],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange={false}
          suppressHydrationWarning
        >
          <AuthProvider>
            {children}
            <SonnerToaster position="top-center" />
          </AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
