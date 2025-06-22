"use client"

import { useState, useEffect } from "react"
import { Trophy, Star, ArrowUpDown, Eye, ChevronDown, ChevronUp } from "lucide-react"
import { DashboardLayout } from "@/components/layout/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { getCurrentUser } from "@/lib/auth"
import { judgesApi } from "@/lib/api"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"

interface ContestantScore {
  id: string
  contestant_name: string
  registration_number: string
  judge_score: number
  average_score: number
  max_possible: number
  criteria_count: number
  is_submitted: boolean
}

interface CriteriaScore {
  criteria_id: string
  criteria_name: string
  max_points: number
  judge_score: number
  average_score: number
}

export default function Summarization() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState("")
  const [events, setEvents] = useState<any[]>([])
  const [contestants, setContestants] = useState<ContestantScore[]>([])
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ 
    key: 'average_score', 
    direction: 'desc' 
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [selectedContestant, setSelectedContestant] = useState<ContestantScore | null>(null)
  const [criteriaScores, setCriteriaScores] = useState<CriteriaScore[]>([])

  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (selectedEvent) {
      loadContestantScores()
    }
  }, [selectedEvent])

  const loadData = async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)

      if (!currentUser?.id) {
        throw new Error("User not authenticated")
      }

      // Get judge's assigned competitions
      const assignedCompetitions = await judgesApi.getJudgeAssignments(currentUser.id)
      setEvents(assignedCompetitions)

      if (assignedCompetitions.length > 0) {
        setSelectedEvent(assignedCompetitions[0].id)
      }
    } catch (error) {
      console.error("Error loading data:", error)
      toast({
        title: "Error",
        description: "Failed to load judging data.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadContestantScores = async () => {
    try {
      if (!selectedEvent || !user?.id) return

      const scores = await judgesApi.getContestantScoresForCompetition(
        user.id,
        selectedEvent
      )

      setContestants(scores)
    } catch (error) {
      console.error("Error loading contestant scores:", error)
      toast({
        title: "Error",
        description: "Failed to load contestant scores.",
        variant: "destructive",
      })
    }
  }

  const loadContestantCriteriaScores = async (contestantId: string) => {
    try {
      if (!selectedEvent || !user?.id) return

      const scores = await judgesApi.getContestantCriteriaScores(
        user.id,
        selectedEvent,
        contestantId
      )

      setCriteriaScores(scores)
    } catch (error) {
      console.error("Error loading criteria scores:", error)
      toast({
        title: "Error",
        description: "Failed to load detailed scores.",
        variant: "destructive",
      })
    }
  }

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const sortedContestants = [...contestants].sort((a, b) => {
    if (sortConfig.key === 'contestant_name') {
      return sortConfig.direction === 'asc' 
        ? a.contestant_name.localeCompare(b.contestant_name)
        : b.contestant_name.localeCompare(a.contestant_name)
    } else if (sortConfig.key === 'judge_score') {
      return sortConfig.direction === 'asc' 
        ? a.judge_score - b.judge_score
        : b.judge_score - a.judge_score
    } else {
      return sortConfig.direction === 'asc' 
        ? a.average_score - b.average_score
        : b.average_score - a.average_score
    }
  })

  const filteredContestants = sortedContestants.filter(contestant => 
    contestant.contestant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contestant.registration_number.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const viewContestantDetails = async (contestant: ContestantScore) => {
    setSelectedContestant(contestant)
    await loadContestantCriteriaScores(contestant.id)
    setShowDetailsDialog(true)
  }

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) return null
    return sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
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
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Judging Dashboard</h2>
            <p className="text-muted-foreground">View and compare scores across all contestants</p>
          </div>

          <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
            <Input
              placeholder="Search contestants..."
              className="w-full md:w-[200px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select value={selectedEvent} onValueChange={setSelectedEvent}>
              <SelectTrigger className="w-full md:w-[250px]">
                <SelectValue placeholder="Select competition" />
              </SelectTrigger>
              <SelectContent>
                {events.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {selectedEvent && contestants.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Contestant Scores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead className="w-[60px]">Rank</TableHead>
                    <TableHead 
                        className="cursor-pointer hover:bg-accent" 
                        onClick={() => handleSort('contestant_name')}
                    >
                        <div className="flex items-center gap-1">
                        Contestant
                        {getSortIcon('contestant_name')}
                        </div>
                    </TableHead>
                    <TableHead>Registration</TableHead>
                    <TableHead 
                        className="text-right cursor-pointer hover:bg-accent" 
                        onClick={() => handleSort('judge_score')}
                    >
                        <div className="flex items-center justify-end gap-1">
                        Your Score
                        {getSortIcon('judge_score')}
                        </div>
                    </TableHead>
                    <TableHead 
                        className="text-right cursor-pointer hover:bg-accent" 
                        onClick={() => handleSort('average_score')}
                    >
                        <div className="flex items-center justify-end gap-1">
                        Avg. Score
                        {getSortIcon('average_score')}
                        </div>
                    </TableHead>
                    <TableHead className="text-right">Progress</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredContestants.map((contestant, index) => (
                    <TableRow key={contestant.id}>
                        <TableCell className="font-medium">
                        <div className="flex items-center justify-center">
                            <Badge variant="secondary" className="h-6 w-6 rounded-full p-0 flex items-center justify-center">
                            {index + 1}
                            </Badge>
                        </div>
                        </TableCell>
                        <TableCell className="font-medium">{contestant.contestant_name}</TableCell>
                        <TableCell>{contestant.registration_number}</TableCell>
                        <TableCell className="text-right">
                        <span className="font-semibold">{contestant.judge_score}</span>
                        <span className="text-muted-foreground">/{contestant.max_possible}</span>
                        </TableCell>
                        <TableCell className="text-right">
                        <span className="font-semibold">{contestant.average_score.toFixed(1)}</span>
                        <span className="text-muted-foreground">/{contestant.max_possible}</span>
                        </TableCell>
                        <TableCell className="text-right">
                        <div className="flex items-center gap-2">
                            <Progress 
                            value={(contestant.average_score / contestant.max_possible) * 100} 
                            className="h-2 w-full" 
                            />
                            <span className="text-xs text-muted-foreground">
                            {((contestant.average_score / contestant.max_possible) * 100).toFixed(1)}%
                            </span>
                        </div>
                        </TableCell>
                        <TableCell className="text-right">
                        <Badge variant={contestant.is_submitted ? "default" : "outline"}>
                            {contestant.is_submitted ? "Submitted" : "Pending"}
                        </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => viewContestantDetails(contestant)}
                        >
                            <Eye className="h-4 w-4" />
                        </Button>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
            </Table>
            </CardContent>
          </Card>
        ) : selectedEvent && contestants.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No scores available</h3>
              <p className="text-muted-foreground text-center">
                There are no scores recorded for this competition yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Select a competition</h3>
              <p className="text-muted-foreground text-center">
                Choose a competition from the dropdown to view judging results.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Contestant Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                {selectedContestant?.contestant_name} - Detailed Scores
              </div>
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[70vh] pr-4">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="text-sm font-medium text-muted-foreground">Your Score</div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {selectedContestant?.judge_score}
                      <span className="text-muted-foreground text-lg">/{selectedContestant?.max_possible}</span>
                    </div>
                    <Progress 
                      value={(selectedContestant?.judge_score || 0 / selectedContestant?.max_possible || 1) * 100} 
                      className="h-2 mt-2" 
                    />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <div className="text-sm font-medium text-muted-foreground">Average Score</div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {selectedContestant?.average_score.toFixed(1)}
                      <span className="text-muted-foreground text-lg">/{selectedContestant?.max_possible}</span>
                    </div>
                    <Progress 
                      value={(selectedContestant?.average_score || 0 / selectedContestant?.max_possible || 1) * 100} 
                      className="h-2 mt-2" 
                    />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <div className="text-sm font-medium text-muted-foreground">Status</div>
                  </CardHeader>
                  <CardContent>
                    <Badge variant={selectedContestant?.is_submitted ? "default" : "outline"} className="text-lg">
                      {selectedContestant?.is_submitted ? "Submitted" : "Pending"}
                    </Badge>
                    <div className="text-sm text-muted-foreground mt-1">
                      {selectedContestant?.criteria_count} criteria
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Criteria Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Criteria</TableHead>
                        <TableHead className="text-right">Max Points</TableHead>
                        <TableHead className="text-right">Your Score</TableHead>
                        <TableHead className="text-right">Avg. Score</TableHead>
                        <TableHead className="text-right">Difference</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {criteriaScores.map((criteria) => (
                        <TableRow key={criteria.criteria_id}>
                          <TableCell className="font-medium">{criteria.criteria_name}</TableCell>
                          <TableCell className="text-right">{criteria.max_points}</TableCell>
                          <TableCell className="text-right">
                            <span className={criteria.judge_score < criteria.average_score ? "text-red-500" : 
                              criteria.judge_score > criteria.average_score ? "text-green-500" : ""}>
                              {criteria.judge_score}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">{criteria.average_score.toFixed(1)}</TableCell>
                          <TableCell className="text-right">
                            <span className={
                              criteria.judge_score - criteria.average_score < 0 ? "text-red-500" : 
                              criteria.judge_score - criteria.average_score > 0 ? "text-green-500" : ""
                            }>
                              {(criteria.judge_score - criteria.average_score).toFixed(1)}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}