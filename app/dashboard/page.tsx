"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Trophy, Users, BarChart3, Plus, Eye, TrendingUp, FileSpreadsheet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DashboardLayout } from "@/components/layout/sidebar"
import { getCurrentUser } from "@/lib/auth"
import { mockData } from "@/lib/mock-data"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface DashboardStats {
  totalBigEvents: number
  totalCompetitions: number
  totalJudges: number
  totalContestants: number
  activeEvents: number
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<DashboardStats>({
    totalBigEvents: 0,
    totalCompetitions: 0,
    totalJudges: 0,
    totalContestants: 0,
    activeEvents: 0,
  })
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    async function loadDashboard() {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)

        if (currentUser?.role === "admin") {
          // Load admin stats from mock data
          setStats({
            totalBigEvents: mockData.bigEvents?.length || 0,
            totalCompetitions: mockData.competitions?.length || 0,
            totalJudges: mockData.judges?.length || 0,
            totalContestants: mockData.contestants?.length || 0,
            activeEvents: mockData.competitions?.filter((c) => c.status === "active").length || 0,
          })
        }
      } catch (error) {
        console.error("Error loading dashboard:", error)
        toast({
          title: "Error",
          description: "Failed to load dashboard data.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [toast])

  const handleQuickAction = (action: string, title: string) => {
    toast({
      title: `${title}`,
      description: `Navigating to ${title.toLowerCase()}...`,
    })

    switch (action) {
      case "create-event":
        router.push("/admin/big-events")
        break
      case "add-judge":
        router.push("/admin/judges")
        break
      case "upload-contestants":
        router.push("/admin/bulk-upload")
        break
      case "view-analytics":
        router.push("/admin/analytics")
        break
      case "start-judging":
        router.push("/judge/judging")
        break
      case "view-events":
        router.push("/judge/events")
        break
      case "view-reports":
        router.push("/judge/reports")
        break
      case "my-events":
        router.push("/contestant/events")
        break
      case "my-results":
        router.push("/contestant/results")
        break
      default:
        break
    }
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

  const AdminDashboard = () => (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Welcome back! Here's an overview of your judging portal.</p>
        </div>
        <Button className="w-full md:w-auto" onClick={() => handleQuickAction("create-event", "Create New Event")}>
          <Plus className="mr-2 h-4 w-4" />
          Quick Actions
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Big Events</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBigEvents}</div>
            <p className="text-xs text-muted-foreground">Total conferences and summits</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Competitions</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCompetitions}</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Badge variant="secondary" className="text-xs">
                {stats.activeEvents} active
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Judges</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalJudges}</div>
            <p className="text-xs text-muted-foreground">Registered judges</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contestants</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalContestants}</div>
            <p className="text-xs text-muted-foreground">Total participants</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockData.analytics?.recentActivity?.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-4">
                  <div className={`w-2 h-2 bg-${activity.color}-500 rounded-full mt-2 flex-shrink-0`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-none">{activity.message}</p>
                    <p className="text-sm text-muted-foreground truncate">{activity.details}</p>
                  </div>
                  <div className="text-xs text-muted-foreground flex-shrink-0">{activity.timestamp}</div>
                </div>
              )) || <p className="text-sm text-muted-foreground">No recent activity</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks you might want to perform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start h-auto p-3"
              onClick={() => handleQuickAction("create-event", "Create New Event")}
            >
              <Plus className="mr-2 h-4 w-4" />
              <div className="text-left">
                <div className="font-medium">Create New Event</div>
                <div className="text-xs text-muted-foreground">Set up a new competition</div>
              </div>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start h-auto p-3"
              onClick={() => handleQuickAction("add-judge", "Add Judge")}
            >
              <Users className="mr-2 h-4 w-4" />
              <div className="text-left">
                <div className="font-medium">Add Judge</div>
                <div className="text-xs text-muted-foreground">Invite a new judge</div>
              </div>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start h-auto p-3"
              onClick={() => handleQuickAction("upload-contestants", "Upload Contestants")}
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              <div className="text-left">
                <div className="font-medium">Upload Contestants</div>
                <div className="text-xs text-muted-foreground">Bulk import participants</div>
              </div>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start h-auto p-3"
              onClick={() => handleQuickAction("view-analytics", "View Analytics")}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              <div className="text-left">
                <div className="font-medium">View Analytics</div>
                <div className="text-xs text-muted-foreground">Check performance metrics</div>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const JudgeDashboard = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Judge Dashboard</h2>
        <p className="text-muted-foreground">Welcome back! Here are your assigned events and judging progress.</p>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned Events</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Active competitions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Judging Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">75%</div>
            <p className="text-xs text-muted-foreground">Completed submissions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">Contestants to judge</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks for judges</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start h-auto p-3"
            onClick={() => handleQuickAction("start-judging", "Start Judging")}
          >
            <Trophy className="mr-2 h-4 w-4" />
            <div className="text-left">
              <div className="font-medium">Start Judging</div>
              <div className="text-xs text-muted-foreground">Begin evaluating contestants</div>
            </div>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start h-auto p-3"
            onClick={() => handleQuickAction("view-events", "View My Events")}
          >
            <Eye className="mr-2 h-4 w-4" />
            <div className="text-left">
              <div className="font-medium">View My Events</div>
              <div className="text-xs text-muted-foreground">See assigned competitions</div>
            </div>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start h-auto p-3"
            onClick={() => handleQuickAction("view-reports", "View Reports")}
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            <div className="text-left">
              <div className="font-medium">View Reports</div>
              <div className="text-xs text-muted-foreground">Check judging reports</div>
            </div>
          </Button>
        </CardContent>
      </Card>
    </div>
  )

  const ContestantDashboard = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Contestant Dashboard</h2>
        <p className="text-muted-foreground">Track your participation and results across competitions.</p>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registered Events</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">Active competitions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Judging Status</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">In Progress</div>
            <p className="text-xs text-muted-foreground">Current status</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85.5</div>
            <p className="text-xs text-muted-foreground">Across all events</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks for contestants</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start h-auto p-3"
            onClick={() => handleQuickAction("my-events", "My Events")}
          >
            <Trophy className="mr-2 h-4 w-4" />
            <div className="text-left">
              <div className="font-medium">My Events</div>
              <div className="text-xs text-muted-foreground">View registered competitions</div>
            </div>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start h-auto p-3"
            onClick={() => handleQuickAction("my-results", "My Results")}
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            <div className="text-left">
              <div className="font-medium">My Results</div>
              <div className="text-xs text-muted-foreground">Check competition results</div>
            </div>
          </Button>
        </CardContent>
      </Card>
    </div>
  )

  const renderDashboard = () => {
    switch (user?.role) {
      case "admin":
        return <AdminDashboard />
      case "judge":
        return <JudgeDashboard />
      default:
        return <ContestantDashboard />
    }
  }

  return (
    <DashboardLayout userRole={user?.role} user={user}>
      {renderDashboard()}
    </DashboardLayout>
  )
}
