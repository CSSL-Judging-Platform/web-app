"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Filter, MoreHorizontal, Users, Calendar, Trophy, Edit, Trash2, ListChecks } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DashboardLayout } from "@/components/layout/sidebar"
import { SortableList, SortableItem } from "@/components/ui/sortable-list"
import { useAuth } from "@/lib/auth"
import { competitionsApi, bigEventsApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface Competition {
  id: string
  name: string
  description: string
  status: "draft" | "active" | "completed"
  start_date: string
  end_date: string
  max_participants: number
  big_event_id: string
  big_events?: { name: string }
  contestants?: { count: number }[]
  judge_assignments?: { count: number }[]
}

interface BigEvent {
  id: string
  name: string
}

interface JudgingCriteria {
  id: string;
  name: string;
  description: string;
  max_points: number;
  weight: number;
  order_index: number;
  competition_id: string;
}

interface CriteriaFormData {
  name: string;
  description: string;
  max_points: number;
  weight: number;
}

export default function SmallEventsPage() {
  const { user } = useAuth()
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [bigEvents, setBigEvents] = useState<BigEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    max_participants: "",
    start_date: "",
    end_date: "",
    big_event_id: "",
  })
  const { toast } = useToast()
  const [updatingStatus, setUpdatingStatus] = useState<Record<string, boolean>>({});
  const [isCriteriaDialogOpen, setIsCriteriaDialogOpen] = useState(false);
  const [currentCompetitionId, setCurrentCompetitionId] = useState<string | null>(null);
  const [criteriaList, setCriteriaList] = useState<JudgingCriteria[]>([]);
  const [currentCriteria, setCurrentCriteria] = useState<JudgingCriteria | null>(null);
  const [criteriaFormData, setCriteriaFormData] = useState<CriteriaFormData>({
    name: '',
    description: '',
    max_points: 100,
    weight: 1.0
  });

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [competitionsData, bigEventsData] = await Promise.all([competitionsApi.getAll(), bigEventsApi.getAll()])

      setCompetitions(competitionsData)
      setBigEvents(bigEventsData)
    } catch (error) {
      console.error("Error loading data:", error)
      toast({
        title: "Error",
        description: "Failed to load competitions data.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const openCriteriaDialog = async (competitionId: string) => {
    setCurrentCompetitionId(competitionId);
    try {
      const criteria = await competitionsApi.getById(competitionId);
      setCriteriaList(criteria.judging_criteria || []);
      setIsCriteriaDialogOpen(true);
    } catch (error) {
      console.error("Error loading criteria:", error);
      toast({
        title: "Error",
        description: "Failed to load judging criteria.",
        variant: "destructive",
      });
    }
  };

  const handleCreateCriteria = async () => {
    if (!currentCompetitionId) return;

    try {
      const newCriteria = await competitionsApi.createCriteria({
        ...criteriaFormData,
        competition_id: currentCompetitionId,
        order_index: criteriaList.length + 1
      });
      
      setCriteriaList([...criteriaList, newCriteria]);
      resetCriteriaForm();
      toast({
        title: "Success",
        description: "Criteria created successfully.",
      });
    } catch (error) {
      console.error("Error creating criteria:", error);
      toast({
        title: "Error",
        description: "Failed to create criteria.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateCriteria = async () => {
    if (!currentCriteria) return;

    try {
      const updatedCriteria = await competitionsApi.updateCriteria(currentCriteria.id, criteriaFormData);
      
      setCriteriaList(criteriaList.map(c => 
        c.id === updatedCriteria.id ? updatedCriteria : c
      ));
      setCurrentCriteria(null);
      resetCriteriaForm();
      toast({
        title: "Success",
        description: "Criteria updated successfully.",
      });
    } catch (error) {
      console.error("Error updating criteria:", error);
      toast({
        title: "Error",
        description: "Failed to update criteria.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCriteria = async (criteriaId: string) => {
    if (confirm("Are you sure you want to delete this criteria?")) {
      try {
        await competitionsApi.deleteCriteria(criteriaId);
        setCriteriaList(criteriaList.filter(c => c.id !== criteriaId));
        toast({
          title: "Success",
          description: "Criteria deleted successfully.",
        });
      } catch (error) {
        console.error("Error deleting criteria:", error);
        toast({
          title: "Error",
          description: "Failed to delete criteria.",
          variant: "destructive",
        });
      }
    }
  };

  const resetCriteriaForm = () => {
    setCriteriaFormData({
      name: '',
      description: '',
      max_points: 100,
      weight: 1.0
    });
  };

  const openEditCriteria = (criteria: JudgingCriteria) => {
    setCurrentCriteria(criteria);
    setCriteriaFormData({
      name: criteria.name,
      description: criteria.description,
      max_points: criteria.max_points,
      weight: criteria.weight
    });
  };

  const handleReorderCriteria = async (newOrder: JudgingCriteria[]) => {
    try {
      await competitionsApi.reorderCriteria(
        currentCompetitionId!,
        newOrder.map((item, index) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          max_points: item.max_points,
          weight: item.weight,
          competition_id: currentCompetitionId, // Add this line
          order_index: index + 1
        }))
      );
      setCriteriaList(newOrder);
    } catch (error) {
      console.error("Error reordering criteria:", error);
      toast({
        title: "Error",
        description: "Failed to reorder criteria.",
        variant: "destructive",
      });
    }
  };

  const filteredCompetitions = competitions.filter((competition) => {
    const matchesSearch =
      competition.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      competition.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || competition.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleCreateCompetition = async () => {
    try {
      await competitionsApi.create({
        ...formData,
        max_participants: Number.parseInt(formData.max_participants),
        created_by: user?.id || "",
      })

      await loadData()
      setIsCreateDialogOpen(false)
      resetForm()

      toast({
        title: "Success",
        description: "Competition created successfully.",
      })
    } catch (error) {
      console.error("Error creating competition:", error)
      toast({
        title: "Error",
        description: "Failed to create competition.",
        variant: "destructive",
      })
    }
  }

  const handleEditCompetition = async () => {
    if (!selectedCompetition) return

    try {
      await competitionsApi.update(selectedCompetition.id, {
        ...formData,
        max_participants: Number.parseInt(formData.max_participants),
      })

      await loadData()
      setIsEditDialogOpen(false)
      setSelectedCompetition(null)
      resetForm()

      toast({
        title: "Success",
        description: "Competition updated successfully.",
      })
    } catch (error) {
      console.error("Error updating competition:", error)
      toast({
        title: "Error",
        description: "Failed to update competition.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteCompetition = async (competitionId: string) => {
    if (confirm("Are you sure you want to delete this competition?")) {
      try {
        await competitionsApi.delete(competitionId)
        await loadData()

        toast({
          title: "Success",
          description: "Competition deleted successfully.",
        })
      } catch (error) {
        console.error("Error deleting competition:", error)
        toast({
          title: "Error",
          description: "Failed to delete competition.",
          variant: "destructive",
        })
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      max_participants: "",
      start_date: "",
      end_date: "",
      big_event_id: "",
    })
  }

  const openEditDialog = (competition: Competition) => {
    setSelectedCompetition(competition)
    setFormData({
      name: competition.name,
      description: competition.description,
      max_participants: competition.max_participants.toString(),
      start_date: formatDateForInput(competition.start_date),
      end_date: formatDateForInput(competition.end_date),
      big_event_id: competition.big_event_id,
    })
    setIsEditDialogOpen(true)
  }

  const handleStatusUpdate = async (competitionId: string, newStatus: "draft" | "active" | "completed") => {
  setUpdatingStatus(prev => ({ ...prev, [competitionId]: true }));
  
  try {
    await competitionsApi.updateStatus(competitionId, newStatus);
    await loadData();
    toast({
      title: "Success",
      description: "Competition status updated successfully.",
    });
  } catch (error) {
    console.error("Error updating status:", error);
    toast({
      title: "Error",
      description: "Failed to update competition status.",
      variant: "destructive",
    });
  } finally {
    setUpdatingStatus(prev => ({ ...prev, [competitionId]: false }));
  }
};

  // const getStatusBadge = (status: string) => {
  //   switch (status) {
  //     case "active":
  //       return <Badge className="bg-green-100 text-green-800">Active</Badge>
  //     case "completed":
  //       return <Badge className="bg-gray-100 text-gray-800">Completed</Badge>
  //     default:
  //       return <Badge className="bg-yellow-100 text-yellow-800">Draft</Badge>
  //   }
  // }

  const getStatusBadge = (competition: Competition) => {
  const status = competition.status;
  const isLoading = updatingStatus[competition.id];
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 p-0" disabled={isLoading}>
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
              <span>Updating...</span>
            </div>
          ) : (
            <>
              {status === "active" && (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer">
                  Active
                </Badge>
              )}
              {status === "completed" && (
                <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200 cursor-pointer">
                  Completed
                </Badge>
              )}
              {status === "draft" && (
                <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 cursor-pointer">
                  Draft
                </Badge>
              )}
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-40">
        <DropdownMenuLabel>Change Status</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => handleStatusUpdate(competition.id, "draft")}
          disabled={status === "draft"}
        >
          <div className={`w-2 h-2 rounded-full mr-2 ${status === "draft" ? 'bg-yellow-500' : 'bg-gray-200'}`} />
          Draft
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleStatusUpdate(competition.id, "active")}
          disabled={status === "active"}
        >
          <div className={`w-2 h-2 rounded-full mr-2 ${status === "active" ? 'bg-green-500' : 'bg-gray-200'}`} />
          Active
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleStatusUpdate(competition.id, "completed")}
          disabled={status === "completed"}
        >
          <div className={`w-2 h-2 rounded-full mr-2 ${status === "completed" ? 'bg-gray-500' : 'bg-gray-200'}`} />
          Completed
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

  if (loading) {
    return (
      <DashboardLayout userRole="admin" user={user}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  return (
    <DashboardLayout userRole="admin" user={user}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Competitions</h1>
            <p className="text-muted-foreground">Manage and organize competitions</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Competition
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Competition</DialogTitle>
                <DialogDescription>
                  Add a new competition to the system. Fill in all the required details.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Competition Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter competition name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter competition description"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="big_event_id">Big Event</Label>
                  <Select
                    value={formData.big_event_id}
                    onValueChange={(value) => setFormData({ ...formData, big_event_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select big event" />
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
                <div className="grid gap-2">
                  <Label htmlFor="maxParticipants">Max Participants</Label>
                  <Input
                    id="maxParticipants"
                    type="number"
                    value={formData.max_participants}
                    onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
                    placeholder="Enter max participants"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleCreateCompetition}>
                  Create Competition
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Competitions</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{competitions.length}</div>
              <p className="text-xs text-muted-foreground">All competitions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{competitions.filter((c) => c.status === "active").length}</div>
              <p className="text-xs text-muted-foreground">Currently running</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {competitions.reduce((sum, c) => sum + (c.contestants?.[0]?.count || 0), 0)}
              </div>
              <p className="text-xs text-muted-foreground">Across all competitions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{competitions.filter((c) => c.status === "completed").length}</div>
              <p className="text-xs text-muted-foreground">Successfully finished</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search competitions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Competitions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Competitions</CardTitle>
            <CardDescription>A list of all competitions in the system.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Big Event</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Participants</TableHead>
                  <TableHead>Judges</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompetitions.map((competition) => (
                  <TableRow key={competition.id}>
                    <TableCell className="font-medium">{competition.name}</TableCell>
                    <TableCell>{competition.big_events?.name || "N/A"}</TableCell>
                    <TableCell>{getStatusBadge(competition)}</TableCell>
                    <TableCell>
                      {competition.contestants?.[0]?.count || 0}/{competition.max_participants}
                    </TableCell>
                    <TableCell>{competition.judge_assignments?.[0]?.count || 0}</TableCell>
                    <TableCell>{new Date(competition.start_date).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => openCriteriaDialog(competition.id)}>
                            <ListChecks className="mr-2 h-4 w-4" />
                            Manage Criteria
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEditDialog(competition)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteCompetition(competition.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Competition</DialogTitle>
              <DialogDescription>
                Update the competition details. Make changes and save when you're done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Competition Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter competition name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter competition description"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-big_event_id">Big Event</Label>
                <Select
                  value={formData.big_event_id}
                  onValueChange={(value) => setFormData({ ...formData, big_event_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select big event" />
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
              <div className="grid gap-2">
                <Label htmlFor="edit-maxParticipants">Max Participants</Label>
                <Input
                  id="edit-maxParticipants"
                  type="number"
                  value={formData.max_participants}
                  onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
                  placeholder="Enter max participants"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-startDate">Start Date</Label>
                  <Input
                    id="edit-startDate"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-endDate">End Date</Label>
                  <Input
                    id="edit-endDate"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleEditCompetition}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Criteria Management Dialog */}
        <Dialog open={isCriteriaDialogOpen} onOpenChange={setIsCriteriaDialogOpen}>
          <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Judging Criteria</DialogTitle>
              <DialogDescription>
                Manage the judging criteria for this competition. Drag to reorder.
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex-1 overflow-y-auto px-2">
              {/* Criteria List */}
              <div className="border rounded-lg">
                <div className="bg-gray-50 px-4 py-2 border-b">
                  <h3 className="font-medium">Current Criteria</h3>
                </div>
                <div className="divide-y">
                  {criteriaList.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No criteria defined yet
                    </div>
                  ) : (
                    <SortableList
                      items={criteriaList}
                      onSort={handleReorderCriteria}
                      renderItem={(criteria) => (
                        <SortableItem id={criteria.id}>
                          <div className="flex items-center justify-between p-4">
                            <div>
                              <div className="font-medium">{criteria.name}</div>
                              <div className="text-sm text-muted-foreground">
                                Max points: {criteria.max_points} • Weight: {criteria.weight}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditCriteria(criteria)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteCriteria(criteria.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </div>
                        </SortableItem>
                      )}
                    />
                  )}
                </div>
              </div>

              {/* Add/Edit Form */}
              <div className="space-y-4 mt-4">
                <h3 className="font-medium">
                  {currentCriteria ? "Edit Criteria" : "Add New Criteria"}
                </h3>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="criteria-name">Name</Label>
                    <Input
                      id="criteria-name"
                      value={criteriaFormData.name}
                      onChange={(e) => setCriteriaFormData({
                        ...criteriaFormData,
                        name: e.target.value
                      })}
                      placeholder="Enter criteria name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="criteria-description">Description</Label>
                    <Textarea
                      id="criteria-description"
                      value={criteriaFormData.description}
                      onChange={(e) => setCriteriaFormData({
                        ...criteriaFormData,
                        description: e.target.value
                      })}
                      placeholder="Enter criteria description"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="criteria-max-points">Max Points</Label>
                      <Input
                        id="criteria-max-points"
                        type="number"
                        min="1"
                        max="1000"
                        value={criteriaFormData.max_points}
                        onChange={(e) => setCriteriaFormData({
                          ...criteriaFormData,
                          max_points: Number(e.target.value)
                        })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="criteria-weight">Weight</Label>
                      <Input
                        id="criteria-weight"
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="10"
                        value={criteriaFormData.weight}
                        onChange={(e) => setCriteriaFormData({
                          ...criteriaFormData,
                          weight: Number(e.target.value)
                        })}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  {currentCriteria && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setCurrentCriteria(null);
                        resetCriteriaForm();
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button
                    onClick={currentCriteria ? handleUpdateCriteria : handleCreateCriteria}
                  >
                    {currentCriteria ? "Update Criteria" : "Add Criteria"}
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </DashboardLayout>
  )
}
