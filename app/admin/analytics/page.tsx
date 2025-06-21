"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { DashboardLayout } from "@/components/layout/sidebar"
import { useAuth } from "@/lib/auth"
import { analyticsApi } from "@/lib/api"
import { TrendingUp, Users, Trophy, Target, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AnalyticsData {
  overview: {
    totalCompetitions: number
    activeCompetitions: number
    totalJudges: number
    totalContestants: number
    averageScore: number
  }
  competitionStats: Array<{
    competition_id: string
    name: string
    participants: number
    judges: number
    completion_rate: number
  }>
  judgePerformance: Array<{
    judge_id: string
    name: string
    assigned_competitions: number
    completed_evaluations: number
    consistency_score: number
    average_time_per_evaluation: number
  }>
  monthlyTrends: Array<{
    month: string
    competitions: number
    participants: number
  }>
}

export default function AnalyticsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    overview: {
      totalCompetitions: 0,
      activeCompetitions: 0,
      totalJudges: 0,
      totalContestants: 0,
      averageScore: 0,
    },
    competitionStats: [],
    judgePerformance: [],
    monthlyTrends: [],
  })
  const { toast } = useToast()

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      const [overview, competitionStats, judgePerformance, monthlyTrends] = await Promise.all([
        analyticsApi.getOverview(),
        analyticsApi.getCompetitionStats(),
        analyticsApi.getJudgePerformance(),
        analyticsApi.getMonthlyTrends(),
      ])

      setAnalytics({
        overview,
        competitionStats,
        judgePerformance,
        monthlyTrends,
      })
    } catch (error) {
      console.error("Error loading analytics:", error)
      toast({
        title: "Error",
        description: "Failed to load analytics data.",
        variant: "destructive",
      })
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
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Competitions</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{analytics.overview.totalCompetitions}</div>
              <p className="text-xs text-muted-foreground">{analytics.overview.activeCompetitions} active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Judges</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{analytics.overview.totalJudges}</div>
              <p className="text-xs text-muted-foreground">Registered judges</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Contestants</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{analytics.overview.totalContestants}</div>
              <p className="text-xs text-muted-foreground">Participants</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{analytics.overview.averageScore}%</div>
              <p className="text-xs text-muted-foreground">Across all competitions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {analytics.competitionStats.length > 0
                  ? Math.round(
                      analytics.competitionStats.reduce((sum, c) => sum + c.completion_rate, 0) /
                        analytics.competitionStats.length,
                    )
                  : 0}
                %
              </div>
              <p className="text-xs text-muted-foreground">Average completion</p>
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
                        {competition.participants} participants • {competition.judges} judges
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
              {analytics.competitionStats.length === 0 && (
                <p className="text-sm text-muted-foreground">No competition data available</p>
              )}
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
              {analytics.judgePerformance.length === 0 && (
                <p className="text-sm text-muted-foreground">No judge performance data available</p>
              )}
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
              {analytics.monthlyTrends.map((month) => (
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
                {analytics.competitionStats.length > 0 ? (
                  <>
                    <p className="text-2xl font-bold text-primary">
                      {
                        analytics.competitionStats.reduce((prev, current) =>
                          prev.completion_rate > current.completion_rate ? prev : current,
                        ).name
                      }
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {Math.max(...analytics.competitionStats.map((c) => c.completion_rate))}% completion rate
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">No data available</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Most Active Judge</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analytics.judgePerformance.length > 0 ? (
                  <>
                    <p className="text-2xl font-bold text-primary">
                      {
                        analytics.judgePerformance.reduce((prev, current) =>
                          prev.completed_evaluations > current.completed_evaluations ? prev : current,
                        ).name
                      }
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {Math.max(...analytics.judgePerformance.map((j) => j.completed_evaluations))} evaluations
                      completed
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">No data available</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Participation Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-green-600">
                  {analytics.overview.totalContestants > 0 ? "+100%" : "0%"}
                </p>
                <p className="text-sm text-muted-foreground">Growth this period</p>
                <p className="text-sm text-muted-foreground">
                  {analytics.overview.totalContestants} total participants
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
