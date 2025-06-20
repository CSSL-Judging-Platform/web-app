"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DashboardLayout } from "@/components/layout/sidebar"
import { supabase } from "@/lib/supabase"
import { getCurrentUser } from "@/lib/auth"
import { BarChart3, Download, FileSpreadsheet, TrendingUp, Users } from "lucide-react"

interface EventReport {
  id: string
  name: string
  status: string
  total_contestants: number
  total_judges: number
  completed_submissions: number
  average_score: number
}

interface ContestantScore {
  contestant_name: string
  contestant_email: string
  total_score: number
  average_score: number
  judge_count: number
  rank: number
}

export default function ReportsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState("")
  const [events, setEvents] = useState<EventReport[]>([])
  const [contestantScores, setContestantScores] = useState<ContestantScore[]>([])
  const [reportType, setReportType] = useState("overview")

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (selectedEvent && reportType === "scores") {
      loadContestantScores()
    }
  }, [selectedEvent, reportType])

  const loadData = async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)

      if (!currentUser || (currentUser.role !== "admin" && currentUser.role !== "judge")) {
        return
      }

      await loadEventReports()
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadEventReports = async () => {
    const { data: eventsData, error } = await supabase.from("small_events").select(`
        id,
        name,
        status,
        contestants!inner(id),
        judge_assignments!inner(id),
        judge_submissions(id, is_final)
      `)

    if (error) {
      console.error("Error loading events:", error)
      return
    }

    const reports: EventReport[] = await Promise.all(
      eventsData.map(async (event: any) => {
        // Get average scores for this event
        const { data: scoresData } = await supabase
          .from("scores")
          .select("score")
          .in(
            "contestant_id",
            event.contestants.map((c: any) => c.id),
          )
          .eq("is_draft", false)

        const totalScore = scoresData?.reduce((sum, score) => sum + Number(score.score), 0) || 0
        const averageScore = scoresData?.length ? totalScore / scoresData.length : 0

        return {
          id: event.id,
          name: event.name,
          status: event.status,
          total_contestants: event.contestants.length,
          total_judges: event.judge_assignments.length,
          completed_submissions: event.judge_submissions.filter((s: any) => s.is_final).length,
          average_score: Math.round(averageScore * 100) / 100,
        }
      }),
    )

    setEvents(reports)
  }

  const loadContestantScores = async () => {
    if (!selectedEvent) return

    const { data: contestantsData, error } = await supabase
      .from("contestants")
      .select(`
        id,
        contestant_name,
        contestant_email,
        scores!inner(score, is_draft)
      `)
      .eq("small_event_id", selectedEvent)

    if (error) {
      console.error("Error loading contestant scores:", error)
      return
    }

    const scores: ContestantScore[] = contestantsData
      .map((contestant: any) => {
        const finalScores = contestant.scores.filter((s: any) => !s.is_draft)
        const totalScore = finalScores.reduce((sum: number, score: any) => sum + Number(score.score), 0)
        const averageScore = finalScores.length ? totalScore / finalScores.length : 0

        return {
          contestant_name: contestant.contestant_name,
          contestant_email: contestant.contestant_email,
          total_score: Math.round(totalScore * 100) / 100,
          average_score: Math.round(averageScore * 100) / 100,
          judge_count: finalScores.length,
          rank: 0, // Will be set after sorting
        }
      })
      .sort((a, b) => b.average_score - a.average_score)
      .map((contestant, index) => ({
        ...contestant,
        rank: index + 1,
      }))

    setContestantScores(scores)
  }

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return

    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(","),
      ...data.map((row) => headers.map((header) => `"${row[header]}"`).join(",")),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${filename}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <DashboardLayout userRole={user?.role}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!user || (user.role !== "admin" && user.role !== "judge")) {
    return (
      <DashboardLayout userRole={user?.role}>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Access denied. Reports are only available to admins and judges.
              </p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole={user?.role}>
      <div className="space-y-6">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Reports & Analytics</h2>
            <p className="text-muted-foreground">View detailed reports and export data</p>
          </div>

          <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overview">Event Overview</SelectItem>
                <SelectItem value="scores">Contestant Scores</SelectItem>
              </SelectContent>
            </Select>

            {reportType === "scores" && (
              <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Select event" />
                </SelectTrigger>
                <SelectContent>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {reportType === "overview" && (
          <div className="space-y-6">
            <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{events.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Contestants</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {events.reduce((sum, event) => sum + event.total_contestants, 0)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {events.length > 0
                      ? Math.round(
                          (events.reduce((sum, event) => sum + event.average_score, 0) / events.length) * 100,
                        ) / 100
                      : 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                  <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {events.reduce((sum, event) => sum + event.completed_submissions, 0)}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Event Overview</CardTitle>
                  <CardDescription>Summary of all events and their progress</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => exportToCSV(events, "event-overview")}>
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Contestants</TableHead>
                      <TableHead className="text-right">Judges</TableHead>
                      <TableHead className="text-right">Completed</TableHead>
                      <TableHead className="text-right">Avg Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell className="font-medium">{event.name}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              event.status === "active"
                                ? "default"
                                : event.status === "completed"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {event.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{event.total_contestants}</TableCell>
                        <TableCell className="text-right">{event.total_judges}</TableCell>
                        <TableCell className="text-right">{event.completed_submissions}</TableCell>
                        <TableCell className="text-right">{event.average_score}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {reportType === "scores" && selectedEvent && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Contestant Scores</CardTitle>
                <CardDescription>
                  Detailed scoring results for {events.find((e) => e.id === selectedEvent)?.name}
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => exportToCSV(contestantScores, "contestant-scores")}>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">Rank</TableHead>
                    <TableHead>Contestant Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Total Score</TableHead>
                    <TableHead className="text-right">Average Score</TableHead>
                    <TableHead className="text-right">Judges</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contestantScores.map((contestant) => (
                    <TableRow key={contestant.contestant_email}>
                      <TableCell className="font-medium">#{contestant.rank}</TableCell>
                      <TableCell>{contestant.contestant_name}</TableCell>
                      <TableCell>{contestant.contestant_email}</TableCell>
                      <TableCell className="text-right">{contestant.total_score}</TableCell>
                      <TableCell className="text-right">{contestant.average_score}</TableCell>
                      <TableCell className="text-right">{contestant.judge_count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {reportType === "scores" && !selectedEvent && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Select an Event</h3>
              <p className="text-muted-foreground text-center">
                Choose an event from the dropdown above to view contestant scores
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
