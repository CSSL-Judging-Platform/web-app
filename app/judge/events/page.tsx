"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, Users, Trophy, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { DashboardLayout } from "@/components/layout/sidebar"
import { getCurrentUser } from "@/lib/auth"
import { mockData } from "@/lib/mock-data"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { judgesApi } from "@/lib/api"
import { supabase } from "@/lib/supabase"

interface JudgeEvent {
  id: string
  name: string
  description: string
  start_date: string
  end_date: string
  status: "upcoming" | "active" | "completed"
  contestants_count: number
  my_progress: number
  total_criteria: number
  completed_submissions: number
  big_event_name: string
}

export default function JudgeEventsPage() {
  const [user, setUser] = useState<any>(null)
  const [events, setEvents] = useState<JudgeEvent[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)

      if (!currentUser?.id) {
        throw new Error("User not authenticated")
      }

      const { data: judge, error: judgeError } = await supabase
        .from('judges')
        .select('id')
        .eq('profile_id', currentUser.id)
        .single();

      // Get judge's assigned competitions
      const assignedCompetitions = await judgesApi.getAssignments(judge.id)

      // Transform data to match our interface
      const formattedEvents = await Promise.all(
        assignedCompetitions.map(async (assignment: any) => {
          const competition = assignment.competition
          const contestants = await judgesApi.getContestants(competition.id)
          const criteria = await judgesApi.getJudgingCriteria(competition.id)
          
          // Get judge's completed submissions
          const judgeScores = await judgesApi.getScoresForJudge(judge.id)
          const completedSubmissions = contestants.filter(contestant => 
            judgeScores.some(score => score.contestant_id === contestant.id && !score.is_draft)
          ).length

          return {
            id: competition.id,
            name: competition.name,
            description: competition.description,
            start_date: competition.start_date,
            end_date: competition.end_date,
            status: getCompetitionStatus(competition.start_date, competition.end_date),
            contestants_count: contestants.length,
            my_progress: contestants.length > 0 
              ? Math.round((completedSubmissions / contestants.length) * 100)
              : 0,
            total_criteria: criteria.length,
            completed_submissions: completedSubmissions,
            big_event_name: competition.big_event?.name || "N/A"
          }
        })
      )

      setEvents(formattedEvents)
    } catch (error) {
      console.error("Error loading events:", error)
      toast({
        title: "Error",
        description: "Failed to load events. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getCompetitionStatus = (startDate: string, endDate: string): "upcoming" | "active" | "completed" => {
    const now = new Date()
    const start = new Date(startDate)
    const end = new Date(endDate)

    if (now < start) return "upcoming"
    if (now > end) return "completed"
    return "active"
  }

  const handleStartJudging = (eventId: string, eventName: string) => {
    toast({
      title: "Starting Judging Session",
      description: `Navigating to judging interface for ${eventName}`,
    })
    router.push(`/judge/judging?event=${eventId}`)
  }

  const handleViewDetails = (eventId: string, eventName: string) => {
    toast({
      title: "Viewing Event Details",
      description: `Loading details for ${eventName}`,
    })
    router.push(`/judge/judging?event=${eventId}&mode=view`)
  }

  const handleViewResults = (eventId: string, eventName: string) => {
    toast({
      title: "Viewing Results",
      description: `Loading results for ${eventName}`,
    })
    router.push(`/judge/reports?event=${eventId}`)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "upcoming":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "completed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
    }
  }

  if (loading) {
    return (
      <DashboardLayout userRole="judge" user={user}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="judge" user={user}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">My Events</h2>
          <p className="text-muted-foreground">Competitions you're assigned to judge and your progress</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{events.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Events</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {events.filter((e) => e.status === "active").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Contestants</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {events.reduce((sum, event) => sum + event.contestants_count, 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {events.reduce((sum, event) => sum + event.completed_submissions, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Events Grid */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          {events.map((event) => (
            <Card key={event.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-lg">{event.name}</CardTitle>
                    <CardDescription className="mt-1">{event.big_event_name}</CardDescription>
                  </div>
                  <Badge className={`${getStatusColor(event.status)} ml-2 flex-shrink-0`}>{event.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>

                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="mr-1 h-4 w-4" />
                    {new Date(event.start_date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <Users className="mr-1 h-4 w-4" />
                    {event.contestants_count} contestants
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Judging Progress</span>
                    <span>{event.my_progress}%</span>
                  </div>
                  <Progress value={event.my_progress} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {event.completed_submissions} of {event.contestants_count} contestants judged
                  </p>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <div className="text-sm text-muted-foreground">{event.total_criteria} criteria to evaluate</div>
                  <Button
                    size="sm"
                    variant={event.status === "active" ? "default" : "outline"}
                    disabled={event.status === "completed"}
                    onClick={() => {
                      if (event.status === "active") {
                        handleStartJudging(event.id, event.name)
                      } else if (event.status === "upcoming") {
                        handleViewDetails(event.id, event.name)
                      } else {
                        handleViewResults(event.id, event.name)
                      }
                    }}
                  >
                    {event.status === "active" ? (
                      <>
                        <Trophy className="mr-2 h-4 w-4" />
                        Start Judging
                      </>
                    ) : event.status === "upcoming" ? (
                      <>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </>
                    ) : (
                      <>
                        <Eye className="mr-2 h-4 w-4" />
                        View Results
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {events.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No events assigned</h3>
              <p className="text-muted-foreground text-center">
                You haven't been assigned to any competitions yet. Contact an administrator to get assigned to
                competitions.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
