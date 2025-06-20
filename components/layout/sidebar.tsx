"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Users,
  Trophy,
  BarChart3,
  Settings,
  LogOut,
  Home,
  UserPlus,
  FileSpreadsheet,
  CalendarDays,
  FileText,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar"
import { Logo } from "@/components/ui/logo"
import { UserNav } from "@/components/ui/user-nav"
import { Footer } from "@/components/layout/footer"
import { signOut } from "@/lib/auth"

interface AppSidebarProps {
  userRole?: "admin" | "judge" | "contestant"
}

export function AppSidebar({ userRole = "contestant" }: AppSidebarProps) {
  const pathname = usePathname()

  const adminMenuItems = [
    { title: "Dashboard", url: "/dashboard", icon: Home },
    { title: "Big Events", url: "/admin/big-events", icon: CalendarDays },
    { title: "Competitions", url: "/admin/small-events", icon: Trophy },
    { title: "Judges", url: "/admin/judges", icon: Users },
    { title: "Contestants", url: "/admin/contestants", icon: UserPlus },
    { title: "Reports", url: "/admin/reports", icon: FileText },
    { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
    { title: "Bulk Upload", url: "/admin/bulk-upload", icon: FileSpreadsheet },
  ]

  const judgeMenuItems = [
    { title: "Dashboard", url: "/dashboard", icon: Home },
    { title: "My Events", url: "/judge/events", icon: Trophy },
    { title: "Judging", url: "/judge/judging", icon: BarChart3 },
    { title: "My Reports", url: "/judge/reports", icon: FileText },
  ]

  const contestantMenuItems = [
    { title: "Dashboard", url: "/dashboard", icon: Home },
    { title: "My Events", url: "/contestant/events", icon: Trophy },
    { title: "Results", url: "/contestant/results", icon: BarChart3 },
  ]

  const getMenuItems = () => {
    switch (userRole) {
      case "admin":
        return adminMenuItems
      case "judge":
        return judgeMenuItems
      default:
        return contestantMenuItems
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      window.location.href = "/login"
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="px-2 py-2">
          <Logo size="sm" />
          <p className="text-xs text-muted-foreground capitalize mt-1 ml-10">{userRole} Portal</p>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {getMenuItems().map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/settings">
                <Settings />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleSignOut}>
              <LogOut />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

export function DashboardLayout({
  children,
  userRole,
  user,
}: {
  children: React.ReactNode
  userRole?: "admin" | "judge" | "contestant"
  user?: any
}) {
  return (
    <SidebarProvider>
      <AppSidebar userRole={userRole} />
      <SidebarInset>
        <div className="flex min-h-screen flex-col">
          <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center px-4">
              <SidebarTrigger />
              <div className="ml-auto flex items-center space-x-4">{user && <UserNav user={user} />}</div>
            </div>
          </div>
          <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">{children}</div>
          <Footer />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
