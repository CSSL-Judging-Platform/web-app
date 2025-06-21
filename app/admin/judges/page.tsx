"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Mail, Trophy, User, ChevronDown, ChevronUp, Check, X } from "lucide-react"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DashboardLayout } from "@/components/layout/sidebar"
import { useAuth } from "@/lib/auth"
import { judgesApi, competitionsApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Judge {
  id: string
  profile_id: string
  expertise: string
  bio?: string
  profile: {
    id: string
    full_name: string
    email: string
    is_active: boolean
    avatar_url?: string
  }
  judge_assignments?: { count: number }[]
  scores?: { count: number }[]
}

export default function JudgesPage() {
  const { user } = useAuth()
  const [judges, setJudges] = useState<Judge[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false)
  const [editingJudge, setEditingJudge] = useState<Judge | null>(null)
  const [selectedJudge, setSelectedJudge] = useState<Judge | null>(null)
  const [availableCompetitions, setAvailableCompetitions] = useState<any[]>([])
  const [assignments, setAssignments] = useState<any[]>([])
  const [expandedJudge, setExpandedJudge] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    expertise: "",
    bio: "",
    password: "",
    is_active: true
  })

  const { toast } = useToast()

  useEffect(() => {
    loadJudges()
  }, [])

  const loadJudges = async () => {
    try {
      setLoading(true)
      const data = await judgesApi.getAll()
      setJudges(data)
    } catch (error) {
      console.error("Error loading judges:", error)
      toast({
        title: "Error",
        description: "Failed to load judges.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadAssignments = async (judgeId: string) => {
    try {
      const data = await judgesApi.getAssignments(judgeId)
      setAssignments(data)
    } catch (error) {
      console.error("Error loading assignments:", error)
      toast({
        title: "Error",
        description: "Failed to load judge assignments.",
        variant: "destructive",
      })
    }
  }

  const loadAvailableCompetitions = async () => {
    try {
      const data = await competitionsApi.getAll()
      setAvailableCompetitions(data)
    } catch (error) {
      console.error("Error loading competitions:", error)
      toast({
        title: "Error",
        description: "Failed to load available competitions.",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingJudge) {
        await judgesApi.update(editingJudge.id, formData)
        toast({
          title: "Success",
          description: "Judge updated successfully.",
        })
      } else {
        await judgesApi.create(formData)
        toast({
          title: "Success",
          description: "Judge created successfully.",
        })
      }

      await loadJudges()
      resetForm()
    } catch (error) {
      console.error("Error saving judge:", error)
      toast({
        title: "Error",
        description: "Failed to save judge.",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      full_name: "",
      email: "",
      expertise: "",
      bio: "",
      password: "",
      is_active: true
    })
    setEditingJudge(null)
    setDialogOpen(false)
  }

  const handleEdit = (judge: Judge) => {
    setEditingJudge(judge)
    setFormData({
      full_name: judge.profile.full_name,
      email: judge.profile.email,
      expertise: judge.expertise,
      bio: judge.bio || "",
      password: "",
      is_active: judge.profile.is_active
    })
    setDialogOpen(true)
  }

  const handleDelete = async (judgeId: string) => {
    if (confirm("Are you sure you want to remove this judge?")) {
      try {
        await judgesApi.delete(judgeId)
        await loadJudges()
        toast({
          title: "Success",
          description: "Judge deleted successfully.",
        })
      } catch (error) {
        console.error("Error deleting judge:", error)
        toast({
          title: "Error",
          description: "Failed to delete judge.",
          variant: "destructive",
        })
      }
    }
  }

  const sendInvitation = async (judgeId: string) => {
    toast({
      title: "Invitation Sent",
      description: "Judge invitation email has been sent successfully!",
    })
  }

  const handleAssignJudge = async (judge: Judge) => {
    setSelectedJudge(judge)
    await loadAvailableCompetitions()
    setAssignmentDialogOpen(true)
  }

  const assignToCompetition = async (competitionId: string) => {
    if (!selectedJudge) return
    
    try {
      await judgesApi.assignToCompetition(selectedJudge.id, competitionId, user.id)
      toast({
        title: "Success",
        description: "Judge assigned to competition successfully.",
      })
      await loadAssignments(selectedJudge.id)
      setAssignmentDialogOpen(false)
    } catch (error) {
      console.error("Error assigning judge:", error)
      toast({
        title: "Error",
        description: "Failed to assign judge to competition.",
        variant: "destructive",
      })
    }
  }

  const removeAssignment = async (assignmentId: string) => {
    try {
      await judgesApi.removeAssignment(assignmentId)
      toast({
        title: "Success",
        description: "Assignment removed successfully.",
      })
      if (selectedJudge) {
        await loadAssignments(selectedJudge.id)
      }
    } catch (error) {
      console.error("Error removing assignment:", error)
      toast({
        title: "Error",
        description: "Failed to remove assignment.",
        variant: "destructive",
      })
    }
  }

  const toggleJudgeExpansion = async (judgeId: string) => {
    if (expandedJudge === judgeId) {
      setExpandedJudge(null)
    } else {
      setExpandedJudge(judgeId)
      const judge = judges.find(j => j.id === judgeId)
      if (judge) {
        await loadAssignments(judgeId)
      }
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
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Judges Management</h2>
            <p className="text-muted-foreground">Manage judges and their competition assignments</p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingJudge(null)} className="w-full md:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Add Judge
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] mx-4">
              <DialogHeader>
                <DialogTitle>{editingJudge ? "Edit Judge" : "Add New Judge"}</DialogTitle>
                <DialogDescription>
                  {editingJudge ? "Update the judge details below." : "Fill in the details to add a new judge."}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name *</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  {!editingJudge && (
                    <div className="space-y-2">
                      <Label htmlFor="password">Password *</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="expertise">Areas of Expertise *</Label>
                    <Input
                      id="expertise"
                      placeholder="e.g., Computer Science, AI/ML, Software Engineering"
                      value={formData.expertise}
                      onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      placeholder="Brief background and qualifications"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="is_active">Status</Label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="is_active"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <Label htmlFor="is_active" className="text-sm font-medium leading-none">
                        Active
                      </Label>
                    </div>
                  </div>
                </div>
                <DialogFooter className="flex-col space-y-2 md:flex-row md:space-y-0">
                  <Button type="button" variant="outline" onClick={resetForm} className="w-full md:w-auto">
                    Cancel
                  </Button>
                  <Button type="submit" className="w-full md:w-auto">
                    {editingJudge ? "Update Judge" : "Add Judge"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Judges</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{judges.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Judges</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {judges.filter(j => j.profile.is_active).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {judges.reduce((sum, judge) => sum + (judge.judge_assignments?.[0]?.count || 0), 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Evaluations</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {judges.reduce((sum, judge) => sum + (judge.scores?.[0]?.count || 0), 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Judges Table */}
        <Card>
          <CardHeader>
            <CardTitle>Judges List</CardTitle>
            <CardDescription>Manage your panel of judges and their assignments</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Judge</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Expertise</TableHead>
                  <TableHead className="text-center">Assignments</TableHead>
                  <TableHead className="text-center">Evaluations</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {judges.map((judge) => (
                  <React.Fragment key={judge.id}>
                    <TableRow key={judge.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => toggleJudgeExpansion(judge.id)}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={judge.profile.avatar_url} />
                            <AvatarFallback>
                              {judge.profile.full_name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span>{judge.profile.full_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{judge.profile.email}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{judge.expertise}</TableCell>
                      <TableCell className="text-center">{judge.judge_assignments?.[0]?.count || 0}</TableCell>
                      <TableCell className="text-center">{judge.scores?.[0]?.count || 0}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={judge.profile.is_active ? "default" : "secondary"}>
                          {judge.profile.is_active ? "active" : "inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); sendInvitation(judge.id); }}>
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleEdit(judge); }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDelete(judge.id); }}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              setSelectedJudge(judge);
                              toggleJudgeExpansion(judge.id);
                            }}
                          >
                            {expandedJudge === judge.id ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    {expandedJudge === judge.id && (
                      <TableRow className="bg-gray-50">
                        <TableCell colSpan={7} className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="w-1/2 pr-4">
                              <h4 className="font-medium mb-2">Bio</h4>
                              <p className="text-sm text-gray-600">{judge.bio || "No bio provided"}</p>
                            </div>
                            <div className="w-1/2 pl-4">
                              <div className="flex justify-between items-center mb-2">
                                <h4 className="font-medium">Competition Assignments</h4>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleAssignJudge(judge)}
                                >
                                  <Plus className="mr-2 h-3 w-3" />
                                  Assign to Competition
                                </Button>
                              </div>
                              {assignments.length > 0 ? (
                                <div className="space-y-2">
                                  {assignments.map((assignment) => (
                                    <div key={assignment.id} className="flex justify-between items-center p-2 border rounded">
                                      <div>
                                        <p className="font-medium">{assignment.competition.name}</p>
                                        <p className="text-sm text-gray-500">
                                          {assignment.big_event?.name || "Standalone competition"}
                                        </p>
                                      </div>
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => removeAssignment(assignment.id)}
                                      >
                                        <X className="h-4 w-4 text-red-500" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-gray-500">No assignments yet</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Assignment Dialog */}
        <Dialog open={assignmentDialogOpen} onOpenChange={setAssignmentDialogOpen}>
          <DialogContent className="sm:max-w-[500px] mx-4">
            <DialogHeader>
              <DialogTitle>Assign Judge to Competition</DialogTitle>
              <DialogDescription>
                Select a competition to assign {selectedJudge?.profile.full_name} to
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {availableCompetitions.length > 0 ? (
                <div className="space-y-2">
                  {availableCompetitions.map((competition) => (
                    <div 
                      key={competition.id} 
                      className="flex items-center justify-between p-3 border rounded hover:bg-gray-50 cursor-pointer"
                      onClick={() => assignToCompetition(competition.id)}
                    >
                      <div>
                        <p className="font-medium">{competition.name}</p>
                        <p className="text-sm text-gray-500">
                          {competition.big_events?.name || "Standalone competition"}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Assign
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">No available competitions</p>
              )}
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setAssignmentDialogOpen(false)}
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {judges.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <User className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No judges yet</h3>
              <p className="text-muted-foreground text-center mb-4">Add judges to start evaluating competitions</p>
              <Button onClick={() => setDialogOpen(true)} className="w-full md:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Add Judge
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}