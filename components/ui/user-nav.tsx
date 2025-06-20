"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { User, Settings, LogOut, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { signOut } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface UserNavProps {
  user: {
    full_name: string
    email: string
    role: string
  }
}

export function UserNav({ user }: UserNavProps) {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const { toast } = useToast()

  // Add safety checks for user object
  const safeUser = {
    full_name: user?.full_name || "Unknown User",
    email: user?.email || "No email",
    role: user?.role || "user",
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account.",
      })
      router.push("/login")
    } catch (error) {
      console.error("Error signing out:", error)
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleThemeToggle = () => {
    const newTheme = theme === "dark" ? "light" : "dark"
    setTheme(newTheme)
    toast({
      title: `Switched to ${newTheme} mode`,
      description: `Theme changed to ${newTheme} mode successfully.`,
    })
  }

  const getInitials = (name: string) => {
    if (!name || typeof name !== "string") {
      return "U" // Default to 'U' for User if name is invalid
    }
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "judge":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "contestant":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/avatars/01.png" alt={safeUser.full_name} />
            <AvatarFallback>{getInitials(safeUser.full_name)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{safeUser.full_name}</p>
            <p className="text-xs leading-none text-muted-foreground">{safeUser.email}</p>
            <Badge className={`${getRoleColor(safeUser.role)} w-fit mt-1`} variant="secondary">
              {safeUser.role}
            </Badge>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push("/settings")}>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/settings")}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleThemeToggle}>
            {theme === "dark" ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
            <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
