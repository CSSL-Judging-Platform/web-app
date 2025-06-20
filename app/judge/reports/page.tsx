"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DashboardLayout } from "@/components/layout/sidebar"
import { mockData } from "@/lib/mock-data"
import { getCurrentUser } from "@/lib/auth"
import { BarChart3, Download, FileSpreadsheet, TrendingUp, Trophy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface JudgeEventReport {
  id: string
  name: string
  status: string
  total_contestants: number
  my_submissions: number
  completion_rate: number
}

interface MyScoring {
  contestant_name: string
  contestant_email: string
  my_score: number
  my_feedback: string
  is_draft: boolean
  submitted_at: string
}

export default function JudgeReportsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState("")
  const [events, setEvents] = useState<JudgeEventReport[]>([])
  const [myScores, setMyScores] = useState<MyScoring[]>([])
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (selectedEvent) {
      loadMyScores()
    }
  }, [selectedEvent])

  const loadData = async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)

      if (!currentUser || currentUser.role !== "judge") {
        return
      }

      await loadMyEvents()
    } catch (error) {
      console.error("Error loading data:", error)
      toast({
        title: "Error",
        description: "Failed to load reports data.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadMyEvents = async () => {
    if (!user) return

    // Get judge's assigned competitions from mock data
    const judgeAssignments = mockData.judgeAssignments?.filter((assignment) => assignment.judge_id === user.id) || []

    const reports: JudgeEventReport[] = judgeAssignments
      .map((assignment) => {
        const competition = mockData.competitions?.find((c) => c.id === assignment.competition_id)
        const contestants = mockData.contestants?.filter((c) => c.competition_id === assignment.competition_id) || []

        // Mock completion data
        const completedSubmissions = Math.floor(contestants.length * 0.75) // 75% completion rate
        const completionRate = contestants.length > 0 ? (completedSubmissions / contestants.length) * 100 : 0

        return {
          id: competition?.id || "",
          name: competition?.name || "",
          status: competition?.status || "active",
          total_contestants: contestants.length,
          my_submissions: completedSubmissions,
          completion_rate: Math.round(completionRate),
        }
      })
      .filter((report) => report.id)

    setEvents(reports)
  }

  const loadMyScores = async () => {
    if (!selectedEvent || !user) return

    // Mock scoring data for the selected event
    const contestants = mockData.contestants?.filter((c) => c.competition_id === selectedEvent) || []

    const scores: MyScoring[] = contestants.map((contestant, index) => ({
      contestant_name: contestant.contestant_name,
      contestant_email: contestant.contestant_email,
      my_score: Math.floor(Math.random() * 40) + 60, // Random score between 60-100
      my_feedback: `Good work on the project. ${index % 2 === 0 ? "Consider improving the technical implementation." : "Excellent presentation and clear explanation."}`,
      is_draft: index % 3 === 0, // Every 3rd score is a draft
      submitted_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    }))

    setMyScores(scores)
  }

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      toast({
        title: "No Data",
        description: "No data available to export.",
        variant: "destructive",
      })
      return
    }

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

    toast({
      title: "Export Successful",
      description: `${filename}.csv has been downloaded.`,
    })
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

  if (!user || user.role !== "judge") {
    return (
      <DashboardLayout userRole={user?.role} user={user}>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Access denied. This page is only available to judges.</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="judge" user={user}>
      <div className="space-y-6">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">My Judging Reports</h2>
            <p className="text-muted-foreground">View your judging progress and scores</p>
          </div>

          {events.length > 0 && (
            <Select value={selectedEvent} onValueChange={setSelectedEvent}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Select event to view scores" />
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

        <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assigned Events</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{events.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Contestants</CardTitle>
              <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {events.reduce((sum, event) => sum + event.total_contestants, 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{events.reduce((sum, event) => sum + event.my_submissions, 0)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {events.length > 0
                  ? Math.round(events.reduce((sum, event) => sum + event.completion_rate, 0) / events.length)
                  : 0}
                %
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>My Events</CardTitle>
              <CardDescription>Events you're assigned to judge and your progress</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => exportToCSV(events, "my-judging-progress")}>
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
                  <TableHead className="text-right">Completed</TableHead>
                  <TableHead className="text-right">Progress</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.name}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          event.status === "active" ? "default" : event.status === "completed" ? "secondary" : "outline"
                        }
                      >
                        {event.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{event.total_contestants}</TableCell>
                    <TableCell className="text-right">{event.my_submissions}</TableCell>
                    <TableCell className="text-right">{event.completion_rate}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {selectedEvent && myScores.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>My Scores</CardTitle>
                <CardDescription>
                  Your scoring details for {events.find((e) => e.id === selectedEvent)?.name}
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => exportToCSV(myScores, "my-scores")}>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contestant</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">My Score</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myScores.map((score, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{score.contestant_name}</TableCell>
                      <TableCell>{score.contestant_email}</TableCell>
                      <TableCell className="text-right">{score.my_score}</TableCell>
                      <TableCell>
                        <Badge variant={score.is_draft ? "outline" : "default"}>
                          {score.is_draft ? "Draft" : "Final"}
                        </Badge>
                      </TableCell>
                      <TableCell>{score.submitted_at}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {events.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Events Assigned</h3>
              <p className="text-muted-foreground text-center">
                You haven't been assigned to any events yet. Contact an administrator to get assigned.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
