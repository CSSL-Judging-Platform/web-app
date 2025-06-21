"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Download, Search } from "lucide-react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DashboardLayout } from "@/components/layout/sidebar"
import { useAuth } from "@/lib/auth"
import { contestantsApi, competitionsApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface Contestant {
  id: string
  contestant_name: string
  contestant_email: string
  registration_number: string
  competition_id: string
  status: "registered" | "submitted" | "judged"
  registered_at: string
  additional_info?: any
  competitions?: { name: string }
  scores?: { score: number }[]
}

interface Competition {
  id: string
  name: string
}

export default function ContestantsPage() {
  const { user } = useAuth()
  const [contestants, setContestants] = useState<Contestant[]>([])
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingContestant, setEditingContestant] = useState<Contestant | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCompetition, setSelectedCompetition] = useState("all")
  const [formData, setFormData] = useState({
    contestant_name: "",
    contestant_email: "",
    registration_number: "",
    competition_id: "",
    additional_info: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [contestantsData, competitionsData] = await Promise.all([contestantsApi.getAll(), competitionsApi.getAll()])

      setContestants(contestantsData)
      setCompetitions(competitionsData)
    } catch (error) {
      console.error("Error loading data:", error)
      toast({
        title: "Error",
        description: "Failed to load contestants data.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingContestant) {
        await contestantsApi.update(editingContestant.id, formData)
        toast({
          title: "Success",
          description: "Contestant updated successfully.",
        })
      } else {
        await contestantsApi.create(formData)
        toast({
          title: "Success",
          description: "Contestant created successfully.",
        })
      }

      await loadData()
      resetForm()
    } catch (error) {
      console.error("Error saving contestant:", error)
      toast({
        title: "Error",
        description: "Failed to save contestant.",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      contestant_name: "",
      contestant_email: "",
      registration_number: "",
      competition_id: "",
      additional_info: "",
    })
    setEditingContestant(null)
    setDialogOpen(false)
  }

  const handleEdit = (contestant: Contestant) => {
    setEditingContestant(contestant)
    setFormData({
      contestant_name: contestant.contestant_name,
      contestant_email: contestant.contestant_email,
      registration_number: contestant.registration_number,
      competition_id: contestant.competition_id,
      additional_info: contestant.additional_info?.info || "",
    })
    setDialogOpen(true)
  }

  const handleDelete = async (contestantId: string) => {
    if (confirm("Are you sure you want to remove this contestant?")) {
      try {
        await contestantsApi.delete(contestantId)
        await loadData()
        toast({
          title: "Success",
          description: "Contestant deleted successfully.",
        })
      } catch (error) {
        console.error("Error deleting contestant:", error)
        toast({
          title: "Error",
          description: "Failed to delete contestant.",
          variant: "destructive",
        })
      }
    }
  }

  const exportContestants = () => {
    const csvContent = [
      ["Name", "Email", "Registration Number", "Competition", "Status", "Average Score"].join(","),
      ...filteredContestants.map((c) => {
        const avgScore = c.scores?.length ? c.scores.reduce((sum, s) => sum + s.score, 0) / c.scores.length : 0
        return [
          c.contestant_name,
          c.contestant_email,
          c.registration_number,
          c.competitions?.name || "",
          c.status,
          avgScore.toFixed(1),
        ].join(",")
      }),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "contestants.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const filteredContestants = contestants.filter((contestant) => {
    const matchesSearch =
      contestant.contestant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contestant.contestant_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contestant.registration_number.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCompetition = selectedCompetition === "all" || contestant.competition_id === selectedCompetition

    return matchesSearch && matchesCompetition
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "judged":
        return "bg-green-100 text-green-800"
      case "submitted":
        return "bg-blue-100 text-blue-800"
      case "registered":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
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
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Contestants</h2>
            <p className="text-muted-foreground">Manage participants and their registrations</p>
          </div>

          <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
            <Button variant="outline" onClick={exportContestants} className="w-full md:w-auto">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingContestant(null)} className="w-full md:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Contestant
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] mx-4">
                <DialogHeader>
                  <DialogTitle>{editingContestant ? "Edit Contestant" : "Add New Contestant"}</DialogTitle>
                  <DialogDescription>
                    {editingContestant
                      ? "Update the contestant details below."
                      : "Fill in the details to add a new contestant."}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="contestant_name">Full Name</Label>
                      <Input
                        id="contestant_name"
                        value={formData.contestant_name}
                        onChange={(e) => setFormData({ ...formData, contestant_name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contestant_email">Email Address</Label>
                      <Input
                        id="contestant_email"
                        type="email"
                        value={formData.contestant_email}
                        onChange={(e) => setFormData({ ...formData, contestant_email: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="registration_number">Registration Number</Label>
                      <Input
                        id="registration_number"
                        value={formData.registration_number}
                        onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="competition_id">Competition</Label>
                      <Select
                        value={formData.competition_id}
                        onValueChange={(value) => setFormData({ ...formData, competition_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select competition" />
                        </SelectTrigger>
                        <SelectContent>
                          {competitions.map((competition) => (
                            <SelectItem key={competition.id} value={competition.id}>
                              {competition.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="additional_info">Additional Information (Optional)</Label>
                      <Input
                        id="additional_info"
                        placeholder="e.g., Team name, special requirements"
                        value={formData.additional_info}
                        onChange={(e) => setFormData({ ...formData, additional_info: e.target.value })}
                      />
                    </div>
                  </div>
                  <DialogFooter className="flex-col space-y-2 md:flex-row md:space-y-0">
                    <Button type="button" variant="outline" onClick={resetForm} className="w-full md:w-auto">
                      Cancel
                    </Button>
                    <Button type="submit" className="w-full md:w-auto">
                      {editingContestant ? "Update Contestant" : "Add Contestant"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Contestants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{contestants.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Judged</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {contestants.filter((c) => c.status === "judged").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Submitted</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {contestants.filter((c) => c.status === "submitted").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Registered</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {contestants.filter((c) => c.status === "registered").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search contestants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCompetition} onValueChange={setSelectedCompetition}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Filter by competition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Competitions</SelectItem>
              {competitions.map((competition) => (
                <SelectItem key={competition.id} value={competition.id}>
                  {competition.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Contestants Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Contestants</CardTitle>
            <CardDescription>Manage participant registrations and track their progress</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Registration #</TableHead>
                  <TableHead>Competition</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Avg Score</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContestants.map((contestant) => {
                  const avgScore = contestant.scores?.length
                    ? contestant.scores.reduce((sum, s) => sum + s.score, 0) / contestant.scores.length
                    : 0

                  return (
                    <TableRow key={contestant.id}>
                      <TableCell className="font-medium">{contestant.contestant_name}</TableCell>
                      <TableCell>{contestant.contestant_email}</TableCell>
                      <TableCell>{contestant.registration_number}</TableCell>
                      <TableCell>{contestant.competitions?.name || "N/A"}</TableCell>
                      <TableCell className="text-center">
                        <Badge className={getStatusColor(contestant.status)}>{contestant.status}</Badge>
                      </TableCell>
                      <TableCell className="text-center">{avgScore > 0 ? `${avgScore.toFixed(1)}%` : "-"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(contestant)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(contestant.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {filteredContestants.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No contestants found</h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchTerm || selectedCompetition !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Add contestants to start managing participants"}
              </p>
              {!searchTerm && selectedCompetition === "all" && (
                <Button onClick={() => setDialogOpen(true)} className="w-full md:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Contestant
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
