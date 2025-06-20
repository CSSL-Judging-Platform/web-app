"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { DashboardLayout } from "@/components/layout/sidebar"
import { getCurrentUser } from "@/lib/auth"
import { useTheme } from "next-themes"
import { useToast } from "@/hooks/use-toast"
import { Moon, Sun, Monitor, User, Bell, Shield, Palette, Save } from "lucide-react"

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()

  // Form state
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    organization: "",
    expertise: "",
    bio: "",
  })

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: false,
    weeklyReports: true,
    eventReminders: true,
    language: "en",
    timezone: "Asia/Colombo",
  })

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)

      // Load user profile data (mock data)
      setProfile({
        name: currentUser?.name || "",
        email: currentUser?.email || "",
        phone: "+94 77 123 4567",
        organization: currentUser?.role === "judge" ? "University of Colombo" : "CSSL",
        expertise: currentUser?.role === "judge" ? "Software Engineering, AI" : "",
        bio: "Experienced professional in the field of computer science and technology.",
      })
    } catch (error) {
      console.error("Error loading user data:", error)
      toast({
        title: "Error",
        description: "Failed to load user data.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      // Mock save operation
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleSavePreferences = async () => {
    setSaving(true)
    try {
      // Mock save operation
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Preferences Updated",
        description: "Your preferences have been saved successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update preferences.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme)
    toast({
      title: "Theme Changed",
      description: `Theme changed to ${newTheme === "light" ? "Light" : newTheme === "dark" ? "Dark" : "System"} mode.`,
    })
  }

  if (loading) {
    return (
      <DashboardLayout userRole={user?.role} user={user}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole={user?.role} user={user}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>

        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>Update your personal information and professional details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="organization">Organization</Label>
                <Input
                  id="organization"
                  value={profile.organization}
                  onChange={(e) => setProfile({ ...profile, organization: e.target.value })}
                />
              </div>
            </div>

            {user?.role === "judge" && (
              <div className="space-y-2">
                <Label htmlFor="expertise">Areas of Expertise</Label>
                <Input
                  id="expertise"
                  placeholder="e.g., Software Engineering, AI, Data Science"
                  value={profile.expertise}
                  onChange={(e) => setProfile({ ...profile, expertise: e.target.value })}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself..."
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                rows={3}
              />
            </div>

            <Button onClick={handleSaveProfile} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Save Profile"}
            </Button>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Appearance
            </CardTitle>
            <CardDescription>Customize the look and feel of the application</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Theme</Label>
              <div className="flex gap-2">
                <Button
                  variant={theme === "light" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleThemeChange("light")}
                  className="flex items-center gap-2"
                >
                  <Sun className="h-4 w-4" />
                  Light
                </Button>
                <Button
                  variant={theme === "dark" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleThemeChange("dark")}
                  className="flex items-center gap-2"
                >
                  <Moon className="h-4 w-4" />
                  Dark
                </Button>
                <Button
                  variant={theme === "system" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleThemeChange("system")}
                  className="flex items-center gap-2"
                >
                  <Monitor className="h-4 w-4" />
                  System
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>Configure how you receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive notifications via email</p>
              </div>
              <Switch
                checked={preferences.emailNotifications}
                onCheckedChange={(checked) => setPreferences({ ...preferences, emailNotifications: checked })}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Push Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive push notifications in browser</p>
              </div>
              <Switch
                checked={preferences.pushNotifications}
                onCheckedChange={(checked) => setPreferences({ ...preferences, pushNotifications: checked })}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Weekly Reports</Label>
                <p className="text-sm text-muted-foreground">Receive weekly summary reports</p>
              </div>
              <Switch
                checked={preferences.weeklyReports}
                onCheckedChange={(checked) => setPreferences({ ...preferences, weeklyReports: checked })}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Event Reminders</Label>
                <p className="text-sm text-muted-foreground">Receive reminders about upcoming events</p>
              </div>
              <Switch
                checked={preferences.eventReminders}
                onCheckedChange={(checked) => setPreferences({ ...preferences, eventReminders: checked })}
              />
            </div>

            <Button onClick={handleSavePreferences} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Save Preferences"}
            </Button>
          </CardContent>
        </Card>

        {/* Regional Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Regional Settings
            </CardTitle>
            <CardDescription>Configure language and timezone preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select
                  value={preferences.language}
                  onValueChange={(value) => setPreferences({ ...preferences, language: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="si">Sinhala</SelectItem>
                    <SelectItem value="ta">Tamil</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  value={preferences.timezone}
                  onValueChange={(value) => setPreferences({ ...preferences, timezone: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Colombo">Asia/Colombo (UTC+05:30)</SelectItem>
                    <SelectItem value="UTC">UTC (UTC+00:00)</SelectItem>
                    <SelectItem value="Asia/Dubai">Asia/Dubai (UTC+04:00)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security
            </CardTitle>
            <CardDescription>Manage your account security settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline">Change Password</Button>
            <Button variant="outline">Enable Two-Factor Authentication</Button>
            <Button variant="outline">Download Account Data</Button>
            <Separator />
            <Button variant="destructive" className="w-full">
              Delete Account
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
