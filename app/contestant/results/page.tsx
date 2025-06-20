"use client"

import { useState, useEffect } from "react"
import { Trophy, Medal, Star, TrendingUp, Award } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { DashboardLayout } from "@/components/layout/sidebar"
import { getCurrentUser } from "@/lib/auth"
import { mockData } from "@/lib/mock-data"

interface ContestantResult {
  id: string
  competition_name: string
  big_event_name: string
  status: "judged" | "submitted" | "in_progress"
  total_score: number
  max_score: number
  percentage: number
  rank: number
  total_participants: number
  criteria_scores: Array<{
    name: string
    score: number
    max_score: number
    feedback?: string
  }>
  submitted_at: string
}

export default function ContestantResultsPage() {
  const [user, setUser] = useState<any>(null)
  const [results, setResults] = useState<ContestantResult[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadResults()
  }, [])

  const loadResults = async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)

      // Get contestant's results
      const contestantData = mockData.contestants.filter((c) => c.contestant_email === currentUser?.email)

      const mockResults: ContestantResult[] = contestantData.map((contestant) => {
        const competition = mockData.competitions.find((comp) => comp.id === contestant.competition_id)
        const bigEvent = mockData.bigEvents.find((event) => event.id === competition?.big_event_id)
        const criteria = mockData.judgingCriteria[contestant.competition_id] || []

        // Mock criteria scores
        const criteriaScores = criteria.map((criterion) => ({
          name: criterion.name,
          score: Math.floor(Math.random() * criterion.max_points * 0.8) + criterion.max_points * 0.2,
          max_score: criterion.max_points,
          feedback: `Good work on ${criterion.name.toLowerCase()}. Consider improving...`,
        }))

        const totalScore = criteriaScores.reduce((sum, score) => sum + score.score, 0)
        const maxScore = criteriaScores.reduce((sum, score) => sum + score.max_score, 0)

        return {
          id: contestant.id,
          competition_name: competition?.name || "",
          big_event_name: bigEvent?.name || "",
          status: contestant.status as any,
          total_score: totalScore,
          max_score: maxScore,
          percentage: maxScore > 0 ? (totalScore / maxScore) * 100 : 0,
          rank: contestant.rank || 0,
          total_participants: competition?.contestants_count || 0,
          criteria_scores: criteriaScores,
          submitted_at: contestant.registered_at,
        }
      })

      setResults(mockResults)
    } catch (error) {
      console.error("Error loading results:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "judged":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "submitted":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "in_progress":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return <Star className="h-5 w-5 text-muted-foreground" />
    }
  }

  const getOverallStats = () => {
    const judgedResults = results.filter((r) => r.status === "judged")
    if (judgedResults.length === 0) return null

    const avgPercentage = judgedResults.reduce((sum, r) => sum + r.percentage, 0) / judgedResults.length
    const bestRank = Math.min(...judgedResults.map((r) => r.rank).filter((r) => r > 0))
    const totalCompetitions = results.length

    return {
      avgPercentage,
      bestRank,
      totalCompetitions,
      completedCompetitions: judgedResults.length,
    }
  }

  const stats = getOverallStats()

  if (loading) {
    return (
      <DashboardLayout userRole="contestant" user={user}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="contestant" user={user}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">My Results</h2>
          <p className="text-muted-foreground">Track your performance across competitions</p>
        </div>

        {/* Overall Stats */}
        {stats && (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Competitions</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{stats.totalCompetitions}</div>
                <p className="text-xs text-muted-foreground">{stats.completedCompetitions} completed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Best Rank</CardTitle>
                <Medal className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">#{stats.bestRank}</div>
                <p className="text-xs text-muted-foreground">Highest achievement</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{stats.avgPercentage.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">Across all competitions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {((stats.completedCompetitions / stats.totalCompetitions) * 100).toFixed(0)}%
                </div>
                <p className="text-xs text-muted-foreground">Competitions finished</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Results Cards */}
        <div className="space-y-6">
          {results.map((result) => (
            <Card key={result.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {result.rank > 0 && getRankIcon(result.rank)}
                      {result.competition_name}
                    </CardTitle>
                    <CardDescription className="mt-1">{result.big_event_name}</CardDescription>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <Badge className={`${getStatusColor(result.status)} flex-shrink-0`}>
                      {result.status === "judged" ? "Completed" : result.status}
                    </Badge>
                    {result.rank > 0 && (
                      <Badge variant="outline" className="text-xs">
                        Rank #{result.rank} of {result.total_participants}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.status === "judged" && (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Overall Score</span>
                        <span className="font-medium">
                          {result.total_score} / {result.max_score} ({result.percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <Progress value={result.percentage} className="h-2" />
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium text-sm">Detailed Scores</h4>
                      <div className="space-y-2">
                        {result.criteria_scores.map((criteria, index) => (
                          <div key={index} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>{criteria.name}</span>
                              <span>
                                {criteria.score} / {criteria.max_score}
                              </span>
                            </div>
                            <Progress value={(criteria.score / criteria.max_score) * 100} className="h-1" />
                            {criteria.feedback && (
                              <p className="text-xs text-muted-foreground italic">{criteria.feedback}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {result.status === "submitted" && (
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-blue-700 dark:text-blue-300 font-medium">
                      Your submission is being evaluated by judges
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      Results will be available once judging is complete
                    </p>
                  </div>
                )}

                {result.status === "in_progress" && (
                  <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <p className="text-yellow-700 dark:text-yellow-300 font-medium">Competition in progress</p>
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                      Submit your work before the deadline
                    </p>
                  </div>
                )}

                <div className="text-xs text-muted-foreground">
                  Submitted: {new Date(result.submitted_at).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {results.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No results yet</h3>
              <p className="text-muted-foreground text-center">
                You haven't participated in any competitions yet. Register for competitions to see your results here.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
