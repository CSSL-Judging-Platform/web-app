"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Users, Trophy, Settings, UserCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DashboardLayout } from "@/components/layout/sidebar"
import { getCurrentUser } from "@/lib/auth"
import { mockData, mockApi } from "@/lib/mock-data"

interface Competition {
  id: string
  name: string
  description: string | null
  start_date: string
  end_date: string
  status: "draft" | "active" | "completed" | "cancelled"
  big_event_name: string
  contestants_count: number
  judges_count: number
  criteria_count: number
}

interface JudgingCriteria {
  id: string
  name: string
  description: string
  max_points: number
  weight: number
  order_index: number
}

export default function CompetitionsPage() {
  const [user, setUser] = useState<any>(null)
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [bigEvents, setBigEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [criteriaDialogOpen, setCriteriaDialogOpen] = useState(false)
  const [judgesDialogOpen, setJudgesDialogOpen] = useState(false)
  const [contestantsDialogOpen, setContestantsDialogOpen] = useState(false)
  const [editingCompetition, setEditingCompetition] = useState<Competition | null>(null)
  const [selectedCompetitionId, setSelectedCompetitionId] = useState<string>("")
  const [criteria, setCriteria] = useState<JudgingCriteria[]>([])
  const [availableJudges, setAvailableJudges] = useState<any[]>([])
  const [assignedJudges, setAssignedJudges] = useState<any[]>([])
  const [availableContestants, setAvailableContestants] = useState<any[]>([])
  const [assignedContestants, setAssignedContestants] = useState<any[]>([])

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    big_event_id: "",
    start_date: "",
    end_date: "",
    status: "draft" as const,
    allow_registration: true,
  })

  const [newCriteria, setNewCriteria] = useState({
    name: "",
    description: "",
    max_points: 100,
    weight: 1.0,
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)

      // Load mock data
      setBigEvents(mockData.bigEvents)
      setCompetitions(mockData.competitions)
      setAvailableJudges(mockData.judges)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadCriteria = async (competitionId: string) => {
    const competitionCriteria = mockData.judgingCriteria[competitionId] || []
    setCriteria(competitionCriteria)
  }

  const loadJudges = async (competitionId: string) => {
    const assignments = mockData.judgeAssignments.filter((a) => a.competition_id === competitionId)
    const assigned = mockData.judges.filter((j) => assignments.some((a) => a.judge_id === j.id))
    setAssignedJudges(assigned)
  }

  const loadContestants = async (competitionId: string) => {
    const assigned = mockData.contestants.filter((c) => c.competition_id === competitionId)
    setAssignedContestants(assigned)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await mockApi.post("/competitions", formData)
      resetForm()
      loadData()
    } catch (error) {
      console.error("Error saving competition:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      big_event_id: "",
      start_date: "",
      end_date: "",
      status: "draft",
      allow_registration: true,
    })
    setEditingCompetition(null)
    setDialogOpen(false)
  }

  const handleEdit = (competition: Competition) => {
    setEditingCompetition(competition)
    setFormData({
      name: competition.name,
      description: competition.description || "",
      big_event_id: "1", // Mock
      start_date: competition.start_date,
      end_date: competition.end_date,
      status: competition.status,
      allow_registration: true,
    })
    setDialogOpen(true)
  }

  const handleDelete = async (competitionId: string) => {
    if (confirm("Are you sure you want to delete this competition?")) {
      try {
        await mockApi.delete(`/competitions/${competitionId}`)
        loadData()
      } catch (error) {
        console.error("Error deleting competition:", error)
      }
    }
  }

  const handleManageCriteria = (competitionId: string) => {
    setSelectedCompetitionId(competitionId)
    loadCriteria(competitionId)
    setCriteriaDialogOpen(true)
  }

  const handleManageJudges = (competitionId: string) => {
    setSelectedCompetitionId(competitionId)
    loadJudges(competitionId)
    setJudgesDialogOpen(true)
  }

  const handleManageContestants = (competitionId: string) => {
    setSelectedCompetitionId(competitionId)
    loadContestants(competitionId)
    setContestantsDialogOpen(true)
  }

  const addCriteria = () => {
    const newCriteriaItem: JudgingCriteria = {
      id: Date.now().toString(),
      ...newCriteria,
      order_index: criteria.length + 1,
    }
    setCriteria([...criteria, newCriteriaItem])
    setNewCriteria({
      name: "",
      description: "",
      max_points: 100,
      weight: 1.0,
    })
  }

  const removeCriteria = (id: string) => {
    setCriteria(criteria.filter((c) => c.id !== id))
  }

  const toggleJudgeAssignment = (judgeId: string) => {
    const isAssigned = assignedJudges.some((j) => j.id === judgeId)
    if (isAssigned) {
      setAssignedJudges(assignedJudges.filter((j) => j.id !== judgeId))
    } else {
      const judge = availableJudges.find((j) => j.id === judgeId)
      if (judge) {
        setAssignedJudges([...assignedJudges, judge])
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
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
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Competitions</h2>
            <p className="text-muted-foreground">Manage competitions and their judging criteria</p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingCompetition(null)} className="w-full md:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Create Competition
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] mx-4 max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingCompetition ? "Edit Competition" : "Create New Competition"}</DialogTitle>
                <DialogDescription>
                  {editingCompetition
                    ? "Update the competition details below."
                    : "Fill in the details to create a new competition."}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Competition Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="big_event_id">Parent Event</Label>
                    <Select
                      value={formData.big_event_id}
                      onValueChange={(value) => setFormData({ ...formData, big_event_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select parent event" />
                      </SelectTrigger>
                      <SelectContent>
                        {bigEvents.map((event) => (
                          <SelectItem key={event.id} value={event.id}>
                            {event.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start_date">Start Date</Label>
                      <Input
                        id="start_date"
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="end_date">End Date</Label>
                      <Input
                        id="end_date"
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter className="flex-col space-y-2 md:flex-row md:space-y-0">
                  <Button type="button" variant="outline" onClick={resetForm} className="w-full md:w-auto">
                    Cancel
                  </Button>
                  <Button type="submit" className="w-full md:w-auto">
                    {editingCompetition ? "Update Competition" : "Create Competition"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {competitions.map((competition) => (
            <Card key={competition.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-lg truncate">{competition.name}</CardTitle>
                    <CardDescription className="mt-1">{competition.big_event_name}</CardDescription>
                  </div>
                  <Badge className={`${getStatusColor(competition.status)} ml-2 flex-shrink-0`}>
                    {competition.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {competition.description || "No description provided"}
                </p>

                <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                  <div>
                    <div className="text-lg font-semibold text-primary">{competition.contestants_count}</div>
                    <div className="text-xs text-muted-foreground">Contestants</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-primary">{competition.judges_count}</div>
                    <div className="text-xs text-muted-foreground">Judges</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-primary">{competition.criteria_count}</div>
                    <div className="text-xs text-muted-foreground">Criteria</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleManageCriteria(competition.id)}>
                    <Settings className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Criteria</span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleManageJudges(competition.id)}>
                    <UserCheck className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Judges</span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleManageContestants(competition.id)}>
                    <Users className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Contestants</span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(competition)}>
                    <Edit className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Edit</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Criteria Management Dialog */}
        <Dialog open={criteriaDialogOpen} onOpenChange={setCriteriaDialogOpen}>
          <DialogContent className="sm:max-w-[600px] mx-4 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Manage Judging Criteria</DialogTitle>
              <DialogDescription>Set up the criteria and maximum points for judging this competition</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Existing Criteria */}
              <div className="space-y-2">
                <Label>Current Criteria</Label>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {criteria.map((criterion) => (
                    <div key={criterion.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{criterion.name}</div>
                        <div className="text-sm text-muted-foreground truncate">{criterion.description}</div>
                      </div>
                      <div className="flex items-center space-x-2 ml-2">
                        <Badge variant="secondary">{criterion.max_points} pts</Badge>
                        <Button variant="ghost" size="sm" onClick={() => removeCriteria(criterion.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add New Criteria */}
              <div className="border-t pt-4">
                <Label className="text-base font-medium">Add New Criteria</Label>
                <div className="grid gap-3 mt-2">
                  <Input
                    placeholder="Criteria name"
                    value={newCriteria.name}
                    onChange={(e) => setNewCriteria({ ...newCriteria, name: e.target.value })}
                  />
                  <Input
                    placeholder="Description"
                    value={newCriteria.description}
                    onChange={(e) => setNewCriteria({ ...newCriteria, description: e.target.value })}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder="Max points"
                      value={newCriteria.max_points}
                      onChange={(e) => setNewCriteria({ ...newCriteria, max_points: Number(e.target.value) })}
                    />
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="Weight"
                      value={newCriteria.weight}
                      onChange={(e) => setNewCriteria({ ...newCriteria, weight: Number(e.target.value) })}
                    />
                  </div>
                  <Button onClick={addCriteria} disabled={!newCriteria.name}>
                    Add Criteria
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCriteriaDialogOpen(false)}>
                Close
              </Button>
              <Button onClick={() => setCriteriaDialogOpen(false)}>Save Criteria</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Judges Management Dialog */}
        <Dialog open={judgesDialogOpen} onOpenChange={setJudgesDialogOpen}>
          <DialogContent className="sm:max-w-[600px] mx-4 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Assign Judges</DialogTitle>
              <DialogDescription>Select judges to assign to this competition</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Available Judges</Label>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {availableJudges.map((judge) => (
                    <div key={judge.id} className="flex items-center space-x-2 p-2 border rounded">
                      <Checkbox
                        checked={assignedJudges.some((j) => j.id === judge.id)}
                        onCheckedChange={() => toggleJudgeAssignment(judge.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{judge.full_name}</div>
                        <div className="text-sm text-muted-foreground truncate">{judge.expertise}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setJudgesDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setJudgesDialogOpen(false)}>Save Assignments</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Contestants Management Dialog */}
        <Dialog open={contestantsDialogOpen} onOpenChange={setContestantsDialogOpen}>
          <DialogContent className="sm:max-w-[600px] mx-4 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Manage Contestants</DialogTitle>
              <DialogDescription>View and manage contestants for this competition</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Assigned Contestants</Label>
                <div className="max-h-60 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assignedContestants.map((contestant) => (
                        <TableRow key={contestant.id}>
                          <TableCell className="font-medium">{contestant.contestant_name}</TableCell>
                          <TableCell>{contestant.contestant_email}</TableCell>
                          <TableCell>
                            <Badge variant={contestant.status === "judged" ? "default" : "secondary"}>
                              {contestant.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setContestantsDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {competitions.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No competitions yet</h3>
              <p className="text-muted-foreground text-center mb-4">Get started by creating your first competition</p>
              <Button onClick={() => setDialogOpen(true)} className="w-full md:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Create Competition
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
