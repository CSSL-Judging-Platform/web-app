"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Eye, CalendarDays, ChevronDown } from "lucide-react"
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
import { DashboardLayout } from "@/components/layout/sidebar"
import { useAuth } from "@/lib/auth"
import { bigEventsApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useConfirmToast } from "@/hooks/use-confirm-toast"

interface BigEvent {
  id: string
  name: string
  description: string | null
  start_date: string
  end_date: string
  status: "draft" | "active" | "completed" | "cancelled"
  created_at: string
  created_by: string
}

export default function BigEventsPage() {
  const { user } = useAuth()
  const [events, setEvents] = useState<BigEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<BigEvent | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    status: "draft" as const,
  })
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [viewingEvent, setViewingEvent] = useState<BigEvent | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState<Record<string, boolean>>({})
  const { toast } = useToast()
  const { confirm, ConfirmDialog } = useConfirmToast()

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      const data = await bigEventsApi.getAll()
      setEvents(data)
    } catch (error) {
      console.error("Error loading events:", error)
      toast({
        title: "Error",
        description: "Failed to load events.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingEvent) {
        await bigEventsApi.update(editingEvent.id, formData)
        toast({
          title: "Success",
          description: "Event updated successfully.",
        })
      } else {
        await bigEventsApi.create({
          ...formData,
          created_by: user?.id || "",
        })
        toast({
          title: "Success",
          description: "Event created successfully.",
        })
      }

      await loadEvents()
      resetForm()
    } catch (error) {
      console.error("Error saving event:", error)
      toast({
        title: "Error",
        description: "Failed to save event.",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      start_date: "",
      end_date: "",
      status: "draft",
    })
    setEditingEvent(null)
    setDialogOpen(false)
  }

  const handleEdit = (event: BigEvent) => {
    setEditingEvent(event)
    setFormData({
      name: event.name,
      description: event.description || "",
      start_date: formatDateForInput(event.start_date),
      end_date: formatDateForInput(event.end_date),
      status: event.status,
    })
    setDialogOpen(true)
  }

  const handleDelete = async (eventId: string) => {
    const shouldDelete = await confirm(
      "Are you sure you want to delete this event and all its competitions? This action cannot be undone."
    )
    
    if (!shouldDelete) return

    try {
      await bigEventsApi.delete(eventId)
      await loadEvents()
      toast({
        title: "Success",
        description: "Event and all its competitions deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting event:", error)
      toast({
        title: "Error",
        description: "Failed to delete event.",
        variant: "destructive",
      })
    }
  }

  const handleView = (event: BigEvent) => {
    setViewingEvent(event)
    setViewDialogOpen(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusBadge = (event: BigEvent) => {
    const status = event.status
    const isLoading = updatingStatus[event.id]
    
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
              <Badge className={`${getStatusColor(status)} hover:opacity-80 cursor-pointer`}>
                <div className="flex items-center">
                  {status}
                  <ChevronDown className="ml-1 h-3 w-3" />
                </div>
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuLabel>Change Status</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => handleStatusUpdate(event.id, "draft")}
            disabled={status === "draft"}
          >
            <div className={`w-2 h-2 rounded-full mr-2 ${status === "draft" ? 'bg-yellow-500' : 'bg-gray-200'}`} />
            Draft
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleStatusUpdate(event.id, "active")}
            disabled={status === "active"}
          >
            <div className={`w-2 h-2 rounded-full mr-2 ${status === "active" ? 'bg-green-500' : 'bg-gray-200'}`} />
            Active
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleStatusUpdate(event.id, "completed")}
            disabled={status === "completed"}
          >
            <div className={`w-2 h-2 rounded-full mr-2 ${status === "completed" ? 'bg-blue-500' : 'bg-gray-200'}`} />
            Completed
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleStatusUpdate(event.id, "cancelled")}
            disabled={status === "cancelled"}
          >
            <div className={`w-2 h-2 rounded-full mr-2 ${status === "cancelled" ? 'bg-red-500' : 'bg-gray-200'}`} />
            Cancelled
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toISOString().split('T')[0]
  }

  const handleStatusUpdate = async (eventId: string, newStatus: "draft" | "active" | "completed" | "cancelled") => {
    setUpdatingStatus(prev => ({ ...prev, [eventId]: true }))
    
    try {
      await bigEventsApi.updateStatus(eventId, newStatus)
      await loadEvents()
      toast({
        title: "Success",
        description: "Event status updated successfully.",
      })
    } catch (error) {
      console.error("Error updating status:", error)
      toast({
        title: "Error",
        description: "Failed to update event status.",
        variant: "destructive",
      })
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [eventId]: false }))
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
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Main Events</h2>
            <p className="text-muted-foreground">Manage conferences, summits, and major events</p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingEvent(null)} className="w-full md:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Create Event
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] mx-4">
              <DialogHeader>
                <DialogTitle>{editingEvent ? "Edit Event" : "Create New Event"}</DialogTitle>
                <DialogDescription>
                  {editingEvent ? "Update the event details below." : "Fill in the details to create a new big event."}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Event Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
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
                    {editingEvent ? "Update Event" : "Create Event"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Card key={event.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-lg truncate">{event.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {new Date(event.start_date).toLocaleDateString()} -{" "}
                      {new Date(event.end_date).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  {getStatusBadge(event)}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {event.description || "No description provided"}
                </p>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleView(event)}>
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">View</span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(event)}>
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(event.id)}>
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{viewingEvent?.name}</DialogTitle>
            <DialogDescription>
              Event details
            </DialogDescription>
          </DialogHeader>
          {viewingEvent && (
            <div className="space-y-4">
              <div>
                <Label>Status</Label>
                <div className="mt-1">
                  <Badge className={getStatusColor(viewingEvent.status)}>
                    {viewingEvent.status}
                  </Badge>
                </div>
              </div>
              
              <div>
                <Label>Date Range</Label>
                <p className="mt-1 text-sm">
                  {new Date(viewingEvent.start_date).toLocaleDateString()} -{" "}
                  {new Date(viewingEvent.end_date).toLocaleDateString()}
                </p>
              </div>
              
              <div>
                <Label>Description</Label>
                <p className="mt-1 text-sm">
                  {viewingEvent.description || "No description provided"}
                </p>
              </div>
              
              <div>
                <Label>Created At</Label>
                <p className="mt-1 text-sm">
                  {new Date(viewingEvent.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

        {events.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CalendarDays className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No events yet</h3>
              <p className="text-muted-foreground text-center mb-4">Get started by creating your first big event</p>
              <Button onClick={() => setDialogOpen(true)} className="w-full md:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Create Event
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
      <ConfirmDialog />
    </DashboardLayout>
  )
}
