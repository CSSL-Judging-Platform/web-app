"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Mail, Trophy, User } from "lucide-react"
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DashboardLayout } from "@/components/layout/sidebar"

interface Judge {
  id: string
  full_name: string
  email: string
  expertise: string
  assigned_events: number
  total_submissions: number
  status: "active" | "inactive"
  created_at: string
}

export default function JudgesPage() {
  const [judges, setJudges] = useState<Judge[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingJudge, setEditingJudge] = useState<Judge | null>(null)
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    expertise: "",
    bio: "",
  })

  useEffect(() => {
    loadJudges()
  }, [])

  const loadJudges = async () => {
    // Mock data for demo
    const mockJudges: Judge[] = [
      {
        id: "1",
        full_name: "Dr. Sarah Johnson",
        email: "judge@judgingportal.com",
        expertise: "Computer Science, AI/ML",
        assigned_events: 3,
        total_submissions: 25,
        status: "active",
        created_at: "2024-01-15",
      },
      {
        id: "2",
        full_name: "Prof. Michael Chen",
        email: "michael.chen@university.edu",
        expertise: "Software Engineering, Innovation",
        assigned_events: 2,
        total_submissions: 18,
        status: "active",
        created_at: "2024-01-20",
      },
      {
        id: "3",
        full_name: "Dr. Emily Rodriguez",
        email: "emily.rodriguez@tech.com",
        expertise: "Product Design, UX/UI",
        assigned_events: 1,
        total_submissions: 12,
        status: "inactive",
        created_at: "2024-02-01",
      },
    ]

    setJudges(mockJudges)
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Creating/updating judge:", formData)
    resetForm()
    loadJudges()
  }

  const resetForm = () => {
    setFormData({
      full_name: "",
      email: "",
      expertise: "",
      bio: "",
    })
    setEditingJudge(null)
    setDialogOpen(false)
  }

  const handleEdit = (judge: Judge) => {
    setEditingJudge(judge)
    setFormData({
      full_name: judge.full_name,
      email: judge.email,
      expertise: judge.expertise,
      bio: "",
    })
    setDialogOpen(true)
  }

  const handleDelete = async (judgeId: string) => {
    if (confirm("Are you sure you want to remove this judge?")) {
      console.log("Deleting judge:", judgeId)
      loadJudges()
    }
  }

  const sendInvitation = async (judgeId: string) => {
    console.log("Sending invitation to judge:", judgeId)
    // Mock invitation logic
    alert("Invitation sent successfully!")
  }

  if (loading) {
    return (
      <DashboardLayout userRole="admin">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Judges</h2>
            <p className="text-muted-foreground">Manage judges and their assignments</p>
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
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expertise">Areas of Expertise</Label>
                    <Input
                      id="expertise"
                      placeholder="e.g., Computer Science, AI/ML, Software Engineering"
                      value={formData.expertise}
                      onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio (Optional)</Label>
                    <Textarea
                      id="bio"
                      placeholder="Brief background and qualifications"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      rows={3}
                    />
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
                {judges.filter((j) => j.status === "active").length}
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
                {judges.reduce((sum, judge) => sum + judge.assigned_events, 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {judges.reduce((sum, judge) => sum + judge.total_submissions, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Judges Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Judges</CardTitle>
            <CardDescription>Manage your panel of judges and their assignments</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Expertise</TableHead>
                  <TableHead className="text-center">Events</TableHead>
                  <TableHead className="text-center">Submissions</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {judges.map((judge) => (
                  <TableRow key={judge.id}>
                    <TableCell className="font-medium">{judge.full_name}</TableCell>
                    <TableCell>{judge.email}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{judge.expertise}</TableCell>
                    <TableCell className="text-center">{judge.assigned_events}</TableCell>
                    <TableCell className="text-center">{judge.total_submissions}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={judge.status === "active" ? "default" : "secondary"}>{judge.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => sendInvitation(judge.id)}>
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(judge)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(judge.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

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
