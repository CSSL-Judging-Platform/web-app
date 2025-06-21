"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  LayoutDashboard,
  Users,
  Trophy,
  Calendar,
  BarChart3,
  Settings,
  FileText,
  Upload,
  Menu,
  Gavel,
  Award,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  ClipboardList
} from "lucide-react"
import { UserNav } from "@/components/ui/user-nav"
import { Footer } from "@/components/layout/footer"
import { useAuth } from "@/lib/auth"
import Image from "next/image"

const navItems = {
  admin: [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { title: "Competitions", href: "/admin/small-events", icon: Trophy },
    { title: "Big Events", href: "/admin/big-events", icon: Calendar },
    { title: "Judges", href: "/admin/judges", icon: Gavel },
    { title: "Evaluations", href: "/admin/evaluations", icon: ClipboardList },
    { title: "Contestants", href: "/admin/contestants", icon: Users },
    { title: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { title: "Reports", href: "/admin/reports", icon: FileText },
    { title: "Bulk Upload", href: "/admin/bulk-upload", icon: Upload },
  ],
  judge: [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { title: "My Events", href: "/judge/events", icon: Calendar },
    { title: "Judging", href: "/judge/judging", icon: UserCheck },
    { title: "My Reports", href: "/judge/reports", icon: FileText },
  ],
  contestant: [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { title: "My Events", href: "/contestant/events", icon: Calendar },
    { title: "Results", href: "/contestant/results", icon: Award },
  ]
}

export function Sidebar({ isCollapsed, toggleSidebar }: { 
  isCollapsed: boolean, 
  toggleSidebar: () => void 
}) {
  const pathname = usePathname()
  const { user } = useAuth()
  const [isMobileOpen, setIsMobileOpen] = React.useState(false)

  const currentItems = user ? navItems[user.role] || [] : []

  return (
    <>
      {/* Desktop Sidebar - Fixed Position */}
      <aside className={cn(
        "hidden md:flex flex-col fixed h-screen z-30 transition-all duration-300 border-r bg-background",
        isCollapsed ? "w-16" : "w-64"
      )}>
        <div className={cn(
          "flex items-center h-16 border-b p-2",
          isCollapsed ? "justify-center" : "justify-between px-4"
        )}>
          {!isCollapsed && (
            <div className="relative w-40 h-10">
              <Image
                src="https://res.cloudinary.com/dgraeprjb/image/upload/v1750435938/New-CSSL-Logo-1024x398_qoqajz.png"
                alt="CSSL Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={toggleSidebar}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="space-y-1 p-2">
            {currentItems.map((item) => (
              <Button
                key={item.href}
                variant={pathname === item.href ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start h-12",
                  isCollapsed ? "px-2 justify-center" : "px-4",
                  pathname === item.href && "bg-accent"
                )}
                asChild
              >
                <Link href={item.href}>
                  <item.icon className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
                  {!isCollapsed && <span>{item.title}</span>}
                </Link>
              </Button>
            ))}
          </div>
        </ScrollArea>

        <div className="border-t p-2">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start h-12",
              isCollapsed ? "px-2 justify-center" : "px-4"
            )}
            asChild
          >
            <Link href="/settings">
              <Settings className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
              {!isCollapsed && <span>Settings</span>}
            </Link>
          </Button>
        </div>
      </aside>

      {/* Mobile Sidebar Trigger */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-40 md:hidden"
        onClick={() => setIsMobileOpen(true)}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Open menu</span>
      </Button>

      {/* Mobile Sidebar - Sheet */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetContent side="left" className="w-[280px] p-0">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-center p-4 border-b h-16">
              <div className="relative w-40 h-10">
                <Image
                  src="https://res.cloudinary.com/dgraeprjb/image/upload/v1750435938/New-CSSL-Logo-1024x398_qoqajz.png"
                  alt="CSSL Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="space-y-1 p-2">
                {currentItems.map((item) => (
                  <Button
                    key={item.href}
                    variant={pathname === item.href ? "secondary" : "ghost"}
                    className="w-full justify-start h-12 px-4"
                    asChild
                    onClick={() => setIsMobileOpen(false)}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4 mr-3" />
                      <span>{item.title}</span>
                    </Link>
                  </Button>
                ))}
              </div>
            </ScrollArea>

            <div className="border-t p-2">
              <Button
                variant="ghost"
                className="w-full justify-start h-12 px-4"
                asChild
                onClick={() => setIsMobileOpen(false)}
              >
                <Link href="/settings">
                  <Settings className="h-4 w-4 mr-3" />
                  <span>Settings</span>
                </Link>
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = React.useState(false)

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar isCollapsed={isCollapsed} toggleSidebar={() => setIsCollapsed(!isCollapsed)} />
      
      {/* Main Content Area */}
      <div className={cn(
        "flex flex-col flex-1 min-w-0 transition-all duration-300",
        isCollapsed ? "md:ml-16" : "md:ml-64"
      )}>
        {/* Sticky Header */}
        <header className={cn(
          "sticky top-0 z-20 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur px-4 md:px-6",
          isCollapsed ? "md:left-16" : "md:left-64"
        )}>
          <div className="flex-1">
            {/* <h1 className="text-lg font-semibold md:text-xl">CSSL Judging Portal</h1> */}
          </div>
          <UserNav />
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>

        {/* Sticky Footer */}
        <footer className={cn(
          "sticky bottom-0 border-t bg-background/95 backdrop-blur",
          isCollapsed ? "md:left-16" : "md:left-64"
        )}>
          <Footer />
        </footer>
      </div>
    </div>
  )
}