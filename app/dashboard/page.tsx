"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Trophy, Users, BarChart3, Plus, Eye, TrendingUp, FileSpreadsheet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DashboardLayout } from "@/components/layout/sidebar"
import { useAuth } from "@/lib/auth"
import { dashboardApi } from "@/lib/api"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface DashboardStats {
  totalBigEvents: number
  totalCompetitions: number
  totalJudges: number
  totalContestants: number
  activeCompetitions: number
}

interface JudgeStats {
  assignedEvents: number
  judgingProgress: number
  pendingReviews: number
}

interface ContestantStats {
  registeredEvents: number
  judgingStatus: string
  averageScore: string
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [judgeStats, setJudgeStats] = useState<JudgeStats | null>(null)
  const [contestantStats, setContestantStats] = useState<ContestantStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true)
        setError(null)
        
        if (!user) {
          throw new Error("User not authenticated")
        }

        if (user.role === "admin") {
          const [dashboardStats, activity] = await Promise.all([
            dashboardApi.getStats(),
            dashboardApi.getRecentActivity()
          ])
          setStats(dashboardStats)
          setRecentActivity(activity)
        } else if (user.role === "judge") {
          const stats = await dashboardApi.getJudgeStats(user.id)
          setJudgeStats(stats)
        } else {
          const stats = await dashboardApi.getContestantStats(user.id)
          setContestantStats(stats)
        }
      } catch (err) {
        console.error("Error loading dashboard:", err)
        setError("Failed to load dashboard data. Please try again.")
        toast({
          title: "Error",
          description: "Failed to load dashboard data.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadDashboard()
    }
  }, [user, toast])

  const filteredActivities = useMemo(() => {
    return recentActivity.filter((activity) =>
      activity.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [recentActivity, searchTerm]);

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

  if (error) {
    return (
      <DashboardLayout userRole={user?.role} user={user}>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Error Loading Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-destructive">{error}</p>
              <Button 
                className="mt-4 w-full"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
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

      {stats && (
        <>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Big Events</CardTitle>
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalBigEvents ? stats.totalBigEvents : 1}</div>
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
                    {stats.activeCompetitions} active
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
                <div className="flex flex-col space-y-2 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
                  <CardTitle>Recent Activity</CardTitle>
                  <div className="relative w-full sm:w-64">
                    <input
                      type="text"
                      placeholder="Search activities..."
                      className="w-full pl-8 pr-4 py-2 rounded-md border border-input bg-background text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value)
                      }}
                    />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 absolute left-3 top-3 text-muted-foreground"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {filteredActivities.length > 0 ? (
                    <>
                      {filteredActivities.map((activity) => (
                        <div key={activity.id} className="flex items-start space-x-4 group">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0 group-hover:bg-primary transition-colors"></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium leading-none group-hover:text-primary transition-colors">
                              {activity.title}
                            </p>
                            <p className="text-sm text-muted-foreground truncate">
                              {activity.description}
                            </p>
                          </div>
                          <div className="text-xs text-muted-foreground flex-shrink-0">
                            {new Date(activity.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 text-muted-foreground mb-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p className="text-muted-foreground">No activities found matching your search</p>
                    </div>
                  )}
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
        </>
      )}
    </div>
  )

  const JudgeDashboard = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Judge Dashboard</h2>
        <p className="text-muted-foreground">Welcome back, {user?.full_name}! Here are your assigned events and judging progress.</p>
      </div>

      {judgeStats && (
        <>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Assigned Events</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{judgeStats.assignedEvents}</div>
                <p className="text-xs text-muted-foreground">Active competitions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Judging Progress</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{judgeStats.judgingProgress}%</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${judgeStats.judgingProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Completed submissions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{judgeStats.pendingReviews}</div>
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
              {/* <Button
                variant="ghost"
                className="w-full justify-start h-auto p-3"
                onClick={() => handleQuickAction("view-reports", "View Reports")}
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium">View Reports</div>
                  <div className="text-xs text-muted-foreground">Check judging reports</div>
                </div>
              </Button> */}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )

  const ContestantDashboard = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Contestant Dashboard</h2>
        <p className="text-muted-foreground">Welcome back, {user?.name}! Track your participation and results.</p>
      </div>

      {contestantStats && (
        <>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Registered Events</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{contestantStats.registeredEvents}</div>
                <p className="text-xs text-muted-foreground">Active competitions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Judging Status</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">{contestantStats.judgingStatus.toLowerCase()}</div>
                <Badge 
                  variant={
                    contestantStats.judgingStatus === 'Completed' ? 'default' : 
                    contestantStats.judgingStatus === 'In Progress' ? 'secondary' : 'outline'
                  }
                  className="mt-1"
                >
                  {contestantStats.judgingStatus}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{contestantStats.averageScore}</div>
                <div className="flex items-center mt-1">
                  {parseFloat(contestantStats.averageScore) > 85 ? (
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  ) : parseFloat(contestantStats.averageScore) > 70 ? (
                    <TrendingUp className="h-4 w-4 text-yellow-500 mr-1" />
                  ) : (
                    <TrendingUp className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className="text-xs text-muted-foreground">
                    {parseFloat(contestantStats.averageScore) > 85 ? 'Excellent' : 
                     parseFloat(contestantStats.averageScore) > 70 ? 'Good' : 'Needs improvement'}
                  </span>
                </div>
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
        </>
      )}
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