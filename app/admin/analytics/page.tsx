"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { DashboardLayout } from "@/components/layout/sidebar"
import { getCurrentUser } from "@/lib/auth"
import { mockData } from "@/lib/mock-data"
import { TrendingUp, Users, Trophy, Target, Clock } from "lucide-react"

export default function AnalyticsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState(mockData.analytics)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
      // In real app, load analytics from API
      setAnalytics(mockData.analytics)
    } catch (error) {
      console.error("Error loading analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout userRole="admin" user={user}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="admin" user={user}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Comprehensive insights into your judging portal performance</p>
        </div>

        {/* Overview Stats */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Competitions</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{analytics.overview.totalCompetitions}</div>
              <p className="text-xs text-muted-foreground">+2 from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Judges</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{analytics.overview.totalJudges}</div>
              <p className="text-xs text-muted-foreground">100% participation rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Contestants</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{analytics.overview.totalContestants}</div>
              <p className="text-xs text-muted-foreground">+12 new registrations</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{analytics.overview.averageScore}%</div>
              <p className="text-xs text-muted-foreground">+2.3% from last period</p>
            </CardContent>
          </Card>
        </div>

        {/* Competition Performance */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Competition Performance</CardTitle>
              <CardDescription>Participation and completion rates by competition</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {analytics.competitionStats.map((competition) => (
                <div key={competition.competition_id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{competition.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {competition.participants} participants • {competition.completed} completed
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={competition.completion_rate === 100 ? "default" : "secondary"}>
                        {competition.completion_rate}%
                      </Badge>
                    </div>
                  </div>
                  <Progress value={competition.completion_rate} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Judge Performance</CardTitle>
              <CardDescription>Evaluation efficiency and consistency metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {analytics.judgePerformance.map((judge) => (
                <div key={judge.judge_id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{judge.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {judge.completed_evaluations} evaluations completed
                      </p>
                    </div>
                    <Badge variant="outline">{judge.consistency_score}% consistent</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{judge.average_time_per_evaluation} min avg</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Trophy className="h-4 w-4 text-muted-foreground" />
                      <span>{judge.assigned_competitions} competitions</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Trends</CardTitle>
            <CardDescription>Competition and participation growth over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.monthlyTrends.map((month, index) => (
                <div key={month.month} className="flex items-center space-x-4">
                  <div className="w-12 text-sm font-medium">{month.month}</div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Competitions</span>
                      <span>{month.competitions}</span>
                    </div>
                    <Progress value={(month.competitions / 5) * 100} className="h-2" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Participants</span>
                      <span>{month.participants}</span>
                    </div>
                    <Progress value={(month.participants / 50) * 100} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Key Insights */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top Performing Competition</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-primary">Best Undergraduate Project</p>
                <p className="text-sm text-muted-foreground">100% completion rate</p>
                <p className="text-sm text-muted-foreground">Average score: 84.9%</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Most Active Judge</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-primary">Dr. Sarah Johnson</p>
                <p className="text-sm text-muted-foreground">25 evaluations completed</p>
                <p className="text-sm text-muted-foreground">92% consistency score</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Participation Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-green-600">+180%</p>
                <p className="text-sm text-muted-foreground">From last quarter</p>
                <p className="text-sm text-muted-foreground">42 total participants</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
